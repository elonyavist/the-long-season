import {
  youthDevelopmentLevel,
  type ClubCategory,
  type ClubCompetitiveTier,
  type ClubDevelopmentEnvironmentKey,
  type YouthDevelopmentLevel,
} from "@game/domain";

import { playerDevelopmentEnvironment } from "../balance/player-economy-calibration.ts";

/** Input for deriving one deterministic academy-development level. */
export interface DeriveYouthDevelopmentLevelInput {
  /** Division where the club plays. Division is the primary quality boundary. */
  readonly division: ClubCategory;
  /** Club reputation on the existing generated-club scale. */
  readonly clubReputation: number;
}

/** Club facts that select one frozen seven-state development environment. */
export interface ClubDevelopmentEnvironmentContext {
  readonly category: ClubCategory;
  readonly competitiveTier: ClubCompetitiveTier;
}

/** Resolves the versioned environment shared by youth-generation policies. */
export function developmentEnvironmentForClubContext(
  context: ClubDevelopmentEnvironmentContext,
): ClubDevelopmentEnvironmentKey {
  return playerDevelopmentEnvironment.environmentKeyByCategoryAndTier[
    context.category
  ][context.competitiveTier];
}

/**
 * Derives the club youth-development level on the shared `1..5` scale.
 *
 * Division supplies the base level and reputation only nudges it. A strong
 * third-division academy can therefore be better than its peers without
 * bypassing the third-division current-ability and rarity limits.
 */
export function deriveYouthDevelopmentLevel(input: DeriveYouthDevelopmentLevelInput): YouthDevelopmentLevel {
  return youthDevelopmentLevel(clampInteger(baseLevelForDivision(input.division) + reputationAdjustment(input.clubReputation), 1, 5));
}

/** Returns the small current-profile lane boost allowed for youth prospects. */
export function youthDevelopmentCurrentBoost(level: YouthDevelopmentLevel): number {
  switch (Number(level)) {
    case 1:
      return -0.04;
    case 2:
      return -0.02;
    case 3:
      return 0;
    case 4:
      return 0.03;
    case 5:
      return 0.05;
    default:
      return 0;
  }
}

/** Returns the routine interesting-prospect chance for one academy level. */
export function youthDevelopmentInterestingChance(
  environment: ClubDevelopmentEnvironmentKey,
): number {
  switch (environment) {
    case "very_poor":
      return 0.12;
    case "poor":
      return 0.15;
    case "limited":
      return 0.18;
    case "adequate":
      return 0.21;
    case "good":
      return 0.24;
    case "very_good":
      return 0.27;
    case "excellent":
      return 0.3;
    default:
      return assertNeverEnvironment(environment);
  }
}

/**
 * Returns a bounded per-candidate chance of producing a serious prospect.
 *
 * This nudge can improve the frequency of meaningful academy stories, but it
 * never grants a rating floor and never allocates the national exceptional
 * ceiling-six outcome.
 */
export function youthDevelopmentSeriousProspectChance(
  environment: ClubDevelopmentEnvironmentKey,
): number {
  switch (environment) {
    case "very_poor":
      return 0.01;
    case "poor":
      return 0.012;
    case "limited":
      return 0.015;
    case "adequate":
      return 0.018;
    case "good":
      return 0.022;
    case "very_good":
      return 0.026;
    case "excellent":
      return 0.03;
    default:
      return assertNeverEnvironment(environment);
  }
}

function baseLevelForDivision(division: ClubCategory): number {
  switch (division) {
    case "first_division":
      return 4;
    case "second_division":
      return 3;
    case "third_division":
      return 2;
  }
}

function reputationAdjustment(reputation: number): number {
  if (reputation >= 9) return 3;
  if (reputation >= 7) return 1;
  if (reputation >= 4) return 0;
  return -1;
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function assertNeverEnvironment(value: never): never {
  throw new Error(`Unsupported youth-development environment: ${String(value)}`);
}
