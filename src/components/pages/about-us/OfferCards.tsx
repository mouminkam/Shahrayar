"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import OptimizedImage from "../../ui/OptimizedImage";
import LocalizedLink from "../../ui/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { getProxiedImageUrl } from "../../../lib/utils/imageProxy";
import api from "../../../api";
import useBranchStore from "../../../store/branchStore";
import type { Locale } from "../../../locales/i18n/config";

interface Slide {
  title?: string;
  description?: string;
  desktop_image?: string;
  menu_item_id?: string | number;
  [key: string]: unknown;
}

interface Offer {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  bgImage: string;
  link: string;
}

interface OfferCardsProps {
  slides?: Slide[];
  lang?: Locale | null;
}

export default function OfferCards({ slides: apiSlides = [], lang: serverLang = null }: OfferCardsProps) {
  const { lang: clientLang } = useLanguage();
  const { getSelectedBranchId } = useBranchStore();
  const [lang, setLang] = useState<Locale | string>(serverLang || clientLang || "bg");
  const [isHydrated, setIsHydrated] = useState(false);
  const [slidesData, setSlidesData] = useState<Slide[]>(apiSlides);
  const prevLangRef = useRef(serverLang);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && clientLang) {
      setLang(clientLang);
    }
  }, [clientLang, isHydrated]);

  // Update slidesData when apiSlides changes (from server)
  useEffect(() => {
    if (apiSlides) {
      setSlidesData(apiSlides);
    }
  }, [apiSlides]);

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
      const fetchSlides = async () => {
        const branchId = getSelectedBranchId();
        if (!branchId) {
          prevLangRef.current = clientLang;
          return;
        }

        try {
          const response = await api.slides.getWebsiteSlides({ branch_id: branchId });
          if (response?.success && response.data) {
            setSlidesData((response.data.slides as any[]) || []);
          }
        } catch (error) {
          console.error("Error fetching website slides:", error);
        } finally {
          // Update prevLangRef after fetch completes
          prevLangRef.current = clientLang;
        }
      };

      fetchSlides();
    } else if (!prevLangRef.current) {
      // Initialize on first render
      prevLangRef.current = clientLang;
    }
  }, [isHydrated, clientLang, getSelectedBranchId]);

  // Take first 3 slides and map to offer format
  const offers: Offer[] = useMemo(() => {
    if (!slidesData || slidesData.length === 0) {
      // Fallback offers if no data
      return [
        {
          title: "SPICY FRIED CHICKEN",
          subtitle: t(lang, "on_this_week"),
          description: t(lang, "limited_time_offer"),
          image: "/img/offer/offerThumb1_1.png",
          bgImage: "/img/bg/offerBG1_1.jpg",
          link: "/shop",
        },
        {
          title: "TODAY SPACIAL FOOD",
          subtitle: t(lang, "welcome_fresheat"),
          description: t(lang, "limited_time_offer"),
          image: "/img/offer/offerThumb1_2.png",
          bgImage: "/img/bg/offerBG1_1.jpg",
          link: "/shop",
        },
        {
          title: "SPECIAL CHICKEN ROLL",
          subtitle: t(lang, "on_this_week"),
          description: t(lang, "limited_time_offer"),
          image: "/img/offer/offerThumb1_3.png",
          bgImage: "/img/bg/offerBG1_1.jpg",
          link: "/shop",
        },
      ];
    }

    // Take first 3 slides only
    return slidesData.slice(0, 3).map((slide) => ({
      title: slide.title || "",
      subtitle: t(lang, "on_this_week"),
      description: slide.description || t(lang, "limited_time_offer"),
      image: getProxiedImageUrl(slide.desktop_image || "/img/offer/offerThumb1_1.png") || "/img/offer/offerThumb1_1.png",
      bgImage: "/img/bg/offerBG1_1.jpg",
      link: slide.menu_item_id ? `/shop/${slide.menu_item_id}` : "/shop",
    }));
  }, [slidesData, lang]);

  // Show error state or fallback
  if (offers.length === 0) {
    return (
      <section className="py-12 mb-12 sm:mb-0 sm:py-16 bg-bg3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-text">Failed to load offer cards</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 mb-12 sm:mb-0 sm:py-16 bg-bg3 ">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {offers.length > 0 && offers.map((offer, index) => (
            <motion.div
              key={index}
              className="relative rounded-3xl overflow-hidden min-h-[300px] flex items-center p-8 sm:p-10 border-2 border-bgimg hover:translate-y-2 transition-all duration-300 bg-cover bg-center"
              style={{
                backgroundImage: `url(${offer.bgImage})`,
              }}
              variants={{
                hidden: { y: -50, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.6,
                    ease: "easeOut"
                  }
                },
                exit: {
                  y: -30,
                  opacity: 0,
                  transition: {
                    duration: 0.4,
                    ease: "easeIn"
                  }
                }
              }}
            >
              {/* Content */}
              <div className="relative z-10 w-1/2">
                <p className="text-theme text-sm font-extrabold uppercase mb-2">
                  {offer.subtitle}
                </p>
                <h3 className="text-white text-2xl sm:text-3xl font-black mb-2">
                  {offer.title}
                </h3>
                <p className="text-theme3 font-extrabold mb-5">{offer.description}</p>
                <LocalizedLink
                  href={offer.link || "/shop"}
                  className={`inline-block px-4 py-3 text-xs sm:text-sm font-normal rounded-md transition-all duration-300 bg-theme3 text-gray-900 hover:bg-theme hover:text-white`}
                >
                  {t(lang, "order_now")} <ArrowRight className="inline-block w-4 h-4 ml-2" />
                </LocalizedLink>
              </div>

              {/* Image */}
              <div className="absolute right-0 bottom-10 z-0">
                <div className="relative">
                  <OptimizedImage
                    key={`${offer.image}-${index}`}
                    src={offer.image || "/img/offer/offerThumb1_1.png"}
                    alt={offer.title || "offer"}
                    width={200}
                    height={200}
                    className="object-contain w-50 h-40 sm:w-40 md:w-48 lg:w-42 xl:w-52 2xl:w-55"
                    quality={75}
                    loading="lazy"
                    sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, (max-width: 1280px) 168px, (max-width: 1536px) 208px, 220px"
                  />
                  <div className="absolute inset-0 -top-15 right-0 animate-float-bob-x">
                    {/* <Image
                      key={`${offer.shape}-${index}`}
                      src={offer.shape}
                      alt="shape"
                      width={100}
                      height={100}
                      className="object-contain w-auto h-auto"
                      unoptimized={true}
                    /> */}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
