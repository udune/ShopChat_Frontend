import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import FeedRewardService, { 
  FeedRewardEvent, 
  FeedRewardStatistics, 
  DailyStatistics,
  FeedRewardSummary 
} from '../../api/feedRewardService';
import { formatKoreanDate } from '../../utils/dateUtils';

// 애니메이션
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;



// 스타일 컴포넌트
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  font-family: 'Pretendard', sans-serif;
  padding: 2rem;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #9ca3af;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const StatCard = styled.div<{ variant?: 'success' | 'warning' | 'error' | 'info' }>`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ variant }) => {
      switch (variant) {
        case 'success': return '#10b981';
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        case 'info': return '#3b82f6';
        default: return '#6b7280';
      }
    }};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StatChange = styled.div<{ isPositive?: boolean }>`
  font-size: 0.875rem;
  color: ${({ isPositive }) => isPositive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  animation: ${fadeInUp} 1s ease-out;
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f9fafb;
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  color: #9ca3af;
  font-size: 1rem;
`;

const RecentEventsSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  animation: ${fadeInUp} 1.2s ease-out;
`;

const RecentEventsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #f9fafb;
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const EventItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const EventTitle = styled.div`
  font-weight: 500;
  color: #f9fafb;
  font-size: 0.875rem;
`;

const EventStatus = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ status }) => {
    switch (status) {
      case 'PENDING': return 'rgba(245, 158, 11, 0.2)';
      case 'PROCESSING': return 'rgba(59, 130, 246, 0.2)';
      case 'PROCESSED': return 'rgba(16, 185, 129, 0.2)';
      case 'FAILED': return 'rgba(239, 68, 68, 0.2)';
      case 'CANCELLED': return 'rgba(107, 114, 128, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'PROCESSING': return '#3b82f6';
      case 'PROCESSED': return '#10b981';
      case 'FAILED': return '#ef4444';
      case 'CANCELLED': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const EventDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  animation: ${fadeInUp} 1.4s ease-out;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  background: ${({ variant }) => {
    switch (variant) {
      case 'primary': return '#3b82f6';
      case 'secondary': return 'rgba(255, 255, 255, 0.1)';
      case 'danger': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #ef4444;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #10b981;
  margin-bottom: 1rem;
`;

// 리워드 타입 텍스트 변환 함수
// 리워드 타입 텍스트 변환 함수 - 백엔드에서 제공하는 displayName 사용
const getRewardTypeText = (type: string, displayName?: string) => {
  // 백엔드에서 displayName을 제공하면 그것을 사용, 없으면 기본 매핑
  if (displayName) {
    return displayName;
  }
  
  // 기본 매핑 (fallback)
  switch (type) {
    case 'FEED_CREATION': return '피드 작성';
    case 'FEED_LIKES_MILESTONE': return '좋아요 달성';
    case 'EVENT_FEED_PARTICIPATION': return '이벤트 참여';
    case 'COMMENT_DAILY_ACHIEVEMENT': return '댓글 달성';
    case 'DIVERSE_PRODUCT_FEED': return '다양한 상품 피드';
    default: return type;
  }
};

// 상태 텍스트 변환 함수 - 백엔드에서 제공하는 displayName 사용
const getStatusText = (status: string, displayName?: string) => {
  // 백엔드에서 displayName을 제공하면 그것을 사용, 없으면 기본 매핑
  if (displayName) {
    return displayName;
  }
  
  // 기본 매핑 (fallback)
  switch (status) {
    case 'PENDING': return '대기중';
    case 'PROCESSING': return '처리중';
    case 'PROCESSED': return '처리완료';
    case 'FAILED': return '실패';
    case 'CANCELLED': return '취소됨';
    default: return status;
  }
};
const FeedRewardDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<FeedRewardStatistics | null>(null);
  const [summary, setSummary] = useState<FeedRewardSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<FeedRewardEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingEvent, setProcessingEvent] = useState<number | null>(null);
  const [retryingFailed, setRetryingFailed] = useState(false);

  // 데이터 로드 함수
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 데이터 로드
      const [statsData, summaryData, eventsData] = await Promise.all([
        FeedRewardService.getFeedRewardStatistics(),
        FeedRewardService.getFeedRewardSummary(),
        FeedRewardService.getFeedRewardEvents({ page: 0, size: 10, sortBy: 'createdAt', sortDirection: 'DESC' })
      ]);

      setStatistics(statsData);
      setSummary(summaryData);
      setRecentEvents(eventsData.content);
    } catch (err: any) {
      console.error('대시보드 데이터 로드 실패:', err);
      setError(err.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 수동 이벤트 처리
  const handleProcessEvent = async (eventId: number) => {
    try {
      setProcessingEvent(eventId);
      const result = await FeedRewardService.processFeedRewardEvent(eventId);
      
      if (result.success) {
        setSuccessMessage(`이벤트 ${eventId}가 성공적으로 처리되었습니다.`);
        // 데이터 새로고침
        loadDashboardData();
      } else {
        setError(result.message || '이벤트 처리에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('이벤트 처리 실패:', err);
      setError(err.response?.data?.message || '이벤트 처리에 실패했습니다.');
    } finally {
      setProcessingEvent(null);
    }
  };

  // 실패한 이벤트 재처리
  const handleRetryFailedEvents = async () => {
    try {
      setRetryingFailed(true);
      const result = await FeedRewardService.retryFailedEvents();
      
      if (result.success) {
        setSuccessMessage(`${result.processedCount}개의 실패한 이벤트가 재처리되었습니다.`);
        // 데이터 새로고침
        loadDashboardData();
      } else {
        setError(result.message || '실패한 이벤트 재처리에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('실패한 이벤트 재처리 실패:', err);
      setError(err.response?.data?.message || '실패한 이벤트 재처리에 실패했습니다.');
    } finally {
      setRetryingFailed(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 주기적 데이터 새로고침 (5분마다)
  useEffect(() => {
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // 권한 확인
  if (!user || user.userType !== 'admin') {
    return (
      <Container>
        <ErrorMessage>
          관리자 권한이 필요합니다.
        </ErrorMessage>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <LoadingSpinner />
          <span style={{ marginLeft: '1rem' }}>데이터를 불러오는 중...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>피드 리워드 시스템 대시보드</Title>
        <Subtitle>피드 리워드 이벤트를 모니터링하고 관리합니다.</Subtitle>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {successMessage && (
        <SuccessMessage>
          {successMessage}
        </SuccessMessage>
      )}

      {/* 통계 카드 */}
      <StatsGrid>
        <StatCard variant="info">
          <StatTitle>총 이벤트</StatTitle>
          <StatValue>{statistics?.totalEvents || 0}</StatValue>
          <StatChange isPositive={true}>
            <span>↗</span> 전체 이벤트
          </StatChange>
        </StatCard>

        <StatCard variant="warning">
          <StatTitle>대기중</StatTitle>
          <StatValue>{statistics?.pendingEvents || 0}</StatValue>
          <StatChange isPositive={false}>
            <span>⏳</span> 처리 대기
          </StatChange>
        </StatCard>

        <StatCard variant="success">
          <StatTitle>처리완료</StatTitle>
          <StatValue>{statistics?.processedEvents || 0}</StatValue>
          <StatChange isPositive={true}>
            <span>✓</span> 성공 처리
          </StatChange>
        </StatCard>

        <StatCard variant="error">
          <StatTitle>실패</StatTitle>
          <StatValue>{statistics?.failedEvents || 0}</StatValue>
          <StatChange isPositive={false}>
            <span>✗</span> 처리 실패
          </StatChange>
        </StatCard>

        <StatCard variant="success">
          <StatTitle>총 포인트</StatTitle>
          <StatValue>{statistics?.totalPoints?.toLocaleString() || 0}</StatValue>
          <StatChange isPositive={true}>
            <span>💰</span> 지급된 포인트
          </StatChange>
        </StatCard>

        <StatCard variant="info">
          <StatTitle>평균 포인트</StatTitle>
          <StatValue>{summary?.averagePointsPerEvent?.toFixed(1) || 0}</StatValue>
          <StatChange isPositive={true}>
            <span>📊</span> 이벤트당 평균
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* 차트 및 최근 이벤트 */}
      <ContentGrid>
        <ChartSection>
          <ChartTitle>일별 이벤트 추이 (최근 7일)</ChartTitle>
          <ChartPlaceholder>
            차트 라이브러리 연동 예정
            <br />
            일별 생성/처리 이벤트 수 및 포인트 추이
          </ChartPlaceholder>
        </ChartSection>

        <RecentEventsSection>
          <RecentEventsTitle>최근 이벤트</RecentEventsTitle>
          <EventList>
            {recentEvents.length === 0 ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                최근 이벤트가 없습니다.
              </div>
            ) : (
              recentEvents.map((event) => (
                <EventItem key={event.eventId}>
                  <EventHeader>
                    <EventTitle>{getRewardTypeText(event.rewardType, event.rewardTypeDisplayName)}</EventTitle>
                    <EventStatus status={event.eventStatus}>
                      {getStatusText(event.eventStatus, event.eventStatusDisplayName)}
                    </EventStatus>
                  </EventHeader>
                  <EventDetails>
                    <div>
                      <div>사용자: {event.userNickname}</div>
                      <div>포인트: {event.points.toLocaleString()}P</div>
                      <div>생성: {formatKoreanDate(event.createdAt)}</div>
                    </div>
                    {event.eventStatus === 'FAILED' && (
                      <ActionButton
                        variant="primary"
                        onClick={() => handleProcessEvent(event.eventId)}
                        disabled={processingEvent === event.eventId}
                      >
                        {processingEvent === event.eventId ? (
                          <LoadingSpinner />
                        ) : (
                          '재처리'
                        )}
                      </ActionButton>
                    )}
                  </EventDetails>
                </EventItem>
              ))
            )}
          </EventList>
        </RecentEventsSection>
      </ContentGrid>

      {/* 관리 액션 버튼 */}
      <ActionButtons>
        <ActionButton
          variant="primary"
          onClick={loadDashboardData}
        >
          🔄 새로고침
        </ActionButton>
        
        <ActionButton
          variant="danger"
          onClick={handleRetryFailedEvents}
          disabled={retryingFailed || (statistics?.failedEvents || 0) === 0}
        >
          {retryingFailed ? (
            <>
              <LoadingSpinner />
              재처리 중...
            </>
          ) : (
            '실패한 이벤트 일괄 재처리'
          )}
        </ActionButton>
      </ActionButtons>
    </Container>
  );
};

export default FeedRewardDashboardPage;
