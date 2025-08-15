import React, { useEffect, useState } from "react";
import styled from "styled-components";
// 타입 정의
import { OrderListItem } from "types/order"; // 주문 아이템 타입
import { OrderService } from "api/orderService"; // 주문 관련 API 서비스
import { toUrl } from "utils/common/images"; // 이미지 URL 변환 유틸리티
import Warning from "components/modal/Warning"; // 경고 모달 컴포넌트

/**
 * 주문 상태 타입 정의
 * - ORDERED: 주문완료
 * - SHIPPED: 배송중
 * - DELIVERED: 배송완료
 * - CANCELLED: 취소
 * - RETURNED: 반품
 * - ALL: 전체 (필터용)
 */
type OrderStatus =
  | "ORDERED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "ALL";

// 주문 상태 목록 (필터 버튼에 사용)
const orderStatusList: { key: OrderStatus; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "ORDERED", label: "주문완료" },
  { key: "SHIPPED", label: "배송중" },
  { key: "DELIVERED", label: "배송완료" },
  { key: "CANCELLED", label: "취소" },
  { key: "RETURNED", label: "반품" },
];

// 주문 상태별 배지 색상 정의
const statusColors: Record<string, string> = {
  ORDERED: "#eab308", // 노란색 (주문완료)
  SHIPPED: "#6366f1", // 보라색 (배송중)
  DELIVERED: "#22c55e", // 초록색 (배송완료)
  CANCELLED: "#ef4444", // 빨간색 (취소)
  RETURNED: "#64748b", // 회색 (반품)
};

// 주문 상태 한글 레이블 매핑
const statusLabels: Record<string, string> = {
  ORDERED: "주문완료",
  SHIPPED: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소",
  RETURNED: "반품",
};

// Styled Components
const Container = styled.div`
  background: #f7fafc;
  min-height: 100vh;
  padding: 40px 0;
`;

const Content = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 28px;
  margin-bottom: 8px;
  color: #1f2937;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  font-weight: 600;
  font-size: 15px;
  color: ${(props) => (props.active ? "#3b82f6" : "#64748b")};
  background: ${(props) => (props.active ? "#e0f2fe" : "none")};
  border: none;
  border-radius: 8px;
  padding: 7px 18px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? "#e0f2fe" : "#f1f5f9")};
  }
`;


const SearchContainer = styled.div`
  margin-bottom: 18px;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 420px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 15px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TableCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #e0e7ef;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
`;

const TableHeader = styled.thead`
  background: #f3f6fa;
  font-weight: 600;
  font-size: 15px;
`;

const TableHeaderCell = styled.th<{ align?: string; width?: number }>`
  text-align: ${(props) => props.align || "left"};
  padding: 16px 12px;
  border-bottom: 1px solid #e5e7eb;
  width: ${(props) => (props.width ? `${props.width}px` : "auto")};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  font-size: 15px;

  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td<{ align?: string; width?: number }>`
  text-align: ${(props) => props.align || "left"};
  padding: 18px 12px;
  vertical-align: top;
  width: ${(props) => (props.width ? `${props.width}px` : "auto")};
`;

const OrderId = styled.div`
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
`;

const OrderDate = styled.div`
  color: #64748b;
  font-size: 14px;
`;

const ProductItem = styled.div<{ isLast: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: ${(props) => (props.isLast ? "0" : "12px")};
`;

const ProductImage = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  background: #f3f6fa;
`;

const ProductInfo = styled.div``;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const ProductDetails = styled.div`
  color: #64748b;
  font-size: 14px;
`;

const StatusBadge = styled.span<{ status: string }>`
  background: ${(props) => statusColors[props.status] || "#64748b"};
  color: #fff;
  border-radius: 8px;
  padding: 4px 14px;
  font-weight: 600;
  font-size: 14px;
  display: inline-block;
`;

const EmptyState = styled.td`
  text-align: center;
  padding: 48px;
  color: #a3a3a3;
  font-size: 17px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px;
  color: #64748b;
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 48px;
  color: #ef4444;
  font-size: 16px;
`;

const ActionButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

const ActionButton = styled.button<{ variant: 'cancel' | 'return' }>`
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background-color: ${props => 
    props.variant === 'cancel' ? '#fee2e2' : '#f3f4f6'
  };
  color: ${props => 
    props.variant === 'cancel' ? '#dc2626' : '#374151'
  };
  
  &:hover {
    background-color: ${props => 
      props.variant === 'cancel' ? '#fecaca' : '#e5e7eb'
    };
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button<{
  active?: boolean;
  disabled?: boolean;
}>`
  padding: 8px 12px;
  border-radius: 6px;
  background-color: ${(props) => (props.active ? "#6366f1" : "#e5e7eb")};
  color: ${(props) => (props.active ? "#fff" : "#1f2937")};
  border: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-weight: 500;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.active ? "#5856eb" : "#d1d5db")};
  }
`;

/**
 * 사용자용 주문 내역 페이지 컴포넌트
 *
 * 기능:
 * - 사용자의 모든 주문 목록 조회
 * - 주문 상태별 필터링 (전체, 주문완료, 배송중, 배송완료, 취소, 반품)
 * - 주문번호 및 상품명으로 검색
 * - 페이지네이션을 통한 대용량 데이터 처리
 *
 * API 사용:
 * - OrderService.getOrders(): 사용자 주문 목록 조회
 *
 * 라우팅:
 * - MyPage에서 "주문내역" 클릭 시 표시
 * - 독립적인 페이지로도 접근 가능
 */
const UserOrdersPage: React.FC = () => {
  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 (1부터 시작)
  const [orders, setOrders] = useState<OrderListItem[]>([]); // 현재 페이지의 주문 목록
  const [filter, setFilter] = useState<OrderStatus>("ALL"); // 선택된 상태 필터
  const [search, setSearch] = useState(""); // 검색어
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [totalElements, setTotalElements] = useState(0); // 전체 주문 수
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null); // 상태 업데이트 중인 주문 ID
  
  // 모달 상태 관리
  const [warningModal, setWarningModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const itemsPerPage = 10; // 페이지당 표시할 주문 수


  /**
   * 페이지별 주문 목록을 가져오는 함수
   * @param page - 페이지 번호 (0부터 시작)
   * @param status - 필터링할 주문 상태 (선택사항)
   */
  const fetchOrders = async (page: number = 0, status?: OrderStatus) => {
    try {
      setLoading(true);
      setError(null);

      // "ALL" 필터는 undefined로 전달하여 모든 상태 조회
      const statusParam = status === "ALL" ? undefined : status;
      const response = await OrderService.getOrders(
        page,
        itemsPerPage,
        statusParam
      );

      setOrders(response.content); // 주문 목록 설정
      setTotalPages(response.totalPages); // 총 페이지 수 설정
      setTotalElements(response.totalElements); // 총 주문 수 설정
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      setError("주문 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchOrders(0, filter); // 첫 페이지 주문 목록 로드
  }, []);

  // 필터 변경 시 첫 페이지부터 다시 로드
  useEffect(() => {
    fetchOrders(0, filter);
  }, [filter]);

  // 페이지 변경 시 해당 페이지 데이터 로드
  useEffect(() => {
    fetchOrders(currentPage - 1, filter); // API는 0부터 시작하므로 -1
  }, [currentPage]);

  // 필터 변경 시 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  /**
   * 검색어를 기준으로 주문 목록을 필터링
   * 주문번호 또는 상품명에서 검색어를 찾음
   */
  const filteredOrders = search
    ? orders.filter((order) => {
        return (
          String(order.orderId).includes(search) || // 주문번호로 검색
          order.items.some((item) => item.productName.includes(search)) // 상품명으로 검색
        );
      })
    : orders;

  /**
   * 주문 상태 변경 확인 모달을 여는 함수
   */
  const showStatusChangeModal = (orderId: number, newStatus: 'CANCELLED' | 'RETURNED') => {
    const statusText = newStatus === 'CANCELLED' ? '취소' : '반품';
    
    setWarningModal({
      open: true,
      title: `주문 ${statusText}`,
      message: `정말로 이 주문을 ${statusText}하시겠습니까?`,
      onConfirm: () => handleStatusChange(orderId, newStatus)
    });
  };

  /**
   * 주문 상태를 변경하는 함수 (취소/반품)
   */
  const handleStatusChange = async (orderId: number, newStatus: 'CANCELLED' | 'RETURNED') => {
    setWarningModal(prev => ({ ...prev, open: false }));
    
    try {
      setUpdatingOrderId(orderId);
      await OrderService.updateUserOrderStatus(orderId, newStatus);
      
      // 주문 목록 다시 로드
      await fetchOrders(currentPage - 1, filter);
      
      alert(`주문이 성공적으로 ${newStatus === 'CANCELLED' ? '취소' : '반품'}되었습니다.`);
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      const errorMessage = error.response?.data?.message || `주문 ${newStatus === 'CANCELLED' ? '취소' : '반품'}에 실패했습니다.`;
      alert(errorMessage);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /**
   * 주문 상태에 따라 가능한 액션을 결정하는 함수
   */
  const getAvailableActions = (orderStatus: string) => {
    switch (orderStatus) {
      case 'ORDERED':
        return ['CANCELLED']; // 주문완료 상태에서는 취소만 가능
      case 'DELIVERED':
        return ['RETURNED']; // 배송완료 상태에서는 반품만 가능
      default:
        return []; // 다른 상태에서는 액션 불가
    }
  };


  // 메인 렌더링: 주문 내역 페이지 UI
  return (
    <Container>
      <Content>
        {/* 페이지 헤더 */}
        <Header>
          <Title>내 주문 내역</Title>
          <Subtitle>내가 주문한 상품들의 내역을 확인할 수 있습니다.</Subtitle>
        </Header>

        {/* 주문 상태별 필터 버튼들 */}
        <FilterContainer>
          {orderStatusList.map((status) => (
            <FilterButton
              key={status.key}
              active={filter === status.key} // 현재 선택된 필터 하이라이트
              onClick={() => setFilter(status.key)} // 필터 변경
            >
              {status.label}
            </FilterButton>
          ))}
        </FilterContainer>

        {/* 검색 입력 필드 */}
        <SearchContainer>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)} // 실시간 검색
            placeholder="주문번호 또는 상품명으로 검색"
          />
        </SearchContainer>

        {/* 주문 목록 테이블 */}
        <TableCard>
          {loading ? (
            // 로딩 중일 때 표시
            <LoadingState>주문 목록을 불러오는 중...</LoadingState>
          ) : error ? (
            // 에러 발생 시 표시
            <ErrorState>{error}</ErrorState>
          ) : (
            <Table>
              {/* 테이블 헤더 */}
              <TableHeader>
                <tr>
                  <TableHeaderCell align="left">주문 정보</TableHeaderCell>
                  <TableHeaderCell align="left">상품 정보</TableHeaderCell>
                  <TableHeaderCell align="right" width={120}>
                    결제 금액
                  </TableHeaderCell>
                  <TableHeaderCell align="center" width={150}>
                    주문 상태
                  </TableHeaderCell>
                  <TableHeaderCell align="center" width={120}>
                    액션
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              {/* 테이블 본문 */}
              <TableBody>
                {filteredOrders.length === 0 ? (
                  // 주문이 없을 때 빈 상태 표시
                  <tr>
                    <EmptyState colSpan={5}>주문이 없습니다.</EmptyState>
                  </tr>
                ) : (
                  // 주문 목록을 테이블 행으로 렌더링
                  filteredOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      {/* 주문 정보 (주문번호, 주문일자) */}
                      <TableCell>
                        <OrderId>#{order.orderId}</OrderId>
                        <OrderDate>
                          {new Date(order.orderedAt).toLocaleDateString()}
                        </OrderDate>
                      </TableCell>

                      {/* 상품 정보 (이미지, 이름, 수량, 가격) */}
                      <TableCell>
                        {order.items.map((item, index) => (
                          <ProductItem
                            key={item.productId}
                            isLast={index === order.items.length - 1} // 마지막 아이템은 마진 제거
                          >
                            <ProductImage
                              src={toUrl(item.imageUrl)}
                              alt={item.productName}
                              onError={(e) => {
                                // 이미지 로드 실패 시 기본 이미지로 대체
                                e.currentTarget.src = "/placeholder-image.jpg";
                              }}
                            />
                            <ProductInfo>
                              <ProductName>{item.productName}</ProductName>
                              <ProductDetails>
                                수량: {item.quantity}개 | 가격:{" "}
                                {item.totalPrice.toLocaleString()}원
                              </ProductDetails>
                            </ProductInfo>
                          </ProductItem>
                        ))}
                      </TableCell>

                      {/* 최종 결제 금액 */}
                      <TableCell align="right" width={120}>
                        {order.finalPrice.toLocaleString()}원
                      </TableCell>

                      {/* 주문 상태 배지 */}
                      <TableCell align="center" width={150}>
                        <StatusBadge status={order.status}>
                          {statusLabels[order.status] || order.status}
                        </StatusBadge>
                      </TableCell>

                      {/* 액션 버튼들 (취소/반품) */}
                      <TableCell align="center" width={120}>
                        <ActionButtonContainer>
                          {getAvailableActions(order.status).map((action) => (
                            <ActionButton
                              key={action}
                              variant={action === 'CANCELLED' ? 'cancel' : 'return'}
                              onClick={() => showStatusChangeModal(order.orderId, action as 'CANCELLED' | 'RETURNED')}
                              disabled={updatingOrderId === order.orderId}
                            >
                              {updatingOrderId === order.orderId
                                ? '처리중...'
                                : action === 'CANCELLED'
                                ? '주문취소'
                                : '반품신청'
                              }
                            </ActionButton>
                          ))}
                          {getAvailableActions(order.status).length === 0 && (
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                          )}
                        </ActionButtonContainer>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableCard>

        {/* 페이지네이션 (총 페이지가 1보다 클 때만 표시) */}
        {totalPages > 1 && (
          <PaginationContainer>
            {/* 이전 페이지 버튼 */}
            <PaginationButton
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1} // 첫 페이지에서는 비활성화
            >
              이전
            </PaginationButton>

            {/* 페이지 번호 버튼들 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationButton
                key={page}
                active={currentPage === page} // 현재 페이지 하이라이트
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PaginationButton>
            ))}

            {/* 다음 페이지 버튼 */}
            <PaginationButton
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages} // 마지막 페이지에서는 비활성화
            >
              다음
            </PaginationButton>
          </PaginationContainer>
        )}

        {/* 경고 모달 */}
        <Warning
          open={warningModal.open}
          title={warningModal.title}
          message={warningModal.message}
          onConfirm={warningModal.onConfirm}
          onCancel={() => setWarningModal(prev => ({ ...prev, open: false }))}
        />
      </Content>
    </Container>
  );
};

export default UserOrdersPage;
