"use client";
import { RotateCcw, Navigation, X, Loader2 } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import useToastStore from "../../../store/toastStore";
import type { DetailedOrder } from "./OrderDetailsContent";

interface OrderActionsProps {
  order: DetailedOrder;
  canCancelOrder: () => boolean;
  onReorder: () => void;
  onCancel: () => void;
  onTrack: () => void;
  isReorderLoading: boolean;
}

/**
 * OrderActions component - Displays action buttons (Reorder, Cancel, Track)
 */
export default function OrderActions({
  order,
  canCancelOrder,
  onReorder,
  onCancel,
  onTrack,
  isReorderLoading
}: OrderActionsProps) {
  const { lang } = useLanguage();
  const { error: toastError } = useToastStore();

  if (!order) return null;

  const handleCancelClick = () => {
    // Double check before showing modal
    if (!canCancelOrder()) {
      const paymentMethod = order?.payment_method?.toLowerCase();
      const paymentIntentId = order?.payment_intent_id;
      const status = order?.status?.toLowerCase();

      // Stripe orders cannot be cancelled at all
      if (paymentMethod === 'stripe' || paymentIntentId) {
        toastError(t(lang, "cannot_cancel_paid_order"));
      } else if (paymentMethod === 'cash' && status === 'confirmed') {
        toastError(t(lang, "cannot_cancel_paid_order"));
      } else if (status === 'completed' || status === 'delivered') {
        toastError(t(lang, "cannot_cancel_completed_order"));
      } else {
        toastError(t(lang, "cannot_cancel_order"));
      }
      return;
    }
    onCancel();
  };

  // Helper function to check if order is finished (delivered/completed/cancelled)
  const isOrderDelivered = (order: DetailedOrder) => {
    if (!order) return false;
    const status = order?.status?.toLowerCase();
    return status === 'delivered' || status === 'completed' || status === 'cancelled';
  };

  // Check if cancel button should be shown
  const shouldShowCancelButton = () => {
    if (!order) return false;

    const paymentMethod = order?.payment_method?.toLowerCase();
    const paymentIntentId = order?.payment_intent_id;
    const status = order?.status?.toLowerCase();

    // Don't show button if Stripe (regardless of status)
    if (paymentMethod === 'stripe' || paymentIntentId) {
      return false;
    }

    // Don't show button if Cash + confirmed
    if (paymentMethod === 'cash' && status === 'confirmed') {
      return false;
    }

    // Don't show button if order is completed, cancelled, or delivered
    if (status === 'completed' || status === 'cancelled' || status === 'delivered') {
      return false;
    }

    // Only if canCancelOrder() returns true
    return canCancelOrder();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-white/10">
      {/* Reorder Button - Only show for delivered/completed orders */}
      {isOrderDelivered(order) && (
        <button
          onClick={onReorder}
          disabled={isReorderLoading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-theme3/20 hover:bg-theme3/30 border border-theme3/30 rounded-xl text-theme3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isReorderLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RotateCcw className="w-5 h-5" />
          )}
          {t(lang, "reorder")}
        </button>
      )}

      {shouldShowCancelButton() && (
        <button
          onClick={handleCancelClick}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 font-semibold transition-all duration-300"
        >
          <X className="w-5 h-5" />
          {t(lang, "cancel_order")}
        </button>
      )}

      <button
        onClick={onTrack}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-theme3/20 hover:bg-theme3/30 border border-theme3/30 rounded-xl text-theme3 font-semibold transition-all duration-300"
      >
        <Navigation className="w-5 h-5" />
        {t(lang, "track_order")}
      </button>
    </div>
  );
}
