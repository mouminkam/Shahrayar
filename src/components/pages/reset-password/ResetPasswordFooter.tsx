// Removed "use client" - This component only uses static JSX and Link components which are SSR-compatible
import Link from "@/components/ui/LocalizedLink";
import { ArrowRight } from "lucide-react";

export default function ResetPasswordFooter() {
  return (
    <div className="mt-6 text-center space-y-2">
      <div>
        <Link
          href="/login"
          className="text-theme3 hover:text-theme text-sm font-medium transition-colors inline-flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Login
        </Link>
      </div>
      <div>
        <Link
          href="/forgot-password"
          className="text-text/70 hover:text-theme3 text-sm font-medium transition-colors"
        >
          Request a new reset link
        </Link>
      </div>
    </div>
  );
}
