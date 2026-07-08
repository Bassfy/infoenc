import { z } from "zod";
import { uuid } from "../primitives.js";

/**
 * Domain event taxonomy (Phase 2 doc 03 §3). Every state change others care about is one of
 * these, written to the transactional outbox and fanned out via BullMQ. Payloads are versioned
 * by shape; consumers declare idempotency keys. `orgId` travels with every event so consumers
 * re-establish RLS tenant context before touching data (doc 06 §3).
 */

export const eventName = z.enum([
  "identity.user.registered",
  "identity.user.email_verified",
  "identity.session.revoked",
  "orgs.membership.created",
  "learning.lesson.completed",
  "learning.course.completed",
  "labs.session.started",
  "labs.session.expired",
  "labs.task.completed",
  "labs.lab.solved",
  "ctf.challenge.solved",
  "gamification.xp.awarded",
  "gamification.badge.earned",
  "commerce.subscription.created",
  "commerce.subscription.renewed",
  "commerce.subscription.past_due",
  "commerce.subscription.canceled",
  "commerce.invoice.issued",
  "engagements.finding.published",
  "engagements.report.delivered",
  "crm.lead.created",
  "support.ticket.created",
  "automation.run.completed",
  "automation.run.gated",
]);
export type EventName = z.infer<typeof eventName>;

/** Envelope every outbox/queue message shares. */
export const eventEnvelope = z.object({
  id: uuid, // outbox event id (also the consumer idempotency key)
  name: eventName,
  aggregateId: uuid,
  orgId: uuid.nullable(), // tenant context for the consumer (doc 06 §3)
  occurredAt: z.string().datetime(),
  version: z.number().int().default(1),
  payload: z.record(z.string(), z.unknown()),
});
export type EventEnvelope = z.infer<typeof eventEnvelope>;

// ── Representative typed payloads (consumers narrow by `name`) ─────────────────
export const xpAwardedPayload = z.object({
  userId: uuid,
  amount: z.number().int(),
  ruleKey: z.string(),
  sourceType: z.string(),
  sourceId: uuid,
});
export type XpAwardedPayload = z.infer<typeof xpAwardedPayload>;

export const labSolvedPayload = z.object({
  userId: uuid,
  labId: uuid,
  points: z.number().int(),
  firstBlood: z.boolean(),
});
export type LabSolvedPayload = z.infer<typeof labSolvedPayload>;

export const findingPublishedPayload = z.object({
  engagementId: uuid,
  findingId: uuid,
  severity: z.enum(["info", "low", "medium", "high", "critical"]),
});
export type FindingPublishedPayload = z.infer<typeof findingPublishedPayload>;
