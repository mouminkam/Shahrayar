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
import ContactHeroStream from "./_components/ContactHeroStream";
import ContactSecondarySections from "./_components/ContactSecondarySections";

const getDefaultBranchCached = unstable_cache(
  async (lang: string) => fetchDefaultBranch(lang, null),
  ["contact-default-branch"],
  { revalidate: 300 }
);

async function fetchBranchDetails(branchId: string | number | undefined, lang: string, token: string | null): Promise<Branch | null> {
  if (!branchId) return null;
  try {
    const serverAxios = await createServerAxios({ language: lang, token });
    const response = await serverAxios.get(`/branches/${branchId}`);
    return response?.data?.success ? response.data.data?.branch : null;
  } catch (error) {
    console.error("Error fetching branch details:", error);
    return null;
  }
}

const getBranchDetailsCached = unstable_cache(
  async (branchId: string, lang: string) => fetchBranchDetails(branchId, lang, null),
  ["contact-branch-details"],
  { revalidate: 300 }
);

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  return {
    title: t(lang, "contact_us"),
    description: "Contact Shahrayar Restaurant",
    keywords: [t(lang, "contact_us")],
  };
}

export const revalidate = 300;

export default async function ContactPage() {
  const lang = await getLanguage();
  const token = await getAuthToken();

  const defaultBranch: Branch | null = token
    ? await fetchDefaultBranch(lang, token)
    : await getDefaultBranchCached(lang);
  const branchId = defaultBranch?.id || defaultBranch?.branch_id;

  const branchDetailsPromise = token
    ? fetchBranchDetails(branchId, lang, token)
    : getBranchDetailsCached(branchId as string, lang);

  return (
    <div className="bg-bg3 min-h-screen">
      <Breadcrumb title={t(lang, "contact_us")} />

      {/* ===== MAIN SECTION — renders immediately ===== */}
      <Suspense
        fallback={
          <SectionSkeleton variant="grid" cardCount={3} height="h-64" />
        }
      >
        <ContactHeroStream
          branchDetailsPromise={branchDetailsPromise}
          lang={lang}
        />
      </Suspense>

      {/* ===== SECONDARY SECTION — deferred via Suspense ===== */}
      <ErrorBoundary>
        <Suspense
          fallback={<SectionSkeleton variant="default" height="h-screen" />}
        >
          <ContactSecondarySections
            branchDetailsPromise={branchDetailsPromise}
            lang={lang}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
