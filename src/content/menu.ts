import type { RawMenuItem, RawCategory } from "../lib/utils/productTransform";

/**
 * Static menu content.
 *
 * This is a frontend-only build: there is no backend, and nothing here is
 * fetched at runtime — it's a plain module import, resolved at build time.
 * That's what keeps navigation instant (every page is prerendered; see the
 * "Rendering strategy" section of the README).
 *
 * Shapes intentionally mirror what a REST catalog endpoint would return
 * (`RawMenuItem` / `RawCategory`), so the existing localization + transform
 * pipeline (`transformMenuItemToProduct`) is exercised exactly as it would be
 * against a live API. Swapping in a real backend means replacing these imports
 * with a fetch — no component or transform changes.
 *
 * Every `image` below points at a real photograph in /public/img. Images and
 * dish names are deliberately matched: the shawarma wrap uses the wrap photo,
 * the biryani uses the rice-bowl photo, and so on.
 */

export const categories: RawCategory[] = [
  {
    id: 1,
    slug: "wraps-grills",
    name_en: "Wraps & Grills",
    name_bg: "Роли и грил",
    name_ar: "لفائف ومشاوي",
    description_en: "Slow-roasted, char-grilled, wrapped fresh",
    description_bg: "Бавно печени, на скара, свити пресни",
    description_ar: "مشوية على الفحم وملفوفة طازجة",
    image: "/img/offer/offerThumb1_3.png",
    product_count: 3,
  },
  {
    id: 2,
    slug: "pizza",
    name_en: "Pizza",
    name_bg: "Пица",
    name_ar: "بيتزا",
    description_en: "Wood-fired, hand-stretched dough",
    description_bg: "На дърва, ръчно разточено тесто",
    description_ar: "عجينة مفرودة يدوياً على الحطب",
    image: "/img/dishes/dishes3_1.png",
    product_count: 3,
  },
  {
    id: 3,
    slug: "burgers",
    name_en: "Burgers",
    name_bg: "Бургери",
    name_ar: "برغر",
    description_en: "Stacked, sauced, flame-grilled",
    description_bg: "Наредени, със сос, на пламък",
    description_ar: "طبقات غنية بالصلصة ومشوية",
    image: "/img/offer/offerThumb1_2.png",
    product_count: 2,
  },
  {
    id: 4,
    slug: "wings-starters",
    name_en: "Wings & Starters",
    name_bg: "Крилца и предястия",
    name_ar: "أجنحة ومقبلات",
    description_en: "Small plates to open the table",
    description_bg: "Малки чинии за начало",
    description_ar: "أطباق صغيرة تفتح الشهية",
    image: "/img/dishes/dishes2_4.png",
    product_count: 3,
  },
  {
    id: 5,
    slug: "rice-pasta",
    name_en: "Rice & Pasta",
    name_bg: "Ориз и паста",
    name_ar: "أرز ومعكرونة",
    description_en: "Comfort plates, generously portioned",
    description_bg: "Обилни и засищащи чинии",
    description_ar: "أطباق دسمة بحصص سخية",
    image: "/img/dishes/dishes1_1.png",
    product_count: 4,
  },
];

/** Shared option groups — reused across items so the customization UI has real data to render. */
const sizeOptions = [
  { id: 101, name_en: "Regular", name_bg: "Стандартна", name_ar: "عادي", price: 0, is_default: true },
  { id: 102, name_en: "Large", name_bg: "Голяма", name_ar: "كبير", price: 3.5, is_default: false },
];

const grillExtras = [
  { id: 201, name_en: "Extra garlic sauce", name_bg: "Допълнителен чеснов сос", name_ar: "صلصة ثوم إضافية", price: 0.8 },
  { id: 202, name_en: "Pickles", name_bg: "Кисели краставички", name_ar: "مخللات", price: 0 },
  { id: 203, name_en: "Extra meat", name_bg: "Допълнително месо", name_ar: "لحم إضافي", price: 2.5 },
];

const burgerExtras = [
  { id: 211, name_en: "Extra cheese", name_bg: "Допълнително сирене", name_ar: "جبنة إضافية", price: 1.2 },
  { id: 212, name_en: "Crispy bacon", name_bg: "Хрупкав бекон", name_ar: "بيكون مقرمش", price: 1.8 },
  { id: 213, name_en: "Jalapeños", name_bg: "Халапеньо", name_ar: "هالبينو", price: 0.5 },
];

const sauceChoices = {
  sauces: {
    min_selection: 0,
    max_selection: 2,
    available: [
      { id: 301, name_en: "Garlic sauce", name_bg: "Чеснов сос", name_ar: "صلصة الثوم", price: 0, is_free: true, is_active: true },
      { id: 302, name_en: "Chili sauce", name_bg: "Лют сос", name_ar: "صلصة حارة", price: 0, is_free: true, is_active: true },
      { id: 303, name_en: "Smoky BBQ", name_bg: "Опушено BBQ", name_ar: "باربكيو مدخّن", price: 0.5, final_price: 0.5, is_free: false, is_active: true },
    ],
  },
};

export const menuItems: RawMenuItem[] = [
  // ---------- 1 · Wraps & Grills ----------
  {
    id: 1,
    category_id: 1,
    name_en: "Chicken Shawarma Wrap",
    name_bg: "Пилешка шаурма",
    name_ar: "شاورما دجاج",
    description_en: "Marinated chicken carved off the spit, garlic sauce and pickles, rolled in warm flatbread.",
    description_bg: "Мариновано пилешко от шиш, чеснов сос и кисели краставички в топка питка.",
    description_ar: "دجاج متبّل من السيخ مع صلصة الثوم والمخلل، ملفوف بخبز دافئ.",
    price: 8.5,
    image: "/img/offer/offerThumb1_3.png",
    rating: 4.9,
    is_featured: true,
    sizes: sizeOptions,
    ingredients: grillExtras,
    customizations: sauceChoices,
  },
  {
    id: 2,
    category_id: 1,
    name_en: "Mixed Grill Platter",
    name_bg: "Смесено плато на скара",
    name_ar: "مشاوي مشكّلة",
    description_en: "Char-grilled steak and kofta with buttered pasta and blistered cherry tomatoes.",
    description_bg: "Стек и кюфте на скара с паста и печени чери домати.",
    description_ar: "ستيك وكفتة على الفحم مع معكرونة بالزبدة وطماطم كرزية.",
    price: 16.9,
    image: "/img/dishes/dishes1_4.png",
    rating: 4.8,
    is_featured: true,
    sizes: [],
    ingredients: grillExtras,
  },
  {
    id: 3,
    category_id: 1,
    name_en: "Slow-Roasted Lamb",
    name_bg: "Бавно печено агнешко",
    name_ar: "لحم غنم بطيء الطهي",
    description_en: "Six-hour lamb shoulder, caramelized onion and herbs, over crisp greens.",
    description_bg: "Агнешко плешка, печена 6 часа, с карамелизиран лук и билки.",
    description_ar: "كتف غنم مطهو ٦ ساعات مع بصل مكرمل وأعشاب طازجة.",
    price: 18.5,
    image: "/img/gallery/galleryThumb1_4.jpg",
    rating: 4.9,
    sizes: [],
    ingredients: [],
  },

  // ---------- 2 · Pizza ----------
  {
    id: 4,
    category_id: 2,
    name_en: "Signature Wood-Fired Pizza",
    name_bg: "Фирмена пица на дърва",
    name_ar: "بيتزا الحطب المميّزة",
    description_en: "The house pie: San Marzano tomato, fior di latte, cured meats, torn basil.",
    description_bg: "Домашната пица: домати San Marzano, моцарела, сушени меса, босилек.",
    description_ar: "بيتزا البيت: طماطم سان مارزانو، موزاريلا، لحوم مقدّدة وريحان.",
    price: 14.9,
    image: "/img/dishes/dishes3_1.png",
    rating: 4.9,
    is_featured: true,
    sizes: sizeOptions,
    ingredients: [],
  },
  {
    id: 5,
    category_id: 2,
    name_en: "Margherita",
    name_bg: "Маргарита",
    name_ar: "مارغريتا",
    description_en: "Three ingredients, done properly: tomato, mozzarella, basil.",
    description_bg: "Три съставки, направени както трябва: домат, моцарела, босилек.",
    description_ar: "ثلاثة مكوّنات بإتقان: طماطم، موزاريلا، ريحان.",
    price: 11.9,
    image: "/img/dishes/dishes1_3.png",
    rating: 4.7,
    sizes: sizeOptions,
    ingredients: [],
  },
  {
    id: 6,
    category_id: 2,
    name_en: "Mushroom & Basil",
    name_bg: "Гъби и босилек",
    name_ar: "فطر وريحان",
    description_en: "Roasted mushrooms, aged cheese and fresh basil on a thin, blistered base.",
    description_bg: "Печени гъби, отлежало сирене и пресен босилек върху тънка основа.",
    description_ar: "فطر محمّص وجبن معتّق وريحان طازج على عجينة رقيقة.",
    price: 13.5,
    image: "/img/gallery/galleryThumb1_1.jpg",
    rating: 4.6,
    sizes: sizeOptions,
    ingredients: [],
  },

  // ---------- 3 · Burgers ----------
  {
    id: 7,
    category_id: 3,
    name_en: "Crispy Chicken Burger",
    name_bg: "Хрупкав пилешки бургер",
    name_ar: "برغر دجاج مقرمش",
    description_en: "Buttermilk-fried chicken thigh, chili mayo and slaw in a seeded brioche.",
    description_bg: "Пилешко бедро в мътеница, чили майонеза и зеле в бриош.",
    description_ar: "فخذ دجاج مقلي مع مايونيز حار وسلطة كرنب في خبز بريوش.",
    price: 10.9,
    image: "/img/offer/offerThumb1_2.png",
    rating: 4.8,
    is_featured: true,
    sizes: sizeOptions,
    ingredients: burgerExtras,
    customizations: sauceChoices,
  },
  {
    id: 8,
    category_id: 3,
    name_en: "Family Feast Combo",
    name_bg: "Семейно комбо",
    name_ar: "وجبة العائلة",
    description_en: "Two burgers, crispy tenders, loaded fries and dips — built to share.",
    description_bg: "Два бургера, хрупкави хапки, пържени картофи и сосове — за споделяне.",
    description_ar: "برغران، قطع دجاج مقرمشة، بطاطا وصلصات — تكفي للمشاركة.",
    price: 26.9,
    image: "/img/offer/offerThumb1_1.png",
    rating: 4.9,
    is_featured: true,
    sizes: [],
    ingredients: burgerExtras,
  },

  // ---------- 4 · Wings & Starters ----------
  {
    id: 9,
    category_id: 4,
    name_en: "Classic Buffalo Wings",
    name_bg: "Класически бъфало крилца",
    name_ar: "أجنحة بافلو كلاسيكية",
    description_en: "Tossed in cayenne butter, served with celery and blue-cheese dip.",
    description_bg: "В масло с кайен, със целина и сос синьо сирене.",
    description_ar: "بزبدة الفلفل الأحمر مع الكرفس وصلصة الجبن الأزرق.",
    price: 9.9,
    image: "/img/dishes/dishes2_4.png",
    rating: 4.7,
    sizes: sizeOptions,
    ingredients: [],
    customizations: sauceChoices,
  },
  {
    id: 10,
    category_id: 4,
    name_en: "Honey Garlic Wings",
    name_bg: "Крилца с мед и чесън",
    name_ar: "أجنحة بالعسل والثوم",
    description_en: "Sticky honey-garlic glaze, toasted sesame, cooling herb dip.",
    description_bg: "Лепкава глазура с мед и чесън, сусам и билков дип.",
    description_ar: "صلصة العسل والثوم مع سمسم محمّص وصلصة أعشاب.",
    price: 9.9,
    image: "/img/dishes/dishes1_5.png",
    rating: 4.6,
    sizes: sizeOptions,
    ingredients: [],
    customizations: sauceChoices,
  },
  {
    id: 11,
    category_id: 4,
    name_en: "Mezze Board",
    name_bg: "Мезе дъска",
    name_ar: "طبق مازة",
    description_en: "Aged cheeses, olives, sun-dried tomato and warm bread for the table.",
    description_bg: "Отлежали сирена, маслини, сушени домати и топъл хляб.",
    description_ar: "أجبان معتّقة، زيتون، طماطم مجفّفة وخبز دافئ.",
    price: 12.5,
    image: "/img/gallery/galleryThumb1_3.jpg",
    rating: 4.8,
    sizes: [],
    ingredients: [],
  },

  // ---------- 5 · Rice & Pasta ----------
  {
    id: 12,
    category_id: 5,
    name_en: "Chicken Biryani",
    name_bg: "Пилешко биряни",
    name_ar: "برياني دجاج",
    description_en: "Saffron basmati layered with spiced chicken, fried onion and fresh mint.",
    description_bg: "Шафранов басмати с подправено пиле, пържен лук и мента.",
    description_ar: "أرز بسمتي بالزعفران مع دجاج متبّل وبصل مقلي ونعناع.",
    price: 12.9,
    image: "/img/dishes/dishes1_1.png",
    rating: 4.8,
    is_featured: true,
    sizes: sizeOptions,
    ingredients: grillExtras,
  },
  {
    id: 13,
    category_id: 5,
    name_en: "Creamy Tomato Fusilli",
    name_bg: "Фузили с кремообразен доматен сос",
    name_ar: "فوزيلي بصلصة الطماطم الكريمية",
    description_en: "Fusilli in slow-cooked tomato cream, finished with aged parmesan.",
    description_bg: "Фузили в бавно готвен доматен крем с отлежал пармезан.",
    description_ar: "فوزيلي بصلصة طماطم كريمية مع جبن بارميزان معتّق.",
    price: 11.5,
    image: "/img/dishes/dishes1_2.png",
    rating: 4.6,
    sizes: sizeOptions,
    ingredients: [],
  },
  {
    id: 14,
    category_id: 5,
    name_en: "Penne & Meatballs",
    name_bg: "Пене с кюфтенца",
    name_ar: "بيني بكرات اللحم",
    description_en: "Hand-rolled beef meatballs, penne and a long-simmered tomato sugo.",
    description_bg: "Ръчно оформени телешки кюфтенца, пене и доматено сугу.",
    description_ar: "كرات لحم بقري يدوية مع بيني وصلصة طماطم مطهوة طويلاً.",
    price: 13.9,
    image: "/img/gallery/galleryThumb1_5.jpg",
    rating: 4.7,
    sizes: sizeOptions,
    ingredients: [],
  },
  {
    id: 15,
    category_id: 5,
    name_en: "Thai Basil Rice Bowl",
    name_bg: "Оризова купа с тайландски босилек",
    name_ar: "طبق أرز بالريحان التايلاندي",
    description_en: "Wok-fried holy basil mince over jasmine rice, crowned with a fried egg.",
    description_bg: "Кайма с босилек от уок върху жасминов ориз с яйце на очи.",
    description_ar: "لحم مفروم بالريحان على أرز الياسمين مع بيضة مقلية.",
    price: 11.9,
    image: "/img/dishes/dishes2_2.png",
    rating: 4.7,
    sizes: sizeOptions,
    ingredients: [],
  },
];

// ---------------------------------------------------------------------------
// Synchronous selectors — no promises, no network, resolved at build time.
// ---------------------------------------------------------------------------

export const getMenuItemById = (id: number | string): RawMenuItem | undefined =>
  menuItems.find((item) => String(item.id) === String(id));

export const getItemsByCategory = (categoryId: number | string): RawMenuItem[] =>
  menuItems.filter((item) => String(item.category_id) === String(categoryId));

export const featuredItems = menuItems.filter((item) => item.is_featured);

/** Highest-rated plates — drives the "Popular Dishes" section. */
export const popularItems = [...menuItems].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 8);

/** Newest additions — drives the "Latest Items" slider. */
export const latestItems = [...menuItems].slice(-8).reverse();

/** Kitchen picks — drives the "Chef's Special" section. */
export const chefSpecialItems = menuItems.filter((item) => (item.rating ?? 0) >= 4.8).slice(0, 6);

/** Small, cheap add-ons offered at checkout. */
export const upsellItems = menuItems.filter((item) => item.category_id === 4).slice(0, 3);
