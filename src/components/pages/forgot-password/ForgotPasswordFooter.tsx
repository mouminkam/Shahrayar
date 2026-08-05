// Removed "use client" - This component only uses static JSX and Link components which are SSR-compatible
import Link from "@/components/ui/LocalizedLink";
import { ArrowRight } from "lucide-react";

export default function ForgotPasswordFooter() {
  return (
    <div className="mt-6 text-center">
      <Link
        href="/login"
        className="text-theme3 hover:text-theme text-sm font-medium transition-colors inline-flex items-center gap-1"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to Login
      </Link>
    </div>
  );
}
