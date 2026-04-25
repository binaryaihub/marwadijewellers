"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { CartItem, useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { useT } from "@/lib/i18n/Provider";

export function CartLine({ item }: { item: CartItem }) {
  const { t } = useT();
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  return (
    <div className="flex gap-3">
      <Link href={`/shop/${item.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-mj-cream mj-card">
        <ProductImage src={item.image} alt={item.name} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/shop/${item.slug}`} className="font-serif-soft text-base text-mj-ink line-clamp-2 hover:text-mj-maroon-700">
            {item.name}
          </Link>
          <button
            onClick={() => remove(item.slug)}
            aria-label={t("cart.removeAria", { name: item.name })}
            className="text-mj-mute hover:text-mj-maroon-700"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <p className="mt-1 text-sm font-semibold text-mj-maroon-800">{formatINR(item.price)}</p>
        <div className="mt-3 flex items-center justify-between">
          <QuantityStepper value={item.qty} onChange={(q) => setQty(item.slug, q)} />
          <span className="text-sm font-semibold text-mj-ink">{formatINR(item.price * item.qty)}</span>
        </div>
      </div>
    </div>
  );
}
