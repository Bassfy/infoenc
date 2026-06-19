import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://waclighting.com"),
  title: {
    default: "WAC Lighting | Architectural LED Lighting Solutions",
    template: "%s | WAC Lighting",
  },
  description:
    "WAC Lighting pioneers architectural LED illumination with TrueColor Technology, SmartLink integration, and 40+ years of precision engineering. Explore 50,000+ products for interior, exterior, and commercial applications.",
  keywords: [
    "architectural lighting",
    "LED lighting",
    "recessed lighting",
    "track lighting",
    "landscape lighting",
    "smart lighting",
    "tunable white",
    "commercial lighting",
    "outdoor lighting",
    "WAC lighting",
    "LED fixtures",
    "photometric design",
  ],
  authors: [{ name: "WAC Lighting" }],
  creator: "WAC Lighting",
  publisher: "WAC Lighting",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://waclighting.com",
    siteName: "WAC Lighting",
    title: "WAC Lighting | Architectural LED Lighting Solutions",
    description:
      "Pioneer of architectural LED illumination. TrueColor Technology, SmartLink integration, and 40+ years of precision engineering excellence.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WAC Lighting — Architectural LED Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@waclighting",
    creator: "@waclighting",
    title: "WAC Lighting | Architectural LED Lighting Solutions",
    description:
      "Pioneer of architectural LED illumination. 50,000+ products, TrueColor Technology, SmartLink integration.",
    images: ["/twitter-card.jpg"],
  },
  alternates: {
    canonical: "https://waclighting.com",
  },
  category: "Lighting",
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "WAC Lighting",
              url: "https://waclighting.com",
              logo: "https://waclighting.com/logo.png",
              description:
                "WAC Lighting — Pioneer of architectural LED illumination for 40+ years",
              foundingDate: "1984",
              address: {
                "@type": "PostalAddress",
                streetAddress: "44 Harbor Park Drive",
                addressLocality: "Port Washington",
                addressRegion: "NY",
                postalCode: "11050",
                addressCountry: "US",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-800-526-2588",
                contactType: "customer service",
                availableLanguage: "English",
              },
              sameAs: [
                "https://www.facebook.com/waclighting",
                "https://www.instagram.com/waclighting",
                "https://www.linkedin.com/company/wac-lighting",
                "https://www.pinterest.com/waclighting",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-obsidian-DEFAULT text-white overflow-x-hidden">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
