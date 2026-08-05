"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";
import { useLegalContent } from "../../hooks/useLegalContent";
import LegalContentSection from "../pages/legal/LegalContentSection";

export type LegalModalType = "terms-conditions" | "privacy-policy";

interface LegalModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** "terms-conditions" or "privacy-policy" */
  type?: LegalModalType;
}

/**
 * Legal Modal Component
 * Displays Terms & Conditions or Privacy Policy in a modal
 */
export default function LegalModal({ isOpen, onClose, type = "terms-conditions" }: LegalModalProps) {
  const { lang } = useLanguage();
  const { content, isLoading, error, refetch } = useLegalContent(type, isOpen);

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

  if (typeof window === "undefined") return null;
  if (!isOpen) return null;

  const title = type === "terms-conditions" ? t(lang, "terms_conditions") : t(lang, "privacy_policy");

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md z-[999999]"
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-linear-to-br from-bgimg/98 via-bgimg/95 to-bgimg/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "90vh",
              margin: "auto",
              position: "relative",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 shrink-0">
              <h2 className="text-white text-xl sm:text-2xl font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <LegalContentSection content={content as any} isLoading={isLoading} error={error} onRetry={refetch} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
