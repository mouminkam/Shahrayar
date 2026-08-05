"use client";
import { memo, useMemo } from "react";
import OptimizedImage from "../../ui/OptimizedImage";
import { motion } from "framer-motion";
import { ShoppingCart, Package, Tag, Truck, Sparkles } from "lucide-react";
import useCartStore, { getCartItemKey } from "../../../store/cartStore";
import { formatCurrency } from "../../../lib/utils/formatters";
import { IMAGE_PATHS } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { getCustomizationDisplayText } from "../../../lib/utils/cartHelpers";
import { useCheckoutPromo } from "../../../context/CheckoutPromoContext";
import type { CartItem } from "../../../store/cartStore";

interface PromoPreview {
  promo_type?: string;
  discount_percent?: number;
  discount_amount?: number;
  has_promo_discount?: boolean;
  total_after_promo_discount?: number;
}

interface CheckoutPromoValue {
  subtotal: number;
  promoPreview: PromoPreview | null;
  isLoadingPromo: boolean;
  promoDiscountAmount: number;
  couponDiscount: number;
  tax: number;
  delivery: number;
  checkoutTotal: number;
  refreshPromoPreview: () => Promise<PromoPreview | null>;
  orderAmountForCoupons: number;
}

function promoDiscountLabel(lang: string, promoPreview: PromoPreview | null): string {
  const type = promoPreview?.promo_type;
  if (type === "pickup") return t(lang, "promo_discount_pickup");
  if (type === "first_delivery") return t(lang, "promo_discount_first_delivery");
  return t(lang, "promo_discount");
}

const CheckoutSummary = memo(() => {
  const { lang } = useLanguage();
  const {
    items,
    coupon,
    orderType,
    getItemCount,
  } = useCartStore();

  const {
    subtotal,
    promoPreview,
    isLoadingPromo,
    promoDiscountAmount,
    couponDiscount,
    tax,
    delivery,
    checkoutTotal,
  } = useCheckoutPromo() as CheckoutPromoValue;

  const itemCount = useMemo(() => getItemCount(), [items, getItemCount]);

  if (items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="checkout-summary bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8 sticky top-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 shadow-2xl rounded-xl bg-theme3 flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6 text-white fill-white" />
        </motion.div>
        <h3 className="text-white  text-2xl font-black uppercase">
          {t(lang, "order_summary")}
        </h3>
      </div>

      {/* Order Items */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
        {items.map((item: CartItem) => {
          const uniqueKey = getCartItemKey({
            id: item.id,
            size_id: item.size_id || null,
            ingredients: item.ingredients || [],
          });
          const customizationParts = getCustomizationDisplayText(
            item as unknown as Parameters<typeof getCustomizationDisplayText>[0]
          );
          const customizationText = [
            customizationParts.size,
            customizationParts.ingredients && `+${customizationParts.ingredients.split(", ").length} ${t(lang, "add_ons")}`,
            customizationParts.options,
            customizationParts.customizations
          ].filter(Boolean).join(" • ");

          return (
          <motion.div
            key={uniqueKey}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <OptimizedImage
                src={item.image || IMAGE_PATHS.placeholder}
                alt={item.name}
                fill
                className="object-cover"
                quality={85}
                loading="lazy"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white  text-sm font-bold truncate">
                {item.name}
              </h4>
              <p className="text-text text-xs">
                {t(lang, "quantity")}: {item.quantity} × {formatCurrency(item.final_price || item.price)}
                {customizationText && ` • ${customizationText}`}
              </p>
            </div>
            <div className="text-theme3  text-sm font-bold">
              {formatCurrency((item.final_price || item.price) * item.quantity)}
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* Summary Details */}
      <div className="space-y-3 mb-6 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-theme3" />
            <span className="text-text  text-sm font-medium">
              {t(lang, "items")} ({itemCount})
            </span>
          </div>
          <span className="text-white  text-sm font-bold">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-text  text-base font-medium">
            {t(lang, "subtotal")}
          </span>
          <span className="text-white  text-lg font-bold">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {isLoadingPromo && (
          <p className="text-text text-xs">{t(lang, "promo_discount_loading")}</p>
        )}

        {promoDiscountAmount > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-theme3" />
              <span className="text-text  text-base font-medium">
                {promoDiscountLabel(lang, promoPreview)}
                {typeof promoPreview?.discount_percent === "number" &&
                  promoPreview.discount_percent > 0 &&
                  ` (${promoPreview.discount_percent}%)`}
              </span>
            </div>
            <span className="text-theme3  text-lg font-bold">
              -{formatCurrency(promoDiscountAmount)}
            </span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-theme3" />
              <span className="text-text  text-base font-medium">
                {t(lang, "discount")} {coupon?.code && `(${coupon.code})`}
              </span>
            </div>
            <span className="text-theme3  text-lg font-bold">
              -{formatCurrency(couponDiscount)}
            </span>
          </div>
        )}

        {orderType === "delivery" && (
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-theme3" />
              <span className="text-text  text-base font-medium">
                {t(lang, "delivery")}
              </span>
            </div>
            <span className="text-white  text-lg font-bold">
              {formatCurrency(delivery)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-text  text-base font-medium">
            {t(lang, "tax")}
          </span>
          <span className="text-white  text-lg font-bold">
            {formatCurrency(tax)}
          </span>
        </div>

        <div className="flex justify-between items-center py-4 border-t-2 border-theme3/30">
          <span className="text-white  text-xl font-black uppercase">
            {t(lang, "total")}
          </span>
          <span className="text-theme3  text-2xl font-black">
            {formatCurrency(checkoutTotal)}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

CheckoutSummary.displayName = "CheckoutSummary";

export default CheckoutSummary;
