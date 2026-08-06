/**
 * Orders API — mocked for this portfolio build (see src/mocks/mockClient.ts).
 * PRODUCTION: every function would call `axiosInstance` against `/orders/*`.
 */
import { mockResponse, mockError } from "../mocks/mockClient";
import { mockOrders, findMockOrderById } from "../mocks/fixtures/users";
import type { ApiResponse } from "./types";

export interface OrderItemSelectedOptions {
  option_group_id: number;
  option_item_ids: number[];
}

export interface OrderItemInput {
  menu_item_id: number;
  quantity: number;
  ingredients?: unknown[];
  size_id?: number;
  selected_options?: OrderItemSelectedOptions[];
}

export interface CreateOrderData {
  branch_id: number;
  order_type: "pickup" | "delivery";
  subtotal: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address?: string;
  latitude?: number;
  longitude?: number;
  delivery_charge?: string;
  tax_amount?: string;
  discount_amount?: string;
  items: OrderItemInput[];
  payment_method: string;
  notes?: string;
  [key: string]: unknown;
}

export interface PreviewPromoDiscountBody {
  order_type: "pickup" | "delivery";
  subtotal: number;
}

export interface CancelOrderData {
  reason: string;
}

export interface AvailableCouponsOrderData {
  order_amount: number;
  branch_id: number;
  items: Pick<OrderItemInput, "menu_item_id" | "quantity">[];
}

let mockOrderIdCounter = 2000;

export const getUserOrders = async (_params: Record<string, unknown> = {}): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.get<ApiResponse>("/orders", { params });
  return mockResponse({ orders: mockOrders });
};

export const createOrder = async (orderData: CreateOrderData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/orders", orderData);
  const order = {
    id: ++mockOrderIdCounter,
    status: "pending",
    payment_status: orderData.payment_method === "cash" ? "pending" : "paid",
    ...orderData,
    created_at: new Date().toISOString(),
  };
  return mockResponse({ order }, "Order placed (demo mode — no real order was sent to a kitchen)");
};

export const previewPromoDiscount = async (body: PreviewPromoDiscountBody): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/orders/promo-discount-preview", body);
  return mockResponse({ has_promo_discount: false, total_after_promo_discount: body.subtotal, discount_amount: 0 });
};

export const getOrderById = async (orderId: string | number): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.get<ApiResponse>(`/orders/${orderId}`);
  const order = findMockOrderById(orderId) ?? mockOrders[0];
  return mockResponse({ order });
};

export const cancelOrder = async (orderId: string | number, cancelData: CancelOrderData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.put<ApiResponse>(`/orders/${orderId}/cancel`, cancelData);
  const order = findMockOrderById(orderId);
  if (!order) return mockError("Order not found");
  return mockResponse({ order: { ...order, status: "cancelled", cancel_reason: cancelData.reason } }, "Order cancelled (demo mode)");
};

export const getAvailableCoupons = async (_orderData: AvailableCouponsOrderData): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/orders/available-coupons", orderData);
  return mockResponse({ coupons: [] });
};

export const reorderOrder = async (orderId: string | number): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>(`/orders/${orderId}/reorder`);
  const order = findMockOrderById(orderId);
  if (!order) return mockError("Order not found");
  const items = order.order_items.map((item) => ({
    menu_item_id: item.menu_item_id,
    size_id: null,
    quantity: item.quantity,
    special_instructions: null,
    selected_ingredients: null,
    selected_options: null,
  }));
  return mockResponse({ items, missing_items: [] });
};

const ordersAPI = {
  getUserOrders,
  createOrder,
  previewPromoDiscount,
  getOrderById,
  cancelOrder,
  getAvailableCoupons,
  reorderOrder,
};

export default ordersAPI;
