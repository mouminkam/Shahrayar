import type { Metadata } from "next";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import { i18n, type Locale } from "../../../locales/i18n/config";
import { menuItems, categories } from "../../../content/menu";
import ShopHeader from "./_components/ShopHeader";
import ShopProductsSection from "./_components/ShopProductsSection";

/**
 * Shop — static shell + client-side filtering.
 *
 * The whole catalog is small and static, so it's shipped with the page and
 * filtered in the browser. Changing category or page is then instant: no
 * server round-trip, no refetch, no loading spinner.
 *
 * Note there's no `searchParams` here on purpose — reading it would opt the
 * route out of static generation. The active category/page is read from the
 * URL inside the client component instead (useSearchParams), which keeps the
 * URL shareable while the shell stays prerendered.
 */

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full Shahrayar menu — shawarma, wood-fired pizza, wings, and plates built to share. Order for delivery or pickup.",
  keywords: ["menu", "food", "order online", "delivery", "pickup", "Middle Eastern cuisine"],
};

export default async function ShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang: Locale = (i18n.locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : i18n.defaultLocale;

  return (
    <div className="bg-bg3 min-h-screen">
      <ShopHeader lang={lang} />

      <ErrorBoundary>
        <ShopProductsSection allItems={menuItems} allCategories={categories} />
      </ErrorBoundary>
    </div>
  );
}
