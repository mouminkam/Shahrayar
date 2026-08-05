"use client";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { DetailedOrder } from "./OrderDetailsContent";

/**
 * Get status color class
 */
const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'processing':
    case 'preparing':
    case 'confirmed':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

/**
 * Get status icon
 */
const getStatusIcon = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return <CheckCircle className="w-5 h-5" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

interface OrderHeaderProps {
  order: DetailedOrder;
}

/**
 * OrderHeader component - Displays order number, date, and status
 */
export default function OrderHeader({ order }: OrderHeaderProps) {
  const { lang } = useLanguage();

  if (!order) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-white  text-3xl font-black mb-2">
            {t(lang, "order_number")}{order.order_number || order.id}
          </h1>
          <p className="text-text text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) : t(lang, "date_not_available")}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="font-semibold capitalize">{order.status || 'pending'}</span>
        </div>
      </div>
    </motion.div>
  );
}
