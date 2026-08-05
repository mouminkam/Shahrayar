/**
 * Utility functions for cart operations
 */
import type { Product, ProductIngredient, ProductSize } from './productTransform';
import type { SelectedCustomizationsMap, SelectedOptionsMap } from './productPrice';

/**
 * Cart item as stored in cartStore. Built from a `Product` plus the
 * customization the user picked.
 */
export interface CartItem {
  id: number;
  name: string;
  price: number;
  base_price: number;
  image: string | null;
  title: string;
  quantity: number;
  size_id: number | string | null;
  size_name: string | null;
  ingredients: (number | string)[];
  ingredients_data: ProductIngredient[];
  selected_options: SelectedOptionsMap | null;
  selected_customizations: Required<Pick<SelectedCustomizationsMap, 'allergens' | 'drinks' | 'toppings' | 'sauces'>>;
  final_price: number;
  [key: string]: unknown;
}

/**
 * Customization state produced by useProductCustomization / reorder flow.
 */
export interface ProductCustomizationState {
  sizeId?: number | string | null;
  ingredientIds?: (number | string)[];
  selectedOptions?: SelectedOptionsMap | null;
  selectedCustomizations?: SelectedCustomizationsMap | null;
  finalPrice?: number;
  isValid?: boolean;
  missingRequiredGroups?: unknown[];
}

export interface CartValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validate product before adding to cart
 * @param product - Product object
 * @param customization - Customization object { sizeId, ingredientIds, selectedOptions, isValid }
 */
export function validateProductForCart(
  product: Partial<Product> | null | undefined,
  customization: ProductCustomizationState = {}
): CartValidationResult {
  if (!product) {
    return { isValid: false, error: 'Product is required' };
  }

  // Use isValid from customization if available (from option groups validation)
  if (customization.isValid === false) {
    return { isValid: false, error: 'Please select required options' };
  }

  // Legacy: Check if size is required but not selected (for products without option_groups)
  if (product?.has_sizes && !product?.has_option_groups && !customization.sizeId) {
    return { isValid: false, error: 'Please select a size' };
  }

  // Check option groups requirements
  if (product?.option_groups && Array.isArray(product.option_groups)) {
    const selectedOptions = customization.selectedOptions || {};
    for (const group of product.option_groups) {
      if (group.is_required) {
        const selectedItemIds = selectedOptions[group.id] || [];
        const minSelection = parseInt(String(group.min_selection || 0), 10);
        if (selectedItemIds.length < minSelection) {
          return { isValid: false, error: `Please select at least ${minSelection} option(s) from ${group.name}` };
        }
      }
    }
  }

  return { isValid: true, error: null };
}

/**
 * Build cart item object from product and customization
 * @param product - Product object
 * @param customization - Customization object { sizeId, ingredientIds, selectedOptions, selectedCustomizations, finalPrice }
 * @param quantity - Quantity to add
 */
export function buildProductCartItem(
  product: Partial<Product> | null | undefined,
  customization: ProductCustomizationState = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quantity: number = 1
): Omit<CartItem, 'quantity'> | null {
  if (!product) return null;

  // Get selected size and ingredients data (legacy support)
  const selectedSize = product?.sizes?.find((s: ProductSize) => s.id === customization.sizeId) || null;
  const selectedIngredients =
    product?.ingredients?.filter((ing: ProductIngredient) => customization.ingredientIds?.includes(ing.id)) || [];

  return {
    id: product.id as number,
    name: product.title as string,
    price: customization.finalPrice ?? product.price ?? product.base_price ?? 0,
    base_price: product.base_price ?? product.price ?? 0,
    image: product.image ?? null,
    title: product.title as string,
    // Size information (legacy)
    size_id: customization.sizeId ?? null,
    size_name: selectedSize?.name ?? null,
    // Ingredients information (legacy)
    ingredients: customization.ingredientIds ?? [],
    ingredients_data: selectedIngredients,
    // New: Option groups selections
    selected_options: customization.selectedOptions ?? null,
    // New: Customizations selections (allergens, drinks, toppings, sauces)
    selected_customizations: {
      allergens: customization.selectedCustomizations?.allergens ?? [],
      drinks: customization.selectedCustomizations?.drinks ?? [],
      toppings: customization.selectedCustomizations?.toppings ?? [],
      sauces: customization.selectedCustomizations?.sauces ?? [],
    },
    // Final calculated price
    final_price: customization.finalPrice ?? product.price ?? product.base_price ?? 0,
  };
}

/**
 * Check if cart item has any customization
 * @param item - Cart item object
 */
export function hasAnyCustomization(item: Partial<CartItem> | null | undefined): boolean {
  if (!item) return false;

  return !!(
    item.size_name ||
    (item.ingredients_data && item.ingredients_data.length > 0) ||
    (item.selected_options && typeof item.selected_options === 'object' && Object.keys(item.selected_options).length > 0) ||
    (item.selected_customizations &&
      typeof item.selected_customizations === 'object' &&
      ((item.selected_customizations.drinks && item.selected_customizations.drinks.length > 0) ||
        (item.selected_customizations.toppings && item.selected_customizations.toppings.length > 0) ||
        (item.selected_customizations.sauces && item.selected_customizations.sauces.length > 0) ||
        (item.selected_customizations.allergens && item.selected_customizations.allergens.length > 0)))
  );
}

export interface CustomizationDisplayText {
  size: string | null;
  ingredients: string | null;
  options: string | null;
  customizations: string | null;
}

export type TranslateFn = (lang: string, key: string) => string;

/**
 * Get formatted display text for customizations
 * Returns an object with different customization parts for flexible display
 * @param item - Cart item object
 * @param product - Product object (optional, for getting option group names)
 * @param t - Translation function
 * @param lang - Language code
 */
export function getCustomizationDisplayText(
  item: Partial<CartItem> | null | undefined,
  product: Partial<Product> | null = null,
  t: TranslateFn | null = null,
  lang: string = 'bg'
): CustomizationDisplayText {
  if (!item) return { size: null, ingredients: null, options: null, customizations: null };

  const parts: CustomizationDisplayText = {
    size: item.size_name || null,
    ingredients:
      item.ingredients_data && item.ingredients_data.length > 0
        ? item.ingredients_data.map((ing) => ing.name).join(', ')
        : null,
    options: null,
    customizations: null,
  };

  // Format selected_options
  if (item.selected_options && typeof item.selected_options === 'object') {
    const optionParts: string[] = [];
    if (product && product.option_groups) {
      // If we have product data, show group names and item names
      Object.entries(item.selected_options).forEach(([groupId, itemIds]) => {
        if (Array.isArray(itemIds) && itemIds.length > 0) {
          const group = product.option_groups!.find((g) => g.id === parseInt(groupId, 10));
          if (group) {
            const selectedItems = itemIds
              .map((itemId) => group.items.find((i) => i.id === itemId))
              .filter((i): i is NonNullable<typeof i> => Boolean(i))
              .map((i) => i.name);
            if (selectedItems.length > 0) {
              optionParts.push(`${group.name}: ${selectedItems.join(', ')}`);
            }
          }
        }
      });
    } else {
      // Fallback: just show count
      const totalOptions = Object.values(item.selected_options).reduce(
        (sum: number, itemIds) => sum + (Array.isArray(itemIds) ? itemIds.length : 0),
        0
      );
      if (totalOptions > 0) {
        optionParts.push(`${totalOptions} ${t ? t(lang, 'options') : 'options'}`);
      }
    }
    parts.options = optionParts.length > 0 ? optionParts.join('; ') : null;
  }

  // Format selected_customizations
  if (item.selected_customizations && typeof item.selected_customizations === 'object') {
    const customizationParts: string[] = [];
    const customizations = item.selected_customizations;

    if (product && product.customizations) {
      // If we have product data, show names
      (['drinks', 'toppings', 'sauces', 'allergens'] as const).forEach((type) => {
        const selectedIds = customizations[type] || [];
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          const group = product.customizations?.[type];
          if (group && Array.isArray(group.available)) {
            const selectedItems = selectedIds
              .map((id) => group.available.find((i) => i.id === id))
              .filter((i): i is NonNullable<typeof i> => Boolean(i))
              .map((i) => i.name);
            if (selectedItems.length > 0) {
              const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
              customizationParts.push(`${typeLabel}: ${selectedItems.join(', ')}`);
            }
          }
        }
      });
    } else {
      // Fallback: show counts
      (['drinks', 'toppings', 'sauces', 'allergens'] as const).forEach((type) => {
        const selectedIds = customizations[type] || [];
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
          customizationParts.push(`${typeLabel}: ${selectedIds.length}`);
        }
      });
    }

    parts.customizations = customizationParts.length > 0 ? customizationParts.join('; ') : null;
  }

  return parts;
}

/**
 * Generate customization text for toast notification
 * @param selectedSize - Selected size object
 * @param selectedIngredients - Array of selected ingredient objects
 * @param t - Translation function
 * @param lang - Language code
 */
export function getCustomizationText(
  selectedSize: { name?: string } | null | undefined,
  selectedIngredients: unknown[],
  t: TranslateFn,
  lang: string
): string {
  const parts = [
    selectedSize?.name,
    selectedIngredients.length > 0 && `${selectedIngredients.length} ${t(lang, 'add_ons')}`,
  ].filter(Boolean);

  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}
