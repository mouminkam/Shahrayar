"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

function isExternal(path: string): boolean {
  return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(path);
}

/**
 * useRouter() wrapper that prefixes push/replace targets with the current
 * locale segment, mirroring what LocalizedLink does for <Link>.
 */
export function useLocalizedRouter() {
  const router = useRouter();
  const { lang } = useLanguage();

  const localize = useCallback(
    (path: string) => {
      if (isExternal(path) || path.startsWith(`/${lang}/`) || path === `/${lang}`) {
        return path;
      }
      return `/${lang}${path.startsWith("/") ? path : `/${path}`}`;
    },
    [lang]
  );

  const push = useCallback(
    (path: string, options?: Parameters<typeof router.push>[1]) => router.push(localize(path), options),
    [router, localize]
  );

  const replace = useCallback(
    (path: string, options?: Parameters<typeof router.replace>[1]) => router.replace(localize(path), options),
    [router, localize]
  );

  return { push, replace, localize, router };
}
