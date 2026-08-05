// MODIFIED: Phase C — Page Splitting
import dynamic from "next/dynamic";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import type { Locale } from "../../../locales/i18n/config";

const BannerSection = dynamic(() => import("../../../components/pages/home/BannerSection"), {
  loading: () => <SectionSkeleton variant="default" height="h-screen" />,
});

interface HeroBannerStreamProps {
  slidesPromise: Promise<unknown[]>;
  lang: Locale;
}

export default async function HeroBannerStream({ slidesPromise, lang }: HeroBannerStreamProps) {
  const slides = await slidesPromise;

  return (
    <ErrorBoundary>
      <AnimatedSection>
        <BannerSection slides={slides as never} lang={lang} />
      </AnimatedSection>
    </ErrorBoundary>
  );
}
