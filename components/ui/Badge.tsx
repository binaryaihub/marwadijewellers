import { cn } from "@/lib/cn";

type Tone = "gold" | "maroon" | "neutral" | "green";
const tones: Record<Tone, string> = {
  gold: "bg-mj-gold-100 text-mj-gold-700 border-mj-gold-300",
  maroon: "bg-mj-maroon-700 text-mj-ivory border-mj-maroon-700",
  neutral: "bg-mj-cream text-mj-mute border-mj-line",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function Badge({
  children,
  tone = "gold",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
