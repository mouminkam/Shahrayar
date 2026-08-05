"use client";
import { use, Suspense } from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../../components/ui/SectionSkeleton";
import Breadcrumb from "../../../../components/ui/Breadcrumb";
import AnimatedSection from "../../../../components/ui/AnimatedSection";
import { useLanguage } from "../../../../context/LanguageContext";
import { t } from "../../../../locales/i18n/getTranslation";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

// Lazy load heavy components
const OrderDetailsContent = dynamic(
  () => import("../../../../components/pages/orders/OrderDetailsContent"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
    ssr: false,
  }
);

interface OrderDetailsPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { push } = useLocalizedRouter();
  const { lang } = useLanguage();
  const resolvedParams = use(params);
  const orderId = resolvedParams?.id ? String(resolvedParams.id) : null;

  if (!orderId) {
    return (
      <div className="bg-bg3 min-h-screen">
        <Breadcrumb title={t(lang, "order_details")} />
        <section className="section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-text text-lg mb-4">{t(lang, "invalid_order_id") || "Invalid order ID"}</p>
              <button
                onClick={() => push("/orders")}
                className="px-6 py-2 bg-theme3 text-white rounded-lg hover:bg-theme transition-colors"
              >
                {t(lang, "back_to_orders") || "Back to Orders"}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-bg3 min-h-screen">

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" height="h-96" />}>
          <AnimatedSection>
            <OrderDetailsContent orderId={orderId} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
