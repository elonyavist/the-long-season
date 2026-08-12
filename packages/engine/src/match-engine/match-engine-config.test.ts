import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import { matchDisciplineConfigFixture } from "../test-fixtures/match-engine-config.ts";
import { matchTacticsCalibrationFixture, tacticalShapeProfileFixture } from "../test-fixtures/match-tactics-calibration.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";
import type { MatchContext, MatchTeamContext } from "./match-context.ts";
import { resolveMatchMinuteDiscipline } from "./match-discipline.ts";
import { isValidMatchEngineConfig, type MatchEngineConfig } from "./match-engine-config.ts";
import { createInitialMatchSimulationState, telemetryFor } from "./match-simulation-state.ts";
import { createLineupSlot } from "./team-strength.ts";

test("discipline calibration is required, versioned, integral, and interior", () => {
  assert.equal(isValidMatchEngineConfig(engineConfig()), true);
  assert.equal(isValidMatchEngineConfig({ ...engineConfig(), discipline: undefined } as never), false);

  for (const discipline of [
    matchDisciplineConfigFixture({ version: " " }),
    matchDisciplineConfigFixture({ penaltyAwardProbabilityAfterDangerousFoulBasisPoints: 0 }),
    matchDisciplineConfigFixture({ penaltyAwardProbabilityAfterDangerousFoulBasisPoints: 10_000 }),
    matchDisciplineConfigFixture({ penaltyAwardProbabilityAfterDangerousFoulBasisPoints: 3_500.5 }),
    matchDisciplineConfigFixture({ directFreeKickShotProbabilityBasisPoints: 0 }),
    matchDisciplineConfigFixture({ directFreeKickMinimumZoneDangerBasisPoints: 10_000 }),
    matchDisciplineConfigFixture({ directFreeKickBaseGoalProbabilityBasisPoints: 0 }),
    matchDisciplineConfigFixture({ directFreeKickReferenceTakerAbility: 21 }),
    matchDisciplineConfigFixture({ directFreeKickTakerAbilityStepBasisPoints: 0 }),
    matchDisciplineConfigFixture({ directFreeKickReferenceGoalkeeperReflexes: 0 }),
    matchDisciplineConfigFixture({ directFreeKickGoalkeeperAbilityStepBasisPoints: 0 }),
    matchDisciplineConfigFixture({
      directFreeKickMinimumGoalProbabilityBasisPoints: 1_300,
      directFreeKickMaximumGoalProbabilityBasisPoints: 250,
    }),
  ]) {
    assert.equal(isValidMatchEngineConfig({ ...engineConfig(), discipline }), false);
  }
});

test("the 3500 candidate adds reachable awards without changing shared penalty outcomes", () => {
  let addedAwardCount = 0;
  let sharedAwardCount = 0;
  let nonAwardCount = 0;

  for (let index = 0; index < 30_000; index += 1) {
    const seed = `penalty-reachability-${String(index).padStart(5, "0")}`;
    const oldSimulation = simulation(seed, 3_000);
    const newSimulation = simulation(seed, 3_500);
    const oldResult = resolveMatchMinuteDiscipline(oldSimulation, telemetryFor(oldSimulation), 54, "away");
    const newResult = resolveMatchMinuteDiscipline(newSimulation, telemetryFor(newSimulation), 54, "away");

    if (oldResult.penalty !== undefined && newResult.penalty !== undefined) {
      sharedAwardCount += 1;
      assert.deepEqual(newResult.penalty, oldResult.penalty);
    } else if (oldResult.penalty === undefined && newResult.penalty !== undefined) {
      addedAwardCount += 1;
    } else if (oldResult.penalty === undefined && newResult.penalty === undefined) {
      nonAwardCount += 1;
    } else {
      assert.fail("the higher candidate cannot remove an award reached by the lower arm");
    }
  }

  assert.ok(sharedAwardCount > 0);
  assert.ok(addedAwardCount > 0);
  assert.ok(nonAwardCount > 0);
});

test("real match seeds reach the complete direct-free-kick decision and outcome path", () => {
  const outcomes = new Set<string>();
  let selectedCount = 0;
  let notSelectedDangerousFoulCount = 0;
  let penaltyPrecedenceCount = 0;
  let higherAbilityAddedGoalCount = 0;

  for (let index = 0; index < 60_000; index += 1) {
    const seed = `direct-free-kick-reachability-${String(index).padStart(5, "0")}`;
    const lowSimulation = simulation(seed, 3_500, 8);
    const highSimulation = simulation(seed, 3_500, 20);
    const low = resolveMatchMinuteDiscipline(lowSimulation, telemetryFor(lowSimulation), 54, "away");
    const high = resolveMatchMinuteDiscipline(highSimulation, telemetryFor(highSimulation), 54, "away");
    const foul = high.events.find((event) => event.type === "foul");

    if (high.penalty !== undefined) {
      penaltyPrecedenceCount += 1;
      assert.equal(high.directFreeKick, undefined);
    } else if (high.directFreeKick !== undefined) {
      selectedCount += 1;
      outcomes.add(high.directFreeKick.outcome);
      assert.equal(high.directFreeKick.takerPlayerId, playerId("player:home-st"));
      if (low.directFreeKick !== undefined) {
        assert.ok(high.directFreeKick.expectedGoals > low.directFreeKick.expectedGoals);
        if (low.directFreeKick.outcome !== "scored" && high.directFreeKick.outcome === "scored") {
          higherAbilityAddedGoalCount += 1;
        }
        assert.ok(!(low.directFreeKick.outcome === "scored" && high.directFreeKick.outcome !== "scored"));
      }
    } else if (foul?.type === "foul" && foul.zoneDanger >= 0.8) {
      notSelectedDangerousFoulCount += 1;
    }
  }

  assert.deepEqual([...outcomes].sort(), ["missed", "saved", "scored"]);
  assert.ok(selectedCount > 0);
  assert.ok(notSelectedDangerousFoulCount > 0);
  assert.ok(penaltyPrecedenceCount > 0);
  assert.ok(higherAbilityAddedGoalCount > 0);
});

function simulation(seed: string, awardBasisPoints: number, strikerFreeKicks = 10) {
  const context: MatchContext = {
    fixtureId: fixtureId("fixture:penalty-reachability"),
    seed,
    home: team("home", strikerFreeKicks),
    away: team("away"),
    engineConfig: engineConfig(awardBasisPoints),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
  return createInitialMatchSimulationState(context);
}

function team(side: "home" | "away", strikerFreeKicks = 10): MatchTeamContext {
  const lineup = [
    createLineupSlot({ slotId: `${side}:gk`, playerId: playerId(`player:${side}-gk`), canonicalRole: "goalkeeper" }),
    createLineupSlot({ slotId: `${side}:cb`, playerId: playerId(`player:${side}-cb`), canonicalRole: "center_back" }),
    createLineupSlot({ slotId: `${side}:st`, playerId: playerId(`player:${side}-st`), canonicalRole: "striker" }),
  ];
  const teamWithProfiles = withNeutralIncidentProfiles({
    clubId: clubId(`club:${side}`),
    lineup,
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
  });
  return {
    ...teamWithProfiles,
    incidentProfiles: teamWithProfiles.incidentProfiles.map((profile) => ({
      ...profile,
      freeKicks: profile.playerId === playerId(`player:${side}-st`) ? strikerFreeKicks : 5,
    })),
  };
}

function engineConfig(awardBasisPoints = 3_500): MatchEngineConfig {
  const cap = { minInclusive: 0, maxInclusive: 1 };
  return {
    minuteCount: 90,
    rates: { baseOpportunityRatePerMinute: 0.1, maxOpportunityRatePerMinute: 0.3 },
    conversionBands: [{ bandKey: "all", minQualityInclusive: 0, maxQualityExclusive: 1.01, goalProbability: 0.1 }],
    homeAdvantageFactor: 1,
    strengthGapMultiplier: 1,
    discipline: matchDisciplineConfigFixture({
      penaltyAwardProbabilityAfterDangerousFoulBasisPoints: awardBasisPoints,
    }),
    tacticalDistributionCaps: { directness: cap, pressing: cap, width: cap, risk: cap },
  };
}
