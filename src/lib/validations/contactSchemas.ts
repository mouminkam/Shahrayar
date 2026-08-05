import { z } from "zod";

/**
 * Contact Form Schema
 */
export const contactSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Name is too long")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Please enter a valid phone number"
    ),
  subject: z
    .enum(["complain", "greetings", "date", "price", "order"], "Please select a subject")
    .refine((val) => val !== "subject" as typeof val, {
      message: "Please select a subject",
    }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message is too long")
    .trim(),
  agree: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
});

export type ContactFormData = z.infer<typeof contactSchema>;
