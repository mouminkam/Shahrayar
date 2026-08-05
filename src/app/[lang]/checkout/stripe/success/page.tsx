"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import LocalizedLink from "../../../../../components/ui/LocalizedLink";
import api from "../../../../../api";
import useCartStore from "../../../../../store/cartStore";
import useToastStore from "../../../../../store/toastStore";
import { formatCurrency } from "../../../../../lib/utils/formatters";
import AnimatedSection from "../../../../../components/ui/AnimatedSection";

interface OrderDetails {
  id?: string | number;
  order_type?: string;
  status?: string;
  total_amount?: number;
  payment_method?: string;
  payment_status?: string;
  quote_id?: string;
  payment_intent_id?: string;
  [key: string]: unknown;
}

function StripeSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  // Stripe adds 'payment_intent' parameter to redirect URL automatically
  const paymentIntentId = searchParams.get("payment_intent") || searchParams.get("payment_intent_id");
  const quoteId = searchParams.get("quote_id"); // Get quote_id from URL if available
  const { clearCart } = useCartStore();
  const { success: toastSuccess, error: toastError } = useToastStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const maxPollingAttempts = 10; // 10 attempts * 2 seconds = 20 seconds max

  useEffect(() => {
    if (orderId) {
      // Clear cart on success
      clearCart();

      // Confirm payment first, then fetch order details
      confirmPaymentAndFetchOrder();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentIntentId]);

  const confirmPayment = async () => {
    // If payment_intent_id is not in URL, try to get it from order
    if (!paymentIntentId && orderId) {
      // Try to fetch order first to get payment_intent_id if stored
      try {
        const orderResponse = await api.orders.getOrderById(orderId);
        if (orderResponse.success && orderResponse.data) {
          const orderData = ((orderResponse.data as Record<string, unknown>).order || orderResponse.data) as OrderDetails;
          // If order has payment_intent_id stored, use it
          if (orderData.payment_intent_id) {
            // Use the stored payment_intent_id and quote_id if available
            return await confirmPaymentWithId(orderData.payment_intent_id, orderData.quote_id || null);
          }
        }
      } catch (error) {
        console.error("Error fetching order for payment_intent_id:", error);
      }
    }

    if (!paymentIntentId || !orderId) {
      return { success: false, error: "Missing payment information" };
    }

    return await confirmPaymentWithId(paymentIntentId, quoteId || null);
  };

  const confirmPaymentWithId = async (intentId: string, quoteIdParam: string | null = null) => {
    if (!intentId || !orderId) {
      return { success: false, error: "Missing payment information" };
    }

    try {
      // Get quote_id from parameter, URL, or order data
      let finalQuoteId = quoteIdParam || quoteId;

      // If quote_id not in URL, try to get it from order
      if (!finalQuoteId && orderId) {
        try {
          const orderResponse = await api.orders.getOrderById(orderId);
          if (orderResponse.success && orderResponse.data) {
            const orderData = ((orderResponse.data as Record<string, unknown>).order || orderResponse.data) as OrderDetails;
            if (orderData.quote_id) {
              finalQuoteId = orderData.quote_id;
            }
          }
        } catch (error) {
          console.error("Error fetching order for quote_id:", error);
        }
      }

      // Use new Web API - payment_intent_id, order_id, and optional quote_id
      const response = await api.payments.confirmStripePaymentWeb(
        intentId,
        parseInt(orderId),
        finalQuoteId || null
      );

      return response;
    } catch (error) {
      console.error("Error confirming payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to confirm payment",
      };
    }
  };

  const fetchOrderDetails = async (): Promise<boolean> => {
    if (!orderId) return false;

    try {
      const response = await api.orders.getOrderById(orderId);

      if (response.success && response.data) {
        // Handle different response structures
        const orderData = ((response.data as Record<string, unknown>).order || response.data) as OrderDetails;

        if (!orderData || !orderData.id) {
          console.error("Invalid order data structure:", response);
          return false;
        }

        setOrder(orderData);

        // Check if payment is confirmed
        // Only check payment_status - order.status is managed separately by the restaurant
        if (orderData.payment_status === "paid") {
          // Use setTimeout to avoid React warning about updating state during render
          setTimeout(() => {
            toastSuccess("Payment successful! Your order has been paid.");
          }, 0);
          setIsLoading(false);
          return true; // Payment confirmed
        }

        return false; // Payment not confirmed yet
      } else {
        console.error("Order API error:", response);
        return false;
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      // Log full error details
      const err = error as { message?: string; status?: number; data?: unknown; response?: unknown };
      console.error("Error details:", {
        message: err?.message,
        status: err?.status,
        data: err?.data,
        response: err?.response,
      });
      return false;
    }
  };

  const confirmPaymentAndFetchOrder = async () => {
    setIsConfirming(true);

    // Step 1: Confirm payment with backend
    if (paymentIntentId) {
      const confirmResult = await confirmPayment();

      if (!confirmResult.success) {
        // Check if it's a requires_payment_method error
        const resultData = confirmResult as { data?: { requires_payment_method?: boolean; message?: string } };
        if (resultData.data?.requires_payment_method === true) {
          // Use setTimeout to avoid React warning about updating state during render
          setTimeout(() => {
            toastError(resultData.data?.message || "Payment failed. Please try another payment method.");
          }, 0);
          setIsLoading(false);
          setIsConfirming(false);
          return;
        }
        // Other errors - continue to check order status
        console.warn("Payment confirmation returned error, but checking order status anyway:", confirmResult);
      } else if (confirmResult.success) {
        const resultWithOrder = confirmResult as { data?: { order?: OrderDetails } };
        if (resultWithOrder.data?.order) {
          // If confirm was successful and returned order, check if payment is paid
          const orderFromConfirm = resultWithOrder.data.order;
          if (orderFromConfirm.payment_status === "paid") {
            setOrder(orderFromConfirm);
            setTimeout(() => {
              toastSuccess("Payment successful! Your order has been paid.");
            }, 0);
            setIsLoading(false);
            setIsConfirming(false);
            return;
          }
        }
      }
    }

    setIsConfirming(false);

    // Step 2: Fetch order details
    const isConfirmed = await fetchOrderDetails();

    // Step 3: If not confirmed, start polling
    if (!isConfirmed && pollingCount < maxPollingAttempts) {
      startPolling();
    } else if (!isConfirmed) {
      // Max polling attempts reached
      console.warn("Max polling attempts reached, order not confirmed");
      // Use setTimeout to avoid React warning about updating state during render
      setTimeout(() => {
        toastError("Payment confirmation is taking longer than expected. Please check your order status.");
      }, 0);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      setPollingCount((prev) => {
        const newCount = prev + 1;

        if (newCount >= maxPollingAttempts) {
          clearInterval(pollInterval);
          setIsLoading(false);
          // Use setTimeout to avoid React warning about updating state during render
          setTimeout(() => {
            toastError("Payment confirmation is taking longer than expected. Please check your order status.");
          }, 0);
          return newCount;
        }

        // Poll order status
        fetchOrderDetails().then((isConfirmed) => {
          if (isConfirmed) {
            clearInterval(pollInterval);
            setIsLoading(false);
          }
        });

        return newCount;
      });
    }, 2000); // Poll every 2 seconds
  };

  if (isLoading || isConfirming) {
    return (
      <div className="bg-bgimg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme3 mx-auto mb-4"></div>
          <p className="text-text">
            {isConfirming ? "Confirming payment..." : "Loading order details..."}
          </p>
          {pollingCount > 0 && (
            <p className="text-text/70 text-sm mt-2">
              Verifying payment status... ({pollingCount}/{maxPollingAttempts})
            </p>
          )}
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
            Payment Successful!
          </h1>
          <p className="text-text text-lg mb-8">
            Your payment has been processed and your order has been confirmed. We&apos;ve received your order and will begin processing it right away.
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
                    <span className="text-theme3 font-semibold capitalize">{order.status}</span>
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
            {orderId && (
              <LocalizedLink
                href={`/orders/${orderId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme3 text-white rounded-xl font-semibold hover:bg-theme transition-colors"
              >
                <Package className="w-5 h-5" />
                View Order
              </LocalizedLink>
            )}

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

export default function StripeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-bgimg min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme3 mx-auto mb-4"></div>
            <p className="text-text">Loading...</p>
          </div>
        </div>
      }
    >
      <StripeSuccessContent />
    </Suspense>
  );
}
