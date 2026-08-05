"use client";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import ProductCustomization, { type CustomizationState } from "../shop/ProductCustomization";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useAddToCart } from "../../../hooks/useAddToCart";
import api from "../../../api";
import { transformMenuItemToProduct, type Product as TransformedProduct } from "../../../lib/utils/productTransform";
import OptimizedImage from "../../ui/OptimizedImage";
import { IMAGE_PATHS } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { Product as ShopProduct } from "@/types/shop";

export interface UpsellProductItem {
  id?: string | number;
  menu_item_id?: string | number;
  name?: string;
  price?: number;
  image_url?: string | null;
  description?: string;
  [key: string]: unknown;
}

interface ProductQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  productItem: UpsellProductItem | null;
}

const DEFAULT_CUSTOMIZATION: CustomizationState = {
  sizeId: null,
  ingredientIds: [],
  selectedOptions: {},
  selectedCustomizations: { allergens: [], drinks: [], toppings: [], sauces: [] },
  finalPrice: 0,
  isValid: false,
  missingRequiredGroups: [],
};

/**
 * ProductQuickAddModal Component
 * Modal for quickly adding a product from upsell section with customization options
 */
export default function ProductQuickAddModal({ isOpen, onClose, productItem }: ProductQuickAddModalProps) {
  const { lang } = useLanguage();
  const handleAddToCart = useAddToCart();
  const [product, setProduct] = useState<TransformedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);

  // Fetch full product data when modal opens
  useEffect(() => {
    if (isOpen && productItem?.menu_item_id && !product) {
      setIsLoading(true);
      api.menu
        .getMenuItemById(productItem.menu_item_id)
        .then((response) => {
          let productData = null;
          let optionGroups: unknown[] = [];

          const responseData = response?.data as
            | { item?: unknown; option_groups?: unknown[]; customizations?: unknown }
            | undefined;

          if (response?.success && responseData) {
            productData = responseData.item || responseData;
            optionGroups = responseData.option_groups || [];
          } else if (responseData) {
            productData = responseData.item || responseData;
            optionGroups = responseData.option_groups || [];
          }

          if (productData) {
            // Extract customizations if available
            const customizations = responseData?.customizations || null;
            const transformed = transformMenuItemToProduct(
              productData as Parameters<typeof transformMenuItemToProduct>[0],
              optionGroups as Parameters<typeof transformMenuItemToProduct>[1],
              lang,
              customizations as Parameters<typeof transformMenuItemToProduct>[3]
            );
            setProduct(transformed);
            // Initialize final price
            setCustomization((prev) => ({
              ...prev,
              finalPrice: transformed?.base_price || transformed?.price || 0,
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching product:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, productItem?.menu_item_id, product, lang]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProduct(null);
      setQuantity(1);
      setCustomization(DEFAULT_CUSTOMIZATION);
    }
  }, [isOpen]);

  const handleCustomizationChange = useCallback((data: CustomizationState) => {
    setCustomization(data);
  }, []);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCartClick = () => {
    if (!product || !customization.isValid) {
      // Scroll to first missing required group
      if (customization.missingRequiredGroups && customization.missingRequiredGroups.length > 0) {
        const firstMissingGroup = customization.missingRequiredGroups[0];
        const groupElement = document.getElementById(`option-group-${firstMissingGroup.id}`);
        if (groupElement) {
          groupElement.scrollIntoView({ behavior: "smooth", block: "center" });
          groupElement.classList.add("ring-2", "ring-red-500", "ring-opacity-75");
          setTimeout(() => {
            groupElement.classList.remove("ring-2", "ring-red-500", "ring-opacity-75");
          }, 2000);
        }
      }
      return;
    }

    handleAddToCart(product, customization as any, quantity);
    onClose();
  };

  // Use portal to render modal at document body level
  if (typeof window === "undefined") return null;
  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md z-50"
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
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
            className="relative w-full max-w-2xl bg-linear-to-br from-bgimg/98 via-bgimg/95 to-bgimg/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "90vh",
              maxWidth: "90vw",
              margin: "auto",
              position: "relative",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 shrink-0 bg-linear-to-r from-bgimg/95 via-bgimg/90 to-bgimg/95 backdrop-blur-sm">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Product Image */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0">
                  <OptimizedImage
                    src={productItem?.image_url || product?.image || IMAGE_PATHS.placeholder}
                    alt={productItem?.name || product?.title || "Product"}
                    fill
                    className="object-cover"
                    quality={85}
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-lg sm:text-xl font-black truncate">
                    {productItem?.name || product?.title || t(lang, "product")}
                  </h2>
                  <p className="text-theme3 text-sm sm:text-base font-bold">
                    {formatCurrency(customization.finalPrice || productItem?.price || 0)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 shrink-0 shadow-lg hover:shadow-xl hover:scale-110 ml-4"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme3"></div>
                </div>
              ) : product ? (
                <div className="space-y-6">
                  {/* Product Customization */}
                  <ProductCustomization
                    product={product as unknown as ShopProduct}
                    onCustomizationChange={handleCustomizationChange}
                  />

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-white text-base font-semibold">
                      {t(lang, "quantity")}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white text-lg font-bold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="p-4 bg-theme3/10 rounded-xl border border-theme3/30">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-base font-semibold">
                        {t(lang, "total")}
                      </span>
                      <span className="text-theme3 text-2xl font-black">
                        {formatCurrency((customization.finalPrice || 0) * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-text/70">{t(lang, "try_again") || "Failed to load product"}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-white/20 shrink-0 bg-linear-to-r from-bgimg/95 via-bgimg/90 to-bgimg/95 backdrop-blur-sm">
              <button
                onClick={handleAddToCartClick}
                disabled={isLoading || !product || !customization.isValid}
                className={`
                  w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                  ${
                    customization.isValid && !isLoading && product
                      ? "bg-theme3 hover:bg-theme text-white shadow-lg hover:shadow-xl hover:scale-105"
                      : "bg-white/10 text-white/50 cursor-not-allowed opacity-60"
                  }
                `}
              >
                <ShoppingCart className="w-5 h-5" />
                {t(lang, "add_to_cart")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
