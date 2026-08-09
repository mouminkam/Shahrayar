import type { Metadata } from "next";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { t } from "../../../locales/i18n/getTranslation";
import { i18n, type Locale } from "../../../locales/i18n/config";
import { defaultBranch } from "../../../content/restaurant";
import ContactSections from "./_components/ContactSections";

/**
 * Contact — a fully static Server Component. Branch details are static
 * content, so there's nothing to fetch or await.
 */

interface ContactPageProps {
  params: Promise<{ lang: string }>;
}

function resolveLocale(raw: string): Locale {
  return (i18n.locales as readonly string[]).includes(raw) ? (raw as Locale) : i18n.defaultLocale;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = resolveLocale(rawLang);
  return {
    title: t(lang, "contact_us"),
    description: "Find a Shahrayar table, call the kitchen, or send us a message.",
    keywords: [t(lang, "contact_us")],
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang: rawLang } = await params;
  const lang = resolveLocale(rawLang);

  return (
    <div className="bg-bg3 min-h-screen">
      <Breadcrumb title={t(lang, "contact_us")} />

      <ErrorBoundary>
        <ContactSections branch={defaultBranch} lang={lang} />
      </ErrorBoundary>
    </div>
  );
}
