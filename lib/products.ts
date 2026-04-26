import "server-only";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "./db";
import { products } from "./db/schema";
import type { ProductRow } from "./db/schema";

export type ProductCategory = "women" | "men";
export type Subcategory = string;
export type ProductStatus = "active" | "disabled" | "archived";
export type ReturnPolicyType = "returnable" | "exchange-only" | "non-returnable";

export interface ReturnPolicy {
  type: ReturnPolicyType;
  days: number;
  note?: string;
}

export const DEFAULT_RETURN_POLICY: ReturnPolicy = { type: "returnable", days: 7 };

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  subcategory: Subcategory;
  price: number;
  mrp: number;
  material: string;
  occasion: string[];
  images: string[];
  description: string;
  dimensions?: string;
  care?: string;
  stock: number;
  featured?: boolean;
  new?: boolean;
  status: ProductStatus;
  returnPolicy?: ReturnPolicy;
}

export function getReturnPolicy(product: Pick<Product, "returnPolicy">): ReturnPolicy {
  return product.returnPolicy ?? DEFAULT_RETURN_POLICY;
}

// ── DB row → Product mapping ───────────────────────────────────────────
function splitLines(s: string | null | undefined): string[] {
  if (!s) return [];
  return s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinLines(arr: string[] | null | undefined): string {
  if (!arr) return "";
  return arr.map((x) => x.trim()).filter(Boolean).join("\n");
}

function fromRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    mrp: row.mrp,
    material: row.material,
    occasion: splitLines(row.occasion),
    images: splitLines(row.images),
    description: row.description,
    dimensions: row.dimensions ?? undefined,
    care: row.care ?? undefined,
    stock: row.stock,
    featured: row.featured,
    new: row.isNew,
    status: row.status,
    returnPolicy: {
      type: row.returnPolicyType,
      days: row.returnDays,
      note: row.returnNote ?? undefined,
    },
  };
}

// ── Public read helpers (storefront) ───────────────────────────────────
// By default, exclude archived products. `disabled` products are returned
// with a status flag so the catalog can render them with a "Currently
// unavailable" badge but still allow browsing the detail page.
export interface QueryOpts {
  includeArchived?: boolean;
  /** Storefront default: hide archived. Admin views can include all. */
  includeAll?: boolean;
}

function visibleStatuses(opts?: QueryOpts): ProductStatus[] {
  if (opts?.includeAll) return ["active", "disabled", "archived"];
  if (opts?.includeArchived) return ["active", "disabled", "archived"];
  return ["active", "disabled"];
}

export async function getAllProducts(opts?: QueryOpts): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.status, visibleStatuses(opts)))
    .orderBy(desc(products.createdAt));
  return rows.map(fromRow);
}

// Slimmer query for sitemap.xml — pulls only the columns we need (slug,
// updatedAt, images) and only active products. Skips disabled/archived since
// those shouldn't be advertised to search engines.
export interface SitemapEntry {
  slug: string;
  updatedAt: Date;
  images: string[];
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const rows = await db
    .select({
      slug: products.slug,
      updatedAt: products.updatedAt,
      images: products.images,
    })
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(desc(products.updatedAt));
  return rows.map((r) => ({
    slug: r.slug,
    updatedAt: r.updatedAt,
    images: splitLines(r.images),
  }));
}

export async function getByCategory(category: ProductCategory, opts?: QueryOpts): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.category, category), inArray(products.status, visibleStatuses(opts))))
    .orderBy(desc(products.createdAt));
  return rows.map(fromRow);
}

export async function getBySlug(slug: string, opts?: QueryOpts): Promise<Product | undefined> {
  // Always allow archived in this lookup — order detail pages need to render
  // discontinued items. Callers that care about purchasability should check
  // `product.status` themselves.
  const allowed: ProductStatus[] =
    opts?.includeAll === false ? visibleStatuses(opts) : (["active", "disabled", "archived"] as ProductStatus[]);
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), inArray(products.status, allowed)))
    .limit(1);
  return row ? fromRow(row) : undefined;
}

export async function getFeatured(limit = 8): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.featured, true), eq(products.status, "active")))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return rows.map(fromRow);
}

export async function getRelated(slug: string, limit = 4): Promise<Product[]> {
  const product = await getBySlug(slug);
  if (!product) return [];
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        sql`${products.slug} <> ${slug}`,
        or(eq(products.category, product.category), eq(products.subcategory, product.subcategory)),
      ),
    )
    .limit(limit);
  return rows.map(fromRow);
}

export async function getSubcategories(category: ProductCategory): Promise<Subcategory[]> {
  const rows = await db
    .selectDistinct({ subcategory: products.subcategory })
    .from(products)
    .where(and(eq(products.category, category), eq(products.status, "active")));
  return rows.map((r) => r.subcategory).filter(Boolean) as Subcategory[];
}

export async function priceRange(): Promise<{ min: number; max: number }> {
  const rows = await db
    .select({
      min: sql<number>`min(${products.price})`,
      max: sql<number>`max(${products.price})`,
    })
    .from(products)
    .where(eq(products.status, "active"));
  const r = rows[0];
  return { min: r?.min ?? 0, max: r?.max ?? 0 };
}

// ── Admin queries ──────────────────────────────────────────────────────
export interface AdminListFilters {
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus | "all";
}

export async function adminListProducts(filters: AdminListFilters = {}): Promise<Product[]> {
  const conditions = [];
  if (filters.search) {
    conditions.push(or(ilike(products.slug, `%${filters.search}%`), ilike(products.name, `%${filters.search}%`)));
  }
  if (filters.category) {
    conditions.push(eq(products.category, filters.category));
  }
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(products.status, filters.status));
  }
  const rows = await db
    .select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(products.createdAt));
  return rows.map(fromRow);
}

export async function slugExists(slug: string): Promise<boolean> {
  const [row] = await db.select({ slug: products.slug }).from(products).where(eq(products.slug, slug)).limit(1);
  return !!row;
}

export interface ProductWriteInput {
  slug: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  mrp: number;
  material?: string;
  occasion?: string[];
  images?: string[];
  description?: string;
  dimensions?: string;
  care?: string;
  stock?: number;
  featured?: boolean;
  isNew?: boolean;
  status?: ProductStatus;
  returnPolicyType?: ReturnPolicyType;
  returnDays?: number;
  returnNote?: string;
}

export async function createProduct(input: ProductWriteInput): Promise<Product> {
  const now = new Date();
  await db.insert(products).values({
    slug: input.slug,
    name: input.name,
    category: input.category,
    subcategory: input.subcategory,
    price: input.price,
    mrp: input.mrp,
    material: input.material ?? "",
    occasion: joinLines(input.occasion),
    images: joinLines(input.images),
    description: input.description ?? "",
    dimensions: input.dimensions ?? null,
    care: input.care ?? null,
    stock: input.stock ?? 0,
    featured: input.featured ?? false,
    isNew: input.isNew ?? false,
    status: input.status ?? "active",
    returnPolicyType: input.returnPolicyType ?? "returnable",
    returnDays: input.returnDays ?? 7,
    returnNote: input.returnNote ?? null,
    createdAt: now,
    updatedAt: now,
  });
  const created = await getBySlug(input.slug, { includeAll: true });
  if (!created) throw new Error("Product creation succeeded but lookup failed");
  return created;
}

export async function updateProduct(slug: string, patch: Partial<ProductWriteInput>): Promise<Product | null> {
  const update: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.subcategory !== undefined) update.subcategory = patch.subcategory;
  if (patch.price !== undefined) update.price = patch.price;
  if (patch.mrp !== undefined) update.mrp = patch.mrp;
  if (patch.material !== undefined) update.material = patch.material;
  if (patch.occasion !== undefined) update.occasion = joinLines(patch.occasion);
  if (patch.images !== undefined) update.images = joinLines(patch.images);
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.dimensions !== undefined) update.dimensions = patch.dimensions || null;
  if (patch.care !== undefined) update.care = patch.care || null;
  if (patch.stock !== undefined) update.stock = patch.stock;
  if (patch.featured !== undefined) update.featured = patch.featured;
  if (patch.isNew !== undefined) update.isNew = patch.isNew;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.returnPolicyType !== undefined) update.returnPolicyType = patch.returnPolicyType;
  if (patch.returnDays !== undefined) update.returnDays = patch.returnDays;
  if (patch.returnNote !== undefined) update.returnNote = patch.returnNote || null;

  await db.update(products).set(update).where(eq(products.slug, slug));
  return (await getBySlug(slug, { includeAll: true })) ?? null;
}

export async function setProductStatus(slug: string, status: ProductStatus): Promise<Product | null> {
  await db.update(products).set({ status, updatedAt: new Date() }).where(eq(products.slug, slug));
  return (await getBySlug(slug, { includeAll: true })) ?? null;
}
