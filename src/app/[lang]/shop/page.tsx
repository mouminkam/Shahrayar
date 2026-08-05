// MODIFIED: Phase C — Page Splitting
import { Suspense } from "react";
import type { Metadata } from "next";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import { getLanguage } from "../../../lib/getLanguage";
import { createServerAxios } from "../../../api/config/serverAxios";
import ShopHeader from "./_components/ShopHeader";
import ShopProductsSection from "./_components/ShopProductsSection";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our delicious menu of authentic Middle Eastern dishes. Order your favorite meals online for delivery or pickup.",
  keywords: [
    "menu",
    "food",
    "order online",
    "delivery",
    "pickup",
    "Middle Eastern cuisine",
  ],
};

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const lang = await getLanguage();

  const resolvedParams = await searchParams;
  const categoryId = resolvedParams?.category;
  let initialData = null;

  if (categoryId) {
    try {
      const serverAxios = await createServerAxios();
      const params: Record<string, string | number> = {
        category_id: categoryId as string,
        page: (resolvedParams?.page as string) || 1,
        limit: 12,
      };
      if (resolvedParams?.search) params.search = resolvedParams.search as string;
      if (resolvedParams?.sort && resolvedParams.sort !== "menu_order")
        params.sort_by = resolvedParams.sort as string;
      const response = await serverAxios.get("/menu-items", { params });
      initialData = response?.data || response;
    } catch {
      // Client will refetch via useShopProducts
    }
  }

  return (
    <div className="bg-bg3 min-h-screen">
      {/* ===== MAIN SECTION — renders immediately ===== */}
      <ShopHeader lang={lang} />

      {/* ===== SECONDARY SECTION — deferred via Suspense ===== */}
      <ErrorBoundary>
        <Suspense
          fallback={
            <SectionSkeleton
              variant="grid"
              cardCount={12}
              height="h-screen"
            />
          }
        >
          <ShopProductsSection initialData={initialData} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
