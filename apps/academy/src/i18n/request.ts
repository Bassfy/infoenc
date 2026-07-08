import { getRequestConfig } from "next-intl/server";
import { isLocale, defaultLocale, type Locale } from "@infoenc/i18n";
import en from "@infoenc/i18n/messages/en/common.json";
import ar from "@infoenc/i18n/messages/ar/common.json";

/**
 * Loads the active locale's message catalog from @infoenc/i18n (Phase 2 doc 04 §3). Catalogs are
 * shared across apps so keys and the parity gate are centralized (Phase 2 doc 02 §2.5).
 *
 * The catalogs are imported statically (one per locale) rather than resolved from a dynamic path:
 * a bundler can't build a require-context for a dynamic path against the package's `./messages/*`
 * exports map, and with a fixed, small locale set the explicit map is correct and tree-shakeable.
 */
const catalogs: Record<Locale, typeof en> = { en, ar };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;
  return { locale, messages: { common: catalogs[locale] } };
});
