"use client";
import { useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { getProxiedImageUrl } from "../../../lib/utils/imageProxy";
import { getLocalizedField } from "../../../lib/utils/productTransform";
import type { Locale } from "@/locales/i18n/config";

// Import Swiper CSS - Next.js will handle optimization
import "swiper/swiper-bundle.css";

/** Raw website-slide shape as returned by the API */
export interface WebsiteSlideApi {
  id: number | string;
  title?: string;
  description?: string;
  desktop_image?: string;
  menu_item_id?: number | string;
  [key: string]: unknown;
}

interface BannerSlide {
  id: number | string;
  subtitle: string;
  title: string;
  image: string;
  bgImage: string;
  link: string;
}

interface BannerSectionProps {
  slides?: WebsiteSlideApi[];
  lang?: Locale | null;
}

/**
 * Hero. Every home section beneath this one opens with the same eyebrow +
 * khatim-mark + serif-headline pattern (see SectionHeading) — the hero uses
 * the identical vocabulary, just laid out for the two-column banner instead
 * of a centered block, so the page reads as one voice from the first pixel.
 */
export default function BannerSection({ slides: apiSlides = [], lang: serverLang = null }: BannerSectionProps) {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang: clientLang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const lang = serverLang || clientLang;

  const slides: BannerSlide[] = useMemo(() => {
    if (!apiSlides || apiSlides.length === 0) {
      return [];
    }

    return apiSlides.map((slide) => ({
      id: slide.id,
      subtitle: getLocalizedField(slide, "description", lang) || slide.description || t(lang, "welcome_fresheat"),
      title: getLocalizedField(slide, "title", lang) || slide.title || "",
      image: getProxiedImageUrl(slide.desktop_image || "") || "/img/bg/bannerBG1_1.jpg",
      bgImage: "/img/bg/bannerBG1_1.jpg",
      link: slide.menu_item_id ? `/shop/${slide.menu_item_id}` : "/shop",
    }));
  }, [apiSlides, lang]);

  const currentSlide = slides[activeIndex] || slides[0];

  // No hand-rolled <link rel="preload"> for the first slide image here. It
  // pointed at the raw source path, but the image below renders through
  // next/image, which requests /_next/image?url=...&w=...&q=... — so the
  // browser never matched the preload and simply downloaded the file twice
  // ("preloaded but not used" in the console). The <Image> already carries
  // priority={activeIndex === 0}, which makes Next emit a preload for the
  // exact optimized URL it is going to request.

  if (!slides || slides.length === 0) {
    return (
      <section className="banner-section fix mb-8">
        <div className="slider-area relative">
          <div
            className="relative bg-cover bg-center min-h-[800px]"
            style={{ backgroundImage: `url(/img/bg/bannerBG1_1.jpg)` }}
          >
            <div className="overlay absolute inset-0 bg-title opacity-30"></div>
          </div>
          <div className="banner-container absolute inset-0 z-50 py-12 sm:py-16 md:py-20 lg:py-32 xl:py-40 mt-18 sm:mt-20 md:mt-24 lg:mt-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-12 items-center h-full">
                <div className="col-span-1 lg:col-span-1 order-1 lg:order-2 flex justify-center lg:justify-end items-center">
                  <div className="banner-thumb-area relative z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl animate-pulse">
                    <div className="w-full aspect-square bg-gray-700/50 rounded-2xl"></div>
                  </div>
                </div>
                <div className="col-span-1 lg:col-span-1 order-2 lg:order-1 mt-4 sm:mt-0 md:mt-0 w-full lg:w-auto">
                  <div className="banner-title-area w-full lg:w-auto relative min-h-[200px] sm:min-h-[250px] md:min-h-[280px] lg:min-h-[300px] space-y-4 animate-pulse">
                    <div className="h-6 sm:h-8 bg-gray-700/50 rounded w-1/3 lg:w-1/4"></div>
                    <div className="space-y-3">
                      <div className="h-8 sm:h-10 md:h-12 lg:h-16 bg-gray-700/50 rounded w-3/4"></div>
                      <div className="h-8 sm:h-10 md:h-12 lg:h-16 bg-gray-700/50 rounded w-2/3"></div>
                    </div>
                    <div className="h-12 sm:h-14 bg-gray-700/50 rounded w-32 sm:w-40"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="banner-section fix mb-8">
      <div className="slider-area relative">
        <Swiper
          modules={[Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          loop={slides.length > 1}
          effect="fade"
          speed={800}
          autoplay={slides.length > 1 ? { delay: 4200, disableOnInteraction: false } : false}
          onSlideChange={(swiper: SwiperInstance) => setActiveIndex(swiper.realIndex)}
          className="banner-slider"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className="relative bg-cover bg-center min-h-[800px]"
                style={{ backgroundImage: `url(${slide.bgImage})` }}
              >
                {/* Night sky + lantern glow, replacing the old confetti-shape sprites */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-bg3" />
                <div className="hero-lantern-glow absolute right-[8%] top-1/2 -translate-y-1/2 w-[42vw] max-w-[640px] aspect-square rounded-full" />
                <div className="hero-star-field absolute inset-0" aria-hidden="true" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Fixed Content Container */}
        <div className="banner-container absolute inset-0 z-50 py-12 sm:py-16 md:py-20 lg:py-32 xl:py-40 mt-18 sm:mt-20 md:mt-24 lg:mt-0 pointer-events-none">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-12 items-center h-full">
              {/* Image - Right Side */}
              <div className="col-span-1 lg:col-span-1 order-1 lg:order-2 flex justify-center lg:justify-end items-center overflow-hidden mt-0 lg:mt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.id}
                    initial={{ x: "6%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-4%", opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className="banner-thumb-area relative z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl pointer-events-auto"
                  >
                    <Image
                      src={currentSlide?.image || "/img/banner/bannerThumb1_1.png"}
                      alt={currentSlide?.title || "banner"}
                      width={1200}
                      height={1200}
                      className="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
                      quality={80}
                      priority={activeIndex === 0}
                      fetchPriority={activeIndex === 0 ? "high" : "auto"}
                      loading="eager"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Text Content - Left Side */}
              <div className="col-span-1 lg:col-span-1 order-2 lg:order-1 mt-4 sm:mt-0 md:mt-0 w-full lg:w-auto">
                <div className="banner-title-area w-full lg:w-auto relative min-h-[200px] sm:min-h-[250px] md:min-h-[280px] lg:min-h-[300px] mt-0 lg:mt-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide.id}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ willChange: "transform, opacity" }}
                      className="banner-style1 w-full lg:w-auto pointer-events-auto"
                    >
                      <div className="section-title text-center lg:text-left w-full lg:w-auto">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15, duration: 0.5 }}
                          className="flex items-center gap-3 mb-4 justify-center lg:justify-start text-theme3"
                        >
                          <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none" aria-hidden="true">
                            <path
                              d="M16 2 L20 12 L30 16 L20 20 L16 30 L12 20 L2 16 L12 12 Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em]">
                            {currentSlide?.subtitle || t(lang, "welcome_fresheat")}
                          </p>
                        </motion.div>

                        <motion.h1
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.22, duration: 0.55, ease: "easeOut" }}
                          className="title font-[family-name:var(--font-amiri)] text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-6"
                        >
                          {currentSlide?.title || ""}
                        </motion.h1>

                        <motion.div
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.32, duration: 0.55, ease: "easeOut" }}
                          className="flex justify-center lg:justify-start"
                        >
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                            <Link
                              className="hero-cta group inline-flex items-center justify-center gap-2 px-7 py-3 sm:px-9 sm:py-3.5 text-sm sm:text-base font-semibold uppercase tracking-wide rounded-full"
                              href={currentSlide?.link || "/shop"}
                              onMouseEnter={() => prefetchRoute(currentSlide?.link || "/shop")}
                            >
                              {t(lang, "order_now")}
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
            {slides.map((slide, i) => (
              <span
                key={slide.id}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === activeIndex ? "w-8 bg-theme3" : "w-2 bg-white/30"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
