"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "./QuantityStepper";
import { Product } from "@/lib/products";
import { ShoppingBag, Zap } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";

export function AddToCartBlock({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const setBuyNow = useCheckoutMethod((s) => s.setBuyNow);
  const router = useRouter();
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

  const onBuyNow = () => {
    if (!orderable || outOfStock) return;
    setBuyNow({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      qty,
    });
    router.push("/checkout");
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
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} max={Math.min(product.stock, 99)} />
        <p className="text-xs text-mj-mute">
          {outOfStock
            ? t("product.soldOut")
            : product.stock <= 5
              ? t("product.onlyLeft", { n: product.stock })
              : null}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={onAdd}
          disabled={outOfStock}
          className="w-full"
        >
          <ShoppingBag className="size-4" />
          {outOfStock ? t("product.soldOut") : t("product.addToCart")}
        </Button>
        <Button
          size="lg"
          variant="gold"
          onClick={onBuyNow}
          disabled={outOfStock}
          className="w-full"
        >
          <Zap className="size-4" />
          {t("product.buyNow")}
        </Button>
      </div>
    </div>
  );
}
