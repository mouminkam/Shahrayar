"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";
import LocalizedLink from "../../../../../components/ui/LocalizedLink";
import { useLocalizedRouter } from "../../../../../hooks/useLocalizedRouter";
import useToastStore from "../../../../../store/toastStore";
import AnimatedSection from "../../../../../components/ui/AnimatedSection";

function StripeFailedContent() {
  const { push } = useLocalizedRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const errorMessage = searchParams.get("error") || "Payment failed. Please try again.";
  const { error: toastError } = useToastStore();
  const [decodedError, setDecodedError] = useState("");

  useEffect(() => {
    // Decode error message
    try {
      setDecodedError(decodeURIComponent(errorMessage));
    } catch {
      setDecodedError(errorMessage);
    }

    // Show error toast
    toastError(decodedError || "Payment failed. Please try again.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage, decodedError, toastError]);

  const handleRetry = () => {
    if (orderId) {
      // Redirect back to checkout with order_id
      push(`/checkout?order_id=${orderId}`);
    } else {
      // Redirect to checkout page
      push("/checkout");
    }
  };

  return (
    <div className="bg-bg3 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-8 lg:p-12 text-center"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-12 h-12 text-red-500" />
          </motion.div>

          {/* Error Message */}
          <h1 className="text-3xl lg:text-4xl font-black text-white  mb-4">
            Payment Failed
          </h1>
          <p className="text-text text-lg mb-8">
            {decodedError || "Your payment could not be processed. Please try again."}
          </p>

          {/* Order ID if available */}
          {orderId && (
            <div className="bg-white/5 rounded-xl p-4 mb-8">
              <p className="text-text text-sm">
                Order ID: <span className="text-white font-semibold">#{orderId}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme3 text-white rounded-xl font-semibold hover:bg-theme transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Payment
            </button>

            <LocalizedLink
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Checkout
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
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-text text-sm">
              <strong className="text-yellow-400">Note:</strong> If you were charged, the amount will be refunded automatically within 5-7 business days.
            </p>
          </div>

          {/* Help Text */}
          <p className="text-text text-sm mt-6">
            If you continue to experience issues, please contact our support team.
          </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  );
}

export default function StripeFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-bg3 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-theme3 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <StripeFailedContent />
    </Suspense>
  );
}
