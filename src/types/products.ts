export interface ProductListResponse {
  content: ProductListItem[];
  totalElement: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProductListItem {
  productId: number;
  name: string;
  price: number;
  discountPrice: number;
  storeId: number;
  storeName: string;
  wishNumber: number;
  mainImageUrl: string;
}

export interface ProductDetail {
  productId: number;
  name: string;
  price: number;
  discountType: "RATE_DISCOUNT" | "FIXED_DISCOUNT" | "NONE";
  discountValue: number;
  discountPrice: number;
  wishNumber: number;
  description: string;
  storeId: number;
  storeName: string;
  categoryType: string;
  categoryName: string;
  images: Array<{
    imageId: number;
    url: string;
    type: "MAIN" | "DETAIL";
  }>;
  options: Array<{
    optionId: number;
    gender: "MEN" | "WOMEN" | "UNISEX";
    size: string;
    color: string;
    stock: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  categoryId: number;
  type: string;
  name: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  categoryId: number;
  description: string; // 필수로 변경
  discountType?: "RATE_DISCOUNT" | "FIXED_DISCOUNT" | "NONE"; // API 명세에 맞게 수정
  discountValue?: number;
  images: ProductImageRequest[];
  options: ProductOptionRequest[];
}

export interface ProductImageRequest {
  imageId?: number; // 수정 시 사용
  url: string;
  isMain: boolean;
  displayOrder: number;
  file?: File; // 파일 브라우저용 추가
  type?: "MAIN" | "DETAIL"; // 이미지 타입 추가
}

export interface ProductOptionRequest {
  optionId?: number; // 수정 시 사용
  gender: "MEN" | "WOMEN" | "UNISEX"; // 성별 추가
  color: ColorType;
  size: SizeType;
  stock: number;
}

// 색상 타입 정의
export type ColorType = 
  | "WHITE"
  | "SILVER"
  | "LIGHT_GRAY"
  | "GRAY"
  | "DARK_GRAY"
  | "BLACK"
  | "RED"
  | "DEEP_RED"
  | "BURGUNDY"
  | "PALE_PINK"
  | "LIGHT_PINK"
  | "PINK"
  | "DARK_PINK"
  | "PEACH"
  | "LIGHT_ORANGE"
  | "ORANGE"
  | "DARK_ORANGE"
  | "IVORY"
  | "LIGHT_YELLOW"
  | "YELLOW"
  | "MUSTARD"
  | "GOLD"
  | "LIME"
  | "LIGHT_GREEN"
  | "GREEN"
  | "OLIVE_GREEN"
  | "KHAKI"
  | "DARK_GREEN"
  | "MINT"
  | "SKY_BLUE"
  | "BLUE"
  | "DARK_BLUE"
  | "NAVY"
  | "DARK_NAVY"
  | "LAVENDER"
  | "PURPLE"
  | "LIGHT_BROWN"
  | "BROWN"
  | "DARK_BROWN"
  | "SAND"
  | "BEIGE"
  | "DARK_BEIGE"
  | "OTHER_COLORS"
  | "KHAKI_BEIGE";

// 사이즈 타입 정의
export type SizeType = 
  | "SIZE_230"
  | "SIZE_235"
  | "SIZE_240"
  | "SIZE_245"
  | "SIZE_250"
  | "SIZE_255"
  | "SIZE_260"
  | "SIZE_265"
  | "SIZE_270"
  | "SIZE_275"
  | "SIZE_280"
  | "SIZE_285"
  | "SIZE_290"
  | "SIZE_295"
  | "SIZE_300";

// 색상과 사이즈 매핑 객체
export const COLOR_LABELS: Record<ColorType, string> = {
  WHITE: "화이트",
  SILVER: "실버",
  LIGHT_GRAY: "라이트 그레이",
  GRAY: "그레이",
  DARK_GRAY: "다크 그레이",
  BLACK: "블랙",
  RED: "레드",
  DEEP_RED: "딥 레드",
  BURGUNDY: "버건디",
  PALE_PINK: "페일 핑크",
  LIGHT_PINK: "라이트 핑크",
  PINK: "핑크",
  DARK_PINK: "다크 핑크",
  PEACH: "피치",
  LIGHT_ORANGE: "라이트 오렌지",
  ORANGE: "오렌지",
  DARK_ORANGE: "다크 오렌지",
  IVORY: "아이보리",
  LIGHT_YELLOW: "라이트 옐로우",
  YELLOW: "옐로우",
  MUSTARD: "머스타드",
  GOLD: "골드",
  LIME: "라임",
  LIGHT_GREEN: "라이트 그린",
  GREEN: "그린",
  OLIVE_GREEN: "올리브 그린",
  KHAKI: "카키",
  DARK_GREEN: "다크 그린",
  MINT: "민트",
  SKY_BLUE: "스카이 블루",
  BLUE: "블루",
  DARK_BLUE: "다크 블루",
  NAVY: "네이비",
  DARK_NAVY: "다크 네이비",
  LAVENDER: "라벤더",
  PURPLE: "퍼플",
  LIGHT_BROWN: "라이트 브라운",
  BROWN: "브라운",
  DARK_BROWN: "다크 브라운",
  SAND: "샌드",
  BEIGE: "베이지",
  DARK_BEIGE: "다크 베이지",
  OTHER_COLORS: "기타",
  KHAKI_BEIGE: "카키 베이지",
};

export const SIZE_LABELS: Record<SizeType, string> = {
  SIZE_230: "230",
  SIZE_235: "235",
  SIZE_240: "240",
  SIZE_245: "245",
  SIZE_250: "250",
  SIZE_255: "255",
  SIZE_260: "260",
  SIZE_265: "265",
  SIZE_270: "270",
  SIZE_275: "275",
  SIZE_280: "280",
  SIZE_285: "285",
  SIZE_290: "290",
  SIZE_295: "295",
  SIZE_300: "300",
};

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  categoryId?: number;
  description?: string;
  discountType?: "RATE_DISCOUNT" | "FIXED_DISCOUNT" | "NONE";
  discountValue?: number;
  images?: ProductImageRequest[];
  options?: ProductOptionRequest[];
}

export interface CategoryFilterParams {
  categoryId: number; // 선택된 카테고리 ID
  minPrice: number; // 최소 가격
  maxPrice: number; // 최대 가격
  page?: number; // 페이지 번호 (기본값: 0)
  size?: number; // 페이지 크기 (기본값: 20)
  storeId?: number; // 스토어 ID (선택적)
  sort?: string; // 정렬 방식 (latest/popular, 기본값: latest)
}

export interface Store {
  storeId: number;
  storeName: string;
}

export interface SellerStore {
  storeId: number;
  sellerId: number;
  storeName: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect?: (category: Category) => void;
}
