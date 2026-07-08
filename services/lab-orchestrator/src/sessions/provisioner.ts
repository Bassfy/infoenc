import { randomBytes } from "node:crypto";
import type { ProvisionRequest, ProvisionResult } from "./session.contracts.js";

/**
 * Session provisioner (Phase 2 doc 07 §2–4). Compiles a scenario declaration into an isolated
 * Kubernetes session: a per-session namespace, a default-deny NetworkPolicy with only the
 * scenario-declared flows, gVisor-runtime pods (non-root, dropped caps, seccomp), and a
 * ResourceQuota per the TTL/plan. Returns the console gateway URL + the per-session flag secret.
 *
 * This module contains the ORCHESTRATION SHAPE and safety invariants as typed steps; the concrete
 * Kubernetes API calls (via cdk8s-generated manifests, Phase 2 doc 08 §3) are applied by the
 * `applyManifests` boundary, which is the only code with cluster credentials. The threat model
 * (doc 07 §1) drives every step here: isolation before features.
 */

export interface K8sApplier {
  createNamespace(name: string, labels: Record<string, string>): Promise<void>;
  applyNetworkPolicyDefaultDeny(namespace: string): Promise<void>;
  applyScenarioFlows(namespace: string, flows: ScenarioFlow[]): Promise<void>;
  applyResourceQuota(namespace: string, quota: ResourceQuota): Promise<void>;
  scheduleScenarioPods(namespace: string, spec: ScenarioPodSpec): Promise<void>;
  deleteNamespace(name: string): Promise<void>;
}

export interface ScenarioFlow {
  from: string;
  to: string;
  ports: number[];
}
export interface ResourceQuota {
  cpu: string;
  memory: string;
  ephemeralStorage: string;
}
export interface ScenarioPodSpec {
  images: { name: string; role: "attack" | "target" }[];
  runtimeClass: "gvisor" | "kata"; // gVisor default; microVM for kernel-exploitation scenarios
  flagSecret: string;
}

export interface ScenarioDefinition {
  scenarioKey: string;
  version: string;
  flows: ScenarioFlow[];
  quota: ResourceQuota;
  images: { name: string; role: "attack" | "target" }[];
  needsRealKernel: boolean; // → kata microVM pool instead of gVisor
}

export class Provisioner {
  constructor(
    private readonly applier: K8sApplier,
    private readonly resolveScenario: (key: string, version: string) => Promise<ScenarioDefinition>,
    private readonly gatewayBaseUrl: string,
  ) {}

  async provision(req: ProvisionRequest): Promise<ProvisionResult> {
    const scenario = await this.resolveScenario(req.scenarioKey, req.scenarioVersion);
    const sessionId = randomBytes(12).toString("hex");
    const namespace = `lab-${req.userId.slice(0, 8)}-${sessionId}`;
    // Per-session secret used to derive dynamic flags (must match core-api's derivation, doc 07 §6).
    const flagSecret = randomBytes(24).toString("hex");

    // Isolation FIRST — the namespace is created deny-all, then only declared flows are opened.
    await this.applier.createNamespace(namespace, {
      "infoenc/lab": req.labId,
      "infoenc/user": req.userId,
      "infoenc/ttl": String(req.ttlSeconds),
    });
    await this.applier.applyNetworkPolicyDefaultDeny(namespace); // default-deny ingress+egress
    await this.applier.applyResourceQuota(namespace, scenario.quota); // caps CPU/RAM/disk (anti-abuse)
    await this.applier.applyScenarioFlows(namespace, scenario.flows); // only the scenario's edges
    await this.applier.scheduleScenarioPods(namespace, {
      images: scenario.images,
      runtimeClass: scenario.needsRealKernel ? "kata" : "gvisor",
      flagSecret,
    });

    const orchestratorRef = `${namespace}/${sessionId}`;
    return {
      orchestratorRef,
      gatewayUrl: `${this.gatewayBaseUrl}/s/${sessionId}`,
      sessionSecret: flagSecret,
    };
  }

  async terminate(orchestratorRef: string): Promise<void> {
    const namespace = orchestratorRef.split("/")[0];
    if (namespace) await this.applier.deleteNamespace(namespace); // reclaims all resources ≤2min
  }
}
