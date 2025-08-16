import { useState, useEffect, useCallback } from "react";
import { OrderService } from "../../api/orderService";

export interface DashboardStats {
  todaySales: number;
  weeklySales: number; // 전체 매출 대신 주간 매출
  newOrdersCount: number;
  totalOrdersCount: number;
  shippingCount: number;
  deliveredCount: number; // 배송 완료 건수 추가
  newReviewsCount: number;
  totalReviewsCount: number;
}

export interface RecentOrder {
  orderId: number;
  productName: string;
  finalPrice: number;
  status: string;
  orderedAt: string;
  imageUrl: string;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    weeklySales: 0,
    newOrdersCount: 0,
    totalOrdersCount: 0,
    shippingCount: 0,
    deliveredCount: 0,
    newReviewsCount: 0,
    totalReviewsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatStatusText = (status: string): string => {
    switch (status) {
      case "ORDERED":
        return "주문완료";
      case "SHIPPED":
        return "배송중";
      case "DELIVERED":
        return "배송완료";
      case "CANCELLED":
        return "주문취소";
      case "RETURNED":
        return "반품";
      default:
        return status;
    }
  };

  const isToday = (dateString: string): boolean => {
    const today = new Date();
    const orderDate = new Date(dateString);
    
    return (
      today.getFullYear() === orderDate.getFullYear() &&
      today.getMonth() === orderDate.getMonth() &&
      today.getDate() === orderDate.getDate()
    );
  };

  const isThisWeek = (dateString: string): boolean => {
    const today = new Date();
    const orderDate = new Date(dateString);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return orderDate >= oneWeekAgo && orderDate <= today;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 주문 데이터를 가져옴 (첫 50개 주문으로 충분할 것)
      const ordersResponse = await OrderService.getSellerOrders(0, 50, "ALL");
      const allOrders = ordersResponse.content;

      // 오늘 날짜 필터링
      const todayOrders = allOrders.filter(order => isToday(order.orderedAt));
      
      // 이번 주 주문 필터링
      const weeklyOrders = allOrders.filter(order => isThisWeek(order.orderedAt));
      
      // 통계 계산
      const todaySales = todayOrders.reduce((sum, order) => sum + order.finalPrice, 0);
      const weeklySales = weeklyOrders.reduce((sum, order) => sum + order.finalPrice, 0);
      const newOrdersCount = todayOrders.length;
      const totalOrdersCount = allOrders.length;
      const shippingCount = allOrders.filter(order => order.status === "SHIPPED").length;
      const deliveredCount = allOrders.filter(order => order.status === "DELIVERED").length;
      
      // Mock 데이터 - 실제 리뷰 API가 없으므로
      const newReviewsCount = Math.floor(Math.random() * 5) + 1; // 1-5개
      const totalReviewsCount = Math.floor(Math.random() * 50) + 20; // 20-70개

      setStats({
        todaySales,
        weeklySales,
        newOrdersCount,
        totalOrdersCount,
        shippingCount,
        deliveredCount,
        newReviewsCount,
        totalReviewsCount,
      });

      // 최근 주문 4개 (최신순)
      const recentOrdersData: RecentOrder[] = allOrders
        .slice(0, 4)
        .map(order => ({
          orderId: order.orderId,
          productName: order.items[0]?.productName || "상품명 없음",
          finalPrice: order.finalPrice,
          status: formatStatusText(order.status),
          orderedAt: order.orderedAt,
          imageUrl: order.items[0]?.imageUrl || "",
        }));

      setRecentOrders(recentOrdersData);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("대시보드 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    recentOrders,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};