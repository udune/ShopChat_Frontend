import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useWishlist } from "hooks/cart/useWishlist";
import { useAuth } from "contexts/AuthContext";
import Warning from "components/modal/Warning";

interface WishlistButtonProps {
  productId: number;
  wishCount: number;
  showCount?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

const ButtonContainer = styled.div<{ size: string }>`
  display: flex;
  align-items: center;
  gap: ${({ size }) => (size === "small" ? "4px" : size === "large" ? "8px" : "6px")};
`;

const HeartButton = styled.button<{ $isWishlisted: boolean; size: string; $isLoading: boolean }>`
  background: none;
  border: none;
  cursor: ${({ $isLoading }) => ($isLoading ? "not-allowed" : "pointer")};
  padding: ${({ size }) => (size === "small" ? "4px" : size === "large" ? "8px" : "6px")};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: ${({ size }) => (size === "small" ? "1rem" : size === "large" ? "1.5rem" : "1.2rem")};
  opacity: ${({ $isLoading }) => ($isLoading ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  .heart-icon {
    color: ${({ $isWishlisted }) => ($isWishlisted ? "#ef4444" : "#d1d5db")};
    transition: color 0.2s ease;
  }
`;

const WishCount = styled.span<{ size: string }>`
  font-size: ${({ size }) => (size === "small" ? "0.875rem" : size === "large" ? "1.125rem" : "1rem")};
  color: #6b7280;
  font-weight: 500;
  min-width: ${({ size }) => (size === "small" ? "20px" : "24px")};
  text-align: left;
`;

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  wishCount,
  showCount = true,
  size = "medium",
  className,
}) => {
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isWishlisted, loading } = useWishlist();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localWishCount, setLocalWishCount] = useState(wishCount);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  
  const isWishlistedItem = isWishlisted(productId);
  const isCurrentlyLoading = loading || isLocalLoading;

  // wishCount prop이 변경되면 localWishCount 업데이트
  useEffect(() => {
    setLocalWishCount(wishCount);
  }, [wishCount]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrentlyLoading) return;

    // 로그인하지 않은 상태에서는 아무 동작도 하지 않음
    if (!user) {
      return;
    }

    if (isWishlistedItem) {
      setShowRemoveModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleAddConfirm = async () => {
    setShowAddModal(false);
    setIsLocalLoading(true);
    
    // 낙관적 업데이트
    setLocalWishCount(prev => prev + 1);
    
    try {
      const success = await addToWishlist(productId);
      if (!success) {
        // 실패 시 롤백
        setLocalWishCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("찜하기 추가 실패:", error);
      // 실패 시 롤백
      setLocalWishCount(prev => prev - 1);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleRemoveConfirm = async () => {
    setShowRemoveModal(false);
    setIsLocalLoading(true);
    
    // 낙관적 업데이트
    setLocalWishCount(prev => Math.max(0, prev - 1));
    
    try {
      const success = await removeFromWishlist(productId);
      if (!success) {
        // 실패 시 롤백
        setLocalWishCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("찜하기 제거 실패:", error);
      // 실패 시 롤백
      setLocalWishCount(prev => prev + 1);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowRemoveModal(false);
  };

  return (
    <ButtonContainer size={size} className={className}>
      <HeartButton
        onClick={handleWishlistToggle}
        $isWishlisted={isWishlistedItem}
        size={size}
        $isLoading={isCurrentlyLoading}
        disabled={isCurrentlyLoading}
        title={isWishlistedItem ? "찜 해제" : "찜하기"}
        aria-label={isWishlistedItem ? "찜 해제" : "찜하기"}
      >
        {isCurrentlyLoading ? (
          <span className="heart-icon">⏳</span>
        ) : (
          <span className="heart-icon">
            {isWishlistedItem ? "❤️" : "🤍"}
          </span>
        )}
      </HeartButton>
      
      {showCount && (
        <WishCount size={size}>
          {localWishCount}
        </WishCount>
      )}

      {/* 찜하기 확인 모달 */}
      <Warning
        open={showAddModal}
        title="찜하기"
        message="이 상품을 찜 목록에 추가하시겠습니까?"
        onConfirm={handleAddConfirm}
        onCancel={handleCancel}
      />

      {/* 찜 해제 확인 모달 */}
      <Warning
        open={showRemoveModal}
        title="찜 해제"
        message="이 상품을 찜 목록에서 제거하시겠습니까?"
        onConfirm={handleRemoveConfirm}
        onCancel={handleCancel}
      />
    </ButtonContainer>
  );
};