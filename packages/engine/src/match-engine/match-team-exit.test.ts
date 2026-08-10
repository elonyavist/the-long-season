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

test("losing the goalkeeper costs the goalkeeper department", () => {
  // The whole point. Until Step 07A `strength` was left describing the keeper
  // who had just been sent off, so a centre-back in goal saved like an
  // international and a red card to the goalkeeper cost a manager nothing.
  const context = matchContext();
  const updated = removeForcedOffPlayerFromMatchContext(context, "home", playerId("player:home-gk"));

  // The promoted midfielder is 6.5 at goalkeeping against the specialist's 15.
  assert.equal(updated.home.strength.goalkeeper, 10 * (6.5 / 15));
  assert.ok(updated.home.strength.goalkeeper < context.home.strength.goalkeeper);
});

test("only the goalkeeper department moves, and only for a goalkeeper exit", () => {
  const context = matchContext();
  const keeperGone = removeForcedOffPlayerFromMatchContext(context, "home", playerId("player:home-gk"));
  const defenderGone = removeForcedOffPlayerFromMatchContext(context, "home", playerId("player:home-field"));

  assert.equal(keeperGone.home.strength.attack, context.home.strength.attack);
  assert.equal(keeperGone.home.strength.defense, context.home.strength.defense);
  assert.deepEqual(defenderGone.home.strength, context.home.strength);
  assert.deepEqual(keeperGone.away.strength, context.away.strength);
});

test("an equal replacement changes nothing", () => {
  // A bench keeper of the same quality is not a punishment, so the correction
  // has to be a comparison rather than a flat penalty for the shirt changing.
  const context = matchContext({ emergencyGoalkeeping: [15, 15] });
  const updated = removeForcedOffPlayerFromMatchContext(context, "home", playerId("player:home-gk"));

  assert.equal(updated.home.strength.goalkeeper, context.home.strength.goalkeeper);
});

test("a player with no goalkeeping at all is still not an empty net", () => {
  const context = matchContext({ emergencyGoalkeeping: [0, 0] });
  const updated = removeForcedOffPlayerFromMatchContext(context, "home", playerId("player:home-gk"));

  assert.equal(updated.home.strength.goalkeeper, 10 * 0.35);
  assert.ok(updated.home.strength.goalkeeper > 0, "somebody is standing in the goal");
});

/** What a case varies about the fixture; anything unset is ordinary. */
interface MatchContextOptions {
  /** Reflexes and handling of the outfield player who takes the gloves. */
  readonly emergencyGoalkeeping?: readonly [number, number];
}

function matchContext(options: MatchContextOptions = {}): MatchContext {
  const home = team("home", options);
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

function team(side: "home" | "away", options: MatchContextOptions = {}): MatchTeamContext {
  const [emergencyReflexes, emergencyHandling] = options.emergencyGoalkeeping ?? [6, 7];
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
      incidentProfile(emergency, emergencyReflexes, emergencyHandling),
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
    finishing: 10,
    passing: 10,
    crossing: 10,
    dribbling: 10,
    technique: 10,
    tackling: 10,
    freeKicks: 10,
    pace: 10,
    heading: 10,
    vision: 10,
    anticipation: 10,
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
