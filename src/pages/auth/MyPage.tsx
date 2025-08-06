import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import AddressManagementPage from "./AddressManagementPage";
import CouponsPage from "./CouponsPage";
import MyRecentOrders from "components/order/MyRecentOrders";
import { OrderService } from "api/orderService";
import { OrderListItem } from "types/order";
import MyPosts from "./MyPosts";
import MyComments from "./MyComments";
import { useAuth } from "../../contexts/AuthContext";

const myPageTempData = {
  recentOrders: [
    {
      id: 1,
      thumbnail: "https://picsum.photos/seed/picsum/200/300",
      name: "트렌디 셔츠",
      date: "2025-07-28",
      status: "배송 완료",
    },
    {
      id: 2,
      thumbnail: "https://picsum.photos/seed/picsum/200/300",
      name: "여름 팬츠",
      date: "2025-07-25",
      status: "처리 중",
    },
  ],
  feeds: [
    { id: 1, image: "https://picsum.photos/300/200", title: "여행룩 추천" },
    { id: 2, image: "https://picsum.photos/300/200", title: "오늘의 코디" },
    { id: 3, image: "https://picsum.photos/300/200", title: "나들이 데이트룩" },
  ],
  feedCount: 12,
  wishlistCount: 5,
  couponCount: 3,
};

const feeds = [
  {
    id: 1,
    image: "https://picsum.photos/seed/feed1/300/200",
    title: "OOTD #1",
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/feed2/300/200",
    title: "OOTD #2",
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/feed3/300/200",
    title: "OOTD #3",
  },
];

// 애니메이션
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  padding: 2rem;
  min-height: 100vh;
  font-family: "Pretendard", sans-serif;
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
  animation: ${fadeInUp} 0.5s ease-out;
  height: fit-content;
`;

const ProfileCard = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const ProfileImg = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f97316;
  margin-bottom: 1rem;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.3);
`;

const WelcomeMessage = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const EditProfileLink = styled(Link)`
  color: #f97316;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  transition: background 0.3s, color 0.3s;

  &:hover,
  &.active {
    background: #f97316;
    color: white;
  }

  i {
    width: 24px;
    text-align: center;
  }
`;

const MainContent = styled.main`
  animation: ${fadeInUp} 0.5s ease-out 0.2s both;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
`;

const CardTitle = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
`;

const Section = styled.section`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const FeedCarousel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const FeedCard = styled.div`
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }
`;

const FeedImg = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const FeedTitle = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 1rem;
  font-weight: 500;
`;

const MyPageDashboard = () => {
  // useAuth()에서 가져온 user 객체는 로그인 여부 확인용으로만 사용합니다.
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await OrderService.getOrders(0, 5); // 최신 5개 주문만 가져오기
        setOrders(response.content);
      } catch (error: any) {
        setError("주문 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 로그인 상태가 아니라면 렌더링하지 않거나 메시지를 보여줍니다.
  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  // 임시 데이터로 화면을 구성합니다.
  return (
    <>
      <DashboardGrid>
        <Card>
          <CardTitle>최근 주문</CardTitle>
          <CardValue>{loading ? "-" : orders.length}</CardValue>
        </Card>
        <Card>
          <CardTitle>내 피드</CardTitle>
          <CardValue>{myPageTempData.feedCount}</CardValue>
        </Card>
        <Card>
          <CardTitle>위시리스트</CardTitle>
          <CardValue>{myPageTempData.wishlistCount}</CardValue>
        </Card>
        <Card>
          <CardTitle>쿠폰</CardTitle>
          <CardValue>{myPageTempData.couponCount}</CardValue>
        </Card>
      </DashboardGrid>

      <MyRecentOrders maxItems={5} />

      <Section>
        <SectionTitle>내 피드</SectionTitle>
        <FeedCarousel>
          {myPageTempData.feeds.map((feed) => (
            <FeedCard key={feed.id}>
              <FeedImg src={feed.image} alt={feed.title} />
              <FeedTitle>{feed.title}</FeedTitle>
            </FeedCard>
          ))}
        </FeedCarousel>
      </Section>
    </>
  );
};

function MyPage() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  // 현재 경로에 따라 렌더링할 컴포넌트 결정
  const renderContent = () => {
    const pathname = location.pathname;

    if (pathname === "/mypage" || pathname === "/mypage/") {
      return <MyPageDashboard />;
    } else if (pathname === "/mypage/posts") {
      return <MyPosts />;
    } else if (pathname === "/mypage/comments") {
      return <MyComments />;
    } else if (pathname === "/mypage/settings") {
      return <AddressManagementPage />;
    } else if (pathname === "/mypage/coupons") {
      return <CouponsPage />;
    }

    return <MyPageDashboard />;
  };

  return (
    <Container>
      <MainLayout>
        <Sidebar>
          <ProfileCard>
            <ProfileImg src="https://i.pravatar.cc/150?img=32" alt="프로필" />
            <WelcomeMessage>안녕하세요, {user.nickname}님!</WelcomeMessage>
            <EditProfileLink to="/profile-settings">
              프로필 관리
            </EditProfileLink>
          </ProfileCard>
          <NavMenu>
            <NavItem
              to="/mypage"
              className={location.pathname === "/mypage" ? "active" : ""}
            >
              <i className="fas fa-tachometer-alt"></i> 대시보드
            </NavItem>
            <NavItem to="/my-orders">
              <i className="fas fa-box"></i> 주문내역
            </NavItem>
            <NavItem to="/my-feed">
              <i className="fas fa-rss"></i> 내 피드
            </NavItem>
            <NavItem to="/wishlist">
              <i className="fas fa-heart"></i> 위시리스트
            </NavItem>
            <NavItem
              to="/mypage/coupons"
              className={
                location.pathname === "/mypage/coupons" ? "active" : ""
              }
            >
              <i className="fas fa-ticket-alt"></i> 쿠폰/포인트
            </NavItem>
            <NavItem
              to="/mypage/posts"
              className={location.pathname === "/mypage/posts" ? "active" : ""}
            >
              <i className="fas fa-pen-square"></i> 내가 작성한 게시글
            </NavItem>
            <NavItem
              to="/mypage/comments"
              className={
                location.pathname === "/mypage/comments" ? "active" : ""
              }
            >
              <i className="fas fa-comment"></i> 내가 작성한 댓글
            </NavItem>
            <NavItem
              to="/mypage/settings"
              className={
                location.pathname === "/mypage/settings" ? "active" : ""
              }
            >
              <i className="fas fa-cog"></i> 설정
            </NavItem>
          </NavMenu>
        </Sidebar>
        <MainContent>{renderContent()}</MainContent>
      </MainLayout>
    </Container>
  );
}

export default MyPage;
