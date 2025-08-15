/**
 * ModernOptionSelector 컴포넌트
 *
 * 성별, 색상, 사이즈를 모던한 UI로 선택할 수 있는 컴포넌트입니다.
 * - 성별: Dropdown 선택
 * - 색상: 색상별 컬러 토글 버튼
 * - 사이즈: Compact한 토글 버튼
 */

import React, { useState } from "react";
import styled from "styled-components";
import { ProductDetail } from "types/products";
import { SelectedOptions } from "../../hooks/products/useProductOptions";

// 스타일 컴포넌트들
const OptionContainer = styled.div`
  margin: 24px 0;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionLabel = styled.label`
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
  display: block;
`;

const SizesSection = styled.div`
  grid-column: 1 / -1;
  
  @media (max-width: 640px) {
    grid-column: 1;
  }
`;

// Dropdown 스타일
const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  min-height: 44px;

  &:hover {
    border-color: #6366f1;
    background: #f9fafb;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const DropdownArrow = styled.span<{ $isOpen: boolean }>`
  transform: rotate(${props => props.$isOpen ? '180deg' : '0deg'});
  transition: transform 0.2s ease;
  color: #6b7280;
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 20;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
  
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled.button<{ $withColor?: string }>`
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
  
  &:first-child {
    border-radius: 6px 6px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`;

const ColorIndicator = styled.div<{ $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => getColorValue(props.$color)};
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
`;

// 사이즈 토글 스타일
const SizeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SizeButton = styled.button<{ $selected: boolean; $soldOut: boolean }>`
  padding: 8px 16px;
  background: ${props => 
    props.$soldOut ? '#f3f4f6' : 
    props.$selected ? '#6366f1' : 'white'
  };
  color: ${props => 
    props.$soldOut ? '#9ca3af' : 
    props.$selected ? 'white' : '#374151'
  };
  border: 1px solid ${props => 
    props.$soldOut ? '#e5e7eb' : 
    props.$selected ? '#6366f1' : '#d1d5db'
  };
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.$soldOut ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  min-width: 60px;
  
  &:hover:not(:disabled) {
    border-color: #6366f1;
    background: ${props => props.$selected ? '#5856eb' : '#f8fafc'};
  }
`;

// 색상 유틸리티 함수들
const getColorValue = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'BLACK': '#000000',
    'WHITE': '#ffffff',
    'RED': '#ef4444',
    'BLUE': '#3b82f6',
    'GREEN': '#10b981',
    'YELLOW': '#f59e0b',
    'PINK': '#ec4899',
    'PURPLE': '#8b5cf6',
    'GRAY': '#6b7280',
    'GREY': '#6b7280',
    'BROWN': '#a3682a',
    'NAVY': '#1e3a8a',
    'BEIGE': '#f5f5dc',
    'ORANGE': '#f97316',
    'IVORY': '#f8f8f0',
    'CREAM': '#fdf5e6',
    'KHAKI': '#bdb76b',
    'OLIVE': '#808000',
    'MAROON': '#800000',
    'SILVER': '#c0c0c0',
    'GOLD': '#ffd700',
    'TURQUOISE': '#40e0d0',
    'CORAL': '#ff7f50',
    'SALMON': '#fa8072',
    'MINT': '#98fb98',
    'LAVENDER': '#e6e6fa',
    'ROSE': '#ffc0cb',
    'BURGUNDY': '#800020',
    'TEAL': '#008080',
  };
  
  return colorMap[colorName.toUpperCase()] || '#6b7280';
};


// Props 인터페이스
interface ModernOptionSelectorProps {
  product: ProductDetail;
  selectedOptions: SelectedOptions[];
  selectedGender: "MEN" | "WOMEN" | "UNISEX" | null;
  selectedColor: string | null;
  onGenderSelect: (gender: "MEN" | "WOMEN" | "UNISEX") => void;
  onColorSelect: (color: string) => void;
  onSizeSelect: (optionId: number) => void;
  getAvailableGenders: () => ("MEN" | "WOMEN" | "UNISEX")[];
  getAvailableColors: () => string[];
  getAvailableSizes: () => Array<{
    optionId: number;
    gender: "MEN" | "WOMEN" | "UNISEX";
    size: string;
    color: string;
    stock: number;
    sizeLabel: string;
  }>;
}

const genderLabels: Record<"MEN" | "WOMEN" | "UNISEX", string> = {
  MEN: "남성",
  WOMEN: "여성", 
  UNISEX: "공용"
};

export const ModernOptionSelector: React.FC<ModernOptionSelectorProps> = ({
  product,
  selectedOptions,
  selectedGender,
  selectedColor,
  onGenderSelect,
  onColorSelect,
  onSizeSelect,
  getAvailableGenders,
  getAvailableColors,
  getAvailableSizes,
}) => {
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const genderDropdownRef = React.useRef<HTMLDivElement>(null);
  const colorDropdownRef = React.useRef<HTMLDivElement>(null);
  
  const availableGenders = getAvailableGenders();
  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();

  // 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target as Node)) {
        setIsGenderDropdownOpen(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 성별이 하나만 있으면 자동 선택
  React.useEffect(() => {
    if (availableGenders.length === 1 && !selectedGender) {
      onGenderSelect(availableGenders[0]);
    }
  }, [availableGenders, selectedGender, onGenderSelect]);

  // 색상이 하나만 있으면 자동 선택
  React.useEffect(() => {
    if (selectedGender && availableColors.length === 1 && !selectedColor) {
      onColorSelect(availableColors[0]);
    }
  }, [availableColors, selectedColor, selectedGender, onColorSelect]);

  // 대체 UI (기본 옵션 표시)
  if (availableGenders.length === 0 && product && product.options.length > 0) {
    return (
      <OptionContainer>
        <OptionGroup>
          <OptionLabel>옵션 선택</OptionLabel>
          <SizeGrid>
            {product.options.map((option) => {
              const isSelected = selectedOptions.some(
                (selected) => selected.optionId === option.optionId
              );
              const isSoldOut = option.stock === 0;

              return (
                <SizeButton
                  key={option.optionId}
                  $selected={isSelected}
                  $soldOut={isSoldOut}
                  onClick={() => !isSoldOut && onSizeSelect(option.optionId)}
                  disabled={isSoldOut}
                >
                  {option.gender !== 'UNISEX' && `${option.gender === 'MEN' ? '남성' : '여성'} `}
                  {option.color} {option.size}
                  {isSoldOut && ' (품절)'}
                </SizeButton>
              );
            })}
          </SizeGrid>
        </OptionGroup>
      </OptionContainer>
    );
  }

  return (
    <OptionContainer>
      <OptionsGrid>
        {/* 성별 선택 - Dropdown */}
        {availableGenders.length > 0 && (
          <OptionGroup>
            <OptionLabel>성별</OptionLabel>
            <DropdownContainer ref={genderDropdownRef}>
              <DropdownButton
                onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                type="button"
              >
                <span>{selectedGender ? genderLabels[selectedGender] : '성별을 선택하세요'}</span>
                <DropdownArrow $isOpen={isGenderDropdownOpen}>▼</DropdownArrow>
              </DropdownButton>
              
              <DropdownMenu $isOpen={isGenderDropdownOpen}>
                {availableGenders.map((gender) => (
                  <DropdownItem
                    key={gender}
                    onClick={() => {
                      onGenderSelect(gender);
                      setIsGenderDropdownOpen(false);
                    }}
                    type="button"
                  >
                    {genderLabels[gender]}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </DropdownContainer>
          </OptionGroup>
        )}

        {/* 색상 선택 - Dropdown */}
        {selectedGender && availableColors.length > 0 && (
          <OptionGroup>
            <OptionLabel>색상</OptionLabel>
            <DropdownContainer ref={colorDropdownRef}>
              <DropdownButton
                onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                type="button"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedColor && <ColorIndicator $color={selectedColor} />}
                  <span>{selectedColor || '색상을 선택하세요'}</span>
                </div>
                <DropdownArrow $isOpen={isColorDropdownOpen}>▼</DropdownArrow>
              </DropdownButton>
              
              <DropdownMenu $isOpen={isColorDropdownOpen}>
                {availableColors.map((color) => (
                  <DropdownItem
                    key={color}
                    onClick={() => {
                      onColorSelect(color);
                      setIsColorDropdownOpen(false);
                    }}
                    type="button"
                  >
                    <ColorIndicator $color={color} />
                    {color}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </DropdownContainer>
          </OptionGroup>
        )}
      </OptionsGrid>

      {/* 사이즈 선택 - 컴팩트 토글 */}
      {selectedGender && selectedColor && availableSizes.length > 0 && (
        <SizesSection>
          <OptionLabel>사이즈</OptionLabel>
          <SizeGrid>
            {availableSizes.map((option) => {
              const isSelected = selectedOptions.some(
                (selected) => selected.optionId === option.optionId
              );
              const isSoldOut = option.stock === 0;

              return (
                <SizeButton
                  key={option.optionId}
                  $selected={isSelected}
                  $soldOut={isSoldOut}
                  onClick={() => !isSoldOut && onSizeSelect(option.optionId)}
                  disabled={isSoldOut}
                  type="button"
                >
                  {option.size}
                  {isSoldOut && ' (품절)'}
                </SizeButton>
              );
            })}
          </SizeGrid>
        </SizesSection>
      )}
    </OptionContainer>
  );
};