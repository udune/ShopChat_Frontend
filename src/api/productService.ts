import { ApiResponse } from "types/feed";
import axiosInstance from "./axios";
import {
  Category,
  CreateProductRequest,
  ProductDetail,
  ProductListResponse,
  ProductListItem,
  UpdateProductRequest,
} from "types/products";

export class ProductService {
  // 상품 목록 조회
  static async getProducts(
    page: number = 0,
    size: number = 20,
    sort: string = "latest"
  ): Promise<ProductListResponse> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<ProductListResponse>
      >("/api/products", { params: { page, size, sort } });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }

  // 필터링된 상품 목록 조회 (검색 포함)
  static async getFilteredProducts(params: {
    q?: string; // 검색 키워드
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    storeId?: number;
    sort?: string; // 정렬 방식
    colors?: string[]; // 색상 필터
    sizes?: string[]; // 사이즈 필터
    genders?: string[]; // 성별 필터
    inStockOnly?: boolean; // 재고 있는 상품만
    discountedOnly?: boolean; // 할인 상품만
  }): Promise<ProductListResponse> {
    try {
      // 배열 파라미터를 쉼표로 구분된 문자열로 변환 (API 명세서에 따라)
      const processedParams = {
        ...params,
        colors:
          params.colors && params.colors.length > 0
            ? params.colors.join(",")
            : undefined,
        sizes:
          params.sizes && params.sizes.length > 0
            ? params.sizes.join(",")
            : undefined,
        genders:
          params.genders && params.genders.length > 0
            ? params.genders.join(",")
            : undefined,
      };

      // undefined 값 제거
      const cleanParams = Object.fromEntries(
        Object.entries(processedParams).filter(
          ([_, value]) => value !== undefined
        )
      );

      console.log("API 요청 파라미터:", cleanParams); // 디버깅용

      // API 명세서에 따라 /api/products 엔드포인트 사용
      const response = await axiosInstance.get<
        ApiResponse<ProductListResponse>
      >("/api/products", {
        params: cleanParams,
      });

      console.log("API 응답:", response.data); // 디버깅용
      return response.data.data;
    } catch (error: any) {
      console.error("필터링된 상품 조회 실패:", error);
      console.error("에러 상세:", error.response?.data);
      throw error;
    }
  }

  // 특정 상품 상세 정보 조회
  static async getProduct(productId: number): Promise<ProductDetail> {
    try {
      const response = await axiosInstance.get<ApiResponse<ProductDetail>>(
        `/api/products/${productId}`
      );
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }

  // 카테고리 목록 조회
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Category[]>>(
        "/api/products/categories"
      );
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }

  // 판매자 상품 등록
  static async createProduct(
    productData: CreateProductRequest
  ): Promise<{ productId: number }> {
    try {
      const formData = new FormData();

      // 상품 정보 (images 필드 제외)
      const { images, ...productInfo } = productData;

      // 백엔드 DTO에 맞는 images 배열 생성
      const imageRequests = images
        .filter((img) => img.file || img.url) // 유효한 이미지만 필터링
        .map((img) => ({
          url: img.url,
          type: img.isMain || img.type === "MAIN" ? "MAIN" : "DETAIL",
        }));

      const productJson = {
        ...productInfo,
        images: imageRequests, // 백엔드가 기대하는 형태로 전송
        options: productInfo.options.map((option) => ({
          gender: option.gender,
          size: option.size.replace("SIZE_", ""), // SIZE_250 -> 250
          color: option.color,
          stock: option.stock,
        })),
      };

      formData.append(
        "product",
        new Blob([JSON.stringify(productJson)], {
          type: "application/json",
        })
      );

      // 이미지 파일들 분리
      const mainImageFiles: File[] = [];
      const detailImageFiles: File[] = [];

      images.forEach((image) => {
        if (image.file) {
          if (image.isMain || image.type === "MAIN") {
            mainImageFiles.push(image.file);
          } else {
            detailImageFiles.push(image.file);
          }
        }
      });

      // 이미지 파일 추가 (파일이 있을 때만)
      mainImageFiles.forEach((file) => {
        formData.append("mainImages", file);
      });

      detailImageFiles.forEach((file) => {
        formData.append("detailImages", file);
      });

      const response = await axiosInstance.post<
        ApiResponse<{ productId: number }>
      >("/api/seller/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }

  // 판매자 상품 수정
  static async updateProduct(
    productId: number,
    productData: UpdateProductRequest
  ): Promise<void> {
    try {
      const formData = new FormData();

      // 상품 정보 (images 필드 제외)
      const { images, options, ...productInfo } = productData;
      const productJson = {
        ...productInfo,
        options: options?.map((option) => ({
          gender: option.gender,
          size: option.size?.replace("SIZE_", ""), // SIZE_250 -> 250
          color: option.color,
          stock: option.stock,
        })),
      };

      formData.append(
        "product",
        new Blob([JSON.stringify(productJson)], {
          type: "application/json",
        })
      );

      // 이미지 파일들 분리 (수정 시에도 새 이미지가 있을 경우)
      if (images && images.length > 0) {
        const mainImageFiles: File[] = [];
        const detailImageFiles: File[] = [];

        images.forEach((image) => {
          if (image.file) {
            if (image.isMain || image.type === "MAIN") {
              mainImageFiles.push(image.file);
            } else {
              detailImageFiles.push(image.file);
            }
          }
        });

        // 이미지 파일 추가
        mainImageFiles.forEach((file) => {
          formData.append("mainImages", file);
        });

        detailImageFiles.forEach((file) => {
          formData.append("detailImages", file);
        });
      }

      await axiosInstance.put<ApiResponse<null>>(
        `/api/seller/products/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error: any) {
      console.error("상품 수정 실패:", error);
      throw error;
    }
  }

  // 판매자 상품 삭제
  static async deleteProduct(productId: number): Promise<void> {
    try {
      await axiosInstance.delete<ApiResponse<null>>(
        `/api/seller/products/${productId}`
      );
    } catch (error: any) {
      console.error("상품 삭제 실패:", error);
      throw error;
    }
  }

  // 판매자 상품 목록 조회
  static async getSellerProducts(
    page: number = 0,
    size: number = 20
  ): Promise<{
    content: ProductListItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<{
          content: ProductListItem[];
          totalElements: number;
          totalPages: number;
          size: number;
          number: number;
          first: boolean;
          last: boolean;
        }>
      >("/api/seller/products", { params: { page, size } });
      return response.data.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export default ProductService;