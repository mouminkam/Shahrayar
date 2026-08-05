"use client";
import { useEffect } from "react";

interface PageSEOProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Page URL (optional) */
  url?: string;
  /** OG image URL (optional) */
  image?: string;
  /** OG type (default: "website") */
  type?: string;
  keywords?: string[];
}

/**
 * PageSEO Component
 * Adds SEO metadata to client components
 */
export default function PageSEO({
  title,
  description,
  url = "",
  image = "/img/logo/mainlogo.png",
  type = "website",
  keywords = [],
}: PageSEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shahrayar.peaklink.pro";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const fullTitle = title.includes("Shahrayar") ? title : `${title} | Shahrayar Restaurant`;

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = fullTitle;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string | undefined, attribute: string = "name") => {
      if (content === undefined) return;
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    if (description) {
      updateMetaTag("description", description);
    }

    if (keywords.length > 0) {
      updateMetaTag("keywords", keywords.join(", "));
    }

    // Open Graph tags
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:url", fullUrl, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:image", imageUrl, "property");
    updateMetaTag("og:site_name", "Shahrayar Restaurant", "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", imageUrl);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);
  }, [title, description, url, image, type, keywords, fullTitle, fullUrl, imageUrl]);

  return null;
}
