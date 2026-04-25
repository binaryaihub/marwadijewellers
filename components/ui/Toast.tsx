"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, tone = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ items: [...s.items, { id, message, tone }] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export function toast(message: string, tone: ToastTone = "info") {
  useToastStore.getState().push(message, tone);
}

export function ToastViewport() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: -16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-full border bg-white px-4 py-2.5 shadow-[var(--shadow-mj-soft)]",
              t.tone === "success" && "border-emerald-200",
              t.tone === "error" && "border-mj-maroon-700/30",
              t.tone === "info" && "border-mj-gold-300",
            )}
          >
            {t.tone === "success" && <CheckCircle2 className="size-4 text-emerald-600" />}
            {t.tone === "error" && <AlertCircle className="size-4 text-mj-maroon-700" />}
            {t.tone === "info" && <CheckCircle2 className="size-4 text-mj-gold-600" />}
            <span className="text-sm text-mj-ink">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-2 text-mj-mute hover:text-mj-ink"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
