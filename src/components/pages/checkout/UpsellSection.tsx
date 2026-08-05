"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, X } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useUpsellItems } from "../../../hooks/useUpsellItems";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import OptimizedImage from "../../ui/OptimizedImage";
import { IMAGE_PATHS } from "../../../data/constants";
import ProductQuickAddModal, { type UpsellProductItem } from "./ProductQuickAddModal";

interface UpsellSectionProps {
  onSkip?: () => void;
}

/**
 * UpsellSection Component
 * Displays suggested items (drinks, desserts, etc.) before checkout
 * Designed to match CheckoutSummary styling
 */
export default function UpsellSection({ onSkip }: UpsellSectionProps) {
  const { lang } = useLanguage();
  const { items, isLoading } = useUpsellItems();
  const [selectedItem, setSelectedItem] = useState<UpsellProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = (item: UpsellProductItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  // Don't render if no items (after loading completes)
  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="upsell-section bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 shadow-2xl rounded-xl bg-theme3 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-white fill-white" />
          </motion.div>
          <h3 className="text-white  text-2xl font-black uppercase">
            {t(lang, "you_might_also_like")}
          </h3>
        </div>
        <button
          onClick={handleSkip}
          className="text-text/70 hover:text-white transition-colors p-2"
          aria-label={t(lang, "skip")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme3"></div>
        </div>
        ) : items.length > 0 ? (
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
          {(items as UpsellProductItem[]).map((item) => {
            return (
              <motion.div
                key={item.id as React.Key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-theme3/50 transition-all cursor-pointer"
                onClick={() => handleAddItem(item)}
              >
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <OptimizedImage
                    src={item.image_url || IMAGE_PATHS.placeholder}
                    alt={item.name || ""}
                    fill
                    className="object-cover"
                    quality={85}
                    loading="lazy"
                    sizes="64px"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white  text-sm font-bold truncate">
                    {item.name}
                  </h4>
                  {item.description && (
                    <p className="text-text text-xs line-clamp-1 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Price and Add Button */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-theme3  text-sm font-bold">
                    {formatCurrency(item.price || 0)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddItem(item);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-theme3 hover:bg-theme text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t(lang, "add_item")}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : null}

      {/* Product Quick Add Modal */}
      {selectedItem && (
        <ProductQuickAddModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productItem={selectedItem}
        />
      )}
    </motion.div>
  );
}
