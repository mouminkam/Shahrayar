import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import type { Locale } from "../../../locales/i18n/config";
import LatestItemsSection from "../../../components/pages/home/LatestItemsSection";
import OfferCards from "../../../components/pages/about-us/OfferCards";
import AboutUsSection from "../../../components/pages/home/AboutUsSection";
import PopularDishes from "../../../components/pages/shop/PopularDishes";
import FoodMenuSection from "../../../components/pages/home/FoodMenuSection";
import ChefSpecialSection from "../../../components/pages/home/ChefSpecialSection";
import ChefeSection from "../../../components/pages/about-us/ChefeSection";

/**
 * Below-the-fold home sections.
 *
 * These are plain static imports on purpose. An earlier revision loaded each
 * section with next/dynamic, which — because dynamic() wraps its target in a
 * Suspense boundary — made the server flush an *empty* shell and stream the
 * real markup in afterwards. For a page whose content is fully static that
 * trades away the main benefit of prerendering: the HTML is meaningful the
 * instant it arrives. Next.js already code-splits per route, so plain imports
 * give a smaller critical path here, not a bigger one.
 */

interface HomeSecondarySectionsProps {
  popular: unknown[];
  latest: unknown[];
  chefSpecial: unknown[];
  chefs: unknown[];
  slides: unknown[];
  lang: Locale;
}

export default function HomeSecondarySections({
  popular,
  latest,
  chefSpecial,
  chefs,
  slides,
  lang,
}: HomeSecondarySectionsProps) {
  return (
    <>
      <ErrorBoundary>
        <AnimatedSection>
          <LatestItemsSection rawLatestData={latest} lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <OfferCards slides={slides as never} lang={lang} chapter={2} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <AboutUsSection lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <PopularDishes rawPopularData={popular} lang={lang} chapter={4} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <FoodMenuSection lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <ChefSpecialSection rawChefSpecialData={chefSpecial} lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <ChefeSection chefs={chefs as never} lang={lang} chapter={7} />
        </AnimatedSection>
      </ErrorBoundary>
    </>
  );
}
