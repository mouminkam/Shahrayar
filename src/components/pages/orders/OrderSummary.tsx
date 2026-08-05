"use client";
import { motion } from "framer-motion";
import { Package, MapPin, CreditCard } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { DetailedOrder } from "./OrderDetailsContent";

interface OrderSummaryProps {
  order: DetailedOrder;
}

/**
 * OrderSummary component - Displays order summary in sidebar
 */
export default function OrderSummary({ order }: OrderSummaryProps) {
  const { lang } = useLanguage();

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8 sticky top-8"
    >
      <h2 className="text-white  text-xl font-black uppercase mb-6">
        {t(lang, "order_summary")}
      </h2>

      <div className="space-y-4">
        {/* Order Type */}
        {order.order_type && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <Package className="w-5 h-5 text-theme3" />
            <div>
              <p className="text-text text-xs">{t(lang, "order_type")}</p>
              <p className="text-white font-semibold capitalize">{order.order_type}</p>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order.delivery_address && (
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
            <MapPin className="w-5 h-5 text-theme3 shrink-0 mt-0.5" />
            <div>
              <p className="text-text text-xs mb-1">{t(lang, "delivery_address")}</p>
              <p className="text-white text-sm">{order.delivery_address}</p>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {order.payment_method && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <CreditCard className="w-5 h-5 text-theme3" />
            <div>
              <p className="text-text text-xs">{t(lang, "payment_method")}</p>
              <p className="text-white font-semibold capitalize">{order.payment_method}</p>
            </div>
          </div>
        )}

        {/* Payment Status */}
        {order.payment_status && (
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <div className={`w-5 h-5 rounded-full ${order.payment_status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <div>
              <p className="text-text text-xs">{t(lang, "payment_status")}</p>
              <p className="text-white font-semibold capitalize">{order.payment_status}</p>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {order.subtotal && (
            <div className="flex justify-between items-center">
              <span className="text-text">{t(lang, "subtotal")}</span>
              <span className="text-white font-semibold">{formatCurrency(parseFloat(String(order.subtotal)))}</span>
            </div>
          )}
          {order.delivery_charge && parseFloat(String(order.delivery_charge)) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-text">{t(lang, "delivery")}</span>
              <span className="text-white font-semibold">{formatCurrency(parseFloat(String(order.delivery_charge)))}</span>
            </div>
          )}
          {order.tax_amount && (
            <div className="flex justify-between items-center">
              <span className="text-text">{t(lang, "tax")}</span>
              <span className="text-white font-semibold">{formatCurrency(parseFloat(String(order.tax_amount)))}</span>
            </div>
          )}
          {order.promo_discount_amount != null &&
            parseFloat(String(order.promo_discount_amount)) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-text">{t(lang, "promo_discount")}</span>
                <span className="text-theme3 font-semibold">
                  -{formatCurrency(parseFloat(String(order.promo_discount_amount)))}
                </span>
              </div>
            )}
          {order.discount_amount && parseFloat(String(order.discount_amount)) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-text">{t(lang, "coupon_discount")}</span>
              <span className="text-theme3 font-semibold">-{formatCurrency(parseFloat(String(order.discount_amount)))}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <span className="text-white  text-lg font-black uppercase">{t(lang, "total")}</span>
            <span className="text-theme3  text-2xl font-black">
              {formatCurrency(parseFloat(String(order.total_amount || order.total || 0)))}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
