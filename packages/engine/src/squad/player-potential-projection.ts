import {
  getPlayerRoleProfile,
  roleCurrentAbility,
  rolePotentialAbility,
  validatePlayerPotentialProjectionPolicyConfig,
  type GameDate,
  type Player,
  type PlayerId,
  type PlayerPotentialProjectionAgeBand,
  type PlayerPotentialProjectionPolicyConfig,
  type PlayerPotentialProjectionRoleFamily,
  type PlayerRatingScaleConfig,
  type PlayerStarRating,
} from "@game/domain";

import { completedPlayerAge } from "../player-state/completed-player-age.ts";

/** Stable failures raised when canonical projection facts are incomplete. */
export type PlayerPotentialProjectionErrorCode =
  | "missing_role_identity"
  | "date_before_birth"
  | "age_band_not_found"
  | "invalid_rating_scale";

/** Typed projection failure raised instead of guessing a missing input. */
export class PlayerPotentialProjectionError extends Error {
  public readonly code: PlayerPotentialProjectionErrorCode;

  /** Creates one stable projection failure for adapters and focused tests. */
  public constructor(
    code: PlayerPotentialProjectionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PlayerPotentialProjectionError";
    this.code = code;
  }
}

/** Explicit canonical facts required by the headless projection owner. */
export interface DerivePlayerPotentialProjectionInput {
  readonly player: Player;
  readonly currentDate: GameDate;
  readonly policy: PlayerPotentialProjectionPolicyConfig;
  readonly ratingScale: PlayerRatingScaleConfig;
}

/**
 * Immutable age- and role-aware projection derived from current career facts.
 *
 * Numeric abilities remain engine facts for valuation and diagnostics. Public
 * read models should expose only the star fields added by the later integration
 * step.
 */
export interface PlayerPotentialProjection {
  readonly playerId: PlayerId;
  readonly age: number;
  readonly roleFamily: PlayerPotentialProjectionRoleFamily;
  readonly currentAbility: number;
  /** Statistical median endpoint from deterministic development evidence. */
  readonly p50Ability: number;
  /** High-upside public estimate; this is not the stored potential ceiling. */
  readonly upperAbility: number;
  /** Hidden canonical ceiling retained for diagnostics and defensive checks. */
  readonly storedCeilingAbility: number;
  readonly currentRating: PlayerStarRating;
  /** Public half-star presentation of the statistical median endpoint. */
  readonly p50Rating: PlayerStarRating;
  /** High-upside public star estimate; this is not a guaranteed maximum. */
  readonly upperRating: PlayerStarRating;
  /** Hidden canonical ceiling rating; public read models must not expose it. */
  readonly storedCeilingRating: PlayerStarRating;
}

/**
 * Derives one deterministic potential projection without persistence or fog.
 *
 * P50 and reachable-upper factors apply only to remaining role-ability room.
 * The internal stored potential remains the absolute ceiling and no selected
 * club, observer, reputation, contract, value, or form fact can affect the
 * result.
 */
export function derivePlayerPotentialProjection(
  input: DerivePlayerPotentialProjectionInput,
): PlayerPotentialProjection {
  validatePlayerPotentialProjectionPolicyConfig(input.policy);
  if (input.player.primaryRole === undefined) {
    throw new PlayerPotentialProjectionError(
      "missing_role_identity",
      `Player role identity is required for potential projection: ${input.player.id}`,
    );
  }
  if (input.currentDate < input.player.birthDate) {
    throw new PlayerPotentialProjectionError(
      "date_before_birth",
      `Potential projection date precedes player birth: ${input.player.id}`,
    );
  }

  const age = completedPlayerAge(input.player.birthDate, input.currentDate);
  const roleFamily: PlayerPotentialProjectionRoleFamily =
    input.player.primaryRole === "goalkeeper" ? "goalkeeper" : "outfield";
  const band = projectionBand(
    input.policy.ageBandsByRoleFamily[roleFamily],
    age,
    roleFamily,
  );
  const roleProfile = getPlayerRoleProfile(input.player.primaryRole);
  const currentAbility = Number(
    roleCurrentAbility(input.player.abilities, roleProfile),
  );
  const storedCeilingAbility = Math.max(
    currentAbility,
    Number(rolePotentialAbility(input.player.potential, roleProfile)),
  );
  const remainingRoom = storedCeilingAbility - currentAbility;
  const p50Ability = currentAbility + (
    remainingRoom * band.p50RealizationBasisPoints / 10_000
  );
  const upperAbility = Math.min(
    storedCeilingAbility,
    currentAbility + (
      remainingRoom * band.upperRealizationBasisPoints / 10_000
    ),
  );

  return Object.freeze({
    playerId: input.player.id,
    age,
    roleFamily,
    currentAbility,
    p50Ability,
    upperAbility,
    storedCeilingAbility,
    currentRating: ratingForAbility(currentAbility, input.ratingScale),
    p50Rating: ratingForAbility(p50Ability, input.ratingScale),
    upperRating: ratingForAbility(upperAbility, input.ratingScale),
    storedCeilingRating: ratingForAbility(
      storedCeilingAbility,
      input.ratingScale,
    ),
  });
}

/**
 * Finds the caller-validated age cell or reports an unsupported player age.
 *
 * Young and terminal policy ranges may cover multiple ages; every post-20 age
 * before the terminal deadline is selected from its own calibrated cell.
 */
function projectionBand(
  bands: readonly PlayerPotentialProjectionAgeBand[],
  age: number,
  roleFamily: PlayerPotentialProjectionRoleFamily,
): PlayerPotentialProjectionAgeBand {
  const band = bands.find(
    ({ minimumAge, maximumAge }) =>
      age >= minimumAge && age <= maximumAge,
  );
  if (band === undefined) {
    throw new PlayerPotentialProjectionError(
      "age_band_not_found",
      `Potential projection has no ${roleFamily} policy at age ${age}`,
    );
  }
  return band;
}

/** Maps one ability through the caller-supplied canonical global scale. */
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
    throw new PlayerPotentialProjectionError(
      "invalid_rating_scale",
      "Potential projection rating scale requires an initial threshold",
    );
  }
  return selected.rating;
}
