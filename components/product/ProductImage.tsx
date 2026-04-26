import Image from "next/image";
import { cn } from "@/lib/cn";

const ICONS: Record<string, string> = {
  necklace: "M30 50 Q50 90 70 50 M50 50 V72",
  earrings: "M40 30 V46 M60 30 V46 M40 56 a6 6 0 1 0 0.01 0 M60 56 a6 6 0 1 0 0.01 0",
  ring: "M50 36 a14 14 0 1 0 0.01 0 M50 22 L46 12 L54 12 Z",
  bangles: "M50 50 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M50 50 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0",
  bracelet: "M22 50 a28 14 0 1 0 56 0 a28 14 0 1 0 -56 0",
  chain: "M22 50 q14 -22 28 0 t28 0 M22 50 q14 22 28 0 t28 0",
  kada: "M50 50 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M44 50 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0",
  pendant: "M50 22 V40 M50 40 a14 14 0 1 0 0.01 0 M44 50 L50 60 L56 50",
  "bracelet-mens": "M22 50 H78 M30 44 v12 M70 44 v12",
};

const SEED_PALETTES: Array<{ a: string; b: string; c: string }> = [
  { a: "#7B1E2B", b: "#A8324A", c: "#D4AF37" },
  { a: "#4A0F1A", b: "#7B1E2B", c: "#E8C766" },
  { a: "#621826", b: "#92263A", c: "#F1D98A" },
  { a: "#4A0F1A", b: "#A8324A", c: "#FAECBF" },
];

// Pre-compute the 8 placeholder rays at module load and round to 2 decimals so
// server and client produce identical strings (avoids the same hydration
// mismatch we hit on the Hero ornament).
const round2 = (n: number) => Math.round(n * 100) / 100;
const PLACEHOLDER_RAYS = Array.from({ length: 8 }, (_, i) => ({
  x2: round2(50 + Math.cos((i * Math.PI) / 4) * 46),
  y2: round2(50 + Math.sin((i * Math.PI) / 4) * 46),
}));

function paletteFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return SEED_PALETTES[Math.abs(hash) % SEED_PALETTES.length];
}

function parsePlaceholder(src: string): { kind: string; seed: string } | null {
  if (!src.startsWith("placeholder://")) return null;
  const rest = src.replace("placeholder://", "");
  const [kind, seed = "x"] = rest.split("/");
  return { kind, seed };
}

interface Props {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  label?: string;
  /** Responsive `sizes` for next/image — pass "100vw" for full-width hero usages or
   *  "(max-width: 768px) 50vw, 25vw" for grid cards. Defaults to the grid case. */
  sizes?: string;
}

export function ProductImage({ src, alt, className, priority, label, sizes }: Props) {
  const placeholder = parsePlaceholder(src);

  if (!placeholder) {
    // Real image — let next/image handle AVIF/WebP, srcset, and lazy loading.
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  const palette = paletteFor(`${placeholder.kind}-${placeholder.seed}`);
  const path = ICONS[placeholder.kind] ?? ICONS.pendant;
  const gradId = `g-${placeholder.kind}-${placeholder.seed}`.replace(/[^a-z0-9-]/gi, "");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={alt}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor={palette.b} />
          <stop offset="60%" stopColor={palette.a} />
          <stop offset="100%" stopColor="#2A0810" />
        </radialGradient>
        <radialGradient id={`${gradId}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.c} stopOpacity="0.55" />
          <stop offset="100%" stopColor={palette.c} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradId})`} />
      <circle cx="50" cy="50" r="38" fill={`url(#${gradId}-glow)`} />
      {PLACEHOLDER_RAYS.map((ray, i) => (
        <line key={i} x1="50" y1="50" x2={ray.x2} y2={ray.y2} stroke={palette.c} strokeOpacity="0.06" />
      ))}
      <path d={path} fill="none" stroke={palette.c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {label && (
        <text
          x="50"
          y="92"
          textAnchor="middle"
          fontSize="4"
          fill={palette.c}
          fontFamily="serif"
          letterSpacing="0.4"
          opacity="0.85"
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
