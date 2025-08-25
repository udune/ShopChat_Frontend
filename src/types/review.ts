/**
 * 리뷰 시스템 타입 정의 (백엔드 구현 기능만 포함)
 *
 * 실제 백엔드에 구현된 기본 기능들만 포함합니다.
 * 도움됨, 신고 등의 기능은 추후 구현 예정입니다.
 */

// =============== 백엔드 API 응답 타입 (첨부파일 기준) ===============

/**
 * 공통 API 응답 래퍼 타입
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * 리뷰 이미지 타입 (백엔드 API 응답 구조)
 */
export interface ReviewImage {
    reviewImageId: number;
    originalFilename: string;
    imageUrl: string;
    imageOrder: number;
    fileSize: number;
    alt?: string; // 선택적 필드로 유지
}

/**
 * 리뷰 타입 (백엔드 응답 구조)
 */
export interface Review {
    reviewId: number;
    userId: number;
    productId: number;
    userName: string;
    userProfileImage?: string;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    images: ReviewImage[];
    title?: string; // 백엔드에서 제목도 포함
    // 백엔드에서 추가로 오는 필드들
    helpfulCount?: number;
    isHelpful?: boolean;
    // 3요소 평가 (백엔드에서 문자열로 오는 경우와 숫자 모두 지원)
    sizeFit?: number | string;    // 숫자: 1,2,3 또는 문자열: SMALL,NORMAL,BIG
    cushion?: number | string;    // 숫자: 1,2,3 또는 문자열: SOFT,NORMAL,HARD  
    stability?: number | string;  // 숫자: 1,2,3 또는 문자열: LOW,NORMAL,STABLE
}

/**
 * 리뷰 목록 응답 타입 (페이지네이션 포함)
 */
export interface ReviewListResponse {
    content: Review[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

/**
 * 상품 정보 타입
 */
export interface Product {
    productId: number;
    name: string;
    brandName: string;
    thumbnailUrl: string;
    averageRating: number;
    totalReviewCount: number;
}

// =============== API 요청 타입 ===============

/**
 * 리뷰 생성 요청 타입
 */
export interface CreateReviewRequest {
    productId: number;
    title: string;
    rating: number;
    content: string;
    sizeFit?: number;
    cushion?: number;
    stability?: number;
}

/**
 * 리뷰 수정 요청 타입
 */
export interface UpdateReviewRequest {
    title?: string;  // 수정에서는 선택적으로 처리
    rating: number;
    content: string;
    sizeFit?: number;
    cushion?: number;
    stability?: number;
    deleteImageIds?: number[];  // 삭제할 이미지 ID들
}

/**
 * 리뷰 정렬 옵션 (백엔드 구현 기능만)
 */
export type ReviewSortOption = 'latest' | 'rating_high' | 'rating_low';

/**
 * 리뷰 목록 조회 파라미터 타입
 */
export interface ReviewListParams {
    page?: number;
    size?: number;
    sort?: ReviewSortOption;
    rating?: number; // 별점 필터 (정확한 별점이면 exact=true와 함께 사용)
    exactRating?: boolean; // true면 정확한 별점, false면 이상 (기본값)
    sizeFit?: number; // 사이즈 필터 (1: 작음, 2: 적당함, 3: 큼)
    cushion?: number; // 쿠션감 필터 (1: 부드러움, 2: 적당함, 3: 딱딱함)
    stability?: number; // 안정성 필터 (1: 낮음, 2: 보통, 3: 높음)
}

// =============== API 응답 타입 ===============

/**
 * 리뷰 생성 응답 타입
 */
export interface CreateReviewResponse {
    reviewId: number;
    message: string;
    imageUrls?: string[];
}


/**
 * 도움이 됨 응답 타입
 */
export interface HelpfulResponse {
    reviewId: number;
    isHelpful: boolean;
    helpfulCount: number;
}

/**
 * 리뷰 수정 응답 타입
 */
export interface UpdateReviewResponse {
    reviewId: number;
    message: string;
    newImageUrls: string[];
    deletedImageIds: number[];
}

/**
 * 리뷰 삭제 응답 타입
 */
export interface DeleteReviewResponse {
    reviewId: number;
    message: string;
    deletedImageCount: number;
}

// =============== 정렬 및 필터링 옵션 ===============

/**
 * 리뷰 필터 상태
 */
export interface ReviewFilterState {
    sort: ReviewSortOption;
    rating: number;        // 0: 전체, 1-5: 별점 필터
    exactRating: boolean;  // true: 정확한 별점, false: 이상 (기본값)
    sizeFit: number;       // 0: 전체, 1: 작음, 2: 적당함, 3: 큼
    cushion: number;       // 0: 전체, 1: 부드러움, 2: 적당함, 3: 딱딱함
    stability: number;     // 0: 전체, 1: 낮음, 2: 보통, 3: 높음
}

// =============== 컴포넌트 Props 타입 ===============

/**
 * 별점 컴포넌트 Props
 */
export interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "small" | "medium" | "large";
    readOnly?: boolean;
    showNumber?: boolean;
    onChange?: (rating: number) => void;
}

/**
 * 리뷰 카드 컴포넌트 Props
 */
export interface ReviewCardProps {
    review: Review;
    currentUserId?: number;
    onEdit?: (reviewId: number) => void;
    onDelete?: (reviewId: number) => void;
}

/**
 * 리뷰 목록 컴포넌트 Props
 */
export interface ReviewListProps {
    reviews: Review[];
    currentUserId?: number;
    isLoading: boolean;
    hasMore: boolean;
    error?: string | null;
    onLoadMore?: () => void;
    onEdit?: (reviewId: number) => void;
    onDelete?: (reviewId: number) => void;
    enableInfiniteScroll?: boolean;
    emptyMessage?: string;
    loadingMessage?: string;
}

/**
 * 리뷰 필터 컴포넌트 Props
 */
export interface ReviewFilterProps {
    totalCount: number;
    currentFilter: ReviewFilterState;
    onFilterChange: (filter: ReviewFilterState) => void;
    isLoading?: boolean;
}

/**
 * 상품 리뷰 전체 섹션 Props
 */
export interface ProductReviewsProps {
    productId: number;
    currentUserId?: number;
    canWriteReview?: boolean;
    onWriteReview?: () => void;
    onEditReview?: (reviewId: number) => void;
    enableInfiniteScroll?: boolean;
    initialPageSize?: number;
    productImage?: string;
}

// =============== 폼 관련 타입 ===============

/**
 * 리뷰 작성/수정 폼 데이터
 */
export interface ReviewFormData {
    title: string;
    rating: number;
    content: string;
    sizeFit?: number;
    cushion?: number;
    stability?: number;
    images: File[];
}

/**
 * 폼 유효성 검사 에러
 */
export interface ReviewFormErrors {
    title?: string;
    rating?: string;
    content?: string;
    sizeFit?: string;
    cushion?: string;
    stability?: string;
    images?: string;
}

// =============== 훅 반환 타입 (기본 기능만) ===============

/**
 * useReviewList 훅 반환 타입
 */
export interface UseReviewListReturn {
    // 데이터
    reviews: Review[];
    product: Product | null;

    // 상태
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    totalCount: number;

    // 필터 상태
    filter: ReviewFilterState;

    // 액션 함수들
    loadMore: () => void;
    applyFilter: (filter: ReviewFilterState) => void;
    refresh: () => void;
    removeReview: (reviewId: number) => void;  // 삭제 후 로컬 상태 업데이트
}

/**
 * useReviewActions 훅 반환 타입
 */
export interface UseReviewActionsReturn {
    // 상태
    isSubmitting: boolean;

    // 액션 함수들
    createReview: (data: CreateReviewRequest, images?: File[]) => Promise<CreateReviewResponse>;
    updateReview: (reviewId: number, data: UpdateReviewRequest, newImages?: File[]) => Promise<UpdateReviewResponse>;
    deleteReview: (reviewId: number) => Promise<DeleteReviewResponse>;

    // 간단한 권한 체크
    canEditReview: (review: Review, currentUserId?: number) => boolean;
    canDeleteReview: (review: Review, currentUserId?: number) => boolean;
}

// =============== 리뷰 신고 관련 타입 ===============

/**
 * 리뷰 신고 사유 옵션
 */
export type ReportReason = 
    | 'ABUSIVE_LANGUAGE'     // 욕설 및 비방
    | 'SPAM'                 // 스팸 및 도배
    | 'INAPPROPRIATE_CONTENT' // 부적절한 내용
    | 'FALSE_INFORMATION'    // 허위 정보
    | 'ADVERTISING'          // 광고성 내용
    | 'COPYRIGHT_VIOLATION'  // 저작권 침해
    | 'OTHER';               // 기타

/**
 * 리뷰 신고 요청 타입
 */
export interface ReportReviewRequest {
    reason: ReportReason;
    description?: string;
}

/**
 * 리뷰 신고 응답 타입
 */
export interface ReportReviewResponse {
    reportId: number;
    reviewId: number;
    reporterId: number;
    reason: ReportReason;
    createdAt: string;
}

/**
 * 신고 사유 옵션 정보
 */
export interface ReportReasonOption {
    value: ReportReason;
    label: string;
    description: string;
}

// =============== 기타 유틸리티 타입 ===============

/**
 * 페이지네이션 정보
 */
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
}