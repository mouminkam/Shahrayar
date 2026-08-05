"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

// Lazy load cart components
const CartTable = dynamic(
  () => import("../../../components/cart/CartTable"),
  {
    loading: () => <SectionSkeleton variant="default" cardCount={5} height="h-96" />,
    ssr: false,
  }
);

const CartSummary = dynamic(
  () => import("../../../components/cart/CartSummary"),
  {
    loading: () => <SectionSkeleton variant="default" showCards={false} height="h-64" />,
    ssr: false,
  }
);

export default function CartPage() {
  const { lang } = useLanguage();

  return (
    <div className="bg-bg3 min-h-screen">
      <AnimatedSection>
        <Breadcrumb title={t(lang, "cart")} />
      </AnimatedSection>
      <section className="shop-details-section section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Table - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <ErrorBoundary>
                <Suspense fallback={<SectionSkeleton variant="default" cardCount={5} height="h-96" />}>
                  <AnimatedSection>
                    <div className="shop-details bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 py-6 px-3 sm:px-6 relative">
                      <CartTable />
                    </div>
                  </AnimatedSection>
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Cart Summary - Takes 1 column on desktop */}
            <div className="lg:col-span-1">
              <ErrorBoundary>
                <Suspense fallback={<SectionSkeleton variant="default" showCards={false} height="h-64" />}>
                  <AnimatedSection>
                    <CartSummary />
                  </AnimatedSection>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
