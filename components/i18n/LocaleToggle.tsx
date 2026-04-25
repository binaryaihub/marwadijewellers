"use client";

import { useT } from "@/lib/i18n/Provider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Lang } from "@/lib/i18n/types";
import { cn } from "@/lib/cn";

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useT();

  return (
    <div
      role="group"
      aria-label={t("lang.toggle.aria")}
      className={cn(
        "inline-flex items-center rounded-full border border-mj-line bg-white p-0.5 shadow-sm",
        className,
      )}
    >
      {SUPPORTED_LOCALES.map((lang: Lang) => {
        const active = lang === locale;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => setLocale(lang)}
            aria-pressed={active}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-semibold transition-all",
              active
                ? "bg-mj-maroon-700 text-mj-gold-200 shadow-[0_2px_8px_-2px_rgba(123,30,43,0.5)]"
                : "text-mj-mute hover:text-mj-ink",
            )}
          >
            {LOCALE_LABELS[lang].flag}
          </button>
        );
      })}
    </div>
  );
}
