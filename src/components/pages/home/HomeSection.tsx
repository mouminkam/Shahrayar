import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../ui/AnimatedSection";
import ErrorBoundary from "../../ui/ErrorBoundary";
import SectionSkeleton from "../../ui/SectionSkeleton";
import type { Locale } from "@/locales/i18n/config";

// Dynamic imports with SSR enabled
const BannerSection = dynamic(() => import("./BannerSection"), {
  loading: () => <SectionSkeleton variant="default" height="h-screen" />,
  ssr: true,
});

const LatestItemsSection = dynamic(() => import("./LatestItemsSection"), {
  loading: () => <SectionSkeleton variant="slider" cardCount={4} height="h-80" />,
  ssr: true,
});

const OfferCards = dynamic(() => import("../about-us/OfferCards"), {
  loading: () => <SectionSkeleton variant="default" cardCount={3} height="h-80" />,
  ssr: true,
});

const AboutUsSection = dynamic(() => import("./AboutUsSection"), {
  loading: () => <SectionSkeleton variant="default" showCards={false} height="h-64" />,
  ssr: true,
});

const PopularDishes = dynamic(() => import("../shop/PopularDishes"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={5} height="h-96" />,
  ssr: true,
});

const FoodMenuSection = dynamic(() => import("./FoodMenuSection"), {
  loading: () => <SectionSkeleton variant="default" cardCount={10} height="h-96" />,
  ssr: true,
});

const ChefSpecialSection = dynamic(() => import("./ChefSpecialSection"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={3} height="h-96" />,
  ssr: true,
});

const ChefeSection = dynamic(() => import("../about-us/ChefeSection"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={3} height="h-96" />,
  ssr: true,
});

interface HomeSectionProps {
  slides?: unknown[];
  rawPopularData?: unknown[];
  rawLatestData?: unknown[];
  rawChefSpecialData?: unknown[];
  chefs?: unknown[];
  lang?: Locale;
  className?: string;
}

export default function HomeSection({
  slides = [],
  rawPopularData = [],
  rawLatestData = [],
  rawChefSpecialData = [],
  chefs = [],
  lang = "bg",
  className = "",
}: HomeSectionProps) {
  return (
    <div className={className}>
      {/* Banner Section - Above the fold */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" height="h-screen" />}>
          <AnimatedSection>
            <BannerSection slides={slides as never} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      {/* Latest Items Section */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="slider" cardCount={4} height="h-80" />}>
          <AnimatedSection>
            <LatestItemsSection rawLatestData={rawLatestData} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      {/* Offer Cards Section */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" cardCount={3} height="h-80" />}>
          <AnimatedSection>
            <OfferCards slides={slides as never} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      {/* About Us Section */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" showCards={false} height="h-64" />}>
          <AnimatedSection>
            <AboutUsSection lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      {/* Popular Dishes Section */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={5} height="h-96" />}>
          <AnimatedSection>
            <PopularDishes rawPopularData={rawPopularData} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      {/* Food Menu Section */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" cardCount={10} height="h-96" />}>
          <AnimatedSection>
            <FoodMenuSection lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      {/* Chef Special Section */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={3} height="h-96" />}>
          <AnimatedSection>
            <ChefSpecialSection rawChefSpecialData={rawChefSpecialData} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      {/* Chef Section */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={3} height="h-96" />}>
          <AnimatedSection>
            <ChefeSection chefs={chefs as any} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
