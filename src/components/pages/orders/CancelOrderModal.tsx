"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

/**
 * CancelOrderModal component - Modal for cancelling an order
 */
export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}: CancelOrderModalProps) {
  const { lang } = useLanguage();
  const [cancelReason, setCancelReason] = useState("");

  // Reset cancel reason when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCancelReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCancelReason("");
    onClose();
  };

  const handleConfirm = () => {
    if (!cancelReason.trim()) {
      return;
    }
    onConfirm(cancelReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-linear-to-br from-bgimg/95 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/10 p-6 lg:p-8 max-w-md w-full"
      >
        <h3 className="text-white  text-2xl font-black mb-4">
          {t(lang, "cancel_order")}
        </h3>
        <p className="text-text mb-4">
          {t(lang, "cancel_order_confirmation")}
        </p>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder={t(lang, "enter_cancellation_reason")}
          rows={4}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300 resize-none mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(lang, "cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !cancelReason.trim()}
            className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t(lang, "cancelling") : t(lang, "confirm_cancel")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
