/**
 * API Cache Manager
 * Simple in-memory cache with TTL (Time To Live) support
 * Handles cache invalidation and request deduplication
 */

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Cache entry structure: { data, timestamp, ttl }
const cache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>(); // For request deduplication

/**
 * Generate cache key from URL and params
 * @param url - API endpoint URL
 * @param params - Request parameters
 * @param branchId - Branch ID (optional)
 * @param language - Language code (optional, will be read from cookie if not provided)
 * @returns Cache key
 */
export function generateCacheKey(
  url: string,
  params: Record<string, unknown> = {},
  branchId: string | number | null = null,
  language: string | null = null
): string {
  // If language not provided, read from cookie
  let resolvedLanguage = language;
  if (resolvedLanguage === null && typeof document !== 'undefined') {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; language=`);

      if (parts.length === 2) {
        const lang = parts.pop()!.split(';').shift();
        resolvedLanguage = lang === 'en' ? 'en' : 'bg';
      } else {
        resolvedLanguage = 'bg';
      }
    } catch {
      resolvedLanguage = 'bg';
    }
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  const branchPart = branchId ? `branch=${branchId}` : '';
  const langPart = resolvedLanguage ? (branchPart ? `&lang=${resolvedLanguage}` : `lang=${resolvedLanguage}`) : '';
  const paramsPart = sortedParams ? `&${sortedParams}` : '';

  // Format: url?branch=X&lang=Y&params or url?lang=Y&params or url?params
  return `${url}?${branchPart}${langPart}${paramsPart}`;
}

/**
 * Get cached data if available and not expired
 * @param key - Cache key
 * @returns Cached data or null if expired/not found
 */
export function getCachedData<T = unknown>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const now = Date.now();
  const age = now - entry.timestamp;

  // Check if expired
  if (age > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set data in cache
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 */
export function setCachedData<T = unknown>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Clear cache entry or all cache
 * @param key - Cache key to clear, or null to clear all
 */
export function clearCache(key: string | null = null): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Clear cache for a specific branch
 * @param branchId - Branch ID
 */
export function clearBranchCache(branchId: string | number): void {
  const keysToDelete: string[] = [];

  for (const key of cache.keys()) {
    if (key.includes(`branch=${branchId}`)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => cache.delete(key));
}

/**
 * Get pending request promise for deduplication
 * @param key - Request key
 * @returns Pending promise or null
 */
export function getPendingRequest<T = unknown>(key: string): Promise<T> | null {
  return (pendingRequests.get(key) as Promise<T> | undefined) || null;
}

/**
 * Set pending request promise
 * @param key - Request key
 * @param promise - Promise to track
 */
export function setPendingRequest<T = unknown>(key: string, promise: Promise<T>): void {
  pendingRequests.set(key, promise);

  // Clean up after promise resolves/rejects
  promise.finally(() => {
    pendingRequests.delete(key);
  });
}

/**
 * Clear all pending requests
 */
export function clearPendingRequests(): void {
  pendingRequests.clear();
}

/**
 * Clear all cache entries and pending requests
 * Useful when language changes to ensure fresh data with new Accept-Language header
 */
export function clearAllCache(): void {
  cache.clear();
  pendingRequests.clear();
}

/**
 * Get cache statistics (for debugging)
 * @returns Cache stats
 */
export function getCacheStats(): { size: number; pendingRequests: number; keys: string[] } {
  return {
    size: cache.size,
    pendingRequests: pendingRequests.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Cache duration constants (in milliseconds)
 * Optimized for better performance - longer cache for static/semi-static data
 */
export const CACHE_DURATION = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 15 * 60 * 1000, // 15 minutes (categories don't change often)
  PRODUCT_DETAIL: 10 * 60 * 1000, // 10 minutes
  HIGHLIGHTS: 10 * 60 * 1000, // 10 minutes (highlights don't change often)
  WEBSITE_SLIDES: 15 * 60 * 1000, // 15 minutes (slides don't change often)
  BRANCHES: 10 * 60 * 1000, // 10 minutes (branches don't change often)
  LEGAL_CONTENT: 24 * 60 * 60 * 1000, // 24 hours (legal content rarely changes)
} as const;

export type CacheDurationKey = keyof typeof CACHE_DURATION;
