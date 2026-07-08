import { BadRequestException, Controller, Headers, Post, RawBodyRequest, Req } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../../platform/auth/auth.guard.js";
import { StripeProvider } from "./payment/stripe.provider.js";
import { SubscriptionService } from "./subscription.service.js";

/**
 * Inbound payment webhooks (Phase 2 doc 03 §4, ADR-005: webhooks are REST). @Public (providers
 * aren't authenticated by our JWT) but the RAW body is signature-verified inside the adapter before
 * any state change — an unverified body is rejected. Idempotency is handled by SubscriptionService.
 *
 * Requires `rawBody: true` on the Nest app (main.ts) so the signature covers the exact bytes sent.
 */
@Controller("api/v1/webhooks")
export class WebhookController {
  constructor(
    private readonly stripe: StripeProvider,
    private readonly subscriptions: SubscriptionService,
  ) {}

  @Public()
  @Post("stripe")
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string,
  ): Promise<{ received: boolean }> {
    if (!req.rawBody) throw new BadRequestException("missing raw body");
    let event;
    try {
      event = this.stripe.parseWebhook(req.rawBody, signature); // throws on bad signature
    } catch {
      throw new BadRequestException("invalid signature");
    }
    await this.subscriptions.handleWebhook("stripe", event);
    return { received: true };
  }
}
