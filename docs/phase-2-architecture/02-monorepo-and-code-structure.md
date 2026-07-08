# 02 — Monorepo & Code Structure

Tooling: **pnpm workspaces + Turborepo** (task graph, remote caching), TypeScript strict everywhere, ESLint + Prettier shared configs, Changesets for internal package versioning. Rationale: ADR-002.

## 1. Repository layout

```
infoenc/
├── apps/
│   ├── web/                      # infoenc.com — company site + client portal (Next.js 15)
│   │   ├── app/
│   │   │   ├── [locale]/                 # ar | en segment, RTL-aware layout
│   │   │   │   ├── (marketing)/          # home, services/[slug], industries, about,
│   │   │   │   │                         # careers, blog/[slug], contact, legal
│   │   │   │   ├── (scoping)/            # scoping forms per service family (FR-CO-020)
│   │   │   │   └── portal/               # client portal (FR-CO-030s), authed layout
│   │   │   └── api/                      # route handlers: OG images, revalidation hooks
│   │   ├── components/                   # app-specific composites
│   │   ├── lib/
│   │   └── e2e/                          # Playwright, both locales
│   ├── academy/                  # academy.infoenc.com (Next.js 15)
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── (public)/             # landing, catalog, pricing, cert verification
│   │   │   │   ├── (learn)/              # dashboard, paths, courses, lessons, quizzes
│   │   │   │   ├── (labs)/               # lab catalog, session console, CTF events
│   │   │   │   ├── (community)/          # forums, discussions, leaderboards, profiles
│   │   │   │   ├── (career)/             # roadmaps, jobs, resume builder
│   │   │   │   ├── (org)/                # corporate workspace (FR-AC-110s)
│   │   │   │   ├── (instructor)/         # authoring studio (FR-AC-100s)
│   │   │   │   └── (account)/            # settings, billing, security
│   │   │   └── api/
│   │   ├── components/
│   │   ├── lib/
│   │   └── e2e/
│   ├── admin/                    # admin.infoenc.com (Next.js 15) — back office (doc 07 P1)
│   │   └── app/[locale]/
│   │       ├── (dashboards)/ (crm)/ (cms)/ (commerce)/ (support)/
│   │       ├── (engagements)/            # consultant tooling incl. findings/reports
│   │       ├── (academy-ops)/            # catalog, editorial queues, translation board
│   │       └── (automation)/ (settings)/ # workflow monitor, human-gate queues; RBAC, audit
│   └── mobile/                   # React Native (Expo) — scaffold now, build fast-follow (ADR-014)
├── services/
│   ├── core-api/                 # NestJS modular monolith (doc 03)
│   │   ├── src/
│   │   │   ├── main.ts                   # HTTP/WS entrypoint
│   │   │   ├── worker.ts                 # BullMQ consumer entrypoint (same modules)
│   │   │   └── modules/                  # see doc 03 §1 module map
│   │   └── test/                         # unit + integration + authz/tenancy suites
│   └── lab-orchestrator/         # NestJS, deployed into lab cluster (doc 07)
│       └── src/
│           ├── sessions/ scenarios/ networking/ flags/ reaper/ metering/
│           └── k8s/                      # typed manifests via cdk8s constructs
├── packages/
│   ├── contracts/                # THE source of truth for types across the platform:
│   │   │                         # zod schemas → GraphQL codegen types, OpenAPI types,
│   │   │                         # queue payload types, webhook payloads
│   │   └── src/{auth,catalog,labs,commerce,engagements,events}/
│   ├── ui/                       # design-system components (Phase 4 fills this):
│   │   └── src/{primitives,composites,motion,three}/   # Radix/shadcn base, Framer Motion,
│   │                                                    # R3F scenes with reduced-motion fallbacks
│   ├── i18n/                     # message catalogs (ar/en), formatting utils (incl. Hijri),
│   │   │                         # bidi helpers, locale negotiation shared by web+api+emails
│   │   └── messages/{ar,en}/
│   ├── config/                   # eslint, tsconfig, tailwind preset (logical-properties enforced),
│   │                             # prettier — single source for all apps/services
│   ├── emails/                   # React Email templates, bilingual, RTL-tested
│   ├── pdf/                      # certificate/invoice/report renderers (bilingual, doc 03 §6)
│   └── testing/                  # shared fixtures, factories, authz-matrix test kit
├── infra/
│   ├── terraform/
│   │   ├── modules/{network,eks,rds,redis,s3,cloudflare,observability,lab-vpc}/
│   │   └── envs/{staging,production}/
│   ├── k8s/                      # Helm charts per deployable + kustomize overlays
│   └── docker/                   # local dev compose: postgres, redis, meilisearch, mailpit, minio
├── prisma/                       # schema + migrations (Phase 3 owns content)
├── docs/                         # phase documentation (this)
├── legacy/                       # archived MVP (doc 09 Phase 1) — excluded from CI
├── turbo.json
├── pnpm-workspace.yaml
└── .github/workflows/            # ci.yml, deploy-staging.yml, deploy-production.yml, codeql.yml
```

## 2. Boundary rules (enforced, not aspirational)

1. **Apps never import from services.** Frontends consume the API via generated clients from `packages/contracts` (GraphQL codegen + openapi-typescript). No shared "utils" backdoor into server code.
2. **`packages/contracts` is dependency-free** (zod only). It is the schema authority: API DTOs, queue payloads, and webhook bodies all derive from it, so a payload change is a reviewed contract change, not a runtime surprise.
3. **core-api modules may not import each other's internals** — only each module's `public-api.ts` surface or events. Enforced with `eslint-plugin-boundaries` + dependency-cruiser in CI; violations fail the build. This is what keeps "modular monolith" true over time (ADR-001's honesty mechanism).
4. **`packages/ui` knows nothing about the domain.** It receives data, renders design; feature composites live in each app's `components/`.
5. **Locale-completeness gate:** CI fails if a message key exists in `en` but not `ar` (or vice versa) outside an explicit `@draft` allowlist (NFR-054).

## 3. Tooling decisions

| Concern | Choice | Note |
|---|---|---|
| Package manager | pnpm 9 | Workspace protocol, strict hoisting |
| Task runner | Turborepo | Remote cache in CI cuts monorepo build times |
| TS config | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` | One base config in `packages/config` |
| Validation | zod (contracts) + nestjs-zod at API boundary | One schema → DTO + docs + client types |
| Codegen | GraphQL Code Generator, openapi-typescript, Prisma client | All generated code git-ignored, built in CI |
| Testing | Vitest (unit), Testcontainers (integration), Playwright (E2E), k6 (load) | Suites map to doc 08 §7 quality gates (Phase 1) |
| Commit hygiene | Conventional commits, changesets, commitlint | Feeds automated changelogs |
| Docs-as-code | ADRs in `docs/`, OpenAPI + GraphQL SDL published from CI to internal docs site | NFR-080 operability culture |

## 4. Local development

`pnpm dev` brings up docker compose (Postgres, Redis, Meilisearch, MinIO, Mailpit) plus core-api and the three Next.js apps with seeded bilingual data. Lab development uses a local kind cluster profile with two sample scenarios so the orchestrator is developable without AWS. Target: **clone-to-running under 15 minutes** — onboarding speed is an explicit goal (R10, bus-factor mitigation).
