/**
 * 리뷰 신고 모달 컴포넌트
 *
 * 사용자가 부적절한 리뷰를 신고할 수 있는 모달 컴포넌트입니다.
 * 백엔드 API 가이드에 따라 신고 사유와 상세 설명을 입력할 수 있습니다.
 */

import React, { useState } from "react";
import styled from "styled-components";
import { ReportReason, ReportReasonOption } from "../../types/review";
import { ReviewService } from "../../api/reviewService";

// =============== 타입 정의 ===============

interface ReviewReportModalProps {
    isOpen: boolean;
    reviewId: number;
    reviewAuthor?: string;
    onClose: () => void;
    onSuccess: () => void;
}

// =============== 신고 사유 옵션 ===============

const REPORT_REASONS: ReportReasonOption[] = [
    {
        value: 'ABUSIVE_LANGUAGE',
        label: '욕설 및 비방',
        description: '욕설, 혐오 표현, 개인 비방 등이 포함된 경우'
    },
    {
        value: 'SPAM',
        label: '스팸 및 도배',
        description: '반복적이거나 의미 없는 내용, 도배성 글'
    },
    {
        value: 'INAPPROPRIATE_CONTENT',
        label: '부적절한 내용',
        description: '상품과 무관하거나 부적절한 내용'
    },
    {
        value: 'FALSE_INFORMATION',
        label: '허위 정보',
        description: '거짓 정보나 오해를 유발할 수 있는 내용'
    },
    {
        value: 'ADVERTISING',
        label: '광고성 내용',
        description: '다른 제품이나 서비스를 홍보하는 내용'
    },
    {
        value: 'COPYRIGHT_VIOLATION',
        label: '저작권 침해',
        description: '다른 곳에서 무단으로 복사한 내용'
    },
    {
        value: 'OTHER',
        label: '기타',
        description: '위에 해당하지 않는 기타 문제'
    }
];

// =============== 스타일 컴포넌트 ===============

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #f3f4f6;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const ReasonOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$selected ? '#eff6ff' : 'white'};
  
  &:hover {
    border-color: ${props => props.$selected ? '#3b82f6' : '#d1d5db'};
    background: ${props => props.$selected ? '#eff6ff' : '#f9fafb'};
  }
`;

const RadioInput = styled.input`
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: #3b82f6;
  flex-shrink: 0;
`;

const ReasonContent = styled.div`
  flex: 1;
`;

const ReasonLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
`;

const ReasonDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
`;

const DescriptionSection = styled.div`
  margin-bottom: 24px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: right;
  margin-top: 8px;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 24px 24px 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #dc2626;
    color: white;
    border: 1px solid #dc2626;
    
    &:hover:not(:disabled) {
      background: #b91c1c;
      border-color: #b91c1c;
    }
    
    &:disabled {
      background: #9ca3af;
      border-color: #9ca3af;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  `}
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// =============== 메인 컴포넌트 ===============

export const ReviewReportModal: React.FC<ReviewReportModalProps> = ({
    isOpen,
    reviewId,
    reviewAuthor,
    onClose,
    onSuccess
}) => {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 모달이 열릴 때마다 상태 초기화
    React.useEffect(() => {
        if (isOpen) {
            setSelectedReason(null);
            setDescription('');
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    // ESC 키로 모달 닫기
    React.useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !isSubmitting) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, isSubmitting, onClose]);

    // 신고 제출 처리
    const handleSubmit = async () => {
        if (!selectedReason) {
            setError('신고 사유를 선택해주세요.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await ReviewService.reportReview(
                reviewId, 
                selectedReason, 
                description.trim() || undefined
            );

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('리뷰 신고 실패:', error);
            
            // 백엔드 에러 메시지 처리 - 사용자 친화적으로 개선
            if (error.response?.status === 409) {
                setError('이미 신고한 리뷰입니다.\n중복 신고는 불가능합니다.');
            } else if (error.response?.status === 400) {
                const backendMessage = error.response?.data?.message;
                if (backendMessage && backendMessage.includes('자신이 작성한 리뷰')) {
                    setError('본인이 작성한 리뷰는 신고할 수 없습니다.\n문제가 있는 경우 리뷰를 직접 수정하거나 삭제해주세요.');
                } else {
                    setError(backendMessage || '잘못된 요청입니다.\n입력 내용을 확인해주세요.');
                }
            } else if (error.response?.status === 404) {
                setError('신고하려는 리뷰를 찾을 수 없습니다.\n해당 리뷰가 이미 삭제되었을 수 있습니다.');
            } else if (error.response?.status === 401) {
                setError('로그인이 만료되었습니다.\n다시 로그인한 후 시도해주세요.');
            } else if (error.response?.status === 403) {
                setError('신고 권한이 없습니다.\n계정 상태를 확인해주세요.');
            } else if (error.response?.status >= 500) {
                setError('서버에 일시적인 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                setError('네트워크 연결을 확인해주세요.\n인터넷 연결 상태를 점검한 후 다시 시도해주세요.');
            } else {
                // 기타 예상치 못한 에러
                const backendMessage = error.response?.data?.message;
                setError(
                    backendMessage || 
                    '예상치 못한 오류가 발생했습니다.\n문제가 지속되면 고객센터에 문의해주세요.'
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // 배경 클릭으로 모달 닫기
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    // 입력 값 검증
    const canSubmit = selectedReason && !isSubmitting;

    return (
        <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
            <ModalContainer>
                <ModalHeader>
                    <ModalTitle>리뷰 신고하기</ModalTitle>
                    <ModalSubtitle>
                        {reviewAuthor ? `${reviewAuthor}님의 리뷰를` : '이 리뷰를'} 신고하는 이유를 선택해주세요.
                        허위 신고는 제재를 받을 수 있습니다.
                    </ModalSubtitle>
                </ModalHeader>

                <ModalBody>
                    {error && (
                        <ErrorMessage>
                            {error}
                        </ErrorMessage>
                    )}

                    <SectionTitle>신고 사유 *</SectionTitle>
                    <ReasonList>
                        {REPORT_REASONS.map((reason) => (
                            <ReasonOption
                                key={reason.value}
                                $selected={selectedReason === reason.value}
                            >
                                <RadioInput
                                    type="radio"
                                    name="reportReason"
                                    value={reason.value}
                                    checked={selectedReason === reason.value}
                                    onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                                    disabled={isSubmitting}
                                />
                                <ReasonContent>
                                    <ReasonLabel>{reason.label}</ReasonLabel>
                                    <ReasonDescription>{reason.description}</ReasonDescription>
                                </ReasonContent>
                            </ReasonOption>
                        ))}
                    </ReasonList>

                    <DescriptionSection>
                        <SectionTitle>상세 설명 (선택사항)</SectionTitle>
                        <TextArea
                            placeholder="신고 사유에 대한 구체적인 설명을 입력해주세요. (선택사항)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            disabled={isSubmitting}
                        />
                        <CharacterCount>
                            {description.length}/500자
                        </CharacterCount>
                    </DescriptionSection>
                </ModalBody>

                <ModalFooter>
                    <Button
                        type="button"
                        $variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        취소
                    </Button>
                    <Button
                        type="button"
                        $variant="primary"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner /> 신고 접수 중...
                            </>
                        ) : (
                            '신고하기'
                        )}
                    </Button>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// =============== 사용 예시 (개발 참고용) ===============

/**
 * 사용 예시:
 *
 * const [isReportModalOpen, setIsReportModalOpen] = useState(false);
 * const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);
 *
 * const handleOpenReportModal = (reviewId: number) => {
 *     setReportingReviewId(reviewId);
 *     setIsReportModalOpen(true);
 * };
 *
 * const handleReportSuccess = () => {
 *     alert('신고가 접수되었습니다.');
 *     // 필요시 리뷰 목록 새로고침 등 추가 로직
 * };
 *
 * <ReviewReportModal
 *     isOpen={isReportModalOpen}
 *     reviewId={reportingReviewId || 0}
 *     reviewAuthor="홍길동"
 *     onClose={() => setIsReportModalOpen(false)}
 *     onSuccess={handleReportSuccess}
 * />
 */