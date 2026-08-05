"use client";
import { memo, useState, type MouseEvent } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import { formatCurrency } from "../../../lib/utils/formatters";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import OptimizedImage from "../../ui/OptimizedImage";
import { IMAGE_PATHS } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import api from "../../../api";
import useToastStore from "../../../store/toastStore";
import { useAddToCart } from "../../../hooks/useAddToCart";
import { transformMenuItemToProduct, type RawMenuItem, type RawOptionGroup } from "../../../lib/utils/productTransform";
import { calculateProductPriceWithCustomizations, type SelectedCustomizationsMap } from "../../../lib/utils/productPrice";

export interface OrderCardItem {
  id?: string | number;
  name?: string;
  image?: string;
  price?: number;
  quantity?: number;
  size?: { name?: string } | string;
  size_name?: string;
  selected_ingredients?: unknown[] | unknown;
  selected_options?: { option_group_id?: number; option_item_ids?: number[] }[];
  selected_drinks?: unknown[] | unknown;
  selected_toppings?: unknown[] | unknown;
  selected_sauces?: unknown[] | unknown;
  selected_allergens?: unknown[] | unknown;
  [key: string]: unknown;
}

export interface OrderCardOrderItemRaw {
  menu_item_id: number;
  size_id?: number | null;
  selected_ingredients?: unknown;
  selected_options?: { option_group_id?: number; option_item_ids?: number[] }[];
  selected_drinks?: unknown;
  selected_toppings?: unknown;
  selected_sauces?: unknown;
  selected_allergens?: unknown;
  [key: string]: unknown;
}

export interface OrderCardOrder {
  id?: string | number;
  orderNumber?: string;
  date?: string;
  total?: number;
  status?: string;
  paymentMethod?: string;
  items?: OrderCardItem[];
  order_items?: OrderCardOrderItemRaw[];
  [key: string]: unknown;
}

interface OrderCardProps {
  order: OrderCardOrder;
}

const OrderCard = memo(function OrderCard({ order }: OrderCardProps) {
  const { push } = useLocalizedRouter();
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const addToCartHook = useAddToCart();
  const [isReorderLoading, setIsReorderLoading] = useState(false);

  const handleCardClick = () => {
    push(`/orders/${order.id}`, { scroll: true });
  };

  /**
   * Helper function to check if item has any customizations
   */
  const hasCustomizations = (item: OrderCardOrderItemRaw & Record<string, unknown>) => {
    return (
      (Array.isArray(item.selected_drinks) && item.selected_drinks.length > 0) ||
      (Array.isArray(item.selected_toppings) && item.selected_toppings.length > 0) ||
      (Array.isArray(item.selected_sauces) && item.selected_sauces.length > 0) ||
      (Array.isArray(item.selected_allergens) && item.selected_allergens.length > 0)
    );
  };

  const handleReorder = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent card click

    if (!order?.id) {
      toastError(t(lang, "invalid_order"));
      return;
    }

    // Check if order is finished (delivered/completed/cancelled)
    const status = order?.status?.toLowerCase();
    if (status !== 'delivered' && status !== 'completed' && status !== 'cancelled') {
      toastError(t(lang, "can_only_reorder_delivered_orders") || "You can only reorder finished orders");
      return;
    }

    setIsReorderLoading(true);
    try {
      // Call reorder API endpoint
      const response = await api.orders.reorderOrder(order.id);

      if (!response?.success || !response?.data) {
        toastError(response?.message || t(lang, "failed_to_reorder"));
        setIsReorderLoading(false);
        return;
      }

      // Extract items and missing_items from response
      const responseData = response.data as { items?: OrderCardOrderItemRaw[]; missing_items?: unknown[] };
      const { items = [], missing_items = [] } = responseData;

      // Get order items for fallback data (if reorder API doesn't include all customization data)
      const orderItemsMap = new Map<number, OrderCardOrderItemRaw>();
      if (order?.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((orderItem) => {
          orderItemsMap.set(orderItem.menu_item_id, orderItem);
        });
      }

      // Handle missing items warning
      if (missing_items && missing_items.length > 0) {
        const missingText = missing_items.length === 1 ? t(lang, "item") : t(lang, "items");
        toastError(`${missing_items.length} ${missingText} ${t(lang, "no_longer_available") || "are no longer available"}`);
      }

      // Check if there are any items to add
      if (!items || items.length === 0) {
        toastError(t(lang, "no_items_to_add"));
        setIsReorderLoading(false);
        return;
      }

      // Add each item to cart
      let addedCount = 0;
      let failedCount = 0;

      for (const item of items) {
        try {
          // Get fallback data from order.order_items if available
          const fallbackOrderItem = orderItemsMap.get(item.menu_item_id);

          // Fetch menu item details
          const menuItemResponse = await api.menu.getMenuItemById(item.menu_item_id);

          if (!menuItemResponse?.success || !menuItemResponse?.data) {
            console.error(`Failed to fetch menu item ${item.menu_item_id}`);
            failedCount++;
            continue;
          }

          // Extract menu item data, option_groups, and customizations
          const menuData = menuItemResponse.data as Record<string, unknown>;
          const menuItemData = menuData.item || menuData;
          const optionGroups = (menuData.option_groups as unknown[]) || [];
          const customizations = menuData.customizations || null;

          if (!menuItemData) {
            console.error(`Menu item data not found for ID ${item.menu_item_id}`);
            failedCount++;
            continue;
          }

          // Transform menu item to product object
          const product = transformMenuItemToProduct(
            { id: 0, ...(menuItemData as Record<string, unknown>) } as unknown as RawMenuItem,
            optionGroups as RawOptionGroup[],
            lang,
            customizations as any
          );

          if (!product) {
            console.error(`Failed to transform product ${item.menu_item_id}`);
            failedCount++;
            continue;
          }

          // Handle selected_ingredients (use from item or fallback)
          const ingredientIds = Array.isArray(item.selected_ingredients)
            ? item.selected_ingredients
            : (item.selected_ingredients ? [item.selected_ingredients] :
               (fallbackOrderItem?.selected_ingredients
                 ? (Array.isArray(fallbackOrderItem.selected_ingredients)
                    ? fallbackOrderItem.selected_ingredients
                    : [fallbackOrderItem.selected_ingredients])
                 : []));

          // Handle selected_options (use from item or fallback)
          let selectedOptions: Record<number, number[]> | null = null;
          if (item.selected_options && Array.isArray(item.selected_options) && item.selected_options.length > 0) {
            // Convert from API format to frontend format
            selectedOptions = {};
            item.selected_options.forEach((option) => {
              if (option.option_group_id && Array.isArray(option.option_item_ids)) {
                (selectedOptions as Record<number, number[]>)[option.option_group_id] = option.option_item_ids;
              }
            });
          } else if (fallbackOrderItem?.selected_options && Array.isArray(fallbackOrderItem.selected_options) && fallbackOrderItem.selected_options.length > 0) {
            // Use fallback data
            selectedOptions = {};
            fallbackOrderItem.selected_options.forEach((option) => {
              if (option.option_group_id && Array.isArray(option.option_item_ids)) {
                (selectedOptions as Record<number, number[]>)[option.option_group_id] = option.option_item_ids;
              }
            });
          }

          // Handle selected_customizations (use from item or fallback)
          let selectedCustomizations: SelectedCustomizationsMap | null = null;
          if (hasCustomizations(item)) {
            selectedCustomizations = {
              allergens: (Array.isArray(item.selected_allergens)
                ? item.selected_allergens
                : (item.selected_allergens ? [item.selected_allergens] : [])) as number[],
              drinks: (Array.isArray(item.selected_drinks)
                ? item.selected_drinks
                : (item.selected_drinks ? [item.selected_drinks] : [])) as number[],
              toppings: (Array.isArray(item.selected_toppings)
                ? item.selected_toppings
                : (item.selected_toppings ? [item.selected_toppings] : [])) as number[],
              sauces: (Array.isArray(item.selected_sauces)
                ? item.selected_sauces
                : (item.selected_sauces ? [item.selected_sauces] : [])) as number[]
            };
          } else if (fallbackOrderItem) {
            // Use fallback data from order.order_items
            selectedCustomizations = {
              allergens: (Array.isArray(fallbackOrderItem.selected_allergens)
                ? fallbackOrderItem.selected_allergens
                : (fallbackOrderItem.selected_allergens ? [fallbackOrderItem.selected_allergens] : [])) as number[],
              drinks: (Array.isArray(fallbackOrderItem.selected_drinks)
                ? fallbackOrderItem.selected_drinks
                : (fallbackOrderItem.selected_drinks ? [fallbackOrderItem.selected_drinks] : [])) as number[],
              toppings: (Array.isArray(fallbackOrderItem.selected_toppings)
                ? fallbackOrderItem.selected_toppings
                : (fallbackOrderItem.selected_toppings ? [fallbackOrderItem.selected_toppings] : [])) as number[],
              sauces: (Array.isArray(fallbackOrderItem.selected_sauces)
                ? fallbackOrderItem.selected_sauces
                : (fallbackOrderItem.selected_sauces ? [fallbackOrderItem.selected_sauces] : [])) as number[]
          };
          }

          // Calculate final price with all customizations
          const finalPrice = calculateProductPriceWithCustomizations(
            product,
            item.size_id || null,
            ingredientIds,
            selectedOptions,
            selectedCustomizations
          );

          // Build customization object
          const customization = {
            sizeId: item.size_id || null,
            ingredientIds: ingredientIds as (string | number)[],
            selectedOptions: selectedOptions,
            selectedCustomizations: selectedCustomizations,
            finalPrice: finalPrice,
            isValid: true, // Assume valid since it was in a previous order
          };

          // Add to cart using the hook (which handles quantity internally)
          addToCartHook(product, customization as any, (item.quantity as number) || 1);
          addedCount++;
        } catch (error) {
          console.error(`Error adding item ${item.menu_item_id} to cart:`, error);
          failedCount++;
        }
      }

      // Show success/error messages
      if (addedCount > 0) {
        const itemText = addedCount === 1 ? t(lang, "item") : t(lang, "items");
        toastSuccess(`${addedCount} ${itemText} ${t(lang, "added_to_cart")}`);
      }
      if (failedCount > 0) {
        const itemText = failedCount === 1 ? t(lang, "item") : t(lang, "items");
        toastError(`${failedCount} ${itemText} ${t(lang, "failed_add_cart")}`);
      }
      if (addedCount === 0 && failedCount === 0) {
        toastError(t(lang, "no_items_to_add"));
      }
    } catch (error) {
      const err = error as { message?: string };
      console.error("Reorder error:", error);
      toastError(err?.message || t(lang, "failed_to_reorder"));
    } finally {
      setIsReorderLoading(false);
    }
  };

  // Helper function to check if order is finished (delivered/completed/cancelled)
  const isOrderDelivered = (order: OrderCardOrder) => {
    const status = order?.status?.toLowerCase();
    return status === 'delivered' || status === 'completed' || status === 'cancelled';
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500/20 text-green-300';
      case 'confirmed':
      case 'preparing':
      case 'ready':
      case 'out_for_delivery':
        return 'bg-blue-500/20 text-blue-300';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300';
      case 'pending':
      default:
        return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-theme3/50 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <p className="text-white  font-bold text-lg mb-1">
            {order.orderNumber || `${t(lang, "order_number")}${String(order.id || '').slice(-8).toUpperCase()}`}
          </p>
          <p className="text-text text-sm">
            {order.date ? new Date(order.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) : t(lang, "date_not_available")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-theme3  font-black text-xl mb-1">
            {formatCurrency(order.total || 0)}
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}
          >
            {order.status?.replace('_', ' ') || 'pending'}
          </span>
        </div>
      </div>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <div className="space-y-2 mb-4 pt-4 border-t border-white/10">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-3 text-sm">
              <div
                className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0"
                onMouseEnter={() => item.id && prefetchRoute(`/shop/${item.id}`)}
              >
                <OptimizedImage
                  src={item.image || IMAGE_PATHS.placeholder}
                  alt={item.name || 'Item'}
                  fill
                  className="object-cover"
                  quality={85}
                  loading="lazy"
                  sizes="48px"
                />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{item.name || 'Unknown Item'}</p>
                <div className="text-text text-xs space-y-0.5">
                  {(item.size || item.size_name) && (
                    <p>{t(lang, "size")}: {(typeof item.size === 'object' ? item.size?.name : item.size) || item.size_name}</p>
                  )}
                  {Array.isArray(item.selected_ingredients) && item.selected_ingredients.length > 0 && (
                    <p>{t(lang, "add_ons")}: {item.selected_ingredients.length} {t(lang, "items")}</p>
                  )}
                  {item.selected_options && Array.isArray(item.selected_options) && item.selected_options.length > 0 && (
                    <p>{t(lang, "options")}: {item.selected_options.reduce((sum, opt) => sum + (Array.isArray(opt.option_item_ids) ? opt.option_item_ids.length : 0), 0)} {t(lang, "items")}</p>
                  )}
                  {Boolean(item.selected_drinks || item.selected_toppings || item.selected_sauces || item.selected_allergens) && (
                    <p>
                      {[
                        Array.isArray(item.selected_drinks) && item.selected_drinks.length > 0 && `${t(lang, "drinks")}: ${item.selected_drinks.length}`,
                        Array.isArray(item.selected_toppings) && item.selected_toppings.length > 0 && `${t(lang, "toppings")}: ${item.selected_toppings.length}`,
                        Array.isArray(item.selected_sauces) && item.selected_sauces.length > 0 && `${t(lang, "sauces")}: ${item.selected_sauces.length}`,
                        Array.isArray(item.selected_allergens) && item.selected_allergens.length > 0 && `${t(lang, "allergens")}: ${item.selected_allergens.length}`
                      ].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <p>
                  {t(lang, "quantity")}: {item.quantity || 1} × {formatCurrency(item.price || 0)}
                </p>
                </div>
              </div>
              <p className="text-theme3 font-bold">
                {formatCurrency((item.price || 0) * (item.quantity || 1))}
              </p>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-text text-xs text-center pt-2">
              +{order.items.length - 3} {t(lang, "more_items")}
            </p>
          )}
        </div>
      )}

      {/* Payment Method and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/10">
        <p className="text-text text-sm">
          {t(lang, "payment")}{" "}
          <span className="text-white font-medium capitalize">
            {order.paymentMethod}
          </span>
        </p>
        <div className="flex items-center gap-3">
          {/* Reorder Button - Only show for delivered/completed orders */}
          {isOrderDelivered(order) && (
            <button
              onClick={handleReorder}
              disabled={isReorderLoading}
              className="flex items-center gap-2 px-4 py-2 bg-theme3/20 hover:bg-theme3/30 border border-theme3/50 rounded-lg text-theme3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={t(lang, "reorder")}
            >
              {isReorderLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>{t(lang, "reorder")}</span>
            </button>
          )}

          {/* View Details Link */}
          <div className="flex items-center gap-2 text-theme3 group-hover:text-theme text-sm font-medium transition-colors cursor-pointer" onClick={handleCardClick}>
          <span>{t(lang, "view_details")}</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      </div>
    </div>
  );
});

OrderCard.displayName = "OrderCard";

export default OrderCard;
