import { setRequestLocale } from "next-intl/server";
import { SeverityBadge } from "@infoenc/ui";

/**
 * Client portal — findings feed (Phase 4 wireframe §7, FR-CO-032). Server-rendered; the org is
 * resolved from the authenticated session (RLS scopes the API read to this client org — a contact
 * can never see another org's findings). New findings arrive live over the WS gateway (subscription
 * added with the realtime wiring). Severity is shown with color + icon + label (never color-only,
 * NFR-064) via the shared SeverityBadge.
 *
 * Data shape mirrors EngagementService.findingsFeed (core-api). Rendered here with representative
 * data for the scaffold; the RSC fetch to the GraphQL persisted query is wired with the API client.
 */
type Severity = "critical" | "high" | "medium" | "low" | "info";
interface FindingRow {
  id: string;
  severity: Severity;
  status: string;
  affectedAsset: string | null;
  cvssScore: number | null; // x10
}

const DEMO_FEED: { summary: Record<Severity, number>; findings: FindingRow[] } = {
  summary: { critical: 1, high: 2, medium: 3, low: 1, info: 0 },
  findings: [
    { id: "1", severity: "critical", status: "open", affectedAsset: "auth.acme.com /login", cvssScore: 91 },
    { id: "2", severity: "high", status: "remediating", affectedAsset: "api.acme.com /v1/users", cvssScore: 74 },
    { id: "3", severity: "high", status: "open", affectedAsset: "vpn.acme.com", cvssScore: 72 },
    { id: "4", severity: "medium", status: "retest_requested", affectedAsset: "www.acme.com", cvssScore: 52 },
  ],
};

export default function FindingsFeedPage({ params }: { params: { locale: string; engagementId: string } }) {
  setRequestLocale(params.locale);
  const { summary, findings } = DEMO_FEED;

  return (
    <main className="container" style={{ paddingBlock: "var(--space-8)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "var(--text-2xl)" }}>Findings</h1>
        <span className="dim" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
          Acme Web Application Pentest · In progress
        </span>
      </div>

      {/* Severity rollup */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBlock: "var(--space-5)", flexWrap: "wrap" }}>
        {(Object.keys(summary) as Severity[]).map((sev) =>
          summary[sev] > 0 ? (
            <div key={sev} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <SeverityBadge severity={sev} count={summary[sev]} />
            </div>
          ) : null,
        )}
      </div>

      {/* Findings list — horizontal-scroll-safe */}
      <div className="overflow-scroll-x" style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "40rem" }}>
          <thead>
            <tr style={{ textAlign: "start", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
              <th style={{ padding: "var(--space-3)", textAlign: "start" }}>Severity</th>
              <th style={{ padding: "var(--space-3)", textAlign: "start" }}>Asset</th>
              <th style={{ padding: "var(--space-3)", textAlign: "start" }}>CVSS</th>
              <th style={{ padding: "var(--space-3)", textAlign: "start" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                <td style={{ padding: "var(--space-3)" }}>
                  <SeverityBadge severity={f.severity} />
                </td>
                <td style={{ padding: "var(--space-3)", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                  {f.affectedAsset ?? "—"}
                </td>
                <td style={{ padding: "var(--space-3)", fontVariantNumeric: "tabular-nums" }}>
                  {f.cvssScore !== null ? (f.cvssScore / 10).toFixed(1) : "—"}
                </td>
                <td style={{ padding: "var(--space-3)", color: "var(--text-secondary)" }}>{f.status.replace(/_/g, " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
