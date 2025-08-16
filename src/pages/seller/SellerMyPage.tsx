import React, { useState, useEffect } from "react";
import * as echarts from "echarts";
import SellerOrdersPage from "../order/SellerOrdersPage";
import StoreService from "../../api/storeService";
import { SellerStore } from "../../types/products";
import { toUrl } from "utils/common/images";
import { useDashboardStats } from "../../hooks/seller/useDashboardStats";

const SellerMyPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState("일간");
  const [storeInfo, setStoreInfo] = useState<SellerStore | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats, recentOrders, loading: statsLoading, error: statsError } = useDashboardStats();

  const generateChartData = (
    period: string
  ): { xAxisData: string[]; seriesData: number[] } => {
    let xAxisData: string[] = [];
    let seriesData: number[] = [];

    // Mock 데이터로 현실적인 매출 패턴 생성
    // 실제 API가 준비되면 대체 가능
    switch (period) {
      case "일간":
        xAxisData = ["09:00", "12:00", "15:00", "18:00", "21:00"];
        // 일반적인 일일 매출 패턴: 오후와 저녁에 높은 매출
        seriesData = [120000, 180000, 150000, 280000, 220000];
        break;
      case "주간":
        xAxisData = ["월", "화", "수", "목", "금", "토", "일"];
        // 주말에 높은 매출 패턴
        seriesData = [850000, 920000, 880000, 950000, 1020000, 1150000, 980000];
        break;
      case "월간":
        xAxisData = ["1주", "2주", "3주", "4주"];
        // 월 말에 높은 매출 패턴 (급여일 후 소비 증가)
        seriesData = [3800000, 4200000, 3900000, 4500000];
        break;
    }

    return { xAxisData, seriesData };
  };

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const store = await StoreService.getSellerStore();
        setStoreInfo(store);
      } catch (error) {
        console.error("가게 정보 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  useEffect(() => {
    // 대시보드가 활성 상태일 때만 차트 생성
    if (activeMenu !== "dashboard") return;
    
    const chartDom = document.getElementById("salesChart");
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);
    const { xAxisData, seriesData } = generateChartData(selectedPeriod);

    const option = {
      animation: false,
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          return `${
            params[0].name
          }<br/>매출: ₩${params[0].value.toLocaleString()}`;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: "#E5E7EB",
          },
        },
        axisLabel: {
          color: "#6B7280",
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: "#6B7280",
          formatter: (value: number) => `₩${(value / 10000).toFixed(0)}만`,
        },
        splitLine: {
          lineStyle: {
            color: "#E5E7EB",
          },
        },
      },
      series: [
        {
          data: seriesData,
          type: "line",
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: "#3B82F6",
          },
          itemStyle: {
            color: "#3B82F6",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(59, 130, 246, 0.2)",
                },
                {
                  offset: 1,
                  color: "rgba(59, 130, 246, 0)",
                },
              ],
            },
          },
        },
      ],
    };

    myChart.setOption(option);

    return () => {
      myChart.dispose();
    };
  }, [selectedPeriod, activeMenu]); // activeMenu 의존성 추가

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                {storeInfo?.logo ? (
                  <img
                    src={toUrl(storeInfo.logo)}
                    alt="가게 로고"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <i className="fas fa-store text-white text-lg"></i>
                )}
              </div>
              <div>
                <h3 className="text-gray-800 font-semibold">
                  {loading
                    ? "로딩 중..."
                    : storeInfo?.storeName || "가게명 없음"}
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-500">
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                    <i className="fas fa-star text-xs"></i>
                  </div>
                  <span className="text-gray-600 text-sm">4.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-2">
            {[
              {
                id: "dashboard",
                icon: "fas fa-tachometer-alt",
                label: "대시보드",
              },
              { id: "products", icon: "fas fa-box", label: "상품 관리" },
              {
                id: "orders",
                icon: "fas fa-shopping-cart",
                label: "주문/배송 관리",
              },
              { id: "sales", icon: "fas fa-chart-line", label: "매출/정산" },
              { id: "reviews", icon: "fas fa-star", label: "리뷰 관리" },
              {
                id: "inquiries",
                icon: "fas fa-question-circle",
                label: "문의 관리",
              },
              {
                id: "promotions",
                icon: "fas fa-bullhorn",
                label: "프로모션 관리",
              },
              { id: "settings", icon: "fas fa-cog", label: "설정" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeMenu === item.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeMenu === "orders" ? (
            <SellerOrdersPage />
          ) : (
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    대시보드
                  </h2>
                  <p className="text-gray-600">
                    {loading
                      ? "정보를 불러오는 중..."
                      : storeInfo?.description || "가게 설명이 없습니다."}
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {statsLoading ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm animate-pulse"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="w-24 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))
                  ) : statsError ? (
                    <div className="col-span-4 text-center text-red-600 py-8">
                      {statsError}
                    </div>
                  ) : (
                    [
                      {
                        title: "매출 현황",
                        mainLabel: "오늘",
                        mainValue: `₩${stats.todaySales.toLocaleString()}`,
                        subLabel: "이번 주",
                        subValue: `₩${stats.weeklySales.toLocaleString()}`,
                        icon: "fas fa-won-sign",
                        color: "from-green-400 to-green-600",
                      },
                      {
                        title: "주문 현황",
                        mainLabel: "신규",
                        mainValue: stats.newOrdersCount.toString(),
                        subLabel: "전체",
                        subValue: stats.totalOrdersCount.toString(),
                        icon: "fas fa-shopping-bag",
                        color: "from-blue-400 to-blue-600",
                      },
                      {
                        title: "배송 현황",
                        mainLabel: "배송 중",
                        mainValue: stats.shippingCount.toString(),
                        subLabel: "배송 완료",
                        subValue: stats.deliveredCount.toString(),
                        icon: "fas fa-truck",
                        color: "from-orange-400 to-orange-600",
                      },
                      {
                        title: "리뷰 현황",
                        mainLabel: "신규",
                        mainValue: stats.newReviewsCount.toString(),
                        subLabel: "전체",
                        subValue: stats.totalReviewsCount.toString(),
                        icon: "fas fa-star",
                        color: "from-purple-400 to-purple-600",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}
                          >
                            <i className={`${stat.icon} text-white text-lg`}></i>
                          </div>
                        </div>
                        <h3 className="text-gray-600 text-sm mb-3 font-medium">
                          {stat.title}
                        </h3>
                        
                        {/* 주요 지표 */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{stat.mainLabel}</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">
                            {stat.mainValue}
                          </p>
                        </div>
                        
                        {/* 보조 지표 */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{stat.subLabel}</span>
                            <span className="text-sm font-semibold text-gray-600">
                              {stat.subValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Charts and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Sales Chart */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        매출 현황
                      </h3>
                      <div className="flex space-x-2">
                        {["일간", "주간", "월간"].map((period) => (
                          <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-3 py-1 text-sm transition-colors cursor-pointer whitespace-nowrap rounded ${
                              selectedPeriod === period
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div
                      className="h-64 rounded-lg border border-gray-200"
                      id="salesChart"
                    ></div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      최근 주문
                    </h3>
                    <div className="space-y-4">
                      {statsLoading ? (
                        // Loading skeleton for recent orders
                        Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse"
                          >
                            <div className="flex-1">
                              <div className="w-48 h-4 bg-gray-200 rounded mb-1"></div>
                              <div className="w-16 h-3 bg-gray-200 rounded"></div>
                            </div>
                            <div className="text-right">
                              <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
                              <div className="w-16 h-5 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fas fa-shopping-cart text-4xl mb-4 text-gray-300"></i>
                          <p>최근 주문이 없습니다.</p>
                        </div>
                      ) : (
                        recentOrders.map((order) => (
                          <div
                            key={order.orderId}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {order.imageUrl && (
                                <img
                                  src={toUrl(order.imageUrl)}
                                  alt={order.productName}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = toUrl("images/common/no-image.png");
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium text-sm">
                                  {order.productName}
                                </p>
                                <p className="text-gray-500 text-xs">#{order.orderId}</p>
                                <p className="text-gray-400 text-xs">
                                  {new Date(order.orderedAt).toLocaleDateString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-800 font-semibold text-sm">
                                ₩{order.finalPrice.toLocaleString()}
                              </p>
                              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Inquiries and Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Inquiries */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      최근 문의
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          user: "김**님",
                          question: "배송 일정 문의드립니다",
                          time: "2시간 전",
                          status: "미답변",
                        },
                        {
                          user: "이**님",
                          question: "상품 교환 가능한가요?",
                          time: "5시간 전",
                          status: "답변완료",
                        },
                        {
                          user: "박**님",
                          question: "사료 성분 문의",
                          time: "1일 전",
                          status: "미답변",
                        },
                      ].map((inquiry, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium text-sm">
                              {inquiry.question}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {inquiry.user} • {inquiry.time}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              inquiry.status === "미답변"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {inquiry.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      최근 리뷰
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          user: "최**님",
                          rating: 5,
                          review: "사료 품질이 정말 좋아요!",
                          time: "1시간 전",
                        },
                        {
                          user: "정**님",
                          rating: 4,
                          review: "배송이 빨라서 만족합니다",
                          time: "3시간 전",
                        },
                        {
                          user: "한**님",
                          rating: 5,
                          review: "우리 강아지가 너무 좋아해요",
                          time: "6시간 전",
                        },
                      ].map((review, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-800 font-medium text-sm">
                                {review.user}
                              </span>
                              <div className="flex text-yellow-400">
                                {[...Array(review.rating)].map((_, i) => (
                                  <i
                                    key={i}
                                    className="fas fa-star text-xs"
                                  ></i>
                                ))}
                              </div>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {review.time}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {review.review}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerMyPage;
