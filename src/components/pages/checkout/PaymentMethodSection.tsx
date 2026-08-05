"use client";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import useCartStore from "../../../store/cartStore";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { CheckoutFormData } from "../../../lib/validations/checkoutSchemas";

interface PaymentMethodSectionProps {
  formData: CheckoutFormData;
  setFormData: (updater: (prev: CheckoutFormData) => Partial<CheckoutFormData>) => void;
}

export default function PaymentMethodSection({ formData, setFormData }: PaymentMethodSectionProps) {
  const { orderType } = useCartStore();
  const { lang } = useLanguage();
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 shadow-2xl rounded-xl bg-theme flex items-center justify-center"
        >
          <CreditCard className="w-6 h-6 text-white fill-white" />
        </motion.div>
        <h3 className="text-white  text-2xl font-black uppercase">
          {t(lang, "payment_method")}
        </h3>
      </div>

      <PaymentMethodSelector
        paymentMethod={formData.paymentMethod}
        setPaymentMethod={(method) => setFormData((prev) => ({ ...prev, paymentMethod: method }))}
        orderType={orderType}
      />

      {formData.paymentMethod === "stripe" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-theme3/20 border border-theme3/50 rounded-xl"
        >
          <p className="text-white text-sm ">
            {t(lang, "stripe_payment_selected")}
          </p>
        </motion.div>
      )}

      {formData.paymentMethod === "cash" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl"
        >
          <p className="text-green-300 text-sm ">
            {t(lang, "cash_payment_message")} {orderType === "pickup" ? t(lang, "picked_up") : t(lang, "delivered")}.
          </p>
        </motion.div>
      )}
    </div>
  );
}
