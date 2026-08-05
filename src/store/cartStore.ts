"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TAX_AMOUNT } from "../data/constants";

export interface CartItem {
  id: string | number;
  name?: string;
  price: number;
  quantity: number;
  image?: string | null;
  image_url?: string | null;
  size_id?: string | number | null;
  size_name?: string | null;
  ingredients?: unknown[];
  ingredients_data?: unknown[];
  selected_options?: Record<string, (string | number)[]> | null;
  selected_customizations?: {
    allergens: (string | number)[];
    drinks: (string | number)[];
    toppings: (string | number)[];
    sauces: (string | number)[];
  } | null;
  base_price?: number;
  final_price?: number;
  [key: string]: unknown;
}

export interface Coupon {
  code?: string;
  type?: "percentage" | "fixed_amount" | "FREEDELIVERY" | string;
  value?: number;
  discount_amount?: number;
  discount_type?: string;
  is_free_delivery?: boolean;
  [key: string]: unknown;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  deliveryCharge: number;
  orderType: "pickup" | "delivery";
  quoteId: string | null;

  addToCart: (product: Partial<CartItem> & { id: string | number; price: number }) => void;
  removeFromCart: (cartItemKey: string | number) => void;
  increaseQty: (cartItemKey: string | number) => void;
  decreaseQty: (cartItemKey: string | number) => void;
  clearCart: () => void;
  applyCoupon: (couponData: Coupon | null) => void;
  removeCoupon: () => void;
  setDeliveryCharge: (charge: number) => void;
  resetDeliveryCharge: () => void;
  setOrderType: (type: "pickup" | "delivery") => void;
  setQuoteId: (quoteId: string | null) => void;
  updateCartItem: (cartItemKey: string | number, updates: Partial<CartItem>) => boolean;
  getSubtotal: () => number;
  getTax: () => number;
  getDiscount: () => number;
  getDeliveryCharge: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

interface CartItemKeyInput {
  id: string | number;
  size_id?: string | number | null;
  ingredients?: unknown[];
  selected_options?: Record<string, unknown> | null;
  selected_customizations?: Record<string, unknown> | null;
}

export const getCartItemKey = (item: CartItemKeyInput): string => {
  const sizeKey = item.size_id || "no-size";
  const ingredientsKey = Array.isArray(item.ingredients) ? [...item.ingredients].sort().join(",") : "no-ingredients";

  let optionsKey = "no-options";
  if (item.selected_options && typeof item.selected_options === "object") {
    const optionsArray = Object.entries(item.selected_options)
      .map(([groupId, itemIds]) => `${groupId}:${Array.isArray(itemIds) ? [...itemIds].sort().join(",") : ""}`)
      .sort();
    optionsKey = optionsArray.join("|") || "no-options";
  }

  let customizationsKey = "no-customizations";
  if (item.selected_customizations && typeof item.selected_customizations === "object") {
    const customizationsArray = Object.entries(item.selected_customizations)
      .map(([type, itemIds]) => `${type}:${Array.isArray(itemIds) ? [...itemIds].sort().join(",") : ""}`)
      .sort();
    customizationsKey = customizationsArray.join("|") || "no-customizations";
  }

  return `${item.id}-${sizeKey}-${ingredientsKey}-${optionsKey}-${customizationsKey}`;
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      deliveryCharge: 0,
      orderType: "delivery",
      quoteId: null,

      addToCart: (product) => {
        const items = get().items;

        const productKey = getCartItemKey({
          id: product.id,
          size_id: product.size_id || null,
          ingredients: product.ingredients || [],
          selected_options: product.selected_options || null,
          selected_customizations: product.selected_customizations || null,
        });

        const existingItem = items.find((item) => getCartItemKey(item) === productKey);

        if (existingItem) {
          set({
            items: items.map((item) =>
              getCartItemKey(item) === productKey
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                    image: item.image || product.image || product.image_url || null,
                  }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...product,
                quantity: 1,
                image: product.image || product.image_url || null,
                size_id: product.size_id || null,
                size_name: product.size_name || null,
                ingredients: product.ingredients || [],
                ingredients_data: product.ingredients_data || [],
                selected_options: product.selected_options || null,
                selected_customizations: product.selected_customizations || {
                  allergens: [],
                  drinks: [],
                  toppings: [],
                  sauces: [],
                },
                base_price: product.base_price || product.price,
                final_price: product.final_price || product.price,
              } as CartItem,
            ],
          });
        }
      },

      removeFromCart: (cartItemKey) => {
        const items = get().items;
        const itemToRemove = items.find((item) => getCartItemKey(item) === cartItemKey || item.id === cartItemKey);

        if (itemToRemove) {
          const itemKey = getCartItemKey(itemToRemove);
          set({
            items: items.filter((item) => getCartItemKey(item) !== itemKey && item.id !== cartItemKey),
          });
        } else {
          set({ items: items.filter((item) => item.id !== cartItemKey) });
        }
      },

      increaseQty: (cartItemKey) => {
        const items = get().items;
        set({
          items: items.map((item) => {
            const itemKey = getCartItemKey(item);
            if (itemKey === cartItemKey || item.id === cartItemKey) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          }),
        });
      },

      decreaseQty: (cartItemKey) => {
        const items = get().items;
        const item = items.find((item) => getCartItemKey(item) === cartItemKey || item.id === cartItemKey);

        if (item && item.quantity > 1) {
          set({
            items: items.map((it) => {
              const itemKey = getCartItemKey(it);
              if (itemKey === cartItemKey || it.id === cartItemKey) {
                return { ...it, quantity: it.quantity - 1 };
              }
              return it;
            }),
          });
        } else {
          get().removeFromCart(cartItemKey);
        }
      },

      clearCart: () => {
        set({ items: [], coupon: null, deliveryCharge: 0, quoteId: null });
      },

      applyCoupon: (couponData) => set({ coupon: couponData }),
      removeCoupon: () => set({ coupon: null }),
      setDeliveryCharge: (charge) => set({ deliveryCharge: charge || 0 }),
      resetDeliveryCharge: () => set({ deliveryCharge: 0, quoteId: null }),

      setOrderType: (type) => {
        set({ orderType: type });
        set({ deliveryCharge: 0, quoteId: null });
      },

      setQuoteId: (quoteId) => set({ quoteId: quoteId || null }),

      updateCartItem: (cartItemKey, updates) => {
        const items = get().items;
        const itemToUpdate = items.find((item) => getCartItemKey(item) === cartItemKey || item.id === cartItemKey);

        if (!itemToUpdate) {
          return false;
        }

        const updatedItem: CartItem = {
          ...itemToUpdate,
          ...updates,
          quantity: itemToUpdate.quantity,
          image: itemToUpdate.image || updates.image || null,
        };

        const newKey = getCartItemKey(updatedItem);
        const oldKey = getCartItemKey(itemToUpdate);

        if (newKey !== oldKey) {
          const existingItem = items.find((item) => getCartItemKey(item) === newKey && getCartItemKey(item) !== oldKey);

          if (existingItem) {
            set({
              items: items
                .filter((item) => getCartItemKey(item) !== oldKey)
                .map((item) =>
                  getCartItemKey(item) === newKey ? { ...item, quantity: item.quantity + updatedItem.quantity } : item
                ),
            });
          } else {
            set({
              items: items.filter((item) => getCartItemKey(item) !== oldKey).concat([updatedItem]),
            });
          }
        } else {
          set({
            items: items.map((item) => (getCartItemKey(item) === oldKey ? updatedItem : item)),
          });
        }

        return true;
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const itemPrice = item.final_price || item.price;
          return sum + itemPrice * item.quantity;
        }, 0);
      },

      getTax: () => TAX_AMOUNT,

      getDiscount: () => {
        const coupon = get().coupon;
        if (!coupon) return 0;

        const subtotal = get().getSubtotal();

        if (coupon.type === "percentage") {
          if (coupon.discount_amount && coupon.discount_amount > 0) {
            return Math.min(coupon.discount_amount, subtotal);
          }
          const discount = (subtotal * (coupon.value || 0)) / 100;
          return Math.min(discount, subtotal);
        } else if (coupon.type === "fixed_amount") {
          return Math.min(coupon.value || 0, subtotal);
        } else if (coupon.type === "FREEDELIVERY") {
          return 0;
        }

        if (coupon.discount_amount && coupon.discount_amount > 0) {
          return Math.min(coupon.discount_amount, subtotal);
        }

        return 0;
      },

      getDeliveryCharge: () => {
        const orderType = get().orderType;
        if (orderType === "pickup") {
          return 0;
        }

        const coupon = get().coupon;
        if (coupon && (coupon.type === "FREEDELIVERY" || coupon.is_free_delivery)) {
          return 0;
        }

        return get().deliveryCharge || 0;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const tax = get().getTax();
        const delivery = get().getDeliveryCharge();

        return subtotal - discount + tax + delivery;
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as { items?: CartItem[] } | undefined;
        if (state?.items) {
          state.items = state.items.map((item) => {
            if (!item.image) {
              item.image = item.image_url || (item as { imageUrl?: string }).imageUrl || null;
            }
            return item;
          });
        }
        return state;
      },
      version: 1,
    }
  )
);

export default useCartStore;
