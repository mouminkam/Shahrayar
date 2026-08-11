"use client";
import { useState, useMemo } from "react";
import OptimizedImage from "../../ui/OptimizedImage";
import Link from "@/components/ui/LocalizedLink";
import SectionHeading from "../../ui/SectionHeading";
import { formatCurrency } from "../../../lib/utils/formatters";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import { transformCategories, transformMenuItemsToProducts } from "../../../lib/utils/productTransform";
import { categories as staticCategories, getItemsByCategory } from "@/content/menu";
import { IMAGE_PATHS } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { Locale } from "@/locales/i18n/config";
import type { Category, Product } from "@/types/shop";

interface FoodMenuSectionProps {
  lang?: Locale | null;
}

export default function FoodMenuSection({ lang: serverLang = null }: FoodMenuSectionProps) {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang: clientLang } = useLanguage();

  // Content is static and localized by the transforms below. Switching language
  // navigates to a different locale route, which re-renders this with new
  // props — so there's nothing to refetch and no hydration dance to manage.
  const lang = serverLang || clientLang;

  const categories: Category[] = useMemo(() => transformCategories(staticCategories, lang), [lang]);

  // State for active tab (category ID)
  const [activeTab, setActiveTab] = useState<number | string | null>(staticCategories[0]?.id ?? null);

  const menuItems: Product[] = useMemo(() => {
    if (!activeTab) return [];
    return transformMenuItemsToProducts(getItemsByCategory(activeTab).slice(0, 10), lang);
  }, [activeTab, lang]);

  return (
    <section className="food-menu-section fix section-padding py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="food-menu-wrapper style1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="food-menu-tab-wrapper">
            <SectionHeading
              chapter={5}
              eyebrow={t(lang, "food_menu")}
              title={t(lang, "fresheat_foods_menu")}
              className="mb-12 lg:mb-16"
            />

            {/* Tabs */}
            <div className="food-menu-tab mb-8">
              {categories.length > 0 ? (
                <ul className="nav nav-pills flex flex-wrap justify-center gap-4 mb-8" role="tablist">
                  {categories.map((category) => (
                    <li key={category.id} className="nav-item mb-10" role="presentation">
                      <button
                        className={`nav-link px-6 py-3 rounded-xl  text-base cursor-pointer font-medium transition-all duration-300 ${
                          activeTab === category.id
                            ? "bg-theme text-white"
                            : "text-white hover:bg-theme hover:text-white"
                        }`}
                        onClick={() => setActiveTab(category.id || null)}
                        type="button"
                        role="tab"
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-text py-8">
                  <p>No categories available</p>
                </div>
              )}

              {/* Tab Content */}
              <div className="tab-content sm:px-20">
                {menuItems.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {menuItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/shop/${item.id}`}
                        onMouseEnter={() => prefetchRoute(`/shop/${item.id}`)}
                        className="single-menu-items border-2 border-bgimg flex items-center gap-6 p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <div className="menu-item-thumb shrink-0">
                          <OptimizedImage
                            src={item.image || IMAGE_PATHS.placeholder}
                            alt={item.title}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-full"
                            quality={85}
                            loading="lazy"
                            sizes="96px"
                          />
                        </div>
                        <div className="menu-content flex-1">
                          <h2 className="text-white  text-lg font-bold mb-2 hover:text-theme transition-colors duration-300">
                            {item.title}
                          </h2>
                          <p className="text-text  text-sm line-clamp-2">{item.description || "Delicious food item"}</p>
                        </div>
                        <p className="text-theme  text-xl font-bold shrink-0">{formatCurrency(item.price)}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-text py-12">
                    <p>{t(lang, "no_items_available_category")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
