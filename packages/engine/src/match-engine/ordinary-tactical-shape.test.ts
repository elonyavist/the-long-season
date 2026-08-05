import { describe, expect, it } from "vitest";
import {
  abilityValue,
  FORMATION_CATALOG,
  TACTICAL_SHAPE_CAPACITIES,
  type CanonicalPlayerRole,
  type FormationKey,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type TacticalShapeCapacity,
} from "@game/domain";

import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";
import {
  deriveOrdinaryTacticalShapeReference,
  deriveTacticalShapeEmphasis,
  OrdinaryTacticalShapeError,
  type TacticalShapeCapacityValues,
} from "./ordinary-tactical-shape.ts";
import { createLineupSlot, type RoleWeightProfile } from "./team-strength.ts";
import { deriveTeamShapeAndStrength } from "./tactic-team-context.ts";

const ROLE_WEIGHTS: Readonly<Record<string, RoleWeightProfile>> = {
  gk: { roleKey: "gk", department: "goalkeeper", abilityWeights: { "mental.positioning": 1 } },
  defender: { roleKey: "defender", department: "defense", abilityWeights: { "mental.positioning": 1 } },
  midfielder: { roleKey: "midfielder", department: "midfield", abilityWeights: { "mental.positioning": 1 } },
  attacker: { roleKey: "attacker", department: "attack", abilityWeights: { "mental.positioning": 1 } },
};

const CALIBRATION = matchTacticsCalibrationFixture();
const REFERENCE = deriveOrdinaryTacticalShapeReference({
  roleWeights: ROLE_WEIGHTS,
  matchTacticsCalibration: CALIBRATION,
});

function uniformAbilities(ability: number): PlayerAbilities {
  const value = abilityValue(ability);
  return {
    technical: {
      finishing: value,
      passing: value,
      longPassing: value,
      crossing: value,
      dribbling: value,
      technique: value,
      tackling: value,
      penalties: value,
      freeKicks: value,
    },
    physical: { pace: value, strength: value, stamina: value, agility: value, heading: value },
    mental: {
      positioning: value,
      vision: value,
      anticipation: value,
      composure: value,
      determination: value,
      leadership: value,
    },
    goalkeeping: {
      reflexes: value,
      handling: value,
      rushingOut: value,
      goalkeeperPositioning: value,
      footwork: value,
    },
  };
}

/** Scores one eleven of equal players, exactly as the manager's board hands it over. */
function rawCapacitiesFor(
  roles: readonly CanonicalPlayerRole[],
  ability: number,
): TacticalShapeCapacityValues {
  const lineup = roles.map((role, index) =>
    createLineupSlot({
      slotId: `slot:${String(index).padStart(2, "0")}`,
      playerId: `player:${index}` as PlayerId,
      canonicalRole: role,
    }),
  );
  const players = Object.fromEntries(
    roles.map((_role, index): readonly [PlayerId, Player] => [
      `player:${index}` as PlayerId,
      {
        id: `player:${index}` as PlayerId,
        firstName: "Test",
        lastName: "Player",
        birthDate: 0 as Player["birthDate"],
        naturalPositions: [],
        abilities: uniformAbilities(ability),
        potential: uniformAbilities(ability),
      },
    ]),
  ) as Readonly<Record<PlayerId, Player>>;

  return deriveTeamShapeAndStrength({
    lineup,
    players,
    roleWeights: ROLE_WEIGHTS,
    matchTacticsCalibration: CALIBRATION,
  }).shape.capacities;
}

/** Reads that same eleven against an ordinary one. */
function emphasisFor(roles: readonly CanonicalPlayerRole[], ability: number): TacticalShapeCapacityValues {
  return deriveTacticalShapeEmphasis(rawCapacitiesFor(roles, ability), REFERENCE);
}

function catalogRoles(key: FormationKey): readonly CanonicalPlayerRole[] {
  return FORMATION_CATALOG[key].slots.map((slot) => slot.playerRole);
}

const REPEATED = (role: CanonicalPlayerRole, count: number): readonly CanonicalPlayerRole[] =>
  Array.from({ length: count }, () => role);

const ALL_STRIKERS: readonly CanonicalPlayerRole[] = ["goalkeeper", ...REPEATED("striker", 10)];
const ALL_CENTRE_BACKS: readonly CanonicalPlayerRole[] = ["goalkeeper", ...REPEATED("center_back", 10)];
const RIGHT_HEAVY: readonly CanonicalPlayerRole[] = [
  "goalkeeper",
  "right_full_back",
  "center_back",
  "center_back",
  "right_full_back",
  "right_midfielder",
  "right_midfielder",
  "central_midfielder",
  "right_winger",
  "right_winger",
  "striker",
];

describe("deriveOrdinaryTacticalShapeReference", () => {
  it("gives every locked capacity a positive ordinary level", () => {
    for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
      expect(REFERENCE[capacity]).toBeGreaterThan(0);
      expect(REFERENCE[capacity]).toBeLessThan(1);
    }
  });

  it("mirrors left and right, because every curated formation does", () => {
    expect(REFERENCE.left_progression).toBeCloseTo(REFERENCE.right_progression, 12);
    expect(REFERENCE.left_coverage).toBeCloseTo(REFERENCE.right_coverage, 12);
  });

  it("depends on the calibration and nothing else", () => {
    const repeated = deriveOrdinaryTacticalShapeReference({
      roleWeights: ROLE_WEIGHTS,
      matchTacticsCalibration: CALIBRATION,
    });

    expect(repeated).toStrictEqual(REFERENCE);
  });
});

describe("deriveTacticalShapeEmphasis", () => {
  // These assertions hold for any admissible calibration. The numeric band the
  // read model actually reports against is a property of the *shipped*
  // calibration, which the engine cannot import, so it is measured where
  // content is reachable - see `match-preparation-adapter.test.ts`.
  it("always averages to exactly ordinary, so the reading is a profile", () => {
    for (const roles of [catalogRoles("4-4-2"), ALL_STRIKERS, RIGHT_HEAVY]) {
      const emphasis = emphasisFor(roles, 10);
      const total = TACTICAL_SHAPE_CAPACITIES.reduce((sum, capacity) => sum + emphasis[capacity], 0);

      expect(total / TACTICAL_SHAPE_CAPACITIES.length).toBeCloseTo(1, 12);
    }
  });

  it("reads a curated eleven as far closer to ordinary than a broken one", () => {
    const departure = (roles: readonly CanonicalPlayerRole[]): number =>
      Math.max(...TACTICAL_SHAPE_CAPACITIES.map((capacity) => Math.abs(emphasisFor(roles, 10)[capacity] - 1)));

    expect(departure(catalogRoles("4-4-2"))).toBeLessThan(departure(ALL_STRIKERS) / 2);
    expect(departure(catalogRoles("4-3-3"))).toBeLessThan(departure(ALL_CENTRE_BACKS) / 2);
  });

  it("removes almost all of the squad quality the raw capacity carries", () => {
    const raw = (ability: number): TacticalShapeCapacityValues =>
      rawCapacitiesFor(catalogRoles("3-4-3"), ability);
    const poor = emphasisFor(catalogRoles("3-4-3"), 4);
    const great = emphasisFor(catalogRoles("3-4-3"), 18);

    for (const capacity of TACTICAL_SHAPE_CAPACITIES) {
      const rawShift = Math.abs(raw(18)[capacity] / raw(4)[capacity] - 1);
      const readShift = Math.abs(great[capacity] / poor[capacity] - 1);

      // Raw capacity more than doubles between a squad of `4`s and a squad of
      // `18`s. What survives here is a small residue of the bounding curve.
      expect(rawShift).toBeGreaterThan(1);
      expect(readShift).toBeLessThan(rawShift / 5);
    }
  });

  it("reports the cost of an eleven made only of strikers", () => {
    const emphasis = emphasisFor(ALL_STRIKERS, 10);

    expect(emphasis.box_protection).toBeLessThan(0.75);
    expect(emphasis.rest_defence).toBeLessThan(0.75);
    expect(emphasis.central_coverage).toBeLessThan(0.75);
    expect(emphasis.final_third_presence).toBeGreaterThan(1.25);
  });

  it("reports the cost of an eleven made only of centre backs", () => {
    const emphasis = emphasisFor(ALL_CENTRE_BACKS, 10);

    expect(emphasis.central_progression).toBeLessThan(0.75);
    expect(emphasis.left_progression).toBeLessThan(0.75);
    expect(emphasis.box_protection).toBeGreaterThan(1.25);
    expect(emphasis.rest_defence).toBeGreaterThan(1.25);
    expect(emphasis.final_third_presence).toBeLessThan(emphasisFor(ALL_STRIKERS, 10).final_third_presence);
  });

  it("shows a stacked flank as one side gained and the other given up", () => {
    const emphasis = emphasisFor(RIGHT_HEAVY, 10);

    expect(emphasis.right_progression).toBeGreaterThan(emphasis.left_progression);
    expect(emphasis.left_coverage).toBeLessThan(0.75);
    expect(emphasis.right_coverage).toBeGreaterThan(1.25);
  });

  it("keeps a stacked flank one-sided at every squad quality", () => {
    // The two flanks carry the same players, so most of squad quality cancels -
    // but not all of it: the bounding curve compresses the busier flank harder,
    // so the *size* of the imbalance falls as the squad improves while its
    // direction never moves. A threshold on this ratio must clear the weakest
    // reading, not the strongest.
    const ratios = [4, 10, 18].map((ability) => {
      const emphasis = emphasisFor(RIGHT_HEAVY, ability);
      return emphasis.right_progression / emphasis.left_progression;
    });

    expect(Math.min(...ratios)).toBeGreaterThan(2);
    expect(ratios).toStrictEqual([...ratios].toSorted((first, second) => second - first));
  });

  it("refuses a reference with a capacity nobody can reach", () => {
    const broken = { ...REFERENCE, left_coverage: 0 } as Record<TacticalShapeCapacity, number>;

    expect(() => deriveTacticalShapeEmphasis(emphasisFor(catalogRoles("4-4-2"), 10), broken))
      .toThrow(OrdinaryTacticalShapeError);
  });

  it("refuses a shape with no capacity at all", () => {
    const empty = Object.fromEntries(
      TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, 0]),
    ) as Record<TacticalShapeCapacity, number>;

    expect(() => deriveTacticalShapeEmphasis(empty, REFERENCE)).toThrow(OrdinaryTacticalShapeError);
  });
});
