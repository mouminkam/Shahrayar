"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import useAuthStore from "../../store/authStore";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

interface ProtectedProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Protected Component
 * Guards routes that require authentication
 * Redirects to login if user is not authenticated
 *
 * @param {React.ReactNode} children - Content to render if authenticated
 * @param {boolean} requireAuth - Whether authentication is required (default: true)
 * @param {string} redirectTo - Custom redirect path (default: '/login')
 */
export default function Protected({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: ProtectedProps) {
  const { push } = useLocalizedRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Only redirect if not loading and auth is required
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Preserve the current path as returnUrl
      const returnUrl = pathname !== redirectTo
        ? `?returnUrl=${encodeURIComponent(pathname)}`
        : "";
      push(`${redirectTo}${returnUrl}`);
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname, redirectTo, push]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgimg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme3"></div>
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  // (redirect will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Render children if authenticated or if auth is not required
  return <>{children}</>;
}
