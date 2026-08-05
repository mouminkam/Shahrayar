"use client";
import { useState, useEffect, useCallback } from "react";
import OptimizedImage from "../../ui/OptimizedImage";
import Link from "@/components/ui/LocalizedLink";
import { formatCurrency } from "../../../lib/utils/formatters";
import { usePrefetchRoute } from "../../../hooks/usePrefetchRoute";
import api from "../../../api";
import useBranchStore from "../../../store/branchStore";
import { transformCategories, transformMenuItemsToProducts } from "../../../lib/utils/productTransform";
import { extractMenuItemsFromResponse, extractCategoriesFromResponse } from "../../../lib/utils/responseExtractor";
import { IMAGE_PATHS } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import { useInView } from "react-intersection-observer";
import type { Locale } from "@/locales/i18n/config";
import type { Category, Product } from "@/types/shop";

interface FoodMenuSectionProps {
  lang?: Locale | null;
}

export default function FoodMenuSection({ lang: serverLang = null }: FoodMenuSectionProps) {
  const { prefetchRoute } = usePrefetchRoute();
  const { selectedBranch, getSelectedBranchId, initialize } = useBranchStore();
  const { lang: clientLang } = useLanguage();
  const [lang, setLang] = useState<string>(serverLang || clientLang || "bg");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && clientLang) {
      setLang(clientLang);
    }
  }, [clientLang, isHydrated]);

  // Intersection Observer - Defer API calls until section is visible
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px", // Start loading 200px before section is visible
    triggerOnce: true,
  });

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // State for menu items
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // State for active tab (category ID)
  const [activeTab, setActiveTab] = useState<number | string | null>(null);

  // Initialize branch if not loaded
  useEffect(() => {
    if (!selectedBranch) {
      initialize();
    }
  }, [selectedBranch, initialize]);

  // Fetch categories from API - Only when section is in view
  useEffect(() => {
    if (!inView) {
      return; // Don't fetch until section is visible
    }

    const fetchCategories = async () => {
      if (!selectedBranch) {
        setIsLoadingCategories(false);
        return;
      }

      setIsLoadingCategories(true);
      try {
        const response = await api.menu.getMenuCategories();
        const categoriesData = extractCategoriesFromResponse(response);
        const transformed = transformCategories(categoriesData, lang);
        setCategories(transformed);

        // Set first category as active tab if no active tab is set
        if (transformed.length > 0) {
          setActiveTab((prev) => prev || transformed[0].id || null);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [selectedBranch, lang, inView]);

  // Fetch menu items when activeTab (category) changes
  const fetchMenuItems = useCallback(
    async (categoryId: number | string) => {
      const branchId = getSelectedBranchId();
      if (!branchId || !categoryId) {
        setMenuItems([]);
        return;
      }

      setIsLoadingItems(true);
      try {
        const response = await api.menu.getMenuItems({
          branch_id: branchId,
          category_id: categoryId,
          limit: 10,
        });

        const { menuItems: items } = extractMenuItemsFromResponse(response);
        const transformed = transformMenuItemsToProducts(items, lang);
        setMenuItems(transformed);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([]);
      } finally {
        setIsLoadingItems(false);
      }
    },
    [getSelectedBranchId, lang]
  );

  // Fetch menu items when activeTab changes
  useEffect(() => {
    if (activeTab) {
      fetchMenuItems(activeTab);
    }
  }, [activeTab, fetchMenuItems]);

  return (
    <section ref={ref} className="food-menu-section fix section-padding py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="food-menu-wrapper style1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="food-menu-tab-wrapper">
            {/* Title Area */}
            <div className="title-area text-center mb-12 lg:mb-16">
              <div className="sub-title text-theme3  text-2xl font-bold uppercase mb-4 flex items-center justify-center gap-2">
                {t(lang, "food_menu")}
              </div>
              <h2 className="title text-white  text-3xl sm:text-4xl lg:text-5xl font-black">
                {t(lang, "fresheat_foods_menu")}
              </h2>
            </div>

            {/* Tabs */}
            <div className="food-menu-tab mb-8">
              {isLoadingCategories ? (
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-32 bg-bgimg rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : categories.length > 0 ? (
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
                {isLoadingItems ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="single-menu-items border-2 border-bgimg flex items-center gap-6 p-4 rounded-2xl">
                        <div className="w-24 h-24 bg-bgimg rounded-full animate-pulse shrink-0" />
                        <div className="flex-1">
                          <div className="h-5 bg-bgimg rounded mb-2 w-3/4 animate-pulse" />
                          <div className="h-4 bg-bgimg rounded w-1/2 animate-pulse" />
                        </div>
                        <div className="w-20 h-6 bg-bgimg rounded animate-pulse shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : menuItems.length > 0 ? (
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
                            quality={75}
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
