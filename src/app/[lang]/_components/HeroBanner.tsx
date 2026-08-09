import BannerSection from "../../../components/pages/home/BannerSection";
import type { Locale } from "../../../locales/i18n/config";

interface HeroBannerProps {
  slides: unknown[];
  lang: Locale;
}

/**
 * Hero wrapper. Statically imported (not next/dynamic) so the hero is part of
 * the prerendered HTML rather than streamed in behind a Suspense boundary —
 * it's the LCP element, so it must be in the first byte of the response.
 * No AnimatedSection either: above-the-fold content should never fade in.
 */
export default function HeroBanner({ slides, lang }: HeroBannerProps) {
  return <BannerSection slides={slides as never} lang={lang} />;
}
