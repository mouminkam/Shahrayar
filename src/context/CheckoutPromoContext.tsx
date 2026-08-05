"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import api from "../api";
import { computeCouponDiscount } from "../lib/utils/couponDiscount";

const DEBOUNCE_MS = 400;

interface PromoPreview {
  has_promo_discount?: boolean;
  total_after_promo_discount?: number;
  discount_amount?: number;
  [key: string]: unknown;
}

interface CheckoutPromoContextValue {
  promoPreview: PromoPreview | null;
  isLoadingPromo: boolean;
  subtotal: number;
  totalAfterPromo: number;
  promoDiscountAmount: number;
  couponDiscount: number;
  tax: number;
  delivery: number;
  checkoutTotal: number;
  refreshPromoPreview: () => Promise<PromoPreview | null>;
  /** Base amount for coupon validate / available-coupons (post-promo per promo API doc). */
  orderAmountForCoupons: number;
}

const CheckoutPromoContext = createContext<CheckoutPromoContextValue | null>(null);

export function CheckoutPromoProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const coupon = useCartStore((s) => s.coupon);
  const deliveryChargeState = useCartStore((s) => s.deliveryCharge);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTax = useCartStore((s) => s.getTax);
  const getDeliveryCharge = useCartStore((s) => s.getDeliveryCharge);

  const [promoPreview, setPromoPreview] = useState<PromoPreview | null>(null);
  const [isLoadingPromo, setIsLoadingPromo] = useState(false);

  const subtotal = useMemo(() => getSubtotal(), [items, getSubtotal]);

  const refreshPromoPreview = useCallback(async (): Promise<PromoPreview | null> => {
    const st = useCartStore.getState().getSubtotal();
    const ot = useCartStore.getState().orderType;
    const res = await api.orders.previewPromoDiscount({
      order_type: ot,
      subtotal: parseFloat(Math.max(0, st).toFixed(2)),
    });
    if (res?.success && res.data) {
      setPromoPreview(res.data as PromoPreview);
      return res.data as PromoPreview;
    }
    setPromoPreview(null);
    return null;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || items.length === 0) {
      setPromoPreview(null);
      setIsLoadingPromo(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoadingPromo(true);
      try {
        const st = useCartStore.getState().getSubtotal();
        const ot = useCartStore.getState().orderType;
        const res = await api.orders.previewPromoDiscount({
          order_type: ot,
          subtotal: parseFloat(Math.max(0, st).toFixed(2)),
        });
        if (cancelled) return;
        setPromoPreview(res?.success && res.data ? (res.data as PromoPreview) : null);
      } catch {
        if (!cancelled) setPromoPreview(null);
      } finally {
        if (!cancelled) setIsLoadingPromo(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAuthenticated, items, orderType, subtotal]);

  const totalAfterPromo = useMemo(() => {
    if (promoPreview?.has_promo_discount && typeof promoPreview.total_after_promo_discount === "number") {
      return promoPreview.total_after_promo_discount;
    }
    return subtotal;
  }, [promoPreview, subtotal]);

  const promoDiscountAmount = useMemo(() => {
    if (promoPreview?.has_promo_discount && typeof promoPreview.discount_amount === "number") {
      return promoPreview.discount_amount;
    }
    return 0;
  }, [promoPreview]);

  const couponDiscount = useMemo(() => computeCouponDiscount(coupon, totalAfterPromo), [coupon, totalAfterPromo]);

  const tax = useMemo(() => getTax(), [getTax]);

  const delivery = useMemo(
    () => getDeliveryCharge(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getDeliveryCharge, orderType, deliveryChargeState, coupon]
  );

  const checkoutTotal = useMemo(
    () => totalAfterPromo - couponDiscount + tax + delivery,
    [totalAfterPromo, couponDiscount, tax, delivery]
  );

  const value = useMemo<CheckoutPromoContextValue>(
    () => ({
      promoPreview,
      isLoadingPromo,
      subtotal,
      totalAfterPromo,
      promoDiscountAmount,
      couponDiscount,
      tax,
      delivery,
      checkoutTotal,
      refreshPromoPreview,
      orderAmountForCoupons: totalAfterPromo,
    }),
    [
      promoPreview,
      isLoadingPromo,
      subtotal,
      totalAfterPromo,
      promoDiscountAmount,
      couponDiscount,
      tax,
      delivery,
      checkoutTotal,
      refreshPromoPreview,
    ]
  );

  return <CheckoutPromoContext.Provider value={value}>{children}</CheckoutPromoContext.Provider>;
}

export function useCheckoutPromo(): CheckoutPromoContextValue {
  const ctx = useContext(CheckoutPromoContext);
  if (!ctx) {
    throw new Error("useCheckoutPromo must be used within CheckoutPromoProvider");
  }
  return ctx;
}
