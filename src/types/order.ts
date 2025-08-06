export interface PaymentItem {
  id: string;
  productName: string;
  size: string;
  discountPrice: number;
  productPrice: number;
  discount: number;
  quantity: number;
  imageUrl: string;
  selected: boolean;
}

export interface CreateOrderRequest {
  deliveryAddress: string;
  deliveryDetailAddress: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
  usedPoints: number;
  deliveryMessage: string;
  deliveryFee: number;
  paymentMethod: string; // "카드", "무통장입금", "간편결제", "휴대폰결제"
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

export interface OrderResponse {
  orderId: number;
  status: "ORDERED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  totalPrice: number;
  deliveryFee: number;
  usedPoints: number;
  earnedPoints: number;
  paymentMethod: string;
  orderedAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  finalPrice: number;
  imageUrl: string;
}

export interface OrderListItem {
  orderId: number;
  status:
    | "ORDERED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED"
    | "ALL";
  orderedAt: string;
  currency: string;
  deliveryFee: number;
  totalDiscountPrice: number;
  totalPrice: number;
  finalPrice: number;
  usedPoints: number;
  earnedPoints: number;
  items: OrderItem[];
}

export interface OrderListResponse {
  content: OrderListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrderDetail {
  orderId: number;
  status: "ORDERED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  orderedAt: string;
  usedPoints: number;
  earnedPoints: number;
  currency: string;
  deliveryFee: number;
  totalDiscountPrice: number;
  totalPrice: number;
  finalPrice: number;
  shippingInfo: {
    recipientName: string;
    recipientPhone: string;
    postalCode: string;
    deliveryAddress: string;
    deliveryDetailAddress: string;
    deliveryMessage: string;
  };
  paymentInfo: {
    paymentMethod: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
  };
  items: OrderItem[];
}

export interface PurchasedProduct {
  orderItemId: number;
  productId: number;
  productName: string;
  imageUrl: string;
  purchaseDate: string;
}

// 할인 정보
export type DiscountType = "정률" | "정액";

export type Discount = {
  product_id: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_start: string; // ISO date (e.g., "2025-06-01T00:00:00Z")
  discount_end: string;
};

export type Order = {
  orderId: number;
  status: string;
  deliveryFee: number;
  totalPrice: number;
  totalDiscountPrice: number;
  currency: string;
  usedPoints: number;
  earnedPoints: number;
  paymentInfo: {
    paymentMethod: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
  };
  shippingInfo: {
    deliveryAddress: string;
    detailDeliveryAddress: string;
    postalCode: string;
    recipientName: string;
    recipientPhone: string;
    deliveryMessage: string;
  };
  orderedAt: string;
  deletedAt: string | null;
  items: PaymentItem[];
};
