"use client";
import { useState, useMemo, useEffect, useRef } from "react";
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
  shape4Float: boolean;
}

interface BannerSectionProps {
  slides?: WebsiteSlideApi[];
  lang?: Locale | null;
}

export default function BannerSection({ slides: apiSlides = [], lang: serverLang = null }: BannerSectionProps) {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang: clientLang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  // Content is static and localized by the transform below. Switching language
  // navigates to a different locale route, which re-renders this with new
  // props — so there's nothing to refetch and no hydration dance to manage.
  const lang = serverLang || clientLang;

  // Map slide content to component format
  const slides: BannerSlide[] = useMemo(() => {
    if (!apiSlides || apiSlides.length === 0) {
      return [];
    }

    return apiSlides.map((slide, index) => ({
      id: slide.id,
      subtitle: getLocalizedField(slide, "description", lang) || slide.description || t(lang, "welcome_fresheat"),
      title: getLocalizedField(slide, "title", lang) || slide.title || "",
      image: getProxiedImageUrl(slide.desktop_image || "") || "/img/bg/bannerBG1_1.jpg",
      bgImage: "/img/bg/bannerBG1_1.jpg",
      link: slide.menu_item_id ? `/shop/${slide.menu_item_id}` : "/shop",
      shape4Float: index % 2 === 0,
    }));
  }, [apiSlides, lang]);

  const currentSlide = slides[activeIndex] || slides[0];
  const preloadedImagesRef = useRef<Set<string>>(new Set());

  // Preload first slide image for better LCP
  useEffect(() => {
    if (slides.length > 0 && slides[0]?.image) {
      const firstImage = slides[0].image;

      // Skip if already preloaded
      if (preloadedImagesRef.current.has(firstImage)) {
        return;
      }

      // Create preload link
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = firstImage;
      link.fetchPriority = "high";

      // Add crossorigin if image is from external domain
      if (firstImage.startsWith("http")) {
        link.crossOrigin = "anonymous";
      }

      document.head.appendChild(link);
      preloadedImagesRef.current.add(firstImage);

      // Cleanup function
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [slides]);

  // Show skeleton loader when no slides
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

          {/* Fixed Content Container */}
          <div className="banner-container absolute inset-0 z-50 py-12 sm:py-16 md:py-20 lg:py-32 xl:py-40 mt-18 sm:mt-20 md:mt-24 lg:mt-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-12 items-center h-full">
                {/* Image Skeleton - Right Side */}
                <div className="col-span-1 lg:col-span-1 order-1 lg:order-2 flex justify-center lg:justify-end items-center">
                  <div className="banner-thumb-area relative z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl animate-pulse">
                    <div className="w-full aspect-square bg-gray-700/50 rounded-2xl"></div>
                  </div>
                </div>

                {/* Text Content Skeleton - Left Side */}
                <div className="col-span-1 lg:col-span-1 order-2 lg:order-1 mt-4 sm:mt-0 md:mt-0 w-full lg:w-auto">
                  <div className="banner-title-area w-full lg:w-auto relative min-h-[200px] sm:min-h-[250px] md:min-h-[280px] lg:min-h-[300px] space-y-4 animate-pulse">
                    {/* Subtitle Skeleton */}
                    <div className="h-6 sm:h-8 bg-gray-700/50 rounded w-1/3 lg:w-1/4"></div>
                    {/* Title Skeleton */}
                    <div className="space-y-3">
                      <div className="h-8 sm:h-10 md:h-12 lg:h-16 bg-gray-700/50 rounded w-3/4"></div>
                      <div className="h-8 sm:h-10 md:h-12 lg:h-16 bg-gray-700/50 rounded w-2/3"></div>
                    </div>
                    {/* Button Skeleton */}
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
          autoplay={
            slides.length > 1
              ? {
                  delay: 3000,
                  disableOnInteraction: false,
                }
              : false
          }
          onSlideChange={(swiper: SwiperInstance) => setActiveIndex(swiper.realIndex)}
          className="banner-slider"
        >
          {slides.length > 0 &&
            slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div
                  className="relative bg-cover bg-center min-h-[800px]"
                  style={{
                    backgroundImage: `url(${slide.bgImage})`,
                  }}
                >
                  {/* Shapes */}
                  <div className="shape1_1 hidden xxl:block">
                    <Image src="/img/shape/bannerShape1_1.svg" alt="shape" width={100} height={100} unoptimized={true} />
                  </div>
                  <div className="shape1_2 hidden xxl:block">
                    <Image src="/img/shape/bannerShape1_2.svg" alt="shape" width={80} height={80} unoptimized={true} />
                  </div>
                  <div className="shape1_3 hidden xxl:block">
                    <Image src="/img/shape/bannerShape1_3.svg" alt="shape" width={120} height={120} unoptimized={true} />
                  </div>
                  <div className={`shape1_4 hidden xxl:block ${slide.shape4Float ? "float-bob-x" : ""}`}>
                    <Image src="/img/shape/bannerShape1_4.svg" alt="shape" width={90} height={90} unoptimized={true} />
                  </div>
                  <div className="shape1_5 hidden xxl:block">
                    <Image src="/img/shape/bannerShape1_5.svg" alt="shape" width={70} height={70} unoptimized={true} />
                  </div>
                  <div className="shape1_6 hidden xxl:block cir36">
                    <Image src="/img/shape/bannerShape1_6.svg" alt="shape" width={100} height={100} unoptimized={true} />
                  </div>

                  {/* Overlay */}
                  <div className="overlay absolute inset-0 bg-title opacity-30"></div>
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
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "tween", duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ willChange: "transform, opacity" }}
                    className="banner-thumb-area relative z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl pointer-events-auto"
                  >
                    <Image
                      src={currentSlide?.image || "/img/banner/bannerThumb1_1.png"}
                      alt={currentSlide?.title || "banner"}
                      width={1200}
                      height={1200}
                      className="w-full h-auto object-contain"
                      quality={80}
                      priority={activeIndex === 0}
                      fetchPriority={activeIndex === 0 ? "high" : "auto"}
                      loading="eager"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Text Content - Left Side - Fixed Container */}
              <div className="col-span-1 lg:col-span-1 order-2 lg:order-1 mt-4 sm:mt-0 md:mt-0 w-full lg:w-auto">
                <div className="banner-title-area w-full lg:w-auto relative min-h-[200px] sm:min-h-[250px] md:min-h-[280px] lg:min-h-[300px] mt-0 lg:mt-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide.id}
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "-100%", opacity: 0 }}
                      transition={{ type: "tween", duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{ willChange: "transform, opacity" }}
                      className="banner-style1 w-full lg:w-auto pointer-events-auto"
                    >
                      <div className="section-title text-center lg:text-left w-full lg:w-auto">
                        <motion.h6
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                          className="sub-title text-theme  text-sm sm:text-2xl font-extrabold uppercase mb-3 sm:mb-1"
                        >
                          {currentSlide?.subtitle || t(lang, "welcome_fresheat")}
                        </motion.h6>
                        <motion.h1
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                          className="title text-white  text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black leading-tight mb-4 sm:mb-6"
                        >
                          {currentSlide?.title || ""}
                        </motion.h1>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                          className="flex justify-center lg:justify-start"
                        >
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                              className="theme-btn px-6 py-2.5 sm:px-8 sm:py-3 bg-theme3 text-gray-900 text-sm sm:text-base font-medium hover:bg-theme hover:text-white transition-colors duration-300 rounded-xl shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2"
                              href={currentSlide?.link || "/shop"}
                              onMouseEnter={() => prefetchRoute(currentSlide?.link || "/shop")}
                            >
                              {t(lang, "order_now")}
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
      </div>
    </section>
  );
}
