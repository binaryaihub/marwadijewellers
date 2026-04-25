"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";

export function CategoryShowcase() {
  const { t } = useT();

  const categories = [
    {
      href: "/shop/women",
      label: t("category.women.label"),
      title: t("category.women.title"),
      sub: t("category.women.sub"),
      key: "women",
      palette: { from: "#7B1E2B", to: "#A8324A", accent: "#F1D98A" },
    },
    {
      href: "/shop/men",
      label: t("category.men.label"),
      title: t("category.men.title"),
      sub: t("category.men.sub"),
      key: "men",
      palette: { from: "#4A0F1A", to: "#621826", accent: "#D4AF37" },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {categories.map((cat) => (
        <Link
          key={cat.href}
          href={cat.href}
          className="group relative overflow-hidden rounded-3xl mj-card aspect-[4/5] md:aspect-[5/6]"
        >
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              background: `linear-gradient(160deg, ${cat.palette.from} 0%, ${cat.palette.to} 100%)`,
            }}
          />
          <div className="absolute inset-0 mj-mandala !opacity-[0.08]" />

          <motion.svg
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            viewBox="0 0 200 200"
            className="absolute inset-0 m-auto h-2/3 w-2/3"
          >
            <defs>
              <radialGradient id={`g-${cat.key}`} cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor={cat.palette.accent} stopOpacity="0.55" />
                <stop offset="100%" stopColor={cat.palette.accent} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill={`url(#g-${cat.key})`} />
            <circle cx="100" cy="100" r="60" fill="none" stroke={cat.palette.accent} strokeOpacity="0.4" />
            <circle cx="100" cy="100" r="44" fill="none" stroke={cat.palette.accent} strokeOpacity="0.6" strokeDasharray="3 4" />
            <circle cx="100" cy="100" r="20" fill={cat.palette.accent} fillOpacity="0.18" />
          </motion.svg>

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-mj-ivory">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mj-gold-200">{cat.label}</p>
            <h3 className="font-display text-3xl md:text-5xl mt-1">{cat.title}</h3>
            <p className="mt-1 text-mj-ivory/75">{cat.sub}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-mj-gold-200 group-hover:gap-3 transition-all">
              {t("category.explore")} <ArrowRight className="size-4" />
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
