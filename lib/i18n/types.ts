export const SUPPORTED_LOCALES = ["en", "hi"] as const;
export type Lang = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Lang = "en";
export const LOCALE_COOKIE = "mj-locale";

export const LOCALE_LABELS: Record<Lang, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "EN" },
  hi: { native: "हिन्दी", english: "Hindi", flag: "हि" },
};
