import {
  getPlayerRoleProfile,
  roleCurrentAbility,
  rolePotentialAbility,
  type GameDate,
  type Player,
  type PlayerId,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerRatingScaleConfig,
  type PlayerStarRating,
} from "@game/domain";

import { derivePlayerPotentialProjection } from "./player-potential-projection.ts";

/** Public rating that exposes one global star value without numeric ability. */
export interface PublicPlayerStarAssessment {
  readonly stars: PlayerStarRating;
}

/** Derived public potential band; exact numeric role ability remains hidden. */
export interface PublicPlayerPotentialProjection {
  readonly lowerRating: PublicPlayerStarAssessment;
  readonly expectedRating: PublicPlayerStarAssessment;
  readonly upperRating: PublicPlayerStarAssessment;
}

/** Public current rating and age-aware potential projection. */
export interface PublicPlayerAssessment {
  readonly playerId: PlayerId;
  readonly currentRating: PublicPlayerStarAssessment;
  readonly potentialProjection: PublicPlayerPotentialProjection;
}

/**
 * Temporary internal bridge for economy/diagnostic callers owned by later
 * Phase 79D steps. Browser and framework-free read models never consume it.
 *
 * @deprecated Step 06/07 replace the remaining ceiling-only callers.
 */
export interface LegacyCeilingPlayerAssessment {
  readonly playerId: PlayerId;
  readonly currentRating: PublicPlayerStarAssessment;
  readonly potentialRating: PublicPlayerStarAssessment;
}

/** Stable failures raised when a public assessment cannot be derived safely. */
export type PublicPlayerAssessmentErrorCode =
  | "duplicate_player"
  | "missing_role_identity";

/** Error raised instead of guessing a missing player role. */
export class PublicPlayerAssessmentError extends Error {
  public readonly code: PublicPlayerAssessmentErrorCode;

  /** Creates one typed assessment error for callers and focused tests. */
  public constructor(code: PublicPlayerAssessmentErrorCode, message: string) {
    super(message);
    this.name = "PublicPlayerAssessmentError";
    this.code = code;
  }
}

/** Explicit validated scale plus the ordered players to assess. */
export interface DeriveLegacyCeilingPlayerAssessmentsInput {
  readonly ratingScale: PlayerRatingScaleConfig;
  readonly players: readonly Player[];
}

/** Complete caller-owned inputs for the canonical public projection. */
export interface DerivePublicPlayerAssessmentsInput
  extends DeriveLegacyCeilingPlayerAssessmentsInput {
  readonly currentDate: GameDate;
  readonly potentialProjectionPolicy: PlayerPotentialProjectionPolicyConfig;
}

/**
 * Derives absolute current rating and age-aware potential range.
 *
 * The caller supplies the validated content scale, projection policy, and
 * current date explicitly. No selected club or observer can influence it.
 */
export function derivePublicPlayerAssessments(
  input: DerivePublicPlayerAssessmentsInput,
): readonly PublicPlayerAssessment[];
/**
 * Keeps untouched economy/diagnostic callers compiling until their documented
 * Phase 79D owner steps adopt the same projection.
 *
 * @deprecated Supply the projection policy and current date.
 */
export function derivePublicPlayerAssessments(
  input: DeriveLegacyCeilingPlayerAssessmentsInput,
): readonly LegacyCeilingPlayerAssessment[];
export function derivePublicPlayerAssessments(
  input: DerivePublicPlayerAssessmentsInput | DeriveLegacyCeilingPlayerAssessmentsInput,
): readonly (PublicPlayerAssessment | LegacyCeilingPlayerAssessment)[] {
  assertUniquePlayers(input.players);

  return input.players.map((player) => {
    if (player.primaryRole === undefined) {
      throw new PublicPlayerAssessmentError(
        "missing_role_identity",
        `player role identity is required for public assessment: ${player.id}`,
      );
    }

    const profile = getPlayerRoleProfile(player.primaryRole);
    if ("potentialProjectionPolicy" in input) {
      const projection = derivePlayerPotentialProjection({
        player,
        currentDate: input.currentDate,
        policy: input.potentialProjectionPolicy,
        ratingScale: input.ratingScale,
      });
      return {
        playerId: player.id,
        currentRating: { stars: projection.currentRating },
        potentialProjection: {
          lowerRating: { stars: projection.conservativeLowerRating },
          expectedRating: { stars: projection.expectedRating },
          upperRating: { stars: projection.upperRating },
        },
      };
    }

    return {
      playerId: player.id,
      currentRating: {
        stars: ratingForAbility(
          Number(roleCurrentAbility(player.abilities, profile)),
          input.ratingScale,
        ),
      },
      potentialRating: {
        stars: ratingForAbility(
          Number(rolePotentialAbility(player.potential, profile)),
          input.ratingScale,
        ),
      },
    };
  });
}

function ratingForAbility(
  ability: number,
  scale: PlayerRatingScaleConfig,
): PlayerStarRating {
  let selected = scale.abilityThresholds[0];
  for (const threshold of scale.abilityThresholds) {
    if (ability < threshold.minimumAbilityInclusive) break;
    selected = threshold;
  }

  if (selected === undefined) {
    throw new Error("Validated player rating scale must contain an initial threshold");
  }
  return selected.rating;
}

function assertUniquePlayers(players: readonly Player[]): void {
  const seenPlayerIds = new Set<PlayerId>();
  for (const player of players) {
    if (seenPlayerIds.has(player.id)) {
      throw new PublicPlayerAssessmentError(
        "duplicate_player",
        `duplicate player in assessment list: ${player.id}`,
      );
    }
    seenPlayerIds.add(player.id);
  }
}
