import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PaymentItem } from "../../types/order";
import CartService from "../../api/cartService";

/**
 * 결제 데이터 관리 훅
 *
 * 결제 페이지에서 필요한 모든 데이터와 상태를 관리합니다:
 * - 결제 상품 목록
 * - 배송 정보 (주소, 연락처 등)
 * - 결제 수단 및 카드 정보
 * - 포인트 사용 여부
 * - 동의 상태 및 처리 상태
 */

// 결제 상태 데이터 구조 정의
interface PaymentState {
  items: PaymentItem[];                    // 결제할 상품 목록
  shippingInfo: {                          // 배송 및 결제 정보
    name: string;                          // 받는 사람 이름
    phone: string;                         // 연락처
    zipcode: string;                       // 우편번호
    address: string;                       // 주소
    detailAddress: string;                 // 상세 주소
    request: string;                       // 배송 요청사항
    customRequest: string;                 // 사용자 직접 입력 요청사항
    cardNumber: string;                    // 카드 번호
    cardExpiry: string;                    // 카드 유효기간
    cardCvv: string;                       // 카드 CVC
  };
  selectedMethod: string;                  // 선택된 결제 수단
  usePoint: boolean;                       // 포인트 사용 여부
  usedPoints: number;                      // 사용할 포인트
  isAgree: boolean;                        // 약관 동의 여부
  isProcessing: boolean;                   // 결제 처리 중 여부
  isDirectOrder: boolean;                  // 바로 주문 여부 (장바구니 경유 X)
  tempCartItemIds: number[];               // 임시 장바구니 아이템 ID들
  directOrderItems: any[];                 // 바로 주문할 상품 목록 (바로 주문 시에만 사용)
}

// 훅에서 반환할 값들의 타입 정의 (PaymentState + 추가 기능들)
interface UsePaymentDataReturn extends PaymentState {
  availablePoints: number;                                           // 사용 가능한 포인트
  updateShippingInfo: (field: string, value: string) => void;        // 배송 정보 업데이트 함수
  setSelectedMethod: (method: string) => void;                       // 결제 수단 설정 함수
  setUsePoint: (use: boolean) => void;                               // 포인트 사용 여부 설정 함수
  setUsedPoints: (points: number) => void;                           // 사용할 포인트 설정 함수
  setIsAgree: (agree: boolean) => void;                              // 동의 상태 설정 함수
  setIsProcessing: (processing: boolean) => void;                    // 처리 상태 설정 함수
  handleDeliveryRequestChange: (option: string) => void;             // 배송 요청사항 변경 처리 함수
  handlePointToggle: (enabled: boolean) => void;                     // 포인트 사용 토글 처리 함수
}

export const usePaymentData = (): UsePaymentDataReturn => {
  const location = useLocation();
  // 사용자가 보유한 포인트 (현재는 고정값, 추후 API로 대체 필요)
  const [availablePoints] = useState(5000);

  // 결제 관련 모든 상태를 하나의 객체로 관리
  const [state, setState] = useState<PaymentState>({
    items: [],                        // 결제 상품 목록 (초기에는 비어있음)
    shippingInfo: {                   // 배송 및 결제 정보 초기값
      name: "",
      phone: "",
      zipcode: "",
      address: "",
      detailAddress: "",
      request: "없음",                // 기본 배송 요청사항
      customRequest: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    },
    selectedMethod: "카드",            // 기본 결제 수단은 카드
    usePoint: false,                  // 초기에는 포인트 사용 안함
    usedPoints: 0,                    // 사용할 포인트 0으로 초기화
    isAgree: false,                   // 약관 동의 안됨 상태로 시작
    isProcessing: false,              // 결제 처리 중 아님
    isDirectOrder: false,             // 장바구니 경유 주문으로 기본 설정
    tempCartItemIds: [],              // 임시 장바구니 ID 목록
    directOrderItems: [],             // 바로 주문 상품 목록
  });

  /**
   * 바로 주문 상품들을 로드하는 함수
   * 상품 상세 페이지에서 바로 주문할 때 사용됨
   * @param tempIds 임시 장바구니에 추가된 아이템 ID 배열
   */
  const loadDirectOrderItems = async (tempIds: number[]) => {
    try {
      // 장바구니에서 데이터 가져오기
      const cartData = await CartService.getCartItems();
      
      // 임시 ID에 해당하는 아이템들만 필터링하고 결제 형식에 맞게 변환
      const directOrderItems = cartData.items
        .filter((item) => tempIds.includes(item.cartItemId))
        .map((item: any) => ({
          id: `${item.productId}-${item.optionId || item.optionInfo?.optionId}`,
          productName: item.productName,
          size: item.optionInfo?.size?.replace("SIZE_", "") || "",
          discountPrice: item.discountPrice,
          productPrice: item.productPrice,
          discount: item.productPrice - item.discountPrice,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          selected: true,  // 바로 주문에서는 모든 상품이 선택된 상태
        }));

      // 상태에 로드된 상품들 설정
      setState((prev) => ({ ...prev, items: directOrderItems }));
    } catch (error) {
      throw new Error("주문 정보를 불러오는데 실패했습니다.");
    }
  };

  /**
   * 컴포넌트 마운트 시 라우터 state에서 결제 데이터 초기화
   * 장바구니에서 온 경우와 바로 주문 경우를 구분하여 처리
   */
  useEffect(() => {
    const locationState = location.state;

    // 라우터로 전달받은 state가 없으면 잘못된 접근
    if (!locationState) {
      throw new Error("잘못된 접근입니다.");
    }

    // 바로 주문인 경우 처리
    if (locationState.isDirectOrder) {
      // 바로 주문 상품 정보를 결제 형식에 맞게 변환
      if (locationState.directOrderItems && locationState.directOrderItems.length > 0) {
        const directOrderItems = locationState.directOrderItems.map((item: any) => ({
          id: `${item.productId}-${item.optionId}`,
          productName: item.productName,
          gender: item.gender, // 성별 정보 추가
          color: item.color,   // 색상 정보 추가
          size: item.size || "",
          discountPrice: item.discountPrice || item.price,
          productPrice: item.price || item.discountPrice,
          discount: (item.price || item.discountPrice) - (item.discountPrice || item.price),
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          selected: true, // 바로 주문에서는 모든 상품이 선택된 상태
        }));

        setState((prev) => ({
          ...prev,
          isDirectOrder: true,
          items: directOrderItems,
          directOrderItems: locationState.directOrderItems, // 원본 바로 주문 데이터도 저장
        }));
      } else {
        throw new Error("주문 정보를 불러오는데 실패했습니다.");
      }
      return;
    }

    // 장바구니에서 온 경우: 선택된 상품들을 결제 형식에 맞게 변환
    if (locationState.cartItems && locationState.cartItems.length > 0) {
      const items = locationState.cartItems
        .filter((item: any) => item && item.productId)  // 유효한 상품만 필터링
        .map((item: any) => ({
          id: `${item.productId}-${item.optionId}`,
          productName: item.productName,
          size: item.optionDetails?.size?.replace("SIZE_", "") || "",
          discountPrice: item.discountPrice,
          productPrice: item.productPrice,
          discount: item.productPrice - item.discountPrice,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          selected: item.selected,
        }));

      // 변환된 상품 목록을 상태에 설정
      setState((prev) => ({ ...prev, items }));
    } else {
      throw new Error("주문 정보를 불러오는데 실패했습니다.");
    }
  }, [location.state]); // location.state가 변경될 때마다 재실행

  /**
   * 배송 정보의 특정 필드를 업데이트하는 함수
   * @param field 업데이트할 필드명 (name, phone, address 등)
   * @param value 새로운 값
   */
  const updateShippingInfo = (field: string, value: string) => {
    setState((prev) => ({
      ...prev,
      shippingInfo: {
        ...prev.shippingInfo,
        [field]: value,  // 동적으로 필드 업데이트
      },
    }));
  };

  /**
   * 배솨 요청사항 변경 처리 함수
   * "기타 (직접 입력)"을 선택한 경우에만 customRequest 유지
   * @param option 선택된 배송 요청사항 옵션
   */
  const handleDeliveryRequestChange = (option: string) => {
    setState((prev) => ({
      ...prev,
      shippingInfo: {
        ...prev.shippingInfo,
        request: option,
        // "기타" 옵션이 아니면 사용자 입력 내용 초기화
        customRequest:
          option === "기타 (직접 입력)" ? prev.shippingInfo.customRequest : "",
      },
    }));
  };

  /**
   * 포인트 사용 여부를 토글하는 함수
   * 비활성화할 때는 사용할 포인트도 0으로 초기화
   * @param enabled 포인트 사용 여부
   */
  const handlePointToggle = (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      usePoint: enabled,
      // 포인트 비활성화 시 사용할 포인트도 0으로 리셋
      usedPoints: enabled ? prev.usedPoints : 0,
    }));
  };

  // 모든 상태와 함수들을 반환
  return {
    ...state,                    // 현재 상태의 모든 값들 포함
    availablePoints,             // 사용 가능한 포인트
    updateShippingInfo,          // 배송 정보 업데이트 함수
    
    // 간단한 setter 함수들 (인라인 함수로 정의)
    setSelectedMethod: (method: string) =>
      setState((prev) => ({ ...prev, selectedMethod: method })),
    setUsePoint: (use: boolean) =>
      setState((prev) => ({ ...prev, usePoint: use })),
    setUsedPoints: (points: number) =>
      setState((prev) => ({ ...prev, usedPoints: points })),
    setIsAgree: (agree: boolean) =>
      setState((prev) => ({ ...prev, isAgree: agree })),
    setIsProcessing: (processing: boolean) =>
      setState((prev) => ({ ...prev, isProcessing: processing })),
    
    // 복잡한 로직을 포함하는 핸들러 함수들
    handleDeliveryRequestChange,
    handlePointToggle,
  };
};
