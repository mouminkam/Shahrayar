import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FreshHeatHeader from "../../components/layout/Header";
import FreshHeatFooter from "../../components/layout/Footer";
import Toast from "../../components/ui/Toast";
import BranchInitializer from "../../components/layout/BranchInitializer";
import LenisScrollProvider from "../../components/layout/LenisScrollProvider";
import ScrollToTopHandler from "../../components/layout/ScrollToTopHandler";
import AuthTokenInjector from "../../components/layout/AuthTokenInjector";
import DecorativeYellowCircles from "../../components/ui/DecorativeYellowCircles";
import { LanguageProvider } from "../../context/LanguageContext";
import { i18n, getDirection, type Locale } from "../../locales/i18n/config";
import "../globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

// Any lang segment outside i18n.locales (e.g. someone hitting a bare
// unlocalized path like "/login" directly) must 404 instead of silently
// rendering the home page — [lang] is a single dynamic segment, so without
// this it would happily match "login" as if it were a locale.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shahrayar.peaklink.pro";

  return {
    title: {
      default: "Shahrayar Restaurant - Authentic Middle Eastern Cuisine",
      template: "%s | Shahrayar Restaurant",
    },
    description:
      "Experience authentic Middle Eastern flavors at Shahrayar Restaurant. Fresh ingredients, traditional recipes, and genuine hospitality. Order online for delivery or pickup.",
    keywords: [
      "Middle Eastern food",
      "restaurant",
      "delivery",
      "pickup",
      "authentic cuisine",
      "Shahrayar",
    ],
    authors: [{ name: "Shahrayar Restaurant" }],
    creator: "Shahrayar Restaurant",
    publisher: "Shahrayar Restaurant",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(i18n.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      locale: lang,
      url: `/${lang}`,
      siteName: "Shahrayar Restaurant",
      title: "Shahrayar Restaurant - Authentic Middle Eastern Cuisine",
      description:
        "Experience authentic Middle Eastern flavors at Shahrayar Restaurant. Fresh ingredients, traditional recipes, and genuine hospitality.",
      images: [
        {
          url: "/img/logo/mainlogo.png",
          width: 1200,
          height: 630,
          alt: "Shahrayar Restaurant",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Shahrayar Restaurant - Authentic Middle Eastern Cuisine",
      description: "Experience authentic Middle Eastern flavors at Shahrayar Restaurant.",
      images: ["/img/logo/mainlogo.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang: Locale = (i18n.locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : i18n.defaultLocale;
  const dir = getDirection(lang);

  return (
    <html lang={lang} dir={dir} className={oswald.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/img/logo/mainlogo.png" type="image/png" />
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* API endpoint preconnect for banner slides - high priority */}
        <link rel="preconnect" href="https://shahrayar.peaklink.pro" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://shahrayar.peaklink.pro" />

        {/* Preload LCP images for faster initial render */}
        <link rel="preload" as="image" href="/img/bg/bannerBG1_1.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/img/banner/bannerThumb1_1.png" fetchPriority="high" />
      </head>

      <body suppressHydrationWarning className={oswald.className}>
        <LanguageProvider initialLocale={lang}>
          <DecorativeYellowCircles />
          <AuthTokenInjector />
          <LenisScrollProvider>
            <ScrollToTopHandler />
            <BranchInitializer />
            <FreshHeatHeader />
            <main id="main" role="main" className="pt-15 md:pt-15 lg:pt-0">
              {children}
            </main>
            <FreshHeatFooter />
            <Toast />
          </LenisScrollProvider>
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
