import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { EventName } from "@infoenc/contracts/events";

/**
 * Transactional outbox emitter (Phase 2 doc 03 §3). Domain services call `emit` with the SAME
 * transaction client that made the state change, so the event row and the change commit atomically
 * — the "no lost events, no dual-write race" guarantee. A separate relay (outbox.relay.ts, worker
 * runtime) publishes unpublished rows to BullMQ and marks them published.
 */
@Injectable()
export class OutboxService {
  /** Append an event within an existing transaction. Never call outside a txn that owns a change. */
  emit(
    tx: Prisma.TransactionClient,
    event: { name: EventName; aggregateId: string; orgId?: string | null; payload: Record<string, unknown> },
  ): Promise<unknown> {
    return tx.outboxEvent.create({
      data: {
        type: event.name,
        aggregateId: event.aggregateId,
        orgId: event.orgId ?? null,
        payload: event.payload as Prisma.InputJsonValue,
      },
    });
  }
}
