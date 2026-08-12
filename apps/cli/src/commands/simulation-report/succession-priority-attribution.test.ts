import assert from "node:assert/strict";
import { test } from "vitest";

import {
  academyProspectClassWorldFacts,
  deriveSuccessionDownstreamPlayerOutcome,
  evaluateAcademyProspectClassConversion,
  evaluateGeneratedLeaderLaneConversion,
  evaluateGeneratedPlayerLifecycleAttribution,
  evaluateRenewalLadder,
  evaluatePopulationStationarity,
  evaluateGenerationTimeStationaryCeiling,
  evaluateLeaderConversionFunnel,
  evaluateLeaderCeilingDistance,
  evaluateLeaderQualityFeasibility,
  evaluateSuccessionGrowthFeasibility,
  evaluateSuccessionPriorityComparison,
  evaluateSuccessionTargetAttribution,
  evaluateSuccessionDownstreamFunnel,
  leaderConversionWorldFacts,
  leaderCeilingDistanceWorldFacts,
  leaderQualityFeasibilityWorldFacts,
  populationStationarityWorldFacts,
  generationTimeStationaryWorldFacts,
  successionGrowthFeasibilityStage,
  type SuccessionPriorityArmSummary,
  type GeneratedPlayerLifecycleFact,
  type GeneratedLeaderLaneWorldFacts,
  type RenewalLadderWorldFacts,
  type PopulationStationarityWorldFacts,
  type GenerationTimeStationaryWorldFacts,
} from "./succession-priority-attribution.ts";

test("bounded succession passes only with paired renewal and guardrails", () => {
  const legacy = arm(0.08, 0.25, 0.52, 0.82, 1_000);
  const candidate = arm(0.14, 0.29, 0.51, 0.81, 1_040);
  const result = evaluateSuccessionPriorityComparison({ legacy, candidate });

  assert.equal(result.decision, "GO");
  assert.equal(result.owner, "bounded_succession_order");
  assert.deepEqual(result.failedGateKeys, []);
  assert.equal(result.localCoherenceCount, 7);
  assert.equal(result.generatedLeaderCoherenceCount, 7);
});

test("leader movement without the linked local transition stops", () => {
  const result = evaluateSuccessionPriorityComparison({
    legacy: arm(0.08, 0.25, 0.52, 0.82, 1_000),
    candidate: arm(0.09, 0.29, 0.52, 0.82, 1_000),
  });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.failedGateKeys.includes("local_replacement_delta"), true);
});

test("local movement without leader realization reopens downstream selection", () => {
  const result = evaluateSuccessionPriorityComparison({
    legacy: arm(0.08, 0.25, 0.52, 0.82, 1_000),
    candidate: arm(0.14, 0.26, 0.52, 0.82, 1_000),
  });

  assert.equal(result.decision, "REFINE");
  assert.equal(result.owner, "downstream_selection");
});

test("formation and volume guardrails can independently fail", () => {
  const result = evaluateSuccessionPriorityComparison({
    legacy: arm(0.08, 0.25, 0.52, 0.82, 1_000),
    candidate: arm(0.14, 0.29, 0.52, 0.70, 1_060),
  });

  assert.equal(result.decision, "REFINE");
  assert.equal(result.failedGateKeys.includes("formation_identity_guardrail"), true);
  assert.equal(result.failedGateKeys.includes("transfer_volume_guardrail"), true);
});

test("fulfilled older opening players identify target eligibility", () => {
  const result = evaluateSuccessionTargetAttribution(targetFacts({
    fulfilled: 10,
    prime: 3,
    generatedPrime: 2,
    downstream: 1,
  }));

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "target_eligibility");
});

test("prime generated acquisitions without realization identify downstream selection", () => {
  const result = evaluateSuccessionTargetAttribution(targetFacts({
    fulfilled: 10,
    prime: 7,
    generatedPrime: 5,
    downstream: 0,
  }));

  assert.equal(result.owner, "downstream_selection");
});

test("unknown origin stops target attribution", () => {
  const facts = targetFacts({ fulfilled: 10, prime: 7, generatedPrime: 5, downstream: 2 });
  const result = evaluateSuccessionTargetAttribution({
    ...facts,
    originCounts: { ...facts.originCounts, unknown: 1 },
  });

  assert.equal(result.decision, "STOP_RETHINK");
});

test("succession downstream funnel identifies one dominant real failure stage", () => {
  const result = evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({ season_ten_leader: 20, no_buyer_appearance: 20 }),
    reconciliationFailureCount: 0,
  });
  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "no_buyer_appearance");
  assert.equal(result.dominantShare, 0.5);
});

test("succession downstream funnel keeps a distributed failure mixed", () => {
  const result = evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({
      no_buyer_appearance: 12,
      below_450_buyer_minutes: 12,
      not_retained_two_seasons: 8,
      season_ten_leader: 8,
    }),
    reconciliationFailureCount: 0,
  });
  assert.equal(result.decision, "MIXED");
  assert.equal(result.owner, "mixed");
});

test("succession downstream funnel fails closed on empty or unreconciled facts", () => {
  assert.equal(evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts(),
    reconciliationFailureCount: 0,
  }).decision, "STOP_RETHINK");
  assert.equal(evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({ season_ten_leader: 35 }),
    reconciliationFailureCount: 1,
  }).decision, "STOP_RETHINK");
});

test("succession downstream funnel refuses an owner below the frozen cohort floor", () => {
  const result = evaluateSuccessionDownstreamFunnel({
    counts: downstreamCounts({ below_half_ability_growth: 34 }),
    reconciliationFailureCount: 0,
  });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.owner, "underpowered_cohort");
  assert.equal(result.observationCount, 34);
});

test("succession downstream classification starts buyer use after the episode season", () => {
  const outcome = deriveSuccessionDownstreamPlayerOutcome({
    episodeSeasonNumber: 4,
    buyerClubId: "club:buyer",
    acquisitionCurrentAbility: 10,
    seasonTenLeader: false,
    useSeasons: [
      { clubId: "club:buyer", seasonNumber: 4, appearances: 34 },
      { clubId: "club:seller", seasonNumber: 5, appearances: 34 },
    ],
    playerSeasons: [
      { clubId: "club:buyer", seasonNumber: 4, minutes: 3_060, currentAbility: 10 },
      { clubId: "club:seller", seasonNumber: 5, minutes: 3_060, currentAbility: 11 },
    ],
  });

  assert.equal(outcome.stage, "no_buyer_appearance");
});

test("succession downstream classification reads retention at the second buyer season", () => {
  const outcome = deriveSuccessionDownstreamPlayerOutcome({
    episodeSeasonNumber: 4,
    buyerClubId: "club:buyer",
    acquisitionCurrentAbility: 10,
    seasonTenLeader: false,
    useSeasons: [
      { clubId: "club:buyer", seasonNumber: 5, appearances: 8 },
      { clubId: "club:buyer", seasonNumber: 6, appearances: 12 },
    ],
    playerSeasons: [
      { clubId: "club:buyer", seasonNumber: 5, minutes: 400, currentAbility: 10.3 },
      { clubId: "club:buyer", seasonNumber: 6, minutes: 700, currentAbility: 10.6 },
    ],
  });

  assert.equal(outcome.stage, "developed_not_leader");
  assert.equal(outcome.buyerMinutes, 1_100);
  assert.ok(Math.abs((outcome.realizedGrowth as number) - 0.6) < 1e-12);
});

test("growth feasibility prioritizes stored room before buyer load", () => {
  assert.equal(successionGrowthFeasibilityStage({
    acquisitionPotentialRoom: 0.49,
    buyerMinutes: 3_000,
  }), "insufficient_stored_room");
  assert.equal(successionGrowthFeasibilityStage({
    acquisitionPotentialRoom: 0.5,
    buyerMinutes: 1_799,
  }), "low_two_season_buyer_load");
  assert.equal(successionGrowthFeasibilityStage({
    acquisitionPotentialRoom: 0.5,
    buyerMinutes: 1_800,
  }), "development_not_realized");
});

test("growth feasibility identifies a majority and fails closed on drift", () => {
  const counts = {
    insufficient_stored_room: 31,
    low_two_season_buyer_load: 10,
    development_not_realized: 20,
  } as const;
  const result = evaluateSuccessionGrowthFeasibility({
    counts,
    expectedObservationCount: 61,
    reconciliationFailureCount: 0,
  });
  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "insufficient_stored_room");
  assert.equal(evaluateSuccessionGrowthFeasibility({
    counts,
    expectedObservationCount: 60,
    reconciliationFailureCount: 0,
  }).decision, "STOP_RETHINK");
});

test("leader conversion compares generated players with leaders of the same role", () => {
  const leaders = Array.from({ length: 10 }, (_, index) => playerSeason({
    playerId: `leader-${index}`,
    currentAbility: 12 + index / 10,
    minutes: 2_000,
    goals: 20 - index,
    assists: 10 - index,
  }));
  const generated = [
    playerSeason({ playerId: "generated-leader", currentAbility: 13, minutes: 2_000, goals: 30 }),
    playerSeason({ playerId: "generated-low-quality", currentAbility: 11, minutes: 2_000 }),
    playerSeason({ playerId: "generated-low-minutes", currentAbility: 13, minutes: 899 }),
    playerSeason({ playerId: "generated-ready", currentAbility: 13, minutes: 900 }),
    playerSeason({
      playerId: "generated-goalkeeper",
      role: "goalkeeper",
      currentAbility: 20,
      minutes: 3_060,
    }),
  ];
  const rows = [...leaders, ...generated];
  const facts = leaderConversionWorldFacts({
    worldSeed: "world-1",
    playerSeasons: rows,
    playerOrigins: rows.map(({ playerId }) => ({
      playerId,
      origin: playerId.startsWith("generated-")
        ? "annual_academy_intake" as const
        : "opening_senior" as const,
      generatedSeasonNumber: playerId.startsWith("generated-") ? 1 : 0,
    })),
    cohort: "all_generated",
  });

  assert.equal(facts.leaderSlotCount, 20);
  assert.equal(facts.unrepresentedRolePlayerCount, 1);
  assert.deepEqual(facts.counts, {
    season_ten_leader: 1,
    below_role_leader_quality: 1,
    quality_ready_below_900_minutes: 1,
    quality_and_minutes_ready_not_leader: 1,
  });
});

test("leader conversion identifies only a reachable majority owner", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => ({
    worldSeed: `world-${index + 1}`,
    competitionCount: 3,
    leaderSlotCount: 60,
    generatedPlayerCount: 43,
    representedRolePlayerCount: 42,
    unrepresentedRolePlayerCount: 1,
    recentGeneratedExcludedCount: 0,
    counts: {
      season_ten_leader: 1,
      below_role_leader_quality: 30,
      quality_ready_below_900_minutes: 5,
      quality_and_minutes_ready_not_leader: 6,
    },
    reconciliationFailureCount: 0,
  }));
  const result = evaluateLeaderConversionFunnel({
    worlds,
    seasonCount: 10,
    minimumCohortSize: 100,
  });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "leader_quality_supply");
  assert.equal(result.competitionCount, 21);
  assert.equal(result.leaderSlotCount, 420);
  assert.ok(result.dominantShare !== "not_observed" && result.dominantShare > 0.5);
});

test("leader conversion fails closed when a declared stage is unreachable", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => ({
    worldSeed: `world-${index + 1}`,
    competitionCount: 3,
    leaderSlotCount: 60,
    generatedPlayerCount: 30,
    representedRolePlayerCount: 30,
    unrepresentedRolePlayerCount: 0,
    recentGeneratedExcludedCount: 0,
    counts: {
      season_ten_leader: 5,
      below_role_leader_quality: 20,
      quality_ready_below_900_minutes: 0,
      quality_and_minutes_ready_not_leader: 5,
    },
    reconciliationFailureCount: 0,
  }));
  const result = evaluateLeaderConversionFunnel({
    worlds,
    seasonCount: 10,
    minimumCohortSize: 100,
  });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.deepEqual(result.unreachableStages, ["quality_ready_below_900_minutes"]);
});

test("mature leader conversion excludes only players generated after season six", () => {
  const opening = Array.from({ length: 10 }, (_, index) => playerSeason({
    playerId: `opening-${index}`,
    currentAbility: 12,
    minutes: 2_000,
    goals: 20 - index,
    assists: 10 - index,
  }));
  const rows = [
    ...opening,
    playerSeason({ playerId: "mature", currentAbility: 11, minutes: 2_000 }),
    playerSeason({ playerId: "recent", currentAbility: 11, minutes: 2_000 }),
  ];
  const facts = leaderConversionWorldFacts({
    worldSeed: "world-1",
    playerSeasons: rows,
    playerOrigins: [
      ...opening.map(({ playerId }) => ({
        playerId,
        origin: "opening_senior" as const,
        generatedSeasonNumber: 0,
      })),
      { playerId: "mature", origin: "annual_academy_intake", generatedSeasonNumber: 6 },
      { playerId: "recent", origin: "annual_senior_intake", generatedSeasonNumber: 7 },
    ],
    cohort: "mature_by_season_six",
  });

  assert.equal(facts.generatedPlayerCount, 1);
  assert.equal(facts.recentGeneratedExcludedCount, 1);
  assert.equal(facts.counts.below_role_leader_quality, 1);
});

test("leader quality feasibility treats equality as a reachable stored ceiling", () => {
  const opening = Array.from({ length: 10 }, (_, index) => playerSeason({
    playerId: `opening-${index}`,
    currentAbility: 12,
    minutes: 2_000,
    goals: 20 - index,
    assists: 10 - index,
  }));
  const rows = [
    ...opening,
    playerSeason({
      playerId: "ceiling-below",
      currentAbility: 11,
      potentialRoom: 0.5,
      minutes: 2_000,
    }),
    playerSeason({
      playerId: "ceiling-equal",
      currentAbility: 11.5,
      potentialRoom: 0.5,
      minutes: 2_000,
    }),
  ];
  const facts = leaderQualityFeasibilityWorldFacts({
    worldSeed: "world-1",
    playerSeasons: rows,
    playerOrigins: rows.map(({ playerId }) => ({
      playerId,
      origin: playerId.startsWith("opening-")
        ? "opening_senior" as const
        : "annual_academy_intake" as const,
      generatedSeasonNumber: playerId.startsWith("opening-") ? 0 : 6,
    })),
  });

  assert.deepEqual(facts.counts, {
    stored_ceiling_below_leader_quality: 1,
    sufficient_ceiling_not_realized: 1,
  });
  assert.equal(facts.sourceBelowQualityCount, 2);
  assert.equal(facts.ceilingShortfallTotal, 0.5);
});

test("leader quality feasibility identifies a reconciled majority and rejects drift", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => ({
    worldSeed: `world-${index + 1}`,
    competitionCount: 3,
    leaderSlotCount: 60,
    sourceBelowQualityCount: 10,
    counts: {
      stored_ceiling_below_leader_quality: 6,
      sufficient_ceiling_not_realized: 4,
    },
    countsByOrigin: {
      annual_academy_intake: {
        stored_ceiling_below_leader_quality: 4,
        sufficient_ceiling_not_realized: 3,
      },
      annual_senior_intake: {
        stored_ceiling_below_leader_quality: 2,
        sufficient_ceiling_not_realized: 1,
      },
    },
    currentQualityGapTotal: 20,
    potentialRoomTotal: 5,
    ceilingShortfallTotal: 15,
    reconciliationFailureCount: 0,
  }));
  const result = evaluateLeaderQualityFeasibility({
    worlds,
    seasonCount: 10,
    expectedObservationCount: 70,
  });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "generated_ceiling_supply");
  assert.equal(evaluateLeaderQualityFeasibility({
    worlds,
    seasonCount: 10,
    expectedObservationCount: 69,
  }).decision, "STOP_RETHINK");
});

test("leader ceiling distance derives every frozen boundary from canonical players", () => {
  const facts = leaderCeilingDistanceWorldFacts({
    worldSeed: "distance-world",
    playerSeasons: [
      ...Array.from({ length: 10 }, (_, index) => playerSeason({
        playerId: `opening-${index}`,
        currentAbility: 15,
        minutes: 2_000,
        goals: 20 - index,
        assists: 10 - index,
      })),
      playerSeason({ playerId: "at", currentAbility: 15, potentialRoom: 0, minutes: 0 }),
      playerSeason({ playerId: "half", currentAbility: 14.5, potentialRoom: 0, minutes: 0 }),
      playerSeason({ playerId: "one", currentAbility: 14, potentialRoom: 0, minutes: 0 }),
      playerSeason({ playerId: "two", currentAbility: 13, potentialRoom: 0, minutes: 0 }),
      playerSeason({ playerId: "over", currentAbility: 12.9, potentialRoom: 0, minutes: 0 }),
    ],
    playerOrigins: [
      ...Array.from({ length: 10 }, (_, index) => ({
        playerId: `opening-${index}`,
        origin: "opening_senior" as const,
        generatedSeasonNumber: 0,
      })),
      ...["at", "half", "one", "two", "over"].map((playerId) => ({
        playerId,
        origin: "annual_academy_intake" as const,
        generatedSeasonNumber: 6,
      })),
    ],
  });

  assert.deepEqual(facts.counts, {
    at_or_above: 1,
    within_0_5: 1,
    within_1_0: 1,
    within_2_0: 1,
    over_2_0: 1,
  });
  assert.equal(facts.reconciliationFailureCount, 0);
});

test("leader ceiling distance identifies level only on a reconciled majority", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => ({
    worldSeed: `world-${index + 1}`,
    competitionCount: 3,
    representedPlayerCount: 10,
    counts: {
      at_or_above: 1,
      within_0_5: 1,
      within_1_0: 1,
      within_2_0: 1,
      over_2_0: 6,
    },
    groups: [{
      competitionId: "competition:one",
      role: "striker" as const,
      playerCount: 10,
      counts: {
        at_or_above: 1,
        within_0_5: 1,
        within_1_0: 1,
        within_2_0: 1,
        over_2_0: 6,
      },
      positiveShortfallTotal: 20,
      positiveShortfallMaximum: 4,
    }],
    reconciliationFailureCount: 0,
  }));
  const result = evaluateLeaderCeilingDistance({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "ceiling_band_level");
  assert.equal(evaluateLeaderCeilingDistance({
    worlds: [{ ...worlds[0]!, reconciliationFailureCount: 1 }, ...worlds.slice(1)],
    seasonCount: 10,
  }).decision, "STOP_RETHINK");
});

test("academy prospect provenance identifies a real routine ceiling majority", () => {
  const competitions = ["competition:ita-1", "competition:ita-2", "competition:ita-3"];
  const opening = competitions.flatMap((competitionId) => Array.from(
    { length: 10 },
    (_, index) => playerSeason({
      competitionId,
      playerId: `${competitionId}:leader-${index}`,
      currentAbility: 15,
      minutes: 2_000,
      goals: 20 - index,
      assists: 10 - index,
    }),
  ));
  const generated = [
    ...Array.from({ length: 6 }, (_, index) => ({
      playerId: `routine-${index}`,
      prospectClass: "routine" as const,
      currentAbility: 12,
      potentialRoom: 1,
    })),
    { playerId: "interesting", prospectClass: "interesting" as const, currentAbility: 13, potentialRoom: 1 },
    { playerId: "serious", prospectClass: "serious" as const, currentAbility: 14, potentialRoom: 0.5 },
    { playerId: "rare", prospectClass: "rare" as const, currentAbility: 14.9, potentialRoom: 0.2 },
  ];
  const facts = academyProspectClassWorldFacts({
    worldSeed: "prospect-world",
    provenance: generated.map(({ playerId, prospectClass }) => ({
      playerId,
      prospectClass,
      generatedSeasonNumber: 6,
      generationDivision: "first_division" as const,
    })),
    playerSeasons: [
      ...opening,
      ...generated.map(({ playerId, currentAbility, potentialRoom }) => playerSeason({
        playerId,
        currentAbility,
        potentialRoom,
        minutes: 900,
      })),
    ],
    playerOrigins: [
      ...opening.map(({ playerId }) => ({
        playerId,
        origin: "opening_senior" as const,
        generatedSeasonNumber: 0,
      })),
      ...generated.map(({ playerId }) => ({
        playerId,
        origin: "annual_academy_intake" as const,
        generatedSeasonNumber: 6,
      })),
    ],
  });
  const worlds = Array.from({ length: 7 }, (_, index) => ({
    ...facts,
    worldSeed: `prospect-world-${index + 1}`,
  }));
  const result = evaluateAcademyProspectClassConversion({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "routine_to_interesting_transition");
  assert.equal(result.firstDivisionStoredCeilingBelowShares.routine > 0.50, true);
  assert.deepEqual(result.unreachableClasses, []);
  assert.equal(evaluateAcademyProspectClassConversion({
    worlds: [{ ...worlds[0]!, reconciliationFailureCount: 1 }, ...worlds.slice(1)],
    seasonCount: 10,
  }).decision, "STOP_RETHINK");
});

test("paired lifecycle attribution identifies a coherent material owner", () => {
  const current = lifecycleWorlds({ leader: true, current: 10, minutes: 2_000, gain: 2 });
  const combined = lifecycleWorlds({ leader: false, current: 9.5, minutes: 2_000, gain: 2 });
  const result = evaluateGeneratedPlayerLifecycleAttribution({
    current,
    combined,
    seasonCount: 10,
  });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "current_profile_cost");
  assert.equal(result.leaderLossCount, 7);
  assert.equal(result.coherenceCount, 7);
});

test("paired lifecycle attribution keeps acceptance divergence and mixed outcomes falsifiable", () => {
  const current = lifecycleWorlds({ leader: true, current: 10, minutes: 2_000, gain: 2 });
  const combined = lifecycleWorlds({ leader: false, current: 10, minutes: 1_000, gain: 2 });
  const missingFirst = combined.map((world, index) => index === 0
    ? { ...world, players: [] }
    : world);
  const result = evaluateGeneratedPlayerLifecycleAttribution({
    current,
    combined: missingFirst,
    seasonCount: 10,
  });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "minute_access");
  assert.equal(result.lossCounts.intake_acceptance_path, 1);
  assert.equal(evaluateGeneratedPlayerLifecycleAttribution({
    current,
    combined: [{ ...combined[0]!, reconciliationFailureCount: 1 }, ...combined.slice(1)],
    seasonCount: 10,
  }).decision, "STOP_RETHINK");
});

test("generated leader-lane conversion identifies only a reachable coherent majority", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => leaderLaneWorld({
    worldSeed: `lane-world-${index + 1}`,
    counts: {
      quality_depth: 6,
      selection_volume: 1,
      actor_access: 1,
      occasion_conversion: 1,
      rank_cutoff: 1,
    },
  }));
  const result = evaluateGeneratedLeaderLaneConversion({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "quality_depth");
  assert.equal(result.dominantShare, 0.6);
  assert.equal(result.coherenceCount, 7);
  assert.deepEqual(result.unreachableStages, []);
});

test("generated leader-lane conversion stops on an unreachable real branch", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => leaderLaneWorld({
    worldSeed: `lane-world-${index + 1}`,
    counts: {
      quality_depth: 6,
      selection_volume: 1,
      actor_access: 1,
      occasion_conversion: 1,
      rank_cutoff: 0,
    },
  }));

  const result = evaluateGeneratedLeaderLaneConversion({ worlds, seasonCount: 10 });
  assert.equal(result.decision, "STOP_RETHINK");
  assert.deepEqual(result.unreachableStages, ["rank_cutoff"]);
});

test("outcome-unconditioned renewal ladder identifies lane-local owners", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => renewalLadderWorld(
    `renewal-ladder-world-${index + 1}`,
  ));
  const result = evaluateRenewalLadder({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.deepEqual(result.laneDecisions.map(({ owner }) => owner), [
    "quality_supply",
    "actor_allocation",
  ]);
  assert.deepEqual(result.rungSlotCounts, {
    quality: 420,
    opportunity_rate: 420,
    raw_opportunity: 420,
    club_expected_output: 420,
    actual_output: 420,
  });
});

test("outcome-unconditioned renewal ladder fails closed on a missing rank", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => renewalLadderWorld(
    `renewal-ladder-world-${index + 1}`,
  ));
  const first = worlds[0]!;
  const scorer = first.laneRungs[0]!;
  const broken: RenewalLadderWorldFacts = {
    ...first,
    laneRungs: [{
      ...scorer,
      counts: { ...scorer.counts, quality: { generated: 9, opening: 20 } },
    }, first.laneRungs[1]!],
  };
  const result = evaluateRenewalLadder({ worlds: [broken, ...worlds.slice(1)], seasonCount: 10 });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.rungSlotCounts.quality, 419);
});

test("age-conditioned stationarity separates ceiling from development", () => {
  const world = populationStationarityWorldFacts({
    worldSeed: "stationarity-world-1",
    cohort: "mature_by_season_six",
    playerOrigins: [
      ...Array.from({ length: 3 }, (_, index) => ({
        playerId: `opening-${index}`,
        origin: "opening_senior" as const,
        generatedSeasonNumber: 0,
      })),
      { playerId: "ready", origin: "annual_academy_intake", generatedSeasonNumber: 2 },
      { playerId: "development", origin: "annual_academy_intake", generatedSeasonNumber: 2 },
      { playerId: "ceiling", origin: "annual_academy_intake", generatedSeasonNumber: 2 },
    ],
    playerSeasons: [
      stationarityPlayerSeason("opening-0", 1, 25, 10, 0),
      stationarityPlayerSeason("opening-1", 1, 25, 12, 0),
      stationarityPlayerSeason("opening-2", 1, 25, 14, 0),
      stationarityPlayerSeason("ready", 10, 25, 12, 0),
      stationarityPlayerSeason("development", 10, 25, 10, 3),
      stationarityPlayerSeason("ceiling", 10, 25, 10, 1),
    ],
  });

  assert.deepEqual(world.counts, {
    stationary_ready: 1,
    development_realization_gap: 1,
    ceiling_supply_gap: 1,
    reference_not_observed: 0,
  });
  assert.equal(world.cells[0]?.referenceCurrentP50, 12);
  assert.equal(world.cells[0]?.referenceCurrentP90, 14);
});

test("population stationarity identifies a coherent ceiling owner", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => stationarityWorld(
    `stationarity-${index + 1}`,
    { stationary_ready: 5, development_realization_gap: 2, ceiling_supply_gap: 8,
      reference_not_observed: 0 },
  ));
  const result = evaluatePopulationStationarity({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "ceiling_supply");
  assert.equal(result.coherenceCount, 7);
  assert.equal(result.ceilingShare, 0.8);
});

test("population stationarity fails closed on a sparse comparator", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => stationarityWorld(
    `stationarity-${index + 1}`,
    { stationary_ready: 5, development_realization_gap: 2, ceiling_supply_gap: 2,
      reference_not_observed: 2 },
  ));
  const result = evaluatePopulationStationarity({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.notEqual(result.referenceNotObservedShare, "not_observed");
  if (result.referenceNotObservedShare !== "not_observed") {
    assert.equal(result.referenceNotObservedShare > 0.1, true);
  }
});

test("generation-time stationarity includes every candidate at the exact median", () => {
  const playerOrigins: {
    playerId: string;
    origin: "opening_senior" | "annual_academy_intake";
    generatedSeasonNumber: number;
  }[] = [0, 1, 2].map((index) => ({
    playerId: `opening-${index}`,
    origin: "opening_senior" as const,
    generatedSeasonNumber: 0,
  }));
  playerOrigins.push(
    { playerId: "routine-low", origin: "annual_academy_intake", generatedSeasonNumber: 1 },
    { playerId: "interesting-edge", origin: "annual_academy_intake", generatedSeasonNumber: 2 },
  );
  const world = generationTimeStationaryWorldFacts({
    worldSeed: "generation-target-world",
    candidates: [
      generationCandidate("routine-low", "routine", 1, 11),
      generationCandidate("interesting-edge", "interesting", 2, 12),
    ],
    playerOrigins,
    playerSeasons: [
      stationarityPlayerSeason("opening-0", 1, 23, 10, 0),
      stationarityPlayerSeason("opening-1", 1, 25, 12, 0),
      stationarityPlayerSeason("opening-2", 1, 27, 14, 0),
    ],
  });

  assert.equal(world.candidateCount, 2);
  assert.equal(world.counts.routine.belowStationaryCeiling, 1);
  assert.equal(world.counts.interesting.stationaryCapable, 1);
  assert.equal(world.groups.length, 2);
  assert.equal(world.referenceCells[0]?.referenceCurrentP50, 12);
  assert.equal(world.reconciliationFailureCount, 0);
});

test("generation-time stationarity identifies a coherent class owner", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => generationStationarityWorld(
    `generation-target-${index + 1}`,
    { routine: [1, 8], interesting: [2, 1], serious: [1, 0], rare: [1, 0] },
  ));
  const result = evaluateGenerationTimeStationaryCeiling({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "OWNER_IDENTIFIED");
  assert.equal(result.owner, "routine");
  assert.equal(result.ownerCoherenceCount, 7);
  assert.equal(result.deficitToHalf, 14);
});

test("generation-time stationary supply can identify post-generation lifecycle", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => generationStationarityWorld(
    `generation-target-${index + 1}`,
    { routine: [6, 4], interesting: [2, 1], serious: [1, 0], rare: [1, 0] },
  ));
  const result = evaluateGenerationTimeStationaryCeiling({ worlds, seasonCount: 10 });

  assert.equal(result.owner, "post_generation_lifecycle");
  assert.equal(result.capableWorldCount, 7);
});

test("generation-time stationarity fails closed when accepted counts do not reconcile", () => {
  const worlds = Array.from({ length: 7 }, (_, index) => ({
    ...generationStationarityWorld(
      `generation-target-${index + 1}`,
      { routine: [1, 8], interesting: [0, 0], serious: [0, 0], rare: [0, 0] },
    ),
    candidateCount: 10,
  }));
  const result = evaluateGenerationTimeStationaryCeiling({ worlds, seasonCount: 10 });

  assert.equal(result.decision, "STOP_RETHINK");
  assert.equal(result.owner, "structural_reconciliation");
});

function arm(
  local: number,
  generated: number,
  division: number,
  formations: number,
  transfers: number,
): SuccessionPriorityArmSummary {
  return {
    values: values(local, generated, division, formations),
    worlds: Array.from({ length: 7 }, (_, index) => ({
      worldSeed: `world-${index + 1}`,
      values: values(local, generated, division, formations),
    })),
    transferAcquisitionCount: transfers,
  };
}

function lifecycleWorlds(input: {
  readonly leader: boolean;
  readonly current: number;
  readonly minutes: number;
  readonly gain: number;
}) {
  return Array.from({ length: 7 }, (_, index) => ({
    worldSeed: `lifecycle-world-${index + 1}`,
    players: [lifecyclePlayer(input)],
    reconciliationFailureCount: 0,
  }));
}

function leaderLaneWorld(input: {
  readonly worldSeed: string;
  readonly counts: GeneratedLeaderLaneWorldFacts["counts"];
}): GeneratedLeaderLaneWorldFacts {
  const observationCount = Object.values(input.counts).reduce((total, count) => total + count, 0);
  return {
    worldSeed: input.worldSeed,
    competitionCount: 3,
    leaderLaneSlotCount: 60,
    generatedLeaderLaneCount: 10,
    qualityReadyNonLeaderLaneCount: observationCount,
    counts: input.counts,
    laneCounts: [
      {
        lane: "scorer",
        generatedLeaderCount: 5,
        qualityReadyNonLeaderCount: observationCount,
        counts: input.counts,
      },
      {
        lane: "creator",
        generatedLeaderCount: 5,
        qualityReadyNonLeaderCount: observationCount,
        counts: input.counts,
      },
    ],
    competitionCounts: [{
      competitionId: "competition:first",
      qualityReadyNonLeaderCount: observationCount,
      counts: input.counts,
    }],
    reconciliationFailureCount: 0,
    unclassifiableCount: 0,
  };
}

function renewalLadderWorld(worldSeed: string): RenewalLadderWorldFacts {
  const counts = (generated: number) => ({ generated, opening: 30 - generated });
  return {
    worldSeed,
    competitionCount: 3,
    laneRungs: [
      {
        lane: "scorer",
        counts: {
          quality: counts(10),
          opportunity_rate: counts(9),
          raw_opportunity: counts(8),
          club_expected_output: counts(8),
          actual_output: counts(7),
        },
      },
      {
        lane: "creator",
        counts: {
          quality: counts(20),
          opportunity_rate: counts(10),
          raw_opportunity: counts(9),
          club_expected_output: counts(9),
          actual_output: counts(8),
        },
      },
    ],
    reconciliationFailureCount: 0,
    unknownOriginCount: 0,
  };
}

function stationarityWorld(
  worldSeed: string,
  counts: PopulationStationarityWorldFacts["counts"],
): PopulationStationarityWorldFacts {
  return {
    worldSeed,
    competitionCount: 3,
    referencePlayerCount: 30,
    replacementPlayerCount: Object.values(counts).reduce((total, count) => total + count, 0),
    counts,
    cells: [],
    reconciliationFailureCount: 0,
    unknownOriginCount: 0,
  };
}

function generationCandidate(
  playerId: string,
  prospectClass: "routine" | "interesting" | "serious" | "rare",
  generatedSeasonNumber: number,
  storedCeiling: number,
) {
  return {
    playerId,
    prospectClass,
    generatedSeasonNumber,
    generationDivision: "first_division" as const,
    competitionId: "competition:ita-1",
    role: "striker" as const,
    currentAbility: 8,
    storedCeiling,
  };
}

function generationStationarityWorld(
  worldSeed: string,
  values: Readonly<Record<"routine" | "interesting" | "serious" | "rare",
    readonly [stationaryCapable: number, belowStationaryCeiling: number]>>,
): GenerationTimeStationaryWorldFacts {
  const counts = Object.fromEntries(Object.entries(values).map(([prospectClass, value]) => [
    prospectClass,
    {
      candidate: value[0] + value[1],
      stationaryCapable: value[0],
      belowStationaryCeiling: value[1],
      referenceNotObserved: 0,
    },
  ])) as GenerationTimeStationaryWorldFacts["counts"];
  return {
    worldSeed,
    competitionCount: 3,
    referencePlayerCount: 30,
    candidateCount: Object.values(counts).reduce((total, row) => total + row.candidate, 0),
    referenceCells: [],
    counts,
    groups: [],
    reconciliationFailureCount: 0,
    unknownOriginCount: 0,
  };
}

function stationarityPlayerSeason(
  playerId: string,
  seasonNumber: number,
  age: number,
  currentAbility: number,
  potentialRoom: number,
) {
  return {
    competitionId: "competition:ita-1",
    seasonNumber,
    playerId,
    clubId: "club:ita-1-01",
    age,
    role: "striker" as const,
    currentAbility,
    potentialRoom,
    appearances: 0,
    starts: 0,
    minutes: 0,
    shots: 0,
    shotsOnTarget: 0,
    creatorNominations: 0,
    goals: 0,
    assists: 0,
  };
}

function lifecyclePlayer(input: {
  readonly leader: boolean;
  readonly current: number;
  readonly minutes: number;
  readonly gain: number;
}): GeneratedPlayerLifecycleFact {
  return {
    playerId: "academy-player-1",
    prospectClass: "interesting",
    generationDivision: "first_division",
    generatedSeasonNumber: 1,
    firstObservedCurrentAbility: input.current,
    firstObservedStoredCeiling: 14,
    minutesThroughSeasonSix: input.minutes,
    seasonTenAbilityGain: input.gain,
    activeSeasonTen: true,
    representedSeasonTen: true,
    qualityReadySeasonTen: true,
    leaderSeasonTen: input.leader,
  };
}

function values(
  local: number,
  generated: number,
  division: number,
  formations: number,
) {
  return {
    localReplacementCapacity: local,
    careerGeneratedLeaderShareSeasonTen: generated,
    divisionReplacementCapacity: division,
    fourReplicatedFormationRetentionShare: formations,
  };
}

function targetFacts(input: {
  readonly fulfilled: number;
  readonly prime: number;
  readonly generatedPrime: number;
  readonly downstream: number;
}) {
  return {
    fulfilledEpisodeCount: input.fulfilled,
    distinctAcquiredPlayerCount: input.fulfilled,
    ageBandCounts: { under_21: 0, "21_29": input.prime, "30_32": 0, "33_plus": 0 },
    originCounts: {
      opening_senior: input.fulfilled - input.generatedPrime,
      opening_academy: 0,
      annual_academy_intake: input.generatedPrime,
      annual_senior_intake: 0,
      unknown: 0,
    },
    primeAgeAcquisitionCount: input.prime,
    careerGeneratedPrimeAgeAcquisitionCount: input.generatedPrime,
    careerGeneratedPrimeAgeDownstreamCount: input.downstream,
    localReplacementIntersectionCount: input.downstream,
    divisionReplacementIntersectionCount: input.downstream,
    seasonTenLeaderIntersectionCount: 0,
    reconciliationFailureCount: 0,
  };
}

function downstreamCounts(
  overrides: Partial<Record<
    "season_ten_leader" | "no_buyer_appearance" | "below_450_buyer_minutes"
    | "not_retained_two_seasons" | "below_half_ability_growth"
    | "developed_not_leader",
    number
  >> = {},
) {
  return {
    season_ten_leader: 0,
    no_buyer_appearance: 0,
    below_450_buyer_minutes: 0,
    not_retained_two_seasons: 0,
    below_half_ability_growth: 0,
    developed_not_leader: 0,
    ...overrides,
  };
}

function playerSeason(input: {
  readonly playerId: string;
  readonly competitionId?: string;
  readonly role?: "striker" | "goalkeeper";
  readonly currentAbility: number;
  readonly potentialRoom?: number;
  readonly minutes: number;
  readonly goals?: number;
  readonly assists?: number;
}) {
  return {
    competitionId: input.competitionId ?? "competition:ita-1",
    seasonNumber: 10,
    playerId: input.playerId,
    clubId: "club:ita-1-01",
    age: 24,
    role: input.role ?? "striker",
    currentAbility: input.currentAbility,
    potentialRoom: input.potentialRoom ?? 0,
    appearances: input.minutes === 0 ? 0 : 1,
    starts: input.minutes >= 90 ? 1 : 0,
    minutes: input.minutes,
    shots: 0,
    shotsOnTarget: 0,
    creatorNominations: 0,
    goals: input.goals ?? 0,
    assists: input.assists ?? 0,
  } as const;
}
