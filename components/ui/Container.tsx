import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "default" && "max-w-7xl",
        size === "wide" && "max-w-[1400px]",
        size === "narrow" && "max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("mb-10 md:mb-14", centered && "text-center")}>
      {eyebrow && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-mj-gold-600">{eyebrow}</div>
      )}
      <h2 className="text-3xl md:text-5xl font-display text-mj-ink">{title}</h2>
      {description && <p className="mt-3 text-mj-mute max-w-2xl mx-auto">{description}</p>}
      <div className="mj-divider mt-5 max-w-[120px] mx-auto" />
    </div>
  );
}
