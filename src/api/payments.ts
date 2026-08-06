/**
 * Payments API — mocked for this portfolio build. Stripe is never actually
 * charged here; PRODUCTION would call `axiosInstance` against `/payments/*`
 * and a real Stripe secret key on the backend.
 */
import { mockResponse } from "../mocks/mockClient";
import type { ApiResponse } from "./types";

export interface StripeConfigData {
  publishable_key: string;
  currency?: string;
}

export const getStripeConfig = async (): Promise<ApiResponse<StripeConfigData>> => {
  // PRODUCTION: return axiosInstance.get<ApiResponse<StripeConfigData>>("/payments/stripe/config");
  return mockResponse({
    publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    currency: "usd",
  });
};

export const createStripePaymentIntentWeb = async (orderId: string | number): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/payments/stripe/web/create-intent", { order_id: orderId });
  return mockResponse({
    client_secret: "",
    payment_intent_id: `pi_mock_${orderId}`,
    order_number: `SR-${orderId}`,
  }, "Card payments are disabled in this demo build — use Cash on Delivery to complete checkout.");
};

export const confirmStripePaymentWeb = async (
  paymentIntentId: string,
  orderId: string | number,
  _quoteId: string | null = null
): Promise<ApiResponse> => {
  // PRODUCTION: return axiosInstance.post<ApiResponse>("/payments/stripe/web/confirm", payload);
  return mockResponse({ order_id: orderId, payment_intent_id: paymentIntentId, status: "succeeded" });
};

const paymentsAPI = {
  getStripeConfig,
  createStripePaymentIntentWeb,
  confirmStripePaymentWeb,
};

export default paymentsAPI;
