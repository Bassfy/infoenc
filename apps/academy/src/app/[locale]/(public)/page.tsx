import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

/**
 * Academy landing (Phase 4 wireframe §1). Server-rendered, near-zero client JS — the cinematic
 * hero/3D islands (Phase 4 doc 05) hydrate lazily and are omitted from this scaffold. Copy comes
 * from the shared bilingual catalog; the layout is direction-agnostic (logical properties), so the
 * same markup renders correctly LTR and RTL.
 */
export default function LandingPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <Landing />;
}

function Landing() {
  const t = useTranslations("common");
  return (
    <main>
      <header className="container" style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", paddingBlock: "var(--space-5)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontWeight: 600 }}>
          <span aria-hidden style={{ width: 22, height: 22, borderRadius: 999, border: "2px solid var(--color-accent)" }} />
          {t("brand.name")}
        </span>
        <nav style={{ marginInlineStart: "auto", display: "flex", gap: "var(--space-5)", color: "var(--text-secondary)" }}>
          <a href="paths">{t("nav.paths")}</a>
          <a href="labs">{t("nav.labs")}</a>
          <a href="pricing">{t("nav.pricing")}</a>
        </nav>
      </header>

      <section className="container" style={{ paddingBlock: "var(--space-10)" }}>
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "var(--text-xs)" }}>
          {t("brand.tagline")}
        </p>
        <h1 style={{ fontSize: "var(--text-5xl)", maxWidth: "15ch", marginBlock: "var(--space-4)" }}>
          {t("hero.headline")}
        </h1>
        <p style={{ fontSize: "var(--text-lg)", color: "var(--text-secondary)", maxWidth: "48ch" }}>
          {t("hero.subhead")}
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>
          <a href="register" className="glass" style={{ background: "var(--color-accent)", color: "var(--text-on-accent)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-md)", fontWeight: 500 }}>
            {t("hero.ctaPrimary")}
          </a>
          <a href="paths" style={{ border: "1px solid var(--color-border)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}>
            {t("hero.ctaSecondary")}
          </a>
        </div>
      </section>
    </main>
  );
}
