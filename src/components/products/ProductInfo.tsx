/**
 * ProductInfo 컴포넌트
 *
 * 스토어명, 상품명, 할인 계산이 포함된 포괄적인 가격 세부 정보를 포함한
 * 필수적인 상품 정보를 표시합니다. 이 컴포넌트는 상품 상세 페이지의
 * 주요 정보 헤더 역할을 하며, 구매 결정에 필요한 핵심 세부 정보를
 * 사용자에게 제공합니다.
 *
 * 주요 기능:
 * - 스토어명과 상품명 표시
 * - 동적 할인율 계산 및 표시
 * - 원가 vs 현재 가격 비교
 * - 조건부 할인 배지 및 가격 레이아웃
 * - 한국 통화가 포함된 포맷된 가격 표시
 * - 현재 가격을 강조하는 시각적 계층 구조
 *
 * 사용 위치:
 * - 상품 상세 페이지 (DetailPage.tsx)
 * - 상품 미리보기 모달
 * - 결제 과정 상품 요약
 *
 * UX 고려사항:
 * - 명확한 정보 계층 구조로 사용자 주의 안내
 * - 할인 정보를 눈에 띄게 표시하여 절약 효과 강조
 * - 스토어명으로 브랜드 컨텍스트와 신뢰 제공
 * - 가격 포맷팅으로 애플리케이션 전체의 일관성 유지
 * - 원가와 할인가 간의 시각적 대비
 * - 반응형 디자인으로 다양한 화면 크기에 적응
 */

import React from "react"; // 컴포넌트 생성을 위한 핵심 React 라이브러리
import { ProductDetail } from "types/products"; // 상세 상품 데이터 구조를 위한 TypeScript 인터페이스
import { WishlistButton } from "./WishlistButton"; // 인터랙티브한 찜하기 버튼 컴포넌트
import {
  InfoSection,
  StoreName,
  ProductName,
  PriceSection,
  DiscountInfo,
  DiscountBadge,
  OriginalPrice,
  CurrentPrice,
} from "../../pages/products/DetailPage.styles"; // 상품 정보 UI 요소를 위한 스타일된 컴포넌트

/**
 * ProductInfo 컴포넌트의 Props 인터페이스
 *
 * @interface ProductInfoProps
 * @property {ProductDetail} product - 이름, 스토어, 가격 정보를 포함하는 상세 상품 데이터 객체
 * @property {function} formatPrice - 적절한 현지화와 통화로 가격 숫자를 포맷하는 함수
 * @property {function} getDiscountRate - 할인율을 계산하고 반환하는 함수
 */
interface ProductInfoProps {
  product: ProductDetail;
  formatPrice: (price: number) => string;
  getDiscountRate: () => number;
}

/**
 * ProductInfo 함수형 컴포넌트
 *
 * 스토어명, 상품명, 가격 세부 정보가 있는 주요 상품 정보 섹션을 렌더링합니다.
 * 할인이 사용 가능할 때 조건부로 할인 정보를 표시하며,
 * 원가와 할인가를 모두 보여줍니다.
 *
 * @param {ProductInfoProps} props - 컴포넌트 props
 * @returns {JSX.Element} 가격 세부 정보가 있는 렌더링된 상품 정보 섹션
 */
export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  formatPrice,
  getDiscountRate,
}) => {
  // 제공된 함수를 사용하여 할인율 계산
  const discountRate = getDiscountRate();

  return (
    <InfoSection>
      {/* 스토어명 - 브랜드 컨텍스트 제공 및 신뢰 확립 */}
      <StoreName>{product.storeName}</StoreName>

      {/* 상품명 - 사용자를 위한 주요 상품 식별자 */}
      <ProductName>{product.name}</ProductName>

      {/* 조건부 할인 표시가 있는 가격 섹션 */}
      <PriceSection>
        {/* 할인 정보 - 할인이 사용 가능할 때만 표시 */}
        {discountRate > 0 && (
          <DiscountInfo>
            {/* 할인율 배지 - 주의를 끌기 위해 시각적으로 눈에 띄게 표시 */}
            <DiscountBadge>{discountRate}%</DiscountBadge>

            {/* 원가 - 절약 효과를 강조하기 위해 취소선 스타일로 표시 */}
            <OriginalPrice>{formatPrice(product.price)}원</OriginalPrice>
          </DiscountInfo>
        )}

        {/* 현재/할인된 가격 - 가장 눈에 띄는 가격 표시 */}
        <CurrentPrice>{formatPrice(product.discountPrice)}원</CurrentPrice>
      </PriceSection>

      {/* 위시리스트 버튼 - 찜하기 기능과 찜한 사람 수 표시 */}
      <WishlistButton
        productId={product.productId}
        wishCount={product.wishNumber}
        size="medium"
        showCount={true}
      />
    </InfoSection>
  );
};
