import { z } from "zod";

export const addressSchema = z.object({
  customerName: z.string().min(2, "Please enter your full name").max(80),
  customerPhone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  customerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  addressLine1: z.string().min(4, "Address required").max(120),
  addressLine2: z.string().max(120).optional().or(z.literal("")),
  landmark: z.string().max(80).optional().or(z.literal("")),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const cartItemSchema = z.object({
  slug: z.string().min(1),
  qty: z.number().int().min(1).max(99),
});

export const paymentMethodSchema = z.enum(["upi", "cod"]);
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

export const createOrderSchema = z.object({
  paymentMethod: paymentMethodSchema,
  address: addressSchema,
  items: z.array(cartItemSchema).min(1),
});

export const utrSchema = z.object({
  utr: z
    .string()
    .trim()
    .regex(/^\d{10,22}$/, "Enter the UTR / transaction reference (10–22 digits)"),
  notes: z.string().max(500).optional().or(z.literal("")),
});
