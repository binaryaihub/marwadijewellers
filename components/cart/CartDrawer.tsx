"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, cartSubtotal, cartCount } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";
import { Button } from "@/components/ui/Button";
import { CartLine } from "./CartLine";
import { formatINR } from "@/lib/format";
import { useEffect } from "react";
import { useT } from "@/lib/i18n/Provider";

export function CartDrawer() {
  const { t } = useT();
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const subtotal = cartSubtotal(items);
  const count = cartCount(items);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-mj-maroon-900/45 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-mj-ivory shadow-2xl"
            role="dialog"
            aria-label={t("cart.title")}
          >
            <header className="flex items-center justify-between border-b border-mj-line px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-mj-maroon-700" />
                <h2 className="font-display text-xl">{t("cart.title")}</h2>
                {count > 0 && (
                  <span className="text-xs text-mj-mute">
                    ({count === 1 ? t("cart.itemSingular") : t("cart.items", { n: count })})
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-mj-cream"
                aria-label={t("nav.closeMenu")}
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <EmptyState onClose={() => setOpen(false)} />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {items.map((item) => (
                    <CartLine key={item.slug} item={item} />
                  ))}
                </div>

                <footer className="border-t border-mj-line bg-white px-5 py-4 space-y-3">
                  <Row label={t("cart.subtotal")} value={formatINR(subtotal)} />
                  <Row label={t("cart.shipping")} value={t("shipping.always")} highlight />
                  <div className="mj-divider opacity-50" />
                  <Row label={t("cart.total")} value={formatINR(subtotal)} bold />
                  <Link
                    href="/checkout"
                    onClick={() => {
                      // Cart-flow checkout — clear any stale buy-now slot so
                      // the checkout summary reflects the cart, not a single
                      // item from an earlier "Buy now" click.
                      useCheckoutMethod.getState().setBuyNow(null);
                      setOpen(false);
                    }}
                  >
                    <Button size="lg" className="w-full">
                      {t("cart.checkout")}
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <p className="text-center text-xs text-mj-mute">{t("cart.secureNote")}</p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className={bold ? "font-display text-base" : "text-mj-mute"}>{label}</span>
      <span
        className={
          bold
            ? "font-display text-lg text-mj-maroon-800"
            : highlight
              ? "text-emerald-700 font-semibold"
              : "text-mj-ink font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="h-20 w-20 rounded-full bg-mj-cream flex items-center justify-center mb-4">
        <ShoppingBag className="size-8 text-mj-gold-600" />
      </div>
      <p className="font-display text-2xl text-mj-ink">{t("cart.empty.title")}</p>
      <p className="mt-2 text-sm text-mj-mute max-w-xs">{t("cart.empty.desc")}</p>
      <Link href="/shop" onClick={onClose} className="mt-6">
        <Button>{t("cart.empty.cta")}</Button>
      </Link>
    </div>
  );
}
