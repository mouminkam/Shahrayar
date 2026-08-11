"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../api";
import useBranchStore from "../store/branchStore";
import {
  generateCacheKey,
  getCachedData,
  setCachedData,
  getPendingRequest,
  setPendingRequest,
  CACHE_DURATION,
} from "../lib/utils/apiCache";
import { proxyObjectImages } from "../lib/utils/imageProxy";
import { useLanguage } from "../context/LanguageContext";

/**
 * Website banner slides.
 *
 * PRODUCTION: this hook used the raw Fetch API (rather than the shared axios
 * instance) so it could pass `priority: "high"` on the banner request — the
 * banner is the LCP element, so it was worth bypassing the client for the
 * fetch-priority hint. Auth token and `Accept-Language` were attached by hand
 * for the same reason.
 *
 * Here there is no backend to prioritise: `api.slides.getWebsiteSlides` resolves
 * from `src/mocks/fixtures/slides.ts` on the next microtask. The in-memory cache
 * and request de-duplication below are kept intact — they are real logic that
 * behaves identically against a real API.
 */

const SLIDE_IMAGE_KEYS = ["desktop_image", "mobile_image", "image"];

interface SlidesResponse {
  success?: boolean;
  data?: { slides?: Record<string, unknown>[] };
}

/** Pulls the slides array out of a response envelope, resolving image paths. */
function extractSlides(response: SlidesResponse | null): unknown[] {
  if (!response?.success || !response?.data?.slides) {
    return [];
  }
  return response.data.slides.map((slide) => proxyObjectImages(slide, SLIDE_IMAGE_KEYS));
}

/**
 * Warms the slides cache before the component that needs them renders.
 * Safe to call from a layout/page; resolves to the cached envelope.
 */
export async function prefetchWebsiteSlides(
  branchId: string | number | null | undefined,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  if (!branchId || typeof window === "undefined") {
    return null;
  }

  try {
    const cacheKey = generateCacheKey("/website-slides", params, branchId, "en");
    const ttl = CACHE_DURATION.WEBSITE_SLIDES || CACHE_DURATION.PRODUCTS;

    const cached = getCachedData(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pending = getPendingRequest(cacheKey);
    if (pending) {
      return pending;
    }

    const request = api.slides
      .getWebsiteSlides(params)
      .then((response) => {
        setCachedData(cacheKey, response, ttl);
        return response;
      })
      .catch((error) => {
        console.warn("Prefetch website slides failed:", error);
        return null;
      });

    setPendingRequest(cacheKey, request);
    return request;
  } catch (error) {
    console.warn("Prefetch website slides error:", error);
    return null;
  }
}

export interface UseWebsiteSlidesParams {
  [key: string]: unknown;
}

/** Loads website banner slides for the selected branch, with caching and de-duplication. */
export function useWebsiteSlides(params: UseWebsiteSlidesParams = {}) {
  const { selectedBranch } = useBranchStore();
  const { lang } = useLanguage();
  const [slides, setSlides] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsRef = useRef(params);
  const paramsString = useMemo(() => JSON.stringify(params), [params]);

  useEffect(() => {
    paramsRef.current = params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsString]);

  const fetchWebsiteSlides = useCallback(async () => {
    const branchId = selectedBranch?.id || selectedBranch?.branch_id;
    if (!branchId) {
      setSlides([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = generateCacheKey("/website-slides", paramsRef.current, branchId, lang);

      const cached = getCachedData(cacheKey) as SlidesResponse | null;
      if (cached !== null) {
        setSlides(extractSlides(cached));
        setIsLoading(false);
        return;
      }

      const pending = getPendingRequest(cacheKey);
      if (pending) {
        setSlides(extractSlides((await pending) as SlidesResponse));
        setIsLoading(false);
        return;
      }

      const ttl = CACHE_DURATION.WEBSITE_SLIDES || CACHE_DURATION.PRODUCTS;
      const request = api.slides.getWebsiteSlides(paramsRef.current).then((response) => {
        setCachedData(cacheKey, response, ttl);
        return response;
      });

      setPendingRequest(cacheKey, request);
      setSlides(extractSlides((await request) as SlidesResponse));
    } catch (err) {
      const error = err as { message?: string; data?: { message?: string } };
      const errorMessage = error?.message || error?.data?.message || "Failed to load website slides";
      setError(errorMessage);
      console.error("Website slides error:", errorMessage);
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch?.id, selectedBranch?.branch_id, paramsString, lang]);

  useEffect(() => {
    fetchWebsiteSlides();
  }, [fetchWebsiteSlides]);

  return { slides, isLoading, error, refetch: fetchWebsiteSlides };
}
