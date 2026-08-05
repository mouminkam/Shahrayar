// MODIFIED: Phase B — SSR/CSR Migration
import SectionSkeleton from "../../../components/ui/SectionSkeleton";

export default function Loading() {
  return (
    <div className="bg-bg3 min-h-screen">
      <SectionSkeleton variant="grid" cardCount={12} height="h-screen" />
    </div>
  );
}
