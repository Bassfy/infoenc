import { setRequestLocale } from "next-intl/server";

/**
 * Scoping form (FR-CO-020, Phase 4 wireframe §6). Each service family has a structured form — not a
 * generic contact box — so a qualified lead reaches a consultant with the detail needed to scope.
 * Submits to POST /api/v1/scoping (Turnstile-verified) → LeadService scores + routes. Progressive
 * enhancement: the form posts without JS; the client component adds inline validation + Turnstile.
 *
 * The field set below is the web-pentest form; other services swap the `fields` config (data, not
 * code — FR-CO-020 AC). Rendered here as a server component with the token-styled layout.
 */
const SERVICE_FORMS: Record<string, { title: string; fields: { name: string; label: string; type: string }[] }> = {
  "web-pentest": {
    title: "Scope a web application assessment",
    fields: [
      { name: "appCount", label: "How many applications?", type: "number" },
      { name: "authRoles", label: "Distinct user roles to test", type: "number" },
      { name: "environment", label: "Environment (staging/prod)", type: "text" },
      { name: "complianceDriver", label: "Compliance driver (PCI, ISO, SAMA…)", type: "text" },
      { name: "window", label: "Preferred testing window", type: "text" },
    ],
  },
  "red-team": {
    title: "Scope a red team engagement",
    fields: [
      { name: "objectives", label: "Primary objectives (crown jewels)", type: "text" },
      { name: "employees", label: "Approx. employee count", type: "number" },
      { name: "duration", label: "Desired duration (weeks)", type: "number" },
      { name: "constraints", label: "Rules of engagement / constraints", type: "text" },
    ],
  },
};

export default function ScopingPage({ params }: { params: { locale: string; service: string } }) {
  setRequestLocale(params.locale);
  const form = SERVICE_FORMS[params.service] ?? SERVICE_FORMS["web-pentest"];

  return (
    <main className="prose-container" style={{ paddingBlock: "var(--space-9)" }}>
      <p style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "var(--text-xs)" }}>
        Scoping
      </p>
      <h1 style={{ fontSize: "var(--text-3xl)", marginBlock: "var(--space-3) var(--space-2)" }}>{form!.title}</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        A few structured questions so we can scope accurately and reach back within 48 hours. Under 5 minutes.
      </p>

      <form action="/api/v1/scoping" method="post" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
        <Field label="Work email" name="contactEmail" type="email" required />
        <Field label="Your name" name="contactName" type="text" />
        <Field label="Company" name="companyName" type="text" />
        {form!.fields.map((f) => (
          <Field key={f.name} label={f.label} name={`scoping.${f.name}`} type={f.type} />
        ))}
        <button
          type="submit"
          style={{ alignSelf: "start", background: "var(--color-accent)", color: "var(--text-on-accent)", padding: "var(--space-3) var(--space-5)", borderRadius: "var(--radius-md)", fontWeight: 500, border: "none", cursor: "pointer" }}
        >
          Request scoping call
        </button>
      </form>
    </main>
  );
}

function Field({ label, name, type, required }: { label: string; name: string; type: string; required?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", color: "var(--text-primary)", font: "inherit" }}
      />
    </label>
  );
}
