"use client";
import { useState, useCallback } from "react";
import { ShoppingCart, Facebook, Youtube, Twitter, Instagram, Plus, Minus } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import ProductCustomization, { type CustomizationState } from "./ProductCustomization";
import { useAddToCart } from "../../../hooks/useAddToCart";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { Product } from "@/types/shop";

interface ProductAboutProps {
  product: Product | null;
}

export default function ProductAbout({ product }: ProductAboutProps) {
  const { lang } = useLanguage();
  const handleAddToCart = useAddToCart();

  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<CustomizationState>(() => ({
    sizeId: null, // No default selection - user must choose
    ingredientIds: [],
    selectedOptions: {}, // New: option groups selections
    selectedCustomizations: { allergens: [], drinks: [], toppings: [], sauces: [] },
    finalPrice: product?.price || product?.base_price || 0,
    isValid: false, // Will be updated by ProductCustomization
    missingRequiredGroups: [], // Groups that need to be selected
  }));

  const handleCustomizationChange = useCallback((data: CustomizationState) => {
    setCustomization(data);
  }, []);

  const onAddToCart = () => {
    if (!product) return;
    if (!customization.isValid) {
      // Scroll to first missing required group
      if (customization.missingRequiredGroups && customization.missingRequiredGroups.length > 0) {
        const firstMissingGroup = customization.missingRequiredGroups[0];
        const groupElement = document.getElementById(`option-group-${firstMissingGroup.id}`);
        if (groupElement) {
          groupElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          groupElement.classList.add('ring-2', 'ring-red-500', 'ring-opacity-75');
          setTimeout(() => {
            groupElement.classList.remove('ring-2', 'ring-red-500', 'ring-opacity-75');
          }, 2000);
        } else {
          // Fallback: scroll to customization section
          const customizationSection = document.querySelector('.product-customization');
          if (customizationSection) {
            customizationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
      return;
    }
    handleAddToCart(product, customization as any, quantity);
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="product-about h-full flex flex-col">
      <div className="title-wrapper flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="product-title text-white  text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
          {product?.title || t(lang, "product")}
        </h2>
        <div className="price text-theme  text-4xl sm:text-5xl lg:text-6xl font-black">
          {formatCurrency(product?.price || product?.base_price || 0)}
        </div>
      </div>

      <p className="text text-white text-base sm:text-lg max-w-2xl font-normal leading-relaxed mb-8">
        {product?.description || product?.longDescription || t(lang, "no_description_available")}
      </p>

      {/* Product Customization (Sizes & Ingredients) */}
      <ProductCustomization
        product={product}
        onCustomizationChange={handleCustomizationChange}
      />

      <div className="actions mb-8">
        <div className="quantity flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8">
          <p className="text-white text-lg  font-semibold mb-0">
            {t(lang, "quantity")}
          </p>

          <div className="qty-wrapper flex items-center gap-0 shadow-lg rounded-lg overflow-hidden">
            <button
              type="button"
              className="quantity-minus qty-btn w-12 h-12 bg-white text-text hover:bg-theme hover:text-white transition-all duration-300 flex items-center justify-center border-r border-gray-200"
              onClick={() => handleQuantityChange(-1)}
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              className="qty-input w-20 h-12 text-center border-y border-gray-200 bg-white text-title text-lg font-bold px-2 outline-none focus:ring-2 focus:ring-theme3 focus:border-theme3 transition-all"
              step="1"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
            <button
              type="button"
              className="quantity-plus qty-btn w-12 h-12 bg-white text-text hover:bg-theme hover:text-white transition-all duration-300 flex items-center justify-center border-l border-gray-200"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={onAddToCart}
            disabled={!customization.isValid}
            className={`
              theme-btn group inline-flex items-center justify-center w-full sm:w-auto px-8 py-4
              text-base font-semibold transition-all duration-300 rounded-xl backdrop-blur-sm
              ${
                customization.isValid
                  ? "bg-transparent text-white border-2 border-theme3 hover:bg-theme3 hover:border-theme3 hover:shadow-lg hover:shadow-theme3/30"
                  : "bg-white/10 text-white/50 border-2 border-white/20 cursor-not-allowed opacity-60"
              }
            `}
          >
            <ShoppingCart className={`w-5 h-5 mr-2 ${customization.isValid ? 'transform group-hover:scale-110 transition-transform duration-300' : ''}`} />
            {t(lang, "add_to_cart")}
          </button>
        </div>
      </div>


    </div>
  );
}
