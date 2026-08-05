import en from "../en.json";
import ar from "../ar.json";
import bg from "../bg.json";
import type { Locale } from "./config";
import { i18n } from "./config";

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = { en, ar, bg };

export function t(lang: string = i18n.defaultLocale, key: string): string {
  return dictionaries[lang as Locale]?.[key] || key;
}
