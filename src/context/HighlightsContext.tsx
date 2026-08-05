"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "../api";
import useBranchStore from "../store/branchStore";
import { transformMenuItemsToProducts, type RawMenuItem } from "../lib/utils/productTransform";
import { useApiCache } from "../hooks/useApiCache";
import { useLanguage } from "./LanguageContext";

interface HighlightsContextValue {
  popular: unknown[];
  latest: unknown[];
  chefSpecial: unknown[];
  isLoading: boolean;
  error: string | null;
}

export const HighlightsContext = createContext<HighlightsContextValue | null>(null);

export function HighlightsProvider({ children }: { children: ReactNode }) {
  const { selectedBranch, getSelectedBranchId } = useBranchStore();
  const { getCachedOrFetch } = useApiCache("HIGHLIGHTS");
  const { lang } = useLanguage();
  const [popular, setPopular] = useState<unknown[]>([]);
  const [latest, setLatest] = useState<unknown[]>([]);
  const [chefSpecial, setChefSpecial] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      const branchId = getSelectedBranchId();
      if (!branchId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getCachedOrFetch("/menu-items/highlights", {}, () => api.menu.getHighlights());

        const data = response?.data as
          | { popular?: RawMenuItem[]; latest?: RawMenuItem[]; chef_special?: RawMenuItem[] }
          | undefined;

        if (!response?.success || !data) {
          setPopular([]);
          setLatest([]);
          setChefSpecial([]);
          return;
        }

        setPopular(transformMenuItemsToProducts(data.popular || [], lang));
        setLatest(transformMenuItemsToProducts(data.latest || [], lang));
        setChefSpecial(transformMenuItemsToProducts(data.chef_special || [], lang));
      } catch (err) {
        console.error("Error fetching highlights:", err);
        setError((err as Error).message || "Failed to fetch highlights");
        setPopular([]);
        setLatest([]);
        setChefSpecial([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, [selectedBranch, getSelectedBranchId, getCachedOrFetch, lang]);

  const value: HighlightsContextValue = { popular, latest, chefSpecial, isLoading, error };

  return <HighlightsContext.Provider value={value}>{children}</HighlightsContext.Provider>;
}

export function useHighlights(): HighlightsContextValue {
  const context = useContext(HighlightsContext);
  if (!context) {
    throw new Error("useHighlights must be used within HighlightsProvider");
  }
  return context;
}
