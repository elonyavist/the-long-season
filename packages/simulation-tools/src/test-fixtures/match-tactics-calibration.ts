import {
  CANONICAL_PLAYER_ROLES,
  MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_TASKS,
  type CanonicalPlayerRole,
  type MatchTacticsCalibrationConfig,
  type TacticalShapeCapacity,
  type TacticalShapeTask,
} from "@game/domain";

/**
 * A match-tactics calibration for simulation-tools tests.
 *
 * Simulation tools may not import content, so a test that needs a calibration
 * has to build one. It carries no claim about the shipped football numbers -
 * those are asserted in the content package that owns them - but it is *not*
 * flat, because a flat one cannot express the thing these tools measure.
 *
 * A calibration where every outfield role is worth the same on every task makes
 * every composition produce identical capacities by construction, so `4-4-2`
 * and `3-1-6` play byte-identical matches under it whatever the engine does.
 * A test written against that fixture cannot tell a working engine from the
 * defect this phase exists to remove. Three department profiles are the least
 * that distinguishes them: a defender is worth most where defenders are worth
 * most, and so on.
 *
 * The knob magnitudes track the shipped ones for the same reason. They decide
 * whether a tactic is a free win, and the audit gates that here: a fixture
 * carrying superseded exposures would fail the gate against a calibration
 * nobody ships, which says nothing about the game.
 *
 * @example
 * runTacticalShapeSeries({ ..., matchTacticsCalibration: matchTacticsCalibrationFixture() });
 */
export function matchTacticsCalibrationFixture(): MatchTacticsCalibrationConfig {
  const zeroTasks = uniformTaskValues(0);

  return {
    schemaVersion: MATCH_TACTICS_CALIBRATION_SCHEMA_VERSION,
    version: "match-tactics-simulation-tools-fixture",
    classification: "explicit_game_design_target",
    chanceActorSelection: {
      nonSetPieceAssistEligibilityBasisPoints: 7_512,
      shooterPropensityBasisPointsByRole: Object.fromEntries(
        CANONICAL_PLAYER_ROLES.map((role) => [role, role === "goalkeeper" ? 0 : 10_000]),
      ) as Readonly<Record<CanonicalPlayerRole, number>>,
    },
    tacticalShape: {
      outfieldRoleBudgetBasisPoints: FIXTURE_OUTFIELD_ROLE_BUDGET,
      taskAllocationBasisPointsByRole: Object.fromEntries(
        CANONICAL_PLAYER_ROLES.map((role) => [role, role === "goalkeeper" ? zeroTasks : taskValuesFor(role)]),
      ) as Readonly<Record<CanonicalPlayerRole, Readonly<Record<TacticalShapeTask, number>>>>,
      taskAbilityWeightsBasisPointsByTask: fixtureTaskAbilityWeights(),
      marginalContributionBasisPointsByRank: Array.from({ length: 11 }, (_, rank) => 10_000 - rank * 800),
      coordinationMultiplierBasisPointsBySuitability: {
        natural: 10_000,
        adapted: 9_200,
        weak: 7_800,
        invalid: 5_500,
      },
      channelPolicy: { halfChannelOwnShareBasisPoints: 7_500 },
      saturationReferenceMilliByTask: uniformTaskValues(20_000),
    },
    tacticalMatchup: {
      chainBottleneckWeightBasisPoints: 6_500,
      pressingContestWeightBasisPoints: 2_000,
    },
    tacticalSemantics: {
      routeAffinityBasisPointsByKnob: { directness: 3_000, pressing: 2_200, width: 3_200, risk: 0 },
      lateralFocusAffinityBasisPoints: 4_000,
      volumeBasisPointsByKnob: { directness: 900, pressing: 700, width: 500, risk: 1_800 },
      exposureBasisPointsByKnob: { directness: 1_600, pressing: 4_700, width: 5_300, risk: 1_400 },
      controlBasisPointsByKnob: { directness: 800, pressing: 1_200, width: 300, risk: 400 },
      commitmentBasisPointsByMentality: {
        very_defensive: 8_600,
        defensive: 9_300,
        balanced: 10_000,
        attacking: 10_800,
        very_attacking: 11_700,
      },
      scoreStateCommitmentBasisPoints: 550,
      shapeControlShareBasisPoints: 5_500,
      routeCapacitySeparationBasisPoints: 16_000,
      possessionChanceInfluenceBasisPoints: 5_600,
      routeQualityBiasBasisPoints: 2_500,
      routeSelectionSharpness: 3,
    },
    ownSquadTacticalPolicy: {
      profileFitShareBasisPoints: 8_000,
      profileFitReferenceBasisPointsByCapacity: fixtureCapacityValues(5_000),
      profileFitScaleBasisPointsByCapacity: fixtureCapacityValues(1_000),
      minimumCommitmentAdvantageBasisPoints: 100,
      minimumLateralFocusAdvantageBasisPoints: 500,
      profiles: [
        ownSquadProfile("balanced", "balanced"),
        ownSquadProfile("patient_possession", "balanced"),
        ownSquadProfile("high_press", "attacking"),
        ownSquadProfile("direct_transition", "balanced"),
        ownSquadProfile("wide_overload", "attacking"),
        ownSquadProfile("compact_counter", "defensive"),
      ],
    },
  };
}

function fixtureCapacityValues(
  value: number,
): Readonly<Record<TacticalShapeCapacity, number>> {
  return Object.fromEntries(
    TACTICAL_SHAPE_CAPACITIES.map((capacity) => [capacity, value]),
  ) as Readonly<Record<TacticalShapeCapacity, number>>;
}

function ownSquadProfile(
  profileKey: MatchTacticsCalibrationConfig["ownSquadTacticalPolicy"]["profiles"][number]["profileKey"],
  mentality: "balanced" | "attacking" | "defensive",
): MatchTacticsCalibrationConfig["ownSquadTacticalPolicy"]["profiles"][number] {
  return {
    profileKey,
    tactic: { mentality, directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5 },
    demandBasisPointsByCapacity: Object.fromEntries(
      TACTICAL_SHAPE_CAPACITIES.map((capacity, index) => [capacity, index < 4 ? 834 : 833]),
    ) as Readonly<Record<TacticalShapeCapacity, number>>,
  };
}

/** Gives every task the same number, for a calibration that isolates one variable. */
function uniformTaskValues(value: number): Readonly<Record<TacticalShapeTask, number>> {
  return Object.fromEntries(
    TACTICAL_SHAPE_TASKS.map((task) => [task, value]),
  ) as Readonly<Record<TacticalShapeTask, number>>;
}

/**
 * What one outfield role is worth on each task.
 *
 * Three profiles, one per department, and every weight is strictly positive so
 * no role leaves a task empty. The shape of the profile is the only claim: a
 * defender is worth most where a defence works and least in the opposition box,
 * an attacker the reverse, and a midfielder is the one who links them.
 */
function taskValuesFor(role: CanonicalPlayerRole): Readonly<Record<TacticalShapeTask, number>> {
  return DEPARTMENT_TASK_PROFILE[departmentOf(role)];
}

/** Which of the three profiles an outfield role uses. */
function departmentOf(role: CanonicalPlayerRole): "defence" | "midfield" | "attack" {
  if (DEFENSIVE_ROLES.has(role)) return "defence";
  if (ATTACKING_ROLES.has(role)) return "attack";
  return "midfield";
}

const DEFENSIVE_ROLES = new Set<CanonicalPlayerRole>([
  "center_back",
  "right_full_back",
  "left_full_back",
  "defensive_midfielder",
]);

const ATTACKING_ROLES = new Set<CanonicalPlayerRole>([
  "striker",
  "right_winger",
  "left_winger",
  "attacking_midfielder",
]);

const FIXTURE_OUTFIELD_ROLE_BUDGET = 42_000;

function fixtureTaskAbilityWeights(): MatchTacticsCalibrationConfig["tacticalShape"]["taskAbilityWeightsBasisPointsByTask"] {
  const row = {
    "technical.passing": 2_500,
    "technical.technique": 2_500,
    "mental.anticipation": 2_500,
    "mental.positioning": 2_500,
  } as const;
  return Object.fromEntries(TACTICAL_SHAPE_TASKS.map((task) => [task, row])) as
    MatchTacticsCalibrationConfig["tacticalShape"]["taskAbilityWeightsBasisPointsByTask"];
}

const DEPARTMENT_TASK_PROFILE: Readonly<
  Record<"defence" | "midfield" | "attack", Readonly<Record<TacticalShapeTask, number>>>
> = {
  defence: {
    build_up: 5_652,
    central_progression: 1_739,
    lateral_progression: 2_609,
    final_third_presence: 696,
    pressing_cohesion: 3_913,
    central_coverage: 6_087,
    lateral_coverage: 5_218,
    box_protection: 7_391,
    counter_threat: 1_304,
    rest_defence: 7_391,
  },
  midfield: {
    build_up: 4_941,
    central_progression: 6_176,
    lateral_progression: 4_941,
    final_third_presence: 2_059,
    pressing_cohesion: 5_765,
    central_coverage: 4_529,
    lateral_coverage: 4_118,
    box_protection: 2_471,
    counter_threat: 3_706,
    rest_defence: 3_294,
  },
  attack: {
    build_up: 2_333,
    central_progression: 4_083,
    lateral_progression: 4_667,
    final_third_presence: 9_917,
    pressing_cohesion: 6_417,
    central_coverage: 1_400,
    lateral_coverage: 1_750,
    box_protection: 933,
    counter_threat: 9_333,
    rest_defence: 1_167,
  },
};
