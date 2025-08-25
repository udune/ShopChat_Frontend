/**
 * 개별 리뷰 카드 컴포넌트
 *
 * 리뷰 하나를 카드 형태로 표시하는 컴포넌트입니다.
 * 리뷰 내용, 이미지, 별점, 3요소 평가 등을 포함합니다.
 */

import React, { useState } from "react";
import styled from "styled-components";
import { StarRating } from "./StarRating";
import { ReviewReportModal } from "./ReviewReportModal";
import { formatDate, getRelativeTime } from "../../utils/review/reviewHelpers";
import { Review, ReviewImage } from "../../types/review"; // 공통 타입 import
import { toUrl } from "../../utils/common/images"; // Product에서 사용하는 이미지 URL 변환 함수

// =============== 타입 정의 ===============

interface ReviewCardProps {
    review: Review;                    // 표시할 리뷰 데이터
    currentUserId?: number;            // 현재 로그인한 사용자 ID
    showProductInfo?: boolean;         // 상품 정보 표시 여부 (마이페이지에서 사용)
    onEdit?: (reviewId: number) => void; // 수정 버튼 클릭 콜백
    onDelete?: (reviewId: number) => void; // 삭제 버튼 클릭 콜백
    isReported?: boolean;              // 이미 신고된 리뷰인지 여부
    onReportSuccess?: () => void;      // 신고 성공 콜백
}

// =============== 스타일 컴포넌트 ===============

const CardContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div<{ $hasImage: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$hasImage ? "transparent" : "#f3f4f6"};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &::before {
    content: ${props => props.$hasImage ? "none" : "'👤'"};
    font-size: 18px;
    color: #9ca3af;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #111827;
  font-size: 14px;
`;

const ReviewDate = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    color: #374151;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.edit {
    color: #2563eb;
    border-color: #bfdbfe;
    
    &:hover:not(:disabled) {
      background: #eff6ff;
      border-color: #2563eb;
    }
  }
  
  &.delete {
    color: #dc2626;
    border-color: #fecaca;
    
    &:hover:not(:disabled) {
      background: #fef2f2;
      border-color: #dc2626;
    }
  }
  
  &.report {
    color: #ea580c;
    border-color: #fed7aa;
    
    &:hover:not(:disabled) {
      background: #fff7ed;
      border-color: #ea580c;
    }
    
    &.reported {
      color: #9ca3af;
      border-color: #e5e7eb;
      cursor: not-allowed;
      
      &:hover {
        background: none;
        border-color: #e5e7eb;
        color: #9ca3af;
      }
    }
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ReviewContent = styled.div`
  margin-bottom: 16px;
`;

const ReviewText = styled.p`
  color: #374151;
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
  white-space: pre-wrap; /* 줄바꿈 유지 */
`;

const ImagesSection = styled.div`
  margin-bottom: 16px;
`;

const ImageGrid = styled.div<{ $imageCount: number }>`
  display: grid;
  grid-template-columns: repeat(${props => Math.min(props.$imageCount, 4)}, 1fr);
  gap: 8px;
  max-width: 400px;
`;

const ReviewImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
`;

const ReviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const MoreImagesOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const EvaluationSection = styled.div`
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
`;

const EvaluationTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
`;

const EvaluationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const EvaluationItem = styled.div`
  text-align: center;
  padding: 8px;
  background: #f9fafb;
  border-radius: 8px;
`;

const EvaluationLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const EvaluationValue = styled.div<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$color};
`;

// =============== 유틸리티 함수들 ===============

/**
 * 3요소 평가 값을 텍스트로 변환 (백엔드 문자열 형식 지원)
 */
const getEvaluationText = (type: 'sizeFit' | 'cushion' | 'stability', value?: number | string) => {
    if (!value) return { text: "미평가", color: "#9ca3af" };

    // 문자열 형식으로 온 데이터를 처리
    const stringEvaluationMap = {
        sizeFit: {
            'SMALL': { text: "작음", color: "#dc2626" },
            'NORMAL': { text: "적당함", color: "#059669" },
            'BIG': { text: "큼", color: "#dc2626" }
        },
        cushion: {
            'SOFT': { text: "부드러움", color: "#2563eb" },
            'NORMAL': { text: "적당함", color: "#059669" },
            'HARD': { text: "딱딱함", color: "#dc2626" }
        },
        stability: {
            'LOW': { text: "낮음", color: "#dc2626" },
            'NORMAL': { text: "보통", color: "#059669" },
            'STABLE': { text: "높음", color: "#2563eb" }
        }
    };

    // 숫자 형식으로 온 데이터를 처리 (기존 호환성)
    const numberEvaluationMap = {
        sizeFit: {
            1: { text: "작음", color: "#dc2626" },
            2: { text: "적당함", color: "#059669" },
            3: { text: "큼", color: "#dc2626" }
        },
        cushion: {
            1: { text: "부드러움", color: "#2563eb" },
            2: { text: "적당함", color: "#059669" },
            3: { text: "딱딱함", color: "#dc2626" }
        },
        stability: {
            1: { text: "낮음", color: "#dc2626" },
            2: { text: "보통", color: "#059669" },
            3: { text: "높음", color: "#2563eb" }
        }
    };

    // 문자열인 경우
    if (typeof value === 'string') {
        return stringEvaluationMap[type][value as keyof typeof stringEvaluationMap[typeof type]] ||
            { text: "미평가", color: "#9ca3af" };
    }

    // 숫자인 경우
    return numberEvaluationMap[type][value as keyof typeof numberEvaluationMap[typeof type]] ||
        { text: "미평가", color: "#9ca3af" };
};

// =============== 메인 컴포넌트 ===============

export const ReviewCard: React.FC<ReviewCardProps> = ({
                                                          review,
                                                          currentUserId,
                                                          showProductInfo = false,
                                                          onEdit,
                                                          onDelete,
                                                          isReported = false,
                                                          onReportSuccess,
                                                      }) => {
    // const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // 현재 사용자가 이 리뷰의 작성자인지 확인
    const isOwner = currentUserId === review.userId;
    
    // 신고 버튼 표시 여부 (로그인한 상태면 모든 리뷰에 표시)
    const canReport = !!currentUserId;
    
    // 모의 데이터 필터링 함수 (완화된 버전)
    const filterRealImages = (images: ReviewImage[]): ReviewImage[] => {
        if (!images || images.length === 0) return [];
        
        // 기본적으로 모든 이미지를 허용하되, 명백한 모의 데이터만 제외
        const realImages = images.filter(img => {
            // 1. 기본 정보가 없는 경우만 제외
            if (!img.imageUrl || !img.originalFilename) {
                console.log(`❌ 기본 정보 없음:`, img);
                return false;
            }
            
            // 2. 매우 명백한 모의 데이터 패턴만 제외
            const strictMockPatterns = [
                /^sample-/i,
                /^test-/i,
                /^mock-/i,
                /^example-/i,
                /^demo-/i,
                /placeholder/i
            ];
            
            const isStrictMock = strictMockPatterns.some(pattern => 
                pattern.test(img.originalFilename || '')
            );
            
            if (isStrictMock) {
                console.log(`❌ 명백한 모의 데이터:`, img.originalFilename);
                return false;
            }
            
            return true;
        });
        
        return realImages;
    };

    // 리뷰 이미지 URL을 CDN URL로 변환하는 함수 (임시 단순 버전)
    const convertReviewImageUrl = (url: string): string => {
        if (!url) return '';
        
        // 일단 백엔드에서 주는 URL 그대로 사용해보기
        console.log(`🔧 원본 URL 그대로 사용: ${url}`);
        return url;
    };

    // 실제 이미지만 필터링
    const realImages = filterRealImages(review.images || []);
    
    // 이미지 디버깅 정보 출력
    console.log(`🔍 리뷰 ${review.reviewId} 이미지 분석:`);
    console.log(`  - 원본 이미지 개수: ${review.images?.length || 0}`);
    console.log(`  - 필터링 후 이미지 개수: ${realImages.length}`);
    
    if (review.images && review.images.length > 0) {
        review.images.forEach((img, idx) => {
            console.log(`  📷 원본 이미지 ${idx + 1}:`, {
                id: img.reviewImageId,
                filename: img.originalFilename,
                url: img.imageUrl,
                fileSize: img.fileSize,
                order: img.imageOrder
            });
        });
    }
    
    if (realImages.length > 0) {
        console.log(`✅ 필터링된 이미지들:`);
        realImages.forEach((img, idx) => {
            const convertedUrl = convertReviewImageUrl(img.imageUrl);
            console.log(`  🖼️ 이미지 ${idx + 1}:`, {
                id: img.reviewImageId,
                filename: img.originalFilename,
                originalUrl: img.imageUrl,
                convertedUrl: convertedUrl,
                urlChanged: img.imageUrl !== convertedUrl
            });
        });
    } else if (review.images && review.images.length > 0) {
        console.log(`⚠️ 모든 이미지가 필터링됨 - 모의 데이터로 감지됨`);
    }

    // 이미지 클릭 처리
    const handleImageClick = (index: number) => {
        // setSelectedImageIndex(index);
        // 이미지 모달 등을 여기서 처리할 수 있습니다
        console.log("이미지 클릭:", realImages[index]);
    };

    // 수정 버튼 클릭
    const handleEdit = () => {
        if (onEdit) {
            onEdit(review.reviewId);
        }
    };

    // 삭제 버튼 클릭
    const handleDelete = () => {
        if (onDelete) {
            onDelete(review.reviewId);
        }
    };

    // 신고 버튼 클릭
    const handleReport = () => {
        setIsReportModalOpen(true);
    };

    // 신고 성공 처리
    const handleReportSuccess = () => {
        if (onReportSuccess) {
            onReportSuccess();
        }
    };

    return (
        <CardContainer>
            {/* 카드 헤더 - 사용자 정보 및 액션 버튼 */}
            <CardHeader>
                <UserInfo>
                    <UserAvatar $hasImage={!!review.userProfileImage}>
                        {review.userProfileImage && (
                            <img
                                src={review.userProfileImage}
                                alt={`${review.userName}의 프로필`}
                            />
                        )}
                    </UserAvatar>

                    <UserDetails>
                        <UserName>{review.userName}</UserName>
                        <ReviewDate
                            title={formatDate(review.createdAt)}
                        >
                            {getRelativeTime(review.createdAt)}
                        </ReviewDate>
                    </UserDetails>
                </UserInfo>

                {/* 액션 버튼들 */}
                {(isOwner || canReport) && (
                    <ActionButtons>
                        {/* 작성자 본인인 경우 수정/삭제 버튼 */}
                        {isOwner && (
                            <>
                                {onEdit && (
                                    <ActionButton
                                        className="edit"
                                        onClick={handleEdit}
                                        type="button"
                                    >
                                        수정
                                    </ActionButton>
                                )}
                                {onDelete && (
                                    <ActionButton
                                        className="delete"
                                        onClick={handleDelete}
                                        type="button"
                                    >
                                        삭제
                                    </ActionButton>
                                )}
                            </>
                        )}
                        
                        {/* 로그인한 사용자는 모든 리뷰에 신고 버튼 표시 */}
                        {canReport && (
                            <ActionButton
                                className={`report ${isReported ? 'reported' : ''}`}
                                onClick={handleReport}
                                type="button"
                                disabled={isReported}
                                title={
                                    isReported 
                                        ? '이미 신고한 리뷰입니다' 
                                        : isOwner 
                                            ? '본인 리뷰 신고하기' 
                                            : '리뷰 신고하기'
                                }
                            >
                                {isReported ? '신고완료' : '신고'}
                            </ActionButton>
                        )}
                    </ActionButtons>
                )}
            </CardHeader>

            {/* 별점 섹션 */}
            <RatingSection>
                <StarRating
                    rating={review.rating}
                    size="small"
                    readOnly
                />
            </RatingSection>

            {/* 리뷰 내용 */}
            <ReviewContent>
                <ReviewText>{review.content}</ReviewText>
            </ReviewContent>

            {/* 이미지 섹션 (필터링된 이미지가 있는 경우에만) */}
            {realImages && realImages.length > 0 && (
                <ImagesSection>
                    <ImageGrid $imageCount={realImages.length}>
                        {realImages.slice(0, 4).map((image, index) => (
                            <ReviewImageWrapper
                                key={image.reviewImageId}
                                onClick={() => handleImageClick(index)}
                            >
                                {(() => {
                                    // 리뷰 이미지 전용 변환 함수 사용
                                    const imageUrl = convertReviewImageUrl(image.imageUrl);
                                    console.log(`🖼️ 이미지 ${image.reviewImageId} URL 변환:`, {
                                        원본: image.imageUrl,
                                        변환후: imageUrl
                                    });
                                    
                                    return (
                                        <ReviewImg
                                            data-review-image-id={image.reviewImageId}
                                            src={imageUrl}
                                            alt={image.alt || image.originalFilename || `리뷰 이미지 ${index + 1}`}
                                            onLoad={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                console.log(`✅ 이미지 ${image.reviewImageId} (${image.originalFilename}) 로드 성공:`, {
                                                    url: target.src,
                                                    naturalSize: `${target.naturalWidth}x${target.naturalHeight}`
                                                });
                                            }}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                console.error(`❌ 이미지 ${image.reviewImageId} (${image.originalFilename}) 로드 실패:`, target.src);
                                                
                                                // Product와 동일한 방식으로 오류 처리 - 단순히 숨김
                                                target.style.visibility = 'hidden';
                                            }}
                                        />
                                    );
                                })()}

                                {/* 4번째 이미지이고 더 많은 이미지가 있으면 오버레이 표시 */}
                                {index === 3 && realImages.length > 4 && (
                                    <MoreImagesOverlay>
                                        +{realImages.length - 4}
                                    </MoreImagesOverlay>
                                )}
                            </ReviewImageWrapper>
                        ))}
                    </ImageGrid>
                </ImagesSection>
            )}

            {/* 3요소 평가 섹션 (평가가 있는 경우에만) */}
            {(review.sizeFit || review.cushion || review.stability) && (
                <EvaluationSection>
                    <EvaluationTitle>상품 평가</EvaluationTitle>
                    <EvaluationGrid>
                        <EvaluationItem>
                            <EvaluationLabel>사이즈</EvaluationLabel>
                            <EvaluationValue
                                $color={getEvaluationText('sizeFit', review.sizeFit).color}
                            >
                                {getEvaluationText('sizeFit', review.sizeFit).text}
                            </EvaluationValue>
                        </EvaluationItem>

                        <EvaluationItem>
                            <EvaluationLabel>쿠션감</EvaluationLabel>
                            <EvaluationValue
                                $color={getEvaluationText('cushion', review.cushion).color}
                            >
                                {getEvaluationText('cushion', review.cushion).text}
                            </EvaluationValue>
                        </EvaluationItem>

                        <EvaluationItem>
                            <EvaluationLabel>안정성</EvaluationLabel>
                            <EvaluationValue
                                $color={getEvaluationText('stability', review.stability).color}
                            >
                                {getEvaluationText('stability', review.stability).text}
                            </EvaluationValue>
                        </EvaluationItem>
                    </EvaluationGrid>
                </EvaluationSection>
            )}
            
            {/* 리뷰 신고 모달 */}
            <ReviewReportModal
                isOpen={isReportModalOpen}
                reviewId={review.reviewId}
                reviewAuthor={review.userName}
                onClose={() => setIsReportModalOpen(false)}
                onSuccess={handleReportSuccess}
            />
        </CardContainer>
    );
};

// =============== 사용 예시 (개발 참고용) ===============

/**
 * 사용 예시:
 *
 * // 기본 사용 (상품 상세 페이지)
 * <ReviewCard
 *   review={review}
 *   currentUserId={user?.id}
 *   onEdit={handleEditReview}
 *   onDelete={handleDeleteReview}
 * />
 *
 * // 마이페이지에서 사용 (상품 정보 포함)
 * <ReviewCard
 *   review={review}
 *   currentUserId={user?.id}
 *   showProductInfo={true}
 *   onEdit={handleEditReview}
 *   onDelete={handleDeleteReview}
 * />
 */