// MODIFIED: Phase C — Page Splitting
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../../components/ui/SectionSkeleton";
import type { Locale } from "../../../../locales/i18n/config";

const OfferCards = dynamic(
  () => import("../../../../components/pages/about-us/OfferCards"),
  {
    loading: () => (
      <SectionSkeleton variant="default" cardCount={3} height="h-80" />
    ),
  }
);

const AboutSection = dynamic(
  () => import("../../../../components/pages/about-us/AboutSection"),
  {
    loading: () => (
      <SectionSkeleton variant="default" showCards={false} height="h-64" />
    ),
  }
);

interface AboutHeroStreamProps {
  slidesPromise: Promise<unknown[]>;
  lang: Locale;
}

export default async function AboutHeroStream({ slidesPromise, lang }: AboutHeroStreamProps) {
  const slides = await slidesPromise;

  return (
    <>
      <ErrorBoundary>
        <Suspense
          fallback={
            <SectionSkeleton variant="default" cardCount={3} height="h-80" />
          }
        >
          <AnimatedSection>
            <OfferCards slides={slides as never} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense
          fallback={
            <SectionSkeleton
              variant="default"
              showCards={false}
              height="h-64"
            />
          }
        >
          <AnimatedSection>
            <AboutSection />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
