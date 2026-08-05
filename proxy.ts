import { NextResponse, type NextRequest } from "next/server";
import { i18n } from "./src/locales/i18n/config";

// Locale routing: every page lives under /{locale}/..., locale is
// auto-detected (cookie -> Accept-Language -> default) and the cookie is
// kept in sync so server code that only calls getLanguage() stays correct.
const LANGUAGE_COOKIE_NAME = "language";

// PHASE-A FIX [C1]: Cookie-based route protection (locale-prefix aware)
const PROTECTED_ROUTES = ["/cart", "/checkout", "/profile", "/orders"];
const GUEST_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-reset-token",
  "/add-phone",
  "/enter-otp",
  "/add-information",
  "/confirm-information",
];

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  if (cookieLocale && (i18n.locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
    if (preferred && (i18n.locales as readonly string[]).includes(preferred)) {
      return preferred;
    }
  }

  return i18n.defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (!pathnameHasLocale) {
    const locale = detectLocale(request);
    const redirectUrl = new URL(`/${locale}${pathname}${search}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const segments = pathname.split("/");
  const locale = segments[1];
  const pathWithoutLocale = "/" + segments.slice(2).join("/");

  const token =
    request.cookies.get("auth-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  const isAuthenticated = Boolean(token);

  const isProtected = PROTECTED_ROUTES.some((route) => pathWithoutLocale.startsWith(route));
  const isGuestOnly = GUEST_ONLY_ROUTES.some((route) => pathWithoutLocale.startsWith(route));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnly && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const response = NextResponse.next();

  response.cookies.set(LANGUAGE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  if (token) {
    response.headers.set("authorization", `Bearer ${token}`);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|img|favicon.ico|.*\\..*).*)"],
};
