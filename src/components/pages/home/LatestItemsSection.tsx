"use client";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { formatCurrency } from "../../../lib/utils/formatters";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import OptimizedImage from "../../ui/OptimizedImage";
import ProductCardSkeleton from "../../ui/ProductCardSkeleton";
import { useInView } from "react-intersection-observer";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { useState, useEffect, useMemo, useRef } from "react";
import { transformMenuItemsToProducts } from "../../../lib/utils/productTransform";
import api from "../../../api";
import useBranchStore from "../../../store/branchStore";
import type { Locale } from "@/locales/i18n/config";
import type { Product } from "@/types/shop";

interface LatestItemsSectionProps {
  rawLatestData?: unknown[] | null;
  lang?: Locale | null;
}

export default function LatestItemsSection({ rawLatestData = null, lang: serverLang = null }: LatestItemsSectionProps) {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang: clientLang } = useLanguage();
  const { getSelectedBranchId } = useBranchStore();
  const [lang, setLang] = useState<string>(serverLang || clientLang || "bg");
  const [isHydrated, setIsHydrated] = useState(false);
  const [latestData, setLatestData] = useState<unknown[] | null>(rawLatestData);
  const prevLangRef = useRef(serverLang);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && clientLang) {
      setLang(clientLang);
    }
  }, [clientLang, isHydrated]);

  // Update latestData when rawLatestData changes (from server)
  useEffect(() => {
    if (rawLatestData) {
      setLatestData(rawLatestData);
    }
  }, [rawLatestData]);

  // Re-fetch data when language changes after hydration
  useEffect(() => {
    if (!isHydrated || !clientLang) {
      // Initialize prevLangRef on first render
      if (clientLang) {
        prevLangRef.current = clientLang;
      }
      return;
    }

    // Only re-fetch if language actually changed (not initial render)
    if (prevLangRef.current && prevLangRef.current !== clientLang) {
      const fetchLatestItems = async () => {
        const branchId = getSelectedBranchId();
        if (!branchId) {
          prevLangRef.current = clientLang;
          return;
        }

        try {
          const response = await api.menu.getHighlights({ branch_id: branchId });
          if (response?.success && response.data) {
            setLatestData((response.data.latest as any[]) || []);
          }
        } catch (error) {
          console.error("Error fetching latest items:", error);
        } finally {
          // Update prevLangRef after fetch completes
          prevLangRef.current = clientLang;
        }
      };

      fetchLatestItems();
    } else if (!prevLangRef.current) {
      // Initialize on first render
      prevLangRef.current = clientLang;
    }
  }, [isHydrated, clientLang, getSelectedBranchId]);

  // Transform latest items based on current language
  const latest: Product[] = useMemo(() => {
    if (!latestData || !Array.isArray(latestData)) return [];
    return transformMenuItemsToProducts(latestData as any, lang);
  }, [latestData, lang]);

  // Always render something to maintain hook order consistency
  // Return empty section instead of null to avoid hooks order issues
  if (!latest || latest.length === 0) {
    return (
      <section className="latest-items-section py-10 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="latest-items-wrapper style1">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            {/* Empty state - maintains component structure */}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="latest-items-section py-10 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      <div className="latest-items-wrapper style1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="title-area mb-12 sm:mb-14">
            <div className="sub-title text-center text-theme3 text-2xl font-bold uppercase mb-4 flex items-center justify-center gap-2">
              {t(lang, "latest_items")}
            </div>
            <div className="title text-center text-white text-3xl sm:text-5xl font-black capitalize">
              {t(lang, "new_arrivals")}
            </div>
          </div>

          <div className="latest-items-card-wrap style1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {latest.map((dish, index) => {
              return <LazyCard key={dish.id} dish={dish} index={index} prefetchRoute={prefetchRoute} lang={lang} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

interface LazyCardProps {
  dish: Product;
  index: number;
  prefetchRoute: (href: string) => void;
  lang: string;
}

// Lazy Card Component - Loads only when in viewport
function LazyCard({ dish, index, prefetchRoute, lang }: LazyCardProps) {
  // Always call hooks unconditionally to maintain hook order
  const shouldLoadImmediately = index < 3; // Load first 3 immediately
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
    triggerOnce: true,
    skip: false, // Always enable the hook
  });

  const shouldLoad = shouldLoadImmediately || inView;

  // Always render the same wrapper structure to maintain consistency
  return (
    <div ref={ref} className="latest-items-card style2 p-6 sm:p-7 mt-38 rounded-2xl bg-bgimg min-h-[280px]">
      {shouldLoad ? (
        <div className="shadow-lg hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-2 relative flex flex-col h-full">
          {/* Product Image */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 flex justify-center items-center shrink-0 w-full"
            onMouseEnter={() => prefetchRoute(`/shop/${dish.id}`)}
          >
            <Image
              src="/img/food-items/circleShape.png"
              alt="shape"
              width={150}
              height={150}
              className="w-51 h-51 -top-[46px] absolute z-0 animate-spin-slow"
              unoptimized={true}
            />
            <OptimizedImage
              src={dish.image}
              alt={dish.title}
              width={192}
              height={192}
              className="w-48 h-48 object-cover rounded-full -top-10 relative z-10"
              quality={75}
              loading="lazy"
              sizes="192px"
            />
          </div>

          {/* Content */}
          <div className="item-content mt-20 flex flex-col grow justify-between">
            <div>
              <Link href={`/shop/${dish.id}`} onMouseEnter={() => prefetchRoute(`/shop/${dish.id}`)}>
                <h2 className="text-white text-lg sm:text-xl font-bold mb-2 hover:text-theme transition-colors duration-300 line-clamp-2">
                  {dish.title}
                </h2>
              </Link>
              <p className="text-text text-sm sm:text-base mb-4 line-clamp-2">
                {dish.description || t(lang, "delicious_food_item")}
              </p>
            </div>
            <div className="mt-auto">
              <p className="text-theme text-base sm:text-lg font-bold mb-4">{formatCurrency(dish.price)}</p>
              <Link
                href={`/shop/${dish.id}`}
                onMouseEnter={() => prefetchRoute(`/shop/${dish.id}`)}
                className="theme-btn style6 inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-theme2 text-white text-sm font-semibold uppercase rounded-full hover:bg-theme hover:text-white transition-all duration-300 w-full"
              >
                {t(lang, "order")}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ProductCardSkeleton viewMode="grid" count={1} />
      )}
    </div>
  );
}
