// MODIFIED: Phase B — SSR/CSR Migration (supports server-provided initialData)
"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import api from "../api";
import useBranchStore from "../store/branchStore";
import { transformMenuItemsToProducts } from "../lib/utils/productTransform";
import { extractMenuItemsFromResponse, type MenuItemsPagination } from "../lib/utils/responseExtractor";
import useToastStore from "../store/toastStore";
import { ITEMS_PER_PAGE_GRID, ITEMS_PER_PAGE_LIST } from "../data/constants";
import { useApiCache } from "./useApiCache";
import { useLanguage } from "../context/LanguageContext";
import { useLocalizedRouter } from "./useLocalizedRouter";
import { debounce } from "../lib/utils/debounce";

export type ShopViewMode = "grid" | "list";

/** Manages shop product fetching, pagination, filtering, and search (URL-driven). */
export function useShopProducts(viewMode: ShopViewMode = "grid", initialData: unknown = null) {
  const searchParams = useSearchParams();
  const { push } = useLocalizedRouter();
  const { selectedBranch, initialize } = useBranchStore();
  const { error: toastError } = useToastStore();
  const { getCachedOrFetch } = useApiCache("PRODUCTS");
  const { lang } = useLanguage();

  // Process server-provided initial data once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const serverData = useMemo(() => {
    if (!initialData) return null;
    try {
      const { menuItems, totalCount, pagination: p } = extractMenuItemsFromResponse(initialData as any);
      if (Array.isArray(menuItems) && menuItems.length > 0) {
        return {
          products: transformMenuItemsToProducts(menuItems, lang),
          totalItems: totalCount,
          pagination: p,
        };
      }
    } catch {
      /* fall through to client fetch */
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only process on mount

  const skipInitialFetch = useRef(!!serverData);

  useEffect(() => {
    if (!selectedBranch) {
      initialize();
    }
  }, [selectedBranch, initialize]);

  const categoryId = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "menu_order";
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const itemsPerPage = viewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;

  const [products, setProducts] = useState<unknown[]>(serverData?.products || []);
  const [isLoading, setIsLoading] = useState(!serverData);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(serverData?.totalItems || 0);
  const [pagination, setPagination] = useState<MenuItemsPagination | null>(serverData?.pagination || null);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const debouncedSetSearchQuery = useMemo(
    () => debounce((value: string) => setDebouncedSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearchQuery(searchQuery);
  }, [searchQuery, debouncedSetSearchQuery]);

  const fetchProducts = useCallback(async () => {
    if (!selectedBranch) {
      setIsLoading(false);
      return;
    }

    if (!categoryId) {
      setIsLoading(false);
      setError("Please select a category");
      setProducts([]);
      setTotalItems(0);
      setPagination(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: itemsPerPage,
        category_id: categoryId,
      };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }
      if (sortBy && sortBy !== "menu_order") {
        params.sort_by = sortBy;
      }

      const response = await getCachedOrFetch("/menu-items", params, () => api.menu.getMenuItems(params));

      const { menuItems, totalCount, pagination: paginationInfo } = extractMenuItemsFromResponse(response);

      if (Array.isArray(menuItems) && menuItems.length > 0) {
        setProducts(transformMenuItemsToProducts(menuItems, lang));
        setTotalItems(totalCount);
        setPagination(paginationInfo);
        setError(null);
      } else if (totalCount > 0) {
        setError("No products found");
        setProducts([]);
        setTotalItems(totalCount);
        setPagination(paginationInfo);
      } else {
        const responseWithError = response as { message?: string; error?: string };
        setError(responseWithError?.message || responseWithError?.error || "No products found");
        setProducts([]);
        setTotalItems(0);
        setPagination(null);
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "An error occurred while loading products";
      setError(errorMessage);
      toastError(errorMessage);
      setProducts([]);
      setTotalItems(0);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch, currentPage, itemsPerPage, categoryId, debouncedSearchQuery, sortBy, toastError, getCachedOrFetch, lang]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      push(`/shop?${params.toString()}`, { scroll: true });
    },
    [searchParams, push]
  );

  return {
    products,
    isLoading,
    error,
    totalItems,
    pagination,
    currentPage,
    handlePageChange,
    refetch: fetchProducts,
  };
}
