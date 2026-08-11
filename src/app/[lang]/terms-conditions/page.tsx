import type { Metadata } from "next";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import LegalContentSection from "../../../components/pages/legal/LegalContentSection";
import { getLegalDocument } from "../../../content/legal";
import { i18n, type Locale } from "../../../locales/i18n/config";

/**
 * Terms & Conditions — a fully static Server Component. The copy comes from
 * src/content/legal.ts at build time, so all three locales ship as prerendered
 * HTML that search engines can index.
 *
 * The same text is also reachable without leaving the page you are on, through
 * <LegalModal> (used by the login, register and contact forms). That path is
 * client-side and goes through `api.legal`; this one is the linkable,
 * indexable version. Both render through the same LegalContentSection, so they
 * cannot drift apart visually.
 */

interface LegalPageProps {
  params: Promise<{ lang: string }>;
}

function resolveLocale(raw: string): Locale {
  return (i18n.locales as readonly string[]).includes(raw) ? (raw as Locale) : i18n.defaultLocale;
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const doc = getLegalDocument("terms-conditions", resolveLocale(rawLang));

  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/${resolveLocale(rawLang)}/terms-conditions` },
  };
}

export default async function TermsConditionsPage({ params }: LegalPageProps) {
  const { lang: rawLang } = await params;
  const doc = getLegalDocument("terms-conditions", resolveLocale(rawLang));

  return (
    <div className="bg-bg3 min-h-screen">
      <Breadcrumb title={doc.title} />

      <section className="legal-section section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <ErrorBoundary>
              {/* Static content, so there is nothing to load and nothing to retry. */}
              <LegalContentSection content={doc} isLoading={false} error={null} />
            </ErrorBoundary>
          </div>
        </div>
      </section>
    </div>
  );
}
