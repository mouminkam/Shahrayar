"use client";
import { useState, useCallback, useEffect, useMemo } from "react";

type ProductLike = Record<string, any> | null | undefined;

export interface SelectedCustomizations {
  allergens: (string | number)[];
  drinks: (string | number)[];
  toppings: (string | number)[];
  sauces: (string | number)[];
}

export interface MissingRequiredGroup {
  id: string | number;
  name: string;
  minSelection: number;
  currentSelection: number;
}

export interface CustomizationChange {
  sizeId: string | number | null;
  ingredientIds: (string | number)[];
  selectedOptions: Record<string, (string | number)[]>;
  selectedCustomizations: SelectedCustomizations;
  finalPrice: number;
  isValid: boolean;
  missingRequiredGroups: MissingRequiredGroup[];
}

const CUSTOMIZATION_TYPES: (keyof SelectedCustomizations)[] = ["allergens", "drinks", "toppings", "sauces"];
const CUSTOMIZATION_TYPE_NAMES: Record<keyof SelectedCustomizations, string> = {
  allergens: "Allergens",
  drinks: "Drinks",
  toppings: "Toppings",
  sauces: "Sauces",
};

/** Manages option-group/size/ingredient/customization selection state for a product. */
export function useProductCustomization(product: ProductLike, onCustomizationChange?: (change: CustomizationChange) => void) {
  const [selectedSizeId, setSelectedSizeId] = useState<string | number | null>(null);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<(string | number)[]>([]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, (string | number)[]>>(() => {
    const initialState: Record<string, (string | number)[]> = {};
    if (product?.option_groups) {
      product.option_groups.forEach((group: any) => {
        initialState[group.id] = [];
      });
    }
    return initialState;
  });

  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomizations>({
    allergens: [],
    drinks: [],
    toppings: [],
    sauces: [],
  });

  const finalPrice = useMemo(() => {
    if (!product) return 0;

    let price = product.base_price || product.price || 0;

    if (selectedSizeId && product.sizes) {
      const selectedSize = product.sizes.find((s: any) => s.id === selectedSizeId);
      if (selectedSize) {
        price += parseFloat(selectedSize.price || 0);
      }
    }

    if (selectedIngredientIds.length > 0 && product.ingredients) {
      selectedIngredientIds.forEach((ingredientId) => {
        const ingredient = product.ingredients.find((ing: any) => ing.id === ingredientId);
        if (ingredient) {
          price += parseFloat(ingredient.price || 0);
        }
      });
    }

    if (product.option_groups && Array.isArray(product.option_groups)) {
      product.option_groups.forEach((group: any) => {
        const selectedItemIds = selectedOptions[group.id] || [];
        selectedItemIds.forEach((itemId) => {
          const item = group.items.find((i: any) => i.id === itemId);
          if (item) {
            price += parseFloat(item.price_delta || 0);
          }
        });
      });
    }

    if (product.customizations) {
      CUSTOMIZATION_TYPES.forEach((type) => {
        const group = product.customizations[type];
        if (group && Array.isArray(group.available)) {
          const selectedIds = selectedCustomizations[type] || [];
          selectedIds.forEach((itemId) => {
            const item = group.available.find((i: any) => i.id === itemId);
            if (item && !item.is_free) {
              price += parseFloat(item.final_price || item.price || 0);
            }
          });
        }
      });
    }

    return price;
  }, [product, selectedSizeId, selectedIngredientIds, selectedOptions, selectedCustomizations]);

  const isValid = useMemo(() => {
    if (!product) return false;

    if (product.option_groups && Array.isArray(product.option_groups) && product.option_groups.length > 0) {
      for (const group of product.option_groups) {
        if (group.is_required) {
          const selectedItemIds = selectedOptions[group.id] || [];
          const minSelection = parseInt(group.min_selection || 0, 10);
          const requiredMin = minSelection > 0 ? minSelection : 1;

          if (selectedItemIds.length < requiredMin) {
            return false;
          }
        }
      }
    }

    if (product.has_sizes && !selectedSizeId) {
      return false;
    }

    if (product.customizations) {
      for (const type of CUSTOMIZATION_TYPES) {
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

  const missingRequiredGroups = useMemo<MissingRequiredGroup[]>(() => {
    if (!product) return [];

    const missing: MissingRequiredGroup[] = [];

    if (product.option_groups && Array.isArray(product.option_groups) && product.option_groups.length > 0) {
      product.option_groups.forEach((group: any) => {
        if (group.is_required) {
          const selectedItemIds = selectedOptions[group.id] || [];
          const minSelection = parseInt(group.min_selection || 0, 10);
          const requiredMin = minSelection > 0 ? minSelection : 1;

          if (selectedItemIds.length < requiredMin) {
            missing.push({
              id: group.id,
              name: group.name,
              minSelection: requiredMin,
              currentSelection: selectedItemIds.length,
            });
          }
        }
      });
    }

    if (product.has_sizes && !selectedSizeId) {
      missing.push({ id: "size", name: "Size", minSelection: 1, currentSelection: 0 });
    }

    if (product.customizations) {
      CUSTOMIZATION_TYPES.forEach((type) => {
        const group = product.customizations[type];
        if (group && group.min_selection > 0) {
          const selectedIds = selectedCustomizations[type] || [];
          const minSelection = parseInt(group.min_selection || 0, 10);

          if (selectedIds.length < minSelection) {
            missing.push({
              id: type,
              name: CUSTOMIZATION_TYPE_NAMES[type] || type,
              minSelection,
              currentSelection: selectedIds.length,
            });
          }
        }
      });
    }

    return missing;
  }, [product, selectedSizeId, selectedOptions, selectedCustomizations]);

  useEffect(() => {
    if (onCustomizationChange) {
      onCustomizationChange({
        sizeId: selectedSizeId,
        ingredientIds: selectedIngredientIds,
        selectedOptions,
        selectedCustomizations,
        finalPrice,
        isValid,
        missingRequiredGroups,
      });
    }
  }, [
    selectedSizeId,
    selectedIngredientIds,
    selectedOptions,
    selectedCustomizations,
    finalPrice,
    isValid,
    missingRequiredGroups,
    onCustomizationChange,
  ]);

  const handleSizeChange = useCallback((sizeId: string | number | null) => {
    setSelectedSizeId(sizeId);
  }, []);

  const handleIngredientToggle = useCallback((ingredientId: string | number) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(ingredientId) ? prev.filter((id) => id !== ingredientId) : [...prev, ingredientId]
    );
  }, []);

  const handleOptionGroupChange = useCallback((groupId: string | number, selectedItemIds: (string | number)[]) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: selectedItemIds }));
  }, []);

  const handleCustomizationChange = useCallback(
    (type: keyof SelectedCustomizations, selectedItemIds: (string | number)[]) => {
      setSelectedCustomizations((prev) => ({ ...prev, [type]: selectedItemIds }));
    },
    []
  );

  return {
    selectedSizeId,
    selectedIngredientIds,
    handleSizeChange,
    handleIngredientToggle,
    selectedOptions,
    handleOptionGroupChange,
    selectedCustomizations,
    handleCustomizationChange,
    finalPrice,
    isValid,
    missingRequiredGroups,
  };
}
