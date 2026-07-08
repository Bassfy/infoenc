import { z } from "zod";

/**
 * Shared primitive schemas. Every contract builds on these so validation is uniform across
 * the platform (Phase 2 doc 02 §2.2). Keep this file dependency-free beyond zod.
 */

/** UUIDv7 — validated as a UUID; time-ordering is a storage property, not a format change. */
export const uuid = z.string().uuid();

export const locale = z.enum(["ar", "en"]);
export type Locale = z.infer<typeof locale>;

/** ISO 4217 currency code (uppercase, 3 letters). */
export const currency = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, "currency must be an ISO 4217 code");

/** ISO 3166-1 alpha-2 country code. */
export const country = z
  .string()
  .length(2)
  .regex(/^[A-Z]{2}$/, "country must be an ISO 3166-1 alpha-2 code");

/** Money is always integer minor units + currency — never a float (Phase 3 doc 01 §5). */
export const money = z.object({
  amount: z.number().int(),
  currency,
});
export type Money = z.infer<typeof money>;

/** Basis points 0..10000 for progress/percentages (avoids float drift). */
export const bps = z.number().int().min(0).max(10000);

/** Pagination request/response envelope for REST list endpoints. */
export const paginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuery>;

export const pageInfo = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

/** Canonical machine error codes surfaced in the error envelope (Phase 2 doc 03 §7). */
export const errorCode = z.enum([
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "STEP_UP_REQUIRED",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "LAB_QUOTA_EXCEEDED",
  "ENTITLEMENT_REQUIRED",
  "PAYMENT_FAILED",
  "TENANT_CONTEXT_MISSING",
  "INTERNAL",
]);
export type ErrorCode = z.infer<typeof errorCode>;

export const errorEnvelope = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    errorId: z.string(),
    retryAfter: z.number().int().optional(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;
