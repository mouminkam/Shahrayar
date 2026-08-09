import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import ShopDetailsContent from "../../../../components/pages/shop/ShopDetailsContent";
import PopularDishes from "../../../../components/pages/shop/PopularDishes";
import { i18n, type Locale } from "../../../../locales/i18n/config";
import { menuItems, getMenuItemById, popularItems } from "../../../../content/menu";
import { getLocalizedField } from "../../../../lib/utils/productTransform";

/**
 * Product detail — statically generated for every dish × locale.
 *
 * generateStaticParams enumerates the whole catalog at build time, so each
 * product page ships as prerendered HTML. dynamicParams is false: an unknown
 * id 404s immediately rather than triggering an on-demand render.
 */

interface ShopDetailsPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    menuItems.map((item) => ({ lang, id: String(item.id) }))
  );
}

export const dynamicParams = false;

function resolveLocale(raw: string): Locale {
  return (i18n.locales as readonly string[]).includes(raw) ? (raw as Locale) : i18n.defaultLocale;
}

export async function generateMetadata({ params }: ShopDetailsPageProps): Promise<Metadata> {
  const { lang: rawLang, id } = await params;
  const lang = resolveLocale(rawLang);
  const item = getMenuItemById(id);

  if (!item) return { title: "Product Not Found" };

  const name = getLocalizedField(item, "name", lang);
  const description = getLocalizedField(item, "description", lang);

  return {
    title: name,
    description: description || `${name} at Shahrayar Restaurant`,
    ...(item.image && { openGraph: { images: [{ url: item.image }] } }),
  };
}

export default async function ShopDetailsPage({ params }: ShopDetailsPageProps) {
  const { lang: rawLang, id } = await params;
  const lang = resolveLocale(rawLang);

  const item = getMenuItemById(id);
  if (!item) notFound();

  return (
    <div className="bg-bg3 min-h-screen">
      <ErrorBoundary>
        <ShopDetailsContent
          rawProductData={{
            item,
            optionGroups: [],
            customizations: (item.customizations as never) ?? null,
          }}
          lang={lang}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <PopularDishes rawPopularData={popularItems.filter((p) => p.id !== item.id)} lang={lang} />
      </ErrorBoundary>
    </div>
  );
}
