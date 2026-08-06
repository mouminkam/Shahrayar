import type { RawCategory } from "../../lib/utils/productTransform";

/**
 * PRODUCTION: this list would come from `GET /menu-categories`
 * (see `src/api/menu.ts` → `getMenuCategories`).
 */
export const mockCategories: RawCategory[] = [
  {
    id: 1,
    name: "Shawarma & Grills",
    name_en: "Shawarma & Grills",
    name_bg: "Шаурма и грил",
    slug: "shawarma-grills",
    image: "/img/dishes/dishes3_1.jpg",
    description: "Slow-roasted, char-grilled classics",
    product_count: 5,
  },
  {
    id: 2,
    name: "Burgers",
    name_en: "Burgers",
    name_bg: "Бургери",
    slug: "burgers",
    image: "/img/dishes/burger.png",
    description: "Stacked, sauced, and flame-grilled",
    product_count: 5,
  },
  {
    id: 3,
    name: "Pizza",
    name_en: "Pizza",
    name_bg: "Пица",
    slug: "pizza",
    image: "/img/dishes/dishes2_1.png",
    description: "Wood-fired, hand-stretched dough",
    product_count: 4,
  },
  {
    id: 4,
    name: "Appetizers & Sides",
    name_en: "Appetizers & Sides",
    name_bg: "Предястия и гарнитури",
    slug: "appetizers-sides",
    image: "/img/dishes/dishes4_1.png",
    description: "Small plates to start the meal",
    product_count: 4,
  },
  {
    id: 5,
    name: "Drinks",
    name_en: "Drinks",
    name_bg: "Напитки",
    slug: "drinks",
    image: "/img/dishes/dishes5_1.png",
    description: "Fresh juices, sodas, and hot drinks",
    product_count: 3,
  },
  {
    id: 6,
    name: "Desserts",
    name_en: "Desserts",
    name_bg: "Десерти",
    slug: "desserts",
    image: "/img/dishes/dishes6_1.png",
    description: "Sweet finishes to the meal",
    product_count: 3,
  },
];
