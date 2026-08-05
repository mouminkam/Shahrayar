"use client";
import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../ui/AnimatedSection";
import ErrorBoundary from "../../ui/ErrorBoundary";
import SectionSkeleton from "../../ui/SectionSkeleton";
import useAuthStore from "../../../store/authStore";
import api from "../../../api";
import { IMAGE_PATHS } from "../../../data/constants";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { OrderCardOrder, OrderCardItem } from "../profile/OrderCard";

// Lazy load orders component
const OrdersHistory = dynamic(
  () => import("../profile/OrdersHistory"),
  {
    loading: () => <SectionSkeleton variant="default" cardCount={5} height="h-96" />,
    ssr: false,
  }
);

interface RawOrderItem {
  id?: string | number;
  order_item_id?: string | number;
  item_name?: string;
  name?: string;
  item_price?: number | string;
  price?: number | string;
  quantity?: number;
  qty?: number;
  image?: string;
  menu_item?: { image_url?: string; image?: string; name?: string; price?: number | string };
  [key: string]: unknown;
}

interface RawOrder {
  id?: string | number;
  order_id?: string | number;
  created_at?: string;
  order_date?: string;
  date?: string;
  total_amount?: number | string;
  total?: number | string;
  status?: string;
  order_items?: RawOrderItem[];
  items?: RawOrderItem[];
  payment_method?: string;
  paymentMethod?: string;
  [key: string]: unknown;
}

interface Pagination {
  current_page?: number;
  last_page: number;
  per_page?: number;
  total?: number;
  links?: unknown;
}

export default function OrdersSection() {
  const { user } = useAuthStore();
  const { lang } = useLanguage();
  const [orders, setOrders] = useState<OrderCardOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Transform API order item to match OrderCard expected format
  const transformOrderItem = (item: RawOrderItem): OrderCardItem => {
    // Images will be proxied automatically by OptimizedImage component
    const imageUrl = item.menu_item?.image_url ||
                    item.menu_item?.image ||
                    item.image ||
                    IMAGE_PATHS.placeholder;

    return {
      id: item.id || item.order_item_id || String(item.id || ''),
      name: item.item_name || item.menu_item?.name || item.name || 'Unknown Item',
      image: imageUrl, // Will be proxied by OptimizedImage
      price: parseFloat(String(item.item_price || item.price || item.menu_item?.price || 0)),
      quantity: item.quantity || item.qty || 1,
    };
  };

  // Transform API order to match OrderCard expected format
  const transformOrder = (order: RawOrder): OrderCardOrder => {
    const items = (order.order_items || order.items || []).map(transformOrderItem);

    return {
      id: String(order.id || order.order_id || ''),
      date: order.created_at || order.order_date || order.date || new Date().toISOString(),
      total: parseFloat(String(order.total_amount || order.total || 0)),
      status: order.status || 'pending',
      items: items,
      paymentMethod: order.payment_method || order.paymentMethod || 'cash',
    };
  };

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const params = {
        page: currentPage,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      };
      const response = await api.orders.getUserOrders(params);

      if (response.success && response.data) {
        let ordersList: RawOrder[] = [];
        let paginationData: Pagination | null = null;

        const data = response.data as Record<string, unknown>;

        if (data.orders && (data.orders as Record<string, unknown>).data && Array.isArray((data.orders as Record<string, unknown>).data)) {
          const ordersObj = data.orders as Record<string, unknown>;
          ordersList = ordersObj.data as RawOrder[];
          paginationData = {
            current_page: ordersObj.current_page as number,
            last_page: ordersObj.last_page as number,
            per_page: ordersObj.per_page as number,
            total: ordersObj.total as number,
            links: ordersObj.links,
          };
        } else if (data.orders && Array.isArray(data.orders)) {
          ordersList = data.orders as RawOrder[];
        } else if (Array.isArray(data)) {
          ordersList = data as RawOrder[];
        } else if (data.data && Array.isArray(data.data)) {
          ordersList = data.data as RawOrder[];
        }

        const transformedOrders = Array.isArray(ordersList)
          ? ordersList.map(transformOrder)
          : [];

        setOrders(transformedOrders);
        setPagination(paginationData);
      } else {
        setOrders([]);
        setPagination(null);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setPagination(null);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchOrders();
  }, [user, statusFilter, currentPage, fetchOrders]);

  if (!user) {
    return null;
  }

  return (
    <section className="section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Status Filter Tabs */}
        <AnimatedSection>
          <div className="mb-8">
            <div className="bg-linear-to-br from-bgimg/90 via-bgimg to-bgimg/95 backdrop-blur-sm rounded-3xl shadow-2xl shadow-theme3/10 border border-white/10 p-2">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: t(lang, "all_orders") },
                  { value: 'pending', label: t(lang, "pending") },
                  { value: 'processing', label: t(lang, "processing") },
                  { value: 'completed', label: t(lang, "completed") },
                  { value: 'cancelled', label: t(lang, "cancelled") },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setStatusFilter(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl  text-sm font-semibold transition-all duration-300 ${
                      statusFilter === tab.value
                        ? 'bg-theme3 text-white shadow-lg'
                        : 'bg-white/5 text-text hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Orders List */}
        <ErrorBoundary>
          <AnimatedSection>
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-20 bg-bgimg rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme3"></div>
              </div>
            ) : (
              <>
                <OrdersHistory orders={orders} showViewAll={false} />

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(prev => Math.max(1, prev - 1));
                      }}
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
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
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
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(prev => Math.min(pagination.last_page, prev + 1));
                      }}
                      disabled={currentPage === pagination.last_page}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t(lang, "next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </AnimatedSection>
        </ErrorBoundary>
      </div>
    </section>
  );
}
