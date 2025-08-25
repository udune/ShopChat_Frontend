/**
 * 상품 리뷰 전체 섹션 컴포넌트
 *
 * 상품 상세 페이지에서 사용되는 리뷰 섹션의 최상위 컴포넌트입니다.
 * 리뷰 목록, 필터, 작성 버튼 등 모든 리뷰 관련 기능을 통합합니다.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { ReviewFilter } from "./ReviewFilter";
import { ReviewList } from "./ReviewList";
import { StarRating } from "./StarRating";
import { ReviewEditModal } from "./ReviewEditModal";
import ReviewService from "../../api/reviewService";
import { formatNumber, calculateAverageRating, getRatingPercentages } from "../../utils/review/reviewHelpers";
import { useAuth } from "../../contexts/AuthContext"; // AuthContext 추가
import { useReviewReport } from "../../hooks/review/useReviewReport"; // 리뷰 신고 훅 추가
// import { useReviewActions as useReviewActionsHook } from "../../hooks/review/useReviewActions"; // 리뷰 액션 훅 추가
import { 
  ReviewSortOption, 
  Review, 
  ReviewImage, 
  Product,
  ReviewFilterState 
} from "../../types/review";

// =============== 타입 정의 ===============

interface ProductReviewsProps {
  productId: number;                          // 상품 ID
  currentUserId?: number;                     // 현재 로그인한 사용자 ID
  canWriteReview?: boolean;                   // 리뷰 작성 가능 여부
  onWriteReview?: () => void;                 // 리뷰 작성 버튼 클릭 콜백
  onEditReview?: (reviewId: number) => void;  // 리뷰 수정 콜백
  enableInfiniteScroll?: boolean;             // 무한 스크롤 활성화 여부
  initialPageSize?: number;                   // 초기 페이지 크기
  productImage?: string;                      // 상품 이미지 (선택적)
  forceRefresh?: boolean;                     // 강제 새로고침 플래그
}

// =============== 스타일 컴포넌트 ===============

const ReviewsSection = styled.section`
  width: 100%;
  padding: 32px 0;
  background: #fafafa;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const SectionHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const ReviewSummary = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const RatingOverview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
`;

const AverageRating = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #2563eb;
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const RatingText = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

const RatingDistribution = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
`;

const RatingLabel = styled.span`
  min-width: 60px;
  color: #374151;
  font-weight: 500;
`;

const RatingBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const RatingBarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: #2563eb;
  transition: width 0.3s ease;
`;

const RatingCount = styled.span`
  min-width: 40px;
  text-align: right;
  color: #6b7280;
`;

const WriteReviewSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const WriteReviewButton = styled.button<{ $canWrite: boolean }>`
  background: ${props => props.$canWrite ? '#2563eb' : '#9ca3af'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.$canWrite ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  &:disabled {
    cursor: not-allowed;
  }

  .icon {
    font-size: 20px;
  }
`;

const DisabledMessage = styled.p`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  margin: 8px 0 0 0;
`;

const ReviewsContent = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// =============== 메인 컴포넌트 ===============

export const ProductReviews: React.FC<ProductReviewsProps> = ({
                                                                productId,
                                                                currentUserId,
                                                                canWriteReview = false,
                                                                onWriteReview,
                                                                onEditReview,
                                                                enableInfiniteScroll = false,
                                                                initialPageSize = 10,
                                                                productImage,
                                                                forceRefresh = false,
                                                              }) => {
  // =============== AuthContext 사용 ===============
  const { user } = useAuth();
  const location = useLocation();

  // =============== 리뷰 신고 훅 사용 ===============
  const { addReportedReview, isReportedReview } = useReviewReport();

  // =============== 상태 관리 ===============
  
  // 리뷰 수정 모달 상태
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // =============== 수정된 로컬 사용자 정보 가져오기 ===============
  const getLocalUserId = useCallback((): number | undefined => {
    try {
      // 🎯 1. AuthContext에서 사용자 정보 확인 (우선순위 1)
      if (user?.nickname && user?.token) {
        console.log('✅ AuthContext 사용자 확인:', user);
        // AuthContext에 사용자가 있으면 로그인된 것으로 간주
        // 임시로 1을 반환 (실제로는 백엔드에서 사용자 ID를 가져와야 함)
        return 1; // 임시 사용자 ID
      }

      // 🎯 2. localStorage에서 직접 확인 (백업용)
      const token = localStorage.getItem("token");
      const nickname = localStorage.getItem("nickname");
      const userType = localStorage.getItem("userType");

      console.log('🔍 localStorage 확인:');
      console.log('- token:', !!token);
      console.log('- nickname:', nickname);
      console.log('- userType:', userType);

      if (token && nickname) {
        console.log('✅ localStorage에서 사용자 정보 확인됨');
        // 로그인된 상태로 간주하고 임시 ID 반환
        return 1; // 임시 사용자 ID
      }

      console.log('❌ 로그인 정보 없음');
      return undefined;
    } catch (error) {
      console.error("사용자 정보 로딩 실패:", error);
      return undefined;
    }
  }, [user]); // user 의존성 추가

  // 실제 사용할 사용자 ID
  const effectiveUserId = currentUserId || getLocalUserId();

  // =============== 로그인 상태 및 권한 확인 ===============
  const isLoggedIn = !!user || (!!localStorage.getItem("token") && !!localStorage.getItem("nickname"));
  const canUserWriteReview = isLoggedIn && (!user || user.userType === "user");

  // =============== 디버깅 정보 출력 ===============
  console.log('🔍 ProductReviews 디버깅:');
  console.log('- AuthContext user:', user);
  console.log('- currentUserId prop:', currentUserId);
  console.log('- effectiveUserId:', effectiveUserId);
  console.log('- isLoggedIn:', isLoggedIn);
  console.log('- canUserWriteReview:', canUserWriteReview);
  console.log('- user?.userType:', user?.userType);

  // =============== 상태 관리 ===============

  const [reviews, setReviews] = useState<Review[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // 필터 상태
  const [filter, setFilter] = useState<ReviewFilterState>({
    sort: 'latest',
    rating: 0,
    exactRating: false,
    sizeFit: 0,
    cushion: 0,
    stability: 0,
  });

  // =============== 데이터 로딩 함수들 ===============

  /**
   * 상품 정보를 불러오는 함수
   */
  const loadProductInfo = useCallback(async () => {
    try {
      const productData = await ReviewService.getProductInfo(productId);
      setProduct(productData);
    } catch (err) {
      console.error('상품 정보 로딩 실패:', err);
      // 상품 정보 로딩 실패는 치명적이지 않으므로 에러 상태를 설정하지 않음
    }
  }, [productId]);

  /**
   * 리뷰 목록을 불러오는 함수
   */
  const loadReviews = useCallback(async (
      page: number = 0,
      resetList: boolean = false,
      customFilter?: ReviewFilterState
  ) => {
    try {
      if (resetList) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      // 현재 filter 상태를 사용하되, customFilter가 제공되면 우선 사용
      const currentFilter = customFilter || filter;
      const params = {
        page,
        size: initialPageSize,
        sort: currentFilter.sort,
        ...(currentFilter.rating && currentFilter.rating > 0 && { 
          rating: currentFilter.rating,
          exactRating: currentFilter.exactRating 
        }),
        ...(currentFilter.sizeFit && currentFilter.sizeFit > 0 && { sizeFit: currentFilter.sizeFit }),
        ...(currentFilter.cushion && currentFilter.cushion > 0 && { cushion: currentFilter.cushion }),
        ...(currentFilter.stability && currentFilter.stability > 0 && { stability: currentFilter.stability }),
      };

      const response = await ReviewService.getProductReviews(productId, params);
      
      // API 응답에서 실제 리뷰 배열을 찾아서 사용
      const responseData = response as any;
      let reviewsData = responseData.reviews || response.content || [];
      
      // 🔧 프론트엔드에서 추가 필터링 (백엔드 필터링이 제대로 안될 경우 대비)
      if (currentFilter.rating && currentFilter.rating > 0) {
        reviewsData = reviewsData.filter((review: Review) => {
          if (currentFilter.exactRating) {
            // 정확한 별점 매칭
            return Math.floor(review.rating) === currentFilter.rating;
          } else {
            // 이상 필터링
            return review.rating >= currentFilter.rating;
          }
        });
        console.log(`🔍 평점 필터링 적용: ${currentFilter.exactRating ? '정확히' : '이상'} ${currentFilter.rating}점, 결과: ${reviewsData.length}개`);
      }
      
      // 3요소 필터링도 추가 적용
      if (currentFilter.sizeFit && currentFilter.sizeFit > 0) {
        reviewsData = reviewsData.filter((review: Review) => {
          const sizeFit = typeof review.sizeFit === 'string' ? 
            (review.sizeFit === 'SMALL' ? 1 : review.sizeFit === 'NORMAL' ? 2 : 3) : 
            review.sizeFit;
          return sizeFit === currentFilter.sizeFit;
        });
      }
      
      if (currentFilter.cushion && currentFilter.cushion > 0) {
        reviewsData = reviewsData.filter((review: Review) => {
          const cushion = typeof review.cushion === 'string' ? 
            (review.cushion === 'SOFT' ? 1 : review.cushion === 'NORMAL' ? 2 : 3) : 
            review.cushion;
          return cushion === currentFilter.cushion;
        });
      }
      
      if (currentFilter.stability && currentFilter.stability > 0) {
        reviewsData = reviewsData.filter((review: Review) => {
          const stability = typeof review.stability === 'string' ? 
            (review.stability === 'LOW' ? 1 : review.stability === 'NORMAL' ? 2 : 3) : 
            review.stability;
          return stability === currentFilter.stability;
        });
      }
      
      if (reviewsData.length > 0) {
        console.log(`📄 리뷰 ${reviewsData.length}개 로드됨`);
      }

      if (resetList || page === 0) {
        setReviews(reviewsData); // 안전한 설정
      } else {
        setReviews(prev => [...(prev || []), ...reviewsData]); // 안전한 추가
      }

      setCurrentPage(response.number || 0);
      setHasMore(!response.last);
      setTotalCount(response.totalElements || 0);

    } catch (err) {
      console.error('리뷰 목록 로딩 실패:', err);
      const errorMessage = ReviewService.getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [productId, initialPageSize, filter]);

  // =============== 이벤트 핸들러들 ===============

  /**
   * 필터 변경 처리
   */
  const handleFilterChange = useCallback((newFilter: ReviewFilterState) => {
    setFilter(newFilter);
    setCurrentPage(0);
    // 필터 변경 시 즉시 리뷰 로딩
    loadReviews(0, true, newFilter);
  }, [loadReviews]);

  /**
   * 더보기 처리
   */
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadReviews(currentPage + 1, false);
    }
  }, [isLoadingMore, hasMore, currentPage, loadReviews]);

  /**
   * 리뷰 삭제 처리
   */
  const handleDeleteReview = useCallback(async (reviewId: number) => {
    try {
      console.log('🗑️ 리뷰 삭제 시작:', reviewId);
      
      // 삭제 확인
      if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
        return;
      }
      
      console.log('📡 API 호출 시작...');
      
      // 인증 토큰 확인
      const token = localStorage.getItem('token');
      console.log('🔐 인증 토큰 존재:', !!token);
      console.log('🔐 토큰 길이:', token?.length || 0);
      if (!token) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }
      
      // Timeout과 함께 API 호출
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('요청 시간이 초과되었습니다. 서버 상태를 확인해주세요.')), 10000); // 10초 timeout
      });
      
      // API 호출 전 디버깅 정보
      console.log('🎯 삭제할 리뷰 ID:', reviewId);
      console.log('🌐 요청 URL:', `https://localhost:8443/api/user/reviews/${reviewId}`);
      
      const apiPromise = ReviewService.deleteReview(reviewId);
      
      const deleteResponse = await Promise.race([apiPromise, timeoutPromise]) as any;

      console.log('✅ 리뷰 삭제 완료:', deleteResponse);
      console.log('✅ 로컬 상태 업데이트 시작');
      
      // 성공 메시지 표시 (백엔드 메시지 사용)
      const successMessage = deleteResponse?.data?.message || deleteResponse?.message || "리뷰가 성공적으로 삭제되었습니다.";
      alert(successMessage);
      
      // 삭제된 이미지 개수 로깅
      if (deleteResponse?.data?.deletedImageCount > 0) {
        console.log(`📷 ${deleteResponse.data.deletedImageCount}개의 이미지도 함께 삭제됨`);
      }
      
      // 로컬 상태에서 삭제된 리뷰 제거
      setReviews(prev => (prev || []).filter(review => review.reviewId !== reviewId));
      setTotalCount(prev => Math.max(0, prev - 1)); // 음수 방지

      // 상품 정보 새로고침 (평점 업데이트)
      loadProductInfo();

    } catch (err: any) {
      console.error('리뷰 삭제 실패:', err);
      console.error('에러 상세:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = '리뷰 삭제에 실패했습니다.';
      
      if (err.message?.includes('시간이 초과')) {
        errorMessage = '서버 응답이 너무 늦습니다. 잠시 후 다시 시도해주세요.';
      } else if (err.response?.status === 500) {
        errorMessage = '서버에서 오류가 발생했습니다. 백엔드 팀에 문의해주세요.';
      } else if (err.response?.status === 401) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '이 리뷰를 삭제할 권한이 없습니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '삭제하려는 리뷰를 찾을 수 없습니다.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else {
        errorMessage = err.response?.data?.message || ReviewService.getErrorMessage(err);
      }
      
      alert(errorMessage);
    }
  }, [loadProductInfo]);

  /**
   * 리뷰 수정 처리
   */
  const handleEditReview = useCallback((reviewId: number) => {
    console.log('🛠️ 리뷰 수정 시작:', reviewId);
    
    const reviewToEdit = reviews.find(review => review.reviewId === reviewId);
    if (reviewToEdit) {
      setEditingReview(reviewToEdit);
      setIsEditModalOpen(true);
    } else {
      alert('수정할 리뷰를 찾을 수 없습니다.');
    }
  }, [reviews]);

  /**
   * 리뷰 수정 성공 처리
   */
  const handleEditSuccess = useCallback((updatedReview: Review) => {
    console.log('✅ 리뷰 수정 성공, 로컬 상태 업데이트:', updatedReview);
    
    // 로컬 상태에서 수정된 리뷰 업데이트
    setReviews(prev => 
      (prev || []).map(review => 
        review.reviewId === updatedReview.reviewId ? updatedReview : review
      )
    );

    // 상품 정보 새로고침 (평점 업데이트)
    loadProductInfo();
  }, [loadProductInfo]);

  /**
   * 리뷰 수정 모달 닫기
   */
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingReview(null);
  }, []);

  /**
   * 리뷰 작성 버튼 클릭 처리
   */
  const handleWriteReview = useCallback(() => {
    console.log("🎯 리뷰 작성 버튼 클릭됨!");
    console.log("AuthContext user:", user);
    console.log("effectiveUserId:", effectiveUserId);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("canUserWriteReview:", canUserWriteReview);
    console.log("onWriteReview:", onWriteReview);
    console.log("productId:", productId);

    // onWriteReview prop이 있으면 그것을 사용
    if (onWriteReview) {
      console.log("✅ onWriteReview 실행");
      onWriteReview();
      return;
    }

    // 🎯 로그인 확인
    if (!isLoggedIn) {
      console.log("❌ 로그인 필요");
      alert("리뷰를 작성하려면 로그인이 필요합니다.");
      return;
    }

    // 🎯 일반 사용자 권한 확인
    if (user && user.userType !== "user") {
      console.log("❌ 권한 없음 - userType:", user.userType);
      alert("일반 사용자만 리뷰를 작성할 수 있습니다.");
      return;
    }

    // 리뷰 작성 페이지로 이동
    const targetUrl = `/reviews/write?productId=${productId}`;
    console.log("🚀 이동할 URL:", targetUrl);
    window.location.href = targetUrl;
  }, [onWriteReview, user, effectiveUserId, isLoggedIn, canUserWriteReview, productId]);

  // =============== Effect 훅들 ===============

  /**
   * 컴포넌트 마운트 시 초기 데이터 로딩
   */
  useEffect(() => {
    if (productId > 0) {
      loadProductInfo();
      loadReviews(0, true);
    }
  }, [productId, loadProductInfo, loadReviews]);

  /**
   * forceRefresh prop 변경 시 데이터 새로고침
   */
  useEffect(() => {
    if (forceRefresh && productId > 0) {
      console.log('🔄 강제 새로고침 실행');
      loadProductInfo();
      loadReviews(0, true);
    }
  }, [forceRefresh, productId, loadProductInfo, loadReviews]);

  /**
   * 리뷰 작성 후 돌아왔을 때 새로고침 감지
   */
  useEffect(() => {
    const state = location.state as any;
    if (state?.refreshReviews && productId > 0) {
      console.log('🔄 리뷰 작성 후 새로고침 실행');
      loadProductInfo();
      loadReviews(0, true);
      
      // state를 초기화하여 중복 새로고침 방지
      window.history.replaceState({}, document.title);
    }
    
    // 추가: 스크롤 위치 복원
    if (state?.scrollToReviews) {
      setTimeout(() => {
        const reviewsSection = document.querySelector('[data-section="reviews"]');
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500); // 데이터 로딩 후 스크롤
    }
  }, [location.state, productId, loadProductInfo, loadReviews]);

  /**
   * localStorage를 통한 리뷰 작성 완료 감지 (추가적인 안전장치)
   */
  useEffect(() => {
    const checkReviewCreated = () => {
      const reviewCreated = localStorage.getItem('reviewCreated');
      const targetProductId = localStorage.getItem('reviewProductId');
      
      if (reviewCreated === 'true' && 
          targetProductId === productId.toString() && 
          productId > 0) {
        console.log('🔄 localStorage에서 리뷰 작성 완료 감지 - 새로고침 실행');
        
        // 즉시 플래그 제거하여 중복 실행 방지
        localStorage.removeItem('reviewCreated');
        localStorage.removeItem('reviewProductId');
        
        // 데이터 새로고침 - 직접 호출하여 의존성 문제 해결
        const refreshData = async () => {
          try {
            const productData = await ReviewService.getProductInfo(productId);
            setProduct(productData);
            
            const params = {
              page: 0,
              size: initialPageSize,
              sort: filter.sort,
              ...(filter.rating && filter.rating > 0 && { 
                rating: filter.rating,
                exactRating: filter.exactRating 
              }),
              ...(filter.sizeFit && filter.sizeFit > 0 && { sizeFit: filter.sizeFit }),
              ...(filter.cushion && filter.cushion > 0 && { cushion: filter.cushion }),
              ...(filter.stability && filter.stability > 0 && { stability: filter.stability }),
            };
            const response = await ReviewService.getProductReviews(productId, params);
            console.log('🔍 새로고침 후 리뷰 목록 응답:', response);
            
            // 타입 안전성을 위해 any로 캐스팅
            const responseData = response as any;
            console.log('🔍 받은 리뷰 개수 (content):', response.content?.length || 0);
            console.log('🔍 받은 리뷰 개수 (reviews):', responseData.reviews?.length || 0);
            console.log('🔍 전체 리뷰 개수:', response.totalElements);
            console.log('🔍 리뷰 목록 내용 (content):', response.content);
            console.log('🔍 리뷰 목록 내용 (reviews):', responseData.reviews);
            
            // API 응답에서 실제 리뷰 배열을 찾아서 설정
            let reviewsData = responseData.reviews || response.content || [];
            
            // 🔧 프론트엔드에서 추가 필터링 적용 (localStorage 새로고침시에도)
            if (filter.rating && filter.rating > 0) {
              reviewsData = reviewsData.filter((review: any) => {
                if (filter.exactRating) {
                  return Math.floor(review.rating) === filter.rating;
                } else {
                  return review.rating >= filter.rating;
                }
              });
            }
            
            if (filter.sizeFit && filter.sizeFit > 0) {
              reviewsData = reviewsData.filter((review: any) => {
                const sizeFit = typeof review.sizeFit === 'string' ? 
                  (review.sizeFit === 'SMALL' ? 1 : review.sizeFit === 'NORMAL' ? 2 : 3) : 
                  review.sizeFit;
                return sizeFit === filter.sizeFit;
              });
            }
            
            if (filter.cushion && filter.cushion > 0) {
              reviewsData = reviewsData.filter((review: any) => {
                const cushion = typeof review.cushion === 'string' ? 
                  (review.cushion === 'SOFT' ? 1 : review.cushion === 'NORMAL' ? 2 : 3) : 
                  review.cushion;
                return cushion === filter.cushion;
              });
            }
            
            if (filter.stability && filter.stability > 0) {
              reviewsData = reviewsData.filter((review: any) => {
                const stability = typeof review.stability === 'string' ? 
                  (review.stability === 'LOW' ? 1 : review.stability === 'NORMAL' ? 2 : 3) : 
                  review.stability;
                return stability === filter.stability;
              });
            }
            console.log('🎯 실제 사용할 리뷰 데이터:', reviewsData);
            // 리뷰 데이터 구조 상세 확인
            if (reviewsData.length > 0) {
              console.log('🔍 첫 번째 리뷰 상세 정보:', reviewsData[0]);
              console.log('🔍 첫 번째 리뷰 이미지:', reviewsData[0].images);
              console.log('🔍 첫 번째 리뷰 평가:', {
                sizeFit: reviewsData[0].sizeFit,
                cushion: reviewsData[0].cushion,
                stability: reviewsData[0].stability
              });
            }
            
            setReviews(reviewsData);
            setCurrentPage(response.number || 0);
            setHasMore(!response.last);
            setTotalCount(response.totalElements || 0);
          } catch (err) {
            console.error('데이터 새로고침 실패:', err);
          }
        };
        
        refreshData();
      }
    };

    // 컴포넌트 마운트 시 확인
    checkReviewCreated();
    
    // storage 이벤트 리스너 (다른 탭에서의 변경사항 감지)
    window.addEventListener('storage', checkReviewCreated);
    
    return () => {
      window.removeEventListener('storage', checkReviewCreated);
    };
  }, [productId, initialPageSize, filter.sort, filter.rating, filter.exactRating, filter.sizeFit, filter.cushion, filter.stability]); // 의존성 최소화


  // =============== 계산된 값들 ===============

  // 안전한 평균 별점 계산
  const safeReviews = reviews || [];
  const averageRating = product?.averageRating ||
      (safeReviews.length > 0 ? calculateAverageRating(safeReviews.map(r => r.rating)) : 0);

  // 안전한 별점 분포 계산
  const ratingPercentages = safeReviews.length > 0
      ? getRatingPercentages(safeReviews)
      : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // =============== 렌더링 ===============

  if (isLoading && (!reviews || reviews.length === 0)) {
    return (
        <ReviewsSection>
          <Container>
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          </Container>
        </ReviewsSection>
    );
  }

  return (
      <ReviewsSection data-section="reviews">
        <Container>
          {/* 섹션 헤더 - 리뷰 요약 */}
          <SectionHeader>
            <SectionTitle>리뷰 ({formatNumber(totalCount)})</SectionTitle>

            <ReviewSummary>
              {/* 평균 별점 */}
              <RatingOverview>
                <AverageRating>{averageRating.toFixed(1)}</AverageRating>
                <StarRating rating={averageRating} size="medium" readOnly />
                <RatingText>
                  {formatNumber(totalCount)}개의 리뷰
                </RatingText>
              </RatingOverview>

              {/* 별점 분포 */}
              <RatingDistribution>
                {[5, 4, 3, 2, 1].map(rating => {
                  const percentage = ratingPercentages[rating] || 0;
                  const count = safeReviews.filter(r => Math.floor(r.rating) === rating).length;

                  return (
                      <RatingRow key={rating}>
                        <RatingLabel>{rating}점</RatingLabel>
                        <RatingBar>
                          <RatingBarFill $percentage={percentage} />
                        </RatingBar>
                        <RatingCount>
                          {formatNumber(count)}
                        </RatingCount>
                      </RatingRow>
                  );
                })}
              </RatingDistribution>
            </ReviewSummary>
          </SectionHeader>

          {/* 리뷰 작성 버튼 */}
          <WriteReviewSection>
            <div>
              <WriteReviewButton
                  $canWrite={canUserWriteReview}
                  onClick={handleWriteReview}
                  disabled={!canUserWriteReview}
                  type="button"
              >
                <span className="icon">✏️</span>
                리뷰 작성하기
              </WriteReviewButton>

              {!isLoggedIn && (
                  <DisabledMessage>
                    리뷰를 작성하려면 로그인이 필요합니다.
                  </DisabledMessage>
              )}

              {isLoggedIn && user && user.userType !== "user" && (
                  <DisabledMessage>
                    일반 사용자만 리뷰를 작성할 수 있습니다.
                  </DisabledMessage>
              )}

              

            </div>
          </WriteReviewSection>

          {/* 리뷰 목록 */}
          <ReviewsContent>
            <ReviewFilter
                totalCount={totalCount}
                currentFilter={filter}
                onFilterChange={handleFilterChange}
                isLoading={isLoadingMore}
            />

            <ReviewList
                reviews={safeReviews}
                currentUserId={effectiveUserId}
                isLoading={isLoadingMore}
                hasMore={hasMore}
                error={error}
                onLoadMore={handleLoadMore}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                enableInfiniteScroll={enableInfiniteScroll}
                emptyMessage="아직 작성된 리뷰가 없습니다.\n첫 번째 리뷰를 작성해보세요!"
                isReportedReview={isReportedReview}
                onReportSuccess={addReportedReview}
            />
          </ReviewsContent>
        </Container>

        {/* 리뷰 수정 모달 */}
        {editingReview && (
          <ReviewEditModal
            review={editingReview}
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
          />
        )}
      </ReviewsSection>
  );
};

// =============== 사용 예시 (개발 참고용) ===============

/**
 * 사용 예시:
 *
 * // 기본 사용 (상품 상세 페이지)
 * <ProductReviews
 *   productId={productId}
 *   currentUserId={user?.id}
 *   canWriteReview={!!user && !hasUserReviewed}
 *   onWriteReview={() => navigate('/review/write')}
 *   onEditReview={(reviewId) => navigate(`/review/edit/${reviewId}`)}
 * />
 *
 * // 무한 스크롤 방식
 * <ProductReviews
 *   productId={productId}
 *   currentUserId={user?.id}
 *   enableInfiniteScroll={true}
 *   initialPageSize={20}
 * />
 */