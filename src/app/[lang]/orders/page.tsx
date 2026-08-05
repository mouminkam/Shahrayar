"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Protected from "../../../components/auth/Protected";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

// Lazy load OrdersSection - Heavy component with API calls
const OrdersSection = dynamic(
  () => import("../../../components/pages/orders/OrdersSection"),
  {
    loading: () => <SectionSkeleton variant="default" cardCount={5} height="h-screen" />,
    ssr: false,
  }
);

export default function AllOrdersPage() {
  const { lang } = useLanguage();

  return (
    <Protected>
      <div className="bg-bg3 min-h-screen">
        <ErrorBoundary>
          <Suspense fallback={<SectionSkeleton variant="default" cardCount={5} height="h-screen" />}>
            <OrdersSection />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Protected>
  );
}
