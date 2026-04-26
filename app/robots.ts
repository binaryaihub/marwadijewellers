import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/checkout", "/orders", "/api"] },
    ],
    sitemap: "https://marwadijewellers.com/sitemap.xml",
  };
}
