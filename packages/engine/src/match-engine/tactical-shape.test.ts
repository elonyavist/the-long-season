import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  CANONICAL_PLAYER_ROLES,
  gameDate,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  playerId,
  POSITION_SUITABILITIES,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_CAPACITY_SOURCE,
  TACTICAL_SHAPE_TASK_KIND,
  TACTICAL_SHAPE_TASKS,
  validateMatchTacticsCalibration,
  type CanonicalPlayerRole,
  type FormationSide,
  type MatchTacticsCalibrationConfig,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type PlayerPosition,
  type PositionSuitability,
  type TacticalShapeCapacity,
  type TacticalShapeTask,
} from "@game/domain";

import {
  assertValidTacticalShapeProfile,
  deriveTacticalShapeProfile,
  TacticalShapeError,
  type TacticalShapeProfile,
} from "./tactical-shape.ts";
import {
  createLineupSlot,
  deriveLineupSlotTacticalEvaluations,
  deriveTeamStrength,
  type LineupSlot,
  type RoleWeightProfile,
} from "./team-strength.ts";
import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";

/**
 * These tests prove the intrinsic-shape invariants on a fixture calibration
 * rather than on the shipped one. That is deliberate: every invariant here
 * holds for *any* calibration the domain validator accepts, and the content
 * package proves the shipped asset is accepted. Copying the shipped
 * coefficients into this file would create a second place they could drift.
 */

/* -------------------------------------------------------------------------- */
/* Structure                                                                  */
/* -------------------------------------------------------------------------- */

test("the fixture calibration is one the domain validator accepts", () => {
  assert.doesNotThrow(() => {
    validateMatchTacticsCalibration(matchTacticsCalibrationFixture());
  });
});

test("a profile is complete, bounded, and stamped with its policy", () => {
  const profile = profileFor(FOUR_FOUR_TWO);

  assert.equal(profile.policyVersion, matchTacticsCalibrationFixture().version);
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const value = profile.capacities[capacity];
    assert.equal(Number.isFinite(value), true, `${capacity} must be finite`);
    assert.equal(value >= 0 && value < 1, true, `${capacity} must sit inside [0, 1): ${value}`);
  }
});

test("an ordinary shape leaves headroom in both directions on every capacity", () => {
  const profile = profileFor(FOUR_FOUR_TWO);

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    const value = profile.capacities[capacity];
    assert.equal(
      value > 0.15 && value < 0.85,
      true,
      `${capacity} must leave room to improve and to lose: ${value}`,
    );
  }
});

/* -------------------------------------------------------------------------- */
/* The defect this phase exists to remove                                     */
/* -------------------------------------------------------------------------- */

test("equal-quality 4-4-2 and 3-1-6 have identical strength but different shape", () => {
  const balanced = deriveTeamStrength(strengthInput(FOUR_FOUR_TWO));
  const extreme = deriveTeamStrength(strengthInput(THREE_ONE_SIX));

  assert.deepEqual(extreme, balanced, "the department collapse cannot tell these apart");

  const balancedShape = profileFor(FOUR_FOUR_TWO);
  const extremeShape = profileFor(THREE_ONE_SIX);
  assert.notDeepEqual(extremeShape.capacities, balancedShape.capacities);
});

test("3-1-6 buys final-third presence with progression and flank coverage", () => {
  const balanced = profileFor(FOUR_FOUR_TWO).capacities;
  const extreme = profileFor(THREE_ONE_SIX).capacities;

  assert.equal(extreme.final_third_presence > balanced.final_third_presence, true, "final-third presence");
  assert.equal(extreme.counter_threat > balanced.counter_threat, true, "counter threat");
  assert.equal(extreme.central_progression < balanced.central_progression, true, "central progression");
  assert.equal(extreme.left_coverage < balanced.left_coverage, true, "left coverage");
  assert.equal(extreme.right_coverage < balanced.right_coverage, true, "right coverage");
});

/* -------------------------------------------------------------------------- */
/* Declared mathematical constraints                                          */
/* -------------------------------------------------------------------------- */

test("an extra contributor to a task strictly increases that capacity", () => {
  let previous = profileFor(THREE_FOUR_THREE_BASE).capacities.final_third_presence;

  for (let extraStrikers = 1; extraStrikers <= 4; extraStrikers += 1) {
    const current = profileFor([
      ...THREE_FOUR_THREE_BASE,
      ...Array.from({ length: extraStrikers }, (): PitchSlot => ["striker", "center"]),
    ]).capacities.final_third_presence;

    assert.equal(current > previous, true, `striker ${extraStrikers} must add presence`);
    previous = current;
  }
});

test("a role can buy one task only by giving the same allocation up elsewhere", () => {
  const calibration = matchTacticsCalibrationFixture();
  const centerBack = calibration.tacticalShape.taskAllocationBasisPointsByRole.center_back;
  const reallocated: MatchTacticsCalibrationConfig = {
    ...calibration,
    tacticalShape: {
      ...calibration.tacticalShape,
      taskAllocationBasisPointsByRole: {
        ...calibration.tacticalShape.taskAllocationBasisPointsByRole,
        center_back: {
          ...centerBack,
          box_protection: centerBack.box_protection + 500,
          build_up: centerBack.build_up - 500,
        },
      },
    },
  };
  validateMatchTacticsCalibration(reallocated);

  const slotScores = slotScoresFor([["center_back", "center"]]);
  const before = deriveTacticalShapeProfile({ slotScores, calibration }).capacities;
  const after = deriveTacticalShapeProfile({ slotScores, calibration: reallocated }).capacities;

  assert.equal(after.box_protection > before.box_protection, true);
  assert.equal(after.build_up < before.build_up, true);
  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    if (capacity !== "box_protection" && capacity !== "build_up") {
      assert.equal(after[capacity], before[capacity], capacity);
    }
  }
});

test("each additional identical contributor adds strictly less than the one before", () => {
  const totals = Array.from({ length: 6 }, (_, count) =>
    profileFor(Array.from({ length: count + 1 }, (): PitchSlot => ["striker", "center"])).capacities
      .final_third_presence,
  );

  const deltas = totals.slice(1).map((value, index) => value - (totals[index] as number));
  for (const [index, delta] of deltas.entries()) {
    assert.equal(delta > 0, true, `contributor ${index + 2} must still help`);
    if (index > 0) {
      assert.equal(delta < (deltas[index - 1] as number), true, `contributor ${index + 2} must help less`);
    }
  }
});

test("mirroring a lineup mirrors its profile exactly", () => {
  const original = profileFor(LOPSIDED_RIGHT).capacities;
  const mirrored = profileFor(LOPSIDED_RIGHT.map(mirrorSlot)).capacities;

  assert.equal(mirrored.left_progression, original.right_progression);
  assert.equal(mirrored.right_progression, original.left_progression);
  assert.equal(mirrored.left_coverage, original.right_coverage);
  assert.equal(mirrored.right_coverage, original.left_coverage);
  assert.equal(mirrored.central_progression, original.central_progression);
  assert.equal(mirrored.build_up, original.build_up);
});

test("swapping player quality across one symmetric shape mirrors lateral execution", () => {
  const slots: readonly PitchSlot[] = [
    ["left_winger", "left"],
    ["right_winger", "right"],
  ];
  const leftLed = profileFor(slots, { outfieldAbilityByIndex: [18, 6] }).capacities;
  const rightLed = profileFor(slots, { outfieldAbilityByIndex: [6, 18] }).capacities;

  assert.equal(leftLed.left_progression, rightLed.right_progression);
  assert.equal(leftLed.right_progression, rightLed.left_progression);
  assert.equal(leftLed.left_coverage, rightLed.right_coverage);
  assert.equal(leftLed.right_coverage, rightLed.left_coverage);
  assert.equal(leftLed.central_progression, rightLed.central_progression);
});

test("a lineup with nobody on the left has no left flank at all", () => {
  const allRight = profileFor([
    ["goalkeeper", "center"],
    ...Array.from({ length: 5 }, (): PitchSlot => ["right_full_back", "right"]),
    ...Array.from({ length: 5 }, (): PitchSlot => ["right_winger", "right"]),
  ]).capacities;

  assert.equal(allRight.left_progression, 0);
  assert.equal(allRight.left_coverage, 0);
  assert.equal(allRight.right_progression > 0, true);
  assert.equal(allRight.right_coverage > 0, true);
});

/* -------------------------------------------------------------------------- */
/* Football invariants                                                        */
/* -------------------------------------------------------------------------- */

test("the goalkeeper does not move intrinsic shape", () => {
  const poor = profileFor(FOUR_FOUR_TWO, { goalkeeperAbility: 3 });
  const excellent = profileFor(FOUR_FOUR_TWO, { goalkeeperAbility: 19 });

  assert.deepEqual(excellent.capacities, poor.capacities);
});

test("better players in the same shape raise every capacity they touch", () => {
  const ordinary = profileFor(FOUR_FOUR_TWO, { outfieldAbility: 9 }).capacities;
  const better = profileFor(FOUR_FOUR_TWO, { outfieldAbility: 14 }).capacities;

  for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
    assert.equal(better[capacity] > ordinary[capacity], true, `${capacity} must reward quality`);
  }
});

/* -------------------------------------------------------------------------- */
/* Suitability: coordination only, never a second penalty                     */
/* -------------------------------------------------------------------------- */

test("a side playing out of position coordinates worse but is still there", () => {
  const natural = profileFor(FOUR_FOUR_TWO).capacities;
  const outOfPosition = profileFor(FOUR_FOUR_TWO, { outfieldNaturalPositions: ["st"] }).capacities;

  for (const capacity of COORDINATION_CAPACITIES) {
    assert.equal(outOfPosition[capacity] < natural[capacity], true, `${capacity} must suffer`);
  }
  for (const capacity of PRESENCE_CAPACITIES) {
    assert.equal(outOfPosition[capacity], natural[capacity], `${capacity} must not be charged twice`);
  }
});

test("the same eleven, played naturally or not, has identical team strength", () => {
  const natural = deriveTeamStrength(strengthInput(FOUR_FOUR_TWO));
  const outOfPosition = deriveTeamStrength(strengthInput(FOUR_FOUR_TWO, { outfieldNaturalPositions: ["st"] }));

  assert.deepEqual(outOfPosition, natural, "department strength already prices the role, and must not price it again");
});

test("a worse fit costs strictly more, in the declared order", () => {
  const byFit = POSITION_SUITABILITIES.map(
    (suitability) =>
      profileFor([["center_back", "center"]], {
        outfieldNaturalPositions: [CENTRE_BACK_FIT[suitability]],
      }).capacities.central_coverage,
  );

  for (const [index, value] of byFit.entries()) {
    if (index > 0) {
      assert.equal(value < (byFit[index - 1] as number), true, `${POSITION_SUITABILITIES[index]} must cost more`);
    }
  }
});

test("a better player out of position can still beat a weaker natural one", () => {
  const weakNaturals = profileFor(FOUR_FOUR_TWO, { outfieldAbility: 8 }).capacities.central_coverage;
  const strongAdapted = profileFor(FOUR_FOUR_TWO, {
    outfieldAbility: 14,
    outfieldNaturalPositions: ["dm"],
  }).capacities.central_coverage;

  assert.equal(strongAdapted > weakNaturals, true, "quality must still be able to win the argument");
});

test("but a big enough misuse is not something quality simply buys back", () => {
  const naturals = profileFor(FOUR_FOUR_TWO, { outfieldAbility: 11 }).capacities.central_coverage;
  const misusedAndBetter = profileFor(FOUR_FOUR_TWO, {
    outfieldAbility: 13,
    outfieldNaturalPositions: ["st"],
  }).capacities.central_coverage;

  assert.equal(misusedAndBetter < naturals, true, "an eleven of strikers is not a defence with better players in it");
});

test("suitability does not let the goalkeeper back into intrinsic shape", () => {
  const natural = profileFor(FOUR_FOUR_TWO).capacities;
  const goalkeeperOutOfPosition = profileFor(FOUR_FOUR_TWO.map(
    ([role, side]): PitchSlot => (role === "goalkeeper" ? ["striker", side] : [role, side]),
  ));

  assert.notDeepEqual(goalkeeperOutOfPosition.capacities, natural, "he becomes an outfielder, which does change shape");
  assert.deepEqual(
    profileFor(FOUR_FOUR_TWO, { goalkeeperAbility: 3 }).capacities,
    profileFor(FOUR_FOUR_TWO, { goalkeeperAbility: 19 }).capacities,
    "but while he is the goalkeeper he still contributes nothing",
  );
});

test("out-of-position play stays mirror symmetric", () => {
  const original = profileFor(LOPSIDED_RIGHT, { outfieldNaturalPositions: ["cb"] }).capacities;
  const mirrored = profileFor(LOPSIDED_RIGHT.map(mirrorSlot), { outfieldNaturalPositions: ["cb"] }).capacities;

  assert.equal(mirrored.left_coverage, original.right_coverage);
  assert.equal(mirrored.right_coverage, original.left_coverage);
  assert.equal(mirrored.central_coverage, original.central_coverage);
});

/**
 * One natural position per suitability, all measured against a centre-back
 * slot. A single-slot lineup is used so the ladder test reads the multiplier
 * itself rather than a mixture of eleven different fits.
 */
const CENTRE_BACK_FIT: Readonly<Record<PositionSuitability, PlayerPosition>> = {
  natural: "cb",
  adapted: "dm",
  weak: "rb",
  invalid: "st",
};

const COORDINATION_CAPACITIES = TACTICAL_SHAPE_CAPACITIES.filter(
  (capacity) => TACTICAL_SHAPE_TASK_KIND[TACTICAL_SHAPE_CAPACITY_SOURCE[capacity].task] === "coordination",
);
const PRESENCE_CAPACITIES = TACTICAL_SHAPE_CAPACITIES.filter(
  (capacity) => TACTICAL_SHAPE_TASK_KIND[TACTICAL_SHAPE_CAPACITY_SOURCE[capacity].task] === "presence",
);

/* -------------------------------------------------------------------------- */
/* Determinism                                                                */
/* -------------------------------------------------------------------------- */

test("the same lineup always produces the same profile", () => {
  assert.deepEqual(profileFor(FOUR_FOUR_TWO), profileFor(FOUR_FOUR_TWO));
});

test("reordering equal contributors cannot change the result", () => {
  const front: readonly PitchSlot[] = [
    ["goalkeeper", "center"],
    ["center_back", "right_center"],
    ["center_back", "left_center"],
  ];
  const forward = profileFor([...front, ["right_winger", "right"], ["left_winger", "left"]]);
  const reversed = profileFor([...front, ["left_winger", "left"], ["right_winger", "right"]]);

  assert.deepEqual(reversed.capacities, forward.capacities);
});

/* -------------------------------------------------------------------------- */
/* Failure modes                                                              */
/* -------------------------------------------------------------------------- */

test("an empty lineup has no shape", () => {
  assert.throws(
    () => deriveTacticalShapeProfile({ slotScores: [], calibration: matchTacticsCalibrationFixture() }),
    (error: unknown) => error instanceof TacticalShapeError && error.code === "empty_lineup",
  );
});

test("more contributors than the ladder covers is a deterministic failure", () => {
  const tooMany = Array.from({ length: 12 }, (): PitchSlot => ["striker", "center"]);

  assert.throws(
    () => deriveTacticalShapeProfile({ slotScores: slotScoresFor(tooMany), calibration: matchTacticsCalibrationFixture() }),
    (error: unknown) => error instanceof TacticalShapeError && error.code === "too_many_contributors",
  );
});

test("a profile arriving from outside is checked before anything reads it", () => {
  const valid = profileFor(FOUR_FOUR_TWO);
  assert.doesNotThrow(() => {
    assertValidTacticalShapeProfile(valid);
  });

  assertProfileRejected({ ...valid, policyVersion: " " }, "missing_policy_version");
  assertProfileRejected(
    { ...valid, capacities: { ...valid.capacities, build_up: 1 } },
    "capacity_out_of_bounds",
  );
  assertProfileRejected(
    { ...valid, capacities: { ...valid.capacities, build_up: Number.NaN } },
    "capacity_out_of_bounds",
  );

  const incomplete = { ...valid.capacities } as Record<TacticalShapeCapacity, number>;
  delete (incomplete as Partial<Record<TacticalShapeCapacity, number>>).rest_defence;
  assertProfileRejected({ ...valid, capacities: incomplete }, "incomplete_profile");
});

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

type PitchSlot = readonly [CanonicalPlayerRole, FormationSide];

const FOUR_FOUR_TWO: readonly PitchSlot[] = [
  ["goalkeeper", "center"],
  ["right_full_back", "right"],
  ["center_back", "right_center"],
  ["center_back", "left_center"],
  ["left_full_back", "left"],
  ["right_midfielder", "right"],
  ["central_midfielder", "right_center"],
  ["central_midfielder", "left_center"],
  ["left_midfielder", "left"],
  ["striker", "right_center"],
  ["striker", "left_center"],
];

const THREE_ONE_SIX: readonly PitchSlot[] = [
  ["goalkeeper", "center"],
  ["center_back", "right_center"],
  ["center_back", "center"],
  ["center_back", "left_center"],
  ["defensive_midfielder", "center"],
  ["right_winger", "right"],
  ["left_winger", "left"],
  ["striker", "right_center"],
  ["striker", "right_center"],
  ["striker", "left_center"],
  ["striker", "left_center"],
];

const THREE_FOUR_THREE_BASE: readonly PitchSlot[] = [
  ["goalkeeper", "center"],
  ["center_back", "right_center"],
  ["center_back", "center"],
  ["center_back", "left_center"],
  ["right_midfielder", "right"],
  ["central_midfielder", "right_center"],
  ["central_midfielder", "left_center"],
];

const LOPSIDED_RIGHT: readonly PitchSlot[] = [
  ["goalkeeper", "center"],
  ["right_full_back", "right"],
  ["center_back", "right_center"],
  ["center_back", "left_center"],
  ["left_full_back", "left"],
  ["right_midfielder", "right"],
  ["right_winger", "right"],
  ["central_midfielder", "right_center"],
  ["defensive_midfielder", "center"],
  ["striker", "right_center"],
  ["striker", "center"],
];

const MIRRORED_ROLE: Readonly<Record<CanonicalPlayerRole, CanonicalPlayerRole>> = {
  goalkeeper: "goalkeeper",
  right_full_back: "left_full_back",
  center_back: "center_back",
  left_full_back: "right_full_back",
  defensive_midfielder: "defensive_midfielder",
  central_midfielder: "central_midfielder",
  right_midfielder: "left_midfielder",
  left_midfielder: "right_midfielder",
  attacking_midfielder: "attacking_midfielder",
  right_winger: "left_winger",
  left_winger: "right_winger",
  striker: "striker",
};

const MIRRORED_SIDE: Readonly<Record<FormationSide, FormationSide>> = {
  left: "right",
  left_center: "right_center",
  center: "center",
  right_center: "left_center",
  right: "left",
};

function mirrorSlot([role, side]: PitchSlot): PitchSlot {
  return [MIRRORED_ROLE[role], MIRRORED_SIDE[side]];
}

interface QualityOptions {
  readonly outfieldAbility?: number;
  readonly outfieldAbilityByIndex?: readonly number[];
  readonly goalkeeperAbility?: number;
  /**
   * Natural positions given to every outfield player.
   *
   * Omit it and each player is a natural for the role he was handed, which is
   * the neutral case every non-suitability test wants. Set it and the whole
   * outfield is playing somewhere it does not belong.
   */
  readonly outfieldNaturalPositions?: readonly PlayerPosition[];
}

/**
 * The natural position for one canonical role.
 *
 * The suitability evaluator maps positions to roles; this is the inverse used
 * only to build a fixture where nobody is out of position.
 */
const NATURAL_POSITION_FOR_ROLE = {
  goalkeeper: "gk",
  right_full_back: "rb",
  center_back: "cb",
  left_full_back: "lb",
  defensive_midfielder: "dm",
  central_midfielder: "cm",
  right_midfielder: "rwb",
  left_midfielder: "lwb",
  attacking_midfielder: "am",
  right_winger: "rw",
  left_winger: "lw",
  striker: "st",
} as const satisfies Readonly<Record<CanonicalPlayerRole, PlayerPosition>>;

function profileFor(slots: readonly PitchSlot[], quality: QualityOptions = {}): TacticalShapeProfile {
  return deriveTacticalShapeProfile({ slotScores: slotScoresFor(slots, quality), calibration: matchTacticsCalibrationFixture() });
}

function slotScoresFor(slots: readonly PitchSlot[], quality: QualityOptions = {}) {
  const calibration = matchTacticsCalibrationFixture();
  return deriveLineupSlotTacticalEvaluations({
    ...strengthInput(slots, quality),
    calibration,
  });
}

function strengthInput(slots: readonly PitchSlot[], quality: QualityOptions = {}) {
  const outfieldAbility = quality.outfieldAbility ?? 11;
  const goalkeeperAbility = quality.goalkeeperAbility ?? 11;
  const lineup: LineupSlot[] = [];
  const players: Record<PlayerId, Player> = {};

  for (const [index, [role, side]] of slots.entries()) {
    const id = playerId(`player:${String(index + 1).padStart(6, "0")}`);
    lineup.push(createLineupSlot({ slotId: `slot:${index}`, playerId: id, canonicalRole: role, side }));
    players[id] = makePlayer(
      id,
      role === "goalkeeper"
        ? goalkeeperAbility
        : (quality.outfieldAbilityByIndex?.[index] ?? outfieldAbility),
      role === "goalkeeper"
        ? [NATURAL_POSITION_FOR_ROLE.goalkeeper]
        : (quality.outfieldNaturalPositions ?? [NATURAL_POSITION_FOR_ROLE[role]]),
    );
  }

  return { lineup, players, roleWeights: ROLE_WEIGHTS };
}

/**
 * One ability drives every role score, so a player's quality is exactly the
 * number this fixture sets. Shape differences then come only from role, channel
 * and occupancy, which is what the tests are about.
 */
const ROLE_WEIGHTS: Readonly<Record<string, RoleWeightProfile>> = {
  gk: { roleKey: "gk", department: "goalkeeper", abilityWeights: { "mental.positioning": 1 } },
  defender: { roleKey: "defender", department: "defense", abilityWeights: { "mental.positioning": 1 } },
  midfielder: { roleKey: "midfielder", department: "midfield", abilityWeights: { "mental.positioning": 1 } },
  attacker: { roleKey: "attacker", department: "attack", abilityWeights: { "mental.positioning": 1 } },
};

function makePlayer(id: PlayerId, ability: number, naturalPositions: readonly PlayerPosition[]): Player {
  const abilities: PlayerAbilities = {
    technical: {
      finishing: abilityValue(ability),
      passing: abilityValue(ability),
      longPassing: abilityValue(ability),
      crossing: abilityValue(ability),
      dribbling: abilityValue(ability),
      technique: abilityValue(ability),
      tackling: abilityValue(ability),
      penalties: abilityValue(ability),
      freeKicks: abilityValue(ability),
    },
    physical: {
      pace: abilityValue(ability),
      strength: abilityValue(ability),
      stamina: abilityValue(ability),
      agility: abilityValue(ability),
      heading: abilityValue(ability),
    },
    mental: {
      positioning: abilityValue(ability),
      vision: abilityValue(ability),
      anticipation: abilityValue(ability),
      composure: abilityValue(ability),
      determination: abilityValue(ability),
      leadership: abilityValue(ability),
    },
    goalkeeping: {
      reflexes: abilityValue(ability),
      handling: abilityValue(ability),
      rushingOut: abilityValue(ability),
      goalkeeperPositioning: abilityValue(ability),
      footwork: abilityValue(ability),
    },
  };

  return {
    id,
    name: { first: "Test", last: String(id) },
    birthDate: gameDate(0),
    role: "central_midfielder",
    naturalPositions,
    abilities,
  } as unknown as Player;
}

function assertProfileRejected(profile: TacticalShapeProfile, code: string): void {
  assert.throws(
    () => {
      assertValidTacticalShapeProfile(profile);
    },
    (error: unknown) => error instanceof TacticalShapeError && error.code === code,
    `expected ${code}`,
  );
}

test("every canonical role is covered by the fixture calibration", () => {
  const allocations = matchTacticsCalibrationFixture().tacticalShape.taskAllocationBasisPointsByRole;

  for (const role of CANONICAL_PLAYER_ROLES) {
    assert.notEqual(allocations[role], undefined, `${role} has no fixture allocations`);
  }
});
