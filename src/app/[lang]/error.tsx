// MODIFIED: Phase B — SSR/CSR Migration
"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-bg3 min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="text-sm text-text text-center max-w-md">
        {error?.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-theme3 text-white rounded-xl font-semibold hover:opacity-90 transition"
      >
        Try again
      </button>
    </div>
  );
}
