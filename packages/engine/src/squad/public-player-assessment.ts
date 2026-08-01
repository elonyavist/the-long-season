import type {
  GameDate,
  Player,
  PlayerId,
  PlayerPotentialProjectionPolicyConfig,
  PlayerPotentialProjectionRoleFamily,
  PlayerRatingScaleConfig,
  PlayerStarRating,
} from "@game/domain";

import { derivePlayerPotentialProjection } from "./player-potential-projection.ts";

/** Public rating that exposes one global star value without numeric ability. */
export interface PublicPlayerStarAssessment {
  readonly stars: PlayerStarRating;
}

/**
 * Canonical safe assessment shared by every live-game player consumer.
 *
 * Numeric role abilities allow valuation and AI to use the same P50/upper
 * facts as the UI. The stored potential ceiling is deliberately absent.
 */
export interface PublicPlayerAssessment {
  readonly playerId: PlayerId;
  /** Exact career date whose player facts produced this assessment. */
  readonly assessedOn: GameDate;
  readonly age: number;
  readonly roleFamily: PlayerPotentialProjectionRoleFamily;
  readonly currentAbility: number;
  readonly p50Ability: number;
  readonly upperAbility: number;
  readonly currentRating: PublicPlayerStarAssessment;
  readonly p50Rating: PublicPlayerStarAssessment;
  readonly upperRating: PublicPlayerStarAssessment;
}

/** Complete caller-owned facts for one canonical public assessment. */
export interface DerivePublicPlayerAssessmentInput {
  readonly player: Player;
  readonly currentDate: GameDate;
  readonly potentialProjectionPolicy: PlayerPotentialProjectionPolicyConfig;
  readonly ratingScale: PlayerRatingScaleConfig;
}

/**
 * Derives one observer-independent current/P50/upper player assessment.
 *
 * The narrow projection owner may inspect the stored ceiling to enforce its
 * upper bound. This live-game Interface copies only safe public facts, making
 * accidental ceiling access impossible for UI, valuation, willingness, and
 * AI callers that accept `PublicPlayerAssessment`.
 */
export function derivePublicPlayerAssessment(
  input: DerivePublicPlayerAssessmentInput,
): PublicPlayerAssessment {
  const projection = derivePlayerPotentialProjection({
    player: input.player,
    currentDate: input.currentDate,
    policy: input.potentialProjectionPolicy,
    ratingScale: input.ratingScale,
  });

  return Object.freeze({
    playerId: projection.playerId,
    assessedOn: input.currentDate,
    age: projection.age,
    roleFamily: projection.roleFamily,
    currentAbility: projection.currentAbility,
    p50Ability: projection.p50Ability,
    upperAbility: projection.upperAbility,
    currentRating: Object.freeze({ stars: projection.currentRating }),
    p50Rating: Object.freeze({ stars: projection.p50Rating }),
    upperRating: Object.freeze({ stars: projection.upperRating }),
  });
}
