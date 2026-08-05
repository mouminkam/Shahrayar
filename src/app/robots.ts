import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://shahrayar.peaklink.pro";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/cart",
        "/*/checkout",
        "/*/profile",
        "/*/orders",
        "/*/add-phone",
        "/*/enter-otp",
        "/*/add-information",
        "/*/confirm-information",
        "/*/verify-reset-token",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
