// MODIFIED: Phase B — SSR/CSR Migration (extracted from page.jsx to enable Server Component page)
"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import SectionSkeleton from "../../ui/SectionSkeleton";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

const ResetPasswordSection = dynamic(
  () => import("./ResetPasswordSection"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
    ssr: false,
  }
);

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const { replace } = useLocalizedRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      replace("/forgot-password");
    }
  }, [token, email, replace]);

  if (!token || !email) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-theme3 mx-auto mb-4"></div>
        <p className="text-text text-lg">Redirecting...</p>
      </div>
    );
  }

  return <ResetPasswordSection token={token} email={email} />;
}
