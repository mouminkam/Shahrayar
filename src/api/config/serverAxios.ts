/**
 * Mock server-side "axios" client — the single seam Server Components use to
 * fetch data (see src/app/[lang]/page.tsx, shop/[id]/page.tsx, etc, all of
 * which call `serverAxios.get(url, config)` exactly as they would against a
 * real backend).
 *
 * PRODUCTION: this file would just be `axios.create({ baseURL, headers })`
 * (see the commented implementation at the bottom). Because this build has no
 * live backend, `.get`/`.post` instead pattern-match the URL and resolve with
 * data from `src/mocks/fixtures/*`, wrapped in the same `{ data: ApiResponse }`
 * shape a real axios response would have — so every calling page needs zero
 * changes to switch back to a real API.
 */

import { mockResponse } from "../../mocks/mockClient";
import { mockCategories } from "../../mocks/fixtures/categories";
import { mockMenuItems, findMockMenuItemById } from "../../mocks/fixtures/menuItems";
import { mockBranches, getMockDefaultBranch } from "../../mocks/fixtures/branches";
import { mockChefs } from "../../mocks/fixtures/chefs";
import { mockWebsiteSlides } from "../../mocks/fixtures/slides";
import { mockUser } from "../../mocks/fixtures/users";
import type { ApiResponse } from "../types";

export interface ServerAxiosOptions {
  language?: string;
  token?: string | null;
}

interface RequestConfig {
  params?: Record<string, unknown>;
}

interface MockAxiosResponse<T = ApiResponse<Record<string, unknown>>> {
  data: T;
}

async function route(path: string, config?: RequestConfig): Promise<MockAxiosResponse<any>> {
  const params = config?.params ?? {};

  if (path === "/website-slides") {
    return { data: await mockResponse({ slides: mockWebsiteSlides }) };
  }

  if (path === "/menu-items/highlights") {
    const popular = mockMenuItems.filter((i) => i.is_featured);
    const latest = mockMenuItems.slice(0, 6);
    const chefSpecial = mockMenuItems.filter((i) => (i.rating ?? 0) >= 4.8);
    return { data: await mockResponse({ popular, latest, chef_special: chefSpecial }) };
  }

  if (path === "/chefs") {
    return { data: await mockResponse({ chefs: mockChefs }) };
  }

  if (path === "/menu-categories") {
    return { data: await mockResponse({ categories: mockCategories }) };
  }

  if (path === "/menu-items") {
    const categoryId = params.category_id != null ? String(params.category_id) : null;
    let items = mockMenuItems;
    if (categoryId) items = items.filter((i) => String(i.category_id) === categoryId);
    const limit = Number(params.limit) || items.length;
    return {
      data: await mockResponse({
        items: { data: items.slice(0, limit), total: items.length, current_page: 1, last_page: 1, per_page: limit },
      }),
    };
  }

  const menuItemMatch = path.match(/^\/menu-items\/(.+)$/);
  if (menuItemMatch) {
    const item = findMockMenuItemById(menuItemMatch[1]);
    return { data: await mockResponse({ item, option_groups: [], customizations: item?.customizations ?? null }) };
  }

  if (path === "/branches/default") {
    return { data: await mockResponse({ branch: getMockDefaultBranch() }) };
  }

  const branchMatch = path.match(/^\/branches\/(.+)$/);
  if (branchMatch) {
    const branch = mockBranches.find((b) => String(b.id) === branchMatch[1]);
    return { data: await mockResponse({ branch: branch ?? getMockDefaultBranch() }) };
  }

  if (path === "/branches") {
    return { data: await mockResponse({ branches: mockBranches }) };
  }

  if (path === "/auth/profile") {
    // No real session server-side in this demo build — treat every request as signed out
    // (matches how a real backend would respond to a request with no valid bearer token).
    return { data: { success: false, message: "Not authenticated" } };
  }

  console.warn(`[mock serverAxios] No mock route for "${path}" — returning empty success response.`);
  return { data: await mockResponse(null) };
}

export interface MockServerAxios {
  get: (url: string, config?: RequestConfig) => Promise<MockAxiosResponse<any>>;
  post: (url: string, body?: unknown, config?: RequestConfig) => Promise<MockAxiosResponse<any>>;
}

/**
 * Create the mock server-side client. Signature matches the real
 * `createServerAxios({ language, token })` so callers never need to change.
 */
export async function createServerAxios(_options?: ServerAxiosOptions): Promise<MockServerAxios> {
  return {
    get: (url, config) => route(url, config),
    post: (url, _body, config) => route(url, config),
  };
}

/* PRODUCTION implementation this file replaces:
 *
 * import axios, { type AxiosInstance } from "axios";
 * import { getLanguage } from "../../lib/getLanguage";
 * import { getAuthToken } from "../../lib/getAuthToken";
 *
 * export async function createServerAxios(options?: ServerAxiosOptions): Promise<AxiosInstance> {
 *   const language = options?.language ?? (await getLanguage());
 *   const token = options?.token ?? (await getAuthToken());
 *   return axios.create({
 *     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
 *     timeout: 30000,
 *     headers: {
 *       "Content-Type": "application/json",
 *       "Accept-Language": language,
 *       ...(token && { Authorization: `Bearer ${token}` }),
 *     },
 *   });
 * }
 */
