# 01 — Automation Architecture

How INFOENC automates a department's work safely, and how each new FR-AU workflow is added without
re-litigating the safety rules.

## 1. Three components, one pattern

```
  Trigger (event / schedule / manual)
        │
        ▼
  Context builder ──loads ONLY its scope (RLS-bounded)──▶ bounded context string
        │                                                        │
        ▼                                                        ▼
  WorkflowEngine.execute ──records AutomationRun (trace)──▶ LlmGateway.complete
        │                                                        │ (claude-opus-4-8)
        │◀───────────────── result + tokens ─────────────────────┘
        ▼
  Gate policy:  auto (only if autonomyEnabled)  │  human_approve → GateService queue
        │                                              │
        ▼                                              ▼
  output ships                              human approve / edit / reject → ships or not
```

Every workflow is: **a context builder + `engine.execute({... gatePolicy, step})`**. The engine
owns tracing and the gate; the gateway owns the model call; the builder owns the data boundary.
Nothing else needs to know the safety rules — they're structural.

## 2. The LLM gateway (`llm-gateway.service.ts`)

- **One client, one model policy.** `claude-opus-4-8` with adaptive thinking; effort per call. All
  automation LLM traffic flows through here, so model choice and token accounting are centralized.
- **Streaming by default** (`.stream()` + `.finalMessage()`) so long report generations don't hit
  HTTP timeouts — the `claude-api` skill's guidance for large `max_tokens`.
- **No database handle.** The gateway receives an already-bounded context *string* and cannot fetch
  anything. It is impossible for a model call to widen the caller's data scope, because the call
  site never has the means to.
- **Refusal-aware.** A `stop_reason: "refusal"` throws `LLM_REFUSED`, which the engine records as a
  failed run — the fallback-to-a-queue rule.

## 3. The workflow engine (`workflow-engine.service.ts`)

- **Traceability is the row.** `AutomationRun` captures trigger, inputs, model, version, tokens,
  `scopeRef` (the data boundary), and output — the doc-07 "each automated action logs its trigger,
  inputs, model/version, and outcome" requirement, made non-optional.
- **The gate is the default.** `human_approve` → the run is `gated` and a `GateService` queue entry
  is created; **the output does not ship**. `auto` runs only when the workflow has *also* earned it
  (`autonomyEnabled`), so a workflow can't accidentally be born autonomous.
- **Failure is loud.** Any step error → `failed` run with the message, surfaced to ops. Never a
  silent drop.

## 4. The data-boundary pattern (the crown-jewel rule)

The single most important architectural decision: **context builders take an identifier, not a
query interface.** The pentest-report builder's signature is `buildBoundedContext(engagementId)`,
and inside it every read is `prisma.tenant.finding.findMany({ where: { engagementId } })` — bounded
by the filter *and* the org RLS policy. There is no code path by which the report workflow can read
another engagement's data, because it was never handed the ability to express such a query.

`scopeRef` on the run records the boundary, so an auditor can confirm after the fact exactly what a
given run was permitted to see. This is how "the LLM context builder for engagement workflows
accepts an engagement ID and loads only that engagement's rows" (Phase 2 doc 03 §5) becomes a
verifiable property rather than a promise.

## 5. The human gate + earning autonomy

- Gated runs land in `GateService.queue()`; a staff reviewer approves, edits, or rejects.
- An **edit records edit-distance bps** — how much a human had to change the draft. This is the
  measured signal behind autonomy: when a workflow's rolling edit distance stays low (FR-AU-050 AC
  targets <20% after month 3), it becomes a candidate for `autonomyEnabled = true`. Autonomy is
  *earned from data*, not switched on by opinion.
- Every decision is attributed and auditable — the NFR-075 "automated decisions affecting users are
  appealable to a human" requirement, where the gate review *is* the appeal.

## 6. Adding the next FR-AU workflow

1. Write a **context builder** that loads only the workflow's scope (via `prisma.tenant` for
   tenant data; bounded by IDs). Record what it can see in `scopeRef`.
2. Write a thin workflow that calls `engine.execute({ workflowKey, triggerRef, scopeRef, inputs,
   gatePolicy, step })` with a `step.run` that builds the context and calls the gateway.
3. Choose the **gate policy**: `human_approve` for anything customer-facing (the default);
   `auto` only for internal, low-risk outputs — and even then it stays gated until `autonomyEnabled`.
4. Register the `AutomationWorkflow` row (key = the FR-AU id) and wire the trigger (an outbox-event
   consumer, a schedule, or an admin action).

The engine's tests already guarantee the gate and traceability behavior, so a new workflow inherits
the safety rules for free — it only has to get its own data boundary right, which the builder
signature makes hard to get wrong.

## 7. Catalog priority (M-first, per Phase 1)

FR-AU-050 (pentest report — landed showcase) and FR-AU-011 (proposal draft, from `crm.lead.created`)
are the highest-leverage services automations; FR-AU-021 (ticket classification, suggest-only until
the 90% accuracy gate), FR-AU-020 (lifecycle messaging), FR-AU-031 (quiz generation), and
FR-AU-032 (certificate issuance — an `auto`, non-LLM workflow) follow. Each is the same engine +
gate + boundary pattern; the differences are the context builder and the gate policy.
