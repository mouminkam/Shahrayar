"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface LenisInstance {
  raf: (time: number) => void;
  destroy: () => void;
  scrollTo?: (target: number | string, opts?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    lenis?: LenisInstance;
  }
}

interface LenisScrollProviderProps {
  children: ReactNode;
}

const LenisScrollProvider = ({ children }: LenisScrollProviderProps) => {
  const lenisRef = useRef<LenisInstance | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    let lenisInstance: LenisInstance | null = null;
    let rafId: number | null = null;
    let isMounted = true;

    // Dynamic import to ensure it only runs on client
    const initLenis = async () => {
      try {
        // Check if already initialized
        if (lenisRef.current) return;

        // Lazy load lenis only when needed
        const LenisModule = await import("lenis");
        const Lenis = LenisModule.default || LenisModule;

        if (!isMounted) return;

        // Initialize Lenis
        lenisInstance = new Lenis({
          lerp: 0.1,
          duration: 1.0,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        } as ConstructorParameters<typeof Lenis>[0]) as unknown as LenisInstance;

        lenisRef.current = lenisInstance;

        // Expose Lenis instance on window for ScrollToTopHandler to access
        if (typeof window !== "undefined") {
          window.lenis = lenisInstance;
        }

        // Animation frame function
        function raf(time: number) {
          if (lenisInstance && isMounted) {
            lenisInstance.raf(time);
            rafId = requestAnimationFrame(raf);
          }
        }

        rafId = requestAnimationFrame(raf);
        rafIdRef.current = rafId;

        // Log success in development
        if (process.env.NODE_ENV === "development") {
          console.log("Lenis initialized successfully");
        }
      } catch (error) {
        console.error("Failed to initialize Lenis:", error);
        // Don't break the app if Lenis fails to load
      }
    };

    // Initialize immediately on client
    initLenis();

    // Cleanup
    return () => {
      isMounted = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (lenisInstance) {
        try {
          lenisInstance.destroy();
        } catch (e) {
          console.error("Error destroying Lenis:", e);
        }
      }
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
};

export default LenisScrollProvider;
