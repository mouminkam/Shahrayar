"use client";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface AnimatedSectionProps {
  children: ReactNode;
  /** Animation duration in seconds (default: 0.8) */
  duration?: number;
  /** If true, shows content immediately on mobile without animation delay */
  mobileOptimized?: boolean;
}

// AnimatedSection Wrapper Component
// Provides smooth scroll-triggered animations for sections
const AnimatedSection = ({ children, duration = 0.8, mobileOptimized = true }: AnimatedSectionProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true, // Trigger once for better performance
    threshold: 0.05, // Lower threshold for mobile
    rootMargin: mobileOptimized ? "200px 0px 0px 0px" : "0px 0px -50px 0px", // Larger margin on mobile
  });

  // Mark as mounted after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Detect mobile on mount
  useEffect(() => {
    if (!isMounted) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMounted]);

  useEffect(() => {
    if (inView && isMounted) {
      // On mobile, animate faster and ensure visibility
      const animDuration = isMobile && mobileOptimized ? duration * 0.6 : duration;
      controls.start({
        x: 0,
        opacity: 1,
        transition: { duration: animDuration, ease: "easeOut" },
      });
    } else if (!mobileOptimized && isMounted) {
      // Only animate out on desktop if not mobile optimized
      controls.start({
        x: -100,
        opacity: 0,
        transition: { duration: duration * 0.6, ease: "easeInOut" },
      });
    }
  }, [controls, inView, duration, isMobile, mobileOptimized, isMounted]);

  // Always start hidden to avoid hydration mismatch
  // State will be updated via controls.start() in useEffect
  const initialState = { x: -100, opacity: 0 };

  return (
    <motion.div ref={ref} animate={controls} initial={initialState}>
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
