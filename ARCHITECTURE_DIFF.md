# Magic Show vs Shahrayar — Frontend Architecture Comparison

**Date:** 2026-03-28
**Auditor:** Cursor Audit (Claude Opus)
**Magic Show Path:** `E:\Peak Link Project\magic show\Magic Show Project(NEXT.JS) - Copy (2) - Copy\Magic-Show Front-End`
**Shahrayar Path:** `E:\Peak Link Project\shahriar\Shahrayar next.js`

---

## 1. Page-by-Page Rendering Strategy

### Magic Show (Reference)

| Route | Rendering | `"use client"` | `metadata` Export | `loading.jsx` | `error.jsx` | Data Fetching |
|-------|-----------|-----------------|-------------------|---------------|-------------|---------------|
| `/` (redirects to `/home`) | SSR | No | Yes (static) | Yes | Yes | — |
| `/home` | SSR (async) | No | Yes (static) | — | — | `cachedServerApi` + `Promise.all` |
| `/about-us` | SSR (async) | No | Yes (static) | Yes | Yes | `cachedServerApi` + promises |
| `/blog` | SSR (async) | No | Yes (static) | Yes | Yes | `cachedServerApi` + `Promise.all` |
| `/blog/[id]` | SSR (async) | No | `generateMetadata` | — | — | `cachedServerApi` |
| `/shop` | SSR (async) | No | Yes (static) | Yes | Yes | `cachedServerApi` + promises |
| `/shop/[id]` | SSR (async) | No | `generateMetadata` | Yes | — | `cachedServerApi` |
| `/cart` | CSR | Yes | — | — | Yes | Client-side (Protected) |
| `/checkout` | CSR | Yes | — | Yes | Yes | Client-side (Protected + cart state) |
| `/contact-us` | SSR (async) | No | Yes (static) | Yes | — | `cachedServerApi` + promises |
| `/stores` | SSR (async) | No | Yes (static) | Yes | — | `cachedServerApi` + promises |
| `/login` | CSR | Yes | — | — | — | Client-side (GuestOnly) |
| `/register` | CSR | Yes | — | — | — | Client-side (GuestOnly) |
| `/forgot-password` | CSR | Yes | — | — | — | Client-side |
| `/reset-password` | CSR | Yes | — | — | — | Client-side |
| `/profile` | CSR | Yes | — | Yes | Yes | Client-side (Protected) |
| `/wishlist` | CSR | Yes | — | Yes | Yes | Client-side (Protected) |
| `/order-confirmation/[id]` | SSR (async) | No | — | Yes | Yes | Server-side fetch |

**Summary:** 10 SSR pages, 8 CSR pages. CSR only used when genuinely required (auth state, cart state, form interactivity).

### Shahrayar (Current)

| Route | Rendering | `"use client"` | SEO Approach | `loading.jsx` | `error.jsx` | Data Fetching |
|-------|-----------|-----------------|--------------|---------------|-------------|---------------|
| `/` (home) | SSR (async) | No | `PageSEO` (client) | — | — | Module-level `Map()` cache |
| `/about-us` | SSR (async) | No | `PageSEO` (client) | — | — | Module-level `Map()` cache |
| `/contact-us` | SSR (async) | No | `PageSEO` (client) | — | — | Module-level `Map()` cache |
| `/shop` | **CSR** | **Yes** | `PageSEO` (client) | — | — | Client `useEffect` |
| `/shop/[id]` | SSR (async) | No | `PageSEO` (client) | — | — | Server-side fetch |
| `/cart` | **CSR** | **Yes** | — | — | — | Client Zustand store |
| `/checkout` | **CSR** | **Yes** | `PageSEO` (client) | — | — | Client `Protected` |
| `/checkout/stripe/pay` | **CSR** | **Yes** | — | — | — | Client Stripe SDK |
| `/checkout/stripe/success` | **CSR** | **Yes** | — | — | — | Client API polling |
| `/checkout/stripe/failed` | **CSR** | **Yes** | — | — | — | — |
| `/checkout/stripe/cancel` | **CSR** | **Yes** | — | — | — | — |
| `/profile` | **CSR** | **Yes** | `PageSEO` (client) | — | — | Client `Protected` |
| `/orders` | **CSR** | **Yes** | — | — | — | Client `Protected` |
| `/orders/[id]` | **CSR** | **Yes** | — | — | — | Client fetch |
| `/orders/[id]/success` | **CSR** | **Yes** | — | — | — | Client fetch |
| `/login` | **CSR** | **Yes** | — | — | — | Client form |
| `/register` | **CSR** | **Yes** | — | — | — | Client form |
| `/forgot-password` | **CSR** | **Yes** | — | — | — | Client form |
| `/reset-password` | **CSR** | **Yes** | — | — | — | Client form |
| `/verify-reset-token` | **CSR** | **Yes** | — | — | — | Client form |
| `/add-phone` | **CSR** | **Yes** | — | — | — | Client form |
| `/enter-otp` | **CSR** | **Yes** | — | — | — | Client form |
| `/add-information` | **CSR** | **Yes** | — | — | — | Client form |
| `/confirm-information` | **CSR** | **Yes** | — | — | — | Client form |

**Summary:** 4 SSR pages, 20 CSR pages. Zero `loading.jsx`, zero `error.jsx`, zero server-side `metadata`.

### Target State (After Migration)

| Route | Target Rendering | Rationale |
|-------|-----------------|-----------|
| `/` (home) | SSR | Already SSR; fix caching pattern |
| `/about-us` | SSR | Already SSR; fix caching pattern |
| `/contact-us` | SSR | Already SSR; fix caching pattern |
| `/shop` | **SSR** | Public page, SEO-critical; move data fetching to server |
| `/shop/[id]` | SSR | Already SSR; add `generateMetadata` |
| `/cart` | CSR (keep) | Requires auth + client cart state |
| `/checkout` | CSR (keep) | Requires auth + cart + forms |
| `/checkout/stripe/*` | CSR (keep) | Requires Stripe client SDK |
| `/profile` | CSR (keep) | Requires auth |
| `/orders` | CSR (keep) | Requires auth |
| `/orders/[id]` | CSR (keep) | Requires auth |
| `/orders/[id]/success` | CSR (keep) | Requires auth + order state |
| `/login` | **Remove `"use client"` from page** | Page itself can be server; `LoginForm` stays client |
| `/register` | **Remove `"use client"` from page** | Same pattern as login |
| `/forgot-password` | **Remove `"use client"` from page** | Same pattern |
| `/reset-password` | **Remove `"use client"` from page** | Same pattern |
| `/verify-reset-token` | **Remove `"use client"` from page** | Same pattern |
| `/add-phone` | **Remove `"use client"` from page** | Same pattern |
| `/enter-otp` | **Remove `"use client"` from page** | Same pattern |
| `/add-information` | **Remove `"use client"` from page** | Same pattern |
| `/confirm-information` | **Remove `"use client"` from page** | Same pattern |

---

## 2. Component Splitting (Main Section vs Secondary Section)

### Magic Show Pattern

Magic Show uses a deliberate page-splitting pattern on content-heavy pages:

**Main Section (above-the-fold):**
- Rendered synchronously in the Server Component
- Awaited or streamed immediately
- Contains hero/banner, primary content, breadcrumbs

**Secondary Section (below-the-fold):**
- Wrapped in `<Suspense>` with `SectionSkeleton` fallback
- Often loaded via `dynamic()` import
- Contains related products, comments, sidebar filters, newsletter

**Example — `shop/page.jsx`:**
```
Page (Server Component)
├── Banner (Suspense + stream)         ← MAIN
├── TopControls (Suspense + dynamic)   ← MAIN
├── Sidebar (Suspense + dynamic)       ← SECONDARY
└── Products (Suspense + stream)       ← SECONDARY (streamed via promise)
```

**Example — `home/page.jsx`:**
```
Page (Server Component)
├── HomeBanner (sync, awaited)         ← MAIN
├── FeaturedCategories (sync, awaited) ← MAIN
└── SecondarySections (Suspense)       ← SECONDARY
    ├── NewArrivals
    ├── BestSellers
    ├── FeaturedProducts
    ├── WhyChooseUs
    ├── CustomerReviews
    ├── LatestBlog
    └── Newsletter
```

### Shahrayar Current State

Shahrayar has **no** Main/Secondary splitting. All content-heavy pages load a single monolithic component:

| Page | Current Structure | Splitting Needed? |
|------|-------------------|-------------------|
| `/` (home) | Single `<HomeSection>` via `dynamic()` | Yes — banner should be Main; food menu, chefs, etc. should be Secondary |
| `/about-us` | Single `<AboutUsSection>` via `dynamic()` | Yes — hero/breadcrumb as Main; chefs, slides as Secondary |
| `/contact-us` | Single `<ContactSection>` via `dynamic()` | Yes — hero/breadcrumb as Main; map, form as Secondary |
| `/shop` | Single `<ShopSection>` via `dynamic()` with `ssr: false` | Yes — shop banner + top controls as Main; product grid + sidebar as Secondary |
| `/shop/[id]` | Already partially split (server fetch + component) | Yes — product details as Main; related products as Secondary |

### Target Splitting Plan

For each content page, apply the following pattern:

```jsx
// target pattern — e.g., shop/page.jsx
export default async function ShopPage() {
  const lang = await getLanguage();
  const serverAxios = await createServerAxios();

  // === MAIN SECTION (awaited, immediate render) ===
  const bannerPromise = cachedServerApi([...], () => getBanner(serverAxios), ...);

  // === SECONDARY SECTION (deferred, Suspense-wrapped) ===
  const productsPromise = cachedServerApi([...], () => getProducts(serverAxios), ...);

  return (
    <div>
      {/* MAIN SECTION */}
      <Suspense fallback={<SectionSkeleton />}>
        <BannerStream bannerPromise={bannerPromise} />
      </Suspense>

      {/* SECONDARY SECTION */}
      <Suspense fallback={<SectionSkeleton variant="grid" />}>
        <SecondarySections productsPromise={productsPromise} />
      </Suspense>
    </div>
  );
}
```

---

## 3. Route Protection Comparison

| Aspect | Magic Show | Shahrayar |
|--------|-----------|-----------|
| Middleware auth check | Yes — checks `auth-token` cookie + `Authorization` header | **No** — only forwards header |
| Protected routes in middleware | `/cart`, `/checkout`, `/profile`, `/wishlist` | **None** |
| Redirect on unauthorized | `302` to `/login?redirect=<path>` | **No server redirect** |
| Client-side guard | `<Protected>` with `hydrated` state | `<Protected>` with `isLoading` state |
| Flash of protected content | Prevented (middleware redirects before page loads) | **Present** (JS must load before redirect) |
| Auth token in cookie | Yes — JS cookie `auth-token` written on login | **No** — localStorage only |
| Guest-only routes | `<GuestOnly>` for login/register | `<GuestOnly>` for auth flow pages |
| Matcher config | Explicit route list | Broad catch-all (excludes static) |

### Shahrayar Pages Missing Middleware Protection

| Route | Has `<Protected>`? | Needs Middleware? |
|-------|--------------------|-------------------|
| `/cart` | **No** | Yes |
| `/checkout` | Yes | Yes |
| `/checkout/stripe/pay` | **No** | Yes |
| `/checkout/stripe/success` | **No** | Yes |
| `/checkout/stripe/failed` | **No** | Yes |
| `/checkout/stripe/cancel` | **No** | Yes |
| `/profile` | Yes | Yes |
| `/orders` | Yes | Yes |
| `/orders/[id]` | **No** | Yes |
| `/orders/[id]/success` | **No** | Yes |

---

## 4. Data Fetching & Caching Comparison

| Aspect | Magic Show | Shahrayar |
|--------|-----------|-----------|
| Server-side fetching | `cachedServerApi()` wrapping `unstable_cache` | Module-level `Map()` (3 pages) or client-side `useEffect` |
| Cache invalidation | Tag-based (`revalidateTag()`) | Manual TTL only |
| API client (server) | `createServerAxios()` — new instance per request | Same `createServerAxios()` pattern |
| API client (client) | `clientAxios.js` with interceptors | `axios.js` with interceptors |
| Promise streaming | Yes — promises passed to components, resolved in Suspense | No — data awaited before render |
| `revalidate` export | Via `CACHE_REVALIDATE` config | Hardcoded `180` or `300` |

---

## 5. SEO Strategy Comparison

| Aspect | Magic Show | Shahrayar |
|--------|-----------|-----------|
| Metadata approach | `export const metadata` / `generateMetadata()` | `<PageSEO>` client component (invisible to crawlers) |
| Title template | Not used (manual per-page) | Root layout has `%s | Shahrayar Restaurant` template |
| `robots.ts` | Yes | No |
| `sitemap.ts` | Yes | No |
| OG/Twitter tags | Server-rendered in `<head>` | Client-injected via `useEffect` |
| Canonical URLs | Via metadata | Client-injected via `useEffect` |

---

## 6. Missing Architectural Patterns

| Pattern | Magic Show | Shahrayar | Priority |
|---------|-----------|-----------|----------|
| Security headers in `next.config.ts` | 5 headers + CORS scoping | **None** | P0 |
| Middleware route protection | Cookie-based auth check | **Header forwarding only** | P0 |
| Auth cookie sync | JS cookie `auth-token` on login | **Missing** | P0 |
| Server-side `metadata` exports | All public pages | **None** — uses client `PageSEO` | P1 |
| `loading.jsx` per route | 11 routes | **0 routes** | P1 |
| `error.jsx` per route | 9 routes | **0 routes** | P1 |
| `global-error.jsx` | Yes | **No** | P1 |
| `cachedServerApi` (Next.js cache) | All SSR data fetching | **Module-level `Map()`** | P1 |
| Page splitting (Main/Secondary) | All content pages | **None** | P2 |
| SVG CSP sandbox | `contentSecurityPolicy` set | **Missing** | P2 |
| `robots.ts` | Yes | **No** | P3 |
| `sitemap.ts` | Yes | **No** | P3 |
| HTML sanitization (`isomorphic-dompurify`) | Blog content sanitized | **Legal content unsanitized** | P1 |
| Colocated `_components/` pattern | All routes | **Uses `src/components/pages/`** | P3 |

---

## 7. Priority-Ordered Migration Roadmap

### Phase A — Security Hardening (P0) — Estimated: 1 session

1. **Add security headers** to `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
2. **Add auth cookie sync** to `authStore.js` — write `auth-token` cookie on login/logout
3. **Rewrite `middleware.js`** — add cookie-based auth checks for protected routes
4. **Add SVG CSP sandbox** to `next.config.ts`
5. **Sanitize `dangerouslySetInnerHTML`** in `LegalContentSection.jsx` (install `isomorphic-dompurify`)
6. **Run `npm audit fix`** to patch dependency vulnerabilities
7. **Guard console.log** in `axios.js` and Stripe pages with `NODE_ENV` check

### Phase B — SSR/CSR Migration (P1) — Estimated: 2-3 sessions

1. **Convert `/shop` to SSR** — highest-traffic public page, SEO-critical
   - Remove `"use client"` from `page.jsx`
   - Move data fetching to server using `cachedServerApi`
   - Replace `useLanguage()` with `getLanguage()`
   - Replace `<PageSEO>` with `export const metadata`
   - Keep `ShopSection` as client component via `dynamic()` import
2. **Replace module-level `Map()` cache** in `/`, `/about-us`, `/contact-us` with `cachedServerApi` pattern
3. **Add `loading.jsx` and `error.jsx`** to all routes (start with `/`, `/shop`, `/shop/[id]`, `/checkout`, `/profile`)
4. **Add root `global-error.jsx`** and root `error.jsx`
5. **Convert auth pages to server page + client form** pattern:
   - `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-reset-token`
   - `/add-phone`, `/enter-otp`, `/add-information`, `/confirm-information`
   - Pattern: Server page renders layout + `metadata`, `dynamic()` imports the client form component

### Phase C — Page Splitting (P2) — Estimated: 2 sessions

1. **Split `/` (home)** into Main (banner) + Secondary (food menu, chefs, etc.)
2. **Split `/about-us`** into Main (hero) + Secondary (chefs, slides)
3. **Split `/contact-us`** into Main (hero, breadcrumb) + Secondary (map, form)
4. **Split `/shop`** into Main (banner, controls) + Secondary (product grid, sidebar)
5. **Split `/shop/[id]`** into Main (product details) + Secondary (related products)

### Phase D — SEO & Polish (P3) — Estimated: 1 session

1. **Replace all `<PageSEO>` usage** with server-side `metadata` exports or `generateMetadata()`
2. **Add `robots.ts`** and **`sitemap.ts`**
3. **Remove unused dependencies** (`cross`, `next-intl`, `next-seo`, `smooth-scrollbar`)
4. **Add Zod validation** to forgot-password and reset-password forms
5. **Evaluate `LanguageContext` removal** — replace with server-side `getLanguage()` + client-side `getLanguageClient()` where needed

---

## 8. File Structure Comparison

### Magic Show — Colocated `_components/` Pattern

```
src/app/
├── shop/
│   ├── page.jsx              ← Server Component
│   ├── loading.jsx
│   ├── error.jsx
│   └── _components/
│       ├── ShopShell.jsx
│       ├── ShopBannerStream.jsx
│       ├── ShopProductsStream.jsx
│       ├── SecondarySections.jsx
│       └── ...
```

### Shahrayar — Centralized `components/pages/` Pattern

```
src/app/
├── shop/
│   └── page.jsx              ← Client Component ("use client")
src/components/
├── pages/
│   └── shop/
│       ├── ShopSection.jsx   ← Monolithic component
│       ├── ShopSidebar.jsx
│       └── ...
```

**Recommendation:** Shahrayar's centralized pattern is functional and doesn't need migration for correctness. However, for the pages being refactored to SSR with Main/Secondary splitting, consider colocating stream/section components under `_components/` for consistency and discoverability. This is a P3 cosmetic improvement.
