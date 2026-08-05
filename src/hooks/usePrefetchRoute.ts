"use client";
import { useRouter } from "next/navigation";
import { useTransition, useCallback } from "react";

/** Route prefetching + transition-wrapped navigation for a smoother nav experience. */
export function usePrefetchRoute() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const prefetchRoute = useCallback(
    (href: string) => {
      if (typeof window !== "undefined" && href) {
        try {
          router.prefetch(href);
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to prefetch route:", href, error);
          }
        }
      }
    },
    [router]
  );

  const navigate = useCallback(
    (href: string, options: { prefetch?: boolean } = {}) => {
      if (!href) return;

      const { prefetch: shouldPrefetch = true } = options;

      if (shouldPrefetch) {
        prefetchRoute(href);
      }

      startTransition(() => {
        try {
          router.push(href, { scroll: true });
        } catch (error) {
          console.error("Navigation error:", error);
        }
      });
    },
    [router, prefetchRoute]
  );

  const prefetchRoutes = useCallback(
    (routes: string[]) => {
      if (Array.isArray(routes)) {
        routes.forEach((route) => {
          if (route) prefetchRoute(route);
        });
      }
    },
    [prefetchRoute]
  );

  return { prefetchRoute, navigate, prefetchRoutes, isPending };
}
