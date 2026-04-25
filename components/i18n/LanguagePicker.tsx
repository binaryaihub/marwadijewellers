"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Lang } from "@/lib/i18n/types";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";

export function LanguagePicker() {
  const { locale, setLocale, hasChosen, markChosen } = useT();
  const [picked, setPicked] = useState<Lang>(locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const open = mounted && !hasChosen;

  const choose = (next: Lang) => {
    setPicked(next);
    setLocale(next);
  };

  const confirm = () => {
    setLocale(picked);
    markChosen();
  };

  const dismiss = () => {
    setLocale("en");
    markChosen();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-mj-maroon-900/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lang-picker-title"
            className="fixed inset-0 z-[71] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-mj-ivory shadow-2xl overflow-hidden">
              <button
                onClick={dismiss}
                aria-label="Skip"
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-mj-mute hover:text-mj-ink"
              >
                <X className="size-4" />
              </button>

              <div className="absolute inset-0 mj-mandala !opacity-[0.06]" aria-hidden />

              <div className="relative px-6 pt-10 pb-6 sm:px-10">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-mj-gold-300 bg-mj-gold-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mj-gold-700">
                    <Sparkles className="size-3.5" /> Marwadi Jewellers
                  </div>
                  <h2 id="lang-picker-title" className="mt-4 font-display text-3xl sm:text-4xl text-mj-ink">
                    अपनी भाषा चुनें
                  </h2>
                  <p className="mt-1 text-mj-mute text-sm">
                    Choose your language to continue
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {SUPPORTED_LOCALES.map((lang) => {
                    const label = LOCALE_LABELS[lang];
                    const active = picked === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => choose(lang)}
                        className={cn(
                          "relative rounded-2xl border-2 bg-white p-5 text-left transition-all",
                          active
                            ? "border-mj-gold-500 shadow-[var(--shadow-mj-glow)]"
                            : "border-mj-line hover:border-mj-gold-300",
                        )}
                      >
                        <span className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-mono">
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-full",
                              active
                                ? "bg-mj-maroon-700 text-mj-gold-200"
                                : "bg-mj-cream text-mj-mute",
                            )}
                          >
                            {label.flag}
                          </span>
                        </span>
                        <p className="font-display text-2xl text-mj-ink leading-tight">{label.native}</p>
                        <p className="mt-1 text-xs text-mj-mute">{label.english}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <button
                    onClick={confirm}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-mj-maroon-700 px-8 py-3 text-sm font-semibold text-mj-ivory hover:bg-mj-maroon-800 shadow-[0_8px_22px_-10px_rgba(123,30,43,0.6)]"
                  >
                    {picked === "hi" ? "जारी रखें" : "Continue"}
                  </button>
                  <p className="text-[11px] text-mj-mute">
                    {picked === "hi"
                      ? "बाद में कभी भी ऊपर वाले बटन से बदल सकते हैं।"
                      : "You can switch anytime from the navbar."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
