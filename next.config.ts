import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "htmlbeans.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shahrayar.peaklink.pro",
        port: "",
        pathname: "/**",
      },
    ],
    // Image optimization settings - Improved for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
 
    // Configure allowed quality values used in Image components
    qualities: [75, 80, 85, 90],
    // Enable content-based image sizing
    dangerouslyAllowSVG: true,
    // PHASE-A FIX [M4]: sandbox SVGs to prevent script execution
    contentDispositionType: 'attachment' as const,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // PHASE-A FIX [H3]: HTTP security headers on all routes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  // Compiler options for production
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // Production optimizations
  // Note: Next.js 16 uses SWC minification by default, targeting modern browsers
  productionBrowserSourceMaps: false, // Disable source maps in production for better performance
  poweredByHeader: false, // Remove X-Powered-By header for security and performance
  // Experimental features for better performance
  // Note: Turbopack (Next.js 16 default) handles bundle optimization automatically
  experimental: {
    optimizePackageImports: [
      "lucide-react", 
      "framer-motion", 
      "swiper", 
      "react-icons",
      "@stripe/react-stripe-js",
      "@stripe/stripe-js",
      "react-hook-form",
      "zod",
      "@hookform/resolvers",
    ],
  },
  // Turbopack configuration (empty config to silence the warning)
  // Turbopack handles bundle splitting and optimization automatically
  turbopack: {},
};

export default nextConfig;
