import React, { useState } from "react";
// 모달 컴포넌트
import Fail from "../../components/modal/Fail"; // 에러 알림 모달
// 결제 관련 커스텀 훅
import { usePaymentData } from "../../hooks/order/usePaymentData"; // 결제 데이터 관리 훅
import { usePaymentActions } from "../../hooks/order/usePaymentActions"; // 결제 액션 관리 훅
// 유틸리티 함수
import { formatPrice } from "../../utils/order/formatters"; // 가격 포맷팅 함수
// 결제 페이지 UI 컴포넌트들
import { ProductPreviewSection } from "../../components/order/ProductPreviewSection"; // 상품 미리보기 섹션
import { ShippingInfoSection } from "../../components/order/ShippingInfoSection"; // 배송 정보 입력 섹션
import { PointSection } from "../../components/order/PointSection"; // 기존 포인트 사용 섹션
import { EnhancedPointSection } from "../../components/order/EnhancedPointSection"; // 향상된 포인트 사용 섹션
import { PaymentMethodSection } from "../../components/order/PaymentMethodSection"; // 결제수단 선택 섹션
import { PaymentSummary } from "../../components/order/PaymentSummary"; // 결제 요약 및 결제 버튼
import { LoadingOverlay } from "../../components/order/LoadingOverlay"; // 결제 처리 중 로딩 오버레이
// 새로 추가된 섹션들
import { AddressSelectionSection } from "../../components/order/AddressSelectionSection"; // 배송지 선택 섹션
import { CouponSelectionSection } from "../../components/order/CouponSelectionSection"; // 쿠폰 선택 섹션
// 스타일 컴포넌트
import { Container, FormSection, SummarySection } from "./PaymentPage.styles";

/**
 * 결제 페이지 컴포넌트
 * 
 * 기능:
 * - 주문할 상품들의 미리보기 표시
 * - 배송 정보 입력 (이름, 전화번호, 주소, 배송 요청사항)
 * - 포인트 사용 여부 및 사용할 포인트 설정
 * - 결제 수단 선택 (카드, 무통장입금, 휴대폰 결제 등)
 * - 결제 금액 요약 및 최종 결제 처리
 * - 직접 주문(DetailPage에서 바로 주문) 차단 기능
 * 
 * 라우팅:
 * - 장바구니에서 "주문하기" 클릭 시 이동
 * - DetailPage에서 "바로 주문하기" 클릭 시 이동 (현재 차단됨)
 * - 결제 완료 후 CheckoutPage로 이동
 * 
 * 사용되는 커스텀 훅:
 * - usePaymentData: 결제 관련 데이터 및 상태 관리
 * - usePaymentActions: 결제 처리 및 검증 로직
 */
const PaymentPage: React.FC = () => {
  // 에러 모달 관련 로컬 상태
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 텍스트
  const [showErrorModal, setErrorModal] = useState(false); // 에러 모달 표시 여부

  // 결제 데이터 관리 훅 (장바구니 아이템, 배송정보, 포인트 등)
  const paymentData = usePaymentData();

  /**
   * 에러 처리 핸들러
   * 결제 과정에서 발생하는 모든 에러를 모달로 표시
   * @param message - 표시할 에러 메시지
   */
  const handleError = (message: string) => {
    setErrorMessage(message);
    setErrorModal(true);
  };

  // 결제 액션 관리 훅 (포인트 계산, 결제 처리 등)
  const {
    calculateTotals,    // 총 결제 금액 계산 함수
    handlePointsChange, // 포인트 사용량 변경 핸들러
    handleUseAllPoints, // 전체 포인트 사용 핸들러
    handlePayment,      // 최종 결제 처리 핸들러
  } = usePaymentActions({
    paymentData,
    setUsedPoints: paymentData.setUsedPoints,
    setIsProcessing: paymentData.setIsProcessing,
    onError: handleError,
  });

  // 현재 결제 금액 요약 정보 계산
  const totals = calculateTotals();

  // 메인 렌더링: 결제 페이지 UI
  return (
    <>
      {/* 결제 처리 중일 때 전체 화면을 덮는 로딩 오버레이 */}
      <LoadingOverlay isVisible={paymentData.isProcessing} />

      {/* 에러 발생 시 표시되는 모달 */}
      {showErrorModal && (
        <Fail
          title="확인 필요"
          message={errorMessage}
          onClose={() => setErrorModal(false)}
        />
      )}

      <Container>
        {/* 결제 정보 입력 섹션 (좌측) */}
        <FormSection>

          {/* 주문 상품 미리보기 */}
          <ProductPreviewSection
            items={paymentData.items} // 주문할 상품 목록
            formatPrice={formatPrice}
          />

          {/* 배송지 선택 섹션 */}
          <AddressSelectionSection
            addresses={paymentData.addresses}
            selectedAddress={paymentData.selectedAddress}
            onAddressSelect={paymentData.setSelectedAddress}
          />

          {/* 배송 정보 입력 (이름, 전화번호, 주소, 배송 요청사항) */}
          <ShippingInfoSection
            shippingInfo={paymentData.shippingInfo}
            isProcessing={paymentData.isProcessing}
            onInputChange={paymentData.updateShippingInfo}
            onDeliveryRequestChange={paymentData.handleDeliveryRequestChange}
          />

          {/* 쿠폰 선택 섹션 */}
          <CouponSelectionSection
            coupons={paymentData.availableCoupons}
            selectedCoupon={paymentData.selectedCoupon}
            onCouponSelect={paymentData.setSelectedCoupon}
            formatPrice={formatPrice}
            onCouponCodeApply={paymentData.applyCouponByCode}
          />

          {/* 향상된 포인트 사용 섹션 */}
          <EnhancedPointSection
            usePoint={paymentData.usePoint}
            usedPoints={paymentData.usedPoints}
            pointBalance={paymentData.pointBalance}
            isProcessing={paymentData.isProcessing}
            formatPrice={formatPrice}
            onPointToggle={paymentData.handlePointToggle}
            onPointsChange={handlePointsChange}
            onUseAllPoints={handleUseAllPoints}
          />

          {/* 결제 수단 선택 (카드, 무통장입금, 휴대폰 결제 등) */}
          <PaymentMethodSection
            selectedMethod={paymentData.selectedMethod}
            shippingInfo={paymentData.shippingInfo}
            isProcessing={paymentData.isProcessing}
            onMethodChange={paymentData.setSelectedMethod}
            onInputChange={paymentData.updateShippingInfo}
          />
        </FormSection>

        {/* 결제 요약 섹션 (우측) */}
        <SummarySection>
          <PaymentSummary
            totals={totals} // 계산된 결제 금액 정보 (쿠폰 할인 포함)
            items={paymentData.items}
            isAgree={paymentData.isAgree} // 약관 동의 여부
            isProcessing={paymentData.isProcessing}
            usePoint={paymentData.usePoint}
            usedPoints={paymentData.usedPoints}
            selectedCoupon={paymentData.selectedCoupon} // 선택된 쿠폰 정보
            formatPrice={formatPrice}
            onAgreeChange={paymentData.setIsAgree} // 약관 동의 체크박스 변경
            onPayment={handlePayment} // 최종 결제 버튼 클릭
          />
        </SummarySection>
      </Container>
    </>
  );
};

export default PaymentPage;
