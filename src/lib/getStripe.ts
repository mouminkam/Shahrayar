/**
 * Stripe client-side initialization.
 * Singleton pattern to ensure Stripe is loaded only once.
 * Fetches publishable key from API endpoint.
 */

import { loadStripe, type Stripe } from "@stripe/stripe-js";
import api from "../api";

let cachedPublishableKey: string | null = null;
let publishableKeyPromise: Promise<string> | null = null;
let stripePromise: Promise<Stripe | null> | null = null;

async function fetchStripePublishableKey(): Promise<string> {
  if (cachedPublishableKey) {
    return cachedPublishableKey;
  }

  if (publishableKeyPromise) {
    return publishableKeyPromise;
  }

  publishableKeyPromise = (async () => {
    try {
      const response = await api.payments.getStripeConfig();

      if (response.success && response.data?.publishable_key) {
        cachedPublishableKey = response.data.publishable_key;
        return cachedPublishableKey as string;
      }
      throw new Error(response.message || "Failed to get Stripe configuration");
    } catch (error) {
      console.error("Error fetching Stripe publishable key:", error);
      publishableKeyPromise = null;
      throw error;
    }
  })();

  return publishableKeyPromise;
}

/**
 * Get Stripe instance. Returns null on the server or if the key can't be fetched.
 */
const getStripe = async (): Promise<Stripe | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  if (stripePromise) {
    return stripePromise;
  }

  try {
    const publishableKey = await fetchStripePublishableKey();

    if (!publishableKey) {
      console.error("Stripe publishable key is missing");
      return null;
    }

    stripePromise = loadStripe(publishableKey);
    return stripePromise;
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
    return null;
  }
};

export default getStripe;
