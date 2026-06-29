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

test("role-relevant improvements move the expected department only", () => {
  const attackerId = playerId("player:000001");
  const defenderId = playerId("player:000002");
  const midfielderId = playerId("player:000003");
  const goalkeeperId = playerId("player:000004");
  const baseInput = departmentInput({
    attacker: makePlayer(attackerId, 10),
    defender: makePlayer(defenderId, 10),
    midfielder: makePlayer(midfielderId, 10),
    goalkeeper: makePlayer(goalkeeperId, 10),
  });

  const base = deriveTeamStrength(baseInput);
  const strikerBoost = deriveTeamStrength(
    departmentInput({
      attacker: makePlayer(attackerId, 10, { finishing: 16, composure: 16, pace: 16 }),
      defender: makePlayer(defenderId, 10),
      midfielder: makePlayer(midfielderId, 10),
      goalkeeper: makePlayer(goalkeeperId, 10),
    }),
  );
  const defenderBoost = deriveTeamStrength(
    departmentInput({
      attacker: makePlayer(attackerId, 10),
      defender: makePlayer(defenderId, 10, { tackling: 16, positioning: 16, anticipation: 16 }),
      midfielder: makePlayer(midfielderId, 10),
      goalkeeper: makePlayer(goalkeeperId, 10),
    }),
  );
  const midfielderBoost = deriveTeamStrength(
    departmentInput({
      attacker: makePlayer(attackerId, 10),
      defender: makePlayer(defenderId, 10),
      midfielder: makePlayer(midfielderId, 10, { passing: 16, vision: 16, stamina: 16 }),
      goalkeeper: makePlayer(goalkeeperId, 10),
    }),
  );
  const goalkeeperBoost = deriveTeamStrength(
    departmentInput({
      attacker: makePlayer(attackerId, 10),
      defender: makePlayer(defenderId, 10),
      midfielder: makePlayer(midfielderId, 10),
      goalkeeper: makePlayer(goalkeeperId, 10, {
        goalkeeperPositioning: 16,
        handling: 16,
        reflexes: 16,
      }),
    }),
  );

  assert.equal(strikerBoost.attack > base.attack, true);
  assert.equal(strikerBoost.defense, base.defense);
  assert.equal(defenderBoost.defense > base.defense, true);
  assert.equal(defenderBoost.attack, base.attack);
  assert.equal(midfielderBoost.midfield > base.midfield, true);
  assert.equal(midfielderBoost.goalkeeper, base.goalkeeper);
  assert.equal(goalkeeperBoost.goalkeeper > base.goalkeeper, true);
  assert.equal(goalkeeperBoost.midfield, base.midfield);
});

test("irrelevant cross-role attributes do not dominate role score", () => {
  const attackerId = playerId("player:000001");
  const defenderId = playerId("player:000002");
  const midfielderId = playerId("player:000003");
  const goalkeeperId = playerId("player:000004");
  const baseInput = departmentInput({
    attacker: makePlayer(attackerId, 10),
    defender: makePlayer(defenderId, 10),
    midfielder: makePlayer(midfielderId, 10),
    goalkeeper: makePlayer(goalkeeperId, 10),
  });

  const base = deriveTeamStrength(baseInput);
  const irrelevantOutfieldBoost = deriveTeamStrength(
    departmentInput({
      attacker: makePlayer(attackerId, 10, { tackling: 20 }),
      defender: makePlayer(defenderId, 10, { finishing: 20 }),
      midfielder: makePlayer(midfielderId, 10),
      goalkeeper: makePlayer(goalkeeperId, 10),
    }),
  );
  const irrelevantGoalkeeperBoost = deriveTeamStrength(
    departmentInput({
      attacker: makePlayer(attackerId, 10),
      defender: makePlayer(defenderId, 10),
      midfielder: makePlayer(midfielderId, 10),
      goalkeeper: makePlayer(goalkeeperId, 10, { finishing: 20, tackling: 20 }),
    }),
  );

  assert.equal(irrelevantOutfieldBoost.attack, base.attack);
  assert.equal(irrelevantOutfieldBoost.defense, base.defense);
  assert.equal(irrelevantGoalkeeperBoost.goalkeeper, base.goalkeeper);
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

test("form and morale multipliers can make post-match state affect next-fixture strength", () => {
  const id = playerId("player:000001");
  const input = onePlayerInput(makePlayer(id, 10));
  const playerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = {
    [id]: {
      fitness: stateValue(100),
      form: stateValue(48),
      morale: stateValue(47),
    },
  };
  const affected = deriveTeamStrength({
    ...input,
    playerStates,
    stateMultiplierCurves: {
      form: [
        { maxValueInclusive: 49, multiplier: 0.95 },
        { maxValueInclusive: 100, multiplier: 1 },
      ],
      morale: [
        { maxValueInclusive: 49, multiplier: 0.96 },
        { maxValueInclusive: 100, multiplier: 1 },
      ],
    },
  });

  assert.equal(Number(affected.overall.toFixed(2)), 9.12);
  assert.equal(affected.overall < deriveTeamStrength({ ...input, playerStates }).overall, true);
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
function makePlayer(id: PlayerId, baseAbility: number, overrides: AbilityOverrides = {}): Player {
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

/** Targeted ability overrides used by sensitivity tests. */
interface AbilityOverrides {
  readonly anticipation?: number;
  readonly composure?: number;
  readonly finishing?: number;
  readonly goalkeeperPositioning?: number;
  readonly handling?: number;
  readonly pace?: number;
  readonly passing?: number;
  readonly positioning?: number;
  readonly reflexes?: number;
  readonly stamina?: number;
  readonly tackling?: number;
  readonly vision?: number;
}

/**
 * Builds a four-player input with content-like broad role weights.
 */
function departmentInput(players: {
  readonly attacker: Player;
  readonly defender: Player;
  readonly midfielder: Player;
  readonly goalkeeper: Player;
}): DeriveTeamStrengthInput {
  return {
    lineup: [
      { slotId: "slot:gk", playerId: players.goalkeeper.id, roleKey: "gk" },
      { slotId: "slot:def", playerId: players.defender.id, roleKey: "defender" },
      { slotId: "slot:mid", playerId: players.midfielder.id, roleKey: "midfielder" },
      { slotId: "slot:att", playerId: players.attacker.id, roleKey: "attacker" },
    ],
    players: {
      [players.attacker.id]: players.attacker,
      [players.defender.id]: players.defender,
      [players.midfielder.id]: players.midfielder,
      [players.goalkeeper.id]: players.goalkeeper,
    },
    roleWeights: departmentRoleWeights(),
  };
}

/**
 * Returns content-like role weights without importing content into engine tests.
 */
function departmentRoleWeights(): Readonly<Record<string, RoleWeightProfile>> {
  return {
    gk: {
      roleKey: "gk",
      department: "goalkeeper",
      abilityWeights: {
        "goalkeeping.reflexes": 3,
        "goalkeeping.handling": 2,
        "goalkeeping.goalkeeperPositioning": 2,
        "goalkeeping.footwork": 1,
      },
    },
    defender: {
      roleKey: "defender",
      department: "defense",
      abilityWeights: {
        "technical.tackling": 2,
        "physical.strength": 1,
        "physical.heading": 1,
        "mental.positioning": 2,
        "mental.anticipation": 1,
      },
    },
    midfielder: {
      roleKey: "midfielder",
      department: "midfield",
      abilityWeights: {
        "technical.passing": 2,
        "technical.technique": 1,
        "physical.stamina": 1,
        "mental.vision": 2,
        "mental.determination": 1,
      },
    },
    attacker: {
      roleKey: "attacker",
      department: "attack",
      abilityWeights: {
        "technical.finishing": 3,
        "technical.dribbling": 1,
        "physical.pace": 1,
        "mental.composure": 2,
        "physical.heading": 1,
      },
    },
  };
}

/**
 * Builds a complete 25-attribute ability object for test players.
 */
function abilitySet(
  value: number,
  overrides: AbilityOverrides = {},
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
      pace: abilityValue(overrides.pace ?? value),
      strength: ability,
      stamina: abilityValue(overrides.stamina ?? value),
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: abilityValue(overrides.positioning ?? value),
      vision: abilityValue(overrides.vision ?? value),
      anticipation: abilityValue(overrides.anticipation ?? value),
      composure: abilityValue(overrides.composure ?? value),
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: abilityValue(overrides.reflexes ?? value),
      handling: abilityValue(overrides.handling ?? value),
      rushingOut: ability,
      goalkeeperPositioning: abilityValue(overrides.goalkeeperPositioning ?? value),
      footwork: ability,
    },
  };
}
