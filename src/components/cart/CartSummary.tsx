"use client";
import { memo, useMemo } from "react";
import Link from "@/components/ui/LocalizedLink";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import useCartStore from "../../store/cartStore";
import { formatCurrency } from "../../lib/utils/formatters";
import { TAX_AMOUNT } from "../../data/constants";
import type { CartItem } from "@/types/shop";

const CartSummary = memo(() => {
  const items: CartItem[] = useCartStore((state) => state.items);

  // Derived calculations - auto-recalculate when items change
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.final_price || item.price) * item.quantity, 0);
  }, [items]);

  const tax = useMemo(() => {
    return TAX_AMOUNT; // Fixed tax amount
  }, []);

  const total = useMemo(() => {
    return subtotal + tax;
  }, [subtotal, tax]);

  if (items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="cart-summary bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8 sticky top-8"
      style={{ zIndex: 10 }}
    >
      <h3 className="text-white  text-2xl font-black mb-6 uppercase">
        Cart Summary
      </h3>

      <div className="space-y-4 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center py-3 border-b border-white/10">
          <span className="text-text  text-base font-medium">
            Subtotal
          </span>
          <span className="text-white  text-lg font-bold">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center py-3 border-b border-white/10">
          <span className="text-text  text-base font-medium">
            Tax
          </span>
          <span className="text-white  text-lg font-bold">
            {formatCurrency(tax)}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-4 border-t-2 border-theme3/30 border-b-2 border-theme3/30">
          <span className="text-white  text-xl font-black uppercase">
            Total
          </span>
          <span className="text-theme3  text-2xl font-black">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/checkout"
          className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white py-4 px-6 transition-all duration-300 text-base  font-semibold uppercase block text-center rounded-xl shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Proceed to Checkout
        </Link>
      </motion.div>

      {/* Continue Shopping Link */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4"
      >
        <Link
          href="/shop"
          className="w-full border-2 border-white/20 hover:border-theme text-white py-3 px-6 hover:bg-theme/10 transition-all duration-300 text-base  font-medium block text-center rounded-xl"
        >
          Continue Shopping
        </Link>
      </motion.div>
    </motion.div>
  );
});

CartSummary.displayName = "CartSummary";

export default CartSummary;
