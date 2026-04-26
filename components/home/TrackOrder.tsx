"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/Provider";

export function TrackOrder() {
  const { t } = useT();
  const [orderId, setOrderId] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/orders/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-mj-gold-300 bg-gradient-to-br from-mj-cream to-mj-ivory px-6 py-10 md:px-12 md:py-14">
      <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-mj-gold-300/20 blur-3xl" aria-hidden />
      <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="hidden md:flex h-20 w-20 items-center justify-center rounded-2xl bg-mj-maroon-700 text-mj-gold-200 shadow-[var(--shadow-mj-soft)]">
          <Package className="size-9" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mj-gold-600">{t("track.eyebrow")}</p>
          <h2 className="mt-1 font-display text-3xl md:text-4xl text-mj-ink">{t("track.title")}</h2>
          <p className="mt-2 text-mj-mute">{t("track.desc")}</p>

          <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-mj-mute" />
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder={t("track.placeholder")}
                aria-label={t("track.title")}
                className="w-full h-12 rounded-full border border-mj-line bg-white pl-11 pr-4 text-sm font-mono uppercase tracking-wider text-mj-ink focus:border-mj-gold-500 focus:outline-none focus:ring-2 focus:ring-mj-gold-300/50"
              />
            </div>
            <Button type="submit" size="lg" disabled={!orderId.trim()}>
              {t("track.cta")}
            </Button>
          </form>

          <p className="mt-3 text-xs text-mj-mute">{t("track.tip")}</p>
        </div>
      </div>
    </div>
  );
}
