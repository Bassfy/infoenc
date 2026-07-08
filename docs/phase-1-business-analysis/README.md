# Phase 1 — Business Analysis & Requirements

**Status:** Awaiting stakeholder approval
**Owner:** INFOENC founding team
**Approval gate:** Sign-off on scope, pricing direction, and roadmap before Phase 2 (System Architecture) begins.

---

## Objectives

1. Define what INFOENC is as a business: two platforms (Services Company + Academy), one brand.
2. Establish the market position, competitive landscape, and differentiation strategy.
3. Produce a complete, prioritized requirements catalog with stable IDs that every later phase (architecture, database, design, implementation, QA) traces back to.
4. Assess the existing MVP honestly and decide what carries forward into the target stack.
5. Set the business model, pricing structure, and success metrics.
6. Lay out the delivery roadmap with explicit scope cutlines so the team ships an excellent v1 instead of a mediocre everything.

## Deliverables in this package

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Executive Summary](01-executive-summary.md) | The one-pager for stakeholders and investors |
| 02 | [Market & Competitive Analysis](02-market-and-competitive-analysis.md) | Landscape, competitor teardown, positioning, SWOT |
| 03 | [Business Model & Pricing](03-business-model-and-pricing.md) | Revenue streams, plan matrix, pricing proposal, unit economics |
| 04 | [Personas & Customer Journeys](04-personas-and-customer-journeys.md) | Who we serve and how they move through the product |
| 05 | [Requirements — Company Platform](05-requirements-company-platform.md) | Services site, lead pipeline, client portal (FR-CO-*) |
| 06 | [Requirements — Academy Platform](06-requirements-academy-platform.md) | Learning, labs, gamification, community (FR-AC-*) |
| 07 | [Requirements — Admin & Automation](07-requirements-admin-and-automation.md) | Back office, CRM/CMS, AI automation per department (FR-AD-*, FR-AU-*) |
| 08 | [Non-Functional Requirements](08-non-functional-requirements.md) | Security, performance, i18n/RTL, accessibility, compliance (NFR-*) |
| 09 | [Current-State Assessment](09-current-state-assessment.md) | Audit of the existing MVP and the migration decision |
| 10 | [Roadmap, Scope & Risk Register](10-roadmap-scope-and-risks.md) | Phase plan, cutlines, risks, KPIs |

## Requirement ID conventions

- `FR-CO-###` — functional, Company platform
- `FR-AC-###` — functional, Academy platform
- `FR-AD-###` — functional, Admin panel / back office
- `FR-AU-###` — functional, Automation & AI
- `NFR-###` — non-functional (cross-cutting)

Priorities use MoSCoW: **M** (must, v1), **S** (should, v1 if budget allows), **C** (could, fast-follow), **W** (won't, this release — explicitly deferred).

IDs are permanent. When a requirement is dropped, it is marked `W` with a rationale — never deleted — so decisions stay auditable.

## What Phase 1 does NOT contain

- Technology decisions beyond what the requirements force (that is Phase 2).
- Database schemas or ER diagrams (Phase 3).
- Visual design, brand system, component library (Phase 4).
- Code. The only code-adjacent artifact here is the current-state audit.

## Approval checklist

Before green-lighting Phase 2, stakeholders confirm:

- [ ] The two-platform structure (Company + Academy under one brand, separate surfaces) is correct.
- [ ] Pricing direction in doc 03 is acceptable as a working hypothesis (final prices can move; the *structure* — tiers, billing periods, seat model — is what architecture depends on).
- [ ] The v1 cutlines in doc 10 are accepted (notably: mobile apps, VM lab infrastructure, and the marketplace are fast-follows, not v1).
- [ ] The migration decision in doc 09 (rebuild on target stack, port content and lessons learned from the MVP) is approved.
- [ ] Open questions at the end of doc 10 are answered or explicitly deferred.
