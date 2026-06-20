import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  gameDate,
  playerId,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type SelectedLineup,
  type TacticSetup,
} from "@game/domain";

import {
  buildTacticTeamContext,
  tacticToMatchDistribution,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
} from "./tactic-team-context.ts";
import type { RoleWeightProfile } from "./team-strength.ts";

/**
 * Tactic team-context tests cover only the interpretation layer between domain
 * setup data and existing match-engine team context inputs.
 */
test("buildTacticTeamContext builds a deterministic match team context", () => {
  const input = validInput();

  const first = buildTacticTeamContext(input);
  const second = buildTacticTeamContext(input);

  assert.deepEqual(first, second);
  assert.equal(first.clubId, clubId("club:pro01"));
  assert.deepEqual(
    first.lineup.map((slot) => slot.slotId),
    ["slot:gk", "slot:st"],
  );
  assert.equal(first.lineup[0]?.roleKey, "gk");
  assert.equal(first.lineup[1]?.roleKey, "attacker");
  assert.equal(first.strength.goalkeeper, 11);
  assert.equal(first.strength.attack, 14);
  assert.deepEqual(first.tacticalDistribution, {
    directness: 0.6,
    pressing: 0.7,
    width: 0.8,
    risk: 0.4,
  });
});

test("buildTacticTeamContext rejects invalid required lineup size", () => {
  assertTacticTeamContextError(
    () =>
      buildTacticTeamContext({
        ...validInput(),
        requiredLineupSize: 0,
      }),
    "invalid_required_lineup_size",
  );

  assertTacticTeamContextError(
    () =>
      buildTacticTeamContext({
        ...validInput(),
        requiredLineupSize: 1.5,
      }),
    "invalid_required_lineup_size",
  );
});

test("buildTacticTeamContext rejects lineup size mismatches", () => {
  assertTacticTeamContextError(
    () =>
      buildTacticTeamContext({
        ...validInput(),
        requiredLineupSize: 11,
      }),
    "invalid_lineup_size",
  );
});

test("buildTacticTeamContext rejects selected players outside available players", () => {
  const input = validInput();

  assertTacticTeamContextError(
    () =>
      buildTacticTeamContext({
        ...input,
        players: {
          [playerIds().goalkeeper]: input.players[playerIds().goalkeeper] as Player,
        },
      }),
    "unknown_player",
  );
});

test("buildTacticTeamContext rejects duplicate selected players", () => {
  const ids = playerIds();

  assertTacticTeamContextError(
    () =>
      buildTacticTeamContext({
        ...validInput(),
        lineup: {
          clubId: clubId("club:pro01"),
          slots: [
            { slotKey: "slot:gk", playerId: ids.goalkeeper, roleKey: "gk" },
            { slotKey: "slot:st", playerId: ids.goalkeeper, roleKey: "attacker" },
          ],
        },
      }),
    "duplicate_player",
  );
});

test("buildTacticTeamContext rejects missing role weight profiles", () => {
  const weights = roleWeights();

  assertTacticTeamContextError(
    () =>
      buildTacticTeamContext({
        ...validInput(),
        roleWeights: {
          gk: requiredRoleWeight(weights, "gk"),
        },
      }),
    "missing_role_weight",
  );
});

test("buildTacticTeamContext maps team-strength failures to builder errors", () => {
  assertTacticTeamContextError(
    () =>
      buildTacticTeamContext({
        ...validInput(),
        roleWeights: {
          ...roleWeights(),
          attacker: {
            roleKey: "attacker",
            department: "attack",
            abilityWeights: {},
          },
        },
      }),
    "team_strength_error",
  );
});

test("tacticToMatchDistribution maps only existing match-context knobs", () => {
  const assertive = tacticFixture({ mentality: "very_attacking" });
  const cautious = tacticFixture({ mentality: "very_defensive" });

  assert.deepEqual(tacticToMatchDistribution(assertive), tacticToMatchDistribution(cautious));
  assert.deepEqual(tacticToMatchDistribution(assertive), {
    directness: 0.6,
    pressing: 0.7,
    width: 0.8,
    risk: 0.4,
  });
});

test("tacticToMatchDistribution rejects invalid tactic setup", () => {
  assertTacticTeamContextError(
    () =>
      tacticToMatchDistribution({
        ...tacticFixture(),
        pressing: 1.1,
      }),
    "invalid_tactic_value",
  );

  assertTacticTeamContextError(
    () =>
      tacticToMatchDistribution({
        ...tacticFixture(),
        mentality: "reckless" as TacticSetup["mentality"],
      }),
    "invalid_mentality",
  );
});

/**
 * Builds a complete valid builder input with two selected players.
 */
function validInput(): BuildTacticTeamContextInput {
  const ids = playerIds();

  return {
    lineup: lineupFixture(),
    tactic: tacticFixture(),
    requiredLineupSize: 2,
    players: {
      [ids.goalkeeper]: makePlayer(ids.goalkeeper, 11),
      [ids.striker]: makePlayer(ids.striker, 14),
    },
    roleWeights: roleWeights(),
  };
}

/**
 * Builds stable player IDs used by the tactic builder tests.
 */
function playerIds(): { readonly goalkeeper: PlayerId; readonly striker: PlayerId } {
  return {
    goalkeeper: playerId("player:000001"),
    striker: playerId("player:000009"),
  };
}

/**
 * Builds a valid selected lineup fixture.
 */
function lineupFixture(): SelectedLineup {
  const ids = playerIds();

  return {
    clubId: clubId("club:pro01"),
    slots: [
      { slotKey: "slot:gk", playerId: ids.goalkeeper, roleKey: "gk" },
      { slotKey: "slot:st", playerId: ids.striker, roleKey: "attacker" },
    ],
  };
}

/**
 * Builds a valid tactic setup fixture, with optional targeted overrides.
 */
function tacticFixture(overrides: Partial<TacticSetup> = {}): TacticSetup {
  return {
    mentality: "balanced",
    pressing: 0.7,
    directness: 0.6,
    width: 0.8,
    risk: 0.4,
    ...overrides,
  };
}

/**
 * Builds role weights used to derive predictable strength values.
 */
function roleWeights(): Readonly<Record<string, RoleWeightProfile>> {
  return {
    gk: {
      roleKey: "gk",
      department: "goalkeeper",
      abilityWeights: {
        "goalkeeping.reflexes": 1,
      },
    },
    attacker: {
      roleKey: "attacker",
      department: "attack",
      abilityWeights: {
        "technical.finishing": 1,
      },
    },
  };
}

/**
 * Reads a test role weight and fails loudly if the fixture is broken.
 */
function requiredRoleWeight(weights: Readonly<Record<string, RoleWeightProfile>>, roleKey: string): RoleWeightProfile {
  const roleWeight = weights[roleKey];

  if (roleWeight === undefined) {
    throw new Error(`Missing test role weight: ${roleKey}`);
  }

  return roleWeight;
}

/**
 * Builds a test player with all abilities set to the same value.
 */
function makePlayer(id: PlayerId, ability: number): Player {
  const abilities = abilitySet(ability);

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
function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
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

/**
 * Asserts a typed tactic builder failure and its stable machine code.
 */
function assertTacticTeamContextError(action: () => void, code: TacticTeamContextError["code"]): void {
  assert.throws(
    action,
    (error: unknown) => error instanceof TacticTeamContextError && error.code === code,
  );
}
