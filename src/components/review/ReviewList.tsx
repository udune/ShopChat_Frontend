/**
 * 리뷰 목록 컴포넌트
 *
 * 리뷰 카드들을 목록으로 표시하고, 페이지네이션, 로딩 상태,
 * 에러 상태, 빈 상태 등을 처리하는 컴포넌트입니다.
 */

import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { ReviewCard } from "./ReviewCard";
import { Review } from "../../types/review"; // 공통 타입 import

// =============== 타입 정의 ===============

interface ReviewListProps {
    reviews: Review[];                                    // 표시할 리뷰 목록
    currentUserId?: number;                               // 현재 로그인한 사용자 ID
    isLoading: boolean;                                   // 로딩 상태
    hasMore: boolean;                                     // 더 불러올 데이터가 있는지
    error?: string | null;                                // 에러 메시지
    onLoadMore?: () => void;                              // 더보기 클릭 콜백
    onEdit?: (reviewId: number) => void;                  // 리뷰 수정 콜백
    onDelete?: (reviewId: number) => void;                // 리뷰 삭제 콜백
    enableInfiniteScroll?: boolean;                       // 무한 스크롤 활성화 여부
    emptyMessage?: string;                                // 빈 상태 메시지
    loadingMessage?: string;                              // 로딩 메시지
    isReportedReview?: (reviewId: number) => boolean;     // 신고된 리뷰 확인 함수
    onReportSuccess?: (reviewId: number) => void;         // 신고 성공 콜백
}

// =============== 스타일 컴포넌트 ===============

const ListContainer = styled.div`
    width: 100%;
`;

const ReviewsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0; /* ReviewCard 자체에 margin-bottom이 있음 */
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 16px;
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

const LoadingText = styled.p`
    font-size: 14px;
    color: #6b7280;
    margin: 0;
`;

const ErrorContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 16px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    margin: 20px 0;
`;

const ErrorIcon = styled.div`
    font-size: 48px;
    color: #dc2626;
`;

const ErrorTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #dc2626;
    margin: 0;
`;

const ErrorMessage = styled.p`
    font-size: 14px;
    color: #7f1d1d;
    margin: 0;
    text-align: center;
    line-height: 1.5;
`;

const RetryButton = styled.button`
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: #b91c1c;
        transform: translateY(-1px);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
    }
`;

const EmptyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 20px;
    background: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    margin: 20px 0;
`;

const EmptyIcon = styled.div`
    font-size: 64px;
    color: #9ca3af;
    opacity: 0.7;
`;

const EmptyTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #374151;
    margin: 0;
`;

const EmptyMessage = styled.p`
    font-size: 16px;
    color: #6b7280;
    margin: 0;
    text-align: center;
    line-height: 1.6;
    max-width: 400px;
`;

const LoadMoreContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px;
    margin-top: 20px;
`;

const LoadMoreButton = styled.button<{ $isLoading: boolean }>`
    background: ${props => props.$isLoading ? '#9ca3af' : '#2563eb'};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: ${props => props.$isLoading ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
    justify-content: center;

    &:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
    }

    &:disabled {
        cursor: not-allowed;
    }
`;

const LoadMoreSpinner = styled(LoadingSpinner)`
    width: 16px;
    height: 16px;
    border-width: 2px;
`;

const InfiniteScrollTrigger = styled.div`
    height: 20px;
    margin: 20px 0;
`;

// =============== 메인 컴포넌트 ===============

export const ReviewList: React.FC<ReviewListProps> = ({
                                                          reviews = [], // 기본값으로 빈 배열 설정
                                                          currentUserId,
                                                          isLoading,
                                                          hasMore,
                                                          error,
                                                          onLoadMore,
                                                          onEdit,
                                                          onDelete,
                                                          enableInfiniteScroll = false,
                                                          emptyMessage = "아직 작성된 리뷰가 없습니다.\n첫 번째 리뷰를 작성해보세요!",
                                                          loadingMessage = "리뷰를 불러오는 중...",
                                                          isReportedReview,
                                                          onReportSuccess,
                                                      }) => {
    const infiniteScrollRef = useRef<HTMLDivElement>(null);

    /**
     * 무한 스크롤 처리
     * Intersection Observer를 사용하여 화면 하단에 도달했을 때 자동으로 더 불러오기
     */
    useEffect(() => {
        if (!enableInfiniteScroll || !onLoadMore || !hasMore || isLoading) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting) {
                    onLoadMore();
                }
            },
            {
                threshold: 0.1, // 10% 보이면 트리거
                rootMargin: '50px', // 50px 전에 미리 트리거
            }
        );

        const currentRef = infiniteScrollRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [enableInfiniteScroll, onLoadMore, hasMore, isLoading]);

    /**
     * 재시도 버튼 클릭 처리
     */
    const handleRetry = () => {
        if (onLoadMore) {
            onLoadMore();
        }
    };

    /**
     * 더보기 버튼 클릭 처리
     */
    const handleLoadMore = () => {
        if (onLoadMore && !isLoading) {
            onLoadMore();
        }
    };

    // 에러 상태 렌더링
    if (error && (!reviews || reviews.length === 0)) {
        return (
            <ListContainer>
                <ErrorContainer>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorTitle>리뷰를 불러올 수 없습니다</ErrorTitle>
                    <ErrorMessage>{error}</ErrorMessage>
                    {onLoadMore && (
                        <RetryButton onClick={handleRetry}>
                            다시 시도
                        </RetryButton>
                    )}
                </ErrorContainer>
            </ListContainer>
        );
    }

    // 초기 로딩 상태 렌더링
    if (isLoading && (!reviews || reviews.length === 0)) {
        return (
            <ListContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>{loadingMessage}</LoadingText>
                </LoadingContainer>
            </ListContainer>
        );
    }

    // 빈 상태 렌더링
    if (!isLoading && (!reviews || reviews.length === 0)) {
        return (
            <ListContainer>
                <EmptyContainer>
                    <EmptyIcon>📝</EmptyIcon>
                    <EmptyTitle>리뷰가 없습니다</EmptyTitle>
                    <EmptyMessage>{emptyMessage}</EmptyMessage>
                </EmptyContainer>
            </ListContainer>
        );
    }

    // 정상 상태 - 리뷰 목록 렌더링
    return (
        <ListContainer>
            <ReviewsContainer>
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.reviewId}
                        review={review}
                        currentUserId={currentUserId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isReported={isReportedReview?.(review.reviewId) || false}
                        onReportSuccess={() => onReportSuccess?.(review.reviewId)}
                    />
                ))}
            </ReviewsContainer>

            {/* 에러가 있지만 기존 리뷰들이 있는 경우 (추가 로딩 실패) */}
            {error && reviews.length > 0 && (
                <ErrorContainer>
                    <ErrorTitle>추가 리뷰를 불러올 수 없습니다</ErrorTitle>
                    <ErrorMessage>{error}</ErrorMessage>
                    {onLoadMore && (
                        <RetryButton onClick={handleRetry}>
                            다시 시도
                        </RetryButton>
                    )}
                </ErrorContainer>
            )}

            {/* 무한 스크롤 트리거 */}
            {enableInfiniteScroll && hasMore && !error && (
                <InfiniteScrollTrigger ref={infiniteScrollRef}>
                    {isLoading && (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText>더 많은 리뷰를 불러오는 중...</LoadingText>
                        </LoadingContainer>
                    )}
                </InfiniteScrollTrigger>
            )}

            {/* 더보기 버튼 (무한 스크롤이 비활성화된 경우) */}
            {!enableInfiniteScroll && hasMore && !error && (
                <LoadMoreContainer>
                    <LoadMoreButton
                        $isLoading={isLoading}
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        type="button"
                    >
                        {isLoading ? (
                            <>
                                <LoadMoreSpinner />
                                불러오는 중...
                            </>
                        ) : (
                            '더보기'
                        )}
                    </LoadMoreButton>
                </LoadMoreContainer>
            )}

            {/* 더 이상 불러올 데이터가 없는 경우 */}
            {!hasMore && reviews.length > 0 && !error && (
                <LoadingContainer>
                    <LoadingText>모든 리뷰를 불러왔습니다.</LoadingText>
                </LoadingContainer>
            )}
        </ListContainer>
    );
};

// =============== 사용 예시 (개발 참고용) ===============

/**
 * 사용 예시:
 *
 * // 기본 사용 (더보기 버튼 방식)
 * <ReviewList
 *   reviews={reviews}
 *   currentUserId={user?.id}
 *   isLoading={isLoading}
 *   hasMore={hasMore}
 *   error={error}
 *   onLoadMore={loadMore}
 *   onEdit={handleEditReview}
 *   onDelete={handleDeleteReview}
 * />
 *
 * // 무한 스크롤 방식
 * <ReviewList
 *   reviews={reviews}
 *   currentUserId={user?.id}
 *   isLoading={isLoading}
 *   hasMore={hasMore}
 *   onLoadMore={loadMore}
 *   enableInfiniteScroll={true}
 *   onEdit={handleEditReview}
 *   onDelete={handleDeleteReview}
 * />
 *
 * // 커스텀 메시지
 * <ReviewList
 *   reviews={reviews}
 *   currentUserId={user?.id}
 *   isLoading={isLoading}
 *   hasMore={hasMore}
 *   emptyMessage="이 상품에 대한 리뷰가 아직 없습니다."
 *   loadingMessage="리뷰를 가져오고 있습니다..."
 * />
 */