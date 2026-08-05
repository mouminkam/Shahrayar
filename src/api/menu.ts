import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";
import type { MenuItemsApiResponse, CategoriesApiResponse } from "../lib/utils/responseExtractor";

// Highlights has a flat { popular, latest, chef_special } shape, distinct from
// the paginated menu-items envelope, so it keeps its own loose response type.
export type HighlightsApiResponse = ApiResponse<Record<string, unknown>>;

export const getMenuCategories = async (params: Record<string, unknown> = {}): Promise<CategoriesApiResponse> => {
  return axiosInstance.get<CategoriesApiResponse, CategoriesApiResponse>("/menu-categories", { params });
};

export const getMenuItems = async (params: Record<string, unknown> = {}): Promise<MenuItemsApiResponse> => {
  return axiosInstance.get<MenuItemsApiResponse, MenuItemsApiResponse>("/menu-items", { params });
};

export const getMenuItemById = async (itemId: string | number): Promise<MenuItemsApiResponse> => {
  return axiosInstance.get<MenuItemsApiResponse, MenuItemsApiResponse>(`/menu-items/${itemId}`);
};

export const getHighlights = async (params?: Record<string, unknown>): Promise<HighlightsApiResponse> => {
  return axiosInstance.get<HighlightsApiResponse, HighlightsApiResponse>("/menu-items/highlights", { params });
};

const menuAPI = {
  getMenuCategories,
  getMenuItems,
  getMenuItemById,
  getHighlights,
};

export default menuAPI;
