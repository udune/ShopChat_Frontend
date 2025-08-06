import { FC } from "react";
import styled, { keyframes } from "styled-components";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// 애니메이션 정의
const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const SidebarContainer = styled.aside<{ open: boolean }>`
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 280px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
  box-shadow: 4px 0 20px rgba(249, 115, 22, 0.25);
  padding: 0;
  z-index: 100;
  transform: translateX(${({ open }) => (open ? "0" : "-100%")});
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  border-right: 1px solid rgba(249, 115, 22, 0.2);
  visibility: ${({ open }) => (open ? "visible" : "hidden")};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 20%,
        rgba(249, 115, 22, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 80%,
        rgba(239, 68, 68, 0.08) 0%,
        transparent 50%
      );
    pointer-events: none;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(249, 115, 22, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.4);
    border-radius: 3px;
    transition: background 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.6);
  }

  @media (max-width: 768px) {
    top: 70px;
  }
`;

const SidebarHeader = styled.div`
  padding: 30px 20px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 20px;
  position: relative;
  z-index: 2;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent
    );
  }
`;

const SidebarLogo = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff, #fef3c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SidebarSubtitle = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  letter-spacing: 0.5px;
`;

const MenuSection = styled.div`
  margin-bottom: 30px;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  z-index: 2;
`;

const MenuTitle = styled.h3`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  padding: 0 20px;
  margin-bottom: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 20px;
    top: 50%;
    width: 20px;
    height: 2px;
    background: linear-gradient(90deg, rgba(249, 115, 22, 0.8), transparent);
    transform: translateY(-50%);
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin-bottom: 6px;
  padding: 0 15px;
`;

const MenuLink = styled(Link)<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: ${(props) => (props.active ? "#ffffff" : "rgba(255, 255, 255, 0.85)")};
  text-decoration: none;
  font-size: 14px;
  font-weight: ${(props) => (props.active ? "600" : "500")};
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(239, 68, 68, 0.15))"
      : "transparent"};
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid
    ${(props) => (props.active ? "rgba(249, 115, 22, 0.3)" : "transparent")};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(249, 115, 22, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: linear-gradient(135deg, #f97316, #dc2626);
    border-radius: 0 2px 2px 0;
    transition: height 0.3s ease;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(249, 115, 22, 0.2),
      rgba(239, 68, 68, 0.1)
    );
    color: #ffffff;
    transform: translateX(8px);
    border-color: rgba(249, 115, 22, 0.4);

    &::before {
      left: 100%;
    }

    &::after {
      height: 60%;
    }
  }

  ${(props) =>
    props.active &&
    `
    &::after {
      height: 80%;
    }
  `}

  &:hover .menu-icon {
    animation: ${pulse} 0.6s ease-in-out;
    transform: scale(1.1);
  }
`;

const MenuIcon = styled.i<{ active?: boolean }>`
  width: 20px;
  margin-right: 15px;
  font-size: 16px;
  color: ${(props) => (props.active ? "#ffffff" : "rgba(255, 255, 255, 0.8)")};
  transition: all 0.3s ease;

  &.menu-icon {
    transition: all 0.3s ease;
  }
`;

const MenuText = styled.span`
  flex: 1;
  transition: all 0.3s ease;
  font-weight: inherit;
`;

const ActiveIndicator = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #f97316, #dc2626);
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.8);
  animation: ${pulse} 2s infinite;
`;

const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: auto;
  text-align: center;
  position: relative;
  z-index: 2;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
  }
`;

const SidebarFooterText = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  line-height: 1.4;
`;

const QuickStats = styled.div`
  padding: 20px;
  margin: 20px 15px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.08)
  );
  border-radius: 16px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.1)
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }
`;

const QuickStatsTitle = styled.h4`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
`;

const QuickStatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const QuickStatItem = styled.div`
  text-align: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const QuickStatNumber = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #ffffff, #e0f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const QuickStatLabel = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Overlay = styled.div<{ open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  opacity: ${({ open }) => (open ? 1 : 0)};
  pointer-events: ${({ open }) => (open ? "auto" : "none")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 99;
`;

const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  // 판매자 메뉴 분기
  if (user?.userType === "seller") {
    return (
      <>
        <Overlay open={open} onClick={onClose} />
        <SidebarContainer open={open}>
          <SidebarHeader>
            <SidebarLogo>FeedShop</SidebarLogo>
            <SidebarSubtitle>판매자 센터</SidebarSubtitle>
          </SidebarHeader>

          <QuickStats>
            <QuickStatsTitle>판매 현황</QuickStatsTitle>
            <QuickStatsGrid>
              <QuickStatItem>
                <QuickStatNumber>23</QuickStatNumber>
                <QuickStatLabel>오늘 주문</QuickStatLabel>
              </QuickStatItem>
              <QuickStatItem>
                <QuickStatNumber>₩1.2M</QuickStatNumber>
                <QuickStatLabel>오늘 매출</QuickStatLabel>
              </QuickStatItem>
              <QuickStatItem>
                <QuickStatNumber>5</QuickStatNumber>
                <QuickStatLabel>신규 리뷰</QuickStatLabel>
              </QuickStatItem>
              <QuickStatItem>
                <QuickStatNumber>4.7</QuickStatNumber>
                <QuickStatLabel>평점</QuickStatLabel>
              </QuickStatItem>
            </QuickStatsGrid>
          </QuickStats>

          <MenuSection>
            <MenuTitle>판매자 메뉴</MenuTitle>
            <MenuList>
              <MenuItem>
                <MenuLink
                  to="/store-home"
                  active={location.pathname === "/store-home"}
                >
                  <MenuIcon
                    className="fas fa-store menu-icon"
                    active={location.pathname === "/store-home"}
                  />
                  <MenuText>내 가게 홈</MenuText>
                  {location.pathname === "/store-home" && <ActiveIndicator />}
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink
                  to="/product-manage"
                  active={location.pathname === "/product-manage"}
                >
                  <MenuIcon
                    className="fas fa-box menu-icon"
                    active={location.pathname === "/product-manage"}
                  />
                  <MenuText>상품 관리</MenuText>
                  {location.pathname === "/product-manage" && (
                    <ActiveIndicator />
                  )}
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink
                  to="/order-manage"
                  active={location.pathname === "/order-manage"}
                >
                  <MenuIcon
                    className="fas fa-shopping-cart menu-icon"
                    active={location.pathname === "/order-manage"}
                  />
                  <MenuText>주문 관리</MenuText>
                  {location.pathname === "/order-manage" && <ActiveIndicator />}
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink
                  to="/review-manage"
                  active={location.pathname === "/review-manage"}
                >
                  <MenuIcon
                    className="fas fa-star menu-icon"
                    active={location.pathname === "/review-manage"}
                  />
                  <MenuText>리뷰 관리</MenuText>
                  {location.pathname === "/review-manage" && (
                    <ActiveIndicator />
                  )}
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink
                  to="/stats-dashboard"
                  active={location.pathname === "/stats-dashboard"}
                >
                  <MenuIcon
                    className="fas fa-chart-bar menu-icon"
                    active={location.pathname === "/stats-dashboard"}
                  />
                  <MenuText>통계 분석</MenuText>
                  {location.pathname === "/stats-dashboard" && (
                    <ActiveIndicator />
                  )}
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink
                  to="/settings"
                  active={location.pathname === "/settings"}
                >
                  <MenuIcon
                    className="fas fa-cog menu-icon"
                    active={location.pathname === "/settings"}
                  />
                  <MenuText>판매자 설정</MenuText>
                  {location.pathname === "/settings" && <ActiveIndicator />}
                </MenuLink>
              </MenuItem>
            </MenuList>
          </MenuSection>

          <SidebarFooter>
            <SidebarFooterText>
              &copy; 2025 FeedShop
              <br />
              판매자 센터
            </SidebarFooterText>
          </SidebarFooter>
        </SidebarContainer>
      </>
    );
  }

  // 기존(관리자/일반유저) 사이드바 렌더링
  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <SidebarContainer open={open}>
        <SidebarHeader>
          <SidebarLogo>FeedShop</SidebarLogo>
          <SidebarSubtitle>스마트한 쇼핑 경험</SidebarSubtitle>
        </SidebarHeader>

        <QuickStats>
          <QuickStatsTitle>오늘의 현황</QuickStatsTitle>
          <QuickStatsGrid>
            <QuickStatItem>
              <QuickStatNumber>127</QuickStatNumber>
              <QuickStatLabel>방문자</QuickStatLabel>
            </QuickStatItem>
            <QuickStatItem>
              <QuickStatNumber>23</QuickStatNumber>
              <QuickStatLabel>주문</QuickStatLabel>
            </QuickStatItem>
            <QuickStatItem>
              <QuickStatNumber>₩890K</QuickStatNumber>
              <QuickStatLabel>매출</QuickStatLabel>
            </QuickStatItem>
            <QuickStatItem>
              <QuickStatNumber>4.8</QuickStatNumber>
              <QuickStatLabel>평점</QuickStatLabel>
            </QuickStatItem>
          </QuickStatsGrid>
        </QuickStats>

        <MenuSection>
          <MenuTitle>쇼핑</MenuTitle>
          <MenuList>
            <MenuItem>
              <MenuLink
                to="/products"
                active={location.pathname === "/products"}
              >
                <MenuIcon
                  className="fas fa-shopping-bag menu-icon"
                  active={location.pathname === "/products"}
                />
                <MenuText>전체 상품</MenuText>
                {location.pathname === "/products" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink to="/new" active={location.pathname === "/new"}>
                <MenuIcon
                  className="fas fa-star menu-icon"
                  active={location.pathname === "/new"}
                />
                <MenuText>신상품</MenuText>
                {location.pathname === "/new" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink to="/best" active={location.pathname === "/best"}>
                <MenuIcon
                  className="fas fa-crown menu-icon"
                  active={location.pathname === "/best"}
                />
                <MenuText>베스트</MenuText>
                {location.pathname === "/best" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
          </MenuList>
        </MenuSection>

        <MenuSection>
          <MenuTitle>피드</MenuTitle>
          <MenuList>
            <MenuItem>
              <MenuLink to="/my-feed" active={location.pathname === "/my-feed"}>
                <MenuIcon
                  className="fas fa-user menu-icon"
                  active={location.pathname === "/my-feed"}
                />
                <MenuText>마이 피드</MenuText>
                {location.pathname === "/my-feed" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink
                to="/feeds"
                active={location.pathname === "/feeds"}
              >
                <MenuIcon
                  className="fas fa-list menu-icon"
                  active={location.pathname === "/feeds"}
                />
                <MenuText>피드 목록</MenuText>
                {location.pathname === "/feeds" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
          </MenuList>
        </MenuSection>

        <MenuSection>
          <MenuTitle>마이페이지</MenuTitle>
          <MenuList>
            <MenuItem>
              <MenuLink
                to="/wishlist"
                active={location.pathname === "/wishlist"}
              >
                <MenuIcon
                  className="fas fa-heart menu-icon"
                  active={location.pathname === "/wishlist"}
                />
                <MenuText>찜한 상품</MenuText>
                {location.pathname === "/wishlist" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink
                to="/recentview"
                active={location.pathname === "/recentview"}
              >
                <MenuIcon
                  className="fas fa-clock menu-icon"
                  active={location.pathname === "/recentview"}
                />
                <MenuText>최근 본 상품</MenuText>
                {location.pathname === "/recentview" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink to="/cart" active={location.pathname === "/cart"}>
                <MenuIcon
                  className="fas fa-shopping-cart menu-icon"
                  active={location.pathname === "/cart"}
                />
                <MenuText>장바구니</MenuText>
                {location.pathname === "/cart" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
          </MenuList>
        </MenuSection>

        <MenuSection>
          <MenuTitle>고객 지원</MenuTitle>
          <MenuList>
            <MenuItem>
              <MenuLink to="/reviews" active={location.pathname === "/reviews"}>
                <MenuIcon
                  className="fas fa-star menu-icon"
                  active={location.pathname === "/reviews"}
                />
                <MenuText>리뷰 관리</MenuText>
                {location.pathname === "/reviews" && <ActiveIndicator />}
              </MenuLink>
            </MenuItem>
          </MenuList>
        </MenuSection>

        <SidebarFooter>
          <SidebarFooterText>
            &copy; 2025 FeedShop
            <br />
            모든 권리 보유
          </SidebarFooterText>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;