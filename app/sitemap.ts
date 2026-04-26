import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://marwadijewellers.com";
  const now = new Date();

  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/shop/women`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/shop/men`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/orders`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/policies/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/policies/returns`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/policies/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let products: MetadataRoute.Sitemap = [];
  try {
    const entries = await getSitemapEntries();
    products = entries.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      // Google's image-extension — surfaces product images in Google Image Search.
      images: p.images.slice(0, 3).filter(Boolean),
    }));
  } catch {
    // DB unavailable at build time — emit sitemap with static routes only.
  }

  return [...fixed, ...products];
}
