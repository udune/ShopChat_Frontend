import axiosInstance from "./axios";
import { ApiResponse } from "../types/api";

export interface UserLevel {
  levelId: number;
  levelName: string;
  emoji: string;
  minPointsRequired: number;
  discountRate: number;
  rewardDescription: string;
}

export interface UserLevelInfo {
  userId: number;
  totalPoints: number;
  currentLevel: UserLevel;
  levelDisplayName: string;
  levelEmoji: string;
  rewardDescription: string;
  pointsToNextLevel: number;
  levelProgress: number;
  userRank: number;
  levelUpdatedAt: string;
}

export interface UserActivity {
  activityId: number;
  activityType:
    | "PURCHASE_COMPLETION"
    | "REVIEW_CREATION"
    | "FEED_CREATION"
    | "EVENT_PARTICIPATION"
    | "VOTE_PARTICIPATION";
  description: string;
  pointsEarned: number;
  referenceId: number;
  referenceType: string;
  createdAt: string;
}

export interface UserActivityPage {
  content: UserActivity[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ActivityRecordRequest {
  activityType:
    | "PURCHASE_COMPLETION"
    | "REVIEW_CREATION"
    | "FEED_CREATION"
    | "EVENT_PARTICIPATION"
    | "VOTE_PARTICIPATION";
  description: string;
  referenceId: number;
  referenceType: string;
}

export interface Badge {
  name: string;
  description: string;
}

export interface ActivityRecordResponse {
  status: string;
  message: string;
  data: {
    activityId: number;
    pointsEarned: number;
    levelUp: boolean;
    currentLevel: UserLevel;
    totalPoints: number;
    badgesAwarded: Badge[];
  };
}

/**
 * 사용자 레벨 및 활동 관련 API 서비스
 */
export const levelService = {
  /**
   * 사용자 레벨 및 통계 조회
   * @returns 사용자 레벨 정보
   */
  getUserLevelInfo: async (): Promise<UserLevelInfo> => {
    try {
      const response = await axiosInstance.get("/api/users/level/me");
      // API 명세서에 따르면 직접 반환 (ApiResponse 래핑 없음)
      return response.data;
    } catch (error) {
      throw new Error("사용자 레벨 정보를 불러오는데 실패했습니다.");
    }
  },

  /**
   * 사용자 활동 내역 조회 (페이징)
   * @param page 페이지 번호 (0부터 시작)
   * @param size 페이지 크기
   * @returns 사용자 활동 내역 페이지
   */
  getUserActivities: async (
    page: number = 0,
    size: number = 20
  ): Promise<UserActivityPage> => {
    try {
      const response = await axiosInstance.get(
        "/api/users/level/me/activities",
        {
          params: { page, size },
        }
      );
      // API 명세서에 따르면 직접 반환 (ApiResponse 래핑 없음)
      return response.data;
    } catch (error) {
      console.error("사용자 활동 내역 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 사용자 활동 기록 (주문 완료 시 자동 호출)
   * @param request 활동 기록 요청 데이터
   * @returns 활동 기록 응답
   */
  recordUserActivity: async (
    request: ActivityRecordRequest
  ): Promise<ActivityRecordResponse> => {
    try {
      const response = await axiosInstance.post<ActivityRecordResponse>(
        "/api/users/level/activity",
        request
      );
      return response.data;
    } catch (error) {
      console.error("사용자 활동 기록 실패:", error);
      throw error;
    }
  },
};
