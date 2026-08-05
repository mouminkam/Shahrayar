"use client";
import { useState, useEffect } from "react";
import api from "../api";
import useBranchStore from "../store/branchStore";
import { transformCategories, transformMenuItemsToProducts, type Category, type Product } from "../lib/utils/productTransform";
import { extractMenuItemsFromResponse, extractCategoriesFromResponse } from "../lib/utils/responseExtractor";
import { useApiCache } from "./useApiCache";
import { useLanguage } from "../context/LanguageContext";

/** Shop sidebar data: menu categories + a small set of recent/featured products. */
export function useShopSidebar() {
  const { selectedBranch } = useBranchStore();
  const { getCachedOrFetch } = useApiCache("CATEGORIES");
  const { getCachedOrFetch: getCachedProducts } = useApiCache("PRODUCTS");
  const { lang } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedBranch) {
        setIsLoadingCategories(false);
        return;
      }

      setIsLoadingCategories(true);
      try {
        const response = await getCachedOrFetch(
          "/menu-categories",
          {},
          () => api.menu.getMenuCategories(),
          10 * 60 * 1000
        );
        const categoriesData = extractCategoriesFromResponse(response);
        setCategories(transformCategories(categoriesData, lang));
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [selectedBranch, getCachedOrFetch, lang]);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      if (!selectedBranch) return;

      setIsLoadingRecent(true);
      try {
        const params = { featured: true, limit: 4 };
        const response = await getCachedProducts("/menu-items", params, () => api.menu.getMenuItems(params));
        const { menuItems } = extractMenuItemsFromResponse(response);
        setRecentProducts(
          Array.isArray(menuItems) && menuItems.length > 0 ? transformMenuItemsToProducts(menuItems, lang) : []
        );
      } catch (error) {
        console.error("Error fetching recent products:", error);
        setRecentProducts([]);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    fetchRecentProducts();
  }, [selectedBranch, getCachedProducts, lang]);

  return { categories, recentProducts, isLoadingCategories, isLoadingRecent };
}
