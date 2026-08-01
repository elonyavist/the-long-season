import type {
  ClubCategory,
  ClubDevelopmentEnvironmentKey,
  PlayerRatingScaleConfig,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import type { GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";
import type { CurrentAbilityRarityLane } from "./player-current-ability-bands.ts";
import { potentialRarityBudgetForDivision } from "./player-potential-rarity.ts";
import { youthDevelopmentSeriousProspectChance } from "./youth-development-level.ts";

/** League-level rarity budget for one generated player pool. */
export interface PlayerRarityBudget {
  /** Unusually strong current-ability players in a lower-division league. */
  readonly whiteFlyCount: number;
  /** High-upside prospects who can plausibly climb above their current level. */
  readonly seriousProspectCount: number;
}

/** One deterministic routine rarity assignment to a generated player slot. */
export type PlayerRarityAssignment =
  | {
      readonly slotKey: string;
      readonly rarityKind: "white_fly";
      readonly archetypeKey: "category_star" | "veteran_drop_down";
    }
  | {
      readonly slotKey: string;
      readonly rarityKind: "serious_prospect";
      readonly archetypeKey: "serious_prospect";
    };

/** Complete rarity allocation for one generated league. */
export interface PlayerRarityAllocation {
  /** League-level target counts. */
  readonly budget: PlayerRarityBudget;
  /** Assignment lookup by generated slot key. */
  readonly assignmentsBySlotKey: Readonly<Record<string, PlayerRarityAssignment>>;
}

/** Division-season rarity targets for an initial youth-academy population. */
export interface YouthPlayerRarityBudget {
  /** Serious prospects produced by bounded academy-environment probability. */
  readonly seriousProspectCount: number;
}

/** One deterministic serious-prospect assignment inside an initial youth pool. */
export interface YouthPlayerRarityAssignment {
  /** Stable club/academy slot key. */
  readonly slotKey: string;
  /** Archetype selected by the bounded academy-environment allocator. */
  readonly archetypeKey: "serious_prospect";
}

/** Complete serious-prospect allocation for one division's initial academies. */
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
  /** Seven-state development environment by generated one-based club number. */
  readonly clubEnvironmentKeysByClubNumber: Readonly<
    Record<number, ClubDevelopmentEnvironmentKey>
  >;
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
}

/** Stable senior or academy candidate considered by the national stock owner. */
export interface InitialWorldExceptionalCandidate {
  readonly playerKey: string;
  /** Stable owning-club key used to prevent exceptional youth concentration. */
  readonly clubKey: string;
  readonly division: ClubCategory;
  readonly clubTier: "title_contender" | "playoff_contender" | "mid_table" | "survival";
  /** Exact completed civil age on the opening-world reference date. */
  readonly ageYears: number;
  readonly isFirstTeam: boolean;
  /** Whether this deterministic ordinary profile already reaches six stars now. */
  readonly naturallyCurrentSix?: boolean;
  /** Whether this deterministic ordinary profile already has a six-star ceiling. */
  readonly naturallyPotentialSix?: boolean;
  /** Actual archetype used by a naturally qualifying profile. */
  readonly naturalArchetypeKey?: GeneratedPlayerArchetypeKey;
  /** Actual current-quality lane used by a naturally qualifying profile. */
  readonly naturalCurrentAbilityLane?: CurrentAbilityRarityLane;
  /** Effective current-quality lane used when this generator constructs an exception. */
  readonly constructedExceptionalCurrentAbilityLane: CurrentAbilityRarityLane;
  /** Whether the owning opening generator can deterministically reconstruct this profile. */
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
  /** Established over-20 champions who already rate six stars. */
  readonly currentSixPlayerKeys: readonly string[];
  /** Active opening players aged 15..20 whose stored ceiling rates six stars. */
  readonly youngPotentialSixPlayerKeys: readonly string[];
  /** Truthful union of established current-six and young stored-ceiling-six players. */
  readonly potentialSixPlayerKeys: readonly string[];
  /** Natural surplus ceilings reconstructed below six to honor national stock. */
  readonly reconstructedPotentialBelowSixPlayerKeys: readonly string[];
  readonly assignmentsByPlayerKey: Readonly<Record<string, InitialWorldExceptionalAssignment>>;
}

/** Input for the complete initial-world exceptional allocation. */
export interface BuildInitialWorldExceptionalAllocationInput {
  readonly seed: string;
  readonly ratingScale: PlayerRatingScaleConfig;
  readonly candidates: readonly InitialWorldExceptionalCandidate[];
}

/** Input for one deterministic annual national-stock reconciliation. */
export interface BuildAnnualWorldIntakeExceptionalAllocationInput {
  readonly seed: string;
  readonly seasonIndex: number;
  readonly ratingScale: PlayerRatingScaleConfig;
  /** Full active age-15-to-20 six-ceiling stock after annual lifecycle exits. */
  readonly activeYoungPotentialSixPlayers: readonly AnnualWorldYoungExceptionalPlayer[];
  /** Real refill slots available before any per-club intake batch is generated. */
  readonly candidates: readonly AnnualWorldIntakeExceptionalCandidate[];
}

/** One active young six-ceiling player used to reconcile national stock. */
export interface AnnualWorldYoungExceptionalPlayer {
  readonly playerKey: string;
  /** Undefined only for a free agent without a current owning club. */
  readonly clubKey?: string;
  /** Current owning-club category; undefined for a free agent. */
  readonly division?: ClubCategory;
}

/** One real annual academy-refill slot eligible for world-level allocation. */
export interface AnnualWorldIntakeExceptionalCandidate {
  readonly playerKey: string;
  readonly clubKey: string;
  readonly division: ClubCategory;
  readonly clubTier: "title_contender" | "playoff_contender" | "mid_table" | "survival";
}

/** Vacancy-based potential-six assignments for one complete annual intake. */
export interface AnnualWorldIntakeExceptionalAllocation {
  /** Stable national target derived from the world seed, always `4..5`. */
  readonly targetActiveYoungPotentialSixCount: number;
  /** Full active count observed before this intake allocates a top-up. */
  readonly activeYoungPotentialSixCount: number;
  /** Vacancies between active stock and this season's deterministic target. */
  readonly vacancyCount: number;
  /** Vacancies that remain only when no eligible real intake slot exists. */
  readonly unfilledVacancyCount: number;
  /** New exceptional intake IDs selected from eligible real vacancies. */
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
    "initial-established-current-six-count",
    input.ratingScale.rarity.initialWorld.establishedCurrentSixMinimum,
    input.ratingScale.rarity.initialWorld.establishedCurrentSixMaximum,
  );
  const configuredYoungPotentialCount = countInRange(
    input.seed,
    "national-young-stored-ceiling-six-target",
    input.ratingScale.rarity.initialWorld.youngStoredCeilingSixMinimum,
    input.ratingScale.rarity.initialWorld.youngStoredCeilingSixMaximum,
  );
  const currentCandidates = input.candidates.filter((candidate) =>
    isEligibleEstablishedCurrentSix(candidate)
    && candidate.canConstructExceptionalProfile !== false
  );
  if (naturalCurrentCandidates.some((candidate) => !currentCandidates.includes(candidate))) {
    throw new Error("Naturally current-six profile is outside the credible current-star lane");
  }
  if (
    naturalCurrentCandidates.length
      > input.ratingScale.rarity.initialWorld.establishedCurrentSixMaximum
  ) {
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
    "initial-established-current-six",
    currentCandidates
      .map((candidate) => candidate.playerKey)
      .filter((key) => !naturalCurrentKeys.includes(key)),
  ).slice(0, currentCount - naturalCurrentKeys.length);
  const currentSixPlayerKeys = [...naturalCurrentKeys, ...constructedCurrentKeys];
  const youngPotentialSixPlayerKeys = selectInitialYoungPotentialSixPlayers({
    seed: input.seed,
    count: configuredYoungPotentialCount,
    candidates: input.candidates,
    naturalCandidates: naturalPotentialCandidates.filter(isYoungExceptionalCandidate),
    lowerDivisionMaximum:
      input.ratingScale.rarity.initialWorld.lowerDivisionYoungStoredCeilingSixMaximum,
    perClubMaximum:
      input.ratingScale.rarity.initialWorld.youngStoredCeilingSixPerClubMaximum,
  });
  const potentialSixPlayerKeys = uniqueStableKeys([
    ...currentSixPlayerKeys,
    ...youngPotentialSixPlayerKeys,
  ]);

  if (
    currentSixPlayerKeys.length !== currentCount
    || youngPotentialSixPlayerKeys.length !== configuredYoungPotentialCount
  ) {
    throw new Error("Initial world does not contain enough eligible exceptional-player candidates");
  }

  const naturalPotentialKeys = naturalPotentialCandidates.map(
    (candidate) => candidate.playerKey,
  );
  const selectedPotentialKeys = new Set(potentialSixPlayerKeys);
  const reconstructedPotentialBelowSixPlayerKeys = rankedStableKeys(
    input.seed,
    "initial-reconstructed-potential-six",
    naturalPotentialKeys.filter((key) => !selectedPotentialKeys.has(key)),
  );
  for (const key of reconstructedPotentialBelowSixPlayerKeys) {
    if (candidatesByKey.get(key)?.canConstructExceptionalProfile === false) {
      throw new Error(`Natural potential-six profile cannot be reconstructed: ${key}`);
    }
  }
  const naturalKeys = new Set(
    potentialSixPlayerKeys.filter((key) => {
      const candidate = candidatesByKey.get(key);
      return candidate?.naturallyPotentialSix === true
        && (!currentSixPlayerKeys.includes(key) || candidate.naturallyCurrentSix === true);
    }),
  );
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
        : candidate.constructedExceptionalCurrentAbilityLane;
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
    youngPotentialSixPlayerKeys,
    potentialSixPlayerKeys,
    reconstructedPotentialBelowSixPlayerKeys,
    assignmentsByPlayerKey,
  };
}

/**
 * Reconciles active national young-exceptional stock before annual generation.
 *
 * The allocator observes the full active `15..20` population after lifecycle
 * exits, fills only real vacancies, and never mutates existing players. Future
 * country composition must invoke this policy once per country rather than
 * multiplying one country's stock inside a shared club loop.
 */
export function buildAnnualWorldIntakeExceptionalAllocation(
  input: BuildAnnualWorldIntakeExceptionalAllocationInput,
): AnnualWorldIntakeExceptionalAllocation {
  if (!Number.isSafeInteger(input.seasonIndex) || input.seasonIndex < 0) {
    throw new RangeError(`Invalid intake season index: ${input.seasonIndex}`);
  }
  assertUniqueCandidateKeys(
    input.activeYoungPotentialSixPlayers.map((player) => player.playerKey),
  );
  assertUniqueCandidateKeys(input.candidates.map((candidate) => candidate.playerKey));
  const targetActiveYoungPotentialSixCount = countInRange(
    input.seed,
    "national-young-stored-ceiling-six-target",
    input.ratingScale.rarity.annualIntake.activeYoungStoredCeilingSixTargetMinimum,
    input.ratingScale.rarity.annualIntake.activeYoungStoredCeilingSixTargetMaximum,
  );
  const activeYoungPotentialSixCount = input.activeYoungPotentialSixPlayers.length;
  const vacancyCount = Math.max(
    0,
    targetActiveYoungPotentialSixCount - activeYoungPotentialSixCount,
  );
  const potentialSixPlayerKeys = selectAnnualYoungPotentialSixPlayers({
    seed: input.seed,
    seasonIndex: input.seasonIndex,
    count: vacancyCount,
    activePlayers: input.activeYoungPotentialSixPlayers,
    candidates: input.candidates,
    lowerDivisionMaximum:
      input.ratingScale.rarity.initialWorld.lowerDivisionYoungStoredCeilingSixMaximum,
    perClubMaximum:
      input.ratingScale.rarity.initialWorld.youngStoredCeilingSixPerClubMaximum,
  });

  return {
    targetActiveYoungPotentialSixCount,
    activeYoungPotentialSixCount,
    vacancyCount,
    unfilledVacancyCount: vacancyCount - potentialSixPlayerKeys.length,
    potentialSixPlayerKeys,
  };
}

function isEligibleEstablishedCurrentSix(
  candidate: InitialWorldExceptionalCandidate,
): boolean {
  return candidate.ageYears > 20
    && isStrongFirstDivisionClub(candidate)
    && candidate.isFirstTeam;
}

function isYoungExceptionalCandidate(
  candidate: InitialWorldExceptionalCandidate,
): boolean {
  return candidate.ageYears >= 15 && candidate.ageYears <= 20;
}

function isStrongFirstDivisionClub(input: {
  readonly division: ClubCategory;
  readonly clubTier: InitialWorldExceptionalCandidate["clubTier"];
}): boolean {
  return input.division === "first_division"
    && (input.clubTier === "title_contender"
      || input.clubTier === "playoff_contender");
}

function selectInitialYoungPotentialSixPlayers(input: {
  readonly seed: string;
  readonly count: number;
  readonly candidates: readonly InitialWorldExceptionalCandidate[];
  readonly naturalCandidates: readonly InitialWorldExceptionalCandidate[];
  readonly lowerDivisionMaximum: number;
  readonly perClubMaximum: number;
}): readonly string[] {
  const naturalKeys = new Set(
    input.naturalCandidates.map((candidate) => candidate.playerKey),
  );
  const eligible = input.candidates.filter((candidate) =>
    isYoungExceptionalCandidate(candidate)
    && (isStrongFirstDivisionClub(candidate)
      || candidate.division !== "first_division")
    && (naturalKeys.has(candidate.playerKey)
      || candidate.canConstructExceptionalProfile !== false)
  );
  const orderedNatural = rankedStableKeys(
    input.seed,
    "initial-natural-young-potential-six",
    eligible
      .filter((candidate) => naturalKeys.has(candidate.playerKey))
      .map((candidate) => candidate.playerKey),
  );
  const orderedConstructed = rankedStableKeys(
    input.seed,
    "initial-constructed-young-potential-six",
    eligible
      .filter((candidate) => !naturalKeys.has(candidate.playerKey))
      .map((candidate) => candidate.playerKey),
  );
  const candidatesByKey = new Map(
    eligible.map((candidate) => [candidate.playerKey, candidate]),
  );
  const selected: string[] = [];
  const countByClubKey = new Map<string, number>();
  let lowerDivisionCount = 0;

  for (const key of [...orderedNatural, ...orderedConstructed]) {
    if (selected.length >= input.count) break;
    const candidate = candidatesByKey.get(key);
    if (candidate === undefined) continue;
    const clubCount = countByClubKey.get(candidate.clubKey) ?? 0;
    const lowerDivision = candidate.division !== "first_division";
    if (
      clubCount >= input.perClubMaximum
      || (lowerDivision && lowerDivisionCount >= input.lowerDivisionMaximum)
    ) {
      continue;
    }
    selected.push(key);
    countByClubKey.set(candidate.clubKey, clubCount + 1);
    if (lowerDivision) lowerDivisionCount += 1;
  }

  return selected;
}

function selectAnnualYoungPotentialSixPlayers(input: {
  readonly seed: string;
  readonly seasonIndex: number;
  readonly count: number;
  readonly activePlayers: readonly AnnualWorldYoungExceptionalPlayer[];
  readonly candidates: readonly AnnualWorldIntakeExceptionalCandidate[];
  readonly lowerDivisionMaximum: number;
  readonly perClubMaximum: number;
}): readonly string[] {
  const countByClubKey = new Map<string, number>();
  let lowerDivisionCount = 0;
  for (const active of input.activePlayers) {
    if (active.clubKey !== undefined) {
      countByClubKey.set(
        active.clubKey,
        (countByClubKey.get(active.clubKey) ?? 0) + 1,
      );
    }
    // An unattached player is still outside Serie A and consumes the one-slot
    // national allowance; free agency must not create an allocation loophole.
    if (active.division !== "first_division") {
      lowerDivisionCount += 1;
    }
  }
  const candidatesByKey = new Map(
    input.candidates.map((candidate) => [candidate.playerKey, candidate]),
  );
  const ordered = rankedStableKeys(
    input.seed,
    `annual-young-potential-six:${input.seasonIndex}`,
    input.candidates
      .filter((candidate) =>
        isStrongFirstDivisionClub(candidate)
        || candidate.division !== "first_division"
      )
      .map((candidate) => candidate.playerKey),
  );
  const selected: string[] = [];

  for (const key of ordered) {
    if (selected.length >= input.count) break;
    const candidate = candidatesByKey.get(key);
    if (candidate === undefined) continue;
    const clubCount = countByClubKey.get(candidate.clubKey) ?? 0;
    const lowerDivision = candidate.division !== "first_division";
    if (
      clubCount >= input.perClubMaximum
      || (lowerDivision && lowerDivisionCount >= input.lowerDivisionMaximum)
    ) {
      continue;
    }
    selected.push(key);
    countByClubKey.set(candidate.clubKey, clubCount + 1);
    if (lowerDivision) lowerDivisionCount += 1;
  }

  return selected;
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

  return {
    budget,
    assignmentsBySlotKey: assignments,
  };
}

/**
 * Allocates serious youth potential through bounded environment probability.
 *
 * Routine and interesting prospects remain youth-generator policy. This
 * allocator prevents independent generator branches from turning serious
 * prospects into fixed output or reintroducing exceptional youth per club.
 */
export function buildYouthPlayerRarityAllocation(
  input: BuildYouthPlayerRarityAllocationInput,
): YouthPlayerRarityAllocation {
  const assignments: Record<string, YouthPlayerRarityAssignment> = {};
  for (let clubNumber = 1; clubNumber <= input.clubCount; clubNumber += 1) {
    const developmentEnvironment = input.clubEnvironmentKeysByClubNumber[clubNumber];
    if (developmentEnvironment === undefined) {
      throw new Error(`Missing youth-development environment for generated club ${clubNumber}`);
    }
    for (let slotNumber = 1; slotNumber <= input.playersPerClub; slotNumber += 1) {
      const slotKey = playerRaritySlotKey(clubNumber, slotNumber);
      const qualifies = deriveRng(
        input.seed,
        "youth-serious-prospect-chance",
        input.division,
        input.seasonKey,
        slotKey,
      ).nextFloat() < youthDevelopmentSeriousProspectChance(developmentEnvironment);
      if (!qualifies) continue;
      assignments[slotKey] = {
        slotKey,
        archetypeKey: "serious_prospect",
      };
      // One serious prospect per academy is enough; the environment changes
      // probability, not a club-level guaranteed output.
      break;
    }
  }
  const seriousProspectCount = Object.keys(assignments).length;

  return {
    budget: {
      seriousProspectCount,
    },
    assignmentsBySlotKey: assignments,
  };
}

/** Builds the stable generated slot key used by rarity allocation. */
export function playerRaritySlotKey(clubNumber: number, slotNumber: number): string {
  return `${clubNumber}:${slotNumber}`;
}

/** Returns whether routine slot selection must leave an archetype to an allocator. */
export function isRoutineSelectionExcludedArchetype(
  key: GeneratedPlayerArchetypeKey,
): boolean {
  switch (key) {
    case "category_star":
    case "veteran_drop_down":
    case "serious_prospect":
    case "rare_prodigy":
      return true;
    case "senior_regular":
    case "category_starter":
    case "normal_youth":
    case "good_prospect":
      return false;
    default:
      return assertNeverArchetype(key);
  }
}

function playerRarityBudgetForSeed(seed: string, division: ClubCategory, seasonKey: string): PlayerRarityBudget {
  const rng = deriveRng(seed, "player-rarity-budget", division, seasonKey);
  const budget = potentialRarityBudgetForDivision(division);

  return {
    whiteFlyCount: rng.nextInt(budget.whiteFlyPerDivision.minInclusive, budget.whiteFlyPerDivision.maxInclusive + 1),
    seriousProspectCount: rng.nextInt(budget.highPerDivision.minInclusive, budget.highPerDivision.maxInclusive + 1),
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
    const leftScore = rarityCandidateScore(input.seed, streamName, left.slotKey);
    const rightScore = rarityCandidateScore(input.seed, streamName, right.slotKey);

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

function whiteFlyArchetypeForSlot(
  seed: string,
  slotKey: string,
): "category_star" | "veteran_drop_down" {
  const rng = deriveRng(seed, "player-white-fly-archetype", slotKey);
  return rng.nextFloat() < 0.45 ? "veteran_drop_down" : "category_star";
}

function assertNeverArchetype(value: never): never {
  throw new Error(`Unsupported generated archetype: ${String(value)}`);
}
