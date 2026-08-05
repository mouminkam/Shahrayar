"use client";
import { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useApiCache } from "./useApiCache";
import { useLanguage } from "../context/LanguageContext";

export type LegalContentType = "terms-conditions" | "privacy-policy";

/** Fetches and caches legal content (Terms & Conditions or Privacy Policy). */
export function useLegalContent(type: LegalContentType = "terms-conditions", enabled = false) {
  const { lang } = useLanguage();
  const { getCachedOrFetch } = useApiCache("LEGAL_CONTENT");
  const [content, setContent] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchFn = type === "terms-conditions" ? () => api.legal.getTermsConditions(lang) : () => api.legal.getPrivacyPolicy(lang);

      const response = await getCachedOrFetch(`/legal/${type}`, { locale: lang }, fetchFn);

      if (response?.success && response?.data) {
        setContent(response.data);
      } else {
        setError("Failed to load content");
        setContent(null);
      }
    } catch (err) {
      const error = err as { message?: string; data?: { message?: string } };
      setError(error?.message || error?.data?.message || "Failed to load content. Please try again.");
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [type, lang, getCachedOrFetch]);

  useEffect(() => {
    if (enabled) {
      fetchContent();
    } else {
      setIsLoading(false);
    }
  }, [enabled, fetchContent]);

  return { content, isLoading, error, refetch: fetchContent };
}
