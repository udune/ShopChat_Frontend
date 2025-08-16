import { useState, useEffect, useCallback } from "react";
import { WishlistService, WishlistResponse } from "../../api/wishlistService";
import { useAuth } from "../../contexts/AuthContext";

interface UseWishlistReturn {
  // 찜한 상품 목록
  wishlistItems: WishlistResponse | null;
  
  // 찜한 상품 개수
  wishlistCount: number;
  
  // 찜한 상품 목록을 서버에서 다시 가져와서 업데이트하는 함수
  fetchWishlist: (page?: number, size?: number) => Promise<void>;
  
  // 상품을 찜 목록에 추가하는 함수
  addToWishlist: (productId: number) => Promise<boolean>;
  
  // 상품을 찜 목록에서 제거하는 함수
  removeFromWishlist: (productId: number) => Promise<boolean>;
  
  // 특정 상품이 찜되어 있는지 확인하는 함수
  isWishlisted: (productId: number) => boolean;
  
  // 로딩 상태
  loading: boolean;
  
  // 에러 상태
  error: string | null;
}

export const useWishlist = (): UseWishlistReturn => {
  // 상태 관리
  const [wishlistItems, setWishlistItems] = useState<WishlistResponse | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 인증 상태 가져오기
  const { user } = useAuth();
  
  /**
   * 서버에서 찜한 상품 목록을 가져와서 업데이트하는 함수
   */
  const fetchWishlist = useCallback(async (page: number = 0, size: number = 9): Promise<void> => {
    // 로그인하지 않은 사용자는 찜 목록을 null로 설정
    if (!user) {
      setWishlistItems(null);
      setWishlistCount(0);
      setError(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 서버에서 찜한 상품 목록 가져오기
      const wishlistData = await WishlistService.getWishlist(page, size);
      
      setWishlistItems(wishlistData);
      setWishlistCount(wishlistData.totalElements);
    } catch (err: any) {
      // 에러 발생 시 빈 상태로 설정
      setWishlistItems(null);
      setWishlistCount(0);
      setError(err.message || "찜 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * 상품을 찜 목록에 추가하는 함수
   */
  const addToWishlist = useCallback(async (productId: number): Promise<boolean> => {
    if (!user) {
      setError("로그인이 필요합니다.");
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await WishlistService.addToWishlist(productId);
      
      // 찜 목록 새로고침
      await fetchWishlist();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "찜 추가에 실패했습니다.";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchWishlist]);
  
  /**
   * 상품을 찜 목록에서 제거하는 함수
   */
  const removeFromWishlist = useCallback(async (productId: number): Promise<boolean> => {
    if (!user) {
      setError("로그인이 필요합니다.");
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await WishlistService.removeFromWishlist(productId);
      
      // 찜 목록 새로고침
      await fetchWishlist();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "찜 제거에 실패했습니다.";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchWishlist]);
  
  /**
   * 특정 상품이 찜되어 있는지 확인하는 함수
   */
  const isWishlisted = useCallback((productId: number): boolean => {
    if (!wishlistItems) return false;
    return wishlistItems.wishlists.some(item => item.productId === productId);
  }, [wishlistItems]);
  
  /**
   * 컴포넌트 마운트 시 찜 목록 초기화
   */
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);
  
  /**
   * 로그인 상태 변경 시 찜 목록 재조회
   */
  useEffect(() => {
    if (user) {
      // 로그인한 경우 찜 목록 조회
      fetchWishlist();
    } else {
      // 로그아웃한 경우 찜 목록 초기화
      setWishlistItems(null);
      setWishlistCount(0);
      setError(null);
    }
  }, [user, fetchWishlist]);
  
  return {
    wishlistItems,
    wishlistCount,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    loading,
    error,
  };
};