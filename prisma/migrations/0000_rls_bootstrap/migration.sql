-- INFOENC RLS bootstrap (Phase 3 doc 04 §3, Phase 2 doc 06).
-- This migration is hand-authored (not Prisma-generated): it installs the UUIDv7 function,
-- the application role, and the row-level-security policies + grants that make tenant isolation
-- a database property rather than an application-code convention.
--
-- Ordering: this runs as the FIRST migration so every subsequent table can have RLS enabled.
-- The generated schema migration (Prisma diff) runs after and creates the tables; a follow-up
-- policy migration attaches policies to those tables (see 0002_rls_policies).

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── UUIDv7 (time-ordered) — used by every model's @default(dbgenerated(...)) ────
-- Standard implementation: 48-bit unix-millis prefix + version/variant + random tail.
-- Replace with the native generator when the deployment's Postgres ships uuidv7().
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms  bytea;
  uuid_bytes  bytea;
BEGIN
  unix_ts_ms := substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3);
  -- 16 random bytes, then overlay timestamp + version (7) + variant (10xx).
  uuid_bytes := unix_ts_ms || gen_random_bytes(10);
  uuid_bytes := set_byte(uuid_bytes, 6, (b'0111' || get_byte(uuid_bytes, 6)::bit(4))::bit(8)::int);
  uuid_bytes := set_byte(uuid_bytes, 8, (b'10'   || get_byte(uuid_bytes, 8)::bit(6))::bit(8)::int);
  RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ── Application role (no BYPASSRLS, no superuser) ───────────────────────────────
-- The app connects as this role. It CANNOT see past RLS. DDL is owned by a separate migrator
-- role used only by `prisma migrate deploy`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'infoenc_app') THEN
    CREATE ROLE infoenc_app NOLOGIN;  -- LOGIN + password granted per environment out-of-band
  END IF;
END
$$;

-- Baseline privileges; per-table grants are refined in the policy migration.
GRANT USAGE ON SCHEMA public TO infoenc_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO infoenc_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO infoenc_app;

-- ── Helper: current tenant settings (fail-closed) ───────────────────────────────
-- Returns NULL when unset (the "second arg true" = missing_ok), so a policy comparing against
-- it yields FALSE → zero rows, rather than erroring or opening up.
CREATE OR REPLACE FUNCTION app_current_org() RETURNS uuid
  LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_org', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION app_current_user() RETURNS uuid
  LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.current_user', true), '')::uuid $$;

CREATE OR REPLACE FUNCTION app_is_staff() RETURNS boolean
  LANGUAGE sql STABLE AS $$ SELECT coalesce(current_setting('app.is_staff', true) = 'true', false) $$;
