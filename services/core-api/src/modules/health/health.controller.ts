import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { Public } from "../../platform/auth/auth.guard.js";

/**
 * Liveness and readiness (Phase 2 doc 03 §6). Liveness answers "is the process up"; readiness
 * answers "can it serve traffic" (dependencies reachable) and gates rollout traffic. Both are
 * @Public — probes are unauthenticated.
 */
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get("healthz")
  liveness(): { status: "ok" } {
    return { status: "ok" };
  }

  @Public()
  @Get("readyz")
  async readiness(): Promise<{ status: "ready" | "degraded"; checks: Record<string, boolean> }> {
    const checks: Record<string, boolean> = { database: false };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch {
      checks.database = false;
    }
    const ready = Object.values(checks).every(Boolean);
    return { status: ready ? "ready" : "degraded", checks };
  }
}
