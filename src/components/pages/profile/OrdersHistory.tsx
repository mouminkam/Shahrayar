"use client";
import { motion } from "framer-motion";
import { ShoppingBag, Package, ArrowRight } from "lucide-react";
import { useInView } from "react-intersection-observer";
import LocalizedLink from "@/components/ui/LocalizedLink";
import OrderCard, { type OrderCardOrder } from "./OrderCard";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface OrdersHistoryProps {
  orders: OrderCardOrder[];
  showViewAll?: boolean;
  maxDisplay?: number | null;
  totalOrders?: number | null;
}

export default function OrdersHistory({ orders, showViewAll = true, maxDisplay = null, totalOrders = null }: OrdersHistoryProps) {
  const { lang } = useLanguage();
  // Ensure orders is always an array
  const ordersList = Array.isArray(orders) ? orders : [];
  const DISPLAY_LIMIT = 5;

  // Use totalOrders if provided (from pagination), otherwise use ordersList.length
  const totalOrdersCount = totalOrders !== null ? totalOrders : ordersList.length;

  // If maxDisplay is provided, use it; otherwise use default logic
  let displayedOrders: OrderCardOrder[];
  let hasMoreOrders: boolean;

  if (maxDisplay !== null) {
    // Use maxDisplay limit (for /orders page)
    displayedOrders = ordersList.slice(0, maxDisplay);
    hasMoreOrders = ordersList.length > maxDisplay;
  } else if (showViewAll) {
    // Use default limit for profile page
    displayedOrders = ordersList.slice(0, DISPLAY_LIMIT);
    hasMoreOrders = ordersList.length > DISPLAY_LIMIT;
  } else {
    // Show all orders (fallback)
    displayedOrders = ordersList;
    hasMoreOrders = false;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shadow-2xl rounded-xl bg-theme flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white fill-white" />
          </div>
          <h3 className="text-white  text-2xl font-black uppercase">
            {t(lang, "order_history")}
          </h3>
        </div>
        {totalOrdersCount > 0 && (
          <span className="text-text text-sm font-medium">
            {totalOrdersCount} {totalOrdersCount === 1 ? t(lang, "order") : t(lang, "orders")}
          </span>
        )}
      </div>

      {ordersList.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-text/30 mx-auto mb-4" />
          <p className="text-text text-lg mb-2">{t(lang, "no_orders_yet")}</p>
          <p className="text-text/70 text-sm mb-6">
            {t(lang, "start_shopping_to_see_orders")}
          </p>
          <LocalizedLink
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white  text-sm font-semibold rounded-xl transition-all duration-300"
          >
            {t(lang, "start_shopping")}
          </LocalizedLink>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayedOrders.map((order) => (
              <LazyOrderCard key={order.id} order={order} />
            ))}
          </div>

          {hasMoreOrders && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <LocalizedLink
                href="/orders"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-theme3/50 rounded-xl text-white  text-sm font-semibold transition-all duration-300 group"
              >
                {t(lang, "view_all_orders")} ({totalOrdersCount})
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </LocalizedLink>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

// Lazy Order Card Component - Loads only when in viewport
function LazyOrderCard({ order }: { order: OrderCardOrder }) {
  const shouldLoadImmediately = false; // Don't load immediately, wait for viewport
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px", // Start loading 100px before it comes into view
    triggerOnce: true, // Only trigger once
  });

  const shouldLoad = shouldLoadImmediately || inView;

  if (!shouldLoad) {
    return (
      <div
        ref={ref}
        className="p-4 bg-white/5 rounded-xl border border-white/10 min-h-[200px] animate-pulse"
      >
        <div className="h-6 bg-white/10 rounded mb-4 w-1/3"></div>
        <div className="h-4 bg-white/10 rounded mb-2 w-1/2"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div ref={ref}>
      <OrderCard order={order} />
    </div>
  );
}
