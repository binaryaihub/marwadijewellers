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
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  /** Heading level — pass "h1" on top-level pages so each route has exactly one h1. */
  as?: "h1" | "h2" | "h3";
}) {
  const HeadingTag = as;
  return (
    <div className={cn("mb-10 md:mb-14", centered && "text-center")}>
      {eyebrow && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-mj-gold-600">{eyebrow}</div>
      )}
      <HeadingTag className="text-3xl md:text-5xl font-display text-mj-ink">{title}</HeadingTag>
      {description && <p className="mt-3 text-mj-mute max-w-2xl mx-auto">{description}</p>}
      <div className="mj-divider mt-5 max-w-[120px] mx-auto" />
    </div>
  );
}
