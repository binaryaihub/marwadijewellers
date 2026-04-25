import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

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
