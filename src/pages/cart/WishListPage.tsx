import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import UserProtectedRoute from "components/UserProtectedRoute";
import { toUrl } from "utils/common/images";
import { useWishlist } from "hooks/cart/useWishlist";
import Warning from "components/modal/Warning";

// 스타일드 컴포넌트들
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
`;

const ItemCount = styled.span`
  font-size: 1rem;
  color: #6b7280;
`;

const WishGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const WishCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ProductLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductInfo = styled.div`
  padding: 16px;
`;

const ProductName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  line-height: 1.4;
`;


const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const DiscountPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #ef4444;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const DiscountBadge = styled.span`
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const AddedDate = styled.div`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const EmptyWishlist = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 24px;
`;

const ShoppingButton = styled.button`
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }
`;

const WishListPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { 
    wishlistItems, 
    wishlistCount, 
    removeFromWishlist, 
    loading, 
    error,
    fetchWishlist 
  } = useWishlist();
  
  const [isRemoving, setIsRemoving] = useState<number | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>("");

  // 찜한 상품 제거 버튼 클릭 시 모달 표시
  const handleRemoveClick = (productId: number, productName: string) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setShowRemoveModal(true);
  };

  // 찜한 상품 제거 확인
  const handleRemoveConfirm = async () => {
    if (!selectedProductId) return;
    
    setShowRemoveModal(false);
    setIsRemoving(selectedProductId);
    
    try {
      const success = await removeFromWishlist(selectedProductId);
      if (success) {
        // 성공 시 자동으로 목록이 새로고침됨
      } else {
        console.error("찜한 상품 제거 실패");
      }
    } catch (error) {
      console.error("찜한 상품 제거 실패:", error);
    } finally {
      setIsRemoving(null);
      setSelectedProductId(null);
      setSelectedProductName("");
    }
  };

  // 모달 취소
  const handleRemoveCancel = () => {
    setShowRemoveModal(false);
    setSelectedProductId(null);
    setSelectedProductName("");
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 할인된 가격 계산 함수
  const calculateDiscountPrice = (originalPrice: number, discountType: string, discountValue: number): number => {
    if (discountType === "RATE_DISCOUNT") {
      return originalPrice * (1 - discountValue / 100);
    } else if (discountType === "FIXED_DISCOUNT") {
      return Math.max(0, originalPrice - discountValue);
    }
    return originalPrice;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <Container>
        <Header>
          <Title>찜한 상품</Title>
          <ItemCount>로딩 중...</ItemCount>
        </Header>
        <EmptyWishlist>
          <EmptyIcon>⏳</EmptyIcon>
          <EmptyTitle>찜한 상품을 불러오고 있습니다...</EmptyTitle>
        </EmptyWishlist>
      </Container>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <Container>
        <Header>
          <Title>찜한 상품</Title>
          <ItemCount>오류 발생</ItemCount>
        </Header>
        <EmptyWishlist>
          <EmptyIcon>⚠️</EmptyIcon>
          <EmptyTitle>찜한 상품을 불러올 수 없습니다</EmptyTitle>
          <EmptyMessage>{error}</EmptyMessage>
          <ShoppingButton onClick={() => fetchWishlist()}>
            다시 시도
          </ShoppingButton>
        </EmptyWishlist>
      </Container>
    );
  }

  const wishList = wishlistItems?.wishlists || [];

  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <Title>찜한 상품</Title>
        <ItemCount>총 {wishlistCount}개</ItemCount>
      </Header>

      {/* 찜한 상품이 없는 경우 */}
      {wishList.length === 0 ? (
        <EmptyWishlist>
          <EmptyIcon>❤️</EmptyIcon>
          <EmptyTitle>찜한 상품이 없습니다</EmptyTitle>
          <EmptyMessage>
            마음에 드는 상품을 찜해보세요.
            <br />
            나중에 쉽게 찾아볼 수 있습니다.
          </EmptyMessage>
          <ShoppingButton onClick={() => navigate("/products")}>
            상품 보러가기
          </ShoppingButton>
        </EmptyWishlist>
      ) : (
        <>
          {/* 찜한 상품 그리드 */}
          <WishGrid>
            {wishList.map((item) => {
              const discountPrice = calculateDiscountPrice(item.productPrice, item.discountType, item.discountValue);
              const hasDiscount = discountPrice < item.productPrice;
              
              return (
                <WishCard key={item.wishlistId}>
                  <ProductLink to={`/products/${item.productId}`}>
                    <ProductImage
                      src={toUrl(item.productImageUrl)}
                      alt={item.productName}
                      onError={(e) => {
                        // 이미지 로드 실패시 기본 이미지로 대체
                        (e.target as HTMLImageElement).src = toUrl(
                          "images/common/no-image.png"
                        );
                      }}
                    />
                  </ProductLink>

                  {/* 제거 버튼 */}
                  <RemoveButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveClick(item.productId, item.productName);
                    }}
                    title="찜 해제"
                    disabled={isRemoving === item.productId}
                  >
                    {isRemoving === item.productId ? "..." : "×"}
                  </RemoveButton>

                  <ProductInfo>
                    <ProductLink to={`/products/${item.productId}`}>
                      <ProductName>{item.productName}</ProductName>

                      <PriceSection>
                        <DiscountPrice>
                          {formatPrice(discountPrice)}원
                        </DiscountPrice>
                        {hasDiscount && (
                          <>
                            <OriginalPrice>
                              {formatPrice(item.productPrice)}원
                            </OriginalPrice>
                            {item.discountValue > 0 && (
                              <DiscountBadge>
                                {item.discountValue}
                                {item.discountType === "RATE_DISCOUNT" ? "%" : "원"}
                              </DiscountBadge>
                            )}
                          </>
                        )}
                      </PriceSection>
                    </ProductLink>

                    <AddedDate>{formatDate(item.createdAt)} 추가</AddedDate>
                  </ProductInfo>
                </WishCard>
              );
            })}
          </WishGrid>
        </>
      )}

      {/* 찜 해제 확인 모달 */}
      <Warning
        open={showRemoveModal}
        title="찜 해제"
        message={`"${selectedProductName}"을(를) 찜 목록에서 제거하시겠습니까?`}
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
    </Container>
  );
};

// 권한 확인이 포함된 메인 컴포넌트
const WishListPage: React.FC = () => {
  return (
    <UserProtectedRoute requireUserRole={true} showNotice={true}>
      <WishListPageContent />
    </UserProtectedRoute>
  );
};

export default WishListPage;
