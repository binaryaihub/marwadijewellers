"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shippingFee } from "./pricing";

export { shippingFee };

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: state.items.map((i) => (i.slug === item.slug ? { ...i, qty: i.qty + qty } : i)),
              open: true,
            };
          }
          return { items: [...state.items, { ...item, qty }], open: true };
        }),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((state) => ({
          items: qty <= 0 ? state.items.filter((i) => i.slug !== slug) : state.items.map((i) => (i.slug === slug ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "mj-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}
