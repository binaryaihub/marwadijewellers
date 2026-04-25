"use client";

import { create } from "zustand";
import type { PaymentMethod } from "./pricing";

interface CheckoutState {
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
}

export const useCheckoutMethod = create<CheckoutState>((set) => ({
  method: "upi",
  setMethod: (method) => set({ method }),
}));
