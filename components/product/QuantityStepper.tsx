"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/Provider";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  const { t } = useT();
  return (
    <div className={cn("inline-flex items-center rounded-full border border-mj-line bg-white", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mj-ink hover:bg-mj-cream disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={t("cart.qty.dec")}
      >
        <Minus className="size-4" />
      </button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-mj-ink hover:bg-mj-cream disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={t("cart.qty.inc")}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
