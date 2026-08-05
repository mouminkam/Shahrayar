/**
 * Language Utilities
 * Unified functions to get language from cookie
 *
 * IMPORTANT: All language retrieval should use cookie, not localStorage
 * This ensures consistency between SSR and CSR
 */

import { getCookie } from './cookies';
import { i18n, type Locale } from '../../locales/i18n/config';

const LANGUAGE_COOKIE_NAME = 'language';

/**
 * Client-side function to get language from cookie
 * Falls back to default locale if not found
 *
 * @returns Language code
 */
export function getLanguageFromCookie(): Locale {
  if (typeof document === 'undefined') {
    return i18n.defaultLocale;
  }

  try {
    const cookieLang = getCookie(LANGUAGE_COOKIE_NAME);

    if (cookieLang && (i18n.locales as readonly string[]).includes(cookieLang)) {
      return cookieLang as Locale;
    }

    // Fallback to default locale
    return i18n.defaultLocale;
  } catch (error) {
    console.error('Error reading language cookie:', error);
    return i18n.defaultLocale;
  }
}

/**
 * Get language cookie name (for consistency)
 * @returns Language cookie name
 */
export function getLanguageCookieName(): string {
  return LANGUAGE_COOKIE_NAME;
}
