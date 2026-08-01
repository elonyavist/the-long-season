import type { ClubCategory, ClubCompetitiveTier } from "../entities/club.entity.ts";
import type { ClubId, SeasonId } from "../types/ids.ts";

/** Language-neutral public states ordered from weakest to strongest. */
export const CLUB_DEVELOPMENT_ENVIRONMENT_KEYS = [
  "very_poor",
  "poor",
  "limited",
  "adequate",
  "good",
  "very_good",
  "excellent",
] as const;

/** One public club-development environment on the accepted seven-state scale. */
export type ClubDevelopmentEnvironmentKey =
  typeof CLUB_DEVELOPMENT_ENVIRONMENT_KEYS[number];

/** Derived, non-persisted development context for one club and season. */
export interface ClubDevelopmentEnvironment {
  /** Version of the content policy used to derive this value. */
  readonly policyVersion: string;
  /** Frozen season to which the source tier belongs. */
  readonly seasonId: SeasonId;
  /** Club whose development context is represented. */
  readonly clubId: ClubId;
  /** Current season-frozen competition category. */
  readonly category: ClubCategory;
  /** Current season-frozen competitive tier. */
  readonly competitiveTier: ClubCompetitiveTier;
  /** Language-neutral public environment state. */
  readonly key: ClubDevelopmentEnvironmentKey;
  /** Integer multiplier used by later development consumers, never displayed directly. */
  readonly positiveGrowthMultiplierBasisPoints: number;
}

/** Typed failure raised before an invalid derived environment can reach consumers. */
export class ClubDevelopmentEnvironmentError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ClubDevelopmentEnvironmentError";
  }
}

/**
 * Validates and freezes one derived club-development environment.
 *
 * Future facilities and staff may become additional derivation inputs, but
 * they must feed this same public scale rather than create parallel states.
 */
export function createClubDevelopmentEnvironment(
  input: ClubDevelopmentEnvironment,
): ClubDevelopmentEnvironment {
  if (input.policyVersion.trim().length === 0) {
    throw new ClubDevelopmentEnvironmentError("development-environment policy version is required");
  }
  if (!CLUB_DEVELOPMENT_ENVIRONMENT_KEYS.includes(input.key)) {
    throw new ClubDevelopmentEnvironmentError(
      `invalid club-development environment key: ${String(input.key)}`,
    );
  }
  if (
    !Number.isSafeInteger(input.positiveGrowthMultiplierBasisPoints)
    || input.positiveGrowthMultiplierBasisPoints <= 0
  ) {
    throw new ClubDevelopmentEnvironmentError(
      "development-environment multiplier must be a positive safe integer",
    );
  }

  return Object.freeze({ ...input });
}
