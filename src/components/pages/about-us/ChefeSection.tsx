"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import OptimizedImage from "../../ui/OptimizedImage";
import ProductCardSkeleton from "../../ui/ProductCardSkeleton";
import { useInView } from "react-intersection-observer";
import { getProxiedImageUrl } from "../../../lib/utils/imageProxy";
import api from "../../../api";
import useBranchStore from "../../../store/branchStore";
import type { Locale } from "../../../locales/i18n/config";

export interface Chef {
  id: string | number;
  name: string;
  bio?: string;
  image_url?: string;
  [key: string]: unknown;
}

interface ChefeSectionProps {
  chefs?: Chef[];
  lang?: Locale | null;
}

export default function ChefeSection({ chefs: serverChefs = [], lang: serverLang = null }: ChefeSectionProps) {
  const { lang: clientLang } = useLanguage();
  const { getSelectedBranchId } = useBranchStore();
  const [lang, setLang] = useState<Locale | string>(serverLang || clientLang || "bg");
  const [isHydrated, setIsHydrated] = useState(false);
  const [chefsData, setChefsData] = useState<Chef[]>(serverChefs);
  const prevLangRef = useRef(serverLang);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && clientLang) {
      setLang(clientLang);
    }
  }, [clientLang, isHydrated]);

  // Update chefsData when serverChefs changes (from server)
  useEffect(() => {
    if (serverChefs) {
      setChefsData(serverChefs);
    }
  }, [serverChefs]);

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
      const fetchChefs = async () => {
        const branchId = getSelectedBranchId();
        if (!branchId) {
          prevLangRef.current = clientLang;
          return;
        }

        try {
          const response = await api.branches.getChefs(branchId);
          if (response?.success && response.data) {
            setChefsData((response.data.chefs as Chef[]) || []);
          }
        } catch (error) {
          console.error("Error fetching chefs:", error);
        } finally {
          // Update prevLangRef after fetch completes
          prevLangRef.current = clientLang;
        }
      };

      fetchChefs();
    } else if (!prevLangRef.current) {
      // Initialize on first render
      prevLangRef.current = clientLang;
    }
  }, [isHydrated, clientLang, getSelectedBranchId]);

  // Get image URL with proxy support
  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return "/img/chefe/chefeThumb1_1.png";

    // If it's a local path, return as is
    if (imageUrl.startsWith("/") && !imageUrl.startsWith("/storage")) {
      return imageUrl;
    }

    // For API images, construct full URL then proxy it
    if (imageUrl.startsWith("/storage")) {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://shahrayar.peaklink.pro/api/v1";
      const cleanBaseURL = baseURL.replace(/\/api\/v1$/, "");
      const fullUrl = `${cleanBaseURL}${imageUrl}`;
      return getProxiedImageUrl(fullUrl) || "/img/chefe/chefeThumb1_1.png";
    }

    // For full URLs, use proxy
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return getProxiedImageUrl(imageUrl) || "/img/chefe/chefeThumb1_1.png";
    }

    // Fallback: try to proxy it anyway
    return getProxiedImageUrl(imageUrl) || "/img/chefe/chefeThumb1_1.png";
  };

  return (
    <section className="chef-section py-10 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      <div className="chef-wrapper style1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="title-area mb-12 sm:mb-14">
            <div className="sub-title text-center text-theme3 text-2xl font-bold uppercase mb-4 flex items-center justify-center gap-2">
              {t(lang, "our_chefe")}
            </div>
            <div className="title text-center text-white text-3xl sm:text-5xl font-black capitalize">
              {t(lang, "meet_our_expert_chefe")}
            </div>
          </div>

          {!chefsData || chefsData.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-text text-lg">{t(lang, "no_chefs_available") || "No chefs available"}</p>
            </div>
          ) : (
            <div className="chef-card-wrap style1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ">
              {chefsData.map((chef, index) => {
                return (
                  <LazyChefCard
                    key={chef.id}
                    chef={chef}
                    index={index}
                    getImageUrl={getImageUrl}
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

// Lazy Chef Card Component - Loads only when in viewport
interface LazyChefCardProps {
  chef: Chef;
  index: number;
  getImageUrl: (imageUrl?: string) => string;
}

function LazyChefCard({ chef, index, getImageUrl }: LazyChefCardProps) {
  const shouldLoadImmediately = index < 3;
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
    triggerOnce: true,
  });

  const shouldLoad = shouldLoadImmediately || inView;

  if (!shouldLoad) {
    return (
      <div ref={ref} className="chef-card style2 p-6 sm:p-7 mt-38 rounded-2xl bg-bgimg min-h-[280px]">
        <ProductCardSkeleton viewMode="grid" count={1} />
      </div>
    );
  }

  return (
    <div
      className="chef-card style2 p-6 sm:p-7 mt-38 rounded-2xl bg-bgimg shadow-lg hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-2 relative min-h-[10px] flex flex-col"
    >
      {/* Chef Image */}
      <div
        className="absolute -top-38 left-1/2 -translate-x-1/2 flex justify-center items-center gap-10 shrink-0 w-full"
      >

        <OptimizedImage
          src={getImageUrl(chef.image_url)}
          alt={chef.name}
          width={192}
          height={192}
          className="w-70 h-70 object-cover  -top-10 relative z-10"
          quality={75}
          loading="lazy"
          sizes="192px"
        />
      </div>

      {/* Content */}
      <div className="item-content mt-20 flex flex-col grow justify-between">
        <div>
          <h2 className="text-white text-lg sm:text-xl font-bold mb-2 hover:text-theme transition-colors duration-300 line-clamp-2">
            {chef.name}
          </h2>
          {chef.bio && (
            <p className="text-text text-sm sm:text-base mb-4 line-clamp-2">
              {chef.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
