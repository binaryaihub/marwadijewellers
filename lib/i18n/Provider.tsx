"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, SUPPORTED_LOCALES, type Lang } from "./types";
import { translate, type DictKey } from "./dict";

interface LocaleContextValue {
  locale: Lang;
  setLocale: (next: Lang, opts?: { silent?: boolean }) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  hasChosen: boolean;
  markChosen: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writeCookie(value: string) {
  document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function LocaleProvider({
  initialLocale,
  initialChosen,
  children,
}: {
  initialLocale: Lang;
  initialChosen: boolean;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Lang>(initialLocale);
  const [hasChosen, setHasChosen] = useState<boolean>(initialChosen);
  const router = useRouter();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    (next: Lang, opts?: { silent?: boolean }) => {
      if (!(SUPPORTED_LOCALES as readonly string[]).includes(next)) return;
      setLocaleState(next);
      writeCookie(next);
      if (!opts?.silent) router.refresh();
    },
    [router],
  );

  const markChosen = useCallback(() => setHasChosen(true), []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      hasChosen,
      markChosen,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale, hasChosen, markChosen],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: "en" as Lang,
      t: (key: DictKey, vars?: Record<string, string | number>) => translate("en", key, vars),
      setLocale: () => {},
      hasChosen: true,
      markChosen: () => {},
    };
  }
  return ctx;
}
