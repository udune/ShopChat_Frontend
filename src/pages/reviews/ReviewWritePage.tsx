/**
 * 리뷰 작성 페이지
 *
 * 사용자가 구매한 상품에 대한 리뷰를 작성할 수 있는 페이지입니다.
 * 별점, 내용, 3요소 평가, 이미지 업로드 기능을 제공합니다.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import styled from "styled-components";
import { StarRating } from "../../components/review/StarRating";
import { useReviewActions } from "../../hooks/review/useReviewActions";
import ReviewService from "../../api/reviewService";
import { validateReviewTitle, validateReviewContent, validateRating, validateImages, getEvaluationLabel } from "../../utils/review/reviewHelpers";

// =============== 타입 정의 ===============

interface ProductInfo {
    productId: number;
    name: string;
    brandName: string;
    thumbnailUrl: string;
}

interface ReviewFormData {
    title: string;
    rating: number;
    content: string;
    sizeFit?: number;
    cushion?: number;
    stability?: number;
    images: File[];
}

interface FormErrors {
    title?: string;
    rating?: string;
    content?: string;
    images?: string;
}

// =============== 스타일 컴포넌트 ===============

const PageContainer = styled.div`
    min-height: 100vh;
    background: #fafafa;
    padding: 20px 0;
`;

const Container = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;

    @media (max-width: 768px) {
        padding: 0 16px;
    }
`;

const Header = styled.div`
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 12px;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    margin-bottom: 16px;
    transition: all 0.2s ease;

    &:hover {
        background: #f9fafb;
        border-color: #9ca3af;
    }
`;

const PageTitle = styled.h1`
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;

    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const ProductSection = styled.div`
    display: flex;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid #f3f4f6;
    margin-bottom: 24px;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 12px;
    }
`;

const ProductImage = styled.img`
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;

    &:hover {
        transform: scale(1.05);
    }

    @media (max-width: 768px) {
        width: 80px;
        height: 80px;
    }
`;

const ProductInfo = styled.div`
    flex: 1;
`;

const ProductName = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px 0;
`;

const ProductBrand = styled.p`
    font-size: 14px;
    color: #6b7280;
    margin: 0;
`;

const FormContainer = styled.form`
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormSection = styled.div`
    margin-bottom: 32px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 16px 0;
`;

const FormField = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
    width: 100%;
    padding: 12px;
    border: 1px solid ${props => props.$hasError ? '#dc2626' : '#d1d5db'};
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? '#dc2626' : '#2563eb'};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
    }

    &::placeholder {
        color: #9ca3af;
    }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid ${props => props.$hasError ? '#dc2626' : '#d1d5db'};
    border-radius: 8px;
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? '#dc2626' : '#2563eb'};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
    }

    &::placeholder {
        color: #9ca3af;
    }
`;

const CharacterCount = styled.div`
    text-align: right;
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
`;

const EvaluationGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 12px;
    }
`;

const EvaluationItem = styled.div`
    text-align: center;
`;

const EvaluationButtons = styled.div`
    display: flex;
    gap: 4px;
    justify-content: center;
    margin-top: 8px;
`;

const EvaluationButton = styled.button<{ $active: boolean }>`
    padding: 8px 12px;
    border: 1px solid ${props => props.$active ? '#2563eb' : '#d1d5db'};
    border-radius: 6px;
    background: ${props => props.$active ? '#2563eb' : 'white'};
    color: ${props => props.$active ? 'white' : '#374151'};
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #2563eb;
        background: ${props => props.$active ? '#1d4ed8' : '#eff6ff'};
    }
`;

const ImageUploadSection = styled.div`
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    transition: border-color 0.2s ease;

    &:hover {
        border-color: #9ca3af;
    }
`;

const ImageInput = styled.input`
    display: none;
`;

const ImageUploadButton = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: #1d4ed8;
    }
`;

const ImagePreviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    margin-top: 16px;
`;

const ImagePreview = styled.div`
    position: relative;
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
`;

const PreviewImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const RemoveImageButton = styled.button`
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ErrorMessage = styled.div`
    color: #dc2626;
    font-size: 13px;
    margin-top: 4px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 32px;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;

    ${props => props.$variant === 'primary' ? `
    background: #2563eb;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  `}

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
`;

// =============== 메인 컴포넌트 ===============

export const ReviewWritePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // URL에서 productId 가져오기
    const productId = parseInt(searchParams.get('productId') || '0');

    // 상태 관리
    const [product, setProduct] = useState<ProductInfo | null>(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const [formData, setFormData] = useState<ReviewFormData>({
        title: '',
        rating: 0,
        content: '',
        sizeFit: undefined,
        cushion: undefined,
        stability: undefined,
        images: [],
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // 리뷰 액션 훅
    const { createReview, isSubmitting } = useReviewActions({
        onSuccess: (message) => {
            alert(message);
            
            // localStorage에 리뷰 작성 완료 플래그 설정 (추가 안전장치)
            localStorage.setItem('reviewCreated', 'true');
            localStorage.setItem('reviewProductId', productId.toString());
            
            // 리뷰 작성 후 상품 상세 페이지로 이동하며 새로고침 플래그 전달
            navigate(`/products/${productId}`, {
                state: {
                    refreshReviews: true, // 새로고침 플래그
                    scrollToReviews: true // 리뷰 섹션으로 스크롤
                }
            });
        },
        onError: (message) => {
            alert(message);
        },
    });

    // =============== 상품 정보 로딩 ===============

    useEffect(() => {
        const loadProduct = async () => {
            if (!productId || productId <= 0) {
                alert('올바르지 않은 상품 정보입니다.');
                navigate(-1);
                return;
            }

            try {
                setIsLoadingProduct(true);
                const productData = await ReviewService.getProductInfo(productId);
                setProduct({
                    productId: productData.productId,
                    name: productData.name,
                    brandName: productData.brandName,
                    thumbnailUrl: productData.thumbnailUrl,
                });
            } catch (error) {
                console.error('상품 정보 로딩 실패:', error);
                alert('상품 정보를 불러올 수 없습니다.');
                navigate(-1);
            } finally {
                setIsLoadingProduct(false);
            }
        };

        loadProduct();
    }, [productId, navigate]);

    // =============== 폼 핸들러들 ===============

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({ ...prev, title }));
        if (errors.title) {
            setErrors(prev => ({ ...prev, title: undefined }));
        }
    };

    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: undefined }));
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const content = e.target.value;
        setFormData(prev => ({ ...prev, content }));
        if (errors.content) {
            setErrors(prev => ({ ...prev, content: undefined }));
        }
    };

    const handleEvaluationChange = (
        type: 'sizeFit' | 'cushion' | 'stability',
        value: number
    ) => {
        setFormData(prev => ({ ...prev, [type]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // 유효성 검사
        const imageError = validateImages(files);
        if (imageError) {
            setErrors(prev => ({ ...prev, images: imageError }));
            return;
        }

        setFormData(prev => ({ ...prev, images: files }));
        setErrors(prev => ({ ...prev, images: undefined }));

        // 미리보기 생성
        const previews = files.map(file => URL.createObjectURL(file));

        // 기존 미리보기 정리
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews(previews);
    };

    const handleRemoveImage = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        // 제거된 미리보기 URL 정리
        URL.revokeObjectURL(imagePreviews[index]);

        setFormData(prev => ({ ...prev, images: newImages }));
        setImagePreviews(newPreviews);
    };

    // =============== 폼 제출 ===============

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. 먼저 구매이력 검증
        try {
            const hasPurchased = await ReviewService.checkPurchaseHistory(productId);
            if (!hasPurchased) {
                alert('이 상품을 구매한 후에만 리뷰를 작성할 수 있습니다.');
                return;
            }
        } catch (error) {
            console.error('구매이력 검증 실패:', error);
            alert('구매이력을 확인하는 중 오류가 발생했습니다.');
            return;
        }

        // 2. 유효성 검사
        const newErrors: FormErrors = {};

        // 제목 유효성 검사
        const titleError = validateReviewTitle(formData.title);
        if (titleError) newErrors.title = titleError;

        const ratingError = validateRating(formData.rating);
        if (ratingError) newErrors.rating = ratingError;

        const contentError = validateReviewContent(formData.content);
        if (contentError) newErrors.content = contentError;

        if (formData.images.length > 0) {
            const imageError = validateImages(formData.images);
            if (imageError) newErrors.images = imageError;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 3. 리뷰 생성 요청
        try {
            await createReview({
                productId,
                title: formData.title.trim(),
                rating: formData.rating,
                content: formData.content,
                sizeFit: formData.sizeFit,
                cushion: formData.cushion,
                stability: formData.stability,
            }, formData.images);
        } catch (error) {
            // 에러는 useReviewActions에서 처리됨
        }
    };

    // =============== 렌더링 ===============

    if (isLoadingProduct) {
        return (
            <PageContainer>
                <Container>
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div>상품 정보를 불러오는 중...</div>
                    </div>
                </Container>
            </PageContainer>
        );
    }

    if (!product) {
        return (
            <PageContainer>
                <Container>
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div>상품 정보를 찾을 수 없습니다.</div>
                    </div>
                </Container>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Container>
                {/* 헤더 */}
                <Header>
                    <BackButton onClick={() => navigate(-1)} type="button">
                        <span>←</span> 뒤로
                    </BackButton>
                    <PageTitle>리뷰 작성</PageTitle>

                    {/* 상품 정보 */}
                    <ProductSection>
                        <ProductImage 
                            src={product.thumbnailUrl} 
                            alt={product.name}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder-product.png'; // fallback 이미지
                            }}
                        />
                        <ProductInfo>
                            <ProductName>{product.name}</ProductName>
                            <ProductBrand>{product.brandName}</ProductBrand>
                        </ProductInfo>
                    </ProductSection>
                </Header>

                {/* 리뷰 작성 폼 */}
                <FormContainer onSubmit={handleSubmit}>
                    {/* 별점 */}
                    <FormSection>
                        <SectionTitle>전체 만족도 *</SectionTitle>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <StarRating
                                rating={formData.rating}
                                size="large"
                                onChange={handleRatingChange}
                            />
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>
                {formData.rating > 0 ? `${formData.rating}점` : '별점을 선택해주세요'}
              </span>
                        </div>
                        {errors.rating && <ErrorMessage>{errors.rating}</ErrorMessage>}
                    </FormSection>

                    {/* 리뷰 제목 */}
                    <FormSection>
                        <FormField>
                            <Label htmlFor="title">리뷰 제목 *</Label>
                            <Input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="리뷰 제목을 입력해주세요 (5-100자)"
                                maxLength={100}
                                $hasError={!!errors.title}
                            />
                            <CharacterCount>
                                {formData.title.length} / 100자
                            </CharacterCount>
                            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
                        </FormField>
                    </FormSection>

                    {/* 리뷰 내용 */}
                    <FormSection>
                        <FormField>
                            <Label htmlFor="content">리뷰 내용 *</Label>
                            <TextArea
                                id="content"
                                value={formData.content}
                                onChange={handleContentChange}
                                placeholder="상품에 대한 솔직한 리뷰를 작성해주세요. (최소 10자 이상)"
                                $hasError={!!errors.content}
                            />
                            <CharacterCount>
                                {formData.content.length} / 2000자
                            </CharacterCount>
                            {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
                        </FormField>
                    </FormSection>

                    {/* 3요소 평가 */}
                    <FormSection>
                        <SectionTitle>상품 평가</SectionTitle>
                        <EvaluationGrid>
                            {(['sizeFit', 'cushion', 'stability'] as const).map(type => (
                                <EvaluationItem key={type}>
                                    <Label>{getEvaluationLabel(type)}</Label>
                                    <EvaluationButtons>
                                        {[1, 2, 3].map(value => (
                                            <EvaluationButton
                                                key={value}
                                                type="button"
                                                $active={formData[type] === value}
                                                onClick={() => handleEvaluationChange(type, value)}
                                            >
                                                {type === 'sizeFit' && ['작음', '적당', '큼'][value - 1]}
                                                {type === 'cushion' && ['부드러움', '적당', '딱딱함'][value - 1]}
                                                {type === 'stability' && ['낮음', '보통', '높음'][value - 1]}
                                            </EvaluationButton>
                                        ))}
                                    </EvaluationButtons>
                                </EvaluationItem>
                            ))}
                        </EvaluationGrid>
                    </FormSection>

                    {/* 이미지 업로드 */}
                    <FormSection>
                        <SectionTitle>사진 첨부 (선택)</SectionTitle>
                        <ImageUploadSection>
                            <ImageUploadButton htmlFor="images">
                                📷 사진 선택 (최대 5장)
                            </ImageUploadButton>
                            <ImageInput
                                id="images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                                JPG, PNG, WebP 형식 / 파일당 최대 5MB
                            </div>
                        </ImageUploadSection>

                        {imagePreviews.length > 0 && (
                            <ImagePreviewGrid>
                                {imagePreviews.map((preview, index) => (
                                    <ImagePreview key={index}>
                                        <PreviewImage src={preview} alt={`미리보기 ${index + 1}`} />
                                        <RemoveImageButton
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            ×
                                        </RemoveImageButton>
                                    </ImagePreview>
                                ))}
                            </ImagePreviewGrid>
                        )}

                        {errors.images && <ErrorMessage>{errors.images}</ErrorMessage>}
                    </FormSection>

                    {/* 제출 버튼 */}
                    <ButtonGroup>
                        <Button
                            type="button"
                            $variant="secondary"
                            onClick={() => navigate(-1)}
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            $variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '등록 중...' : '리뷰 등록'}
                        </Button>
                    </ButtonGroup>
                </FormContainer>
            </Container>
        </PageContainer>
    );
};

export default ReviewWritePage;