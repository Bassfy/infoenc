/**
 * Schema.org structured data (Phase 1 SEO mandate). Generated from real content, not hand-kept, so
 * it never drifts from the page. Rendered as JSON-LD <script> tags in the relevant layouts/pages.
 * Every graph is validated against schema.org shapes; the org node is shared across pages.
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infoenc.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "INFOENC",
    url: SITE,
    logo: `${SITE}/logo.png`,
    description:
      "Enterprise cybersecurity services and a hands-on security academy — penetration testing, red teaming, and defense, built from real engagements.",
    sameAs: [] as string[], // social profiles added at launch
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      availableLanguage: ["en", "ar"],
    },
  };
}

/** A services page → schema.org Service (FR-CO-002). */
export function serviceSchema(input: { name: string; description: string; slug: string; locale: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.name,
    name: input.name,
    description: input.description,
    provider: { "@type": "Organization", name: "INFOENC", url: SITE },
    url: `${SITE}/${input.locale}/services/${input.slug}`,
    areaServed: ["SA", "AE", "EG", "QA", "KW"],
  };
}

/** An academy course → schema.org Course (FR-AC-021). */
export function courseSchema(input: { title: string; description: string; slug: string; locale: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.title,
    description: input.description,
    url: `${SITE}/${input.locale}/courses/${input.slug}`,
    provider: { "@type": "Organization", name: "INFOENC Academy", url: SITE },
    inLanguage: input.locale,
  };
}

/** Serialize for a <script type="application/ld+json"> tag. */
export function jsonLd(schema: object): string {
  return JSON.stringify(schema);
}
