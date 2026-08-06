# Shahrayar Restaurant — Frontend

A production-grade, fully **TypeScript** Next.js 16 storefront for **Shahrayar**, a Middle Eastern restaurant. Customers browse the menu, customize dishes, manage a cart, and check out (cash or Stripe) — in **three languages** (Arabic, English, Bulgarian) with full right‑to‑left support for Arabic.

> 🔗 **Live, backend‑connected version:** _add link here once deployed_
>
> This repository is a **frontend‑only build**, meant to be evaluated as a piece of frontend engineering on its own — cloned, run locally, and read end‑to‑end without needing a backend, database, or API keys. Every network‑shaped call in this codebase resolves against realistic local fixtures instead of a live server. See [**Mock Data Architecture**](#mock-data-architecture--how-this-would-connect-to-a-real-backend) below for exactly how — and where — a real backend plugs back in.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Mock Data Architecture — how this would connect to a real backend](#mock-data-architecture--how-this-would-connect-to-a-real-backend)
- [Architecture](#architecture)
  - [Rendering strategy — streaming SSR](#rendering-strategy--streaming-ssr)
  - [Internationalization (i18n) & RTL](#internationalization-i18n--rtl)
  - [Data layer](#data-layer)
  - [State management](#state-management)
  - [Security](#security)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
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
- **Real e‑commerce flows** — menu browsing, per‑item customization (sizes, ingredients, option groups, add‑ons), cart, coupons, delivery quotes, cash & Stripe checkout, order history, reorder — all fully interactive against mock data.
- **Auth** — email/password + phone‑OTP registration flow + Google OAuth, with middleware‑enforced route protection.
- **SEO** — server‑rendered `metadata`/`generateMetadata`, locale‑aware `robots.txt` and `sitemap.xml`, Open Graph/Twitter tags.
- **Single unified theme** — one consistent color system across the whole site.

---

## Mock Data Architecture — how this would connect to a real backend

This build has **no live backend**. It's deployed here as a **frontend showcase**, so every function that would normally hit a network endpoint instead resolves against realistic fixtures in `src/mocks/fixtures/`. The point isn't just "fake the data" — it's to keep the exact same seam a real integration would use, so the diff to plug in a live API is small and obvious.

**The pattern, consistently, in every `src/api/*.ts` module:**

```ts
export const getMenuItems = async (params: Record<string, unknown> = {}): Promise<MenuItemsApiResponse> => {
  // PRODUCTION: return axiosInstance.get<MenuItemsApiResponse>("/menu-items", { params });
  const items = /* ...filter mockMenuItems by params... */;
  return mockResponse({ items });
};
```

- **Same function signature, same params, same return type** (`ApiResponse<T>`) as a real network call would have.
- The commented line directly above the mock body is the **exact real call it replaces** — not a placeholder, an accurate one-line diff.
- `src/mocks/mockClient.ts` wraps every mock result in the identical `{ success, data, message }` envelope the real backend uses, plus a small simulated network delay — so loading states, skeletons, and `Suspense` fallbacks behave the way they would in production, not artificially instant.
- Server Components that call `createServerAxios()` directly (home, shop, about‑us, contact‑us, sitemap — see [Data layer](#data-layer)) get a **mock Axios-shaped client** (`src/api/config/serverAxios.ts`) whose `.get()`/`.post()` pattern‑match the request URL against the same fixtures. The real implementation (`axios.create({ baseURL, headers })`) is preserved as a commented block at the bottom of that file.

**To connect a real backend:** set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`, then in each `src/api/*.ts` file and in `src/api/config/serverAxios.ts`, swap the mock call for the commented `axiosInstance`/`createServerAxios` line directly above it. No changes needed anywhere above the API layer — hooks, stores, and components all consume the same `ApiResponse<T>` contract either way.

**What's mocked, specifically** (`src/mocks/fixtures/`):

| Fixture | Backs |
|---|---|
| `menuItems.ts` | 24 dishes across 6 categories, each with real sizes/ingredients; a few carry option groups + sauce customizations to exercise the full cart‑edit UI |
| `categories.ts` | Menu categories, each with a fitting image from `public/img/dishes/` |
| `branches.ts` | Two restaurant branches (address, hours, geo) |
| `chefs.ts` | Chef bios for the About page, using `public/img/chefe/` |
| `slides.ts` | Home banner slides, using `public/img/banner/` |
| `users.ts` | One demo user + 3 realistic past orders (delivered / stripe‑paid / processing) for Profile & Orders |

**Auth in this build:** any email/password signs in successfully (there's no credential store to check against); OTP screens accept any 4‑digit code; Stripe checkout is stubbed — the UI runs the full flow but never talks to Stripe, so **Cash on Delivery is the way to complete checkout end‑to‑end** in this demo.

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

- `src/api/*` — one module per backend resource (`auth`, `menu`, `orders`, `payments`, …), all typed against a shared `ApiResponse<T>` envelope. In this build every function resolves against `src/mocks/fixtures/*` — see [Mock Data Architecture](#mock-data-architecture--how-this--would-connect-to-a-real-backend) for the exact swap-in point for a real API.
- `src/api/config/axios.ts` — the real client-side Axios instance (bearer token, branch id, `Accept-Language`, error normalization) is still here, fully wired, just not called by anything in this mock build. `src/api/config/serverAxios.ts` is the server-side equivalent, currently mock-routed for Server Components (safe inside `unstable_cache`).
- `src/hooks/*` — data‑fetching hooks with an in‑memory cache + request de‑duplication that invalidates when the selected branch changes (this layer is unchanged by the mock swap — it just calls `src/api/*` the same way it always would).

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
├── mocks/                       # fixtures/ (menu, branches, chefs, slides, users/orders) + mockClient.ts
└── store/                      # Zustand stores
proxy.ts                        # locale routing + auth middleware (Next.js 16 convention)
```

## Getting Started

```bash
npm install
npm run dev
```

Then open **http://localhost:3000/en** (or `/ar`, `/bg`). No `.env` setup, database, or API keys required — everything runs against local mock data out of the box.

> **Dev note on the root redirect:** In production, `proxy.ts` redirects `/` → `/{locale}` automatically. In local dev this redirect depends on Next.js's edge‑runtime middleware, which currently does **not** run under **Node.js v24** (an upstream Next 16 + Turbopack incompatibility). If `/` returns 404 in dev, either navigate directly to `/en` · `/ar` · `/bg`, or run dev on **Node 20/22 LTS**, where the middleware (and the automatic `/` redirect) works. Production builds are unaffected — the redirect works there regardless.

## Environment Variables

Not required to run this build — see the note above. `.env.local` only matters once you [connect a real backend](#mock-data-architecture--how-this-would-connect-to-a-real-backend):

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-real-api.example.com/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-oauth-client-id>
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=<oauth-redirect-uri>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
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

- **This is a mock-data build, by design** — see [Mock Data Architecture](#mock-data-architecture--how-this-would-connect-to-a-real-backend). Card payments, real auth, and persisted orders across sessions/devices are intentionally out of scope here; the live, backend-connected version is linked at the top of this README.
- **Middleware in dev under Node 24** — see the dev note above. Production is unaffected.
- **Pre-existing test import** — a few Jest suites reference a `src/__tests__/utils/mockData` helper that was never committed to the repo; those specific suites won't run until that fixture is added. This predates the frontend/mock rework and is unrelated to it.
- **Mock catalog is English-first** — the 24 mock menu items and 4 mock chefs are written in English with Bulgarian/Arabic translations of the *site chrome* (nav, buttons, forms, labels) fully in place; a real backend would supply its own per-locale product copy the same way `getLocalizedField()` already expects (`name_en`/`name_bg`/etc. fields are wired and ready).
- Some deeply dynamic payloads are typed loosely (`Record<string, unknown>` / narrowed at the read site) where a real backend would have no fixed schema either — deliberate, to avoid inventing contracts an API doesn't guarantee.
