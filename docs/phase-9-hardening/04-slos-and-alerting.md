# 04 — SLOs & Alerting

The numbers on-call is paged against, and how. SLOs make "is it healthy?" objective; error budgets
make "should we ship or stabilize?" objective (NFR-040/080/085).

## 1. Service SLOs

| Service | SLI | SLO (30-day) |
|---|---|---|
| Core API (reads) | p95 latency | ≤ 300ms (NFR-031) |
| Core API (writes) | p95 latency | ≤ 600ms |
| Core API | availability (non-5xx / total) | 99.9% |
| Web/academy pages | Core Web Vitals "good" at p75 | LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (NFR-030) |
| Lab provisioning | browser lab interactive p95 | ≤ 25s (NFR-032) |
| Lab subsystem | availability | 99.5% (separate, lower — NFR-040) |
| Checkout | success rate (excl. user cancels) | ≥ 99.5% |
| Findings feed (portal) | publish→visible latency | ≤ 30s (FR-CO-032) |

## 2. Error budgets

- Platform 99.9% = **~43 min/month** of allowed downtime. Burn it and feature work pauses for
  stabilization — the budget is the objective arbiter, not a debate.
- Tracked per service; the executive dashboard (FR-AD-010) shows budget remaining.

## 3. Burn-rate alerts (multi-window)

Page on **fast burn**, ticket on **slow burn** — the standard multi-window multi-burn-rate approach,
so a sharp outage pages immediately while a slow leak doesn't flap:

| Alert | Condition | Action |
|---|---|---|
| Fast burn | 2% budget in 1h (14.4× rate) | **Page** on-call |
| Slow burn | 5% budget in 6h | Ticket + Slack |
| Latency SLO breach | p95 over target 10m sustained | Page (reads) / ticket (writes) |
| Lab cold-start SLO | p95 > 25s 10m | Ticket (capacity) |

## 4. Security & cost alerts (beyond SLOs)

| Alert | Source | Action |
|---|---|---|
| Auth anomaly spike | SecurityEvent stream (NFR-023) | Page security on-call |
| Refresh-reuse detected | `auth.refresh_reuse` events | Page — possible token theft |
| Bulk evidence export | `export.bulk` security event | Page — possible exfiltration |
| Cross-tenant test failure | CI isolation suite | Block deploy + page |
| Lab cost per learner > $1.20/mo | cost telemetry (NFR-042) | Ticket — margin risk (R1) |
| Cryptomining signature | node CPU pattern (FR-AC-046) | Auto-kill session + page |
| Automation gate queue backlog | gated runs unreviewed > SLA | Ticket ops (human gate staffed) |

## 5. Stack (Phase 2 doc 08 §6)

OpenTelemetry → Prometheus (metrics), Tempo (traces), Loki (logs), Grafana (dashboards + SLOs),
Sentry (errors, release-tagged). Synthetic probes from multiple regions, both locales, drive the
public status page — the status page reflects real checks, not a manual toggle. Every 5xx carries a
support-referenceable error ID correlated to its trace (NFR-080).

## 6. Dashboards

- **Executive** (FR-AD-010): MRR/ARR/churn, SLO budget remaining, services pipeline, cash.
- **Reliability**: golden signals per service, burn-rate, deploy markers.
- **Cost/abuse**: lab cost per learner, session concurrency, abuse-kill rate — R1 lives here.
- **Security/SOC**: auth anomalies, admin actions, export events, isolation-test status.

Alert rules and dashboards are code (Terraform/Grafana-as-code, NFR-081) — reviewed in PRs, not
clicked into a console.
