import type { CSSProperties } from "react";

/**
 * SeverityBadge (Phase 4 doc 04). The finding-severity scale rendered with color + icon + label —
 * NEVER color alone (NFR-064 color-blind safety). Shared by the client portal (findings), the admin
 * engagement tooling, and anywhere severity is shown, so the whole product speaks one severity
 * language sourced from the design tokens (which match the FindingSeverity enum, Phase 4 doc 02 §3).
 */
export type Severity = "info" | "low" | "medium" | "high" | "critical";

const META: Record<Severity, { label: string; icon: string; token: string }> = {
  critical: { label: "Critical", icon: "▲", token: "var(--sev-critical)" },
  high: { label: "High", icon: "▲", token: "var(--sev-high)" },
  medium: { label: "Medium", icon: "◆", token: "var(--sev-medium)" },
  low: { label: "Low", icon: "●", token: "var(--sev-low)" },
  info: { label: "Info", icon: "ℹ", token: "var(--sev-info)" },
};

export function SeverityBadge({ severity, count }: { severity: Severity; count?: number }) {
  const m = META[severity];
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4em",
    padding: "0.2rem 0.55rem",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: m.token,
    // translucent tint of the same hue — readable on both themes
    background: `color-mix(in oklch, ${m.token} 16%, transparent)`,
    border: `1px solid color-mix(in oklch, ${m.token} 30%, transparent)`,
  };
  return (
    <span style={style} aria-label={`${m.label} severity${count !== undefined ? `, ${count}` : ""}`}>
      <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: m.token, display: "inline-block" }} />
      {m.label}
      {count !== undefined ? <span style={{ opacity: 0.8 }}>· {count}</span> : null}
    </span>
  );
}
