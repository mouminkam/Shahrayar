# دليل بنية الصفحات - Page Structure Guide

## نظرة عامة

هذا الدليل يشرح آلية التقسيم المتبعة في المشروع لتنظيم صفحات Next.js. الهدف هو توحيد البنية وجعل الكود سهل الصيانة والتطوير.

## المبادئ الأساسية

### 1. فصل الاهتمامات (Separation of Concerns)
- **الصفحات (`src/app/`)**: بسيطة جداً، فقط تستدعي المكونات الرئيسية
- **المكونات (`src/components/pages/`)**: تحتوي على منطق العرض والتفاعل
- **Hooks (`src/hooks/`)**: تحتوي على منطق الأعمال (business logic)

### 2. Lazy Loading
- استخدام `dynamic import` لتحميل المكونات الثقيلة فقط عند الحاجة
- تحسين أداء التطبيق وتقليل حجم bundle الأولي

### 3. Error Handling
- استخدام `ErrorBoundary` للتعامل مع الأخطاء بشكل أنيق
- منع تعطل التطبيق بالكامل عند حدوث خطأ في مكون واحد

### 4. Loading States
- استخدام `Suspense` مع fallback مناسب
- تحسين تجربة المستخدم أثناء التحميل

## البنية الموصى بها

```
src/
├── app/                          # Next.js App Router Pages
│   ├── [route]/
│   │   └── page.jsx              # صفحة بسيطة تستدعي المكون الرئيسي
│   └── [route]/
│       └── [id]/
│           └── page.jsx          # صفحة بسيطة تستدعي المكون الرئيسي
│
├── components/
│   └── pages/                    # مكونات الصفحات
│       └── [route]/
│           ├── [Route]Section.jsx        # المكون الرئيسي للصفحة
│           ├── [Route]Header.jsx         # رأس الصفحة (اختياري)
│           ├── [Route]Content.jsx        # محتوى الصفحة (اختياري)
│           └── [Route]Summary.jsx        # ملخص الصفحة (اختياري)
│
└── hooks/                        # Custom Hooks
    └── use[Route]Details.js       # Hook لجلب البيانات
    └── use[Route]Actions.js      # Hook للإجراءات
```

## النمط الموحد للصفحات

### نمط 1: الصفحات العامة (Public Pages)

**مثال: `src/app/shop/page.jsx`**

```jsx
"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../components/ui/AnimatedSection";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../components/ui/SectionSkeleton";
import Breadcrumb from "../../components/ui/Breadcrumb";
import PageSEO from "../../components/seo/PageSEO";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";

// Lazy load المكون الرئيسي - Heavy component with API calls
const ShopSection = dynamic(
  () => import("../../components/pages/shop/ShopSection"),
  {
    loading: () => <SectionSkeleton variant="grid" cardCount={12} height="h-screen" />,
    ssr: false,
  }
);

export default function ShopPage() {
  const { lang } = useLanguage();
  
  return (
    <div className="bg-bg3 min-h-screen">
      <PageSEO
        title="Shop - Browse Our Menu"
        description="Browse our delicious menu..."
        url="/shop"
        keywords={["menu", "food", "order online"]}
      />
      <AnimatedSection>
        <Breadcrumb title={t(lang, "shop")} />
      </AnimatedSection>
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={12} height="h-screen" />}>
          <ShopSection />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

**الميزات المستخدمة:**
- ✅ `dynamic import` للمكون الرئيسي
- ✅ `Suspense` مع fallback مناسب
- ✅ `ErrorBoundary` للتعامل مع الأخطاء
- ✅ `Breadcrumb` للتنقل
- ✅ `PageSEO` لتحسين محركات البحث
- ✅ `AnimatedSection` للحركات

### نمط 2: صفحات التفاصيل (Detail Pages)

**مثال: `src/app/shop/[id]/page.jsx`**

```jsx
"use client";
import { use, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

// Lazy load heavy components
const ShopDetailsContent = dynamic(
  () => import("../../../components/pages/shop/ShopDetailsContent"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
    ssr: false,
  }
);

export default function ShopDetailsPage({ params }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const resolvedParams = use(params);
  const productId = resolvedParams?.id ? String(resolvedParams.id) : null;

  if (!productId) {
    return (
      <div className="bg-bg3 min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-text text-lg mb-4">{t(lang, "invalid_product_id")}</p>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-2 bg-theme3 text-white rounded-lg hover:bg-theme transition-colors"
          >
            {t(lang, "back_to_shop")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg3 min-h-screen">
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" height="h-96" />}>
          <AnimatedSection>
            <ShopDetailsContent productId={productId} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

**الميزات المستخدمة:**
- ✅ استخدام `use()` hook لـ params في Next.js 15+
- ✅ التحقق من صحة المعاملات
- ✅ معالجة الحالات الخاصة (invalid ID)
- ✅ `dynamic import` للمكون الرئيسي
- ✅ `Suspense` و `ErrorBoundary`

### نمط 3: صفحات المصادقة (Auth Pages)

**مثال: `src/app/login/page.jsx`**

```jsx
"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../components/ui/AnimatedSection";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../components/ui/SectionSkeleton";
import GuestOnly from "../../components/auth/GuestOnly";

// Lazy load LoginSection - Heavy component with API calls
const LoginSection = dynamic(
  () => import("../../components/pages/login/LoginSection"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
    ssr: false,
  }
);

export default function LoginPage() {
  return (
    <GuestOnly>
      <div className="bg-bg3 min-h-screen">
        <section className="login-section section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-2xl mx-auto">
              <ErrorBoundary>
                <Suspense fallback={<SectionSkeleton variant="default" height="h-96" />}>
                  <AnimatedSection>
                    <LoginSection />
                  </AnimatedSection>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </section>
      </div>
    </GuestOnly>
  );
}
```

**الميزات المستخدمة:**
- ✅ `GuestOnly` wrapper لمنع المستخدمين المسجلين من الوصول
- ✅ `dynamic import` للمكون الرئيسي
- ✅ `Suspense` و `ErrorBoundary`
- ❌ لا يوجد `Breadcrumb` (صفحات المصادقة عادة لا تحتاجها)

### نمط 4: الصفحات المحمية (Protected Pages)

**مثال: `src/app/checkout/page.jsx`**

```jsx
"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../components/ui/AnimatedSection";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../components/ui/SectionSkeleton";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Protected from "../../components/auth/Protected";
import PageSEO from "../../components/seo/PageSEO";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";

// Lazy load CheckoutSection - Heavy component with API calls
const CheckoutSection = dynamic(
  () => import("../../components/pages/checkout/CheckoutSection"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-screen" />,
    ssr: false,
  }
);

export default function CheckoutPage() {
  const { lang } = useLanguage();
  
  return (
    <Protected>
      <PageSEO
        title="Checkout - Complete Your Order"
        description="Complete your order..."
        url="/checkout"
        keywords={["checkout", "order", "payment"]}
      />
      <div className="bg-bg3 min-h-screen">
        <AnimatedSection>
          <Breadcrumb title={t(lang, "checkout")} />
        </AnimatedSection>
        <ErrorBoundary>
          <Suspense fallback={<SectionSkeleton variant="default" height="h-screen" />}>
            <CheckoutSection />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Protected>
  );
}
```

**الميزات المستخدمة:**
- ✅ `Protected` wrapper للتحقق من تسجيل الدخول
- ✅ `Breadcrumb` للتنقل
- ✅ `PageSEO` لتحسين محركات البحث
- ✅ `dynamic import`, `Suspense`, `ErrorBoundary`

## تقسيم المكونات المعقدة

### عندما تكون الصفحة معقدة (مثل Orders Details)

**البنية الموصى بها:**

```
src/app/orders/[id]/
└── page.jsx                    # صفحة بسيطة جداً

src/components/pages/orders/
├── OrderDetailsContent.jsx     # المكون الرئيسي
├── OrderHeader.jsx             # رأس الطلب
├── OrderItems.jsx              # قائمة العناصر
├── OrderActions.jsx            # أزرار الإجراءات
├── OrderSummary.jsx            # ملخص الطلب
└── CancelOrderModal.jsx        # نافذة الإلغاء

src/hooks/
├── useOrderDetails.js          # Hook لجلب تفاصيل الطلب
└── useOrderActions.js          # Hook لإجراءات الطلب
```

**مثال: `src/components/pages/orders/OrderDetailsContent.jsx`**

```jsx
"use client";
import { useRouter } from "next/navigation";
import { useOrderDetails } from "../../../hooks/useOrderDetails";
import { useOrderActions } from "../../../hooks/useOrderActions";
import AnimatedSection from "../../ui/AnimatedSection";
import OrderHeader from "./OrderHeader";
import OrderItems from "./OrderItems";
import OrderActions from "./OrderActions";
import OrderSummary from "./OrderSummary";
import CancelOrderModal from "./CancelOrderModal";

export default function OrderDetailsContent({ orderId }) {
  const router = useRouter();
  const { order, isLoading, error, refetch } = useOrderDetails(orderId);
  const {
    canCancelOrder,
    handleCancelOrder,
    handleReorder,
    handleTrackOrder,
    isCancelling,
    isReorderLoading,
    showCancelModal,
    setShowCancelModal,
    cancelReason,
    setCancelReason,
  } = useOrderActions(order, orderId, refetch);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !order) {
    return <ErrorState error={error} />;
  }

  const orderItems = order.order_items || order.items || [];

  return (
    <section className="section-padding fix bg-bg3 py-12 px-1 sm:px-5 sm:py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection>
              <OrderHeader order={order} />
            </AnimatedSection>
            
            <AnimatedSection>
              <OrderItems orderItems={orderItems} order={order} />
              <OrderActions
                order={order}
                canCancelOrder={canCancelOrder}
                onReorder={handleReorder}
                onCancel={() => setShowCancelModal(true)}
                onTrack={handleTrackOrder}
                isReorderLoading={isReorderLoading}
              />
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AnimatedSection>
              <OrderSummary order={order} />
            </AnimatedSection>
          </div>
        </div>
      </div>

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
        }}
        onConfirm={handleCancelOrder}
        isLoading={isCancelling}
      />
    </section>
  );
}
```

## Custom Hooks

### Hook لجلب البيانات

**مثال: `src/hooks/useOrderDetails.js`**

```jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import api from "../api";
import useToastStore from "../store/toastStore";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../locales/i18n/getTranslation";

/**
 * Hook to fetch and manage order details
 * @param {string} orderId - Order ID
 * @returns {Object} Order data, loading state, error, and refetch function
 */
export function useOrderDetails(orderId) {
  const { error: toastError } = useToastStore();
  const { lang } = useLanguage();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError("Order ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.orders.getOrderById(orderId);
      
      if (response.success && response.data) {
        const orderData = response.data.order || response.data;
        
        if (!orderData || !orderData.id) {
          const errorMsg = t(lang, "failed_to_load_order_details");
          setError(errorMsg);
          toastError(errorMsg);
          return;
        }
        
        setOrder(orderData);
      } else {
        const errorMsg = response?.message || t(lang, "failed_to_load_order_details");
        setError(errorMsg);
        toastError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err?.message || t(lang, "failed_to_load_order_details");
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toastError, lang]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  return {
    order,
    isLoading,
    error,
    refetch: fetchOrderDetails,
  };
}
```

### Hook للإجراءات

**مثال: `src/hooks/useOrderActions.js`**

```jsx
"use client";
import { useState } from "react";
import api from "../api";
import useToastStore from "../store/toastStore";
import { useLanguage } from "../context/LanguageContext";
import { t } from "../locales/i18n/getTranslation";

/**
 * Hook to manage order actions (cancel, reorder, track)
 * @param {Object} order - Order object
 * @param {string} orderId - Order ID
 * @param {Function} refetchOrder - Function to refetch order data
 * @returns {Object} Actions and states
 */
export function useOrderActions(order, orderId, refetchOrder) {
  const { error: toastError, success: toastSuccess } = useToastStore();
  const { lang } = useLanguage();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isReorderLoading, setIsReorderLoading] = useState(false);

  const canCancelOrder = () => {
    // Logic to check if order can be cancelled
    // ...
  };

  const handleCancelOrder = async (reason = null) => {
    // Logic to cancel order
    // ...
  };

  const handleReorder = async () => {
    // Logic to reorder
    // ...
  };

  const handleTrackOrder = () => {
    // Logic to track order
    // ...
  };

  return {
    canCancelOrder,
    handleCancelOrder,
    handleReorder,
    handleTrackOrder,
    isCancelling,
    isReorderLoading,
    showCancelModal,
    setShowCancelModal,
    cancelReason,
    setCancelReason,
  };
}
```

## الميزات المستخدمة بالتفصيل

### 1. Dynamic Import

**الهدف:** تحميل المكونات فقط عند الحاجة، تحسين الأداء

**الاستخدام:**
```jsx
const ComponentSection = dynamic(
  () => import("../../components/pages/shop/ShopSection"),
  {
    loading: () => <SectionSkeleton variant="grid" cardCount={12} height="h-screen" />,
    ssr: false, // تعطيل Server-Side Rendering للمكون
  }
);
```

**متى نستخدمه:**
- ✅ المكونات الثقيلة (heavy components)
- ✅ المكونات التي تحتوي على API calls
- ✅ المكونات التي تستخدم مكتبات ثقيلة
- ❌ المكونات البسيطة والصغيرة

### 2. Suspense

**الهدف:** عرض حالة التحميل أثناء جلب البيانات

**الاستخدام:**
```jsx
<Suspense fallback={<SectionSkeleton variant="default" height="h-screen" />}>
  <ComponentSection />
</Suspense>
```

**Fallback Options:**
- `SectionSkeleton` - Skeleton loader مخصص
- `Loader2` - Spinner من lucide-react
- Custom loading component

### 3. ErrorBoundary

**الهدف:** منع تعطل التطبيق بالكامل عند حدوث خطأ

**الاستخدام:**
```jsx
<ErrorBoundary>
  <Suspense fallback={<SectionSkeleton />}>
    <ComponentSection />
  </Suspense>
</ErrorBoundary>
```

**الميزات:**
- يعرض رسالة خطأ أنيقة
- يمنع تعطل التطبيق
- يمكن إعادة المحاولة

### 4. Breadcrumb

**الهدف:** تحسين تجربة التنقل والـ SEO

**الاستخدام:**
```jsx
<AnimatedSection>
  <Breadcrumb title={t(lang, "page_title")} />
</AnimatedSection>
```

**متى نستخدمه:**
- ✅ الصفحات العامة (shop, about-us, contact-us)
- ✅ الصفحات المحمية (checkout, cart, profile)
- ❌ صفحات المصادقة (login, register)
- ❌ صفحات الخطأ (404, 500)

### 5. PageSEO

**الهدف:** تحسين محركات البحث

**الاستخدام:**
```jsx
<PageSEO
  title="Shop - Browse Our Menu"
  description="Browse our delicious menu..."
  url="/shop"
  keywords={["menu", "food", "order online"]}
/>
```

**متى نستخدمه:**
- ✅ الصفحات العامة المهمة
- ✅ صفحات المنتجات
- ✅ صفحات المحتوى

### 6. AnimatedSection

**الهدف:** إضافة حركات سلسة للعناصر

**الاستخدام:**
```jsx
<AnimatedSection>
  <Component />
</AnimatedSection>
```

## قواعد التسمية

### الصفحات (`src/app/`)
- `page.jsx` - الصفحة الرئيسية
- `[id]/page.jsx` - صفحة التفاصيل
- `[id]/success/page.jsx` - صفحة النجاح

### المكونات (`src/components/pages/`)
- `[Route]Section.jsx` - المكون الرئيسي للصفحة
- `[Route]Content.jsx` - محتوى الصفحة
- `[Route]Header.jsx` - رأس الصفحة
- `[Route]Summary.jsx` - ملخص الصفحة
- `[Route]Actions.jsx` - أزرار الإجراءات
- `[Route]Modal.jsx` - نافذة منبثقة

### Hooks (`src/hooks/`)
- `use[Route]Details.js` - Hook لجلب البيانات
- `use[Route]Actions.js` - Hook للإجراءات
- `use[Route]Data.js` - Hook للبيانات العامة

## أفضل الممارسات

### ✅ افعل (Do)

1. **استخدم dynamic import للمكونات الثقيلة**
   ```jsx
   const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
     loading: () => <Skeleton />,
     ssr: false,
   });
   ```

2. **فصل المنطق في Hooks**
   ```jsx
   // ❌ سيء
   const [data, setData] = useState(null);
   useEffect(() => {
     fetchData().then(setData);
   }, []);

   // ✅ جيد
   const { data, isLoading, error } = useDataDetails(id);
   ```

3. **استخدم ErrorBoundary و Suspense**
   ```jsx
   <ErrorBoundary>
     <Suspense fallback={<Skeleton />}>
       <Component />
     </Suspense>
   </ErrorBoundary>
   ```

4. **اجعل الصفحات بسيطة**
   ```jsx
   // ✅ صفحة بسيطة
   export default function Page() {
     return (
       <ErrorBoundary>
         <Suspense fallback={<Skeleton />}>
           <ComponentSection />
         </Suspense>
       </ErrorBoundary>
     );
   }
   ```

5. **قسّم المكونات المعقدة**
   ```jsx
   // ✅ تقسيم جيد
   <OrderDetailsContent>
     <OrderHeader />
     <OrderItems />
     <OrderActions />
     <OrderSummary />
   </OrderDetailsContent>
   ```

### ❌ لا تفعل (Don't)

1. **لا تضع منطق معقد في الصفحة**
   ```jsx
   // ❌ سيء
   export default function Page() {
     const [data, setData] = useState(null);
     useEffect(() => {
       // 100 سطر من المنطق
     }, []);
     return <div>...</div>;
   }
   ```

2. **لا تستخدم dynamic import للمكونات الصغيرة**
   ```jsx
   // ❌ سيء
   const SmallButton = dynamic(() => import("./SmallButton"));

   // ✅ جيد
   import SmallButton from "./SmallButton";
   ```

3. **لا تنس ErrorBoundary**
   ```jsx
   // ❌ سيء
   <Component />

   // ✅ جيد
   <ErrorBoundary>
     <Component />
   </ErrorBoundary>
   ```

4. **لا تضع كل شيء في مكون واحد**
   ```jsx
   // ❌ سيء - مكون 1000 سطر
   export default function HugeComponent() {
     // كل شيء هنا
   }

   // ✅ جيد - تقسيم منطقي
   <Component>
     <Header />
     <Content />
     <Footer />
   </Component>
   ```

## أمثلة كاملة

### مثال 1: صفحة بسيطة (Shop)

**`src/app/shop/page.jsx`**
```jsx
"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import AnimatedSection from "../../components/ui/AnimatedSection";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../components/ui/SectionSkeleton";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";

const ShopSection = dynamic(
  () => import("../../components/pages/shop/ShopSection"),
  {
    loading: () => <SectionSkeleton variant="grid" cardCount={12} height="h-screen" />,
    ssr: false,
  }
);

export default function ShopPage() {
  const { lang } = useLanguage();
  
  return (
    <div className="bg-bg3 min-h-screen">
      <AnimatedSection>
        <Breadcrumb title={t(lang, "shop")} />
      </AnimatedSection>
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="grid" cardCount={12} height="h-screen" />}>
          <ShopSection />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### مثال 2: صفحة معقدة (Orders Details)

**`src/app/orders/[id]/page.jsx`**
```jsx
"use client";
import { use, Suspense } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedSection from "../../../components/ui/AnimatedSection";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";

const OrderDetailsContent = dynamic(
  () => import("../../../components/pages/orders/OrderDetailsContent"),
  {
    loading: () => <SectionSkeleton variant="default" height="h-96" />,
    ssr: false,
  }
);

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const resolvedParams = use(params);
  const orderId = resolvedParams?.id ? String(resolvedParams.id) : null;

  if (!orderId) {
    return (
      <div className="bg-bg3 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <p className="text-text text-lg">{t(lang, "invalid_order_id")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg3 min-h-screen">
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" height="h-96" />}>
          <AnimatedSection>
            <OrderDetailsContent orderId={orderId} />
          </AnimatedSection>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

**`src/components/pages/orders/OrderDetailsContent.jsx`**
```jsx
"use client";
import { useOrderDetails } from "../../../hooks/useOrderDetails";
import { useOrderActions } from "../../../hooks/useOrderActions";
import OrderHeader from "./OrderHeader";
import OrderItems from "./OrderItems";
import OrderActions from "./OrderActions";
import OrderSummary from "./OrderSummary";
import CancelOrderModal from "./CancelOrderModal";

export default function OrderDetailsContent({ orderId }) {
  const { order, isLoading, error, refetch } = useOrderDetails(orderId);
  const actions = useOrderActions(order, orderId, refetch);

  if (isLoading) return <LoadingState />;
  if (error || !order) return <ErrorState error={error} />;

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <OrderHeader order={order} />
            <OrderItems orderItems={order.order_items} order={order} />
            <OrderActions order={order} {...actions} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary order={order} />
          </div>
        </div>
      </div>
      <CancelOrderModal {...actions} />
    </section>
  );
}
```

## الخلاصة

### الخطوات المتبعة عند إنشاء صفحة جديدة:

1. **إنشاء الصفحة في `src/app/[route]/page.jsx`**
   - صفحة بسيطة جداً
   - تستخدم dynamic import
   - تستخدم Suspense و ErrorBoundary
   - تضيف Breadcrumb إذا لزم الأمر

2. **إنشاء المكون الرئيسي في `src/components/pages/[route]/[Route]Section.jsx`**
   - يحتوي على منطق العرض
   - يستخدم Hooks لجلب البيانات

3. **إنشاء Hooks في `src/hooks/`**
   - `use[Route]Details.js` للبيانات
   - `use[Route]Actions.js` للإجراءات

4. **تقسيم المكونات المعقدة**
   - Header, Content, Summary, Actions, Modals

### الفوائد:

- ✅ كود منظم وسهل الصيانة
- ✅ أداء أفضل (lazy loading)
- ✅ تجربة مستخدم أفضل (loading states, error handling)
- ✅ قابلية إعادة الاستخدام (Hooks, Components)
- ✅ سهولة الاختبار (مكونات منفصلة)

---

**ملاحظة:** هذا الدليل يجب أن يكون مرجعاً عند إنشاء أي صفحة جديدة في المشروع. اتبع نفس النمط للحفاظ على الاتساق.
