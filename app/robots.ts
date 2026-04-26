import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/orders"],
        // /orders is the public "track your order" entry; per-order pages
        // (/orders/[id]) and the checkout/admin areas should not be crawled.
        disallow: ["/admin", "/api", "/checkout", "/orders/lookup", "/orders/M*"],
      },
    ],
    sitemap: "https://marwadijewellers.com/sitemap.xml",
    host: "https://marwadijewellers.com",
  };
}
