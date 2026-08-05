// MODIFIED: Phase B — SSR/CSR Migration (extracted from page.jsx to enable Server Component page)
"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/ui/LocalizedLink";
import api from "../../../api";
import useToastStore from "../../../store/toastStore";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

export default function VerifyResetTokenContent() {
  const searchParams = useSearchParams();
  const { replace } = useLocalizedRouter();
  const { error: toastError } = useToastStore();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) return;

    const verifyToken = async () => {
      if (!token) {
        setError("Invalid reset link. Please request a new one.");
        setIsVerifying(false);
        setTimeout(() => {
          replace("/forgot-password");
        }, 2000);
        return;
      }

      try {
        setIsVerifying(true);
        setError(null);
        hasVerifiedRef.current = true;

        const response = await api.auth.verifyResetToken(token);

        if (response.success && response.data) {
          const { token: verifiedToken, email, valid } = response.data as {
            token?: string;
            email?: string;
            valid?: boolean;
          };

          if (valid && verifiedToken && email) {
            const params = new URLSearchParams({
              token: verifiedToken,
              email: email,
            });
            replace(`/reset-password?${params.toString()}`);
          } else {
            setError(
              "This reset link is invalid or has expired. Please request a new one."
            );
            setIsVerifying(false);
            hasVerifiedRef.current = false;
          }
        } else {
          setError(
            response.message ||
              "Failed to verify reset token. Please request a new one."
          );
          setIsVerifying(false);
          hasVerifiedRef.current = false;
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while verifying the reset token. Please try again.";
        setError(errorMessage);
        setIsVerifying(false);
        toastError(errorMessage);
        hasVerifiedRef.current = false;
      }
    };

    verifyToken();

    return () => {};
  }, [token, replace]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isVerifying) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-theme3 mx-auto mb-4"></div>
        <p className="text-text text-lg">Verifying reset token...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-8 lg:p-10 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-red-400 text-2xl font-bold mb-2">
            Verification Failed
          </h2>
          <p className="text-text text-base mb-6">{error}</p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-block bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return null;
}
