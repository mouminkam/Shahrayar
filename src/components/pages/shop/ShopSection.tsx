"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ShopSidebar from "./ShopSidebar";
import SortBar from "./SortBar";
import LazyProductCard from "../../ui/LazyProductCard";
import AnimatedSection from "../../ui/AnimatedSection";
import { useStaticShopProducts } from "../../../hooks/useStaticShopProducts";
import { ITEMS_PER_PAGE_GRID, ITEMS_PER_PAGE_LIST } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { RawMenuItem, RawCategory } from "../../../lib/utils/productTransform";

interface ShopSectionProps {
  allItems: RawMenuItem[];
  allCategories: RawCategory[];
}

/**
 * Shop grid. Receives the full static catalog from the server component and
 * filters it in the browser — no loading or error branches are needed here
 * because there is no request that can be pending or fail.
 */
export default function ShopSection({ allItems, allCategories }: ShopSectionProps) {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const itemsPerPage = viewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;
  const { products, totalItems, currentPage, totalPages, handlePageChange } = useStaticShopProducts(
    allItems,
    viewMode
  );

  const renderPagination = () =>
    totalPages > 1 && (
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {t(lang, "previous")}
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  currentPage === pageNum ? "bg-theme3 text-white" : "bg-white/5 text-text hover:bg-white/10"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {t(lang, "next")}
        </button>
      </div>
    );

  return (
    <AnimatedSection mobileOptimized={true}>
      <section className="shop-section py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="shop-wrapper style1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="mb-6 lg:mb-8">
              <SortBar
                totalItems={totalItems}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onViewChange={setViewMode}
                viewMode={viewMode}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <aside className="lg:col-span-3 order-1">
                <ShopSidebar categories={allCategories} />
              </aside>

              <main className="lg:col-span-9 order-2 flex flex-col gap-6 lg:gap-8">
                <div className="w-full min-h-[400px]">
                  {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <p className="text-text text-lg">{t(lang, "no_products_found")}</p>
                      {searchParams.get("search") && (
                        <p className="text-text text-sm mt-2">{t(lang, "try_adjusting_search_filters")}</p>
                      )}
                    </div>
                  ) : viewMode === "grid" ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                        {products.map((product, index) => (
                          <LazyProductCard
                            key={product.id}
                            product={product as never}
                            viewMode="grid"
                            options={index < 4 ? { rootMargin: "0px" } : {}}
                          />
                        ))}
                      </div>
                      {renderPagination()}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4">
                        {products.map((product, index) => (
                          <LazyProductCard
                            key={product.id}
                            product={product as never}
                            viewMode="list"
                            options={index < 2 ? { rootMargin: "0px" } : {}}
                          />
                        ))}
                      </div>
                      {renderPagination()}
                    </>
                  )}
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
