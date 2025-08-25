import axios from "./axios";
import { AddressRequest, AddressResponse } from "../types/types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BackendAddressResponse {
  id: number;
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  addressLine1: string;
  addressLine2?: string;
  isDefault: boolean; // ✅ 백엔드에서 보내는 필드명으로 정의
}

export const AddressService = {
  // 배송지 목록 조회
  getAddresses: async (): Promise<AddressResponse[]> => {
    try {
      const response = await axios.get<ApiResponse<BackendAddressResponse[]>>(
        "/api/users/addresses"
      );

      const backendAddresses = response.data.data;

      const frontEndAddresses: AddressResponse[] = backendAddresses.map(
        (addr) => ({
          addressId: addr.id,
          recipientName: addr.recipientName,
          recipientPhone: addr.recipientPhone,
          zipCode: addr.zipCode,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          isDefault: addr.isDefault, // 🚨 여기서 명시적으로 매핑
        })
      );

      console.log("🔍 변환된 프론트엔드 데이터:", frontEndAddresses);

      return frontEndAddresses;
    } catch (error) {
      console.error("배송지 목록 조회 실패:", error);
      throw error;
    }
  },

  // 배송지 추가
  addAddress: async (address: AddressRequest): Promise<AddressResponse> => {
    try {
      const response = await axios.post<ApiResponse<AddressResponse>>(
        "/api/users/addresses",
        address
      );
      return response.data.data;
    } catch (error) {
      console.error("배송지 추가 실패:", error);
      throw error;
    }
  },

  // 배송지 수정
  updateAddress: async (
    addressId: number,
    address: AddressRequest
  ): Promise<void> => {
    try {
      await axios.put<ApiResponse<void>>(
        `/api/users/addresses/${addressId}`,
        address
      );
    } catch (error) {
      console.error("배송지 수정 실패:", error);
      throw error;
    }
  },

  // 배송지 삭제
  deleteAddress: async (addressId: number): Promise<void> => {
    try {
      await axios.delete<ApiResponse<void>>(
        `/api/users/addresses/${addressId}`
      );
    } catch (error) {
      console.error("배송지 삭제 실패:", error);
      throw error;
    }
  },

  // 기본 배송지 설정 (배송지 수정 API 사용)
  setDefaultAddress: async (
    addressId: number,
    currentAddress: AddressResponse
  ): Promise<void> => {
    try {
      // 기존 배송지 정보에서 isDefault만 true로 변경하여 수정
      const updateData: AddressRequest = {
        recipientName: currentAddress.recipientName,
        recipientPhone: currentAddress.recipientPhone,
        zipCode: currentAddress.zipCode,
        addressLine1: currentAddress.addressLine1,
        addressLine2: currentAddress.addressLine2,
        isDefault: true, // 기본 배송지로 설정 (백엔드에서 자동으로 다른 기본 배송지 해제)
      };

      console.log("📡 API 요청:", {
        url: `/api/users/addresses/${addressId}`,
        method: "PUT",
        data: updateData,
      });

      // 🔍 요청 데이터의 isDefault 필드 확인
      console.log(
        "🔍 요청 isDefault 값:",
        updateData.isDefault,
        typeof updateData.isDefault
      );

      const response = await axios.put<ApiResponse<void>>(
        `/api/users/addresses/${addressId}`,
        updateData
      );

      console.log("📡 API 응답:", response.data);
      console.log("📡 응답 상태:", response.status);
    } catch (error: any) {
      console.error("❌ 기본 배송지 설정 실패:", error);
      if (error.response) {
        console.error("❌ 응답 에러:", error.response.data);
        console.error("❌ 상태 코드:", error.response.status);
      }
      throw error;
    }
  },
};
