"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { transformMenuItemsToProducts } from "../lib/utils/productTransform";
import { popularItems, latestItems, chefSpecialItems } from "../content/menu";
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
  const { lang } = useLanguage();

  // Content is static and localized by the transforms below. Switching language
  // navigates to a different locale route, which re-renders this with the new
  // lang — so there's nothing to fetch, and no loading or error state exists.
  // The value shape is kept intact so consumers don't have to change.
  const value: HighlightsContextValue = useMemo(
    () => ({
      popular: transformMenuItemsToProducts(popularItems, lang),
      latest: transformMenuItemsToProducts(latestItems, lang),
      chefSpecial: transformMenuItemsToProducts(chefSpecialItems, lang),
      isLoading: false,
      error: null,
    }),
    [lang]
  );

  return <HighlightsContext.Provider value={value}>{children}</HighlightsContext.Provider>;
}

export function useHighlights(): HighlightsContextValue {
  const context = useContext(HighlightsContext);
  if (!context) {
    throw new Error("useHighlights must be used within HighlightsProvider");
  }
  return context;
}
