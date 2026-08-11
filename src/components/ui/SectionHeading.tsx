import type { ReactNode } from "react";

/**
 * The eight-point star (khatim) is the one recurring mark of this design —
 * used nowhere else, so it stays legible as a signature instead of
 * decoration. Two hairline strokes rotated 45° apart, not a filled icon.
 */
function KhatimMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path
        d="M16 2 L20 12 L30 16 L20 20 L16 30 L12 20 L2 16 L12 12 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Chapter numerals — Eastern Arabic digits, a literal nod to "a thousand and one nights" counted one by one. */
const EASTERN_ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toEasternArabicNumeral(n: number): string {
  return String(n)
    .split("")
    .map((d) => EASTERN_ARABIC_DIGITS[Number(d)] ?? d)
    .join("");
}

interface SectionHeadingProps {
  /**
   * Position in the home page's sequence, rendered as a small Eastern Arabic
   * numeral chapter mark. Omit when this heading isn't part of that sequence
   * (e.g. the same component reused on a product page for "related dishes") —
   * the mark disappears rather than showing a number that wouldn't mean anything there.
   */
  chapter?: number;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "start";
  /** Renders light text for use over photographic/dark-image backgrounds vs. the plain section background. */
  tone?: "default" | "onImage";
  className?: string;
}

/**
 * Shared section header for the home page: chapter mark + eyebrow + serif
 * headline + khatim divider. Every home section uses this instead of its own
 * ad hoc sub-title/title pair, so the page reads as one authored sequence
 * rather than a stack of unrelated template blocks.
 */
export default function SectionHeading({
  chapter,
  eyebrow,
  title,
  description,
  align = "center",
  tone = "default",
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={`${isCenter ? "text-center mx-auto" : "text-start"} max-w-2xl ${className}`}>
      <div
        className={`flex items-center gap-3 mb-4 ${isCenter ? "justify-center" : "justify-start"} ${
          tone === "onImage" ? "text-theme3" : "text-theme3"
        }`}
      >
        {chapter != null && (
          <>
            <span aria-hidden="true" className="font-[family-name:var(--font-amiri)] text-sm opacity-70">
              {toEasternArabicNumeral(chapter)}
            </span>
            <span className="h-px w-8 bg-current opacity-40" aria-hidden="true" />
          </>
        )}
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.28em]">{eyebrow}</p>
      </div>

      <h2
        className={`font-[family-name:var(--font-amiri)] font-bold leading-[1.15] mb-4 ${
          tone === "onImage" ? "text-white" : "text-white"
        } text-[clamp(1.9rem,4.2vw,3.25rem)]`}
      >
        {title}
      </h2>

      <div className={`flex items-center gap-3 text-theme3/70 ${isCenter ? "justify-center" : "justify-start"}`}>
        <span className="h-px w-10 bg-current" aria-hidden="true" />
        <KhatimMark className="w-3.5 h-3.5" />
        <span className="h-px w-10 bg-current" aria-hidden="true" />
      </div>

      {description && (
        <p className={`text-text text-sm sm:text-base leading-relaxed mt-5 ${isCenter ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  );
}
