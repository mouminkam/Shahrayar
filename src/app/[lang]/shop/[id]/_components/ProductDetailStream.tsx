// MODIFIED: Phase C — Page Splitting
import { notFound } from "next/navigation";
import ShopDetailsContent, { type RawProductData } from "../../../../../components/pages/shop/ShopDetailsContent";
import type { Locale } from "@/locales/i18n/config";

interface ProductDetailStreamProps {
  productPromise: Promise<RawProductData | null>;
  lang: Locale;
}

export default async function ProductDetailStream({ productPromise, lang }: ProductDetailStreamProps) {
  const productData = await productPromise;

  if (!productData?.item) notFound();

  return <ShopDetailsContent rawProductData={productData} lang={lang} />;
}
