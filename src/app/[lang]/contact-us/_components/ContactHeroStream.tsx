// MODIFIED: Phase C — Page Splitting
import dynamic from "next/dynamic";
import AnimatedSection from "../../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../../components/ui/SectionSkeleton";
import type { Locale } from "../../../../locales/i18n/config";
import type { Branch } from "../../../../lib/fetchDefaultBranch";

const ContactBoxes = dynamic(
  () => import("../../../../components/pages/contact-us/ContactBoxes"),
  {
    loading: () => (
      <SectionSkeleton variant="grid" cardCount={3} height="h-64" />
    ),
  }
);

interface ContactHeroStreamProps {
  branchDetailsPromise: Promise<Branch | null>;
  lang: Locale;
}

export default async function ContactHeroStream({
  branchDetailsPromise,
  lang,
}: ContactHeroStreamProps) {
  const branchDetails = await branchDetailsPromise;

  return (
    <ErrorBoundary>
      <AnimatedSection>
        <ContactBoxes branchDetails={branchDetails} lang={lang} />
      </AnimatedSection>
    </ErrorBoundary>
  );
}
