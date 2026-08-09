import type { Metadata } from "next";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import { i18n, type Locale } from "../../locales/i18n/config";
import { heroSlides, chefs } from "../../content/restaurant";
import { popularItems, latestItems, chefSpecialItems } from "../../content/menu";
import HeroBanner from "./_components/HeroBanner";
import HomeSecondarySections from "./_components/HomeSecondarySections";

/**
 * Home — a fully static Server Component.
 *
 * All content is a build-time module import (src/content/*), so this page is
 * prerendered to HTML for every locale and served from the edge with no
 * server work per request. That's what makes navigation feel instant.
 *
 * Deliberately absent: cookies(), headers(), and any awaited data fetch. Each
 * of those would opt this route out of static generation and force a
 * server round-trip on every visit. The locale comes from `params`, which is
 * known at build time via the layout's generateStaticParams().
 */

export const metadata: Metadata = {
  title: { absolute: "Shahrayar Restaurant — Authentic Middle Eastern Cuisine" },
  description:
    "Char-grilled shawarma, wood-fired pizza, and plates built to share. Order online for delivery or pickup.",
};

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (i18n.locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : i18n.defaultLocale;

  return (
    <div className="bg-bg3 min-h-screen">
      {/* Above the fold — rendered eagerly, no loading state needed. */}
      <ErrorBoundary>
        <HeroBanner slides={heroSlides} lang={lang} />
      </ErrorBoundary>

      {/* Below the fold — code-split so the initial JS payload stays small.
          The data itself is already here; only the component code is deferred. */}
      <ErrorBoundary>
        <HomeSecondarySections
          popular={popularItems}
          latest={latestItems}
          chefSpecial={chefSpecialItems}
          chefs={chefs}
          slides={heroSlides}
          lang={lang}
        />
      </ErrorBoundary>
    </div>
  );
}
