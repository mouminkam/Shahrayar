"use client";
import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { transformMenuItemToProduct } from "../lib/utils/productTransform";
import useToastStore from "../store/toastStore";
import useBranchStore from "../store/branchStore";
import { useApiCache } from "./useApiCache";
import { useLanguage } from "../context/LanguageContext";

interface ProductDetailResponse {
  data?: {
    item?: unknown;
    option_groups?: unknown[];
    customizations?: unknown;
  };
}

// API always returns { success: true, data: { item: {...}, option_groups: [...], customizations: {...} } }
const extractProductData = (response: ProductDetailResponse | undefined) => {
  return {
    item: response?.data?.item || response?.data || null,
    option_groups: response?.data?.option_groups || [],
    customizations: response?.data?.customizations || null,
  };
};

/** Fetches and transforms a single product's details for the shop/[id] page. */
export function useProductDetails(productId: string | number | undefined) {
  const { error: toastError } = useToastStore();
  const { selectedBranch } = useBranchStore();
  const { getCachedOrFetch } = useApiCache("PRODUCT_DETAIL");
  const { lang } = useLanguage();
  const [product, setProduct] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError("Product ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getCachedOrFetch(`/menu-items/${productId}`, {}, () => api.menu.getMenuItemById(productId));
      const { item: productData, option_groups, customizations } = extractProductData(response as ProductDetailResponse);

      if (productData) {
        setProduct(transformMenuItemToProduct(productData as any, option_groups as any, lang, customizations as any));
      } else {
        const errorMsg = "Product not found";
        setError(errorMsg);
        toastError(errorMsg);
      }
    } catch (err) {
      const error = err as { message?: string; data?: { message?: string } };
      const errorMessage = error?.message || error?.data?.message || "Failed to load product";
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [productId, toastError, getCachedOrFetch, lang]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct, selectedBranch?.id]);

  return { product, isLoading, error, refetch: fetchProduct };
}
