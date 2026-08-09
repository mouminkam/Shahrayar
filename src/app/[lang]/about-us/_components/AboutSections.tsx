import AnimatedSection from "../../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import type { Locale } from "../../../../locales/i18n/config";
import OfferCards from "../../../../components/pages/about-us/OfferCards";
import AboutSection from "../../../../components/pages/about-us/AboutSection";
import ChefeSection from "../../../../components/pages/about-us/ChefeSection";

/**
 * About page body. Statically imported so the whole page is meaningful HTML on
 * arrival — see HomeSecondarySections for why next/dynamic is avoided here.
 */

interface AboutSectionsProps {
  slides: unknown[];
  chefs: unknown[];
  lang: Locale;
}

export default function AboutSections({ slides, chefs, lang }: AboutSectionsProps) {
  return (
    <>
      <ErrorBoundary>
        <AnimatedSection>
          <OfferCards slides={slides as never} lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <AboutSection />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <ChefeSection chefs={chefs as never} lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>
    </>
  );
}
