import { useNavigate } from "react-router-dom";
import { OrderService } from "../../api/orderService";
import { CreateOrderRequest } from "../../types/order";
import {
  validatePhoneNumber,
  validatePostalCode,
  validateCardNumber,
  validateCardExpiry,
  validateCVC,
} from "../../utils/order/validation";

/**
 * 결제 액션 처리 훅
 *
 * 결제 과정에서 필요한 다양한 액션들을 처리합니다:
 * - 총 금액 계산 (상품가 + 배송비 - 포인트)
 * - 포인트 사용 금액 처리
 * - 결제 데이터 유효성 검사
 * - 실제 결제 처리 및 주문 생성
 */

// 결제 데이터 구조 정의
interface PaymentData {
  items: any[]; // 결제할 상품 목록
  shippingInfo: any; // 배송 및 결제 정보
  selectedMethod: string; // 선택된 결제 수단
  usePoint: boolean; // 포인트 사용 여부
  usedPoints: number; // 사용할 포인트
  isAgree: boolean; // 약관 동의 여부
  availablePoints: number; // 사용 가능한 포인트
  isDirectOrder: boolean; // 바로 주문 여부
}

// 훅에 전달받을 props 타입 정의
interface UsePaymentActionsProps {
  paymentData: PaymentData; // 결제 데이터
  setUsedPoints: (points: number) => void; // 사용할 포인트 설정 함수
  setIsProcessing: (processing: boolean) => void; // 처리 상태 설정 함수
  onError: (message: string) => void; // 에러 처리 콜백 함수
}

export const usePaymentActions = ({
  paymentData,
  setUsedPoints,
  setIsProcessing,
  onError,
}: UsePaymentActionsProps) => {
  const navigate = useNavigate();

  /**
   * 결제 총 금액을 계산하는 함수
   * 상품 총가격 + 배송비 - 사용 포인트 = 최종 결제 금액
   * @returns 계산된 각종 금액 정보
   */
  const calculateTotals = () => {
    // 모든 상품의 할인가 * 수량의 합계
    const productTotal = paymentData.items.reduce(
      (sum, item) => sum + item.discountPrice * item.quantity,
      0
    );

    // 5만원 이상 무료배송, 미만시 3000원
    const deliveryFee = productTotal >= 50000 ? 0 : 3000;

    // 포인트 사용 여부에 따른 사용 포인트 계산
    const pointsToUse = paymentData.usePoint ? paymentData.usedPoints : 0;

    // 최종 결제 금액 = 상품가 + 배송비 - 포인트
    const finalAmount = productTotal + deliveryFee - pointsToUse;

    return {
      productTotal, // 상품 총가격
      deliveryFee, // 배송비
      finalAmount, // 최종 결제 금액
      usedPoints: pointsToUse, // 사용할 포인트
    };
  };

  /**
   * 사용자가 입력한 포인트 값을 처리하는 함수
   * 다양한 유효성 검사를 수행한 후 사용 포인트를 설정
   * @param value 사용자가 입력한 포인트 값 (문자열)
   */
  const handlePointsChange = (value: string) => {
    // 포인트 사용이 비활성화되어 있으면 처리하지 않음
    if (!paymentData.usePoint) return;

    const numValue = parseInt(value) || 0;

    // 보유 포인트가 부족한지 검사한다.
    if (numValue > paymentData.availablePoints) {
      onError("보유한 포인트가 부족합니다.");
      return;
    }

    // 100원 단위 사용 제한 검사 (0원은 예외)
    if (numValue % 100 !== 0 && numValue !== 0) {
      onError("포인트는 100원 단위로만 사용 가능합니다.");
      return;
    }

    // calculateTotals() 여기서
    const totals = calculateTotals();
    // 최대 사용 가능 포인트: 상품 총가의 10%
    const maxUsablePoints = Math.floor(totals.productTotal * 0.1);

    // 최대 사용 가능 포인트 초과 검사
    if (numValue > maxUsablePoints) {
      onError(
        `포인트는 구매금액의 10%인 ${maxUsablePoints.toLocaleString()}원까지만 사용 가능합니다.`
      );
      return;
    }

    // 모든 유효성 검사를 통과하면 포인트 설정
    setUsedPoints(numValue);
  };

  /**
   * "전체 사용" 버튼 클릭 시 사용 가능한 최대 포인트를 설정하는 함수
   * 보유 포인트와 사용 제한 중 작은 값을 100원 단위로 계산
   */
  const handleUseAllPoints = () => {
    // 포인트 사용이 비활성화되어 있으면 처리하지 않음
    if (!paymentData.usePoint) return;

    const totals = calculateTotals();
    // 최대 사용 가능 포인트: 상품 총가의 10%
    const maxUsablePoints = Math.floor(totals.productTotal * 0.1);
    // 보유 포인트와 사용 제한 중 작은 값 선택
    const maxPoints = Math.min(paymentData.availablePoints, maxUsablePoints);
    // 100원 단위로 내림 처리
    const roundedPoints = Math.floor(maxPoints / 100) * 100;

    setUsedPoints(roundedPoints);
  };

  /**
   * 최종 배송 요청사항을 결정하는 함수
   * "기타 (직접 입력)"을 선택한 경우 사용자 입력 내용을 반환
   * @returns 최종 배송 요청사항 문자열
   */
  const getFinalDeliveryRequest = () => {
    if (paymentData.shippingInfo.request === "기타 (직접 입력)") {
      // 사용자가 직접 입력한 내용이 있으면 사용, 없으면 "없음"
      return paymentData.shippingInfo.customRequest || "없음";
    }
    // 미리 정의된 옵션 중 하나를 선택한 경우 그대로 반환
    return paymentData.shippingInfo.request;
  };

  /**
   * 결제 전 모든 입력 데이터의 유효성을 검사하는 함수
   * 필수 필드 누락, 형식 오류 등을 차레로 검사하고 에러 발생 시 throw
   * @throws {Error} 유효성 검사 실패 시 구체적인 에러 메시지와 함께 예외 발생
   */
  const validatePaymentData = () => {
    const { shippingInfo, selectedMethod, isAgree } = paymentData;

    // 받는 사람 이름 필수 검사
    if (!shippingInfo.name.trim()) {
      throw new Error("받는 분 성함을 입력해주세요.");
    }

    // 휴대폰 번호 형식 검사
    if (!validatePhoneNumber(shippingInfo.phone)) {
      throw new Error(
        "올바른 휴대폰 번호를 입력해주세요. (010, 011 등으로 시작하는 10~11자리)"
      );
    }

    // 우편번호 형식 검사
    if (!validatePostalCode(shippingInfo.zipcode)) {
      throw new Error("올바른 우편번호를 입력해주세요. (5자리 숫자)");
    }

    // 기본 주소 필수 검사
    if (!shippingInfo.address.trim()) {
      throw new Error("주소를 입력해주세요.");
    }

    // 상세 주소 필수 검사
    if (!shippingInfo.detailAddress.trim()) {
      throw new Error("상세 주소를 입력해주세요.");
    }

    // 카드 결제 선택 시 카드 정보 검사
    if (selectedMethod === "카드") {
      // 카드 번호 형식 검사
      if (!validateCardNumber(shippingInfo.cardNumber)) {
        throw new Error("올바른 카드번호를 입력해주세요. (13~19자리 숫자)");
      }

      // 유효기간 형식 검사
      if (!validateCardExpiry(shippingInfo.cardExpiry)) {
        throw new Error("올바른 유효기간을 입력해주세요. (MM/YY)");
      }

      // CVC 형식 검사
      if (!validateCVC(shippingInfo.cardCvv)) {
        throw new Error("올바른 CVC를 입력해주세요. (3자리 숫자)");
      }
    }

    // 약관 동의 필수 검사
    if (!isAgree) {
      throw new Error("주문 내용 확인 및 결제 동의가 필요합니다.");
    }
  };

  /**
   * 최종 결제 처리를 담당하는 메인 함수
   * 유효성 검사 → 주문 데이터 생성 → 서버 요청 → 결과 처리 순으로 진행
   * 성공 시 주문 완료 페이지로 이동, 실패 시 에러 메시지 표시
   */
  const handlePayment = async () => {
    try {
      // 바로 주문은 현재 지원하지 않음 (장바구니를 통해서만 주문 가능)
      if (paymentData.isDirectOrder) {
        onError("현재는 장바구니에서 주문만 가능합니다.");
        return;
      }

      // 입력 데이터 유효성 검사 실행
      validatePaymentData();
      // 결제 처리 중 상태로 변경 (로딩 표시)
      setIsProcessing(true);

      // 최종 금액 계산
      const totals = calculateTotals();
      const { shippingInfo, selectedMethod, usePoint, usedPoints } =
        paymentData;

      // 서버로 전송할 주문 데이터 객체 생성
      const orderData: CreateOrderRequest = {
        deliveryAddress: shippingInfo.address,
        deliveryDetailAddress: shippingInfo.detailAddress,
        postalCode: shippingInfo.zipcode,
        recipientName: shippingInfo.name,
        recipientPhone: shippingInfo.phone,
        usedPoints: usePoint ? usedPoints : 0, // 포인트 사용 여부에 따라 0 또는 사용할 포인트
        deliveryMessage: getFinalDeliveryRequest(), // 최종 배송 요청사항 결정
        deliveryFee: totals.deliveryFee,
        paymentMethod: selectedMethod,
        // 카드 결제인 경우에만 카드 정보 포함
        cardNumber:
          selectedMethod === "카드" ? shippingInfo.cardNumber : undefined,
        cardExpiry:
          selectedMethod === "카드"
            ? shippingInfo.cardExpiry.replace("/", "") // MM/YY → MMYY 형식으로 변환
            : undefined,
        cardCvc: selectedMethod === "카드" ? shippingInfo.cardCvv : undefined,
      };

      // 서버에 주문 생성 요청
      const orderResponse = await OrderService.createOrder(orderData);

      // 성공 시 주문 완료 페이지로 이동 (주문 ID를 state로 전달)
      navigate("/checkout", {
        state: {
          orderId: orderResponse.orderId,
        },
      });
    } catch (error: any) {
      // 에러 처리: 서버 응답 메시지 → 일반 에러 메시지 → 기본 메시지 순으로 처리
      if (error.response?.data?.message) {
        onError(error.response.data.message);
      } else if (error.message) {
        onError(error.message);
      } else {
        onError("결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      // 성공/실패 관계없이 처리 중 상태 해제
      setIsProcessing(false);
    }
  };

  // 모든 결제 관련 함수들을 반환
  return {
    calculateTotals, // 총 금액 계산 함수
    handlePointsChange, // 포인트 입력 처리 함수
    handleUseAllPoints, // 전체 포인트 사용 함수
    handlePayment, // 최종 결제 처리 함수
  };
};
