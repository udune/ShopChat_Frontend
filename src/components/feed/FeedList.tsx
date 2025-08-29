import React from "react";
import { FeedPost } from "../../types/feed";
import FeedCard from "./FeedCard";
import FeedLikeButton from "./FeedLikeButton";
import FeedVoteButton from "./FeedVoteButton";
import { useAuth } from "../../contexts/AuthContext";

interface FeedListProps {
  feeds: FeedPost[];
  onFeedClick?: (feed: FeedPost) => void;
  onVoteClick?: (feed: FeedPost) => void;
  onVoteSuccess?: (feedId: number, voteCount: number) => void;
  onLikeClick?: (feed: FeedPost) => void;
  onLikeCountClick?: (feed: FeedPost) => void;
  likedPosts?: number[];
  hideVoteButtons?: boolean; // 투표 버튼 숨김 옵션 추가
}

const FeedList: React.FC<FeedListProps> = ({
  feeds,
  onFeedClick,
  onVoteClick,
  onVoteSuccess,
  onLikeClick,
  onLikeCountClick,
  likedPosts,
  hideVoteButtons = false,
}) => {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {feeds.map((feed) => {
        const isOwnFeed = user?.nickname === feed.user?.nickname;
        
        return (
          <FeedCard
            key={feed.id || (feed as any).feedId}
            feed={feed}
            onClick={() => onFeedClick?.(feed)}
          >
            {/* 좋아요 버튼 */}
            <FeedLikeButton
              feedId={feed.id || (feed as any).feedId}
              likeCount={feed.likeCount || 0}
              isLiked={likedPosts?.includes(feed.id || (feed as any).feedId) || false}
              onLikeClick={(feedId: number) => onLikeClick?.({ ...feed, id: feedId })}
              onLikeCountClick={(feedId: number) => onLikeCountClick?.({ ...feed, id: feedId })}
            />
            
            {/* 투표 버튼 (이벤트 피드이고 본인이 아니고, 숨김 옵션이 아닌 경우만) */}
            {feed.feedType === 'EVENT' && !isOwnFeed && !hideVoteButtons && (
              <FeedVoteButton
                feedId={feed.id || (feed as any).feedId}
                feedType={feed.feedType}
                participantVoteCount={feed.participantVoteCount || 0}
                isVoted={feed.isVoted}
                eventStatus={feed.eventStatus}
                canVote={feed.canVote}
                isOwnFeed={isOwnFeed}
                size="small"
                onVoteSuccess={(voteCount) => {
                  const currentFeedId = feed.id || (feed as any).feedId;
                  // 투표 성공 시 콜백 호출
                  if (onVoteSuccess) {
                    onVoteSuccess(currentFeedId, voteCount);
                  }
                  // 기존 onVoteClick도 호출 (상세 페이지 이동용)
                  if (onVoteClick) {
                    onVoteClick({ ...feed, participantVoteCount: voteCount });
                  }
                }}
                onVoteError={(error) => console.error('투표 에러:', error)}
              />
            )}
          </FeedCard>
        );
      })}
    </div>
  );
};

export default FeedList;