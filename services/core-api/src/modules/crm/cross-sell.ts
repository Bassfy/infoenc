/**
 * Cross-sell opportunity detection (doc 03 §4, FR-CO-054) — the assess↔train flywheel, extracted
 * as a pure function so it is unit-testable and explainable (the sales team must trust the flag).
 */

export interface CrossSellOpportunity {
  direction: "assess_to_train" | "train_to_assess";
  reason: string;
  suggestedAction: string;
}

export interface CrossSellInput {
  isClient: boolean;
  isBusiness: boolean;
  hasSubscription: boolean;
  hasCompletedEngagement: boolean;
  openFindingCount: number;
}

export function detectCrossSell(input: CrossSellInput): CrossSellOpportunity[] {
  const ops: CrossSellOpportunity[] = [];

  // Assess → train: a services client with unresolved findings and no training is a corporate
  // Academy lead targeting exactly the gaps the engagement found.
  if (input.isClient && input.hasCompletedEngagement && input.openFindingCount > 0 && !input.hasSubscription) {
    ops.push({
      direction: "assess_to_train",
      reason: `${input.openFindingCount} open findings from a completed engagement; no academy training in place`,
      suggestedAction: "Propose a corporate Academy plan targeting the weak areas (20% first-year discount)",
    });
  }

  // Train → assess: a corporate training customer with no services relationship is an assessment lead.
  if (input.isBusiness && input.hasSubscription && !input.isClient) {
    ops.push({
      direction: "train_to_assess",
      reason: "Active corporate training customer with no services engagement",
      suggestedAction: "Offer a scoped assessment at preferred (training-customer) rates",
    });
  }

  return ops;
}
