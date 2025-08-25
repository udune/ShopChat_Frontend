/**
 * JWT 토큰에서 사용자 정보를 추출하는 유틸리티 함수들
 */

interface TokenPayload {
  sub: string; // 사용자 ID (username)
  email?: string; // 이메일
  exp: number; // 만료 시간
  iat: number; // 발급 시간
}

/**
 * JWT 토큰을 디코딩하여 페이로드를 반환합니다
 * @param token JWT 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
export const decodeJWT = (token: string): TokenPayload | null => {
  try {
    // JWT는 header.payload.signature 형태로 구성됨
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64URL 디코딩을 위해 패딩 추가
    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Base64URL을 Base64로 변환 후 디코딩
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

/**
 * 현재 로그인한 사용자의 이메일을 JWT 토큰에서 추출합니다
 * @returns 사용자 이메일 또는 null
 */
export const getUserEmailFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const payload = decodeJWT(token);
    return payload?.email || payload?.sub || null;
  } catch (error) {
    console.error('토큰에서 이메일 추출 실패:', error);
    return null;
  }
};

/**
 * 현재 로그인한 사용자의 ID를 JWT 토큰에서 추출합니다
 * @returns 사용자 ID 또는 null
 */
export const getUserIdFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const payload = decodeJWT(token);
    return payload?.sub || null;
  } catch (error) {
    console.error('토큰에서 사용자 ID 추출 실패:', error);
    return null;
  }
};

/**
 * JWT 토큰의 유효성을 검사합니다
 * @returns 토큰이 유효한지 여부
 */
export const isTokenValid = (): boolean => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const payload = decodeJWT(token);
    if (!payload) {
      return false;
    }

    // 만료 시간 체크 (exp는 초 단위, Date.now()는 밀리초 단위)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('토큰 유효성 검사 실패:', error);
    return false;
  }
};