// MODIFIED: Phase C — Page Splitting
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import type { Locale } from "../../../locales/i18n/config";

const LatestItemsSection = dynamic(() => import("../../../components/pages/home/LatestItemsSection"), {
  loading: () => <SectionSkeleton variant="slider" cardCount={4} height="h-80" />,
});

const OfferCards = dynamic(() => import("../../../components/pages/about-us/OfferCards"), {
  loading: () => <SectionSkeleton variant="default" cardCount={3} height="h-80" />,
});

const AboutUsSection = dynamic(() => import("../../../components/pages/home/AboutUsSection"), {
  loading: () => <SectionSkeleton variant="default" showCards={false} height="h-64" />,
});

const PopularDishes = dynamic(() => import("../../../components/pages/shop/PopularDishes"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={5} height="h-96" />,
});

const FoodMenuSection = dynamic(() => import("../../../components/pages/home/FoodMenuSection"), {
  loading: () => <SectionSkeleton variant="default" cardCount={10} height="h-96" />,
});

const ChefSpecialSection = dynamic(() => import("../../../components/pages/home/ChefSpecialSection"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={3} height="h-96" />,
});

const ChefeSection = dynamic(() => import("../../../components/pages/about-us/ChefeSection"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={3} height="h-96" />,
});

interface Highlights {
  popular: unknown[];
  latest: unknown[];
  chefSpecial: unknown[];
}

interface HomeSecondarySectionsProps {
  slidesPromise: Promise<unknown[]>;
  highlightsPromise: Promise<Highlights>;
  chefsPromise: Promise<unknown[]>;
  lang: Locale;
}

export default async function HomeSecondarySections({
  slidesPromise,
  highlightsPromise,
  chefsPromise,
  lang,
}: HomeSecondarySectionsProps) {
  const [slides, highlights, chefs] = await Promise.all([slidesPromise, highlightsPromise, chefsPromise]);

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="slider" cardCount={4} height="h-80" />}>
          <AnimatedSection>
            <LatestItemsSection rawLatestData={highlights.latest} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" cardCount={3} height="h-80" />}>
          <AnimatedSection>
            <OfferCards slides={slides as never} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" showCards={false} height="h-64" />}>
          <AnimatedSection>
            <AboutUsSection lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={5} height="h-96" />}>
          <AnimatedSection>
            <PopularDishes rawPopularData={highlights.popular} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" cardCount={10} height="h-96" />}>
          <AnimatedSection>
            <FoodMenuSection lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={3} height="h-96" />}>
          <AnimatedSection>
            <ChefSpecialSection rawChefSpecialData={highlights.chefSpecial} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={3} height="h-96" />}>
          <AnimatedSection>
            {/* chefsPromise resolves to the raw API array; ChefeSection narrows/validates its own shape */}
            <ChefeSection chefs={chefs as any} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
