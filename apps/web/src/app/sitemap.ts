import type { MetadataRoute } from "next";
import { locales } from "@infoenc/i18n";

/**
 * Sitemap (NFR-055) with hreflang alternates per locale. Static marketing/service routes are listed
 * here; blog and service-detail entries are appended from the CMS at build/revalidate time (a CMS
 * publish webhook triggers revalidation — Phase 2 doc 04 §6). Every URL carries its ar/en alternates
 * so search engines serve the right locale.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infoenc.com";

const STATIC_PATHS = ["", "/services", "/industries", "/about", "/careers", "/blog", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${SITE}/${l}${path}`])),
      },
    })),
  );
}
