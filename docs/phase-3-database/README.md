# Phase 3 — Database Design

**Status:** Awaiting stakeholder approval
**Baseline:** Phase 2 architecture (approved). PostgreSQL 16 + Prisma, RLS tenancy (ADR-004/010).
**Approval gate:** Sign-off before Phase 4 (Design System) begins.

---

## Objectives

1. Turn the module map (Phase 2 doc 03) and tenancy model (doc 06) into a concrete, normalized, RLS-ready schema.
2. Deliver **real Prisma schema** — not pseudo-models — that later phases build against directly.
3. Fix the conventions every table obeys (identifiers, tenancy columns, bilingual content, timestamps, soft-delete, indexing) so the schema stays coherent as it grows.
4. Map the MVP's 19 MySQL tables to their successors (Phase 1 doc 09 §5) — nothing lost, each retirement justified.
5. Define migration safety (expand/contract, ADR-010) and the bilingual synthetic seed strategy.
6. Classify every data class and set retention/deletion rules (NFR-025, NFR-070).

## Deliverables

| # | Document | Covers |
|---|----------|--------|
| 01 | [Data Model Overview & Conventions](01-data-model-and-conventions.md) | Global rules: IDs, tenancy, i18n, timestamps, money, indexing, RLS |
| 02 | [Entity-Relationship Diagrams](02-erd.md) | Per-domain ERDs (Mermaid) |
| 03 | [MVP Schema Mapping](03-mvp-schema-mapping.md) | All 19 legacy tables → successors or retirement |
| 04 | [Migration & Seed Strategy](04-migration-and-seed-strategy.md) | Expand/contract, RLS bootstrap, bilingual seed |
| 05 | [Data Classification & Retention](05-data-classification-and-retention.md) | Data classes, encryption, retention, DSR |
| — | [`/prisma/schema/`](../../prisma/schema/) | The actual schema, split by domain |

## The Prisma schema

Split by domain using Prisma's multi-file schema (`prismaSchemaFolder`):

```
prisma/schema/
├── schema.prisma          # datasource, generator, preview features
├── enums.prisma           # shared enums
├── identity.prisma        # users, credentials, sessions, OAuth, WebAuthn, TOTP
├── orgs.prisma            # organizations, memberships, seats, invitations, SSO
├── authz.prisma           # roles, permissions, assignments, audit-adjacent
├── catalog.prisma         # paths, courses, modules, lessons, quizzes, exams (bilingual)
├── learning.prisma        # enrollments, progress, attempts, assignments, cohorts
├── gamification.prisma     # XP event log, ranks, badges, streaks, leaderboards
├── labs.prisma            # lab defs, tasks, sessions, submissions, CTF events
├── commerce.prisma        # plans, subscriptions, entitlements, invoices, coupons, referrals
├── engagements.prisma     # services engagements, findings, evidence, reports (crown jewel)
├── crm.prisma             # leads, pipeline, accounts, activities
├── support.prisma         # tickets, KB, CSAT
├── community.prisma        # discussions, forums, votes, moderation
├── cms.prisma             # marketing pages, blog, media
├── automation.prisma       # workflow definitions, runs, gate queue
└── platform.prisma        # outbox, notifications, audit log, feature flags, files
```

## Design tenets carried from Phase 2

- **Every tenant-scoped table carries `orgId`** with a leading composite index, so RLS predicates stay on an index (NFR-031, doc 06 §5).
- **Bilingual content uses a translation-row pattern**, not `title_ar`/`title_en` column pairs — arbitrary future locales without schema churn (doc 01 §4).
- **Money paths are append-first**: XP, invoices, and payments favor immutable event/ledger rows over mutable counters (integrity over convenience — FR-AC-060, FR-AD-042).
- **UUIDv7 primary keys** — globally unique, time-sortable, safe to expose, merge-friendly across regions (ADR-004 residency path).

## Approval checklist

- [ ] Conventions in doc 01 (UUIDv7, orgId+RLS, translation-row i18n, soft-delete policy)
- [ ] Bilingual content model (translation rows vs. column pairs)
- [ ] XP-as-event-log and invoice-as-ledger integrity choices
- [ ] MVP mapping in doc 03 (what carries, what retires)
- [ ] Retention/DSR matrix in doc 05
