import { ImageResponse } from "next/og";
import { getBySlug } from "@/lib/products";
import { formatINR } from "@/lib/format";

// Per-product Open Graph image. WhatsApp/Twitter shares of a product link
// will preview this card with the actual product photo + title + price.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Marwadi Jewellers product";

export default async function ProductOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getBySlug(slug, { includeAll: true });

  // If we can't find the product, fall back to the brand image so links never
  // break with a missing-image placeholder.
  if (!product || product.images.length === 0) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #4A0F1A 0%, #7B1E2B 100%)",
            color: "#FBF7EF",
            fontFamily: "Georgia, serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          Marwadi Jewellers
        </div>
      ),
      { ...size },
    );
  }

  const primary = product.images[0];
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #4A0F1A 0%, #7B1E2B 100%)",
          color: "#FBF7EF",
          fontFamily: "Georgia, serif",
          display: "flex",
        }}
      >
        {/* Product image fills the left half */}
        <div
          style={{
            width: 600,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            background: "rgba(0,0,0,0.15)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primary}
            alt={product.name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            }}
            width={520}
            height={550}
          />
        </div>

        {/* Right side: brand + product info */}
        <div
          style={{
            width: 600,
            padding: "60px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #621826 0%, #92263A 100%)",
                boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#E8C766",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              MJ
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 22, fontWeight: 600 }}>Marwadi</div>
              <div style={{ fontSize: 18, fontStyle: "italic", color: "#E8C766", marginTop: -2 }}>
                Jewellers
              </div>
            </div>
          </div>

          {/* Product details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontSize: 16,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#E8C766",
              }}
            >
              {product.subcategory.replace(/-/g, " ")}
            </div>
            <div
              style={{
                fontSize: 46,
                lineHeight: 1.15,
                fontWeight: 700,
                maxHeight: 220,
                overflow: "hidden",
                display: "flex",
              }}
            >
              {product.name}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 10 }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: "#E8C766" }}>{formatINR(product.price)}</div>
              {product.mrp > product.price && (
                <div style={{ fontSize: 24, color: "rgba(251,247,239,0.6)", textDecoration: "line-through" }}>
                  {formatINR(product.mrp)}
                </div>
              )}
              {off > 0 && (
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    background: "#92263A",
                    color: "#FBF7EF",
                    padding: "6px 14px",
                    borderRadius: 999,
                  }}
                >
                  {off}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Footer pill */}
          <div
            style={{
              fontSize: 18,
              color: "rgba(251,247,239,0.7)",
              borderTop: "1px solid rgba(212,175,55,0.25)",
              paddingTop: 18,
              display: "flex",
            }}
          >
            marwadijewellers.com · Free shipping across India
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
