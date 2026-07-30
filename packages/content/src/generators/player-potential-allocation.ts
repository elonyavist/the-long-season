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
  type PlayerRole,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import type { GeneratedPlayerPotentialClass } from "./player-archetypes.ts";
import type { PlayerGenerationClubTier } from "./player-generation-bands.ts";

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

function raisePotentialRoleAbility(
  potential: PlayerAbilities,
  role: PlayerRole,
  minimum: number,
): PlayerAbilities {
  const profile = getPlayerRoleProfile(role);
  if (Number(rolePotentialAbility(potential, profile)) >= minimum) return potential;
  const safeMinimum = Math.min(20, minimum + 0.01);

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
  return raised;
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
    if (ageYears <= 17) return 7;
    if (ageYears <= 21) return 5.5;
    if (ageYears <= 24) return 4;
    if (ageYears <= 27) return 3;
    if (ageYears <= 31) return 2;
    if (ageYears <= 34) return 1.2;
    return 0.3;
  }

  if (abilityKey.startsWith("physical.")) {
    if (ageYears <= 17) return 5.5;
    if (ageYears <= 21) return 3.5;
    if (ageYears <= 24) return 1.8;
    if (ageYears <= 27) return 0.6;
    if (ageYears <= 31) return 0.2;
    return 0;
  }

  if (abilityKey.startsWith("mental.")) {
    if (ageYears <= 17) return 7;
    if (ageYears <= 21) return 5.5;
    if (ageYears <= 24) return 3.5;
    if (ageYears <= 27) return 2.2;
    if (ageYears <= 31) return 1.4;
    return 0.6;
  }

  if (ageYears <= 17) return 6;
  if (ageYears <= 21) return 4.5;
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
