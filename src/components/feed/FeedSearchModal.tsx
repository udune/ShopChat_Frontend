import React, { useState, useEffect } from 'react';

interface FeedSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
}

const FeedSearchModal: React.FC<FeedSearchModalProps> = ({
  open,
  onClose,
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 로컬 스토리지에서 최근 검색어 불러오기
  useEffect(() => {
    const savedSearches = localStorage.getItem('feedRecentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // 최근 검색어 저장
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    
    const updatedSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updatedSearches);
    localStorage.setItem('feedRecentSearches', JSON.stringify(updatedSearches));
  };

  // 검색 실행
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      try {
        saveRecentSearch(searchTerm.trim());
        await onSearch(searchTerm.trim());
        onClose();
      } catch (error) {
        console.error('검색 실패:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Enter 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  // 개별 검색어 삭제
  const removeSearchTerm = (term: string) => {
    const updatedSearches = recentSearches.filter(s => s !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem('feedRecentSearches', JSON.stringify(updatedSearches));
  };

  // 모든 검색어 삭제
  const clearAllSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('feedRecentSearches');
  };

  // 최근 검색어 클릭
  const handleRecentSearchClick = async (term: string) => {
    setIsSearching(true);
    try {
      setSearchTerm(term);
      await onSearch(term);
      onClose();
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto relative">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSearching}
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-lg font-semibold text-gray-800">피드 검색</h2>
          <div className="w-6"></div>
        </div>

        {/* 검색 입력 */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="검색어를 입력해주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#87CEEB] pr-12 transition-colors"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#87CEEB] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#87CEEB]"></div>
              ) : (
                <i className="fas fa-search text-lg"></i>
              )}
            </button>
          </div>
        </div>

        {/* 최근 검색어 */}
        {recentSearches.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">최근 검색어</h3>
              <button 
                onClick={clearAllSearches}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                disabled={isSearching}
              >
                모두삭제
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-2 text-sm">
                  <button 
                    onClick={() => handleRecentSearchClick(term)}
                    className="text-gray-700 hover:text-[#87CEEB] mr-2 transition-colors"
                    disabled={isSearching}
                  >
                    {term}
                  </button>
                  <button 
                    onClick={() => removeSearchTerm(term)}
                    className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                    disabled={isSearching}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 검색 팁 */}
        <div className="px-4 pb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 검색 팁</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 제목, 내용, 해시태그로 검색할 수 있습니다</li>
              <li>• 최근 검색어는 자동으로 저장됩니다</li>
              <li>• Enter 키로 빠르게 검색할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedSearchModal;
