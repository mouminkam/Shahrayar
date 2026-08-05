"use client";
import { useMemo } from "react";
import useCartStore from "../store/cartStore";

/** Convenience hook exposing cart state plus derived subtotal/tax/total. */
export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const clearCart = useCartStore((state) => state.clearCart);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.final_price || item.price) * item.quantity, 0),
    [items]
  );

  const tax = useMemo(() => subtotal * 0.1, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  return {
    items,
    itemCount,
    subtotal,
    tax,
    total,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  };
};
