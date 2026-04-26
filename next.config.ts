import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    // Allow next/image to optimise our Vercel Blob assets (BOM1 store) plus
    // any other Vercel Blob host. The wildcard covers public stores in any
    // region and the *.blob.vercel-storage.com fallback CDN domain.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
    // AVIF first for smaller payloads, then WebP fallback.
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: ["@neondatabase/serverless"],
};

export default config;
