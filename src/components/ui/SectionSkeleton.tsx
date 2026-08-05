"use client";
import { useEffect, useState } from "react";

type SkeletonVariant = "default" | "grid" | "slider" | "gallery" | "testimonial";

interface SectionSkeletonProps {
  variant?: SkeletonVariant;
  height?: string;
  showTitle?: boolean;
  showCards?: boolean;
  cardCount?: number;
}

export default function SectionSkeleton({
  variant = "default",
  height = "h-64",
  showTitle = true,
  showCards = true,
  cardCount = 3,
}: SectionSkeletonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Skeleton variants
  const variants: Record<SkeletonVariant, React.ReactNode> = {
    default: (
      <div className={`animate-pulse ${height} bg-bgimg rounded-2xl`}>
        {showTitle && (
          <div className="mb-6">
            <div className="h-6 bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto"></div>
          </div>
        )}
        {showCards && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-4">
                <div className="h-40 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    grid: (
      <div className={`animate-pulse ${height}`}>
        {showTitle && (
          <div className="mb-8 text-center">
            <div className="h-6 bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-10 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="bg-bgimg rounded-2xl p-6 min-h-[250px]">
              <div className="h-32 w-32 bg-gray-700 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    ),
    slider: (
      <div className={`animate-pulse ${height}`}>
        {showTitle && (
          <div className="mb-8 text-center">
            <div className="h-6 bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-10 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        )}
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="min-w-[300px] bg-bgimg rounded-2xl p-4">
              <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    ),
    gallery: (
      <div className={`animate-pulse ${height}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-700 rounded-2xl"></div>
          ))}
        </div>
      </div>
    ),
    testimonial: (
      <div className={`animate-pulse ${height}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="h-64 bg-gray-700 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 bg-gray-700 rounded w-2/3"></div>
            <div className="h-32 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">{variants[variant] || variants.default}</div>
    </div>
  );
}
