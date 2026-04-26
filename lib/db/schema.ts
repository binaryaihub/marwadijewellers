import { pgTable, text, integer, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  category: text("category", { enum: ["women", "men"] }).notNull(),
  subcategory: text("subcategory").notNull(),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
  material: text("material").notNull().default(""),
  // Newline-separated values keep the schema dialect-portable.
  occasion: text("occasion").notNull().default(""),
  images: text("images").notNull().default(""),
  description: text("description").notNull().default(""),
  dimensions: text("dimensions"),
  care: text("care"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  status: text("status", { enum: ["active", "disabled", "archived"] })
    .notNull()
    .default("active"),
  returnPolicyType: text("return_policy_type", {
    enum: ["returnable", "exchange-only", "non-returnable"],
  })
    .notNull()
    .default("returnable"),
  returnDays: integer("return_days").notNull().default(7),
  returnNote: text("return_note"),
  sourceId: integer("source_id"),
  sourceCategory: text("source_category"),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  status: text("status", {
    enum: ["awaiting_payment", "pending_verification", "paid", "shipped", "delivered", "cancelled"],
  })
    .notNull()
    .default("awaiting_payment"),
  amountSubtotal: integer("amount_subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull().default(0),
  amountTotal: integer("amount_total").notNull(),

  paymentMethod: text("payment_method", { enum: ["upi", "cod"] }).notNull().default("upi"),
  paymentType: text("payment_type", { enum: ["full", "partial"] }).notNull().default("full"),
  advanceAmount: integer("advance_amount").notNull().default(0),
  balanceAmount: integer("balance_amount").notNull().default(0),

  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),

  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  landmark: text("landmark"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),

  utr: text("utr"),
  utrSubmittedAt: timestamp("utr_submitted_at", { withTimezone: false }),
  notes: text("notes"),

  // Soft-archive: orders are never deleted. Setting archivedAt hides them
  // from the default admin view but keeps them addressable by ID and
  // visible to the customer.
  archivedAt: timestamp("archived_at", { withTimezone: false }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: false }),
  cancellationReason: text("cancellation_reason"),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  unitPrice: integer("unit_price").notNull(),
  qty: integer("qty").notNull(),
  imageRef: text("image_ref"),
});

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
