import type { PaymentProviderKind } from "@prisma/client";

/**
 * Payment provider abstraction (Phase 2 doc 03 §4, ADR: provider abstraction). Stripe and PayPal
 * implement this at v1; regional gateways (Moyasar, Paymob) implement the SAME interface as a
 * fast-follow, so adding a rail is an adapter, not surgery. Card data never touches our servers —
 * checkout is provider-hosted (SAQ-A, NFR-071).
 */
export interface CheckoutSessionRequest {
  orgId: string;
  planKey: string;
  currency: string;
  amount: number; // minor units, post-discount, pre-tax handled by provider tax config where used
  seats: number;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  customerEmail?: string;
}

export interface CheckoutSession {
  providerRef: string;
  redirectUrl: string;
}

/** Normalized webhook event after the adapter parses + verifies the provider's payload. */
export interface NormalizedWebhook {
  providerEventId: string;
  type:
    | "subscription.created"
    | "subscription.renewed"
    | "subscription.past_due"
    | "subscription.canceled"
    | "payment.succeeded"
    | "payment.failed"
    | "unknown";
  orgId?: string;
  providerSubscriptionId?: string;
  currentPeriodEnd?: Date;
  amount?: number;
  currency?: string;
}

export interface PaymentProvider {
  readonly kind: PaymentProviderKind;
  createCheckoutSession(req: CheckoutSessionRequest): Promise<CheckoutSession>;
  createBillingPortalUrl(providerCustomerId: string, returnUrl: string): Promise<string>;
  refund(paymentRef: string, amount?: number): Promise<void>;
  /** Verify signature and parse into a NormalizedWebhook; throws on invalid signature. */
  parseWebhook(rawBody: Buffer, signature: string): NormalizedWebhook;
}

export const PAYMENT_PROVIDERS = Symbol("PAYMENT_PROVIDERS");
