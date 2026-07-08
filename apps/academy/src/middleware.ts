import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@infoenc/i18n";

/**
 * Locale routing (Phase 2 doc 04 §3). Negotiates ar/en from the cookie then Accept-Language,
 * rewrites to the `[locale]` segment, and preserves the choice. Admin/portal/session routes are
 * excluded from indexing at the app level; this middleware only governs locale.
 */
export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always", // /ar/... and /en/... — explicit, hreflang-friendly (NFR-055)
  localeDetection: true,
});

export const config = {
  // Run on everything except API, static assets, and Next internals.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
