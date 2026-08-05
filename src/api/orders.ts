/**
 * Orders API endpoints
 * Handles order creation, retrieval, cancellation, and tracking
 */

import axiosInstance from "./config/axios";
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

export const getUserOrders = async (params: Record<string, unknown> = {}): Promise<ApiResponse> => {
  return axiosInstance.get<ApiResponse, ApiResponse>("/orders", { params });
};

export const createOrder = async (orderData: CreateOrderData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/orders", orderData);
};

/**
 * Preview promotional discount (pickup / first delivery) before placing order.
 * Requires Bearer auth. Server is source of truth; use for display only.
 */
export const previewPromoDiscount = async (body: PreviewPromoDiscountBody): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/orders/promo-discount-preview", body);
};

export const getOrderById = async (orderId: string | number): Promise<ApiResponse> => {
  return axiosInstance.get<ApiResponse, ApiResponse>(`/orders/${orderId}`);
};

export const cancelOrder = async (
  orderId: string | number,
  cancelData: CancelOrderData
): Promise<ApiResponse> => {
  return axiosInstance.put<ApiResponse, ApiResponse>(`/orders/${orderId}/cancel`, cancelData);
};

export const getAvailableCoupons = async (orderData: AvailableCouponsOrderData): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/orders/available-coupons", orderData);
};

/**
 * Reorder a previous order. Response `data.items` carries menu_item_id, size_id,
 * quantity, special_instructions, and selected_* customization arrays; `data.missing_items`
 * lists items no longer available. See REORDER_API_SPECIFICATION.md for the full backend contract.
 */
export const reorderOrder = async (orderId: string | number): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>(`/orders/${orderId}/reorder`);
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
