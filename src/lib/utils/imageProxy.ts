/**
 * Image Proxy Utility
 *
 * Converts image URLs from API to proxy URLs to solve CORS issues.
 *
 * Usage:
 * import { getProxiedImageUrl } from '@/lib/utils/imageProxy';
 * const proxiedUrl = getProxiedImageUrl(imageUrl);
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shahrayar.peaklink.pro/api/v1';
const API_DOMAIN = API_BASE_URL.replace('/api/v1', '');

/**
 * Checks if an image URL is from the API domain
 * @param imageUrl - Image URL to check
 * @returns True if URL is from API domain
 */
export function isApiImageUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }

  // Check if URL contains the API domain
  return imageUrl.includes(API_DOMAIN) || imageUrl.includes('peaklink.pro');
}

/**
 * Extracts the path from a full API image URL
 * @param imageUrl - Full image URL
 * @returns Path segment (e.g., "storage/website-slides/image.png") or null
 */
function extractImagePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  try {
    // If it's a full URL, extract the path
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const url = new URL(imageUrl);
      // Remove leading slash from pathname
      return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
    }

    // If it's already a relative path, return as is (remove leading slash if present)
    if (imageUrl.startsWith('/storage/') || imageUrl.startsWith('storage/')) {
      return imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    }

    // If it's a relative path without /storage/, add it
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      return `storage/${imageUrl}`;
    }

    // If it starts with /, remove it
    return imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  } catch (error) {
    console.warn('Failed to extract image path:', error);
    return null;
  }
}

/**
 * Converts an API image URL to a proxy URL
 * @param imageUrl - Original image URL from API
 * @returns Proxy URL or original URL if not from API
 *
 * @example
 * // Full URL from API
 * getProxiedImageUrl('https://shahrayar.peaklink.pro/storage/website-slides/image.png')
 * // Returns: '/api/images/storage/website-slides/image.png'
 *
 * @example
 * // Relative path
 * getProxiedImageUrl('/storage/website-slides/image.png')
 * // Returns: '/api/images/storage/website-slides/image.png'
 *
 * @example
 * // Non-API URL (returns as is)
 * getProxiedImageUrl('https://example.com/image.png')
 * // Returns: 'https://example.com/image.png'
 */
export function getProxiedImageUrl(imageUrl: string | null | undefined): string | null {
  // Return null/empty if no URL provided
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl ?? null;
  }

  // If it's a data URL, return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it's a local path (starts with / and not from API), return as is
  if (imageUrl.startsWith('/') && !isApiImageUrl(imageUrl)) {
    return imageUrl;
  }

  // If it's not from the API domain, return original URL
  if (!isApiImageUrl(imageUrl)) {
    return imageUrl;
  }

  // Extract the path from the URL
  const imagePath = extractImagePath(imageUrl);

  if (!imagePath) {
    // If we can't extract path, return original URL
    console.warn('Could not extract path from image URL:', imageUrl);
    return imageUrl;
  }

  // Construct proxy URL
  // Remove /storage/ prefix if present (we'll add it in the path)
  const cleanPath = imagePath.startsWith('storage/') ? imagePath : `storage/${imagePath}`;

  // Preserve query parameters if any
  try {
    const url = new URL(imageUrl);
    const queryString = url.search;
    return `/api/images/${cleanPath}${queryString}`;
  } catch {
    // If URL parsing fails, assume no query params
    return `/api/images/${cleanPath}`;
  }
}

/**
 * Batch convert multiple image URLs to proxy URLs
 * @param imageUrls - Array of image URLs
 * @returns Array of proxy URLs
 */
export function getProxiedImageUrls(imageUrls: (string | null | undefined)[]): (string | null)[] {
  if (!Array.isArray(imageUrls)) {
    return [];
  }

  return imageUrls.map((url) => getProxiedImageUrl(url));
}

/**
 * Converts an object with image URLs to use proxy URLs
 * Useful for transforming API responses
 * @param obj - Object that may contain image URLs
 * @param imageKeys - Keys in the object that contain image URLs
 * @returns Object with proxied image URLs
 */
export function proxyObjectImages<T extends Record<string, unknown>>(
  obj: T | null | undefined,
  imageKeys: string[] = ['image', 'image_url', 'desktop_image', 'mobile_image', 'thumbnail']
): T | null | undefined {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const proxied: Record<string, unknown> = { ...obj };

  imageKeys.forEach((key) => {
    const value = proxied[key];
    if (value && typeof value === 'string') {
      proxied[key] = getProxiedImageUrl(value);
    }
  });

  return proxied as T;
}
