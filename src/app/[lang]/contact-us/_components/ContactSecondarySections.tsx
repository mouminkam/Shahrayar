// MODIFIED: Phase C — Page Splitting
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../../components/ui/SectionSkeleton";
import type { Locale } from "../../../../locales/i18n/config";
import type { Branch } from "../../../../lib/fetchDefaultBranch";

const ContactForm = dynamic(
  () => import("../../../../components/pages/contact-us/ContactForm"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
  }
);

const Map = dynamic(
  () => import("../../../../components/pages/contact-us/Map"),
  {
    loading: () => (
      <SectionSkeleton variant="default" showCards={false} height="h-96" />
    ),
  }
);

interface ContactSecondarySectionsProps {
  branchDetailsPromise: Promise<Branch | null>;
  lang: Locale;
}

export default async function ContactSecondarySections({
  branchDetailsPromise,
  lang,
}: ContactSecondarySectionsProps) {
  const branchDetails = await branchDetailsPromise;

  return (
    <>
      <ErrorBoundary>
        <Suspense
          fallback={<SectionSkeleton variant="default" height="h-96" />}
        >
          <AnimatedSection>
            <ContactForm branchDetails={branchDetails} lang={lang} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense
          fallback={
            <SectionSkeleton
              variant="default"
              showCards={false}
              height="h-96"
            />
          }
        >
          <AnimatedSection>
            <Map branchDetails={branchDetails} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
