# دليل شامل لنظام اللغة (Language System Guide)

## نظرة عامة

هذا المشروع يستخدم نظام ترجمة مخصص (Custom i18n System) لدعم عدة لغات في تطبيق Next.js. النظام يدعم حاليًا لغتين:
- **الإنجليزية (en)** - English
- **البلغارية (bg)** - Bulgarian (اللغة الافتراضية)

---

## البنية الأساسية للنظام

### 1. ملفات التكوين (Configuration Files)

#### `src/locales/i18n/config.js`
هذا الملف يحتوي على الإعدادات الأساسية للنظام:

```javascript
export const i18n = {
    defaultLocale: "bg",  // اللغة الافتراضية
    locales: ["en", "bg"], // قائمة اللغات المدعومة
};
```

**الوظيفة:**
- تحديد اللغة الافتراضية للمشروع (البلغارية)
- تعريف جميع اللغات المدعومة في التطبيق
- يمكن إضافة لغات جديدة بسهولة من خلال إضافة كود اللغة إلى المصفوفة

---

### 2. ملفات الترجمة (Translation Files)

#### `src/locales/en.json`
يحتوي على جميع النصوص باللغة الإنجليزية في شكل مفاتيح وقيم:

```json
{
  "hello": "Hello",
  "shop": "Shop",
  "add_to_cart": "Add to Cart",
  "home": "Home",
  "contact_us": "Contact Us",
  ...
}
```

#### `src/locales/bg.json`
يحتوي على جميع النصوص باللغة البلغارية بنفس المفاتيح:

```json
{
  "hello": "Здравей",
  "shop": "Магазин",
  "add_to_cart": "Добави в количката",
  "home": "Начало",
  "contact_us": "Свържете се с нас",
  ...
}
```

**المبادئ المهمة:**
- يجب أن تكون جميع المفاتيح متطابقة في كلا الملفين
- إذا كان المفتاح مفقودًا في لغة معينة، سيتم عرض المفتاح نفسه كقيمة افتراضية
- المفاتيح تستخدم snake_case (أحرف صغيرة مع شرطة سفلية)

---

### 3. دالة الترجمة (Translation Function)

#### `src/locales/i18n/getTranslation.js`

```javascript
import en from "../../locales/en.json";
import bg from "../../locales/bg.json";

const languages = {
  en,
  bg,
};

export function t(lang = "en", key) {
  return languages?.[lang]?.[key] || key;
}
```

**كيف تعمل:**
1. تستورد جميع ملفات الترجمة
2. تجمعها في كائن واحد `languages`
3. دالة `t()` تأخذ:
   - `lang`: كود اللغة (مثل "en" أو "bg")
   - `key`: مفتاح الترجمة المطلوب
4. ترجع النص المترجم أو المفتاح نفسه إذا لم تجد الترجمة

**مثال الاستخدام:**
```javascript
t("en", "hello")  // Returns: "Hello"
t("bg", "hello")  // Returns: "Здравей"
t("en", "nonexistent_key")  // Returns: "nonexistent_key"
```

---

## إدارة حالة اللغة (Language State Management)

### 4. Context API - LanguageContext

#### `src/context/LanguageContext.jsx`

هذا الملف يحتوي على React Context لإدارة حالة اللغة في جميع أنحاء التطبيق.

#### المكونات الرئيسية:

**1. LanguageProvider:**
```javascript
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(i18n.defaultLocale);
  const [isMounted, setIsMounted] = useState(false);
  ...
}
```

**الوظائف:**

- **إدارة الحالة (State Management):**
  - `lang`: اللغة الحالية النشطة
  - `isMounted`: للتأكد من أن المكون تم تحميله في المتصفح (لتجنب مشاكل Hydration)

- **التهيئة (Initialization):**
  ```javascript
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language');
      if (savedLang && i18n.locales.includes(savedLang)) {
        setLangState(savedLang);
      } else {
        localStorage.setItem('language', i18n.defaultLocale);
      }
    }
  }, []);
  ```
  - عند تحميل المكون، يقرأ اللغة المحفوظة من `localStorage`
  - يتحقق من أن اللغة صالحة (موجودة في قائمة اللغات المدعومة)
  - إذا لم توجد لغة محفوظة، يحفظ اللغة الافتراضية

- **تغيير اللغة (Language Change):**
  ```javascript
  const setLang = useCallback((newLang) => {
    if (typeof window !== 'undefined' && i18n.locales.includes(newLang)) {
      localStorage.setItem('language', newLang);
      setLangState(newLang);
    }
  }, []);
  ```
  - يحفظ اللغة الجديدة في `localStorage` فورًا
  - يحدث حالة React لإعادة عرض المكونات
  - يتحقق من صحة اللغة قبل التطبيق

- **النسخ الاحتياطي (Backup):**
  ```javascript
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, [lang, isMounted]);
  ```
  - يحفظ اللغة في `localStorage` كلما تغيرت (كنسخة احتياطية)

**2. Hook الاستخدام:**
```javascript
export const useLanguage = () => useContext(LanguageContext);
```

يسمح لأي مكون بالوصول إلى:
- `lang`: اللغة الحالية
- `setLang`: دالة لتغيير اللغة

---

## التكامل مع Next.js

### 5. Root Layout Integration

#### `src/app/layout.jsx`

```javascript
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={oswald.variable}>
      <body>
        <LanguageProvider>
          <HtmlLangUpdater />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

**الترتيب المهم:**
1. `LanguageProvider` يلف التطبيق بالكامل
2. جميع المكونات الفرعية يمكنها الوصول إلى حالة اللغة
3. `HtmlLangUpdater` يحدث سمة `lang` في عنصر `<html>`

---

### 6. تحديث سمة HTML Lang

#### `src/components/layout/HtmlLangUpdater.jsx`

```javascript
export default function HtmlLangUpdater() {
  const { lang } = useLanguage();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return null;
}
```

**الوظيفة:**
- يحدث سمة `lang` في عنصر `<html>` تلقائيًا عند تغيير اللغة
- يساعد محركات البحث (SEO) على فهم اللغة الحالية
- يحسن إمكانية الوصول (Accessibility)

---

## واجهة المستخدم - مبدل اللغة

### 7. Language Switcher Component

#### `src/components/layout/LanguageSwitcher.jsx`

مكون واجهة المستخدم الذي يسمح للمستخدمين بتغيير اللغة.

**الميزات:**

1. **قائمة اللغات:**
   ```javascript
   const languages = [
     { code: "en", name: "English" },
     { code: "bg", name: "Bulgarian" },
   ];
   ```

2. **عرض اللغة الحالية:**
   ```javascript
   const currentLanguage = languages.find((l) => l.code === lang) || languages[0];
   const displayName = currentLanguage.name;
   ```

3. **تغيير اللغة:**
   ```javascript
   const handleLanguageChange = (languageCode) => {
     setLang(languageCode);
     setIsOpen(false);
   };
   ```

4. **دعم Mobile و Desktop:**
   - نسخة مختلفة للهواتف المحمولة (`isMobile` prop)
   - تصميم متجاوب مع الشاشات المختلفة

**الاستخدام:**
```jsx
<LanguageSwitcher />           // Desktop version
<LanguageSwitcher isMobile />   // Mobile version
```

---

## استخدام الترجمة في المكونات

### 8. أمثلة عملية

#### مثال 1: استخدام بسيط

```jsx
"use client";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../locales/i18n/getTranslation";

function MyComponent() {
  const { lang } = useLanguage();
  
  return (
    <div>
      <h1>{t(lang, "welcome_fresheat")}</h1>
      <button>{t(lang, "order_now")}</button>
    </div>
  );
}
```

#### مثال 2: استخدام مع شروط

```jsx
function ProductCard({ product }) {
  const { lang } = useLanguage();
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{t(lang, "price")}: ${product.price}</p>
      {product.inStock ? (
        <button>{t(lang, "add_to_cart")}</button>
      ) : (
        <span>{t(lang, "out_of_stock")}</span>
      )}
    </div>
  );
}
```

#### مثال 3: استخدام في النماذج (Forms)

```jsx
function ContactForm() {
  const { lang } = useLanguage();
  
  const subjectLabels = {
    complain: t(lang, "complain"),
    greetings: t(lang, "greetings"),
    order: t(lang, "about_order"),
  };
  
  return (
    <form>
      <label>{t(lang, "name_label")}</label>
      <input type="text" />
      
      <label>{t(lang, "email_label")}</label>
      <input type="email" />
      
      <select>
        {Object.entries(subjectLabels).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </form>
  );
}
```

#### مثال 4: استخدام مع قيم ديناميكية

```jsx
function OrderSummary({ items }) {
  const { lang } = useLanguage();
  
  return (
    <div>
      <h2>{t(lang, "order_summary")}</h2>
      <p>
        {t(lang, "showing")} {items.length} {t(lang, "of")} {totalItems} {t(lang, "results")}
      </p>
    </div>
  );
}
```

---

## التكامل مع API Calls

### 9. استخدام اللغة في طلبات API

#### `src/api/config/axios.js`

النظام يضيف اللغة تلقائيًا إلى طلبات API:

```javascript
const getLanguage = () => {
  if (typeof window === 'undefined') return 'bg';
  
  try {
    const language = localStorage.getItem('language');
    return language || 'bg';
  } catch (error) {
    console.error('Error reading language from storage:', error);
    return 'bg';
  }
};
```

**كيف يعمل:**
1. يقرأ اللغة من `localStorage`
2. يضيفها كمعامل في طلبات API
3. الخادم يمكنه إرجاع البيانات باللغة المطلوبة

---

### 10. Cache Management مع اللغة

#### `src/lib/utils/apiCache.js`

نظام الـ Cache يأخذ اللغة في الاعتبار:

```javascript
export function generateCacheKey(url, params = {}, branchId = null, language = null) {
  // إذا لم يتم توفير اللغة، يقرأها من localStorage
  if (language === null && typeof window !== 'undefined') {
    try {
      language = localStorage.getItem('language') || 'bg';
    } catch {
      language = 'bg';
    }
  }
  
  // يضيف اللغة إلى مفتاح الـ Cache
  const langPart = language ? `lang=${language}` : "";
  
  return `${url}?${branchPart}${langPart}${paramsPart}`;
}
```

**الفائدة:**
- كل لغة لها cache منفصل
- عند تغيير اللغة، يتم جلب البيانات الجديدة
- يحسن الأداء بتخزين البيانات لكل لغة

---

## Server-Side Language Detection

### 11. اكتشاف اللغة من الطلب

#### `src/lib/getLanguage.js`

للمكونات من نوع Server Component:

```javascript
export async function getLanguage() {
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    
    if (acceptLanguage) {
      // يقرأ أول لغة من header
      const languages = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().toLowerCase().substring(0, 2));
      
      // يتحقق من اللغات المدعومة
      for (const lang of languages) {
        if (i18n.locales.includes(lang)) {
          return lang;
        }
      }
    }
    
    return i18n.defaultLocale;
  } catch (error) {
    return i18n.defaultLocale;
  }
}
```

**الاستخدام:**
```javascript
// في Server Component
import { getLanguage } from '@/lib/getLanguage';

export default async function ServerPage() {
  const lang = await getLanguage();
  // استخدام اللغة في Server Component
}
```

---

## أفضل الممارسات (Best Practices)

### 12. نصائح للاستخدام الصحيح

#### ✅ افعل (Do):

1. **استخدم Hook `useLanguage` دائماً:**
   ```jsx
   const { lang } = useLanguage();
   ```

2. **استخدم دالة `t()` مع المفتاح الصحيح:**
   ```jsx
   {t(lang, "key_name")}
   ```

3. **احفظ المفاتيح متسقة:**
   - استخدم `snake_case`
   - استخدم أسماء وصفية
   - مثال: `add_to_cart` بدلاً من `addCart`

4. **أضف جميع المفاتيح لجميع اللغات:**
   - تأكد من وجود كل مفتاح في `en.json` و `bg.json`

5. **استخدم fallback values:**
   ```jsx
   {t(lang, "key") || "Default Text"}
   ```

#### ❌ لا تفعل (Don't):

1. **لا تستخدم نصوص hardcoded:**
   ```jsx
   // ❌ خطأ
   <button>Add to Cart</button>
   
   // ✅ صحيح
   <button>{t(lang, "add_to_cart")}</button>
   ```

2. **لا تنسى استيراد `useLanguage`:**
   ```jsx
   // ❌ خطأ
   const lang = "en"; // hardcoded
   
   // ✅ صحيح
   const { lang } = useLanguage();
   ```

3. **لا تستخدم مفاتيح مختلفة في نفس السياق:**
   ```jsx
   // ❌ خطأ - مفاتيح غير متسقة
   {t(lang, "addToCart")}
   {t(lang, "add_to_cart")}
   
   // ✅ صحيح - نفس المفتاح
   {t(lang, "add_to_cart")}
   ```

4. **لا تنسى تحديث جميع ملفات الترجمة عند إضافة مفتاح جديد**

---

## إضافة لغة جديدة

### 13. خطوات إضافة لغة جديدة

لإضافة لغة جديدة (مثل العربية "ar"):

#### الخطوة 1: إضافة إلى config
```javascript
// src/locales/i18n/config.js
export const i18n = {
    defaultLocale: "bg",
    locales: ["en", "bg", "ar"], // أضف "ar"
};
```

#### الخطوة 2: إنشاء ملف الترجمة
```json
// src/locales/ar.json
{
  "hello": "مرحباً",
  "shop": "المتجر",
  "add_to_cart": "أضف إلى السلة",
  ...
}
```

#### الخطوة 3: تحديث getTranslation
```javascript
// src/locales/i18n/getTranslation.js
import en from "../../locales/en.json";
import bg from "../../locales/bg.json";
import ar from "../../locales/ar.json"; // أضف الاستيراد

const languages = {
  en,
  bg,
  ar, // أضف اللغة
};

export function t(lang = "en", key) {
  return languages?.[lang]?.[key] || key;
}
```

#### الخطوة 4: تحديث Language Switcher
```javascript
// src/components/layout/LanguageSwitcher.jsx
const languages = [
  { code: "en", name: "English" },
  { code: "bg", name: "Bulgarian" },
  { code: "ar", name: "العربية" }, // أضف اللغة
];
```

---

## معالجة الأخطاء والاستثناءات

### 14. حالات خاصة

#### حالة 1: مفتاح مفقود
```javascript
// إذا كان المفتاح غير موجود
t(lang, "nonexistent_key") 
// Returns: "nonexistent_key" (المفتاح نفسه)
```

#### حالة 2: لغة غير مدعومة
```javascript
// إذا كانت اللغة غير موجودة في config
t("fr", "hello") 
// Returns: undefined أو المفتاح (حسب التنفيذ)
```

#### حالة 3: localStorage غير متاح
```javascript
// في Server-Side Rendering
if (typeof window === 'undefined') {
  return i18n.defaultLocale; // يعيد اللغة الافتراضية
}
```

#### حالة 4: Hydration Mismatch
```javascript
// في LanguageContext
// نبدأ باللغة الافتراضية لتجنب mismatch
const [lang, setLangState] = useState(i18n.defaultLocale);
const [isMounted, setIsMounted] = useState(false);

// نقرأ من localStorage بعد mount
useEffect(() => {
  setIsMounted(true);
  // ... قراءة من localStorage
}, []);
```

---

## الأداء والتحسينات

### 15. تحسينات الأداء

#### 1. Memoization
```jsx
import { useMemo } from 'react';

function MyComponent() {
  const { lang } = useLanguage();
  
  // حفظ الترجمة في memory
  const translatedText = useMemo(() => {
    return t(lang, "long_text_key");
  }, [lang]);
  
  return <p>{translatedText}</p>;
}
```

#### 2. Lazy Loading للترجمات
```javascript
// يمكن تحميل الترجمة عند الحاجة
const loadTranslation = async (lang) => {
  const translation = await import(`../../locales/${lang}.json`);
  return translation.default;
};
```

#### 3. Cache للترجمات
- الترجمة تتم في memory (سريعة جداً)
- لا حاجة لـ API calls للترجمة
- جميع الترجمات محملة مسبقاً

---

## الاختبار (Testing)

### 16. اختبار نظام اللغة

#### مثال اختبار للـ Context:
```javascript
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

test('should change language', () => {
  const { result } = renderHook(() => useLanguage(), {
    wrapper: LanguageProvider,
  });
  
  act(() => {
    result.current.setLang('en');
  });
  
  expect(result.current.lang).toBe('en');
});
```

#### مثال اختبار لدالة الترجمة:
```javascript
import { t } from '../getTranslation';

test('should return translation', () => {
  expect(t('en', 'hello')).toBe('Hello');
  expect(t('bg', 'hello')).toBe('Здравей');
  expect(t('en', 'nonexistent')).toBe('nonexistent');
});
```

---

## ملخص سريع

### 17. الخلاصة

**المكونات الرئيسية:**
1. ✅ `config.js` - إعدادات النظام
2. ✅ `en.json` / `bg.json` - ملفات الترجمة
3. ✅ `getTranslation.js` - دالة الترجمة
4. ✅ `LanguageContext.jsx` - إدارة الحالة
5. ✅ `LanguageSwitcher.jsx` - واجهة المستخدم
6. ✅ `HtmlLangUpdater.jsx` - تحديث HTML lang

**التدفق (Flow):**
```
المستخدم يغير اللغة
    ↓
LanguageSwitcher يستدعي setLang()
    ↓
LanguageContext يحفظ في localStorage
    ↓
LanguageContext يحدث الحالة
    ↓
جميع المكونات تعيد العرض
    ↓
دالة t() ترجع النص الجديد
    ↓
HtmlLangUpdater يحدث <html lang>
```

**الاستخدام الأساسي:**
```jsx
// 1. استيراد
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/locales/i18n/getTranslation';

// 2. استخدام
function Component() {
  const { lang } = useLanguage();
  return <h1>{t(lang, "welcome")}</h1>;
}
```

---

## الأسئلة الشائعة (FAQ)

### 18. أسئلة متكررة

**س: كيف أضيف نص جديد؟**
ج: أضف المفتاح في `en.json` و `bg.json` بنفس المفتاح.

**س: ماذا لو نسيت إضافة مفتاح في لغة معينة؟**
ج: سيتم عرض المفتاح نفسه كقيمة افتراضية.

**س: هل يمكن استخدام الترجمة في Server Components؟**
ج: نعم، استخدم `getLanguage()` من `lib/getLanguage.js`.

**س: كيف أحفظ اختيار اللغة؟**
ج: يتم الحفظ تلقائياً في `localStorage` عند تغيير اللغة.

**س: هل النظام يدعم RTL (Right-to-Left)؟**
ج: حالياً لا، لكن يمكن إضافته بسهولة من خلال CSS و HTML dir attribute.

---

## المراجع والملفات

### 19. قائمة الملفات المهمة

```
src/
├── locales/
│   ├── i18n/
│   │   ├── config.js          # إعدادات النظام
│   │   └── getTranslation.js  # دالة الترجمة
│   ├── en.json                # ترجمة إنجليزية
│   └── bg.json                # ترجمة بلغارية
├── context/
│   └── LanguageContext.jsx    # Context API
├── components/
│   └── layout/
│       ├── LanguageSwitcher.jsx    # مبدل اللغة
│       └── HtmlLangUpdater.jsx    # تحديث HTML
├── lib/
│   └── getLanguage.js         # Server-side detection
└── app/
    └── layout.jsx            # Root layout
```

---

## الخلاصة النهائية

نظام اللغة في هذا المشروع مصمم ليكون:
- ✅ **بسيط**: سهل الفهم والاستخدام
- ✅ **مرن**: يمكن إضافة لغات جديدة بسهولة
- ✅ **فعال**: لا يؤثر على الأداء
- ✅ **موثوق**: يتعامل مع جميع الحالات الخاصة
- ✅ **قابل للصيانة**: كود منظم وواضح

لأي استفسارات أو تحسينات، راجع الكود المصدري أو تواصل مع فريق التطوير.

---

**آخر تحديث:** 2024
**الإصدار:** 1.0.0

