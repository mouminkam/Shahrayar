import type { RawCategory, RawMenuItem } from './productTransform';

export interface MenuItemsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ExtractedMenuItems {
  menuItems: RawMenuItem[];
  totalCount: number;
  pagination: MenuItemsPagination;
}

/**
 * Loosely-typed shape of the raw API envelope this extractor accepts.
 * The real payload shape varies (paginated list, single item, bare array),
 * so fields are optional/unknown and narrowed defensively below.
 */
export interface MenuItemsApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: {
    items?: {
      data?: RawMenuItem[];
      total?: number;
      current_page?: number;
      last_page?: number;
      per_page?: number;
    } | RawMenuItem[];
    id?: number;
    menu_item_id?: number;
    [key: string]: unknown;
  } | RawMenuItem[];
  [key: string]: unknown;
}

/**
 * Extracts menu items and total count from API response
 * Based on actual API structure: { success: true, data: { items: { data: [], total: number } } }
 * @param response - API response
 */
export function extractMenuItemsFromResponse(
  response: MenuItemsApiResponse | RawMenuItem[] | null | undefined
): ExtractedMenuItems {
  // Standard API response structure
  if (
    response &&
    !Array.isArray(response) &&
    response.success &&
    response.data &&
    !Array.isArray(response.data) &&
    response.data.items &&
    !Array.isArray(response.data.items) &&
    response.data.items.data
  ) {
    const itemsContainer = response.data.items;
    const menuItems = Array.isArray(itemsContainer.data) ? itemsContainer.data : [];
    const totalCount = itemsContainer.total || menuItems.length;
    const currentPage = itemsContainer.current_page || 1;
    const lastPage = itemsContainer.last_page || 1;
    const perPage = itemsContainer.per_page || menuItems.length;

    return {
      menuItems,
      totalCount,
      pagination: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total: totalCount,
      },
    };
  }

  // Fallback: direct data array (for single item responses)
  if (response && !Array.isArray(response) && response.success && response.data) {
    if (Array.isArray(response.data)) {
      return {
        menuItems: response.data,
        totalCount: response.data.length,
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: response.data.length,
          total: response.data.length,
        },
      };
    }
    // Single item response
    if (response.data.id || response.data.menu_item_id) {
      return {
        menuItems: [response.data as unknown as RawMenuItem],
        totalCount: 1,
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 1,
          total: 1,
        },
      };
    }
  }

  // Fallback: response is array directly
  if (Array.isArray(response)) {
    return {
      menuItems: response,
      totalCount: response.length,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: response.length,
        total: response.length,
      },
    };
  }

  // Default: empty
  return {
    menuItems: [],
    totalCount: 0,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 0,
      total: 0,
    },
  };
}

export interface CategoriesApiResponse {
  success?: boolean;
  data?:
    | {
        categories?: RawCategory[];
        data?: RawCategory[];
        [key: string]: unknown;
      }
    | RawCategory[];
  categories?: RawCategory[];
  [key: string]: unknown;
}

/**
 * Extracts categories from API response
 * Supports new structure: { success: true, data: { categories: [...] } }
 * @param response - API response
 */
export function extractCategoriesFromResponse(
  response: CategoriesApiResponse | RawCategory[] | null | undefined
): RawCategory[] {
  if (!response) return [];

  // New structure: response.data.categories
  if (!Array.isArray(response) && response.success && response.data && !Array.isArray(response.data) && response.data.categories) {
    return Array.isArray(response.data.categories) ? response.data.categories : [];
  }

  // Fallback: direct data array
  if (!Array.isArray(response) && response.success && response.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.categories || response.data.data || [];
  }

  // Fallback: response is array directly
  if (Array.isArray(response)) {
    return response;
  }

  // Fallback: other structures
  if (!Array.isArray(response)) {
    const data = response.data;
    if (data && !Array.isArray(data)) {
      return data.categories || (data as { data?: RawCategory[] }).data || [];
    }
    if (Array.isArray(data)) {
      return data;
    }
    return response.categories || [];
  }

  return [];
}
