import assert from "node:assert/strict";
import { test } from "vitest";

import {
  evaluateCareerExitRenewalCheckpoint,
  evaluateAnnualRoleContinuityCheckpoint,
  evaluateDevelopmentRenewalCheckpoint,
  evaluateGeneratedCeilingAttributionCheckpoint,
  evaluateGenerationalSuccessionCheckpoint,
  evaluateGenerationalRenewalAttribution,
  evaluateYouthMinutePathwayCheckpoint,
  l4GenerationInputSignature,
  type AcademyParticipationCheckpointFacts,
  type AnnualRoleContinuityWorldFacts,
  type AnnualRoleFormationHealthWorldFacts,
  type GeneratedCeilingAttributionRow,
  type GenerationalSuccessionRow,
  type GenerationalSuccessionWorldFacts,
} from "./generational-succession.ts";

test("the first material funnel break owns attribution and unknown origin blocks it", () => {
  const generationBreak = evaluateGenerationalSuccessionCheckpoint([worldFacts({
    openingPopulationCount: 100,
    careerGeneratedCount: 40,
  })]);
  const developmentBreak = evaluateGenerationalSuccessionCheckpoint([worldFacts({
    openingPopulationCount: 100,
    careerGeneratedCount: 60,
    matureAcademyIntakeCount: 40,
    promotionCandidateCount: 5,
  })]);
  const unknown = evaluateGenerationalSuccessionCheckpoint([worldFacts({ unknownOriginCount: 1 })]);

  assert.equal(generationBreak.owner, "generation_quality_or_quantity");
  assert.equal(generationBreak.decision, "OWNER_IDENTIFIED");
  assert.equal(developmentBreak.owner, "development_conversion");
  assert.equal(unknown.decision, "REFINE");
  assert.equal(unknown.owner, "not_identified");
});

test("renewal attribution reads quality and material-minute intersections instead of selected over registered", () => {
  const base = worldFacts({
    openingPopulationCount: 100,
    careerGeneratedCount: 60,
    matureAcademyIntakeCount: 20,
    promotionCandidateCount: 10,
    completedPromotionCount: 6,
    seasonTenActiveOpeningSeniorCount: 40,
    generatedActivePopulationCount: 20,
    generatedSeniorQualityPlayerCount: 10,
    generatedSeniorQualityMaterialMinutePlayerCount: 6,
  });
  assert.equal(evaluateGenerationalRenewalAttribution({
    worlds: [{ ...base, careerGeneratedCount: 40 }],
    actorAllocationOwnsResidual: true,
  }).owner, "intake_quality_or_quantity");
  assert.equal(evaluateGenerationalRenewalAttribution({
    worlds: [worldFacts({ ...base, generatedSeniorQualityPlayerCount: 4 })],
    actorAllocationOwnsResidual: true,
  }).owner, "development_realization");
  assert.equal(evaluateGenerationalRenewalAttribution({
    worlds: [worldFacts({ ...base, completedPromotionCount: 4 })],
    actorAllocationOwnsResidual: true,
  }).owner, "promotion_opportunity");
  assert.equal(evaluateGenerationalRenewalAttribution({
    worlds: [worldFacts({ ...base, generatedSeniorQualityMaterialMinutePlayerCount: 4 })],
    actorAllocationOwnsResidual: true,
  }).owner, "selection_opportunity");
  assert.equal(evaluateGenerationalRenewalAttribution({
    worlds: [worldFacts({ ...base, seasonTenActiveOpeningSeniorCount: 60 })],
    actorAllocationOwnsResidual: true,
  }).owner, "exit_retention_balance");
  assert.equal(evaluateGenerationalRenewalAttribution({
    worlds: [base],
    actorAllocationOwnsResidual: true,
  }).owner, "downstream_actor_allocation");
});

test("the frozen ordered rule reaches promotion, selection and exit owners", () => {
  const base = worldFacts({
    openingPopulationCount: 100,
    careerGeneratedCount: 60,
    matureAcademyIntakeCount: 20,
    promotionCandidateCount: 10,
    completedPromotionCount: 6,
    seasonTenRegisteredCareerGeneratedCount: 10,
    seasonTenSelectedCareerGeneratedCount: 6,
    totalAcquisitionCount: 20,
    careerGeneratedAcquisitionCount: 6,
    seasonTenOpeningLeaderboardCount: 30,
    seasonTenCareerGeneratedLeaderboardCount: 10,
  });

  assert.equal(evaluateGenerationalSuccessionCheckpoint([worldFacts({
    ...base,
    completedPromotionCount: 4,
  })]).owner, "academy_promotion");
  assert.equal(evaluateGenerationalSuccessionCheckpoint([worldFacts({
    ...base,
    seasonTenSelectedCareerGeneratedCount: 4,
  })]).owner, "ai_selection_opportunity");
  assert.equal(evaluateGenerationalSuccessionCheckpoint([worldFacts({
    ...base,
    careerGeneratedAcquisitionCount: 4,
  })]).owner, "retirement_or_exit");
  assert.equal(evaluateGenerationalSuccessionCheckpoint([base]).owner, "retirement_or_exit");
});

test("L4.1 distinguishes pathway defects from a correctly exercised renewal failure", () => {
  const passing = worldFacts({
    seasonTenOpeningLeaderboardCount: 10,
    seasonTenCareerGeneratedLeaderboardCount: 10,
  });
  const reconciliationFailure = worldFacts({
    seasonTenOpeningLeaderboardCount: 10,
    seasonTenCareerGeneratedLeaderboardCount: 10,
    academyParticipation: {
      ...passing.academyParticipation,
      missingPlayerMonthCount: 1,
    },
  });
  const renewalFailure = worldFacts({
    seasonTenOpeningLeaderboardCount: 30,
    seasonTenCareerGeneratedLeaderboardCount: 10,
  });

  assert.equal(evaluateYouthMinutePathwayCheckpoint([passing]).decision, "GO");
  assert.equal(evaluateYouthMinutePathwayCheckpoint([reconciliationFailure]).decision, "REFINE");
  assert.equal(evaluateYouthMinutePathwayCheckpoint([renewalFailure]).decision, "STOP_RETHINK");
});

test("L4.2 distinguishes exit reachability from a correctly exercised renewal failure", () => {
  const passing = worldFacts({
    seasonTenOpeningLeaderboardCount: 10,
    seasonTenCareerGeneratedLeaderboardCount: 10,
  });
  const unreachable = worldFacts({
    seasonTenOpeningLeaderboardCount: 10,
    seasonTenCareerGeneratedLeaderboardCount: 10,
    softOutfieldAgeRetirementCount: 0,
  });
  const renewalFailure = worldFacts({
    seasonTenOpeningLeaderboardCount: 30,
    seasonTenCareerGeneratedLeaderboardCount: 10,
    seasonTenActiveOpeningSeniorCount: 60,
  });

  assert.equal(evaluateCareerExitRenewalCheckpoint([passing]).decision, "GO");
  assert.equal(evaluateCareerExitRenewalCheckpoint([unreachable]).decision, "REFINE");
  assert.equal(evaluateCareerExitRenewalCheckpoint([renewalFailure]).decision, "STOP_RETHINK");
});

test("L4.3 attributes each complete generated-ceiling owner on five of seven worlds", () => {
  const worlds = (rows: readonly GeneratedCeilingAttributionRow[]) => Array.from(
    { length: 7 },
    (_, index) => worldFacts({ worldSeed: `generation-test-world-${index}`, generatedCeilingRows: rows }),
  );

  const generation = evaluateGeneratedCeilingAttributionCheckpoint(worlds(
    ceilingRows({ potentialP90: 9, matureCurrentP90: 9 }),
  ));
  const development = evaluateGeneratedCeilingAttributionCheckpoint(worlds(
    ceilingRows({ potentialP90: 11, matureCurrentP90: 9 }),
  ));
  const downstream = evaluateGeneratedCeilingAttributionCheckpoint(worlds(
    ceilingRows({ potentialP90: 11, matureCurrentP90: 11 }),
  ));

  assert.deepEqual([generation.owner, development.owner, downstream.owner], [
    "generation_quality",
    "development_realization",
    "downstream_selection_or_outcome",
  ]);
  assert.deepEqual([generation.decision, development.decision, downstream.decision], [
    "OWNER_IDENTIFIED",
    "OWNER_IDENTIFIED",
    "OWNER_IDENTIFIED",
  ]);
});

test("L4.3 refuses missing divisions and a heterogeneous cohort", () => {
  const missingDivision = evaluateGeneratedCeilingAttributionCheckpoint([
    worldFacts({ generatedCeilingRows: ceilingRows({ potentialP90: 9, matureCurrentP90: 9 }).slice(0, 2) }),
  ]);
  const heterogeneous = evaluateGeneratedCeilingAttributionCheckpoint([
    ...Array.from({ length: 3 }, (_, index) => worldFacts({
      worldSeed: `generation-${index}`,
      generatedCeilingRows: ceilingRows({ potentialP90: 9, matureCurrentP90: 9 }),
    })),
    ...Array.from({ length: 2 }, (_, index) => worldFacts({
      worldSeed: `development-${index}`,
      generatedCeilingRows: ceilingRows({ potentialP90: 11, matureCurrentP90: 9 }),
    })),
    ...Array.from({ length: 2 }, (_, index) => worldFacts({
      worldSeed: `downstream-${index}`,
      generatedCeilingRows: ceilingRows({ potentialP90: 11, matureCurrentP90: 11 }),
    })),
  ]);

  assert.equal(missingDivision.decision, "REFINE");
  assert.equal(missingDivision.denominatorFailureCount, 1);
  assert.equal(heterogeneous.decision, "STOP_RETHINK");
  assert.equal(heterogeneous.owner, "not_identified");
});

test("L4.4 refuses a generation input that differs from the frozen L4.3 artifact", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => worldFacts({
    worldSeed: `l4-4-input-mismatch-${index}`,
    seasonTenOpeningLeaderboardCount: 10,
    seasonTenCareerGeneratedLeaderboardCount: 10,
  }));
  const decision = evaluateDevelopmentRenewalCheckpoint(worlds);

  assert.equal(decision.decision, "REFINE");
  assert.equal(decision.generationInputMatchesL4_3, false);
  assert.equal(decision.failedGateKeys.includes("generation_input_signature"), true);
  assert.equal(decision.abilityPairObservationCount > 0, true);
});

test("the L4 generation signature ignores world and division input order", () => {
  const worlds = [
    worldFacts({ worldSeed: "world:b" }),
    worldFacts({ worldSeed: "world:a" }),
  ];
  const reorderedRows = worlds.map((world) => ({
    ...world,
    generatedCeilingRows: [...world.generatedCeilingRows].reverse(),
  })).reverse();

  assert.equal(
    l4GenerationInputSignature(worlds),
    l4GenerationInputSignature(reorderedRows),
  );
});

test("L4.5 separates role-owner refinement from carried formation collapse", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => worldFacts({
    worldSeed: `annual-role-world-${index}`,
    annualRoleContinuity: passingAnnualRoleContinuity(),
  }));
  const formations = Array.from({ length: 7 }, () => passingFormationHealth());
  const passing = evaluateAnnualRoleContinuityCheckpoint(worlds, formations);
  const roleFailure = evaluateAnnualRoleContinuityCheckpoint([
    {
      ...worlds[0]!,
      annualRoleContinuity: {
        ...worlds[0]!.annualRoleContinuity,
        rows: worlds[0]!.annualRoleContinuity.rows.map((row, index) =>
          index === 0 ? { ...row, positiveRoles: row.positiveRoles.slice(1) } : row
        ),
      },
    },
    ...worlds.slice(1),
  ], formations);
  const formationFailure = evaluateAnnualRoleContinuityCheckpoint(worlds, [
    {
      ...formations[0]!,
      seasons: formations[0]!.seasons.map((row, index) =>
        index === 0 ? { ...row, distinctFormationCount: 5 } : row
      ),
    },
    ...formations.slice(1),
  ]);

  assert.equal(passing.decision, "GO");
  assert.equal(passing.populationRowCount, 105);
  assert.equal(roleFailure.decision, "REFINE");
  assert.equal(roleFailure.failedGateKeys.includes("opening_academy_role_coverage"), true);
  assert.equal(formationFailure.decision, "STOP_RETHINK");
  assert.deepEqual(formationFailure.failedGateKeys, ["carried_formation_health"]);
});

interface WorldOverrides {
  worldSeed?: string;
  openingPopulationCount?: number;
  openingSeniorPopulationCount?: number;
  careerGeneratedCount?: number;
  matureAcademyIntakeCount?: number;
  promotionCandidateCount?: number;
  completedPromotionCount?: number;
  seasonTenRegisteredCareerGeneratedCount?: number;
  seasonTenSelectedCareerGeneratedCount?: number;
  totalAcquisitionCount?: number;
  careerGeneratedAcquisitionCount?: number;
  seasonTenOpeningLeaderboardCount?: number;
  seasonTenCareerGeneratedLeaderboardCount?: number;
  unknownOriginCount?: number;
  softOutfieldAgeRetirementCount?: number;
  seasonTenActiveOpeningSeniorCount?: number;
  academyParticipation?: AcademyParticipationCheckpointFacts;
  generatedCeilingRows?: readonly GeneratedCeilingAttributionRow[];
  annualRoleContinuity?: AnnualRoleContinuityWorldFacts;
  generatedActivePopulationCount?: number;
  generatedSeniorQualityPlayerCount?: number;
  generatedSeniorQualityMaterialMinutePlayerCount?: number;
}

function worldFacts(overrides: WorldOverrides): GenerationalSuccessionWorldFacts {
  const rows: GenerationalSuccessionRow[] = [
    row("annual_academy_intake", {
      promotionCandidateCount: overrides.promotionCandidateCount ?? 10,
      completedPromotionCount: overrides.completedPromotionCount ?? 6,
      registeredSeniorCount: overrides.seasonTenRegisteredCareerGeneratedCount ?? 10,
      selectedPlayerCount: overrides.seasonTenSelectedCareerGeneratedCount ?? 6,
      transferAcquisitionCount: overrides.careerGeneratedAcquisitionCount ?? 6,
      scorerLeaderboardCount: overrides.seasonTenCareerGeneratedLeaderboardCount ?? 10,
      activePopulationCount: overrides.generatedActivePopulationCount ?? 20,
      seniorQualityPlayerCount: overrides.generatedSeniorQualityPlayerCount ?? 10,
      seniorQualityMaterialMinutePlayerCount:
        overrides.generatedSeniorQualityMaterialMinutePlayerCount ?? 6,
    }),
    row("opening_senior", {
      ageBand: "33_plus",
      activePopulationCount: overrides.seasonTenActiveOpeningSeniorCount ?? 40,
      transferAcquisitionCount: (overrides.totalAcquisitionCount ?? 20) - (overrides.careerGeneratedAcquisitionCount ?? 6),
      scorerLeaderboardCount: overrides.seasonTenOpeningLeaderboardCount ?? 30,
    }),
  ];
  return {
    worldSeed: overrides.worldSeed ?? "generation-test-world",
    openingPopulationCount: overrides.openingPopulationCount ?? 100,
    openingSeniorPopulationCount: overrides.openingSeniorPopulationCount ?? 80,
    careerGeneratedCount: overrides.careerGeneratedCount ?? 60,
    matureAcademyIntakeCount: overrides.matureAcademyIntakeCount ?? 20,
    matureAcademyPromotionCandidateCount: overrides.promotionCandidateCount ?? 10,
    matureAcademyCompletedPromotionCount: overrides.completedPromotionCount ?? 6,
    unknownOriginCount: overrides.unknownOriginCount ?? 0,
    softOutfieldAgeRetirementCount: overrides.softOutfieldAgeRetirementCount ?? 1,
    abilityPairObservationCount: 100,
    currentAbovePotentialAbilityCount: 0,
    outOfRangeAbilityValueCount: 0,
    generatedCeilingRows: overrides.generatedCeilingRows ?? ceilingRows({
      potentialP90: 11,
      matureCurrentP90: 11,
    }),
    annualRoleContinuity: overrides.annualRoleContinuity ?? {
      plannedCandidateCount: 0,
      generatedCandidateCount: 0,
      reconciliationFailureCount: 0,
      seniorCandidateGeneratedSeasonCount: 0,
      seniorCandidateNotRequestedSeasonCount: 0,
      openingAcademyDepartmentMismatchCount: 0,
      rows: [],
    },
    academyParticipation: overrides.academyParticipation ?? {
      fixtureCount: 3,
      appearanceCount: 33,
      playerCount: 11,
      minutes: 2_970,
      fullProgrammePlayerMonthCount: 10,
      reducedProgrammePlayerMonthCount: 1,
      fullyReplacedPlayerMonthCount: 0,
      missingPlayerMonthCount: 0,
      invalidMinuteCount: 0,
    },
    rows,
  };
}

function passingAnnualRoleContinuity(): AnnualRoleContinuityWorldFacts {
  const roles = [
    "goalkeeper", "center_back", "full_back", "wing_back",
    "defensive_midfielder", "central_midfielder", "attacking_midfielder",
    "wide_midfielder", "winger", "striker",
  ];
  const rows = Array.from({ length: 3 }, (_, competitionIndex) => ({
    competitionId: `competition:${competitionIndex + 1}`,
    opening: {
      seasonNumber: 0,
      source: "opening_academy" as const,
      generatedCount: 198,
      positiveRoles: roles,
      maximumReachableRoleCount: 10,
      sidedRoleImbalanceCount: 0,
    },
    seasons: Array.from({ length: 2 }, (_, seasonIndex) => [
      {
        seasonNumber: seasonIndex + 1,
        source: "academy_refill" as const,
        generatedCount: 18,
        positiveRoles: roles,
        maximumReachableRoleCount: 10,
        sidedRoleImbalanceCount: 0,
      },
      {
        seasonNumber: seasonIndex + 1,
        source: "senior_candidate" as const,
        generatedCount: 144,
        positiveRoles: roles,
        maximumReachableRoleCount: 10,
        sidedRoleImbalanceCount: 0,
      },
    ]),
  })).flatMap(({ competitionId, opening, seasons }) => [
    { ...opening, competitionId },
    ...seasons.flat().map((row) => ({ ...row, competitionId })),
  ]);
  return {
    plannedCandidateCount: 972,
    generatedCandidateCount: 972,
    reconciliationFailureCount: 0,
    seniorCandidateGeneratedSeasonCount: 2,
    seniorCandidateNotRequestedSeasonCount: 0,
    openingAcademyDepartmentMismatchCount: 0,
    rows,
  };
}

function passingFormationHealth(): AnnualRoleFormationHealthWorldFacts {
  return {
    opening: Array.from({ length: 3 }, () => ({
      primaryRolePositiveCount: 10,
      distinctFormationCount: 8,
      topFormationShare: 0.25,
      catalogOrderSensitiveSelectionCount: 0,
      emergencyCatalogSelectionCount: 0,
      forcedOutOfPositionSlotCount: 0,
      avoidableOutOfPositionSlotCount: 0,
      academyCallUpAppearanceCount: 1,
      meanOutOfPositionSlots: 0,
    })),
    seasons: Array.from({ length: 6 }, () => ({
      primaryRolePositiveCount: 10,
      distinctFormationCount: 8,
      topFormationShare: 0.25,
      fallbackSelectionCount: 0,
      missingSelectionSourceCount: 0,
      missingStableIdCount: 0,
      reconciliationFailureCount: 0,
    })),
  };
}

function ceilingRows(input: {
  readonly potentialP90: number;
  readonly matureCurrentP90: number;
}): readonly GeneratedCeilingAttributionRow[] {
  return Array.from({ length: 3 }, (_, index) => ({
    competitionId: `competition:${index + 1}`,
    openingSeniorCount: 100,
    openingSeniorCurrentMedian: 10,
    acceptedAnnualIntakeCount: 30,
    acceptedAnnualIntakePotentialP90: input.potentialP90,
    acceptedAnnualIntakeRoles: [
      "attacking_midfielder",
      "center_back",
      "central_midfielder",
      "defensive_midfielder",
      "full_back",
      "goalkeeper",
      "striker",
      "wide_midfielder",
      "wing_back",
      "winger",
    ],
    matureAnnualIntakeCount: 10,
    matureAnnualIntakeCurrentP90: input.matureCurrentP90,
  }));
}

function row(
  origin: GenerationalSuccessionRow["origin"],
  overrides: Partial<GenerationalSuccessionRow>,
): GenerationalSuccessionRow {
  return {
    seasonNumber: 10,
    competitionId: "competition:test",
    competitionName: "Test Division",
    origin,
    ageBand: "25_29",
    generatedCount: 0,
    activePopulationCount: 0,
    academyMembershipCount: 0,
    academyExitCount: 0,
    promotionCandidateCount: 0,
    completedPromotionCount: 0,
    registeredSeniorCount: 0,
    selectedPlayerCount: 0,
    seniorQualityPlayerCount: 0,
    seniorQualityMaterialMinutePlayerCount: 0,
    emergencySelectionCount: 0,
    starts: 0,
    minutes: 0,
    currentAbilityMean: "not_observed",
    potentialRoomMean: "not_observed",
    transferAcquisitionCount: 0,
    freeAgentAcquisitionCount: 0,
    retirementExitCount: 0,
    scorerLeaderboardCount: 0,
    assistLeaderboardCount: 0,
    ...overrides,
  };
}
