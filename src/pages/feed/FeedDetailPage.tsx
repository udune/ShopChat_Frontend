import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FeedService from "../../api/feedService";
import { FeedPost, FeedComment, FeedVoteRequest } from "../../types/feed";

// 더미 데이터 (백엔드 Entity 구조에 맞춘 버전)
const dummyFeedPosts: FeedPost[] = [
  {
    id: 1,
    title: "데일리 화이트 스니커즈 코디",
    content: "데일리로 신기 좋은 화이트 스니커즈! 어디에나 잘 어울려요. 편안하고 스타일도 좋아서 매일 신고 다니고 있어요.",
    instagramId: "daily_lover",
    feedType: "DAILY",
    likeCount: 120,
    commentCount: 8,
    participantVoteCount: 0,
    user: {
      id: 1,
      nickname: "데일리러버",
      level: 2,
      profileImg: "https://readdy.ai/api/search-image?query=asian%20woman%20profile&width=60&height=60&seq=profile1",
      gender: "여성",
      height: 162,
    },
    orderItem: {
      id: 1,
      productName: "화이트 스니커즈",
      size: 240,
    },
    images: [
      {
        id: 1,
        imageUrl: "https://readdy.ai/api/search-image?query=casual%20asian%20woman%20outfit&width=400&height=500&seq=post1",
        sortOrder: 0,
      },
      {
        id: 2,
        imageUrl: "https://readdy.ai/api/search-image?query=casual%20asian%20woman%20outfit%20side&width=400&height=500&seq=post1a",
        sortOrder: 1,
      },
    ],
    hashtags: [
      { id: 1, tag: "데일리룩" },
      { id: 2, tag: "스니커즈" },
    ],
    createdAt: "2025-06-10",
    isLiked: false,
  },
  {
    id: 2,
    title: "여름 이벤트 샌들 착용샷",
    content: "여름 이벤트에 맞춰 시원하게 신은 샌들! 투표 부탁드려요~",
    instagramId: "event_guy",
    feedType: "EVENT",
    likeCount: 80,
    commentCount: 3,
    participantVoteCount: 15,
    user: {
      id: 2,
      nickname: "이벤트참가자",
      level: 3,
      profileImg: "https://readdy.ai/api/search-image?query=asian%20man%20profile&width=60&height=60&seq=profile2",
      gender: "남성",
      height: 175,
    },
    orderItem: {
      id: 2,
      productName: "여름 샌들",
      size: 260,
    },
    images: [
      {
        id: 3,
        imageUrl: "https://readdy.ai/api/search-image?query=summer%20event%20outfit&width=400&height=500&seq=event1",
        sortOrder: 0,
      },
    ],
    hashtags: [
      { id: 3, tag: "여름이벤트" },
      { id: 4, tag: "샌들" },
    ],
    createdAt: "2025-06-25",
    isLiked: false,
  },
];

const dummyComments: FeedComment[] = [
  {
    id: 1,
    content: "정말 예쁘네요! 저도 이런 스타일 도전해보고 싶어요.",
    createdAt: "2025-06-14 10:30",
    user: {
      id: 3,
      nickname: "패션리스타",
      level: 3,
      profileImg: "https://readdy.ai/api/search-image?query=stylish%20young%20asian%20person%20portrait&width=40&height=40&seq=comment1",
    },
  },
  {
    id: 2,
    content: "데님 자켓 핏이 너무 좋아요! 어디 제품인지 궁금합니다.",
    createdAt: "2025-06-14 11:15",
    user: {
      id: 4,
      nickname: "스타일마스터",
      level: 4,
      profileImg: "https://readdy.ai/api/search-image?query=fashionable%20young%20asian%20person%20portrait&width=40&height=40&seq=comment2",
    },
  },
  {
    id: 3,
    content: "신발 정보 자세히 알 수 있을까요?",
    createdAt: "2025-06-14 15:20",
    user: {
      id: 5,
      nickname: "슈즈매니아",
      level: 2,
      profileImg: "https://readdy.ai/api/search-image?query=casual%20young%20asian%20person%20portrait&width=40&height=40&seq=comment3",
    },
  },
];

const FeedDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [feed, setFeed] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [voted, setVoted] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!id) {
        navigate('/feeds');
        return;
      }

      try {
        // 🔧 백엔드 API 연동 버전
        const feedData = await FeedService.getFeed(parseInt(id));
        setFeed(feedData);
        
        // 댓글도 API로 가져오기
        const commentsData = await FeedService.getComments(parseInt(id));
        setComments(commentsData.content || []);
        
      } catch (error: any) {
        console.error('피드 조회 실패:', error);
        
        if (error.response?.status === 404) {
          // 피드를 찾을 수 없는 경우 더미 데이터 fallback
          const feedId = parseInt(id);
          const foundFeed = dummyFeedPosts.find(f => f.id === feedId);

          if (foundFeed) {
            setFeed(foundFeed);
            setComments(dummyComments);
          } else {
            navigate('/feeds');
            return;
          }
        } else {
          // 기타 에러의 경우 목록으로 이동
          navigate('/feeds');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!feed) return;  // liked 조건 제거
    
    try {
      // 🔧 백엔드 API 연동 버전
      const likeResult = await FeedService.likeFeed(feed.id);
      
      setLiked(likeResult.liked);
      setFeed(prev => prev ? { ...prev, likeCount: likeResult.likeCount } : null);
      
      // 백엔드 응답의 메시지 사용 또는 상태에 따른 동적 메시지
      const message = likeResult.liked ? "좋아요가 추가되었습니다!" : "좋아요가 취소되었습니다!";
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
    } catch (error: any) {
      console.error('좋아요 실패:', error);
      
      if (error.response?.status === 401) {
        setToastMessage("로그인이 필요합니다.");
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 409) {
        setToastMessage("처리 중 오류가 발생했습니다.");  // 409는 중복이 아닌 다른 오류일 수 있음
      } else {
        setToastMessage(error.response?.data?.message || "좋아요 처리에 실패했습니다.");
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleVote = async () => {
    if (!feed || voted) return;
    
    try {
      // 🔧 백엔드 API 연동 버전
      if (!feed.event) {
        setToastMessage("투표할 수 있는 이벤트가 없습니다.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        return;
      }
      
      const voteRequest: FeedVoteRequest = {
        eventId: feed.event.id
      };
      
      const voteResult = await FeedService.voteFeed(feed.id, voteRequest);
      
      setVoted(voteResult.voted);
      setFeed(prev => prev ? { ...prev, participantVoteCount: voteResult.voteCount } : null);
      setShowVoteModal(false);
      setToastMessage("투표가 완료되었습니다!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
    } catch (error: any) {
      console.error('투표 실패:', error);
      setShowVoteModal(false);
      
      if (error.response?.status === 401) {
        setToastMessage("로그인이 필요합니다.");
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 409) {
        setToastMessage("이미 투표하셨습니다.");
      } else if (error.response?.status === 403) {
        setToastMessage("투표 권한이 없습니다.");
      } else {
        setToastMessage(error.response?.data?.message || "투표 처리에 실패했습니다.");
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !feed) return;

    try {
      // 🔧 백엔드 API 연동 버전
      const newCommentObj = await FeedService.createComment(feed.id, {
        content: newComment
      });

      setComments([...comments, newCommentObj]);
      setNewComment("");
      
      // 댓글 수 증가
      setFeed(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      
      setToastMessage("댓글이 등록되었습니다!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
    } catch (error: any) {
      console.error('댓글 등록 실패:', error);
      
      if (error.response?.status === 401) {
        setToastMessage("로그인이 필요합니다.");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setToastMessage(error.response?.data?.message || "댓글 등록에 실패했습니다.");
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleEdit = () => {
    navigate(`/feed-edit?id=${feed?.id}`);
  };

  const handleDelete = async () => {
    if (!feed || !window.confirm("정말로 이 피드를 삭제하시겠습니까?")) return;
    
    try {
      // 🔧 백엔드 API 연동 버전
      await FeedService.deleteFeed(feed.id);
      
      setToastMessage("피드가 삭제되었습니다!");
      setShowToast(true);
      
      // 1초 후 피드 목록으로 이동
      setTimeout(() => {
        navigate('/feeds');
      }, 1000);
      
    } catch (error: any) {
      console.error('피드 삭제 실패:', error);
      
      // 에러 타입별 처리
      if (error.response?.status === 401) {
        setToastMessage("로그인이 필요합니다.");
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        setToastMessage("삭제 권한이 없습니다.");
      } else if (error.response?.status === 404) {
        setToastMessage("피드를 찾을 수 없습니다.");
      } else {
        setToastMessage(error.response?.data?.message || "피드 삭제에 실패했습니다. 다시 시도해 주세요.");
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const canEdit = user?.nickname && feed && feed.user.nickname === user.nickname;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!feed) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">피드를 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/feeds')}
            className="bg-[#87CEEB] text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition duration-200"
          >
            피드 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-5">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-[#87CEEB] transition duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          뒤로가기
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* 이미지 섹션 */}
          <div className="lg:w-1/2">
            <div className="relative">
              <img
                src={feed.images[currentImageIndex]?.imageUrl}
                alt={feed.title}
                className="w-full h-96 lg:h-[600px] object-cover"
              />
              
              {/* 이미지 네비게이션 */}
              {feed.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? feed.images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === feed.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  
                  {/* 이미지 인디케이터 */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {feed.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 상세 정보 섹션 */}
          <div className="lg:w-1/2 p-6">
            {/* 사용자 정보 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img
                  src={feed.user.profileImg || "https://readdy.ai/api/search-image?query=default%20profile&width=60&height=60"}
                  alt={feed.user.nickname}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-lg">{feed.user.nickname}</h3>
                    <div className="ml-2 bg-[#87CEEB] text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                      <i className="fas fa-crown text-yellow-300 mr-1 text-xs"></i>
                      <span>Lv.{feed.user.level || 1}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{feed.user.gender} · {feed.user.height}cm</span>
                    {feed.instagramId && (
                      <a
                        href={`https://instagram.com/${feed.instagramId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 text-[#87CEEB] hover:underline"
                      >
                        <i className="fab fa-instagram mr-1"></i>
                        {feed.instagramId}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {canEdit && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition text-sm font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-medium"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">{feed.title}</h2>
              <p className="text-gray-600">상품명: {feed.orderItem.productName}</p>
              {feed.orderItem.size && <p className="text-gray-600">신발 사이즈: {feed.orderItem.size}mm</p>}
              <p className="text-gray-500 text-sm">작성일: {feed.createdAt}</p>
            </div>

            {/* 해시태그 */}
            {feed.hashtags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {feed.hashtags.map((hashtag) => (
                    <span
                      key={hashtag.id}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      #{hashtag.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 설명 */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">내용</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{feed.content}</p>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-6">
              <div className="flex space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center focus:outline-none ${
                    liked ? 'text-red-500' : 'text-gray-500 hover:text-[#87CEEB]'
                  }`}
                >
                  <i className={`fas fa-heart mr-2 ${liked ? 'text-red-500' : ''}`}></i>
                  <span>{feed.likeCount}</span>
                </button>
                
                <div className="flex items-center text-gray-500">
                  <i className="fas fa-comment mr-2"></i>
                  <span>{feed.commentCount}</span>
                </div>
              </div>

              {feed.feedType === "EVENT" && (
                <button
                  onClick={() => setShowVoteModal(true)}
                  className={`px-4 py-2 rounded-lg transition duration-200 ${
                    voted
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-[#87CEEB] text-white hover:bg-blue-400'
                  }`}
                  disabled={voted}
                >
                  <i className="fas fa-vote-yea mr-1"></i>
                  {voted ? '투표완료' : '투표하기'} {feed.participantVoteCount}
                </button>
              )}
            </div>

            {/* 댓글 섹션 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium mb-4">댓글 {comments.length}개</h3>
              
              {/* 댓글 목록 */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.user.profileImg || "https://readdy.ai/api/search-image?query=default%20profile&width=40&height=40"}
                      alt={comment.user.nickname}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-sm">{comment.user.nickname}</span>
                        <div className="ml-2 bg-[#87CEEB] bg-opacity-10 text-[#87CEEB] text-xs px-2 py-0.5 rounded-full">
                          Lv.{comment.user.level || 1}
                        </div>
                        <span className="ml-2 text-xs text-gray-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 댓글 입력 폼 */}
              <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#87CEEB]"
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="bg-[#87CEEB] text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition duration-200"
                  disabled={!newComment.trim()}
                >
                  등록
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 투표 확인 모달 */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">투표 확인</h3>
            <p className="text-gray-600 mb-6">이 착용샷에 투표하시겠습니까?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowVoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleVote}
                className="px-4 py-2 bg-[#87CEEB] text-white rounded-lg hover:bg-blue-400"
              >
                투표하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-[#87CEEB] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedDetailPage; 