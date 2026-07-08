import { getRequestConfig } from "next-intl/server";
import { isLocale, defaultLocale } from "@infoenc/i18n";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Loads the active locale's shared catalog (Phase 2 doc 02 §2.5). */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;
  const dir = require.resolve(`@infoenc/i18n/messages/${locale}/common.json`);
  const messages = { common: JSON.parse(await readFile(dir, "utf8")) };
  return { locale, messages };
});
