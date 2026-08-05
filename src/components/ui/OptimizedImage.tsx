"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import NextImage, { type ImageProps } from "next/image";
import { getBlurPlaceholder } from "../../lib/utils/imageUtils";
import { getProxiedImageUrl } from "../../lib/utils/imageProxy";
import { IMAGE_PATHS } from "../../data/constants";

interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt" | "onLoad" | "onError"> {
  /** Image source URL */
  src?: string | null;
  /** Image alt text */
  alt?: string;
  /** Optional blur placeholder (auto-generated if not provided) */
  blurDataURL?: string;
  className?: string;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Delay between retries in milliseconds (default: 2000) */
  retryDelay?: number;
}

/**
 * OptimizedImage Component
 * Enhanced Next.js Image with blur placeholder support, auto-retry, and fallback
 * Automatically retries loading failed images every 2 seconds (max 3 retries)
 */
export default function OptimizedImage({
  src,
  alt,
  blurDataURL,
  className = "",
  maxRetries = 3,
  retryDelay = 2000,
  ...rest
}: OptimizedImageProps) {
  const [blurPlaceholder, setBlurPlaceholder] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(() => Date.now()); // Lazy initialization
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fallback image path
  const fallbackSrc = IMAGE_PATHS.placeholder;

  // Generate blur placeholder synchronously on mount to avoid any async issues
  const initialBlurPlaceholder = useMemo(() => {
    if (blurDataURL) {
      return blurDataURL;
    }
    if (src && typeof window !== "undefined") {
      try {
        return getBlurPlaceholder(src);
      } catch (error) {
        console.warn("Failed to generate blur placeholder:", error);
        return null;
      }
    }
    return null;
  }, [src, blurDataURL]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Set the initial blur placeholder
    if (initialBlurPlaceholder) {
      setBlurPlaceholder(initialBlurPlaceholder);
    }
  }, [initialBlurPlaceholder]);

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(0);
      setImageKey(() => Date.now());
      // Clear any existing timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    }
  }, [src]);

  // Auto-retry mechanism: retry loading every 2 seconds if image failed to load
  useEffect(() => {
    // Only retry if we have an error and haven't exceeded max retries
    if (imageError && retryCount < maxRetries) {
      retryTimeoutRef.current = setTimeout(() => {
        // Force re-render by changing key
        setImageKey(() => Date.now());
        setImageError(false);
        setImageLoaded(false);
        setRetryCount((prev) => prev + 1);
      }, retryDelay);

      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }
  }, [imageError, retryCount, maxRetries, retryDelay]);

  // Timeout check: if image doesn't load within 5 seconds, trigger retry
  useEffect(() => {
    if (src && !imageLoaded && !imageError && retryCount === 0) {
      loadTimeoutRef.current = setTimeout(() => {
        // If still not loaded after 5 seconds, trigger error to start retry
        if (!imageLoaded) {
          setImageError(true);
        }
      }, 5000);

      return () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    }
  }, [src, imageLoaded, imageError, retryCount]);

  // Use proxy for API images automatically - must be called before any early returns
  const imageSrc = useMemo(() => {
    if (!src) return null;
    try {
      return getProxiedImageUrl(src);
    } catch (error) {
      console.warn("Error processing image URL:", error);
      return src; // Fallback to original src
    }
  }, [src]);

  // Safe source: use fallback if imageSrc is null/undefined
  const safeSrc = imageSrc || fallbackSrc;
  const showFallback = imageError && retryCount >= maxRetries;
  const hasNoSource = !src || !imageSrc;

  const isFill = rest.fill === true;

  // If using fill prop, the parent container should handle positioning
  // We still need a wrapper for absolute positioned elements (skeleton, retry indicator)
  if (isFill) {
    return (
      <div className="absolute inset-0">
        {/* Skeleton/Placeholder while loading or no source */}
        {(!imageLoaded || hasNoSource) && <div className={`absolute inset-0 bg-gray-800/50 animate-pulse z-0`} />}

        {/* Loading text if no source */}
        {hasNoSource && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        )}

        <NextImage
          key={`${showFallback ? fallbackSrc : safeSrc}-${imageKey}`} // Force re-render when URL or key changes (for retry)
          src={showFallback ? fallbackSrc : safeSrc}
          alt={alt || "Image"}
          blurDataURL={blurPlaceholder ?? undefined}
          fill
          className={`${className} ${!imageLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
            // Clear timeout if image loads successfully
            if (loadTimeoutRef.current) {
              clearTimeout(loadTimeoutRef.current);
            }
          }}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
            // Clear load timeout
            if (loadTimeoutRef.current) {
              clearTimeout(loadTimeoutRef.current);
            }
          }}
          onLoadingComplete={() => {
            setImageLoaded(true);
            setImageError(false);
            // Clear timeout if image loads successfully
            if (loadTimeoutRef.current) {
              clearTimeout(loadTimeoutRef.current);
            }
          }}
          placeholder={blurPlaceholder ? "blur" : "empty"}
          {...rest}
        />

        {/* Show retry indicator if retrying */}
        {imageError && retryCount < maxRetries && (
          <div className="absolute inset-0 bg-gray-800/30 flex items-center justify-center z-10">
            <span className="text-gray-400 text-xs">
              Retrying... ({retryCount + 1}/{maxRetries})
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Skeleton/Placeholder while loading or no source */}
      {(!imageLoaded || hasNoSource) && (
        <div
          className={`absolute inset-0 bg-gray-800/50 animate-pulse ${className}`}
          style={{
            minHeight: rest.height ? `${rest.height}px` : undefined,
            minWidth: rest.width ? `${rest.width}px` : undefined,
          }}
        />
      )}

      {/* Loading text if no source */}
      {hasNoSource && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      )}

      <NextImage
        key={`${showFallback ? fallbackSrc : safeSrc}-${imageKey}`} // Force re-render when URL or key changes (for retry)
        src={showFallback ? fallbackSrc : safeSrc}
        alt={alt || "Image"}
        blurDataURL={blurPlaceholder ?? undefined}
        className={`${className} ${!imageLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => {
          setImageLoaded(true);
          setImageError(false);
          // Clear timeout if image loads successfully
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
        }}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
          // Clear load timeout
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
        }}
        onLoadingComplete={() => {
          setImageLoaded(true);
          setImageError(false);
          // Clear timeout if image loads successfully
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
        }}
        placeholder={blurPlaceholder ? "blur" : "empty"}
        {...rest}
      />

      {/* Show retry indicator if retrying */}
      {imageError && retryCount < maxRetries && (
        <div className="absolute inset-0 bg-gray-800/30 flex items-center justify-center">
          <span className="text-gray-400 text-xs">
            Retrying... ({retryCount + 1}/{maxRetries})
          </span>
        </div>
      )}
    </div>
  );
}
