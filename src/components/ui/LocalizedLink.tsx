"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { useLanguage } from "../../context/LanguageContext";

type LocalizedLinkProps = Omit<LinkProps, "href"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    children: ReactNode;
  };

function isExternal(href: string): boolean {
  return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#");
}

/**
 * Drop-in replacement for next/link that prefixes internal hrefs with the
 * current locale segment (e.g. "/shop" -> "/en/shop"). External links,
 * anchors, mailto/tel links, and already-localized hrefs pass through untouched.
 */
const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(function LocalizedLink(
  { href, ...rest },
  ref
) {
  const { lang } = useLanguage();

  const localizedHref =
    isExternal(href) || href.startsWith(`/${lang}/`) || href === `/${lang}`
      ? href
      : `/${lang}${href.startsWith("/") ? href : `/${href}`}`;

  return <Link ref={ref} href={localizedHref} {...rest} />;
});

export default LocalizedLink;
