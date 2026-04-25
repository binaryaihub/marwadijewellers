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

  const onAdd = () => {
    add(
      { slug: product.slug, name: product.name, price: product.price, image: product.images[0] },
      qty,
    );
    toast(t("product.addedQty", { name: product.name, qty }), "success");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <QuantityStepper value={qty} onChange={setQty} max={Math.min(product.stock, 99)} />
      <Button size="lg" onClick={onAdd} disabled={product.stock === 0} className="flex-1">
        <ShoppingBag className="size-4" />
        {product.stock === 0 ? t("product.soldOut") : t("product.addToCart")}
      </Button>
    </div>
  );
}
