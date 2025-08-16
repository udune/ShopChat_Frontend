/**
 * ProductCard 컴포넌트
 *
 * 필수적인 상품 정보를 간결하고 시각적으로 매력적인 형태로 표시하는
 * 포괄적인 상품 카드 컴포넌트입니다. 이 카드는 목록 보기에서 주요 상품 표현 역할을 하며,
 * 사용자에게 상품 발견과 선택 결정에 필요한 핵심 세부 정보를 제공합니다.
 *
 * 주요 기능:
 * - 오류 처리가 있는 상품 이미지 (로드 실패 시 숨김)
 * - 상품명과 스토어 정보
 * - 할인 및 원가 비교가 있는 가격 표시
 * - 하트 아이콘이 있는 위시리스트 수
 * - 상품 상세 페이지로의 클릭 가능한 네비게이션
 * - 일관된 간격이 있는 반응형 디자인
 *
 * 사용 위치:
 * - 상품 목록 그리드 (ProductGrid.tsx)
 * - 검색 결과 표시
 * - 카테고리 필터링된 상품 보기
 * - 홈페이지 상품 추천
 *
 * UX 고려사항:
 * - 카드 디자인으로 쉬운 스캔과 비교 촉진
 * - 가격 정보 계층 구조로 구매 결정 안내
 * - 위시리스트 표시기로 소셜 증명 제공
 * - 오류 처리로 깨진 이미지에서도 레이아웃 안정성 보장
 * - 호버 상태로 상호작용 피드백 제공
 */

import React from "react"; // 컴포넌트 생성을 위한 핵심 React 라이브러리
import { ProductListItem } from "types/products"; // 상품 목록 항목 데이터 구조를 위한 TypeScript 인터페이스
import { toUrl } from "../../utils/common/images"; // 이미지 경로를 전체 URL로 변환하는 유틸리티 함수
import { WishlistButton } from "./WishlistButton"; // 인터랙티브한 찜하기 버튼 컴포넌트
import {
  ProductCard as StyledProductCard,
  ProductImage,
  ProductInfo,
  ProductName,
  ProductStore,
  PriceSection,
  DiscountPrice,
  OriginalPrice,
} from "../../pages/products/Lists.styles"; // 상품 카드 UI 요소를 위한 스타일된 컴포넌트

/**
 * ProductCard 컴포넌트의 Props 인터페이스
 *
 * @interface ProductCardProps
 * @property {ProductListItem} product - 모든 필요한 표시 정보를 포함하는 상품 데이터 객체
 * @property {function} formatPrice - 적절한 현지화와 통화 기호로 가격 숫자를 포맷하는 함수
 */
interface ProductCardProps {
  product: ProductListItem;
  formatPrice: (price: number) => string;
}

/**
 * ProductCard 함수형 컴포넌트
 *
 * 이미지, 세부 정보, 가격 정보가 포함된 포괄적인 상품 카드를 렌더링합니다.
 * 전체 카드는 클릭 가능하며 상품 상세 페이지로 이동합니다. 이미지 로딩 오류를
 * 우아하게 처리하고 적용 가능한 경우 할인 정보를 표시합니다.
 *
 * @param {ProductCardProps} props - 컴포넌트 props
 * @returns {JSX.Element} 네비게이션 링크가 있는 렌더링된 상품 카드
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  formatPrice,
}) => {
  return (
    <StyledProductCard to={`/products/${product.productId}`}>
      {/* 오류 처리가 있는 상품 메인 이미지 */}
      <ProductImage
        src={toUrl(product.mainImageUrl)} // 상대 경로를 전체 URL로 변환
        alt={product.name} // 상품명을 사용한 접근 가능한 alt 텍스트
        onError={(e) => {
          // 로드에 실패하면 이미지를 완전히 숨겨 카드 레이아웃 유지
          e.currentTarget.style.visibility = "hidden";
        }}
      />

      {/* 상품 정보 섹션 */}
      <ProductInfo>
        {/* 상품명 - 사용자를 위한 주요 식별자 */}
        <ProductName>{product.name}</ProductName>

        {/* 스토어명 - 브랜드/판매자 컨텍스트 제공 */}
        <ProductStore>{product.storeName}</ProductStore>

        {/* 할인 및 원가 표시가 있는 가격 섹션 */}
        <PriceSection>
          {/* 현재/할인된 가격 - 가장 눈에 띄는 가격 표시 */}
          <DiscountPrice>{formatPrice(product.discountPrice)}원</DiscountPrice>

          {/* 원가 - 할인이 있을 때만 표시하여 절약 효과 강조 */}
          {product.price !== product.discountPrice && (
            <OriginalPrice>{formatPrice(product.price)}원</OriginalPrice>
          )}
        </PriceSection>

        {/* 위시리스트 버튼 - 인터랙티브한 찜하기 기능과 소셜 증명 표시 */}
        <WishlistButton
          productId={product.productId}
          wishCount={product.wishNumber}
          size="small"
          showCount={true}
        />
      </ProductInfo>
    </StyledProductCard>
  );
};
