"use client";

import { Zap, Banknote, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/Provider";
import { useCheckoutMethod, useCheckoutItems } from "@/lib/checkout-store";
import { cartSubtotal } from "@/lib/cart-store";
import { advanceFee } from "@/lib/pricing";
import { formatINR } from "@/lib/format";

export function PaymentMethodPicker() {
  const { t } = useT();
  const method = useCheckoutMethod((s) => s.method);
  const setMethod = useCheckoutMethod((s) => s.setMethod);
  const items = useCheckoutItems();
  const subtotal = cartSubtotal(items);
  const advance = advanceFee(subtotal);
  const balance = Math.max(0, subtotal - advance);

  return (
    <div>
      <h2 className="font-display text-xl mb-4">{t("checkout.payment.heading")}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Option
          active={method === "upi"}
          onClick={() => setMethod("upi")}
          icon={<Zap className="size-5" />}
          title={t("checkout.payment.upi.title")}
          desc={t("checkout.payment.upi.desc")}
          badge={t("checkout.payment.upi.badge")}
          line={
            <span className="text-mj-maroon-800">
              <strong>{formatINR(subtotal)}</strong> · {t("checkout.payment.upi.line")}
            </span>
          }
        />
        <Option
          active={method === "cod"}
          onClick={() => setMethod("cod")}
          icon={<Banknote className="size-5" />}
          title={t("checkout.payment.cod.title")}
          desc={t("checkout.payment.cod.desc")}
          line={
            <span className="text-mj-ink/85">
              <strong className="text-mj-maroon-800">{formatINR(advance)}</strong> {t("checkout.payment.cod.advanceShort")}
              {balance > 0 && (
                <>
                  {" · "}
                  <span className="text-mj-mute">{formatINR(balance)} {t("checkout.payment.cod.balanceShort")}</span>
                </>
              )}
            </span>
          }
        />
      </div>
      {method === "cod" && (
        <p className="mt-3 text-xs text-mj-mute leading-relaxed">
          <span className="font-semibold text-mj-ink">{t("checkout.payment.cod.tierHeading")}: </span>
          {t("checkout.payment.cod.tier")}
          <br />
          <span className="italic">{t("checkout.payment.cod.why")}</span>
        </p>
      )}
    </div>
  );
}

function Option({
  active,
  onClick,
  icon,
  title,
  desc,
  badge,
  line,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  line: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative text-left rounded-2xl border-2 bg-white p-5 transition-all flex flex-col gap-3",
        active
          ? "border-mj-gold-500 shadow-[var(--shadow-mj-glow)]"
          : "border-mj-line hover:border-mj-gold-300",
      )}
    >
      {badge && (
        <span className="absolute -top-2 right-4 inline-flex items-center gap-1 rounded-full bg-mj-gold-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mj-maroon-900">
          {badge}
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full",
              active ? "bg-mj-maroon-700 text-mj-gold-200" : "bg-mj-cream text-mj-mute",
            )}
          >
            {icon}
          </span>
          <div>
            <p className="font-display text-lg leading-tight text-mj-ink">{title}</p>
            <p className="text-xs text-mj-mute mt-0.5 max-w-[28ch]">{desc}</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
            active ? "border-mj-gold-500 bg-mj-gold-500 text-mj-maroon-900" : "border-mj-line",
          )}
        >
          {active && <Check className="size-3.5" />}
        </span>
      </div>
      <div className="text-sm border-t border-mj-line/60 pt-3">{line}</div>
    </button>
  );
}
