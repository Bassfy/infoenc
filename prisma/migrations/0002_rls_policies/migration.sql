-- INFOENC RLS policies (Phase 3 doc 04 §3). Runs AFTER the Prisma-generated schema migration
-- (0001) that creates the tables. Attaches row-level-security policies to tenant-scoped tables.
--
-- Pattern per tenant table:
--   1. ENABLE + FORCE row level security (FORCE so even the table owner is subject to it).
--   2. A policy: rows are visible/writable iff org_id = app_current_org(), OR the actor is staff
--      (staff access is still row-logged via the audit middleware — visibility, not opacity).
-- Only a representative set is shown here; the full migration covers every table carrying org_id
-- (Phase 3 doc 01 §2). Non-tenant tables (public catalog, platform-internal) are deliberately
-- excluded and listed in the comment block at the end.

-- ── Reusable policy application via a helper (keeps the migration DRY + auditable) ──
CREATE OR REPLACE FUNCTION apply_org_rls(tbl regclass) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', tbl);
  EXECUTE format($f$
    CREATE POLICY org_isolation ON %s
      USING (org_id = app_current_org() OR app_is_staff())
      WITH CHECK (org_id = app_current_org() OR app_is_staff())
  $f$, tbl);
END;
$$;

-- Org-scoped tables (the crown-jewel and tenant data).
SELECT apply_org_rls('organizations');
SELECT apply_org_rls('org_memberships');
SELECT apply_org_rls('subscriptions');
SELECT apply_org_rls('entitlements');
SELECT apply_org_rls('invoices');
SELECT apply_org_rls('learning_assignments');
SELECT apply_org_rls('engagements');
SELECT apply_org_rls('findings');
SELECT apply_org_rls('finding_comments');
SELECT apply_org_rls('evidence');
SELECT apply_org_rls('engagement_reports');
SELECT apply_org_rls('portal_messages');
SELECT apply_org_rls('tickets');
SELECT apply_org_rls('api_keys');

-- Organizations itself keys on id, not org_id — override with an id-based policy.
DROP POLICY org_isolation ON organizations;
CREATE POLICY org_isolation ON organizations
  USING (id = app_current_org() OR app_is_staff())
  WITH CHECK (id = app_current_org() OR app_is_staff());

-- ── User-private tables: scoped by user, not org ────────────────────────────────
CREATE OR REPLACE FUNCTION apply_user_rls(tbl regclass) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', tbl);
  EXECUTE format($f$
    CREATE POLICY user_isolation ON %s
      USING (user_id = app_current_user() OR app_is_staff())
      WITH CHECK (user_id = app_current_user() OR app_is_staff())
  $f$, tbl);
END;
$$;

SELECT apply_user_rls('enrollments');
SELECT apply_user_rls('lesson_progress');
SELECT apply_user_rls('xp_events');
SELECT apply_user_rls('quiz_attempts');
SELECT apply_user_rls('lab_sessions');
SELECT apply_user_rls('notifications');
SELECT apply_user_rls('certificates');

-- ── Audit log: INSERT-only for the app role; immutability enforced at the privilege level ──
-- The app can append but never mutate or delete audit rows (FR-AD-002). A trigger backstops it.
REVOKE UPDATE, DELETE ON audit_logs FROM infoenc_app;
GRANT INSERT, SELECT ON audit_logs TO infoenc_app;

CREATE OR REPLACE FUNCTION forbid_audit_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$;

CREATE TRIGGER audit_no_update BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION forbid_audit_mutation();

-- ── Deliberately NOT under RLS (global / platform-internal) ─────────────────────
-- Public content: categories, courses, lessons, labs, ctf_challenges, cms_*, blog_*, kb_* and
--   their *_translations — the public product, filtered by published-state in the app.
-- Platform-internal: outbox_events, processed_events, audit_logs (own model above),
--   security_events, feature_flags, automation_* — staff-only via ABAC, not org-scoped.
-- Identity: users, sessions, credentials — accessed via context-free auth paths (doc 06 §2).
--
-- A CI "negative RLS" test (Phase 2 doc 06 §5) runs a scoped query with NO tenant context and
-- asserts zero rows, guarding against a policy accidentally defaulting open.
