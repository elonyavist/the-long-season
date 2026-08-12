import {
  getPlayerRoleProfile,
  isPotentialAtLeastCurrent,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubCategory,
  type PlayerAbilities,
  type PlayerRatingScaleConfig,
  type PlayerRole,
  type PlayerStarRating,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import {
  getGeneratedPlayerArchetype,
  resolveGeneratedCurrentAbilityRarityLane,
  resolveGeneratedCurrentQualityProfile,
  type GeneratedPlayerArchetypeKey,
  type GeneratedRoutinePlayerArchetypeKey,
} from "./player-archetypes.ts";
import {
  resolveRareProdigyCurrentRatingGuardrail,
  type CurrentAbilityRarityLane,
} from "./player-current-ability-bands.ts";
import {
  buildCurrentPlayerProfileAtBandPosition,
  buildRoutineCurrentPlayerProfile,
  type BuildCurrentPlayerProfileInput,
} from "./player-current-profile-policy.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";
import {
  allocateCappedReachablePotential,
  allocatePotentialToContextualTarget,
  allocateReachablePotential,
  materializeContextualProspectPotentialTarget,
  maximumReachableRolePotentialAbility,
  maximumRoleAbilityForStarRating,
  maximumSupportedRolePotentialAbility,
  minimumRoleAbilityForStarRating,
  selectContextualProspectCeilingCandidate,
  starRatingForRoleAbility,
  type ContextualProspectCeilingConstraint,
  type ContextualProspectPotentialTarget,
} from "./player-potential-allocation.ts";
import {
  contextualProspectClassForArchetype,
  type BandedContextualProspectClass,
  type ContextualProspectClass,
} from "./player-potential-rarity.ts";

export type { ContextualProspectCeilingConstraint } from "./player-potential-allocation.ts";

/** Required stored-ceiling gap for explicit prospects aged 15 through 20. */
const EXPLICIT_YOUNG_PROSPECT_RATING_GAP = 1;

/** Input shared by every generated-player composition root. */
export interface BuildContextualProspectJointProfileInput {
  /** Stable seed controlling current and potential substreams. */
  readonly seed: string;
  /** Stable generated player key. */
  readonly playerKey: string;
  /** Division where the player is generated. */
  readonly division: ClubCategory;
  /** Dynamic club tier frozen for the generation season. */
  readonly clubTier: PlayerGenerationClubTier;
  /** Primary football role used by both current and potential evaluation. */
  readonly role: PlayerRole;
  /** Whole-year age at the generation reference date. */
  readonly ageYears: number;
  /** Archetype owning both current-quality and prospect-class semantics. */
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
  /** Bounded caller nudge; explicit prospect classes still own their current lane. */
  readonly requestedCurrentAbilityLane: CurrentAbilityRarityLane;
  /** Versioned scale shared by construction and public assessment. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Semantic absolute-ceiling constraint allocated by the world owner. */
  readonly ceilingConstraint: ContextualProspectCeilingConstraint;
  /** Small squad-depth adjustment applied inside the resolved current bands. */
  readonly slotDepthAdjustment?: number;
  /**
   * Stable authored floor for a selected `normal_youth` academy lane.
   * Composition roots decide the lane; this owner only allocates it without
   * creating a second potential formula.
   */
  readonly routineYouthMinimumRolePotentialAbility?: number;
}

/** Successful current-and-potential construction for a routine player. */
export interface RoutinePlayerJointProfile {
  readonly kind: "routine";
  readonly prospectClass: "routine";
  readonly current: PlayerAbilities;
  readonly potential: PlayerAbilities;
}

/** Successful ceiling-first construction for an explicit contextual prospect. */
export interface ExplicitProspectJointProfile {
  readonly kind: "contextual_prospect";
  readonly prospectClass: BandedContextualProspectClass;
  readonly current: PlayerAbilities;
  readonly potential: PlayerAbilities;
  readonly selectedCeiling: ContextualProspectPotentialTarget;
}

/** Complete joint-profile output consumed by generation roots. */
export type ContextualProspectJointProfile =
  | RoutinePlayerJointProfile
  | ExplicitProspectJointProfile;

/** Resolved role-current band included in typed construction failures. */
export interface ContextualProspectCurrentBand {
  readonly minimumRoleAbility: number;
  readonly maximumRoleAbility: number;
  readonly minimumRating: PlayerStarRating;
  readonly maximumRating: PlayerStarRating;
}

/** Structured context carried by every joint-profile policy failure. */
export interface ContextualProspectJointProfileErrorContext {
  readonly ageYears: number;
  readonly division: ClubCategory;
  readonly clubTier: PlayerGenerationClubTier;
  readonly role: PlayerRole;
  readonly prospectClass: BandedContextualProspectClass;
  readonly currentBand: ContextualProspectCurrentBand;
  readonly ceilingTarget: ContextualProspectPotentialTarget;
  readonly requiredRatingGap: number;
}

/** Closed failure reasons for contextual current-and-ceiling construction. */
export type ContextualProspectJointProfileErrorCode =
  | "unsupported_rare_prodigy_placement"
  | "empty_ceiling_ability_interval"
  | "empty_current_envelope"
  | "potential_allocation_mismatch";

/** Typed policy failure that prevents silent current or ceiling mutation. */
export class ContextualProspectJointProfileError extends Error {
  public readonly code: ContextualProspectJointProfileErrorCode;
  public readonly context: ContextualProspectJointProfileErrorContext;

  public constructor(
    code: ContextualProspectJointProfileErrorCode,
    context: ContextualProspectJointProfileErrorContext,
    detail: string,
  ) {
    super(
      `${detail}; age=${context.ageYears}; division=${context.division}; `
        + `clubTier=${context.clubTier}; role=${context.role}; `
        + `prospectClass=${context.prospectClass}; `
        + `currentBand=${context.currentBand.minimumRoleAbility.toFixed(3)}..`
        + `${context.currentBand.maximumRoleAbility.toFixed(3)}; `
        + `ceiling=${context.ceilingTarget.ceilingRating}★/`
        + `${context.ceilingTarget.rolePotentialAbility.toFixed(3)}; `
        + `requiredGap=${context.requiredRatingGap}★`,
    );
    this.name = "ContextualProspectJointProfileError";
    this.code = code;
    this.context = context;
  }
}

/** Feasible band-position interval for one already selected explicit ceiling. */
export interface ContextualProspectCurrentEnvelope {
  readonly minimumBandPosition: number;
  readonly maximumBandPosition: number;
  readonly currentBand: ContextualProspectCurrentBand;
  readonly requiredRatingGap: number;
}

/** Exact ability interval available inside one already selected ceiling rating. */
export interface ContextualProspectCeilingAbilityInterval {
  readonly ceilingRating: PlayerStarRating;
  readonly minimumRolePotentialAbility: number;
  readonly maximumRolePotentialAbility: number;
  readonly maximumCurrentBandPosition: number;
  readonly currentBand: ContextualProspectCurrentBand;
  readonly requiredRatingGap: number;
}

/**
 * Builds current and stored potential through one deterministic policy owner.
 *
 * Explicit prospects select their absolute ceiling first. Their current profile
 * is then authored inside the intersection of the role bands, the reachable
 * family-growth path, any rare-prodigy guardrail, and the required public-star
 * gap. Routine players keep their legitimate plateau-capable growth policy.
 */
export function buildContextualProspectJointProfile(
  input: BuildContextualProspectJointProfileInput,
): ContextualProspectJointProfile {
  const prospectClass = contextualProspectClassForArchetype(input.archetypeKey);
  if (prospectClass === "routine") {
    return buildRoutineJointProfile(input);
  }

  const ceilingSelectionInput = {
    seed: input.seed,
    playerKey: input.playerKey,
    division: input.division,
    prospectClass,
    ratingScale: input.ratingScale,
    ceilingConstraint: input.ceilingConstraint,
  };
  const ceilingCandidate = selectContextualProspectCeilingCandidate(
    ceilingSelectionInput,
  );
  const ceilingAbilityInterval = deriveContextualProspectCeilingAbilityInterval(
    input,
    ceilingCandidate.ceilingRating,
  );
  const selectedCeiling = materializeContextualProspectPotentialTarget({
    candidate: ceilingCandidate,
    role: input.role,
    ratingScale: input.ratingScale,
    maximumFeasibleRolePotentialAbility:
      ceilingAbilityInterval.maximumRolePotentialAbility,
  });
  const envelope = deriveContextualProspectCurrentEnvelope(
    input,
    selectedCeiling,
    ceilingAbilityInterval,
  );
  const currentBandPosition = sampleCurrentBandPosition(input, selectedCeiling, envelope);
  const current = buildCurrentAtBandPosition(input, prospectClass, currentBandPosition);

  let potential: PlayerAbilities;
  try {
    potential = allocatePotentialToContextualTarget({
      seed: input.seed,
      playerKey: input.playerKey,
      abilities: current,
      ageYears: input.ageYears,
      role: input.role,
      division: input.division,
      clubTier: input.clubTier,
      potentialClass: getGeneratedPlayerArchetype(input.archetypeKey).potentialClass,
      ratingScale: input.ratingScale,
      target: selectedCeiling,
    });
  } catch (error) {
    throw new ContextualProspectJointProfileError(
      "potential_allocation_mismatch",
      errorContext(input, prospectClass, selectedCeiling, envelope),
      error instanceof Error ? error.message : "Contextual potential allocation failed",
    );
  }

  assertJointProfileResult(
    input,
    prospectClass,
    selectedCeiling,
    envelope,
    current,
    potential,
  );
  return {
    kind: "contextual_prospect",
    prospectClass,
    current,
    potential,
    selectedCeiling,
  };
}

/**
 * Derives the exact ceiling-ability interval before sampling current ability.
 *
 * The upper edge comes from the strongest current profile still admitted by
 * the star gap, rare guardrail, authored template and age/family growth caps.
 * Exact ceiling variation can therefore survive inside a half-star without
 * ever producing a target that only a retry or post-hoc clamp could rescue.
 *
 * @internal Generation roots consume `buildContextualProspectJointProfile`.
 */
export function deriveContextualProspectCeilingAbilityInterval(
  input: BuildContextualProspectJointProfileInput,
  ceilingRating: PlayerStarRating,
): ContextualProspectCeilingAbilityInterval {
  const prospectClass = contextualProspectClassForArchetype(input.archetypeKey);
  if (prospectClass === "routine") {
    throw new Error("Routine players do not have an explicit contextual ceiling interval");
  }

  const candidateTarget = targetForErrorContext(input, ceilingRating);
  if (isUnsupportedFirstDivisionRarePlacement(input, prospectClass)) {
    const band = contextualCurrentBandSnapshot(input, prospectClass);
    throw new ContextualProspectJointProfileError(
      "unsupported_rare_prodigy_placement",
      errorContext(input, prospectClass, candidateTarget, band),
      "First-division rare prodigies require a playoff or title-contending club",
    );
  }
  const policy = contextualCurrentPolicySnapshot(input, prospectClass, ceilingRating);
  const context = errorContext(input, prospectClass, candidateTarget, policy);

  const maximumBandPosition = lastBandPositionSatisfying((bandPosition) => {
    const current = buildCurrentAtBandPosition(input, prospectClass, bandPosition);
    return Number(roleCurrentAbility(current, policy.roleProfile))
      <= policy.ratingBounds.maximumRoleAbility;
  });
  if (maximumBandPosition === undefined) {
    throw new ContextualProspectJointProfileError(
      "empty_ceiling_ability_interval",
      context,
      "No authored current profile satisfies the ceiling's current-rating upper bound",
    );
  }

  const maximumCurrent = buildCurrentAtBandPosition(
    input,
    prospectClass,
    maximumBandPosition,
  );
  const maximumCurrentRoleAbility = Number(
    roleCurrentAbility(maximumCurrent, policy.roleProfile),
  );
  const minimumRolePotentialAbility = minimumRoleAbilityForStarRating(
    input.ratingScale,
    ceilingRating,
  ) + CEILING_ABILITY_INTERIOR_MARGIN;
  const maximumRolePotentialAbility = Math.min(
    maximumRoleAbilityForStarRating(input.ratingScale, ceilingRating)
      - CEILING_ABILITY_INTERIOR_MARGIN,
    maximumSupportedRolePotentialAbility(input.role),
    maximumReachableRolePotentialAbility({
      abilities: maximumCurrent,
      ageYears: input.ageYears,
      role: input.role,
    }),
  );

  if (
    maximumCurrentRoleAbility + ROLE_ABILITY_EPSILON
      < policy.ratingBounds.minimumRoleAbility
    || minimumRolePotentialAbility
      > maximumRolePotentialAbility + ROLE_ABILITY_EPSILON
  ) {
    throw new ContextualProspectJointProfileError(
      "empty_ceiling_ability_interval",
      context,
      `No exact ${ceilingRating}★ ceiling fits the feasible interval `
        + `${minimumRolePotentialAbility.toFixed(3)}..`
        + `${maximumRolePotentialAbility.toFixed(3)}`,
    );
  }

  return {
    ceilingRating,
    minimumRolePotentialAbility,
    maximumRolePotentialAbility,
    maximumCurrentBandPosition: maximumBandPosition,
    currentBand: policy.currentBand,
    requiredRatingGap: policy.requiredRatingGap,
  };
}

/**
 * Derives the non-empty current construction interval for one fixed ceiling.
 *
 * This deterministic policy seam is exported from the module so exhaustive
 * tests can evaluate every supported half-star target, rather than relying on
 * a lucky sampled seed.
 *
 * @internal Generation roots consume `buildContextualProspectJointProfile`.
 */
export function deriveContextualProspectCurrentEnvelope(
  input: BuildContextualProspectJointProfileInput,
  selectedCeiling: ContextualProspectPotentialTarget,
  ceilingAbilityInterval: ContextualProspectCeilingAbilityInterval,
): ContextualProspectCurrentEnvelope {
  const prospectClass = contextualProspectClassForArchetype(input.archetypeKey);
  if (prospectClass === "routine") {
    throw new Error("Routine players do not have an explicit contextual current envelope");
  }

  if (selectedCeiling.ceilingRating !== ceilingAbilityInterval.ceilingRating) {
    throw new Error(
      `Ceiling interval ${ceilingAbilityInterval.ceilingRating}★ does not match `
        + `selected target ${selectedCeiling.ceilingRating}★`,
    );
  }
  const roleProfile = getPlayerRoleProfile(input.role);
  const ratingBounds = currentRatingBounds(
    input,
    prospectClass,
    selectedCeiling.ceilingRating,
    ceilingAbilityInterval.requiredRatingGap,
  );
  const context = errorContext(
    input,
    prospectClass,
    selectedCeiling,
    ceilingAbilityInterval,
  );

  const minimumBandPosition = firstBandPositionSatisfying((bandPosition) => {
    const current = buildCurrentAtBandPosition(input, prospectClass, bandPosition);
    const currentRoleAbility = Number(roleCurrentAbility(current, roleProfile));
    return currentRoleAbility >= ratingBounds.minimumRoleAbility
      && maximumReachableRolePotentialAbility({
        abilities: current,
        ageYears: input.ageYears,
        role: input.role,
      }) >= selectedCeiling.rolePotentialAbility;
  });
  const maximumBandPosition = ceilingAbilityInterval.maximumCurrentBandPosition;

  if (
    minimumBandPosition === undefined
    || minimumBandPosition > maximumBandPosition + BAND_POSITION_EPSILON
  ) {
    throw new ContextualProspectJointProfileError(
      "empty_current_envelope",
      context,
      `No current profile satisfies reachable=${selectedCeiling.rolePotentialAbility.toFixed(3)} `
        + `and allowed=${ratingBounds.minimumRoleAbility.toFixed(3)}..`
        + `${ratingBounds.maximumRoleAbility.toFixed(3)}`,
    );
  }

  return {
    minimumBandPosition,
    maximumBandPosition,
    currentBand: ceilingAbilityInterval.currentBand,
    requiredRatingGap: ceilingAbilityInterval.requiredRatingGap,
  };
}

function buildRoutineJointProfile(
  input: BuildContextualProspectJointProfileInput,
): RoutinePlayerJointProfile {
  if (
    input.routineYouthMinimumRolePotentialAbility !== undefined
    && input.archetypeKey !== "normal_youth"
  ) {
    throw new Error(
      `Routine-youth runway cannot apply to archetype ${input.archetypeKey}`,
    );
  }
  const current = buildRoutineCurrentPlayerProfile({
    ...currentProfileInput(input),
    archetypeKey: routineArchetypeKey(input.archetypeKey),
  });
  const potentialInput = {
    seed: input.seed,
    playerKey: input.playerKey,
    abilities: current,
    ageYears: input.ageYears,
    role: input.role,
    division: input.division,
    clubTier: input.clubTier,
    potentialClass: getGeneratedPlayerArchetype(input.archetypeKey).potentialClass,
  };

  let potential: PlayerAbilities;
  switch (input.ceilingConstraint.kind) {
    case "policy":
      potential = allocateReachablePotential({
        ...potentialInput,
        ...(input.routineYouthMinimumRolePotentialAbility === undefined
          ? {}
          : {
              minimumRolePotentialAbility:
                input.routineYouthMinimumRolePotentialAbility,
            }),
      });
      break;
    case "at_least_rating":
      potential = allocateReachablePotential({
        ...potentialInput,
        minimumRolePotentialAbility: minimumRoleAbilityForStarRating(
          input.ratingScale,
          input.ceilingConstraint.rating,
        ),
      });
      break;
    case "below_rating":
      potential = allocateCappedReachablePotential({
        ...potentialInput,
        maximumRolePotentialAbility:
          minimumRoleAbilityForStarRating(
            input.ratingScale,
            input.ceilingConstraint.rating,
          ) - 0.001,
      });
      break;
  }

  return { kind: "routine", prospectClass: "routine", current, potential };
}

function routineArchetypeKey(
  archetypeKey: GeneratedPlayerArchetypeKey,
): GeneratedRoutinePlayerArchetypeKey {
  switch (archetypeKey) {
    case "senior_regular":
    case "category_starter":
    case "category_star":
    case "veteran_drop_down":
    case "normal_youth":
      return archetypeKey;
    case "good_prospect":
    case "serious_prospect":
    case "rare_prodigy":
      throw new Error(`Explicit prospect cannot use the routine current branch: ${archetypeKey}`);
  }
}

function buildCurrentAtBandPosition(
  input: BuildContextualProspectJointProfileInput,
  prospectClass: BandedContextualProspectClass,
  bandPosition: number,
): PlayerAbilities {
  const rarityLane = currentLaneForExplicitProspect(prospectClass);
  return buildCurrentPlayerProfileAtBandPosition({
    ...currentProfileInput(input),
    rarityLane,
    currentQualityProfile: resolveGeneratedCurrentQualityProfile({
      archetypeKey: input.archetypeKey,
      effectiveRarityLane: rarityLane,
    }),
    bandPosition,
    minimumBandPolicy: "ceiling_conditioned_raw",
  });
}

function currentProfileInput(
  input: BuildContextualProspectJointProfileInput,
): Omit<BuildCurrentPlayerProfileInput, "currentQualityProfile"> {
  return {
    seed: input.seed,
    playerKey: input.playerKey,
    division: input.division,
    clubTier: input.clubTier,
    role: input.role,
    ageYears: input.ageYears,
    rarityLane: resolveGeneratedCurrentAbilityRarityLane({
      archetypeKey: input.archetypeKey,
      requestedLane: input.requestedCurrentAbilityLane,
    }),
    ...(input.slotDepthAdjustment === undefined
      ? {}
      : { slotDepthAdjustment: input.slotDepthAdjustment }),
  };
}

function currentLaneForExplicitProspect(
  prospectClass: BandedContextualProspectClass,
): CurrentAbilityRarityLane {
  switch (prospectClass) {
    case "interesting":
    case "serious":
      return "normal";
    case "rare":
      return "exceptional";
  }
}

function currentRatingBounds(
  input: BuildContextualProspectJointProfileInput,
  prospectClass: BandedContextualProspectClass,
  ceilingRating: PlayerStarRating,
  requiredRatingGap: number,
): Readonly<{ minimumRoleAbility: number; maximumRoleAbility: number }> {
  const maximumCurrentRating = supportedRatingAtOffset(
    input.ratingScale,
    ceilingRating,
    -requiredRatingGap,
  );
  let minimumRoleAbility = 0;
  let maximumRoleAbility = maximumRoleAbilityForStarRating(
    input.ratingScale,
    maximumCurrentRating,
  );

  if (prospectClass === "rare") {
    const guardrail = resolveRareProdigyCurrentRatingGuardrail({
      division: input.division,
      clubTier: input.clubTier,
      ageYears: input.ageYears,
    });
    minimumRoleAbility = minimumRoleAbilityForStarRating(
      input.ratingScale,
      guardrail.minimumRating,
    );
    maximumRoleAbility = Math.min(
      maximumRoleAbility,
      maximumRoleAbilityForStarRating(input.ratingScale, guardrail.maximumRating),
    );
  }

  return { minimumRoleAbility, maximumRoleAbility };
}

function contextualCurrentPolicySnapshot(
  input: BuildContextualProspectJointProfileInput,
  prospectClass: BandedContextualProspectClass,
  ceilingRating: PlayerStarRating,
): Readonly<{
  readonly currentBand: ContextualProspectCurrentBand;
  readonly requiredRatingGap: number;
  readonly ratingBounds: Readonly<{
    readonly minimumRoleAbility: number;
    readonly maximumRoleAbility: number;
  }>;
  readonly roleProfile: ReturnType<typeof getPlayerRoleProfile>;
}> {
  const band = contextualCurrentBandSnapshot(input, prospectClass);
  return {
    ...band,
    ratingBounds: currentRatingBounds(
      input,
      prospectClass,
      ceilingRating,
      band.requiredRatingGap,
    ),
  };
}

function contextualCurrentBandSnapshot(
  input: BuildContextualProspectJointProfileInput,
  prospectClass: BandedContextualProspectClass,
): Readonly<{
  readonly currentBand: ContextualProspectCurrentBand;
  readonly requiredRatingGap: number;
  readonly roleProfile: ReturnType<typeof getPlayerRoleProfile>;
}> {
  const minimumCurrent = buildCurrentAtBandPosition(input, prospectClass, 0);
  const maximumCurrent = buildCurrentAtBandPosition(input, prospectClass, 1);
  const roleProfile = getPlayerRoleProfile(input.role);
  const currentBand = currentBandFromEndpoints(
    minimumCurrent,
    maximumCurrent,
    roleProfile,
    input.ratingScale,
  );
  const requiredRatingGap = isYoungExplicitProspect(input.ageYears)
    ? EXPLICIT_YOUNG_PROSPECT_RATING_GAP
    : 0;
  return {
    currentBand,
    requiredRatingGap,
    roleProfile,
  };
}

function targetForErrorContext(
  input: BuildContextualProspectJointProfileInput,
  ceilingRating: PlayerStarRating,
): ContextualProspectPotentialTarget {
  return {
    ceilingRating,
    rolePotentialAbility: minimumRoleAbilityForStarRating(
      input.ratingScale,
      ceilingRating,
    ) + CEILING_ABILITY_INTERIOR_MARGIN,
  };
}

function supportedRatingAtOffset(
  ratingScale: PlayerRatingScaleConfig,
  rating: PlayerStarRating,
  offset: number,
): PlayerStarRating {
  const expected = rating + offset;
  const supported = ratingScale.supportedRatings.find((candidate) => candidate === expected);
  if (supported === undefined) {
    throw new Error(`Rating scale cannot apply offset ${offset} to ${rating}`);
  }
  return supported;
}

function currentBandFromEndpoints(
  minimumCurrent: PlayerAbilities,
  maximumCurrent: PlayerAbilities,
  roleProfile: ReturnType<typeof getPlayerRoleProfile>,
  ratingScale: PlayerRatingScaleConfig,
): ContextualProspectCurrentBand {
  const minimumRoleAbility = Number(roleCurrentAbility(minimumCurrent, roleProfile));
  const maximumRoleAbility = Number(roleCurrentAbility(maximumCurrent, roleProfile));
  return {
    minimumRoleAbility,
    maximumRoleAbility,
    minimumRating: starRatingForRoleAbility(minimumRoleAbility, ratingScale),
    maximumRating: starRatingForRoleAbility(maximumRoleAbility, ratingScale),
  };
}

function sampleCurrentBandPosition(
  input: BuildContextualProspectJointProfileInput,
  selectedCeiling: ContextualProspectPotentialTarget,
  envelope: ContextualProspectCurrentEnvelope,
): number {
  const rng = deriveRng(
    input.seed,
    "player-contextual-prospect-current-envelope",
    input.playerKey,
    input.division,
    input.clubTier,
    input.role,
    selectedCeiling.ceilingRating,
  );
  const width = Math.max(0, envelope.maximumBandPosition - envelope.minimumBandPosition);
  const margin = Math.min(width / 4, BAND_POSITION_INTERIOR_MARGIN);
  const minimum = envelope.minimumBandPosition + margin;
  const maximum = envelope.maximumBandPosition - margin;
  return minimum + rng.nextFloat() * Math.max(0, maximum - minimum);
}

function firstBandPositionSatisfying(
  predicate: (bandPosition: number) => boolean,
): number | undefined {
  if (predicate(0)) return 0;
  if (!predicate(1)) return undefined;

  let lower = 0;
  let upper = 1;
  for (let iteration = 0; iteration < BAND_POSITION_SEARCH_ITERATIONS; iteration += 1) {
    const midpoint = (lower + upper) / 2;
    if (predicate(midpoint)) upper = midpoint;
    else lower = midpoint;
  }
  return upper;
}

function lastBandPositionSatisfying(
  predicate: (bandPosition: number) => boolean,
): number | undefined {
  if (predicate(1)) return 1;
  if (!predicate(0)) return undefined;

  let lower = 0;
  let upper = 1;
  for (let iteration = 0; iteration < BAND_POSITION_SEARCH_ITERATIONS; iteration += 1) {
    const midpoint = (lower + upper) / 2;
    if (predicate(midpoint)) lower = midpoint;
    else upper = midpoint;
  }
  return lower;
}

function assertJointProfileResult(
  input: BuildContextualProspectJointProfileInput,
  prospectClass: BandedContextualProspectClass,
  selectedCeiling: ContextualProspectPotentialTarget,
  envelope: ContextualProspectCurrentEnvelope,
  current: PlayerAbilities,
  potential: PlayerAbilities,
): void {
  const roleProfile = getPlayerRoleProfile(input.role);
  const currentRating = starRatingForRoleAbility(
    Number(roleCurrentAbility(current, roleProfile)),
    input.ratingScale,
  );
  const potentialRoleAbility = Number(rolePotentialAbility(potential, roleProfile));
  const potentialRating = starRatingForRoleAbility(
    potentialRoleAbility,
    input.ratingScale,
  );
  const valid = isPotentialAtLeastCurrent(current, potential)
    && potentialRating === selectedCeiling.ceilingRating
    && Math.abs(potentialRoleAbility - selectedCeiling.rolePotentialAbility)
      <= SELECTED_CEILING_MATCH_TOLERANCE
    && potentialRoleAbility <= maximumRoleAbilityForStarRating(
      input.ratingScale,
      selectedCeiling.ceilingRating,
    )
    && selectedCeiling.ceilingRating - currentRating >= envelope.requiredRatingGap;
  if (!valid) {
    throw new ContextualProspectJointProfileError(
      "potential_allocation_mismatch",
      errorContext(input, prospectClass, selectedCeiling, envelope),
      `Allocated current=${currentRating}★ and potential=${potentialRating}★/`
        + `${potentialRoleAbility.toFixed(3)} do not match the selected joint profile`,
    );
  }
}

function errorContext(
  input: BuildContextualProspectJointProfileInput,
  prospectClass: BandedContextualProspectClass,
  ceilingTarget: ContextualProspectPotentialTarget,
  envelope: Pick<ContextualProspectCurrentEnvelope, "currentBand" | "requiredRatingGap">,
): ContextualProspectJointProfileErrorContext {
  return {
    ageYears: input.ageYears,
    division: input.division,
    clubTier: input.clubTier,
    role: input.role,
    prospectClass,
    currentBand: envelope.currentBand,
    ceilingTarget,
    requiredRatingGap: envelope.requiredRatingGap,
  };
}

function isYoungExplicitProspect(ageYears: number): boolean {
  return ageYears >= 15 && ageYears <= 20;
}

function isUnsupportedFirstDivisionRarePlacement(
  input: BuildContextualProspectJointProfileInput,
  prospectClass: ContextualProspectClass,
): boolean {
  return prospectClass === "rare"
    && input.division === "first_division"
    && input.clubTier !== "playoff_contender"
    && input.clubTier !== "title_contender";
}

const BAND_POSITION_SEARCH_ITERATIONS = 32;
const BAND_POSITION_EPSILON = 1e-10;
const BAND_POSITION_INTERIOR_MARGIN = 1e-8;
const CEILING_ABILITY_INTERIOR_MARGIN = 0.01;
const ROLE_ABILITY_EPSILON = 0.000_001;
const SELECTED_CEILING_MATCH_TOLERANCE = 0.000_01;
