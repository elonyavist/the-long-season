import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  gameDate,
  playerId,
  stateValue,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

import {
  deriveTeamStrength,
  TeamStrengthError,
  type DeriveTeamStrengthInput,
  type LineupSlot,
  type RoleWeightProfile,
} from "./team-strength.ts";

/**
 * Team-strength tests lock down pure aggregate strength calculation before
 * match events or goals exist.
 */

test("stronger ability values produce higher strength", () => {
  const weakInput = onePlayerInput(makePlayer(playerId("player:000001"), 8));
  const strongInput = onePlayerInput(makePlayer(playerId("player:000001"), 14));

  assert.equal(deriveTeamStrength(strongInput).overall > deriveTeamStrength(weakInput).overall, true);
});

test("department weights affect the correct department", () => {
  const strikerId = playerId("player:000001");
  const defenderId = playerId("player:000002");
  const input: DeriveTeamStrengthInput = {
    lineup: [
      { slotId: "slot:st", playerId: strikerId, roleKey: "striker" },
      { slotId: "slot:cb", playerId: defenderId, roleKey: "centre-back" },
    ],
    players: {
      [strikerId]: makePlayer(strikerId, 12, { finishing: 18, tackling: 4 }),
      [defenderId]: makePlayer(defenderId, 12, { finishing: 4, tackling: 18 }),
    },
    roleWeights: {
      striker: {
        roleKey: "striker",
        department: "attack",
        abilityWeights: {
          "technical.finishing": 1,
        },
      },
      "centre-back": {
        roleKey: "centre-back",
        department: "defense",
        abilityWeights: {
          "technical.tackling": 1,
        },
      },
    },
  };

  const strength = deriveTeamStrength(input);

  assert.equal(strength.attack, 18);
  assert.equal(strength.defense, 18);
  assert.equal(strength.midfield, 0);
});

test("input arrays are not mutated", () => {
  const input = onePlayerInput(makePlayer(playerId("player:000001"), 10));
  const lineupBefore = [...input.lineup];

  deriveTeamStrength(input);

  assert.deepEqual(input.lineup, lineupBefore);
});

test("missing player or missing role weight fails with a typed error", () => {
  const valid = onePlayerInput(makePlayer(playerId("player:000001"), 10));

  assert.throws(
    () =>
      deriveTeamStrength({
        ...valid,
        players: {},
      }),
    (error: unknown) => error instanceof TeamStrengthError && error.code === "missing_player",
  );

  assert.throws(
    () =>
      deriveTeamStrength({
        ...valid,
        roleWeights: {},
      }),
    (error: unknown) => error instanceof TeamStrengthError && error.code === "missing_role_weight",
  );
});

test("repeated calls with the same input return the same result", () => {
  const input = onePlayerInput(makePlayer(playerId("player:000001"), 11));

  assert.deepEqual(deriveTeamStrength(input), deriveTeamStrength(input));
});

test("dynamic state multipliers apply only when curve data is supplied", () => {
  const id = playerId("player:000001");
  const input = onePlayerInput(makePlayer(id, 10));
  const playerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = {
    [id]: {
      fitness: stateValue(40),
      form: stateValue(50),
      morale: stateValue(50),
    },
  };

  assert.equal(deriveTeamStrength({ ...input, playerStates }).overall, 10);
  assert.equal(
    deriveTeamStrength({
      ...input,
      playerStates,
      stateMultiplierCurves: {
        fitness: [
          { maxValueInclusive: 49, multiplier: 0.8 },
          { maxValueInclusive: 100, multiplier: 1 },
        ],
      },
    }).overall,
    8,
  );
});

test("full fitness keeps strength unchanged when a fitness curve is supplied", () => {
  const id = playerId("player:000001");
  const input = onePlayerInput(makePlayer(id, 10));
  const playerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = {
    [id]: {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    },
  };

  assert.equal(
    deriveTeamStrength({
      ...input,
      playerStates,
      stateMultiplierCurves: {
        fitness: [
          { maxValueInclusive: 59, multiplier: 0.94 },
          { maxValueInclusive: 100, multiplier: 1 },
        ],
      },
    }).overall,
    10,
  );
});

test("missing player state fails when multiplier curves are supplied", () => {
  const id = playerId("player:000001");
  const input = onePlayerInput(makePlayer(id, 10));

  assert.throws(
    () =>
      deriveTeamStrength({
        ...input,
        stateMultiplierCurves: {
          fitness: [
            { maxValueInclusive: 100, multiplier: 1 },
          ],
        },
      }),
    (error: unknown) => error instanceof TeamStrengthError && error.code === "missing_player_state",
  );
});

/**
 * Builds the smallest valid one-player input for role-score tests.
 */
function onePlayerInput(player: Player): DeriveTeamStrengthInput {
  const lineup: readonly LineupSlot[] = [{ slotId: "slot:one", playerId: player.id, roleKey: "balanced" }];
  const roleWeights: Readonly<Record<string, RoleWeightProfile>> = {
    balanced: {
      roleKey: "balanced",
      department: "midfield",
      abilityWeights: {
        "technical.passing": 1,
      },
    },
  };

  return {
    lineup,
    players: {
      [player.id]: player,
    },
    roleWeights,
  };
}

/**
 * Builds a player with repeated abilities and optional targeted overrides.
 */
function makePlayer(
  id: PlayerId,
  baseAbility: number,
  overrides: { readonly finishing?: number; readonly tackling?: number } = {},
): Player {
  const abilities = abilitySet(baseAbility, overrides);

  return {
    id,
    firstName: "Test",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions: ["cm"],
    abilities,
    potential: abilities,
  };
}

/**
 * Builds a complete 25-attribute ability object for test players.
 */
function abilitySet(
  value: number,
  overrides: { readonly finishing?: number; readonly tackling?: number } = {},
): PlayerAbilities {
  const ability = abilityValue(value);

  return {
    technical: {
      finishing: abilityValue(overrides.finishing ?? value),
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: abilityValue(overrides.tackling ?? value),
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}
