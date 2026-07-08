import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { HeroOrb } from "../../../components/hero-orb";

/**
 * Academy landing (Phase 4 wireframe §1). Server-rendered; the cinematic hero is a real 3D island
 * (Phase 4 doc 05) — the WebGL particle orb (HeroOrb) is a client component that hydrates in place
 * over a token-driven aurora backdrop, while the copy stays server-rendered. Copy comes from the
 * shared bilingual catalog; the layout is direction-agnostic (logical properties), so the same
 * markup renders correctly LTR and RTL.
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

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          // signature aurora backdrop (purple → pink → baby blue), token-driven
          backgroundImage: "var(--gradient-aurora)",
        }}
      >
        {/* live 3D island — the WebGL particle orb, behind the copy */}
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <HeroOrb />
        </div>
        {/* bottom readability veil into the page background */}
        <div
          aria-hidden
          style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, transparent 45%, var(--color-bg) 100%)" }}
        />

        <div className="container" style={{ position: "relative", zIndex: 2, paddingBlock: "var(--space-10)" }}>
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "var(--text-xs)" }}>
            {t("brand.tagline")}
          </p>
          <h1 style={{ fontSize: "var(--text-5xl)", maxWidth: "15ch", marginBlock: "var(--space-4)" }}>
            <span
              style={{
                backgroundImage: "var(--gradient-brand)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t("hero.headline")}
            </span>
          </h1>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-secondary)", maxWidth: "48ch" }}>
            {t("hero.subhead")}
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-6)" }}>
            <a href="register" style={{ backgroundImage: "var(--gradient-brand)", color: "#12081f", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-md)", fontWeight: 600, boxShadow: "var(--shadow-accent-glow)" }}>
              {t("hero.ctaPrimary")}
            </a>
            <a href="paths" className="glass" style={{ padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}>
              {t("hero.ctaSecondary")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
