import React, { useState, useEffect } from "react";
import { FeedPost, FeedComment } from "../../types/feed";
import FeedVoteButton from "./FeedVoteButton";
import FeedUserProfile from "./FeedUserProfile";
import FollowButton from "./FollowButton";
import { useAuth } from "../../contexts/AuthContext";
import { UserProfileService } from "../../api/userProfileService";

// 한국 시간으로 날짜 포맷팅하는 유틸리티 함수
const formatKoreanTime = (dateString: string) => {
  console.log('formatKoreanTime 입력:', dateString);
  try {
    const date = new Date(dateString);
    console.log('Date 객체 생성:', date);
    const koreanTime = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    }).format(date);
    console.log('포맷팅 결과:', koreanTime);
    return koreanTime;
  } catch (error) {
    console.warn('날짜 파싱 실패:', error);
    return dateString; // 파싱 실패 시 원본 반환
  }
};

interface FeedDetailModalProps {
  open: boolean;
  onClose: () => void;
  feed: FeedPost | null;
  comments: FeedComment[];
  showComments: boolean;
  onToggleComments: () => void;
  onLike: () => void;
  liked: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showToast?: boolean;
  toastMessage?: string;
  newComment: string;
  onCommentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  onShowLikeUsers?: () => void;
  onDeleteComment?: (commentId: number) => void;
  currentUser?: { nickname?: string };
  onUserClick?: (userId: number) => void;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FeedDetailModal: React.FC<FeedDetailModalProps> = ({
  open,
  onClose,
  feed,
  comments,
  showComments,
  onToggleComments,
  onLike,
  liked,
  onEdit,
  onDelete,
  showEditButton,
  showDeleteButton,
  showToast,
  toastMessage,
  newComment,
  onCommentChange,
  onCommentSubmit,
  onShowLikeUsers,
  onDeleteComment,
  currentUser,
  onUserClick,
  onFollowChange,
}) => {
  const { user } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userProfile = await UserProfileService.getUserProfile();
        setCurrentUserId(userProfile.userId || null);
      } catch (error) {
        console.error("사용자 ID 가져오기 실패:", error);
      }
    };

    if (user) {
      getCurrentUserId();
    }
  }, [user]);

  if (!open || !feed) return null;

  console.log('FeedDetailModal feed 데이터:', feed);
  console.log('FeedDetailModal feed.hashtags:', feed.hashtags);
  console.log('FeedDetailModal feed.content:', feed.content);
  console.log('FeedDetailModal feed.user:', feed.user);
  console.log('FeedDetailModal feed.orderItem:', feed.orderItem);

  const canShowDelete = showDeleteButton && !!onDelete;
  const canShowEdit = showEditButton && !!onEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* 닫기 버튼 */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
          onClick={onClose}
        >
          <i className="fas fa-times text-xl"></i>
        </button>
        
        <div className="flex flex-col lg:flex-row">
          {/* 이미지 섹션 */}
          <div className="lg:w-1/2">
            <div className="relative">
              {feed.images && feed.images.length > 0 ? (
                <img
                  src={feed.images[0]?.imageUrl}
                  alt={feed.title}
                  className="w-full h-96 lg:h-[600px] object-cover"
                />
              ) : (
                <div className="w-full h-96 lg:h-[600px] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">이미지가 없습니다</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 상세 정보 섹션 */}
          <div className="lg:w-1/2 p-6">
                        {/* 사용자 정보 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {feed.user ? (
                  <>
                    <FeedUserProfile
                      userId={feed.user.id || 0}
                      nickname={feed.user.nickname || "알 수 없는 사용자"}
                      profileImageUrl={feed.user.profileImg || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNEN0Q5REIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjNjc3NDhCIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDE0IDcgMTYuMzMgNyAxOVYyMEgxN1YxOUMxNyAxNi4zMyAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM2Nzc0OEIiLz4KPC9zdmc+Cjwvc3ZnPgo="}
                      showBodyInfo={true}
                      size="large"
                      onClick={() => {
                        if (feed.user?.id) {
                          window.location.href = `/my-feeds?userId=${feed.user.id}`;
                        }
                      }}
                    />
                    {feed.user?.level && (
                      <div className="ml-2 bg-[#87CEEB] text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                        <i className="fas fa-crown text-yellow-300 mr-1 text-xs"></i>
                        <span>Lv.{feed.user.level}</span>
                      </div>
                    )}
                    {/* 팔로우 버튼 */}
                    {feed.user && user && feed.user.nickname && feed.user.nickname !== user.nickname && (
                      <div className="ml-3">
                        <FollowButton
                          targetUserId={feed.user.id}
                          targetUserNickname={feed.user.nickname}
                          size="medium"
                          onFollowChange={onFollowChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center">
                    <img
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNEN0Q5REIiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjNjc3NDhCIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDE0IDcgMTYuMzMgNyAxOVYyMEgxN1YxOUMxNyAxNi4zMyAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM2Nzc0OEIiLz4KPC9zdmc+Cjwvc3ZnPgo="
                      alt="기본 프로필"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <div className="text-gray-500 text-sm">사용자 정보를 불러올 수 없습니다</div>
                    </div>
                  </div>
                )}
              </div>
              
              {(canShowEdit || canShowDelete) && (
                <div className="flex space-x-2">
                  {canShowEdit && (
                    <button
                      className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition text-sm font-medium"
                      onClick={onEdit}
                    >
                      수정
                    </button>
                  )}
                  {canShowDelete && (
                    <button
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-medium"
                      onClick={onDelete}
                    >
                      삭제
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">{feed.title}</h2>
              {feed.orderItem && (
                <>
                  <p className="text-gray-600">상품명: {feed.orderItem.productName}</p>
                  {feed.orderItem.size && <p className="text-gray-600">신발 사이즈: {feed.orderItem.size}mm</p>}
                </>
              )}
              {!feed.orderItem && (
                <p className="text-gray-500 text-sm">상품 정보가 없습니다</p>
              )}
              <p className="text-gray-500 text-sm">작성일: {formatKoreanTime(feed.createdAt)}</p>
            </div>

            {/* 해시태그 */}
            {feed.hashtags && feed.hashtags.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">해시태그</h3>
                <div className="flex flex-wrap gap-2">
                  {feed.hashtags.map((hashtag, index) => {
                    console.log(`해시태그 ${index}:`, hashtag);
                    // hashtag가 객체인지 문자열인지 확인하고 안전하게 처리
                    let tagText: string;
                    let key: string | number;
                    
                    if (typeof hashtag === 'string') {
                      tagText = hashtag;
                      key = index;
                    } else if (hashtag && typeof hashtag === 'object' && 'tag' in hashtag) {
                      tagText = hashtag.tag;
                      key = hashtag.id || index;
                    } else if (hashtag && typeof hashtag === 'object' && 'tagId' in hashtag) {
                      // 백엔드에서 {tagId, tag} 형태로 오는 경우
                      tagText = (hashtag as any).tag;
                      key = (hashtag as any).tagId || index;
                    } else {
                      // 예상치 못한 형태의 데이터는 건너뛰기
                      console.warn('예상치 못한 해시태그 형태:', hashtag);
                      return null;
                    }
                    
                    // #이 이미 포함되어 있으면 그대로 사용, 없으면 추가
                    const displayText = tagText && tagText.startsWith('#') ? tagText : `#${tagText || ''}`;
                    console.log(`해시태그 ${index} 표시 텍스트:`, displayText);
                    
                    // 빈 태그나 #만 있는 경우 건너뛰기
                    if (!tagText || tagText === '#' || tagText.trim() === '') {
                      return null;
                    }
                    
                    return (
                      <span
                        key={key}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {displayText}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 내용 */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">내용</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {feed.content || '내용이 없습니다'}
              </p>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-6">
              <div className="flex space-x-6">
                <button
                  onClick={onLike}
                  className={`flex items-center focus:outline-none ${
                    liked ? 'text-red-500' : 'text-gray-500 hover:text-[#87CEEB]'
                  }`}
                >
                  <i className={`fas fa-heart mr-2 ${liked ? 'text-red-500' : ''}`}></i>
                  <span 
                    className="underline decoration-dotted cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onShowLikeUsers) {
                        onShowLikeUsers();
                      }
                    }}
                  >
                    {feed.likeCount || 0}
                  </span>
                </button>
                
                <div className="flex items-center text-gray-500">
                  <i className="fas fa-comment mr-2"></i>
                  <span>{feed.commentCount || 0}</span>
                </div>
              </div>

              {/* 이벤트 피드인 경우에만 투표 버튼 표시 */}
              {feed.feedType === 'EVENT' && (
                <FeedVoteButton
                  feedId={feed.id || (feed as any).feedId}
                  feedType={feed.feedType}
                  participantVoteCount={feed.participantVoteCount || 0}
                  isVoted={feed.isVoted}
                  eventStatus={feed.eventStatus}
                  canVote={feed.canVote}
                  isOwnFeed={currentUser?.nickname === feed.user?.nickname || !feed.user?.nickname}
                  size="medium"
                  onVoteSuccess={(voteCount) => {
                    console.log("투표 성공:", voteCount);
                  }}
                  onVoteError={(error) => {
                    console.error("투표 에러:", error);
                  }}
                />
              )}
            </div>

            {/* 댓글 섹션 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium mb-4">댓글 {comments.length}개</h3>
              
              {/* 댓글 목록 */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {comments.map((comment) => {
                  console.log('댓글 렌더링:', comment);
                  console.log('댓글 사용자 정보:', {
                    user: comment.user,
                    userNickname: comment.userNickname,
                    userProfileImage: comment.userProfileImage
                  });
                  
                  const userNickname = comment.user?.nickname || comment.userNickname || "사용자";
                  const userProfileImg = comment.user?.profileImg || comment.userProfileImage || comment.userProfileImg || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEN0Q5REIiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjNjc3NDhCIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDE0IDcgMTYuMzMgNyAxOVYyMEgxN1YxOUMxNyAxNi4zMyAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM2Nzc0OEIiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                  
                  console.log('댓글 이미지 정보:', {
                    userProfileImg,
                    userProfileImage: comment.userProfileImage,
                    userProfileImgFromUser: comment.user?.profileImg
                  });
                  
                  return (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={userProfileImg}
                        alt={userNickname}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          console.log('이미지 로드 실패:', userProfileImg);
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEN0Q5REIiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjNjc3NDhCIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDE0IDcgMTYuMzMgNyAxOVYyMEgxN1YxOUMxNyAxNi4zMyAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM2Nzc0OEIiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">{userNickname}</span>
                            {comment.user?.level && (
                              <div className="ml-2 bg-[#87CEEB] bg-opacity-10 text-[#87CEEB] text-xs px-2 py-0.5 rounded-full">
                                Lv.{comment.user.level}
                              </div>
                            )}
                            <span className="ml-2 text-xs text-gray-500">{comment.createdAt}</span>
                          </div>
                          {/* 댓글 작성자만 삭제 버튼 표시 */}
                          {currentUser?.nickname && userNickname === currentUser.nickname && onDeleteComment && (
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold"
                              title="댓글 삭제"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 댓글 입력 폼 */}
              <form onSubmit={onCommentSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={onCommentChange}
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
      
      {/* 토스트 알림 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-[#87CEEB] text-white px-6 py-3 rounded-lg shadow-lg z-[70] animate-fade-in-up">
          <div className="flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            <span>{toastMessage || "처리가 완료되었습니다."}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedDetailModal;
