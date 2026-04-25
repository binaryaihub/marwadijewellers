"use client";

import { ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";

export function WhyMJ() {
  const { t } = useT();
  const features = [
    { icon: ShieldCheck, title: t("why.quality.title"), desc: t("why.quality.desc") },
    { icon: Sparkles, title: t("why.craft.title"), desc: t("why.craft.desc") },
    { icon: Truck, title: t("why.shipping.title"), desc: t("why.shipping.desc") },
    { icon: RotateCcw, title: t("why.returns.title"), desc: t("why.returns.desc") },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <div key={f.title} className="mj-card bg-white p-6">
            <div className="h-12 w-12 rounded-full bg-mj-gold-100 text-mj-gold-700 flex items-center justify-center">
              <Icon className="size-5" />
            </div>
            <h3 className="font-display text-lg mt-4">{f.title}</h3>
            <p className="mt-2 text-sm text-mj-mute leading-relaxed">{f.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
