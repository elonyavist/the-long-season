import {
  abilityValue,
  getPlayerRoleProfile,
  hardCapForRoleAbility,
  mapPlayerAbilities,
  PLAYER_ABILITY_KEYS,
  readPlayerAbility,
  roleAttributeBucket,
  rolePotentialAbility,
  type ClubCategory,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerRatingScaleConfig,
  type PlayerRole,
  type PlayerStarRating,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import type { GeneratedPlayerPotentialClass } from "./player-archetypes.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";
import {
  contextualProspectCeilingRatingBand,
  type ContextualProspectCeilingRatingBand,
  type ContextualProspectClass,
} from "./player-potential-rarity.ts";

/** Input for deterministic reachable-potential allocation from a current profile. */
export interface AllocateReachablePotentialInput {
  /** Stable seed controlling deterministic budget and allocation noise. */
  readonly seed: string;
  /** Stable generated player key. */
  readonly playerKey: string;
  /** Already-generated current profile. */
  readonly abilities: PlayerAbilities;
  /** Player age in whole years at the generation reference date. */
  readonly ageYears: number;
  /** Stable primary role used for relevance and role caps. */
  readonly role: PlayerRole;
  /** Division where the player's club currently plays. */
  readonly division: ClubCategory;
  /** Club tier inside the division. */
  readonly clubTier: PlayerGenerationClubTier;
  /** Broad potential lane selected by rarity/academy policy. */
  readonly potentialClass: GeneratedPlayerPotentialClass;
  /** Optional world-budgeted minimum for one exceptional potential player. */
  readonly minimumRolePotentialAbility?: number;
}

/** Input for selecting one contextual ceiling fact before current ability exists. */
export interface SelectContextualProspectCeilingCandidateInput {
  /** Stable seed controlling the already-frozen ceiling stream. */
  readonly seed: string;
  /** Stable generated player key. */
  readonly playerKey: string;
  /** Division whose accepted prospect matrix owns the target. */
  readonly division: ClubCategory;
  /** Explicit non-routine prospect class. */
  readonly prospectClass: Exclude<ContextualProspectClass, "routine">;
  /** Validated global rating scale. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Semantic world-allocation constraint; no raw threshold may leak to roots. */
  readonly ceilingConstraint: ContextualProspectCeilingConstraint;
}

/** Stable ceiling fact sampled before the context derives exact feasibility. */
export interface ContextualProspectCeilingCandidate {
  /** Authored half-star outcome selected with the frozen class weights. */
  readonly ceilingRating: PlayerStarRating;
  /** Stable `0..1` location later projected into the feasible exact interval. */
  readonly withinRatingQuantile: number;
}

/** Input for materializing exact ability inside one feasible contextual ceiling. */
export interface MaterializeContextualProspectPotentialTargetInput {
  /** Previously sampled ceiling fact; this is never reselected here. */
  readonly candidate: ContextualProspectCeilingCandidate;
  /** Role whose canonical hard caps bound the exact ability interval. */
  readonly role: PlayerRole;
  /** Validated global rating scale. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Context-owned reachable upper edge, derived before sampling current ability. */
  readonly maximumFeasibleRolePotentialAbility: number;
}

/** Semantic absolute-ceiling constraint shared by all generation roots. */
export type ContextualProspectCeilingConstraint =
  | Readonly<{ readonly kind: "policy" }>
  | Readonly<{
      readonly kind: "at_least_rating";
      readonly rating: PlayerStarRating;
    }>
  | Readonly<{
      readonly kind: "below_rating";
      readonly rating: PlayerStarRating;
    }>;

/** Absolute target selected before constructing a contextual prospect's current profile. */
export interface ContextualProspectPotentialTarget {
  /** Canonical stored-ceiling star represented by the selected role ability. */
  readonly ceilingRating: PlayerStarRating;
  /** Exact role-relative ability that the potential allocator must construct. */
  readonly rolePotentialAbility: number;
}

/** Input for allocating potential to an already selected absolute ceiling target. */
export interface AllocatePotentialToContextualTargetInput
  extends Omit<AllocateReachablePotentialInput, "minimumRolePotentialAbility"> {
  /** Validated global scale used to verify the selected target. */
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Ceiling-first target selected independently from current ability. */
  readonly target: ContextualProspectPotentialTarget;
}

/** Input for rebuilding a natural outlier below one explicit role ceiling. */
export interface AllocateCappedReachablePotentialInput
  extends Omit<AllocateReachablePotentialInput, "minimumRolePotentialAbility"> {
  /** Strict content-owned maximum for the generated role-potential ability. */
  readonly maximumRolePotentialAbility: number;
}

/**
 * Allocates a realistic reachable ceiling from current ability.
 *
 * Potential is not rolled independently. The allocator first samples one
 * remaining-growth budget, then spreads it toward role-relevant abilities with
 * age/family caps. This keeps youth upside exciting while preventing mature
 * players from carrying impossible hidden physical or technical jumps.
 */
export function allocateReachablePotential(input: AllocateReachablePotentialInput): PlayerAbilities {
  const budget = reachableGrowthBudget(input);
  const weightedPaths = weightedPotentialPaths(input);
  const totalWeight = weightedPaths.reduce((sum, path) => sum + path.weight, 0);
  const growthByAbility = new Map<PlayerAbilityKey, number>();

  for (const path of weightedPaths) {
    const share = totalWeight <= 0 ? 0 : budget * (path.weight / totalWeight);
    growthByAbility.set(path.key, Math.min(path.maxGrowth, share));
  }

  const allocated = mapPlayerAbilities(input.abilities, (current, key) => {
    const growth = growthByAbility.get(key) ?? 0;
    const roleCap = hardCapForRoleAbility(input.role, key);
    const ceiling = roleCap === undefined ? 20 : Math.max(Number(current), roleCap);
    return abilityValue(clamp(Number(current) + growth, Number(current), ceiling));
  });

  return input.minimumRolePotentialAbility === undefined
    ? allocated
    : raisePotentialRoleAbility(allocated, input.role, input.minimumRolePotentialAbility);
}

/**
 * Selects the contextual ceiling from the frozen absolute distribution.
 *
 * Current ability is intentionally absent from this API. A current profile can
 * therefore constrain itself to the selected ceiling without raising, retrying,
 * or replacing that ceiling after construction.
 */
export function selectContextualProspectCeilingCandidate(
  input: SelectContextualProspectCeilingCandidateInput,
): ContextualProspectCeilingCandidate {
  const ratingBand = contextualProspectCeilingRatingBand(
    input.division,
    input.prospectClass,
  );
  if (ratingBand === undefined) {
    throw new Error(`Missing contextual prospect ceiling band: ${input.division} ${input.prospectClass}`);
  }

  return sampleContextualCeilingFact({
    ...input,
    minimumRating: ratingBand.minimumRating,
    maximumRating: ratingBand.maximumRating,
    selection: ratingBand.selection,
  });
}

/**
 * Materializes exact ceiling ability inside a pre-derived feasible interval.
 *
 * The candidate already owns both the rating and its stable within-rating
 * quantile. Tightening a context's reachable upper edge therefore changes only
 * exact ability, never the authored half-star outcome or its weight.
 */
export function materializeContextualProspectPotentialTarget(
  input: MaterializeContextualProspectPotentialTargetInput,
): ContextualProspectPotentialTarget {
  const minimumAbility = minimumRoleAbilityForStarRating(
    input.ratingScale,
    input.candidate.ceilingRating,
  ) + CEILING_ABILITY_INTERIOR_MARGIN;
  const maximumAbility = Math.min(
    maximumRoleAbilityForStarRating(input.ratingScale, input.candidate.ceilingRating)
      - CEILING_ABILITY_INTERIOR_MARGIN,
    maximumSupportedRolePotentialAbility(input.role),
    input.maximumFeasibleRolePotentialAbility,
  );
  if (minimumAbility > maximumAbility + ROLE_ABILITY_EPSILON) {
    throw new Error(
      `Contextual ceiling ${input.candidate.ceilingRating} has no feasible role-ability interval: `
        + `${minimumAbility.toFixed(3)}..${maximumAbility.toFixed(3)}`,
    );
  }

  return {
    ceilingRating: input.candidate.ceilingRating,
    rolePotentialAbility: minimumAbility
      + input.candidate.withinRatingQuantile * Math.max(0, maximumAbility - minimumAbility),
  };
}

/**
 * Allocates potential to a ceiling-first target without changing that target.
 *
 * The caller must already have constructed current ability inside a reachable
 * envelope. Failure here exposes an invalid caller policy instead of silently
 * lifting the ceiling or mutating current attributes.
 */
export function allocatePotentialToContextualTarget(
  input: AllocatePotentialToContextualTargetInput,
): PlayerAbilities {
  const profile = getPlayerRoleProfile(input.role);
  const currentRoleAbility = Number(rolePotentialAbility(input.abilities, profile));
  if (currentRoleAbility > input.target.rolePotentialAbility) {
    throw new Error(
      `Current role ability ${currentRoleAbility.toFixed(3)} exceeds selected ceiling `
        + `${input.target.rolePotentialAbility.toFixed(3)}`,
    );
  }

  const reachableUpper = maximumReachablePotentialProfile(input);
  const maximumReachableAbility = Number(rolePotentialAbility(reachableUpper, profile));
  if (maximumReachableAbility < input.target.rolePotentialAbility) {
    throw new Error(
      `Selected ceiling ${input.target.rolePotentialAbility.toFixed(3)} is unreachable; `
        + `maximum is ${maximumReachableAbility.toFixed(3)}`,
    );
  }

  const allocated = allocateReachablePotential({
    seed: input.seed,
    playerKey: input.playerKey,
    abilities: input.abilities,
    ageYears: input.ageYears,
    role: input.role,
    division: input.division,
    clubTier: input.clubTier,
    potentialClass: input.potentialClass,
  });

  return fitPotentialToRoleAbility({
    current: input.abilities,
    allocated,
    reachableUpper,
    role: input.role,
    targetRoleAbility: input.target.rolePotentialAbility,
    maximumRoleAbility: maximumRoleAbilityForStarRating(
      input.ratingScale,
      input.target.ceilingRating,
    ),
  });
}

/**
 * Allocates the base reachable profile, then constructively narrows only its
 * current-to-potential path when an existing world budget must exclude a
 * natural ceiling outlier.
 */
export function allocateCappedReachablePotential(
  input: AllocateCappedReachablePotentialInput,
): PlayerAbilities {
  const allocated = allocateReachablePotential(input);
  const profile = getPlayerRoleProfile(input.role);
  if (Number(rolePotentialAbility(input.abilities, profile)) > input.maximumRolePotentialAbility) {
    throw new Error(
      `Current role ability exceeds capped reachable potential: ${input.maximumRolePotentialAbility}`,
    );
  }
  if (Number(rolePotentialAbility(allocated, profile)) <= input.maximumRolePotentialAbility) {
    return allocated;
  }

  return fitPotentialToRoleAbility({
    current: input.abilities,
    allocated,
    reachableUpper: allocated,
    role: input.role,
    targetRoleAbility: input.maximumRolePotentialAbility,
    maximumRoleAbility: input.maximumRolePotentialAbility,
  });
}

function raisePotentialRoleAbility(
  potential: PlayerAbilities,
  role: PlayerRole,
  minimum: number,
  maximum = 20,
): PlayerAbilities {
  const profile = getPlayerRoleProfile(role);
  const initialRoleAbility = Number(rolePotentialAbility(potential, profile));
  if (initialRoleAbility >= minimum && initialRoleAbility <= maximum) return potential;
  // A small interior margin survives the factory's final role-cap pass while
  // remaining inside the explicit maximum supplied by bounded callers.
  const safeMinimum = Math.min(maximum, minimum + 0.01);

  let low = 0;
  let high = 20;
  let raised = potential;
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const delta = (low + high) / 2;
    const candidate = mapPlayerAbilities(potential, (current, key) => {
      const bucket = roleAttributeBucket(role, key);
      if (bucket !== "coreForRole" && bucket !== "secondaryForRole") return current;
      const cap = hardCapForRoleAbility(role, key) ?? 20;
      return abilityValue(Math.min(cap, Number(current) + delta));
    });
    if (Number(rolePotentialAbility(candidate, profile)) >= safeMinimum) {
      raised = candidate;
      high = delta;
    } else {
      low = delta;
    }
  }

  if (Number(rolePotentialAbility(raised, profile)) < minimum) {
    throw new Error(`Role potential-ability floor is unreachable for ${role}: ${minimum}`);
  }
  if (Number(rolePotentialAbility(raised, profile)) > maximum + 0.000_001) {
    throw new Error(`Role potential-ability ceiling was exceeded for ${role}: ${maximum}`);
  }
  return raised;
}

function sampleContextualCeilingFact(input: {
  readonly seed: string;
  readonly playerKey: string;
  readonly division: ClubCategory;
  readonly prospectClass: Exclude<ContextualProspectClass, "routine">;
  readonly ratingScale: PlayerRatingScaleConfig;
  readonly minimumRating: PlayerStarRating;
  readonly maximumRating: PlayerStarRating;
  readonly selection: ContextualProspectCeilingRatingBand["selection"];
  readonly ceilingConstraint: ContextualProspectCeilingConstraint;
}): ContextualProspectCeilingCandidate {
  const ratings = input.ratingScale.supportedRatings
    .filter((rating) => rating >= input.minimumRating && rating <= input.maximumRating)
    .filter((rating) => ratingSatisfiesConstraint(rating, input.ceilingConstraint));
  if (ratings.length === 0) {
    throw new Error(
      `Rating scale has no supported ratings inside ${input.minimumRating}..${input.maximumRating} `
        + `for constraint ${input.ceilingConstraint.kind}`,
    );
  }

  const rng = deriveRng(
    input.seed,
    "player-contextual-prospect-ceiling",
    input.playerKey,
    input.division,
    input.prospectClass,
  );
  const rating = selectContextualCeilingRatingFromCandidates(rng, ratings, input.selection);
  if (rating === undefined) {
    throw new Error("Contextual prospect ceiling sampling produced no rating");
  }
  return {
    ceilingRating: rating,
    withinRatingQuantile: rng.nextFloat(),
  };
}

function ratingSatisfiesConstraint(
  rating: PlayerStarRating,
  constraint: ContextualProspectCeilingConstraint,
): boolean {
  switch (constraint.kind) {
    case "policy":
      return true;
    case "at_least_rating":
      return rating >= constraint.rating;
    case "below_rating":
      return rating < constraint.rating;
  }
}

/** Selects one supported rating while keeping intentional edge rarity explicit. */
function selectContextualCeilingRatingFromCandidates(
  rng: ReturnType<typeof deriveRng>,
  ratings: readonly PlayerStarRating[],
  selection: ContextualProspectCeilingRatingBand["selection"],
): PlayerStarRating | undefined {
  if (selection.kind === "uniform" || ratings.length <= 1) {
    return ratings[rng.nextInt(0, ratings.length)];
  }
  if (
    !Number.isSafeInteger(selection.maximumRatingBasisPoints)
    || selection.maximumRatingBasisPoints < 0
    || selection.maximumRatingBasisPoints > 10_000
  ) {
    throw new Error("Contextual prospect maximum-rating weight must be 0..10000 basis points");
  }

  const maximumRating = ratings.at(-1);
  const lowerRatings = ratings.slice(0, -1);
  if (maximumRating === undefined || lowerRatings.length === 0) {
    return maximumRating;
  }

  return rng.nextInt(0, 10_000) < selection.maximumRatingBasisPoints
    ? maximumRating
    : lowerRatings[rng.nextInt(0, lowerRatings.length)];
}

const CEILING_ABILITY_INTERIOR_MARGIN = 0.01;
const ROLE_ABILITY_EPSILON = 0.000_001;

/** Returns the highest profile reachable from current under age/family and role caps. */
function maximumReachablePotentialProfile(
  input: Pick<AllocateReachablePotentialInput, "abilities" | "ageYears" | "role">,
): PlayerAbilities {
  return mapPlayerAbilities(input.abilities, (currentAbility, key) => {
    const current = Number(currentAbility);
    const roleCap = hardCapForRoleAbility(input.role, key);
    const ceiling = roleCap === undefined ? 20 : Math.max(current, roleCap);
    const growthCap = familyGrowthCap(input.ageYears, input.role, key);
    return abilityValue(current + Math.max(0, Math.min(ceiling - current, growthCap)));
  });
}

/** Returns the role-relative maximum reachable from one current profile. */
export function maximumReachableRolePotentialAbility(
  input: Pick<AllocateReachablePotentialInput, "abilities" | "ageYears" | "role">,
): number {
  return Number(
    rolePotentialAbility(
      maximumReachablePotentialProfile(input),
      getPlayerRoleProfile(input.role),
    ),
  );
}

/** Returns the role-relative structural maximum after canonical hard caps. */
export function maximumSupportedRolePotentialAbility(role: PlayerRole): number {
  const profile = getPlayerRoleProfile(role);
  let weightedTotal = 0;
  let totalWeight = 0;
  for (const key of PLAYER_ABILITY_KEYS) {
    const weight = profile.weights[key] ?? 0;
    weightedTotal += (hardCapForRoleAbility(role, key) ?? 20) * weight;
    totalWeight += weight;
  }
  if (totalWeight <= 0) {
    throw new Error(`Role profile has no positive ability weight: ${role}`);
  }
  return weightedTotal / totalWeight;
}

function fitPotentialToRoleAbility(input: {
  readonly current: PlayerAbilities;
  readonly allocated: PlayerAbilities;
  readonly reachableUpper: PlayerAbilities;
  readonly role: PlayerRole;
  readonly targetRoleAbility: number;
  readonly maximumRoleAbility: number;
}): PlayerAbilities {
  const profile = getPlayerRoleProfile(input.role);
  const allocatedRoleAbility = Number(rolePotentialAbility(input.allocated, profile));
  if (allocatedRoleAbility <= input.targetRoleAbility) {
    return interpolateToRoleAbilityFromBelow({
      lower: input.allocated,
      upper: input.reachableUpper,
      profile,
      targetRoleAbility: input.targetRoleAbility,
      maximumRoleAbility: input.maximumRoleAbility,
    });
  }

  let lowerFraction = 0;
  let upperFraction = 1;
  let fitted = input.current;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const fraction = (lowerFraction + upperFraction) / 2;
    const candidate = interpolatePotential(input.current, input.allocated, fraction);
    if (Number(rolePotentialAbility(candidate, profile)) <= input.targetRoleAbility) {
      fitted = candidate;
      lowerFraction = fraction;
    } else {
      upperFraction = fraction;
    }
  }
  return fitted;
}

function interpolateToRoleAbilityFromBelow(input: {
  readonly lower: PlayerAbilities;
  readonly upper: PlayerAbilities;
  readonly profile: ReturnType<typeof getPlayerRoleProfile>;
  readonly targetRoleAbility: number;
  readonly maximumRoleAbility: number;
}): PlayerAbilities {
  const upperRoleAbility = Number(rolePotentialAbility(input.upper, input.profile));
  if (upperRoleAbility < input.targetRoleAbility) {
    throw new Error(`Role potential-ability floor is unreachable: ${input.targetRoleAbility}`);
  }

  let lowerFraction = 0;
  let upperFraction = 1;
  let fitted = input.upper;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const fraction = (lowerFraction + upperFraction) / 2;
    const candidate = interpolatePotential(input.lower, input.upper, fraction);
    if (Number(rolePotentialAbility(candidate, input.profile)) >= input.targetRoleAbility) {
      fitted = candidate;
      upperFraction = fraction;
    } else {
      lowerFraction = fraction;
    }
  }

  const fittedRoleAbility = Number(rolePotentialAbility(fitted, input.profile));
  if (fittedRoleAbility > input.maximumRoleAbility + 0.000_001) {
    throw new Error(`Role potential-ability ceiling was exceeded: ${input.maximumRoleAbility}`);
  }
  return fitted;
}

function interpolatePotential(
  current: PlayerAbilities,
  allocated: PlayerAbilities,
  fraction: number,
): PlayerAbilities {
  return mapPlayerAbilities(current, (currentAbility, key) => {
    const start = Number(currentAbility);
    const end = Number(readPlayerAbility(allocated, key));
    return abilityValue(start + (end - start) * fraction);
  });
}

/** Returns the inclusive role-ability threshold for one canonical star rating. */
export function minimumRoleAbilityForStarRating(
  ratingScale: PlayerRatingScaleConfig,
  rating: PlayerStarRating,
): number {
  const threshold = ratingScale.abilityThresholds.find(
    (candidate) => candidate.rating === rating,
  );
  if (threshold === undefined) {
    throw new Error(`Validated rating scale is missing rating ${rating}`);
  }
  return threshold.minimumAbilityInclusive;
}

/** Returns the inclusive role-ability upper edge for one canonical star rating. */
export function maximumRoleAbilityForStarRating(
  ratingScale: PlayerRatingScaleConfig,
  rating: PlayerStarRating,
): number {
  const thresholdIndex = ratingScale.abilityThresholds.findIndex(
    (candidate) => candidate.rating === rating,
  );
  if (thresholdIndex < 0) {
    throw new Error(`Validated rating scale is missing rating ${rating}`);
  }
  const nextThreshold = ratingScale.abilityThresholds[thresholdIndex + 1];
  return nextThreshold === undefined
    ? 20
    : Math.max(0, nextThreshold.minimumAbilityInclusive - 0.001);
}

/** Converts an exact role ability to the canonical half-star rating. */
export function starRatingForRoleAbility(
  ability: number,
  ratingScale: PlayerRatingScaleConfig,
): PlayerStarRating {
  let rating: PlayerStarRating = 1;
  for (const threshold of ratingScale.abilityThresholds) {
    if (ability >= threshold.minimumAbilityInclusive) rating = threshold.rating;
  }
  return rating;
}

function reachableGrowthBudget(input: AllocateReachablePotentialInput): number {
  const range = budgetRangeForAge(input.ageYears, input.potentialClass, input.role);
  const rng = deriveRng(input.seed, "player-reachable-potential-budget", input.playerKey, input.potentialClass);
  const sampled = range.min + rng.nextFloat() * (range.max - range.min);
  return Math.max(0, sampled + divisionBudgetModifier(input.division) + clubTierBudgetModifier(input.clubTier));
}

function weightedPotentialPaths(input: AllocateReachablePotentialInput): readonly {
  readonly key: PlayerAbilityKey;
  readonly weight: number;
  readonly maxGrowth: number;
}[] {
  return PLAYER_ABILITY_KEYS.map((key) => {
    const current = Number(readPlayerAbility(input.abilities, key));
    const roleCap = hardCapForRoleAbility(input.role, key);
    const ceiling = roleCap === undefined ? 20 : Math.max(current, roleCap);
    const familyCap = familyGrowthCap(input.ageYears, input.role, key);
    const maxGrowth = Math.max(0, Math.min(ceiling - current, familyCap));
    const rng = deriveRng(input.seed, "player-reachable-potential-weight", input.playerKey, key);
    const noise = 0.8 + rng.nextFloat() * 0.4;
    const weight = maxGrowth <= 0 ? 0 : roleBucketWeight(input.role, key) * familyWeight(input.ageYears, input.role, key) * noise;

    return { key, weight, maxGrowth };
  });
}

function budgetRangeForAge(
  ageYears: number,
  potentialClass: GeneratedPlayerPotentialClass,
  role: PlayerRole,
): { readonly min: number; readonly max: number } {
  if (role === "goalkeeper") {
    return goalkeeperBudgetRange(ageYears, potentialClass);
  }

  if (ageYears <= 17) return classBudget(potentialClass, [6, 10], [12, 18], [20, 31], [30, 43], [40, 56]);
  if (ageYears <= 21) return classBudget(potentialClass, [4, 8], [8, 14], [14, 24], [22, 34], [30, 44]);
  if (ageYears <= 24) return classBudget(potentialClass, [1.5, 4], [3, 7], [6, 11], [9, 15], [12, 19]);
  if (ageYears <= 27) return classBudget(potentialClass, [0.2, 0.8], [0.7, 1.8], [1.4, 3], [2, 4], [2.5, 5]);
  if (ageYears <= 31) return classBudget(potentialClass, [0, 0.3], [0.2, 0.8], [0.4, 1.2], [0.5, 1.4], [0.6, 1.6]);
  return classBudget(potentialClass, [0, 0.1], [0, 0.25], [0, 0.35], [0, 0.45], [0, 0.55]);
}

function goalkeeperBudgetRange(
  ageYears: number,
  potentialClass: GeneratedPlayerPotentialClass,
): { readonly min: number; readonly max: number } {
  if (ageYears <= 17) return classBudget(potentialClass, [6, 11], [12, 20], [20, 33], [30, 45], [40, 58]);
  if (ageYears <= 21) return classBudget(potentialClass, [5, 9], [10, 16], [16, 28], [25, 38], [33, 48]);
  if (ageYears <= 24) return classBudget(potentialClass, [3, 6], [5, 10], [9, 17], [13, 23], [17, 29]);
  if (ageYears <= 27) return classBudget(potentialClass, [1.5, 4], [3, 7], [5, 12], [8, 16], [10, 20]);
  if (ageYears <= 31) return classBudget(potentialClass, [0.8, 2.5], [1.5, 5], [3, 8], [5, 11], [7, 14]);
  if (ageYears <= 34) return classBudget(potentialClass, [0.2, 1], [0.5, 2], [1, 3.5], [1.5, 5], [2, 6]);
  return classBudget(potentialClass, [0, 0.2], [0, 0.5], [0, 0.8], [0, 1], [0, 1.2]);
}

function classBudget(
  potentialClass: GeneratedPlayerPotentialClass,
  limited: readonly [number, number],
  category: readonly [number, number],
  interesting: readonly [number, number],
  serious: readonly [number, number],
  elite: readonly [number, number],
): { readonly min: number; readonly max: number } {
  const range = {
    limited,
    category,
    interesting,
    serious,
    elite,
  }[potentialClass];
  return { min: range[0], max: range[1] };
}

function familyGrowthCap(ageYears: number, role: PlayerRole, abilityKey: PlayerAbilityKey): number {
  if (abilityKey.startsWith("goalkeeping.")) {
    if (role !== "goalkeeper") return 0;
    // Young caps cover the largest accepted current-to-ceiling gap (2★ to 6★).
    // Routine profiles remain bounded by their much smaller sampled budget.
    if (ageYears <= 17) return 10;
    if (ageYears <= 21) return 9;
    if (ageYears <= 24) return 4;
    if (ageYears <= 27) return 3;
    if (ageYears <= 31) return 2;
    if (ageYears <= 34) return 1.2;
    return 0.3;
  }

  if (abilityKey.startsWith("physical.")) {
    if (ageYears <= 17) return 10;
    if (ageYears <= 21) return 9;
    if (ageYears <= 24) return 1.8;
    if (ageYears <= 27) return 0.6;
    if (ageYears <= 31) return 0.2;
    return 0;
  }

  if (abilityKey.startsWith("mental.")) {
    if (ageYears <= 17) return 10;
    if (ageYears <= 21) return 9;
    if (ageYears <= 24) return 3.5;
    if (ageYears <= 27) return 2.2;
    if (ageYears <= 31) return 1.4;
    return 0.6;
  }

  if (ageYears <= 17) return 10;
  if (ageYears <= 21) return 9;
  if (ageYears <= 24) return 2.8;
  if (ageYears <= 27) return 1.2;
  if (ageYears <= 31) return 0.6;
  return 0.2;
}

function roleBucketWeight(role: PlayerRole, abilityKey: PlayerAbilityKey): number {
  switch (roleAttributeBucket(role, abilityKey)) {
    case "coreForRole":
      return 1;
    case "secondaryForRole":
      return 0.45;
    case "allowedButLow":
      return 0.14;
    case "cappedOutOfRole":
      return 0.02;
  }
}

function familyWeight(ageYears: number, role: PlayerRole, abilityKey: PlayerAbilityKey): number {
  if (abilityKey.startsWith("goalkeeping.")) return role === "goalkeeper" ? 1 : 0;
  if (abilityKey.startsWith("physical.")) return ageYears <= 21 ? 0.9 : ageYears <= 24 ? 0.45 : 0.08;
  if (abilityKey.startsWith("mental.")) return ageYears <= 21 ? 0.85 : 1;
  return ageYears <= 24 ? 1 : 0.7;
}

function divisionBudgetModifier(division: ClubCategory): number {
  switch (division) {
    case "first_division":
      return 0.8;
    case "second_division":
      return 0.2;
    case "third_division":
      return -0.4;
  }
}

function clubTierBudgetModifier(clubTier: PlayerGenerationClubTier): number {
  switch (clubTier) {
    case "title_contender":
      return 0.6;
    case "playoff_contender":
      return 0.2;
    case "mid_table":
      return 0;
    case "survival":
      return -0.3;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
