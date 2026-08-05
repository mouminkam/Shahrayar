import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../ui/AnimatedSection";
import ErrorBoundary from "../../ui/ErrorBoundary";
import SectionSkeleton from "../../ui/SectionSkeleton";
import type { Locale } from "../../../locales/i18n/config";

// Dynamic imports - only if needed for code splitting
const OfferCards = dynamic(() => import("./OfferCards"), {
  loading: () => <SectionSkeleton variant="default" cardCount={3} height="h-80" />,
  ssr: true, // Enable SSR
});

const AboutSection = dynamic(() => import("./AboutSection"), {
  loading: () => <SectionSkeleton variant="default" showCards={false} height="h-64" />,
  ssr: true, // Enable SSR
});

const ChefeSection = dynamic(() => import("./ChefeSection"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={3} height="h-96" />,
  ssr: true, // Enable SSR if no browser-only APIs
});

interface AboutUsSectionProps {
  chefs?: unknown[];
  slides?: unknown[];
  lang?: Locale;
  className?: string;
}

export default function AboutUsSection({
  chefs = [],
  slides = [],
  lang = "bg" as Locale,
  className = "",
}: AboutUsSectionProps) {
  return (
    <div className={className}>
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
            <AboutSection />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={3} height="h-96" />}>
          <AnimatedSection>
            <ChefeSection chefs={chefs as never} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
