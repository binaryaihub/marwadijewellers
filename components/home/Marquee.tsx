"use client";

import { useT } from "@/lib/i18n/Provider";

export function PromoMarquee() {
  const { t } = useT();
  const messages = [
    t("marquee.shipping"),
    t("marquee.cod"),
    t("marquee.imitation"),
    t("marquee.returns"),
    t("marquee.upi"),
    t("marquee.crafted"),
  ];
  const doubled = [...messages, ...messages];
  return (
    <div className="bg-mj-maroon-700 text-mj-gold-200 py-3 overflow-hidden border-y border-mj-gold-500/20">
      <div className="flex whitespace-nowrap marquee-track w-max">
        {doubled.map((m, i) => (
          <span key={i} className="text-xs uppercase tracking-[0.28em] font-semibold px-8 inline-flex items-center">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
