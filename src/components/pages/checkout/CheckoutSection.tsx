"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../ui/AnimatedSection";
import ErrorBoundary from "../../ui/ErrorBoundary";
import SectionSkeleton from "../../ui/SectionSkeleton";
import useCartStore from "../../../store/cartStore";
import useAuthStore from "../../../store/authStore";
import { useUpsellItems } from "../../../hooks/useUpsellItems";
import { CheckoutPromoProvider } from "../../../context/CheckoutPromoContext";
import { useLocalizedRouter } from "../../../hooks/useLocalizedRouter";
import CheckoutPromoAnnouncementModal from "./CheckoutPromoAnnouncementModal";

// Lazy load checkout components
const CheckoutSummary = dynamic(
  () => import("./CheckoutSummary"),
  {
    loading: () => <SectionSkeleton variant="default" showCards={false} height="h-64" />,
    ssr: false,
  }
);

const BillingForm = dynamic(
  () => import("./BillingForm"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
    ssr: false,
  }
);

const UpsellSection = dynamic(
  () => import("./UpsellSection"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-64" />,
    ssr: false,
  }
);

export default function CheckoutSection() {
  const { push } = useLocalizedRouter();
  const items = useCartStore((state) => state.items);
  const { isAuthenticated } = useAuthStore();
  const { items: upsellItems, isLoading: upsellLoading } = useUpsellItems();
  const { orderType, quoteId, resetDeliveryCharge } = useCartStore();
  const [showUpsell, setShowUpsell] = useState(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (items.length === 0) {
      push("/cart");
    }
  }, [items, push]);

  // Reset delivery charge on mount if delivery type but no valid quote (only once)
  useEffect(() => {
    if (!hasInitializedRef.current && orderType === "delivery" && !quoteId) {
      // Reset delivery charge when opening checkout page (will be recalculated when user selects location)
      resetDeliveryCharge();
      hasInitializedRef.current = true;
    }
  }, [orderType, quoteId, resetDeliveryCharge]);

  // Calculate shouldShowUpsell based on loading state and items
  const shouldShowUpsell = useMemo(() => {
    if (!showUpsell) return false; // User manually skipped
    // Show during loading or if items exist
    return upsellLoading || upsellItems.length > 0;
  }, [showUpsell, upsellLoading, upsellItems.length]);

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  const handleUpsellSkip = () => {
    setShowUpsell(false);
  };

  return (
    <CheckoutPromoProvider>
      <CheckoutPromoAnnouncementModal />
      <section className="checkout-section section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          {/* Billing Form and Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Billing Form - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <ErrorBoundary>
                <AnimatedSection>
                  <BillingForm />
                </AnimatedSection>
              </ErrorBoundary>
            </div>

            {/* Right Sidebar - Takes 1 column on desktop */}
            <div className="lg:col-span-1 space-y-8">
              {/* Upsell Section - Show at top if items exist or loading */}
              {shouldShowUpsell && (
                <ErrorBoundary>
                  <AnimatedSection>
                    <UpsellSection
                      onSkip={handleUpsellSkip}
                    />
                  </AnimatedSection>
                </ErrorBoundary>
              )}

              {/* Checkout Summary - Always shown at bottom */}
              <ErrorBoundary>
                <AnimatedSection>
                  <CheckoutSummary />
                </AnimatedSection>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </section>
    </CheckoutPromoProvider>
  );
}
