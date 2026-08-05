import Link from "@/components/ui/LocalizedLink";

export default function LoginFooter() {
  return (
    <div className="mt-6 text-center">
      <p className="text-text text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-theme3 hover:text-theme font-semibold transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
