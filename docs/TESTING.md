# دليل Testing للمشروع

## ✅ ما تم إنجازه

تم إعداد بيئة testing كاملة للمشروع مع الأمثلة التالية:

### 1. Utility Functions Tests
- ✅ `src/lib/utils/__tests__/formatters.test.js` - اختبار formatPrice و formatCurrency

### 2. UI Components Tests
- ✅ `src/components/ui/__tests__/Breadcrumb.test.jsx` - اختبار Breadcrumb component

### 3. Store Tests (Zustand)
- ✅ `src/store/__tests__/toastStore.test.js` - اختبار Toast Store
- ✅ `src/store/__tests__/cartStore.test.js` - اختبار Cart Store
- ✅ `src/store/__tests__/branchStore.test.js` - اختبار Branch Store
- ✅ `src/store/__tests__/authStore.test.js` - اختبار Auth Store

## 🚀 كيفية استخدام Testing

### تشغيل جميع الـ Tests:
```bash
npm test
```

### تشغيل Tests في Watch Mode (يعيد التشغيل عند التغيير):
```bash
npm run test:watch
```

### تشغيل Tests مع Coverage Report:
```bash
npm run test:coverage
```

### تشغيل Test محدد:
```bash
npm test -- formatters.test.js
```

## 📝 كيفية كتابة Test جديد

### مثال: Test لـ Utility Function

```javascript
// src/lib/utils/__tests__/myFunction.test.js
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### مثال: Test لـ React Component

```javascript
// src/components/__tests__/MyComponent.test.jsx
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### مثال: Test لـ Zustand Store

```javascript
// src/store/__tests__/myStore.test.js
import { renderHook, act } from '@testing-library/react';
import useMyStore from '../myStore';

describe('My Store', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useMyStore());
    
    act(() => {
      result.current.updateState('new value');
    });
    
    expect(result.current.state).toBe('new value');
  });
});
```

## 📊 النتائج الحالية

```
Test Suites: 6 passed, 6 total
Tests:       39 passed, 39 total
```

## 🎯 الخطوات التالية (اختياري)

1. **إضافة المزيد من Component Tests**
2. **إضافة E2E Tests باستخدام Playwright**
3. **إضافة API Tests**
4. **إضافة Performance Tests**

## 📚 موارد مفيدة

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Testing Zustand Stores](https://github.com/pmndrs/zustand#testing)

