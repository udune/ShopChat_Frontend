/**
 * CategoryModal 컴포넌트 (최종 업데이트 버전)
 *
 * 프로젝트의 기존 서비스 패턴과 스타일에 완벽히 맞춰 구현된
 * 카테고리 선택 모달 컴포넌트입니다.
 *
 * 주요 특징:
 * - CategoryService 클래스의 정적 메서드 사용
 * - 프로젝트의 다크 테마와 오렌지 그라데이션 스타일 적용
 * - 기존 API 응답 구조 (ApiResponse<T>) 호환
 * - 에러 처리 및 fallback 기능 완비
 * - 반응형 디자인 및 접근성 고려
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { CategoryService } from "../../api/categoryService";
import {
  Category,
  CategoryFilterParams,
  CategoryModalProps,
} from "../../types/products";

// 애니메이션 정의 (기존 프로젝트 스타일 따름)
const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * CategoryModal 함수형 컴포넌트
 *
 * CategoryService의 정적 메서드를 사용하여 카테고리 데이터를 관리하고,
 * 프로젝트의 기존 스타일 패턴을 따라 구현된 모달 컴포넌트입니다.
 */
const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onCategorySelect,
}) => {
  const navigate = useNavigate();

  // 컴포넌트 상태 관리
  const [categories, setCategories] = useState<Category[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 모달이 열릴 때 카테고리 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  /**
   * 카테고리 목록을 불러오는 함수
   * CategoryService.getCategories() 정적 메서드 사용
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      // CategoryService의 정적 메서드 호출
      const categoryList = await CategoryService.getCategories();
      setCategories(categoryList);
    } catch (error: any) {
      setError(error.message || "카테고리를 불러오는 중 오류가 발생했습니다.");

      // 에러 발생 시에도 기본 카테고리 표시
      const defaultCategories = CategoryService.DEFAULT_CATEGORIES;
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 카테고리 선택 핸들러
   * API 명세서에 맞춰 /api/products 엔드포인트로 필터링 요청
   */
  const handleCategorySelect = async (category: Category) => {
    // 필터 파라미터 생성 (API 명세서 기준)
    const filterParams: CategoryFilterParams = {
      categoryId: category.categoryId,
      minPrice,
      maxPrice,
      page: 0,
      size: 9,
      sort: "latest" // 기본 정렬은 최신순
    };

    // CategoryService를 통해 필터 URL 생성
    const filterUrl = CategoryService.generateFilterUrl(filterParams);

    // 부모 컴포넌트에 선택된 카테고리 전달 (있는 경우)
    if (onCategorySelect) {
      onCategorySelect(category);
    }

    // 모달 닫기
    onClose();

    // 생성된 URL로 페이지 이동
    navigate(filterUrl);
  };

  /**
   * 최소 가격 변경 핸들러
   */
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMinPrice(value);
    if (value > maxPrice) {
      setMaxPrice(value);
    }
  };

  /**
   * 최대 가격 변경 핸들러
   */
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMaxPrice(value);
    if (value < minPrice) {
      setMinPrice(value);
    }
  };

  /**
   * 가격 포맷팅 함수
   */
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <ModalHeader>
          <ModalTitle>카테고리</ModalTitle>
          <HeaderActions>
            <CloseButton onClick={onClose}>
              <i className="fas fa-times"></i>
            </CloseButton>
          </HeaderActions>
        </ModalHeader>

        <ModalBody>
          {/* 에러 메시지 표시 */}
          {error && (
            <ErrorMessage>
              <i
                className="fas fa-exclamation-triangle"
                style={{ marginRight: "8px" }}
              ></i>
              {error}
            </ErrorMessage>
          )}

          {/* 카테고리 선택 섹션 */}
          <Section>
            {loading ? (
              <LoadingText>
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ marginRight: "8px" }}
                ></i>
                카테고리를 불러오는 중...
              </LoadingText>
            ) : (
              <CategoryGrid>
                {categories.map((category) => (
                  <CategoryItem
                    key={category.categoryId}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <CategoryIcon>
                      <i className="fas fa-shoe-prints"></i>
                    </CategoryIcon>
                    <CategoryText>
                      <CategoryName>{category.type}</CategoryName>
                      <CategoryDisplayName>{category.name}</CategoryDisplayName>
                    </CategoryText>
                  </CategoryItem>
                ))}
              </CategoryGrid>
            )}
          </Section>

          {/* 가격 필터 섹션 */}
          <Section>
            <SectionTitle>가격 범위</SectionTitle>
            <PriceFilterContainer>
              <PriceInputs>
                <PriceInputGroup>
                  <PriceLabel>최소 가격</PriceLabel>
                  <PriceSlider
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                  />
                  <PriceValue>{formatPrice(minPrice)}원</PriceValue>
                </PriceInputGroup>

                <PriceInputGroup>
                  <PriceLabel>최대 가격</PriceLabel>
                  <PriceSlider
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                  />
                  <PriceValue>{formatPrice(maxPrice)}원</PriceValue>
                </PriceInputGroup>
              </PriceInputs>

              <PriceRangeDisplay>
                {formatPrice(minPrice)}원 - {formatPrice(maxPrice)}원
              </PriceRangeDisplay>
            </PriceFilterContainer>
          </Section>
        </ModalBody>

        {/* 모달 푸터 */}
        <ModalFooter>
          <InstructionText>
            원하는 카테고리를 선택하면 해당 상품들을 확인할 수 있습니다.
          </InstructionText>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

// 스타일드 컴포넌트들 (프로젝트의 다크 테마 스타일 적용)

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 60; /* 헤더(z-index: 40)보다 높게 설정 */
  padding: 20px;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;

  /* 프로젝트 스타일의 그라데이션 배경 효과 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 20%,
        rgba(249, 115, 22, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 80%,
        rgba(239, 68, 68, 0.05) 0%,
        transparent 50%
      );
    pointer-events: none;
    border-radius: 16px;
  }

  @media (max-width: 768px) {
    margin: 10px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(249, 115, 22, 0.2);
  position: relative;
  z-index: 2;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff, #fef3c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PopularButton = styled.button`
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ea580c, #dc2626);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  &:hover {
    background: rgba(249, 115, 22, 0.2);
    color: white;
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  padding: 24px 28px;
  position: relative;
  z-index: 2;
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
`;

const Section = styled.div`
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
`;

const CategoryItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid rgba(249, 115, 22, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(249, 115, 22, 0.2),
      transparent
    );
    transition: left 0.3s ease;
  }

  &:hover {
    border-color: rgba(249, 115, 22, 0.6);
    background: rgba(249, 115, 22, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);

    &::before {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    padding: 16px 12px;
  }
`;

const CategoryIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  color: rgba(249, 115, 22, 0.8);
  transition: all 0.3s ease;

  ${CategoryItem}:hover & {
    color: #f97316;
    transform: scale(1.1);
  }
`;

const CategoryText = styled.div`
  line-height: 1.4;
`;

const CategoryName = styled.div`
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.6);
`;

const CategoryDisplayName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
`;

const CategoryCount = styled.div`
  font-size: 11px;
  color: rgba(249, 115, 22, 0.8);
  font-weight: 500;
`;

const PriceFilterContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(249, 115, 22, 0.2);
  padding: 24px;
  border-radius: 12px;
`;

const PriceInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const PriceInputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const PriceLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
`;

const PriceSlider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  margin-bottom: 12px;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 4px 8px rgba(249, 115, 22, 0.4);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 4px 8px rgba(249, 115, 22, 0.4);
  }
`;

const PriceValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const PriceRangeDisplay = styled.div`
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #f97316;
  padding: 16px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const ModalFooter = styled.div`
  padding: 16px 28px 24px;
  text-align: center;
  border-top: 1px solid rgba(249, 115, 22, 0.1);
  position: relative;
  z-index: 2;
`;

const InstructionText = styled.p`
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

export default CategoryModal;
