import type {
  ClubCategory,
  PlayerRatingScaleConfig,
  YouthDevelopmentLevel,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import type { GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import type { CurrentAbilityRarityLane } from "./player-current-ability-bands.ts";
import { potentialRarityBudgetForDivision } from "./player-potential-rarity.ts";
import { youthDevelopmentRarityCandidateScoreModifier } from "./youth-development-level.ts";

/** Archetypes that are controlled by league-level rarity budgets. */
export type BudgetedPlayerRarityKind = "white_fly" | "serious_prospect" | "rare_prodigy";

/** League-level rarity budget for one generated player pool. */
export interface PlayerRarityBudget {
  /** Unusually strong current-ability players in a lower-division league. */
  readonly whiteFlyCount: number;
  /** High-upside prospects who can plausibly climb above their current level. */
  readonly seriousProspectCount: number;
  /** Extremely rare elite-potential young players. */
  readonly rareProdigyCount: number;
}

/** One deterministic budgeted assignment to a generated club/player slot. */
export interface PlayerRarityAssignment {
  /** Slot key used before the final player ID is built. */
  readonly slotKey: string;
  /** Broad rarity bucket. */
  readonly rarityKind: BudgetedPlayerRarityKind;
  /** Archetype forced by the rarity budget. */
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
}

/** Complete rarity allocation for one generated league. */
export interface PlayerRarityAllocation {
  /** League-level target counts. */
  readonly budget: PlayerRarityBudget;
  /** Assignment lookup by generated slot key. */
  readonly assignmentsBySlotKey: Readonly<Record<string, PlayerRarityAssignment>>;
}

/** Division-season rarity targets for an initial youth-academy population. */
export interface YouthPlayerRarityBudget {
  /** High-potential prospects allocated across the whole division. */
  readonly seriousProspectCount: number;
  /** Elite-potential prospects allocated across the whole division. */
  readonly rareProdigyCount: number;
}

/** One deterministic high/elite assignment inside an initial youth pool. */
export interface YouthPlayerRarityAssignment {
  /** Stable club/academy slot key. */
  readonly slotKey: string;
  /** Archetype selected by the division rarity budget. */
  readonly archetypeKey: "serious_prospect" | "rare_prodigy";
}

/** Complete high/elite allocation for one division's initial academies. */
export interface YouthPlayerRarityAllocation {
  /** Actual bounded targets after accounting for the available club slots. */
  readonly budget: YouthPlayerRarityBudget;
  /** Assignment lookup by stable club/academy slot key. */
  readonly assignmentsBySlotKey: Readonly<Record<string, YouthPlayerRarityAssignment>>;
}

/** Inputs needed to allocate initial-academy rarity across one division. */
export interface BuildYouthPlayerRarityAllocationInput {
  /** Stable world seed. */
  readonly seed: string;
  /** Division whose rarity limits apply. */
  readonly division: ClubCategory;
  /** Season owning the initial academy population. */
  readonly seasonKey: string;
  /** Number of clubs in this division. */
  readonly clubCount: number;
  /** Number of academy slots generated per club. */
  readonly playersPerClub: number;
  /** Optional academy-development level by generated one-based club number. */
  readonly clubDevelopmentLevelsByClubNumber?: Readonly<Record<number, YouthDevelopmentLevel>>;
}

/** Inputs needed to allocate a deterministic league rarity budget. */
export interface BuildPlayerRarityAllocationInput {
  /** World seed. */
  readonly seed: string;
  /** Division where the generated pool plays. Defaults to the current third-division demo world. */
  readonly division?: ClubCategory;
  /** Season key used when the same world needs a new season budget. */
  readonly seasonKey?: string;
  /** Number of generated clubs in the league. */
  readonly clubCount: number;
  /** Number of generated players per club. */
  readonly playersPerClub: number;
  /** Number of default lineup slots per club. */
  readonly lineupSize: number;
  /** Optional academy-development level by generated one-based club number. */
  readonly clubDevelopmentLevelsByClubNumber?: Readonly<Record<number, YouthDevelopmentLevel>>;
}

/** Stable senior candidate considered by the complete-world rarity producer. */
export interface InitialWorldExceptionalCandidate {
  readonly playerKey: string;
  readonly division: ClubCategory;
  readonly clubTier: "title_contender" | "playoff_contender" | "mid_table" | "survival";
  readonly isFirstTeam: boolean;
  /** Whether this deterministic ordinary profile already reaches six stars now. */
  readonly naturallyCurrentSix?: boolean;
  /** Whether this deterministic ordinary profile already has a six-star ceiling. */
  readonly naturallyPotentialSix?: boolean;
  /** Actual archetype used by a naturally qualifying profile. */
  readonly naturalArchetypeKey?: GeneratedPlayerArchetypeKey;
  /** Actual current-quality lane used by a naturally qualifying profile. */
  readonly naturalCurrentAbilityLane?: CurrentAbilityRarityLane;
  /** Whether this slot can be reconstructed through an exceptional senior lane. */
  readonly canConstructExceptionalProfile?: boolean;
}

/** Truthful profile assignment for one effective initial-world exception. */
export interface InitialWorldExceptionalAssignment {
  readonly playerKey: string;
  readonly currentSix: boolean;
  readonly potentialSix: boolean;
  readonly source: "natural" | "constructed";
  readonly archetypeKey: GeneratedPlayerArchetypeKey;
  readonly currentAbilityLane: CurrentAbilityRarityLane;
}

/** Exact exceptional assignments shared by all initial-world division generators. */
export interface InitialWorldExceptionalAllocation {
  readonly currentSixPlayerKeys: readonly string[];
  readonly potentialSixPlayerKeys: readonly string[];
  /** Natural senior six-star ceilings reconstructed below six to honor the cap. */
  readonly reconstructedPotentialBelowSixPlayerKeys: readonly string[];
  readonly assignmentsByPlayerKey: Readonly<Record<string, InitialWorldExceptionalAssignment>>;
}

/** Input for the complete initial-world exceptional allocation. */
export interface BuildInitialWorldExceptionalAllocationInput {
  readonly seed: string;
  readonly ratingScale: PlayerRatingScaleConfig;
  readonly candidates: readonly InitialWorldExceptionalCandidate[];
}

/** Input for one season in a deterministic ten-season intake cohort. */
export interface BuildAnnualWorldIntakeExceptionalAllocationInput {
  readonly seed: string;
  readonly cohortKey: string;
  readonly seasonIndex: number;
  readonly ratingScale: PlayerRatingScaleConfig;
  readonly candidatePlayerKeys: readonly string[];
}

/** Potential-six assignments for one complete annual world intake. */
export interface AnnualWorldIntakeExceptionalAllocation {
  readonly scheduledSeasonOffsets: readonly number[];
  readonly potentialSixPlayerKeys: readonly string[];
}

/**
 * Allocates current-six and potential-six players once across the initial world.
 *
 * Current champions can only occupy credible first-team slots at strong
 * first-division clubs. Potential rarity is separate and may include at most
 * the configured lower-division allowance.
 */
export function buildInitialWorldExceptionalAllocation(
  input: BuildInitialWorldExceptionalAllocationInput,
): InitialWorldExceptionalAllocation {
  assertUniqueCandidateKeys(input.candidates.map((candidate) => candidate.playerKey));
  const candidatesByKey = new Map(
    input.candidates.map((candidate) => [candidate.playerKey, candidate]),
  );
  const naturalCurrentCandidates = input.candidates.filter(
    (candidate) => candidate.naturallyCurrentSix === true,
  );
  const naturalPotentialCandidates = input.candidates.filter(
    (candidate) => candidate.naturallyPotentialSix === true,
  );
  assertNaturalProfileFacts(naturalCurrentCandidates);
  assertNaturalProfileFacts(naturalPotentialCandidates);
  const configuredCurrentCount = countInRange(
    input.seed,
    "initial-current-six-count",
    input.ratingScale.rarity.initialWorld.currentSixMinimum,
    input.ratingScale.rarity.initialWorld.currentSixMaximum,
  );
  const configuredPotentialCount = countInRange(
    input.seed,
    "initial-potential-six-count",
    input.ratingScale.rarity.initialWorld.potentialSixMinimum,
    input.ratingScale.rarity.initialWorld.potentialSixMaximum,
  );
  const currentCandidates = input.candidates.filter((candidate) =>
    candidate.division === "first_division"
    && candidate.clubTier === "title_contender"
    && candidate.isFirstTeam
    && candidate.canConstructExceptionalProfile !== false
  );
  if (naturalCurrentCandidates.some((candidate) => !currentCandidates.includes(candidate))) {
    throw new Error("Naturally current-six profile is outside the credible current-star lane");
  }
  if (naturalCurrentCandidates.length > input.ratingScale.rarity.initialWorld.currentSixMaximum) {
    throw new Error("Natural current-six profiles exceed the initial-world maximum");
  }
  const currentCount = Math.max(
    configuredCurrentCount,
    naturalCurrentCandidates.length,
  );
  const naturalCurrentKeys = rankedStableKeys(
    input.seed,
    "initial-natural-current-six",
    naturalCurrentCandidates.map((candidate) => candidate.playerKey),
  );
  const constructedCurrentKeys = rankedStableKeys(
    input.seed,
    "initial-current-six",
    currentCandidates
      .map((candidate) => candidate.playerKey)
      .filter((key) => !naturalCurrentKeys.includes(key)),
  ).slice(0, currentCount - naturalCurrentKeys.length);
  const currentSixPlayerKeys = [...naturalCurrentKeys, ...constructedCurrentKeys];
  const allNaturalPotentialKeys = rankedStableKeys(
    input.seed,
    "initial-natural-potential-six",
    naturalPotentialCandidates.map((candidate) => candidate.playerKey),
  );
  const fixedNaturalPotentialKeys = allNaturalPotentialKeys.filter(
    (key) => candidatesByKey.get(key)?.canConstructExceptionalProfile === false,
  );
  const fixedPotentialKeys = uniqueStableKeys([
    ...currentSixPlayerKeys,
    ...fixedNaturalPotentialKeys,
  ]);
  const desiredNaturalPotentialCount = uniqueStableKeys([
    ...fixedPotentialKeys,
    ...allNaturalPotentialKeys,
  ]).length;
  const potentialCount = Math.max(
    configuredPotentialCount,
    Math.min(
      input.ratingScale.rarity.initialWorld.potentialSixMaximum,
      desiredNaturalPotentialCount,
    ),
    fixedPotentialKeys.length,
  );
  if (potentialCount > input.ratingScale.rarity.initialWorld.potentialSixMaximum) {
    throw new Error(
      `Non-reconstructable potential-six profiles exceed the initial-world maximum: ${fixedPotentialKeys.join(",")}`,
    );
  }
  const fixedLowerCount = fixedPotentialKeys.filter(
    (key) => candidatesByKey.get(key)?.division !== "first_division",
  ).length;
  if (
    fixedLowerCount
      > input.ratingScale.rarity.initialWorld.lowerDivisionPotentialSixMaximum
  ) {
    throw new Error(
      "Non-reconstructable lower-division potential-six profiles exceed the initial-world maximum",
    );
  }
  const retainedNaturalPotentialKeys: string[] = [];
  let retainedLowerCount = fixedLowerCount;
  for (const key of allNaturalPotentialKeys) {
    if (
      fixedPotentialKeys.includes(key)
      || fixedPotentialKeys.length + retainedNaturalPotentialKeys.length
        >= potentialCount
    ) {
      continue;
    }
    const isLower = candidatesByKey.get(key)?.division !== "first_division";
    if (
      isLower
      && retainedLowerCount
        >= input.ratingScale.rarity.initialWorld.lowerDivisionPotentialSixMaximum
    ) {
      continue;
    }
    retainedNaturalPotentialKeys.push(key);
    if (isLower) retainedLowerCount += 1;
  }
  const requiredPotentialKeys = uniqueStableKeys([
    ...fixedPotentialKeys,
    ...retainedNaturalPotentialKeys,
  ]);
  const reconstructedPotentialBelowSixPlayerKeys = allNaturalPotentialKeys.filter(
    (key) => !requiredPotentialKeys.includes(key),
  );
  const lowerRequiredCount = retainedLowerCount;
  const lowerCandidates = input.candidates.filter((candidate) =>
    candidate.division !== "first_division"
    && !candidate.isFirstTeam
    && candidate.canConstructExceptionalProfile !== false
    && !requiredPotentialKeys.includes(candidate.playerKey)
  );
  const firstCandidates = input.candidates.filter((candidate) =>
    candidate.division === "first_division"
    && !candidate.isFirstTeam
    && candidate.canConstructExceptionalProfile !== false
    && !requiredPotentialKeys.includes(candidate.playerKey)
  );
  const remainingPotentialCount = potentialCount - requiredPotentialKeys.length;
  const lowerAllowance = Math.max(
    0,
    input.ratingScale.rarity.initialWorld.lowerDivisionPotentialSixMaximum
      - lowerRequiredCount,
  );
  const lowerCount = lowerAllowance === 0
    ? 0
    : Math.min(
        lowerAllowance,
        countInRange(input.seed, "initial-lower-potential-six-count", 0, 1),
        remainingPotentialCount,
      );
  const lowerPotential = rankedStableKeys(
    input.seed,
    "initial-lower-potential-six",
    lowerCandidates.map((candidate) => candidate.playerKey),
  ).slice(0, lowerCount);
  const firstPotential = rankedStableKeys(
    input.seed,
    "initial-first-potential-six",
    firstCandidates.map((candidate) => candidate.playerKey),
  ).slice(0, remainingPotentialCount - lowerPotential.length);
  const potentialSixPlayerKeys = [
    ...requiredPotentialKeys,
    ...lowerPotential,
    ...firstPotential,
  ];

  if (currentSixPlayerKeys.length !== currentCount || potentialSixPlayerKeys.length !== potentialCount) {
    throw new Error("Initial world does not contain enough eligible exceptional-player candidates");
  }

  const naturalKeys = new Set([
    ...naturalCurrentKeys,
    ...retainedNaturalPotentialKeys,
    ...fixedNaturalPotentialKeys,
  ]);
  const assignmentsByPlayerKey = Object.fromEntries(
    potentialSixPlayerKeys.map((key) => {
      const candidate = candidatesByKey.get(key);
      if (candidate === undefined) {
        throw new Error(`Missing exceptional candidate: ${key}`);
      }
      const currentSix = currentSixPlayerKeys.includes(key);
      const natural = naturalKeys.has(key) && (!currentSix || candidate.naturallyCurrentSix === true);
      const archetypeKey = natural
        ? candidate.naturalArchetypeKey
        : currentSix
          ? "category_star"
          : "rare_prodigy";
      const currentAbilityLane = natural
        ? candidate.naturalCurrentAbilityLane
        : currentSix
          ? "exceptional"
          : "normal";
      if (archetypeKey === undefined || currentAbilityLane === undefined) {
        throw new Error(`Missing truthful exceptional profile metadata: ${key}`);
      }
      return [key, {
        playerKey: key,
        currentSix,
        potentialSix: true,
        source: natural ? "natural" : "constructed",
        archetypeKey,
        currentAbilityLane,
      } satisfies InitialWorldExceptionalAssignment];
    }),
  );

  return {
    currentSixPlayerKeys,
    potentialSixPlayerKeys,
    reconstructedPotentialBelowSixPlayerKeys,
    assignmentsByPlayerKey,
  };
}

/**
 * Allocates at most one potential-six player in one annual world intake.
 *
 * The ten-season schedule is derived once per cohort and contains exactly the
 * configured `2..4` offsets; per-club generators never roll this rarity.
 */
export function buildAnnualWorldIntakeExceptionalAllocation(
  input: BuildAnnualWorldIntakeExceptionalAllocationInput,
): AnnualWorldIntakeExceptionalAllocation {
  if (!Number.isSafeInteger(input.seasonIndex) || input.seasonIndex < 0) {
    throw new RangeError(`Invalid intake season index: ${input.seasonIndex}`);
  }
  assertUniqueCandidateKeys(input.candidatePlayerKeys);
  const cohortSeasonIndex = input.seasonIndex % 10;
  const scheduledCount = countInRange(
    input.seed,
    `annual-intake-cohort-count:${input.cohortKey}`,
    input.ratingScale.rarity.annualIntake.tenSeasonCohortMinimum,
    input.ratingScale.rarity.annualIntake.tenSeasonCohortMaximum,
  );
  const scheduledSeasonOffsets = rankedStableKeys(
    input.seed,
    `annual-intake-cohort-seasons:${input.cohortKey}`,
    // Offset zero can occur before the initial academy has produced any
    // lifecycle vacancy. Later offsets give the canonical age-out pass time to
    // expose real slots instead of inventing an exceptional candidate.
    Array.from({ length: 9 }, (_, index) => String(index + 1)),
  )
    .slice(0, scheduledCount)
    .map(Number)
    .sort((left, right) => left - right);
  const isExceptionalSeason = scheduledSeasonOffsets.includes(cohortSeasonIndex);
  const maximumPerWorld = input.ratingScale.rarity.annualIntake.potentialSixPerWorldMaximum;
  const potentialSixPlayerKeys = isExceptionalSeason && maximumPerWorld > 0
    ? rankedStableKeys(
        input.seed,
        `annual-intake-potential-six:${input.cohortKey}:${cohortSeasonIndex}`,
        input.candidatePlayerKeys,
      ).slice(0, 1)
    : [];

  if (
    isExceptionalSeason
    && maximumPerWorld > 0
    && potentialSixPlayerKeys.length === 0
  ) {
    throw new Error("Exceptional intake season requires at least one candidate");
  }

  return { scheduledSeasonOffsets, potentialSixPlayerKeys };
}

/**
 * Builds deterministic league-level rarity assignments.
 *
 * Rarity is allocated across the league, not per club. This keeps memorable
 * lower-division exceptions possible without making them normal.
 */
export function buildPlayerRarityAllocation(input: BuildPlayerRarityAllocationInput): PlayerRarityAllocation {
  const budget = playerRarityBudgetForSeed(input.seed, input.division ?? "third_division", input.seasonKey ?? "initial");
  const usedSlotKeys = new Set<string>();
  const assignments: Record<string, PlayerRarityAssignment> = {};

  for (const candidate of selectCandidates(input, "white-fly", budget.whiteFlyCount, usedSlotKeys, "lineup")) {
    const archetypeKey = whiteFlyArchetypeForSlot(input.seed, candidate.slotKey);
    assignments[candidate.slotKey] = {
      slotKey: candidate.slotKey,
      rarityKind: "white_fly",
      archetypeKey,
    };
  }

  for (const candidate of selectCandidates(input, "serious-prospect", budget.seriousProspectCount, usedSlotKeys, "reserve")) {
    assignments[candidate.slotKey] = {
      slotKey: candidate.slotKey,
      rarityKind: "serious_prospect",
      archetypeKey: "serious_prospect",
    };
  }

  for (const candidate of selectCandidates(input, "rare-prodigy", budget.rareProdigyCount, usedSlotKeys, "reserve")) {
    assignments[candidate.slotKey] = {
      slotKey: candidate.slotKey,
      rarityKind: "rare_prodigy",
      archetypeKey: "rare_prodigy",
    };
  }

  return {
    budget,
    assignmentsBySlotKey: assignments,
  };
}

/**
 * Allocates high and elite youth potential through one division-wide budget.
 *
 * Routine and interesting prospects remain youth-generator policy. This
 * allocator only prevents independent per-player rolls from turning rare
 * prospects into a normal feature of every academy.
 */
export function buildYouthPlayerRarityAllocation(
  input: BuildYouthPlayerRarityAllocationInput,
): YouthPlayerRarityAllocation {
  const configured = potentialRarityBudgetForDivision(input.division);
  const rng = deriveRng(input.seed, "youth-player-rarity-budget", input.division, input.seasonKey);
  const availableClubSlots = Math.max(0, Math.min(input.clubCount, input.clubCount * input.playersPerClub));
  const seriousProspectCount = Math.min(
    availableClubSlots,
    rng.nextInt(configured.highPerDivision.minInclusive, configured.highPerDivision.maxInclusive + 1),
  );
  const rareProdigyCount =
    input.clubCount * input.playersPerClub > seriousProspectCount && rng.nextFloat() < configured.eliteChance
      ? configured.elitePerDivision.maxInclusive
      : configured.elitePerDivision.minInclusive;
  const candidateInput: BuildPlayerRarityAllocationInput = {
    seed: input.seed,
    division: input.division,
    seasonKey: input.seasonKey,
    clubCount: input.clubCount,
    playersPerClub: input.playersPerClub,
    lineupSize: 0,
    ...(input.clubDevelopmentLevelsByClubNumber === undefined
      ? {}
      : { clubDevelopmentLevelsByClubNumber: input.clubDevelopmentLevelsByClubNumber }),
  };
  const usedSlotKeys = new Set<string>();
  const assignments: Record<string, YouthPlayerRarityAssignment> = {};

  for (const candidate of selectCandidates(
    candidateInput,
    "youth-serious-prospect",
    seriousProspectCount,
    usedSlotKeys,
    "all",
  )) {
    assignments[candidate.slotKey] = {
      slotKey: candidate.slotKey,
      archetypeKey: "serious_prospect",
    };
  }

  for (const candidate of selectCandidates(
    candidateInput,
    "youth-rare-prodigy",
    rareProdigyCount,
    usedSlotKeys,
    "all",
  )) {
    assignments[candidate.slotKey] = {
      slotKey: candidate.slotKey,
      archetypeKey: "rare_prodigy",
    };
  }

  return {
    budget: {
      seriousProspectCount,
      rareProdigyCount,
    },
    assignmentsBySlotKey: assignments,
  };
}

/** Builds the stable generated slot key used by rarity allocation. */
export function playerRaritySlotKey(clubNumber: number, slotNumber: number): string {
  return `${clubNumber}:${slotNumber}`;
}

/** Returns whether an archetype is controlled by the rarity budget. */
export function isBudgetedArchetype(key: GeneratedPlayerArchetypeKey): boolean {
  return key === "category_star" || key === "veteran_drop_down" || key === "serious_prospect" || key === "rare_prodigy";
}

function playerRarityBudgetForSeed(seed: string, division: ClubCategory, seasonKey: string): PlayerRarityBudget {
  const rng = deriveRng(seed, "player-rarity-budget", division, seasonKey);
  const budget = potentialRarityBudgetForDivision(division);

  return {
    whiteFlyCount: rng.nextInt(budget.whiteFlyPerDivision.minInclusive, budget.whiteFlyPerDivision.maxInclusive + 1),
    seriousProspectCount: rng.nextInt(budget.highPerDivision.minInclusive, budget.highPerDivision.maxInclusive + 1),
    rareProdigyCount: rng.nextFloat() < budget.eliteChance ? budget.elitePerDivision.maxInclusive : budget.elitePerDivision.minInclusive,
  };
}

interface RarityCandidate {
  readonly clubNumber: number;
  readonly slotNumber: number;
  readonly slotKey: string;
}

function selectCandidates(
  input: BuildPlayerRarityAllocationInput,
  streamName: string,
  count: number,
  usedSlotKeys: Set<string>,
  slotPool: "all" | "lineup" | "reserve",
): readonly RarityCandidate[] {
  const selected: RarityCandidate[] = [];
  const usedClubNumbers = new Set<number>();
  const candidates = rankedCandidates(input, streamName, slotPool);

  for (const candidate of candidates) {
    if (selected.length >= count) {
      break;
    }

    if (usedSlotKeys.has(candidate.slotKey) || usedClubNumbers.has(candidate.clubNumber)) {
      continue;
    }

    selected.push(candidate);
    usedSlotKeys.add(candidate.slotKey);
    usedClubNumbers.add(candidate.clubNumber);
  }

  return selected;
}

function rankedCandidates(
  input: BuildPlayerRarityAllocationInput,
  streamName: string,
  slotPool: "all" | "lineup" | "reserve",
): readonly RarityCandidate[] {
  const candidates: RarityCandidate[] = [];
  const firstSlot = slotPool === "reserve" ? input.lineupSize + 1 : 1;
  const lastSlot = slotPool === "lineup" ? input.lineupSize : input.playersPerClub;

  for (let clubNumber = 1; clubNumber <= input.clubCount; clubNumber += 1) {
    for (let slotNumber = firstSlot; slotNumber <= lastSlot; slotNumber += 1) {
      candidates.push({
        clubNumber,
        slotNumber,
        slotKey: playerRaritySlotKey(clubNumber, slotNumber),
      });
    }
  }

  return candidates.toSorted((left, right) => {
    const leftScore = youthRarityCandidateScore(input, streamName, left);
    const rightScore = youthRarityCandidateScore(input, streamName, right);

    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    return left.slotKey.localeCompare(right.slotKey);
  });
}

function countInRange(seed: string, streamName: string, minimum: number, maximum: number): number {
  return deriveRng(seed, "world-rarity-count", streamName).nextInt(minimum, maximum + 1);
}

function rankedStableKeys(seed: string, streamName: string, keys: readonly string[]): readonly string[] {
  return [...keys].sort((left, right) => {
    const leftScore = deriveRng(seed, "world-rarity-candidate", streamName, left).nextFloat();
    const rightScore = deriveRng(seed, "world-rarity-candidate", streamName, right).nextFloat();
    return leftScore - rightScore || left.localeCompare(right);
  });
}

function assertUniqueCandidateKeys(keys: readonly string[]): void {
  if (new Set(keys).size !== keys.length) {
    throw new Error("Exceptional-player candidate keys must be unique");
  }
}

function assertNaturalProfileFacts(
  candidates: readonly InitialWorldExceptionalCandidate[],
): void {
  for (const candidate of candidates) {
    if (
      candidate.naturalArchetypeKey === undefined
      || candidate.naturalCurrentAbilityLane === undefined
    ) {
      throw new Error(
        `Naturally exceptional candidate is missing profile truth: ${candidate.playerKey}`,
      );
    }
  }
}

function uniqueStableKeys(keys: readonly string[]): readonly string[] {
  return [...new Set(keys)];
}

function rarityCandidateScore(seed: string, streamName: string, slotKey: string): number {
  return deriveRng(seed, "player-rarity-candidate", streamName, slotKey).nextFloat();
}

function youthRarityCandidateScore(input: BuildPlayerRarityAllocationInput, streamName: string, candidate: RarityCandidate): number {
  const baseScore = rarityCandidateScore(input.seed, streamName, candidate.slotKey);
  const level = input.clubDevelopmentLevelsByClubNumber?.[candidate.clubNumber];

  return level === undefined ? baseScore : baseScore + youthDevelopmentRarityCandidateScoreModifier(level);
}

function whiteFlyArchetypeForSlot(seed: string, slotKey: string): GeneratedPlayerArchetypeKey {
  const rng = deriveRng(seed, "player-white-fly-archetype", slotKey);
  return rng.nextFloat() < 0.45 ? "veteran_drop_down" : "category_star";
}
