"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CartLine } from "@/components/cart/CartLine";
import { useCart, cartSubtotal } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";
import { formatINR } from "@/lib/format";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";

export default function CartPage() {
  const { t } = useT();
  const items = useCart((s) => s.items);
  const subtotal = cartSubtotal(items);

  return (
    <Container className="py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-5xl text-mj-ink mb-8">{t("cart.title")}</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto h-20 w-20 rounded-full bg-mj-cream flex items-center justify-center mb-4">
            <ShoppingBag className="size-8 text-mj-gold-600" />
          </div>
          <p className="font-display text-2xl">{t("cart.empty.page.title")}</p>
          <p className="mt-2 text-mj-mute">{t("cart.empty.page.desc")}</p>
          <Link href="/shop" className="inline-block mt-6">
            <Button>{t("cart.empty.cta")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {items.map((item) => (
              <CartLine key={item.slug} item={item} />
            ))}
          </div>
          <aside className="md:sticky md:top-24 h-fit mj-card p-6 bg-white">
            <h2 className="font-display text-xl mb-4">{t("cart.summary")}</h2>
            <div className="space-y-2 text-sm">
              <Row label={t("cart.subtotal")} value={formatINR(subtotal)} />
              <Row label={t("cart.shipping")} value={t("shipping.always")} highlight />
              <div className="mj-divider opacity-50 my-3" />
              <Row label={t("cart.total")} value={formatINR(subtotal)} bold />
            </div>
            <Link
              href="/checkout"
              onClick={() => useCheckoutMethod.getState().setBuyNow(null)}
              className="block mt-5"
            >
              <Button size="lg" className="w-full">
                {t("cart.checkout")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-mj-mute">{t("cart.upiNote")}</p>
          </aside>
        </div>
      )}
    </Container>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={bold ? "font-display text-base" : "text-mj-mute"}>{label}</span>
      <span
        className={
          bold
            ? "font-display text-lg text-mj-maroon-800"
            : highlight
              ? "text-emerald-700 font-semibold"
              : "font-medium text-mj-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
