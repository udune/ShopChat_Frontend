import { FC, useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import styled, { keyframes } from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import CategoryModal from "../modal/CategoryModal";

// 애니메이션 정의
const slideDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.2);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 40;
  animation: ${slideDown} 0.4s ease-out;
  border-bottom: 1px solid rgba(249, 115, 22, 0.2);
  min-width: 320px; /* 최소 너비 설정 */

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 50%,
        rgba(249, 115, 22, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 50%,
        rgba(239, 68, 68, 0.05) 0%,
        transparent 50%
      );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    height: 70px;
    padding: 0 15px;
  }

  @media (max-width: 480px) {
    padding: 0 10px;
    gap: 8px; /* 요소들 간 간격 조정 */
  }

  @media (max-width: 375px) {
    padding: 0 8px;
    gap: 6px;
  }
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  margin-right: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  flex-shrink: 0; /* 축소 방지 */

  &:hover {
    background: rgba(249, 115, 22, 0.2);
    color: white;
    transform: scale(1.1);
  }

  @media (min-width: 769px) {
    display: none;
  }

  @media (max-width: 480px) {
    padding: 6px;
    margin-right: 8px;
    font-size: 16px;
  }
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 800;
  color: white;
  text-decoration: none;
  margin-right: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ffffff, #fef3c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 2;
  flex-shrink: 0; /* 축소 방지 */
  white-space: nowrap; /* 줄바꿈 방지 */

  &:hover {
    transform: scale(1.05);
    text-shadow: 0 4px 8px rgba(249, 115, 22, 0.4);
  }

  @media (max-width: 768px) {
    font-size: 20px;
    margin-right: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin-right: 10px;
  }

  @media (max-width: 375px) {
    font-size: 16px;
    margin-right: 8px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  flex-shrink: 0; /* 축소 방지 */

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 2;
  white-space: nowrap; /* 줄바꿈 방지 */

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
      rgba(249, 115, 22, 0.3),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    background: rgba(249, 115, 22, 0.2);
    color: white;
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
  }
`;

// 카테고리 버튼 스타일드 컴포넌트 (NavLink와 동일한 스타일)
const CategoryButton = styled.button`
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 2;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;

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
      rgba(249, 115, 22, 0.3),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    background: rgba(249, 115, 22, 0.2);
    color: white;
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.4);
  }
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  flex: 1; /* 남은 공간 모두 사용 */
  max-width: 400px; /* 최대 너비 제한 */
  margin: 0 20px;
  min-width: 0; /* flex item이 축소될 수 있도록 */

  @media (min-width: 1200px) {
    margin-right: 60px;
  }

  @media (min-width: 1024px) and (max-width: 1199px) {
    margin-right: 40px;
  }

  @media (min-width: 769px) and (max-width: 895px) {
    margin-right: 25px;
    max-width: 280px; /* 검색창 최대 너비 제한 */
  }

  @media (max-width: 768px) {
    margin: 0 10px;
    max-width: none;
  }

  @media (max-width: 480px) {
    margin: 0 6px;
    flex: 1;
    min-width: 100px; /* 검색창 최소 공간 확보 */
  }

  @media (max-width: 375px) {
    margin: 0 4px;
    min-width: 80px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 120px; /* 최소 너비 보장 */

  @media (max-width: 768px) {
    min-width: 100px;
  }

  @media (max-width: 480px) {
    min-width: 80px;
  }

  @media (max-width: 375px) {
    min-width: 70px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 40px 0 16px;
  border: 2px solid rgba(249, 115, 22, 0.3);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }

  &:focus {
    outline: none;
    border-color: rgba(249, 115, 22, 0.6);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
  }

  @media (max-width: 768px) {
    height: 36px;
    font-size: 13px;
    padding: 0 36px 0 14px;
  }

  @media (max-width: 480px) {
    height: 32px;
    font-size: 12px;
    padding: 0 32px 0 12px;

    &::placeholder {
      content: "검색...";
    }
  }

  @media (max-width: 375px) {
    height: 28px;
    font-size: 11px;
    padding: 0 28px 0 10px;
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
  }

  svg {
    width: 14px;
    height: 14px;
    color: white;
  }

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    right: 6px;

    svg {
      width: 12px;
      height: 12px;
    }
  }

  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
    right: 5px;

    svg {
      width: 10px;
      height: 10px;
    }
  }

  @media (max-width: 375px) {
    width: 16px;
    height: 16px;
    right: 4px;

    svg {
      width: 9px;
      height: 9px;
    }
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  margin-left: auto; /* 이 줄을 추가하여 장바구니/로그인 버튼을 우측으로 보냅니다. */

  @media (min-width: 1200px) {
    gap: 28px;
  }

  @media (min-width: 1024px) and (max-width: 1199px) {
    gap: 24px;
  }

  @media (min-width: 769px) and (max-width: 895px) {
    gap: 16px;
  }

  @media (max-width: 768px) {
    gap: 15px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }

  @media (max-width: 375px) {
    gap: 4px;
  }
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  white-space: nowrap;
  max-width: 150px;
  position: relative; /* ::before 기준점 설정 */
  overflow: hidden; /* ::before가 튀어나오지 않도록 */
  z-index: 0; /* 드롭다운보다 낮게 */

  &:hover {
    background: rgba(249, 115, 22, 0.2);
    border-color: rgba(249, 115, 22, 0.4);
    transform: translateY(-2px);
  }

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
      rgba(255, 255, 255, 0.15),
      /* 밝고 투명한 그라데이션 */ transparent
    );
    transition: left 0.3s ease-out; /* 부드러운 이동 */
    z-index: -1; /* 내용을 가리지 않도록 */
  }

  &:hover::before {
    left: 100%; /* 호버 시 오른쪽으로 이동 */
  }

  @media (min-width: 769px) and (max-width: 895px) {
    padding: 6px 10px;
    gap: 6px;
    max-width: 120px;
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 6px;
    max-width: 130px;
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    gap: 4px;
    max-width: 100px;
  }

  @media (max-width: 375px) {
    padding: 4px 6px;
    gap: 3px;
    max-width: 80px;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #ea580c);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
`;

const UserName = styled.span`
  color: white;
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 12px;
    max-width: 60px;
  }

  @media (max-width: 375px) {
    display: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(10px);
  z-index: 50;

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
    );
    pointer-events: none;
  }

  @media (max-width: 480px) {
    min-width: 180px;
    right: -10px;
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  &:hover {
    background: rgba(249, 115, 22, 0.2);
    color: white;
    transform: translateX(4px);
  }

  i {
    width: 16px;
    color: rgba(249, 115, 22, 0.8);
    flex-shrink: 0;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: white;
    transform: translateX(4px);
  }

  i {
    width: 16px;
    color: rgba(239, 68, 68, 0.8);
    flex-shrink: 0;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: rgba(249, 115, 22, 0.2);
  margin: 8px 0;
`;

const CartLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative; /* 중요: ::before 기준점 */
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  flex-shrink: 0;
  overflow: hidden; /* 중요: ::before가 이 영역을 벗어나지 않도록 */
  z-index: 0; /* 중요: 텍스트 위에 오지 않도록 조정 */

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%; /* 초기 위치: 왼쪽 밖 */
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      /* 투명도 조정 */ transparent
    );
    transition: left 0.3s ease-out; /* 애니메이션 속도 및 가속/감속 조정 */
    z-index: -1; /* 내용을 가리지 않도록 */
  }

  &:hover::before {
    left: 100%; /* 호버 시: 오른쪽으로 이동하여 사라짐 */
  }

  @media (min-width: 769px) and (max-width: 895px) {
    padding: 6px 12px;
    font-size: 14px;
    gap: 6px;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 6px 12px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 8px;
    gap: 4px;
    min-width: 32px;
    justify-content: center;

    span {
      display: none;
    }
  }

  @media (max-width: 375px) {
    padding: 4px 6px;
    min-width: 28px;

    i {
      font-size: 14px;
    }
  }
`;

const LoginButton = styled(Link)`
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
  position: relative; /* 중요: ::before 기준점 */
  overflow: hidden; /* 중요: ::before가 이 영역을 벗어나지 않도록 */
  z-index: 0; /* 중요: 텍스트 아래에 나타나도록 */

  &:hover {
    background: linear-gradient(135deg, #ea580c, #dc2626);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
  }

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
      rgba(255, 255, 255, 0.15),
      transparent
    );
    transition: left 0.3s ease-out; /* 속도 및 easing 조정 */
    z-index: -1; /* 텍스트 아래에 나타나도록 */
  }
  &:hover::before {
    left: 100%;
  }

  @media (min-width: 769px) and (max-width: 895px) {
    padding: 6px 14px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    padding: 6px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 12px;
  }

  @media (max-width: 375px) {
    padding: 5px 10px;
    font-size: 11px;

    i {
      margin-right: 4px !important;
    }
  }
`;

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  // 카테고리 모달 열기 핸들러
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCategoryModalOpen(true);
  };

  // 카테고리 모달 닫기 핸들러
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <HeaderContainer>
      <MenuButton onClick={onMenuClick} aria-label="메뉴 열기">
        <i className="fas fa-bars"></i>
      </MenuButton>
      <Logo to="/">FeedShop</Logo>
      <Nav>
        <NavLink to="/products">
          <i className="fas fa-shopping-bag" style={{ marginRight: "8px" }}></i>
          상품
        </NavLink>
        <CategoryButton onClick={handleCategoryClick} type="button">
          <i className="fas fa-th-large" style={{ marginRight: "8px" }}></i>
          카테고리
        </CategoryButton>
        <NavLink to="/event-list">
          <i className="fas fa-gift" style={{ marginRight: "8px" }}></i>
          이벤트
        </NavLink>
      </Nav>

      <SearchSection>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="검색어를 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SearchButton type="submit" onClick={handleSearch}>
            <MagnifyingGlassIcon />
          </SearchButton>
        </SearchContainer>
      </SearchSection>

      <UserSection>
        <CartLink to="/cart">
          <i className="fas fa-shopping-cart"></i>
          <span>장바구니</span>
        </CartLink>
        {user && user.nickname && user.nickname.trim() !== "" ? (
          <UserMenu ref={userMenuRef}>
            <UserInfo onClick={() => setShowUserMenu(!showUserMenu)}>
              <UserAvatar>{getInitials(user.nickname)}</UserAvatar>
              <UserName>{user.nickname}님</UserName>
            </UserInfo>
            {showUserMenu && (
              <DropdownMenu>
                {user && user.userType === "admin" ? (
                  <DropdownItem to="/admin/dashboard">
                    <i className="fas fa-chart-line"></i>
                    관리자 대시보드
                  </DropdownItem>
                ) : (
                  <DropdownItem
                    to={
                      user && user.userType === "seller"
                        ? "/seller-mypage"
                        : "/mypage"
                    }
                  >
                    <i className="fas fa-user"></i>
                    마이페이지
                  </DropdownItem>
                )}
                {user && user.userType !== "admin" && (
                  <DropdownItem to="/profile-settings">
                    <i className="fas fa-cog"></i>
                    프로필 관리
                  </DropdownItem>
                )}
                {user && user.userType === "user" && (
                  <DropdownItem to="/become-seller">
                    <i className="fas fa-store"></i>
                    판매자 전환
                  </DropdownItem>
                )}
                <DropdownDivider />
                <DropdownButton onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  로그아웃
                </DropdownButton>
              </DropdownMenu>
            )}
          </UserMenu>
        ) : (
          <LoginButton to="/login">
            <i
              className="fas fa-sign-in-alt"
              style={{ marginRight: "8px" }}
            ></i>
            로그인
          </LoginButton>
        )}
      </UserSection>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
      />
    </HeaderContainer>
  );
};

export default Header;
