import type { MetadataRoute } from "next";

/**
 * robots.txt (Phase 1 SEO mandate, NFR-055). Allows marketing/content; blocks the portal, admin,
 * and auth surfaces from indexing. Points crawlers at the locale-specific sitemaps.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infoenc.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/*/portal/", "/api/", "/*/scope/"], // private + form POST targets
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
