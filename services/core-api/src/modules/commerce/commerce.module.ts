import { Module } from "@nestjs/common";
import { EntitlementService } from "./entitlement.service.js";
import { SubscriptionService } from "./subscription.service.js";
import { StripeProvider } from "./payment/stripe.provider.js";
import { WebhookController } from "./webhook.controller.js";

/**
 * Commerce module (Phase 2 doc 03 §4). Entitlement read model, subscription state machine, payment
 * provider adapters (Stripe at v1; PayPal + regional gateways implement the same interface), and
 * inbound webhooks. EntitlementService is exported for the lab-quota checker (labs module).
 */
@Module({
  controllers: [WebhookController],
  providers: [EntitlementService, SubscriptionService, StripeProvider],
  exports: [EntitlementService],
})
export class CommerceModule {}
