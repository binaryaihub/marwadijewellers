import { ImageResponse } from "next/og";

// Default Open Graph image — used by every page that doesn't override.
// Rendered on demand by next/og at the edge.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Marwadi Jewellers — Heritage-inspired imitation jewellery";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(60% 60% at 25% 35%, rgba(212,175,55,0.25) 0%, transparent 60%), linear-gradient(135deg, #4A0F1A 0%, #7B1E2B 100%)",
          color: "#FBF7EF",
          fontFamily: "Georgia, serif",
          padding: "72px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* MJ monogram */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #621826 0%, #92263A 100%)",
              boxShadow: "inset 0 0 0 2px rgba(212,175,55,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#E8C766",
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            MJ
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 600, color: "#FBF7EF" }}>Marwadi</div>
            <div style={{ fontSize: 30, fontStyle: "italic", color: "#E8C766", marginTop: -4 }}>
              Jewellers
            </div>
          </div>
        </div>

        {/* Tagline + accent */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#E8C766",
              fontWeight: 600,
            }}
          >
            Heritage · Crafted · Imitation
          </div>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              fontWeight: 700,
              color: "#FBF7EF",
              maxWidth: 980,
              display: "flex",
            }}
          >
            Where every <span style={{ color: "#E8C766", fontStyle: "italic", margin: "0 14px" }}>jewel</span> tells a Marwadi story.
          </div>
          <div style={{ fontSize: 24, color: "rgba(251,247,239,0.75)", marginTop: 8 }}>
            Kundan · Polki · Mangalsutra · Jhumkas · Chains · Always free shipping across India
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
