"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useCheckoutPromo } from "../../../context/CheckoutPromoContext";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { formatCurrency } from "../../../lib/utils/formatters";

interface PromoPreview {
  promo_type?: string;
  discount_percent?: number;
  discount_amount?: number;
  has_promo_discount?: boolean;
}

interface CheckoutPromoValue {
  promoPreview: PromoPreview | null;
  isLoadingPromo: boolean;
}

function getIntroStorageKey(promoType: string | null | undefined): string {
  const suffix =
    promoType === "pickup"
      ? "pickup"
      : promoType === "first_delivery"
        ? "first_delivery"
        : "generic";
  return `shahrayar_checkout_promo_intro_${suffix}`;
}

export default function CheckoutPromoAnnouncementModal() {
  const { lang } = useLanguage();
  const { promoPreview, isLoadingPromo } = useCheckoutPromo() as CheckoutPromoValue;
  const [isOpen, setIsOpen] = useState(false);

  const storageKey = useMemo(
    () =>
      promoPreview?.has_promo_discount
        ? getIntroStorageKey(promoPreview?.promo_type)
        : null,
    [promoPreview]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoadingPromo || !promoPreview?.has_promo_discount || !storageKey) {
      setIsOpen(false);
      return;
    }
    if (localStorage.getItem(storageKey) === "1") {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  }, [isLoadingPromo, promoPreview, storageKey]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const dismiss = useCallback(() => {
    if (storageKey && typeof window !== "undefined") {
      localStorage.setItem(storageKey, "1");
    }
    setIsOpen(false);
  }, [storageKey]);

  const titleKey = useMemo(() => {
    const type = promoPreview?.promo_type;
    if (type === "pickup") return "promo_modal_title_pickup";
    if (type === "first_delivery") return "promo_modal_title_first_delivery";
    return "promo_modal_title_generic";
  }, [promoPreview?.promo_type]);

  const descKey = useMemo(() => {
    const type = promoPreview?.promo_type;
    if (type === "pickup") return "promo_modal_desc_pickup";
    if (type === "first_delivery") return "promo_modal_desc_first_delivery";
    return "promo_modal_desc_generic";
  }, [promoPreview?.promo_type]);

  if (typeof window === "undefined") return null;

  const percent =
    typeof promoPreview?.discount_percent === "number"
      ? promoPreview.discount_percent
      : null;
  const amount =
    typeof promoPreview?.discount_amount === "number"
      ? promoPreview.discount_amount
      : null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999990] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={dismiss}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-promo-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md rounded-2xl border border-white/15 bg-linear-to-br from-bgimg/95 via-bgimg to-bgimg/90 p-6 shadow-2xl shadow-theme3/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t(lang, "promo_modal_close")}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-theme3 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>

            <h2
              id="checkout-promo-modal-title"
              className="pr-10 text-xl font-black uppercase tracking-tight text-white"
            >
              {t(lang, titleKey)}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-text">
              {t(lang, descKey)}
            </p>

            {(percent != null && percent > 0) || (amount != null && amount > 0) ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                {percent != null && percent > 0 && (
                  <p className="text-sm font-semibold text-white">
                    {percent}%
                  </p>
                )}
                {amount != null && amount > 0 && (
                  <p className="text-sm text-theme3 font-bold">
                    −{formatCurrency(amount)}
                  </p>
                )}
              </div>
            ) : null}

            <p className="mt-4 text-xs text-text/90">
              {t(lang, "promo_modal_summary_hint")}
            </p>

            <button
              type="button"
              onClick={dismiss}
              className="mt-6 w-full rounded-xl bg-theme3 py-3 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:opacity-95"
            >
              {t(lang, "promo_modal_got_it")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
