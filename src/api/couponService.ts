import axiosInstance from "./axios";
import {
  CouponResponse,
  CouponIssueRequest,
  CouponUseRequest,
  UserCouponStatus,
} from "../types/types";

/**
 * 쿠폰 관련 API 서비스
 */
export const couponService = {
  /**
   * 사용자의 모든 쿠폰 목록을 조회합니다.
   * @param email 사용자 이메일
   * @param status 쿠폰 상태 필터 (선택사항)
   * @returns 쿠폰 목록
   */
  getUserCoupons: async (
    email: string,
    status?: UserCouponStatus
  ): Promise<CouponResponse[]> => {
    try {
      const params: any = { email };
      if (status) {
        params.status = status;
      }

      const response = await axiosInstance.get("/api/coupons", {
        params,
      });

      // API 명세서에 따르면 직접 배열 반환
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("쿠폰 목록 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 사용자의 사용 가능한 쿠폰 목록을 조회합니다. (ACTIVE 상태만)
   * @param email 사용자 이메일
   * @returns 사용 가능한 쿠폰 목록
   */
  getAvailableCoupons: async (email: string): Promise<CouponResponse[]> => {
    return couponService.getUserCoupons(email, "ACTIVE");
  },

  /**
   * 사용자의 쿠폰 목록을 페이지네이션하여 조회합니다.
   * @param email 사용자 이메일
   * @param page 페이지 번호 (0부터 시작)
   * @param size 페이지 크기
   * @param status 쿠폰 상태 필터 (선택사항)
   * @returns 쿠폰 페이지 응답
   */
  getUserCouponsWithPage: async (
    email: string,
    page: number = 0,
    size: number = 10,
    status?: UserCouponStatus
  ): Promise<{
    content: CouponResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  }> => {
    try {
      const params: any = {
        email,
        page,
        size,
      };
      if (status) {
        params.status = status;
      }

      const response = await axiosInstance.get("/api/coupons/pages", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("쿠폰 페이지 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 특정 사용자에게 쿠폰을 발급합니다. (관리자 권한 필요)
   * @param request 쿠폰 발급 요청 데이터
   * @returns 발급된 쿠폰 정보
   */
  issueCoupon: async (request: CouponIssueRequest): Promise<CouponResponse> => {
    try {
      const response = await axiosInstance.post("/api/coupons/issue", request);
      return response.data;
    } catch (error) {
      console.error("쿠폰 발급 실패:", error);
      throw error;
    }
  },

  /**
   * 사용자가 특정 쿠폰을 사용합니다.
   * @param request 쿠폰 사용 요청 데이터
   * @returns 사용 처리된 쿠폰 정보
   */
  useCoupon: async (request: CouponUseRequest): Promise<CouponResponse> => {
    try {
      const response = await axiosInstance.post("/api/coupons/use", request);
      return response.data;
    } catch (error) {
      console.error("쿠폰 사용 실패:", error);
      throw error;
    }
  },
};
