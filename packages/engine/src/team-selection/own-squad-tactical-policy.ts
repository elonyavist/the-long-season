import {
  LATERAL_FOCUSES,
  TACTICAL_SHAPE_CAPACITIES,
  type LateralFocus,
  type OwnSquadTacticProfileConfig,
  type OwnSquadTacticalPolicyConfig,
  type TacticalShapeCapacity,
} from "@game/domain";

import type { MatchTacticalDistributionInput } from "../match-engine/match-context.ts";
import type { TacticalShapeProfile } from "../match-engine/tactical-shape.ts";

/** Stable identity of one complete own-squad tactical policy. */
export type OwnSquadTacticalPolicyId = `${OwnSquadTacticProfileConfig["profileKey"]}:${LateralFocus}`;

/** Explainable fit facts for one profile/focus candidate. */
export interface OwnSquadTacticalPolicyCandidate {
  readonly policyId: OwnSquadTacticalPolicyId;
  readonly profileKey: OwnSquadTacticProfileConfig["profileKey"];
  readonly tactic: MatchTacticalDistributionInput;
  readonly lateralFocus: LateralFocus;
  readonly profileFit: number;
  readonly lateralFit: number;
  readonly totalFit: number;
}

/** Complete evaluation; audits never rebuild alternatives after selection. */
export interface OwnSquadTacticalPolicyEvaluation {
  readonly candidates: readonly OwnSquadTacticalPolicyCandidate[];
  readonly ownFit: OwnSquadTacticalPolicyCandidate;
  readonly mismatch: OwnSquadTacticalPolicyCandidate;
  readonly nonCommit: OwnSquadTacticalPolicyCandidate;
  readonly blind: OwnSquadTacticalPolicyCandidate;
  readonly tiedAtBestCount: number;
}

/**
 * Ranks tactics only by capacities the selected eleven can currently execute.
 *
 * There is deliberately no opponent argument and no result estimate. Fitness
 * reaches these capacities through the canonical team derivation; inactive raw
 * form/morale values do not get a private AI-only meaning here.
 */
export function evaluateOwnSquadTacticalPolicies(input: {
  readonly shape: TacticalShapeProfile;
  readonly policy: OwnSquadTacticalPolicyConfig;
}): OwnSquadTacticalPolicyEvaluation {
  const profileShare = input.policy.profileFitShareBasisPoints / 10_000;
  const candidates = input.policy.profiles.flatMap((profile) =>
    LATERAL_FOCUSES.map((lateralFocus): OwnSquadTacticalPolicyCandidate => {
      const rawProfileFit = weightedProfileFit(input.shape.capacities, profile);
      // A near-equivalent committed plan should not displace the genuine
      // non-commitment option merely because of floating-point-scale noise.
      // Content owns how much own-squad advantage is needed to commit.
      const profileFit = profile.profileKey === "balanced"
        ? rawProfileFit
        : rawProfileFit * (1 - input.policy.minimumCommitmentAdvantageBasisPoints / 10_000);
      const rawLateralFit = focusFit(input.shape.capacities, lateralFocus);
      const lateralFit = lateralFocus === "balanced"
        ? rawLateralFit
        : rawLateralFit * (1 - input.policy.minimumLateralFocusAdvantageBasisPoints / 10_000);
      return {
        policyId: `${profile.profileKey}:${lateralFocus}`,
        profileKey: profile.profileKey,
        tactic: profile.tactic,
        lateralFocus,
        profileFit,
        lateralFit,
        totalFit: profileFit * profileShare + lateralFit * (1 - profileShare),
      };
    }),
  ).toSorted(compareStablePolicyId);

  const ranked = candidates.toSorted(compareCandidateFit);
  const ownFit = requiredCandidate(ranked[0]);
  const mismatch = requiredCandidate(ranked.at(-1));
  const nonCommit = requiredPolicy(candidates, "balanced:balanced");
  const blind = requiredPolicy(candidates, "balanced:left");

  return {
    candidates,
    ownFit,
    mismatch,
    nonCommit,
    blind,
    tiedAtBestCount: candidates.filter((candidate) => candidate.totalFit === ownFit.totalFit).length,
  };
}

function weightedProfileFit(
  capacities: Readonly<Record<TacticalShapeCapacity, number>>,
  profile: OwnSquadTacticProfileConfig,
): number {
  let total = 0;
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    total += capacities[capacity] * profile.demandBasisPointsByCapacity[capacity] / 10_000;
  }
  return total;
}

function focusFit(
  capacities: Readonly<Record<TacticalShapeCapacity, number>>,
  focus: LateralFocus,
): number {
  const left = (capacities.left_progression + capacities.left_coverage) / 2;
  const right = (capacities.right_progression + capacities.right_coverage) / 2;
  switch (focus) {
    case "left": return left;
    case "right": return right;
    case "balanced": return (Math.min(left, right) + (left + right) / 2) / 2;
  }
}

function compareCandidateFit(
  left: OwnSquadTacticalPolicyCandidate,
  right: OwnSquadTacticalPolicyCandidate,
): number {
  return right.totalFit - left.totalFit || compareStablePolicyId(left, right);
}

function compareStablePolicyId(
  left: OwnSquadTacticalPolicyCandidate,
  right: OwnSquadTacticalPolicyCandidate,
): number {
  return left.policyId.localeCompare(right.policyId);
}

function requiredCandidate(
  candidate: OwnSquadTacticalPolicyCandidate | undefined,
): OwnSquadTacticalPolicyCandidate {
  if (candidate === undefined) throw new Error("Own-squad tactical policy has no candidates");
  return candidate;
}

function requiredPolicy(
  candidates: readonly OwnSquadTacticalPolicyCandidate[],
  policyId: OwnSquadTacticalPolicyId,
): OwnSquadTacticalPolicyCandidate {
  const candidate = candidates.find((row) => row.policyId === policyId);
  if (candidate === undefined) throw new Error(`Own-squad tactical policy is missing ${policyId}`);
  return candidate;
}
