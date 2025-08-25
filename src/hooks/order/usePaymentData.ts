import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PaymentItem } from "../../types/order";
import CartService from "../../api/cartService";
import { UserProfileService, UserProfileData } from "../../api/userProfileService";
import { AddressService } from "../../api/addressService";
import { AddressResponse } from "../../types/types";
import { pointService, PointBalance } from "../../api/pointService";
import { couponService } from "../../api/couponService";
import { CouponResponse } from "../../types/types";
import { getUserEmailFromToken } from "../../utils/auth/tokenUtils";

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
  // 새로 추가된 데이터들
  userProfile: UserProfileData | null;     // 사용자 프로필 정보
  addresses: AddressResponse[];            // 배송지 목록
  selectedAddress: AddressResponse | null; // 선택된 배송지
  pointBalance: PointBalance | null;       // 포인트 잔액 정보
  availableCoupons: CouponResponse[];      // 사용 가능한 쿠폰 목록
  selectedCoupon: CouponResponse | null;   // 선택된 쿠폰
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
  // 새로 추가된 함수들
  setSelectedAddress: (address: AddressResponse | null) => void;     // 배송지 선택 함수
  setSelectedCoupon: (coupon: CouponResponse | null) => void;        // 쿠폰 선택 함수
  loadInitialData: () => Promise<void>;                              // 초기 데이터 로딩 함수
  applyCouponByCode: (couponCode: string) => Promise<void>;       // 쿠폰 코드로 쿠폰 적용 함수
}

export const usePaymentData = (): UsePaymentDataReturn => {
  const location = useLocation();

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
    // 새로 추가된 상태들
    userProfile: null,                // 사용자 프로필 (초기에는 null)
    addresses: [],                    // 배송지 목록 (초기에는 빈 배열)
    selectedAddress: null,            // 선택된 배송지 (초기에는 null)
    pointBalance: null,               // 포인트 잔액 (초기에는 null)
    availableCoupons: [],             // 사용 가능한 쿠폰 목록 (초기에는 빈 배열)
    selectedCoupon: null,             // 선택된 쿠폰 (초기에는 null)
  });

  /**
   * 주문 페이지에서 필요한 모든 초기 데이터를 로딩하는 함수
   * - 사용자 프로필 정보
   * - 배송지 목록
   * - 포인트 잔액 정보
   * - 사용 가능한 쿠폰 목록
   * - 사용자 레벨 정보
   */
  const loadInitialData = async () => {
    try {
      const userEmail = getUserEmailFromToken();
      if (!userEmail) {
        throw new Error("사용자 인증 정보를 찾을 수 없습니다.");
      }

      // 모든 초기 데이터를 병렬로 조회
      const [userProfile, addresses, pointBalance, availableCoupons] = await Promise.all([
        UserProfileService.getUserProfile(),
        AddressService.getAddresses(),
        pointService.getPointBalance(),
        couponService.getAvailableCoupons(userEmail),
      ]);

      // 기본 배송지 찾기
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0] || null;

      setState(prev => ({
        ...prev,
        userProfile,
        addresses,
        selectedAddress: defaultAddress,
        pointBalance,
        availableCoupons,
      }));

      // 프로필 정보로 배송 정보 자동 채우기
      if (userProfile) {
        setState(prev => ({
          ...prev,
          shippingInfo: {
            ...prev.shippingInfo,
            name: prev.shippingInfo.name || userProfile.name || "",
            phone: prev.shippingInfo.phone || userProfile.phone || "",
          },
        }));
      }

      // 기본 배송지로 배송 정보 자동 채우기
      if (defaultAddress) {
        setState(prev => ({
          ...prev,
          shippingInfo: {
            ...prev.shippingInfo,
            name: prev.shippingInfo.name || defaultAddress.recipientName,
            phone: prev.shippingInfo.phone || defaultAddress.recipientPhone,
            zipcode: defaultAddress.zipCode,
            address: defaultAddress.addressLine1,
            detailAddress: defaultAddress.addressLine2 || "",
          },
        }));
      }
    } catch (error) {
      console.error("초기 데이터 로딩 실패:", error);
      // 초기 데이터 로딩 실패는 주문 프로세스를 완전히 차단하지 않음
    }
  };

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
      
      // 바로 주문인 경우에도 초기 데이터 로딩 (사용자 프로필, 배송지, 포인트, 쿠폰 등)
      loadInitialData();
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

    // 초기 데이터 로딩 (사용자 프로필, 배송지, 포인트, 쿠폰 등)
    loadInitialData();
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

  /**
   * 배송지를 선택하는 함수
   * @param address 선택된 배송지
   */
  const setSelectedAddress = (address: AddressResponse | null) => {
    setState(prev => ({ ...prev, selectedAddress: address }));
    
    // 배송지 선택 시 배송 정보도 자동으로 업데이트
    if (address) {
      setState(prev => ({
        ...prev,
        shippingInfo: {
          ...prev.shippingInfo,
          name: address.recipientName,
          phone: address.recipientPhone,
          zipcode: address.zipCode,
          address: address.addressLine1,
          detailAddress: address.addressLine2 || "",
        },
      }));
    }
  };

  /**
   * 쿠폰을 선택하는 함수
   * @param coupon 선택된 쿠폰
   */
  const setSelectedCoupon = (coupon: CouponResponse | null) => {
    setState(prev => ({ ...prev, selectedCoupon: coupon }));
  };

  /**
   * 쿠폰 코드를 사용하여 쿠폰을 적용하는 함수
   * @param couponCode 적용할 쿠폰 코드
   */
  const applyCouponByCode = async (couponCode: string) => {
    try {
      const userEmail = getUserEmailFromToken();
      if (!userEmail) {
        throw new Error("사용자 인증 정보를 찾을 수 없습니다.");
      }

      // 쿠폰 사용 API 호출
      const appliedCoupon = await couponService.useCoupon({
        email: userEmail,
        couponCode: couponCode
      });
      
      // 적용된 쿠폰을 선택된 쿠폰으로 설정
      setState(prev => ({ 
        ...prev, 
        selectedCoupon: appliedCoupon,
        // 적용된 쿠폰을 사용 가능한 쿠폰 목록에도 추가 (중복 방지)
        availableCoupons: prev.availableCoupons.some(c => c.couponName === appliedCoupon.couponName) 
          ? prev.availableCoupons 
          : [appliedCoupon, ...prev.availableCoupons]
      }));
    } catch (error) {
      // 에러는 호출하는 컴포넌트에서 처리하도록 다시 throw
      throw error;
    }
  };

  // 모든 상태와 함수들을 반환
  return {
    ...state,                    // 현재 상태의 모든 값들 포함
    availablePoints: state.pointBalance?.currentPoints || 0, // 실제 포인트 잔액 사용
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
    setSelectedAddress,
    setSelectedCoupon,
    loadInitialData,
    applyCouponByCode,
  };
};
