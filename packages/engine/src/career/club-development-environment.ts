import {
  clubCompetitiveTierFor,
  createClubDevelopmentEnvironment,
  validatePlayerDevelopmentEnvironmentConfig,
  type CareerState,
  type ClubDevelopmentEnvironment,
  type ClubId,
  type PlayerDevelopmentEnvironmentConfig,
} from "@game/domain";

/** Stable failure reasons for deriving a club's season-frozen environment. */
export type ClubDevelopmentEnvironmentDerivationErrorCode =
  | "club_not_active"
  | "competitive_tier_policy_mismatch"
  | "competitive_tier_season_mismatch"
  | "development_environment_version_mismatch";

/** Typed failure raised instead of silently deriving from stale career facts. */
export class ClubDevelopmentEnvironmentDerivationError extends Error {
  public readonly code: ClubDevelopmentEnvironmentDerivationErrorCode;

  /** Creates one machine-readable derivation failure. */
  public constructor(
    code: ClubDevelopmentEnvironmentDerivationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ClubDevelopmentEnvironmentDerivationError";
    this.code = code;
  }
}

/** Inputs required to derive one current club-development environment. */
export interface DeriveClubDevelopmentEnvironmentInput {
  /** Validated career containing the active club and frozen tier snapshot. */
  readonly careerState: CareerState;
  /** Active club whose public development context is required. */
  readonly clubId: ClubId;
  /** Version-linked, content-owned seven-state environment policy. */
  readonly config: PlayerDevelopmentEnvironmentConfig;
}

/**
 * Derives one club's public development environment without changing gameplay.
 *
 * Category and competitive tier are the only Phase 80A inputs. Future staff
 * and facilities may extend this same derivation seam, but must not create an
 * independently persisted environment or history collection.
 */
export function deriveClubDevelopmentEnvironment(
  input: DeriveClubDevelopmentEnvironmentInput,
): ClubDevelopmentEnvironment {
  validatePlayerDevelopmentEnvironmentConfig(input.config);

  const { careerState, clubId, config } = input;
  const club = careerState.gameState.clubs[clubId];
  if (club === undefined || !careerState.gameState.clubIds.includes(clubId)) {
    throw new ClubDevelopmentEnvironmentDerivationError(
      "club_not_active",
      `club-development environment requires an active club: ${clubId}`,
    );
  }

  const frozenTierState = careerState.clubCompetitiveTierState;
  const currentSeasonId = careerState.gameState.calendar.currentSeasonId;
  if (frozenTierState.seasonId !== currentSeasonId) {
    throw new ClubDevelopmentEnvironmentDerivationError(
      "competitive_tier_season_mismatch",
      `club competitive tiers belong to ${frozenTierState.seasonId}, expected ${currentSeasonId}`,
    );
  }
  if (String(frozenTierState.policyVersion) !== config.competitiveTierPolicyVersion) {
    throw new ClubDevelopmentEnvironmentDerivationError(
      "competitive_tier_policy_mismatch",
      `club competitive-tier policy ${frozenTierState.policyVersion} does not match ${config.competitiveTierPolicyVersion}`,
    );
  }

  const stampedEnvironmentVersion =
    careerState.gameState.meta.calibrationVersions
      ?.playerDevelopmentEnvironmentVersion;
  if (stampedEnvironmentVersion !== config.version) {
    throw new ClubDevelopmentEnvironmentDerivationError(
      "development_environment_version_mismatch",
      `career development-environment version ${String(stampedEnvironmentVersion)} does not match ${config.version}`,
    );
  }

  const competitiveTier = clubCompetitiveTierFor(frozenTierState, clubId);
  const key = config.environmentKeyByCategoryAndTier[club.category][competitiveTier];

  return createClubDevelopmentEnvironment({
    policyVersion: config.version,
    seasonId: currentSeasonId,
    clubId,
    category: club.category,
    competitiveTier,
    key,
    positiveGrowthMultiplierBasisPoints:
      config.positiveGrowthMultiplierBasisPointsByKey[key],
  });
}
