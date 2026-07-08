import { describe, expect, it } from "vitest";
import { AuthzService } from "./authz.service.js";
import type { Principal } from "@infoenc/contracts/auth";

/**
 * A slice of the authz-matrix suite (Phase 2 doc 05 §5 / doc 08 §5). The full suite enumerates
 * role × action × resource-state; these cases lock the security-critical decisions.
 */
const svc = new AuthzService();

function principal(over: Partial<Principal> = {}): Principal {
  return {
    userId: "00000000-0000-7000-8000-000000000001",
    sessionId: "00000000-0000-7000-8000-000000000002",
    orgId: "00000000-0000-7000-8000-0000000000aa",
    roles: [],
    amr: ["pwd"],
    locale: "en",
    isStaff: false,
    ...over,
  };
}

describe("AuthzService.can", () => {
  it("denies unknown actions by default", () => {
    expect(svc.can(principal(), "totally.unknown")).toBe(false);
  });

  it("allows any authenticated principal to enroll", () => {
    expect(svc.can(principal(), "course.enroll")).toBe(true);
  });

  it("blocks refunds without finance role, step-up, and dual approval", () => {
    const finance = principal({ roles: ["staff:finance"] });
    expect(svc.can(finance, "refund.execute")).toBe(false); // no step-up
    expect(svc.can(finance, "refund.execute", {}, { stepUpFresh: true })).toBe(false); // 1 approval
    expect(svc.can(finance, "refund.execute", {}, { stepUpFresh: true, approvals: 2 })).toBe(true);
  });

  it("scopes invoice reads to the same org (or finance staff with step-up)", () => {
    const p = principal();
    expect(svc.can(p, "invoice.read", { orgId: p.orgId })).toBe(true);
    expect(svc.can(p, "invoice.read", { orgId: "different-org" })).toBe(false);
  });

  it("lets a consultant publish findings only within the resource's org", () => {
    const consultant = principal({ roles: ["staff:consultant"], isStaff: true });
    expect(svc.can(consultant, "finding.publish", { orgId: consultant.orgId })).toBe(true);
    expect(svc.can(consultant, "finding.publish", { orgId: "other" })).toBe(false);
  });

  it("permits course edits only in draft/rejected states", () => {
    const author = principal();
    const res = { ownerId: author.userId };
    expect(svc.can(author, "course.edit", { ...res, state: "draft" })).toBe(true);
    expect(svc.can(author, "course.edit", { ...res, state: "published" })).toBe(false);
  });

  it("requires step-up for impersonation even for super-admin", () => {
    const admin = principal({ roles: ["staff:super-admin"], isStaff: true });
    expect(svc.can(admin, "impersonation.start")).toBe(false);
    expect(svc.can(admin, "impersonation.start", {}, { stepUpFresh: true })).toBe(true);
  });
});
