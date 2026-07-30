import assert from "node:assert/strict";
import { test } from "vitest";

import { FAKE_CLUB_COUNT, FAKE_LINEUP_SIZE, FAKE_PLAYERS_PER_CLUB } from "./fake-clubs.ts";
import { deriveYouthDevelopmentLevel } from "./youth-development-level.ts";
import { playerRatingScale } from "../balance/player-economy-calibration.ts";
import {
  buildAnnualWorldIntakeExceptionalAllocation,
  buildInitialWorldExceptionalAllocation,
  buildPlayerRarityAllocation,
  buildYouthPlayerRarityAllocation,
  isBudgetedArchetype,
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
    assert.equal(allocation.budget.rareProdigyCount >= 0, true);
    assert.equal(allocation.budget.rareProdigyCount <= 1, true);
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
    allocation.budget.whiteFlyCount + allocation.budget.seriousProspectCount + allocation.budget.rareProdigyCount,
  );
  assert.equal(assignments.every((assignment) => isBudgetedArchetype(assignment.archetypeKey)), true);
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
    };
    const allocation = buildYouthPlayerRarityAllocation(input);
    const assignments = Object.values(allocation.assignmentsBySlotKey);

    assert.deepEqual(allocation, buildYouthPlayerRarityAllocation(input));
    assert.equal(allocation.budget.seriousProspectCount >= 2, true);
    assert.equal(allocation.budget.seriousProspectCount <= 5, true);
    assert.equal(allocation.budget.rareProdigyCount >= 0, true);
    assert.equal(allocation.budget.rareProdigyCount <= 1, true);
    assert.equal(
      assignments.length,
      allocation.budget.seriousProspectCount + allocation.budget.rareProdigyCount,
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
      clubDevelopmentLevelsByClubNumber: {
        1: deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 10 }),
        2: deriveYouthDevelopmentLevel({ division: "third_division", clubReputation: 3 }),
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
  for (let seedIndex = 0; seedIndex < 20; seedIndex += 1) {
    const candidates = initialWorldCandidates();
    const allocation = buildInitialWorldExceptionalAllocation({
      seed: `global-rarity-${seedIndex}`,
      ratingScale: playerRatingScale,
      candidates,
    });
    const byKey = new Map(candidates.map((candidate) => [candidate.playerKey, candidate]));

    assert.equal(allocation.currentSixPlayerKeys.length >= 1, true);
    assert.equal(allocation.currentSixPlayerKeys.length <= 2, true);
    assert.equal(allocation.potentialSixPlayerKeys.length >= 2, true);
    assert.equal(allocation.potentialSixPlayerKeys.length <= 4, true);
    assert.equal(
      allocation.currentSixPlayerKeys.every((key) => {
        const candidate = byKey.get(key);
        return candidate?.division === "first_division"
          && candidate.clubTier === "title_contender"
          && candidate.isFirstTeam;
      }),
      true,
    );
    assert.equal(
      allocation.potentialSixPlayerKeys.filter(
        (key) => byKey.get(key)?.division !== "first_division",
      ).length <= 1,
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
    if (index === 396) {
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
  assert.equal(allocation.potentialSixPlayerKeys.includes(candidates[396]!.playerKey), true);
  assert.equal(
    allocation.assignmentsByPlayerKey[candidates[0]!.playerKey]?.source,
    "natural",
  );
  assert.equal(
    allocation.assignmentsByPlayerKey[candidates[396]!.playerKey]?.archetypeKey,
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

test("initial world reconstructs only the deterministic surplus when natural ceilings exceed four", () => {
  const candidates = initialWorldCandidates().map((candidate, index) =>
    index < 5
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
  const naturalKeys = candidates.slice(0, 5).map((candidate) => candidate.playerKey);
  const retainedNaturalCount = allocation.potentialSixPlayerKeys.filter((key) =>
    naturalKeys.includes(key)
  ).length;

  assert.equal(allocation.potentialSixPlayerKeys.length, 4);
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

test("annual world intake schedules exactly two to four potential-six seasons per cohort", () => {
  const candidates = Array.from({ length: 54 }, (_, index) => `intake-player-${index + 1}`);
  const allocations = Array.from({ length: 10 }, (_, seasonIndex) =>
    buildAnnualWorldIntakeExceptionalAllocation({
      seed: "annual-world-rarity",
      cohortKey: "cohort-000",
      seasonIndex,
      ratingScale: playerRatingScale,
      candidatePlayerKeys: candidates,
    })
  );
  const scheduled = allocations[0]?.scheduledSeasonOffsets ?? [];
  const assignedCount = allocations.reduce(
    (total, allocation) => total + allocation.potentialSixPlayerKeys.length,
    0,
  );

  assert.equal(scheduled.length >= 2, true);
  assert.equal(scheduled.length <= 4, true);
  assert.equal(scheduled.includes(0), false);
  assert.equal(assignedCount, scheduled.length);
  assert.equal(
    allocations.every((allocation) => allocation.potentialSixPlayerKeys.length <= 1),
    true,
  );
  assert.equal(
    allocations.every((allocation) => JSON.stringify(allocation.scheduledSeasonOffsets) === JSON.stringify(scheduled)),
    true,
  );
});

function initialWorldCandidates() {
  return (["first_division", "second_division", "third_division"] as const)
    .flatMap((division) =>
      Array.from({ length: 18 }, (_, clubIndex) =>
        Array.from({ length: 22 }, (_, slotIndex) => ({
          playerKey: `${division}:${clubIndex + 1}:${slotIndex + 1}`,
          division,
          clubTier: clubIndex < 4
            ? "title_contender" as const
            : clubIndex < 8
              ? "playoff_contender" as const
              : clubIndex < 14
                ? "mid_table" as const
                : "survival" as const,
          isFirstTeam: slotIndex < 11,
        })),
      ).flat(),
    );
}
