import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import type {
  CheckoutSession,
  CheckoutSessionRequest,
  NormalizedWebhook,
  PaymentProvider,
} from "./payment-provider.js";

/**
 * Stripe adapter (Phase 2 doc 03 §4). Uses Stripe Checkout (provider-hosted card fields — the card
 * PAN never reaches our servers, keeping us SAQ-A, NFR-071). Idempotency keys make retries safe;
 * webhook signatures are verified before any state change.
 */
@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly kind = "stripe" as const;
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-12-18.acacia" });
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  }

  async createCheckoutSession(req: CheckoutSessionRequest): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: "subscription",
        currency: req.currency.toLowerCase(),
        customer_email: req.customerEmail,
        client_reference_id: req.orgId,
        line_items: [
          {
            quantity: req.seats,
            price_data: {
              currency: req.currency.toLowerCase(),
              recurring: { interval: "month" },
              unit_amount: req.amount,
              product_data: { name: `INFOENC ${req.planKey}` },
            },
          },
        ],
        metadata: { orgId: req.orgId, planKey: req.planKey },
        success_url: req.successUrl,
        cancel_url: req.cancelUrl,
      },
      { idempotencyKey: req.idempotencyKey },
    );
    return { providerRef: session.id, redirectUrl: session.url ?? req.cancelUrl };
  }

  async createBillingPortalUrl(providerCustomerId: string, returnUrl: string): Promise<string> {
    const portal = await this.stripe.billingPortal.sessions.create({
      customer: providerCustomerId,
      return_url: returnUrl,
    });
    return portal.url;
  }

  async refund(paymentRef: string, amount?: number): Promise<void> {
    await this.stripe.refunds.create({ payment_intent: paymentRef, ...(amount ? { amount } : {}) });
  }

  parseWebhook(rawBody: Buffer, signature: string): NormalizedWebhook {
    // Throws Stripe.errors.StripeSignatureVerificationError on tampering — we never trust an
    // unverified webhook body (Phase 2 doc 03 §4).
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    return normalize(event);
  }
}

function normalize(event: Stripe.Event): NormalizedWebhook {
  const base = { providerEventId: event.id };
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      return {
        ...base,
        type: "subscription.created",
        orgId: s.metadata?.orgId,
        providerSubscriptionId: typeof s.subscription === "string" ? s.subscription : undefined,
      };
    }
    case "invoice.paid": {
      const inv = event.data.object as Stripe.Invoice;
      return {
        ...base,
        type: "subscription.renewed",
        providerSubscriptionId: typeof inv.subscription === "string" ? inv.subscription : undefined,
        currentPeriodEnd: inv.period_end ? new Date(inv.period_end * 1000) : undefined,
        amount: inv.amount_paid,
        currency: inv.currency?.toUpperCase(),
      };
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      return {
        ...base,
        type: "subscription.past_due",
        providerSubscriptionId: typeof inv.subscription === "string" ? inv.subscription : undefined,
      };
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      return { ...base, type: "subscription.canceled", providerSubscriptionId: sub.id };
    }
    default:
      return { ...base, type: "unknown" };
  }
}
