# Phase 8 — Automation Layer

**Status:** In progress (engine + gateway + first showcase workflow landed; FR-AU catalog iterative)
**Baseline:** Phases 1–7. Reuses the outbox events, CryptoService, RLS, and authz gate.
**Approval gate:** Sign-off on the automation architecture (data boundaries + human gate) before the catalog buildout.

---

## Objectives

Make INFOENC "an AI-powered company" (the founding mandate) — the FR-AU catalog that lets a small
team operate like a large one. The architecture must satisfy the doc-07 ground rules **before** any
workflow ships: human gates on customer-facing output, full traceability, per-workflow data
boundaries, and fallback-to-a-queue-never-silence.

## What landed (real code)

| Piece | Status | What's real |
|-------|--------|-------------|
| **LLM gateway** | ✅ | The one internal Claude client (`@anthropic-ai/sdk`, `claude-opus-4-8`, adaptive thinking, per-call effort). Streams so long report generations don't time out; returns token usage for the trace; handles the `refusal` stop reason. Has **no database access** — it can't widen a caller's scope. |
| **Workflow engine** | ✅ | Every run records an `AutomationRun` (trigger, inputs, model+version, tokens, **scopeRef data-boundary**, output) and applies the **gate policy**: customer-facing output is `human_approve` and lands in a review queue as `gated` — the output does **not** ship until a human approves. Autonomy runs only when *both* configured auto *and* accuracy-earned (`autonomyEnabled`). Failures record `failed`, never silence. Unit-tested. |
| **Human-gate review** | ✅ | The approval queue + approve/edit/reject; an edit records **edit-distance bps** (how much a human changed) — the signal that decides when a workflow earns autonomy (FR-AU-050/021 AC). Non-staff denied. |
| **FR-AU-050 pentest report** | ✅ showcase | Drafts a client report from findings — with the **crown-jewel data boundary** and the **no-fabrication** rule (see below). |
| FR-AU-011 proposal · FR-AU-021 tickets · FR-AU-010 lead enrichment · FR-AU-020 lifecycle · rest | 🔩 same pattern | Each is a context-builder + `engine.execute(...)` with its gate policy; they build out on this engine. |

## The FR-AU-050 showcase — why it's the one to review

The pentest-report generator reads the most sensitive data in the platform, so it's the proof that
the automation architecture is safe. Three rules, all in code:

1. **Data boundary (the crown-jewel rule).** The context builder takes **one `engagementId`** and
   loads only that engagement's findings through the **RLS-scoped** client. It is *structurally*
   incapable of reading another engagement — the query is bounded by both the `engagementId` filter
   and the org RLS policy. The run's `scopeRef` records exactly what it was permitted to see. This is
   the Phase-1 rule ("an engagement-report run can only load its own engagement's data") realized:
   the builder takes an ID, **not** a query interface.
2. **No fabrication.** The system prompt forbids inventing findings; the *only* source material is
   the real, decrypted findings; missing sections are flagged, not filled. This directly answers the
   FR-AU-050 acceptance criterion ("zero fabricated findings; every statement traces to a findings
   entry").
3. **Human gate.** `gatePolicy: human_approve` — the draft is a `gated` run; it reaches the client
   only through the Phase-7 approval-gated delivery path, after a lead consultant approves.

## How this satisfies the doc-07 ground rules

| Ground rule | Where |
|---|---|
| Human gate on customer-facing output | `WorkflowEngine` default `human_approve` + `GateService` queue; verified by unit tests |
| Full traceability | `AutomationRun` records trigger/inputs/model/version/tokens/scopeRef/output |
| Data boundaries (no cross-tenant leakage) | Per-workflow context builders load only their scope via RLS; `scopeRef` audited |
| Fallback to a queue, never silence | Failures → `failed` run surfaced to ops; refusals handled explicitly |
| Autonomy earned, not assumed | `auto` requires `autonomyEnabled`; edit-distance feeds the decision |
| Automated decisions appealable to a human (NFR-075) | The gate review *is* the human; every decision audited |

## Verified this phase

- **LLM gateway** uses the current Anthropic SDK correctly (grounded in the `claude-api` skill:
  `claude-opus-4-8`, adaptive thinking, `output_config.effort`, streaming + `finalMessage`, refusal
  handling).
- **Workflow-engine gate logic** unit-tested (gated-by-default, autonomy-only-when-earned, scopeRef
  recorded, failure recorded).
- Prisma schema validates.

## Deliverables doc

| Doc | Covers |
|-----|--------|
| [Automation Architecture](01-automation-architecture.md) | The engine, gateway, data-boundary pattern, and how the FR-AU catalog is added safely |

## Approval checklist

- [ ] The gateway/engine/gate architecture and the doc-07 ground-rule mapping
- [ ] The data-boundary pattern (context builder takes an ID, not a query interface)
- [ ] The no-fabrication + human-gate model for the report generator
- [ ] The autonomy-earned model (edit-distance → autonomy)
