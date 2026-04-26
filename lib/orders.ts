import "server-only";
import { db } from "./db";
import { orders, orderItems, OrderRow, OrderItemRow } from "./db/schema";
import { desc, eq, isNull, isNotNull } from "drizzle-orm";
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
  const resolved = await Promise.all(
    input.items.map(async (it) => {
      const product = await getBySlug(it.slug);
      if (!product) return null;
      // Reject anything not orderable. Customers shouldn't be able to place
      // orders for products that admins have disabled or archived.
      if (product.status !== "active") return { error: `${product.name} is not available right now` };
      return {
        productSlug: product.slug,
        productName: product.name,
        unitPrice: product.price,
        qty: it.qty,
        imageRef: product.images[0],
      };
    }),
  );

  const errored = resolved.find((r): r is { error: string } => !!r && "error" in r);
  if (errored) throw new Error(errored.error);

  const lineItems = resolved.filter(
    (x): x is { productSlug: string; productName: string; unitPrice: number; qty: number; imageRef: string } =>
      !!x && !("error" in x),
  );

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

export interface ListOrdersOpts {
  /** When true, returns only archived orders. When false (default), only non-archived. */
  archived?: boolean;
}

export async function listOrders(opts: ListOrdersOpts = {}): Promise<OrderWithItems[]> {
  const where = opts.archived ? isNotNull(orders.archivedAt) : isNull(orders.archivedAt);
  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt));
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

export async function setStatus(
  orderId: string,
  status: OrderStatus,
  reason?: string,
): Promise<OrderWithItems | null> {
  const update: Partial<typeof orders.$inferInsert> = { status };
  if (status === "cancelled") {
    update.cancelledAt = new Date();
    if (reason) update.cancellationReason = reason;
  }
  await db.update(orders).set(update).where(eq(orders.id, orderId));
  return getOrder(orderId);
}

export async function archiveOrder(orderId: string): Promise<OrderWithItems | null> {
  await db.update(orders).set({ archivedAt: new Date() }).where(eq(orders.id, orderId));
  return getOrder(orderId);
}

export async function unarchiveOrder(orderId: string): Promise<OrderWithItems | null> {
  await db.update(orders).set({ archivedAt: null }).where(eq(orders.id, orderId));
  return getOrder(orderId);
}
