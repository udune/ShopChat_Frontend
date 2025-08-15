import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartService } from "../../api/cartService";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "hooks/cart/useCart";
import { ProductDetail } from "types/products";
import { SelectedOptions } from "./useProductOptions";

/**
 * 상품 상세 페이지 액션 처리 훅
 *
 * 상품 상세 페이지에서 수행할 수 있는 주요 액션들을 처리합니다:
 * - 장바구니에 상품 추가
 * - 바로 주문 (장바구니 경유 없이 결제 페이지로 이동)
 * - 사용자 및 옵션 선택 유효성 검사
 *
 * @param product 상품 상세 정보
 * @param selectedOptions 사용자가 선택한 옵션 목록 (사이즈, 수량 등)
 */
export const useProductActions = (
  product: ProductDetail | null,
  selectedOptions: SelectedOptions[]
) => {
  const { user } = useAuth();                    // 인증 상태 및 사용자 정보
  const { updateCartItemCount } = useCart();      // 장바구니 아이템 수 업데이트 함수
  const navigate = useNavigate();                 // 페이지 네비게이션
  const [loading, setLoading] = useState(false);  // 로딩 상태 (바로 주문 시 사용)

  /**
   * 사용자 인증 및 권한 유효성 검사 함수
   * 로그인 여부와 사용자 타입(일반 사용자)을 확인
   * @param onError 에러 발생 시 호출할 콜백 함수
   * @returns 유효성 검사 결과 (true: 유효, false: 무효)
   */
  const validateUser = (onError: (message: string) => void): boolean => {
    // 로그인 상태 확인
    if (!user) {
      onError("로그인이 필요한 서비스입니다.");
      return false;
    }

    // 사용자 타입 확인 (일반 사용자만 장바구니/주문 기능 사용 가능)
    if (user.userType !== "user") {
      onError("일반 사용자만 이용할 수 있는 서비스입니다.");
      return false;
    }

    return true;
  };

  /**
   * 상품 옵션 선택 유효성 검사 함수
   * 사용자가 사이즈 등의 옵션을 선택했는지 확인
   * @param onError 에러 발생 시 호출할 콜백 함수
   * @returns 유효성 검사 결과 (true: 유효, false: 무효)
   */
  const validateOptions = (onError: (message: string) => void): boolean => {
    // 선택된 옵션이 없는 경우 에러
    if (selectedOptions.length === 0) {
      onError("사이즈를 선택해주세요.");
      return false;
    }
    return true;
  };

  /**
   * 장바구니에 상품을 추가하는 함수
   * 모든 선택된 옵션에 대해 장바구니 추가 요청을 순차적으로 수행
   * @param onSuccess 성공 시 호출할 콜백 함수
   * @param onError 에러 발생 시 호출할 콜백 함수
   * @param clearOptions 성공 후 선택된 옵션들을 초기화할 함수
   */
  const handleAddToCart = async (
    onSuccess: (message: string) => void,
    onError: (message: string) => void,
    clearOptions: () => void
  ) => {
    // 사용자 인증 및 옵션 선택 유효성 검사
    if (!validateUser(onError) || !validateOptions(onError)) return;

    try {
      // 선택된 모든 옵션에 대해 장바구니 추가 요청
      for (const option of selectedOptions) {
        await CartService.addCartItem({
          optionId: option.optionId,                         // 선택된 옵션 ID (사이즈 등)
          imageId: product?.images[0].imageId || 1,           // 처첫 번째 이미지 ID 사용
          quantity: option.quantity,                          // 선택된 수량
        });
      }

      // 장바구니 아이템 수 업데이트 (헤더의 장바구니 배지 업데이트용)
      await updateCartItemCount();
      // 성공 메시지 표시
      onSuccess("장바구니에 상품이 추가되었습니다.");
      // 선택된 옵션들 초기화
      clearOptions();
    } catch (err: any) {
      onError("장바구니 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /**
   * 바로 주문 처리 함수 (장바구니 경유 없이 바로 결제 페이지로 이동)
   * 선택된 상품 정보를 결제 페이지로 직접 전달하여 바로 주문 API를 사용
   * @param onError 에러 발생 시 호출할 콜백 함수
   */
  const handleDirectOrder = async (onError: (message: string) => void) => {
    // 사용자 인증 및 옵션 선택 유효성 검사
    if (!validateUser(onError) || !validateOptions(onError)) return;

    if (!product) {
      onError("상품 정보를 확인할 수 없습니다.");
      return;
    }

    try {
      setLoading(true);  // 로딩 상태 시작

      // 바로 주문을 위한 상품 정보 준비
      const directOrderItems = selectedOptions.map((option) => {
        // 선택된 옵션에 해당하는 실제 상품 옵션 찾기
        const productOption = product.options.find(opt => opt.optionId === option.optionId);
        
        return {
          optionId: option.optionId,
          imageId: product.images?.[0]?.imageId || 1, // 첫 번째 이미지 ID 사용
          quantity: option.quantity,
          // 결제 페이지에서 표시할 추가 정보들
          productId: product.productId,
          productName: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          gender: option.gender,                     // 성별 정보 추가
          size: option.size,                         // 사이즈 정보 (이미 선택된 옵션에서 가져옴)
          color: option.color,                       // 색상 정보 (이미 선택된 옵션에서 가져옴)
          imageUrl: product.images?.[0]?.url || "",
        };
      });

      // 결제 페이지로 이동 (바로 주문 정보와 함께)
      navigate("/payment", {
        state: {
          isDirectOrder: true,           // 바로 주문 플래그
          directOrderItems,              // 바로 주문할 상품 정보 목록
          productInfo: {                 // 추가 상품 정보
            productId: product.productId,
            productName: product.name,
            storeName: product.storeName,
          },
        },
      });
    } catch (error: any) {
      onError("주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);  // 성공/실패 관계없이 로딩 상태 해제
    }
  };

  // 모든 상품 액션 함수들과 상태를 반환
  return {
    handleAddToCart,     // 장바구니 추가 함수
    handleDirectOrder,   // 바로 주문 함수
    loading,             // 로딩 상태 (바로 주문 시에만 사용)
  };
};
