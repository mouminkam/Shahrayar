"use client";
import { useMemo } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import OptimizedImage from "../../ui/OptimizedImage";
import ProductCardSkeleton from "../../ui/ProductCardSkeleton";
import { useInView } from "react-intersection-observer";
import { getProxiedImageUrl } from "../../../lib/utils/imageProxy";
import { getLocalizedField } from "../../../lib/utils/productTransform";
import SectionHeading from "../../ui/SectionHeading";
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
  /** Set only when this section is part of the home page's chapter sequence. */
  chapter?: number;
}

export default function ChefeSection({ chefs: serverChefs = [], lang: serverLang = null, chapter }: ChefeSectionProps) {
  const { lang: clientLang } = useLanguage();

  // Content is static and localized by the transform below. Switching language
  // navigates to a different locale route, which re-renders this with new
  // props — so there's nothing to refetch and no hydration dance to manage.
  const lang = serverLang || clientLang;

  const chefsData: Chef[] = useMemo(() => {
    if (!Array.isArray(serverChefs)) return [];
    return serverChefs.map((chef) => ({
      ...chef,
      bio: getLocalizedField(chef as Record<string, unknown>, "bio", lang) || chef.bio,
    }));
  }, [serverChefs, lang]);

  // Resolve a chef portrait to something <Image> can render.
  // PRODUCTION: a "/storage/..." path meant the portrait lived on the API host,
  // so it was expanded with NEXT_PUBLIC_API_BASE_URL's origin and routed through
  // the CORS image proxy. The mock chefs all point at /public/img/chefe/*.
  const getImageUrl = (imageUrl?: string): string =>
    getProxiedImageUrl(imageUrl) || "/img/chefe/chefeThumb1_1.png";

  return (
    <section className="chef-section py-10 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
      <div className="chef-wrapper style1">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <SectionHeading
            chapter={chapter}
            eyebrow={t(lang, "our_chefe")}
            title={t(lang, "meet_our_expert_chefe")}
            className="mb-12 sm:mb-14"
          />

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

        {/* The card renders this at w-70 (280px). It used to declare width 192
            and sizes="192px", so next/image served a 192px file that the
            browser stretched to 280 — a 1.5x upscale before device pixel ratio
            even entered the picture, which is what made the portraits look
            soft. The numbers below match the actual box and the intrinsic size
            of the source files in /public/img/chefe (310x305). */}
        <OptimizedImage
          src={getImageUrl(chef.image_url)}
          alt={chef.name}
          width={310}
          height={305}
          className="w-70 h-70 object-cover  -top-10 relative z-10"
          quality={90}
          loading="lazy"
          sizes="280px"
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
