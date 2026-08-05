// MODIFIED: Phase B — SSR/CSR Migration
import SectionSkeleton from "../../../components/ui/SectionSkeleton";

export default function Loading() {
  return (
    <div className="bg-bg3 min-h-screen">
      <SectionSkeleton variant="default" height="h-screen" />
    </div>
  );
}
