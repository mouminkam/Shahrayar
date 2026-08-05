// MODIFIED: Phase C — Page Splitting
import PopularDishes from "../../../../../components/pages/shop/PopularDishes";
import type { Locale } from "@/locales/i18n/config";

interface RelatedProductsStreamProps {
  popularPromise: Promise<unknown[]>;
  lang: Locale;
}

export default async function RelatedProductsStream({
  popularPromise,
  lang,
}: RelatedProductsStreamProps) {
  const popularRawData = await popularPromise;

  return <PopularDishes rawPopularData={popularRawData} lang={lang} />;
}
