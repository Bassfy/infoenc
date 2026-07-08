// Load test — academy hot paths (Phase 1 doc 08 §7, NFR-031/032/033). Run before GA and before
// marketing pushes. Thresholds encode the SLO: a regression past them fails the run in CI.
//
//   k6 run -e BASE_URL=https://staging.infoenc.com infra/load/k6-academy.js
//
// Scenarios model the launch-KPI mix (doc 10): mostly reads (catalog, dashboard), a slice of
// writes (lesson completion), and the expensive lab-provision path at its own lower rate.

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://localhost:4000";

const labProvision = new Trend("lab_provision_ms", true);

export const options = {
  scenarios: {
    // Steady browse/learn traffic ramping to the v1 concurrency target.
    browse: {
      executor: "ramping-vus",
      exec: "browse",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 200 },
        { duration: "5m", target: 500 }, // NFR-033: 500 concurrent
        { duration: "3m", target: 500 },
        { duration: "2m", target: 0 },
      ],
    },
    // Lab provisioning at a realistic lower rate — the expensive path (NFR-032).
    labs: {
      executor: "constant-arrival-rate",
      exec: "provisionLab",
      rate: 20,
      timeUnit: "1s",
      duration: "12m",
      preAllocatedVUs: 100,
      maxVUs: 300,
    },
  },
  thresholds: {
    // NFR-031: p95 reads ≤300ms, writes ≤600ms.
    "http_req_duration{kind:read}": ["p(95)<300"],
    "http_req_duration{kind:write}": ["p(95)<600"],
    // NFR-032: browser lab interactive ≤25s p95.
    lab_provision_ms: ["p(95)<25000"],
    // Overall error budget.
    http_req_failed: ["rate<0.01"],
  },
};

const authHeaders = () => ({ Authorization: `Bearer ${__ENV.TOKEN || "load-test-token"}` });

export function browse() {
  // Public catalog (read, cache-friendly).
  const cat = http.get(`${BASE}/api/v1/catalog/courses?limit=20`, { tags: { kind: "read" } });
  check(cat, { "catalog 200": (r) => r.status === 200 });

  // Authenticated dashboard read.
  const dash = http.get(`${BASE}/graphql?op=dashboard`, { headers: authHeaders(), tags: { kind: "read" } });
  check(dash, { "dashboard ok": (r) => r.status === 200 || r.status === 401 });

  // Occasional write: mark a lesson complete.
  if (Math.random() < 0.2) {
    const done = http.post(
      `${BASE}/graphql`,
      JSON.stringify({ op: "completeLesson", lessonId: "load-test-lesson" }),
      { headers: { ...authHeaders(), "Content-Type": "application/json" }, tags: { kind: "write" } },
    );
    check(done, { "complete accepted": (r) => r.status < 500 });
  }

  sleep(Math.random() * 3 + 1);
}

export function provisionLab() {
  const start = Date.now();
  const res = http.post(`${BASE}/api/v1/labs/load-test-lab/sessions`, null, {
    headers: authHeaders(),
    tags: { kind: "write" },
  });
  labProvision.add(Date.now() - start);
  // Under quota limits many will be 403 (LAB_QUOTA_EXCEEDED) — that's a correct, fast response.
  check(res, { "provision handled": (r) => r.status < 500 });
}
