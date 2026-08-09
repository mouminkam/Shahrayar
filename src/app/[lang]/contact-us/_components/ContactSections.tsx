import AnimatedSection from "../../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import type { Locale } from "../../../../locales/i18n/config";
import type { Branch } from "../../../../content/restaurant";
import ContactBoxes from "../../../../components/pages/contact-us/ContactBoxes";
import ContactForm from "../../../../components/pages/contact-us/ContactForm";
import Map from "../../../../components/pages/contact-us/Map";

/**
 * Contact page body. Statically imported — see HomeSecondarySections for why
 * next/dynamic is avoided on static content pages.
 */

interface ContactSectionsProps {
  branch: Branch;
  lang: Locale;
}

export default function ContactSections({ branch, lang }: ContactSectionsProps) {
  return (
    <>
      <ErrorBoundary>
        <AnimatedSection>
          <ContactBoxes branchDetails={branch as never} lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <ContactForm branchDetails={branch as never} lang={lang} />
        </AnimatedSection>
      </ErrorBoundary>

      <ErrorBoundary>
        <AnimatedSection>
          <Map branchDetails={branch as never} />
        </AnimatedSection>
      </ErrorBoundary>
    </>
  );
}
