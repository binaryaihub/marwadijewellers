"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Eye, EyeOff, Archive, ArchiveRestore } from "lucide-react";
import type { Product, ProductStatus } from "@/lib/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/product/ProductImage";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const STATUS_TONE: Record<ProductStatus, "green" | "neutral" | "maroon"> = {
  active: "green",
  disabled: "neutral",
  archived: "maroon",
};

export function AdminProductTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="mj-card bg-white p-10 text-center text-mj-mute">
        No products match your filters.
      </div>
    );
  }

  return (
    <div className="mj-card bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-mj-cream text-mj-mute uppercase text-[11px] tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">Product</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
            <th className="text-right px-4 py-3">Price</th>
            <th className="text-right px-4 py-3 hidden sm:table-cell">Stock</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <Row key={p.slug} product={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ product }: { product: Product }) {
  const [pending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useState<ProductStatus>(product.status);
  const router = useRouter();

  const setStatus = (next: ProductStatus) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${product.slug}/status`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed");
        setOptimisticStatus(next);
        toast(`Marked ${next}`, "success");
        router.refresh();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Failed to update", "error");
      }
    });
  };

  return (
    <tr
      className={cn(
        "border-t border-mj-line hover:bg-mj-cream/40",
        optimisticStatus === "archived" && "opacity-60",
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/admin/products/${product.slug}/edit`}
            className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-mj-cream"
          >
            <ProductImage src={product.images[0] ?? "placeholder://pendant/x"} alt={product.name} />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/admin/products/${product.slug}/edit`}
              className="block font-medium text-mj-ink hover:text-mj-maroon-700 truncate"
            >
              {product.name}
            </Link>
            <p className="text-[11px] text-mj-mute font-mono truncate">{product.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell capitalize text-mj-mute">
        {product.category} · {product.subcategory.replace(/-/g, " ")}
      </td>
      <td className="px-4 py-3 text-right">
        <p className="font-semibold text-mj-maroon-800">{formatINR(product.price)}</p>
        {product.mrp > product.price && (
          <p className="text-[11px] text-mj-mute line-through">{formatINR(product.mrp)}</p>
        )}
      </td>
      <td className="px-4 py-3 text-right hidden sm:table-cell tabular-nums">{product.stock}</td>
      <td className="px-4 py-3">
        <Badge tone={STATUS_TONE[optimisticStatus]}>{optimisticStatus}</Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 justify-end">
          <Link href={`/admin/products/${product.slug}/edit`}>
            <Button size="sm" variant="ghost" className="h-8 px-2.5">
              <Pencil className="size-3.5" />
            </Button>
          </Link>
          {optimisticStatus === "active" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2.5"
              onClick={() => setStatus("disabled")}
              disabled={pending}
              title="Disable from order"
            >
              <EyeOff className="size-3.5" />
            </Button>
          )}
          {optimisticStatus === "disabled" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2.5"
              onClick={() => setStatus("active")}
              disabled={pending}
              title="Enable"
            >
              <Eye className="size-3.5" />
            </Button>
          )}
          {optimisticStatus !== "archived" ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2.5 text-mj-maroon-700"
              onClick={() => setStatus("archived")}
              disabled={pending}
              title="Archive (remove from listing)"
            >
              <Archive className="size-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2.5"
              onClick={() => setStatus("active")}
              disabled={pending}
              title="Restore"
            >
              <ArchiveRestore className="size-3.5" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
