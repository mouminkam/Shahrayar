# Shahrayar Restaurant — Frontend

A production-grade, fully **TypeScript** Next.js 16 storefront for **Shahrayar**, a Middle Eastern restaurant. Customers browse the menu, customize dishes, manage a cart, and check out (cash or Stripe) — in **three languages** (Arabic, English, Bulgarian) with full right‑to‑left support for Arabic.

This is the modernized, TypeScript rewrite of the original JavaScript project. It keeps the existing live backend integration and hardened architecture, and adds end‑to‑end type safety, locale‑based routing, and RTL.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Architecture](#architecture)
  - [Rendering strategy — streaming SSR](#rendering-strategy--streaming-ssr)
  - [Internationalization (i18n) & RTL](#internationalization-i18n--rtl)
  - [Data layer](#data-layer)
  - [State management](#state-management)
  - [Security](#security)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Known Limitations](#known-limitations)

---

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript** (strict) — 100% of `src` is `.ts`/`.tsx` |
| UI runtime | **React 19** |
| Styling | **Tailwind CSS v4** (single unified theme, no dark‑mode toggle) |
| Animation | Framer Motion, Lenis (smooth scroll) |
| State | **Zustand** (with `persist`) |
| Forms & validation | React Hook Form + **Zod** |
| Payments | **Stripe** (`@stripe/react-stripe-js`) |
| HTTP | Axios (separate client & server instances) |
| Sanitization | `isomorphic-dompurify` (for API‑delivered HTML) |
| Tests | Jest + Testing Library |

---

## Key Features

- **Full i18n** — Arabic (`ar`), English (`en`), Bulgarian (`bg`) via `/{locale}/...` routing, with automatic locale detection (cookie → `Accept-Language` → default `bg`).
- **RTL** — Arabic renders with `dir="rtl"` set server‑side on `<html>`, so the first paint is already mirrored (no layout flash).
- **Streaming SSR** — content‑heavy pages send the hero/above‑the‑fold immediately and stream the rest in via React `Suspense`, so the user sees meaningful content fast.
- **Real e‑commerce** — menu browsing, per‑item customization (sizes, ingredients, option groups, add‑ons), cart, coupons, delivery quotes, cash & Stripe checkout, order history, reorder.
- **Auth** — email/password + phone‑OTP registration flow + Google OAuth, with middleware‑enforced route protection.
- **SEO** — server‑rendered `metadata`/`generateMetadata`, locale‑aware `robots.txt` and `sitemap.xml`, Open Graph/Twitter tags.
- **Single unified theme** — one consistent color system across the whole site.

---

## Architecture

### Rendering strategy — streaming SSR

Content pages don't block on their slowest data source. The page component creates data promises **without awaiting them**, renders the hero synchronously, and passes the promises down into async Server Components wrapped in `Suspense`. Each section resolves and streams in independently.

```
Page (Server Component)
├── <Suspense> HeroBannerStream         ← MAIN: renders first
└── <Suspense> HomeSecondarySections    ← SECONDARY: streams in after
      ├── LatestItems ├── PopularDishes
      ├── FoodMenu    ├── ChefSpecial   └── Chefs
```

Pages using this pattern: `/`, `/about-us`, `/contact-us`, `/shop`, `/shop/[id]`. Server data fetches are wrapped in `unstable_cache` (with `revalidate`) so repeat requests are cheap. Every streamed boundary has an `ErrorBoundary` + skeleton fallback.

### Internationalization (i18n) & RTL

- Every user‑facing route lives under **`src/app/[lang]/`**. `[lang]/layout.tsx` is the application's root layout — it renders `<html lang={lang} dir={...}>`, so locale and direction are correct on the server‑rendered HTML.
- **`proxy.ts`** (Next.js 16's renamed middleware) runs on every request: it detects the locale, redirects unprefixed URLs (`/shop` → `/bg/shop`), keeps the `language` cookie in sync with the URL, and enforces auth route protection.
- **`src/locales/{en,ar,bg}.json`** hold the UI string dictionaries (~383 keys each). `t(lang, key)` does the lookup; `src/locales/i18n/config.ts` is the single source of locale truth (`locales`, `defaultLocale`, `isRtl`, `getDirection`).
- **`<LocalizedLink>`** (`src/components/ui/LocalizedLink.tsx`) is a drop‑in `next/link` replacement that auto‑prefixes internal hrefs with the active locale; **`useLocalizedRouter()`** does the same for programmatic navigation. External/mailto/tel links pass through untouched.
- Language is switched via `LanguageSwitcher`, which rewrites the `/{locale}` segment of the current URL and pushes the new path.

### Data layer

- `src/api/*` — one module per backend resource (`auth`, `menu`, `orders`, `payments`, …), all typed against a shared `ApiResponse<T>` envelope.
- Two Axios instances: `src/api/config/axios.ts` (client — attaches bearer token, branch id, `Accept-Language`, normalizes errors) and `src/api/config/serverAxios.ts` (server — reads language/token for Server Components, safe inside `unstable_cache`).
- `src/hooks/*` — data‑fetching hooks with an in‑memory cache + request de‑duplication that invalidates when the selected branch changes.

### State management

Zustand stores in `src/store/`, persisted to `localStorage`:

- `authStore` — user/session; **writes an `auth-token` cookie** on login/register/OAuth so middleware can read auth state, clears it on logout.
- `cartStore` — cart items keyed by full customization signature, plus coupon/delivery/order‑type and derived totals.
- `branchStore` — selected branch, branch list, contact/hours/location helpers.
- `toastStore` — transient notifications.

### Security

Carried over and preserved from the prior hardening pass:

- Middleware route protection (cookie‑based) for `/cart`, `/checkout`, `/profile`, `/orders`; guest‑only redirects for auth pages — all locale‑prefix aware.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, SVG CSP sandbox) in `next.config.ts`.
- API‑delivered HTML (legal pages) sanitized with `isomorphic-dompurify`.
- No token/PII logging in checkout/order/auth flows.

---

## Folder Structure

```
src/
├── app/
│   ├── [lang]/                 # all localized routes; [lang]/layout.tsx is the root layout
│   │   ├── layout.tsx          # <html lang dir>, providers, header/footer
│   │   ├── page.tsx            # home (streaming SSR)
│   │   ├── shop/ · cart/ · checkout/ (+ stripe/*) · orders/ · profile/
│   │   ├── login/ · register/ · forgot-password/ · … (auth flow)
│   │   ├── about-us/ · contact-us/ · privacy-policy/ · terms-conditions/
│   │   └── _components/         # colocated streaming section components
│   ├── api/images/[...path]/   # image proxy route handler
│   ├── robots.ts · sitemap.ts  # locale-aware, server-generated
│   └── globals.css             # Tailwind v4 theme tokens
├── api/                        # backend resource modules (+ shared ApiResponse type)
├── components/                 # ui/, layout/, cart/, auth/, pages/<route>/, seo/
├── context/                    # LanguageContext, HighlightsContext, CheckoutPromoContext
├── hooks/                      # data + UI hooks (useLocalizedRouter, useCart, useShopProducts, …)
├── lib/                        # getLanguage, getAuthToken, fetchDefaultBranch, utils/, validations/
├── locales/                    # en.json, ar.json, bg.json + i18n/{config,getTranslation}.ts
└── store/                      # Zustand stores
proxy.ts                        # locale routing + auth middleware (Next.js 16 convention)
```

## Getting Started

```bash
npm install
npm run dev
```

Then open **http://localhost:3000/en** (or `/ar`, `/bg`).

> **Dev note on the root redirect:** In production, `proxy.ts` redirects `/` → `/{locale}` automatically. In local dev this redirect depends on Next.js's edge‑runtime middleware, which currently does **not** run under **Node.js v24** (an upstream Next 16 + Turbopack incompatibility). If `/` returns 404 in dev, either navigate directly to `/en` · `/ar` · `/bg`, or run dev on **Node 20/22 LTS**, where the middleware (and the automatic `/` redirect) works. Production builds are unaffected — the redirect works there regardless.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://shahrayar.peaklink.pro/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-oauth-client-id>
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=<oauth-redirect-uri>
# NEXT_PUBLIC_SITE_URL=https://your-domain            # used for metadata/sitemap absolute URLs
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (runs `tsc` type‑check) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Jest test suite |
| `npm run test:coverage` | Tests with coverage |

## Known Limitations

- **Middleware in dev under Node 24** — see the dev note above. Production is unaffected.
- **Pre-existing test import** — the pre-existing Jest suites reference a `src/__tests__/utils/mockData` helper that was never committed to the repo; those specific suites won't run until that fixture is added. This predates the TypeScript migration and is unrelated to it.
- **Backend-controlled content** — product names, descriptions, and images come from the live API and reflect whatever the backend returns (including its own language coverage). The site chrome (nav, buttons, labels, form copy) is fully translated in all three locales; catalog data localization depends on the backend.
- Some deeply dynamic API payloads are typed loosely (`Record<string, unknown>` / narrowed at the read site) where the backend has no fixed schema — deliberate, to avoid inventing contracts the API doesn't guarantee.
