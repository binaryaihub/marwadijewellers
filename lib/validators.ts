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

// ── Product admin ──────────────────────────────────────────────────────
export const productStatusSchema = z.enum(["active", "disabled", "archived"]);
export const returnPolicyTypeSchema = z.enum(["returnable", "exchange-only", "non-returnable"]);

export const productWriteSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  name: z.string().min(2, "Name required").max(140),
  category: z.enum(["women", "men"]),
  subcategory: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Subcategory can only contain lowercase letters, numbers, and hyphens"),
  price: z.coerce.number().int().min(0).max(1_000_000),
  mrp: z.coerce.number().int().min(0).max(1_000_000),
  material: z.string().max(200).optional().default(""),
  occasion: z.array(z.string().min(1).max(40)).default([]),
  images: z.array(z.string().min(1)).default([]),
  description: z.string().max(4000).optional().default(""),
  dimensions: z.string().max(200).optional().or(z.literal("")),
  care: z.string().max(500).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0).max(99_999).default(0),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  status: productStatusSchema.default("active"),
  returnPolicyType: returnPolicyTypeSchema.default("returnable"),
  returnDays: z.coerce.number().int().min(0).max(365).default(7),
  returnNote: z.string().max(300).optional().or(z.literal("")),
});

export type ProductWriteInput = z.infer<typeof productWriteSchema>;

export const productPatchSchema = productWriteSchema.partial().omit({ slug: true });
export const productStatusBodySchema = z.object({ status: productStatusSchema });
