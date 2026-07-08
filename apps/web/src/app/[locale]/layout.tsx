import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, dir, locales } from "@infoenc/i18n";
import "@infoenc/ui/tokens/globals.css";

/**
 * INFOENC company site + client portal root layout (Phase 2 doc 04). Bilingual lang/dir, theme-aware
 * tokens. The marketing register is calmer/airier than the academy (Phase 4 doc 01 §7); the portal
 * routes (/[locale]/portal) add an authenticated layout on top of this.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: { default: "INFOENC", template: "%s · INFOENC" },
  description: "Enterprise cybersecurity services — penetration testing, red teaming, and defense.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
