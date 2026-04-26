import { ImageResponse } from "next/og";

// Apple Touch Icon — used when users add the site to their iOS / iPadOS home
// screen. Apple wants a PNG specifically (180×180), so we generate one with
// next/og at build time using the same MJ monogram styling as app/icon.svg.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #621826 0%, #92263A 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E8C766",
          fontSize: 88,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          letterSpacing: -3,
          // Inset gold ring, matching the SVG favicon
          boxShadow: "inset 0 0 0 2px rgba(212,175,55,0.4)",
        }}
      >
        MJ
      </div>
    ),
    { ...size },
  );
}
