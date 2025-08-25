import axiosInstance from './axios';

// 타입 정의
export interface FeedRewardEvent {
  eventId: number;
  feedId: number;
  feedTitle: string;
  userId: number;
  userNickname: string;
  rewardType: 'FEED_CREATION' | 'FEED_LIKES_MILESTONE' | 'EVENT_FEED_PARTICIPATION' | 'COMMENT_DAILY_ACHIEVEMENT' | 'DIVERSE_PRODUCT_FEED';
  eventStatus: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'CANCELLED';
  points: number;
  description: string;
  relatedData: string;
  processedAt: string | null;
  retryCount: number;
  errorMessage: string | null;
  createdAt: string;
  // 백엔드에서 제공할 수 있는 displayName 필드들 (선택사항)
  rewardTypeDisplayName?: string;
  eventStatusDisplayName?: string;
}

export interface FeedRewardEventListResponse {
  content: FeedRewardEvent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FeedRewardStatistics {
  totalEvents: number;
  pendingEvents: number;
  processedEvents: number;
  failedEvents: number;
  totalPoints: number;
}

export interface DailyStatistics {
  [date: string]: {
    createdEvents: number;
    processedEvents: number;
    totalPoints: number;
  };
}

export interface FeedRewardSummary {
  totalEvents: number;
  pendingEvents: number;
  processedEvents: number;
  failedEvents: number;
  totalPoints: number;
  averagePointsPerEvent: number;
}

// API 서비스 클래스
class FeedRewardService {
  // 1. 리워드 이벤트 목록 조회
  static async getFeedRewardEvents(params: {
    page?: number;
    size?: number;
    userId?: number;
    feedId?: number;
    rewardType?: string;
    eventStatus?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  } = {}): Promise<FeedRewardEventListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get(`/api/admin/feed-reward-events?${queryParams.toString()}`);
    return response.data;
  }

  // 2. 사용자별 리워드 이벤트
  static async getUserFeedRewardEvents(userId: number): Promise<FeedRewardEvent[]> {
    const response = await axiosInstance.get(`/api/admin/feed-reward-events/user/${userId}`);
    return response.data;
  }

  // 3. 피드별 리워드 이벤트
  static async getFeedRewardEventsByFeed(feedId: number): Promise<FeedRewardEvent[]> {
    const response = await axiosInstance.get(`/api/admin/feed-reward-events/feed/${feedId}`);
    return response.data;
  }

  // 4. 이벤트 상세 조회
  static async getFeedRewardEvent(eventId: number): Promise<FeedRewardEvent> {
    const response = await axiosInstance.get(`/api/admin/feed-reward-events/${eventId}`);
    return response.data;
  }

  // 5. 전체 통계 조회
  static async getFeedRewardStatistics(): Promise<FeedRewardStatistics> {
    const response = await axiosInstance.get('/api/admin/feed-reward-events/statistics');
    return response.data;
  }

  // 6. 일별 통계 조회
  static async getDailyStatistics(startDate: string, endDate: string): Promise<DailyStatistics> {
    const response = await axiosInstance.get(`/api/admin/feed-reward-events/statistics/daily?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  // 7. 요약 정보 조회
  static async getFeedRewardSummary(): Promise<FeedRewardSummary> {
    const response = await axiosInstance.get('/api/admin/feed-reward-events/summary');
    return response.data;
  }

  // 8. 수동 이벤트 처리
  static async processFeedRewardEvent(eventId: number): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.post(`/api/admin/feed-reward-events/${eventId}/process`);
    return response.data;
  }

  // 9. 실패한 이벤트 재처리
  static async retryFailedEvents(): Promise<{ success: boolean; message: string; processedCount: number }> {
    const response = await axiosInstance.post('/api/admin/feed-reward-events/retry-failed');
    return response.data;
  }
}

export default FeedRewardService;
