import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";
import { LabQuotaService } from "./lab-quota.service.js";
import { OrchestratorClient } from "./orchestrator.client.js";
import { CryptoService } from "../../platform/crypto/crypto.service.js";

/**
 * Lab session lifecycle (Phase 2 doc 07 §4). Orchestrates the full start→run→teardown flow across
 * the quota gate, the orchestrator (lab cluster), the DB session record, and events.
 *
 * Start ordering is deliberate: quota FIRST (cheapest denial), then provision, then persist. The
 * per-session flag seed returned by the orchestrator is envelope-encrypted before it touches the
 * database and is never returned to the client (FR-AC-050).
 */
@Injectable()
export class LabSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly quota: LabQuotaService,
    private readonly orchestrator: OrchestratorClient,
    private readonly crypto: CryptoService,
  ) {}

  async start(orgId: string, userId: string, labId: string): Promise<{ sessionId: string; gatewayUrl: string; expiresAt: Date }> {
    const lab = await this.prisma.lab.findUniqueOrThrow({ where: { id: labId } });
    const requiresMachine = lab.delivery === "desktop" || lab.delivery === "vpn";

    // 1. Quota gate — the cheapest place to say no (cost control, R1).
    const decision = await this.quota.enforce(orgId, userId, requiresMachine);

    // 2. Provision in the isolated lab cluster via the orchestrator (mTLS).
    const provisioned = await this.orchestrator.provision({
      labId,
      scenarioKey: lab.scenarioKey,
      scenarioVersion: lab.scenarioVersion,
      userId,
      ttlSeconds: decision.sessionTtlSeconds,
    });

    // 3. Persist the session; the flag seed is envelope-encrypted at rest, never returned.
    const expiresAt = new Date(Date.now() + decision.sessionTtlSeconds * 1000);
    const session = await this.prisma.labSession.create({
      data: {
        labId,
        userId,
        state: "ready",
        orchestratorRef: provisioned.orchestratorRef,
        flagSeedCipher: await this.crypto.encrypt(provisioned.sessionSecret),
        expiresAt,
      },
    });

    await this.quota.recordStart(userId);
    return { sessionId: session.id, gatewayUrl: provisioned.gatewayUrl, expiresAt };
  }

  async extend(userId: string, sessionId: string, addSeconds: number): Promise<{ expiresAt: Date }> {
    const session = await this.ownedSession(userId, sessionId);
    await this.orchestrator.extend(session.orchestratorRef!, addSeconds);
    const expiresAt = new Date(session.expiresAt.getTime() + addSeconds * 1000);
    await this.prisma.labSession.update({ where: { id: sessionId }, data: { expiresAt } });
    return { expiresAt };
  }

  async terminate(userId: string, sessionId: string): Promise<void> {
    const session = await this.ownedSession(userId, sessionId);
    if (session.orchestratorRef) await this.orchestrator.terminate(session.orchestratorRef);
    await this.prisma.labSession.update({
      where: { id: sessionId },
      data: { state: "terminated", terminatedAt: new Date() },
    });
  }

  /** Returns the decrypted per-session secret for flag validation. Never leaves the server. */
  async sessionSecret(sessionId: string): Promise<string> {
    const s = await this.prisma.labSession.findUniqueOrThrow({ where: { id: sessionId } });
    if (!s.flagSeedCipher) throw new NotFoundException("session has no flag seed");
    return this.crypto.decrypt(s.flagSeedCipher);
  }

  private async ownedSession(userId: string, sessionId: string) {
    const session = await this.prisma.labSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new NotFoundException("session not found");
    return session;
  }
}
