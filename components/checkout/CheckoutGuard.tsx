"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";

export function CheckoutGuard() {
  const items = useCart((s) => s.items);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Wait a beat for zustand-persist to hydrate from localStorage.
      const t = setTimeout(() => {
        if (useCart.getState().items.length === 0) router.replace("/cart");
      }, 250);
      return () => clearTimeout(t);
    }
  }, [items.length, router]);

  return null;
}
