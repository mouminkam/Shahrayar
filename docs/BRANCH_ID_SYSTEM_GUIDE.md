# دليل شامل لنظام Branch ID

## نظرة عامة

نظام Branch ID هو نظام إدارة الفروع في التطبيق. يسمح للمستخدمين باختيار الفرع الذي يريدون الطلب منه، ويضمن أن جميع طلبات API تتضمن معرف الفرع الصحيح للحصول على البيانات المناسبة.

---

## ما هو Branch ID؟

**Branch ID** هو معرف فريد لكل فرع من فروع المطعم. يستخدم لتحديد:
- المنتجات المتاحة في هذا الفرع
- أسعار المنتجات
- رسوم التوصيل
- معلومات الاتصال والعنوان
- ساعات العمل
- الطهاة المتاحين

---

## البنية الأساسية للنظام

### 1. Branch Store (Zustand Store)

#### `src/store/branchStore.js`

هذا الملف يحتوي على إدارة الحالة الكاملة للفروع باستخدام Zustand مع دعم Persistence.

#### الحالة (State):

```javascript
{
  selectedBranch: null,        // الفرع المحدد حالياً
  branches: [],                // قائمة جميع الفروع
  branchDetails: null,         // تفاصيل كاملة للفرع المحدد
  isLoading: false,           // حالة التحميل للفروع
  isLoadingDetails: false,    // حالة التحميل للتفاصيل
}
```

#### الوظائف الرئيسية (Actions):

1. **`fetchBranches()`** - جلب جميع الفروع
2. **`setSelectedBranch(branch)`** - تحديد فرع معين
3. **`getSelectedBranchId()`** - الحصول على ID الفرع المحدد
4. **`fetchBranchDetails(branchId)`** - جلب تفاصيل فرع معين
5. **`initialize()`** - تهيئة النظام واختيار فرع افتراضي
6. **`setBranchFromUserProfile(branchId)`** - تحديد فرع من ملف المستخدم
7. **`syncWithUserProfile()`** - مزامنة الفرع مع ملف المستخدم

---

## كيفية اختيار Branch ID

### 2. خوارزمية الاختيار التلقائي

النظام يتبع ترتيب أولويات محدد لاختيار الفرع:

#### المرحلة 1: التحقق من الفرع المحفوظ
```javascript
// إذا كان هناك فرع محفوظ في localStorage
if (selectedBranch) {
  // استخدامه مباشرة
  return;
}
```

#### المرحلة 2: التحقق من المستخدم المسجل دخوله
```javascript
// إذا كان المستخدم مسجل دخول
if (authStore.isAuthenticated && authStore.user?.branch_id) {
  // استخدام branch_id من ملف المستخدم
  await setBranchFromUserProfile(userBranchId);
}
```

#### المرحلة 3: جلب الفرع الافتراضي من API
```javascript
// إذا لم يكن المستخدم مسجل دخول
const response = await api.branches.getDefaultBranch();
if (response.success && response.data?.branch) {
  // استخدام الفرع الافتراضي
  set({ selectedBranch: defaultBranch });
}
```

#### المرحلة 4: Fallback - استخدام الفرع الرئيسي
```javascript
// إذا فشل جلب الفرع الافتراضي
const branches = get().branches;
if (branches.length > 0) {
  // البحث عن فرع رئيسي (is_main === true)
  const mainBranch = branches.find(b => b.is_main === true) || branches[0];
  set({ selectedBranch: mainBranch });
}
```

### 3. ترتيب الأولويات (Priority Order)

```
1. الفرع المحفوظ في localStorage (أعلى أولوية)
   ↓
2. branch_id من ملف المستخدم (إذا كان مسجل دخول)
   ↓
3. الفرع الافتراضي من API (/branches/default)
   ↓
4. الفرع الرئيسي (is_main === true)
   ↓
5. أول فرع في القائمة (أقل أولوية)
```

---

## حفظ Branch ID

### 4. نظام الحفظ (Persistence)

#### استخدام Zustand Persist:

```javascript
{
  name: "branch-storage",  // مفتاح localStorage
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    selectedBranch: state.selectedBranch,  // يحفظ الفرع المحدد
    branches: state.branches,              // يحفظ قائمة الفروع
    // لا يحفظ branchDetails - يتم جلبها من جديد في كل جلسة
  }),
}
```

#### ما يتم حفظه:
- ✅ `selectedBranch` - الفرع المحدد حالياً
- ✅ `branches` - قائمة جميع الفروع
- ❌ `branchDetails` - لا يتم حفظه (يتم جلب تفاصيل جديدة في كل جلسة)

#### لماذا لا نحفظ branchDetails؟
- لضمان الحصول على أحدث البيانات (العنوان، الهاتف، ساعات العمل)
- قد تتغير تفاصيل الفرع بين الجلسات

---

## استخدام Branch ID في API Calls

### 5. Axios Interceptor

#### `src/api/config/axios.js`

النظام يضيف `branch_id` تلقائياً إلى جميع طلبات API من خلال Request Interceptor.

#### كيفية الحصول على Branch ID:

```javascript
const getBranchId = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const branchStorage = localStorage.getItem('branch-storage');
    if (branchStorage) {
      const parsed = JSON.parse(branchStorage);
      const selectedBranch = parsed.state?.selectedBranch;
      return selectedBranch?.id || selectedBranch?.branch_id || null;
    }
  } catch (error) {
    console.error('Error reading branch from storage:', error);
  }
  
  return null;
};
```

#### إضافة branch_id إلى الطلبات:

**للطلبات GET و DELETE:**
```javascript
if (method === 'get' || method === 'delete') {
  // إضافة branch_id كمعامل في URL
  config.params = config.params || {};
  if (!config.params.branch_id) {
    config.params.branch_id = branchId;
  }
}
```

**للطلبات POST و PUT و PATCH:**
```javascript
if (method === 'post' || method === 'put' || method === 'patch') {
  if (config.data instanceof FormData) {
    // إذا كانت البيانات FormData
    if (!config.data.has('branch_id')) {
      config.data.append('branch_id', branchId);
    }
  } else if (config.data && typeof config.data === 'object') {
    // إذا كانت البيانات كائن JavaScript
    if (!config.data.branch_id) {
      config.data = { ...config.data, branch_id: branchId };
    }
  } else if (config.data && typeof config.data === 'string') {
    // إذا كانت البيانات JSON string
    const parsed = JSON.parse(config.data);
    if (!parsed.branch_id) {
      parsed.branch_id = branchId;
      config.data = JSON.stringify(parsed);
    }
  } else {
    // إذا لم تكن هناك بيانات
    config.data = { branch_id: branchId };
  }
}
```

### 6. URLs التي لا تحتاج branch_id

بعض الـ endpoints لا تحتاج `branch_id`:

```javascript
const shouldExcludeBranchId = (url) => {
  // Exact matches
  if (urlPath === '/branches' || 
      urlPath === '/branches/default') {
    return true;
  }
  
  // Pattern matches
  const excludePatterns = [
    '/auth/google/web-login',    // تسجيل دخول Google
    '/customer/',                 // بيانات العميل
    '/notifications/',            // الإشعارات
    '/payments/stripe/config',    // إعدادات Stripe
  ];
  
  return excludePatterns.some(pattern => urlPath.includes(pattern));
};
```

**لماذا لا نضيف branch_id لهذه URLs؟**
- `/branches` - لجلب جميع الفروع (لا نحتاج branch_id)
- `/branches/default` - لجلب الفرع الافتراضي
- `/auth/*` - عمليات المصادقة لا تحتاج branch_id
- `/customer/*` - بيانات المستخدم عامة
- `/notifications/*` - الإشعارات عامة

---

## واجهة المستخدم - Branch Selector

### 7. مكون اختيار الفرع

#### `src/components/layout/header/BranchSelector.jsx`

مكون يسمح للمستخدمين باختيار الفرع من قائمة منسدلة.

#### الميزات:

1. **عرض الفرع الحالي:**
   ```jsx
   const branchName = selectedBranch?.name || selectedBranch?.title;
   ```

2. **قائمة الفروع:**
   ```jsx
   {branches.map((branch) => {
     const branchId = branch.id || branch.branch_id;
     const isSelected = (selectedBranch?.id || selectedBranch?.branch_id) === branchId;
     return (
       <button onClick={() => handleBranchChange(branchId)}>
         {branch.name}
       </button>
     );
   })}
   ```

3. **تغيير الفرع:**
   ```javascript
   const handleBranchChange = async (branchId) => {
     const branch = branches.find(b => (b.id || b.branch_id) === branchId);
     
     // تحديث الفرع المحدد
     setSelectedBranch(branch);
     
     // مسح السلة (المنتجات قد تختلف بين الفروع)
     clearCart();
     
     // إعادة تعيين رسوم التوصيل
     resetDeliveryCharge();
     
     // إعادة تحميل الصفحة
     router.refresh();
   };
   ```

#### لماذا نمسح السلة عند تغيير الفرع؟
- المنتجات قد تختلف بين الفروع
- الأسعار قد تختلف
- الخيارات والتخصيصات قد تختلف
- رسوم التوصيل قد تختلف

---

## التكامل مع النظام

### 8. Branch Initializer

#### `src/components/layout/BranchInitializer.jsx`

مكون يتم تحميله مرة واحدة عند بدء التطبيق لتهيئة نظام الفروع.

```jsx
export default function BranchInitializer() {
  const { initialize } = useBranchStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null; // لا يعرض أي شيء
}
```

**الاستخدام في Layout:**
```jsx
<LanguageProvider>
  <BranchInitializer />  {/* تهيئة الفروع */}
  <Header />
  <main>{children}</main>
</LanguageProvider>
```

---

## التكامل مع Cache System

### 9. Cache Management

#### `src/lib/utils/apiCache.js`

نظام الـ Cache يأخذ Branch ID في الاعتبار:

```javascript
export function generateCacheKey(url, params = {}, branchId = null, language = null) {
  const branchPart = branchId ? `branch=${branchId}` : "";
  const langPart = language ? (branchPart ? `&lang=${language}` : `lang=${language}`) : "";
  
  // Format: url?branch=X&lang=Y&params
  return `${url}?${branchPart}${langPart}${paramsPart}`;
}
```

**الفائدة:**
- كل فرع له cache منفصل
- عند تغيير الفرع، يتم جلب البيانات الجديدة
- يحسن الأداء بتخزين البيانات لكل فرع

**مثال:**
```
/branches/1/products  → Cache key: "/products?branch=1&lang=en"
/branches/2/products  → Cache key: "/products?branch=2&lang=en"
```

---

## التكامل مع ملف المستخدم

### 10. مزامنة مع User Profile

#### عند تسجيل الدخول:

```javascript
// في authStore بعد تسجيل الدخول الناجح
if (user.branch_id) {
  await branchStore.setBranchFromUserProfile(user.branch_id);
}
```

#### عند تحديث ملف المستخدم:

```javascript
// إذا تم تحديث branch_id في ملف المستخدم
await branchStore.syncWithUserProfile();
```

#### دالة setBranchFromUserProfile:

```javascript
setBranchFromUserProfile: async (branchId) => {
  // البحث في قائمة الفروع الموجودة
  const existingBranch = branches.find(
    (b) => b.id === branchId || b.branch_id === branchId
  );

  if (existingBranch) {
    // استخدام الفرع الموجود
    set({ selectedBranch: existingBranch });
    await fetchBranchDetails(branchId);
  } else {
    // جلب الفرع من API
    const response = await fetchBranchDetails(branchId);
    if (response.success) {
      set({ selectedBranch: response.data });
    }
  }
}
```

---

## استخدام Branch ID في المكونات

### 11. أمثلة عملية

#### مثال 1: الحصول على Branch ID الحالي

```jsx
"use client";
import useBranchStore from "@/store/branchStore";

function MyComponent() {
  const { selectedBranch, getSelectedBranchId } = useBranchStore();
  
  const branchId = getSelectedBranchId();
  const branchName = selectedBranch?.name;
  
  return (
    <div>
      <p>Current Branch: {branchName}</p>
      <p>Branch ID: {branchId}</p>
    </div>
  );
}
```

#### مثال 2: جلب تفاصيل الفرع

```jsx
function BranchInfo() {
  const { 
    selectedBranch, 
    branchDetails, 
    fetchBranchDetails,
    getBranchContactInfo 
  } = useBranchStore();
  
  useEffect(() => {
    const branchId = selectedBranch?.id || selectedBranch?.branch_id;
    if (branchId) {
      fetchBranchDetails(branchId);
    }
  }, [selectedBranch]);
  
  const contactInfo = getBranchContactInfo();
  
  return (
    <div>
      <h3>{selectedBranch?.name}</h3>
      {contactInfo && (
        <>
          <p>Address: {contactInfo.address}</p>
          <p>Phone: {contactInfo.phone}</p>
          <p>Email: {contactInfo.email}</p>
        </>
      )}
    </div>
  );
}
```

#### مثال 3: استخدام Branch ID في API Call

```jsx
function ProductList() {
  const { getSelectedBranchId } = useBranchStore();
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      const branchId = getSelectedBranchId();
      // branch_id سيتم إضافته تلقائياً من axios interceptor
      const response = await api.menu.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    };
    
    fetchProducts();
  }, []);
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### مثال 4: تغيير الفرع برمجياً

```jsx
function AdminPanel() {
  const { branches, setSelectedBranch } = useBranchStore();
  
  const handleSelectBranch = (branchId) => {
    const branch = branches.find(b => 
      (b.id || b.branch_id) === branchId
    );
    
    if (branch) {
      setSelectedBranch(branch);
      // سيتم مسح السلة تلقائياً
      // سيتم إعادة تحميل البيانات تلقائياً
    }
  };
  
  return (
    <select onChange={(e) => handleSelectBranch(e.target.value)}>
      {branches.map(branch => (
        <option 
          key={branch.id || branch.branch_id} 
          value={branch.id || branch.branch_id}
        >
          {branch.name}
        </option>
      ))}
    </select>
  );
}
```

---

## Helper Functions

### 12. دوال مساعدة

#### `getBranchContactInfo()`

```javascript
getBranchContactInfo: () => {
  const details = get().branchDetails;
  if (!details) return null;
  
  return {
    address: details.address || details.location || null,
    email: details.email || details.contact_email || null,
    phone: details.phone || details.contact_phone || details.telephone || null,
  };
}
```

**الاستخدام:**
```jsx
const { getBranchContactInfo } = useBranchStore();
const contact = getBranchContactInfo();

if (contact) {
  console.log(contact.address);  // العنوان
  console.log(contact.email);     // البريد الإلكتروني
  console.log(contact.phone);     // الهاتف
}
```

#### `getBranchWorkingHours()`

```javascript
getBranchWorkingHours: () => {
  const details = get().branchDetails;
  if (!details) return null;
  
  return details.working_hours || details.opening_hours || details.hours || null;
}
```

#### `getBranchLocation()`

```javascript
getBranchLocation: () => {
  const details = get().branchDetails;
  if (!details) return null;
  
  return {
    latitude: details.latitude || details.lat || null,
    longitude: details.longitude || details.lng || details.lon || null,
  };
}
```

**الاستخدام:**
```jsx
const { getBranchLocation } = useBranchStore();
const location = getBranchLocation();

if (location) {
  // استخدام الإحداثيات في Google Maps
  const mapUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
}
```

---

## معالجة الأخطاء والاستثناءات

### 13. حالات خاصة

#### حالة 1: لا يوجد فرع محدد

```javascript
const branchId = getSelectedBranchId();
if (!branchId) {
  // إما انتظار التهيئة أو استخدام قيمة افتراضية
  console.warn("No branch selected");
  return;
}
```

#### حالة 2: فشل جلب الفروع

```javascript
const { fetchBranches } = useBranchStore();

try {
  const result = await fetchBranches();
  if (!result.success) {
    // معالجة الخطأ
    console.error("Failed to fetch branches:", result.error);
  }
} catch (error) {
  console.error("Error:", error);
}
```

#### حالة 3: الفرع غير موجود في القائمة

```javascript
setBranchFromUserProfile: async (branchId) => {
  // البحث في القائمة أولاً
  const existingBranch = branches.find(
    (b) => b.id === branchId || b.branch_id === branchId
  );

  if (!existingBranch) {
    // جلب الفرع من API
    const response = await fetchBranchDetails(branchId);
    if (response.success) {
      set({ selectedBranch: response.data });
    } else {
      // معالجة الخطأ
      console.error("Branch not found");
    }
  }
}
```

#### حالة 4: تغيير الفرع أثناء وجود منتجات في السلة

```javascript
const handleBranchChange = async (branchId) => {
  // التحقق من وجود منتجات في السلة
  const cartItems = cartStore.items;
  
  if (cartItems.length > 0) {
    // إظهار تنبيه للمستخدم
    const confirmed = confirm(
      "Changing branch will clear your cart. Continue?"
    );
    
    if (!confirmed) return;
  }
  
  // مسح السلة
  clearCart();
  // تغيير الفرع
  setSelectedBranch(branch);
};
```

---

## أفضل الممارسات (Best Practices)

### 14. نصائح للاستخدام الصحيح

#### ✅ افعل (Do):

1. **استخدم `getSelectedBranchId()` للحصول على ID:**
   ```jsx
   const { getSelectedBranchId } = useBranchStore();
   const branchId = getSelectedBranchId();
   ```

2. **تحقق من وجود فرع قبل الاستخدام:**
   ```jsx
   const { selectedBranch } = useBranchStore();
   if (!selectedBranch) {
     return <div>Loading branch...</div>;
   }
   ```

3. **استخدم Helper Functions:**
   ```jsx
   const { getBranchContactInfo } = useBranchStore();
   const contact = getBranchContactInfo();
   ```

4. **اترك axios interceptor يضيف branch_id تلقائياً:**
   ```jsx
   // ✅ صحيح - لا تضيف branch_id يدوياً
   const response = await api.menu.getProducts();
   
   // ❌ خطأ - لا حاجة لإضافة branch_id
   const response = await api.menu.getProducts({ branch_id: branchId });
   ```

5. **استخدم `initialize()` عند بدء التطبيق:**
   ```jsx
   useEffect(() => {
     initialize();
   }, []);
   ```

#### ❌ لا تفعل (Don't):

1. **لا تضيف branch_id يدوياً في API calls:**
   ```jsx
   // ❌ خطأ
   const response = await api.menu.getProducts({ branch_id: branchId });
   
   // ✅ صحيح - axios interceptor يضيفه تلقائياً
   const response = await api.menu.getProducts();
   ```

2. **لا تستخدم branch_id مباشرة من localStorage:**
   ```jsx
   // ❌ خطأ
   const branchId = JSON.parse(localStorage.getItem('branch-storage')).state.selectedBranch.id;
   
   // ✅ صحيح
   const { getSelectedBranchId } = useBranchStore();
   const branchId = getSelectedBranchId();
   ```

3. **لا تنسى مسح السلة عند تغيير الفرع:**
   ```jsx
   // ❌ خطأ
   setSelectedBranch(newBranch);
   // نسيان مسح السلة
   
   // ✅ صحيح
   setSelectedBranch(newBranch);
   clearCart();
   resetDeliveryCharge();
   ```

4. **لا تحفظ branchDetails في localStorage:**
   - يتم جلبها من جديد في كل جلسة لضمان أحدث البيانات

---

## التدفق الكامل (Complete Flow)

### 15. دورة حياة Branch ID

```
1. تحميل التطبيق
   ↓
2. BranchInitializer يتم تحميله
   ↓
3. استدعاء initialize()
   ↓
4. التحقق من localStorage
   ├─ إذا وُجد فرع محفوظ → استخدامه
   └─ إذا لم يوجد → المتابعة
   ↓
5. التحقق من المستخدم المسجل دخوله
   ├─ إذا كان مسجل دخول → استخدام branch_id من ملفه
   └─ إذا لم يكن → المتابعة
   ↓
6. جلب الفرع الافتراضي من API
   ├─ إذا نجح → استخدامه
   └─ إذا فشل → Fallback
   ↓
7. استخدام الفرع الرئيسي أو أول فرع
   ↓
8. حفظ الفرع في localStorage
   ↓
9. جلب تفاصيل الفرع
   ↓
10. جميع طلبات API تتضمن branch_id تلقائياً
```

---

## التكامل مع API Cache

### 16. Cache Key Generation

```javascript
// كل طلب API يحتوي على branch_id في cache key
generateCacheKey("/products", {}, branchId, language)
// Result: "/products?branch=1&lang=en"

// عند تغيير الفرع
generateCacheKey("/products", {}, newBranchId, language)
// Result: "/products?branch=2&lang=en"
// → Cache جديد منفصل
```

**الفائدة:**
- بيانات كل فرع مخزنة بشكل منفصل
- لا توجد مشاكل في عرض بيانات فرع خاطئ
- تحسين الأداء

---

## الاختبار (Testing)

### 17. اختبار نظام Branch ID

#### مثال اختبار للـ Store:

```javascript
import { renderHook, act } from '@testing-library/react';
import useBranchStore from '../branchStore';

test('should set selected branch', () => {
  const { result } = renderHook(() => useBranchStore());
  
  const mockBranch = { id: 1, name: 'Test Branch' };
  
  act(() => {
    result.current.setSelectedBranch(mockBranch);
  });
  
  expect(result.current.selectedBranch).toEqual(mockBranch);
  expect(result.current.getSelectedBranchId()).toBe(1);
});
```

#### مثال اختبار لـ Axios Interceptor:

```javascript
import axiosInstance from './axios';

test('should add branch_id to GET request', async () => {
  const branchId = 1;
  // Mock localStorage
  localStorage.setItem('branch-storage', JSON.stringify({
    state: { selectedBranch: { id: branchId } }
  }));
  
  const config = {
    method: 'get',
    url: '/products',
    params: {}
  };
  
  // Simulate interceptor
  const interceptor = axiosInstance.interceptors.request.handlers[0];
  const result = await interceptor.fulfilled(config);
  
  expect(result.params.branch_id).toBe(branchId);
});
```

---

## ملخص سريع

### 18. الخلاصة

**المكونات الرئيسية:**
1. ✅ `branchStore.js` - إدارة الحالة
2. ✅ `BranchInitializer.jsx` - التهيئة
3. ✅ `BranchSelector.jsx` - واجهة المستخدم
4. ✅ `axios.js` - Request Interceptor
5. ✅ `apiCache.js` - Cache Management

**ترتيب اختيار الفرع:**
```
1. localStorage (أعلى أولوية)
2. User Profile (إذا كان مسجل دخول)
3. Default Branch API
4. Main Branch (is_main === true)
5. First Branch (أقل أولوية)
```

**الاستخدام الأساسي:**
```jsx
// 1. استيراد
import useBranchStore from '@/store/branchStore';

// 2. استخدام
function Component() {
  const { selectedBranch, getSelectedBranchId } = useBranchStore();
  const branchId = getSelectedBranchId();
  
  // branch_id سيتم إضافته تلقائياً لجميع API calls
  const response = await api.menu.getProducts();
}
```

---

## الأسئلة الشائعة (FAQ)

### 19. أسئلة متكررة

**س: كيف يتم اختيار الفرع عند فتح التطبيق لأول مرة؟**
ج: النظام يتبع ترتيب الأولويات:
1. الفرع المحفوظ في localStorage
2. branch_id من ملف المستخدم (إذا كان مسجل دخول)
3. الفرع الافتراضي من API
4. الفرع الرئيسي أو أول فرع

**س: هل يجب إضافة branch_id يدوياً في API calls؟**
ج: لا، axios interceptor يضيفه تلقائياً لجميع الطلبات (ما عدا URLs المستثناة).

**س: ماذا يحدث عند تغيير الفرع؟**
ج: يتم:
1. تحديث الفرع المحدد
2. مسح السلة
3. إعادة تعيين رسوم التوصيل
4. إعادة تحميل البيانات

**س: لماذا يتم مسح السلة عند تغيير الفرع؟**
ج: لأن المنتجات والأسعار قد تختلف بين الفروع.

**س: كيف أحصل على معلومات الاتصال للفرع؟**
ج: استخدم `getBranchContactInfo()`:
```jsx
const { getBranchContactInfo } = useBranchStore();
const contact = getBranchContactInfo();
```

**س: هل يتم حفظ تفاصيل الفرع في localStorage؟**
ج: لا، يتم جلبها من جديد في كل جلسة لضمان أحدث البيانات.

**س: ما هي URLs التي لا تحتاج branch_id؟**
ج: `/branches`, `/branches/default`, `/auth/*`, `/customer/*`, `/notifications/*`

---

## المراجع والملفات

### 20. قائمة الملفات المهمة

```
src/
├── store/
│   └── branchStore.js              # إدارة الحالة
├── components/
│   └── layout/
│       ├── BranchInitializer.jsx   # التهيئة
│       └── header/
│           └── BranchSelector.jsx  # واجهة المستخدم
├── api/
│   ├── branches.js                 # API endpoints
│   └── config/
│       └── axios.js                # Request Interceptor
└── lib/
    └── utils/
        └── apiCache.js             # Cache Management
```

---

## الخلاصة النهائية

نظام Branch ID في هذا المشروع مصمم ليكون:
- ✅ **تلقائي**: يختار الفرع تلقائياً عند بدء التطبيق
- ✅ **ذكي**: يتبع ترتيب أولويات منطقي
- ✅ **مرن**: يسمح للمستخدمين بتغيير الفرع بسهولة
- ✅ **موثوق**: يتعامل مع جميع الحالات الخاصة
- ✅ **فعال**: يستخدم Cache لتحسين الأداء
- ✅ **متكامل**: يعمل مع جميع أجزاء التطبيق تلقائياً

لأي استفسارات أو تحسينات، راجع الكود المصدري أو تواصل مع فريق التطوير.

---

**آخر تحديث:** 2024
**الإصدار:** 1.0.0

