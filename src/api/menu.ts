import type { MenuItemsApiResponse, CategoriesApiResponse } from "../lib/utils/responseExtractor";
import { mockResponse } from "../mocks/mockClient";
import { mockCategories } from "../mocks/fixtures/categories";
import { mockMenuItems, findMockMenuItemById } from "../mocks/fixtures/menuItems";

export const getMenuCategories = async (_params: Record<string, unknown> = {}): Promise<CategoriesApiResponse> => {
  // PRODUCTION: return axiosInstance.get<CategoriesApiResponse>("/menu-categories", { params });
  return mockResponse({ categories: mockCategories }) as Promise<CategoriesApiResponse>;
};

export const getMenuItems = async (params: Record<string, unknown> = {}): Promise<MenuItemsApiResponse> => {
  // PRODUCTION: return axiosInstance.get<MenuItemsApiResponse>("/menu-items", { params });
  const categoryId = params.category_id != null ? String(params.category_id) : null;
  const search = typeof params.search === "string" ? params.search.toLowerCase() : "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;

  let items = mockMenuItems;
  if (categoryId) items = items.filter((item) => String(item.category_id) === categoryId);
  if (search) items = items.filter((item) => item.name?.toLowerCase().includes(search));

  const total = items.length;
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit);

  return mockResponse({
    items: {
      data: pageItems,
      total,
      current_page: page,
      last_page: Math.max(1, Math.ceil(total / limit)),
      per_page: limit,
    },
  }) as Promise<MenuItemsApiResponse>;
};

export const getMenuItemById = async (itemId: string | number): Promise<MenuItemsApiResponse> => {
  // PRODUCTION: return axiosInstance.get<MenuItemsApiResponse>(`/menu-items/${itemId}`);
  const item = findMockMenuItemById(itemId);
  return mockResponse({
    item,
    option_groups: [],
    customizations: item?.customizations ?? null,
  }) as Promise<MenuItemsApiResponse>;
};

export const getHighlights = async (_params?: Record<string, unknown>) => {
  // PRODUCTION: return axiosInstance.get("/menu-items/highlights", { params });
  const popular = mockMenuItems.filter((item) => item.is_featured);
  const latest = mockMenuItems.slice(0, 6);
  const chefSpecial = mockMenuItems.filter((item) => (item.rating ?? 0) >= 4.8);
  return mockResponse({ popular, latest, chef_special: chefSpecial });
};

const menuAPI = {
  getMenuCategories,
  getMenuItems,
  getMenuItemById,
  getHighlights,
};

export default menuAPI;
