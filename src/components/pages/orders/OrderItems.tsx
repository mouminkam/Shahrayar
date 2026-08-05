"use client";
import { motion } from "framer-motion";
import OptimizedImage from "../../ui/OptimizedImage";
import { IMAGE_PATHS } from "../../../data/constants";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { transformMenuItemToProduct, type RawMenuItem, type RawOptionGroup } from "../../../lib/utils/productTransform";
import { calculateProductPriceWithCustomizations, type SelectedCustomizationsMap } from "../../../lib/utils/productPrice";
import type { DetailedOrder, DetailedOrderItem } from "./OrderDetailsContent";

interface OrderItemsProps {
  orderItems: DetailedOrderItem[];
  order: DetailedOrder;
}

/**
 * OrderItems component - Displays order items with customizations
 */
export default function OrderItems({ orderItems, order }: OrderItemsProps) {
  const { lang } = useLanguage();

  if (!orderItems || orderItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white  text-xl font-bold mb-4">
        {t(lang, "order_items")} ({orderItems.length})
      </h2>
      {orderItems.map((item, idx) => {
        const imageUrl = item.menu_item?.image_url ||
                         item.menu_item?.image ||
                         item.image ||
                         IMAGE_PATHS.placeholder;
        const itemName = item.item_name || item.menu_item?.name || item.name || 'Unknown Item';
        const quantity = item.quantity || 1;

        // Calculate final price with all customizations
        let itemPrice = parseFloat(String(item.item_price || item.price || item.menu_item?.price || 0));

        // If menu_item data is available with option_groups and customizations, calculate accurate price
        if (item.menu_item) {
          try {
            // Transform menu_item to product format
            const menuItemData = item.menu_item;
            const optionGroups = menuItemData.option_groups || [];
            const customizations = menuItemData.customizations || null;

            // Transform to product object for price calculation
            const product = transformMenuItemToProduct(
              { id: 0, ...menuItemData } as unknown as RawMenuItem,
              optionGroups as RawOptionGroup[],
              lang,
              customizations as any
            );

            if (product) {
              // Handle selected_ingredients
              const ingredientIds = Array.isArray(item.selected_ingredients)
                ? item.selected_ingredients
                : (item.selected_ingredients ? [item.selected_ingredients] : []);

              // Convert selected_options from API format to frontend format
              let selectedOptions: Record<number, number[]> | null = null;
              if (item.selected_options && Array.isArray(item.selected_options) && item.selected_options.length > 0) {
                selectedOptions = {};
                item.selected_options.forEach((option) => {
                  if (option.option_group_id && Array.isArray(option.option_item_ids)) {
                    (selectedOptions as Record<number, number[]>)[option.option_group_id] = option.option_item_ids;
                  }
                });
              }

              // Build selected_customizations object
              let selectedCustomizations: SelectedCustomizationsMap | null = null;
              if (item.selected_drinks || item.selected_toppings || item.selected_sauces || item.selected_allergens) {
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
              }

              // Calculate final price with all customizations
              const calculatedPrice = calculateProductPriceWithCustomizations(
                product,
                item.size_id || null,
                ingredientIds,
                selectedOptions,
                selectedCustomizations
              );

              // Use calculated price if it's different from item_price (more accurate)
              if (calculatedPrice > 0) {
                itemPrice = calculatedPrice;
              }
            }
          } catch (error) {
            console.error(`Error calculating price for item ${item.id}:`, error);
            // Fallback to item.item_price if calculation fails
          }
        }

        return (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <OptimizedImage
                src={imageUrl}
                alt={itemName}
                fill
                className="object-cover"
                quality={85}
                loading="lazy"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white  font-bold text-lg mb-1">
                {itemName}
              </h3>
              <div className="space-y-1 mb-2">
                {item.size && (
                  <p className="text-text text-sm">
                    {t(lang, "size")}: {(typeof item.size === 'object' ? item.size?.name : item.size) as string}
                  </p>
                )}
                {Array.isArray(item.selected_ingredients) && item.selected_ingredients.length > 0 && (
                  <p className="text-text text-sm">
                    {t(lang, "add_ons")}: {item.selected_ingredients.length} {t(lang, "items")}
                  </p>
                )}
                {item.selected_options && Array.isArray(item.selected_options) && item.selected_options.length > 0 && (
                  <p className="text-text text-sm">
                    {t(lang, "options")}: {item.selected_options.map(opt => {
                      const itemCount = Array.isArray(opt.option_item_ids) ? opt.option_item_ids.length : 0;
                      return itemCount > 0 ? `${itemCount} ${t(lang, "items")}` : null;
                    }).filter(Boolean).join(", ")}
                  </p>
                )}
                {Boolean(item.selected_drinks || item.selected_toppings || item.selected_sauces || item.selected_allergens) && (
                  <p className="text-text text-sm">
                    {[
                      Array.isArray(item.selected_drinks) && item.selected_drinks.length > 0 && `${t(lang, "drinks")}: ${item.selected_drinks.length}`,
                      Array.isArray(item.selected_toppings) && item.selected_toppings.length > 0 && `${t(lang, "toppings")}: ${item.selected_toppings.length}`,
                      Array.isArray(item.selected_sauces) && item.selected_sauces.length > 0 && `${t(lang, "sauces")}: ${item.selected_sauces.length}`,
                      Array.isArray(item.selected_allergens) && item.selected_allergens.length > 0 && `${t(lang, "allergens")}: ${item.selected_allergens.length}`
                    ].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
              <p className="text-text text-sm">
                {t(lang, "quantity")}: {quantity} × {formatCurrency(itemPrice)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-theme3  font-black text-xl">
                {formatCurrency(parseFloat(String(order.subtotal)))}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
