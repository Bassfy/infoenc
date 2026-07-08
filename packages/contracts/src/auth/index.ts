import { z } from "zod";
import { uuid, locale } from "../primitives.js";

/**
 * Auth contracts (Phase 2 doc 05). The access-token claim set is the security-critical shape:
 * the API, the RLS tenant-context extension, and the authz layer all read from it.
 */

export const orgRole = z.enum(["owner", "admin", "manager", "member"]);
export type OrgRole = z.infer<typeof orgRole>;

/** Auth methods present in the session — used for step-up decisions (doc 05 §5). */
export const authMethod = z.enum(["pwd", "mfa", "passkey", "oauth"]);
export type AuthMethod = z.infer<typeof authMethod>;

/**
 * JWT access-token claims. `org` is the ACTIVE org context for the request; RLS reads it to
 * scope every query (Phase 2 doc 06 §3). `roles` are the actor's roles WITHIN that org.
 */
export const accessTokenClaims = z.object({
  sub: uuid, // user id
  sid: uuid, // session id (for the revocation denylist)
  org: uuid, // active org context — the tenant boundary
  roles: z.array(z.string()), // org + platform role keys
  amr: z.array(authMethod), // auth methods present
  locale,
  iat: z.number().int(),
  exp: z.number().int(),
});
export type AccessTokenClaims = z.infer<typeof accessTokenClaims>;

/** The resolved request principal the API attaches after verifying the token. */
export const principal = z.object({
  userId: uuid,
  sessionId: uuid,
  orgId: uuid,
  roles: z.array(z.string()),
  amr: z.array(authMethod),
  locale,
  isStaff: z.boolean(),
});
export type Principal = z.infer<typeof principal>;

export const registerInput = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(200).optional(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/, "lowercase letters, numbers, underscore only"),
  locale: locale.default("en"),
});
export type RegisterInput = z.infer<typeof registerInput>;

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInput>;

/** Action string for the authz `can()` gate — "resource.action" (doc 05 §5). */
export const authzAction = z
  .string()
  .regex(/^[a-z_]+\.[a-z_]+$/, 'action must be "resource.action"');
export type AuthzAction = z.infer<typeof authzAction>;
