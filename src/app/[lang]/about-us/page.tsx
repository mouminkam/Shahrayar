// MODIFIED: Phase C — Page Splitting
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import SectionSkeleton from "../../../components/ui/SectionSkeleton";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import { getLanguage } from "../../../lib/getLanguage";
import { getAuthToken } from "../../../lib/getAuthToken";
import { fetchDefaultBranch, type Branch } from "../../../lib/fetchDefaultBranch";
import { t } from "../../../locales/i18n/getTranslation";
import { createServerAxios } from "../../../api/config/serverAxios";
import AboutHeroStream from "./_components/AboutHeroStream";
import AboutSecondarySections from "./_components/AboutSecondarySections";

const getDefaultBranchCached = unstable_cache(
  async (lang: string) => fetchDefaultBranch(lang, null),
  ["about-default-branch"],
  { revalidate: 300 }
);

async function fetchChefs(branchId: string | number | undefined, lang: string, token: string | null) {
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
  ["about-chefs"],
  { revalidate: 300 }
);

async function fetchWebsiteSlides(branchId: string | number | undefined, lang: string, token: string | null) {
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
  ["about-slides"],
  { revalidate: 300 }
);

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  return {
    title: t(lang, "about_us"),
    description: "Learn more about Shahrayar Restaurant",
    keywords: [t(lang, "about_us")],
  };
}

export const revalidate = 300;

export default async function AboutUsPage() {
  const lang = await getLanguage();
  const token = await getAuthToken();

  const defaultBranch: Branch | null = token
    ? await fetchDefaultBranch(lang, token)
    : await getDefaultBranchCached(lang);
  const branchId = defaultBranch?.id || defaultBranch?.branch_id;

  const slidesPromise = token
    ? fetchWebsiteSlides(branchId, lang, token)
    : getWebsiteSlidesCached(branchId as string, lang);
  const chefsPromise = token
    ? fetchChefs(branchId, lang, token)
    : getChefsCached(branchId as string, lang);

  return (
    <div className="bg-bg3 min-h-screen">
      <Breadcrumb title={t(lang, "about_us")} />

      {/* ===== MAIN SECTION — renders immediately ===== */}
      <Suspense
        fallback={<SectionSkeleton variant="default" height="h-screen" />}
      >
        <AboutHeroStream slidesPromise={slidesPromise} lang={lang} />
      </Suspense>

      {/* ===== SECONDARY SECTION — deferred via Suspense ===== */}
      <ErrorBoundary>
        <Suspense
          fallback={
            <SectionSkeleton variant="grid" cardCount={3} height="h-96" />
          }
        >
          <AboutSecondarySections chefsPromise={chefsPromise} lang={lang} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
