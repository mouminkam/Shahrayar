"use client";
import LocalizedLink from "../../ui/LocalizedLink";
import OptimizedImage from "../../ui/OptimizedImage";
import { X } from "lucide-react";
import { useRef, type Dispatch, type SetStateAction } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useCart } from "../../../hooks/useCart";
import type { CartItem } from "../../../store/cartStore";
import { formatCurrency } from "../../../lib/utils/formatters";
import { IMAGE_PATHS } from "../../../data/constants";
import { getCartItemKey } from "../../../store/cartStore";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { hasAnyCustomization, getCustomizationDisplayText } from "../../../lib/utils/cartHelpers";
import useAuthStore from "../../../store/authStore";
import useToastStore from "../../../store/toastStore";
import { useLocalizedRouter } from "../../../hooks/useLocalizedRouter";

interface CartDropdownProps {
  cartOpen: boolean;
  setCartOpen: Dispatch<SetStateAction<boolean>>;
  cartItems?: CartItem[];
}

export default function CartDropdown({
  cartOpen,
  setCartOpen,
}: CartDropdownProps) {
  const cartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items: cartItems, subtotal, removeFromCart } = useCart();
  const { lang } = useLanguage();
  const { isAuthenticated } = useAuthStore();
  const { error: toastError } = useToastStore();
  const { push } = useLocalizedRouter();

  const handleMouseEnter = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }
    setCartOpen(true);
  };

  const handleMouseLeave = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
    }
    cartTimeoutRef.current = setTimeout(() => {
      setCartOpen(false);
      cartTimeoutRef.current = null;
    }, 300);
  };

  // Animation variants
  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      }
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      }
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      }
    },
  };

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setCartOpen(false);

    if (!isAuthenticated) {
      toastError(t(lang, "please_login_before_checkout") || "Please login before checkout");
      push("/login");
    } else {
      push("/checkout");
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-full right-0 z-9999 w-72 md:w-80 bg-white shadow-2xl border border-gray-200 mt-4 p-4 md:p-6 rounded-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="flex justify-between items-center mb-4"
            >
              <h3 className="text-base md:text-lg font-medium text-gray-900">
                {t(lang, "shopping_cart")}
              </h3>
              <motion.button
                onClick={() => setCartOpen(false)}
                className="text-gray-400 hover:text-theme rounded-full p-1 shrink-0"
                aria-label="Close cart"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Cart Items */}
            <div
              className="space-y-3 md:space-y-4 mb-4 max-h-64 overflow-y-auto overflow-x-hidden pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_#f1f5f9]"
            >
              {cartItems.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-8 text-gray-500"
                >
                  <p>{t(lang, "cart_empty")}</p>
                </motion.div>
              ) : (
                cartItems.map((item, index) => {
                  const itemKey = getCartItemKey(item);
                  const itemPrice = item.final_price || item.price;
                  const hasCustomization = hasAnyCustomization(item as any);
                  const customizationParts = getCustomizationDisplayText(item as any);
                  const customizationText = [
                    customizationParts.size,
                    customizationParts.ingredients && `${customizationParts.ingredients.split(", ").length} ${t(lang, "add_ons")}`,
                    customizationParts.options,
                    customizationParts.customizations
                  ].filter(Boolean).join(" • ");

                  return (
                    <motion.div
                      key={itemKey}
                      variants={itemVariants}
                      custom={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 gap-2"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? (
                            <OptimizedImage
                              src={item.image || IMAGE_PATHS.placeholder}
                              alt={item.name || ""}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover rounded"
                              quality={85}
                              loading="lazy"
                              sizes="48px"
                            />
                          ) : (
                            <span className="text-xs text-gray-600">🍔</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          {hasCustomization && customizationText && (
                            <p className="text-xs text-gray-500 truncate">
                              {customizationText}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {item.quantity} x{" "}
                            <span className="text-theme3 font-semibold">
                              {formatCurrency(itemPrice)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => removeFromCart(itemKey)}
                        className="text-gray-400 hover:text-theme shrink-0 ml-2 rounded-full p-1 flex items-center justify-center"
                        aria-label={`Remove ${item.name} from cart`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Total and Buttons */}
            {cartItems.length > 0 && (
              <>
                <motion.div
                  variants={itemVariants}
                  className="flex justify-between items-center mb-4 pt-2 border-t border-gray-200"
                >
                  <span className="text-gray-600 font-medium">{t(lang, "total")}:</span>
                  <span className="text-lg font-semibold text-theme3">
                    {formatCurrency(subtotal)}
                  </span>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="space-y-2"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={handleCheckoutClick}
                      className="w-full bg-theme3 hover:bg-theme text-white py-3 px-4 transition-colors duration-300 text-sm font-medium block text-center rounded-md shadow-lg"
                    >
                      {t(lang, "checkout")}
                    </button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <LocalizedLink
                      href="/cart"
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 hover:bg-gray-50 transition-colors duration-300 text-sm font-medium block text-center rounded-md"
                      onClick={() => setCartOpen(false)}
                    >
                      {t(lang, "view_cart")}
                    </LocalizedLink>
                  </motion.div>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
