import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, DEFAULT_LOCALE, SUPPORTED_LOCALES, type Lang } from "./types";
import { translate, type DictKey } from "./dict";

export async function getLocale(): Promise<Lang> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value as Lang | undefined;
  return v && (SUPPORTED_LOCALES as readonly string[]).includes(v) ? v : DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: DictKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
  };
}
