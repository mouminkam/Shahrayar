import { z } from "zod";

/**
 * Create checkout schema based on order type
 * @param orderType - "delivery" or "pickup"
 */
export const createCheckoutSchema = (orderType: string) => {
  const baseSchema = z.object({
    // Shipping address fields (required for delivery)
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    quote_id: z.string().nullable().optional(),

    // Payment and order fields
    paymentMethod: z.enum(["stripe", "cash"], "Please select a valid payment method"),
    scheduled_at: z.string().optional(),
    notes: z.string().max(500, "Notes are too long").optional(),
  });

  if (orderType === "delivery") {
    return baseSchema.refine(
      (data) => {
        return !!data.address && data.latitude !== null && data.longitude !== null;
      },
      {
        message: "Please select a delivery location",
        path: ["address"],
      }
    );
  }

  return baseSchema;
};

export type CheckoutFormData = z.infer<ReturnType<typeof createCheckoutSchema>>;

/**
 * Checkout Form Schema (default - pickup)
 */
export const checkoutSchema = createCheckoutSchema("pickup");

/**
 * Delivery Address Schema (for delivery orders)
 */
export const deliveryAddressSchema = z.object({
  address: z
    .string()
    .min(1, "Please select a delivery location"),
  latitude: z
    .number()
    .min(-90)
    .max(90, "Invalid latitude"),
  longitude: z
    .number()
    .min(-180)
    .max(180, "Invalid longitude"),
  quote_id: z
    .string()
    .nullable()
    .optional(),
});

export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>;

/**
 * Payment Method Schema
 */
export const paymentMethodSchema = z.enum(["stripe", "cash"], "Please select a valid payment method");

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
