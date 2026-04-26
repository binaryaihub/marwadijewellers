"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-store";

// Mounted once the user lands on the pay page — by then the order is committed
// to the database, so it's safe (and right) to clear the local cart.
export function CartClearOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
