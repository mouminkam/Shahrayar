"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Stripe, StripePaymentElement } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import { Loader2, X, AlertCircle } from "lucide-react";
import api from "../../../../../api";
import getStripe from "../../../../../lib/getStripe";
import { useLocalizedRouter } from "../../../../../hooks/useLocalizedRouter";

interface PaymentFormProps {
  orderId: string;
}

/**
 * Payment Form Component
 * Handles payment submission and confirmation
 */
function PaymentForm({ orderId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { push, localize } = useLocalizedRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentElementError, setPaymentElementError] = useState<string | null>(null);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get quote_id from URL if available
      const quoteId = searchParams.get("quote_id");

      // Build return URL with order_id and quote_id if available
      let returnUrl = `${window.location.origin}${localize(`/checkout/stripe/success?order_id=${orderId}`)}`;
      if (quoteId) {
        returnUrl += `&quote_id=${encodeURIComponent(quoteId)}`;
      }

      // Confirm payment with Stripe
      // Note: return_url cannot include payment_intent_id because it's not available yet
      // The payment_intent_id will be available in the success page via Stripe's redirect
      const { error: stripeError, paymentIntent } = (await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "always", // Always redirect after payment
      })) as { error?: { message?: string }; paymentIntent?: { id: string; status: string } };

      // If redirect didn't happen (shouldn't reach here with 'always'), handle manually
      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
        setIsProcessing(false);

        // Redirect to failed page
        const failedUrl = localize(
          `/checkout/stripe/failed?order_id=${orderId}&error=${encodeURIComponent(stripeError.message || "Payment failed")}`
        );
        setTimeout(() => {
          window.location.href = failedUrl;
        }, 2000);
        return;
      }

      // If payment succeeded but redirect didn't happen (edge case)
      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Get quote_id from URL if available
        const quoteId = searchParams.get("quote_id");

        // Confirm payment with backend before redirect (using new Web API)
        try {
          await api.payments.confirmStripePaymentWeb(paymentIntent.id, parseInt(orderId), quoteId || null);
        } catch (confirmError) {
          console.error("Error confirming payment:", confirmError);
          // Continue anyway - success page will retry
        }

        // Redirect to success page with quote_id if available
        let successUrl = localize(
          `/checkout/stripe/success?order_id=${orderId}&payment_intent_id=${paymentIntent.id}`
        );
        if (quoteId) {
          successUrl += `&quote_id=${encodeURIComponent(quoteId)}`;
        }
        window.location.href = successUrl;
      } else {
        setError("Payment was not completed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const message = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(message);
      setIsProcessing(false);

      // Redirect to failed page
      const failedUrl = localize(
        `/checkout/stripe/failed?order_id=${orderId}&error=${encodeURIComponent(message || "Payment failed")}`
      );
      setTimeout(() => {
        window.location.href = failedUrl;
      }, 2000);
    }
  };

  // Back button handler - redirect to checkout if user wants to cancel
  const handleBack = () => {
    push("/checkout");
  };

  // Handle PaymentElement ready state and errors
  useEffect(() => {
    if (!elements) return;

    // Intercept console errors related to PaymentElement
    const originalConsoleError = console.error;
    const errorInterceptor = (...args: unknown[]) => {
      const errorString = args.join(" ");
      if (errorString.includes("payment Element") || errorString.includes("PaymentElement") || errorString.includes("loaderror")) {
        console.error("Intercepted PaymentElement error:", ...args);
        if (!paymentElementError) {
          setPaymentElementError("Failed to load payment form. Please refresh the page.");
          setIsPaymentElementReady(false);
        }
      }
      originalConsoleError.apply(console, args as []);
    };
    console.error = errorInterceptor;

    // Use a small delay to ensure PaymentElement is mounted
    let paymentElementCleanup: (() => void) | null = null;
    const timeoutId = setTimeout(() => {
      const paymentElement: StripePaymentElement | null | undefined = elements.getElement("payment");

      if (paymentElement) {
        // Listen for ready event
        const handleReady = () => {
          setIsPaymentElementReady(true);
          setPaymentElementError(null);
        };

        // Listen for load errors
        const handleLoadError = (event: { error?: { message?: string }; message?: string }) => {
          console.error("PaymentElement load error:", event);
          const errorMessage = event?.error?.message || event?.message || "Failed to load payment form. Please refresh the page.";
          setPaymentElementError(errorMessage);
          setIsPaymentElementReady(false);
        };

        // Listen for change events to clear errors
        const handleChange = (event: { complete: boolean }) => {
          // Clear errors when user starts interacting
          if (event.complete && paymentElementError) {
            setPaymentElementError(null);
          }
        };

        // Set up event listeners
        paymentElement.on("ready", handleReady);
        paymentElement.on("loaderror", handleLoadError);
        paymentElement.on("change", handleChange);

        // Store cleanup function
        paymentElementCleanup = () => {
          paymentElement.off("ready", handleReady);
          paymentElement.off("loaderror", handleLoadError);
          paymentElement.off("change", handleChange);
        };
      } else {
        // If element is not found after timeout, it might have failed to load
        console.warn("PaymentElement not found after mount");
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (paymentElementCleanup) {
        paymentElementCleanup();
      }
      console.error = originalConsoleError;
    };
  }, [elements, paymentElementError]);

  return (
    <div className="min-h-screen bg-bg3 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to Checkout"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Error Message */}
        {(error || paymentElementError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error || paymentElementError}</p>
              {paymentElementError && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                >
                  Refresh page
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-4">
            {paymentElementError ? (
              <div className="p-4 text-center text-gray-600">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-sm mb-2">Unable to load payment form</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-theme3 hover:underline"
                >
                  Click here to refresh
                </button>
              </div>
            ) : (
              <PaymentElement
                options={{
                  layout: "tabs",
                }}
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!stripe || isProcessing || !isPaymentElementReady || !!paymentElementError}
            className="w-full bg-theme3 text-white py-3 px-4 rounded-lg font-semibold hover:bg-theme transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </button>
        </form>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your payment is secure and encrypted
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Main Payment Page Component
 */
function StripePaymentContent() {
  const searchParams = useSearchParams();
  const { localize } = useLocalizedRouter();
  const orderId = searchParams.get("order_id");
  const clientSecret = searchParams.get("client_secret");
  const [isLoading, setIsLoading] = useState(true);
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate required parameters
    if (!orderId || !clientSecret) {
      console.error("Missing required parameters: order_id or client_secret");
      const failedUrl = localize(`/checkout/stripe/failed?order_id=${orderId || ""}&error=${encodeURIComponent("Invalid payment parameters")}`);
      window.location.href = failedUrl;
      return;
    }

    // Load Stripe publishable key from API
    const loadStripeConfig = async () => {
      try {
        const stripe = await getStripe();

        if (!stripe) {
          setError("Payment system not configured");
          const failedUrl = localize(`/checkout/stripe/failed?order_id=${orderId}&error=${encodeURIComponent("Payment system not configured")}`);
          window.location.href = failedUrl;
          return;
        }

        setStripePromise(stripe);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Stripe:", err);
        setError("Failed to initialize payment system");
        const failedUrl = localize(`/checkout/stripe/failed?order_id=${orderId}&error=${encodeURIComponent("Failed to initialize payment system")}`);
        window.location.href = failedUrl;
      }
    };

    loadStripeConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, clientSecret]);

  if (isLoading || !stripePromise) {
    return (
      <div className="min-h-screen bg-bgimg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-theme3 mx-auto mb-4" />
          <p className="text-text">Loading payment system...</p>
        </div>
      </div>
    );
  }

  if (error || !orderId || !clientSecret) {
    return null;
  }

  return (
    <Elements
      key={stripePromise ? "stripe-loaded" : "stripe-loading"}
      stripe={stripePromise}
      options={{
        clientSecret: clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <PaymentForm orderId={orderId} />
    </Elements>
  );
}

export default function StripePaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bgimg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-theme3" />
        </div>
      }
    >
      <StripePaymentContent />
    </Suspense>
  );
}
