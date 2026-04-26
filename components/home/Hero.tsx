"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/Provider";

// Pre-compute trig-derived SVG coordinates and round to 2 decimals so server
// and client produce bit-identical strings. Math.cos/sin can vary in the last
// few decimals between Node and browser V8 builds, which trips React's
// hydration mismatch detector.
const round2 = (n: number) => Math.round(n * 100) / 100;
const RADIAL_LINES = Array.from({ length: 24 }, (_, i) => ({
  x2: round2(Math.cos((i * Math.PI) / 12) * 230),
  y2: round2(Math.sin((i * Math.PI) / 12) * 230),
}));
const NECKLACE_DOTS = Array.from({ length: 11 }, (_, i) => {
  const ti = (i + 1) / 12;
  return {
    cx: round2(-150 + ti * 300),
    cy: round2(4 * Math.sin(Math.PI * ti) * 35 - 20 + 80 * Math.sin(Math.PI * ti)),
    r: 4 + (i === 5 ? 5 : 0),
  };
});

export function Hero() {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden bg-mj-maroon-900 text-mj-ivory">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(60% 60% at 80% 30%, rgba(212,175,55,0.55) 0%, transparent 60%), radial-gradient(40% 60% at 20% 80%, rgba(168,50,74,0.6) 0%, transparent 70%)",
        }}
      />
      <div
        className="mj-mandala absolute -right-32 -bottom-40 h-[600px] w-[600px] !opacity-[0.07]"
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:px-8 py-16 md:py-28 md:grid-cols-2 relative">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-mj-gold-500/30 bg-mj-gold-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-mj-gold-300"
          >
            <Sparkles className="size-3.5" /> {t("hero.eyebrow")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-mj-ivory"
          >
            {t("hero.headline.before")} <span className="gold-shimmer italic">{t("hero.headline.shimmer")}</span><br />
            {t("hero.headline.after")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-mj-ivory/75 text-base md:text-lg leading-relaxed"
          >
            {t("hero.sub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/shop/women">
              <Button variant="gold" size="lg">
                {t("hero.cta.women")} <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/shop/men">
              <Button variant="outline" size="lg" className="border-mj-gold-500/40 text-mj-gold-200 hover:bg-mj-gold-500 hover:text-mj-maroon-900">
                {t("hero.cta.men")}
              </Button>
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-[0.18em] text-mj-ivory/60"
          >
            <li>· {t("hero.bullets.quality")}</li>
            <li>· {t("hero.bullets.shipping")}</li>
            <li>· {t("hero.bullets.returns")}</li>
            <li>· {t("hero.bullets.payment")}</li>
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative mx-auto h-[420px] w-[420px] max-w-full md:h-[520px] md:w-[520px]"
        >
          <HeroOrnament />
        </motion.div>
      </div>
    </section>
  );
}

function HeroOrnament() {
  return (
    <svg viewBox="0 0 520 520" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F1D98A" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B08C25" />
          <stop offset="50%" stopColor="#F1D98A" />
          <stop offset="100%" stopColor="#8A6D1C" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="260" r="240" fill="url(#hero-glow)" />

      <g transform="translate(260 260)">
        {RADIAL_LINES.map(({ x2, y2 }, i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2={x2}
            y2={y2}
            stroke="url(#hero-gold)"
            strokeOpacity="0.18"
          />
        ))}
        <circle r="200" fill="none" stroke="url(#hero-gold)" strokeOpacity="0.45" strokeWidth="1.5" />
        <circle r="170" fill="none" stroke="url(#hero-gold)" strokeOpacity="0.3" strokeDasharray="2 6" />
        <circle r="130" fill="none" stroke="url(#hero-gold)" strokeOpacity="0.55" strokeWidth="1.5" />

        <path
          d="M -150 -20 Q 0 140 150 -20"
          fill="none"
          stroke="url(#hero-gold)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {NECKLACE_DOTS.map(({ cx, cy, r }, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="url(#hero-gold)" />
        ))}
        <g transform="translate(0 90)">
          <path d="M 0 -28 L 22 0 L 0 36 L -22 0 Z" fill="url(#hero-gold)" />
          <circle r="6" fill="#7B1E2B" />
        </g>
      </g>

      <g fill="#F1D98A">
        <circle cx="120" cy="120" r="2.5">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="430" cy="180" r="2">
          <animate attributeName="opacity" values="0;1;0" dur="2.6s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="380" cy="420" r="2.5">
          <animate attributeName="opacity" values="0;1;0" dur="3.4s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="380" r="2">
          <animate attributeName="opacity" values="0;1;0" dur="2.8s" begin="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}
