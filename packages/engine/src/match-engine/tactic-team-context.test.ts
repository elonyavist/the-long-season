import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  CANONICAL_PLAYER_ROLES,
  clubId,
  gameDate,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  playerId,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_TASKS,
  type CanonicalPlayerRole,
  type MatchTacticsCalibrationConfig,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type SelectedLineup,
  type TacticalShapeTask,
  type TacticSetup,
} from "@game/domain";

import {
  buildTacticTeamContext,
  tacticToMatchDistribution,
  TacticTeamContextError,
  type BuildTacticTeamContextInput,
} from "./tactic-team-context.ts";
import { deriveTeamStrength, type RoleWeightProfile } from "./team-strength.ts";
import { flatMatchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";

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
  assert.equal(first.lineup[0]?.canonicalRole, "goalkeeper");
  assert.equal(first.lineup[1]?.canonicalRole, "striker");
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
            { slotKey: "slot:gk", playerId: ids.goalkeeper, canonicalRole: "goalkeeper" },
            { slotKey: "slot:st", playerId: ids.goalkeeper, canonicalRole: "striker" },
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
test("every context carries a stamped, complete, bounded shape profile", () => {
  const context = buildTacticTeamContext(validInput());

  assert.equal(context.shape.policyVersion, "match-tactics-seam-fixture");
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const value = context.shape.capacities[capacity];
    assert.equal(Number.isFinite(value) && value >= 0 && value < 1, true, capacity);
  }
});

test("department strength is the same number the strength module derives alone", () => {
  const input = validInput();

  assert.deepEqual(
    buildTacticTeamContext(input).strength,
    deriveTeamStrength({
      lineup: buildTacticTeamContext(input).lineup,
      players: input.players,
      roleWeights: input.roleWeights,
    }),
  );
});

/**
 * A deliberately flat calibration: it proves the seam is wired, not what the
 * football numbers should be. The intrinsic-shape tests own the invariants.
 */
function seamCalibration(): MatchTacticsCalibrationConfig {
  return flatMatchTacticsCalibrationFixture({
    version: "match-tactics-seam-fixture",
    saturationReferenceMilli: 10_000,
  });
}

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
    matchTacticsCalibration: seamCalibration(),
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
      { slotKey: "slot:gk", playerId: ids.goalkeeper, canonicalRole: "goalkeeper" },
      { slotKey: "slot:st", playerId: ids.striker, canonicalRole: "striker" },
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
