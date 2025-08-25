import axiosInstance from "./axios";

// MFA 관련 타입 정의
export interface MfaSetupRequest {
  email: string;
}

export interface MfaSetupResponse {
  qrUrl: string;
  secret: string;
  backupCodes: string[];
  message?: string;
}

export interface MfaVerifyRequest {
  email: string;
  token: string;
}

export interface MfaEnableRequest {
  email: string;
  token: string;
}

export interface MfaStatusResponse {
  enabled: boolean;
  setupRequired: boolean;
  email: string;
  hasBackupCodes: boolean;
  mfaType: string;
}

// 백엔드 응답 구조
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export class MfaService {
  /**
   * MFA 설정 초기화 (QR 코드 생성)
   */
  static async setupMfa(email: string): Promise<MfaSetupResponse> {
    console.log("MFA 설정 요청 시작:", { email });
    console.log("현재 토큰:", localStorage.getItem("token"));

    try {
      const response = await axiosInstance.post<ApiResponse<MfaSetupResponse>>(
        "/api/admin/mfa/setup",
        { email }
      );

      console.log("MFA 설정 응답:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "MFA 설정에 실패했습니다.");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("MFA 설정 요청 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  /**
   * MFA 토큰 검증
   */
  static async verifyMfa(email: string, token: string): Promise<boolean> {
    console.log("MFA 토큰 검증 요청 시작:", { email, token });
    console.log("현재 토큰:", localStorage.getItem("token"));

    try {
      const response = await axiosInstance.post<boolean>(
        "/api/admin/mfa/verify",
        { email, token }
      );

      console.log("MFA 토큰 검증 응답:", response.data);

      // 백엔드에서 boolean 값을 직접 반환하므로 response.data를 그대로 사용
      return response.data;
    } catch (error: any) {
      console.error("MFA 토큰 검증 요청 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  /**
   * MFA 활성화
   */
  static async enableMfa(email: string, token: string): Promise<boolean> {
    console.log("MFA 활성화 요청 시작:", { email, token });
    console.log("현재 토큰:", localStorage.getItem("token"));

    try {
      const response = await axiosInstance.post<boolean>(
        "/api/admin/mfa/enable",
        { email, token }
      );

      console.log("MFA 활성화 응답:", response.data);

      // 백엔드에서 boolean 값을 직접 반환하므로 response.data를 그대로 사용
      return response.data;
    } catch (error: any) {
      console.error("MFA 활성화 요청 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  /**
   * MFA 인증 후 최종 로그인 완료
   */
  static async completeMfaLogin(email: string, token: string): Promise<any> {
    console.log("MFA 로그인 완료 요청 시작:", { email, token });

    try {
      const response = await axiosInstance.post("/api/admin/mfa/complete", {
        email,
        token,
      });

      console.log("MFA 로그인 완료 응답:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("MFA 로그인 완료 요청 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  /**
   * MFA 비활성화
   */
  static async disableMfa(email: string): Promise<void> {
    console.log("MFA 비활성화 요청 시작:", { email });
    console.log("현재 토큰:", localStorage.getItem("token"));

    try {
      const response = await axiosInstance.delete(
        `/api/admin/mfa/disable/${email}`
      );

      console.log("MFA 비활성화 응답:", response.data);
      console.log("MFA 비활성화 상태 코드:", response.status);

      // 백엔드에서 빈 응답을 반환하므로 상태 코드만 확인
      if (response.status !== 200) {
        throw new Error("MFA 비활성화에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("MFA 비활성화 요청 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  /**
   * MFA 상태 조회
   */
  static async getMfaStatus(email: string): Promise<MfaStatusResponse> {
    console.log("MFA 상태 조회 요청 시작:", { email });
    console.log("현재 토큰:", localStorage.getItem("token"));

    try {
      const response = await axiosInstance.get<ApiResponse<MfaStatusResponse>>(
        `/api/admin/mfa/status/${email}`
      );

      console.log("MFA 상태 조회 응답:", response.data);

      // 백엔드에서 ApiResponse<MfaStatusResponse> 형태로 응답하므로 response.data.data를 반환
      return response.data.data;
    } catch (error: any) {
      console.error("MFA 상태 조회 요청 실패:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }
}

export default MfaService;
