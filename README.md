<p align="center">
  <img src=".github/assets/logo.png" alt="Shahrayar" width="200" />
</p>

<h1 align="center">Shahrayar — Storefront</h1>

<p align="center">
  <em>Char-grilled shawarma, wood-fired pizza, and plates built to share.<br/>
  A frontend-only rebuild — and every dish photo is the actual dish, not a gray box someone forgot to swap out.</em>
</p>

<p align="center">
  <a href="https://shahrayar.vercel.app/en" target="_blank" rel="noopener noreferrer">
    <img alt="Live Demo" src="https://img.shields.io/badge/▶_LIVE_DEMO-shahrayar.vercel.app-EB0029?style=for-the-badge&logoColor=white" />
  </a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="i18n" src="https://img.shields.io/badge/i18n-en_·_ar_·_bg-8b5cf6" />
  <img alt="RTL" src="https://img.shields.io/badge/RTL-supported-25c2a0" />
</p>

---

## What this is

This is the customer-facing storefront for **Shahrayar**, a Middle Eastern restaurant — menu
browsing, per-dish customization, cart, coupons, delivery quotes, checkout, order history, and a
full auth flow, in **three languages** with correct right-to-left rendering for Arabic. It's built
the way you'd build the real thing, then had its network cord cut on purpose.

> 🔗 **[shahrayar.vercel.app](https://shahrayar.vercel.app/en)** is this exact repository, deployed as-is — nothing
> hidden behind it.
>
> There's no backend, no database, and no API keys anywhere in this build, on purpose: it's meant to be read
> end to end as a piece of frontend engineering, cloned and running locally in under a minute, or clicked
> straight through in the browser above. Every function that would normally call a network endpoint resolves
> against realistic local fixtures instead, through the *exact same seam* a real API call would use. See
> [Mock data architecture](#mock-data-architecture) for where that seam is, and how thin the diff is to
> reconnect it.

## Getting started

```bash
npm install
npm run dev
```

Open **http://localhost:3000** — it redirects to `/en` (or go straight to `/en`, `/ar`, `/bg`).
Nothing else to configure: no `.env` file, no database, no seed step. Every menu item, category,
chef, branch, and demo order is a plain TypeScript module, already there the moment the app boots.

```bash
npm run build          # production build (runs the TypeScript check)
npm start               # serve the production build
npm run lint            # ESLint
npm test                 # Jest — unit tests
npm run test:watch      # Jest --watch
npm run test:coverage   # Jest --coverage
```

## What's actually in the box

- **Full ordering flow** — browse the menu, customize a dish (size, ingredients, option groups,
  sauces), add to cart, apply a coupon, get a delivery quote, check out, and see order history —
  all fully interactive against mock data, not a static mockup someone can only look at.
- **Trilingual, with real RTL** — English, Arabic, and Bulgarian (~370–385 translation keys each) via
  `/{locale}/...` routing, with automatic locale detection (cookie → `Accept-Language` → default).
  Arabic renders `dir="rtl"` from the very first server-rendered byte — no client-side flip, no
  layout flash you can catch if you refresh fast enough.
- **Full auth flow** — register, sign in, phone-OTP verification, Google OAuth, forgot/reset
  password — running end-to-end against the mock layer, including the edge cases (invalid
  credentials, validation errors) that get skipped in most demos because nobody double-checks them.
- **A checkout that actually works** — an interactive Leaflet delivery map with reverse geocoding,
  a live delivery-fee quote, and Cash-on-Delivery as a fully completable path (Stripe is wired but
  intentionally stubbed — see [Honest trade-offs](#honest-trade-offs)).
- **SEO that's actually server-rendered** — `generateMetadata` per route, a locale-aware
  `sitemap.xml` and `robots.txt`, Open Graph/Twitter tags, and static legal pages
  (`/terms-conditions`, `/privacy-policy`) that are both linkable on their own and reusable inside
  an in-page modal, from the same content and the same rendering component.
- **One deliberate visual identity** — a single consistent color system across the whole site
  (`#EB0029` / `#FFBA00`), not a light/dark toggle bolted on for the sake of having one.

## Tech stack

| Area | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript**, strict — 100% of `src` is `.ts`/`.tsx` |
| UI runtime | **React 19** |
| Styling | **Tailwind CSS v4** |
| Animation | Framer Motion, Lenis (smooth scroll) |
| Maps | Leaflet (checkout delivery picker) |
| State | **Zustand**, persisted to `localStorage` |
| Forms & validation | React Hook Form + **Zod** |
| Payments | **Stripe** (`@stripe/react-stripe-js`) |
| HTTP client | Axios — client and server instances, fully wired, not currently called (see below) |
| Sanitization | `isomorphic-dompurify`, for any HTML rendered from data |
| Tests | Jest + Testing Library |

## Routes

```
/                                     redirects to /{locale}
/{locale}                             home — hero, popular/latest dishes, chef's special, chefs
/{locale}/shop  /shop/[id]            menu listing (client-side filtering) · dish detail
/{locale}/cart  /checkout             cart · shipping + delivery map + payment, order placement
/{locale}/checkout/stripe/*           pay · success · failed · cancel
/{locale}/orders  /orders/[id]        order history · order detail (+ /success confirmation)
/{locale}/profile                     account details
/{locale}/login  /register            email/password + Google OAuth
/{locale}/forgot-password  /reset-password
/{locale}/add-phone  /enter-otp  /add-information  /confirm-information   phone-OTP registration
/{locale}/about-us  /contact-us
/{locale}/terms-conditions  /privacy-policy      statically generated, all 3 locales
/sitemap.xml  /robots.txt
```

## How it's put together

```
src/
  app/[lang]/       Next.js App Router routes. [lang]/layout.tsx is the one root
                     layout — it renders <html lang dir>, so locale and text
                     direction are correct in the very first byte the server sends.
  content/          Static site content (menu, branches, chefs, legal copy) as
                     plain TypeScript modules — resolved at build time, no fetch.
  mocks/            The mock data layer: fixtures/ (menu items, orders, users, …)
                     plus mockClient.ts, the envelope every src/api/* call resolves
                     through instead of a network request.
  api/               One module per backend resource (auth, menu, orders, payments,
                     …), each typed against a shared ApiResponse<T> envelope —
                     see Mock data architecture below.
  components/       ui/, layout/, cart/, auth/, pages/<route>/, seo/
  hooks/            Data + UI hooks — cart helpers, localized routing, API caching.
  store/            Zustand stores — cart, auth, branch, toast.
  lib/               Utilities, Zod validation schemas, i18n helpers.
  locales/          en.json, ar.json, bg.json + i18n/{config,getTranslation}.ts
proxy.ts            Locale detection + auth route protection (Next.js 16's
                     renamed middleware convention).
```

## Mock data architecture

This build has **no live backend** — it's published as a frontend showcase, so every function that
would normally hit a network endpoint resolves against realistic fixtures in `src/mocks/fixtures/`
instead. The point isn't just "fake the data" — it's to keep the exact seam a real integration would
use, so the diff to plug one in is small and honest about where it happens.

**The pattern, consistently, in every `src/api/*.ts` module:**

```ts
export const getMenuItems = async (params: Record<string, unknown> = {}): Promise<MenuItemsApiResponse> => {
  // PRODUCTION: return axiosInstance.get<MenuItemsApiResponse>("/menu-items", { params });
  const items = /* ...filter mockMenuItems by params... */;
  return mockResponse({ items });
};
```

- Same function signature, same params, same `ApiResponse<T>` return type a real network call
  would have.
- The commented `PRODUCTION:` line directly above the mock body is the **exact real call it
  replaces** — not a placeholder comment, an accurate one-line diff.
- `src/mocks/mockClient.ts` wraps every result in the identical `{ success, data, message }`
  envelope a real backend would use, so loading states and skeletons behave the way they would in
  production rather than resolving artificially instant.
- `src/api/config/axios.ts` — the real client-side Axios instance (bearer token from the Zustand
  auth store, selected branch id, `Accept-Language`, error normalization) is fully wired and still
  here, it's just not called by anything in this build.

**To connect a real backend:** set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (see `.env.example`),
then in each `src/api/*.ts` file swap the mock call for the commented `axiosInstance` line directly
above it. Nothing above the API layer — hooks, stores, components — needs to change; they all
already consume the same `ApiResponse<T>` contract.

| Fixture | Backs |
|---|---|
| `content/menu.ts` | 15 dishes across 5 categories, several with option groups + sauce customizations, so the cart-edit UI has something real to exercise |
| `content/restaurant.ts` | 2 branches, 3 chef bios, 3 home banner slides |
| `mocks/fixtures/users.ts` | A demo account with realistic past orders (delivered / Stripe-paid / processing) |
| `mocks/fixtures/geocode.ts` | A local reverse-geocoder for the checkout map — see below |
| `content/legal.ts` | Terms & Conditions / Privacy Policy copy, in all 3 locales |

**Auth in this build:** any email/password combination signs in successfully (there's no credential
store to check against); OTP screens accept any 4-digit code; Stripe checkout is stubbed — the UI
runs the full flow but never talks to Stripe, so **Cash on Delivery is how you complete checkout
end-to-end** here.

## Two worked examples

### 1. A kitchen doesn't plate a photo of the dish. This one nearly did.

Partway through this rebuild, a routine "make the images sharper" pass turned into something more
interesting. A scripted scan of every file under `public/img` for a specific gray
(`rgb(184,184,184)`) turned up **81 literal `"580X550"`-style placeholder stubs** — leftovers from
the original template that were never swapped for real photography. Most were harmless, unused
files sitting dead in the repo. But cross-referencing each one against `src/` with `git grep` found
**9 that were still wired into live mock data**: five menu dishes and three desserts a customer
could add to their cart, a burger, and the demo account's own profile picture. Log in, check your
order history, and you'd have been looking at a gray box with dimensions printed on it instead of a
kunafa.

That's the kind of bug that's easy to miss precisely *because* it doesn't crash anything — the page
renders, the layout holds, nothing throws. It only shows up if you actually look at what's on
screen, the same way a server only catches a wrong plate by checking it before it goes out. Fixed
now: real photography sourced and cropped to match each dish, and the three chef portraits — which
*were* real, just under-resolved for how large their cards render them — recomposited into the
site's existing decorative frame (a rounded corner and a diagonal red accent baked directly into the
original PNGs) so the design is untouched and only the photo underneath got sharper. The other ~65
placeholder files were left exactly as they were: confirmed dead, so replacing them would only be
downloading stock photos nobody would ever see. Full before/after list, with sources, in
[`docs/PHOTO_CREDITS.md`](docs/PHOTO_CREDITS.md).

### 2. The delivery map doesn't call a public API to work

The checkout page lets you drop a pin and reverse-geocodes it into a street address. The obvious way
to do that is [Nominatim](https://nominatim.org/) — free, and exactly what the integrated build uses.
It's also a shared public service with a strict 1 request/second rate limit and a User-Agent check,
which is a bad dependency for a page anyone can click through on a portfolio: a burst of visits would
start returning 429s that read to a visitor as "this feature is broken."

`src/mocks/fixtures/geocode.ts` resolves the lookup locally instead: it snaps the dropped pin to the
nearest of a handful of real Sofia districts and returns an address in the exact shape Nominatim's
`address` object has, so the calling code — validation, form autofill, the delivery-fee quote that
follows it — is unchanged. Drag the pin around `/checkout` and the address updates immediately, no
external call, no rate limit, nothing that can go down.

## Honest trade-offs

Nobody's portfolio project is finished, and pretending otherwise isn't useful to anyone evaluating
this code:

- **The Jest suite has no working config yet.** `jest`, `jest-environment-jsdom`, and
  `@testing-library/*` are installed and several `*.test.ts(x)` files exist, but there's no
  `jest.config` wiring TypeScript/JSX transformation or module resolution, so `npm test` currently
  fails to even compile the suites. This is a known gap being closed, not a silent one.
- **Card payments don't charge anything.** Stripe is fully wired on the UI side and stops at a
  clearly-labeled stub — see [Mock data architecture](#mock-data-architecture). Cash on Delivery is
  the intentional way to reach a real order confirmation in this build.
- **The mock catalog is English-first.** The 15 mock dishes and 3 mock chefs are written in English;
  Bulgarian/Arabic translations of the *site chrome* (nav, buttons, forms, labels) are fully in
  place. A real backend would supply its own per-locale product copy the same way
  `getLocalizedField()` already expects (`name_en`/`name_bg`/… fields are wired and ready).
- **This build has no persistence.** Everything lives in memory/`localStorage` for the session —
  intentional for a mock-data demo, not a corner cut by accident.
