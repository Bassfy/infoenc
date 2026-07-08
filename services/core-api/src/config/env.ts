import { z } from "zod";

/**
 * Environment validation. The process refuses to boot with an invalid/missing config — a
 * misconfigured secret should fail loudly at startup, never silently at runtime (NFR-015).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(4000),

  // Postgres — the app connects as the non-BYPASSRLS application role (Phase 3 doc 04 §3).
  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url(),

  // JWT signing (KMS key id in prod; local dev may use a file-based key).
  JWT_SIGNING_KEY_ID: z.string().min(1),
  JWT_ISSUER: z.string().default("https://auth.infoenc.com"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().default(600), // 10 min (doc 05 §3)
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().default(2_592_000), // 30 days

  // Envelope encryption root (KMS key id) for field-level encryption (NFR-020).
  KMS_DATA_KEY_ID: z.string().min(1),

  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((s) => s.split(",").map((o) => o.trim())),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
