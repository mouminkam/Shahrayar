"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ProductSizes from "../pages/shop/ProductSizes";
import ProductIngredients from "../pages/shop/ProductIngredients";
import OptionGroup from "../pages/shop/OptionGroup";
import CustomizationGroup from "../pages/shop/CustomizationGroup";
import { formatCurrency } from "../../lib/utils/formatters";
import api from "../../api";
import { transformMenuItemToProduct } from "../../lib/utils/productTransform";
import { useLanguage } from "../../context/LanguageContext";
import type {
  CartItem,
  Product,
  SelectedOptions,
  SelectedCustomizations,
} from "@/types/shop";

interface CartEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  onSave: (updates: Partial<CartItem>) => void;
}

const EMPTY_CUSTOMIZATIONS: SelectedCustomizations = {
  allergens: [],
  drinks: [],
  toppings: [],
  sauces: [],
};

/**
 * CartEditModal Component
 * Modal for editing cart item customization (sizes and ingredients)
 */
export default function CartEditModal({ isOpen, onClose, cartItem, onSave }: CartEditModalProps) {
  const { lang } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<string | number | null>(
    cartItem?.size_id || null
  );
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<(string | number)[]>(
    (cartItem?.ingredients as (string | number)[]) || []
  );
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => {
    // Initialize from cartItem.selected_options or empty object
    if (cartItem?.selected_options && typeof cartItem.selected_options === "object") {
      return cartItem.selected_options;
    }
    return {};
  });
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomizations>(
    () => {
      // Initialize from cartItem.selected_customizations or empty object
      if (
        cartItem?.selected_customizations &&
        typeof cartItem.selected_customizations === "object"
      ) {
        return cartItem.selected_customizations;
      }
      return { ...EMPTY_CUSTOMIZATIONS };
    }
  );

  // Fetch product data if not available
  useEffect(() => {
    if (isOpen && cartItem?.id && !product) {
      setIsLoading(true);
      api.menu
        .getMenuItemById(cartItem.id)
        .then((response: any) => {
          // Extract product data, option_groups, and customizations from response
          let productData: any = null;
          let optionGroups: any[] = [];
          let customizations: any = null;

          if (response?.success && response?.data) {
            productData = response.data.item || response.data;
            optionGroups = response.data.option_groups || [];
            customizations = response.data.customizations || null;
          } else if (response?.data) {
            productData = response.data.item || response.data;
            optionGroups = response.data.option_groups || [];
            customizations = response.data.customizations || null;
          } else if (typeof response === "object" && !Array.isArray(response)) {
            if (response.id || response.name || response.menu_item_id) {
              productData = response;
            }
          }

          if (productData) {
            const transformed = transformMenuItemToProduct(
              productData,
              optionGroups,
              lang,
              customizations
            );
            if (!transformed) return;
            setProduct(transformed);
            // Initialize selections from cart item
            setSelectedSizeId(cartItem.size_id || null); // No default
            setSelectedIngredientIds((cartItem.ingredients as (string | number)[]) || []);
            // Initialize option groups from cart item
            if (cartItem?.selected_options && typeof cartItem.selected_options === "object") {
              setSelectedOptions(cartItem.selected_options);
            } else if (transformed.option_groups) {
              // Initialize empty selections for each group
              const initialState: SelectedOptions = {};
              transformed.option_groups.forEach((group) => {
                initialState[group.id] = [];
              });
              setSelectedOptions(initialState);
            }
            // Initialize customizations from cart item
            if (
              cartItem?.selected_customizations &&
              typeof cartItem.selected_customizations === "object"
            ) {
              setSelectedCustomizations(cartItem.selected_customizations);
            } else if (transformed.customizations) {
              // Initialize empty selections for each customization type
              setSelectedCustomizations({ ...EMPTY_CUSTOMIZATIONS });
            }
          }
        })
        .catch((error: unknown) => {
          console.error("Error fetching product:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, cartItem?.id, product]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProduct(null);
      setSelectedSizeId(cartItem?.size_id || null);
      setSelectedIngredientIds((cartItem?.ingredients as (string | number)[]) || []);
      if (cartItem?.selected_options && typeof cartItem.selected_options === "object") {
        setSelectedOptions(cartItem.selected_options);
      } else {
        setSelectedOptions({});
      }
      if (
        cartItem?.selected_customizations &&
        typeof cartItem.selected_customizations === "object"
      ) {
        setSelectedCustomizations(cartItem.selected_customizations);
      } else {
        setSelectedCustomizations({ ...EMPTY_CUSTOMIZATIONS });
      }
    }
  }, [isOpen, cartItem]);

  // Calculate final price
  const finalPrice = useMemo(() => {
    if (!product) return cartItem?.final_price || cartItem?.price || 0;

    let price = product.base_price || product.price || 0;

    // Legacy: If a size is selected, add its price to the base price
    if (selectedSizeId && product.sizes && !product.has_option_groups) {
      const selectedSize = product.sizes.find((s) => s.id === selectedSizeId);
      if (selectedSize) {
        price += Number(selectedSize.price || 0);
      }
    }

    // Legacy: Add ingredients prices
    if (selectedIngredientIds.length > 0 && product.ingredients && !product.has_option_groups) {
      selectedIngredientIds.forEach((ingredientId) => {
        const ingredient = product.ingredients.find((ing) => ing.id === ingredientId);
        if (ingredient) {
          price += Number(ingredient.price || 0);
        }
      });
    }

    // New: Add option groups price deltas
    if (product.option_groups && Array.isArray(product.option_groups)) {
      product.option_groups.forEach((group) => {
        const selectedItemIds = selectedOptions[group.id] || [];
        selectedItemIds.forEach((itemId) => {
          const item = group.items.find((i) => i.id === itemId);
          if (item) {
            price += Number(item.price_delta || 0);
          }
        });
      });
    }

    // Customizations: Add prices for selected customizations
    if (product.customizations) {
      const customizationTypes = ["allergens", "drinks", "toppings", "sauces"] as const;
      customizationTypes.forEach((type) => {
        const group = product.customizations?.[type];
        if (group && Array.isArray(group.available)) {
          const selectedIds = selectedCustomizations[type] || [];
          selectedIds.forEach((itemId) => {
            const item = group.available.find((i) => i.id === itemId);
            if (item && !item.is_free) {
              price += Number(item.final_price || item.price || 0);
            }
          });
        }
      });
    }

    return price;
  }, [product, selectedSizeId, selectedIngredientIds, selectedOptions, selectedCustomizations, cartItem]);

  // Handle size change
  const handleSizeChange = useCallback((sizeId: string | number | null) => {
    setSelectedSizeId(sizeId);
  }, []);

  // Handle ingredient toggle
  const handleIngredientToggle = useCallback((ingredientId: string | number) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId]
    );
  }, []);

  // Validate selections
  const isValid = useMemo(() => {
    if (!product) return false;

    // Legacy: Check if size is required but not selected
    if (product.has_sizes && !product.has_option_groups && !selectedSizeId) {
      return false;
    }

    // Check option groups requirements
    if (product.option_groups && Array.isArray(product.option_groups)) {
      for (const group of product.option_groups) {
        if (group.is_required) {
          const selectedItemIds = selectedOptions[group.id] || [];
          const minSelection = Number(group.min_selection || 0);
          if (selectedItemIds.length < minSelection) {
            return false;
          }
        }
      }
    }

    // Check customizations min_selection requirements
    if (product.customizations) {
      const customizationTypes = ["allergens", "drinks", "toppings", "sauces"] as const;
      for (const type of customizationTypes) {
        const group = product.customizations[type];
        if (group && group.min_selection > 0) {
          const selectedIds = selectedCustomizations[type] || [];
          if (selectedIds.length < group.min_selection) {
            return false;
          }
        }
      }
    }

    return true;
  }, [product, selectedSizeId, selectedOptions, selectedCustomizations]);

  // Handle option group change
  const handleOptionGroupChange = useCallback((groupId: string | number, selectedItemIds: (string | number)[]) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: selectedItemIds,
    }));
  }, []);

  // Handle customization change
  const handleCustomizationChange = useCallback(
    (type: keyof SelectedCustomizations, selectedItemIds: (string | number)[]) => {
      setSelectedCustomizations((prev) => ({
        ...prev,
        [type]: selectedItemIds,
      }));
    },
    []
  );

  // Handle save
  const handleSave = useCallback(() => {
    if (!product || !isValid) return;

    // Get selected size and ingredients data (legacy)
    const selectedSize = product.sizes?.find((s) => s.id === selectedSizeId) || null;
    const selectedIngredients =
      product.ingredients?.filter((ing) => selectedIngredientIds.includes(ing.id)) || [];

    // Prepare updates
    const updates: Partial<CartItem> = {
      size_id: selectedSizeId,
      size_name: selectedSize?.name || null,
      ingredients: selectedIngredientIds,
      ingredients_data: selectedIngredients,
      selected_options: selectedOptions, // New: option groups selections
      selected_customizations: selectedCustomizations, // New: customizations selections
      final_price: finalPrice,
      price: finalPrice, // Update price as well
      image: product.image || cartItem?.image || null, // Preserve image from product or cart item
    };

    if (onSave) {
      onSave(updates);
    }

    onClose();
  }, [product, selectedSizeId, selectedIngredientIds, selectedOptions, selectedCustomizations, finalPrice, isValid, cartItem, onSave, onClose]);

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
          className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md"
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
            className="relative w-full max-w-4xl xl:max-w-5xl bg-linear-to-br from-bgimg/98 via-bgimg/95 to-bgimg/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "90vh",
              maxWidth: "90vw",
              margin: "auto",
              position: "relative",
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 shrink-0 bg-linear-to-r from-bgimg/95 via-bgimg/90 to-bgimg/95 backdrop-blur-sm relative z-10">
            <h2 className="text-white text-lg sm:text-xl md:text-2xl font-black truncate pr-4 drop-shadow-lg">
              Edit Item: <span className="text-theme3">{cartItem?.name || "Product"}</span>
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 shrink-0 shadow-lg hover:shadow-xl hover:scale-110"
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
                {/* New Option Groups System */}
                {product.has_option_groups && product.option_groups && (
                  <div className="option-groups">
                    {product.option_groups
                      .slice()
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((group) => (
                        <OptionGroup
                          key={group.id}
                          group={group}
                          selectedItemIds={selectedOptions[group.id] || []}
                          onSelectionChange={(itemIds: (string | number)[]) => handleOptionGroupChange(group.id, itemIds)}
                        />
                      ))}
                  </div>
                )}

                {/* Legacy Sizes Section (for backward compatibility) */}
                {product.has_sizes && !product.has_option_groups && (
                  <ProductSizes
                    sizes={product.sizes || []}
                    selectedSizeId={selectedSizeId}
                    onSizeChange={handleSizeChange}
                  />
                )}

                {/* Legacy Ingredients Section (for backward compatibility) */}
                {product.has_ingredients && !product.has_option_groups && (
                  <ProductIngredients
                    ingredients={product.ingredients || []}
                    selectedIngredientIds={selectedIngredientIds}
                    onIngredientToggle={handleIngredientToggle}
                  />
                )}

                {/* Customizations Section (allergens, drinks, toppings, sauces) */}
                {product.has_customizations && product.customizations && (
                  <div className="customizations">
                    {product.customizations.allergens && (
                      <CustomizationGroup
                        group={product.customizations.allergens}
                        groupName="allergens"
                        selectedItemIds={selectedCustomizations?.allergens || []}
                        onSelectionChange={(itemIds: (string | number)[]) => handleCustomizationChange("allergens", itemIds)}
                      />
                    )}
                    {product.customizations.drinks && (
                      <CustomizationGroup
                        group={product.customizations.drinks}
                        groupName="drinks"
                        selectedItemIds={selectedCustomizations?.drinks || []}
                        onSelectionChange={(itemIds: (string | number)[]) => handleCustomizationChange("drinks", itemIds)}
                      />
                    )}
                    {product.customizations.toppings && (
                      <CustomizationGroup
                        group={product.customizations.toppings}
                        groupName="toppings"
                        selectedItemIds={selectedCustomizations?.toppings || []}
                        onSelectionChange={(itemIds: (string | number)[]) => handleCustomizationChange("toppings", itemIds)}
                      />
                    )}
                    {product.customizations.sauces && (
                      <CustomizationGroup
                        group={product.customizations.sauces}
                        groupName="sauces"
                        selectedItemIds={selectedCustomizations?.sauces || []}
                        onSelectionChange={(itemIds: (string | number)[]) => handleCustomizationChange("sauces", itemIds)}
                      />
                    )}
                  </div>
                )}

                {/* Validation Message */}
                {!isValid && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm font-medium">
                      Please select all required options
                    </p>
                  </div>
                )}

                {/* Price Summary */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-4 bg-theme3/10 rounded-xl border border-theme3/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white  text-base font-semibold">
                      Total Price:
                    </span>
                    <span className="text-theme3  text-2xl font-black">
                      {formatCurrency(finalPrice)}
                    </span>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text text-base">Failed to load product data</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-transparent border-2 border-white/20 text-white rounded-xl hover:border-white/40 transition-colors font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !product || !isValid}
              className="w-full sm:w-auto px-6 py-3 bg-theme3 text-white rounded-xl hover:bg-theme transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Save Changes
            </button>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
