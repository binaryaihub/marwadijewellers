import "server-only";
import { db } from "./db";
import { orders, orderItems, OrderRow, OrderItemRow } from "./db/schema";
import { desc, eq } from "drizzle-orm";
import { newOrderId } from "./id";
import { getBySlug } from "./products";
import { AddressInput } from "./validators";
import { paymentBreakdown, type PaymentMethod } from "./pricing";

export interface CreateOrderInput {
  paymentMethod: PaymentMethod;
  address: AddressInput;
  items: { slug: string; qty: number }[];
}

export interface OrderWithItems {
  order: OrderRow;
  items: OrderItemRow[];
}

export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  const lineItems = input.items
    .map((it) => {
      const product = getBySlug(it.slug);
      if (!product) return null;
      return {
        productSlug: product.slug,
        productName: product.name,
        unitPrice: product.price,
        qty: it.qty,
        imageRef: product.images[0],
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) {
    throw new Error("No valid items in order");
  }

  const subtotal = lineItems.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const breakdown = paymentBreakdown(subtotal, input.paymentMethod);

  const id = newOrderId();
  const now = new Date();

  await db.insert(orders).values({
    id,
    createdAt: now,
    status: "awaiting_payment",
    amountSubtotal: breakdown.subtotal,
    shippingFee: breakdown.shipping,
    amountTotal: breakdown.total,
    paymentMethod: input.paymentMethod,
    paymentType: breakdown.paymentType,
    advanceAmount: breakdown.advance,
    balanceAmount: breakdown.balance,
    customerName: input.address.customerName,
    customerPhone: input.address.customerPhone,
    customerEmail: input.address.customerEmail || null,
    addressLine1: input.address.addressLine1,
    addressLine2: input.address.addressLine2 || null,
    landmark: input.address.landmark || null,
    city: input.address.city,
    state: input.address.state,
    pincode: input.address.pincode,
  });

  await db.insert(orderItems).values(
    lineItems.map((l) => ({
      orderId: id,
      productSlug: l.productSlug,
      productName: l.productName,
      unitPrice: l.unitPrice,
      qty: l.qty,
      imageRef: l.imageRef,
    })),
  );

  return getOrder(id) as Promise<OrderWithItems>;
}

export async function getOrder(id: string): Promise<OrderWithItems | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { order, items };
}

export async function listOrders(): Promise<OrderWithItems[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const result: OrderWithItems[] = [];
  for (const o of rows) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
    result.push({ order: o, items });
  }
  return result;
}

export async function submitUtr(orderId: string, utr: string, notes?: string): Promise<OrderWithItems | null> {
  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) return null;
  if (existing.status !== "awaiting_payment" && existing.status !== "pending_verification") {
    throw new Error("Order is not awaiting payment");
  }
  await db
    .update(orders)
    .set({
      utr,
      utrSubmittedAt: new Date(),
      status: "pending_verification",
      notes: notes ? notes : existing.notes,
    })
    .where(eq(orders.id, orderId));
  return getOrder(orderId);
}

export type OrderStatus = OrderRow["status"];

export async function setStatus(orderId: string, status: OrderStatus): Promise<OrderWithItems | null> {
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  return getOrder(orderId);
}
