/** PRODUCTION: return axiosInstance.get<ApiResponse>("/coupons/validate", { params }); */
import { mockError } from "../mocks/mockClient";
import type { ApiResponse } from "./types";

export const validateCoupon = async (_params: Record<string, unknown>): Promise<ApiResponse> => {
  // No coupons exist in this demo dataset — always returns "not found",
  // matching how the real endpoint behaves for an unknown code.
  return mockError("Coupon not found");
};

const couponsAPI = {
  validateCoupon,
};

export default couponsAPI;
