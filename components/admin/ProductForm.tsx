"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, EyeOff, Eye, Archive, ArchiveRestore } from "lucide-react";
import type { Product } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Input";
import { ImageUploader } from "./ImageUploader";
import { toast } from "@/components/ui/Toast";

type Mode = "create" | "edit";

interface FormState {
  slug: string;
  name: string;
  category: "women" | "men";
  subcategory: string;
  price: string;
  mrp: string;
  material: string;
  occasion: string; // comma-separated in form
  images: string[];
  description: string;
  dimensions: string;
  care: string;
  stock: string;
  featured: boolean;
  isNew: boolean;
  status: "active" | "disabled" | "archived";
  returnPolicyType: "returnable" | "exchange-only" | "non-returnable";
  returnDays: string;
  returnNote: string;
}

function fromProduct(p: Product): FormState {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    price: String(p.price),
    mrp: String(p.mrp),
    material: p.material,
    occasion: p.occasion.join(", "),
    images: p.images,
    description: p.description,
    dimensions: p.dimensions ?? "",
    care: p.care ?? "",
    stock: String(p.stock),
    featured: !!p.featured,
    isNew: !!p.new,
    status: p.status,
    returnPolicyType: p.returnPolicy?.type ?? "returnable",
    returnDays: String(p.returnPolicy?.days ?? 7),
    returnNote: p.returnPolicy?.note ?? "",
  };
}

const empty: FormState = {
  slug: "",
  name: "",
  category: "women",
  subcategory: "necklace",
  price: "",
  mrp: "",
  material: "Brass / alloy with gold polish — imitation",
  occasion: "festive, wedding",
  images: [],
  description: "",
  dimensions: "",
  care: "",
  stock: "10",
  featured: false,
  isNew: false,
  status: "active",
  returnPolicyType: "returnable",
  returnDays: "7",
  returnNote: "",
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function ProductForm({ mode, product }: { mode: Mode; product?: Product }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(product ? fromProduct(product) : empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [statusBusy, setStatusBusy] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    if (errors[key as string]) setErrors(({ [key as string]: _, ...rest }) => rest);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.images.length === 0) {
      setErrors({ images: "Add at least one image" });
      toast("Please upload at least one image", "error");
      return;
    }
    startTransition(async () => {
      const payload = {
        slug: state.slug.trim(),
        name: state.name.trim(),
        category: state.category,
        subcategory: state.subcategory.trim(),
        price: Number(state.price) || 0,
        mrp: Number(state.mrp) || Number(state.price) || 0,
        material: state.material,
        occasion: state.occasion
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        images: state.images,
        description: state.description,
        dimensions: state.dimensions || undefined,
        care: state.care || undefined,
        stock: Number(state.stock) || 0,
        featured: state.featured,
        isNew: state.isNew,
        status: state.status,
        returnPolicyType: state.returnPolicyType,
        returnDays: Number(state.returnDays) || 7,
        returnNote: state.returnNote || undefined,
      };

      try {
        const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product!.slug}`;
        const method = mode === "create" ? "POST" : "PATCH";
        const res = await fetch(url, {
          method,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.issues?.fieldErrors) {
            const fe: Record<string, string> = {};
            for (const [k, v] of Object.entries(json.issues.fieldErrors)) {
              if (Array.isArray(v) && v[0]) fe[k] = String(v[0]);
            }
            setErrors(fe);
          }
          throw new Error(json.error || "Save failed");
        }
        toast(mode === "create" ? "Product created" : "Saved", "success");
        if (mode === "create") {
          router.push(`/admin/products/${json.slug}/edit`);
        } else {
          router.refresh();
        }
      } catch (e) {
        toast(e instanceof Error ? e.message : "Save failed", "error");
      }
    });
  };

  const setStatus = async (next: FormState["status"]) => {
    if (!product) return;
    setStatusBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${product.slug}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      set("status", next);
      toast(`Marked ${next}`, "success");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Section title="Basics">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={state.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (mode === "create" && (!state.slug || state.slug === slugify(state.name))) {
                    set("slug", slugify(e.target.value));
                  }
                }}
                required
              />
              <FieldError message={errors.name} />
            </div>
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={state.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                disabled={mode === "edit"}
                required
              />
              <FieldError message={errors.slug} />
              {mode === "edit" && <p className="mt-1 text-[11px] text-mj-mute">Slug can't change after creation.</p>}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={state.category}
                onChange={(e) => set("category", e.target.value as FormState["category"])}
                className="h-11 w-full rounded-xl border border-mj-line bg-white px-4 text-sm focus:border-mj-gold-500 focus:outline-none"
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
            </div>
            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                value={state.subcategory}
                onChange={(e) => set("subcategory", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. mangalsutra, jhumki, ring"
                required
              />
              <FieldError message={errors.subcategory} />
            </div>
          </div>
        </Section>

        <Section title="Pricing & inventory">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" type="number" min={0} value={state.price} onChange={(e) => set("price", e.target.value)} required />
              <FieldError message={errors.price} />
            </div>
            <div>
              <Label htmlFor="mrp">MRP (₹)</Label>
              <Input id="mrp" type="number" min={0} value={state.mrp} onChange={(e) => set("mrp", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min={0} value={state.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="size-4 accent-mj-maroon-700"
              />
              Featured (homepage)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={state.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
                className="size-4 accent-mj-maroon-700"
              />
              New (badge on card)
            </label>
          </div>
        </Section>

        <Section title="Images">
          <ImageUploader value={state.images} onChange={(images) => set("images", images)} />
          <FieldError message={errors.images} />
        </Section>

        <Section title="Description & details">
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={state.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material">Material</Label>
                <Input id="material" value={state.material} onChange={(e) => set("material", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input id="dimensions" value={state.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="care">Care instructions</Label>
                <Input id="care" value={state.care} onChange={(e) => set("care", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="occasion">Occasions (comma-separated)</Label>
                <Input
                  id="occasion"
                  value={state.occasion}
                  onChange={(e) => set("occasion", e.target.value)}
                  placeholder="festive, wedding, daily"
                />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Return policy">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="returnPolicyType">Type</Label>
              <select
                id="returnPolicyType"
                value={state.returnPolicyType}
                onChange={(e) => set("returnPolicyType", e.target.value as FormState["returnPolicyType"])}
                className="h-11 w-full rounded-xl border border-mj-line bg-white px-4 text-sm focus:border-mj-gold-500 focus:outline-none"
              >
                <option value="returnable">Returnable + exchangeable</option>
                <option value="exchange-only">Exchange only</option>
                <option value="non-returnable">Non-returnable</option>
              </select>
            </div>
            <div>
              <Label htmlFor="returnDays">Days</Label>
              <Input
                id="returnDays"
                type="number"
                min={0}
                value={state.returnDays}
                onChange={(e) => set("returnDays", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="returnNote">Note (optional)</Label>
              <Input
                id="returnNote"
                value={state.returnNote}
                onChange={(e) => set("returnNote", e.target.value)}
                placeholder="e.g. Hygiene-sensitive item"
              />
            </div>
          </div>
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
        <Section title="Status">
          <div className="space-y-3 text-sm">
            <p>
              <strong className="capitalize">{state.status}</strong>{" "}
              <span className="text-mj-mute">
                {state.status === "active" && "— visible & purchasable"}
                {state.status === "disabled" && "— visible, not purchasable"}
                {state.status === "archived" && "— hidden from catalog"}
              </span>
            </p>
            {mode === "edit" && product && (
              <div className="flex flex-wrap gap-2">
                {state.status !== "active" && (
                  <Button type="button" size="sm" variant="gold" onClick={() => setStatus("active")} disabled={statusBusy}>
                    <Eye className="size-3.5" /> Activate
                  </Button>
                )}
                {state.status === "active" && (
                  <Button type="button" size="sm" variant="outline" onClick={() => setStatus("disabled")} disabled={statusBusy}>
                    <EyeOff className="size-3.5" /> Disable order
                  </Button>
                )}
                {state.status !== "archived" ? (
                  <Button type="button" size="sm" variant="outline" onClick={() => setStatus("archived")} disabled={statusBusy}>
                    <Archive className="size-3.5" /> Archive
                  </Button>
                ) : (
                  <Button type="button" size="sm" variant="outline" onClick={() => setStatus("active")} disabled={statusBusy}>
                    <ArchiveRestore className="size-3.5" /> Restore
                  </Button>
                )}
              </div>
            )}
          </div>
        </Section>

        <Section title="Save">
          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={pending}>
              <Save className="size-4" /> {pending ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
            </Button>
            <Link href="/admin/products" className="block text-center text-sm text-mj-mute hover:text-mj-ink">
              Cancel & back to catalog
            </Link>
          </div>
        </Section>

        {mode === "edit" && product && product.slug && (
          <Section title="Quick links">
            <div className="text-sm space-y-2">
              <Link href={`/shop/${product.slug}`} className="block text-mj-maroon-700 hover:underline" target="_blank">
                View on storefront →
              </Link>
            </div>
          </Section>
        )}
      </aside>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mj-card bg-white p-5">
      <h2 className="font-display text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}
