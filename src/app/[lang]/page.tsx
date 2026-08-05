// MODIFIED: Phase C — Page Splitting
import { Suspense } from "react";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../components/ui/SectionSkeleton";
import { getAuthToken } from "../../lib/getAuthToken";
import { fetchDefaultBranch, type Branch } from "../../lib/fetchDefaultBranch";
import { createServerAxios } from "../../api/config/serverAxios";
import { i18n, type Locale } from "../../locales/i18n/config";
import HeroBannerStream from "./_components/HeroBannerStream";
import HomeSecondarySections from "./_components/HomeSecondarySections";

interface Highlights {
  popular: unknown[];
  latest: unknown[];
  chefSpecial: unknown[];
}

const getDefaultBranchCached = unstable_cache(
  async (lang: string) => fetchDefaultBranch(lang, null),
  ["home-default-branch"],
  { revalidate: 300 }
);

async function fetchWebsiteSlides(branchId: string | undefined, lang: string, token: string | null) {
  if (!branchId) return [];
  try {
    const serverAxios = await createServerAxios({ language: lang, token });
    const response = await serverAxios.get("/website-slides", {
      params: { branch_id: branchId },
    });
    return response?.data?.success ? response.data.data?.slides || [] : [];
  } catch (error) {
    console.error("Error fetching website slides:", error);
    return [];
  }
}

const getWebsiteSlidesCached = unstable_cache(
  async (branchId: string, lang: string) => fetchWebsiteSlides(branchId, lang, null),
  ["home-slides"],
  { revalidate: 300 }
);

async function fetchHighlights(
  branchId: string | undefined,
  lang: string,
  token: string | null
): Promise<Highlights> {
  if (!branchId) return { popular: [], latest: [], chefSpecial: [] };
  try {
    const serverAxios = await createServerAxios({ language: lang, token });
    const response = await serverAxios.get("/menu-items/highlights", {
      params: { branch_id: branchId },
    });
    if (!response?.data?.success || !response.data.data) {
      return { popular: [], latest: [], chefSpecial: [] };
    }
    const data = response.data.data;
    return {
      popular: data.popular || [],
      latest: data.latest || [],
      chefSpecial: data.chef_special || [],
    };
  } catch (error) {
    console.error("Error fetching highlights:", error);
    return { popular: [], latest: [], chefSpecial: [] };
  }
}

const getHighlightsCached = unstable_cache(
  async (branchId: string, lang: string) => fetchHighlights(branchId, lang, null),
  ["home-highlights"],
  { revalidate: 300 }
);

async function fetchChefs(branchId: string | undefined, lang: string, token: string | null) {
  if (!branchId) return [];
  try {
    const serverAxios = await createServerAxios({ language: lang, token });
    const response = await serverAxios.get("/chefs", {
      params: { branch_id: branchId },
    });
    return response?.data?.success ? response.data.data?.chefs || [] : [];
  } catch (error) {
    console.error("Error fetching chefs:", error);
    return [];
  }
}

const getChefsCached = unstable_cache(
  async (branchId: string, lang: string) => fetchChefs(branchId, lang, null),
  ["home-chefs"],
  { revalidate: 300 }
);

export const metadata: Metadata = {
  title: {
    absolute: "Shahrayar Restaurant - Authentic Middle Eastern Cuisine",
  },
  description:
    "Experience authentic Middle Eastern flavors at Shahrayar Restaurant. Fresh ingredients, traditional recipes, and genuine hospitality. Order online for delivery or pickup.",
  keywords: [
    "Middle Eastern food",
    "restaurant",
    "delivery",
    "pickup",
    "authentic cuisine",
    "Shahrayar",
  ],
};

export const revalidate = 180;

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang: Locale = (i18n.locales as readonly string[]).includes(rawLang)
    ? (rawLang as Locale)
    : i18n.defaultLocale;
  const token = await getAuthToken();

  const defaultBranch: Branch | null = token
    ? await fetchDefaultBranch(lang, token)
    : await getDefaultBranchCached(lang);
  const rawBranchId = defaultBranch?.id || defaultBranch?.branch_id;
  const branchId = rawBranchId != null ? String(rawBranchId) : undefined;

  const slidesPromise = token
    ? fetchWebsiteSlides(branchId, lang, token)
    : getWebsiteSlidesCached(branchId as string, lang);
  const highlightsPromise = token
    ? fetchHighlights(branchId, lang, token)
    : getHighlightsCached(branchId as string, lang);
  const chefsPromise = token
    ? fetchChefs(branchId, lang, token)
    : getChefsCached(branchId as string, lang);

  return (
    <div className="bg-bg3 min-h-screen">
      {/* ===== MAIN SECTION — renders immediately ===== */}
      <Suspense fallback={<SectionSkeleton variant="default" height="h-screen" />}>
        <HeroBannerStream slidesPromise={slidesPromise} lang={lang} />
      </Suspense>

      {/* ===== SECONDARY SECTION — deferred via Suspense ===== */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton variant="default" height="h-screen" />}>
          <HomeSecondarySections
            slidesPromise={slidesPromise}
            highlightsPromise={highlightsPromise}
            chefsPromise={chefsPromise}
            lang={lang}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
