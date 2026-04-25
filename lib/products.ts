import productsData from "@/content/products.json";

export type ProductCategory = "women" | "men";
// Subcategory is intentionally a free-form string so importers from external
// stores can pass through their own taxonomy (jhumki, mangalsutra, ponchi…)
// without forcing every value into a narrow union. Translation lookups in the
// Hindi dict fall back to the slug for any key without a translation.
export type Subcategory = string;

export type ReturnPolicyType = "returnable" | "exchange-only" | "non-returnable";

export interface ReturnPolicy {
  type: ReturnPolicyType;
  days: number;
  note?: string;
}

// Storefront-wide default applied to any product that doesn't specify its own
// policy. Today every SKU is returnable + exchangeable for 7 days; the
// per-product field exists so we can later make selected SKUs (e.g. piercing
// jewellery, custom orders) non-returnable without a code change.
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
  returnPolicy?: ReturnPolicy;
}

export function getReturnPolicy(product: Pick<Product, "returnPolicy">): ReturnPolicy {
  return product.returnPolicy ?? DEFAULT_RETURN_POLICY;
}

const products = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function getBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeatured(limit = 8): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getRelated(slug: string, limit = 4): Product[] {
  const product = getBySlug(slug);
  if (!product) return [];
  return products
    .filter((p) => p.slug !== slug && (p.category === product.category || p.subcategory === product.subcategory))
    .slice(0, limit);
}

export function getSubcategories(category: ProductCategory): Subcategory[] {
  const set = new Set<Subcategory>();
  products.filter((p) => p.category === category).forEach((p) => set.add(p.subcategory));
  return Array.from(set);
}

export function priceRange(): { min: number; max: number } {
  const prices = products.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
