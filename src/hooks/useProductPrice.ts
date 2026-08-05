"use client";
import { useMemo } from "react";
import { calculateProductPrice } from "../lib/utils/productPrice";

/** Calculates and memoizes a product's final price based on selected size/ingredients. */
export function useProductPrice(
  product: unknown,
  selectedSizeId: number | null = null,
  selectedIngredientIds: number[] = []
): number {
  const finalPrice = useMemo(() => {
    return calculateProductPrice(product as any, selectedSizeId, selectedIngredientIds);
  }, [product, selectedSizeId, selectedIngredientIds]);

  return finalPrice;
}
