import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../ui/AnimatedSection";
import ErrorBoundary from "../../ui/ErrorBoundary";
import SectionSkeleton from "../../ui/SectionSkeleton";
import type { Branch } from "../../../lib/fetchDefaultBranch";
import type { Locale } from "../../../locales/i18n/config";

// Dynamic imports - only if needed for code splitting
const ContactBoxes = dynamic(() => import("./ContactBoxes"), {
  loading: () => <SectionSkeleton variant="grid" cardCount={3} height="h-64" />,
  ssr: true, // Enable SSR
});

const ContactForm = dynamic(() => import("./ContactForm"), {
  loading: () => <SectionSkeleton variant="default" height="h-96" />,
  ssr: true, // Form needs client-side interactivity
});

const Map = dynamic(() => import("./Map"), {
  loading: () => <SectionSkeleton variant="default" showCards={false} height="h-96" />,
  ssr: true, // Map needs client-side rendering
});

interface ContactSectionProps {
  branchDetails?: Branch | null;
  lang?: Locale;
  className?: string;
}

export default function ContactSection({
  branchDetails = null,
  lang = "bg" as Locale,
  className = "",
}: ContactSectionProps) {
  return (
    <div className={className}>
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={3} height="h-64" />}>
          <AnimatedSection>
            <ContactBoxes branchDetails={branchDetails} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" height="h-96" />}>
          <AnimatedSection>
            <ContactForm branchDetails={branchDetails} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" showCards={false} height="h-96" />}>
          <AnimatedSection>
            <Map branchDetails={branchDetails} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
