"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../api";
import useBranchStore from "../store/branchStore";
import { useApiCache } from "./useApiCache";
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

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.user?.token || parsed.state?.token || null;
    }
    return sessionStorage.getItem("registrationToken");
  } catch {
    return null;
  }
}

function getLanguageFromDocumentCookie(): string {
  if (typeof document === "undefined") return "bg";
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split("; language=");

    if (parts.length === 2) {
      const lang = parts.pop()?.split(";").shift();
      return lang === "en" ? "en" : "bg";
    }

    return "bg";
  } catch {
    return "bg";
  }
}

/**
 * Prefetch website slides using the Fetch API with a high priority hint.
 * Can be called early (e.g. in layout/page) before the component renders.
 */
export async function prefetchWebsiteSlides(
  branchId: string | number | null | undefined,
  params: Record<string, unknown> = {}
): Promise<unknown> {
  if (!branchId || typeof window === "undefined") {
    return null;
  }

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://shahrayar.peaklink.pro/api/v1";
    const url = `${API_BASE_URL}/website-slides`;

    const queryParams = new URLSearchParams({
      branch_id: String(branchId),
      ...(params as Record<string, string>),
    });

    const fullUrl = `${url}?${queryParams.toString()}`;
    const token = getStoredToken();
    const language = getLanguageFromDocumentCookie();
    const cacheKey = generateCacheKey("/website-slides", params, branchId, language);
    const ttl = CACHE_DURATION.WEBSITE_SLIDES || CACHE_DURATION.PRODUCTS;

    const cached = getCachedData(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const pending = getPendingRequest(cacheKey);
    if (pending) {
      return pending;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000);

    const fetchPromise = fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": language,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      priority: "high",
      signal: abortController.signal,
    } as RequestInit)
      .finally(() => clearTimeout(timeoutId))
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const transformedData =
          data && typeof data === "object" && "success" in data ? data : { success: true, data };

        setCachedData(cacheKey, transformedData, ttl);
        return transformedData;
      })
      .catch((error) => {
        console.warn("Prefetch website slides failed:", error);
        return null;
      });

    setPendingRequest(cacheKey, fetchPromise);
    return fetchPromise;
  } catch (error) {
    console.warn("Prefetch website slides error:", error);
    return null;
  }
}

export interface UseWebsiteSlidesParams {
  [key: string]: unknown;
}

/** Fetches website banner slides for the selected branch, with caching and a fetch-priority fast path. */
export function useWebsiteSlides(params: UseWebsiteSlidesParams = {}) {
  const { selectedBranch } = useBranchStore();
  const { getCachedOrFetch: _getCachedOrFetch } = useApiCache("WEBSITE_SLIDES");
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
      const cached = getCachedData(cacheKey) as { success?: boolean; data?: { slides?: Record<string, unknown>[] } } | null;

      if (cached !== null) {
        if (cached?.success && cached?.data?.slides) {
          setSlides(
            cached.data.slides.map((slide) => proxyObjectImages(slide, ["desktop_image", "mobile_image", "image"]))
          );
        } else {
          setSlides([]);
        }
        setIsLoading(false);
        return;
      }

      const pending = getPendingRequest(cacheKey);
      if (pending) {
        const response = (await pending) as { success?: boolean; data?: { slides?: Record<string, unknown>[] } };
        if (response?.success && response?.data?.slides) {
          setSlides(
            response.data.slides.map((slide) => proxyObjectImages(slide, ["desktop_image", "mobile_image", "image"]))
          );
        } else {
          setSlides([]);
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://shahrayar.peaklink.pro/api/v1";
      const url = `${API_BASE_URL}/website-slides`;

      const queryParams = new URLSearchParams({
        branch_id: String(branchId),
        ...(paramsRef.current as Record<string, string>),
      });

      const fullUrl = `${url}?${queryParams.toString()}`;
      const ttl = CACHE_DURATION.WEBSITE_SLIDES || CACHE_DURATION.PRODUCTS;

      const token = getStoredToken();
      const language = getLanguageFromDocumentCookie();

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30000);

      const fetchPromise = fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": language,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        priority: "high",
        signal: abortController.signal,
      } as RequestInit)
        .then(async (response) => {
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          const transformedData =
            data && typeof data === "object" && "success" in data ? data : { success: true, data };

          setCachedData(cacheKey, transformedData, ttl);
          return transformedData;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.warn("Fetch API failed, falling back to axios:", error);
          return api.slides.getWebsiteSlides(paramsRef.current);
        });

      setPendingRequest(cacheKey, fetchPromise);
      const response = (await fetchPromise) as { success?: boolean; data?: { slides?: Record<string, unknown>[] } };

      if (response?.success && response?.data?.slides) {
        setSlides(
          response.data.slides.map((slide) => proxyObjectImages(slide, ["desktop_image", "mobile_image", "image"]))
        );
      } else {
        setSlides([]);
      }
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
