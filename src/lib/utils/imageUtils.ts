/**
 * Image utility functions for blur placeholders and optimization
 *
 * Note: We avoid using 'Image' constructor directly to prevent conflicts
 * with Next.js Image component. Use document.createElement('img') instead.
 *
 * IMPORTANT: This file must NOT import or reference 'Image' from next/image
 * to avoid naming conflicts with the DOM Image constructor.
 */

import { getProxiedImageUrl } from './imageProxy';

/**
 * Creates a blur placeholder data URL from an image URL
 * This generates a tiny base64 image that can be used as a placeholder
 *
 * @param imageUrl - The original image URL
 * @param width - Placeholder width (default: 10)
 * @param height - Placeholder height (default: 10)
 * @returns Base64 data URL or fallback SVG
 */
export async function generateBlurDataURL(
  imageUrl: string | null | undefined,
  width: number = 10,
  height: number = 10
): Promise<string> {
  // If no image URL, return a simple gray placeholder
  if (!imageUrl || imageUrl.startsWith('data:')) {
    return generateSVGPlaceholder(width, height);
  }

  try {
    // For remote images, we'll use a simple approach
    // In production, you might want to use a service like Cloudinary or ImageKit
    // that provides blur placeholders automatically

    // For now, we'll generate a simple colored placeholder based on the image URL

    // Generate a consistent color based on the image URL hash
    const hash = imageUrl.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = Math.abs(hash) % 360;
    const saturation = 20 + (Math.abs(hash) % 30); // 20-50%
    const lightness = 15 + (Math.abs(hash) % 20); // 15-35% (dark theme)

    return generateSVGPlaceholder(width, height, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
  } catch (error) {
    console.warn('Failed to generate blur placeholder:', error);
    return generateSVGPlaceholder(width, height);
  }
}

/**
 * Generates a simple SVG placeholder
 *
 * @param width - SVG width
 * @param height - SVG height
 * @param color - Background color (default: gray)
 * @returns SVG data URL
 */
export function generateSVGPlaceholder(width: number = 10, height: number = 10, color: string = '#1a1a1a'): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `.trim();

  // Use encodeURIComponent for better compatibility
  if (typeof window !== 'undefined' && typeof btoa !== 'undefined') {
    try {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch {
      // Fallback to URI encoding if btoa fails
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
  }

  // Fallback for server-side
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Creates a blur placeholder for Next.js Image component
 * This is a synchronous version that returns immediately
 *
 * @param imageUrl - The original image URL
 * @returns Blur data URL
 */
export function getBlurPlaceholder(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return generateSVGPlaceholder(10, 10);
  }

  // For local images, try to use a simple approach
  if (imageUrl.startsWith('/')) {
    // Generate a subtle colored placeholder
    const hash = imageUrl.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = Math.abs(hash) % 360;
    const saturation = 20 + (Math.abs(hash) % 30);
    const lightness = 15 + (Math.abs(hash) % 20);

    return generateSVGPlaceholder(10, 10, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  // For remote images, use a neutral dark placeholder
  return generateSVGPlaceholder(10, 10, '#1a1a1a');
}

/**
 * Preloads an image in the background
 *
 * @param imageUrl - Image URL to preload
 */
export function preloadImage(imageUrl: string | null | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!imageUrl || typeof window === 'undefined' || typeof document === 'undefined') {
      resolve();
      return;
    }

    try {
      // Use document.createElement to avoid conflict with Next.js Image component
      // NEVER use 'new Image()' or 'window.Image()' here as it conflicts with Next.js Image
      const img = document.createElement('img');
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    } catch (error) {
      // Silently fail - preloading is not critical
      console.warn('Failed to preload image:', error);
      resolve();
    }
  });
}

/**
 * Checks if an image is loaded
 *
 * @param imageUrl - Image URL to check
 */
export async function isImageLoaded(imageUrl: string | null | undefined): Promise<boolean> {
  if (!imageUrl || typeof window === 'undefined') {
    return false;
  }

  try {
    await preloadImage(imageUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts a relative image path from API to a full URL
 * Handles both relative paths (e.g., "avatars/...") and full URLs
 * Automatically uses proxy for API images to solve CORS issues
 *
 * @param imagePath - Image path from API (can be relative, full URL, or data URL)
 * @returns Full URL for Next.js Image component (proxied if from API), or null if no path
 */
export function getFullImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) {
    return null;
  }

  // If data URL (from FileReader), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // If already a full URL, use proxy if it's from API domain
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return getProxiedImageUrl(imagePath);
  }

  // If starts with /storage/, construct full URL then proxy it
  if (imagePath.startsWith('/storage/')) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shahrayar.peaklink.pro/api/v1';
    const storageBaseUrl = API_BASE_URL.replace('/api/v1', '');
    const fullUrl = `${storageBaseUrl}${imagePath}`;
    return getProxiedImageUrl(fullUrl);
  }

  // If relative path (e.g., "avatars/..."), construct full URL then proxy it
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shahrayar.peaklink.pro/api/v1';
  const storageBaseUrl = API_BASE_URL.replace('/api/v1', '');
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullUrl = `${storageBaseUrl}/storage/${cleanPath}`;
  return getProxiedImageUrl(fullUrl);
}
