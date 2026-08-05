import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";

// Payload is consumed with direct property access (response.data.slides) across
// components; Record<string, unknown> keeps that ergonomic without full modeling.
type SlidesApiResponse = ApiResponse<Record<string, unknown>>;

export const getWebsiteSlides = async (params: Record<string, unknown> = {}): Promise<SlidesApiResponse> => {
  return axiosInstance.get<SlidesApiResponse, SlidesApiResponse>("/website-slides", { params });
};

const slidesAPI = {
  getWebsiteSlides,
};

export default slidesAPI;
