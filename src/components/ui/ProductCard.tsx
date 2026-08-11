"use client";
import { memo, useCallback, type MouseEvent } from "react";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { formatCurrency } from "../../lib/utils/formatters";
import { usePrefetchRoute } from "../../hooks/usePrefetchRoute";
import OptimizedImage from "./OptimizedImage";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";
import type { Product } from "@/types/shop";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

const ProductCard = memo(function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const { push } = useLocalizedRouter();
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();

  const productUrl = `/shop/${product.id}`;

  // Prefetch route on hover
  const handleMouseEnter = useCallback(() => {
    prefetchRoute(productUrl);
  }, [prefetchRoute, productUrl]);

  // Handle navigation
  const handleOrderClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      push(productUrl, { scroll: true });
    },
    [push, productUrl]
  );

  if (viewMode === "list") {
    return (
      <div
        className="relative flex flex-col sm:flex-row mt-0 items-start sm:items-center gap-6 sm:gap-8 p-5 sm:p-6 rounded-2xl bg-bgimg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        onMouseEnter={handleMouseEnter}
      >
        <div className="dishes-thumb relative shrink-0">
          <OptimizedImage
            src={product.image}
            alt={product.title}
            width={192}
            height={192}
            className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-full relative z-10"
            quality={85}
            loading="lazy"
            sizes="(max-width: 640px) 128px, 192px"
          />
          <div className="circle-shape absolute -top-[4.2px] w-[calc(100%+10px)] h-[calc(100%+10px)] left-1/2  transform  -translate-x-1/2 z-0">
            <Image
              src="/img/food-items/circleShape2.png"
              alt="shape"
              width={324}
              height={324}
              className="w-full h-full animate-spin-slow"
              unoptimized={true}
            />
          </div>
        </div>
        <div className="dishes-content flex-1 ">
          <Link href={productUrl} onMouseEnter={handleMouseEnter} onClick={handleOrderClick}>
            <h2 className="text-white  text-2xl font-bold mb-3 hover:text-theme transition-colors duration-300">
              {product.title}
            </h2>
          </Link>
          <div className="text text-text  text-base font-normal leading-relaxed mb-5">
            {product.longDescription ||
              "Neque porro est qui dolorem ipsum quia quaed inventor veritatis et quasi architecto beatae vitae dicta sunt explicabo. Aelltes port lacus quis enim var sed efficitur turpis gilla sed sit amet finibus eros. Lorem Ipsum is simply dummy text of the printing and typesetting industry.When an unknown printer took a galley of type"}
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-theme  text-lg font-bold">{formatCurrency(product.price)}</p>
            <Link
              href={productUrl}
              onMouseEnter={handleMouseEnter}
              onClick={handleOrderClick}
              className="theme-btn style6 inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-theme2 text-white  text-sm font-semibold uppercase rounded-full hover:bg-theme hover:text-white transition-all duration-300"
            >
              {t(lang, "order")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="dishes-card style2 p-6 sm:p-7 mt-38 rounded-2xl bg-bgimg shadow-lg hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-2 relative min-h-[200px] flex flex-col"
      onMouseEnter={handleMouseEnter}
    >
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex justify-center items-center shrink-0 w-full">
        {/* Circle Shape - Behind the food image */}
        <Image
          src="/img/food-items/circleShape2.png"
          alt="shape"
          width={324}
          height={324}
          className="w-51 h-51 -top-[46px] absolute z-0 animate-spin-slow"
          unoptimized={true}
        />

        {/* Food Image - On top */}
        <OptimizedImage
          src={product.image}
          alt={product.title}
          width={192}
          height={192}
          className="w-48 h-48 object-cover rounded-full -top-10 relative z-10"
          quality={85}
          loading="lazy"
          sizes="192px"
        />
      </div>
      <div className="item-content mt-20 flex flex-col grow justify-between">
        <div>
          <Link href={productUrl} onMouseEnter={handleMouseEnter} onClick={handleOrderClick}>
            <h2 className="text-white  text-lg sm:text-xl font-bold mb-2 hover:text-theme transition-colors duration-300 line-clamp-2">
              {product.title}
            </h2>
          </Link>
          <p className="text-text  text-sm sm:text-base mb-4 line-clamp-2">{product.description}</p>
        </div>
        <div className="mt-auto">
          <p className="text-theme  text-base sm:text-lg font-bold mb-4">{formatCurrency(product.price)}</p>
          <Link
            href={productUrl}
            onMouseEnter={handleMouseEnter}
            onClick={handleOrderClick}
            className="theme-btn style6 inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-theme2 text-white  text-sm font-semibold uppercase rounded-full hover:bg-theme hover:text-white transition-all duration-300 w-full"
          >
            {t(lang, "order")}
          </Link>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
