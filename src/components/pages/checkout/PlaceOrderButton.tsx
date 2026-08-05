"use client";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface PlaceOrderButtonProps {
  isProcessing: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isDisabled: boolean;
}

export default function PlaceOrderButton({ isProcessing, onClick, isDisabled }: PlaceOrderButtonProps) {
  const { lang } = useLanguage();
  const disabled = isProcessing || isDisabled;
  return (
    <motion.button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-4 px-6 transition-all duration-300 text-base  font-semibold uppercase rounded-xl shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
      {isProcessing ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Lock className="w-5 h-5" />
          </motion.div>
          {t(lang, "processing")}
        </>
      ) : (
        <>
          <Lock className="w-5 h-5" />
          {t(lang, "place_order")}
        </>
      )}
    </motion.button>
  );
}
