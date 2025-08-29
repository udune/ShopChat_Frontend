import { FeedPost, FeedType } from '../types/feed';

// 피드 타입 텍스트 변환
export const getFeedTypeText = (feedType: FeedType): string => {
  switch (feedType) {
    case 'DAILY':
      return '일상';
    case 'EVENT':
      return '이벤트';
    case 'RANKING':
      return '랭킹';
    default:
      return '기타';
  }
};

// 피드 타입 색상 반환
export const getFeedTypeColor = (feedType: FeedType): string => {
  switch (feedType) {
    case 'DAILY':
      return 'bg-blue-500';
    case 'EVENT':
      return 'bg-purple-500';
    case 'RANKING':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};


// 이벤트 상태 텍스트 변환
export const getEventStatusText = (eventStatus?: string): string => {
  switch (eventStatus) {
    case 'UPCOMING':
      return '예정';
    case 'ONGOING':
      return '진행중';
    case 'ENDED':
      return '종료';
    default:
      return '알 수 없음';
  }
};

// 이벤트 상태 색상 반환
export const getEventStatusColor = (eventStatus?: string): string => {
  switch (eventStatus) {
    case 'UPCOMING':
      return 'bg-blue-500';
    case 'ONGOING':
      return 'bg-green-500';
    case 'ENDED':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};
// 피드 타입 그라데이션 배경 반환
export const getFeedTypeGradient = (feedType: FeedType): string => {
  switch (feedType) {
    case 'DAILY':
      return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    case 'EVENT':
      return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    case 'RANKING':
      return 'linear-gradient(135deg, #f59e0b, #d97706)';
    default:
      return 'linear-gradient(135deg, #6b7280, #4b5563)';
  }
};

// 날짜 포맷팅 함수
export const formatFeedDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}개월 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '날짜 오류';
  }
};

// 해시태그 파싱 함수
export const parseHashtags = (content: string): string[] => {
  const hashtagRegex = /#[\w가-힣]+/g;
  return content.match(hashtagRegex) || [];
};

// 해시태그 제거 함수
export const removeHashtags = (content: string): string => {
  return content.replace(/#[\w가-힣]+/g, '').trim();
};

// 피드 내용 요약 함수
export const truncateContent = (content: string, maxLength: number = 100): string => {
  if (content.length <= maxLength) return content;
  
  const truncated = content.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};

// 피드 검색 함수
export const searchFeeds = (feeds: FeedPost[], searchTerm: string): FeedPost[] => {
  if (!searchTerm.trim()) return feeds;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return feeds.filter(feed => {
    // 제목 검색
    if (feed.title.toLowerCase().includes(lowerSearchTerm)) return true;
    
    // 내용 검색
    if (feed.content.toLowerCase().includes(lowerSearchTerm)) return true;
    
    // 해시태그 검색
    if (feed.hashtags.some(tag => tag.tag.toLowerCase().includes(lowerSearchTerm))) return true;
    
    // 사용자 닉네임 검색
    if (feed.user.nickname.toLowerCase().includes(lowerSearchTerm)) return true;
    
    // 상품명 검색
    if (feed.orderItem?.productName.toLowerCase().includes(lowerSearchTerm)) return true;
    
    return false;
  });
};

// 피드 필터링 함수
export const filterFeeds = (feeds: FeedPost[], filterType: string): FeedPost[] => {
  if (filterType === 'all') return feeds;
  
  return feeds.filter(feed => feed.feedType === filterType);
};

// 피드 정렬 함수
export const sortFeeds = (feeds: FeedPost[], sortType: string): FeedPost[] => {
  const sortedFeeds = [...feeds];
  
  switch (sortType) {
    case 'latest':
      return sortedFeeds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    case 'oldest':
      return sortedFeeds.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    case 'popular':
      return sortedFeeds.sort((a, b) => {
        const aScore = a.likeCount + a.commentCount;
        const bScore = b.likeCount + b.commentCount;
        return bScore - aScore;
      });
    
    case 'mostLiked':
      return sortedFeeds.sort((a, b) => b.likeCount - a.likeCount);
    
    case 'mostCommented':
      return sortedFeeds.sort((a, b) => b.commentCount - a.commentCount);
    
    default:
      return sortedFeeds;
  }
};

// 피드 통계 계산 함수
export const calculateFeedStats = (feeds: FeedPost[]) => {
  const totalLikes = feeds.reduce((sum, feed) => sum + feed.likeCount, 0);
  const totalComments = feeds.reduce((sum, feed) => sum + feed.commentCount, 0);
  const totalFeeds = feeds.length;
  
  const feedTypeCounts = feeds.reduce((counts, feed) => {
    counts[feed.feedType] = (counts[feed.feedType] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const averageLikes = totalFeeds > 0 ? Math.round(totalLikes / totalFeeds) : 0;
  const averageComments = totalFeeds > 0 ? Math.round(totalComments / totalFeeds) : 0;
  
  return {
    totalLikes,
    totalComments,
    totalFeeds,
    feedTypeCounts,
    averageLikes,
    averageComments
  };
};

// 이미지 URL 유효성 검사 함수
export const validateImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// 피드 생성 시 유효성 검사 함수
export const validateFeedData = (data: {
  title: string;
  content: string;
  orderItemId: number;
  imageUrls: string[];
  hashtags: string[];
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.title.trim()) {
    errors.push('제목을 입력해주세요.');
  }
  
  if (data.title.length > 100) {
    errors.push('제목은 100자 이하여야 합니다.');
  }
  
  if (!data.content.trim()) {
    errors.push('내용을 입력해주세요.');
  }
  
  if (data.content.length > 2000) {
    errors.push('내용은 2000자 이하여야 합니다.');
  }
  
  if (!data.orderItemId) {
    errors.push('상품을 선택해주세요.');
  }
  
  if (data.imageUrls.length === 0) {
    errors.push('이미지를 최소 1장 이상 업로드해주세요.');
  }
  
  if (data.imageUrls.length > 10) {
    errors.push('이미지는 최대 10장까지 업로드할 수 있습니다.');
  }
  
  if (data.hashtags.length > 20) {
    errors.push('해시태그는 최대 20개까지 입력할 수 있습니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
