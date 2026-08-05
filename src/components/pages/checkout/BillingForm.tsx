"use client";
import { useState, memo, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createCheckoutSchema, type CheckoutFormData } from "../../../lib/validations/checkoutSchemas";
import useAuthStore from "../../../store/authStore";
import useCartStore from "../../../store/cartStore";
import useToastStore from "../../../store/toastStore";
import { useCheckoutPromo } from "../../../context/CheckoutPromoContext";
import { computeCouponDiscount } from "../../../lib/utils/couponDiscount";
import useBranchStore from "../../../store/branchStore";
import api from "../../../api";
import ShippingAddressSection from "./ShippingAddressSection";
import PaymentMethodSection from "./PaymentMethodSection";
import CouponSection from "./CouponSection";
import PlaceOrderButton from "./PlaceOrderButton";
import { createStripePaymentIntent } from "../../../lib/utils/paymentProcessor";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { useLocalizedRouter } from "../../../hooks/useLocalizedRouter";
import type { CreateOrderData } from "../../../api/orders";

interface OrderItemInput {
  menu_item_id: unknown;
  size_id: unknown;
  quantity: unknown;
  selected_ingredients: number[];
  special_instructions: string;
  selected_options?: { option_group_id: number; option_item_ids: number[] }[];
  selected_drinks?: number[];
  selected_toppings?: number[];
  selected_sauces?: number[];
  selected_allergens?: number[];
}

interface PromoPreviewResult {
  has_promo_discount?: boolean;
  total_after_promo_discount?: number;
}

interface CheckoutPromoValue {
  refreshPromoPreview: () => Promise<PromoPreviewResult | null>;
}

const BillingForm = memo(() => {
  const { push } = useLocalizedRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { lang } = useLanguage();
  const { items, clearCart, getSubtotal, getTax, getDeliveryCharge, orderType } =
    useCartStore();
  const { refreshPromoPreview } = useCheckoutPromo() as CheckoutPromoValue;
  const { getSelectedBranchId } = useBranchStore();
  const { success: toastSuccess, error: toastError } = useToastStore();

  const [isProcessing, setIsProcessing] = useState(false);

  // Create schema based on order type
  const checkoutSchema = useMemo(() => createCheckoutSchema(orderType), [orderType]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema as any) as unknown as Resolver<CheckoutFormData>,
    mode: "onChange",
    defaultValues: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      latitude: null,
      longitude: null,
      quote_id: null,
      paymentMethod: "cash",
      scheduled_at: "",
      notes: "",
    },
  });

  const formData = watch();

  // Reset payment method when order type changes
  useEffect(() => {
    setValue("paymentMethod", undefined as unknown as CheckoutFormData["paymentMethod"]);
  }, [orderType, setValue]);

  // Validate user data exists (from authStore)
  const validateUser = () => {
    if (!user) {
      toastError(t(lang, "please_login_place_order"));
      return false;
    }
    if (!user.name) {
      toastError(t(lang, "user_name_missing"));
      return false;
    }
    if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
      toastError(t(lang, "user_email_invalid"));
      return false;
    }
    if (!user.phone) {
      toastError(t(lang, "user_phone_missing"));
      return false;
    }
    return true;
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!validateUser() || !user) {
      return;
    }

    if (!isAuthenticated) {
      toastError(t(lang, "please_login_place_order"));
      push("/login");
      return;
    }

    const branchId = getSelectedBranchId();
    if (!branchId) {
      toastError(t(lang, "please_select_branch"));
      return;
    }

    setIsProcessing(true);

    try {
      // Validate cart items: Check if any item needs size but doesn't have one
      // This validation prevents backend errors for products that require size selection
      const itemsNeedingSize = items.filter((item: Record<string, unknown>) => {
        // If item has size_id, it's valid
        if (item.size_id) return false;

        // If item doesn't have size_id, we need to check if the product requires size
        // Since we don't have has_sizes in cart items, we'll validate by checking
        // if the item was added with a size_name (which indicates it should have size_id)
        // OR if the item has sizes array (from original product data)
        // For now, we'll check if size_name exists but size_id is null (inconsistent state)
        if (item.size_name && !item.size_id) {
          return true; // Inconsistent: has size_name but no size_id
        }

        // If item has sizes array, it means the product has sizes and one should be selected
        if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 && !item.size_id) {
          return true; // Product has sizes but none selected
        }

        return false;
      });

      if (itemsNeedingSize.length > 0) {
        const itemNames = itemsNeedingSize.map((item: Record<string, unknown>) => item.title || item.name).join(", ");
        toastError(`${t(lang, "please_select_size_for")} ${itemNames}`);
        setIsProcessing(false);
        return;
      }

      let freshPreview: { has_promo_discount?: boolean; total_after_promo_discount?: number } | null = null;
      try {
        freshPreview = await refreshPromoPreview();
      } catch {
        freshPreview = null;
      }

      const subtotal = getSubtotal();
      const totalAfterPromo =
        freshPreview?.has_promo_discount &&
        typeof freshPreview.total_after_promo_discount === "number"
          ? freshPreview.total_after_promo_discount
          : subtotal;
      const discount = computeCouponDiscount(
        useCartStore.getState().coupon,
        totalAfterPromo
      );
      const deliveryCharge = getDeliveryCharge();
      const taxAmount = getTax();
      const totalAmount = totalAfterPromo - discount + taxAmount + deliveryCharge;

      // Prepare order items with size_id, selected_ingredients, selected_options, and customizations
      const orderItems: OrderItemInput[] = items.map((item: Record<string, unknown>) => {
        const orderItem: OrderItemInput = {
          menu_item_id: item.id,
          size_id: item.size_id || null,
          quantity: item.quantity,
          selected_ingredients: Array.isArray(item.ingredients)
            ? item.ingredients.map((id: string) => parseInt(id, 10))
            : [],
          special_instructions: (item.special_instructions as string) || "",
        };

        // Add selected_options if available (convert from frontend format to API format)
        if (item.selected_options && typeof item.selected_options === "object") {
          const selectedOptionsArray = Object.entries(item.selected_options as Record<string, unknown>)
            .filter(([, itemIds]) => Array.isArray(itemIds) && itemIds.length > 0)
            .map(([groupId, itemIds]) => ({
              option_group_id: parseInt(groupId, 10),
              option_item_ids: (itemIds as string[]).map((id) => parseInt(id, 10)),
            }));

          if (selectedOptionsArray.length > 0) {
            orderItem.selected_options = selectedOptionsArray;
          }
        }

        // Add selected_customizations if available (convert from frontend format to API format)
        if (item.selected_customizations && typeof item.selected_customizations === "object") {
          // Extract each customization type and convert to array of IDs
          const customizations = item.selected_customizations as Record<string, unknown>;

          // Ensure arrays are properly formatted (convert to numbers and filter empty)
          orderItem.selected_drinks = Array.isArray(customizations.drinks)
            ? customizations.drinks.map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id))
            : [];
          orderItem.selected_toppings = Array.isArray(customizations.toppings)
            ? customizations.toppings.map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id))
            : [];
          orderItem.selected_sauces = Array.isArray(customizations.sauces)
            ? customizations.sauces.map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id))
            : [];
          orderItem.selected_allergens = Array.isArray(customizations.allergens)
            ? customizations.allergens.map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id))
            : [];
        } else {
          // Default empty arrays if no customizations
          orderItem.selected_drinks = [];
          orderItem.selected_toppings = [];
          orderItem.selected_sauces = [];
          orderItem.selected_allergens = [];
        }

        return orderItem;
      });

      // Build delivery address string
      const deliveryAddress =
        orderType === "delivery"
          ? `${data.address}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`
          : `Pickup from Main Branch - Branch Location`;

      // Prepare order data for API (matching API structure)
      // Customer info comes from user object in authStore (saved at login)
      const orderData: CreateOrderData = {
        branch_id: branchId as number,
        order_type: orderType as "pickup" | "delivery",
        items: orderItems as unknown as CreateOrderData["items"],
        subtotal: parseFloat(subtotal.toFixed(2)),
        delivery_charge: parseFloat(deliveryCharge.toFixed(2)) as unknown as string,
        tax_amount: parseFloat(taxAmount.toFixed(2)) as unknown as string,
        discount_amount: parseFloat(discount.toFixed(2)) as unknown as string,
        total_amount: parseFloat(totalAmount.toFixed(2)),
        // Customer info from user object (saved in authStore at login)
        customer_name: user.name || "",
        customer_phone: user.phone || "",
        customer_email: user.email || "",
        payment_method: data.paymentMethod, // 'cash' or 'stripe'
        delivery_address: deliveryAddress,
        latitude: data.latitude || (orderType === "delivery" ? 0.0 : undefined),
        longitude: data.longitude || (orderType === "delivery" ? 0.0 : undefined),
        notes: data.notes || "",
      };

      // Add quote_id if delivery order
      if (orderType === "delivery" && data.quote_id) {
        orderData.quote_id = data.quote_id;
      }

      // Add scheduled_at if provided
      if (data.scheduled_at) {
        // Convert datetime-local to API format (YYYY-MM-DD HH:mm:ss)
        const scheduledDate = new Date(data.scheduled_at);
        orderData.scheduled_at = scheduledDate.toISOString().slice(0, 19).replace("T", " ");
      }

      // Step 1: Create order first
      const orderResponse = await api.orders.createOrder(orderData);

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.message || "Failed to create order");
      }

      const createdOrder = ((orderResponse.data as Record<string, unknown>).order || orderResponse.data) as Record<string, unknown>;
      const orderId = createdOrder.id as string | number;

      // Step 2: Handle payment based on payment method
      if (data.paymentMethod === "stripe") {
        // Create payment intent
        const intentResult = await createStripePaymentIntent(orderId);

        if (!intentResult.success) {
          // Payment intent creation failed
          toastError(intentResult.error || "Failed to initialize payment. Please try again.");
          setIsProcessing(false);
          return;
        }

        // Redirect to payment page in same window
        // Note: publishable_key will be loaded from NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env variable
        let paymentUrl = `/checkout/stripe/pay?order_id=${orderId}&client_secret=${encodeURIComponent(intentResult.client_secret || "")}`;
        // Add quote_id to URL if available (for delivery orders)
        if (orderType === "delivery" && data.quote_id) {
          paymentUrl += `&quote_id=${encodeURIComponent(data.quote_id || "")}`;
        }
        push(paymentUrl);
        // Don't set isProcessing to false - page will change
        // Don't clear cart yet - wait for successful payment confirmation
        // Cart will be cleared in success page after payment confirmation
        return;
      } else {
        // Cash payment - existing flow
        clearCart();
        toastSuccess(t(lang, "order_placed_successfully"));

        // Redirect to order success page
        setTimeout(() => {
          push(`/orders/${orderId}/success`);
        }, 1500);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      const err = error as { data?: { message?: string }; message?: string };
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        t(lang, "failed_to_place_order");
      toastError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="checkout-form bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-6 lg:p-8"
    >
      <ShippingAddressSection
        formData={formData}
        setFormData={(updater) => {
          // Use getValues() to get current form values instead of watch() which may be stale
          const currentValues = getValues();
          const newData = updater(currentValues);
          (Object.keys(newData) as (keyof CheckoutFormData)[]).forEach((key) => {
            setValue(key, newData[key] as never, { shouldValidate: false, shouldDirty: true });
          });
        }}
      />
      <CouponSection />
      <PaymentMethodSection
        formData={formData}
        setFormData={(updater) => {
          // Use getValues() to get current form values instead of watch() which may be stale
          const currentValues = getValues();
          const newData = updater(currentValues);
          (Object.keys(newData) as (keyof CheckoutFormData)[]).forEach((key) => {
            setValue(key, newData[key] as never, { shouldValidate: false, shouldDirty: true });
          });
        }}
      />

      {/* Notes Section */}
      <div className="mb-6">
        <label className="block text-text  text-sm font-medium mb-2">
          {t(lang, "order_notes_optional")}
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          className={`w-full px-4 py-3 bg-white/10 border ${
            errors.notes ? "border-red-500" : "border-white/20"
          } rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300 resize-none`}
          placeholder={t(lang, "special_instructions_placeholder")}
        />
        {errors.notes && (
          <p className="mt-1 text-red-400 text-sm">{errors.notes.message}</p>
        )}
      </div>

      {errors.address && orderType === "delivery" && (
        <p className="mb-4 text-red-400 text-sm">{errors.address.message}</p>
      )}

      <PlaceOrderButton
        isProcessing={isProcessing}
        onClick={handleSubmit(onSubmit)}
        isDisabled={!formData.paymentMethod}
      />
    </motion.form>
  );
});

BillingForm.displayName = "BillingForm";

export default BillingForm;
