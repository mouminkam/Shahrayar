// MODIFIED: Phase C — Page Splitting
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import ErrorBoundary from "../../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../../components/ui/SectionSkeleton";
import { getLanguage } from "../../../../lib/getLanguage";
import { getAuthToken } from "../../../../lib/getAuthToken";
import { createServerAxios } from "../../../../api/config/serverAxios";
import ProductDetailStream from "./_components/ProductDetailStream";
import RelatedProductsStream from "./_components/RelatedProductsStream";
import type { RawProductData } from "../../../../components/pages/shop/ShopDetailsContent";

interface ShopDetailsPageProps {
  params: Promise<{ lang: string; id: string }>;
}

const getProductDetails = unstable_cache(
  async (productId: string, lang: string): Promise<RawProductData | null> => {
    if (!productId) return null;
    try {
      const serverAxios = await createServerAxios({
        language: lang,
        token: null,
      });
      const response = await serverAxios.get(`/menu-items/${productId}`);
      if (!response?.data?.success || !response.data.data) return null;
      const data = response.data.data;
      return {
        item: data.item || data,
        optionGroups: data.option_groups || [],
        customizations: data.customizations || null,
      };
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  },
  ["product-detail"],
  { revalidate: 300 }
);

async function fetchPopularDishes(lang: string, token: string | null): Promise<unknown[]> {
  try {
    const serverAxios = await createServerAxios({ language: lang, token });
    let branchId = null;

    if (token) {
      try {
        const profileResponse = await serverAxios.get("/auth/profile");
        if (
          profileResponse?.data?.success &&
          profileResponse.data.data?.user?.branch_id
        ) {
          branchId = profileResponse.data.data.user.branch_id;
        }
      } catch (profileError) {
        console.warn(
          "Failed to fetch user profile, using default branch:",
          profileError
        );
      }
    }

    if (!branchId) {
      const defaultBranch = await serverAxios.get("/branches/default");
      branchId = defaultBranch?.data?.success
        ? defaultBranch.data.data?.branch?.id ||
          defaultBranch.data.data?.branch?.branch_id
        : null;
    }

    if (!branchId) return [];

    const response = await serverAxios.get("/menu-items/highlights", {
      params: { branch_id: branchId },
    });
    return response?.data?.success ? response.data.data?.popular || [] : [];
  } catch (error) {
    console.error("Error fetching popular dishes:", error);
    return [];
  }
}

const getPopularDishesCached = unstable_cache(
  async (lang: string) => fetchPopularDishes(lang, null),
  ["popular-dishes"],
  { revalidate: 300 }
);

export async function generateMetadata({ params }: ShopDetailsPageProps): Promise<Metadata> {
  const lang = await getLanguage();
  const resolvedParams = params instanceof Promise ? await params : params;
  const productId = resolvedParams?.id ? String(resolvedParams.id) : null;
  if (!productId) return { title: "Product Not Found" };

  const productData = await getProductDetails(productId, lang);
  if (!productData?.item) return { title: "Product Not Found" };

  const item = productData.item as Record<string, any>;
  const name =
    (lang === "en" ? item.name_en : item.name_bg) || item.name || "Product";
  const description =
    (lang === "en" ? item.description_en : item.description_bg) ||
    item.description ||
    "";
  const image = item.image_url || item.image || null;

  return {
    title: name,
    description: description || `${name} at Shahrayar Restaurant`,
    ...(image && {
      openGraph: { images: [{ url: image }] },
    }),
  };
}

export default async function ShopDetailsPage({ params }: ShopDetailsPageProps) {
  const lang = await getLanguage();
  const token = await getAuthToken();
  const resolvedParams = params instanceof Promise ? await params : params;
  const productId = resolvedParams?.id ? String(resolvedParams.id) : null;

  if (!productId) notFound();

  const productPromise = getProductDetails(productId, lang);
  const popularPromise = token
    ? fetchPopularDishes(lang, token)
    : getPopularDishesCached(lang);

  return (
    <div className="bg-bg3 min-h-screen">
      {/* ===== MAIN SECTION — renders immediately ===== */}
      <ErrorBoundary>
        <Suspense
          fallback={<SectionSkeleton variant="default" height="h-96" />}
        >
          <ProductDetailStream productPromise={productPromise} lang={lang} />
        </Suspense>
      </ErrorBoundary>

      {/* ===== SECONDARY SECTION — deferred via Suspense ===== */}
      <ErrorBoundary>
        <Suspense
          fallback={
            <SectionSkeleton variant="grid" cardCount={5} height="h-96" />
          }
        >
          <RelatedProductsStream popularPromise={popularPromise} lang={lang} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
