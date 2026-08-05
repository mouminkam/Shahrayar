"use client";
import { useEffect, useState } from "react";

interface ProductCardSkeletonProps {
  /** "grid" or "list" */
  viewMode?: "grid" | "list";
  /** Number of skeleton cards to display (default: 1) */
  count?: number;
}

/**
 * ProductCardSkeleton Component
 * Displays a skeleton loader for product cards
 * Supports both grid and list view modes
 */
export default function ProductCardSkeleton({ viewMode = "grid", count = 1 }: ProductCardSkeletonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div key={index}>
      {viewMode === "list" ? (
        // List View Skeleton
        <div className="relative flex flex-col sm:flex-row mt-0 items-start sm:items-center gap-6 sm:gap-8 p-5 sm:p-6 rounded-2xl bg-bgimg shadow-lg animate-pulse">
          {/* Image Skeleton */}
          <div className="dishes-thumb relative shrink-0">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gray-700/50 relative z-10"></div>
            <div className="absolute -top-[4.2px] w-[calc(100%+10px)] h-[calc(100%+10px)] left-1/2 transform -translate-x-1/2 z-0">
              <div className="w-full h-full rounded-full bg-gray-800/30 animate-spin-slow"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="dishes-content flex-1 space-y-4">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 rounded-full bg-gray-700/50"></div>
            </div>
            <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-gray-700/50"></div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700/50 rounded w-full"></div>
              <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700/50 rounded w-4/6"></div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="h-6 bg-gray-700/50 rounded w-20"></div>
              <div className="flex gap-2">
                <div className="h-12 bg-gray-700/50 rounded-full w-24"></div>
                <div className="w-12 h-12 rounded-full bg-gray-700/50"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Grid View Skeleton
        <div className="dishes-card style2 p-6 sm:p-7 mt-38 rounded-2xl bg-bgimg shadow-lg animate-pulse relative min-h-[200px] flex flex-col">
          {/* Heart Button Skeleton */}
          <div className="absolute top-4 right-4 z-20">
            <div className="w-8 h-8 rounded-full bg-gray-700/50"></div>
          </div>

          {/* Image Skeleton */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex justify-center items-center shrink-0 w-full">
            <div className="w-51 h-51 -top-[46px] absolute z-0 rounded-full bg-gray-800/30 animate-spin-slow"></div>
            <div className="w-48 h-48 rounded-full bg-gray-700/50 -top-10 relative z-10"></div>
          </div>

          {/* Content Skeleton */}
          <div className="item-content mt-20 flex flex-col grow justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-5 bg-gray-700/50 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-700/50 rounded w-full"></div>
              <div className="h-4 bg-gray-700/50 rounded w-5/6 mx-auto"></div>
            </div>
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded bg-gray-700/50"></div>
                ))}
              </div>
              <div className="h-6 bg-gray-700/50 rounded w-24 mx-auto"></div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-12 bg-gray-700/50 rounded-full flex-1"></div>
                <div className="w-12 h-12 rounded-full bg-gray-700/50"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ));

  return <>{skeletons}</>;
}
