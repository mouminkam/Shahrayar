/**
 * Utility functions for calculating product prices
 */
import type { Product } from './productTransform';

/**
 * Minimal shape accepted by the price calculators. Broader than the fully
 * transformed `Product` so callers building partial/mock product objects
 * (tests, cart rebuild flows) still satisfy the type.
 */
export type PriceableProduct = Pick<Product, 'sizes' | 'ingredients' | 'option_groups' | 'customizations'> &
  Partial<Pick<Product, 'base_price' | 'price'>>;

export interface SelectedOptionsMap {
  [groupId: string]: number[];
}

export interface SelectedCustomizationsMap {
  allergens?: number[];
  drinks?: number[];
  toppings?: number[];
  sauces?: number[];
  [key: string]: number[] | undefined;
}

/**
 * Calculate the final price of a product based on selected size and ingredients
 *
 * Note: size.price from API is the FULL price for that size, not an addition
 * So we use size.price directly instead of adding it to base_price
 *
 * @deprecated Use calculateProductPriceWithCustomizations() for full customization support
 * @param product - Product object with sizes and ingredients
 * @param selectedSizeId - Selected size ID
 * @param selectedIngredientIds - Array of selected ingredient IDs
 * @returns Final calculated price
 */
export function calculateProductPrice(
  product: Partial<PriceableProduct> | null | undefined,
  selectedSizeId: number | string | null = null,
  selectedIngredientIds: (number | string)[] = []
): number {
  if (!product) return 0;

  let price = product?.base_price || product?.price || 0;

  // If a size is selected, add its price to the base price
  if (selectedSizeId && product?.sizes) {
    const selectedSize = product.sizes.find((s) => s.id === selectedSizeId);
    if (selectedSize) {
      price += parseFloat(String(selectedSize.price || 0));
    }
  }

  // Add ingredients prices (these are additions, not full prices)
  if (selectedIngredientIds.length > 0 && product?.ingredients) {
    selectedIngredientIds.forEach((ingredientId) => {
      const ingredient = product.ingredients!.find((ing) => ing.id === ingredientId);
      if (ingredient) {
        price += parseFloat(String(ingredient.price || 0));
      }
    });
  }

  return price;
}

/**
 * Calculate the final price of a product with all customizations
 * Includes size, ingredients, option groups, and customizations (drinks, toppings, sauces, allergens)
 *
 * @param product - Product object with sizes, ingredients, option_groups, and customizations
 * @param selectedSizeId - Selected size ID
 * @param selectedIngredientIds - Array of selected ingredient IDs
 * @param selectedOptions - Selected option groups { [groupId]: [itemId1, itemId2, ...] }
 * @param selectedCustomizations - Selected customizations { drinks: [], toppings: [], sauces: [], allergens: [] }
 * @returns Final calculated price
 */
export function calculateProductPriceWithCustomizations(
  product: Partial<PriceableProduct> | null | undefined,
  selectedSizeId: number | string | null = null,
  selectedIngredientIds: (number | string)[] = [],
  selectedOptions: SelectedOptionsMap | null = null,
  selectedCustomizations: SelectedCustomizationsMap | null = null
): number {
  if (!product) return 0;

  let price = product.base_price || product.price || 0;

  // Legacy: Add size price if selected
  if (selectedSizeId && product.sizes) {
    const selectedSize = product.sizes.find((s) => s.id === selectedSizeId);
    if (selectedSize) {
      price += parseFloat(String(selectedSize.price || 0));
    }
  }

  // Legacy: Add ingredients prices
  if (selectedIngredientIds.length > 0 && product.ingredients) {
    selectedIngredientIds.forEach((ingredientId) => {
      const ingredient = product.ingredients!.find((ing) => ing.id === ingredientId);
      if (ingredient) {
        price += parseFloat(String(ingredient.price || 0));
      }
    });
  }

  // New: Add option groups price deltas
  if (selectedOptions && product.option_groups && Array.isArray(product.option_groups)) {
    product.option_groups.forEach((group) => {
      const selectedItemIds = selectedOptions[group.id] || [];
      selectedItemIds.forEach((itemId) => {
        const item = group.items.find((i) => i.id === itemId);
        if (item) {
          price += parseFloat(String(item.price_delta || 0));
        }
      });
    });
  }

  // Customizations: Add prices for selected customizations
  if (selectedCustomizations && product.customizations) {
    const customizationTypes = ['allergens', 'drinks', 'toppings', 'sauces'] as const;
    customizationTypes.forEach((type) => {
      const group = product.customizations?.[type];
      if (group && Array.isArray(group.available)) {
        const selectedIds = selectedCustomizations[type] || [];
        selectedIds.forEach((itemId) => {
          const item = group.available.find((i) => i.id === itemId);
          if (item && !item.is_free) {
            price += parseFloat(String(item.final_price || item.price || 0));
          }
        });
      }
    });
  }

  return price;
}
