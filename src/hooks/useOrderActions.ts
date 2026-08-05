"use client";
import { useState } from "react";
import api from "../api";
import useToastStore from "../store/toastStore";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../locales/i18n/getTranslation";
import { useAddToCart } from "./useAddToCart";
import { transformMenuItemToProduct } from "../lib/utils/productTransform";
import { calculateProductPriceWithCustomizations } from "../lib/utils/productPrice";

/**
 * Order shape is intentionally loosely typed (Record-based) — the backend order
 * payload has many optional/nested fields with no shared OpenAPI schema to
 * derive an exact interface from; narrowing happens ad hoc at each read site
 * exactly as the original JS did.
 */
export type OrderRecord = Record<string, any> & { id?: string | number };

/** Cancel / reorder / track actions for a single order (order-detail page). */
export function useOrderActions(order: OrderRecord | null, orderId: string | number, refetchOrder?: () => void) {
  const { error: toastError, success: toastSuccess } = useToastStore();
  const { lang } = useLanguage();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isReorderLoading, setIsReorderLoading] = useState(false);
  const addToCartHook = useAddToCart();

  const canCancelOrder = (): boolean => {
    if (!order) {
      return false;
    }

    const status = order?.status?.toLowerCase();
    const paymentMethod = order?.payment_method?.toLowerCase();
    const paymentIntentId = order?.payment_intent_id;
    const paymentStatus = order?.payment_status?.toLowerCase();

    if (status === "completed" || status === "cancelled" || status === "delivered") {
      return false;
    }

    if (paymentMethod === "stripe" || paymentIntentId) {
      return false;
    }

    if (paymentStatus === "paid" && paymentMethod === "stripe") {
      return false;
    }

    if (paymentMethod === "cash" && status === "confirmed") {
      return false;
    }

    if (paymentMethod === "cash" && status === "pending") {
      return true;
    }

    if (paymentMethod === "cash" && status === "processing") {
      return true;
    }

    return false;
  };

  const handleCancelOrder = async (reason: string | null = null) => {
    const reasonToUse = reason || cancelReason;

    if (!reasonToUse || !reasonToUse.trim()) {
      toastError(t(lang, "please_provide_cancellation_reason"));
      return;
    }

    if (!canCancelOrder()) {
      const paymentMethod = order?.payment_method?.toLowerCase();
      const paymentIntentId = order?.payment_intent_id;
      const status = order?.status?.toLowerCase();

      if (paymentMethod === "stripe" || paymentIntentId) {
        toastError(t(lang, "cannot_cancel_paid_order"));
      } else if (paymentMethod === "cash" && status === "confirmed") {
        toastError(t(lang, "cannot_cancel_paid_order"));
      } else if (status === "completed" || status === "delivered") {
        toastError(t(lang, "cannot_cancel_completed_order"));
      } else {
        toastError(t(lang, "cannot_cancel_order"));
      }
      setShowCancelModal(false);
      setCancelReason("");
      return;
    }

    setIsCancelling(true);
    try {
      const response = await api.orders.cancelOrder(orderId, { reason: reasonToUse });

      if (response.success) {
        toastSuccess(t(lang, "order_cancelled_successfully"));
        setShowCancelModal(false);
        setCancelReason("");
        refetchOrder?.();
      } else {
        toastError(response.message || t(lang, "failed_to_cancel_order"));
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toastError(err?.response?.data?.message || err?.message || t(lang, "failed_to_cancel_order"));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleTrackOrder = () => {
    if (!order?.tracking_url) {
      toastError(t(lang, "tracking_not_available"));
      return;
    }

    window.open(order.tracking_url, "_blank", "noopener,noreferrer");
  };

  const hasCustomizations = (item: Record<string, any>): boolean => {
    return (
      (item.selected_drinks && Array.isArray(item.selected_drinks) && item.selected_drinks.length > 0) ||
      (item.selected_toppings && Array.isArray(item.selected_toppings) && item.selected_toppings.length > 0) ||
      (item.selected_sauces && Array.isArray(item.selected_sauces) && item.selected_sauces.length > 0) ||
      (item.selected_allergens && Array.isArray(item.selected_allergens) && item.selected_allergens.length > 0)
    );
  };

  /** Only allowed for delivered/completed/cancelled orders. */
  const handleReorder = async () => {
    if (!order?.id) {
      toastError(t(lang, "invalid_order"));
      return;
    }

    const status = order?.status?.toLowerCase();
    if (status !== "delivered" && status !== "completed" && status !== "cancelled") {
      toastError(t(lang, "can_only_reorder_delivered_orders") || "You can only reorder finished orders");
      return;
    }

    setIsReorderLoading(true);
    try {
      const response = await api.orders.reorderOrder(order.id);

      if (!response?.success || !response?.data) {
        toastError(response?.message || t(lang, "failed_to_reorder"));
        setIsReorderLoading(false);
        return;
      }

      const { items = [], missing_items = [] } = response.data as {
        items?: Record<string, any>[];
        missing_items?: unknown[];
      };

      const orderItemsMap = new Map<string | number, Record<string, any>>();
      if (order?.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((orderItem: Record<string, any>) => {
          orderItemsMap.set(orderItem.menu_item_id, orderItem);
        });
      }

      if (missing_items && missing_items.length > 0) {
        const missingText = missing_items.length === 1 ? t(lang, "item") : t(lang, "items");
        toastError(`${missing_items.length} ${missingText} ${t(lang, "no_longer_available") || "are no longer available"}`);
      }

      if (!items || items.length === 0) {
        toastError(t(lang, "no_items_to_add"));
        setIsReorderLoading(false);
        return;
      }

      let addedCount = 0;
      let failedCount = 0;

      for (const item of items) {
        try {
          const fallbackOrderItem = orderItemsMap.get(item.menu_item_id);

          const menuItemResponse = await api.menu.getMenuItemById(item.menu_item_id);

          if (!menuItemResponse?.success || !menuItemResponse?.data) {
            console.error(`Failed to fetch menu item ${item.menu_item_id}`);
            failedCount++;
            continue;
          }

          const responseData = menuItemResponse.data as Record<string, any>;
          const menuItemData = responseData.item || responseData;
          const optionGroups = responseData.option_groups || [];
          const customizations = responseData.customizations || null;

          if (!menuItemData) {
            console.error(`Menu item data not found for ID ${item.menu_item_id}`);
            failedCount++;
            continue;
          }

          const product = transformMenuItemToProduct(menuItemData, optionGroups, lang, customizations);

          if (!product) {
            console.error(`Failed to transform product ${item.menu_item_id}`);
            failedCount++;
            continue;
          }

          const ingredientIds = Array.isArray(item.selected_ingredients)
            ? item.selected_ingredients
            : item.selected_ingredients
              ? [item.selected_ingredients]
              : fallbackOrderItem?.selected_ingredients
                ? Array.isArray(fallbackOrderItem.selected_ingredients)
                  ? fallbackOrderItem.selected_ingredients
                  : [fallbackOrderItem.selected_ingredients]
                : [];

          let selectedOptions: Record<string, unknown[]> | null = null;
          if (item.selected_options && Array.isArray(item.selected_options) && item.selected_options.length > 0) {
            selectedOptions = {};
            item.selected_options.forEach((option: Record<string, any>) => {
              if (option.option_group_id && Array.isArray(option.option_item_ids)) {
                selectedOptions![option.option_group_id] = option.option_item_ids;
              }
            });
          } else if (
            fallbackOrderItem?.selected_options &&
            Array.isArray(fallbackOrderItem.selected_options) &&
            fallbackOrderItem.selected_options.length > 0
          ) {
            selectedOptions = {};
            fallbackOrderItem.selected_options.forEach((option: Record<string, any>) => {
              if (option.option_group_id && Array.isArray(option.option_item_ids)) {
                selectedOptions![option.option_group_id] = option.option_item_ids;
              }
            });
          }

          let selectedCustomizations: {
            allergens: unknown[];
            drinks: unknown[];
            toppings: unknown[];
            sauces: unknown[];
          } | null = null;
          if (hasCustomizations(item)) {
            selectedCustomizations = {
              allergens: Array.isArray(item.selected_allergens)
                ? item.selected_allergens
                : item.selected_allergens
                  ? [item.selected_allergens]
                  : [],
              drinks: Array.isArray(item.selected_drinks) ? item.selected_drinks : item.selected_drinks ? [item.selected_drinks] : [],
              toppings: Array.isArray(item.selected_toppings)
                ? item.selected_toppings
                : item.selected_toppings
                  ? [item.selected_toppings]
                  : [],
              sauces: Array.isArray(item.selected_sauces) ? item.selected_sauces : item.selected_sauces ? [item.selected_sauces] : [],
            };
          } else if (fallbackOrderItem) {
            selectedCustomizations = {
              allergens: Array.isArray(fallbackOrderItem.selected_allergens)
                ? fallbackOrderItem.selected_allergens
                : fallbackOrderItem.selected_allergens
                  ? [fallbackOrderItem.selected_allergens]
                  : [],
              drinks: Array.isArray(fallbackOrderItem.selected_drinks)
                ? fallbackOrderItem.selected_drinks
                : fallbackOrderItem.selected_drinks
                  ? [fallbackOrderItem.selected_drinks]
                  : [],
              toppings: Array.isArray(fallbackOrderItem.selected_toppings)
                ? fallbackOrderItem.selected_toppings
                : fallbackOrderItem.selected_toppings
                  ? [fallbackOrderItem.selected_toppings]
                  : [],
              sauces: Array.isArray(fallbackOrderItem.selected_sauces)
                ? fallbackOrderItem.selected_sauces
                : fallbackOrderItem.selected_sauces
                  ? [fallbackOrderItem.selected_sauces]
                  : [],
            };
          }

          const finalPrice = calculateProductPriceWithCustomizations(
            product,
            item.size_id || null,
            ingredientIds,
            selectedOptions as never,
            selectedCustomizations as never
          );

          const customization = {
            sizeId: item.size_id || null,
            ingredientIds,
            selectedOptions,
            selectedCustomizations,
            finalPrice,
            isValid: true,
          };

          addToCartHook(product as Record<string, any>, customization, item.quantity || 1);
          addedCount++;
        } catch (error) {
          console.error(`Error adding item ${item.menu_item_id} to cart:`, error);
          failedCount++;
        }
      }

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
      console.error("Reorder error:", error);
      toastError((error as Error)?.message || t(lang, "failed_to_reorder"));
    } finally {
      setIsReorderLoading(false);
    }
  };

  return {
    canCancelOrder,
    handleCancelOrder,
    handleReorder,
    handleTrackOrder,
    isCancelling,
    isReorderLoading,
    showCancelModal,
    setShowCancelModal,
    cancelReason,
    setCancelReason,
  };
}
