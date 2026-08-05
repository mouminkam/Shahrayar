"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTopHandler Component
 *
 * Automatically scrolls to top when route changes.
 * Works with both Lenis smooth scroll and native window scroll.
 *
 * This component should be placed in the root layout to handle
 * all navigation scroll behavior centrally.
 */
export default function ScrollToTopHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to ensure page content is rendered
    // This is especially important for dynamic content that loads after navigation
    const scrollToTop = () => {
      // Try to find Lenis instance
      // LenisScrollProvider stores it in a ref, but we can access it via DOM
      // or check if it's available globally
      let lenisInstance: { scrollTo?: (pos: number, opts?: Record<string, unknown>) => void } | null = null;

      // Method 1: Check if Lenis is attached to window (if exposed)
      if (typeof window !== "undefined" && window.lenis) {
        lenisInstance = window.lenis;
      }

      // Method 2: Try to get Lenis from the document (if it stores a reference)
      // This is a fallback approach
      if (!lenisInstance && typeof document !== "undefined") {
        // Some implementations attach Lenis to document or body
        const body = document.body as HTMLElement & { _lenis?: { scrollTo?: (pos: number, opts?: Record<string, unknown>) => void } };
        if (body && body._lenis) {
          lenisInstance = body._lenis;
        }
      }

      // Use Lenis if available for smooth scroll
      if (lenisInstance && typeof lenisInstance.scrollTo === "function") {
        try {
          lenisInstance.scrollTo(0, { immediate: false });
        } catch (error) {
          // Fallback to native scroll if Lenis fails
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      } else {
        // Fallback to native scroll
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    // Small timeout to handle cases where content loads asynchronously
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToTop);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
