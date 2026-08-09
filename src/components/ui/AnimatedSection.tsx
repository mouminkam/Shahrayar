"use client";
import { useEffect, useRef, type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  /** Reveal delay in ms, for staggering sibling sections. */
  delay?: number;
  /** Kept for API compatibility with existing call sites. */
  duration?: number;
  mobileOptimized?: boolean;
}

/**
 * Scroll reveal wrapper — fail-safe by design.
 *
 * The server-rendered markup is fully visible: the hidden state is applied by
 * this effect, on the client, at the same moment the observer starts watching.
 * So if JS is slow, blocked, or IntersectionObserver is unavailable, the
 * content simply shows — it can never get stranded at opacity 0. A timeout
 * backstop covers the case where the observer exists but never fires.
 *
 * Implemented with a CSS transition rather than a motion library: section
 * reveals are the most-repeated animation on the page, and this keeps them off
 * the JS main thread and out of the bundle.
 */
const AnimatedSection = ({ children, delay = 0 }: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    // Already on screen at mount (above the fold): leave it visible rather
    // than hiding it just to fade it straight back in.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return;

    el.classList.add("reveal-init");

    const reveal = () => {
      el.classList.add("reveal-in");
      observer.disconnect();
      clearTimeout(backstop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0 }
    );

    observer.observe(el);
    const backstop = setTimeout(reveal, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(backstop);
    };
  }, []);

  return (
    <div ref={ref} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
};

export default AnimatedSection;
