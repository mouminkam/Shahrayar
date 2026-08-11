/**
 * Image URL resolver — the seam where remote (backend) images would be rewritten.
 *
 * WHY THIS IS A PASS-THROUGH
 * In the integrated build every image lived on the API host, so this module
 * rewrote `https://<api-host>/storage/x.png` into `/api/images/storage/x.png`,
 * a Next route handler that proxied the bytes to dodge CORS. This portfolio
 * build has **no backend**: every image in `src/mocks/fixtures/*` is a local
 * file under `public/img/`, so there is nothing to proxy and no cross-origin
 * request to make.
 *
 * The functions are kept (same names, same signatures) so that call sites —
 * OptimizedImage, ChefeSection, BannerSection, productTransform — read exactly
 * as they do in the integrated version. To wire a real backend back up, restore
 * the URL-rewriting body described in each PRODUCTION note and re-add the
 * `/api/images/[...path]` route handler.
 */

/**
 * PRODUCTION: `return imageUrl.includes(API_DOMAIN)` where `API_DOMAIN` comes
 * from `NEXT_PUBLIC_API_BASE_URL`. With no backend, no URL is ever an API URL.
 */
export function isApiImageUrl(_imageUrl: string | null | undefined): boolean {
  return false;
}

/**
 * Resolves an image URL for use in a Next `<Image>`.
 *
 * PRODUCTION: rewrote API-hosted URLs to `/api/images/<path>` (the CORS proxy
 * route) and left everything else untouched. Here every source is already a
 * local `/img/...` path, so it is returned as-is.
 */
export function getProxiedImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || typeof imageUrl !== "string") {
    return imageUrl ?? null;
  }
  return imageUrl;
}

/** Batch form of {@link getProxiedImageUrl}. */
export function getProxiedImageUrls(imageUrls: (string | null | undefined)[]): (string | null)[] {
  if (!Array.isArray(imageUrls)) {
    return [];
  }
  return imageUrls.map((url) => getProxiedImageUrl(url));
}

/**
 * Resolves the image-bearing keys of an object (e.g. a slide from the API).
 * A no-op here for the same reason as {@link getProxiedImageUrl}, but kept so
 * response-shaping call sites stay identical to the integrated build.
 */
export function proxyObjectImages<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  imageKeys: string[] = ["image", "image_url", "desktop_image", "mobile_image", "thumbnail"]
): T | null | undefined {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const resolved: Record<string, unknown> = { ...obj };

  imageKeys.forEach((key) => {
    const value = resolved[key];
    if (value && typeof value === "string") {
      resolved[key] = getProxiedImageUrl(value);
    }
  });

  return resolved as T;
}
