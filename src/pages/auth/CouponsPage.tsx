import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { couponService } from "../../api/couponService";
import { UserProfileService } from "../../api/userProfileService";
import { CouponResponse } from "../../types/types";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const TabButton = styled.button<{ isActive: boolean }>`
  background: transparent;
  border: none;
  color: ${(props) =>
    props.isActive ? "#f97316" : "rgba(255, 255, 255, 0.7)"};
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 0;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #f97316;
    transform: ${(props) => (props.isActive ? "scaleX(1)" : "scaleX(0)")};
    transition: transform 0.3s ease-out;
  }
`;

const CouponList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CouponCard = styled.div<{ isExpired?: boolean }>`
  background: ${(props) =>
    props.isExpired
      ? "rgba(0, 0, 0, 0.3)"
      : "linear-gradient(135deg, #4a5568, #2d3748)"};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: ${(props) => (props.isExpired ? 0.6 : 1)};
  border-left: 5px solid ${(props) => (props.isExpired ? "#718096" : "#f97316")};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
`;

const CouponHeader = styled.div`
  margin-bottom: 1rem;
`;

const CouponName = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const CouponDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0 0;
`;

const CouponFooter = styled.div`
  border-top: 1px dashed rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ExpiryDate = styled.p`
  font-size: 0.9rem;
  margin: 0;
`;

const Discount = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #f97316;
`;

const NoCouponsMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.7);
`;

// 할인 타입에 따른 할인 표시 함수 (API 명세서 기준)
const getDiscountDisplay = (coupon: CouponResponse): string => {
  if (coupon.isFreeShipping) {
    return "무료배송";
  }

  // API 명세서에 따른 할인 타입 추정 로직 (discountType 필드가 없으므로)
  // discountValue가 100 이하면 비율 할인으로 추정
  if (coupon.discountValue <= 100) {
    return `${coupon.discountValue}%`;
  } else {
    return `${coupon.discountValue.toLocaleString()}원`;
  }
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const CouponsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"available" | "expired">(
    "available"
  );
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 쿠폰 데이터 로드
  const loadCoupons = async () => {
    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 사용자 프로필에서 이메일 가져오기
      const userProfile = await UserProfileService.getUserProfile();

      if (!userProfile.email) {
        setError("사용자 이메일 정보를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      // 쿠폰 목록 조회
      const allCoupons = await couponService.getUserCoupons(userProfile.email);

      setCoupons(allCoupons);
    } catch (err: any) {
      console.error("쿠폰 로드 실패:", err);

      // 개발 환경에서는 임시 테스트 데이터 사용
      if (process.env.NODE_ENV === "development") {
        const testCoupons: CouponResponse[] = [
          {
            couponName: "신규가입 15% 할인",
            discountValue: 15,
            isFreeShipping: false,
            expiresAt: "2025-12-31T23:59:59",
            couponStatus: "ACTIVE",
          },
          {
            couponName: "무료배송 쿠폰",
            discountValue: 0,
            isFreeShipping: true,
            expiresAt: "2025-06-30T23:59:59",
            couponStatus: "ACTIVE",
          },
          {
            couponName: "만료된 10% 할인",
            discountValue: 10,
            isFreeShipping: false,
            expiresAt: "2024-12-31T23:59:59",
            couponStatus: "EXPIRED",
          },
        ];
        setCoupons(testCoupons);
        setError(null);
      } else {
        setError(
          "쿠폰 정보를 불러오는데 실패했습니다. 에러: " +
            (err.response?.data?.message || err.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [user]); // loadCoupons는 user에 의존하므로 user만 의존성에 포함

  // 탭에 따른 쿠폰 필터링
  const getFilteredCoupons = (): CouponResponse[] => {
    if (activeTab === "available") {
      // 백엔드에서 다양한 active 상태값을 사용할 수 있으므로 더 유연하게 처리
      const activeCoupons = coupons.filter((coupon) => {
        const status = coupon.couponStatus?.toUpperCase();
        const couponStatus = (coupon as any).couponStatus?.toUpperCase();

        // status나 couponStatus 필드가 있는 경우
        const statusToCheck = couponStatus || status;
        if (statusToCheck) {
          const activeStatuses = ["ACTIVE", "AVAILABLE", "VALID", "UNUSED"];
          return activeStatuses.includes(statusToCheck);
        }

        // status 필드가 없는 경우 날짜와 사용 여부로 판단
        const now = new Date();
        const expiryDate = new Date(coupon.expiresAt);
        const isNotExpired = expiryDate > now;
        const isNotUsed = coupon.couponStatus === "ACTIVE";

        return isNotExpired && isNotUsed;
      });
      return activeCoupons;
    } else {
      const expiredCoupons = coupons.filter((coupon) => {
        const status = coupon.couponStatus?.toUpperCase();

        // status 필드가 있는 경우
        if (status) {
          const expiredStatuses = ["EXPIRED", "USED", "INVALID", "DISABLED"];
          return expiredStatuses.includes(status);
        }

        // status 필드가 없는 경우 날짜와 사용 여부로 판단
        const now = new Date();
        const expiryDate = new Date(coupon.expiresAt);
        const isExpired = expiryDate <= now;
        const isUsed = coupon.couponStatus !== "ACTIVE";

        return isExpired || isUsed;
      });
      return expiredCoupons;
    }
  };

  const couponsToDisplay = getFilteredCoupons();

  const availableCouponsCount = coupons.filter((c) => {
    const status = c.couponStatus?.toUpperCase();
    if (status) {
      return ["ACTIVE", "AVAILABLE", "VALID", "UNUSED"].includes(status);
    }
    // status가 없으면 날짜와 사용 여부로 판단
    const now = new Date();
    const expiryDate = new Date(c.expiresAt);
    return expiryDate > now && c.couponStatus === "ACTIVE";
  }).length;

  const expiredCouponsCount = coupons.filter((c) => {
    const status = c.couponStatus?.toUpperCase();
    if (status) {
      return ["EXPIRED", "USED", "INVALID", "DISABLED"].includes(status);
    }
    // status가 없으면 날짜와 사용 여부로 판단
    const now = new Date();
    const expiryDate = new Date(c.expiresAt);
    return expiryDate <= now || c.couponStatus !== "ACTIVE";
  }).length;

  // 로딩 상태
  if (loading) {
    return (
      <Container>
        <Title>쿠폰 및 포인트</Title>
        <NoCouponsMessage>
          <p>쿠폰 정보를 불러오는 중...</p>
        </NoCouponsMessage>
      </Container>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Container>
        <Title>쿠폰 및 포인트</Title>
        <NoCouponsMessage>
          <p style={{ color: "#f87171" }}>{error}</p>
          <button
            onClick={loadCoupons}
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              marginTop: "1rem",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </NoCouponsMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>쿠폰 및 포인트</Title>
      <TabContainer>
        <TabButton
          isActive={activeTab === "available"}
          onClick={() => setActiveTab("available")}
        >
          사용 가능한 쿠폰 ({availableCouponsCount})
        </TabButton>
        <TabButton
          isActive={activeTab === "expired"}
          onClick={() => setActiveTab("expired")}
        >
          만료된 쿠폰 ({expiredCouponsCount})
        </TabButton>
      </TabContainer>

      {(() => {
        if (couponsToDisplay.length > 0) {
          return (
            <CouponList>
              {couponsToDisplay.map((coupon, index) => {
                return (
                  <CouponCard
                    key={coupon.couponName}
                    isExpired={activeTab === "expired"}
                  >
                    <CouponHeader>
                      <CouponName>{coupon.couponName}</CouponName>
                      <CouponDescription>
                        {/* 백엔드에서 설명이 있으면 사용, 없으면 자동 생성 */}
                        {(() => {
                          // 백엔드에서 설명이 있으면 사용
                          const backendDescription =
                            (coupon as any).description ||
                            (coupon as any).couponDescription;
                          if (backendDescription) {
                            return backendDescription;
                          }

                          // 무료배송인 경우
                          if (coupon.isFreeShipping) {
                            return "배송비 무료";
                          }

                          // API 명세서 기준으로 할인 타입 추정
                          // discountValue가 100 이하면 비율 할인으로 추정
                          const isPercentageDiscount = coupon.discountValue <= 100;

                          return isPercentageDiscount
                            ? "전 상품 적용"
                            : "최소 주문금액 적용";
                        })()}
                      </CouponDescription>
                    </CouponHeader>
                    <CouponFooter>
                      <ExpiryDate>~ {formatDate(coupon.expiresAt)}</ExpiryDate>
                      <Discount>{getDiscountDisplay(coupon)}</Discount>
                    </CouponFooter>
                  </CouponCard>
                );
              })}
            </CouponList>
          );
        } else {
          return (
            <NoCouponsMessage>
              <p>
                {activeTab === "available"
                  ? "사용 가능한 쿠폰이 없습니다."
                  : "만료된 쿠폰이 없습니다."}
              </p>
            </NoCouponsMessage>
          );
        }
      })()}
    </Container>
  );
};

export default CouponsPage;
