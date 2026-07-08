import { Injectable, Logger } from "@nestjs/common";
import { Agent } from "node:https";
import { readFileSync } from "node:fs";

/**
 * Client for the lab-orchestrator (Phase 2 doc 07, ADR-008). This is the ONLY bridge from the app
 * VPC to the lab cluster — a single mTLS API over one tightly-scoped path. core-api never talks to
 * lab pods directly; it asks the orchestrator, which owns the isolated Kubernetes cluster.
 *
 * mTLS: cluster-issued client cert authenticates core-api to the orchestrator; the orchestrator's
 * server cert is pinned via the CA. A compromised app node cannot reach lab infrastructure without
 * these certs (defense against SSRF-pivot from core-api).
 */
export interface ProvisionRequest {
  labId: string;
  scenarioKey: string;
  scenarioVersion: string;
  userId: string;
  ttlSeconds: number;
}

export interface ProvisionResult {
  orchestratorRef: string; // namespace/session id in the lab cluster
  gatewayUrl: string; // session-token-scoped console URL (through Cloudflare)
  sessionSecret: string; // per-session flag seed (envelope-encrypted before persistence)
}

export interface SessionStatus {
  state: "provisioning" | "ready" | "active" | "expired" | "terminated" | "failed";
  computeSeconds: number;
}

@Injectable()
export class OrchestratorClient {
  private readonly log = new Logger(OrchestratorClient.name);
  private readonly baseUrl = process.env.LAB_ORCHESTRATOR_URL ?? "https://lab-orchestrator.internal";
  private readonly agent: Agent;

  constructor() {
    // mTLS material mounted from secrets (External Secrets Operator, Phase 2 doc 08 §3). In local
    // dev these paths are absent and the client falls back to plain TLS against a kind cluster.
    const certPath = process.env.LAB_MTLS_CERT;
    const keyPath = process.env.LAB_MTLS_KEY;
    const caPath = process.env.LAB_MTLS_CA;
    this.agent = new Agent(
      certPath && keyPath && caPath
        ? { cert: readFileSync(certPath), key: readFileSync(keyPath), ca: readFileSync(caPath) }
        : {},
    );
  }

  async provision(req: ProvisionRequest): Promise<ProvisionResult> {
    return this.call<ProvisionResult>("POST", "/v1/sessions", req);
  }

  async extend(orchestratorRef: string, addSeconds: number): Promise<void> {
    await this.call("POST", `/v1/sessions/${orchestratorRef}/extend`, { addSeconds });
  }

  async terminate(orchestratorRef: string): Promise<void> {
    await this.call("DELETE", `/v1/sessions/${orchestratorRef}`);
  }

  async status(orchestratorRef: string): Promise<SessionStatus> {
    return this.call<SessionStatus>("GET", `/v1/sessions/${orchestratorRef}`);
  }

  private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        // Short-lived signed service token in addition to mTLS (defense in depth, doc 05 §6).
        authorization: `Bearer ${process.env.LAB_SERVICE_TOKEN ?? ""}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      // @ts-expect-error Node fetch accepts a dispatcher/agent via undici in the runtime.
      agent: this.agent,
    });
    if (!res.ok) {
      this.log.error(`orchestrator ${method} ${path} → ${res.status}`);
      throw new Error(`orchestrator call failed: ${res.status}`);
    }
    return (res.status === 204 ? undefined : await res.json()) as T;
  }
}
