import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FeedList from "../../components/feed/FeedList";
import LikedUsersModal from "../../components/feed/LikedUsersModal";
import FeedSearchModal from "../../components/feed/FeedSearchModal";
import FeedService from "../../api/feedService";
import { EventDto } from "../../types/event";
import axiosInstance from "../../api/axios";
import { FeedPost, FeedListParams, FeedListResponseDto } from "../../types/feed";
import { useLikedPosts } from "../../hooks/useLikedPosts";

// 디바운싱 훅
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// FeedListResponseDto를 FeedPost로 변환하는 함수
const transformFeedResponse = (feedResponse: FeedListResponseDto): FeedPost => {
  return {
    id: feedResponse.feedId,
    title: feedResponse.title,
    content: feedResponse.content,
    images: (feedResponse.images || []).map(img => ({
      id: img.imageId,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder
    })),
    hashtags: (feedResponse.hashtags || []).map(tag => ({
      id: tag.hashtagId,
      tag: tag.tag
    })),
    user: {
      id: feedResponse.userId,
      nickname: feedResponse.userNickname,
      profileImg: feedResponse.userProfileImg,
      level: feedResponse.userLevel,
      gender: feedResponse.userGender,
      height: feedResponse.userHeight
    },
    createdAt: feedResponse.createdAt,
    updatedAt: feedResponse.createdAt, // 백엔드에서 updatedAt이 없으므로 createdAt 사용
    likeCount: feedResponse.likeCount,
    commentCount: feedResponse.commentCount,
    isLiked: feedResponse.isLiked,
    isVoted: feedResponse.isVoted,
    feedType: feedResponse.feedType,
    participantVoteCount: feedResponse.participantVoteCount,
    orderItem: {
      id: feedResponse.orderItemId,
      productName: feedResponse.productName,
      size: feedResponse.productSize
    },
    eventId: feedResponse.eventId,
    eventTitle: feedResponse.eventTitle,
    eventDescription: feedResponse.eventDescription,
    eventStartDate: feedResponse.eventStartDate,
    eventEndDate: feedResponse.eventEndDate,
    eventStatus: feedResponse.eventStatus,
    canVote: feedResponse.canVote
  };
};


// 더미 이벤트 데이터 제거 - 백엔드에서 가져옴

const FeedListPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 🔧 백엔드 연동 버전: 실제 Feed Entity 구조 사용
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const postsPerPage = 6;

  // 좋아요 상태
  const { likedPosts, updateLikedPosts } = useLikedPosts();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 좋아요 사용자 모달 상태
  const [showLikedUsersModal, setShowLikedUsersModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState<{ id: number; nickname: string; profileImg?: string; }[]>([]);

  // 검색 관련 상태
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // 실제 입력값
  const debouncedSearchTerm = useDebounce(searchInput, 300); // 디바운싱된 검색어

  // 🔧 백엔드 연동: 이벤트 데이터
  const [events, setEvents] = useState<EventDto[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  // 🔧 백엔드에서 이벤트 목록 가져오기
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      
      // EventListPage와 동일한 방식으로 API 호출
      const params: any = {
        page: 1, // 백엔드는 1-based pagination 사용
        size: 10,
        sort: "createdAt,desc" // 최신순
      };
      
      // 상태 필터링 제거 - 모든 이벤트를 가져온 후 프론트엔드에서 날짜 기준으로 필터링
      
      const response = await axiosInstance.get('/api/events/all', { params });
      
      // EventListPage와 동일한 방식으로 데이터 추출
      const eventsData = response.data.content || [];
      
      // 디버깅을 위한 임시 로그
      console.log('전체 이벤트 데이터:', eventsData);
      eventsData.forEach((event: any, index: number) => {
        console.log(`이벤트 ${index + 1}:`, {
          id: event.eventId || event.id,
          title: event.title,
          status: event.status,
          deletedAt: event.deletedAt || event.deleted_at
        });
      });
      
      // 현재 날짜 기준으로 이벤트 기간 안에 진행중인 이벤트만 필터링
      const currentDate = new Date();
      const activeEvents = eventsData.filter((event: any) => {
        // 삭제 여부 확인
        const deletedAt = event.deletedAt || event.deleted_at;
        const isDeleted = deletedAt !== null && deletedAt !== undefined && deletedAt !== '';
        
        // 백엔드에서 제공하는 참여 가능 여부 확인 (우선순위)
        const isParticipatable = event.isParticipatable;
        
        // 백엔드에서 isParticipatable 필드를 제공하는 경우 해당 값 사용
        if (isParticipatable !== undefined) {
          const isActive = isParticipatable && !isDeleted;
          
          console.log(`이벤트 ${event.eventId || event.id} 필터링 결과 (백엔드 기준):`, {
            title: event.title,
            isParticipatable,
            isDeleted,
            isActive
          });
          
          return isActive;
        }
        
        // 백엔드에서 isParticipatable 필드를 제공하지 않는 경우 프론트엔드에서 계산
        const eventStartDate = new Date(event.eventStartDate);
        const eventEndDate = new Date(event.eventEndDate);
        
        // 종료일을 다음날 자정으로 설정하여 당일까지 이벤트가 유효하도록 함
        const adjustedEndDate = new Date(eventEndDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        
        // 현재 날짜가 이벤트 기간 안에 있고, 삭제되지 않은 이벤트만
        const isInProgress = currentDate >= eventStartDate && currentDate < adjustedEndDate;
        const isActive = isInProgress && !isDeleted;
        
        console.log(`이벤트 ${event.eventId || event.id} 필터링 결과 (프론트엔드 계산):`, {
          title: event.title,
          eventStartDate: event.eventStartDate,
          eventEndDate: event.eventEndDate,
          adjustedEndDate: adjustedEndDate.toISOString(),
          currentDate: currentDate.toISOString(),
          isInProgress,
          isDeleted,
          isActive
        });
        
        return isActive;
      });
      
      console.log('최종 활성 이벤트 개수:', activeEvents.length);
      
      setEvents(activeEvents);
    } catch (error: any) {
      console.error('이벤트 목록 조회 실패:', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  // 🔧 백엔드에서 피드 목록 가져오기
  const fetchFeeds = async (page: number = 1, feedType?: string) => {
    try {
      const params: FeedListParams = {
        page: page - 1, // 백엔드는 0부터 시작
        size: postsPerPage,
        sort: sortBy === 'latest' ? 'createdAt,desc' : 'likeCount,desc'
      };

      if (feedType && feedType !== 'all') {
        params.feedType = feedType.toUpperCase() as 'DAILY' | 'EVENT' | 'RANKING';
      }

      const feedListResponse = await FeedService.getFeeds(params);
      
      return {
        feeds: feedListResponse.content || [],
        hasMore: !feedListResponse.last,
        totalPages: feedListResponse.totalPages || 0
      };
      
    } catch (error: any) {
      console.error('피드 목록 조회 실패:', error);
      return { feeds: [], hasMore: false, totalPages: 0 };
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      const result = await fetchFeeds(1, activeTab);
      const transformedFeeds = (result.feeds || []).map(transformFeedResponse);
      setFeedPosts(transformedFeeds);
      
      // 백엔드에서 받은 isLiked 상태를 기준으로 좋아요 상태 설정
      // 백엔드에서 좋아요한 피드 ID들만 사용 (백엔드의 isLiked 필드 기반)
      const backendLikedIds = transformedFeeds
        .filter(feed => feed.isLiked)
        .map(feed => feed.id);
      
      updateLikedPosts(backendLikedIds);
      
      setHasMore(result.hasMore);
      setCurrentPage(1);
      setInitialLoading(false);
    };

    loadInitialData();
    fetchEvents(); // 이벤트 데이터도 함께 가져오기
  }, [activeTab, sortBy]);

  // 사용자 로그아웃 시 좋아요 상태 초기화
  useEffect(() => {
    if (!user) {
      updateLikedPosts([]);
    }
  }, [user]);



  // 🔧 백엔드 연동 버전: 더보기 버튼
  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextPage = currentPage + 1;
    const result = await fetchFeeds(nextPage, activeTab);
    const transformedNewFeeds = (result.feeds || []).map(transformFeedResponse);
    
    setFeedPosts([...feedPosts, ...transformedNewFeeds]);
    
    // 새로 로드된 피드들의 좋아요 상태를 업데이트 (백엔드 isLiked 필드 기반)
    const newLikedFeedIds = transformedNewFeeds
      .filter(feed => feed.isLiked)
      .map(feed => feed.id);
    
    // 현재 좋아요 상태에 새로 로드된 좋아요한 피드들 추가
    const updatedLikedPosts = [
      ...likedPosts.filter((id: number) => !transformedNewFeeds.map(f => f.id).includes(id)), // 기존 상태에서 새로 로드된 피드들 제거
      ...newLikedFeedIds // 새로 로드된 피드 중 좋아요한 것들 추가
    ];
    
    updateLikedPosts(updatedLikedPosts);
    
    setHasMore(result.hasMore);
    setCurrentPage(nextPage);
    setIsLoading(false);
  };

  // 피드 상세 페이지로 이동
  const handleFeedClick = (feed: FeedPost) => {
    console.log('피드 클릭됨:', feed);
    console.log('피드 ID:', feed.id, '타입:', typeof feed.id);
    const url = `/feed/${feed.id}`;
    console.log('이동할 URL:', url);
    navigate(url);
  };

  // 🔧 백엔드 연동 버전: 좋아요 토글
  const handleLike = async (postId: number) => {
    if (!postId) return;
    
    try {
      const likeResult = await FeedService.likeFeed(postId);
      
      // 백엔드 응답에 따라 좋아요 상태 업데이트
      if (likeResult.liked) {
        updateLikedPosts([...likedPosts, postId]);
      } else {
        updateLikedPosts(likedPosts.filter((id: number) => id !== postId));
      }
      
      // 피드 목록에서도 isLiked 상태 업데이트
      setFeedPosts((prev) =>
        prev.map((p) => (p.id === postId ? { 
          ...p, 
          likeCount: likeResult.likeCount,
          isLiked: likeResult.liked 
        } : p))
      );
      
      const message = likeResult.liked ? "좋아요가 추가되었습니다!" : "좋아요가 취소되었습니다!";
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
    } catch (error: any) {
      console.error('좋아요 실패:', error);
      
      if (error.response?.status === 401) {
        setToastMessage("로그인이 필요합니다.");
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 404) {
        setToastMessage("피드를 찾을 수 없습니다.");
      } else {
        setToastMessage(error.response?.data?.message || "좋아요 처리에 실패했습니다.");
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // FeedList에서 투표하기 버튼 클릭 시 상세 페이지로 이동
  const handleVoteCardClick = (feed: FeedPost) => {
    navigate(`/feed/${feed.id}`);
  };

  // 투표 후 피드 목록 새로고침
  const handleVoteSuccess = async (feedId: number, newVoteCount: number) => {
    try {
      // 현재 피드 목록에서 해당 피드의 투표 수 업데이트
      setFeedPosts(prev => 
        prev.map(feed => 
          feed.id === feedId 
            ? { ...feed, participantVoteCount: newVoteCount }
            : feed
        )
      );
      
      // 성공 메시지 표시
      setToastMessage("투표가 완료되었습니다!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('투표 후 피드 업데이트 실패:', error);
    }
  };

  // 좋아요 수 클릭 시 좋아요한 사용자 목록 표시
  const handleLikeCountClick = async (feed: FeedPost) => {
    try {
      const users = await FeedService.getFeedLikes(feed.id);
      // userId를 id로 매핑
      const mappedUsers = users.map(user => ({
        id: user.userId || 0,
        nickname: user.nickname,
        profileImg: user.profileImg
      }));
      setLikedUsers(mappedUsers);
      setShowLikedUsersModal(true);
    } catch (error) {
      console.error('좋아요한 사용자 목록 조회 실패:', error);
      setToastMessage("좋아요한 사용자 목록을 불러오는데 실패했습니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  // 이벤트 참여하기 버튼 클릭 시 피드 생성 페이지로 이동
  const handleEventParticipate = (eventId: number) => {
    // 선택한 이벤트 정보를 피드 생성 페이지로 전달
    navigate('/feed-create', { 
      state: { 
        selectedEventId: eventId,
        fromEventList: true 
      } 
    });
  };

  // 검색 기능 (디바운싱 적용)
  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term);
    setInitialLoading(true);
    
    try {
      if (term.trim()) {
        // 검색어가 있으면 검색 API 호출
        console.log('검색어:', term);
        const searchParams = {
          q: term.trim(),
          page: 0,
          size: postsPerPage,
          sort: (sortBy === 'latest' ? 'latest' : 'popular') as 'latest' | 'popular'
        };
        
        const searchResult = await FeedService.searchFeeds(searchParams);
        setFeedPosts(searchResult.content || []);
        setCurrentPage(0);
        setHasMore((searchResult as any).hasNext || false);
        
        // 백엔드에서 받은 isLiked 상태만 사용
        const backendLikedIds = (searchResult.content || [])
          .filter((feed: FeedPost) => feed.isLiked)
          .map((feed: FeedPost) => feed.id);
        
        console.log('검색 결과 좋아요 상태 업데이트:', backendLikedIds);
        updateLikedPosts(backendLikedIds);
        
      } else {
        // 검색어가 없으면 모든 피드 표시
        await fetchFeeds();
      }
    } catch (error) {
      console.error('검색 실패:', error);
      setToastMessage("검색 중 오류가 발생했습니다.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } finally {
      setInitialLoading(false);
    }
  }, [sortBy, postsPerPage, updateLikedPosts]);

  // 디바운싱된 검색어가 변경될 때 검색 실행
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch, searchTerm]);

  if (initialLoading) {
    return (
      <div className="p-5 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#87CEEB] mx-auto"></div>
        <p className="mt-2 text-gray-600">피드를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Toast 알림 */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            {toastMessage}
          </div>
        </div>
      )}

      {/* 헤더 - FEED 제목과 검색 아이콘 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            <span className="bg-gradient-to-r from-[#87CEEB] to-blue-600 bg-clip-text text-transparent">
              FEED
            </span>
          </h1>
          {searchTerm && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">검색:</span>
              <span className="text-sm font-medium text-[#87CEEB]">"{searchTerm}"</span>
              <button
                onClick={() => handleSearch('')}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowSearchModal(true)}
          className="text-gray-600 hover:text-[#87CEEB] transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <i className="fas fa-search text-2xl"></i>
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`py-3 px-6 font-medium text-lg ${
            activeTab === "all"
              ? "text-[#87CEEB] border-b-2 border-[#87CEEB]"
              : "text-gray-500 hover:text-[#87CEEB]"
          }`}
          onClick={() => setActiveTab("all")}
        >
          일상 피드
        </button>
        <button
          className={`py-3 px-6 font-medium text-lg ${
            activeTab === "event"
              ? "text-[#87CEEB] border-b-2 border-[#87CEEB]"
              : "text-gray-500 hover:text-[#87CEEB]"
          }`}
          onClick={() => setActiveTab("event")}
        >
          이벤트 피드
        </button>
        <button
          className={`py-3 px-6 font-medium text-lg ${
            activeTab === "ranking"
              ? "text-[#87CEEB] border-b-2 border-[#87CEEB]"
              : "text-gray-500 hover:text-[#87CEEB]"
          }`}
          onClick={() => setActiveTab("ranking")}
        >
          랭킹 피드
        </button>
      </div>

      {/* 필터 및 정렬 옵션 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <button
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center space-x-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {sortBy === "latest"
                  ? "최신순"
                  : sortBy === "popular"
                  ? "인기순"
                  : "유사 유저"}
              </span>
              <i
                className={`fas fa-chevron-down text-sm transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-40">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setSortBy("latest");
                    setIsDropdownOpen(false);
                  }}
                >
                  최신순
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setSortBy("popular");
                    setIsDropdownOpen(false);
                  }}
                >
                  인기순
                </button>
              </div>
            )}
          </div>
        </div>

        <Link
          to="/feed-create"
          className="bg-[#87CEEB] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition duration-200 no-underline"
        >
          + 피드 작성
        </Link>
      </div>

      {/* 일상 피드 */}
      {activeTab === "all" && (
        <div className="mb-8">
          {searchTerm && feedPosts.filter((f) => f.feedType === "DAILY").length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-search text-6xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                "{searchTerm}"에 대한 검색 결과를 찾을 수 없습니다.
              </p>
              <button
                onClick={() => handleSearch('')}
                className="bg-[#87CEEB] text-white px-6 py-2 rounded-lg hover:bg-blue-400 transition-colors"
              >
                전체 피드 보기
              </button>
            </div>
          ) : (
            <FeedList
              feeds={feedPosts.filter((f) => f.feedType === "DAILY")}
              onFeedClick={handleFeedClick}
              onLikeClick={(feed) => handleLike(feed.id)}
              onLikeCountClick={handleLikeCountClick}
              likedPosts={likedPosts}
            />
          )}
        </div>
      )}

      {/* 이벤트 피드 */}
      {activeTab === "event" && (
        <div className="mb-8">
          {/* 이벤트 정보 카드 */}
          {eventsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">이벤트를 불러오는 중...</p>
            </div>
          ) : (events || []).length > 0 ? (
            (events || []).map((event) => (
              <div key={event.eventId} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-start mb-4">
                  <img
                    src={event.imageUrl || "https://readdy.ai/api/search-image?query=event%20promotional%20image&width=600&height=300&seq=event"}
                    alt={event.title}
                    className="w-24 h-24 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.description}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500 mb-2">
                      <span>구매기간: {event.purchasePeriod || `${event.purchaseStartDate} - ${event.purchaseEndDate}`}</span>
                      <span>투표기간: {event.votePeriod || `${event.eventStartDate} - ${event.eventEndDate}`}</span>
                      <span>발표일: {event.announcementDate}</span>
                    </div>
                    <div className="flex gap-2">
                      {typeof event.rewards === 'string' ? (
                        <span className="bg-[#87CEEB] bg-opacity-10 px-2 py-1 rounded text-[#87CEEB] font-bold">
                          {event.rewards}
                        </span>
                      ) : (
                        (event.rewards || []).map((reward, idx) => (
                          <span
                            key={idx}
                            className="bg-[#87CEEB] bg-opacity-10 px-2 py-1 rounded text-[#87CEEB] font-bold"
                          >
                            {reward.conditionValue}위: {reward.rewardDescription}
                          </span>
                        ))
                      )}
                    </div>
                    <button 
                      onClick={() => handleEventParticipate(event.eventId)}
                      className="mt-4 bg-[#87CEEB] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition duration-200 cursor-pointer"
                    >
                      이벤트 참여하기
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">현재 진행 중인 이벤트가 없습니다.</p>
            </div>
          )}
          
          {/* 이벤트 피드용 피드 카드 */}
          <FeedList
            feeds={feedPosts.filter((f) => f.feedType === "EVENT")}
            onFeedClick={handleFeedClick}
            onVoteClick={handleVoteCardClick}
            onVoteSuccess={handleVoteSuccess}
            onLikeClick={(feed) => handleLike(feed.id)}
            onLikeCountClick={handleLikeCountClick}
            likedPosts={likedPosts}
          />
        </div>
      )}

      {/* 랭킹 피드 */}
      {activeTab === "ranking" && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            이번 주 베스트 콘텐츠
          </h2>
          
          <FeedList
            feeds={feedPosts.filter((f) => f.feedType === "RANKING")}
            onFeedClick={handleFeedClick}
            onLikeClick={(feed) => handleLike(feed.id)}
            onLikeCountClick={handleLikeCountClick}
            likedPosts={likedPosts}
          />
        </div>
      )}

      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-[#87CEEB] text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                로딩 중...
              </div>
            ) : (
              "더보기"
            )}
          </button>
        </div>
      )}

      {/* 좋아요 사용자 모달 */}
      {showLikedUsersModal && (
        <LikedUsersModal
          users={likedUsers}
          onClose={() => setShowLikedUsersModal(false)}
        />
      )}

      {/* 검색 모달 */}
      <FeedSearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default FeedListPage;
