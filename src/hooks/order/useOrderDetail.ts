import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { OrderService } from "../../api/orderService";
import { OrderDetail } from "../../types/order";

/**
 * 주문 상세 정보 관리 훅
 *
 * 라우터의 state로 전달받은 orderId를 사용하여
 * 서버에서 주문의 상세 정보를 가져옵니다.
 * 로딩과 에러 상태를 포함하여 안전하게 데이터를 처리합니다.
 */

// 훅에서 반환할 값들의 타입 정의
interface UseOrderDetailReturn {
  orderDetail: OrderDetail | null;  // 주문 상세 정보 (로딩 중이거나 에러 시 null)
  loading: boolean;                 // 로딩 상태
  error: string | null;             // 에러 메시지
}

export const useOrderDetail = (): UseOrderDetailReturn => {
  const location = useLocation();
  
  // 주문 상세 정보 상태
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  // 로딩 상태 (초기값은 true로 설정)
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  // 라우터 state에서 주문 ID와 적립 포인트 추출
  const orderId = location.state?.orderId;
  const earnedPoints = location.state?.earnedPoints;

  useEffect(() => {
    /**
     * 서버에서 주문 상세 정보를 불러오는 비동기 함수
     */
    const loadOrderDetail = async () => {
      // 주문 ID가 없는 경우 에러 처리
      if (!orderId) {
        setError("주문 ID가 없습니다. 잘못된 접근입니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);   // 로딩 시작
        
        // OrderService를 통해 주문 상세 정보 요청
        const detail = await OrderService.getOrderDetail(orderId);
        
        // 적립 포인트가 라우터 state에서 전달된 경우 병합
        if (earnedPoints !== undefined) {
          detail.earnedPoints = earnedPoints;
        }
        
        setOrderDetail(detail); // 성공시 데이터 설정
        setError(null);         // 이전 에러 초기화
      } catch (err: any) {
        // 에러 발생 시 에러 메시지 설정 및 데이터 초기화
        setError("주문 정보를 불러오는데 실패했습니다.");
        setOrderDetail(null);
      } finally {
        setLoading(false);  // 성공/실패 관계없이 로딩 종료
      }
    };

    loadOrderDetail();
  }, [orderId]); // orderId가 변경될 때마다 재실행

  return {
    orderDetail,
    loading,
    error,
  };
};
