// MODIFIED: Phase C — Page Splitting
import dynamic from "next/dynamic";
import AnimatedSection from "../../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../../components/ui/SectionSkeleton";
import type { Locale } from "../../../../locales/i18n/config";

const ChefeSection = dynamic(
  () => import("../../../../components/pages/about-us/ChefeSection"),
  {
    loading: () => (
      <SectionSkeleton variant="grid" cardCount={3} height="h-96" />
    ),
  }
);

interface AboutSecondarySectionsProps {
  chefsPromise: Promise<unknown[]>;
  lang: Locale;
}

export default async function AboutSecondarySections({ chefsPromise, lang }: AboutSecondarySectionsProps) {
  const chefs = await chefsPromise;

  return (
    <ErrorBoundary>
      <AnimatedSection>
        <ChefeSection chefs={chefs as never} lang={lang} />
      </AnimatedSection>
    </ErrorBoundary>
  );
}
