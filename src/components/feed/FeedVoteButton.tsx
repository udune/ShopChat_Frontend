import React, { useState, useEffect } from "react";
import { FeedType } from "../../types/feed";
import FeedService from "../../api/feedService";

interface FeedVoteButtonProps {
  feedId: number;
  feedType: FeedType;
  participantVoteCount: number;
  isVoted?: boolean; // 피드에서 받은 투표 상태
  eventStatus?: string; // 이벤트 상태 (ONGOING, ENDED, UPCOMING)
  canVote?: boolean; // 투표 가능 여부
  isOwnFeed?: boolean; // 본인 피드 여부
  size?: 'small' | 'medium' | 'large'; // 버튼 크기
  onVoteSuccess?: (voteCount: number) => void;
  onVoteError?: (error: any) => void;
}

const FeedVoteButton: React.FC<FeedVoteButtonProps> = ({
  feedId,
  feedType,
  participantVoteCount,
  isVoted: initialIsVoted,
  eventStatus,
  canVote = true, // 기본값은 true
  isOwnFeed = false, // 기본값은 false
  size = 'medium', // 기본값은 medium
  onVoteSuccess,
  onVoteError,
}) => {
  const [voted, setVoted] = useState(initialIsVoted || false);
  const [voteCount, setVoteCount] = useState(participantVoteCount);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 초기 투표 상태 설정
  useEffect(() => {
    if (initialIsVoted !== undefined) {
      setVoted(initialIsVoted);
      console.log(`초기 투표 상태 설정 - feedId: ${feedId}, isVoted: ${initialIsVoted}, feedType: ${feedType}, eventStatus: ${eventStatus}, canVote: ${canVote}`);
    }
  }, [initialIsVoted, feedId, feedType, eventStatus, canVote]);

  // 초기 투표 상태 확인 (피드에서 받은 상태가 없거나 false인 경우)
  useEffect(() => {
    const checkVoteStatus = async () => {
      // 피드에서 이미 투표 상태를 받았다면 API 호출하지 않음
      if (initialIsVoted !== undefined) {
        console.log(`피드에서 투표 상태 받음 - feedId: ${feedId}, isVoted: ${initialIsVoted}`);
        return;
      }

      try {
        console.log(`투표 상태 확인 시작 - feedId: ${feedId}`);
        const hasVoted = await FeedService.hasVoted(feedId);
        console.log(`투표 상태 확인 결과 - feedId: ${feedId}, hasVoted: ${hasVoted}`);
        setVoted(hasVoted);
      } catch (error) {
        console.error('투표 상태 확인 실패:', error);
      }
    };

    checkVoteStatus();
  }, [feedId, initialIsVoted]);

  // participantVoteCount prop이 변경될 때 voteCount 업데이트
  useEffect(() => {
    setVoteCount(participantVoteCount);
  }, [participantVoteCount]);

  const handleVote = async () => {
    if (loading) return;
    
    // feedId 유효성 검사
    if (!feedId || feedId === undefined) {
      console.error('투표 실패: feedId가 유효하지 않습니다', feedId);
      setErrorMessage('피드 ID가 유효하지 않습니다.');
      if (onVoteError) {
        onVoteError(new Error('피드 ID가 유효하지 않습니다.'));
      }
      return;
    }

    // 이벤트 상태 검증 (eventStatus가 undefined인 경우는 백엔드에서 처리)
    if (eventStatus && eventStatus !== 'ONGOING') {
      console.error('투표 실패: 이벤트가 진행중이 아닙니다', eventStatus);
      setErrorMessage('진행중인 이벤트에만 투표할 수 있습니다.');
      if (onVoteError) {
        onVoteError(new Error('진행중인 이벤트에만 투표할 수 있습니다.'));
      }
      return;
    }

    // 이미 투표한 경우
    if (voted) {
      console.log('이미 투표한 피드입니다');
      setErrorMessage('이미 투표한 이벤트입니다.');
      return;
    }
    
    console.log(`투표 시작 - feedId: ${feedId}, feedType: ${feedType}, eventStatus: ${eventStatus}`);
    setLoading(true);
    try {
      const result = await FeedService.voteFeed(feedId);
      console.log(`투표 API 응답:`, result);
      
      // 투표 완료 후 상태 재확인
      try {
        const hasVoted = await FeedService.hasVoted(feedId);
        setVoted(hasVoted);
        console.log(`투표 후 상태 재확인: ${hasVoted}`);
      } catch (error) {
        console.error('투표 상태 재확인 실패:', error);
        // 백업으로 API 응답 사용
        setVoted(result.voted);
      }
      
      // 투표 수 업데이트
      setVoteCount(result.voteCount);
      console.log(`투표 수 업데이트: ${result.voteCount}`);
      
      // 성공 콜백 호출
      if (onVoteSuccess) {
        onVoteSuccess(result.voteCount);
      }
      
      setShowVoteModal(false);
      
      // 추가로 최신 투표 수 조회
      try {
        const latestVoteCount = await FeedService.getVoteCount(feedId);
        setVoteCount(latestVoteCount);
        console.log(`최신 투표 수 조회: ${latestVoteCount}`);
        if (onVoteSuccess) {
          onVoteSuccess(latestVoteCount);
        }
      } catch (error) {
        console.error('투표 수 업데이트 실패:', error);
      }
    } catch (error: any) {
      console.error('투표 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // 에러 메시지 설정
      const errorMsg = error.response?.data?.message || '투표에 실패했습니다.';
      setErrorMessage(errorMsg);
      
      // 에러 콜백 호출
      if (onVoteError) {
        onVoteError(error);
      }
      
      // 3초 후 에러 메시지 제거
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // 버튼 크기에 따른 스타일 클래스
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1 text-sm';
      case 'large':
        return 'px-6 py-3 text-lg';
      default: // medium
        return 'px-4 py-2 text-base';
    }
  };

  // 이벤트가 아니거나 투표할 수 없는 상태면 버튼을 숨김
  if (feedType !== 'EVENT' || !canVote) {
    console.log(`투표 버튼 숨김 - feedType: ${feedType}, canVote: ${canVote}`);
    return null;
  }

  // 본인 피드면 버튼을 숨김
  if (isOwnFeed) {
    console.log(`투표 버튼 숨김 - 본인 피드: ${isOwnFeed}`);
    return null;
  }

  // 이벤트 상태가 명시적으로 진행중이 아니면 버튼을 숨김 (undefined는 백엔드에서 처리)
  if (eventStatus && eventStatus !== 'ONGOING') {
    console.log(`투표 버튼 숨김 - eventStatus: ${eventStatus}`);
    return null;
  }

  return (
    <>
      <button
        className={`rounded-lg font-medium transition ${getSizeClasses()} ${
          voted 
            ? 'bg-green-500 text-white cursor-not-allowed' 
            : 'bg-[#87CEEB] text-white hover:bg-blue-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          // 투표 완료된 경우 클릭 무시
          if (voted) {
            return;
          }
          setShowVoteModal(true);
        }}
        disabled={loading || voted}
      >
        <i className={`fas ${voted ? 'fa-check' : 'fa-vote-yea'} mr-1`}></i>
        {voted ? '투표 완료' : '투표하기'} ({voteCount})
      </button>

      {/* 투표 확인 모달 */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">투표 확인</h3>
            <p className="text-gray-600 mb-6">
              이 이벤트에 투표하시겠습니까?
            </p>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
            <div className="flex space-x-3">
              <button
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowVoteModal(false)}
                disabled={loading}
              >
                취소
              </button>
              <button
                className="flex-1 bg-[#87CEEB] text-white py-2 rounded-lg hover:bg-blue-400 transition"
                onClick={handleVote}
                disabled={loading}
              >
                {loading ? '처리중...' : '투표하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedVoteButton;
