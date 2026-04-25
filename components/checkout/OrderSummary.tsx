"use client";

import { useCart, cartSubtotal } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";
import { paymentBreakdown } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import { useT } from "@/lib/i18n/Provider";

export function OrderSummary() {
  const { t } = useT();
  const items = useCart((s) => s.items);
  const method = useCheckoutMethod((s) => s.method);
  const subtotal = cartSubtotal(items);
  const breakdown = paymentBreakdown(subtotal, method);

  return (
    <aside className="mj-card bg-white p-6">
      <h2 className="font-display text-xl mb-4">{t("checkout.summary")}</h2>
      <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.slug} className="flex gap-3 items-start">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-mj-cream">
              <ProductImage src={item.image} alt={item.name} />
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mj-maroon-700 px-1 text-[10px] font-bold text-mj-gold-200">
                {item.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-mj-ink line-clamp-2">{item.name}</p>
              <p className="text-xs text-mj-mute mt-0.5">{formatINR(item.price)} × {item.qty}</p>
            </div>
            <p className="text-sm font-semibold">{formatINR(item.price * item.qty)}</p>
          </li>
        ))}
      </ul>

      <div className="mj-divider opacity-60 my-4" />

      <div className="space-y-2 text-sm">
        <Row label={t("cart.subtotal")} value={formatINR(breakdown.subtotal)} />
        <Row label={t("cart.shipping")} value={t("shipping.always")} muted />
        <div className="mj-divider opacity-50 my-2" />
        <Row label={t("cart.total")} value={formatINR(breakdown.total)} bold />
      </div>

      {method === "cod" && breakdown.balance > 0 && (
        <div className="mt-4 rounded-2xl border border-mj-gold-300 bg-mj-gold-100/40 p-4 space-y-2 text-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-mj-mute uppercase text-[11px] tracking-wider">{t("summary.payNow")}</span>
            <span className="font-display text-xl text-mj-maroon-800">{formatINR(breakdown.advance)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-mj-mute uppercase text-[11px] tracking-wider">{t("summary.payOnDelivery")}</span>
            <span className="font-semibold text-mj-ink">{formatINR(breakdown.balance)}</span>
          </div>
          <p className="text-[11px] text-mj-mute pt-1 leading-relaxed">{t("summary.codFootnote")}</p>
        </div>
      )}
    </aside>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={bold ? "font-display text-base" : "text-mj-mute"}>{label}</span>
      <span
        className={
          bold
            ? "font-display text-lg text-mj-maroon-800"
            : muted
              ? "text-emerald-700 font-semibold"
              : "text-mj-ink font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
