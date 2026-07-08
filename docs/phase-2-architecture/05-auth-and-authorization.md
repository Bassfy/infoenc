# 05 — Auth & Authorization

Owner modules: `identity`, `authz`, `orgs`. Decision to build in-house on audited standard libraries: ADR-006. Requirements: FR-AC-001–013, NFR-001–005.

## 1. Identity model

- **One user, many credentials:** password (optional once another factor exists), OAuth identities (Google, GitHub), passkeys (many per user), TOTP. Email is the anchor identifier; verified before community/lab access (FR-AC-010).
- **Users join orgs via memberships** (doc 06). Staff are users with staff-role memberships in the INFOENC internal org — same identity system, stricter policies (NFR-003 staff rules).

## 2. Credential mechanics

| Credential | Implementation |
|---|---|
| Password | Argon2id (memory 64MB, iterations tuned to ~100ms); NIST 800-63B policy: ≥12 chars, no composition rules, k-anonymity breach check (HIBP range API) on set/change; no forced rotation |
| OAuth | Authorization-code + PKCE; `openid-client` certified library; account linking requires a signed-in session or verified-email match with explicit confirmation (no silent merges — account-takeover vector) |
| Passkeys | WebAuthn via `@simplewebauthn/server`; resident keys encouraged, cross-device (hybrid) supported; usable as first factor (passwordless) or second factor |
| TOTP | `otplib`, 30s window ±1 step; QR provisioning; 10 single-use recovery codes (Argon2-hashed, shown once) |
| MFA policy | Optional for learners, **enforced for staff and org-admins** (NFR-004); step-up required for sensitive ops (§5) |

## 3. Session & token model

- **Access token:** JWT, **10 min TTL**, ES256, signed with KMS-held keys (rotated quarterly, `kid` header, JWKS endpoint for internal verifiers). Claims: `sub`, `sid`, `org` (active org context), `roles` (within that org), `amr` (auth methods — MFA/passkey presence for step-up checks), `locale`. Held **in memory** client-side, never in storage.
- **Refresh token:** opaque 256-bit, httpOnly Secure SameSite=Lax cookie scoped to the auth domain; hashed at rest. **Rotation on every use with family tracking:** replay of a consumed token revokes the whole family and alerts the user (NFR-002 reuse detection). Absolute lifetime 30 days; idle timeout 7 days; staff: 12h absolute, 1h idle.
- **Revocation ≤60s (NFR-002):** access tokens are short-lived *and* checked against a Redis `sid` denylist populated on logout/revoke/family-kill — belt and braces without a DB hit per request (denylist is a bloom-filter-fronted Redis set).
- **Session registry:** users see active sessions (device, geo, last-seen) and revoke individually — powers the security settings page and anomaly notifications.
- Cross-app SSO: auth lives at `auth.infoenc.com` (served by core-api); web/academy/admin all redirect there; one session, three apps.

## 4. Auth flows worth specifying now

- **Registration:** email+password or OAuth → verification email (signed, 24h token) → onboarding (FR-AC-012). Unverified accounts can browse, not post/lab.
- **Login anomaly handling:** new device/geo → notification email; impossible-travel or breach-corpus password → step-up challenge before session issue. Failed-attempt limiter per account **and** per IP (independent counters, NFR-013).
- **Recovery:** email reset link (single-use, 30 min, invalidates on password change) → if MFA enrolled, still requires second factor or recovery code — **email compromise alone must not defeat MFA**. Support-assisted recovery requires identity verification runbook + dual staff approval, fully audited.
- **Org SSO (Enterprise, FR-AC-113):** SAML/OIDC per org with domain-verified enforcement ("all @bank.com must SSO"); JIT provisioning mapped to org roles; SCIM fast-follow. Architecture lands now (org auth-policy table, IdP config), implementation post-v1 per cutline.

## 5. Authorization: RBAC + ABAC through one gate

Single decision point: `authz.can(actor, action, resource, context)` — used by GraphQL field guards, REST route guards, WS subscription filters, and queue consumers (consumers re-check; events are not pre-authorized).

**RBAC layer:** role bundles per scope.
- Platform roles: `learner`, `instructor`, `staff:*` (support, content-editor, finance, consultant, marketing, ops, super-admin — doc 07 P1 FR-AD-001).
- Org roles: `org:owner`, `org:admin`, `org:manager` (team-scoped), `org:member`; client-portal roles: `client:owner`, `client:contact` (engagement-scoped).

**ABAC layer:** policy conditions evaluated with the request context, e.g.:
- Finance data readable only when `amr` includes MFA **and** actor has `staff:finance` (FR-AD-001).
- Evidence download only for engagement contacts of that org, link unexpired, watermark identity = actor (FR-CO-033).
- Refund execution ≥ threshold requires second approver (`context.approvals`).
- Instructor can edit course only in `draft|rejected` states (editorial workflow FR-AC-103).

Policies are code (typed, unit-tested), not a DSL database — reviewable in PRs, testable in CI. The **authz matrix test suite** (packages/testing) enumerates role × action × resource-state and asserts allow/deny — run per deploy (doc 08 §7 Phase 1).

**Step-up:** sensitive actions (payout changes, evidence bulk export, API-key issuance, admin impersonation) require an `amr` fresh-MFA claim ≤5 min old; otherwise API returns `STEP_UP_REQUIRED` and the client runs the challenge flow.

## 6. Service-to-service & API auth

- core-api ↔ lab-orchestrator: mTLS (cluster-issued certs) + short-lived signed service tokens; the orchestrator's API surface is allowlisted per operation (defense against SSRF-pivot from core-api).
- Enterprise export API (FR-AC-112): org-scoped API keys — hashed at rest, prefix-identifiable (`ienc_live_…`), scoped read-only, rotatable, last-used tracked, secret-scanning-friendly format registered with GitHub.
- Webhooks out (future): HMAC-signed with per-endpoint secrets and replay windows.

## 7. Abuse & bot defense

Turnstile on registration/login/scoping forms; disposable-email domain list on free tier; velocity rules (accounts per IP/day) with CAPTCHA escalation rather than hard block (VPN-heavy user base — our audience legitimately uses VPNs); device fingerprinting deliberately **not** used at v1 (privacy posture, NFR-073) — revisit only with fraud evidence.

## 8. Auditability

Every credential lifecycle event (enrollment, removal, failed MFA, recovery use, session revoke, impersonation) is an audit event with actor, IP, and user-agent (FR-AD-002); user-visible security history on the account page — transparency as a trust feature for a security brand.
