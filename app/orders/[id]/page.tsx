import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getOrder } from "@/lib/orders";
import { formatINR, formatDate } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import { CheckCircle2, Clock, Package, Truck, Home, Banknote } from "lucide-react";
import { cn } from "@/lib/cn";
import type { OrderRow } from "@/lib/db/schema";
import { getT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n/dict";

export const dynamic = "force-dynamic";

const STEP_KEYS: Array<{ key: OrderRow["status"]; labelKey: DictKey; codLabelKey: DictKey; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "awaiting_payment", labelKey: "order.step.placed", codLabelKey: "order.step.placed", icon: Clock },
  { key: "pending_verification", labelKey: "order.step.received", codLabelKey: "order.step.advanceReceived", icon: CheckCircle2 },
  { key: "paid", labelKey: "order.step.verified", codLabelKey: "order.step.advanceVerified", icon: Package },
  { key: "shipped", labelKey: "order.step.shipped", codLabelKey: "order.step.shipped", icon: Truck },
  { key: "delivered", labelKey: "order.step.delivered", codLabelKey: "order.step.delivered", icon: Home },
];

export const metadata = { title: "Order status" };

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getOrder(id);
  if (!result) return notFound();
  const { t } = await getT();

  const { order, items } = result;
  const isCod = order.paymentMethod === "cod";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+91XXXXXXXXXX";
  const cancelled = order.status === "cancelled";
  const currentIndex = cancelled ? -1 : STEP_KEYS.findIndex((s) => s.key === order.status);
  const stepLabel = (i: number) => t(isCod ? STEP_KEYS[i].codLabelKey : STEP_KEYS[i].labelKey);

  return (
    <Container className="py-10 md:py-14" size="narrow">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mj-gold-600">{t("order.eyebrow")}</p>
        <h1 className="font-display text-3xl md:text-5xl text-mj-ink mt-1">#{order.id}</h1>
        <p className="text-mj-mute mt-2 text-sm">{t("order.placedOn", { date: formatDate(order.createdAt) })}</p>
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <Badge tone={cancelled ? "neutral" : order.status === "delivered" ? "green" : "gold"}>
            {cancelled ? t("order.cancelled") : stepLabel(currentIndex >= 0 ? currentIndex : 0)}
          </Badge>
          <Badge tone={isCod ? "neutral" : "gold"}>
            {isCod ? t("order.method.cod") : t("order.method.upi")}
          </Badge>
        </div>
      </div>

      {!cancelled && (
        <div className="mt-10 grid grid-cols-5 gap-2 md:gap-4">
          {STEP_KEYS.map((step, i) => {
            const Icon = step.icon;
            const done = i <= currentIndex;
            const active = i === currentIndex;
            return (
              <div key={step.key} className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "h-11 w-11 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all",
                    done ? "bg-mj-maroon-700 text-mj-gold-200" : "bg-mj-cream text-mj-mute",
                    active && "ring-4 ring-mj-gold-300/50",
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <p className={cn("mt-2 text-[11px] md:text-xs leading-tight", done ? "text-mj-ink font-medium" : "text-mj-mute")}>
                  {stepLabel(i)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {order.status === "awaiting_payment" && (
        <div className="mt-8 rounded-2xl border border-mj-gold-300 bg-mj-gold-100/40 p-5 text-center">
          <p className="text-mj-maroon-800 font-medium">
            {isCod ? t("order.awaiting.title.cod", { n: order.advanceAmount }) : t("order.awaiting.title")}
          </p>
          <p className="text-sm text-mj-mute mt-1">{t("order.awaiting.desc")}</p>
          <Link href={`/checkout/pay/${order.id}`} className="inline-block mt-3">
            <Button variant="gold">{t("order.awaiting.cta")}</Button>
          </Link>
        </div>
      )}

      {order.status === "pending_verification" && (
        <div className="mt-8 rounded-2xl border border-mj-gold-300 bg-mj-gold-100/40 p-5 text-center">
          <p className="text-mj-maroon-800 font-medium">{t("order.pending.title")}</p>
          <p className="text-sm text-mj-mute mt-1">{t("order.pending.desc")}</p>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="mt-8 rounded-2xl border border-mj-maroon-700/30 bg-mj-maroon-700/5 p-5">
          <p className="font-display text-lg text-mj-maroon-800">{t("order.cancelled.title")}</p>
          {order.cancelledAt && (
            <p className="mt-1 text-xs text-mj-mute">
              {t("order.cancelled.on", { date: formatDate(order.cancelledAt) })}
            </p>
          )}
          {order.cancellationReason && (
            <div className="mt-3 rounded-xl bg-white p-3 text-sm">
              <p className="text-[11px] uppercase tracking-wider text-mj-mute mb-1">
                {t("order.cancelled.reason")}
              </p>
              <p className="text-mj-ink">{order.cancellationReason}</p>
            </div>
          )}
          <p className="mt-3 text-sm text-mj-ink/85">
            {isCod ? t("order.cancelled.desc.cod") : t("order.cancelled.desc.upi")}
          </p>
        </div>
      )}

      {isCod && order.balanceAmount > 0 && (order.status === "paid" || order.status === "shipped") && (
        <div className="mt-8 rounded-2xl border border-mj-line bg-white p-5 flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mj-cream text-mj-maroon-700">
            <Banknote className="size-5" />
          </span>
          <div>
            <p className="font-display text-lg text-mj-ink">{t("order.cod.balanceDue")}</p>
            <p className="text-sm text-mj-mute">{t("order.cod.balanceDueDesc", { n: order.balanceAmount })}</p>
          </div>
        </div>
      )}

      <section className="mt-10 mj-card bg-white p-6">
        <h2 className="font-display text-xl mb-4">{t("order.items")}</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 items-center">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-mj-cream">
                <ProductImage src={item.imageRef ?? "placeholder://pendant/x"} alt={item.productName} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-mj-mute">{formatINR(item.unitPrice)} × {item.qty}</p>
              </div>
              <p className="text-sm font-semibold">{formatINR(item.unitPrice * item.qty)}</p>
            </li>
          ))}
        </ul>

        <div className="mj-divider opacity-60 my-5" />

        <div className="space-y-1.5 text-sm">
          <Row label={t("order.subtotal")} value={formatINR(order.amountSubtotal)} />
          <Row label={t("order.shipping")} value={t("shipping.always")} muted />
          <div className="mj-divider opacity-50 my-2" />
          <Row label={t("order.total")} value={formatINR(order.amountTotal)} bold />
          {isCod && (
            <>
              <div className="mj-divider opacity-50 my-2" />
              <Row label={t("order.cod.advance")} value={formatINR(order.advanceAmount)} />
              <Row label={t("order.cod.balanceDueShort")} value={formatINR(order.balanceAmount)} />
            </>
          )}
        </div>
      </section>

      <section className="mt-6 mj-card bg-white p-6">
        <h2 className="font-display text-xl mb-3">{t("order.shippingTo")}</h2>
        <p className="text-sm leading-relaxed text-mj-ink/85">
          {order.customerName}<br />
          {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}<br />
          {order.landmark && <>{order.landmark}<br /></>}
          {order.city}, {order.state} – {order.pincode}<br />
          {order.customerPhone}
        </p>
      </section>

      <div className="mt-8 text-center">
        <a
          href={`https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent(t("order.help.message", { id: order.id }))}`}
          className="text-sm text-mj-maroon-700 underline underline-offset-4 decoration-mj-gold-500 hover:text-mj-gold-600"
        >
          {t("order.help")}
        </a>
      </div>
    </Container>
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
              : "font-medium text-mj-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
