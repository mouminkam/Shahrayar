"use client";
import { useEffect } from "react";

/**
 * Client-side component to inject Authorization header into all fetch requests
 * Reads token from localStorage and adds it to request headers
 */
export default function AuthTokenInjector() {
  useEffect(() => {
    // Get token from localStorage
    const getToken = (): string | null => {
      if (typeof window === "undefined") return null;

      try {
        // First, try to get token from localStorage (normal auth)
        const authStorage = localStorage.getItem("auth-storage");
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const token = parsed.state?.user?.token || parsed.state?.token || null;
          if (token) {
            return token;
          }
        }

        // If no token in localStorage, check sessionStorage for registration token
        const registrationToken = sessionStorage.getItem("registrationToken");
        if (registrationToken) {
          return registrationToken;
        }
      } catch (error) {
        console.error("Error reading token from storage:", error);
      }

      return null;
    };

    // Intercept fetch requests and add Authorization header
    const originalFetch = window.fetch;
    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const [url, options = {}] = args;

      // Only add token to same-origin requests or API requests
      const isApiRequest =
        typeof url === "string" &&
        (url.startsWith("/") ||
          url.includes(process.env.NEXT_PUBLIC_API_BASE_URL || "shahrayar.peaklink.pro"));

      if (isApiRequest) {
        const token = getToken();
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }

      return originalFetch.apply(this, [url, options]);
    };

    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null; // This component doesn't render anything
}
