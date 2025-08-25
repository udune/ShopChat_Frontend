import React, { useState } from "react";
// 모달 컴포넌트
import Fail from "../../components/modal/Fail"; // 에러 알림 모달
// 주문 관련 커스텀 훅
import { useOrderDetail } from "../../hooks/order/useOrderDetail"; // 주문 상세 정보 관리 훅
// 유틸리티 함수들
import { formatPrice, getStatusText } from "../../utils/order/orderHelpers"; // 가격 포맷팅 및 상태 텍스트 변환
// 주문 완료 페이지 UI 컴포넌트들
import { OrderSuccess } from "../../components/order/OrderSuccess"; // 주문 성공 메시지 및 적립 포인트 표시
import { OrderInfo } from "../../components/order/OrderInfo"; // 주문 기본 정보 (주문일자, 상태 등)
import { ShippingInfo } from "../../components/order/ShippingInfo"; // 배송 정보 표시
import { OrderItems } from "../../components/order/OrderItems"; // 주문한 상품 목록 표시
import { ThankYouMessage } from "../../components/order/ThankYouMessage"; // 감사 메시지 및 내 페이지 이동 버튼
import { ErrorState } from "../../components/order/ErrorState"; // 에러 상태 표시 컴포넌트
import { LoadingState } from "../../components/order/LoadingState"; // 로딩 상태 표시 컴포넌트
// 스타일 컴포넌트
import { Container } from "./CheckoutPage.styles";

/**
 * 주문 완료 페이지 컴포넌트
 * 
 * 기능:
 * - 주문 완료 후 결제 성공 메시지 표시
 * - 적립된 포인트 정보 표시
 * - 주문 정보 요약 (주문일자, 상태 등)
 * - 배송 정보 표시 (배송지, 연락처 등)
 * - 주문한 상품 목록 및 가격 정보 표시
 * - 마이페이지로 이동할 수 있는 버튼 제공
 * 
 * 라우팅:
 * - PaymentPage에서 결제 완료 후 자동 이동
 * - URL에 주문 정보가 state로 전달됨
 * - "주문내역 확인" 버튼 클릭 시 MyPage로 이동
 * 
 * 사용되는 커스텀 훅:
 * - useOrderDetail: 전달받은 주문 정보를 처리하고 관리
 */
const CheckoutPage: React.FC = () => {
  // 에러 모달 표시 여부 (현재 사용되지 않음, 향후 확장 가능)
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // 주문 상세 정보 관리 훅
  const { orderDetail, loading, error } = useOrderDetail();

  // 주문 정보 로딩 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <Container>
        <LoadingState />
      </Container>
    );
  }

  // 주문 정보 로드 중 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <Container>
        <ErrorState icon="❌" title="오류가 발생했습니다" message={error} />
      </Container>
    );
  }

  // 주문 정보가 없을 때 (라우팅 오류 등) 안내 메시지 표시
  if (!orderDetail) {
    return (
      <Container>
        <ErrorState
          icon="🚫"
          title="주문 정보를 찾을 수 없습니다"
          message="주문이 정상적으로 처리되지 않았을 수 있습니다."
        />
      </Container>
    );
  }

  // 메인 렌더링: 주문 완료 페이지 UI
  return (
    <>
      {/* 에러 모달 (현재 미사용, 향후 확장 가능) */}
      {showErrorModal && (
        <Fail
          title="알림"
          message="주문 정보를 불러오는데 실패했습니다."
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <Container>
        {/* 주문 성공 메시지 및 적립 포인트 표시 */}
        <OrderSuccess
          earnedPoints={orderDetail.earnedPoints || Math.floor((orderDetail.finalPrice || 0) * 0.01)} // 이번 주문으로 적립된 포인트 (기본 1% 계산)
          formatPrice={formatPrice}
        />

        {/* 주문 기본 정보 (주문일자, 상태 등) */}
        <OrderInfo 
          orderDetail={orderDetail} 
          getStatusText={getStatusText} // 주문 상태를 한글로 변환
        />

        {/* 배송 정보 (배송지, 연락처, 배송 요청사항) */}
        <ShippingInfo shippingInfo={orderDetail.shippingInfo} />

        {/* 주문한 상품 목록 및 가격 정보 */}
        <OrderItems 
          items={orderDetail.items} // 주문 상품 목록
          formatPrice={formatPrice}
        />

        {/* 감사 메시지 및 마이페이지 이동 버튼 */}
        <ThankYouMessage />
      </Container>
    </>
  );
};

export default CheckoutPage;
