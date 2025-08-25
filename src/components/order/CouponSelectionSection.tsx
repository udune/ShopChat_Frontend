import React, { useState } from "react";
import styled from "styled-components";
import { CouponResponse } from "../../types/types";

const CouponContainer = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

const CouponList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const CouponItem = styled.div<{ selected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#007bff' : '#e9ecef'};
  border-radius: 8px;
  background: ${props => props.selected ? '#f0f8ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
`;

const CouponInfo = styled.div`
  flex: 1;
`;

const CouponName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const DiscountInfo = styled.p`
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #007bff;
  font-weight: 600;
`;

const ExpiryInfo = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
`;

const SelectButton = styled.button<{ selected?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${props => props.selected ? '#dc3545' : '#007bff'};
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.selected ? '#c82333' : '#0056b3'};
  }
`;

const NoCouponsMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 14px;
`;

const SelectedCouponSummary = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #e8f5e8;
  border-radius: 6px;
  border-left: 4px solid #28a745;
`;

const SummaryText = styled.div`
  font-size: 14px;
  color: #155724;
  font-weight: 500;
`;

const CouponCodeSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f0f8ff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const CouponCodeTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const CouponCodeInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CouponCodeInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const ApplyCouponButton = styled.button`
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #218838;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #dc3545;
`;

interface CouponSelectionSectionProps {
  coupons: CouponResponse[];
  selectedCoupon: CouponResponse | null;
  onCouponSelect: (coupon: CouponResponse | null) => void;
  formatPrice: (price: number) => string;
  onCouponCodeApply?: (couponCode: string) => Promise<void>;
}

export const CouponSelectionSection: React.FC<CouponSelectionSectionProps> = ({
  coupons,
  selectedCoupon,
  onCouponSelect,
  formatPrice,
  onCouponCodeApply,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [applyError, setApplyError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const formatDiscountInfo = (coupon: CouponResponse): string => {
    if (coupon.isFreeShipping) {
      return "무료배송";
    }

    // discountValue가 1 이하면 비율 할인으로 추정 (0.3 = 30%)
    if (coupon.discountValue <= 1) {
      return `${coupon.discountValue * 100}% 할인`;
    } else {
      return `${formatPrice(coupon.discountValue)} 할인`;
    }
  };

  const formatExpiryDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `만료일: ${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleCouponCodeApply = async () => {
    if (!couponCode.trim()) {
      setApplyError("쿠폰 코드를 입력해주세요.");
      return;
    }

    if (!onCouponCodeApply) {
      setApplyError("쿠폰 적용 기능이 사용할 수 없습니다.");
      return;
    }

    try {
      setIsApplying(true);
      setApplyError("");
      await onCouponCodeApply(couponCode.trim());
      setCouponCode("");
    } catch (error) {
      setApplyError("쿠폰 적용에 실패했습니다. 쿠폰 코드를 확인해주세요.");
    } finally {
      setIsApplying(false);
    }
  };

  if (coupons.length === 0) {
    return (
      <CouponContainer>
        <SectionTitle>쿠폰 선택</SectionTitle>
        <NoCouponsMessage>
          사용 가능한 쿠폰이 없습니다.
        </NoCouponsMessage>
        
        {onCouponCodeApply && (
          <CouponCodeSection>
            <CouponCodeTitle>쿠폰 코드 직접 입력</CouponCodeTitle>
            <CouponCodeInputContainer>
              <CouponCodeInput
                type="text"
                placeholder="쿠폰 코드를 입력하세요"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setApplyError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCouponCodeApply();
                  }
                }}
                disabled={isApplying}
              />
              <ApplyCouponButton
                onClick={handleCouponCodeApply}
                disabled={isApplying || !couponCode.trim()}
              >
                {isApplying ? "적용 중..." : "쿠폰 적용"}
              </ApplyCouponButton>
            </CouponCodeInputContainer>
            {applyError && <ErrorMessage>{applyError}</ErrorMessage>}
          </CouponCodeSection>
        )}
      </CouponContainer>
    );
  }

  return (
    <CouponContainer>
      <SectionTitle>쿠폰 선택 ({coupons.length}개 사용 가능)</SectionTitle>
      <CouponList>
        {coupons.map((coupon, index) => (
          <CouponItem
            key={index}
            selected={selectedCoupon?.couponName === coupon.couponName}
            onClick={() => {
              const isSelected = selectedCoupon?.couponName === coupon.couponName;
              onCouponSelect(isSelected ? null : coupon);
            }}
          >
            <CouponInfo>
              <CouponName>{coupon.couponName}</CouponName>
              <DiscountInfo>{formatDiscountInfo(coupon)}</DiscountInfo>
              <ExpiryInfo>{formatExpiryDate(coupon.expiresAt)}</ExpiryInfo>
            </CouponInfo>
            <SelectButton selected={selectedCoupon?.couponName === coupon.couponName}>
              {selectedCoupon?.couponName === coupon.couponName ? "해제" : "적용"}
            </SelectButton>
          </CouponItem>
        ))}
      </CouponList>

      {selectedCoupon && (
        <SelectedCouponSummary>
          <SummaryText>
            ✓ {selectedCoupon.couponName} 적용됨 - {formatDiscountInfo(selectedCoupon)}
          </SummaryText>
        </SelectedCouponSummary>
      )}

      {onCouponCodeApply && (
        <CouponCodeSection>
          <CouponCodeTitle>쿠폰 코드 직접 입력</CouponCodeTitle>
          <CouponCodeInputContainer>
            <CouponCodeInput
              type="text"
              placeholder="쿠폰 코드를 입력하세요"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                setApplyError("");
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCouponCodeApply();
                }
              }}
              disabled={isApplying}
            />
            <ApplyCouponButton
              onClick={handleCouponCodeApply}
              disabled={isApplying || !couponCode.trim()}
            >
              {isApplying ? "적용 중..." : "쿠폰 적용"}
            </ApplyCouponButton>
          </CouponCodeInputContainer>
          {applyError && <ErrorMessage>{applyError}</ErrorMessage>}
        </CouponCodeSection>
      )}
    </CouponContainer>
  );
};