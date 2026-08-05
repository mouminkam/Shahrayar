"use client";
import { useEffect, type ReactNode } from "react";
import useAuthStore from "../../store/authStore";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

interface GuestOnlyProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * GuestOnly Component
 * Guards routes that should only be accessible to guests (non-authenticated users)
 * Redirects to home/profile if user is already authenticated
 *
 * @param {React.ReactNode} children - Content to render if user is not authenticated
 * @param {string} redirectTo - Custom redirect path for authenticated users (default: '/profile')
 */
export default function GuestOnly({
  children,
  redirectTo = "/profile",
}: GuestOnlyProps) {
  const { push } = useLocalizedRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect authenticated users away from guest-only pages
    if (!isLoading && isAuthenticated) {
      push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, push]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgimg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme3"></div>
      </div>
    );
  }

  // If user is authenticated, don't render children (redirect will happen in useEffect)
  if (isAuthenticated) {
    return null;
  }

  // Render children only if user is not authenticated
  return <>{children}</>;
}
