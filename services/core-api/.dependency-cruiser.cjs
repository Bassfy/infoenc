/**
 * Module-boundary enforcement (Phase 2 doc 02 §2.3). Keeps "modular monolith" honest: a domain
 * module may not import another domain module's internals — only its public-api.ts facade or
 * communicate via events. Violations fail CI (the `boundaries` turbo task).
 */
module.exports = {
  forbidden: [
    {
      name: "no-cross-module-internals",
      comment:
        "Domain modules must not reach into each other's internals — use public-api.ts or events.",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/([^/]+)/",
        pathNot: [
          "^src/modules/$1/", // same module: fine
          "^src/modules/[^/]+/public-api\\.ts$", // another module's facade: fine
        ],
      },
    },
    {
      name: "platform-has-no-domain-deps",
      comment: "platform/ is depended on by everything and must not depend on domain modules.",
      severity: "error",
      from: { path: "^src/platform/" },
      to: { path: "^src/modules/" },
    },
    {
      name: "no-circular",
      comment: "Circular dependencies are forbidden.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
  },
};
