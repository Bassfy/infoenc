import { Module } from "@nestjs/common";
import { EntitlementService } from "./entitlement.service.js";

/**
 * Commerce module (Phase 2 doc 03 §4). Plans, subscriptions, entitlements, invoices, payments.
 * The EntitlementService read model is exported for the lab-quota checker and API guards; provider
 * adapters (Stripe/PayPal) and the subscription state machine build out on this base.
 */
@Module({
  providers: [EntitlementService],
  exports: [EntitlementService],
})
export class CommerceModule {}
