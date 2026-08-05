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

// Lazy load CheckoutSection - Heavy component with API calls
const CheckoutSection = dynamic(
  () => import("../../../components/pages/checkout/CheckoutSection"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-screen" />,
    ssr: false,
  }
);

export default function CheckoutPage() {
  const { lang } = useLanguage();

  return (
    <Protected>
      <PageSEO
        title="Checkout - Complete Your Order"
        description="Complete your order at Shahrayar Restaurant. Secure checkout with multiple payment options."
        url="/checkout"
        keywords={["checkout", "order", "payment", "delivery", "pickup"]}
      />
      <div className="bg-bg3 min-h-screen">
        <AnimatedSection>
          <Breadcrumb title={t(lang, "checkout")} />
        </AnimatedSection>
        <ErrorBoundary>
          <Suspense fallback={<SectionSkeleton variant="default" height="h-screen" />}>
            <CheckoutSection />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Protected>
  );
}
