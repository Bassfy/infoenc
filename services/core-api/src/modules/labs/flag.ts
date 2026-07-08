import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Dynamic per-session flag derivation (Phase 2 doc 07 §6, FR-AC-050). A lab's flag for a given
 * user session is derived from a per-session secret, so a flag captured by one user is worthless to
 * anyone else — this kills flag-sharing and the writeup-copy problem that plagues static-flag CTFs.
 *
 * Pure + deterministic so it is unit-testable and identical on both the orchestrator (which injects
 * the flag into the environment) and core-api (which validates submissions). The session secret is
 * envelope-encrypted at rest (LabSession.flagSeedCipher) and never leaves the server.
 */

/** Derives the canonical flag for a (session secret, target) pair. */
export function deriveFlag(sessionSecret: string, target: string, format = "FLAG"): string {
  const digest = createHmac("sha256", sessionSecret).update(target).digest("hex").slice(0, 24);
  return `${format}{${digest}}`;
}

/** Normalizes a submitted flag before comparison (trim, collapse case-insensitive wrappers). */
export function normalizeFlag(input: string): string {
  return input.trim();
}

/** Constant-time equality — never leak match progress via timing on a security check. */
export function flagsEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Validates a submission against the expected dynamic flag for a session target. */
export function validateSubmission(params: {
  submitted: string;
  sessionSecret: string;
  target: string; // e.g. `${labId}:${taskId}` or `${labId}:root`
  format?: string;
}): boolean {
  const expected = deriveFlag(params.sessionSecret, params.target, params.format ?? "FLAG");
  return flagsEqual(normalizeFlag(params.submitted), expected);
}
