"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { i18n, type Locale } from "../locales/i18n/config";
import { setCookie } from "../lib/utils/cookies";

interface LanguageContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const LANGUAGE_COOKIE_NAME = "language";

function resolveLocale(locale?: string | null): Locale {
  if (locale && (i18n.locales as readonly string[]).includes(locale)) {
    return locale as Locale;
  }
  return i18n.defaultLocale;
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // The URL's /[lang]/ segment is the single source of truth once mounted;
  // initialLocale (from the server layout's params) covers the first paint.
  const pathLocale = pathname?.split("/")[1];
  const lang = resolveLocale(pathLocale || initialLocale);

  const setLang = useCallback(
    (newLang: Locale) => {
      if (!(i18n.locales as readonly string[]).includes(newLang)) return;
      setCookie(LANGUAGE_COOKIE_NAME, newLang);

      const segments = (pathname || "/").split("/");
      if (segments.length > 1) {
        segments[1] = newLang;
      }
      const newPath = segments.join("/") || `/${newLang}`;
      router.push(newPath);
    },
    [pathname, router]
  );

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);

  if (!context) {
    return {
      lang: i18n.defaultLocale,
      setLang: () => {
        console.warn("setLang called but LanguageProvider is not available");
      },
    };
  }

  return context;
};
