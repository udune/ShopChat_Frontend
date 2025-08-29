import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FeedList from "../../components/feed/FeedList";
import FeedDetailModal from "../../components/feed/FeedDetailModal";
import LikedUsersModal from "../../components/feed/LikedUsersModal";
import FeedUserProfile from "../../components/feed/FeedUserProfile";
import FollowListModal from "../../components/feed/FollowListModal";
import { useAuth } from "../../contexts/AuthContext";
import FeedService from "../../api/feedService";
import { UserProfileService, UserProfileData } from "../../api/userProfileService";
import axiosInstance from "../../api/axios";
import { FeedPost, FeedComment, FeedListResponseDto, PaginatedResponse } from "../../types/feed";
import { useLikedPosts } from "../../hooks/useLikedPosts";

// 한국 시간으로 날짜 포맷팅하는 유틸리티 함수
const formatKoreanTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const koreanTime = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    }).format(date);
    return koreanTime;
  } catch (error) {
    return dateString; // 파싱 실패 시 원본 반환
  }
};

// FeedListResponseDto를 FeedPost로 변환하는 함수 (FeedService의 transformBackendFeedToFrontend와 완전히 동일)
const transformFeedResponse = (feedResponse: FeedListResponseDto): FeedPost => {
  console.log('transformFeedResponse 입력:', feedResponse);
  console.log('사용자 정보 필드들:', {
    userId: feedResponse.userId,
    userNickname: feedResponse.userNickname,
    userProfileImg: feedResponse.userProfileImg,
    userLevel: feedResponse.userLevel
  });
  
  // FeedService의 transformBackendFeedToFrontend와 완전히 동일한 방식으로 변환
  const transformed: FeedPost = {
    id: feedResponse.feedId,
    title: feedResponse.title,
    content: feedResponse.content,
    instagramId: feedResponse.instagramId,
    feedType: feedResponse.feedType,
    likeCount: feedResponse.likeCount || 0,
    commentCount: feedResponse.commentCount || 0,
    participantVoteCount: feedResponse.participantVoteCount || 0,
    user: {
      id: feedResponse.userId || 0,
      nickname: feedResponse.userNickname || "알 수 없는 사용자",
      level: feedResponse.userLevel,
      profileImg: feedResponse.userProfileImg,
      gender: feedResponse.userGender,
      height: feedResponse.userHeight,
    },
    orderItem: {
      id: feedResponse.orderItemId || 0,
      productName: feedResponse.productName || "",
      size: feedResponse.productSize,
    },
    images: (feedResponse.images || []).map((img: any, index: number) => ({
      id: img.imageId || index + 1,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder || index,
    })),
    hashtags: (feedResponse.hashtags || []).map((tag: any) => ({
      id: tag.hashtagId || tag.id || 0,
      tag: tag.tag || tag.hashtag || "",
    })),
    isLiked: feedResponse.isLiked ?? false,
    isVoted: feedResponse.isVoted ?? false,
    createdAt: feedResponse.createdAt,
    updatedAt: feedResponse.createdAt, // FeedListResponseDto에는 updatedAt이 없으므로 createdAt 사용
    // 이벤트 참여 관련 필드 추가
    eventId: feedResponse.eventId,
    eventTitle: feedResponse.eventTitle,
    eventDescription: feedResponse.eventDescription,
    eventStartDate: feedResponse.eventStartDate,
    eventEndDate: feedResponse.eventEndDate,
    canVote: feedResponse.canVote ?? false,
  };
  
  console.log('transformFeedResponse 출력:', transformed);
  console.log('변환된 user 객체:', transformed.user);
  return transformed;
};

const MyFeedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const targetUserNickname = searchParams.get('userNickname'); // 하위 호환성을 위해 유지
  
  // 현재 로그인한 사용자인지 확인
  // targetUserId가 없으면 현재 사용자의 피드, 있으면 특정 사용자의 피드
  const isCurrentUser = !targetUserId;
  
  // targetUserNickname이 null인 경우 userProfile에서 가져오도록 수정
  const [effectiveTargetUserNickname, setEffectiveTargetUserNickname] = useState<string | null>(targetUserNickname);
  
  console.log('MyFeedPage 상태:', { targetUserId, targetUserNickname, effectiveTargetUserNickname, isCurrentUser, user });

  // 상태 관리
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  
  // 좋아요 상태
  const { likedPosts, updateLikedPosts, isLiked } = useLikedPosts();
  
  // 좋아요 사용자 모달 상태
  const [showLikedUsersModal, setShowLikedUsersModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState<{ id: number; nickname: string; profileImg?: string; }[]>([]);

  // 탭/정렬 상태
  const [activeTab, setActiveTab] = useState<
    "all" | "DAILY" | "EVENT" | "RANKING"
  >("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  // 데이터 로드 함수
  const loadMyFeeds = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (targetUserId && !isCurrentUser) {
        // 특정 사용자의 피드를 가져오는 경우 - 새로운 API 사용
        console.log('특정 사용자 피드 로드 시작:', { targetUserId, targetUserNickname, isCurrentUser });
        try {
          const params: any = {
            page: 0,
            size: 50,
            sort: sortBy
          };

          if (activeTab !== "all") {
            params.feedType = activeTab;
          }

          console.log('API 호출 파라미터:', params);
          
          // axios 인스턴스 사용
          const userFeedsResponse = await axiosInstance.get(`/api/feeds/user/${targetUserId}`, {
            params: params
          });

          console.log('API 응답:', userFeedsResponse.data);
          const data = userFeedsResponse.data;
          // FeedListResponseDto 형태의 응답을 FeedPost로 변환
          const transformedFeeds = (data.data.content || []).map(transformFeedResponse);
          console.log('변환된 피드들:', transformedFeeds);
          console.log('첫 번째 변환된 피드의 user 정보:', transformedFeeds[0]?.user);
          response = {
            content: transformedFeeds,
            totalElements: data.data.totalElements,
            totalPages: data.data.totalPages
          };
          console.log('처리된 응답:', response);
        } catch (error) {
          console.error('사용자 피드 조회 실패:', error);
          console.log('폴백 방식으로 처리 시작');
          // 폴백: 기존 방식으로 처리
          const params: any = {
            page: 0,
            size: 100,
            sort: sortBy
          };

          if (activeTab !== "all") {
            params.feedType = activeTab;
          }

          const allFeedsResponse = await FeedService.getFeeds(params);
          const transformedFeeds = allFeedsResponse.content.map(transformFeedResponse);
          const userFeeds = transformedFeeds.filter(feed => 
            feed.user?.nickname === targetUserNickname
          );
          
          response = {
            content: userFeeds,
            totalElements: userFeeds.length,
            totalPages: Math.ceil(userFeeds.length / 50)
          };
        }
      } else if (targetUserNickname && !isCurrentUser) {
        // 하위 호환성을 위한 기존 방식 (nickname 사용)
        const params: any = {
          page: 0,
          size: 100,
          sort: sortBy
        };

        if (activeTab !== "all") {
          params.feedType = activeTab;
        }

        const allFeedsResponse = await FeedService.getFeeds(params);
        const transformedFeeds = allFeedsResponse.content.map(transformFeedResponse);
        const userFeeds = transformedFeeds.filter(feed => 
          feed.user?.nickname === targetUserNickname
        );
        
        response = {
          content: userFeeds,
          totalElements: userFeeds.length,
          totalPages: Math.ceil(userFeeds.length / 50)
        };
      } else {
        // 현재 로그인한 사용자의 피드를 가져오는 경우
        const params: any = {
          page: 0,
          size: 50,
          sort: sortBy
        };

        if (activeTab !== "all") {
          params.feedType = activeTab;
        }

        const myFeedsResponse = await FeedService.getMyFeeds(params);
        console.log('FeedService.getMyFeeds 응답:', myFeedsResponse);
        console.log('FeedService.getMyFeeds 첫 번째 피드:', myFeedsResponse.content?.[0]);
        
        // FeedService.getMyFeeds는 이미 transformBackendFeedToFrontend로 변환된 FeedPost[]를 반환
        response = {
          content: myFeedsResponse.content || [],
          totalElements: myFeedsResponse.totalElements || 0,
          totalPages: myFeedsResponse.totalPages || 0
        };
      }

      console.log('최종 응답 설정:', response);
      console.log('설정할 피드 목록:', response.content);
      console.log('첫 번째 피드의 user 정보:', response.content?.[0]?.user);
      setFeedPosts(response.content || []);
      
      // 백엔드에서 받은 isLiked 상태만 사용
      const backendLikedIds = (response.content || [])
        .filter((feed: FeedPost) => feed.isLiked)
        .map((feed: FeedPost) => feed.id);
      
      console.log('좋아요 상태 업데이트:', backendLikedIds);
      // 전역 상태 업데이트
      updateLikedPosts(backendLikedIds);
      
    } catch (error: any) {
      console.error('피드 로드 실패:', error);
      
      if (error.response?.status === 401) {
        setError("로그인이 필요합니다.");
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError("사용자를 찾을 수 없습니다.");
      } else {
        setError(error.response?.data?.message || "피드 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 사용자 프로필 정보 로드
  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      let profile;
      if (targetUserId && !isCurrentUser) {
        // 특정 사용자의 프로필 로드 - UserProfileService 사용
        console.log('특정 사용자 프로필 로드 시작:', targetUserId);
        profile = await UserProfileService.getUserProfileById(parseInt(targetUserId));
        console.log('매핑된 프로필 데이터:', profile);
        
        // effectiveTargetUserNickname 업데이트
        if (profile && profile.nickname) {
          setEffectiveTargetUserNickname(profile.nickname);
        }
      } else {
        // 현재 로그인한 사용자의 프로필 로드
        profile = await UserProfileService.getUserProfile();
      }
      setUserProfile(profile);
    } catch (error: any) {
      console.error("사용자 프로필 로드 실패:", error);
      console.error("에러 상세:", error.response?.data);
      
      // 에러 발생 시 기본값 설정
      if (targetUserId && !isCurrentUser) {
        const fallbackProfile = {
          userId: parseInt(targetUserId),
          nickname: `사용자${targetUserId}`,
          profileImageUrl: "",
          name: `사용자${targetUserId}`,
          username: "",
          email: "",
          phone: "",
          birthDate: "",
          gender: "MALE" as const,
          height: 0,
          weight: 0,
          footSize: 0,
          footWidth: "NORMAL" as const
        };
        setUserProfile(fallbackProfile);
        setEffectiveTargetUserNickname(fallbackProfile.nickname);
      }
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (user) {
      loadMyFeeds();
      loadUserProfile(); // 사용자 프로필 로드
      loadFollowCounts(); // 팔로우 수 로드
    }
  }, [user, activeTab, sortBy, targetUserId]);

  // 사용자 로그아웃 시 좋아요 상태 초기화
  useEffect(() => {
    if (!user) {
      updateLikedPosts([]);
    }
  }, [user]);

  // 팔로우 관련 상태
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingsModal, setShowFollowingsModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 팔로우 수 로드
  const loadFollowCounts = async () => {
    if (!user) return;
    
    try {
      // 현재 사용자 ID 가져오기
      const userProfile = await UserProfileService.getUserProfile();
      if (!userProfile.userId) {
        console.warn('사용자 ID를 찾을 수 없습니다.');
        return;
      }
      
      setCurrentUserId(userProfile.userId);
      
      // 팔로우 수를 가져올 사용자 ID 결정
      const targetId = targetUserId || userProfile.userId;
      console.log('팔로우 수 로드 대상 ID:', targetId);
      
      const response = await axiosInstance.get(`/api/users/${targetId}/follow-count`);
      
      console.log('팔로우 수 응답:', response.data);
      setFollowerCount(response.data.data.followerCount);
      setFollowingCount(response.data.data.followingCount);
    } catch (error) {
      console.error('팔로우 수 로드 실패:', error);
    }
  };

  // 통계 계산
  const feedCount = feedPosts.length;
  const totalLikes = feedPosts.reduce(
    (sum: number, post: FeedPost) => sum + (post.likeCount || 0),
    0
  );

  // filteredFeeds: 탭/정렬에 따라 feedPosts를 필터링/정렬
  const filteredFeeds = feedPosts
    .filter((post: FeedPost) =>
      activeTab === "all" ? true : post.feedType === activeTab
    )
    .sort((a: FeedPost, b: FeedPost) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
    });

  // handleFeedClick: 상세 모달 오픈
  const handleFeedClick = async (post: FeedPost) => {
    console.log('피드 클릭됨:', post);
    console.log('피드 user 정보:', post.user);
    console.log('피드 user.nickname:', post.user?.nickname);
    console.log('피드 user.id:', post.user?.id);
    
    // post.id 또는 post.feedId가 유효한지 확인
    const feedId = post.id || (post as any).feedId;
    if (!post || !feedId) {
      console.error('피드 ID가 유효하지 않습니다:', post);
      return;
    }
    
    setSelectedPost(post);
    setShowComments(false);
    
    // 댓글 로드
    try {
      console.log('댓글 로드 시작, feedId:', feedId);
      const commentsData = await FeedService.getComments(feedId);
      console.log('댓글 원본 데이터:', commentsData);
      
      const commentsWithFormattedTime = (commentsData.pagination.content || []).map(comment => {
        console.log('댓글 변환 전:', comment);
        const transformed = {
          ...comment,
          createdAt: formatKoreanTime(comment.createdAt)
        };
        console.log('댓글 변환 후:', transformed);
        return transformed;
      });
      
      setComments(commentsWithFormattedTime);
      console.log('댓글 로드 완료:', commentsWithFormattedTime);
    } catch (error: any) {
      console.error('댓글 로드 실패:', error);
      setComments([]);
    }
  };

  // 좋아요 토글 (백엔드 API 연동)
  const handleLike = async (postId: number) => {
    // postId가 없으면 selectedPost에서 가져오기
    const feedId = postId || (selectedPost?.id || (selectedPost as any)?.feedId);
    if (!feedId) {
      console.error('좋아요: 피드 ID가 유효하지 않습니다');
      return;
    }
    
    try {
      const likeResult = await FeedService.likeFeed(feedId);
      
      // 백엔드 응답에 따라 좋아요 상태 업데이트
      const isCurrentlyLiked = isLiked(feedId);
      const updatedLikedPosts = isCurrentlyLiked 
        ? likedPosts.filter((id: number) => id !== feedId)
        : [...likedPosts, feedId];
      updateLikedPosts(updatedLikedPosts);
      
      // 실제 피드 데이터의 좋아요 수와 isLiked 상태 업데이트
      setFeedPosts((prev) =>
        prev.map((post) => {
          const postId = post.id || (post as any).feedId;
          return postId === feedId ? { 
            ...post, 
            likeCount: likeResult.likeCount,
            isLiked: likeResult.liked 
          } : post;
        })
      );
      
      // selectedPost도 업데이트 (모달에서 좋아요 클릭 시)
      if (selectedPost) {
        const selectedPostId = selectedPost.id || (selectedPost as any).feedId;
        if (selectedPostId === feedId) {
          setSelectedPost({
            ...selectedPost,
            likeCount: likeResult.likeCount,
            isLiked: likeResult.liked
          });
        }
      }
      
    } catch (error: any) {
      console.error('좋아요 실패:', error);
      
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate('/login');
      } else if (error.response?.status === 404) {
        alert("피드를 찾을 수 없습니다.");
      } else {
        alert(error.response?.data?.message || "좋아요 처리에 실패했습니다.");
      }
    }
  };

  // 피드 삭제
  const handleDelete = async (postId: number) => {
    if (!window.confirm("정말로 이 피드를 삭제하시겠습니까?")) return;
    
    try {
      await FeedService.deleteFeed(postId);
      
      // ✅ API 성공 후 로컬 상태 업데이트
      setFeedPosts((prev) => prev.filter((post) => post.id !== postId));
      
      // 모달 닫기
      setSelectedPost(null);
      setShowComments(false);
      
      alert("피드가 삭제되었습니다.");
      
    } catch (error: any) {
      console.error('피드 삭제 실패:', error);
      
      // 에러 타입별 처리
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert("삭제 권한이 없습니다.");
      } else if (error.response?.status === 404) {
        alert("피드를 찾을 수 없습니다.");
      } else {
        alert(error.response?.data?.message || "피드 삭제에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  // 댓글 등록
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;

    const feedId = selectedPost.id || (selectedPost as any).feedId;
    if (!feedId) {
      console.error('댓글 등록: 피드 ID가 유효하지 않습니다');
      return;
    }

    try {
      // 백엔드 API 연동
      const newCommentObj = await FeedService.createComment(feedId, {
        content: newComment
      });
      
      // 한국 시간으로 포맷팅
      const commentWithFormattedTime = {
        ...newCommentObj,
        createdAt: formatKoreanTime(newCommentObj.createdAt)
      };
      
      setComments([commentWithFormattedTime, ...comments]);
      setNewComment("");
      
      // 피드의 댓글 수 업데이트
      setFeedPosts(prev => 
        prev.map(post => {
          const postId = post.id || (post as any).feedId;
          return postId === feedId 
            ? { ...post, commentCount: post.commentCount + 1 }
            : post;
        })
      );
      
    } catch (error: any) {
      console.error('댓글 등록 실패:', error);
      
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate('/login');
      } else {
        alert(error.response?.data?.message || "댓글 등록에 실패했습니다.");
      }
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!selectedPost || !window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    
    const feedId = selectedPost.id || (selectedPost as any).feedId;
    if (!feedId) {
      console.error('댓글 삭제: 피드 ID가 유효하지 않습니다');
      return;
    }
    
    try {
      await FeedService.deleteComment(feedId, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
      
      // 피드의 댓글 수 업데이트
      setFeedPosts(prev => 
        prev.map(post => {
          const postId = post.id || (post as any).feedId;
          return postId === feedId 
            ? { ...post, commentCount: Math.max(0, post.commentCount - 1) }
            : post;
        })
      );
      
    } catch (error: any) {
      console.error('댓글 삭제 실패:', error);
      
      if (error.response?.status === 401) {
        alert("로그인이 필요합니다.");
      } else if (error.response?.status === 403) {
        alert("본인 댓글만 삭제할 수 있습니다.");
      } else if (error.response?.status === 404) {
        alert("댓글을 찾을 수 없습니다.");
      } else {
        alert(error.response?.data?.message || "댓글 삭제에 실패했습니다.");
      }
    }
  };

  // 상세 모달 닫기
  const handleCloseModal = () => {
    setSelectedPost(null);
    setShowComments(false);
  };



  // 좋아요 사용자 목록 조회 (모달에서 사용)
  const handleShowLikeUsers = async () => {
    if (!selectedPost) return;
    
    const feedId = selectedPost.id || (selectedPost as any).feedId;
    if (!feedId) {
      console.error('좋아요 사용자 목록: 피드 ID가 유효하지 않습니다');
      return;
    }
    
    try {
      const users = await FeedService.getFeedLikes(feedId);
      setLikedUsers(users.map(user => ({
        id: user.userId || 0,
        nickname: user.nickname,
        profileImg: user.profileImg
      })));
      setShowLikedUsersModal(true);
    } catch (error: any) {
      console.error('좋아요 사용자 목록 조회 실패:', error);
      alert('좋아요한 사용자 목록을 불러오지 못했습니다.');
    }
  };

  // 좋아요 수 클릭 시 좋아요한 사용자 목록 표시
  const handleLikeCountClick = async (feed: FeedPost) => {
    try {
      const users = await FeedService.getFeedLikes(feed.id);
      const mappedUsers = users.map(user => ({
        id: user.userId || 0,
        nickname: user.nickname,
        profileImg: user.profileImg
      }));
      setLikedUsers(mappedUsers);
      setShowLikedUsersModal(true);
    } catch (error) {
      console.error('좋아요한 사용자 목록 조회 실패:', error);
    }
  };

  // 투표 후 피드 목록 새로고침
  const handleVoteSuccess = async (feedId: number, newVoteCount: number) => {
    try {
      console.log(`투표 성공 처리 - feedId: ${feedId}, newVoteCount: ${newVoteCount}`);
      
      // 현재 피드 목록에서 해당 피드의 투표 수 업데이트
      setFeedPosts(prev => 
        prev.map(feed => {
          const currentFeedId = feed.id || (feed as any).feedId;
          return currentFeedId === feedId 
            ? { ...feed, participantVoteCount: newVoteCount }
            : feed;
        })
      );
      
      // selectedPost도 업데이트 (모달에서 투표 시)
      if (selectedPost) {
        const selectedFeedId = selectedPost.id || (selectedPost as any).feedId;
        if (selectedFeedId === feedId) {
          setSelectedPost({
            ...selectedPost,
            participantVoteCount: newVoteCount
          });
        }
      }
      
      // 성공 메시지 표시
      console.log(`피드 ${feedId} 투표 완료: ${newVoteCount}표`);
    } catch (error) {
      console.error('투표 후 피드 업데이트 실패:', error);
    }
  };

  // 링크 복사 함수
  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      
      // 성공 메시지 표시 (간단한 토스트)
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
      toast.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-check-circle mr-2"></i>
          <span>링크가 복사되었습니다!</span>
        </div>
      `;
      document.body.appendChild(toast);
      
      // 애니메이션 효과
      setTimeout(() => {
        toast.classList.remove('translate-x-full');
      }, 100);
      
      // 3초 후 제거
      setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 3000);
      
    } catch (error) {
      console.error('링크 복사 실패:', error);
      
      // 폴백: 구식 방식으로 복사
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // 성공 메시지 표시
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
      toast.innerHTML = `
        <div class="flex items-center">
          <i class="fas fa-check-circle mr-2"></i>
          <span>링크가 복사되었습니다!</span>
        </div>
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.remove('translate-x-full');
      }, 100);
      
      setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="p-5">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#87CEEB]"></div>
          <span className="ml-3 text-gray-600">피드를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="p-5">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
            <p className="text-lg font-medium">오류가 발생했습니다</p>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadMyFeeds}
            className="bg-[#87CEEB] text-white px-6 py-2 rounded-lg hover:bg-blue-400 transition duration-200"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src={isCurrentUser && userProfile?.profileImageUrl 
                ? userProfile.profileImageUrl 
                : "https://readdy.ai/api/search-image?query=stylish%20young%20asian%20person%20portrait%20with%20minimalist%20background&width=120&height=120&seq=myprofile"
              }
              alt={isCurrentUser ? (userProfile?.nickname || (user && user.nickname) || "My Profile") : `${userProfile?.nickname || targetUserNickname || "사용자"}님의 프로필`}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://readdy.ai/api/search-image?query=stylish%20young%20asian%20person%20portrait%20with%20minimalist%20background&width=120&height=120&seq=myprofile";
              }}
            />
            <div className="ml-6">
              <h2 className="text-3xl font-bold mb-2">
                {isCurrentUser 
                  ? `${userProfile?.nickname || (user && user.nickname) || '나'}의 스타일 피드` 
                  : `${userProfile?.nickname || targetUserNickname || `사용자${targetUserId || '알 수 없음'}`}님의 스타일 피드`
                }
              </h2>
              <div className="flex items-center mb-3">
                <div className="bg-[#87CEEB] text-white px-3 py-1 rounded-full flex items-center">
                  <i className="fas fa-crown text-yellow-300 mr-1"></i>
                  <span>Lv.4 스타일리스트</span>
                </div>
                {isCurrentUser && (
                  <button 
                    className="ml-3 text-[#87CEEB] hover:text-blue-400 flex items-center cursor-pointer transition duration-200"
                    onClick={() => navigate("/profile-settings")}
                  >
                    <i className="fas fa-edit mr-1"></i>
                    <span>프로필 수정</span>
                  </button>
                )}
                {/* 링크 복사 버튼 - 특정 사용자 페이지에서만 표시 */}
                {!isCurrentUser && (
                  <button 
                    className="ml-3 text-[#87CEEB] hover:text-blue-400 flex items-center cursor-pointer transition duration-200"
                    onClick={handleCopyLink}
                    title="이 페이지 링크 복사"
                  >
                    <i className="fas fa-link mr-1"></i>
                    <span>링크 복사</span>
                  </button>
                )}
              </div>
              
              {/* 사용자 신체 정보 표시 */}
              {userProfile && (
                <div className="mb-3">
                  <FeedUserProfile
                    userId={userProfile.userId || 0}
                    nickname={userProfile.nickname}
                    profileImageUrl={userProfile.profileImageUrl}
                    showBodyInfo={true}
                    showBodyInfoOnly={true}
                    size="medium"
                    onClick={() => {
                      // 현재 사용자인 경우에만 프로필 수정 페이지로 이동
                      if (isCurrentUser) {
                        navigate("/profile-settings");
                      }
                    }}
                  />
                </div>
              )}
              
              <p className="text-gray-600 mb-3">
                {isCurrentUser 
                  ? "나만의 스타일을 공유하고 다른 사람들과 소통해보세요!"
                  : `${userProfile?.nickname || targetUserNickname || `사용자${targetUserId || '알 수 없음'}`}님의 스타일을 확인해보세요!`
                }
              </p>
            </div>
          </div>
          {isCurrentUser && (
            <button
              className="bg-[#87CEEB] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-400 transition duration-200 flex items-center cursor-pointer"
              onClick={() => navigate("/feed-create")}
            >
              <i className="fas fa-plus-circle mr-2"></i>
              착용샷 올리기
            </button>
          )}
        </div>

        {/* 내 피드 모아보기 탭/정렬 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex gap-2 mb-2 md:mb-0">
            {[
              { key: "all", label: "전체" },
              { key: "DAILY", label: "일상" },
              { key: "EVENT", label: "이벤트" },
              { key: "RANKING", label: "랭킹" }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  activeTab === tab.key
                    ? "bg-[#87CEEB] text-white border-[#87CEEB]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#87CEEB]"
                }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center space-x-2"
              onClick={() =>
                setSortBy(sortBy === "latest" ? "popular" : "latest")
              }
            >
              <span>{sortBy === "latest" ? "최신순" : "인기순"}</span>
              <i className="fas fa-chevron-down text-sm"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold text-[#87CEEB]">{feedCount}</h3>
            <p className="text-gray-600">게시물</p>
          </div>
          <div 
            className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              // 현재 사용자 또는 특정 사용자의 팔로워 목록 표시
              const targetId = targetUserId ? parseInt(targetUserId) : currentUserId;
              if (targetId) {
                setShowFollowersModal(true);
              }
            }}
          >
            <h3 className="text-2xl font-bold text-[#87CEEB]">
              {followerCount}
            </h3>
            <p className="text-gray-600">팔로워</p>
          </div>
          <div 
            className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              // 현재 사용자 또는 특정 사용자의 팔로잉 목록 표시
              const targetId = targetUserId ? parseInt(targetUserId) : currentUserId;
              if (targetId) {
                setShowFollowingsModal(true);
              }
            }}
          >
            <h3 className="text-2xl font-bold text-[#87CEEB]">
              {followingCount}
            </h3>
            <p className="text-gray-600">팔로잉</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold text-[#87CEEB]">{totalLikes}</h3>
            <p className="text-gray-600">총 좋아요</p>
          </div>
        </div>
        
        {/* 링크 복사 섹션 - 특정 사용자 페이지에서만 표시 */}
        {!isCurrentUser && (
          <div className="mt-6 text-center">
            <button
              onClick={handleCopyLink}
              className="bg-gradient-to-r from-[#87CEEB] to-blue-400 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-400 hover:to-[#87CEEB] transition-all duration-200 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              title="이 페이지 링크를 클립보드에 복사합니다"
            >
              <i className="fas fa-link mr-2 text-lg"></i>
            </button>
            <p className="text-gray-500 text-sm mt-2">
              인스타그램, SNS 등에 공유할 수 있습니다
            </p>
          </div>
        )}
      </div>

      {/* 피드 리스트 렌더링 */}
      {feedPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-camera text-6xl mb-4"></i>
            <p className="text-xl font-medium">
              아직 피드가 없습니다
            </p>
            <p className="text-gray-500 mt-2">
              {isCurrentUser 
                ? "첫 번째 피드를 올려보세요!" 
                : `${effectiveTargetUserNickname || '사용자'}님은 아직 피드를 올리지 않았습니다.`
              }
            </p>
          </div>
          {isCurrentUser && (
            <button
              onClick={() => navigate("/feed-create")}
              className="bg-[#87CEEB] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-400 transition duration-200"
            >
              <i className="fas fa-plus-circle mr-2"></i>
              피드 올리기
            </button>
          )}
        </div>
      ) : (
        <FeedList 
          feeds={filteredFeeds} 
          onFeedClick={handleFeedClick}
          onVoteClick={handleFeedClick} // 투표 버튼 클릭 시에도 상세 페이지로 이동
          onLikeClick={(feed) => handleLike(feed.id)}
          onLikeCountClick={handleLikeCountClick}
          likedPosts={likedPosts}
          onVoteSuccess={handleVoteSuccess}
          hideVoteButtons={true} // 마이피드 페이지에서는 투표 버튼 숨김
        />
      )}

      {/* 상세 모달 */}
      <FeedDetailModal
        open={!!selectedPost}
        onClose={handleCloseModal}
        feed={selectedPost}
        comments={comments}
        showComments={showComments}
        onToggleComments={() => setShowComments(!showComments)}
        onLike={() => {
          if (selectedPost) {
            const feedId = selectedPost.id || (selectedPost as any).feedId;
            if (feedId) {
              handleLike(feedId);
            }
          }
        }}
        liked={selectedPost ? isLiked(selectedPost.id || (selectedPost as any).feedId) : false}
        onEdit={(() => {
          const isOwner = !!(user?.nickname && selectedPost?.user?.nickname && selectedPost.user.nickname === user.nickname);
          if (!isOwner || !isCurrentUser) return undefined;
          return () => {
            handleCloseModal();
            navigate(`/feed-edit?id=${selectedPost?.id}`);
          };
        })()}
        onDelete={(() => {
          const isOwner = !!(user?.nickname && selectedPost?.user?.nickname && selectedPost.user.nickname === user.nickname);
          if (!isOwner || !selectedPost || !isCurrentUser) return undefined;
          return () => handleDelete(selectedPost.id);
        })()}
        showEditButton={!!(user?.nickname && selectedPost?.user?.nickname && selectedPost.user.nickname === user.nickname && isCurrentUser)}
        showDeleteButton={!!(user?.nickname && selectedPost?.user?.nickname && selectedPost.user.nickname === user.nickname && isCurrentUser)}
        newComment={newComment}
        onCommentChange={(e) => setNewComment(e.target.value)}
        onCommentSubmit={handleCommentSubmit}
        onShowLikeUsers={handleShowLikeUsers}
        onDeleteComment={handleDeleteComment}
        currentUser={user?.nickname ? { nickname: user.nickname } : undefined}
        onUserClick={(userId) => {
          // 팔로우 버튼 클릭 시 페이지 이동하지 않고 현재 페이지에서 팔로우 상태만 변경
          // 모달은 닫지 않음 (사용자가 직접 닫을 수 있도록)
          console.log('사용자 클릭됨, 페이지 이동하지 않음:', userId);
        }}
        onFollowChange={(isFollowing: boolean) => {
          // 팔로우 상태 변경 시 팔로우 수 즉시 업데이트
          console.log('팔로우 상태 변경:', isFollowing);
          // 팔로우 수 새로고침
          loadFollowCounts();
        }}
      />

      {/* 좋아요 사용자 모달 */}
      {showLikedUsersModal && (
        <LikedUsersModal
          users={likedUsers}
          onClose={() => setShowLikedUsersModal(false)}
        />
      )}

      {/* 팔로워 목록 모달 */}
      {showFollowersModal && user && (
        <FollowListModal
          open={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={targetUserId ? parseInt(targetUserId) : (currentUserId || 0)}
          type="followers"
          title="팔로워"
          onFollowChange={loadFollowCounts}
        />
      )}

      {/* 팔로잉 목록 모달 */}
      {showFollowingsModal && user && (
        <FollowListModal
          open={showFollowingsModal}
          onClose={() => setShowFollowingsModal(false)}
          userId={targetUserId ? parseInt(targetUserId) : (currentUserId || 0)}
          type="followings"
          title="팔로잉"
          onFollowChange={loadFollowCounts}
        />
      )}
    </div>
  );
};

export default MyFeedPage;