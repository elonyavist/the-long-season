import type { MatchTacticsCalibrationConfig } from "@game/domain";

import { matchTacticsCalibration } from "../balance/match-tactics-calibration.ts";

/**
 * Ability weight keys mirrored as data so content does not import engine code.
 */
export type FakeAbilityWeightKey =
  | "goalkeeping.footwork"
  | "goalkeeping.goalkeeperPositioning"
  | "goalkeeping.handling"
  | "goalkeeping.reflexes"
  | "goalkeeping.rushingOut"
  | "mental.anticipation"
  | "mental.composure"
  | "mental.determination"
  | "mental.leadership"
  | "mental.positioning"
  | "mental.vision"
  | "physical.agility"
  | "physical.heading"
  | "physical.pace"
  | "physical.stamina"
  | "physical.strength"
  | "technical.crossing"
  | "technical.dribbling"
  | "technical.finishing"
  | "technical.freeKicks"
  | "technical.longPassing"
  | "technical.passing"
  | "technical.penalties"
  | "technical.tackling"
  | "technical.technique";

/** Team-strength department key mirrored as content data. */
export type FakeTeamStrengthDepartment = "attack" | "defense" | "goalkeeper" | "midfield";

/** Role-weight profile emitted by generated content. */
export interface FakeRoleWeightProfile {
  readonly roleKey: string;
  readonly department: FakeTeamStrengthDepartment;
  readonly abilityWeights: Readonly<Partial<Record<FakeAbilityWeightKey, number>>>;
}

/** State multiplier curve point emitted without importing engine code. */
export interface FakeStateMultiplierCurve {
  readonly maxValueInclusive: number;
  readonly multiplier: number;
}

/** Player-state multiplier curves shared by every generated world facade. */
export interface FakePlayerStateMultiplierCurves {
  readonly fitness?: readonly FakeStateMultiplierCurve[];
}

/** Match-engine config shape emitted without importing engine code. */
export interface FakeMatchEngineConfig {
  readonly minuteCount: number;
  readonly rates: {
    readonly baseOpportunityRatePerMinute: number;
    readonly maxOpportunityRatePerMinute: number;
  };
  readonly conversionBands: readonly {
    readonly bandKey: string;
    readonly minQualityInclusive: number;
    readonly maxQualityExclusive: number;
    readonly goalProbability: number;
  }[];
  readonly homeAdvantageFactor: number;
  readonly tacticalDistributionCaps: {
    readonly directness: { readonly minInclusive: number; readonly maxInclusive: number };
    readonly pressing: { readonly minInclusive: number; readonly maxInclusive: number };
    readonly width: { readonly minInclusive: number; readonly maxInclusive: number };
    readonly risk: { readonly minInclusive: number; readonly maxInclusive: number };
  };
}

/** Reusable match, role, and state configuration for generated content. */
export interface FakeGameplayConfig {
  readonly matchEngineConfig: FakeMatchEngineConfig;
  /**
   * Versioned match-tactics calibration that travels with this world.
   *
   * Unlike the mirrored shapes above, this is the real validated balance asset:
   * its type lives in domain, so content can hand it over without importing the
   * engine. It sits beside `matchEngineConfig` because a caller assembling a
   * match needs both and must not be able to pick up one without the other.
   */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  readonly roleWeights: Readonly<Record<string, FakeRoleWeightProfile>>;
  readonly stateMultiplierCurves: FakePlayerStateMultiplierCurves;
}

/**
 * Returns one deterministic immutable-by-value gameplay configuration.
 *
 * Both the focused single-league fixture and the complete domestic world use
 * this factory, so content has no copied match or role tuning path.
 */
export function createFakeGameplayConfig(): FakeGameplayConfig {
  return {
    matchEngineConfig: {
      minuteCount: 90,
      rates: {
        baseOpportunityRatePerMinute: 0.135,
        maxOpportunityRatePerMinute: 0.38,
      },
      conversionBands: [
        {
          bandKey: "low",
          minQualityInclusive: 0,
          maxQualityExclusive: 0.45,
          goalProbability: 0.058,
        },
        {
          bandKey: "medium",
          minQualityInclusive: 0.45,
          maxQualityExclusive: 0.65,
          goalProbability: 0.111,
        },
        {
          bandKey: "high",
          minQualityInclusive: 0.65,
          maxQualityExclusive: 1.01,
          goalProbability: 0.195,
        },
      ],
      homeAdvantageFactor: 1.1,
      tacticalDistributionCaps: {
        directness: { minInclusive: 0, maxInclusive: 1 },
        pressing: { minInclusive: 0, maxInclusive: 1 },
        width: { minInclusive: 0, maxInclusive: 1 },
        risk: { minInclusive: 0, maxInclusive: 1 },
      },
    },
    matchTacticsCalibration,
    roleWeights: {
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
    },
    stateMultiplierCurves: {
      fitness: [
        { maxValueInclusive: 39, multiplier: 0.88 },
        { maxValueInclusive: 59, multiplier: 0.94 },
        { maxValueInclusive: 79, multiplier: 0.98 },
        { maxValueInclusive: 100, multiplier: 1 },
      ],
    },
  };
}
