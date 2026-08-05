import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";

export const validateCoupon = async (params: Record<string, unknown>): Promise<ApiResponse> => {
  return axiosInstance.get<ApiResponse, ApiResponse>("/coupons/validate", { params });
};

const couponsAPI = {
  validateCoupon,
};

export default couponsAPI;
