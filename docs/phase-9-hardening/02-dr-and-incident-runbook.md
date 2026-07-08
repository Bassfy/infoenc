# 02 — DR & Incident Runbook

The playbook for when things break. A runbook nobody has rehearsed is fiction — the DR exercise
(§4) is a launch-gate item (NFR-084).

## 1. Backup & restore (NFR-024)

| Data | Mechanism | RPO |
|---|---|---|
| PostgreSQL | RDS automated backups + PITR (5-min granularity) | ≤ 1h (transactional), effectively ≤5min |
| S3 objects (incl. evidence) | Versioning + cross-region replication to eu-central-1 | ≤ replication lag |
| Meilisearch | Not backed up — rebuildable from Postgres (ADR-011) | n/a (rebuild) |
| Redis | Not backed up — cache/queue; outbox in Postgres is the durable record (ADR-007) | n/a |

**Restore procedure (Postgres):**
1. Identify the target timestamp (before the incident).
2. `aws rds restore-db-instance-to-point-in-time` → new instance.
3. Point PgBouncer at the restored instance; run `prisma migrate status` to confirm schema.
4. Rebuild Meilisearch indexes from Postgres; warm Redis caches.
5. Verify with the isolation + smoke test suites before reopening traffic.

**Restore is tested quarterly** (NFR-024) — a backup that hasn't been restored is a hope, not a
backup. The test restores to a scratch environment and runs the smoke suite against it.

## 2. Region failure (RTO ≤ 4h)

Primary is AWS me-south-1; DR is eu-central-1 (ADR-013). On a region-level outage:

1. **Declare** — incident commander (IC) declares a Sev-1 region incident.
2. **Promote** the eu-central-1 RDS replica to primary (`aws rds promote-read-replica`).
3. **Stand up** the app + lab clusters in eu-central-1 from Terraform (`infra/terraform/envs/production`
   with the DR region variable) — IaC means this is a module apply, not manual clicks (NFR-081).
4. **Repoint** Cloudflare DNS/load-balancing to the DR origins (low-TTL records make this fast).
5. **Verify** — healthz/readyz green, smoke suite, isolation suite (crown-jewel data intact).
6. **Communicate** — status page + bilingual customer comms (§5).

Because the lab cluster is separate and stateless-ish (sessions are ephemeral), lab availability can
lag app recovery without blocking the learning content (NFR-041) — restore the app plane first.

## 3. Graceful degradation (NFR-041)

The platform is built to lose subsystems without going down:

| Failure | Behavior |
|---|---|
| Lab cluster down | Learning content, courses, quizzes stay up; lab UI shows a clear "labs unavailable" state |
| Payment provider outage | Checkout fails over Stripe↔PayPal where the flow allows; existing entitlements unaffected |
| Meilisearch down | Search falls back to Postgres queries (degraded relevance, not an outage) |
| Redis down | Cache misses fall through to Postgres; rate-limiting fails closed on auth, open on reads |
| One AZ down | Multi-AZ RDS + multi-AZ node pools absorb it automatically |

## 4. The pre-GA DR exercise (launch gate)

Before GA and semi-annually thereafter (NFR-084):
1. In staging, simulate a primary-region failure.
2. Execute §2 end to end, timing each step against RTO ≤4h.
3. Verify the restored data (isolation suite proves no cross-tenant bleed after restore).
4. Write up gaps; fix before GA.

## 5. Incident severity matrix & comms

| Sev | Definition | Response | Comms |
|---|---|---|---|
| **Sev-1** | Outage, data exposure, or crown-jewel integrity risk | Page IC + on-call immediately; all-hands | Status page within 15 min; bilingual updates every 30 min |
| **Sev-2** | Major feature down, degraded for many users | Page on-call | Status page; update hourly |
| **Sev-3** | Minor/partial, workaround exists | Next business hour | Internal; status page if customer-visible |

**Every incident:**
- An incident channel is opened (FR-AU-062) and a timeline is kept.
- Post-incident: a blameless postmortem draft is generated from alert/chat/deploy history (FR-AU-054),
  reviewed by the IC.
- **A suspected data exposure is always Sev-1** and triggers the responsible-disclosure + breach-comms
  process — for a security brand this is existential (Phase 1 R3).

## 6. On-call (NFR-085)

Paging via the monitoring stack (doc 04). Rotation with a primary + secondary; escalation to the IC
for Sev-1/2. Runbook links attached to each alert so the responder isn't starting from zero at 3 a.m.
Bilingual status-update templates are pre-written so comms don't wait on translation.
