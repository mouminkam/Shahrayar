"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Protected from "../../../components/auth/Protected";
import PageSEO from "../../../components/seo/PageSEO";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

// Lazy load ProfileSection - Heavy component with API calls
const ProfileSection = dynamic(
  () => import("../../../components/pages/profile/ProfileSection"),
  {
    loading: () => <SectionSkeleton variant="default" cardCount={2} height="h-screen" />,
    ssr: false,
  }
);

export default function ProfilePage() {
  const { lang } = useLanguage();

  return (
    <Protected>
      <PageSEO
        title="My Profile - Account Settings"
        description="Manage your account settings, view order history, and update your information at Shahrayar Restaurant."
        url="/profile"
        keywords={["profile", "account", "orders", "settings"]}
      />
      <div className="bg-bg3 min-h-screen">
        <ErrorBoundary>
          <Suspense fallback={<SectionSkeleton variant="default" cardCount={2} height="h-screen" />}>
            <ProfileSection />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Protected>
  );
}
