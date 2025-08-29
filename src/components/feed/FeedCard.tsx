import React from "react";
import styled from "styled-components";
import { FeedPost } from "../../types/feed";
import FeedUserProfile from "./FeedUserProfile";
import { getFeedTypeText, formatFeedDate, getEventStatusText, getEventStatusColor } from "../../utils/feedUtils";

interface FeedCardProps {
  feed: FeedPost;
  onClick?: () => void;
  children?: React.ReactNode;
  showEventBadge?: boolean;
  showUserProfile?: boolean;
  showProductInfo?: boolean;
}

const Card = styled.div`
  border: 1px solid rgba(229, 231, 235, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(59, 130, 246, 0.3);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const FeedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1rem;
  font-weight: 600;
`;

const EventBadge = styled.span<{ eventType?: string }>`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  background: ${props => {
    switch (props.eventType) {
      case 'BATTLE': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'RANKING': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'MISSION': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'CHALLENGE': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductInfo = styled.div`
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const DateText = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
`;

const Stat = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;



const FeedCard: React.FC<FeedCardProps> = ({ 
  feed, 
  onClick, 
  children,
  showEventBadge = true,
  showUserProfile = true,
  showProductInfo = true
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card onClick={handleClick}>
      <ImageContainer>
        {feed.images && feed.images.length > 0 ? (
          <FeedImage 
            src={feed.images[0].imageUrl} 
            alt={feed.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.setAttribute('style', 'display: flex');
            }}
          />
        ) : (
          <PlaceholderImage>
            <i className="fas fa-image"></i>
          </PlaceholderImage>
        )}
        
        {/* 이벤트 배지 */}
        {showEventBadge && feed.eventId && feed.eventTitle && (
          <EventBadge eventType={feed.eventType}>
            <i className="fas fa-star mr-1"></i>
            {getFeedTypeText(feed.feedType)}
            {feed.eventStatus && (
              <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{
                backgroundColor: getEventStatusColor(feed.eventStatus) === 'bg-green-500' ? '#10b981' :
                                getEventStatusColor(feed.eventStatus) === 'bg-blue-500' ? '#3b82f6' :
                                getEventStatusColor(feed.eventStatus) === 'bg-gray-500' ? '#6b7280' : '#9ca3af'
              }}>
                {getEventStatusText(feed.eventStatus)}
              </span>
            )}
          </EventBadge>
        )}
      </ImageContainer>
      
      <Content>
        <Title>{feed.title}</Title>
        <Description>{feed.content}</Description>
        
        {/* 상품 정보 */}
        {showProductInfo && feed.orderItem && (
          <ProductInfo>
            <i className="fas fa-shoe-prints mr-1"></i>
            {feed.orderItem.productName}
            {feed.orderItem.size && (
              <span className="ml-2">사이즈: {feed.orderItem.size}mm</span>
            )}
          </ProductInfo>
        )}
        
        {/* 사용자 프로필 */}
        {showUserProfile && feed.user && (
          <FeedUserProfile
            userId={feed.user.id}
            nickname={feed.user.nickname}
            profileImageUrl={feed.user.profileImg}
            showBodyInfo={true}
            size="small"
                         onClick={() => {
               // 사용자 프로필 클릭 처리
             }}
          />
        )}
        
        {/* 하위 컴포넌트들을 위한 슬롯 */}
        {children}
      </Content>
      
      <Footer>
        <DateText>{formatFeedDate(feed.createdAt)}</DateText>
        <Stats>
          {feed.likeCount > 0 && (
            <Stat>
              <i className="fas fa-heart text-red-400"></i>
              {feed.likeCount}
            </Stat>
          )}
          {feed.commentCount > 0 && (
            <Stat>
              <i className="fas fa-comment text-blue-400"></i>
              {feed.commentCount}
            </Stat>
          )}
          {feed.participantVoteCount && feed.participantVoteCount > 0 && (
            <Stat>
              <i className="fas fa-vote-yea text-green-400"></i>
              {feed.participantVoteCount}
            </Stat>
          )}
        </Stats>
      </Footer>
    </Card>
  );
};

export default FeedCard; 