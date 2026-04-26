"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "./QuantityStepper";
import { Product } from "@/lib/products";
import { ShoppingBag } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";

export function AddToCartBlock({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const { t } = useT();

  const orderable = product.status === "active";
  const outOfStock = product.stock === 0;

  const onAdd = () => {
    if (!orderable) return;
    add(
      { slug: product.slug, name: product.name, price: product.price, image: product.images[0] },
      qty,
    );
    toast(t("product.addedQty", { name: product.name, qty }), "success");
  };

  if (product.status === "archived") {
    return (
      <div className="rounded-2xl border border-mj-line bg-mj-cream p-4 text-sm text-mj-mute">
        <p className="font-semibold text-mj-ink">{t("product.discontinued")}</p>
        <p className="mt-1">{t("product.discontinued.desc")}</p>
      </div>
    );
  }

  if (product.status === "disabled") {
    return (
      <div className="rounded-2xl border border-mj-line bg-mj-cream p-4 text-sm text-mj-mute">
        <p className="font-semibold text-mj-ink">{t("product.unavailable")}</p>
        <p className="mt-1">{t("product.unavailable.desc")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <QuantityStepper value={qty} onChange={setQty} max={Math.min(product.stock, 99)} />
      <Button size="lg" onClick={onAdd} disabled={outOfStock} className="flex-1">
        <ShoppingBag className="size-4" />
        {outOfStock ? t("product.soldOut") : t("product.addToCart")}
      </Button>
    </div>
  );
}
