import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://marwadijewellers.example";
  const fixed = ["", "/shop", "/shop/women", "/shop/men", "/about", "/contact", "/policies/shipping", "/policies/returns", "/policies/privacy"];

  const products = getAllProducts().map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

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
