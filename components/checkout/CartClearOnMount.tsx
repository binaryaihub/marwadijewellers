"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";

// Mounted once the user lands on the pay page — the order is committed in
// Postgres at this point, so the local checkout state should be reset.
//
// Behavior:
//   • Buy-now flow → clear only the buy-now slot; the user's regular cart is
//     left intact (they may have other items they were keeping for later).
//   • Cart checkout flow → clear the cart.
export function CartClearOnMount() {
  const clearCart = useCart((s) => s.clear);
  const setBuyNow = useCheckoutMethod((s) => s.setBuyNow);

  useEffect(() => {
    const hadBuyNow = !!useCheckoutMethod.getState().buyNow;
    if (hadBuyNow) {
      setBuyNow(null);
    } else {
      clearCart();
    }
  }, [clearCart, setBuyNow]);

  return null;
}
