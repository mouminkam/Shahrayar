"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { transformMenuItemsToProducts, type RawMenuItem, type Product } from "../lib/utils/productTransform";
import { ITEMS_PER_PAGE_GRID, ITEMS_PER_PAGE_LIST } from "../data/constants";
import { useLanguage } from "../context/LanguageContext";
import { useLocalizedRouter } from "./useLocalizedRouter";

export type ShopViewMode = "grid" | "list";

interface UseStaticShopProductsResult {
  products: Product[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

/**
 * Shop catalog filtering — entirely client-side, entirely synchronous.
 *
 * The full catalog is handed in as a prop from the (static) shop page, so
 * filtering, searching, sorting and paging are just array operations against
 * data that's already in memory. There is no fetch, no loading state, and no
 * server round-trip when the user changes a filter — the grid updates in the
 * same frame.
 *
 * URL search params remain the source of truth for the active
 * category/page/sort, so any view stays shareable and back/forward works.
 */
export function useStaticShopProducts(
  allItems: RawMenuItem[],
  viewMode: ShopViewMode = "grid"
): UseStaticShopProductsResult {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const { push } = useLocalizedRouter();

  const categoryId = searchParams.get("category");
  const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();
  const sortBy = searchParams.get("sort") || "menu_order";
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const itemsPerPage = viewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;

  const filtered = useMemo(() => {
    let items = allItems;

    if (categoryId) {
      items = items.filter((item) => String(item.category_id) === String(categoryId));
    }

    if (searchQuery) {
      items = items.filter((item) => {
        const haystack = [item.name, item.name_en, item.name_bg, item.name_ar]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchQuery);
      });
    }

    if (sortBy === "price_asc") {
      items = [...items].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
    } else if (sortBy === "price_desc") {
      items = [...items].sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
    } else if (sortBy === "rating") {
      items = [...items].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    }

    return items;
  }, [allItems, categoryId, searchQuery, sortBy]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const products = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return transformMenuItemsToProducts(filtered.slice(start, start + itemsPerPage), lang);
  }, [filtered, safePage, itemsPerPage, lang]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      push(`/shop?${params.toString()}`, { scroll: true });
    },
    [searchParams, push]
  );

  return { products, totalItems, currentPage: safePage, totalPages, handlePageChange };
}
