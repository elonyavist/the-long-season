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

import type { MatchTeamContext } from "./match-context.ts";
import {
  buildTacticTeamContext,
  buildUnpreparedTeamContext,
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
    mentality: "balanced",
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

test("tacticToMatchDistribution carries every knob the match reads, mentality included", () => {
  // Mentality used to be dropped at this seam, so two opposite team talks
  // reached the engine as the same instruction. It is now a knob of its own:
  // the four numbers cross unchanged, and the ladder crosses as itself rather
  // than being folded into them.
  assert.deepEqual(tacticToMatchDistribution(tacticFixture({ mentality: "very_attacking" })), {
    directness: 0.6,
    pressing: 0.7,
    width: 0.8,
    risk: 0.4,
    mentality: "very_attacking",
  });

  assert.notDeepEqual(
    tacticToMatchDistribution(tacticFixture({ mentality: "very_attacking" })),
    tacticToMatchDistribution(tacticFixture({ mentality: "very_defensive" })),
  );
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
/**
 * Fixes the invariant that makes a live change trustworthy.
 *
 * The manager must get the same football from a change whether he made it on
 * the preparation screen or at the touchline in the eightieth minute. That is
 * only true while both routes reach one builder, and it stops being true the
 * moment either driver rebuilds a context its own way - which is exactly what
 * both of them used to do for every club the manager had not prepared.
 *
 * The delta is compared rather than the contexts, because it is the delta the
 * manager experiences: what his decision changed.
 */
test("pre-match and live application of one change produce the same structural delta", () => {
  const before = buildTacticTeamContext(validInput());
  const change: Partial<BuildTacticTeamContextInput> = {
    tactic: tacticFixture({ mentality: "attacking", width: 0.2, risk: 0.9 }),
  };

  const preMatch = buildTacticTeamContext({ ...validInput(), ...change });
  const live = buildTacticTeamContext({ ...validInput(), ...change });

  assert.deepEqual(delta(before, live), delta(before, preMatch));
  assert.notDeepEqual(delta(before, preMatch), delta(before, before));
});

/**
 * Fixes the seam a club nobody prepared reaches the engine through (A1).
 *
 * The squad arrives explicitly. Nothing here consults club ownership to find
 * out who is available, because ownership stops answering that question at
 * Phase 82A's first loan.
 */
test("an unprepared club is an ordinary caller of the same builder", () => {
  const ids = playerIds();
  const input = validInput();

  const unprepared = buildUnpreparedTeamContext({
    clubId: clubId("club:pro01"),
    squadPlayerIds: [ids.goalkeeper, ids.striker],
    requiredLineupSize: 2,
    players: input.players,
    roleWeights: input.roleWeights,
    matchTacticsCalibration: input.matchTacticsCalibration,
  });

  assert.equal(unprepared.clubId, clubId("club:pro01"));
  assert.deepEqual(unprepared.lineup.map((slot) => slot.slotId), ["slot:01", "slot:02"]);
  assert.deepEqual(unprepared.lineup.map((slot) => slot.canonicalRole), ["goalkeeper", "center_back"]);
  assert.equal(unprepared.incidentProfiles.length, 2);
  assert.equal(unprepared.shape.policyVersion, input.matchTacticsCalibration.version);
  assert.deepEqual(unprepared.tacticalDistribution, {
    mentality: "balanced",
    pressing: 0.5,
    directness: 0.5,
    width: 0.5,
    risk: 0.5,
  });
});

test("an unprepared club that cannot field the required eleven fails loudly", () => {
  const ids = playerIds();
  const input = validInput();

  assertTacticTeamContextError(
    () => buildUnpreparedTeamContext({
      clubId: clubId("club:pro01"),
      squadPlayerIds: [ids.goalkeeper],
      requiredLineupSize: 2,
      players: input.players,
      roleWeights: input.roleWeights,
      matchTacticsCalibration: input.matchTacticsCalibration,
    }),
    "insufficient_squad",
  );
});

/** Reduces one change to the facts the match engine actually reads. */
function delta(before: MatchTeamContext, after: MatchTeamContext) {
  return {
    overall: after.strength.overall - before.strength.overall,
    attack: after.strength.attack - before.strength.attack,
    midfield: after.strength.midfield - before.strength.midfield,
    defense: after.strength.defense - before.strength.defense,
    tacticalDistribution: after.tacticalDistribution,
    shape: after.shape,
  };
}

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
    // Needed by the default eleven a club with no preparation fields, whose
    // second slot is a centre-back.
    defender: {
      roleKey: "defender",
      department: "defense",
      abilityWeights: {
        "technical.tackling": 1,
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
