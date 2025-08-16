import { ApiResponse } from "types/feed";
import axiosInstance from "./axios";

// 찜 목록 응답 타입 정의
export interface WishlistItem {
  wishlistId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
  discountType: string;
  discountValue: number;
  createdAt: string;
}

export interface WishlistResponse {
  wishlists: WishlistItem[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

export interface AddWishlistRequest {
  productId: number;
}

export interface AddWishlistResponse {
  wishlistId: number;
  productId: number;
  createdAt: string;
}

export class WishlistService {
  // 찜 목록 추가
  static async addToWishlist(productId: number): Promise<AddWishlistResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse<AddWishlistResponse>>(
        "/api/users/wishlist",
        { productId }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("찜 목록 추가 실패:", error);
      throw error;
    }
  }

  // 찜 목록 조회
  static async getWishlist(
    page: number = 0,
    size: number = 9
  ): Promise<WishlistResponse> {
    try {
      const response = await axiosInstance.get<ApiResponse<WishlistResponse>>(
        "/api/users/wishlist",
        { params: { page, size } }
      );
      return response.data.data;
    } catch (error: any) {
      console.error("찜 목록 조회 실패:", error);
      throw error;
    }
  }

  // 찜 목록에서 제거
  static async removeFromWishlist(productId: number): Promise<void> {
    try {
      await axiosInstance.delete<ApiResponse<null>>(
        `/api/users/wishlist/${productId}`
      );
    } catch (error: any) {
      console.error("찜 목록 제거 실패:", error);
      throw error;
    }
  }
}

export default WishlistService;