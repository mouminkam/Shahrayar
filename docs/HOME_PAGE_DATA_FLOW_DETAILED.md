# تحليل مفصل جداً لتدفق البيانات في صفحة HOME

## جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [البنية الأساسية](#البنية-الأساسية)
3. [تفصيل كل قسم](#تفصيل-كل-قسم)
4. [الـ Utilities والـ Hooks بالتفصيل](#الـ-utilities-والـ-hooks-بالتفصيل)
5. [أمثلة على البيانات](#أمثلة-على-البيانات)

---

## نظرة عامة

صفحة HOME (`src/app/page.jsx`) هي الصفحة الرئيسية للموقع وتتكون من 8 أقسام رئيسية. كل قسم له طريقة خاصة في جلب وعرض البيانات.

### ترتيب الأقسام في الكود:

```javascript
// src/app/page.jsx
1. BannerSection          - Load immediately (no lazy loading)
2. LatestItemsSection     - Lazy load (Priority 3)
3. OfferCards             - Lazy load (Priority 3)
4. AboutUsSection         - Lazy load (SSR enabled)
5. PopularDishes          - Lazy load (Priority 1)
6. FoodMenuSection        - Lazy load (Priority 1)
7. ChefSpecialSection     - Lazy load (Priority 1)
8. ChefeSection           - Lazy load (Priority 3)
```

---

## البنية الأساسية

### 1. Page Component Structure

```javascript
// src/app/page.jsx
export default function HomePage() {
  const router = useRouter();
  const { selectedBranch, initialize } = useBranchStore();

  // Step 1: Initialize branch store on mount
  useEffect(() => {
    initialize(); // يبدأ جلب الفروع من localStorage أو API
  }, [initialize]);

  // Step 2: Early prefetch for banner slides
  useEffect(() => {
    const branchId = selectedBranch?.id || selectedBranch?.branch_id;
    if (branchId) {
      prefetchWebsiteSlides(branchId).catch((error) => {
        console.warn('Early prefetch failed:', error);
      });
    }
  }, [selectedBranch?.id, selectedBranch?.branch_id]);

  return (
    <HighlightsProvider> {/* Context Provider - يجلب البيانات لـ 3 أقسام */}
      <PageSEO ... />
      <div className="bg-bg3 min-h-screen">
        {/* All sections here */}
      </div>
    </HighlightsProvider>
  );
}
```

**شرح الخطوات:**
1. **initialize()**: 
   - يتحقق من وجود `selectedBranch` في localStorage
   - إذا لم يوجد، يجلب الفروع من API
   - يختار الفرع الأول أو الفرع الرئيسي (is_main: true)
   - يحفظ في localStorage للاستخدام المستقبلي

2. **prefetchWebsiteSlides()**: 
   - يبدأ جلب بيانات البانر مبكراً (قبل أن يظهر القسم)
   - يستخدم Fetch API مع `priority: 'high'`
   - يحفظ في cache للاستخدام الفوري

---

## تفصيل كل قسم

---

## 1. BannerSection (قسم البانر) - تفصيل كامل

**الملف:** `src/components/pages/home/BannerSection.jsx`

### الخطوة 1: Component Mount

```javascript
export default function BannerSection() {
  const { prefetchRoute } = usePrefetchRoute();
  const { lang } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const { slides: apiSlides, isLoading, error } = useWebsiteSlides();
  // ↑ هنا يتم استدعاء Hook الذي يجلب البيانات
```

### الخطوة 2: useWebsiteSlides Hook - تفصيل كامل

**الملف:** `src/hooks/useWebsiteSlides.js`

#### 2.1: Hook Initialization

```javascript
export function useWebsiteSlides(params = {}) {
  const { selectedBranch } = useBranchStore();
  const { getCachedOrFetch } = useApiCache("WEBSITE_SLIDES");
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // لا يبدأ بـ true - ينتظر الفرع
  const [error, setError] = useState(null);
  
  // استخدام useRef لتخزين params وتجنب infinite loop
  const paramsRef = useRef(params);
  const paramsString = useMemo(() => JSON.stringify(params), [params]);
  
  useEffect(() => {
    paramsRef.current = params; // تحديث ref عند تغيير params
  }, [paramsString]);
```

**شرح:**
- `useState([])`: يبدأ بـ array فارغ
- `isLoading = false`: لا يبدأ بـ true لأنه ينتظر `selectedBranch` أولاً
- `paramsRef`: لتجنب stale closure في `useCallback`

#### 2.2: fetchWebsiteSlides Function - تفصيل كل سطر

```javascript
const fetchWebsiteSlides = useCallback(async () => {
  // Step 1: الحصول على branchId
  const branchId = selectedBranch?.id || selectedBranch?.branch_id;
  
  // Step 2: إذا لم يكن هناك branch، لا تجلب البيانات
  if (!branchId) {
    setSlides([]);
    setIsLoading(false);
    return; // توقف هنا
  }

  // Step 3: بدء عملية الجلب
  setIsLoading(true);
  setError(null);

  try {
    // Step 4: إنشاء cache key
    const cacheKey = generateCacheKey('/website-slides', paramsRef.current, branchId);
    // مثال: "/website-slides?branch=1"
    
    // Step 5: التحقق من Cache
    const cached = getCachedData(cacheKey);
    if (cached !== null) {
      // البيانات موجودة في cache
      if (cached?.success && cached?.data?.slides) {
        // Step 6: تحويل URLs الصور إلى proxy URLs
        const proxiedSlides = cached.data.slides.map(slide => 
          proxyObjectImages(slide, ['desktop_image', 'mobile_image', 'image'])
        );
        setSlides(proxiedSlides);
      } else {
        setSlides([]);
      }
      setIsLoading(false);
      return; // توقف - استخدم البيانات من cache
    }

    // Step 7: التحقق من Pending Request (منع duplicate requests)
    const pending = getPendingRequest(cacheKey);
    if (pending) {
      // هناك request قيد التنفيذ - انتظر النتيجة
      const response = await pending;
      if (response?.success && response?.data?.slides) {
        const proxiedSlides = response.data.slides.map(slide => 
          proxyObjectImages(slide, ['desktop_image', 'mobile_image', 'image'])
        );
        setSlides(proxiedSlides);
      } else {
        setSlides([]);
      }
      setIsLoading(false);
      return;
    }

    // Step 8: بناء URL للـ API
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shahrayar.peaklink.pro/api/v1';
    const url = `${API_BASE_URL}/website-slides`;
    // النتيجة: "https://shahrayar.peaklink.pro/api/v1/website-slides"
    
    // Step 9: بناء Query Parameters
    const queryParams = new URLSearchParams({
      branch_id: branchId,
      ...paramsRef.current,
    });
    const fullUrl = `${url}?${queryParams.toString()}`;
    // النتيجة: "https://shahrayar.peaklink.pro/api/v1/website-slides?branch_id=1"
    
    const ttl = CACHE_DURATION.WEBSITE_SLIDES || CACHE_DURATION.PRODUCTS;
    // TTL = 15 دقيقة (900,000 ms)

    // Step 10: الحصول على Token و Language
    const getToken = () => {
      if (typeof window === 'undefined') return null;
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          // Token موجود في: parsed.state.user.token أو parsed.state.token
          return parsed.state?.user?.token || parsed.state?.token || null;
        }
        return sessionStorage.getItem('registrationToken');
      } catch {
        return null;
      }
    };

    const getLanguage = () => {
      if (typeof window === 'undefined') return 'bg';
      try {
        return localStorage.getItem('language') || 'bg';
      } catch {
        return 'bg';
      }
    };

    const token = getToken();
    const language = getLanguage();

    // Step 11: استخدام Fetch API مع high priority
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30 ثانية timeout
    
    const fetchPromise = fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': language, // 'bg' أو 'en'
        ...(token && { Authorization: `Bearer ${token}` }), // إذا كان هناك token
      },
      priority: 'high', // أولوية عالية للبانر
      signal: abortController.signal, // للإلغاء إذا لزم الأمر
    })
      .then(async (response) => {
        clearTimeout(timeoutId);
        
        // Step 12: التحقق من status code
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Step 13: تحويل response إلى JSON
        const data = await response.json();
        
        // Step 14: تحويل إلى format موحد
        const transformedData = data && typeof data === 'object' && 'success' in data 
          ? data 
          : { success: true, data: data };
        
        // Step 15: حفظ في Cache
        setCachedData(cacheKey, transformedData, ttl);
        return transformedData;
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        // Fallback: استخدام axios إذا فشل fetch
        console.warn('Fetch API failed, falling back to axios:', error);
        return api.slides.getWebsiteSlides(paramsRef.current);
      });

    // Step 16: حفظ Promise في pendingRequests (منع duplicate)
    setPendingRequest(cacheKey, fetchPromise);
    
    // Step 17: انتظار النتيجة
    const response = await fetchPromise;

    // Step 18: معالجة النتيجة
    if (response?.success && response?.data?.slides) {
      // Step 19: تحويل URLs الصور إلى proxy
      const proxiedSlides = response.data.slides.map(slide => 
        proxyObjectImages(slide, ['desktop_image', 'mobile_image', 'image'])
      );
      setSlides(proxiedSlides);
    } else {
      setSlides([]);
    }
  } catch (err) {
    // Step 20: معالجة الأخطاء
    const errorMessage = err?.message || err?.data?.message || "Failed to load website slides";
    setError(errorMessage);
    console.error("Website slides error:", errorMessage);
    setSlides([]);
  } finally {
    setIsLoading(false);
  }
}, [selectedBranch?.id, selectedBranch?.branch_id, paramsString]);

// Step 21: استدعاء fetchWebsiteSlides عند تغيير dependencies
useEffect(() => {
  fetchWebsiteSlides();
}, [fetchWebsiteSlides]);
```

### الخطوة 3: proxyObjectImages - تفصيل كامل

**الملف:** `src/lib/utils/imageProxy.js`

```javascript
export function proxyObjectImages(obj, imageKeys = ['image', 'image_url', 'desktop_image', 'mobile_image', 'thumbnail']) {
  if (!obj || typeof obj !== 'object') {
    return obj; // إذا لم يكن object، أرجع كما هو
  }

  const proxied = { ...obj }; // نسخ object جديد

  imageKeys.forEach(key => {
    if (proxied[key] && typeof proxied[key] === 'string') {
      // تحويل كل image URL إلى proxy URL
      proxied[key] = getProxiedImageUrl(proxied[key]);
    }
  });

  return proxied;
}
```

**مثال على التحويل:**

```javascript
// قبل التحويل:
{
  id: 1,
  title: "Slide 1",
  desktop_image: "https://shahrayar.peaklink.pro/storage/website-slides/slide1.jpg"
}

// بعد proxyObjectImages:
{
  id: 1,
  title: "Slide 1",
  desktop_image: "/api/images/storage/website-slides/slide1.jpg"
}
```

### الخطوة 4: getProxiedImageUrl - تفصيل كامل

```javascript
export function getProxiedImageUrl(imageUrl) {
  // Step 1: التحقق من وجود URL
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl || null;
  }

  // Step 2: إذا كانت data URL، أرجع كما هي
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Step 3: إذا كانت local path (تبدأ بـ / وليست من API)، أرجع كما هي
  if (imageUrl.startsWith('/') && !isApiImageUrl(imageUrl)) {
    return imageUrl; // مثال: "/img/logo.svg"
  }

  // Step 4: إذا لم تكن من API domain، أرجع كما هي
  if (!isApiImageUrl(imageUrl)) {
    return imageUrl; // مثال: "https://example.com/image.jpg"
  }

  // Step 5: استخراج path من URL
  const imagePath = extractImagePath(imageUrl);
  // مثال: "storage/website-slides/slide1.jpg"
  
  if (!imagePath) {
    console.warn('Could not extract path from image URL:', imageUrl);
    return imageUrl;
  }

  // Step 6: بناء proxy URL
  const cleanPath = imagePath.startsWith('storage/') 
    ? imagePath 
    : `storage/${imagePath}`;

  // Step 7: الحفاظ على query parameters إن وجدت
  try {
    const url = new URL(imageUrl);
    const queryString = url.search;
    return `/api/images/${cleanPath}${queryString}`;
  } catch {
    return `/api/images/${cleanPath}`;
  }
}
```

**أمثلة على التحويل:**

```javascript
// مثال 1: Full URL من API
getProxiedImageUrl('https://shahrayar.peaklink.pro/storage/website-slides/slide1.jpg')
// النتيجة: "/api/images/storage/website-slides/slide1.jpg"

// مثال 2: Relative path
getProxiedImageUrl('/storage/website-slides/slide1.jpg')
// النتيجة: "/api/images/storage/website-slides/slide1.jpg"

// مثال 3: Local path (لا يتغير)
getProxiedImageUrl('/img/logo.svg')
// النتيجة: "/img/logo.svg"

// مثال 4: External URL (لا يتغير)
getProxiedImageUrl('https://example.com/image.jpg')
// النتيجة: "https://example.com/image.jpg"
```

### الخطوة 5: Render في Component

```javascript
// في BannerSection.jsx
const slides = useMemo(() => {
  if (!apiSlides || apiSlides.length === 0) {
    return [];
  }

  return apiSlides.map((slide, index) => ({
    id: slide.id,
    subtitle: slide.description || t(lang, "welcome_fresheat"),
    title: slide.title || "",
    image: getProxiedImageUrl(slide.desktop_image || ""),
    bgImage: "/img/bg/bannerBG1_1.jpg", // صورة ثابتة
    link: slide.menu_item_id ? `/shop/${slide.menu_item_id}` : "/shop",
    shape4Float: index % 2 === 0, // للـ animation
  }));
}, [apiSlides, lang]);
```

**مثال على البيانات النهائية:**

```javascript
[
  {
    id: 1,
    subtitle: "Welcome to FreshEat",
    title: "Delicious Food",
    image: "/api/images/storage/website-slides/slide1.jpg",
    bgImage: "/img/bg/bannerBG1_1.jpg",
    link: "/shop/123",
    shape4Float: true
  },
  {
    id: 2,
    subtitle: "Best Restaurant",
    title: "Quality Food",
    image: "/api/images/storage/website-slides/slide2.jpg",
    bgImage: "/img/bg/bannerBG1_1.jpg",
    link: "/shop",
    shape4Float: false
  }
]
```

---

## 2. LatestItemsSection (أحدث المنتجات) - تفصيل كامل

**الملف:** `src/components/pages/home/LatestItemsSection.jsx`

### الخطوة 1: Component Mount

```javascript
export default function LatestItemsSection() {
  const { prefetchRoute } = usePrefetchRoute();
  const { latest, isLoading } = useHighlights(); // ← هنا
  const { lang } = useLanguage();
```

### الخطوة 2: HighlightsContext - تفصيل كامل

**الملف:** `src/context/HighlightsContext.jsx`

#### 2.1: Context Provider Setup

```javascript
export function HighlightsProvider({ children }) {
  const { selectedBranch, getSelectedBranchId } = useBranchStore();
  const { getCachedOrFetch } = useApiCache("HIGHLIGHTS");
  const { lang } = useLanguage();
  
  // State للبيانات
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const [chefSpecial, setChefSpecial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
```

#### 2.2: fetchHighlights Function - تفصيل كل سطر

```javascript
useEffect(() => {
  const fetchHighlights = async () => {
    // Step 1: الحصول على branchId
    const branchId = getSelectedBranchId();
    // getSelectedBranchId() يعيد: selectedBranch?.id || selectedBranch?.branch_id || null
    
    // Step 2: إذا لم يكن هناك branch، توقف
    if (!branchId) {
      setIsLoading(false);
      return;
    }

    // Step 3: بدء الجلب
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 4: استخدام getCachedOrFetch
      const response = await getCachedOrFetch(
        "/menu-items/highlights", // URL
        {}, // Params (فارغ)
        () => api.menu.getHighlights() // Function للجلب إذا لم يكن في cache
      );
      
      // getCachedOrFetch يعمل كالتالي:
      // 1. يتحقق من cache
      // 2. إذا كان موجوداً، يرجع البيانات
      // 3. إذا لم يكن موجوداً، يستدعي api.menu.getHighlights()
      // 4. يحفظ النتيجة في cache
      // 5. يرجع البيانات
      
      // Step 5: التحقق من response
      if (!response?.success || !response.data) {
        setPopular([]);
        setLatest([]);
        setChefSpecial([]);
        return;
      }

      // Step 6: تحويل كل قسم على حدة
      const popularItems = transformMenuItemsToProducts(
        response.data.popular || [], 
        lang
      );
      const latestItems = transformMenuItemsToProducts(
        response.data.latest || [], 
        lang
      );
      const chefSpecialItems = transformMenuItemsToProducts(
        response.data.chef_special || [], 
        lang
      );

      // Step 7: حفظ في state
      setPopular(popularItems);
      setLatest(latestItems);
      setChefSpecial(chefSpecialItems);
    } catch (err) {
      console.error("Error fetching highlights:", err);
      setError(err.message || "Failed to fetch highlights");
      setPopular([]);
      setLatest([]);
      setChefSpecial([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchHighlights();
}, [selectedBranch, getSelectedBranchId, getCachedOrFetch, lang]);
```

#### 2.3: API Response Structure

**مثال على response من API:**

```json
{
  "success": true,
  "data": {
    "popular": [
      {
        "id": 1,
        "name": "Pizza",
        "name_en": "Pizza",
        "name_bg": "Пица",
        "description": "Delicious pizza",
        "description_en": "Delicious pizza",
        "description_bg": "Вкусна пица",
        "price": 15.99,
        "image_url": "https://shahrayar.peaklink.pro/storage/menu-items/pizza.jpg",
        "category_id": 1
      }
    ],
    "latest": [
      {
        "id": 2,
        "name": "Burger",
        "name_en": "Burger",
        "name_bg": "Бургер",
        "description": "Fresh burger",
        "price": 12.99,
        "image_url": "https://shahrayar.peaklink.pro/storage/menu-items/burger.jpg"
      }
    ],
    "chef_special": [
      {
        "id": 3,
        "name": "Special Dish",
        "name_en": "Special Dish",
        "name_bg": "Специално ястие",
        "description": "Chef's special",
        "price": 25.99,
        "image_url": "https://shahrayar.peaklink.pro/storage/menu-items/special.jpg"
      }
    ]
  }
}
```

### الخطوة 3: transformMenuItemsToProducts - تفصيل كامل

**الملف:** `src/lib/utils/productTransform.js`

#### 3.1: transformMenuItemsToProducts Function

```javascript
export const transformMenuItemsToProducts = (menuItems, lang = 'bg') => {
  if (!Array.isArray(menuItems)) return [];
  return menuItems.map(item => transformMenuItemToProduct(item, [], lang)).filter(Boolean);
};
```

**شرح:**
- `menuItems`: array من menu items من API
- `lang`: اللغة المختارة ('bg' أو 'en')
- `map()`: يحول كل item إلى product format
- `filter(Boolean)`: يزيل أي null أو undefined

#### 3.2: transformMenuItemToProduct - تفصيل كامل

```javascript
export const transformMenuItemToProduct = (menuItem, optionGroups = [], lang = 'bg', customizations = null) => {
  if (!menuItem) return null;

  // Step 1: استخراج sizes و ingredients
  const sizesArray = Array.isArray(menuItem.sizes) ? menuItem.sizes : [];
  const ingredientsArray = Array.isArray(menuItem.ingredients) ? menuItem.ingredients : [];

  // Step 2: الحصول على السعر الأساسي
  const basePrice = parseFloat(menuItem.price || menuItem.default_price || 0);

  // Step 3: الحصول على الحجم الافتراضي
  const defaultSize = sizesArray.find(s => s.is_default) || sizesArray[0] || null;
  const defaultSizeId = defaultSize?.id || null;

  // Step 4: سعر العرض (يستخدم basePrice)
  const displayPrice = basePrice;

  // Step 5: الحصول على الاسم والوصف المترجم
  const itemName = getLocalizedField(menuItem, 'name', lang);
  // getLocalizedField يبحث عن: menuItem.name_en أو menuItem.name_bg أو menuItem.name
  
  const itemDescription = getLocalizedField(menuItem, 'description', lang);
  
  // Step 6: الحصول على اسم الفئة المترجم
  const categoryName = menuItem.category 
    ? getLocalizedField(menuItem.category, 'name', lang)
    : '';

  // Step 7: تحويل option_groups
  const transformedOptionGroups = Array.isArray(optionGroups) ? optionGroups.map(group => ({
    id: group.id,
    name: group.name || "",
    description: group.description || null,
    type: group.type || null,
    is_required: group.is_required === true || group.is_required === 1,
    min_selection: parseInt(group.min_selection || 0, 10),
    max_selection: parseInt(group.max_selection || 0, 10),
    sort_order: parseInt(group.sort_order || 0, 10),
    items: Array.isArray(group.items) ? group.items.map(item => ({
      id: item.id,
      name: item.name || "",
      price_delta: parseFloat(item.price_delta || 0),
      sort_order: parseInt(item.sort_order || 0, 10),
      original: item,
    })) : [],
    original: group,
  })) : [];

  // Step 8: تحويل customizations
  const transformedCustomizations = transformCustomizations(customizations, lang);
  
  // Step 9: بناء Product Object النهائي
  return {
    id: menuItem.id,
    menu_item_id: menuItem.id,
    title: itemName, // اسم مترجم
    price: displayPrice,
    base_price: basePrice,
    image: getImageUrl(menuItem), // صورة مع proxy
    description: itemDescription, // وصف مترجم
    longDescription: itemDescription,
    category: categoryName, // اسم الفئة مترجم
    category_id: menuItem.category_id || menuItem.category?.id || null,
    rating: menuItem.rating || 0,
    featured: menuItem.is_featured || false,
    sizes: sizesArray.map(size => ({
      id: size.id,
      name: getLocalizedField(size, 'name', lang),
      price: parseFloat(size.price || 0),
      is_default: size.is_default || false,
      original: size,
    })),
    ingredients: ingredientsArray.map(ingredient => ({
      id: ingredient.id,
      name: getLocalizedField(ingredient, 'name', lang),
      price: parseFloat(ingredient.price || 0),
      category: null,
      is_required: ingredient.pivot?.is_required === 1 || false,
      original: ingredient,
    })),
    option_groups: transformedOptionGroups,
    has_option_groups: transformedOptionGroups.length > 0,
    customizations: transformedCustomizations,
    has_customizations: transformedCustomizations && (
      transformedCustomizations.allergens ||
      transformedCustomizations.drinks ||
      transformedCustomizations.toppings ||
      transformedCustomizations.sauces
    ),
    has_allergens: transformedCustomizations?.allergens !== null,
    has_drinks: transformedCustomizations?.drinks !== null,
    has_toppings: transformedCustomizations?.toppings !== null,
    has_sauces: transformedCustomizations?.sauces !== null,
    default_size_id: defaultSizeId,
    has_sizes: sizesArray.length > 0,
    has_ingredients: ingredientsArray.length > 0,
    original: menuItem, // البيانات الأصلية من API
  };
};
```

#### 3.3: getLocalizedField - تفصيل كامل

```javascript
export const getLocalizedField = (obj, fieldName, lang = 'bg') => {
  if (!obj) return '';
  
  // خريطة اللغات
  const langMap = {
    'en': 'en',
    'bg': 'bg',
  };
  
  const suffix = langMap[lang];
  if (suffix) {
    const localizedField = `${fieldName}_${suffix}`;
    // مثال: إذا كان fieldName = 'name' و lang = 'en'
    // localizedField = 'name_en'
    
    if (obj[localizedField]) {
      return obj[localizedField]; // أرجع الحقل المترجم
    }
  }
  
  // Fallback: أرجع الحقل الافتراضي
  return obj[fieldName] || '';
};
```

**أمثلة:**

```javascript
// مثال 1: مع ترجمة
const menuItem = {
  name: "Pizza",
  name_en: "Pizza",
  name_bg: "Пица"
};

getLocalizedField(menuItem, 'name', 'en') // "Pizza"
getLocalizedField(menuItem, 'name', 'bg') // "Пица"
getLocalizedField(menuItem, 'name', 'ar') // "Pizza" (fallback)

// مثال 2: بدون ترجمة
const menuItem2 = {
  name: "Burger"
};

getLocalizedField(menuItem2, 'name', 'en') // "Burger"
getLocalizedField(menuItem2, 'name', 'bg') // "Burger"
```

#### 3.4: getImageUrl - تفصيل كامل

```javascript
const getImageUrl = (menuItem) => {
  let imageUrl = null;
  
  // Step 1: API يوفر image_url كـ full URL
  if (menuItem.image_url) {
    imageUrl = menuItem.image_url;
    // مثال: "https://shahrayar.peaklink.pro/storage/menu-items/pizza.jpg"
  }
  // Step 2: Fallback: بناء URL من relative path
  else if (menuItem.image) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://shahrayar.peaklink.pro/api/v1";
    const storageBaseUrl = API_BASE_URL.replace("/api/v1", "");
    // storageBaseUrl = "https://shahrayar.peaklink.pro"
    
    const cleanPath = menuItem.image.startsWith("/") ? menuItem.image.slice(1) : menuItem.image;
    imageUrl = `${storageBaseUrl}/storage/${cleanPath}`;
  }
  // Step 3: لا توجد صورة
  else {
    return IMAGE_PATHS.placeholder; // "/img/placeholder.png"
  }
  
  // Step 4: استخدام proxy للصور
  return getProxiedImageUrl(imageUrl);
};
```

**مثال على التحويل:**

```javascript
// Input من API:
{
  id: 1,
  name: "Pizza",
  image_url: "https://shahrayar.peaklink.pro/storage/menu-items/pizza.jpg"
}

// بعد getImageUrl():
"/api/images/storage/menu-items/pizza.jpg"
```

### الخطوة 4: Render في LatestItemsSection

```javascript
// في LatestItemsSection.jsx
if (isLoading) {
  return <SectionSkeleton />; // عرض skeleton أثناء التحميل
}

if (!latest || latest.length === 0) {
  return null; // لا تعرض شيء إذا لم تكن هناك بيانات
}

return (
  <section>
    <div className="grid">
      {latest.map((dish, index) => (
        <LazyCard
          key={dish.id}
          dish={dish}
          index={index}
          prefetchRoute={prefetchRoute}
        />
      ))}
    </div>
  </section>
);
```

#### 4.1: LazyCard Component - تفصيل كامل

```javascript
function LazyCard({ dish, index, prefetchRoute }) {
  const { lang } = useLanguage();
  const shouldLoadImmediately = index < 3; // أول 3 بطاقات تحمل فوراً
  const { ref, inView } = useInView({
    threshold: 0.1, // 10% من العنصر يجب أن يكون مرئياً
    rootMargin: "100px", // ابدأ التحميل قبل 100px من الظهور
    triggerOnce: true, // مرة واحدة فقط
  });

  const shouldLoad = shouldLoadImmediately || inView;

  if (!shouldLoad) {
    // عرض skeleton إذا لم يكن مرئياً بعد
    return (
      <div ref={ref}>
        <ProductCardSkeleton />
      </div>
    );
  }

  // عرض البطاقة الكاملة
  return (
    <div className="card">
      <OptimizedImage src={dish.image} alt={dish.title} />
      <h2>{dish.title}</h2>
      <p>{dish.description}</p>
      <p>{formatCurrency(dish.price)}</p>
      <Link href={`/shop/${dish.id}`}>Order</Link>
    </div>
  );
}
```

**شرح useInView:**
- `threshold: 0.1`: 10% من العنصر يجب أن يكون مرئياً
- `rootMargin: "100px"`: ابدأ التحميل قبل 100px من الظهور
- `triggerOnce: true`: لا تتحقق مرة أخرى بعد التحميل

---

## 3. FoodMenuSection (قسم قائمة الطعام) - تفصيل كامل

**الملف:** `src/components/pages/home/FoodMenuSection.jsx`

### الخطوة 1: Component Initialization

```javascript
export default function FoodMenuSection() {
  const { prefetchRoute } = usePrefetchRoute();
  const { selectedBranch, getSelectedBranchId, initialize } = useBranchStore();
  const { lang } = useLanguage();
  
  // Intersection Observer - لا تجلب البيانات حتى يصبح القسم مرئياً
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px", // ابدأ التحميل قبل 200px
    triggerOnce: true,
  });
  
  // State للفئات
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // State للمنتجات
  const [menuItems, setMenuItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  
  // State للفئة المختارة
  const [activeTab, setActiveTab] = useState(null);
```

### الخطوة 2: Initialize Branch

```javascript
useEffect(() => {
  if (!selectedBranch) {
    initialize(); // جلب الفروع إذا لم يكن هناك branch مختار
  }
}, [selectedBranch, initialize]);
```

### الخطوة 3: Fetch Categories - تفصيل كامل

```javascript
useEffect(() => {
  // Step 1: لا تجلب إذا لم يكن القسم مرئياً
  if (!inView) {
    return;
  }

  const fetchCategories = async () => {
    // Step 2: التحقق من وجود branch
    if (!selectedBranch) {
      setIsLoadingCategories(false);
      return;
    }

    setIsLoadingCategories(true);
    try {
      // Step 3: جلب الفئات من API
      const response = await api.menu.getMenuCategories();
      // API Call: GET /menu-categories
      // Response structure:
      // {
      //   success: true,
      //   data: {
      //     categories: [
      //       {
      //         id: 1,
      //         name: "Pizza",
      //         name_en: "Pizza",
      //         name_bg: "Пица",
      //         slug: "pizza",
      //         image: "...",
      //         description: "..."
      //       }
      //     ]
      //   }
      // }
      
      // Step 4: استخراج الفئات من response
      const categoriesData = extractCategoriesFromResponse(response);
      // extractCategoriesFromResponse يبحث عن:
      // - response.data.categories
      // - response.data (إذا كان array)
      // - response (إذا كان array مباشرة)
      
      // Step 5: تحويل الفئات
      const transformed = transformCategories(categoriesData, lang);
      // transformCategories تستدعي transformCategory لكل فئة
      
      setCategories(transformed);
      
      // Step 6: تعيين أول فئة كـ activeTab
      if (transformed.length > 0) {
        setActiveTab((prev) => prev || transformed[0].id);
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
```

#### 3.1: extractCategoriesFromResponse - تفصيل كامل

**الملف:** `src/lib/utils/responseExtractor.js`

```javascript
export function extractCategoriesFromResponse(response) {
  if (!response) return [];
  
  // Structure 1: response.data.categories
  if (response?.success && response?.data?.categories) {
    return Array.isArray(response.data.categories) ? response.data.categories : [];
  }
  
  // Structure 2: response.data هو array مباشرة
  if (response?.success && response?.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Structure 3: response.data.categories أو response.data.data
    return response.data.categories || response.data.data || [];
  }
  
  // Structure 4: response هو array مباشرة
  if (Array.isArray(response)) {
    return response;
  }
  
  // Fallback: محاولة استخراج من أي مكان
  return response?.data?.categories || response?.categories || response?.data || [];
}
```

#### 3.2: transformCategories - تفصيل كامل

```javascript
export const transformCategories = (categories, lang = 'bg') => {
  if (!Array.isArray(categories)) return [];
  return categories.map(category => transformCategory(category, lang)).filter(Boolean);
};

export const transformCategory = (category, lang = 'bg') => {
  if (!category) return null;

  // الحصول على الاسم المترجم
  const categoryName = getLocalizedField(category, 'name', lang) || category.title || "";
  const categoryDescription = getLocalizedField(category, 'description', lang);

  return {
    id: category.id || category.category_id,
    name: categoryName, // اسم مترجم
    slug: category.slug || categoryName.toLowerCase().replace(/\s+/g, "-") || "",
    // slug: "pizza" أو "пица" -> "pizza"
    image: category.image || category.image_url || null,
    description: categoryDescription, // وصف مترجم
    product_count: category.product_count || category.items_count || 0,
    original: category, // البيانات الأصلية
  };
};
```

**مثال على التحويل:**

```javascript
// Input من API:
{
  id: 1,
  name: "Pizza",
  name_en: "Pizza",
  name_bg: "Пица",
  slug: "pizza",
  description: "Pizza category"
}

// بعد transformCategory مع lang = 'bg':
{
  id: 1,
  name: "Пица", // مترجم
  slug: "pizza",
  description: "Pizza category",
  product_count: 0,
  original: { ... }
}
```

### الخطوة 4: Fetch Menu Items - تفصيل كامل

```javascript
// Function لجلب المنتجات
const fetchMenuItems = useCallback(async (categoryId) => {
  // Step 1: الحصول على branchId
  const branchId = getSelectedBranchId();
  if (!branchId || !categoryId) {
    setMenuItems([]);
    return;
  }

  setIsLoadingItems(true);
  try {
    // Step 2: جلب المنتجات من API
    const response = await api.menu.getMenuItems({
      branch_id: branchId,
      category_id: categoryId,
      limit: 10, // 10 منتجات فقط
    });
    // API Call: GET /menu-items?branch_id=1&category_id=1&limit=10
    
    // Step 3: استخراج المنتجات من response
    const { menuItems: items } = extractMenuItemsFromResponse(response);
    // extractMenuItemsFromResponse يبحث عن:
    // - response.data.items.data (pagination structure)
    // - response.data (array)
    // - response (array مباشرة)
    
    // Step 4: تحويل المنتجات
    const transformed = transformMenuItemsToProducts(items, lang);
    setMenuItems(transformed);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    setMenuItems([]);
  } finally {
    setIsLoadingItems(false);
  }
}, [getSelectedBranchId, lang]);

// Step 5: استدعاء fetchMenuItems عند تغيير activeTab
useEffect(() => {
  if (activeTab) {
    fetchMenuItems(activeTab);
  }
}, [activeTab, fetchMenuItems]);
```

#### 4.1: extractMenuItemsFromResponse - تفصيل كامل

```javascript
export function extractMenuItemsFromResponse(response) {
  // Structure 1: Pagination structure
  if (response?.success && response.data?.items?.data) {
    const menuItems = Array.isArray(response.data.items.data) 
      ? response.data.items.data 
      : [];
    const totalCount = response.data.items.total || menuItems.length;
    const currentPage = response.data.items.current_page || 1;
    const lastPage = response.data.items.last_page || 1;
    const perPage = response.data.items.per_page || menuItems.length;
    
    return { 
      menuItems, 
      totalCount,
      pagination: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total: totalCount
      }
    };
  }

  // Structure 2: Direct array
  if (response?.success && response.data) {
    if (Array.isArray(response.data)) {
      return { 
        menuItems: response.data, 
        totalCount: response.data.length,
        pagination: { current_page: 1, last_page: 1, per_page: response.data.length, total: response.data.length }
      };
    }
    // Structure 3: Single item
    if (response.data.id || response.data.menu_item_id) {
      return { 
        menuItems: [response.data], 
        totalCount: 1,
        pagination: { current_page: 1, last_page: 1, per_page: 1, total: 1 }
      };
    }
  }

  // Structure 4: Response is array directly
  if (Array.isArray(response)) {
    return { 
      menuItems: response, 
      totalCount: response.length,
      pagination: { current_page: 1, last_page: 1, per_page: response.length, total: response.length }
    };
  }

  // Default: empty
  return { 
    menuItems: [], 
    totalCount: 0,
    pagination: { current_page: 1, last_page: 1, per_page: 0, total: 0 }
  };
}
```

**مثال على Response Structure:**

```json
{
  "success": true,
  "data": {
    "items": {
      "data": [
        {
          "id": 1,
          "name": "Pizza",
          "price": 15.99
        }
      ],
      "total": 50,
      "current_page": 1,
      "last_page": 5,
      "per_page": 10
    }
  }
}
```

### الخطوة 5: Render Tabs and Items

```javascript
return (
  <section ref={ref}>
    {/* Tabs */}
    <div className="tabs">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setActiveTab(category.id)}
          className={activeTab === category.id ? "active" : ""}
        >
          {category.name}
        </button>
      ))}
    </div>

    {/* Items */}
    {isLoadingItems ? (
      <Skeleton />
    ) : (
      <div className="grid">
        {menuItems.map((item) => (
          <Link href={`/shop/${item.id}`}>
            <img src={item.image} />
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <p>{formatCurrency(item.price)}</p>
          </Link>
        ))}
      </div>
    )}
  </section>
);
```

---

## 4. Branch Store - تفصيل كامل

**الملف:** `src/store/branchStore.js`

### 4.1: Store Structure

```javascript
const useBranchStore = create(
  persist(
    (set, get) => ({
      // State
      selectedBranch: null, // الفرع المختار حالياً
      branches: [], // قائمة جميع الفروع
      branchDetails: null, // تفاصيل الفرع (address, phone, etc.)
      isLoading: false,
      isLoadingDetails: false,

      // Actions
      fetchBranches: async () => { ... },
      setSelectedBranch: (branch) => { ... },
      getSelectedBranchId: () => { ... },
      fetchBranchDetails: async (branchId) => { ... },
      initialize: async () => { ... },
    }),
    {
      name: "branch-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedBranch: state.selectedBranch,
        branches: state.branches,
        // لا نحفظ branchDetails - نجلبها fresh في كل session
      }),
    }
  )
);
```

### 4.2: initialize Function - تفصيل كامل

```javascript
initialize: async () => {
  const { branches, selectedBranch } = get();
  
  // Step 1: إذا كان branch مختار من localStorage، لا حاجة للانتظار
  if (selectedBranch) {
    return; // توقف هنا
  }
  
  // Step 2: إذا لم تكن الفروع محملة، اجلبها
  if (branches.length === 0) {
    await get().fetchBranches();
  }
  
  // Step 3: تأكد من وجود branch مختار
  if (!get().selectedBranch && get().branches.length > 0) {
    // البحث عن branch مع ID = 1 (للاختبار)
    const testBranch = get().branches.find(b => b.id === 1 || b.branch_id === 1);
    // أو الفرع الرئيسي
    const mainBranch = get().branches.find(b => b.is_main === true) || get().branches[0];
    const selected = testBranch || mainBranch;
    set({ selectedBranch: selected });
    
    // Step 4: جلب تفاصيل الفرع المختار
    const branchId = selected?.id || selected?.branch_id;
    if (branchId) {
      get().fetchBranchDetails(branchId);
    }
  } else if (get().selectedBranch) {
    // Step 5: إذا كان branch مختار، جلب التفاصيل إذا لم تكن محملة
    const branchId = get().selectedBranch.id || get().selectedBranch.branch_id;
    const currentDetails = get().branchDetails;
    const currentBranchId = currentDetails?.id || currentDetails?.branch_id;
    
    if (branchId && currentBranchId !== branchId) {
      get().fetchBranchDetails(branchId);
    }
  }
}
```

### 4.3: fetchBranches Function - تفصيل كامل

```javascript
fetchBranches: async () => {
  // Step 1: إنشاء cache key
  const cacheKey = generateCacheKey("/branches", {}, null);
  const ttl = CACHE_DURATION.BRANCHES || 10 * 60 * 1000; // 10 دقائق
  
  // Step 2: التحقق من cache
  const cached = getCachedData(cacheKey);
  if (cached !== null) {
    const branches = Array.isArray(cached.data) 
      ? cached.data 
      : cached.data?.branches || [];
    
    set({ branches, isLoading: false });

    // Step 3: إذا لم يكن هناك branch مختار، اختر الأول
    if (!get().selectedBranch && branches.length > 0) {
      const testBranch = branches.find(b => b.id === 1 || b.branch_id === 1);
      const mainBranch = branches.find(b => b.is_main === true) || branches[0];
      set({ selectedBranch: testBranch || mainBranch });
    }

    return { success: true, branches };
  }

  // Step 4: التحقق من pending request
  const pending = getPendingRequest(cacheKey);
  if (pending) {
    try {
      const response = await pending;
      if (response.success && response.data) {
        const branches = Array.isArray(response.data) 
          ? response.data 
          : response.data.branches || [];
        set({ branches, isLoading: false });
        return { success: true, branches };
      }
    } catch (error) {
      // إذا فشل pending request، استمر للجلب الجديد
    }
  }

  // Step 5: جلب من API
  set({ isLoading: true });
  try {
    const fetchPromise = api.branches.getAllBranches()
      .then((response) => {
        setCachedData(cacheKey, response, ttl);
        return response;
      });

    setPendingRequest(cacheKey, fetchPromise);

    const response = await fetchPromise;
    
    if (response.success && response.data) {
      const branches = Array.isArray(response.data) 
        ? response.data 
        : response.data.branches || [];
      
      set({ branches, isLoading: false });

      // Step 6: اختيار branch افتراضي
      if (!get().selectedBranch && branches.length > 0) {
        const testBranch = branches.find(b => b.id === 1 || b.branch_id === 1);
        const mainBranch = branches.find(b => b.is_main === true) || branches[0];
        set({ selectedBranch: testBranch || mainBranch });
      }

      return { success: true, branches };
    } else {
      set({ isLoading: false });
      return { 
        success: false, 
        error: response.message || "Failed to fetch branches" 
      };
    }
  } catch (error) {
    set({ isLoading: false });
    return { 
      success: false, 
      error: error.message || "An error occurred while fetching branches" 
    };
  }
}
```

---

## 5. API Cache System - تفصيل كامل

**الملف:** `src/lib/utils/apiCache.js`

### 5.1: Cache Structure

```javascript
// Cache entry structure: { data, timestamp, ttl }
const cache = new Map();
// مثال:
// cache.set("key", {
//   data: { success: true, data: [...] },
//   timestamp: 1234567890,
//   ttl: 900000 // 15 دقيقة
// })

const pendingRequests = new Map();
// لتتبع الـ requests القيد التنفيذ (منع duplicate)
```

### 5.2: generateCacheKey - تفصيل كامل

```javascript
export function generateCacheKey(url, params = {}, branchId = null) {
  // Step 1: ترتيب params أبجدياً
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join("&");
  // مثال: params = { limit: 10, page: 1 }
  // sortedParams = "limit=10&page=1"
  
  // Step 2: بناء branch part
  const branchPart = branchId ? `branch=${branchId}` : "";
  // branchPart = "branch=1"
  
  // Step 3: بناء params part
  const paramsPart = sortedParams ? `&${sortedParams}` : "";
  // paramsPart = "&limit=10&page=1"
  
  // Step 4: بناء key النهائي
  return `${url}?${branchPart}${paramsPart}`;
  // النتيجة: "/menu-items?branch=1&limit=10&page=1"
}
```

### 5.3: getCachedData - تفصيل كامل

```javascript
export function getCachedData(key) {
  // Step 1: البحث في cache
  const entry = cache.get(key);
  
  if (!entry) {
    return null; // لا يوجد في cache
  }
  
  // Step 2: حساب العمر
  const now = Date.now();
  const age = now - entry.timestamp;
  // age = الوقت الحالي - وقت الحفظ
  
  // Step 3: التحقق من انتهاء الصلاحية
  if (age > entry.ttl) {
    cache.delete(key); // حذف من cache
    return null; // منتهي الصلاحية
  }
  
  // Step 4: أرجع البيانات
  return entry.data;
}
```

**مثال:**

```javascript
// عند الحفظ:
setCachedData("key", { data: "test" }, 900000); // TTL = 15 دقيقة
// timestamp = 1000000000

// بعد 10 دقائق:
getCachedData("key");
// age = 600000 (10 دقائق)
// age < ttl (900000)
// return { data: "test" } ✓

// بعد 20 دقيقة:
getCachedData("key");
// age = 1200000 (20 دقيقة)
// age > ttl (900000)
// cache.delete("key")
// return null ✗
```

### 5.4: setCachedData - تفصيل كامل

```javascript
export function setCachedData(key, data, ttl = 5 * 60 * 1000) {
  cache.set(key, {
    data, // البيانات
    timestamp: Date.now(), // وقت الحفظ
    ttl, // Time To Live (بالمللي ثانية)
  });
}
```

### 5.5: getPendingRequest / setPendingRequest - تفصيل كامل

```javascript
export function getPendingRequest(key) {
  return pendingRequests.get(key) || null;
}

export function setPendingRequest(key, promise) {
  pendingRequests.set(key, promise);
  
  // تنظيف تلقائي بعد انتهاء Promise
  promise
    .finally(() => {
      pendingRequests.delete(key);
    });
}
```

**الهدف:** منع duplicate requests

**مثال:**

```javascript
// Request 1:
const promise1 = fetch('/api/data');
setPendingRequest("key", promise1);

// Request 2 (قبل انتهاء Request 1):
const pending = getPendingRequest("key");
if (pending) {
  // استخدم نفس Promise بدلاً من request جديد
  const data = await pending;
}

// بعد انتهاء Promise:
// pendingRequests.delete("key") تلقائياً
```

---

## 6. useApiCache Hook - تفصيل كامل

**الملف:** `src/hooks/useApiCache.js`

```javascript
export function useApiCache(cacheType = "PRODUCTS") {
  const { selectedBranch } = useBranchStore();
  const branchId = selectedBranch?.id || selectedBranch?.branch_id || null;
  const previousBranchIdRef = useRef(branchId);

  // Step 1: الحصول على TTL حسب نوع الـ cache
  const getTTL = useCallback(() => {
    return CACHE_DURATION[cacheType] || CACHE_DURATION.PRODUCTS;
  }, [cacheType]);

  // Step 2: مسح cache عند تغيير الفرع
  useEffect(() => {
    if (branchId && previousBranchIdRef.current && previousBranchIdRef.current !== branchId) {
      clearBranchCache(previousBranchIdRef.current);
    }
    previousBranchIdRef.current = branchId;
  }, [branchId]);

  // Step 3: getCachedOrFetch function
  const getCachedOrFetch = useCallback(
    async (url, params = {}, fetchFn, customTTL = null) => {
      // Step 3.1: إنشاء cache key
      const cacheKey = generateCacheKey(url, params, branchId);
      const ttl = customTTL || getTTL();

      // Step 3.2: التحقق من cache
      const cached = getCachedData(cacheKey);
      if (cached !== null) {
        return cached; // أرجع من cache
      }

      // Step 3.3: التحقق من pending request
      const pending = getPendingRequest(cacheKey);
      if (pending) {
        return pending; // انتظر نفس request
      }

      // Step 3.4: جلب جديد
      const fetchPromise = fetchFn()
        .then((data) => {
          setCachedData(cacheKey, data, ttl); // حفظ في cache
          return data;
        })
        .catch((error) => {
          throw error; // لا نحفظ الأخطاء
        });

      setPendingRequest(cacheKey, fetchPromise);
      return fetchPromise;
    },
    [branchId, getTTL]
  );

  return {
    getCachedOrFetch,
    invalidateCache,
    clearCurrentBranchCache,
    branchId,
  };
}
```

**مثال على الاستخدام:**

```javascript
const { getCachedOrFetch } = useApiCache("HIGHLIGHTS");

const response = await getCachedOrFetch(
  "/menu-items/highlights",
  {},
  () => api.menu.getHighlights()
);

// الخطوات:
// 1. generateCacheKey("/menu-items/highlights", {}, branchId)
// 2. getCachedData(cacheKey) - إذا موجود، أرجع
// 3. getPendingRequest(cacheKey) - إذا موجود، انتظر
// 4. api.menu.getHighlights() - جلب جديد
// 5. setCachedData(cacheKey, response, ttl) - حفظ
// 6. return response
```

---

## 7. أمثلة على البيانات - قبل وبعد التحويل

### 7.1: Menu Item من API

```json
{
  "id": 1,
  "name": "Pizza",
  "name_en": "Pizza",
  "name_bg": "Пица",
  "description": "Delicious pizza",
  "description_en": "Delicious pizza",
  "description_bg": "Вкусна пица",
  "price": 15.99,
  "default_price": 15.99,
  "image_url": "https://shahrayar.peaklink.pro/storage/menu-items/pizza.jpg",
  "category_id": 1,
  "category": {
    "id": 1,
    "name": "Main Dishes",
    "name_en": "Main Dishes",
    "name_bg": "Основни ястия"
  },
  "sizes": [
    {
      "id": 1,
      "name": "Small",
      "name_en": "Small",
      "name_bg": "Малък",
      "price": 12.99,
      "is_default": false
    },
    {
      "id": 2,
      "name": "Large",
      "name_en": "Large",
      "name_bg": "Голям",
      "price": 18.99,
      "is_default": true
    }
  ],
  "ingredients": [],
  "rating": 4.5,
  "is_featured": true
}
```

### 7.2: بعد transformMenuItemToProduct (lang = 'bg')

```javascript
{
  id: 1,
  menu_item_id: 1,
  title: "Пица", // مترجم
  price: 15.99,
  base_price: 15.99,
  image: "/api/images/storage/menu-items/pizza.jpg", // مع proxy
  description: "Вкусна пица", // مترجم
  longDescription: "Вкусна пица",
  category: "Основни ястия", // مترجم
  category_id: 1,
  rating: 4.5,
  featured: true,
  sizes: [
    {
      id: 1,
      name: "Малък", // مترجم
      price: 12.99,
      is_default: false,
      original: { ... }
    },
    {
      id: 2,
      name: "Голям", // مترجم
      price: 18.99,
      is_default: true,
      original: { ... }
    }
  ],
  ingredients: [],
  option_groups: [],
  has_option_groups: false,
  customizations: null,
  has_customizations: false,
  default_size_id: 2,
  has_sizes: true,
  has_ingredients: false,
  original: { /* البيانات الأصلية من API */ }
}
```

---

## 8. ملخص تدفق البيانات الكامل - خطوة بخطوة

### عند تحميل الصفحة:

1. **Page Component Mount**
   - `useBranchStore().initialize()` → جلب الفروع
   - `prefetchWebsiteSlides()` → جلب البانر مبكراً

2. **HighlightsProvider Mount**
   - `useEffect` → `fetchHighlights()`
   - `getCachedOrFetch()` → التحقق من cache
   - `api.menu.getHighlights()` → جلب من API
   - `transformMenuItemsToProducts()` → تحويل البيانات
   - `setPopular()`, `setLatest()`, `setChefSpecial()`

3. **BannerSection Mount**
   - `useWebsiteSlides()` → Hook
   - `fetchWebsiteSlides()` → جلب الشرائح
   - `proxyObjectImages()` → تحويل URLs
   - Render Swiper

4. **LatestItemsSection Mount**
   - `useHighlights()` → من Context
   - `latest` → البيانات جاهزة
   - Render Grid

5. **FoodMenuSection (عند الظهور)**
   - `useInView()` → ينتظر حتى يصبح مرئياً
   - `api.menu.getMenuCategories()` → جلب الفئات
   - `transformCategories()` → تحويل الفئات
   - `setActiveTab(firstCategory)` → اختيار أول فئة
   - `api.menu.getMenuItems({ category_id })` → جلب المنتجات
   - `transformMenuItemsToProducts()` → تحويل المنتجات
   - Render Tabs + Items

---

## 9. Cache Duration Constants

```javascript
export const CACHE_DURATION = {
  PRODUCTS: 5 * 60 * 1000,        // 5 دقائق
  CATEGORIES: 15 * 60 * 1000,      // 15 دقيقة (لا تتغير كثيراً)
  PRODUCT_DETAIL: 10 * 60 * 1000,  // 10 دقائق
  HIGHLIGHTS: 10 * 60 * 1000,      // 10 دقائق (لا تتغير كثيراً)
  WEBSITE_SLIDES: 15 * 60 * 1000,  // 15 دقيقة (لا تتغير كثيراً)
  BRANCHES: 10 * 60 * 1000,        // 10 دقائق
};
```

---

## 10. Error Handling

### 10.1: في useWebsiteSlides

```javascript
catch (err) {
  const errorMessage = err?.message || err?.data?.message || "Failed to load website slides";
  setError(errorMessage);
  console.error("Website slides error:", errorMessage);
  setSlides([]); // عرض array فارغ بدلاً من error
}
```

### 10.2: في HighlightsContext

```javascript
catch (err) {
  console.error("Error fetching highlights:", err);
  setError(err.message || "Failed to fetch highlights");
  setPopular([]);
  setLatest([]);
  setChefSpecial([]);
}
```

### 10.3: في FoodMenuSection

```javascript
catch (error) {
  console.error("Error fetching categories:", error);
  setCategories([]); // عرض array فارغ
}
```

**الاستراتيجية:** 
- لا نعرض error messages للمستخدم (إلا في حالات خاصة)
- نعرض arrays فارغة أو skeletons
- نطبع الأخطاء في console للـ debugging

---

## خاتمة

هذا التحليل المفصل يشرح كل خطوة في تدفق البيانات في صفحة HOME. كل function، كل hook، كل transformation تم شرحه بالتفصيل مع أمثلة عملية.








