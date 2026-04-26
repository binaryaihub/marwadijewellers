"use client";

import { create } from "zustand";
import { useCart, type CartItem } from "./cart-store";
import type { PaymentMethod } from "./pricing";

interface CheckoutState {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  /**
   * Single-item express checkout. When non-null, the checkout page treats
   * this as the only line item — your regular cart is left intact. Set on
   * "Buy now" click; cleared once the order is placed (on the pay page).
   */
  buyNow: CartItem | null;
  setBuyNow: (item: CartItem | null) => void;
}

export const useCheckoutMethod = create<CheckoutState>((set) => ({
  method: "upi",
  setMethod: (method) => set({ method }),
  buyNow: null,
  setBuyNow: (buyNow) => set({ buyNow }),
}));

/**
 * Returns the line items the checkout flow should operate on.
 * Buy-now item wins when present; otherwise falls back to the cart.
 */
export function useCheckoutItems(): CartItem[] {
  const cartItems = useCart((s) => s.items);
  const buyNow = useCheckoutMethod((s) => s.buyNow);
  return buyNow ? [buyNow] : cartItems;
}
