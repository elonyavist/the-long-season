import { deriveRng } from "@game/shared";

import type { GeneratedPlayerArchetypeKey } from "./player-archetypes.ts";

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

/** Inputs needed to allocate a deterministic league rarity budget. */
export interface BuildPlayerRarityAllocationInput {
  /** World seed. */
  readonly seed: string;
  /** Number of generated clubs in the league. */
  readonly clubCount: number;
  /** Number of generated players per club. */
  readonly playersPerClub: number;
  /** Number of default lineup slots per club. */
  readonly lineupSize: number;
}

/**
 * Builds deterministic league-level rarity assignments.
 *
 * Rarity is allocated across the league, not per club. This keeps memorable
 * lower-division exceptions possible without making them normal.
 */
export function buildPlayerRarityAllocation(input: BuildPlayerRarityAllocationInput): PlayerRarityAllocation {
  const budget = playerRarityBudgetForSeed(input.seed);
  const usedSlotKeys = new Set<string>();
  const assignments: Record<string, PlayerRarityAssignment> = {};

  for (const candidate of selectCandidates(input, "white-fly", budget.whiteFlyCount, usedSlotKeys, true)) {
    const archetypeKey = whiteFlyArchetypeForSlot(input.seed, candidate.slotKey);
    assignments[candidate.slotKey] = {
      slotKey: candidate.slotKey,
      rarityKind: "white_fly",
      archetypeKey,
    };
  }

  for (const candidate of selectCandidates(input, "serious-prospect", budget.seriousProspectCount, usedSlotKeys, true)) {
    assignments[candidate.slotKey] = {
      slotKey: candidate.slotKey,
      rarityKind: "serious_prospect",
      archetypeKey: "serious_prospect",
    };
  }

  for (const candidate of selectCandidates(input, "rare-prodigy", budget.rareProdigyCount, usedSlotKeys, true)) {
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

/** Builds the stable generated slot key used by rarity allocation. */
export function playerRaritySlotKey(clubNumber: number, slotNumber: number): string {
  return `${clubNumber}:${slotNumber}`;
}

/** Returns whether an archetype is controlled by the rarity budget. */
export function isBudgetedArchetype(key: GeneratedPlayerArchetypeKey): boolean {
  return key === "category_star" || key === "veteran_drop_down" || key === "serious_prospect" || key === "rare_prodigy";
}

function playerRarityBudgetForSeed(seed: string): PlayerRarityBudget {
  const rng = deriveRng(seed, "player-rarity-budget");

  return {
    whiteFlyCount: rng.nextInt(1, 5),
    seriousProspectCount: rng.nextInt(2, 4),
    rareProdigyCount: rng.nextFloat() < 0.35 ? 1 : 0,
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
  preferReserveSlots: boolean,
): readonly RarityCandidate[] {
  const selected: RarityCandidate[] = [];
  const usedClubNumbers = new Set<number>();
  const candidates = rankedCandidates(input, streamName, preferReserveSlots);

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
  preferReserveSlots: boolean,
): readonly RarityCandidate[] {
  const candidates: RarityCandidate[] = [];
  const firstSlot = preferReserveSlots ? input.lineupSize + 1 : 1;

  for (let clubNumber = 1; clubNumber <= input.clubCount; clubNumber += 1) {
    for (let slotNumber = firstSlot; slotNumber <= input.playersPerClub; slotNumber += 1) {
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

function rarityCandidateScore(seed: string, streamName: string, slotKey: string): number {
  return deriveRng(seed, "player-rarity-candidate", streamName, slotKey).nextFloat();
}

function whiteFlyArchetypeForSlot(seed: string, slotKey: string): GeneratedPlayerArchetypeKey {
  const rng = deriveRng(seed, "player-white-fly-archetype", slotKey);
  return rng.nextFloat() < 0.45 ? "veteran_drop_down" : "category_star";
}
