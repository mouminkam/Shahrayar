"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../api";
import useBranchStore from "../store/branchStore";
import { useApiCache } from "./useApiCache";

export interface UseUpsellItemsParams {
  type?: string;
  [key: string]: unknown;
}

/** Fetches upsell items for the selected branch, with caching. */
export function useUpsellItems(params: UseUpsellItemsParams = {}) {
  const { selectedBranch } = useBranchStore();
  const { getCachedOrFetch } = useApiCache("UPSELL_ITEMS");
  const [items, setItems] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef(params);
  const paramsString = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    paramsRef.current = params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]);

  const fetchUpsellItems = useCallback(async () => {
    const branchId = selectedBranch?.id;
    if (!branchId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getCachedOrFetch(
        `/branches/${branchId}/upsell-items`,
        paramsRef.current,
        () => api.branches.getUpsellItems(branchId, paramsRef.current)
      );

      const data = response?.data as { items?: unknown[] } | undefined;
      setItems(response?.success && data?.items ? data.items : []);
    } catch (err) {
      const error = err as { message?: string; data?: { message?: string } };
      const errorMessage = error?.message || error?.data?.message || "Failed to load upsell items";
      setError(errorMessage);
      console.error("Upsell items error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch?.id, paramsString, getCachedOrFetch]);

  useEffect(() => {
    fetchUpsellItems();
  }, [fetchUpsellItems]);

  return { items, isLoading, error, refetch: fetchUpsellItems };
}
