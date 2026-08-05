"use client";
import { useCallback, useEffect, useRef } from "react";
import {
  generateCacheKey,
  getCachedData,
  setCachedData,
  clearBranchCache,
  getPendingRequest,
  setPendingRequest,
  CACHE_DURATION,
} from "../lib/utils/apiCache";
import useBranchStore from "../store/branchStore";
import { useLanguage } from "../context/LanguageContext";

export type CacheType = keyof typeof CACHE_DURATION | string;

/** API caching with automatic invalidation when the selected branch changes. */
export function useApiCache(cacheType: CacheType = "PRODUCTS") {
  const { selectedBranch } = useBranchStore();
  const { lang } = useLanguage();
  const branchId = selectedBranch?.id || selectedBranch?.branch_id || null;
  const previousBranchIdRef = useRef(branchId);

  const getTTL = useCallback((): number => {
    return (CACHE_DURATION as Record<string, number>)[cacheType] || CACHE_DURATION.PRODUCTS;
  }, [cacheType]);

  useEffect(() => {
    if (branchId && previousBranchIdRef.current && previousBranchIdRef.current !== branchId) {
      clearBranchCache(previousBranchIdRef.current as string | number);
    }
    previousBranchIdRef.current = branchId;
  }, [branchId]);

  const getCachedOrFetch = useCallback(
    async <T = unknown>(
      url: string,
      params: Record<string, unknown> = {},
      fetchFn: () => Promise<T>,
      customTTL: number | null = null
    ): Promise<T> => {
      const cacheKey = generateCacheKey(url, params, branchId, lang);
      const ttl = customTTL || getTTL();

      const cached = getCachedData(cacheKey);
      if (cached !== null) {
        return cached as T;
      }

      const pending = getPendingRequest(cacheKey);
      if (pending) {
        return pending as Promise<T>;
      }

      const fetchPromise = fetchFn()
        .then((data) => {
          setCachedData(cacheKey, data, ttl);
          return data;
        })
        .catch((error) => {
          throw error;
        });

      setPendingRequest(cacheKey, fetchPromise);
      return fetchPromise;
    },
    [branchId, lang, getTTL]
  );

  const invalidateCache = useCallback(
    (url: string, params: Record<string, unknown> = {}) => {
      const cacheKey = generateCacheKey(url, params, branchId, lang);
      const cached = getCachedData(cacheKey);
      if (cached !== null) {
        setCachedData(cacheKey, null, 0);
      }
    },
    [branchId, lang]
  );

  const clearCurrentBranchCache = useCallback(() => {
    if (branchId) {
      clearBranchCache(branchId as string | number);
    }
  }, [branchId]);

  return {
    getCachedOrFetch,
    invalidateCache,
    clearCurrentBranchCache,
    branchId,
  };
}
