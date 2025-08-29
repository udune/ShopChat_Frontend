// 백엔드 Entity 구조에 맞춘 Feed 타입 정의

// 피드 전용 User 타입 (독립적으로 정의)
export interface FeedUser {
  id: number;
  nickname: string;
  profileImg?: string;
  level?: number;
  gender?: string;
  height?: number;
}

export interface FeedImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface FeedHashtag {
  id: number;
  tag: string;
}

export interface OrderItem {
  id: number;
  productName: string;
  size?: number;
}

export interface FeedPost {
  id: number;
  title: string;
  content: string;
  images: FeedImage[];
  hashtags: FeedHashtag[];
  user: FeedUser;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isVoted?: boolean; // 투표 상태
  feedType: FeedType;
  participantVoteCount?: number; // 투표 수
  orderItem?: OrderItem;
  instagramId?: string;
  // 이벤트 참여 관련 필드 추가
  eventId?: number;
  eventTitle?: string;
  eventDescription?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventType?: string;
  eventStatus?: string; // 이벤트 상태 (ONGOING, ENDED, UPCOMING)
  canVote?: boolean; // 투표 가능 여부
}

// 백엔드 FeedType enum과 일치
export type FeedType = 'DAILY' | 'EVENT' | 'RANKING';

export interface FeedComment {
  id: number; // 프론트엔드 호환성을 위해 유지
  commentId: number; // 백엔드 응답 구조에 맞춤
  content: string;
  createdAt: string;
  updatedAt?: string;
  
  // 백엔드 응답 구조에 맞춤
  userId: number;
  userNickname: string;
  userProfileImage?: string;
  userProfileImg?: string; // 백엔드 FeedDetailResponseDto.FeedCommentDto와 일치
  
  // 프론트엔드 호환성을 위한 user 객체 (백엔드 응답을 변환하여 사용)
  user?: {
    id: number;
    nickname: string;
    level?: number;
    profileImg?: string;
  };
}

// === 백엔드 응답 구조와 일치하는 타입들 ===

// 백엔드 PaginatedResponse 구조
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 백엔드 FeedListResponseDto와 일치
export interface FeedListResponseDto {
  feedId: number;
  title: string;
  content: string;
  feedType: FeedType;
  instagramId?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  participantVoteCount: number;
  userId: number;
  userNickname: string;
  userProfileImg?: string;
  userLevel?: number;
  userGender?: string;
  userHeight?: number;
  orderItemId: number;
  productName: string;
  productSize?: number;
  productImageUrl?: string;
  productId?: number;
  eventId?: number;
  eventTitle?: string;
  eventDescription?: string;
  eventStartDate?: string;
  eventEndDate?: string;

  eventStatus?: string;
  canVote?: boolean;
  hashtags: FeedHashtagDto[];
  images: FeedImageDto[];
  isLiked: boolean;
  isVoted: boolean;
}

// 백엔드 FeedHashtagDto와 일치
export interface FeedHashtagDto {
  hashtagId: number;
  tag: string;
}

// 백엔드 FeedImageDto와 일치
export interface FeedImageDto {
  imageId: number;
  imageUrl: string;
  sortOrder: number;
}

// === API 요청 타입들 ===

export interface CreateFeedRequest {
  title: string;
  content: string;
  orderItemId: number;
  eventId?: number; // 이벤트 피드인 경우 (백엔드와 일치)
  instagramId?: string;
  imageUrls: string[];
  hashtags: string[];
  feedType?: FeedType; // 백엔드에서 자동 결정하므로 선택사항
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

// 좋아요한 피드 목록 관련 타입들
export interface MyLikedFeedItemDto {
  feedId: number; // Long -> number로 매핑
  title: string;
  content: string;
  feedType: string;
  imageUrl?: string;
  likedAt: string; // LocalDateTime -> string으로 매핑
  likeCount: number;
  commentCount: number;
  authorNickname: string;
  authorProfileImage?: string;
}

export interface MyLikedFeedsResponseDto {
  content: MyLikedFeedItemDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean; // 백엔드와 일치하도록 추가
  last: boolean;  // 백엔드와 일치하도록 추가
  hasNext: boolean;
  hasPrevious: boolean;
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

export interface CommentListResponse {
  pagination: PaginatedResponse<FeedComment>;
  totalComments: number;
}

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
  message: string;
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