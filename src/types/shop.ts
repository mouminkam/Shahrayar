/**
 * Shared type definitions for shop/product/cart/checkout domains.
 * These mirror the shapes produced by src/lib/utils/productTransform.js
 * and consumed by src/store/cartStore.js. Those source files remain
 * plain JS (owned by another workstream), so these types are inferred
 * from their actual runtime behavior rather than imported.
 */

export interface ProductSize {
  id: number | string;
  name: string;
  price: number;
  is_default?: boolean;
  original?: unknown;
}

export interface ProductIngredient {
  id: number | string;
  name: string;
  price: number;
  category?: string | null;
  is_required?: boolean;
  original?: unknown;
}

export interface OptionGroupItem {
  id: number | string;
  name: string;
  price_delta: number;
  sort_order?: number;
  original?: unknown;
}

export interface OptionGroupType {
  id: number | string;
  name: string;
  description?: string | null;
  type?: string | null;
  is_required: boolean;
  min_selection: number;
  max_selection: number;
  sort_order?: number;
  items: OptionGroupItem[];
  original?: unknown;
}

export interface CustomizationItem {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  final_price: number;
  image?: string | null;
  is_free?: boolean;
  is_active?: boolean;
  sort_order?: number;
  original?: unknown;
}

export interface CustomizationGroupData {
  name: string;
  available: CustomizationItem[];
  min_selection: number;
  max_selection?: number | null;
  has_free_options?: boolean;
  total_available?: number;
}

export type CustomizationType = "allergens" | "drinks" | "toppings" | "sauces";

export interface ProductCustomizations {
  allergens: CustomizationGroupData | null;
  drinks: CustomizationGroupData | null;
  toppings: CustomizationGroupData | null;
  sauces: CustomizationGroupData | null;
}

export interface SelectedCustomizations {
  allergens: (number | string)[];
  drinks: (number | string)[];
  toppings: (number | string)[];
  sauces: (number | string)[];
}

export type SelectedOptions = Record<string, (number | string)[]>;

/** Shape returned by transformMenuItemToProduct() — re-exported from its
 * source of truth so every consumer shares the exact same type. */
export type { Product } from "../lib/utils/productTransform";

/** Shape stored in useCartStore's `items` array — re-exported so every
 * consumer shares the exact same type as the store itself. */
export type { CartItem } from "../store/cartStore";

export interface Coupon {
  code: string;
  type?: "percentage" | "fixed_amount" | "FREEDELIVERY" | string;
  value?: number;
  discount_amount?: number;
  discount_type?: string;
  is_free_delivery?: boolean;
  [key: string]: unknown;
}

export type { Category } from "../lib/utils/productTransform";
