import assert from "node:assert/strict";
import { test } from "vitest";

import type { MatchEngineConfig } from "@game/engine";

import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";

import {
  buildTacticalAgencyConditionedResponses,
  buildTacticalAgencyStructuralActions,
  runTacticalAgencyConditionedAnalyticPartition,
} from "./tactical-agency-audit.ts";
import {
  decideTacticalAgencyConditionedOwner,
  firstCoherentTacticalAgencyComponent,
  summarizeTacticalAgencyConditionedAttribution,
} from "./tactical-agency-attribution.ts";

test("B2.1 reconciles canonical payoff factors and groups retained matchup facts", () => {
  const calibration = matchTacticsCalibrationFixture();
  const actions = buildTacticalAgencyStructuralActions({
    referenceBand: {
      bandKey: "b2_1_attribution",
      goalkeeper: 10,
      defense: 10,
      midfield: 10,
      attack: 10,
    },
    matchTacticsCalibration: calibration,
  });
  const own = actions.find(({ formationKey }) => formationKey === "4-4-2");
  const opponent = actions.find(({ formationKey }) => formationKey === "3-5-2");
  if (own === undefined || opponent === undefined) throw new Error("B2.1 test formations missing");
  const responses = buildTacticalAgencyConditionedResponses();
  const matchups = [{
    matchupId: "b2-1-world|competition:test|fixture:test|home",
    worldSeed: "b2-1-world",
    competitionId: "competition:test",
    ownClubId: "club:home",
    opponentClubId: "club:away",
    ownIdentityKey: "identity:home",
    opponentIdentityKey: "identity:away",
    ownFormationKey: "4-4-2",
    opponentFormationKey: "3-5-2",
    ownShape: own.shape,
    opponentShape: opponent.shape,
  }];
  const contexts = runTacticalAgencyConditionedAnalyticPartition({
    responses,
    matchups,
    contextIndexes: responses.map((_, index) => index),
    engineConfig: engineConfig(),
    matchTacticsCalibration: calibration,
  });
  const attribution = summarizeTacticalAgencyConditionedAttribution({
    responses,
    matchups,
    contexts,
  });

  assert.equal(attribution.matchupCount, 1);
  assert.equal(attribution.contextCount, 9);
  assert.equal(attribution.reconciliationMismatchCount, 0);
  assert.equal(attribution.byFormationPair[0]?.groupKey, "4-4-2|3-5-2");
  assert.equal(attribution.withinTactic.every(({ contextCount }) => contextCount === 9), true);
  assert.equal(attribution.withinFocus.every(({ contextCount }) => contextCount === 9), true);
  assert.equal(
    Object.values(attribution.exactResponseCoverage).reduce((sum, count) => sum + count, 0),
    9,
  );
});

test("B2.1 owner and component decisions require the same signal in both sets", () => {
  const base = emptyAttribution();
  const tactic = { ...base, tacticMagnitudeRuleHeld: true };
  const lateral = { ...base, lateralRouteLeverageRuleHeld: true };
  const positive = {
    ...base,
    coherentPositiveComponentKeys: ["control" as const],
  };

  assert.equal(decideTacticalAgencyConditionedOwner([tactic, tactic]), "tactic_magnitude");
  assert.equal(decideTacticalAgencyConditionedOwner([tactic, lateral]), "mixed");
  assert.equal(decideTacticalAgencyConditionedOwner([base, base]), "unresolved");
  assert.equal(firstCoherentTacticalAgencyComponent([positive, positive]), "control");
  assert.equal(firstCoherentTacticalAgencyComponent([positive, base]), "none");
});

function emptyAttribution(): ReturnType<typeof summarizeTacticalAgencyConditionedAttribution> {
  return {
    matchupCount: 0,
    materiallyAsymmetricMatchupCount: 0,
    contextCount: 0,
    reconciliationMismatchCount: 0,
    exactResponseCoverage: {},
    exactLeadingResponseId: "none",
    exactLeadingResponseShare: 0,
    byOwnFormation: [],
    byOpponentFormation: [],
    byFormationPair: [],
    byOpponentResponse: [],
    withinTactic: [],
    withinFocus: [],
    componentWorldRows: [],
    coherentPositiveComponentKeys: [],
    coherentNegativeComponentKeys: [],
    lateralRouteLeverageRuleHeld: false,
    tacticMagnitudeRuleHeld: false,
    interactionRuleHeld: false,
  };
}

function engineConfig(): MatchEngineConfig {
  return {
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  } as MatchEngineConfig;
}
