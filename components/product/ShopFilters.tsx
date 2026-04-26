"use client";

import { useState, useMemo } from "react";
import { Product, Subcategory } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/Provider";
import type { DictKey } from "@/lib/i18n/dict";

type Sort = "featured" | "price-asc" | "price-desc" | "newest";

export function ShopFilters({
  products,
  isAdminView,
}: {
  products: Product[];
  isAdminView?: boolean;
}) {
  const { t } = useT();

  const subcategories = useMemo(() => {
    const set = new Set<Subcategory>();
    products.forEach((p) => set.add(p.subcategory));
    return Array.from(set);
  }, [products]);

  const [sub, setSub] = useState<Subcategory | "all">("all");
  const [sort, setSort] = useState<Sort>("featured");

  const filtered = useMemo(() => {
    let list = products;
    if (sub !== "all") list = list.filter((p) => p.subcategory === sub);

    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => Number(!!b.new) - Number(!!a.new));
        break;
      case "featured":
      default:
        list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return list;
  }, [products, sub, sort]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2 -mx-1">
          <Chip active={sub === "all"} onClick={() => setSub("all")}>
            {t("filters.all")}
          </Chip>
          {subcategories.map((s) => (
            <Chip key={s} active={sub === s} onClick={() => setSub(s)}>
              {t(`sub.${s}` as DictKey)}
            </Chip>
          ))}
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-mj-mute">
          {t("filters.sort")}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-mj-line bg-white px-4 py-2 text-sm text-mj-ink focus:border-mj-gold-500 focus:outline-none"
          >
            <option value="featured">{t("filters.sort.featured")}</option>
            <option value="newest">{t("filters.sort.newest")}</option>
            <option value="price-asc">{t("filters.sort.priceAsc")}</option>
            <option value="price-desc">{t("filters.sort.priceDesc")}</option>
          </select>
        </label>
      </div>

      <ProductGrid products={filtered} isAdminView={isAdminView} />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm capitalize transition-all",
        active
          ? "border-mj-maroon-700 bg-mj-maroon-700 text-mj-ivory shadow-[0_4px_12px_-6px_rgba(123,30,43,0.6)]"
          : "border-mj-line bg-white text-mj-ink hover:border-mj-gold-300",
      )}
    >
      {children}
    </button>
  );
}
