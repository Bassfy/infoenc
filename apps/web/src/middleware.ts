import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@infoenc/i18n";

/** Locale routing (Phase 2 doc 04 §3), shared behavior with the academy app. */
export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
