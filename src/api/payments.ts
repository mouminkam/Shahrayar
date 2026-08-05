/**
 * Payments API endpoints
 * Handles Stripe payment processing
 */

import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";

export interface StripeConfigData {
  publishable_key: string;
  currency?: string;
}

export const getStripeConfig = async (): Promise<ApiResponse<StripeConfigData>> => {
  return axiosInstance.get<ApiResponse<StripeConfigData>, ApiResponse<StripeConfigData>>(
    "/payments/stripe/config"
  );
};

export const createStripePaymentIntentWeb = async (orderId: string | number): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/payments/stripe/web/create-intent", {
    order_id: orderId,
  });
};

export const confirmStripePaymentWeb = async (
  paymentIntentId: string,
  orderId: string | number,
  quoteId: string | null = null
): Promise<ApiResponse> => {
  const payload: Record<string, unknown> = {
    payment_intent_id: paymentIntentId,
    order_id: orderId,
  };

  if (quoteId) {
    payload.quote_id = quoteId;
  }

  return axiosInstance.post<ApiResponse, ApiResponse>("/payments/stripe/web/confirm", payload);
};

const paymentsAPI = {
  getStripeConfig,
  createStripePaymentIntentWeb,
  confirmStripePaymentWeb,
};

export default paymentsAPI;
