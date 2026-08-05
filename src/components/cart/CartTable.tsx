"use client";
import { memo, useState } from "react";
import Link from "@/components/ui/LocalizedLink";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, Edit } from "lucide-react";
import useCartStore, { getCartItemKey } from "../../store/cartStore";
import { formatCurrency } from "../../lib/utils/formatters";
import { IMAGE_PATHS } from "../../data/constants";
import CartEditModal from "./CartEditModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import useToastStore from "../../store/toastStore";
import OptimizedImage from "../ui/OptimizedImage";
import { usePrefetchRoute } from "../../hooks/usePrefetchRoute";
import { hasAnyCustomization, getCustomizationDisplayText } from "../../lib/utils/cartHelpers";
import type { CartItem } from "@/types/shop";

interface ItemsTableProps {
  items: CartItem[];
  removeFromCart: (itemKey: string) => void;
  increaseQty: (itemKey: string) => void;
  decreaseQty: (itemKey: string) => void;
  onEditItem: (item: CartItem) => void;
  onDeleteItem: (itemKey: string, itemName: string) => void;
}

// Desktop Table View Component
const DesktopTable = memo(({ items, increaseQty, decreaseQty, onEditItem, onDeleteItem }: ItemsTableProps) => {
  const { prefetchRoute } = usePrefetchRoute();

  return (
  <div className="hidden lg:block overflow-x-auto mb-5">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b-2 border-white/10">
          <th className="text-left py-4 px-4  text-white font-bold">
            Product
          </th>
          <th className="text-center py-4 px-4  text-white font-bold">
            Price
          </th>
          <th className="text-center py-4 px-4  text-white font-bold">
            Quantity
          </th>
          <th className="text-center py-4 px-4  text-white font-bold">
            Subtotal
          </th>
          <th className="text-center py-4 px-4  text-white font-bold w-12">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const itemKey = getCartItemKey(item);
          const itemPrice = item.final_price || item.price;
          const hasCustomization = hasAnyCustomization(item as any);
          const customizationParts = getCustomizationDisplayText(item as any);

          return (
            <motion.tr
              key={itemKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-b border-white/10 transition-colors duration-300 hover:bg-white/5"
            >
              <td className="py-6 px-4">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/shop/${item.id}`}
                    className="shrink-0 group"
                    onMouseEnter={() => prefetchRoute(`/shop/${item.id}`)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-300"
                    >
                      <OptimizedImage
                        src={item.image || IMAGE_PATHS.placeholder}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        quality={85}
                        loading="lazy"
                        sizes="80px"
                      />
                    </motion.div>
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/shop/${item.id}`}
                      onMouseEnter={() => prefetchRoute(`/shop/${item.id}`)}
                      className="text-white  text-lg font-bold hover:text-theme transition-colors duration-300 block mb-1"
                    >
                      {item.name}
                    </Link>
                    {hasCustomization && (
                      <div className="text-text/70 text-xs space-y-1">
                        {customizationParts.size && (
                          <div className="flex items-center gap-1">
                            <span className="text-theme3">Size:</span>
                            <span>{customizationParts.size}</span>
                          </div>
                        )}
                        {customizationParts.ingredients && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-theme3">Add-ons:</span>
                            <span>{customizationParts.ingredients}</span>
                          </div>
                        )}
                        {customizationParts.options && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-theme3">Options:</span>
                            <span>{customizationParts.options}</span>
                          </div>
                        )}
                        {customizationParts.customizations && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-theme3">Customizations:</span>
                            <span>{customizationParts.customizations}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="text-center py-6 px-4">
                <span className="text-theme  font-bold text-lg">
                  {formatCurrency(itemPrice)}
                </span>
              </td>
              <td className="text-center py-6 px-4">
                <div className="flex items-center justify-center gap-3">
                  <motion.button
                    onClick={() => decreaseQty(itemKey)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-theme text-white rounded-lg transition-all duration-300 border border-white/20 hover:border-theme"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-white  font-semibold text-base min-w-8">
                    {item.quantity}
                  </span>
                  <motion.button
                    onClick={() => increaseQty(itemKey)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-theme text-white rounded-lg transition-all duration-300 border border-white/20 hover:border-theme"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </td>
              <td className="text-center py-6 px-4">
                <span className="text-theme3  font-bold text-lg">
                  {formatCurrency(itemPrice * item.quantity)}
                </span>
              </td>
              <td className="text-center py-6 px-4">
                <div className="flex items-center justify-center gap-2">
                  {onEditItem && (
                    <motion.button
                      onClick={() => onEditItem(item)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-theme3 hover:bg-theme3/10 rounded-lg transition-all duration-300"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => onDeleteItem(String(itemKey), item.name || "")}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          );
        })}
      </tbody>
    </table>
  </div>
  );
});

DesktopTable.displayName = "DesktopTable";

// Mobile Card View Component
const MobileCardView = memo(({ items, increaseQty, decreaseQty, onEditItem, onDeleteItem }: ItemsTableProps) => {
  const { prefetchRoute } = usePrefetchRoute();

  return (
  <div className="lg:hidden space-y-4 mb-8">
    {items.map((item, index) => {
      const itemKey = getCartItemKey(item);
      const itemPrice = item.final_price || item.price;
      const hasCustomization = hasAnyCustomization(item as any);
      const customizationParts = getCustomizationDisplayText(item as any);

      return (
        <motion.div
          key={itemKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="cart-item-card relative bg-linear-to-br from-white/10 via-bgimg/50 to-bgimg/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20 hover:border-theme3/50 hover:shadow-2xl transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Image */}
            <Link
              href={`/shop/${item.id}`}
              className="shrink-0 group"
              onMouseEnter={() => prefetchRoute(`/shop/${item.id}`)}
            >
              <div className="relative w-full sm:w-24 h-24 sm:h-24 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <OptimizedImage
                  src={item.image || IMAGE_PATHS.placeholder}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  quality={85}
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 96px"
                />
              </div>
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/shop/${item.id}`}
                onMouseEnter={() => prefetchRoute(`/shop/${item.id}`)}
                className="text-white  text-lg font-bold hover:text-theme transition-colors duration-300 block mb-2"
              >
                {item.name}
              </Link>
              {hasCustomization && (
                <div className="text-text/70 text-xs space-y-1 mb-2">
                  {customizationParts.size && (
                    <div className="flex items-center gap-1">
                      <span className="text-theme3">Size:</span>
                      <span>{customizationParts.size}</span>
                    </div>
                  )}
                  {customizationParts.ingredients && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-theme3">Add-ons:</span>
                      <span>{customizationParts.ingredients}</span>
                    </div>
                  )}
                  {customizationParts.options && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-theme3">Options:</span>
                      <span>{customizationParts.options}</span>
                    </div>
                  )}
                  {customizationParts.customizations && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-theme3">Customizations:</span>
                      <span>{customizationParts.customizations}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="text-theme  font-bold text-base mb-3">
                {formatCurrency(itemPrice)}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => decreaseQty(itemKey)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-theme text-white rounded-lg transition-all duration-300 border border-white/20 hover:border-theme"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-white  font-semibold text-base min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <motion.button
                    onClick={() => increaseQty(itemKey)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-theme text-white rounded-lg transition-all duration-300 border border-white/20 hover:border-theme"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="text-right">
                  <div className="text-theme3  font-bold text-lg">
                    {formatCurrency(itemPrice * item.quantity)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onEditItem && (
                  <motion.button
                    onClick={() => onEditItem(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-transparent border-2 border-theme3 text-theme3 text-sm font-semibold rounded-xl hover:bg-theme3 hover:text-white transition-all duration-300"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                )}
                <motion.button
                  onClick={() => onDeleteItem(String(itemKey), item.name || "")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-transparent border-2 border-red-500/50 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 transition-all duration-300"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
  );
});

MobileCardView.displayName = "MobileCardView";

const CartTable = memo(() => {
  const { items, removeFromCart, increaseQty, decreaseQty, updateCartItem } = useCartStore();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ key: string; name: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveEdit = (updates: Partial<CartItem>) => {
    if (!editingItem) return;

    const itemKey = getCartItemKey(editingItem);
    const success = updateCartItem(itemKey, updates);

    if (success) {
      toastSuccess("Item updated successfully");
      handleCloseModal();
    } else {
      toastError("Failed to update item");
    }
  };

  const handleDeleteClick = (itemKey: string, itemName: string) => {
    setDeletingItem({ key: itemKey, name: itemName });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      removeFromCart(deletingItem.key);
      toastSuccess("Item removed from cart");
      handleCloseDeleteModal();
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="empty-cart text-center py-16"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-24 h-24 bg-linear-to-br from-theme/20 to-theme3/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-theme3/30"
        >
          <Trash2 className="w-12 h-12 text-theme3" />
        </motion.div>
        <h3 className="text-white  text-2xl font-black mb-2">
          Your cart is empty
        </h3>
        <p className="text-text text-base mb-6">
          Start adding items to your cart!
        </p>
        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white  text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-theme3/40 border border-theme3/30"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="cart-table-wrapper">
        <DesktopTable
          items={items}
          removeFromCart={removeFromCart}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteClick}
        />
        <MobileCardView
          items={items}
          removeFromCart={removeFromCart}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteClick}
        />
      </div>

      {editingItem && (
        <CartEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          cartItem={editingItem}
          onSave={handleSaveEdit}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={deletingItem?.name}
      />
    </>
  );
});

CartTable.displayName = "CartTable";

export default CartTable;
