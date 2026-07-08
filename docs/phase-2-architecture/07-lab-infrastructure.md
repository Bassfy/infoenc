# 07 — Lab Infrastructure

The highest-risk subsystem: it runs code learners are *encouraged* to attack, it is the largest variable cost (R1), and a break-out is a company-ending breach (R3). Designed as a **hostile-workload platform first, product feature second.** Requirements: FR-AC-040–046, 090, 096; NFR-022, 032, 042. Decisions: ADR-008 (dedicated cluster), ADR-009 (gVisor + default-deny).

## 1. Threat model (what we assume the learner will do)

- Attempt container/VM escape from their attack box.
- Attempt lateral movement to other learners' sessions.
- Attempt egress to INFOENC production, cloud metadata endpoints, or the internet at large.
- Attempt to consume unbounded CPU/RAM/disk (including cryptomining — explicitly seen on every lab platform).
- Attempt to persist beyond session teardown.

Every control below maps to one of these.

## 2. Isolation stack (defense in depth)

```
Cloudflare (session console traffic, WAF, token check)
        │
   Session Gateway  ── issues nothing; only proxies authenticated session tokens
        │
┌─────────────────────────────────────────────────────────────┐
│  LAB CLUSTER  (separate EKS cluster, separate VPC, no peering │
│               route to app VPC — traffic between them is the  │
│               single mTLS orchestrator API only)              │
│                                                               │
│  Per-session Kubernetes namespace                             │
│   ├─ NetworkPolicy: default-deny ingress+egress;              │
│   │   only scenario-declared intra-session flows allowed      │
│   ├─ gVisor (runsc) runtime — userspace kernel, syscall       │
│   │   interception; blast radius of an escape is the sandbox  │
│   ├─ Pods: attack-box + target(s), non-root, read-only rootfs │
│   │   where possible, dropped capabilities, seccomp profile   │
│   ├─ ResourceQuota + LimitRange: CPU/RAM/ephemeral-storage    │
│   │   caps per plan tier (FR-AC-096 free-tier caps)           │
│   └─ No cloud IAM (IMDS blocked via NetworkPolicy + hop-limit)│
│                                                               │
│  Node pools: dedicated, tainted, autoscaled, short-lived;     │
│  nodes recycled frequently; no app workloads ever scheduled   │
└─────────────────────────────────────────────────────────────┘
```

- **VPC separation is the hard wall** (ADR-008). Even a full node compromise yields an attacker a network island with no route to Postgres, Redis, S3, or the app cluster.
- **gVisor** (ADR-009) is the runtime for learner-controlled pods — a userspace kernel means a kernel-exploit escape hits gVisor's sandbox, not the host kernel. Trade-off (syscall overhead) is acceptable for lab workloads and non-negotiable given the threat model. Firecracker/Kata microVMs are the documented upgrade path if a scenario needs a real kernel (e.g., kernel-exploitation labs) — those scenarios get microVM node pools.
- **Metadata endpoint (169.254.169.254) blocked** at NetworkPolicy + IMDSv2 hop-limit 1 on nodes — the classic cloud-cred theft vector, closed twice.

## 3. Networking per scenario

Each lab scenario **declares its topology** (attack box, targets, allowed internal links, whether the box needs outbound internet — most don't). The orchestrator compiles that declaration into a NetworkPolicy. Default is total isolation; a scenario that needs, say, the attack box to reach a target on port 445 gets exactly that edge and nothing else. Egress to the internet, when required, goes through a filtered proxy with an allowlist and full logging (NFR-022) — never raw.

**VPN labs (FR-AC-043, S-priority):** per-user WireGuard config, session-bound, dropping the user into a scenario subnet through the gateway — same NetworkPolicy discipline; the VPN is a connectivity method, not an isolation exception.

## 4. Session lifecycle & the cost problem (R1, NFR-042)

```
request → entitlement+quota check (core-api, Redis) → orchestrator.create()
        → namespace + policy + pods (warm pool for top labs → ≤25s p95)
        → session token + dynamic flags issued → gateway URL returned
   active → metered per-minute; idle detector (no console I/O) arms warning
   idle-warning → grace → reap;  expiry(plan TTL) → reap
   reap → namespace deleted, resources reclaimed ≤2min, cost record written
```

- **Warm pools** for the ~20 most-used labs absorb cold-start; everything else provisions on demand. Pool size auto-tunes to time-of-day demand curves.
- **The reaper is sacred.** Idle reaping (no I/O for N minutes) + hard TTL per plan + a sweeper that kills orphaned namespaces are the difference between healthy margins and bankruptcy. Session cost is metered and rolled into cost-per-active-learner (launch KPI ≤$1.20/mo).
- **Free tier** (FR-AC-096): 1 browser lab/day, 60-min cap, no deployable machines, tightest resource quota — the free tier cannot cost more than doc 03's $0.40/user/mo model allows.
- **Abuse detection (FR-AC-046):** node-level CPU-pattern monitoring flags sustained max-CPU (cryptomining signature) → session killed + account flagged; egress-proxy anomaly detection; per-account concurrent-session caps enforced in Redis before provisioning.

## 5. Terminal & desktop delivery

- **Terminal labs:** ttyd/xterm.js over WebSocket through the gateway — lightweight, the default format.
- **Desktop labs:** Apache Guacamole (RDP/VNC gatewayed to browser) for GUI targets — heavier, reserved for scenarios that need it.
- Gateway authenticates the session token (issued by orchestrator, scoped to one session, short TTL), proxies to the right namespace, and terminates when the session reaps. It holds no long-lived credentials and stores no session data.

## 6. Content pipeline (lab authoring — FR-AC-045)

- Scenarios are declared as versioned definitions (images, topology, tasks, flags, hints) in a registry. Images built in CI, scanned (NFR-016), signed, and stored in a private registry the lab cluster pulls from.
- **Dynamic flags** where feasible: per-session flag values derived from a session secret, so a leaked flag is worthless to another user (FR-AC-050) — kills the "flag-sharing" cheat and the writeup-copy problem.
- Internal lab builder for the content team at v1; instructor self-serve builder (FR-AC-045 S) reuses the same declaration format behind a guided UI, with mandatory security review before a third-party scenario reaches the cluster.

## 7. Why this scales and stays affordable

- Lab cluster autoscaling is independent of the app cluster (NFR-041: lab failure never touches learning content).
- Node pools are cattle: short-lived, recycled, tainted — a compromised node is drained and replaced, not investigated in place.
- The whole subsystem is behind one orchestrator API, so the "graduate to a service" decision (ADR-001) is already made *for the one workload that genuinely warranted it* — everything else stays in the monolith.
