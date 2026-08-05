import Link from "@/components/ui/LocalizedLink";

export default function RegisterFooter() {
  return (
    <div className="mt-6 text-center">
      <p className="text-text text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-theme3 hover:text-theme font-semibold transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
