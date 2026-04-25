"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";
import type { Product } from "@/lib/products";

export function FeaturedSection({ products }: { products: Product[] }) {
  const { t } = useT();
  return (
    <div>
      <ProductGrid products={products} />
      <div className="mt-10 text-center">
        <Link href="/shop" className="inline-flex items-center gap-2 text-mj-maroon-700 font-semibold hover:gap-3 transition-all">
          {t("shop.featuredCta")} <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
