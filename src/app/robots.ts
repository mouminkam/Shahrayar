import type { MetadataRoute } from "next";
import { SITE_URL } from "../data/constants";

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
