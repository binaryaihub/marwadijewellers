export type PaymentMethod = "upi" | "cod";
export type PaymentType = "full" | "partial";

// Shipping is always free — the cost is built into product prices. We keep the
// helper around so the rest of the app doesn't have to special-case anything.
export function shippingFee(_subtotal: number): number {
  return 0;
}

// COD confirmation advance — paid via UPI to filter genuine orders.
//   < ₹2,000           → ₹100
//   ₹2,000 – ₹5,000    → ₹200
//   > ₹5,000           → ₹300
export function advanceFee(subtotal: number): number {
  if (subtotal < 2000) return 100;
  if (subtotal <= 5000) return 200;
  return 300;
}

export interface PaymentBreakdown {
  subtotal: number;
  shipping: number;
  total: number;
  advance: number;
  balance: number;
  paymentType: PaymentType;
}

export function paymentBreakdown(subtotal: number, method: PaymentMethod): PaymentBreakdown {
  const shipping = shippingFee(subtotal);
  const total = subtotal + shipping;
  if (method === "upi") {
    return { subtotal, shipping, total, advance: total, balance: 0, paymentType: "full" };
  }
  const advance = Math.min(advanceFee(total), total);
  return {
    subtotal,
    shipping,
    total,
    advance,
    balance: Math.max(0, total - advance),
    paymentType: "partial",
  };
}

export function formatItemTotals(items: { unitPrice: number; qty: number }[]) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  return paymentBreakdown(subtotal, "upi");
}
