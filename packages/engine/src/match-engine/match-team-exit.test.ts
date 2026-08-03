import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import type { MatchContext, MatchPlayerIncidentProfile, MatchTeamContext } from "./match-context.ts";
import { removeForcedOffPlayerFromMatchContext } from "./match-team-exit.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";


test("a forced-off goalkeeper promotes the strongest remaining emergency option", () => {
  const context = matchContext();
  const updated = removeForcedOffPlayerFromMatchContext(context, "home", playerId("player:home-gk"));

  assert.equal(updated.home.lineup.length, 2);
  assert.equal(updated.home.lineup.some((slot) => slot.playerId === playerId("player:home-gk")), false);
  assert.deepEqual(
    updated.home.lineup.filter((slot) => slot.canonicalRole === "goalkeeper").map((slot) => slot.playerId),
    [playerId("player:home-emergency")],
  );
  assert.deepEqual(
    updated.home.incidentProfiles?.map((profile) => profile.playerId),
    [playerId("player:home-field"), playerId("player:home-emergency")],
  );
});

function matchContext(): MatchContext {
  const home = team("home");
  const away = team("away");
  return {
    fixtureId: fixtureId("fixture:emergency-goalkeeper"),
    seed: "emergency-goalkeeper",
    home,
    away,
    engineConfig: {
      minuteCount: 90,
      rates: { baseOpportunityRatePerMinute: 0.08, maxOpportunityRatePerMinute: 0.4 },
      conversionBands: [{ bandKey: "all", minQualityInclusive: 0, maxQualityExclusive: 1, goalProbability: 0.1 }],
      homeAdvantageFactor: 1,
      tacticalDistributionCaps: {
        directness: { minInclusive: 0, maxInclusive: 1 },
        pressing: { minInclusive: 0, maxInclusive: 1 },
        width: { minInclusive: 0, maxInclusive: 1 },
        risk: { minInclusive: 0, maxInclusive: 1 },
      },
    },
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
}

function team(side: "home" | "away"): MatchTeamContext {
  const goalkeeper = playerId(`player:${side}-gk`);
  const field = playerId(`player:${side}-field`);
  const emergency = playerId(`player:${side}-emergency`);
  return {
    clubId: clubId(`club:${side}`),
    lineup: [
      createLineupSlot({ slotId: `${side}:gk`, playerId: goalkeeper, canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: `${side}:field`, playerId: field, canonicalRole: "center_back" }),
      createLineupSlot({ slotId: `${side}:emergency`, playerId: emergency, canonicalRole: "central_midfielder" }),
    ],
    incidentProfiles: [
      incidentProfile(goalkeeper, 15, 15),
      incidentProfile(field, 3, 4),
      incidentProfile(emergency, 6, 7),
    ],
    strength: { attack: 10, midfield: 10, defense: 10, goalkeeper: 10, overall: 10 },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
  };
}

function incidentProfile(
  id: ReturnType<typeof playerId>,
  goalkeeperReflexes: number,
  goalkeeperHandling: number,
): MatchPlayerIncidentProfile {
  return {
    playerId: id,
    tackling: 10,
    composure: 10,
    determination: 10,
    stamina: 10,
    agility: 10,
    strength: 10,
    penalties: 10,
    goalkeeperReflexes,
    goalkeeperHandling,
    startingFitness: 100,
  };
}
