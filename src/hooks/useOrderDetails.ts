"use client";
import { useState, useEffect, useCallback } from "react";
import api from "../api";
import useToastStore from "../store/toastStore";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../locales/i18n/getTranslation";

/** Fetches a single order's details for the order confirmation/detail pages. */
export function useOrderDetails(orderId: string | number | undefined) {
  const { error: toastError } = useToastStore();
  const { lang } = useLanguage();
  const [order, setOrder] = useState<{ id: string | number; [key: string]: unknown } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError("Order ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.orders.getOrderById(orderId);

      if (response.success && response.data) {
        const data = response.data as { order?: typeof order } & Record<string, unknown>;
        const orderData = data.order || (response.data as typeof order);

        if (!orderData || !orderData.id) {
          console.error("Invalid order data structure:", response);
          const errorMsg = t(lang, "failed_to_load_order_details");
          setError(errorMsg);
          toastError(errorMsg);
          return;
        }

        setOrder(orderData);
      } else {
        console.error("Order API error:", response);
        const errorMsg = response?.message || t(lang, "failed_to_load_order_details");
        setError(errorMsg);
        toastError(errorMsg);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      const error = err as { message?: string; status?: number; data?: unknown; response?: unknown };
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        data: error.data,
        response: error.response,
      });
      const errorMessage = error?.message || t(lang, "failed_to_load_order_details");
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toastError, lang]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  return { order, isLoading, error, refetch: fetchOrderDetails };
}
