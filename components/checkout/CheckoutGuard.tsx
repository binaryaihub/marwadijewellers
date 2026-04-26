"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";

export function CheckoutGuard() {
  const items = useCart((s) => s.items);
  const buyNow = useCheckoutMethod((s) => s.buyNow);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Wait a beat for zustand-persist to hydrate from localStorage.
      const t = setTimeout(() => {
        const hasCart = useCart.getState().items.length > 0;
        const hasBuyNow = !!useCheckoutMethod.getState().buyNow;
        if (!hasCart && !hasBuyNow) router.replace("/cart");
      }, 250);
      return () => clearTimeout(t);
    }
  }, [items.length, buyNow, router]);

  return null;
}
