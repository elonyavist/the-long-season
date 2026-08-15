import assert from "node:assert/strict";
import { test } from "vitest";

import { FAKE_CLUB_COUNT, FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import { resolveGeneratedExceptionalProfile } from "./player-archetypes.ts";
import {
  annualCeilingAssignmentPlayerKeys,
  annualCeilingUnfilledVacancyCount,
  buildAnnualWorldIntakeCeilingAllocation,
  buildInitialWorldExceptionalAllocation,
  buildPlayerRarityAllocation,
  buildYouthPlayerRarityAllocation,
  isRoutineSelectionExcludedArchetype,
} from "./player-rarity-budget.ts";

/** Tests protect league-level rarity budgets for generated lower-division players. */

const FAKE_INPUT = {
  seed: "rarity-budget",
  clubCount: FAKE_CLUB_COUNT,
  playersPerClub: FAKE_PLAYERS_PER_CLUB,
  lineupSize: FAKE_LINEUP_SIZE,
};

test("rarity allocation is deterministic for the same seed", () => {
  assert.deepEqual(buildPlayerRarityAllocation(FAKE_INPUT), buildPlayerRarityAllocation(FAKE_INPUT));
});

test("third-division rarity budgets stay inside configured limits", () => {
  for (let index = 0; index < 40; index += 1) {
    const allocation = buildPlayerRarityAllocation({
      ...FAKE_INPUT,
      seed: `rarity-budget-${index}`,
    });

    assert.equal(allocation.budget.whiteFlyCount >= 1, true);
    assert.equal(allocation.budget.whiteFlyCount <= 4, true);
    assert.equal(allocation.budget.seriousProspectCount >= 2, true);
    assert.equal(allocation.budget.seriousProspectCount <= 5, true);
  }
});

test("rarity allocation changes by season key while remaining deterministic", () => {
  const first = buildPlayerRarityAllocation({
    ...FAKE_INPUT,
    seasonKey: "season:0001",
  });
  const second = buildPlayerRarityAllocation({
    ...FAKE_INPUT,
    seasonKey: "season:0002",
  });

  assert.deepEqual(first, buildPlayerRarityAllocation({ ...FAKE_INPUT, seasonKey: "season:0001" }));
  assert.notDeepEqual(first, second);
});

test("rarity assignments match the requested budget count", () => {
  const allocation = buildPlayerRarityAllocation(FAKE_INPUT);
  const assignments = Object.values(allocation.assignmentsBySlotKey);

  assert.equal(
    assignments.length,
    allocation.budget.whiteFlyCount + allocation.budget.seriousProspectCount,
  );
  assert.equal(
    assignments.every((assignment) =>
      isRoutineSelectionExcludedArchetype(assignment.archetypeKey)
    ),
    true,
  );
  assert.equal(isRoutineSelectionExcludedArchetype("rare_prodigy"), true);
  assert.equal(
    assignments
      .filter((assignment) => assignment.rarityKind === "white_fly")
      .every((assignment) => Number(assignment.slotKey.split(":")[1]) <= FAKE_LINEUP_SIZE),
    true,
  );
  assert.equal(
    assignments
      .filter((assignment) => assignment.rarityKind !== "white_fly")
      .every((assignment) => Number(assignment.slotKey.split(":")[1]) > FAKE_LINEUP_SIZE),
    true,
  );
});

test("initial youth rarity allocation is deterministic and obeys division caps", () => {
  for (let index = 0; index < 100; index += 1) {
    const input = {
      seed: `youth-rarity-budget-${index}`,
      division: "third_division" as const,
      seasonKey: "season:demo-001",
      clubCount: FAKE_CLUB_COUNT,
      playersPerClub: 11,
      clubEnvironmentKeysByClubNumber: Object.fromEntries(
        Array.from({ length: FAKE_CLUB_COUNT }, (_, clubIndex) => [
          clubIndex + 1,
          "adequate" as const,
        ]),
      ),
    };
    const allocation = buildYouthPlayerRarityAllocation(input);
    const assignments = Object.values(allocation.assignmentsBySlotKey);

    assert.deepEqual(allocation, buildYouthPlayerRarityAllocation(input));
    assert.equal(allocation.budget.seriousProspectCount <= FAKE_CLUB_COUNT, true);
    assert.equal(
      assignments.length,
      allocation.budget.seriousProspectCount,
    );
    assert.equal(new Set(assignments.map((assignment) => assignment.slotKey)).size, assignments.length);
  }
});

test("initial youth rarity allocation mildly favors stronger academies without changing budget size", () => {
  let highLevelAssignments = 0;
  let lowLevelAssignments = 0;

  for (let index = 0; index < 100; index += 1) {
    const allocation = buildYouthPlayerRarityAllocation({
      seed: `youth-development-weight-${index}`,
      division: "third_division",
      seasonKey: "season:demo-001",
      clubCount: 2,
      playersPerClub: 11,
      clubEnvironmentKeysByClubNumber: {
        1: "excellent",
        2: "very_poor",
      },
    });

    for (const assignment of Object.values(allocation.assignmentsBySlotKey)) {
      if (assignment.slotKey.startsWith("1:")) highLevelAssignments += 1;
      if (assignment.slotKey.startsWith("2:")) lowLevelAssignments += 1;
    }
  }

  assert.equal(highLevelAssignments > lowLevelAssignments, true);
});

test("initial world exceptional stock is exact, separate, and credibly located", () => {
  let playoffChampionCount = 0;
  for (let seedIndex = 0; seedIndex < 20; seedIndex += 1) {
    const candidates = initialWorldCandidates();
    const allocation = buildInitialWorldExceptionalAllocation({
      seed: `global-rarity-${seedIndex}`,
      ratingScale: playerRatingScale,
      candidates,
    });
    const byKey = new Map(candidates.map((candidate) => [candidate.playerKey, candidate]));

    assert.equal(allocation.currentSixPlayerKeys.length >= 2, true);
    assert.equal(allocation.currentSixPlayerKeys.length <= 3, true);
    assert.equal(allocation.youngPotentialSixPlayerKeys.length >= 4, true);
    assert.equal(allocation.youngPotentialSixPlayerKeys.length <= 5, true);
    assert.equal(allocation.potentialSixPlayerKeys.length >= 6, true);
    assert.equal(allocation.potentialSixPlayerKeys.length <= 8, true);
    assert.equal(
      allocation.currentSixPlayerKeys.every((key) => {
        const candidate = byKey.get(key);
        return candidate?.division === "first_division"
          && (candidate.clubTier === "title_contender"
            || candidate.clubTier === "playoff_contender")
          && candidate.isFirstTeam;
      }),
      true,
    );
    playoffChampionCount += allocation.currentSixPlayerKeys.filter(
      (key) => byKey.get(key)?.clubTier === "playoff_contender",
    ).length;
    assert.equal(
      allocation.youngPotentialSixPlayerKeys.filter(
        (key) => byKey.get(key)?.division !== "first_division",
      ).length <= 1,
      true,
    );
    assert.equal(
      new Set(
        allocation.youngPotentialSixPlayerKeys.map(
          (key) => byKey.get(key)?.clubKey,
        ),
      ).size,
      allocation.youngPotentialSixPlayerKeys.length,
    );
    assert.equal(
      allocation.youngPotentialSixPlayerKeys.every((key) => {
        const candidate = byKey.get(key);
        return candidate !== undefined
          && candidate.ageYears >= 15
          && candidate.ageYears <= 20
          && (candidate.division !== "first_division"
            || candidate.clubTier === "title_contender"
            || candidate.clubTier === "playoff_contender");
      }),
      true,
    );
    assert.deepEqual(
      allocation,
      buildInitialWorldExceptionalAllocation({
        seed: `global-rarity-${seedIndex}`,
        ratingScale: playerRatingScale,
        candidates: [...candidates].reverse(),
      }),
    );
  }
  assert.equal(playoffChampionCount > 0, true);
});

test("initial world reconciles compatible natural six-star profiles before filling remaining slots", () => {
  const candidates = initialWorldCandidates().map((candidate, index) => {
    if (index === 0) {
      return {
        ...candidate,
        naturallyCurrentSix: true,
        naturallyPotentialSix: true,
        naturalArchetypeKey: "category_star" as const,
        naturalCurrentAbilityLane: "rare" as const,
      };
    }
    if (index === 11) {
      return {
        ...candidate,
        naturallyPotentialSix: true,
        naturalArchetypeKey: "serious_prospect" as const,
        naturalCurrentAbilityLane: "normal" as const,
      };
    }
    return candidate;
  });
  const input = {
    seed: "natural-exceptional-reconciliation",
    ratingScale: playerRatingScale,
    candidates,
  };
  const allocation = buildInitialWorldExceptionalAllocation(input);

  assert.equal(allocation.currentSixPlayerKeys.includes(candidates[0]!.playerKey), true);
  assert.equal(allocation.potentialSixPlayerKeys.includes(candidates[0]!.playerKey), true);
  assert.equal(allocation.youngPotentialSixPlayerKeys.includes(candidates[11]!.playerKey), true);
  assert.equal(
    allocation.assignmentsByPlayerKey[candidates[0]!.playerKey]?.source,
    "natural",
  );
  assert.equal(
    allocation.assignmentsByPlayerKey[candidates[11]!.playerKey]?.archetypeKey,
    "serious_prospect",
  );
  assert.equal(
    Object.keys(allocation.assignmentsByPlayerKey).length,
    allocation.potentialSixPlayerKeys.length,
  );
  assert.deepEqual(
    allocation,
    buildInitialWorldExceptionalAllocation({
      ...input,
      candidates: [...candidates].reverse(),
    }),
  );
});

test("initial world reconstructs only the deterministic surplus when natural young ceilings exceed five", () => {
  const naturalIndexes = [11, 33, 55, 77, 99, 121];
  const candidates = initialWorldCandidates().map((candidate, index) =>
    naturalIndexes.includes(index)
      ? {
          ...candidate,
          naturallyPotentialSix: true,
          naturalArchetypeKey: "category_star" as const,
          naturalCurrentAbilityLane: "rare" as const,
        }
      : candidate
  );
  const allocation = buildInitialWorldExceptionalAllocation({
    seed: "natural-exceptional-surplus",
    ratingScale: playerRatingScale,
    candidates,
  });
  const naturalKeys = naturalIndexes.map((index) => candidates[index]!.playerKey);
  const retainedNaturalCount = allocation.youngPotentialSixPlayerKeys.filter((key) =>
    naturalKeys.includes(key)
  ).length;

  assert.equal(allocation.youngPotentialSixPlayerKeys.length >= 4, true);
  assert.equal(allocation.youngPotentialSixPlayerKeys.length <= 5, true);
  assert.equal(allocation.reconstructedPotentialBelowSixPlayerKeys.length > 0, true);
  assert.equal(
    retainedNaturalCount + allocation.reconstructedPotentialBelowSixPlayerKeys.length,
    naturalKeys.length,
  );
  assert.equal(
    allocation.potentialSixPlayerKeys.some((key) =>
      allocation.reconstructedPotentialBelowSixPlayerKeys.includes(key)
    ),
    false,
  );
  assert.equal(
    Object.values(allocation.assignmentsByPlayerKey).every(
      (assignment) => assignment.potentialSix,
    ),
    true,
  );
});

test("annual world intake preserves six-star stock while filling the broader successor stock", () => {
  const candidates = annualCandidates();
  const empty = buildAnnualWorldIntakeCeilingAllocation({
    seed: "annual-world-rarity",
    seasonIndex: 3,
    ratingScale: playerRatingScale,
    firstDivisionClubCount: 18,
    activeYoungCeilingPlayers: [],
    candidates,
    useSuccessorCeilingStockPolicy: true,
  });
  assert.equal(
    annualCeilingAssignmentPlayerKeys(empty, 6).length,
    empty.targetActiveYoungPotentialSixCount,
  );
  assert.equal(annualCeilingAssignmentPlayerKeys(empty, 6).length > 1, true);
  assert.equal(annualCeilingUnfilledVacancyCount(empty, 6), 0);
  assert.equal(annualCeilingUnfilledVacancyCount(empty, 5), 0);
  assert.equal(
    empty.assignments.length,
    empty.targetActiveYoungPotentialFiveOrBetterCount,
  );
  const activeYoungPotentialSixPlayers = Array.from(
    { length: empty.targetActiveYoungPotentialSixCount - 1 },
    (_, index) => ({
      playerKey: `active-${index + 1}`,
      clubKey: `active-club-${index + 1}`,
      division: "first_division" as const,
      storedCeilingRating: 6 as const,
    }),
  );
  const allocation = buildAnnualWorldIntakeCeilingAllocation({
    seed: "annual-world-rarity",
    seasonIndex: 3,
    ratingScale: playerRatingScale,
    firstDivisionClubCount: 18,
    activeYoungCeilingPlayers: activeYoungPotentialSixPlayers,
    candidates,
    useSuccessorCeilingStockPolicy: true,
  });

  assert.equal(allocation.activeYoungPotentialSixCount, activeYoungPotentialSixPlayers.length);
  assert.equal(annualCeilingAssignmentPlayerKeys(allocation, 6).length, 1);
  assert.equal(annualCeilingUnfilledVacancyCount(allocation, 6), 0);
  assert.equal(annualCeilingUnfilledVacancyCount(allocation, 5), 0);
  assert.deepEqual(
    allocation,
    buildAnnualWorldIntakeCeilingAllocation({
      seed: "annual-world-rarity",
      seasonIndex: 3,
      ratingScale: playerRatingScale,
      firstDivisionClubCount: 18,
      activeYoungCeilingPlayers: [...activeYoungPotentialSixPlayers].reverse(),
      candidates: [...candidates].reverse(),
      useSuccessorCeilingStockPolicy: true,
    }),
  );
});

test("annual world intake keeps the rejected successor policy analysis-only by default", () => {
  const input = {
    seed: "annual-world-product-default",
    seasonIndex: 3,
    ratingScale: playerRatingScale,
    firstDivisionClubCount: 18,
    activeYoungCeilingPlayers: [],
    candidates: annualCandidates(),
  } as const;

  assert.deepEqual(
    buildAnnualWorldIntakeCeilingAllocation(input),
    buildAnnualWorldIntakeCeilingAllocation({
      ...input,
      useSuccessorCeilingStockPolicy: false,
    }),
  );
  assert.notDeepEqual(
    buildAnnualWorldIntakeCeilingAllocation(input),
    buildAnnualWorldIntakeCeilingAllocation({
      ...input,
      useSuccessorCeilingStockPolicy: true,
    }),
  );
});

test("annual world intake never tops up a full stock or bypasses the outside-Serie-A allowance", () => {
  const baseline = buildAnnualWorldIntakeCeilingAllocation({
    seed: "annual-world-free-agent",
    seasonIndex: 4,
    ratingScale: playerRatingScale,
    firstDivisionClubCount: 18,
    activeYoungCeilingPlayers: [],
    candidates: annualCandidates(),
    useSuccessorCeilingStockPolicy: false,
  });
  const fullStock = Array.from(
    { length: baseline.targetActiveYoungPotentialSixCount },
    (_, index) => ({
      playerKey: `full-${index + 1}`,
      clubKey: `full-club-${index + 1}`,
      division: "first_division" as const,
      storedCeilingRating: 6 as const,
    }),
  );
  const full = buildAnnualWorldIntakeCeilingAllocation({
    seed: "annual-world-free-agent",
    seasonIndex: 4,
    ratingScale: playerRatingScale,
    firstDivisionClubCount: 18,
    activeYoungCeilingPlayers: fullStock,
    candidates: annualCandidates(),
    useSuccessorCeilingStockPolicy: false,
  });
  assert.equal(annualCeilingUnfilledVacancyCount(full, 6), 0);
  assert.deepEqual(annualCeilingAssignmentPlayerKeys(full, 6), []);

  const oneVacancyWithFreeAgent = buildAnnualWorldIntakeCeilingAllocation({
    seed: "annual-world-free-agent",
    seasonIndex: 4,
    ratingScale: playerRatingScale,
    firstDivisionClubCount: 18,
    activeYoungCeilingPlayers: [
      { playerKey: "free-agent", storedCeilingRating: 6 },
      ...fullStock.slice(0, baseline.targetActiveYoungPotentialSixCount - 2),
    ],
    candidates: [{
      playerKey: "lower-only",
      clubKey: "lower-club",
      division: "second_division",
      clubTier: "title_contender",
      developmentEnvironment: "good",
    }],
    useSuccessorCeilingStockPolicy: false,
  });
  assert.deepEqual(annualCeilingAssignmentPlayerKeys(oneVacancyWithFreeAgent, 6), []);
  assert.equal(annualCeilingUnfilledVacancyCount(oneVacancyWithFreeAgent, 6), 1);
});

function initialWorldCandidates() {
  return (["first_division", "second_division", "third_division"] as const)
    .flatMap((division) =>
      Array.from({ length: 18 }, (_, clubIndex) =>
        Array.from({ length: 22 }, (_, slotIndex) => ({
          playerKey: `${division}:${clubIndex + 1}:${slotIndex + 1}`,
          clubKey: `${division}:${clubIndex + 1}`,
          division,
          clubTier: clubIndex < 4
            ? "title_contender" as const
            : clubIndex < 8
              ? "playoff_contender" as const
              : clubIndex < 14
                ? "mid_table" as const
                : "survival" as const,
          isFirstTeam: slotIndex < 11,
          ageYears: slotIndex < 11 ? 25 : 17,
          constructedExceptionalCurrentAbilityLane:
            resolveGeneratedExceptionalProfile({
              currentSixAllocated: false,
              potentialSixAllocated: true,
            }).currentAbilityLane,
        })),
      ).flat(),
    );
}

function annualCandidates() {
  return Array.from({ length: 18 }, (_, clubIndex) => ({
    playerKey: `intake-player-${clubIndex + 1}`,
    clubKey: `first-club-${clubIndex + 1}`,
    division: "first_division" as const,
    clubTier: clubIndex < 4
      ? "title_contender" as const
      : clubIndex < 8
        ? "playoff_contender" as const
        : clubIndex < 14
          ? "mid_table" as const
          : "survival" as const,
    developmentEnvironment: clubIndex < 4
      ? "excellent" as const
      : clubIndex < 8
        ? "very_good" as const
        : "good" as const,
  }));
}
