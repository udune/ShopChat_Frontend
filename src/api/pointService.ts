import axiosInstance from "./axios";
import { ApiResponse } from "../types/api";

export interface PointBalance {
  currentPoints: number;
  totalEarnedPoints: number;
  totalUsedPoints: number;
  totalExpiredPoints: number;
  lastUpdatedAt: string;
}

export interface PointTransaction {
  transactionId: number;
  type: "EARN" | "USE";
  amount: number;
  description: string;
  transactionDate: string;
}

export interface PointTransactionPage {
  transactions: PointTransaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

/**
 * 포인트 관련 API 서비스
 */
export const pointService = {
  /**
   * 포인트 잔액 조회
   * @returns 포인트 잔액 정보
   */
  getPointBalance: async (): Promise<PointBalance> => {
    try {
      const response = await axiosInstance.get("/api/users/points/balance");
      // API 명세서에 따르면 직접 반환 (ApiResponse 래핑 없음)
      return response.data;
    } catch (error) {
      console.error("포인트 잔액 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 포인트 거래 내역 조회 (페이징)
   * @param page 페이지 번호 (0부터 시작)
   * @param size 페이지 크기
   * @returns 포인트 거래 내역 페이지
   */
  getPointTransactions: async (
    page: number = 0,
    size: number = 20
  ): Promise<PointTransactionPage> => {
    try {
      const response = await axiosInstance.get("/api/users/points/transactions", {
        params: { page, size }
      });
      // API 명세서에 따르면 직접 반환 (ApiResponse 래핑 없음)
      return response.data;
    } catch (error) {
      console.error("포인트 거래 내역 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 포인트 사용량 유효성 검사 (100 포인트 단위 제한)
   * @param usePoints 사용할 포인트
   * @param availablePoints 사용 가능한 포인트
   * @returns 유효성 검사 결과
   */
  validatePointUsage: (usePoints: number, availablePoints: number): { isValid: boolean; message: string } => {
    // 0 이상 검사
    if (usePoints < 0) {
      return { isValid: false, message: "포인트는 0 이상이어야 합니다." };
    }

    // 100 포인트 단위 검사
    if (usePoints % 100 !== 0) {
      return { isValid: false, message: "포인트는 100 포인트 단위로만 사용 가능합니다." };
    }

    // 보유 포인트 초과 검사
    if (usePoints > availablePoints) {
      return { isValid: false, message: "사용 가능한 포인트가 부족합니다." };
    }

    return { isValid: true, message: "유효한 포인트 사용량입니다." };
  },

  /**
   * 포인트 사용량을 100 단위로 조정
   * @param points 조정할 포인트
   * @returns 100 단위로 조정된 포인트
   */
  adjustPointsToHundreds: (points: number): number => {
    if (points <= 0) return 0;
    return Math.floor(points / 100) * 100;
  }
};