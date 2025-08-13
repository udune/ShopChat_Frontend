import { Category, CategoryFilterParams } from "types/products";
import axiosInstance from "./axios";
import { ApiResponse } from "types/api";

export class CategoryService {
  // 기본 카테고리 (fallback용)
  public static readonly DEFAULT_CATEGORIES: Category[] = [
    { categoryId: 1, type: "SNEAKERS", name: "스니커즈" },
    { categoryId: 2, type: "RUNNING", name: "러닝화" },
    { categoryId: 3, type: "BOOTS", name: "부츠" },
    { categoryId: 4, type: "SANDALS", name: "샌들" },
    { categoryId: 5, type: "CONVERSE", name: "컨버스" },
    { categoryId: 6, type: "SPORTS", name: "스포츠화" },
    { categoryId: 7, type: "DRESS", name: "구두" },
  ];

  static async getCategories(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Category[]>>(
        "/api/products/categories"
      );

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      } else {
        return this.DEFAULT_CATEGORIES;
      }
    } catch (error: any) {
      // 네트워크 오류 또는 서버 오류인 경우 기본 카테고리 반환
      if (!error.response || error.response.status >= 500) {
        return this.DEFAULT_CATEGORIES;
      }

      // 그 외의 경우 에러를 다시 throw
      throw new Error(
        error.response?.data?.message ||
          "카테고리 목록을 불러오는데 실패했습니다."
      );
    }
  }

  static generateFilterUrl(params: CategoryFilterParams): string {
    const queryParams = new URLSearchParams();
    
    // 카테고리 ID는 필수
    queryParams.set("categoryId", params.categoryId.toString());
    
    // 가격 범위 (0보다 큰 경우에만 추가)
    if (params.minPrice > 0) {
      queryParams.set("minPrice", params.minPrice.toString());
    }
    if (params.maxPrice < 1000000) {
      queryParams.set("maxPrice", params.maxPrice.toString());
    }
    
    // 페이지네이션 정보
    queryParams.set("page", (params.page || 0).toString());
    queryParams.set("size", (params.size || 20).toString());
    
    // 정렬 (기본값: latest)
    queryParams.set("sort", params.sort || "latest");
    
    // 스토어 ID가 있는 경우 추가
    if (params.storeId) {
      queryParams.set("storeId", params.storeId.toString());
    }

    return `/products?${queryParams.toString()}`;
  }
}
