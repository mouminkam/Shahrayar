"use client";
import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import LocalizedLink from "@/components/ui/LocalizedLink";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useOrderDetails } from "../../../hooks/useOrderDetails";
import { useOrderActions } from "../../../hooks/useOrderActions";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import AnimatedSection from "../../ui/AnimatedSection";
import OrderHeader from "./OrderHeader";
import OrderItems from "./OrderItems";
import OrderActions from "./OrderActions";
import OrderSummary from "./OrderSummary";
import CancelOrderModal from "./CancelOrderModal";

export interface DetailedOrderItem {
  id?: string | number;
  item_name?: string;
  item_price?: number | string;
  price?: number | string;
  quantity?: number;
  size?: { name?: string } | string;
  size_id?: number | null;
  image?: string;
  name?: string;
  menu_item?: {
    id?: string | number;
    name?: string;
    image_url?: string;
    image?: string;
    price?: number | string;
    option_groups?: unknown[];
    customizations?: unknown;
    [key: string]: unknown;
  };
  selected_ingredients?: unknown[] | unknown;
  selected_options?: { option_group_id?: number; option_item_ids?: number[] }[];
  selected_drinks?: unknown[] | unknown;
  selected_toppings?: unknown[] | unknown;
  selected_sauces?: unknown[] | unknown;
  selected_allergens?: unknown[] | unknown;
  [key: string]: unknown;
}

export interface DetailedOrder {
  id?: string | number;
  order_number?: string;
  created_at?: string;
  status?: string;
  order_type?: string;
  delivery_address?: string;
  payment_method?: string;
  payment_status?: string;
  payment_intent_id?: string | number;
  subtotal?: number | string;
  delivery_charge?: number | string;
  tax_amount?: number | string;
  promo_discount_amount?: number | string | null;
  discount_amount?: number | string;
  total_amount?: number | string;
  total?: number | string;
  order_items?: DetailedOrderItem[];
  items?: DetailedOrderItem[];
  [key: string]: unknown;
}

interface OrderDetailsContentProps {
  orderId: string;
}

/**
 * OrderDetailsContent component - Main component for order details page
 */
export default function OrderDetailsContent({ orderId }: OrderDetailsContentProps) {
  const { push } = useLocalizedRouter();
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();
  const { order: rawOrder, isLoading, error, refetch } = useOrderDetails(orderId);
  const order = rawOrder as DetailedOrder | null;
  const {
    canCancelOrder,
    handleCancelOrder,
    handleReorder,
    handleTrackOrder,
    isCancelling,
    isReorderLoading,
    showCancelModal,
    setShowCancelModal,
    cancelReason,
    setCancelReason,
  } = useOrderActions(order, orderId, refetch) as {
    canCancelOrder: () => boolean;
    handleCancelOrder: (reason: string) => void;
    handleReorder: () => void;
    handleTrackOrder: () => void;
    isCancelling: boolean;
    isReorderLoading: boolean;
    showCancelModal: boolean;
    setShowCancelModal: (value: boolean) => void;
    cancelReason: string;
    setCancelReason: (value: string) => void;
  };

  if (isLoading) {
    return (
      <section className="section-padding fix bg-bgimg py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme3"></div>
            <p className="text-text text-base">{t(lang, "loading_order_details")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Package className="w-16 h-16 text-text/30" />
            <p className="text-text text-lg">{error || t(lang, "order_not_found")}</p>
            <LocalizedLink
              href="/profile"
              onMouseEnter={() => prefetchRoute("/profile")}
              onClick={(e) => {
                e.preventDefault();
                push("/profile", { scroll: true });
              }}
              className="px-6 py-3 bg-theme3 text-white rounded-xl hover:bg-theme transition-colors"
            >
              {t(lang, "back_to_profile")}
            </LocalizedLink>
          </div>
        </div>
      </section>
    );
  }

  // Transform order items for display
  const orderItems = order.order_items || order.items || [];

  return (
    <section className="section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Back Button */}
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <LocalizedLink
              href="/profile"
              onMouseEnter={() => prefetchRoute("/profile")}
              onClick={(e) => {
                e.preventDefault();
                push("/profile", { scroll: true });
              }}
              className="inline-flex items-center gap-2 text-text hover:text-theme3 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t(lang, "back_to_profile")}</span>
            </LocalizedLink>
          </motion.div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <AnimatedSection>
              <OrderHeader order={order} />
            </AnimatedSection>

            {/* Order Items */}
            {orderItems.length > 0 && (
              <AnimatedSection>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8"
                >
                  <OrderItems orderItems={orderItems} order={order} />

                  {/* Action Buttons */}
                  <OrderActions
                    order={order}
                    canCancelOrder={canCancelOrder}
                    onReorder={handleReorder}
                    onCancel={() => setShowCancelModal(true)}
                    onTrack={handleTrackOrder}
                    isReorderLoading={isReorderLoading}
                  />
                </motion.div>
              </AnimatedSection>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <AnimatedSection>
              <OrderSummary order={order} />
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
        }}
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />
    </section>
  );
}
