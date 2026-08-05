# تحليل تدفق البيانات لصفحة HOME

## نظرة عامة على البنية

صفحة HOME (`src/app/page.jsx`) تتكون من 8 أقسام رئيسية، كل قسم له طريقة خاصة في جلب وعرض البيانات:

1. **BannerSection** - قسم البانر الرئيسي
2. **LatestItemsSection** - أحدث المنتجات
3. **OfferCards** - بطاقات العروض
4. **AboutUsSection** - قسم من نحن
5. **PopularDishes** - الأطباق الشائعة
6. **FoodMenuSection** - قائمة الطعام
7. **ChefSpecialSection** - توصيات الشيف
8. **ChefeSection** - قسم الشيفات

---

## مخطط تدفق البيانات العام

```mermaid
flowchart TD
    A[Page Load] --> B[Branch Store Initialize]
    B --> C[HighlightsContext Provider]
    C --> D[Single API Call: /menu-items/highlights]
    D --> E[Split Data: popular, latest, chefSpecial]
    B --> F[BannerSection]
    F --> G[API Call: /website-slides]
    B --> H[Lazy Load Sections]
    H --> I[LatestItemsSection - uses latest from Context]
    H --> J[PopularDishes - uses popular from Context]
    H --> K[ChefSpecialSection - uses chefSpecial from Context]
    H --> L[OfferCards - uses website-slides]
    H --> M[FoodMenuSection - Fetch categories then items]
    H --> N[ChefeSection - Fetch chefs]
    H --> O[AboutUsSection - Static content]
```

---

## 1. BannerSection (قسم البانر)

**الملف:** `src/components/pages/home/BannerSection.jsx`

### مخطط تدفق البيانات

```mermaid
sequenceDiagram
    participant C as Component
    participant H as useWebsiteSlides Hook
    participant BS as BranchStore
    participant API as API Server
    participant Cache as API Cache
    participant Proxy as Image Proxy

    C->>H: useWebsiteSlides()
    H->>BS: getSelectedBranchId()
    BS-->>H: branchId
    H->>Cache: Check cache
    alt Cache Hit
        Cache-->>H: Cached slides
    else Cache Miss
        H->>API: GET /website-slides?branch_id={id}
        API-->>H: Response with slides
        H->>Cache: Store in cache
    end
    H->>Proxy: proxyObjectImages(slides)
    Proxy-->>H: Proxied slides
    H-->>C: slides, isLoading, error
    C->>C: Render Swiper with slides
```

### التفاصيل:

- **Hook المستخدم:** `useWebsiteSlides()` من `src/hooks/useWebsiteSlides.js`
- **API Endpoint:** `/website-slides` مع `branch_id` كـ query parameter
- **Cache Strategy:** يستخدم `apiCache` utility مع TTL محدد
- **Image Processing:** جميع الصور تمر عبر `getProxiedImageUrl()` لحل مشاكل CORS
- **Performance:** 
  - Prefetch مبكر في `page.jsx` (useEffect)
  - Fetch API مع `priority: 'high'`
  - Preload للصورة الأولى لتحسين LCP

### البيانات المعروضة:

- `slide.title` - عنوان الشريحة
- `slide.description` - الوصف
- `slide.desktop_image` - صورة الشريحة (مع proxy)
- `slide.menu_item_id` - رابط إلى منتج معين (اختياري)

---

## 2. LatestItemsSection (أحدث المنتجات)

**الملف:** `src/components/pages/home/LatestItemsSection.jsx`

### مخطط تدفق البيانات

```mermaid
sequenceDiagram
    participant C as Component
    participant HC as HighlightsContext
    participant BS as BranchStore
    participant API as API Server
    participant Transform as ProductTransform

    C->>HC: useHighlights()
    HC->>BS: getSelectedBranchId()
    BS-->>HC: branchId
    HC->>API: GET /menu-items/highlights?branch_id={id}
    API-->>HC: { popular, latest, chef_special }
    HC->>Transform: transformMenuItemsToProducts(latest, lang)
    Transform-->>HC: Transformed latest items
    HC->>HC: setLatest(transformedItems)
    HC-->>C: { latest, isLoading }
    C->>C: Render Grid of LazyCard components
```

### التفاصيل:

- **Context:** `HighlightsContext` - يوفر البيانات لجميع الأقسام (Popular, Latest, ChefSpecial)
- **API Endpoint:** `/menu-items/highlights`
- **Data Transformation:** 
  - `transformMenuItemsToProducts()` - يحول API response إلى format المنتجات
  - `getLocalizedField()` - يجلب الحقول المترجمة (name_en, name_bg)
- **Lazy Loading:** يستخدم `useInView` hook - أول 3 بطاقات تحمل فوراً، الباقي عند الظهور
- **Performance:** 
  - Cache عبر `useApiCache` hook
  - Lazy loading للبطاقات غير المرئية

### البيانات المعروضة:

- `dish.title` - اسم المنتج (مترجم)
- `dish.description` - الوصف (مترجم)
- `dish.image` - صورة المنتج (مع proxy)
- `dish.price` - السعر
- `dish.id` - رابط إلى `/shop/{id}`

---

## 3. OfferCards (بطاقات العروض)

**الملف:** `src/components/pages/about-us/OfferCards.jsx`

### مخطط تدفق البيانات

```mermaid
sequenceDiagram
    participant C as Component
    participant H as useWebsiteSlides Hook
    participant Proxy as Image Proxy

    C->>H: useWebsiteSlides()
    H-->>C: apiSlides (reused from BannerSection)
    C->>C: apiSlides.slice(0, 3)
    C->>Proxy: getProxiedImageUrl(slide.desktop_image)
    Proxy-->>C: Proxied image URL
    C->>C: Transform to offer format
    C->>C: Render 3 cards in grid
```

### التفاصيل:

- **Hook المستخدم:** `useWebsiteSlides()` - نفس البيانات المستخدمة في BannerSection
- **Data Reuse:** يعيد استخدام بيانات البانر (website-slides) - لا يوجد API call إضافي
- **Fallback:** إذا لم توجد بيانات، يعرض 3 بطاقات افتراضية
- **Image Processing:** `getProxiedImageUrl()` لجميع الصور

### البيانات المعروضة:

- أول 3 slides من website-slides
- كل بطاقة تحتوي على: title, image, link

---

## 4. AboutUsSection (قسم من نحن)

**الملف:** `src/components/pages/home/AboutUsSection.jsx`

### مخطط تدفق البيانات

```mermaid
flowchart LR
    A[Component Mount] --> B[useLanguage Hook]
    B --> C[Get translations from locales]
    C --> D[Render Static Content]
    D --> E[No API Calls]
```

### التفاصيل:

- **لا يوجد API calls** - محتوى ثابت
- **Translations:** يستخدم `t(lang, "key")` من ملفات الترجمة
- **Content:** نص ثابت من `src/locales/en.json` و `src/locales/bg.json`
- **Images:** صور ثابتة من `/public/img/shape/`

### البيانات المعروضة:

- `t(lang, "about_us")` - العنوان الفرعي
- `t(lang, "about_us_title")` - العنوان الرئيسي
- `t(lang, "about_us_description")` - الوصف

---

## 5. PopularDishes (الأطباق الشائعة)

**الملف:** `src/components/pages/shop/PopularDishes.jsx`

### مخطط تدفق البيانات

```mermaid
flowchart TD
    A[Component Mount] --> B{HighlightsContext Available?}
    B -->|Yes| C[Use contextData.popular]
    B -->|No| D[useBranchStore → getSelectedBranchId]
    D --> E[API Call: GET /menu-items/highlights]
    E --> F[Transform: transformMenuItemsToProducts]
    F --> G[setDishes transformed]
    C --> H[Render Grid of LazyPopularCard]
    G --> H
```

### التفاصيل:

- **Dual Strategy:** يحاول استخدام Context أولاً، إذا لم يكن متوفراً يجلب البيانات مباشرة
- **API Endpoint:** `/menu-items/highlights` - نفس API المستخدم في HighlightsContext
- **Data Transformation:** `transformMenuItemsToProducts()` مع اللغة الحالية
- **Lazy Loading:** `useInView` hook - أول 3 بطاقات فوراً، الباقي عند الظهور

### البيانات المعروضة:

- `dish.title` - اسم الطبق (مترجم)
- `dish.description` - الوصف (مترجم)
- `dish.image` - الصورة (مع proxy)
- `dish.price` - السعر

---

## 6. FoodMenuSection (قسم قائمة الطعام)

**الملف:** `src/components/pages/home/FoodMenuSection.jsx`

### مخطط تدفق البيانات

```mermaid
sequenceDiagram
    participant C as Component
    participant IV as useInView Hook
    participant API as API Server
    participant Transform as Transform Utils
    participant State as Component State

    C->>IV: useInView() - Wait for visibility
    IV-->>C: inView = true
    C->>API: GET /menu-categories
    API-->>C: Categories response
    C->>Transform: transformCategories(categoriesData, lang)
    Transform-->>C: Transformed categories
    C->>State: setCategories() + setActiveTab(first)
    
    Note over C,State: User clicks category tab
    C->>State: setActiveTab(categoryId)
    State->>C: activeTab changed
    C->>API: GET /menu-items?branch_id={id}&category_id={activeTab}
    API-->>C: Menu items response
    C->>Transform: transformMenuItemsToProducts(items, lang)
    Transform-->>C: Transformed items
    C->>State: setMenuItems()
    C->>C: Render tabs + items grid
```

### التفاصيل:

- **Lazy Loading:** لا يجلب البيانات حتى يصبح القسم مرئياً (`useInView` مع `rootMargin: "200px"`)
- **Two-Step Fetch:**
  1. جلب الفئات أولاً (`/menu-categories`)
  2. جلب المنتجات عند اختيار فئة (`/menu-items?category_id={id}`)
- **State Management:**
  - `categories` - قائمة الفئات
  - `activeTab` - الفئة المختارة حالياً
  - `menuItems` - المنتجات للفئة المختارة
- **Data Transformation:**
  - `transformCategories()` - تحويل الفئات
  - `transformMenuItemsToProducts()` - تحويل المنتجات

### البيانات المعروضة:

- **Tabs:** قائمة بالفئات (مترجمة)
- **Content:** 10 منتجات من الفئة المختارة
  - صورة، اسم، وصف، سعر
  - رابط إلى `/shop/{id}`

---

## 7. ChefSpecialSection (توصيات الشيف)

**الملف:** `src/components/pages/home/ChefSpecialSection.jsx`

### مخطط تدفق البيانات

```mermaid
sequenceDiagram
    participant C as Component
    participant HC as HighlightsContext
    participant BS as BranchStore
    participant API as API Server
    participant Transform as ProductTransform

    C->>HC: useHighlights()
    HC->>BS: getSelectedBranchId()
    BS-->>HC: branchId
    HC->>API: GET /menu-items/highlights?branch_id={id}
    API-->>HC: { popular, latest, chef_special }
    HC->>Transform: transformMenuItemsToProducts(chef_special, lang)
    Transform-->>HC: Transformed chefSpecial items
    HC->>HC: setChefSpecial(transformedItems)
    HC-->>C: { chefSpecial, isLoading }
    C->>C: Render Grid of LazyChefCard components
```

### التفاصيل:

- **Context:** يستخدم `HighlightsContext` - نفس البيانات المستخدمة في LatestItemsSection
- **API Endpoint:** `/menu-items/highlights` - نفس API
- **Data Source:** `response.data.chef_special` من نفس الـ response
- **Lazy Loading:** `useInView` hook - أول 3 بطاقات فوراً

### البيانات المعروضة:

- `dish.title` - اسم الطبق (مترجم)
- `dish.description` - الوصف (مترجم)
- `dish.image` - الصورة (مع proxy)
- `dish.price` - السعر
- Badge: "Special" مع أيقونة ChefHat

---

## 8. ChefeSection (قسم الشيفات)

**الملف:** `src/components/pages/about-us/ChefeSection.jsx`

### مخطط تدفق البيانات

```mermaid
sequenceDiagram
    participant C as Component
    participant BS as BranchStore
    participant API as API Server
    participant Proxy as Image Proxy

    C->>BS: getSelectedBranchId()
    BS-->>C: branchId
    C->>API: GET /branches/{branchId}/chefs
    API-->>C: { success: true, data: { chefs: [...] } }
    loop For each chef
        C->>Proxy: getImageUrl(chef.image_url)
        alt /storage path
            Proxy->>Proxy: Construct full URL
            Proxy->>Proxy: Apply proxy
        else Full URL
            Proxy->>Proxy: Apply proxy directly
        end
        Proxy-->>C: Proxied image URL
    end
    C->>C: setChefs(chefs)
    C->>C: Render Grid of LazyChefCard components
```

### التفاصيل:

- **API Endpoint:** `/branches/{branchId}/chefs` - endpoint خاص بالشيفات
- **Image Processing:** 
  - `getImageUrl()` - معالجة خاصة للصور
  - إذا كانت `/storage/...` → بناء URL كامل ثم proxy
  - إذا كانت URL كاملة → proxy مباشرة
- **Lazy Loading:** `useInView` hook - أول 3 بطاقات فوراً

### البيانات المعروضة:

- `chef.name` - اسم الشيف
- `chef.bio` - السيرة الذاتية (اختياري)
- `chef.image_url` - صورة الشيف (مع proxy)

---

## البنية المشتركة والـ Utilities

### 1. Branch Store (`src/store/branchStore.js`)

**الوظيفة:** إدارة الفروع المختارة

```mermaid
flowchart LR
    A[Branch Store] --> B[selectedBranch]
    A --> C[getSelectedBranchId]
    A --> D[initialize]
    A --> E[fetchBranches]
    A --> F[fetchBranchDetails]
    D --> G[localStorage Persistence]
```

**Cache:** يستخدم localStorage للـ persistence

### 2. HighlightsContext (`src/context/HighlightsContext.jsx`)

**الوظيفة:** توفير البيانات المشتركة لـ 3 أقسام

```mermaid
flowchart TD
    A[HighlightsProvider] --> B[Single API Call]
    B --> C[/menu-items/highlights]
    C --> D[Response: popular, latest, chef_special]
    D --> E[Transform each section]
    E --> F[PopularDishes]
    E --> G[LatestItemsSection]
    E --> H[ChefSpecialSection]
```

**API Call:** واحد فقط - `/menu-items/highlights` - ثم تقسيم البيانات

### 3. Product Transform (`src/lib/utils/productTransform.js`)

**الوظيفة:** تحويل بيانات API إلى format المنتجات

```mermaid
flowchart TD
    A[API Menu Item] --> B[getLocalizedField]
    B --> C[name_en / name_bg]
    A --> D[getImageUrl]
    D --> E[Image Proxy]
    A --> F[Transform sizes]
    A --> G[Transform ingredients]
    A --> H[Transform option_groups]
    A --> I[Transform customizations]
    C --> J[Final Product Object]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
```

### 4. Image Proxy (`src/lib/utils/imageProxy.js`)

**الوظيفة:** حل مشاكل CORS للصور

```mermaid
flowchart TD
    A[Image URL] --> B{Is API Image?}
    B -->|Yes| C[/api/images/[...path]]
    B -->|No| D[Return as is]
    C --> E[Proxied URL]
    D --> E
```

### 5. API Cache (`src/lib/utils/apiCache.js`)

**الوظيفة:** تخزين مؤقت للـ API responses

```mermaid
flowchart TD
    A[API Request] --> B[generateCacheKey]
    B --> C{Cache Exists?}
    C -->|Yes| D[Return Cached Data]
    C -->|No| E{Pending Request?}
    E -->|Yes| F[Wait for Pending]
    E -->|No| G[Make API Call]
    G --> H[Store in Cache]
    H --> I[Return Data]
    F --> I
```

---

## ترتيب تحميل الأقسام

```mermaid
gantt
    title Home Page Section Loading Order
    dateFormat X
    axisFormat %s
    
    section Immediate
    BannerSection :0, 1
    
    section Priority 1
    PopularDishes :2, 3
    FoodMenuSection :2, 3
    ChefSpecialSection :2, 3
    
    section Priority 3
    LatestItemsSection :4, 5
    OfferCards :4, 5
    ChefeSection :4, 5
    
    section Lightweight
    AboutUsSection :6, 7
```

1. **BannerSection** - فوراً (Above the fold)
2. **LatestItemsSection** - Lazy load (Priority 3)
3. **OfferCards** - Lazy load (Priority 3)
4. **AboutUsSection** - Lazy load (SSR enabled)
5. **PopularDishes** - Lazy load (Priority 1)
6. **FoodMenuSection** - Lazy load (Priority 1)
7. **ChefSpecialSection** - Lazy load (Priority 1)
8. **ChefeSection** - Lazy load (Priority 3)

---

## ملخص تدفق البيانات الكامل

```mermaid
flowchart TD
    Start[Page Load] --> Init[Branch Store Initialize]
    Init --> HC[HighlightsContext Provider]
    HC --> API1[Single API: /menu-items/highlights]
    API1 --> Split[Split: popular, latest, chefSpecial]
    
    Init --> Banner[BannerSection]
    Banner --> API2[API: /website-slides]
    API2 --> BannerRender[Render Swiper]
    
    Split --> Latest[LatestItemsSection]
    Split --> Popular[PopularDishes]
    Split --> ChefSpecial[ChefSpecialSection]
    
    API2 --> Offers[OfferCards - Reuse slides]
    
    Init --> FoodMenu[FoodMenuSection]
    FoodMenu --> API3[API: /menu-categories]
    API3 --> API4[API: /menu-items?category_id]
    API4 --> FoodMenuRender[Render Tabs + Items]
    
    Init --> Chefs[ChefeSection]
    Chefs --> API5[API: /branches/{id}/chefs]
    API5 --> ChefsRender[Render Chef Cards]
    
    Init --> About[AboutUsSection]
    About --> Static[Static Content - No API]
    
    style Start fill:#e1f5ff
    style API1 fill:#fff4e1
    style API2 fill:#fff4e1
    style API3 fill:#fff4e1
    style API4 fill:#fff4e1
    style API5 fill:#fff4e1
    style Static fill:#e8f5e9
```

**ملاحظات مهمة:**

- معظم الأقسام تستخدم lazy loading لتحسين الأداء
- HighlightsContext يوفر بيانات لـ 3 أقسام من API call واحد
- جميع الصور تمر عبر proxy لحل مشاكل CORS
- Cache strategy لتقليل API calls
- Localization: جميع النصوص والمنتجات مترجمة حسب اللغة المختارة

---

## API Endpoints المستخدمة

| Endpoint | Method | Sections Using It | Description |
|----------|--------|-------------------|-------------|
| `/website-slides` | GET | BannerSection, OfferCards | جلب شرائح البانر |
| `/menu-items/highlights` | GET | LatestItemsSection, PopularDishes, ChefSpecialSection | جلب المنتجات المميزة |
| `/menu-categories` | GET | FoodMenuSection | جلب فئات القائمة |
| `/menu-items` | GET | FoodMenuSection | جلب منتجات فئة معينة |
| `/branches/{id}/chefs` | GET | ChefeSection | جلب الشيفات |

---

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> BranchInitialized: initialize()
    BranchInitialized --> BranchSelected: setSelectedBranch()
    BranchSelected --> HighlightsFetching: HighlightsContext
    HighlightsFetching --> HighlightsLoaded: API Response
    HighlightsLoaded --> SectionsReady: Data Split
    
    BranchSelected --> BannerFetching: BannerSection
    BannerFetching --> BannerLoaded: Slides Received
    
    BranchSelected --> CategoriesFetching: FoodMenuSection (inView)
    CategoriesFetching --> CategoriesLoaded: Categories Received
    CategoriesLoaded --> ItemsFetching: Tab Selected
    ItemsFetching --> ItemsLoaded: Items Received
    
    BranchSelected --> ChefsFetching: ChefeSection (inView)
    ChefsFetching --> ChefsLoaded: Chefs Received
    
    SectionsReady --> [*]
    BannerLoaded --> [*]
    ItemsLoaded --> [*]
    ChefsLoaded --> [*]
```

---

## Performance Optimizations

1. **Lazy Loading:** معظم الأقسام تحمل فقط عند الحاجة
2. **Code Splitting:** استخدام `dynamic()` import في Next.js
3. **Image Optimization:** 
   - Proxy للصور الخارجية
   - Lazy loading للصور
   - Preload للصور المهمة
4. **Caching:**
   - API responses cached
   - Branch data persisted in localStorage
5. **Request Deduplication:** منع duplicate API calls
6. **Intersection Observer:** تحميل البيانات عند ظهور القسم








