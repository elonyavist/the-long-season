import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import { attributeGoal, goalScorerWeightForRole } from "./goal-attribution.ts";
import type { MatchTeamContext } from "./match-context.ts";

/**
 * Goal-attribution tests prove that scorer selection is deterministic, local to
 * the scoring lineup, and weighted without changing match scoring algorithms.
 */

test("same goal key attributes the same scorer", () => {
  const first = attributeGoal({
    seed: "demo-001",
    fixtureId: fixtureId("fixture:goal-attribution"),
    minute: 34,
    side: "home",
    scoreBeforeGoal: { home: 1, away: 0 },
    team: team("home"),
  });
  const second = attributeGoal({
    seed: "demo-001",
    fixtureId: fixtureId("fixture:goal-attribution"),
    minute: 34,
    side: "home",
    scoreBeforeGoal: { home: 1, away: 0 },
    team: team("home"),
  });

  assert.deepEqual(first, second);
});

test("attributed scorer always belongs to the scoring side lineup", () => {
  const scoringTeam = team("away");
  const attribution = attributeGoal({
    seed: "demo-001",
    fixtureId: fixtureId("fixture:away-goal"),
    minute: 77,
    side: "away",
    scoreBeforeGoal: { home: 2, away: 2 },
    team: scoringTeam,
  });
  const lineupPlayerIds = scoringTeam.lineup.map((slot) => slot.playerId);

  assert.ok(lineupPlayerIds.includes(attribution.scorerPlayerId));
});

test("role scorer weights favor attackers and keep goalkeepers near zero", () => {
  assert.ok(goalScorerWeightForRole("attacker") > goalScorerWeightForRole("midfielder"));
  assert.ok(goalScorerWeightForRole("midfielder") > goalScorerWeightForRole("defender"));
  assert.ok(goalScorerWeightForRole("defender") > goalScorerWeightForRole("gk"));
  assert.equal(goalScorerWeightForRole("custom-role"), 1);
});

test("single-player synthetic lineups can still receive attribution", () => {
  const attribution = attributeGoal({
    seed: "demo-001",
    fixtureId: fixtureId("fixture:single-gk"),
    minute: 12,
    side: "home",
    scoreBeforeGoal: { home: 0, away: 0 },
    team: {
      ...team("home"),
      lineup: [{ slotId: "slot:home:gk", playerId: playerId("player:home-gk"), roleKey: "gk" }],
    },
  });

  assert.equal(attribution.scorerPlayerId, playerId("player:home-gk"));
});

/**
 * Builds one team context fixture with explicit role variety.
 */
function team(side: "home" | "away"): MatchTeamContext {
  return {
    clubId: clubId(`club:${side}`),
    lineup: [
      { slotId: `slot:${side}:gk`, playerId: playerId(`player:${side}-gk`), roleKey: "gk" },
      { slotId: `slot:${side}:def`, playerId: playerId(`player:${side}-def`), roleKey: "defender" },
      { slotId: `slot:${side}:mid`, playerId: playerId(`player:${side}-mid`), roleKey: "midfielder" },
      { slotId: `slot:${side}:att`, playerId: playerId(`player:${side}-att`), roleKey: "attacker" },
    ],
    strength: {
      attack: 12,
      midfield: 12,
      defense: 12,
      goalkeeper: 12,
      overall: 12,
    },
    tacticalDistribution: {
      directness: 0,
      pressing: 0,
      width: 0,
      risk: 0,
    },
  };
}
