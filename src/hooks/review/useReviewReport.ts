/**
 * 리뷰 신고 관련 훅
 *
 * 리뷰 신고 상태를 관리하고 신고된 리뷰들을 추적하는 훅입니다.
 */

import { useState, useCallback, useEffect } from "react";

// =============== 타입 정의 ===============

interface UseReviewReportOptions {
    initialReportedIds?: number[];
}

interface UseReviewReportReturn {
    reportedReviewIds: Set<number>;
    addReportedReview: (reviewId: number) => void;
    isReportedReview: (reviewId: number) => boolean;
    clearReportedReviews: () => void;
}

// =============== 로컬 스토리지 키 ===============

const REPORTED_REVIEWS_KEY = 'reported_review_ids';

// =============== 유틸리티 함수들 ===============

/**
 * 로컬 스토리지에서 신고된 리뷰 ID들을 불러오기
 */
const loadReportedReviewIds = (): Set<number> => {
    try {
        const stored = localStorage.getItem(REPORTED_REVIEWS_KEY);
        if (stored) {
            const ids = JSON.parse(stored);
            return new Set(Array.isArray(ids) ? ids : []);
        }
    } catch (error) {
        console.warn('신고된 리뷰 ID 로드 실패:', error);
    }
    return new Set();
};

/**
 * 로컬 스토리지에 신고된 리뷰 ID들 저장
 */
const saveReportedReviewIds = (reportedIds: Set<number>): void => {
    try {
        localStorage.setItem(REPORTED_REVIEWS_KEY, JSON.stringify(Array.from(reportedIds)));
    } catch (error) {
        console.warn('신고된 리뷰 ID 저장 실패:', error);
    }
};

// =============== 메인 훅 ===============

export const useReviewReport = (options: UseReviewReportOptions = {}): UseReviewReportReturn => {
    const { initialReportedIds = [] } = options;

    // 신고된 리뷰 ID들을 Set으로 관리 (중복 방지 및 빠른 조회)
    const [reportedReviewIds, setReportedReviewIds] = useState<Set<number>>(() => {
        const storedIds = loadReportedReviewIds();
        // 초기값으로 받은 ID들도 추가
        initialReportedIds.forEach(id => storedIds.add(id));
        return storedIds;
    });

    /**
     * 신고된 리뷰 ID 추가
     */
    const addReportedReview = useCallback((reviewId: number) => {
        setReportedReviewIds(prev => {
            const newSet = new Set(prev);
            newSet.add(reviewId);
            return newSet;
        });
    }, []);

    /**
     * 특정 리뷰가 신고되었는지 확인
     */
    const isReportedReview = useCallback((reviewId: number): boolean => {
        return reportedReviewIds.has(reviewId);
    }, [reportedReviewIds]);

    /**
     * 신고된 리뷰 목록 초기화
     */
    const clearReportedReviews = useCallback(() => {
        setReportedReviewIds(new Set());
    }, []);

    // =============== Effect 훅들 ===============

    /**
     * reportedReviewIds가 변경될 때마다 로컬 스토리지에 저장
     */
    useEffect(() => {
        saveReportedReviewIds(reportedReviewIds);
    }, [reportedReviewIds]);

    // =============== 반환값 ===============

    return {
        reportedReviewIds,
        addReportedReview,
        isReportedReview,
        clearReportedReviews,
    };
};

// =============== 전역 인스턴스 (선택사항) ===============

/**
 * 앱 전역에서 사용할 수 있는 신고 상태 관리 훅
 * 여러 컴포넌트에서 동일한 신고 상태를 공유하려면 Context나 전역 상태 관리를 고려
 */
export const useGlobalReviewReport = () => {
    return useReviewReport();
};

// =============== 사용 예시 (개발 참고용) ===============

/**
 * 사용 예시:
 *
 * const { reportedReviewIds, addReportedReview, isReportedReview } = useReviewReport();
 *
 * // 리뷰 신고 성공 후 호출
 * const handleReportSuccess = (reviewId: number) => {
 *     addReportedReview(reviewId);
 *     alert('신고가 접수되었습니다.');
 * };
 *
 * // 리뷰 카드에서 신고 상태 확인
 * <ReviewCard
 *     review={review}
 *     currentUserId={currentUserId}
 *     isReported={isReportedReview(review.reviewId)}
 *     onReportSuccess={() => addReportedReview(review.reviewId)}
 * />
 */