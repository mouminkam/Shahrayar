import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";

export const getTermsConditions = async (locale = "bg"): Promise<ApiResponse> => {
  return axiosInstance.get<ApiResponse, ApiResponse>("/legal/terms-conditions", {
    params: { locale },
  });
};

export const getPrivacyPolicy = async (locale = "bg"): Promise<ApiResponse> => {
  return axiosInstance.get<ApiResponse, ApiResponse>("/legal/privacy-policy", {
    params: { locale },
  });
};

const legalAPI = {
  getTermsConditions,
  getPrivacyPolicy,
};

export default legalAPI;
