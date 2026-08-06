import type { ApiResponse } from "./types";
import { mockResponse } from "../mocks/mockClient";
import { mockWebsiteSlides } from "../mocks/fixtures/slides";

type SlidesApiResponse = ApiResponse<Record<string, unknown>>;

export const getWebsiteSlides = async (_params: Record<string, unknown> = {}): Promise<SlidesApiResponse> => {
  // PRODUCTION: return axiosInstance.get<SlidesApiResponse>("/website-slides", { params });
  return mockResponse({ slides: mockWebsiteSlides });
};

const slidesAPI = {
  getWebsiteSlides,
};

export default slidesAPI;
