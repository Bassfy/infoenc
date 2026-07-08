import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, dir, locales } from "@infoenc/i18n";
import "@infoenc/ui/tokens/globals.css";

/**
 * Root bilingual layout (Phase 2 doc 04, Phase 4 design system). Sets `lang`/`dir` on <html> so
 * RTL is a first-class layout via logical properties (NFR-051), and mounts the theme-aware token
 * stylesheet. Fonts are self-hosted variable faces loaded via next/font in production (Geist +
 * IBM Plex Sans Arabic — Phase 4 doc 03); omitted from this scaffold to avoid binary assets.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: { default: "INFOENC Academy", template: "%s · INFOENC Academy" },
  description: "Hands-on cybersecurity training and labs, built from real engagements.",
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
