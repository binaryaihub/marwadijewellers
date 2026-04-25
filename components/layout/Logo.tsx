export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const monogramSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const wordmarkSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`${monogramSize} relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-mj-maroon-800 to-mj-maroon-600 text-mj-gold-300 shadow-[0_4px_14px_-4px_rgba(123,30,43,0.55)]`}
      >
        <span className="font-display font-bold leading-none">MJ</span>
        <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-mj-gold-500/40" />
      </span>
      <span className={`${wordmarkSize} font-display font-semibold tracking-wide text-mj-maroon-800`}>
        Marwadi <span className="font-normal italic text-mj-gold-600">Jewellers</span>
      </span>
    </span>
  );
}
