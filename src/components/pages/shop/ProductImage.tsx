"use client";
import OptimizedImage from "../../ui/OptimizedImage";
import { IMAGE_PATHS } from "../../../data/constants";
import type { Product } from "@/types/shop";

interface ProductImageProps {
  product: Product | null;
}

export default function ProductImage({ product }: ProductImageProps) {
  const imageUrl = product?.image || IMAGE_PATHS.placeholder;

  return (
    <div className="flex items-center justify-center p-2 sm:p-4 lg:p-8">
      <div className="relative w-full max-w-full sm:max-w-md">
        <OptimizedImage
          src={imageUrl}
          alt={product?.title || "Product"}
          width={500}
          height={500}
          className="w-full h-48 sm:h-64 md:h-80 aspect-square object-cover rounded-lg"
          quality={90}
          loading="eager"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 500px"
        />
      </div>
    </div>
  );
}
