"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ShopSidebar from "./ShopSidebar";
import SortBar from "./SortBar";
import ProductCardSkeleton from "../../ui/ProductCardSkeleton";
import LazyProductCard from "../../ui/LazyProductCard";
import AnimatedSection from "../../ui/AnimatedSection";
import { useShopProducts } from "../../../hooks/useShopProducts";
import { ITEMS_PER_PAGE_GRID, ITEMS_PER_PAGE_LIST } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

interface ShopSectionProps {
  initialData?: unknown | null;
}

// MODIFIED: Phase B — SSR/CSR Migration (accepts server-fetched initialData)
export default function ShopSection({ initialData = null }: ShopSectionProps) {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const itemsPerPage = viewMode === "grid" ? ITEMS_PER_PAGE_GRID : ITEMS_PER_PAGE_LIST;

  const {
    products,
    isLoading,
    error,
    totalItems,
    pagination,
    currentPage,
    handlePageChange,
    refetch,
  } = useShopProducts(viewMode, initialData);

  // Handle view mode change
  const handleViewModeChange = (newViewMode: "grid" | "list") => {
    setViewMode(newViewMode);
  };

  return (
    <AnimatedSection mobileOptimized={true}>
      <section className="shop-section py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="shop-wrapper style1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            {/* Sort Bar */}
            <div className="mb-6 lg:mb-8">
              <SortBar
                totalItems={totalItems}
                currentPage={currentPage || 1}
                itemsPerPage={itemsPerPage}
                onViewChange={handleViewModeChange}
                viewMode={viewMode}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-3 order-1">
                <ShopSidebar />
              </aside>
              {/* Main Content */}
              <main className="lg:col-span-9 order-2 flex flex-col gap-6 lg:gap-8">
              {/* Products Grid/List */}
              <div className="w-full min-h-[400px]">
                {isLoading ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                      <ProductCardSkeleton viewMode="grid" count={itemsPerPage} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <ProductCardSkeleton viewMode="list" count={itemsPerPage} />
                    </div>
                  )
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-text text-lg mb-4">{error}</p>
                    <button
                      onClick={refetch}
                      className="px-6 py-2 bg-theme3 text-white rounded-lg hover:bg-theme transition-colors"
                    >
                      {t(lang, "try_again")}
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-text text-lg">{t(lang, "no_products_found")}</p>
                    {searchParams.get("search") && (
                      <p className="text-text text-sm mt-2">{t(lang, "try_adjusting_search_filters")}</p>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                      {products.map((product: any, index: number) => (
                        <LazyProductCard
                          key={product.id}
                          product={product}
                          viewMode="grid"
                          // Load first 4 cards immediately (above the fold)
                          options={index < 4 ? { rootMargin: "0px" } : {}}
                        />
                      ))}
                    </div>
                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {t(lang, "previous")}
                        </button>

                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                            let pageNum;
                            if (pagination.last_page <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= pagination.last_page - 2) {
                              pageNum = pagination.last_page - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                  currentPage === pageNum
                                    ? 'bg-theme3 text-white'
                                    : 'bg-white/5 text-text hover:bg-white/10'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(Math.min(pagination.last_page, currentPage + 1))}
                          disabled={currentPage === pagination.last_page}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {t(lang, "next")}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      {products.map((product: any, index: number) => (
                        <LazyProductCard
                          key={product.id}
                          product={product}
                          viewMode="list"
                          options={index < 2 ? { rootMargin: "0px" } : {}}
                        />
                      ))}
                    </div>
                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {t(lang, "previous")}
                        </button>

                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                            let pageNum;
                            if (pagination.last_page <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= pagination.last_page - 2) {
                              pageNum = pagination.last_page - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                  currentPage === pageNum
                                    ? 'bg-theme3 text-white'
                                    : 'bg-white/5 text-text hover:bg-white/10'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(Math.min(pagination.last_page, currentPage + 1))}
                          disabled={currentPage === pagination.last_page}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {t(lang, "next")}
                        </button>
                      </div>
                    )}
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
