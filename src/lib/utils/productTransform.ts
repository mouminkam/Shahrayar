/**
 * Utility functions to transform API menu item data to frontend product structure
 */
import { IMAGE_PATHS } from '../../data/constants';
import { getProxiedImageUrl } from './imageProxy';

// ---------------------------------------------------------------------------
// Raw API shapes (as returned by the menu-items / menu-categories endpoints)
// ---------------------------------------------------------------------------

export interface RawSize {
  id: number;
  name?: string;
  name_en?: string;
  name_bg?: string;
  price?: number | string | null;
  is_default?: boolean;
  [key: string]: unknown;
}

export interface RawIngredient {
  id: number;
  name?: string;
  name_en?: string;
  name_bg?: string;
  price?: number | string | null;
  pivot?: { is_required?: number | boolean };
  [key: string]: unknown;
}

export interface RawOptionGroupItem {
  id: number;
  name?: string;
  price_delta?: number | string | null;
  sort_order?: number | string | null;
  [key: string]: unknown;
}

export interface RawOptionGroup {
  id: number;
  name?: string;
  description?: string | null;
  type?: string | null;
  is_required?: boolean | number;
  min_selection?: number | string | null;
  max_selection?: number | string | null;
  sort_order?: number | string | null;
  items?: RawOptionGroupItem[];
  [key: string]: unknown;
}

export interface RawCustomizationItem {
  id: number;
  name?: string;
  name_en?: string;
  name_bg?: string;
  description?: string;
  price?: number | string | null;
  base_price?: number | string | null;
  final_price?: number | string | null;
  image_url?: string | null;
  image?: string | null;
  is_free?: boolean;
  is_active?: boolean;
  sort_order?: number | string | null;
  [key: string]: unknown;
}

export interface RawCustomizationGroup {
  available?: RawCustomizationItem[];
  min_selection?: number | string | null;
  max_selection?: number | string | null;
  has_free_options?: boolean;
  total_available?: number;
  [key: string]: unknown;
}

export interface RawCustomizations {
  allergens?: RawCustomizationGroup | null;
  drinks?: RawCustomizationGroup | null;
  toppings?: RawCustomizationGroup | null;
  sauces?: RawCustomizationGroup | null;
  [key: string]: unknown;
}

export interface RawCategory {
  id?: number;
  category_id?: number;
  name?: string;
  name_en?: string;
  name_bg?: string;
  title?: string;
  slug?: string;
  image?: string | null;
  image_url?: string | null;
  description?: string;
  description_en?: string;
  description_bg?: string;
  product_count?: number;
  items_count?: number;
  [key: string]: unknown;
}

export interface RawMenuItem {
  id: number;
  name?: string;
  name_en?: string;
  name_bg?: string;
  description?: string;
  description_en?: string;
  description_bg?: string;
  price?: number | string | null;
  default_price?: number | string | null;
  image?: string | null;
  image_url?: string | null;
  category?: RawCategory | null;
  category_id?: number | null;
  rating?: number;
  is_featured?: boolean;
  sizes?: RawSize[];
  ingredients?: RawIngredient[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Transformed frontend shapes
// ---------------------------------------------------------------------------

export interface ProductSize {
  id: number;
  name: string;
  price: number;
  is_default: boolean;
  original: RawSize;
}

export interface ProductIngredient {
  id: number;
  name: string;
  price: number;
  category: null;
  is_required: boolean;
  original: RawIngredient;
}

export interface ProductOptionGroupItem {
  id: number;
  name: string;
  price_delta: number;
  sort_order: number;
  original: RawOptionGroupItem;
}

export interface ProductOptionGroup {
  id: number;
  name: string;
  description: string | null;
  type: string | null;
  is_required: boolean;
  min_selection: number;
  max_selection: number;
  sort_order: number;
  items: ProductOptionGroupItem[];
  original: RawOptionGroup;
}

export interface CustomizationItem {
  id: number;
  name: string;
  description: string;
  price: number;
  final_price: number;
  image: string | null;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  original: RawCustomizationItem;
}

export interface CustomizationGroup {
  name: string;
  available: CustomizationItem[];
  min_selection: number;
  max_selection: number | null;
  has_free_options: boolean;
  total_available: number;
}

export interface ProductCustomizations {
  allergens: CustomizationGroup | null;
  drinks: CustomizationGroup | null;
  toppings: CustomizationGroup | null;
  sauces: CustomizationGroup | null;
}

export interface Product {
  id: number;
  menu_item_id: number;
  title: string;
  price: number;
  base_price: number;
  image: string | null;
  description: string;
  longDescription: string;
  category: string;
  category_id: number | null;
  rating: number;
  featured: boolean;
  sizes: ProductSize[];
  ingredients: ProductIngredient[];
  option_groups: ProductOptionGroup[];
  has_option_groups: boolean;
  customizations: ProductCustomizations | null;
  has_customizations: boolean;
  has_allergens: boolean;
  has_drinks: boolean;
  has_toppings: boolean;
  has_sauces: boolean;
  default_size_id: number | null;
  has_sizes: boolean;
  has_ingredients: boolean;
  original: RawMenuItem;
}

export interface Category {
  id: number | undefined;
  name: string;
  slug: string;
  image: string | null;
  description: string;
  product_count: number;
  original: RawCategory;
}

/**
 * Get localized field value based on language
 * Priority: name_{lang} > name (fallback)
 * @param obj - Object containing localized fields
 * @param fieldName - Base field name (e.g., 'name', 'description')
 * @param lang - Language code ('en', 'bg')
 * @returns Localized value or fallback
 */
export const getLocalizedField = (
  obj: Record<string, unknown> | null | undefined,
  fieldName: string,
  lang: string = 'bg'
): string => {
  if (!obj) return '';

  // Map language codes to field suffixes
  const langMap: Record<string, string> = {
    en: 'en',
    bg: 'bg',
    // 'ar': 'ar' - not needed per requirements
  };

  const suffix = langMap[lang];
  if (suffix) {
    const localizedField = `${fieldName}_${suffix}`;
    const value = obj[localizedField];
    if (value) {
      return value as string;
    }
  }

  // Fallback to default field
  return (obj[fieldName] as string) || '';
};

/**
 * Transform customizations from API format to frontend format
 * @param customizations - Customizations object from API
 * @param lang - Language code ('en', 'bg')
 * @returns Transformed customizations object
 */
export const transformCustomizations = (
  customizations: RawCustomizations | null | undefined,
  lang: string = 'bg'
): ProductCustomizations | null => {
  if (!customizations) return null;

  const transformCustomizationGroup = (
    group: RawCustomizationGroup | null | undefined,
    groupName: string
  ): CustomizationGroup | null => {
    if (!group || !Array.isArray(group.available)) return null;

    return {
      name: groupName, // 'allergens', 'drinks', 'toppings', 'sauces'
      available: group.available.map((item) => ({
        id: item.id,
        name: getLocalizedField(item, 'name', lang),
        description: getLocalizedField(item, 'description', lang),
        price: parseFloat(String(item.price ?? item.base_price ?? item.final_price ?? 0)),
        final_price: parseFloat(String(item.final_price ?? item.price ?? item.base_price ?? 0)),
        image: item.image_url || item.image || null,
        is_free: item.is_free || false,
        is_active: item.is_active !== false,
        sort_order: parseInt(String(item.sort_order || 0), 10),
        original: item,
      })),
      min_selection: parseInt(String(group.min_selection || 0), 10),
      max_selection: group.max_selection ? parseInt(String(group.max_selection), 10) : null,
      has_free_options: group.has_free_options || false,
      total_available: group.total_available || group.available.length,
    };
  };

  return {
    allergens: transformCustomizationGroup(customizations.allergens, 'allergens'),
    drinks: transformCustomizationGroup(customizations.drinks, 'drinks'),
    toppings: transformCustomizationGroup(customizations.toppings, 'toppings'),
    sauces: transformCustomizationGroup(customizations.sauces, 'sauces'),
  };
};

/**
 * Get full image URL from API response with proxy support
 * API provides image_url as full URL, fallback to constructing from image path
 * Automatically uses proxy for API images to solve CORS issues
 */
const getImageUrl = (menuItem: RawMenuItem): string => {
  let imageUrl: string | null = null;

  // Local static asset (this demo build's mock fixtures point straight at
  // /public/img/...) — served as-is, no proxying needed.
  // PRODUCTION: once a real backend is wired up, its `image`/`image_url`
  // fields hold backend-relative paths instead, which the branches below
  // resolve into a full storage URL and route through the CORS image proxy.
  if (menuItem.image_url?.startsWith('/img/') || menuItem.image?.startsWith('/img/')) {
    return (menuItem.image_url || menuItem.image) as string;
  }

  // API provides image_url as full URL
  if (menuItem.image_url) {
    imageUrl = menuItem.image_url;
  }
  // Fallback: construct URL from relative image path
  else if (menuItem.image) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shahrayar.peaklink.pro/api/v1';
    const storageBaseUrl = API_BASE_URL.replace('/api/v1', '');
    const cleanPath = menuItem.image.startsWith('/') ? menuItem.image.slice(1) : menuItem.image;
    imageUrl = `${storageBaseUrl}/storage/${cleanPath}`;
  }
  // No image available
  else {
    return IMAGE_PATHS.placeholder;
  }

  // Use proxy for API images
  return getProxiedImageUrl(imageUrl) || IMAGE_PATHS.placeholder;
};

export const transformMenuItemToProduct = (
  menuItem: RawMenuItem | null | undefined,
  optionGroups: RawOptionGroup[] = [],
  lang: string = 'bg',
  customizations: RawCustomizations | null = null
): Product | null => {
  if (!menuItem) return null;

  // Extract sizes and ingredients (API provides them directly)
  // These are kept for backward compatibility with old products
  const sizesArray = Array.isArray(menuItem.sizes) ? menuItem.sizes : [];
  const ingredientsArray = Array.isArray(menuItem.ingredients) ? menuItem.ingredients : [];

  // Get base price - API provides default_price
  const basePrice = parseFloat(String(menuItem.price ?? menuItem.default_price ?? 0));

  // Get default size (size with is_default flag, or first size)
  // Note: We keep default_size_id for backward compatibility but won't use it as default selection
  const defaultSize = sizesArray.find((s) => s.is_default) || sizesArray[0] || null;
  const defaultSizeId = defaultSize?.id ?? null;

  // Display price: always use basePrice (which represents price from API)
  // basePrice is the actual price from API response (menuItem.price)
  const displayPrice = basePrice;

  // Get localized name and description for menu item
  const itemName = getLocalizedField(menuItem, 'name', lang);
  const itemDescription = getLocalizedField(menuItem, 'description', lang);

  // Get localized category name
  const categoryName = menuItem.category ? getLocalizedField(menuItem.category, 'name', lang) : '';

  // Transform option_groups from API format to frontend format
  const transformedOptionGroups: ProductOptionGroup[] = Array.isArray(optionGroups)
    ? optionGroups.map((group) => ({
        id: group.id,
        name: group.name || '',
        description: group.description || null,
        type: group.type || null,
        is_required: group.is_required === true || group.is_required === 1,
        min_selection: parseInt(String(group.min_selection || 0), 10),
        max_selection: parseInt(String(group.max_selection || 0), 10),
        sort_order: parseInt(String(group.sort_order || 0), 10),
        items: Array.isArray(group.items)
          ? group.items.map((item) => ({
              id: item.id,
              name: item.name || '',
              price_delta: parseFloat(String(item.price_delta || 0)),
              sort_order: parseInt(String(item.sort_order || 0), 10),
              original: item,
            }))
          : [],
        original: group,
      }))
    : [];

  // Transform customizations
  const transformedCustomizations = transformCustomizations(customizations, lang);
  const hasCustomizations = !!(
    transformedCustomizations &&
    (transformedCustomizations.allergens ||
      transformedCustomizations.drinks ||
      transformedCustomizations.toppings ||
      transformedCustomizations.sauces)
  );

  return {
    id: menuItem.id,
    menu_item_id: menuItem.id,
    title: itemName,
    price: displayPrice,
    base_price: basePrice,
    image: getImageUrl(menuItem),
    description: itemDescription,
    longDescription: itemDescription,
    category: categoryName,
    category_id: menuItem.category_id || menuItem.category?.id || null,
    rating: menuItem.rating || 0,
    featured: menuItem.is_featured || false,
    // Sizes data (API provides: id, name, price, is_default) - kept for backward compatibility
    // Use localized name if available (name_en, name_bg), otherwise fallback to name
    sizes: sizesArray.map((size) => ({
      id: size.id,
      name: getLocalizedField(size, 'name', lang),
      price: parseFloat(String(size.price || 0)),
      is_default: size.is_default || false,
      original: size,
    })),
    // Ingredients data (API provides: id, name, price, pivot.is_required) - kept for backward compatibility
    // Use localized name for ingredients
    ingredients: ingredientsArray.map((ingredient) => ({
      id: ingredient.id,
      name: getLocalizedField(ingredient, 'name', lang),
      price: parseFloat(String(ingredient.price || 0)),
      category: null,
      is_required: ingredient.pivot?.is_required === 1 || false,
      original: ingredient,
    })),
    // New option_groups system
    option_groups: transformedOptionGroups,
    has_option_groups: transformedOptionGroups.length > 0,
    // Customizations system
    customizations: transformedCustomizations,
    has_customizations: hasCustomizations,
    has_allergens: transformedCustomizations?.allergens !== null && transformedCustomizations?.allergens !== undefined,
    has_drinks: transformedCustomizations?.drinks !== null && transformedCustomizations?.drinks !== undefined,
    has_toppings: transformedCustomizations?.toppings !== null && transformedCustomizations?.toppings !== undefined,
    has_sauces: transformedCustomizations?.sauces !== null && transformedCustomizations?.sauces !== undefined,
    // Backward compatibility fields
    default_size_id: defaultSizeId, // Kept but not used as default selection
    has_sizes: sizesArray.length > 0,
    has_ingredients: ingredientsArray.length > 0,
    // Keep original data for reference
    original: menuItem,
  };
};

/**
 * Transform array of menu items to products
 * @param menuItems - Array of menu items from API
 * @param lang - Language code ('en', 'bg'), defaults to 'bg'
 * @returns Array of product objects
 */
export const transformMenuItemsToProducts = (menuItems: RawMenuItem[] | null | undefined, lang: string = 'bg'): Product[] => {
  if (!Array.isArray(menuItems)) return [];
  return menuItems.map((item) => transformMenuItemToProduct(item, [], lang)).filter((p): p is Product => p !== null);
};

/**
 * Transform API category to frontend category structure
 * @param category - Category from API
 * @param lang - Language code ('en', 'bg'), defaults to 'bg'
 * @returns Category object for frontend
 */
export const transformCategory = (category: RawCategory | null | undefined, lang: string = 'bg'): Category | null => {
  if (!category) return null;

  const categoryName = getLocalizedField(category, 'name', lang) || category.title || '';
  const categoryDescription = getLocalizedField(category, 'description', lang);

  return {
    id: category.id || category.category_id,
    name: categoryName,
    slug: category.slug || categoryName.toLowerCase().replace(/\s+/g, '-') || '',
    image: category.image || category.image_url || null,
    description: categoryDescription,
    product_count: category.product_count || category.items_count || 0,
    original: category,
  };
};

/**
 * Transform array of categories
 * @param categories - Array of categories from API
 * @param lang - Language code ('en', 'bg'), defaults to 'bg'
 * @returns Array of category objects
 */
export const transformCategories = (categories: RawCategory[] | null | undefined, lang: string = 'bg'): Category[] => {
  if (!Array.isArray(categories)) return [];
  return categories.map((category) => transformCategory(category, lang)).filter((c): c is Category => c !== null);
};
