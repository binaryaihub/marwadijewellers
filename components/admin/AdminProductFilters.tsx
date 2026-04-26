"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

const STATUSES = ["all", "active", "disabled", "archived"] as const;
const CATEGORIES = ["all", "women", "men"] as const;

export function AdminProductFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [, startTransition] = useTransition();

  const status = params.get("status") ?? "all";
  const category = params.get("category") ?? "all";

  const update = (next: Record<string, string | undefined>) => {
    const url = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") url.delete(k);
      else url.set(k, v);
    }
    startTransition(() => router.push(`/admin/products?${url.toString()}`));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: search || undefined });
        }}
        className="relative flex-1 min-w-[220px] max-w-md"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mj-mute" />
        <Input
          type="search"
          placeholder="Search slug or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase text-mj-mute">Category:</span>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => update({ category: c === "all" ? undefined : c })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
              category === c
                ? "border-mj-maroon-700 bg-mj-maroon-700 text-mj-ivory"
                : "border-mj-line bg-white text-mj-ink hover:border-mj-gold-300",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase text-mj-mute">Status:</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => update({ status: s === "all" ? undefined : s })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
              status === s
                ? "border-mj-maroon-700 bg-mj-maroon-700 text-mj-ivory"
                : "border-mj-line bg-white text-mj-ink hover:border-mj-gold-300",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
