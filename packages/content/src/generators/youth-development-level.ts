import { youthDevelopmentLevel, type ClubCategory, type YouthDevelopmentLevel } from "@game/domain";

/** Input for deriving one deterministic academy-development level. */
export interface DeriveYouthDevelopmentLevelInput {
  /** Division where the club plays. Division is the primary quality boundary. */
  readonly division: ClubCategory;
  /** Club reputation on the existing generated-club scale. */
  readonly clubReputation: number;
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
export function youthDevelopmentInterestingChance(level: YouthDevelopmentLevel): number {
  switch (Number(level)) {
    case 1:
      return 0.12;
    case 2:
      return 0.16;
    case 3:
      return 0.2;
    case 4:
      return 0.25;
    case 5:
      return 0.3;
    default:
      return 0.2;
  }
}

/** Score nudge used when allocating the scarce division-wide high/elite slots. */
export function youthDevelopmentRarityCandidateScoreModifier(level: YouthDevelopmentLevel): number {
  return (3 - Number(level)) * 0.08;
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
