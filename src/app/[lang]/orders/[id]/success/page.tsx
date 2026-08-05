"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import LocalizedLink from "@/components/ui/LocalizedLink";
import api from "../../../../../api";
import useToastStore from "../../../../../store/toastStore";
import { formatCurrency } from "../../../../../lib/utils/formatters";
import AnimatedSection from "../../../../../components/ui/AnimatedSection";

interface OrderSuccessData {
  id?: string | number;
  order_type?: string;
  status?: string;
  total_amount?: number | string;
  payment_method?: string;
  [key: string]: unknown;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.id as string | undefined;
  const { error: toastError } = useToastStore();
  const [order, setOrder] = useState<OrderSuccessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const response = await api.orders.getOrderById(orderId);

      if (response.success && response.data) {
        // Handle different response structures
        const data = response.data as Record<string, unknown>;
        const orderData = (data.order as OrderSuccessData) || (data as OrderSuccessData);

        if (!orderData || !orderData.id) {
          console.error('Invalid order data structure:', response);
          toastError("Failed to load order details");
          return;
        }

        setOrder(orderData);
      } else {
        console.error('Order API error:', response);
        toastError(response?.message || "Failed to load order details");
      }
    } catch (error: unknown) {
      const err = error as { message?: string; status?: unknown; data?: unknown; response?: unknown };
      console.error("Error fetching order:", error);
      // Log full error details
      console.error("Error details:", {
        message: err?.message,
        status: err?.status,
        data: err?.data,
        response: err?.response
      });
      toastError(err?.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toastError]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  if (isLoading) {
    return (
      <div className="bg-bgimg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme3 mx-auto mb-4"></div>
          <p className="text-text">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg3 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-8 lg:p-12 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-theme3/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-theme3" />
          </motion.div>

          {/* Success Message */}
          <h1 className="text-3xl lg:text-4xl font-black text-white  mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-text text-lg mb-8">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 rounded-xl p-6 mb-8 text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-theme3" />
                <h2 className="text-xl font-bold text-white ">
                  Order Details
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text">Order ID:</span>
                  <span className="text-white font-semibold">#{order.id || orderId}</span>
                </div>

                {order.order_type && (
                  <div className="flex justify-between items-center">
                    <span className="text-text">Order Type:</span>
                    <span className="text-white font-semibold capitalize">
                      {order.order_type}
                    </span>
                  </div>
                )}

                {order.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-text">Status:</span>
                    <span className="text-theme3 font-semibold capitalize">
                      {order.status}
                    </span>
                  </div>
                )}

                {order.total_amount && (
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white font-bold">Total Amount:</span>
                    <span className="text-theme3 font-black text-xl">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                )}

                {order.payment_method && (
                  <div className="flex justify-between items-center">
                    <span className="text-text">Payment Method:</span>
                    <span className="text-white font-semibold capitalize">
                      {order.payment_method}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LocalizedLink
              href={`/orders/${orderId || ''}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme3 text-white rounded-xl font-semibold hover:bg-theme transition-colors"
            >
              <Package className="w-5 h-5" />
              View Order
            </LocalizedLink>

            <LocalizedLink
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              Continue Shopping
            </LocalizedLink>

            <LocalizedLink
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home
            </LocalizedLink>
          </div>

          {/* Additional Info */}
          <p className="text-text text-sm mt-8">
            You will receive an email confirmation shortly with your order details.
          </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  );
}
