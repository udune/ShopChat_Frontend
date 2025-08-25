/**
 * 결제 정보 요약 및 최종 결제 컴포넌트
 *
 * 기능:
 * - 상품금액, 배송비, 포인트 사용액, 최종 결제금액 표시
 * - 결제 동의 체크박스 제공
 * - 최종 결제 버튼 및 처리 상태 관리
 * - 결제 관련 주요 안내사항 표시
 *
 * 제공 기능:
 * - 금액 상세 내역 표시 (상품금액, 배송비, 포인트 할인)
 * - 최종 결제금액 강조 표시
 * - 결제 동의 확인 체크박스
 * - 결제 처리 중 상태 표시 및 버튼 비활성화
 * - 결제 후 주의사항 및 안내 메시지
 *
 * 사용되는 곳:
 * - CheckoutPage와 PaymentPage에서 결제 정보 요약 섹션
 *
 * UX 고려사항:
 * - 최종 결제금액을 가장 눈에 띄게 표시
 * - 결제 동의 없이는 결제 버튼 비활성화
 * - 결제 처리 중 명확한 상태 표시
 * - 결제 후 주의사항을 미리 안내하여 고객 만족도 향상
 */

// React 라이브러리
import React from "react";
// 스타일 컴포넌트들
import {
  Card, // 섹션 래퍼 카드
  SectionTitle, // 섹션 제목
  TotalRow, // 금액 항목 행
  FinalTotalRow, // 최종 금액 행 (강조)
  CheckLabel, // 체크박스 라벨
  PrimaryButton, // 주 액션 버튼
  Notice, // 안내 메시지
} from "../../pages/order/CheckoutPage.styles";
import { CouponResponse } from "../../types/types";

/**
 * PaymentSummary 컴포넌트의 Props 인터페이스
 */
interface PaymentSummaryProps {
  totals: {
    // 결제 금액 정보 객체
    productTotal: number; // 상품 총 금액
    deliveryFee: number; // 배송비
    couponDiscount?: number; // 쿠폰 할인 금액 (새로 추가)
    finalAmount: number; // 최종 결제 금액
    usedPoints: number; // 사용된 포인트 (중복, 아래와 동일)
  };
  items: any[]; // 주문 상품 목록
  isAgree: boolean; // 결제 동의 상태
  isProcessing: boolean; // 결제 처리 중 상태
  usePoint: boolean; // 포인트 사용 여부
  usedPoints: number; // 사용된 포인트 금액
  selectedCoupon?: CouponResponse | null; // 선택된 쿠폰 (새로 추가)
  formatPrice: (price: number) => string; // 가격 포맷팅 함수
  onAgreeChange: (agree: boolean) => void; // 동의 상태 변경 핸들러
  onPayment: () => Promise<void>; // 결제 실행 핸들러
}

/**
 * 결제 정보 요약 및 최종 결제 컴포넌트
 *
 * 모든 결제 관련 정보를 요약하여 표시하고, 사용자의 최종 결제 동의를 받아
 * 결제를 진행할 수 있는 인터페이스를 제공합니다.
 * 결제 전 필수 확인사항과 주의사항을 미리 안내합니다.
 */
export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totals,
  items,
  isAgree,
  isProcessing,
  usePoint,
  usedPoints,
  selectedCoupon,
  formatPrice,
  onAgreeChange,
  onPayment,
}) => {
  return (
    <Card>
      {/* 섹션 제목 */}
      <SectionTitle>결제 정보</SectionTitle>

      {/* 상품 총 금액 표시 */}
      <TotalRow>
        <span>상품금액</span>
        <span>{formatPrice(totals.productTotal)}원</span>
      </TotalRow>

      {/* 배송비 표시 (무료배송 조건부 표시) */}
      <TotalRow>
        <span>배송비</span>
        <span>
          {totals.deliveryFee === 0
            ? "무료" // 무료배송인 경우
            : `${formatPrice(totals.deliveryFee)}원`}
          {selectedCoupon?.isFreeShipping && totals.deliveryFee === 0 && " (쿠폰 적용)"}
        </span>
      </TotalRow>

      {/* 쿠폰 할인 시에만 표시되는 할인 금액 */}
      {selectedCoupon && totals.couponDiscount && totals.couponDiscount > 0 && (
        <TotalRow>
          <span>쿠폰 할인</span>
          <span>-{formatPrice(totals.couponDiscount)}원</span>
        </TotalRow>
      )}

      {/* 포인트 사용 시에만 표시되는 할인 금액 */}
      {usePoint && usedPoints > 0 && (
        <TotalRow>
          <span>포인트 사용</span>
          <span>-{formatPrice(usedPoints)}원</span>{" "}
          {/* 마이너스 표시로 할인 강조 */}
        </TotalRow>
      )}

      {/* 최종 결제금액 (강조 스타일) */}
      <FinalTotalRow>
        <span>최종 결제금액</span>
        <span>{formatPrice(totals.finalAmount)}원</span>
      </FinalTotalRow>

      {/* 결제 동의 체크박스 (필수) */}
      <CheckLabel>
        <input
          type="checkbox"
          checked={isAgree}
          onChange={(e) => onAgreeChange(e.target.checked)}
          disabled={isProcessing} // 결제 처리 중 변경 불가
        />
        주문 내용 확인 및 결제에 동의합니다.
      </CheckLabel>

      {/* 최종 결제 버튼 */}
      <PrimaryButton
        disabled={!isAgree || isProcessing} // 동의하지 않거나 처리 중이면 비활성화
        onClick={onPayment}
      >
        {isProcessing
          ? "결제 처리 중..." // 처리 중 상태 표시
          : `${formatPrice(totals.finalAmount)}원 결제하기`}{" "}
        {/* 일반 상태에서 금액과 함께 표시 */}
      </PrimaryButton>

      {/* 결제 관련 주요 안내사항 */}
      <Notice>
        • 결제 완료 후 주문 취소는 마이페이지에서 가능합니다.
        <br />
        • 배송지 변경은 배송 준비 전까지만 가능합니다.
        <br />• 포인트는 결제 완료 후 자동으로 적용됩니다.
      </Notice>
    </Card>
  );
};
