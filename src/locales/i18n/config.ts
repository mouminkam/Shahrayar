export const i18n = {
  defaultLocale: "en",
  locales: ["en", "ar", "bg"],
} as const;

export type Locale = (typeof i18n.locales)[number];

export const RTL_LOCALES: readonly Locale[] = ["ar"];

export function isRtl(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}

export function getDirection(locale: string): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  bg: "Български",
};
