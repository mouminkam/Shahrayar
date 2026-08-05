/**
 * Stripe Payment Processor
 * Handles payment intent creation, popup management, and payment confirmation
 */

import api from "../../api";

export interface CreatePaymentIntentResult {
  success: boolean;
  client_secret?: string;
  payment_intent_id?: string;
  amount?: number;
  currency?: string;
  order_number?: string;
  error?: string;
}

/**
 * Create Stripe Payment Intent via API (Web API).
 * publishable_key is not returned — use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env variable instead.
 */
export const createStripePaymentIntent = async (
  orderId: string | number
): Promise<CreatePaymentIntentResult> => {
  try {
    const response = await api.payments.createStripePaymentIntentWeb(orderId);

    if (response.success && response.data) {
      const data = response.data as {
        client_secret: string;
        payment_intent_id: string;
        amount?: number;
        currency?: string;
        order_number?: string;
      };
      return {
        success: true,
        client_secret: data.client_secret,
        payment_intent_id: data.payment_intent_id,
        amount: data.amount,
        currency: data.currency,
        order_number: data.order_number,
      };
    }

    return { success: false, error: response.message || "Failed to create payment intent" };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to create payment intent. Please try again.",
    };
  }
};

/**
 * Open Stripe Payment Popup Window.
 * @deprecated Not currently used — BillingForm.tsx calls createStripePaymentIntent() directly
 * and redirects via router.push() instead of using a popup.
 */
export const openStripePaymentPopup = (orderId: string | number, clientSecret: string): Window | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const paymentUrl = `/checkout/stripe/pay?order_id=${orderId}&client_secret=${encodeURIComponent(clientSecret)}`;

  const width = 600;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const popup = window.open(
    paymentUrl,
    "StripePayment",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    return null;
  }

  return popup;
};

export interface ProcessPaymentResult {
  success: boolean;
  popup?: Window;
  client_secret?: string;
  payment_intent_id?: string;
  error?: string;
}

/**
 * @deprecated Not currently used — BillingForm.tsx handles the payment flow with redirects
 * instead of a popup window.
 */
export const processStripePayment = async (orderId: string | number): Promise<ProcessPaymentResult> => {
  const intentResult = await createStripePaymentIntent(orderId);

  if (!intentResult.success || !intentResult.client_secret) {
    return { success: false, error: intentResult.error };
  }

  const popup = openStripePaymentPopup(orderId, intentResult.client_secret);

  if (!popup) {
    const paymentUrl = `/checkout/stripe/pay?order_id=${orderId}&client_secret=${encodeURIComponent(
      intentResult.client_secret
    )}`;
    window.open(paymentUrl, "_blank");
    return {
      success: false,
      error: "Popup blocked. Payment page opened in new tab. Please complete payment there.",
    };
  }

  return {
    success: true,
    popup,
    client_secret: intentResult.client_secret,
    payment_intent_id: intentResult.payment_intent_id,
  };
};
