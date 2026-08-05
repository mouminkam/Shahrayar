import { cookies } from "next/headers";
import { i18n, type Locale } from "../locales/i18n/config";

const LANGUAGE_COOKIE_NAME = "language";

/**
 * Server-side language reader. The `language` cookie is kept in sync with the
 * active `/[lang]/...` URL segment by middleware.ts on every request, so this
 * remains a safe source of truth for server code that isn't handed `params`
 * directly (deeply nested Server Components, cached fetch helpers, etc).
 * Prefer reading `params.lang` directly in page/layout components when available.
 */
export async function getLanguage(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const languageCookie = cookieStore.get(LANGUAGE_COOKIE_NAME);

    if (
      languageCookie?.value &&
      (i18n.locales as readonly string[]).includes(languageCookie.value)
    ) {
      return languageCookie.value as Locale;
    }

    return i18n.defaultLocale;
  } catch (error) {
    console.error("Error reading language cookie:", error);
    return i18n.defaultLocale;
  }
}
