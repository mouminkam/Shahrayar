import type { Metadata } from "next";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { t } from "../../../locales/i18n/getTranslation";
import { i18n, type Locale } from "../../../locales/i18n/config";
import { chefs, heroSlides } from "../../../content/restaurant";
import AboutSections from "./_components/AboutSections";

/**
 * About — a fully static Server Component (see src/app/[lang]/page.tsx for the
 * reasoning behind avoiding cookies()/headers() and awaited data here).
 */

interface AboutUsPageProps {
  params: Promise<{ lang: string }>;
}

function resolveLocale(raw: string): Locale {
  return (i18n.locales as readonly string[]).includes(raw) ? (raw as Locale) : i18n.defaultLocale;
}

export async function generateMetadata({ params }: AboutUsPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = resolveLocale(rawLang);
  return {
    title: t(lang, "about_us"),
    description: "The kitchen, the team, and the fire behind Shahrayar.",
    keywords: [t(lang, "about_us")],
  };
}

export default async function AboutUsPage({ params }: AboutUsPageProps) {
  const { lang: rawLang } = await params;
  const lang = resolveLocale(rawLang);

  return (
    <div className="bg-bg3 min-h-screen">
      <Breadcrumb title={t(lang, "about_us")} />

      <ErrorBoundary>
        <AboutSections slides={heroSlides} chefs={chefs} lang={lang} />
      </ErrorBoundary>
    </div>
  );
}
