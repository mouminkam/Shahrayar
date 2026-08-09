/**
 * Static restaurant content — branches, kitchen team, and homepage hero slides.
 * Plain module data, resolved at build time (see ./menu.ts for the rationale).
 *
 * Every image below is a real photograph in /public/img; the team list is
 * exactly as long as the photography available, rather than padded with
 * placeholders.
 */

export interface Branch {
  id: number;
  branch_id: number;
  name: string;
  is_main: boolean;
  address: string;
  location: string;
  email: string;
  contact_email: string;
  phone: string;
  contact_phone: string;
  working_hours: string;
  opening_hours: string;
  latitude: number;
  longitude: number;
}

export const branches: Branch[] = [
  {
    id: 1,
    branch_id: 1,
    name: "Shahrayar — Downtown",
    is_main: true,
    address: "12 Vitosha Boulevard, Sofia, Bulgaria",
    location: "12 Vitosha Boulevard, Sofia, Bulgaria",
    email: "downtown@shahrayar.example",
    contact_email: "downtown@shahrayar.example",
    phone: "+359 2 555 0142",
    contact_phone: "+359 2 555 0142",
    working_hours: "09:00 – 23:00",
    opening_hours: "09:00 – 23:00",
    latitude: 42.6954,
    longitude: 23.3217,
  },
  {
    id: 2,
    branch_id: 2,
    name: "Shahrayar — Riverside",
    is_main: false,
    address: "48 Maritsa Street, Plovdiv, Bulgaria",
    location: "48 Maritsa Street, Plovdiv, Bulgaria",
    email: "riverside@shahrayar.example",
    contact_email: "riverside@shahrayar.example",
    phone: "+359 32 555 0198",
    contact_phone: "+359 32 555 0198",
    working_hours: "10:00 – 23:30",
    opening_hours: "10:00 – 23:30",
    latitude: 42.1354,
    longitude: 24.7453,
  },
];

export const defaultBranch = branches.find((b) => b.is_main) ?? branches[0];

export const getBranchById = (id: number | string): Branch | undefined =>
  branches.find((b) => String(b.id) === String(id));

export interface Chef {
  id: number;
  name: string;
  role_en: string;
  role_bg: string;
  role_ar: string;
  bio_en: string;
  bio_bg: string;
  bio_ar: string;
  image_url: string;
  [key: string]: unknown;
}

export const chefs: Chef[] = [
  {
    id: 1,
    name: "Omar Haddad",
    role_en: "Head Chef",
    role_bg: "Главен готвач",
    role_ar: "رئيس الطهاة",
    bio_en: "Twenty years on the grill, and still turns the spit by hand every service.",
    bio_bg: "Двадесет години на скарата — и още върти шиша на ръка всяка смяна.",
    bio_ar: "عشرون عاماً على الشواية، ولا يزال يدير السيخ بيده كل خدمة.",
    image_url: "/img/chefe/chefeThumb1_1.png",
  },
  {
    id: 2,
    name: "Layla Nasser",
    role_en: "Pastry & Desserts",
    role_bg: "Сладкар",
    role_ar: "قسم الحلويات",
    bio_en: "Trained in Beirut. Everything sweet that leaves this kitchen is hers.",
    bio_bg: "Обучена в Бейрут. Всичко сладко от тази кухня е нейно.",
    bio_ar: "تدرّبت في بيروت. كل حلوى تخرج من هذا المطبخ هي من صنعها.",
    image_url: "/img/chefe/chefeThumb1_2.png",
  },
  {
    id: 3,
    name: "Karim Aziz",
    role_en: "Wood-Fired Oven",
    role_bg: "Пещ на дърва",
    role_ar: "فرن الحطب",
    bio_en: "Naples-trained, stretches every base by hand. No two pies come out alike.",
    bio_bg: "Обучен в Неапол, разточва всяка основа на ръка. Няма две еднакви пици.",
    bio_ar: "تدرّب في نابولي، يفرد كل عجينة بيده. لا تتشابه بيتزتان أبداً.",
    image_url: "/img/chefe/chefeThumb1_3.png",
  },
];

export interface HeroSlide {
  id: number;
  title_en: string;
  title_bg: string;
  title_ar: string;
  description_en: string;
  description_bg: string;
  description_ar: string;
  desktop_image: string;
  mobile_image: string;
  menu_item_id: number;
  [key: string]: unknown;
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title_en: "Straight Off The Spit",
    title_bg: "Направо от шиша",
    title_ar: "طازج من على السيخ",
    description_en: "Carved to order, wrapped while it's still hot.",
    description_bg: "Нарязана по поръчка, свита още топла.",
    description_ar: "تُقطَّع عند الطلب وتُلَف وهي ساخنة.",
    desktop_image: "/img/banner/bannerThumb1_1.png",
    mobile_image: "/img/banner/bannerThumb1_1.png",
    menu_item_id: 1,
  },
  {
    id: 2,
    title_en: "Wood-Fired, Every Time",
    title_bg: "Винаги на дърва",
    title_ar: "على الحطب دائماً",
    description_en: "Ninety seconds at 450°C. That's the whole secret.",
    description_bg: "Деветдесет секунди при 450°C. Това е цялата тайна.",
    description_ar: "تسعون ثانية على ٤٥٠ درجة. هذا كل السر.",
    desktop_image: "/img/banner/bannerThumb1_2.png",
    mobile_image: "/img/banner/bannerThumb1_2.png",
    menu_item_id: 4,
  },
  {
    id: 3,
    title_en: "Built To Share",
    title_bg: "Създадено за споделяне",
    title_ar: "وجبات للمشاركة",
    description_en: "Family plates that land in the middle of the table.",
    description_bg: "Семейни чинии, които идват в средата на масата.",
    description_ar: "أطباق عائلية تُوضع في وسط الطاولة.",
    desktop_image: "/img/banner/bannerThumb1_3.png",
    mobile_image: "/img/banner/bannerThumb1_3.png",
    menu_item_id: 8,
  },
];
