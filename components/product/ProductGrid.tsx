"use client";

import { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { useT } from "@/lib/i18n/Provider";

export function ProductGrid({ products }: { products: Product[] }) {
  const { t } = useT();

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-2xl text-mj-ink">{t("filters.empty.title")}</p>
        <p className="mt-2 text-mj-mute">{t("filters.empty.desc")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.slug} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
