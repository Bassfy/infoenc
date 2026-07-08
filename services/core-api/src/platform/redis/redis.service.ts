import { Injectable, type OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";
import { loadEnv } from "../../config/env.js";

/**
 * Redis access for cache, rate limits, pub/sub, and the session revocation denylist
 * (Phase 2 doc 03 §6, doc 05 §3). One connection factory; BullMQ uses its own connection.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor() {
    this.client = new Redis(loadEnv().REDIS_URL, { maxRetriesPerRequest: null });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /**
   * Session revocation denylist (NFR-002). On logout / family-kill, the session id is denylisted
   * for the access-token TTL, so a still-valid access token is rejected within ≤60s without a DB
   * hit per request. The entry self-expires once no unexpired access token could carry that sid.
   */
  async denySession(sessionId: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`denylist:sid:${sessionId}`, "1", "EX", ttlSeconds);
  }

  async isSessionDenied(sessionId: string): Promise<boolean> {
    return (await this.client.exists(`denylist:sid:${sessionId}`)) === 1;
  }
}
