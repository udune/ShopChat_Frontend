import { Store } from "types/products";
import axiosInstance from "./axios";
import { ApiResponse } from "types/api";

export class StoreService {
  static async getStores(): Promise<Store[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Store[]>>(
        "/api/stores"
      );

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error("스토어 목록 조회 실패:", error);
      throw new Error(
        error.response?.data?.message ||
          "스토어 목록을 불러오는데 실패했습니다."
      );
    }
  }
}

export default StoreService;