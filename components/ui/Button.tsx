import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-mj-maroon-700 text-mj-ivory hover:bg-mj-maroon-800 active:bg-mj-maroon-900 shadow-[0_8px_24px_-12px_rgba(123,30,43,0.6)] hover:shadow-[0_12px_30px_-12px_rgba(123,30,43,0.7)]",
  gold:
    "bg-gradient-to-r from-mj-gold-600 via-mj-gold-400 to-mj-gold-600 text-mj-maroon-900 hover:brightness-110 shadow-[0_8px_24px_-12px_rgba(212,175,55,0.7)]",
  secondary:
    "bg-mj-cream text-mj-maroon-800 hover:bg-mj-gold-100 border border-mj-line",
  outline:
    "border border-mj-maroon-700/30 text-mj-maroon-800 hover:bg-mj-maroon-700 hover:text-mj-ivory",
  ghost: "text-mj-ink hover:bg-mj-cream",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});
