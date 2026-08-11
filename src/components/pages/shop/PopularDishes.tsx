"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import OptimizedImage from "../../ui/OptimizedImage";
import ProductCardSkeleton from "../../ui/ProductCardSkeleton";
import SectionHeading from "../../ui/SectionHeading";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useInView } from "react-intersection-observer";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { transformMenuItemsToProducts } from "../../../lib/utils/productTransform";
import type { Product } from "@/types/shop";
import type { Locale } from "@/locales/i18n/config";

interface PopularDishesProps {
  rawPopularData?: unknown[] | null;
  lang?: Locale | null;
  /** Set only when this section is part of the home page's chapter sequence. */
  chapter?: number;
}

export default function PopularDishes({ rawPopularData = null, lang: serverLang = null, chapter }: PopularDishesProps) {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang: clientLang } = useLanguage();

  // Content is static and localized by the transform below. Switching language
  // navigates to a different locale route, which re-renders this with new
  // props — so there's nothing to refetch and no hydration dance to manage.
  const lang = serverLang || clientLang;

  // Transform popular dishes based on current language
  const dishes: Product[] = useMemo(() => {
    if (!Array.isArray(rawPopularData)) return [];
    return transformMenuItemsToProducts(rawPopularData as never, lang);
  }, [rawPopularData, lang]);

  return (
    <section className="popular-dishes-section py-10 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      <div className="popular-dishes-wrapper style1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <SectionHeading chapter={chapter} eyebrow={t(lang, "popular_dishes")} title={t(lang, "best_selling_dishes")} className="mb-12 sm:mb-14" />

          {!dishes || dishes.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-text text-lg">{t(lang, "no_popular_dishes_available")}</p>
            </div>
          ) : (
            <div className="dishes-card-wrap style1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {dishes.map((dish, index) => {
                return (
                  <LazyPopularCard
                    key={dish.id}
                    dish={dish}
                    index={index}
                    prefetchRoute={prefetchRoute}
                    lang={lang}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface LazyPopularCardProps {
  dish: Product;
  index: number;
  prefetchRoute: (path: string) => void;
  lang: string;
}

// Lazy Popular Card Component - Loads only when in viewport
function LazyPopularCard({ dish, index, prefetchRoute, lang }: LazyPopularCardProps) {
  const shouldLoadImmediately = index < 3; // Load first 3 immediately
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
    triggerOnce: true,
  });

  const shouldLoad = shouldLoadImmediately || inView;

  if (!shouldLoad) {
    return (
      <div ref={ref} className="dishes-card style2 p-6 sm:p-7 mt-38 rounded-2xl bg-bgimg min-h-[200px]">
        <ProductCardSkeleton viewMode="grid" count={1} />
      </div>
    );
  }

  return (
    <div
      className="dishes-card style2 p-6 sm:p-7 mt-38 rounded-2xl bg-bgimg shadow-lg hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-2 relative min-h-[200px] flex flex-col"
    >
      {/* Product Image */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 flex justify-center items-center shrink-0 w-full"
        onMouseEnter={() => prefetchRoute(`/shop/${dish.id}`)}
      >
        <Image
          src="/img/food-items/circleShape2.png"
          alt="shape"
          width={324}
          height={324}
          className="w-51 h-51 -top-[46px] absolute z-0 animate-spin-slow"
          unoptimized={true}
        />
        <OptimizedImage
          src={dish.image}
          alt={dish.title}
          width={192}
          height={192}
          className="w-48 h-48 object-cover rounded-full -top-10 relative z-10"
          quality={85}
          loading="lazy"
          sizes="192px"
        />
      </div>

      {/* Content */}
      <div className="item-content mt-20 flex flex-col grow justify-between">
        <div>
          <Link
            href={`/shop/${dish.id}`}
            onMouseEnter={() => prefetchRoute(`/shop/${dish.id}`)}
          >
            <h2 className="text-white  text-lg sm:text-xl font-bold mb-2 hover:text-theme transition-colors duration-300 line-clamp-2">
              {dish.title}
            </h2>
          </Link>
          <p className="text-text  text-sm sm:text-base mb-4 line-clamp-2">
            {dish.description}
          </p>
        </div>
        <div className="mt-auto">
          <p className="text-theme  text-base sm:text-lg font-bold mb-4">
            {formatCurrency(dish.price)}
          </p>
          <Link
            href={`/shop/${dish.id}`}
            onMouseEnter={() => prefetchRoute(`/shop/${dish.id}`)}
            className="theme-btn style6 inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-theme2 text-white  text-sm font-semibold uppercase rounded-full hover:bg-theme hover:text-white transition-all duration-300 w-full"
          >
            {t(lang, "order")}
          </Link>
        </div>
      </div>
    </div>
  );
}
