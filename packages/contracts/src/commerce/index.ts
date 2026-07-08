import { z } from "zod";
import { money } from "../primitives.js";

/**
 * Commerce contracts (Phase 2 doc 03 §4). Plan features are a typed shape so the entitlements
 * read model and the lab-quota checker agree on what a tier grants.
 */

export const planTier = z.enum(["free", "learner", "pro", "corporate", "enterprise"]);
export type PlanTier = z.infer<typeof planTier>;

export const billingPeriod = z.enum(["monthly", "quarterly", "yearly"]);
export type BillingPeriod = z.infer<typeof billingPeriod>;

/** The feature set a plan grants — stored on Plan.features, consumed by entitlement checks. */
export const planFeatures = z.object({
  labConcurrency: z.number().int().min(0),
  machineDeploy: z.boolean(),
  machineConcurrency: z.number().int().min(0),
  vpnLabs: z.boolean(),
  dailyBrowserLabCap: z.number().int().min(0).nullable(), // null = unlimited
  browserLabMinutesCap: z.number().int().min(0).nullable(),
  pathCertificates: z.boolean(),
  careerPriority: z.boolean(),
  privateCtf: z.boolean(),
  teamManagement: z.boolean(),
  sso: z.boolean(),
});
export type PlanFeatures = z.infer<typeof planFeatures>;

export const checkoutInput = z.object({
  planKey: z.string(),
  currency: z.string().length(3),
  seats: z.number().int().min(1).default(1),
  couponCode: z.string().optional(),
  referralCode: z.string().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutInput>;

/** Coupon scope stored on Coupon.scope (typed here, JSON in Postgres — Phase 3 doc 01 §8). */
export const couponScope = z.object({
  planTiers: z.array(planTier).optional(),
  firstNCycles: z.number().int().min(1).optional(),
  minSeats: z.number().int().min(1).optional(),
});
export type CouponScope = z.infer<typeof couponScope>;

export const priceQuote = z.object({
  subtotal: money,
  discount: money.nullable(),
  tax: money,
  total: money,
  taxRateBps: z.number().int(),
});
export type PriceQuote = z.infer<typeof priceQuote>;
