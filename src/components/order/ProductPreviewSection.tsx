/**
 * 구매 상품 정보 미리보기 컴포넌트
 *
 * 기능:
 * - 결제 전 구매할 상품들의 정보 미리보기 제공
 * - 상품 이미지, 이름, 옵션, 수량, 가격 표시
 * - 이미지 로딩 실패 시 대체 이미지 처리
 * - 로딩 상태 및 빈 상태 처리
 *
 * 제공 기능:
 * - 상품별 상세 정보 카드 형태로 표시
 * - 상품 이미지 표시 및 오류 시 대체 이미지
 * - 사이즈, 수량 등 주문 옵션 정보
 * - 할인이 적용된 최종 가격 표시 (수량 * 할인가격)
 * - 상품 정보 로딩 중 상태 표시
 *
 * 사용되는 곳:
 * - PaymentPage에서 주문 확인용 상품 정보 섹션
 *
 * UX 고려사항:
 * - 상품 이미지와 정보를 카드 형태로 깔끔하게 정리
 * - 이미지 로딩 실패 시 사용자 경험 저하 방지
 * - 로딩 중에도 적절한 안내 메시지 제공
 * - 최종 결제 전 구매 상품 재확인 기회 제공
 */

// React 라이브러리
import React from "react";
// 타입 정의
import { PaymentItem } from "../../types/order"; // 결제 상품 아이템 타입
// 유틸리티 함수들
import { toUrl } from "../../utils/common/images"; // 이미지 URL 변환 유틸리티
// 스타일 컴포넌트들
import {
  ProductHeader, // 상품 정보 섹션 헤더
  ProductPreview, // 상품 미리보기 컨테이너
  ProductItem, // 개별 상품 아이템
  ProductImage, // 상품 이미지
  ProductInfo, // 상품 정보 영역
  ProductName, // 상품명
  ProductDetails, // 상품 세부 정보 (사이즈, 수량)
  ProductPrice, // 상품 가격
} from "../../pages/order/PaymentPage.styles";

/**
 * ProductPreviewSection 컴포넌트의 Props 인터페이스
 */
interface ProductPreviewSectionProps {
  items: PaymentItem[]; // 결제할 상품 목록
  formatPrice: (price: number) => string; // 가격 포맷팅 함수
}

/**
 * 구매 상품 정보 미리보기 컴포넌트
 *
 * 결제 전 구매할 상품들의 정보를 카드 형태로 미리보기하여
 * 사용자가 주문 내용을 최종 확인할 수 있도록 도와줍니다.
 * 이미지 로딩 실패나 데이터 로딩 중 상황에 대한 적절한 처리를 포함합니다.
 */
export const ProductPreviewSection: React.FC<ProductPreviewSectionProps> = ({
  items,
  formatPrice,
}) => {
  return (
    <>
      {/* 상품 정보 섹션 헤더 */}
      <ProductHeader>구매 상품 정보</ProductHeader>

      {/* 상품 목록이 비어있을 때 로딩 상태 표시 */}
      {items.length === 0 ? (
        <ProductPreview>
          <div style={{ textAlign: "center", color: "#9ca3af" }}>
            상품 정보 로딩 중...
          </div>
        </ProductPreview>
      ) : (
        /* 상품 목록이 있을 때 상품 카드들 표시 */
        <ProductPreview>
          {items.map((item) => (
            /* 개별 상품 카드 */
            <ProductItem key={item.id}>
              {/* 상품 이미지 (오류 시 대체 이미지 처리) */}
              <ProductImage
                src={toUrl(item.imageUrl)} // 이미지 URL 변환
                alt={item.productName} // 접근성을 위한 alt 텍스트
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden"; // 이미지 로딩 실패 시 대체 이미지
                }}
              />

              {/* 상품 정보 영역 */}
              <ProductInfo>
                {/* 상품명 */}
                <ProductName>{item.productName}</ProductName>

                {/* 상품 세부 옵션 정보 (성별, 색상, 사이즈, 수량) */}
                <ProductDetails>
                  {item.gender && (
                    <>
                      {item.gender === "MEN" ? "남성" : item.gender === "WOMEN" ? "여성" : "공용"} | 
                    </>
                  )}
                  {item.color && <>{item.color} | </>}
                  사이즈: {item.size} | 수량: {item.quantity}개
                </ProductDetails>
              </ProductInfo>

              {/* 상품 가격 (할인가 * 수량) */}
              <ProductPrice>
                {formatPrice(item.discountPrice * item.quantity)}원
              </ProductPrice>
            </ProductItem>
          ))}
        </ProductPreview>
      )}
    </>
  );
};
