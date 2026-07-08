import { Injectable } from "@nestjs/common";
import type { Principal } from "@infoenc/contracts/auth";

/**
 * Single authorization decision point (Phase 2 doc 05 §5).
 *
 * RBAC (role → permission bundles) + ABAC (contextual conditions) evaluated through one `can()`.
 * GraphQL field guards, REST route guards, WS subscription filters, and queue consumers all call
 * this — consumers re-check because events are not pre-authorized. Policies are code (typed,
 * unit-tested via the authz-matrix suite), not database rows, so they are reviewable in PRs.
 */

/** Resource + context an ABAC condition may inspect. */
export interface AuthzResource {
  readonly orgId?: string;
  readonly ownerId?: string;
  readonly state?: string;
  readonly [key: string]: unknown;
}

export interface AuthzContext {
  /** Fresh-MFA presence within the step-up window, for sensitive actions. */
  readonly stepUpFresh?: boolean;
  /** Approvals gathered for dual-control actions (e.g., large refunds). */
  readonly approvals?: number;
}

type PolicyFn = (p: Principal, r: AuthzResource, c: AuthzContext) => boolean;

/** Reusable predicates. */
const hasRole = (key: string): PolicyFn => (p) => p.roles.includes(key);
const sameOrg: PolicyFn = (p, r) => r.orgId !== undefined && r.orgId === p.orgId;
const owns: PolicyFn = (p, r) => r.ownerId !== undefined && r.ownerId === p.userId;
const stepUp: PolicyFn = (_p, _r, c) => c.stepUpFresh === true;
const all = (...fns: PolicyFn[]): PolicyFn => (p, r, c) => fns.every((f) => f(p, r, c));
const any = (...fns: PolicyFn[]): PolicyFn => (p, r, c) => fns.some((f) => f(p, r, c));

/**
 * The policy table: action → predicate. Deny-by-default — an action with no entry is denied.
 * Representative slice; the full table lives here and is exhaustively tested (role × action ×
 * resource-state) by the authz-matrix suite run every deploy (Phase 2 doc 08 §5).
 */
const POLICIES: Partial<Record<string, PolicyFn>> = {
  // Learning
  "course.enroll": () => true, // any authenticated principal
  "lesson.complete": () => true,
  // Org management
  "org.manage_members": any(hasRole("org:owner"), hasRole("org:admin")),
  "org.assign_learning": any(hasRole("org:owner"), hasRole("org:admin"), hasRole("org:manager")),
  // Commerce — finance data needs staff:finance AND fresh MFA (FR-AD-001)
  "invoice.read": any(sameOrg, all(hasRole("staff:finance"), stepUp)),
  "refund.execute": all(hasRole("staff:finance"), stepUp, (_p, _r, c) => (c.approvals ?? 0) >= 2),
  // Engagements — crown jewel (doc 06 §4)
  "finding.publish": all(hasRole("staff:consultant"), sameOrg),
  "evidence.download": all(any(sameOrg, hasRole("staff:consultant")), stepUp),
  // Content editorial — instructor edits only in draft/rejected (FR-AC-103)
  "course.edit": all(
    any(owns, hasRole("staff:content-editor")),
    (_p, r) => r.state === "draft" || r.state === "rejected",
  ),
  // Admin
  "impersonation.start": all(hasRole("staff:super-admin"), stepUp),
};

@Injectable()
export class AuthzService {
  can(
    principal: Principal,
    action: string,
    resource: AuthzResource = {},
    context: AuthzContext = {},
  ): boolean {
    const policy = POLICIES[action];
    if (!policy) return false; // deny-by-default
    return policy(principal, resource, context);
  }

  /** Throwing variant for guards; callers translate to FORBIDDEN / STEP_UP_REQUIRED. */
  assert(
    principal: Principal,
    action: string,
    resource: AuthzResource = {},
    context: AuthzContext = {},
  ): void {
    if (!this.can(principal, action, resource, context)) {
      throw new AuthzDenied(action);
    }
  }
}

export class AuthzDenied extends Error {
  constructor(readonly action: string) {
    super(`FORBIDDEN: ${action}`);
    this.name = "AuthzDenied";
  }
}
