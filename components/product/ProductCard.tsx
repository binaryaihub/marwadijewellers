"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { formatINR, discountPercent } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "./ProductImage";
import { useCart } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";
import { toast } from "@/components/ui/Toast";
import { ShoppingBag, Pencil, Zap } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";
import type { DictKey } from "@/lib/i18n/dict";
import { cn } from "@/lib/cn";

export function ProductCard({
  product,
  priority,
  isAdminView,
}: {
  product: Product;
  priority?: boolean;
  isAdminView?: boolean;
}) {
  const add = useCart((s) => s.add);
  const setBuyNow = useCheckoutMethod((s) => s.setBuyNow);
  const router = useRouter();
  const { t } = useT();
  const off = discountPercent(product.price, product.mrp);
  const orderable = product.status === "active";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!orderable) return;
    add({ slug: product.slug, name: product.name, price: product.price, image: product.images[0] });
    toast(t("product.added", { name: product.name }), "success");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!orderable) return;
    setBuyNow({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      qty: 1,
    });
    router.push("/checkout");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative"
    >
      <Link
        href={`/shop/${product.slug}`}
        className={cn("block mj-card overflow-hidden", !orderable && "opacity-75")}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-mj-cream">
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]",
              !orderable && "grayscale-[40%]",
            )}
          >
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              priority={priority}
              label={product.subcategory}
            />
          </div>

          {orderable && product.images[1] && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <ProductImage src={product.images[1]} alt={`${product.name} alternate`} label={product.subcategory} />
            </div>
          )}

          <div className="absolute inset-x-3 top-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {product.new && orderable && <Badge tone="gold">{t("product.new")}</Badge>}
              {off > 0 && orderable && <Badge tone="maroon">{t("product.off", { n: off })}</Badge>}
              {product.status === "disabled" && (
                <Badge tone="neutral">{t("product.unavailable")}</Badge>
              )}
              {product.status === "archived" && (
                <Badge tone="maroon">{t("product.discontinued")}</Badge>
              )}
            </div>
            {orderable && product.stock <= 5 && product.stock > 0 && (
              <Badge tone="neutral">{t("product.onlyLeft", { n: product.stock })}</Badge>
            )}
          </div>

          {/* Hover-revealed quick actions: Add (cream) + Buy now (gold). */}
          {orderable && (
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-end gap-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              <button
                onClick={handleAdd}
                type="button"
                aria-label={t("product.addToCart") + " — " + product.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3.5 py-2 text-xs font-semibold text-mj-maroon-800 shadow-md hover:bg-mj-cream"
              >
                <ShoppingBag className="size-3.5" /> {t("product.add")}
              </button>
              <button
                onClick={handleBuyNow}
                type="button"
                aria-label={t("product.buyNow") + " — " + product.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-mj-gold-600 via-mj-gold-400 to-mj-gold-600 px-3.5 py-2 text-xs font-semibold text-mj-maroon-900 shadow-[0_4px_12px_-4px_rgba(212,175,55,0.6)] hover:brightness-110"
              >
                <Zap className="size-3.5" /> {t("product.buyNow")}
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-serif-soft text-lg leading-snug text-mj-ink line-clamp-2">{product.name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-mj-maroon-800">{formatINR(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-mj-mute line-through">{formatINR(product.mrp)}</span>
            )}
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-mj-mute">
            {t(`sub.${product.subcategory}` as DictKey)}
          </p>
        </div>
      </Link>

      {/* Admin edit pencil — sibling of the card link, not nested, to keep
          the markup valid (no <a> inside <a>). z-10 puts it above the card. */}
      {isAdminView && (
        <Link
          href={`/admin/products/${product.slug}/edit`}
          aria-label={`Edit ${product.name}`}
          className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-mj-maroon-700 text-mj-gold-200 shadow-md hover:bg-mj-maroon-800"
        >
          <Pencil className="size-3.5" />
        </Link>
      )}
    </motion.div>
  );
}
