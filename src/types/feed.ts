// 백엔드 Entity 구조에 맞춘 Feed 타입 정의

export interface FeedPost {
  id: number;
  title: string;
  content: string;
  instagramId?: string;
  feedType: 'DAILY' | 'EVENT' | 'RANKING';
  likeCount: number;
  commentCount: number;
  participantVoteCount: number;
  
  // User 관계
  user: {
    id: number;
    nickname: string;
    level?: number;
    profileImg?: string;
    gender?: string;
    height?: number;
  };
  
  // OrderItem 관계 (상품 정보)
  orderItem: {
    id: number;
    productName: string;
    size?: number;
  };
  
  // Event 관계 (투표 이벤트용)
  event?: {
    id: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
  };
  
  // 관계 엔티티들
  images: Array<{
    id: number;
    imageUrl: string;
    sortOrder: number;
  }>;
  
  hashtags: Array<{
    id: number;
    tag: string;
  }>;
  
  // 상태 정보
  isLiked?: boolean;
  isVoted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedComment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  
  // User 관계
  user: {
    id: number;
    nickname: string;
    level?: number;
    profileImg?: string;
  };
}

// === API 요청 타입들 ===

export interface CreateFeedRequest {
  title: string;
  content: string;
  orderItemId: number;
  eventId?: number; // 이벤트 피드인 경우
  instagramId?: string;
  imageUrls: string[];
  hashtags: string[];
  feedType?: 'DAILY' | 'EVENT' | 'RANKING'; // 백엔드에서 자동 결정하므로 선택사항
}

export interface UpdateFeedRequest {
  title?: string;
  content?: string;
  instagramId?: string;
  feedType?: 'DAILY' | 'EVENT' | 'RANKING';
  hashtags?: string[];
}

export interface CreateCommentRequest {
  content: string;
}

// 이미지 업로드는 utils/imageUpload.ts에서 별도 처리

export interface FeedVoteRequest {
  eventId: number;
}

// === API 응답 타입들 ===

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface FeedListResponse extends PaginatedResponse<FeedPost> {}

export interface CommentListResponse extends PaginatedResponse<FeedComment> {}

export interface ImageUploadResponse {
  imageId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface VoteResponse {
  voted: boolean;
  voteCount: number;
}

// === 에러 응답 타입 ===

export interface ApiError {
  success: false;
  message: string;
  errorCode?: string;
  details?: any;
  timestamp: string;
}

// === 쿼리 파라미터 타입들 ===

export interface FeedListParams {
  page?: number;
  size?: number;
  sort?: string;
  feedType?: 'DAILY' | 'EVENT' | 'RANKING' | 'ALL';
  userId?: number;
  eventId?: number;
}

export interface CommentListParams {
  page?: number;
  size?: number;
  sort?: string;
}

// 기존 FeedListPage와 호환을 위한 레거시 타입 (추후 제거 예정)
export interface LegacyFeedPost {
  id: number;
  username: string;
  level: number;
  profileImg: string;
  images: string[];
  productName: string;
  size: number;
  gender: string;
  height: number;
  description: string;
  likes: number;
  votes: number;
  comments: number;
  instagramId: string;
  createdAt: string;
  isLiked?: boolean;
  feedType: string;
} 