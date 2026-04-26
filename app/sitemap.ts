import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://marwadijewellers.com";
  const fixed = ["", "/shop", "/shop/women", "/shop/men", "/about", "/contact", "/policies/shipping", "/policies/returns", "/policies/privacy"];

  let products: MetadataRoute.Sitemap = [];
  try {
    const all = await getAllProducts();
    products = all.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable at build time — emit sitemap with static routes only.
  }

  return [
    ...fixed.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...products,
  ];
}
