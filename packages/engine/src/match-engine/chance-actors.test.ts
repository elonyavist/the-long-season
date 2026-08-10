import { createLineupSlot } from "./index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import { clubId, fixtureId, playerId } from "@game/domain";

import {
  chanceCreatorWeightForRole,
  chanceShooterWeightForRole,
  primaryDefenderWeightForRole,
  selectChanceActors,
} from "./chance-actors.ts";
import type { MatchTeamContext } from "./match-context.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import {
  neutralIncidentProfilesFor,
  withNeutralIncidentProfiles,
} from "../test-fixtures/match-player-incident-profiles.ts";


/**
 * Chance-actor tests prove that the new causal building block is deterministic,
 * side-correct, and separate from match stepping or durable report changes.
 */

test("same seed and chance context produce the same actors", () => {
  const input = chanceInput();
  const first = selectChanceActors(input);
  const second = selectChanceActors(input);

  assert.deepEqual(first, second);
});

test("chance actors belong to the correct attacking and defending lineups", () => {
  const input = chanceInput();
  const result = selectChanceActors(input);
  const attackingPlayerIds = input.attackingTeam.lineup.map((slot) => slot.playerId);
  const defendingPlayerIds = input.defendingTeam.lineup.map((slot) => slot.playerId);

  assert.equal(attackingPlayerIds.includes(result.creatorPlayerId), true);
  assert.equal(attackingPlayerIds.includes(result.shooterPlayerId), true);
  assert.equal(defendingPlayerIds.includes(result.primaryDefenderPlayerId), true);
  assert.equal(defendingPlayerIds.includes(result.goalkeeperPlayerId), true);
  assert.equal(attackingPlayerIds.includes(result.primaryDefenderPlayerId), false);
  assert.equal(attackingPlayerIds.includes(result.goalkeeperPlayerId), false);
});

test("attacking goalkeeper is never selected as creator or shooter when outfield players exist", () => {
  for (let minute = 1; minute <= 90; minute += 1) {
    const result = selectChanceActors(chanceInput({ minute }));

    assert.notEqual(result.creatorPlayerId, playerId("player:home-gk"));
    assert.notEqual(result.shooterPlayerId, playerId("player:home-gk"));
  }
});

test("defending goalkeeper must come from the gk lineup slot", () => {
  const result = selectChanceActors(chanceInput());

  assert.equal(result.goalkeeperPlayerId, playerId("player:away-gk"));
});

test("missing defending goalkeeper fails clearly", () => {
  assert.throws(
    () =>
      selectChanceActors(
        chanceInput({
          defendingTeam: {
            ...awayTeamFixture(),
            lineup: awayTeamFixture().lineup.filter((slot) => slot.canonicalRole !== "goalkeeper"),
          },
        }),
      ),
    /without a goalkeeper slot/,
  );
});

test("goalkeeper-only attacking lineups fail instead of selecting an attacking goalkeeper", () => {
  assert.throws(
    () =>
      selectChanceActors(
        chanceInput({
          attackingTeam: {
            ...homeTeamFixture(),
            lineup: [
              createLineupSlot({ slotId: "slot:home-gk", playerId: playerId("player:home-gk"), canonicalRole: "goalkeeper" }),
            ],
          },
        }),
      ),
    /without attacking outfield players/,
  );
});

test("self-created and two-player chances are both reachable", () => {
  let selfCreatedCount = 0;
  let twoPlayerCount = 0;

  for (let minute = 1; minute <= 2_000; minute += 1) {
    const result = selectChanceActors(chanceInput({ minute }));
    if (result.creatorPlayerId === result.shooterPlayerId) selfCreatedCount += 1;
    else twoPlayerCount += 1;
  }

  assert.ok(selfCreatedCount > 0);
  assert.ok(twoPlayerCount > 0);
});

test("role weights favor expected outfield responsibilities and exclude goalkeepers", () => {
  assert.ok(chanceCreatorWeightForRole("midfielder") > chanceCreatorWeightForRole("attacker"));
  assert.ok(chanceShooterWeightForRole("attacker") > chanceShooterWeightForRole("midfielder"));
  assert.ok(primaryDefenderWeightForRole("defender") > primaryDefenderWeightForRole("midfielder"));
  assert.equal(chanceCreatorWeightForRole("gk"), 0);
  assert.equal(chanceShooterWeightForRole("gk"), 0);
  assert.equal(primaryDefenderWeightForRole("gk"), 0);
});

test("creator weights vary by chance type to avoid one fixed creator pool", () => {
  assert.ok(chanceCreatorWeightForRole("attacker", "counter") > chanceCreatorWeightForRole("midfielder", "counter"));
  assert.ok(chanceCreatorWeightForRole("defender", "cross") > chanceCreatorWeightForRole("midfielder", "cross"));
  assert.ok(chanceCreatorWeightForRole("midfielder", "open_play") > chanceCreatorWeightForRole("defender", "open_play"));
  assert.equal(chanceCreatorWeightForRole("gk", "dead_ball"), 0);
});

test("task quality separates two shooters with the same role without deleting either", () => {
  const team = sameRoleQualityTeam("shooter");
  const counts = new Map<string, number>();

  for (let minute = 1; minute <= 20_000; minute += 1) {
    const selected = selectChanceActors(chanceInput({ attackingTeam: team, minute }));
    counts.set(selected.shooterPlayerId, (counts.get(selected.shooterPlayerId) ?? 0) + 1);
  }

  const strong = counts.get("player:home-strong") ?? 0;
  const weak = counts.get("player:home-weak") ?? 0;
  assert.ok(strong > weak, `strong=${strong}; weak=${weak}`);
  assert.ok(weak > 0, "a weak but eligible striker must remain reachable");
});

test("task quality separates two creators with the same role without deleting either", () => {
  const team = sameRoleQualityTeam("creator");
  const counts = new Map<string, number>();

  for (let minute = 1; minute <= 2_000; minute += 1) {
    const selected = selectChanceActors(chanceInput({ attackingTeam: team, minute }));
    counts.set(selected.creatorPlayerId, (counts.get(selected.creatorPlayerId) ?? 0) + 1);
  }

  const strong = counts.get("player:home-strong") ?? 0;
  const weak = counts.get("player:home-weak") ?? 0;
  assert.ok(strong > weak * 1.5, `strong=${strong}; weak=${weak}`);
  assert.ok(weak > 0, "a weak but eligible creator must remain reachable");
});

/**
 * Builds one deterministic chance-actor selection input.
 */
function chanceInput(
  overrides: Partial<Parameters<typeof selectChanceActors>[0]> = {},
): Parameters<typeof selectChanceActors>[0] {
  return {
    seed: "demo-001",
    fixtureId: fixtureId("fixture:chance-000001"),
    minute: 18,
    attackingSide: "home",
    scoreBeforeChance: {
      home: 0,
      away: 0,
    },
    attackingTeam: homeTeamFixture(),
    defendingTeam: awayTeamFixture(),
    chanceType: "open_play",
    ...overrides,
  };
}

/**
 * Builds an attacking-side team fixture with ordered player roles.
 */
function homeTeamFixture(): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId("club:home"),
    lineup: [
      createLineupSlot({ slotId: "slot:home-gk", playerId: playerId("player:home-gk"), canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: "slot:home-def", playerId: playerId("player:home-def"), canonicalRole: "center_back" }),
      createLineupSlot({ slotId: "slot:home-mid", playerId: playerId("player:home-mid"), canonicalRole: "central_midfielder" }),
      createLineupSlot({ slotId: "slot:home-att", playerId: playerId("player:home-att"), canonicalRole: "striker" }),
    ],
    strength: teamStrengthFixture(),
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: tacticalDistributionFixture(),
  });
}

/**
 * Builds a defending-side team fixture with ordered player roles.
 */
function awayTeamFixture(): MatchTeamContext {
  return withNeutralIncidentProfiles({
    clubId: clubId("club:away"),
    lineup: [
      createLineupSlot({ slotId: "slot:away-gk", playerId: playerId("player:away-gk"), canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: "slot:away-def", playerId: playerId("player:away-def"), canonicalRole: "center_back" }),
      createLineupSlot({ slotId: "slot:away-mid", playerId: playerId("player:away-mid"), canonicalRole: "central_midfielder" }),
      createLineupSlot({ slotId: "slot:away-att", playerId: playerId("player:away-att"), canonicalRole: "striker" }),
    ],
    strength: teamStrengthFixture(),
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: tacticalDistributionFixture(),
  });
}

/** Builds two same-role candidates whose only difference is task ability. */
function sameRoleQualityTeam(task: "shooter" | "creator"): MatchTeamContext {
  const canonicalRole = task === "shooter" ? "striker" : "central_midfielder";
  const base = homeTeamFixture();
  const strongPlayerId = playerId("player:home-strong");
  const weakPlayerId = playerId("player:home-weak");
  const lineup = [
    ...base.lineup,
    createLineupSlot({ slotId: "slot:home-strong", playerId: strongPlayerId, canonicalRole }),
    createLineupSlot({ slotId: "slot:home-weak", playerId: weakPlayerId, canonicalRole }),
  ];
  const profiles = neutralIncidentProfilesFor(lineup).map((profile) => {
    if (profile.playerId !== strongPlayerId && profile.playerId !== weakPlayerId) return profile;
    const quality = profile.playerId === strongPlayerId ? 20 : 1;
    return task === "shooter"
      ? {
        ...profile,
        finishing: quality,
        composure: quality,
        technique: quality,
        anticipation: quality,
      }
      : {
        ...profile,
        passing: quality,
        vision: quality,
        technique: quality,
        dribbling: quality,
        anticipation: quality,
      };
  });
  return { ...base, lineup, incidentProfiles: profiles };
}

/**
 * Builds a neutral strength fixture for test team contexts.
 */
function teamStrengthFixture(): MatchTeamContext["strength"] {
  return {
    attack: 10,
    midfield: 10,
    defense: 10,
    goalkeeper: 10,
    overall: 10,
  };
}

/**
 * Builds neutral tactical distribution inputs for test team contexts.
 */
function tacticalDistributionFixture(): MatchTeamContext["tacticalDistribution"] {
  return {
    directness: 0,
    pressing: 0,
    width: 0,
    risk: 0,
    mentality: "balanced",
  };
}
