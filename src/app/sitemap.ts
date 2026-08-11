import type { MetadataRoute } from "next";
import { createServerAxios } from "../api/config/serverAxios";
import { i18n } from "../locales/i18n/config";
import { SITE_URL } from "../data/constants";

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/terms-conditions", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = i18n.locales.flatMap((locale) =>
    STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency,
      priority,
    }))
  );

  let productRoutes: MetadataRoute.Sitemap = [];

  try {
    const serverAxios = await createServerAxios();
    const response = await serverAxios.get("/menu-items", {
      params: { limit: 1000 },
    });

    if (response?.data?.success) {
      const items = response.data.data?.items?.data || [];
      productRoutes = i18n.locales.flatMap((locale) =>
        items.map((item: { id: string | number; updated_at?: string }) => ({
          url: `${SITE_URL}/${locale}/shop/${item.id}`,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          ...(item.updated_at && {
            lastModified: new Date(item.updated_at),
          }),
        }))
      );
    }
  } catch (error) {
    console.error("Sitemap: failed to fetch product routes", error);
  }

  return [...staticRoutes, ...productRoutes];
}
