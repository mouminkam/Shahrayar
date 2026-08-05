"use client";
import { useCallback } from "react";
import useCartStore, { type CartItem } from "../store/cartStore";
import useToastStore from "../store/toastStore";
import useAuthStore from "../store/authStore";
import { validateProductForCart, buildProductCartItem, getCustomizationText } from "../lib/utils/cartHelpers";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../locales/i18n/getTranslation";

export interface AddToCartCustomization {
  isValid?: boolean;
  sizeId?: string | number;
  ingredientIds?: (string | number)[];
  [key: string]: unknown;
}

/** Validates a product/customization combo, adds it to the cart, and shows toast feedback. */
export function useAddToCart() {
  const { addToCart } = useCartStore();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const { isAuthenticated } = useAuthStore();
  const { lang } = useLanguage();

  const handleAddToCart = useCallback(
    (product: Record<string, any>, customization: AddToCartCustomization = {}, quantity = 1) => {
      const isValid =
        customization.isValid !== undefined
          ? customization.isValid
          : validateProductForCart(product, customization).isValid;

      if (!isValid) {
        const validation = validateProductForCart(product, customization);
        toastError((validation.error && t(lang, validation.error)) || validation.error || t(lang, "please_select_required_options"));
        return;
      }

      try {
        const cartItem = buildProductCartItem(product, customization, quantity) as CartItem;

        for (let i = 0; i < quantity; i++) {
          addToCart(cartItem);
        }

        const selectedSize = product?.sizes?.find((s: any) => s.id === customization.sizeId) || null;
        const selectedIngredients =
          product?.ingredients?.filter((ing: any) => customization.ingredientIds?.includes(ing.id)) || [];
        const customizationText = getCustomizationText(selectedSize, selectedIngredients, t, lang);

        toastSuccess(`${quantity} x ${product.title}${customizationText} ${t(lang, "added_to_cart")}`);

        if (!isAuthenticated) {
          setTimeout(() => {
            toastError(t(lang, "please_login_before_checkout") || "Please login before checkout");
          }, 500);
        }
      } catch {
        toastError(t(lang, "failed_add_cart"));
      }
    },
    [addToCart, toastSuccess, toastError, isAuthenticated, lang]
  );

  return handleAddToCart;
}
