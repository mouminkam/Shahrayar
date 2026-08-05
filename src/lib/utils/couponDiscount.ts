/**
 * Coupon shape as used across cart/checkout.
 * Mirrors what the coupons/orders APIs return (validate-coupon, available-coupons)
 * plus locally-applied coupon state.
 */
export interface Coupon {
  code?: string;
  type?: 'percentage' | 'fixed_amount' | 'FREEDELIVERY' | string;
  value?: number;
  discount_amount?: number;
  is_free_delivery?: boolean;
  [key: string]: unknown;
}

/**
 * Coupon discount amount for a given order base (e.g. subtotal after promo).
 * Mirrors cartStore getDiscount logic so totals stay consistent when base changes.
 * Checkout uses the post-promo base (total_after_promo_discount) per promo API doc;
 * validate-coupon / available-coupons use the same base — confirm with backend if their API expects pre-promo amounts instead.
 */
export function computeCouponDiscount(coupon: Coupon | null | undefined, baseAmount: number): number {
  if (!coupon || baseAmount <= 0) return 0;

  if (coupon.type === 'percentage') {
    if (coupon.discount_amount && coupon.discount_amount > 0) {
      return Math.min(coupon.discount_amount, baseAmount);
    }
    const discount = (baseAmount * (coupon.value ?? 0)) / 100;
    return Math.min(discount, baseAmount);
  }
  if (coupon.type === 'fixed_amount') {
    return Math.min(coupon.value ?? 0, baseAmount);
  }
  if (coupon.type === 'FREEDELIVERY') {
    return 0;
  }
  if (coupon.discount_amount && coupon.discount_amount > 0) {
    return Math.min(coupon.discount_amount, baseAmount);
  }
  return 0;
}
