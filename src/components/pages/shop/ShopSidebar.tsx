"use client";
import { memo, useCallback, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/ui/LocalizedLink";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import OptimizedImage from "../../ui/OptimizedImage";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { useShopSidebar } from "../../../hooks/useShopSidebar";
import { formatCurrency } from "../../../lib/utils/formatters";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import api from "../../../api";
import useBranchStore from "../../../store/branchStore";
import { transformMenuItemsToProducts } from "../../../lib/utils/productTransform";
import { useApiCache } from "../../../hooks/useApiCache";
import type { Product } from "@/types/shop";

const ShopSidebar = memo(function ShopSidebar() {
  const { push, replace } = useLocalizedRouter();
  const searchParams = useSearchParams();
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();
  const { getSelectedBranchId } = useBranchStore();
  const { getCachedOrFetch } = useApiCache("HIGHLIGHTS");

  const currentCategory = searchParams.get("category");

  // Use custom hook for sidebar data
  const {
    categories,
    isLoadingCategories,
  } = useShopSidebar();

  // Lazy load highlights - fetch only latest products for recent products section
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Fetch latest products when component mounts (shop page is already visible)
  useEffect(() => {
    const fetchLatest = async () => {
      const branchId = getSelectedBranchId();
      if (!branchId || latestProducts.length > 0 || isLoadingRecent) {
        return;
      }

      setIsLoadingRecent(true);
      try {
        const response = await getCachedOrFetch(
          "/menu-items/highlights",
          {},
          () => api.menu.getHighlights()
        );

        if (response?.success && response.data) {
          const latestItems = transformMenuItemsToProducts((response.data.latest as any[]) || [], lang);
          setLatestProducts(latestItems);
        }
      } catch (error) {
        console.error("Error fetching latest products:", error);
        setLatestProducts([]);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    fetchLatest();
  }, [getSelectedBranchId, getCachedOrFetch, lang, latestProducts.length, isLoadingRecent]);

  const recentProducts = latestProducts || [];

  // Auto-select first category if no category is selected
  useEffect(() => {
    if (!currentCategory && categories.length > 0) {
      const firstCategoryId = categories[0].id;
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", String(firstCategoryId));
      replace(`/shop?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory, categories, searchParams]);

  const handleCategoryClick = useCallback((categoryId: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", String(categoryId));
    }
    params.delete("page");
    push(`/shop?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Category button style
  const categoryBtnClass = (isActive: boolean) =>
    `inline-flex px-3 sm:px-4 py-2 sm:py-2.5 text-white text-xs sm:text-sm font-normal capitalize rounded-lg transition-all duration-300 hover:bg-theme3 hover:text-white active:scale-95 ${isActive ? "bg-theme3 text-white" : ""}`;

  return (
    <aside className="main-sidebar space-y-6 lg:space-y-8">
      {/* Categories */}
      <div className="bg-bgimg p-6 sm:p-8 rounded-2xl shadow-sm">
        <h5 className="text-white text-lg sm:text-xl font-bold relative pb-3 mb-6 capitalize">
          {t(lang, "categories")}
          <span className="absolute bottom-0 left-0 h-0.5 w-16 sm:w-20 bg-theme3"></span>
        </h5>
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-4">
            <p className="text-text text-sm">{t(lang, "loading_categories")}</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-text text-sm">{t(lang, "no_categories_available")}</p>
        ) : (
          <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <li key={category.id}>
                <button onClick={() => handleCategoryClick(category.id ?? "")} className={categoryBtnClass(currentCategory === String(category.id))}>
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Products - Desktop Only */}
      <div className="hidden lg:block w-full mt-8">
        <div className="bg-linear-to-br from-bgimg/80 via-bgimg to-bgimg/95 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-theme3/5 to-transparent opacity-20 pointer-events-none"></div>

          <h5 className="text-white text-lg lg:text-xl font-black relative pb-3 lg:pb-4 mb-6 lg:mb-8 capitalize text-center">
            <span className="relative z-10 bg-linear-to-r from-theme3 to-theme bg-clip-text text-transparent drop-shadow-lg">
              {t(lang, "recent_products")}
            </span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-16 lg:w-20 bg-linear-to-r from-theme to-theme3 rounded-full"></span>
          </h5>

          {isLoadingRecent ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-text text-sm">{t(lang, "loading")}</p>
            </div>
          ) : recentProducts.length === 0 ? (
            <p className="text-text text-sm text-center">{t(lang, "no_recent_products")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:gap-6 relative z-10">
              {recentProducts.map((product) => (
                <div key={product.id} className="group bg-linear-to-br from-white/5 via-bgimg to-black/90 backdrop-blur-md p-4 lg:p-5 rounded-2xl transition-all duration-500 relative overflow-hidden hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4">
                    <div className="relative w-full flex justify-center" onMouseEnter={() => prefetchRoute(`/shop/${product.id}`)}>
                      <div className="w-16 h-16 lg:w-18 lg:h-18 rounded-full">
                        <div className="w-full h-full rounded-full bg-bgimg/80 backdrop-blur-sm border border-white/10 group-hover:border-theme3/30 transition-all duration-500 flex items-center justify-center">
                          <OptimizedImage
                            src={product.image}
                            alt={product.title}
                            width={56}
                            height={56}
                            className="w-12 h-12 lg:w-14 lg:h-14 object-cover rounded-full transform group-hover:scale-110 transition-transform duration-500"
                            quality={85}
                            loading="lazy"
                            sizes="(max-width: 1024px) 48px, 56px"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 lg:space-y-3 flex-1 w-full">
                      <Link
                        href={`/shop/${product.id}`}
                        onMouseEnter={() => prefetchRoute(`/shop/${product.id}`)}
                        className="text-white text-sm lg:text-base font-extrabold hover:text-theme transition-all duration-300 block line-clamp-2 group-hover:-translate-y-px"
                      >
                        {product.title}
                      </Link>


                      <div className="flex flex-col items-center justify-center gap-2 lg:gap-3">
                        <span className="text-theme text-sm lg:text-base font-black bg-linear-to-r from-theme/10 to-theme3/10 px-2 lg:px-3 py-1 rounded-full">
                          {formatCurrency(product.price)}
                        </span>

                      <Link
                        href={`/shop/${product.id}`}
                        onMouseEnter={() => prefetchRoute(`/shop/${product.id}`)}
                        className="w-full bg-linear-to-r from-theme to-theme3 hover:from-theme3 hover:to-theme text-white text-xs lg:text-sm font-semibold py-1.5 lg:py-2 px-3 lg:px-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-theme3/30 text-center"
                        >
                        {t(lang, "order")}
                      </Link>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});

ShopSidebar.displayName = "ShopSidebar";

export default ShopSidebar;
