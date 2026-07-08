/**
 * Shared i18n primitives (Phase 2 doc 04 §3, NFR-050s). The Next.js apps use next-intl for
 * rendering; this package owns the locale list, direction mapping, negotiation, and Intl-based
 * formatters so web, API, emails, and PDFs agree on locale behavior.
 */
export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Negotiate a locale from an Accept-Language header, falling back to the default. */
export function negotiate(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  for (const part of acceptLanguage.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    const base = tag.split("-")[0];
    if (base && isLocale(base)) return base;
  }
  return defaultLocale;
}

/** Locale-aware currency formatting from integer minor units (Phase 3 doc 01 §5). */
export function formatMoney(minorUnits: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en", {
    style: "currency",
    currency,
  }).format(minorUnits / 100);
}

export function formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", options).format(date);
}
