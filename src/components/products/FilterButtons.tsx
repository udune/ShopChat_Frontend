/**
 * 상품 필터 및 정렬 버튼 컴포넌트
 *
 * 기능:
 * - 상품 목록 페이지에서 다양한 필터링 및 정렬 옵션 제공
 * - 정렬: 최신순, 인기순, 가격순, 할인순
 * - 필터: 재고 있는 상품만, 할인 상품만, 성별, 가격 범위, 스토어
 * - 현재 선택된 필터의 시각적 상태 관리
 * - 필터 변경 시 콜백 함수를 통한 상태 업데이트
 *
 * 제공 기능:
 * - 활성 필터에 대한 시각적 피드백
 * - 깔끔하고 직관적인 레이아웃
 * - 반응형 버튼 배치
 * - 드롭다운 및 범위 선택 UI
 *
 * 사용되는 곳:
 * - Lists.tsx (상품 목록 페이지)
 */

import React, { useState, useEffect, useCallback } from "react";
import { CategoryService } from "../../api/categoryService";
import { StoreService } from "../../api/storeService";
import { Category, Store } from "types/products";
import {
  FilterSection,
  FilterButton,
} from "../../pages/products/Lists.styles";
import {
  FilterContainer,
  FilterRow,
  FilterGroup,
  FilterLabel,
  FilterDropdown,
  FilterInput,
  PriceRangeContainer,
  ClearButton,
  ClearButtonContainer,
} from "./FilterButtons.styles";

// 디바운싱을 위한 커스텀 훅
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface FilterButtonsProps {
  activeSort: string;
  onSortChange: (sort: string) => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export interface ProductFilters {
  sort: string;
  categoryId?: number;
  inStockOnly?: boolean;
  discountedOnly?: boolean;
  genders?: string[];
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  storeId?: number;
}

// 색상 옵션 (API 명세서 기준: ProductListFiltering.md 참조)
const COLOR_OPTIONS = [
  { value: "WHITE", label: "화이트" },
  { value: "SILVER", label: "실버" },
  { value: "LIGHT_GRAY", label: "연한 회색" },
  { value: "GRAY", label: "회색" },
  { value: "DARK_GRAY", label: "진한 회색" },
  { value: "BLACK", label: "블랙" },
  { value: "RED", label: "레드" },
  { value: "DEEP_RED", label: "진한 빨간색" },
  { value: "BURGUNDY", label: "버건디" },
  { value: "PALE_PINK", label: "연한 핑크" },
  { value: "LIGHT_PINK", label: "밝은 핑크" },
  { value: "PINK", label: "핑크" },
  { value: "DARK_PINK", label: "진한 핑크" },
  { value: "PEACH", label: "피치" },
  { value: "LIGHT_ORANGE", label: "밝은 오렌지" },
  { value: "ORANGE", label: "오렌지" },
  { value: "DARK_ORANGE", label: "진한 오렌지" },
  { value: "IVORY", label: "아이보리" },
  { value: "LIGHT_YELLOW", label: "밝은 노란색" },
  { value: "YELLOW", label: "노란색" },
  { value: "MUSTARD", label: "머스타드" },
  { value: "GOLD", label: "골드" },
  { value: "LIME", label: "라임" },
  { value: "LIGHT_GREEN", label: "밝은 초록" },
  { value: "GREEN", label: "초록색" },
  { value: "OLIVE_GREEN", label: "올리브 그린" },
  { value: "KHAKI", label: "카키" },
  { value: "DARK_GREEN", label: "진한 초록" },
  { value: "MINT", label: "민트" },
  { value: "SKY_BLUE", label: "하늘색" },
  { value: "BLUE", label: "블루" },
  { value: "DARK_BLUE", label: "진한 블루" },
  { value: "NAVY", label: "네이비" },
  { value: "DARK_NAVY", label: "진한 네이비" },
  { value: "LAVENDER", label: "라벤더" },
  { value: "PURPLE", label: "퍼플" },
  { value: "LIGHT_BROWN", label: "밝은 브라운" },
  { value: "BROWN", label: "브라운" },
  { value: "DARK_BROWN", label: "진한 브라운" },
  { value: "SAND", label: "샌드" },
  { value: "BEIGE", label: "베이지" },
  { value: "DARK_BEIGE", label: "진한 베이지" },
  { value: "KHAKI_BEIGE", label: "카키 베이지" },
  { value: "OTHER_COLORS", label: "기타 색상" },
];

// 사이즈 옵션 (API 명세에 따른)
const SIZE_OPTIONS = [
  "230", "235", "240", "245", "250", "255", "260", "265", "270", "275", "280", "285", "290", "295", "300"
];

// 성별 옵션
const GENDER_OPTIONS = [
  { value: "MEN", label: "남성" },
  { value: "WOMEN", label: "여성" },
  { value: "UNISEX", label: "공용" },
];

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeSort,
  onSortChange,
  filters,
  onFiltersChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 가격 입력 로컬 상태 (디바운싱을 위해)
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice?.toString() || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice?.toString() || "");
  
  // 디바운싱된 가격 값
  const debouncedMinPrice = useDebounce(localMinPrice, 500);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 500);

  useEffect(() => {
    const loadFilterData = async () => {
      setLoading(true);
      try {
        const [categoriesData, storesData] = await Promise.all([
          CategoryService.getCategories(),
          StoreService.getStores(),
        ]);
        setCategories(categoriesData);
        setStores(storesData);
      } catch (error) {
        console.error("필터 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, []);

  // 디바운싱된 가격이 변경될 때만 필터 업데이트
  useEffect(() => {
    const minPrice = debouncedMinPrice ? parseInt(debouncedMinPrice) : undefined;
    const maxPrice = debouncedMaxPrice ? parseInt(debouncedMaxPrice) : undefined;
    
    if (minPrice !== filters.minPrice || maxPrice !== filters.maxPrice) {
      onFiltersChange({
        ...filters,
        minPrice,
        maxPrice,
      });
    }
  }, [debouncedMinPrice, debouncedMaxPrice]);

  // 필터가 외부에서 변경될 때 로컬 상태 동기화
  useEffect(() => {
    setLocalMinPrice(filters.minPrice?.toString() || "");
    setLocalMaxPrice(filters.maxPrice?.toString() || "");
  }, [filters.minPrice, filters.maxPrice]);

  const handleFilterChange = useCallback((key: keyof ProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    const resetFilters: ProductFilters = {
      sort: 'latest',
    };
    // 즉시 필터 상태를 리셋하고 API 호출
    onFiltersChange(resetFilters);
    onSortChange('latest');
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'sort' && filters[key as keyof ProductFilters] !== undefined
  );

  return (
    <FilterContainer>
      {/* 정렬 버튼들 */}
      <FilterRow>
        <FilterGroup>
          <FilterLabel>정렬</FilterLabel>
          <FilterSection>
            <FilterButton
              $active={activeSort === "latest"}
              onClick={() => onSortChange("latest")}
            >
              최신순
            </FilterButton>
            <FilterButton
              $active={activeSort === "popular"}
              onClick={() => onSortChange("popular")}
            >
              인기순
            </FilterButton>
            <FilterButton
              $active={activeSort === "price_asc"}
              onClick={() => onSortChange("price_asc")}
            >
              가격 낮은순
            </FilterButton>
            <FilterButton
              $active={activeSort === "price_desc"}
              onClick={() => onSortChange("price_desc")}
            >
              가격 높은순
            </FilterButton>
            <FilterButton
              $active={activeSort === "discount_desc"}
              onClick={() => onSortChange("discount_desc")}
            >
              할인율순
            </FilterButton>
          </FilterSection>
        </FilterGroup>
      </FilterRow>

      {/* 기본 필터 옵션들 */}
      <FilterRow>
        <FilterGroup>
          <FilterLabel>카테고리</FilterLabel>
          <FilterDropdown
            value={filters.categoryId?.toString() || ""}
            $hasValue={!!filters.categoryId}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('categoryId', value ? parseInt(value) : undefined);
            }}
            disabled={loading}
          >
            <option value="">전체 카테고리</option>
            {categories.map(category => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </FilterDropdown>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>스토어</FilterLabel>
          <FilterDropdown
            value={filters.storeId?.toString() || ""}
            $hasValue={!!filters.storeId}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('storeId', value ? parseInt(value) : undefined);
            }}
            disabled={loading}
          >
            <option value="">전체 스토어</option>
            {stores.map(store => (
              <option key={store.storeId} value={store.storeId}>
                {store.storeName}
              </option>
            ))}
          </FilterDropdown>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>성별</FilterLabel>
          <FilterDropdown
            value={filters.genders?.[0] || ""}
            $hasValue={!!(filters.genders && filters.genders.length > 0)}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('genders', value ? [value] : undefined);
            }}
          >
            <option value="">전체</option>
            {GENDER_OPTIONS.map(gender => (
              <option key={gender.value} value={gender.value}>
                {gender.label}
              </option>
            ))}
          </FilterDropdown>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>상품 상태</FilterLabel>
          <FilterSection>
            <FilterButton
              $active={filters.inStockOnly === true}
              onClick={() => handleFilterChange('inStockOnly', filters.inStockOnly ? undefined : true)}
            >
              재고 있음
            </FilterButton>
            <FilterButton
              $active={filters.discountedOnly === true}
              onClick={() => handleFilterChange('discountedOnly', filters.discountedOnly ? undefined : true)}
            >
              할인 상품
            </FilterButton>
          </FilterSection>
        </FilterGroup>
      </FilterRow>

      {/* 상세 필터 및 초기화 */}
      <FilterRow>
        <FilterGroup>
          <FilterLabel>가격 범위</FilterLabel>
          <PriceRangeContainer>
            <FilterInput
              type="number"
              placeholder="최소 가격"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
            />
            <span>~</span>
            <FilterInput
              type="number"
              placeholder="최대 가격"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
            />
          </PriceRangeContainer>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>색상</FilterLabel>
          <FilterDropdown
            value={filters.colors?.[0] || ""}
            $hasValue={!!(filters.colors && filters.colors.length > 0)}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('colors', value ? [value] : undefined);
            }}
          >
            <option value="">전체 색상</option>
            {COLOR_OPTIONS.map(color => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </FilterDropdown>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>사이즈</FilterLabel>
          <FilterDropdown
            value={filters.sizes?.[0] || ""}
            $hasValue={!!(filters.sizes && filters.sizes.length > 0)}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('sizes', value ? [value] : undefined);
            }}
          >
            <option value="">전체 사이즈</option>
            {SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </FilterDropdown>
        </FilterGroup>

        {hasActiveFilters && (
          <ClearButtonContainer>
            <ClearButton onClick={clearAllFilters}>
              필터 초기화
            </ClearButton>
          </ClearButtonContainer>
        )}
      </FilterRow>
    </FilterContainer>
  );
};
