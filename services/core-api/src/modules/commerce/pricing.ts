import type { CouponScope } from "@infoenc/contracts/commerce";

/**
 * Pricing & tax computation (Phase 2 doc 03 §3, Phase 1 doc 03). Pure functions — no I/O — so they
 * are exhaustively unit-testable (money paths require ≥90% branch coverage, Phase 1 doc 08 §7).
 * All amounts are integer minor units; rounding is applied once, at the tax step, half-up.
 */

/** VAT rates by jurisdiction in basis points (Phase 1 doc 03 §3). Extend as markets are added. */
export const TAX_RATES_BPS: Record<string, number> = {
  SA: 1500, // KSA 15%
  EG: 1400, // Egypt 14%
  AE: 500, // UAE 5%
  QA: 0,
  KW: 0,
  DEFAULT: 0,
};

export function taxRateFor(jurisdiction: string): number {
  return TAX_RATES_BPS[jurisdiction] ?? TAX_RATES_BPS.DEFAULT ?? 0;
}

export interface CouponInput {
  kind: "percentage" | "fixed";
  value: number; // bps for percentage, minor units for fixed
  currency?: string | null;
  scope: CouponScope;
}

export interface QuoteInput {
  unitAmount: number; // per-seat/per-item minor units
  seats: number;
  currency: string;
  jurisdiction: string;
  planTier: "free" | "learner" | "pro" | "corporate" | "enterprise";
  coupon?: CouponInput;
}

export interface Quote {
  subtotal: number;
  discount: number;
  taxable: number;
  taxRateBps: number;
  tax: number;
  total: number;
  currency: string;
  couponApplied: boolean;
}

/** Half-up rounding for minor-unit money math. */
function roundHalfUp(n: number): number {
  return Math.floor(n + 0.5);
}

/** Returns the discount (minor units) a coupon yields against a subtotal, respecting scope. */
export function applyCoupon(subtotal: number, currency: string, planTier: QuoteInput["planTier"], coupon?: CouponInput): number {
  if (!coupon) return 0;
  // Scope: plan-tier restriction.
  if (coupon.scope.planTiers && !coupon.scope.planTiers.includes(planTier)) return 0;
  // Scope: minimum seats handled by the caller (seats known there); tier check is the pure part.
  if (coupon.kind === "percentage") {
    return Math.min(subtotal, roundHalfUp((subtotal * coupon.value) / 10000));
  }
  // fixed: only applies in the matching currency
  if (coupon.currency && coupon.currency !== currency) return 0;
  return Math.min(subtotal, coupon.value);
}

export function computeQuote(input: QuoteInput): Quote {
  const subtotal = input.unitAmount * input.seats;
  const discount = applyCoupon(subtotal, input.currency, input.planTier, input.coupon);
  const taxable = subtotal - discount;
  const taxRateBps = taxRateFor(input.jurisdiction);
  const tax = roundHalfUp((taxable * taxRateBps) / 10000);
  return {
    subtotal,
    discount,
    taxable,
    taxRateBps,
    tax,
    total: taxable + tax,
    currency: input.currency,
    couponApplied: discount > 0,
  };
}
