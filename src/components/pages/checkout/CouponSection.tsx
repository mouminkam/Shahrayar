"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, X, Check, Loader2 } from "lucide-react";
import useCartStore from "../../../store/cartStore";
import useBranchStore from "../../../store/branchStore";
import { useCheckoutPromo } from "../../../context/CheckoutPromoContext";
import useToastStore from "../../../store/toastStore";
import api from "../../../api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface AvailableCoupon {
  code: string;
  description?: string;
  [key: string]: unknown;
}

export default function CouponSection() {
  const { coupon, applyCoupon, removeCoupon, items } = useCartStore();
  const { orderAmountForCoupons } = useCheckoutPromo() as { orderAmountForCoupons: number };
  const { getSelectedBranchId } = useBranchStore();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const { lang } = useLanguage();

  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  // Fetch available coupons
  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      const branchId = getSelectedBranchId();
      if (!branchId || items.length === 0) return;

      setIsLoadingCoupons(true);
      try {
        // Prepare order data for available coupons API
        // order_amount: post-promotional subtotal (align with PROMO_DISCOUNT_MOBILE_API / backend expectations)
        const orderData = {
          order_amount: orderAmountForCoupons,
          branch_id: branchId as number,
          items: items.map((item: { id: unknown; quantity: unknown }) => ({
            menu_item_id: item.id as number,
            quantity: item.quantity as number,
          })),
        };

        const response = await api.orders.getAvailableCoupons(orderData);

        if (response.success && response.data) {
          const coupons = Array.isArray(response.data)
            ? response.data
            : (response.data as { coupons?: AvailableCoupon[] }).coupons || [];
          setAvailableCoupons(coupons);
        }
      } catch (error) {
        console.error("Error fetching available coupons:", error);
      } finally {
        setIsLoadingCoupons(false);
      }
    };

    fetchAvailableCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, getSelectedBranchId, orderAmountForCoupons]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toastError(t(lang, "please_enter_coupon_code"));
      return;
    }

    const branchId = getSelectedBranchId();
    if (!branchId) {
      toastError(t(lang, "please_select_branch"));
      return;
    }

    setIsValidating(true);
    try {
      const response = await api.coupons.validateCoupon({
        code: couponCode.trim(),
        order_amount: orderAmountForCoupons,
        branch_id: branchId,
      });

      const responseData = response.data as { coupon?: Record<string, unknown> } | undefined;
      if (response.success && responseData?.coupon) {
        // Extract coupon data from API response
        const couponFromAPI = responseData.coupon;
        const couponData = {
          code: couponCode.trim(),
          id: couponFromAPI.id,
          type: couponFromAPI.type as string, // 'fixed_amount', 'percentage', or 'FREEDELIVERY'
          value: parseFloat(couponFromAPI.value as string) || 0,
          discount_amount: parseFloat(couponFromAPI.discount_amount as string) || 0,
          is_free_delivery: (couponFromAPI.is_free_delivery as boolean) || false,
          description: (couponFromAPI.description as string) || "",
        };
        applyCoupon(couponData);
        toastSuccess(t(lang, "coupon_applied_successfully"));
        setCouponCode("");
      } else {
        toastError(response.message || t(lang, "invalid_coupon_code"));
      }
    } catch (error) {
      toastError((error as Error)?.message || t(lang, "failed_to_validate_coupon"));
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toastSuccess(t(lang, "coupon_removed"));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 shadow-2xl rounded-xl bg-theme3 flex items-center justify-center"
        >
          <Tag className="w-6 h-6 text-white fill-white" />
        </motion.div>
        <h3 className="text-white  text-2xl font-black uppercase">
          {t(lang, "coupon_code")}
        </h3>
      </div>

      {coupon ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-theme3/20 border border-theme3/50 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-theme3" />
            <div>
              <p className="text-white font-semibold">{coupon.code}</p>
              <p className="text-text text-sm">
                {coupon.type === "FREEDELIVERY"
                  ? t(lang, "free_delivery")
                  : (coupon.discount_amount ?? 0) > 0
                  ? `${t(lang, "discount_label")} ${(coupon.discount_amount ?? 0).toFixed(2)} BGN`
                  : coupon.type === "percentage"
                  ? `${t(lang, "discount_label")} ${coupon.value}%`
                  : `${t(lang, "discount_label")} ${coupon.value} BGN`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="p-2 hover:bg-theme3/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-theme3" />
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleValidateCoupon()}
              placeholder={t(lang, "enter_coupon_code")}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20 transition-all duration-300"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleValidateCoupon}
              disabled={isValidating || !couponCode.trim()}
              className="px-6 py-3 bg-theme3 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t(lang, "validating")}
                </>
              ) : (
                t(lang, "apply")
              )}
            </motion.button>
          </div>

          {availableCoupons.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-text text-sm font-medium mb-2">{t(lang, "available_coupons")}</p>
              <div className="space-y-2">
                {availableCoupons.slice(0, 3).map((availCoupon, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">{availCoupon.code}</p>
                      <p className="text-text text-xs">
                        {availCoupon.description || t(lang, "special_discount")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode(availCoupon.code);
                        handleValidateCoupon();
                      }}
                      className="px-3 py-1 bg-theme3/20 text-theme3 rounded-lg text-xs font-semibold hover:bg-theme3/30 transition-colors"
                    >
                      {t(lang, "use")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
