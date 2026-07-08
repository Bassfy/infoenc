import { describe, expect, it } from "vitest";
import { computeQuote, applyCoupon, taxRateFor } from "./pricing.js";

/**
 * Money-path tests (Phase 1 doc 08 §7 — ≥90% branch on billing). Locks tax rates, coupon scoping,
 * rounding, and the full quote assembly against regressions.
 */
describe("pricing", () => {
  it("resolves VAT rates by jurisdiction with a safe default", () => {
    expect(taxRateFor("SA")).toBe(1500);
    expect(taxRateFor("EG")).toBe(1400);
    expect(taxRateFor("AE")).toBe(500);
    expect(taxRateFor("ZZ")).toBe(0); // unknown → default
  });

  it("computes a KSA quote with 15% VAT (minor units)", () => {
    const q = computeQuote({
      unitAmount: 4999,
      seats: 1,
      currency: "SAR",
      jurisdiction: "SA",
      planTier: "pro",
    });
    expect(q.subtotal).toBe(4999);
    expect(q.discount).toBe(0);
    expect(q.taxRateBps).toBe(1500);
    expect(q.tax).toBe(750); // 4999 * 0.15 = 749.85 → half-up 750
    expect(q.total).toBe(5749);
  });

  it("applies a percentage coupon before tax", () => {
    const q = computeQuote({
      unitAmount: 10000,
      seats: 1,
      currency: "USD",
      jurisdiction: "AE",
      planTier: "learner",
      coupon: { kind: "percentage", value: 2000, scope: {} }, // 20%
    });
    expect(q.discount).toBe(2000);
    expect(q.taxable).toBe(8000);
    expect(q.tax).toBe(400); // 8000 * 5%
    expect(q.total).toBe(8400);
    expect(q.couponApplied).toBe(true);
  });

  it("ignores a fixed coupon in a non-matching currency", () => {
    expect(applyCoupon(10000, "USD", "pro", { kind: "fixed", value: 1500, currency: "SAR", scope: {} })).toBe(0);
    expect(applyCoupon(10000, "SAR", "pro", { kind: "fixed", value: 1500, currency: "SAR", scope: {} })).toBe(1500);
  });

  it("ignores a coupon scoped to other plan tiers", () => {
    const d = applyCoupon(10000, "USD", "learner", {
      kind: "percentage",
      value: 5000,
      scope: { planTiers: ["pro"] },
    });
    expect(d).toBe(0);
  });

  it("never discounts below zero (clamps to subtotal)", () => {
    expect(applyCoupon(1000, "USD", "pro", { kind: "fixed", value: 5000, scope: {} })).toBe(1000);
  });

  it("multiplies by seats for corporate", () => {
    const q = computeQuote({
      unitAmount: 3900,
      seats: 20,
      currency: "USD",
      jurisdiction: "DEFAULT",
      planTier: "corporate",
    });
    expect(q.subtotal).toBe(78000);
    expect(q.total).toBe(78000); // no tax in default jurisdiction
  });
});
