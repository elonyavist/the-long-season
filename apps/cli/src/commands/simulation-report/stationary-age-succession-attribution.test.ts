import assert from "node:assert/strict";
import { test } from "vitest";

import type { PlayerGenerationExceptionalStockSummary } from "@game/simulation-tools";
import { fromISO } from "@game/shared";
import {
  completedPlayerAgeAtDevelopmentMonth,
  monthlyGrowthAgeMultiplier,
  type PlayerMonthlyDevelopmentObservation,
  type PlayerPotentialProjection,
} from "@game/engine";

import {
  evaluateProgressiveCurrent16FunnelCheckpoint,
  evaluateSuccessorCeilingPairedCanary,
  evaluateSuccessorCeilingPairedCheckpoint,
  evaluateSuccessorPathwayCanary,
  evaluateSuccessorPathwayCheckpoint,
  evaluateDevelopmentRealizationCheckpoint,
  evaluateStationaryAgeSuccessionCheckpoint,
  l6_43BControlGrowthAgeMultiplier,
  successorPathwayBaselineArms,
  type DevelopmentRealizationOutcome,
  type DevelopmentRealizationWorldObservation,
  type SuccessorCeilingArmWorldInput,
  type SuccessorPathwayCheckpointDecision,
  type SuccessorPathwayWorldFacts,
  type StationaryAgeSuccessionWorldInput,
} from "./stationary-age-succession-attribution.ts";

test("L6.40 keeps independent owners and requires every real-data reachability lane", () => {
  const inputs = Array.from({ length: 7 }, (_, index) => worldInput(`world-${index + 1}`));
  const decision = evaluateStationaryAgeSuccessionCheckpoint(inputs);

  assert.equal(decision.decision, "OWNERS_IDENTIFIED");
  assert.deepEqual(decision.owners, [
    "OPENING_STOCK_RETENTION",
    "SUCCESSOR_FLOW",
    "MARKET_OR_DEVELOPMENT_FUNNEL",
  ]);
  assert.equal(decision.shared, true);
  assert.equal(decision.openingStockRetentionWorldCount, 7);
  assert.equal(decision.successorFlowWorldCount, 7);
  assert.equal(decision.worlds[0]?.transitions.length, 2);
  assert.equal(decision.pooled.transitionCount, 14);
  assert.equal(decision.pooled.needEpisodeCount, 14);
  assert.deepEqual(decision.reachability, {
    transitionWithPriorNeed: true,
    transitionWithoutPriorNeed: true,
    qualifiedMarketObstruction: true,
    completedSuccessorAcquisition: true,
    reopenedNeed: true,
  });

  const withoutReopenedNeed = inputs.map((input) => ({
    ...input,
    renewalNeedEpisodes: input.renewalNeedEpisodes.slice(0, 1),
  }));
  assert.equal(
    evaluateStationaryAgeSuccessionCheckpoint(withoutReopenedNeed).decision,
    "STOP_INSTRUMENT",
  );
});

test("L6.42 separates every current-16 lifecycle loss before naming its owner", () => {
  const inputs = Array.from({ length: 7 }, (_, index) =>
    current16WorldInput(`current16-world-${index + 1}`));
  const decision = evaluateProgressiveCurrent16FunnelCheckpoint(inputs);

  assert.equal(decision.decision, "OWNER_IDENTIFIED");
  assert.equal(decision.owner, "observed_ceiling_supply");
  assert.equal(decision.ownerCoherenceWorldCount, 7);
  assert.equal(decision.openingEliteRetentionOwner, true);
  assert.equal(decision.openingEliteRetentionWorldCount, 7);
  assert.equal(decision.generatedCurrent16LeaderCount, 7);
  assert.equal(decision.reconciliationFailureCount, 0);
  assert.equal(decision.stationarity.decision, "OWNER_IDENTIFIED");
  assert.equal(decision.stationarity.owner, "ceiling_supply");
  assert.equal(decision.funnel.senior_observation.denominatorCount, 91);
  assert.equal(decision.funnel.current16_retention.survivorCount, 7);
  assert.equal(
    Object.values(decision.openingStateCounts).reduce((sum, count) => sum + count, 0),
    decision.openingEliteCount,
  );

  const zeroRetentionLoss = inputs.map((input) => ({
    ...input,
    owner: {
      ...input.owner,
      playerSeasons: [
        ...input.owner.playerSeasons.map((row) => row.seasonNumber === 10
          && row.playerId === "generated:outside"
          ? { ...row, competitionId: "competition:ita-1", clubId: "club:1:generated" }
          : row.seasonNumber === 10 && row.playerId === "generated:quality"
            ? { ...row, currentAbility: 16 }
            : row),
        playerSeason({
          playerId: "generated:inactive",
          clubId: "club:1:generated",
          seasonNumber: 10,
          age: 28,
          currentAbility: 16,
        }),
      ],
    },
  }));
  const zeroLossDecision = evaluateProgressiveCurrent16FunnelCheckpoint(zeroRetentionLoss);
  assert.equal(zeroLossDecision.funnel.current16_retention.lossCount, 0);
  assert.equal(zeroLossDecision.decision, "OWNER_IDENTIFIED");

  const missingDenominator = inputs.map((input) => ({
    ...input,
    architecture: {
      ...input.architecture,
      playerOrigins: input.architecture.playerOrigins.filter(({ playerId }) =>
        !["generated:inactive", "generated:outside", "generated:quality", "generated:success"]
          .includes(playerId)),
    },
    owner: {
      ...input.owner,
      playerSeasons: input.owner.playerSeasons.filter(({ playerId }) =>
        !["generated:inactive", "generated:outside", "generated:quality", "generated:success"]
          .includes(playerId)),
    },
  }));
  assert.equal(
    evaluateProgressiveCurrent16FunnelCheckpoint(missingDenominator).decision,
    "STOP_INSTRUMENT",
  );
});

test("L6.43 pairs structural successor renewal and fails closed on six-star drift", () => {
  const control = Array.from({ length: 7 }, (_, index) =>
    successorWorldInput(`successor-world-${index + 1}`, false));
  const candidate = Array.from({ length: 7 }, (_, index) =>
    successorWorldInput(`successor-world-${index + 1}`, true));
  const canary = evaluateSuccessorCeilingPairedCanary({
    control: control.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
    })),
    candidate: candidate.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
    })),
  });
  assert.equal(canary.decision, "CANARY_GO");
  assert.equal(canary.seasonFactCount, 7);

  const decision = evaluateSuccessorCeilingPairedCheckpoint({
    control,
    candidate,
    seasonCount: 10,
    controlIntegratedFailedGateKeys: ["carried_known_red"],
    candidateIntegratedFailedGateKeys: ["carried_known_red"],
  });
  assert.equal(decision.decision, "GO");
  assert.equal(decision.generatedAtLeastOpeningWorldCount, 7);
  assert.equal(decision.candidateImprovementWorldCount, 7);
  assert.equal(decision.pooledCareerGeneratedLeaderShare, 0.9);
  assert.equal(decision.age33PlusLeaderCount > 0, true);
  assert.deepEqual(decision.newIntegratedFailureKeys, []);

  const drifted = candidate.map((world, index) => index !== 0 ? world : ({
    ...world,
    successorCeilingSeasons: world.successorCeilingSeasons.map((season) =>
      season.seasonNumber !== 1 ? season : {
        ...season,
        sixAssignmentPlayerIds: ["different-six"],
      }
    ),
  }));
  const driftDecision = evaluateSuccessorCeilingPairedCheckpoint({
    control,
    candidate: drifted,
    seasonCount: 10,
    controlIntegratedFailedGateKeys: [],
    candidateIntegratedFailedGateKeys: [],
  });
  assert.equal(driftDecision.decision, "STOP_RETHINK");
  assert.equal(driftDecision.failedGateKeys.includes("six_star_lane_identity"), true);
});

test("L6.43A attributes closed selected-player windows and rejects a broken boundary", () => {
  const control = Array.from({ length: 7 }, (_, index) =>
    successorWorldInput(`pathway-world-${index + 1}`, false));
  const candidate = Array.from({ length: 7 }, (_, index) =>
    successorPathwayWorldInput(`pathway-world-${index + 1}`));
  const canary = evaluateSuccessorPathwayCanary({
    control: control.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
    })),
    candidate: candidate.map((world) => ({
      ...world,
      successorCeilingSeasons: world.successorCeilingSeasons.slice(0, 1),
      pathway: {
        ...world.pathway,
        assignments: world.pathway.assignments.slice(0, 1),
        boundaries: world.pathway.boundaries.filter(({ seasonNumber }) => seasonNumber === 1),
      },
    })),
  });
  assert.equal(canary.decision, "CANARY_GO");
  assert.equal(canary.acceptedAssignmentCount, 7);

  const decision = evaluateSuccessorPathwayCheckpoint({
    control,
    candidate,
    seasonCount: 10,
  });
  assert.equal(decision.decision, "OWNER_IDENTIFIED");
  assert.equal(decision.owner, "senior_registration");
  assert.equal(decision.ownerCoherenceWorldCount, 7);
  assert.equal(decision.pooledClosedWindowCount, 49);
  assert.equal(decision.sixStarFirstDivergences.length, 7);
  assert.equal(decision.sixStarFirstDivergences[0]?.cause, "allocation_constraints");

  const broken = candidate.map((world, index) => index !== 0 ? world : ({
    ...world,
    pathway: {
      ...world.pathway,
      boundaries: world.pathway.boundaries.slice(1),
    },
  }));
  assert.equal(evaluateSuccessorPathwayCheckpoint({
    control,
    candidate: broken,
    seasonCount: 10,
  }).decision, "STOP_INSTRUMENT");
});

test("the L6.43B baseline adapter evaluates a longer run at the frozen season ten", () => {
  const control = Array.from({ length: 7 }, (_, index) =>
    successorWorldInput(`pathway-world-${index + 1}`, false));
  const candidate = Array.from({ length: 7 }, (_, index) =>
    successorPathwayWorldInput(`pathway-world-${index + 1}`));
  const fifteenSeasonControl = control.map(extendedPastBaseline);
  const fifteenSeasonCandidate = candidate.map((world) => ({
    ...extendedPastBaseline(world),
    pathway: extendedPathwayPastBaseline(world.pathway),
  }));

  // At the baseline itself every filter is a no-op. This is what makes the
  // `7 x 10` replay's byte-identity a proof and not a coincidence: the adapter
  // hands the legacy evaluator back exactly what it was given.
  assert.deepEqual(
    successorPathwayBaselineArms({ control, candidate, seasonCount: 10 }),
    { control, candidate, seasonCount: 10 },
  );

  // A fifteen-season run reduces to the ten-season run, compared at the input
  // rather than at the decision: nothing from seasons eleven to fifteen - not an
  // intake season, not an assignment, not a boundary, not a player-season -
  // survives the cut. Comparing decisions alone would pass while a surplus fact
  // rode along unread.
  assert.deepEqual(
    successorPathwayBaselineArms({
      control: fifteenSeasonControl,
      candidate: fifteenSeasonCandidate,
      seasonCount: 15,
    }),
    successorPathwayBaselineArms({ control, candidate, seasonCount: 10 }),
  );

  // The legacy verdict survives the adapter rather than being hollowed out.
  const throughAdapter = evaluateSuccessorPathwayCheckpoint(
    successorPathwayBaselineArms({
      control: fifteenSeasonControl,
      candidate: fifteenSeasonCandidate,
      seasonCount: 15,
    }),
  );
  assert.equal(throughAdapter.decision, "OWNER_IDENTIFIED");
  assert.equal(throughAdapter.pooledClosedWindowCount, 49);
  assert.deepEqual(
    throughAdapter,
    evaluateSuccessorPathwayCheckpoint({ control, candidate, seasonCount: 10 }),
  );

  // ...and the adapter is load-bearing. The same facts handed to the legacy
  // evaluator directly stop the instrument, which is what a `7 x 15` would have
  // returned after paying for the whole run.
  assert.equal(
    evaluateSuccessorPathwayCheckpoint({
      control: fifteenSeasonControl,
      candidate: fifteenSeasonCandidate,
      seasonCount: 15,
    }).decision,
    "STOP_INSTRUMENT",
  );

  // A shorter run is not told it is the baseline. It reports that it is not.
  assert.equal(
    successorPathwayBaselineArms({ control, candidate, seasonCount: 2 }).seasonCount,
    2,
  );
});

test("L6.43B resolves every frozen-cohort player exactly once and reaches every outcome", () => {
  const scenarios: readonly RealizationScenario[] = [
    // Evaluability first: an intake median below elite is not evidence about
    // conversion, whatever happened afterwards.
    { playerId: "p:intake-low", outcome: "expected_ceiling_below_16_at_intake", p50Ability: 15 },
    // A ceiling taken away after opportunity was already sustained.
    {
      playerId: "p:lost-late",
      outcome: "ceiling_lost_before_realization",
      ceilingLostMonthKey: "2031-08",
    },
    // ...and one taken away while opportunity was still thin, which is a
    // different owner in Step 16M-C and must not be pooled with the first.
    {
      playerId: "p:lost-early",
      outcome: "ceiling_lost_before_realization",
      monthlyMinutes: 90,
      ceilingLostMonthKey: "2026-09",
    },
    // A goalkeeper is judged at 28, so this horizon ends before he can be.
    {
      playerId: "p:censored",
      outcome: "right_censored_at_horizon",
      naturalPosition: "gk",
      birthIso: "2008-01-01",
    },
    // Ninety minutes a month is an opportunity multiplier of 0.45: below the
    // frozen half of what existed, in every month that existed.
    {
      playerId: "p:starved",
      outcome: "sustained_opportunity_insufficient",
      monthlyMinutes: 90,
    },
    // Full opportunity, viable ceiling throughout, still never elite.
    { playerId: "p:unconverted", outcome: "realization_under_viable_projection" },
    // Selected for having failed by season ten, and elite before judgement.
    // Not a failure, so not a loss state.
    {
      playerId: "p:recovered",
      outcome: "recovered_before_judgement",
      recoveryMonthKey: "2030-08",
    },
  ];
  const worldSeed = "l6-43b-world-1";
  const decision = evaluateDevelopmentRealizationCheckpoint({
    baseline: realizationBaseline([{ worldSeed, scenarios }]),
    assignments: [realizationAssignments(worldSeed, scenarios)],
    observation: [realizationObservation(worldSeed, scenarios)],
  });
  const world = decision.worlds[0]!;
  const outcomeByPlayerId = new Map(
    world.players.map((player) => [player.playerId, player]),
  );

  // Every scenario lands where it was designed to land. Asserting the mapping
  // rather than the counts means a state cannot pass by absorbing another's
  // players.
  for (const scenario of scenarios) {
    assert.equal(
      outcomeByPlayerId.get(scenario.playerId)?.outcome,
      scenario.outcome,
      scenario.playerId,
    );
  }
  assert.equal(
    outcomeByPlayerId.get("p:lost-late")?.lossTiming,
    "after_sustained_exposure",
  );
  assert.equal(
    outcomeByPlayerId.get("p:lost-early")?.lossTiming,
    "before_sustained_exposure",
  );

  // Exactly once each, and the three groups partition the cohort.
  assert.equal(world.decisionPopulationCount, scenarios.length);
  assert.equal(
    world.evaluableCount + world.censoredCount + world.recoveredCount,
    scenarios.length,
  );
  assert.equal(world.censoredCount, 1);
  assert.equal(world.recoveredCount, 1);
  assert.equal(world.reconciliationFailureCount, 0);

  // Neither a censored nor a recovered player is in the owner denominator.
  assert.equal(world.evaluableCount, scenarios.length - 2);

  // The denominator counts only months the lifecycle closed, and only those
  // inside the growth window. Six seasons of eight checkpoints is forty-eight
  // months; three of them fall at age twenty-six and pay nothing, so the
  // available exposure is the forty-five that remain, weighted by the curve:
  // `5*0.85 + 24*0.65 + 16*0.35`.
  const unconverted = outcomeByPlayerId.get("p:unconverted")!;
  assert.equal(unconverted.availableExposure, 25.45);
  assert.equal(unconverted.observedExposure, 25.45);
  assert.equal(unconverted.judgementMonthKey, "2032-01");
  // ...and a starved player is charged against the same denominator, so his
  // shortfall is opportunity rather than calendar.
  const starved = outcomeByPlayerId.get("p:starved")!;
  assert.equal(starved.availableExposure, 25.45);
  assert.ok(starved.observedExposure / starved.availableExposure < 0.5);
  assert.equal(starved.sustainedExposureMonthKey, undefined);
});

test("the frozen L6.43B judgement curve is the shipped control curve, age for age", () => {
  // The frozen table is a snapshot, and a snapshot is only trustworthy while it
  // matches what it claims to have copied. This is the transcription check.
  //
  // When a Step 16M-C candidate reshapes growth, THIS TEST IS EXPECTED TO FAIL.
  // That failure is the signal that control and candidate have parted, and it
  // is answered by asserting the divergence here. The frozen table is never
  // edited to follow a candidate: doing so would let the candidate move its own
  // judgement age, and the paired comparison would be void.
  for (const group of ["goalkeeper", "defender", "midfielder", "attacker"] as const) {
    for (let age = 14; age <= 40; age += 1) {
      assert.equal(
        l6_43BControlGrowthAgeMultiplier(group, age),
        monthlyGrowthAgeMultiplier(group, age),
        `${group}@${age}`,
      );
    }
  }
});

test("a candidate that grows players past the control window cannot move its own judgement", () => {
  const baselineScenario: RealizationScenario = {
    playerId: "p:unconverted",
    outcome: "realization_under_viable_projection",
  };
  const worldSeed = "l6-43b-world-1";
  const evaluate = (scenarios: readonly RealizationScenario[]) =>
    evaluateDevelopmentRealizationCheckpoint({
      baseline: realizationBaseline([{ worldSeed, scenarios }]),
      assignments: [realizationAssignments(worldSeed, scenarios)],
      observation: [realizationObservation(worldSeed, scenarios)],
    }).worlds[0]!.players[0]!;

  const control = evaluate([baselineScenario]);
  // The candidate arm develops him at twenty-six and beyond, so its payload
  // carries months the control curve pays nothing for.
  const candidate = evaluate([{ ...baselineScenario, candidateExtendedGrowth: true }]);

  assert.equal(candidate.judgementMonthKey, control.judgementMonthKey);
  assert.equal(candidate.availableExposure, control.availableExposure);
  assert.equal(candidate.observedExposure, control.observedExposure);
  assert.equal(candidate.outcome, control.outcome);
  // ...and the extra months were real, so the invariance is not vacuous.
  assert.ok(
    realizationObservation(worldSeed, [{ ...baselineScenario, candidateExtendedGrowth: true }])
      .rows.length
      > realizationObservation(worldSeed, [baselineScenario]).rows.length,
  );

  // The sharper half of the same claim, and the one that bites today. Until a
  // candidate exists the frozen curve and the shipped curve are identical, so
  // extra late months alone cannot tell an evaluator that prices a month from
  // the frozen curve apart from one that prices it from the row's own policy.
  // A row that misstates its age can: every row here claims twenty-one, worth
  // `0.65`, while the player is really twenty to twenty-five. Exposure must
  // still come out at the control weight for his real age, so the price of a
  // month is the header's birth date and never a row's account of itself.
  const misstated = evaluate([{ ...baselineScenario, claimedAge: 21 }]);
  assert.equal(misstated.observedExposure, control.observedExposure);
  assert.notEqual(control.observedExposure, roundExposureForTest(45 * 0.65));
});

function roundExposureForTest(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

test("L6.43B refuses a player whose ceiling was lost and who nevertheless reached elite", () => {
  // Potential is never written below current and current does not fall inside
  // the growth window, so these two dated facts cannot both be true of one
  // career. Choosing either silently would publish a share built on a payload
  // that contradicts itself.
  const scenarios: readonly RealizationScenario[] = [{
    playerId: "p:contradiction",
    outcome: "instrument_failure",
    ceilingLostMonthKey: "2028-08",
    recoveryMonthKey: "2030-08",
  }];
  const worldSeed = "l6-43b-world-1";
  const decision = evaluateDevelopmentRealizationCheckpoint({
    baseline: realizationBaseline([{ worldSeed, scenarios }]),
    assignments: [realizationAssignments(worldSeed, scenarios)],
    observation: [realizationObservation(worldSeed, scenarios)],
  });

  assert.equal(decision.decision, "STOP_INSTRUMENT");
  assert.equal(decision.worlds[0]?.players[0]?.outcome, "instrument_failure");
  assert.equal(
    decision.worlds[0]?.players[0]?.instrumentFailureReason,
    "ceiling_lost_and_recovered",
  );
});

test("L6.43B stops the instrument when the cohort, a row or a header is corrupted", () => {
  const scenarios: readonly RealizationScenario[] = [
    { playerId: "p:unconverted", outcome: "realization_under_viable_projection" },
    { playerId: "p:starved", outcome: "sustained_opportunity_insufficient", monthlyMinutes: 90 },
  ];
  const worldSeed = "l6-43b-world-1";
  const healthy = {
    baseline: realizationBaseline([{ worldSeed, scenarios }]),
    assignments: [realizationAssignments(worldSeed, scenarios)],
    observation: [realizationObservation(worldSeed, scenarios)],
  };
  assert.equal(
    evaluateDevelopmentRealizationCheckpoint(healthy).reconciliationFailureCount,
    0,
  );

  // A frozen-cohort player with no header has no exposure denominator, so
  // every share computed for him would be invented.
  const withoutHeader = evaluateDevelopmentRealizationCheckpoint({
    ...healthy,
    observation: [realizationObservation(worldSeed, [
      { ...scenarios[0]!, withoutHeader: true },
      scenarios[1]!,
    ])],
  });
  assert.equal(withoutHeader.decision, "STOP_INSTRUMENT");
  assert.equal(
    withoutHeader.worlds[0]?.players.find((p) => p.playerId === "p:unconverted")
      ?.instrumentFailureReason,
    "missing_cohort_header",
  );

  // A row dated before its own player's boundary means the rows and the header
  // are reading different calendars.
  const observation = realizationObservation(worldSeed, scenarios);
  const strayRow = evaluateDevelopmentRealizationCheckpoint({
    ...healthy,
    observation: [{
      ...observation,
      cohort: observation.cohort.map((entry) =>
        entry.playerId === "p:unconverted"
          ? { ...entry, firstEligibleDevelopmentMonthKey: "2029-08" }
          : entry),
    }],
  });
  assert.equal(strayRow.decision, "STOP_INSTRUMENT");
  assert.equal(
    strayRow.worlds[0]?.players.find((p) => p.playerId === "p:unconverted")
      ?.instrumentFailureReason,
    "row_before_first_eligible_month",
  );

  // A world present in the baseline but absent from the observation is not a
  // world with nothing to say; it is a world that was never measured.
  assert.equal(
    evaluateDevelopmentRealizationCheckpoint({ ...healthy, observation: [] }).decision,
    "STOP_INSTRUMENT",
  );

  // A duplicated month would double whatever it is charged against.
  const duplicated = evaluateDevelopmentRealizationCheckpoint({
    ...healthy,
    observation: [{ ...observation, rows: [...observation.rows, observation.rows[0]!] }],
  });
  assert.equal(duplicated.decision, "STOP_INSTRUMENT");
  assert.equal(
    duplicated.worlds[0]?.players.find((p) => p.playerId === "p:unconverted")
      ?.instrumentFailureReason,
    "duplicate_observed_month",
  );
});

test("L6.43B names an owner only with coherence, share, margin and power", () => {
  const owned = Array.from({ length: 7 }, (_, worldIndex) => ({
    worldSeed: `l6-43b-world-${worldIndex + 1}`,
    scenarios: Array.from({ length: 16 }, (_, index) => ({
      playerId: `p:${worldIndex}:${index}`,
      // Twelve unconverted against four starved clears share and margin.
      outcome: index < 12
        ? "realization_under_viable_projection" as const
        : "sustained_opportunity_insufficient" as const,
      ...(index < 12 ? {} : { monthlyMinutes: 90 }),
    })),
  }));
  const decisionInput = (
    worlds: readonly { worldSeed: string; scenarios: readonly RealizationScenario[] }[],
  ) => ({
    baseline: realizationBaseline(worlds),
    assignments: worlds.map(({ worldSeed, scenarios }) =>
      realizationAssignments(worldSeed, scenarios)),
    observation: worlds.map(({ worldSeed, scenarios }) =>
      realizationObservation(worldSeed, scenarios)),
  });

  const identified = evaluateDevelopmentRealizationCheckpoint(decisionInput(owned));
  assert.equal(identified.decision, "OWNER_IDENTIFIED");
  assert.equal(identified.owner, "realization_under_viable_projection");
  assert.equal(identified.ownerCoherenceWorldCount, 7);
  assert.equal(identified.pooledEvaluableCount, 112);
  // Nobody recovered, and that is a valid baseline reading rather than a gate.
  assert.equal(identified.frozenFailureCohortRecoveryShare, 0);

  // An even split holds the margin below the frozen floor: facts reconcile,
  // no state owns them.
  const mixed = evaluateDevelopmentRealizationCheckpoint(decisionInput(
    owned.map((world) => ({
      ...world,
      scenarios: world.scenarios.map((scenario, index) => ({
        ...scenario,
        outcome: index < 8
          ? "realization_under_viable_projection" as const
          : "sustained_opportunity_insufficient" as const,
        ...(index < 8 ? { monthlyMinutes: 270 } : { monthlyMinutes: 90 }),
      })),
    })),
  ));
  assert.equal(mixed.decision, "MIXED");
  assert.equal(mixed.owner, "mixed");

  // Power is decided before attribution: a clean ranking over too few players
  // is still too few players, and the answer is a longer horizon.
  const underpowered = evaluateDevelopmentRealizationCheckpoint(decisionInput(
    owned.map((world) => ({ ...world, scenarios: world.scenarios.slice(0, 9) })),
  ));
  assert.equal(underpowered.decision, "UNDERPOWERED");
  assert.equal(underpowered.owner, "underpowered");
});

function successorWorldInput(
  worldSeed: string,
  candidate: boolean,
): SuccessorCeilingArmWorldInput {
  const base = current16WorldInput(worldSeed);
  const openingBuffer = Array.from({ length: 12 }, (_, index) => ({
    player: openingPlayerInCompetition({
      playerId: `opening:buffer:${index + 1}`,
      clubId: "club:1:opening-state",
      competitionId: "competition:ita-1",
      age: 24,
      currentAbility: 16,
    }),
    origin: {
      playerId: `opening:buffer:${index + 1}`,
      origin: "opening_senior" as const,
      generatedSeasonNumber: 0,
      entryClubId: "club:1:opening-state",
    },
  }));
  const generated = candidate
    ? Array.from({ length: 9 }, (_, index) => ({
        id: `generated:successor:${index + 1}`,
        row: playerSeason({
          playerId: `generated:successor:${index + 1}`,
          clubId: "club:1:generated",
          seasonNumber: 10,
          age: 25,
          currentAbility: 16,
          goals: 90 - index,
          assists: 90 - index,
        }),
        origin: {
          playerId: `generated:successor:${index + 1}`,
          origin: "annual_academy_intake" as const,
          generatedSeasonNumber: 4,
          entryClubId: "club:1:generated",
        },
      }))
    : [];
  const playerSeasons = base.owner.playerSeasons.map((row) =>
    row.playerId === "player:reference:1:1" && row.seasonNumber === 10
      ? { ...row, goals: 89.5, assists: 89.5 }
      : row
  );
  return {
    ...base,
    owner: {
      ...base.owner,
      openingPlayers: [
        ...(base.owner.openingPlayers ?? []),
        ...openingBuffer.map(({ player }) => player),
      ],
      playerSeasons: [...playerSeasons, ...generated.map(({ row }) => row)],
    },
    architecture: {
      ...base.architecture,
      playerOrigins: [
        ...base.architecture.playerOrigins,
        ...openingBuffer.map(({ origin }) => origin),
        ...generated.map(({ origin }) => origin),
      ],
    },
    successorCeilingSeasons: Array.from({ length: 10 }, (_, index) => ({
      seasonNumber: index + 1,
      activeFiveOrBetterCount: 14,
      targetFiveOrBetterCount: 16,
      fiveAssignmentCount: candidate ? 1 : 0,
      unfilledFiveVacancyCount: candidate ? 0 : 1,
      activeSixCount: 4,
      targetSixCount: 4,
      sixAssignmentCount: 1,
      unfilledSixVacancyCount: 0,
      clubCapRefusalCount: candidate ? 1 : 0,
      reconciliationFailureCount: 0,
      activeSixPlayerIds: ["active-six"],
      sixCandidateFacts: [{
        playerId: `six:${index + 1}`,
        clubId: "club:1:generated",
        division: "first_division",
      }],
      sixAssignmentPlayerIds: [`six:${index + 1}`],
      selectedPlayers: [
        {
          playerId: `six:${index + 1}`,
          clubId: "club:1:generated",
          role: "striker",
          developmentEnvironment: "excellent",
          minimumRating: 6 as const,
          projection: potentialProjection(`six:${index + 1}`, 17, 6),
        },
        ...(candidate ? [{
          playerId: `five:${index + 1}`,
          clubId: "club:1:generated",
          role: "striker",
          developmentEnvironment: "good",
          minimumRating: 5 as const,
          projection: potentialProjection(`five:${index + 1}`, 16, 5),
        }] : []),
      ],
    })),
  };
}

function successorPathwayWorldInput(worldSeed: string): SuccessorCeilingArmWorldInput & {
  readonly pathway: SuccessorPathwayWorldFacts;
} {
  const base = successorWorldInput(worldSeed, true);
  const successorCeilingSeasons = base.successorCeilingSeasons.map((season) =>
    season.seasonNumber !== 5
      ? season
      : { ...season, sixAssignmentPlayerIds: ["six:drifted"] }
  );
  const assignments = successorCeilingSeasons.flatMap((season) =>
    season.selectedPlayers
      .filter(({ minimumRating }) => minimumRating === 5)
      .map((selected) => ({
        seasonNumber: season.seasonNumber,
        playerId: selected.playerId,
        clubId: selected.clubId,
        role: selected.role,
        developmentEnvironment: selected.developmentEnvironment,
        projection: selected.projection,
      }))
  );
  const boundaries = assignments.flatMap((assignment) =>
    Array.from({ length: 11 - assignment.seasonNumber }, (_, index) => {
      const seasonNumber = assignment.seasonNumber + index;
      const exitSeason = assignment.seasonNumber + 3;
      return {
        seasonNumber,
        playerId: assignment.playerId,
        academyActive: seasonNumber < exitSeason,
        academyExitOutcomes: seasonNumber === exitSeason && exitSeason <= 10
          ? ["released" as const]
          : [],
        seniorAssociations: [],
        playerExitReasons: [],
        projection: "not_observed" as const,
      };
    })
  );
  return {
    ...base,
    successorCeilingSeasons,
    pathway: {
      worldSeed,
      assignments,
      boundaries,
      reconciliationFailureCount: 0,
    },
  };
}

// Eight development checkpoints a season, August to March, which is what the
// real lifecycle closes. Four calendar months a year close nothing, and the
// exposure denominator must not contain them.
const OBSERVED_SEASON_START_YEARS = [2026, 2027, 2028, 2029, 2030, 2031] as const;

function closedDevelopmentMonthKeys(): readonly string[] {
  return OBSERVED_SEASON_START_YEARS.flatMap((year) => [
    ...[8, 9, 10, 11, 12].map((month) => `${year}-${String(month).padStart(2, "0")}`),
    ...[1, 2, 3].map((month) => `${year + 1}-0${month}`),
  ]);
}

/** How a fixture player should behave, named by the outcome it must produce. */
interface RealizationScenario {
  readonly playerId: string;
  readonly outcome: DevelopmentRealizationOutcome | "instrument_failure";
  /** Attacker unless stated; a goalkeeper is judged at 28 and censors later. */
  readonly naturalPosition?: string;
  readonly birthIso?: string;
  readonly p50Ability?: number;
  /** 270 gives the full opportunity multiplier, 90 gives 0.45. */
  readonly monthlyMinutes?: number;
  readonly rolePotentialAbility?: number;
  readonly roleCurrentAbilityAfter?: number;
  /** Month at which potential drops below elite, if it ever does. */
  readonly ceilingLostMonthKey?: string;
  /** Month at which current reaches elite, if it ever does. */
  readonly recoveryMonthKey?: string;
  /** Omit the header entirely; the evaluator must call this out by name. */
  readonly withoutHeader?: boolean;
  /**
   * Emit rows past the control window, as a Step 16M-C candidate would.
   *
   * The admitted candidate extends growth past `26`, so its arm produces
   * development rows at ages the control curve pays nothing for. Judgement,
   * window and denominator must not move because of them.
   */
  readonly candidateExtendedGrowth?: boolean;
  /**
   * Make every row misstate its own age, as a drifted producer would.
   *
   * Exposure must be priced from the header's birth date, the single dated
   * source, and never from an age a row restates about itself.
   */
  readonly claimedAge?: number;
}

function realizationObservation(
  worldSeed: string,
  scenarios: readonly RealizationScenario[],
): DevelopmentRealizationWorldObservation {
  const closed = closedDevelopmentMonthKeys();
  return {
    worldSeed,
    closedDevelopmentMonthKeys: closed,
    cohort: scenarios
      .filter(({ withoutHeader }) => withoutHeader !== true)
      .map((scenario) => ({
        playerId: scenario.playerId,
        birthDate: Number(fromISO(scenario.birthIso ?? "2006-01-01")),
        naturalPosition: scenario.naturalPosition ?? "st",
        firstEligibleDevelopmentMonthKey: closed[0]!,
      })),
    rows: scenarios.flatMap((scenario) =>
      scenario.withoutHeader === true
        ? []
        : closed.flatMap((monthKey) => {
            const age = ageAtMonth(scenario.birthIso ?? "2006-01-01", monthKey);
            // Only months inside the growth window produce a development row,
            // exactly as the engine only develops where the curve still pays -
            // unless the scenario is standing in for a candidate arm whose
            // curve pays later.
            return scenario.candidateExtendedGrowth === true
              || monthlyGrowthAgeMultiplier(
                (scenario.naturalPosition ?? "st") === "gk" ? "goalkeeper" : "attacker",
                age,
              ) > 0
              ? [realizationRow({ scenario, monthKey, age })]
              : [];
          })
    ),
  };
}

function realizationRow(input: {
  readonly scenario: RealizationScenario;
  readonly monthKey: string;
  readonly age: number;
}): PlayerMonthlyDevelopmentObservation {
  const { scenario, monthKey, age } = input;
  const lost = scenario.ceilingLostMonthKey !== undefined
    && monthKey >= scenario.ceilingLostMonthKey;
  const recovered = scenario.recoveryMonthKey !== undefined
    && monthKey >= scenario.recoveryMonthKey;
  return {
    change: {
      playerId: fixtureBrand(scenario.playerId),
      monthKey,
      age: scenario.claimedAge ?? age,
      positionGroup: (scenario.naturalPosition ?? "st") === "gk"
        ? "goalkeeper"
        : "attacker",
      minutes: scenario.monthlyMinutes ?? 270,
      positiveGrowthEnvironmentBasisPoints: 10_000,
      developmentVariance: 1,
      totalGrowth: 0.1,
      totalDecline: 0,
      improvedAbilityCount: 1,
      declinedAbilityCount: 0,
      roleCurrentAbilityBefore: fixtureBrand(12),
      roleCurrentAbilityAfter: fixtureBrand(
        recovered ? 16.2 : scenario.roleCurrentAbilityAfter ?? 14,
      ),
      rolePotentialAbility: fixtureBrand(
        lost ? 15.4 : scenario.rolePotentialAbility ?? 17.5,
      ),
    },
    developmentRole: "striker",
    bucketMargins: [],
    ratingTotal: 13,
    ratingSamples: 2,
  };
}

/**
 * Brands one scalar for a fixture row.
 *
 * Two reasons the canonical constructors cannot be used. `roleCurrentAbility`
 * and its sibling take a whole twenty-five-attribute profile plus a role weight
 * table, which a fixture needing a single dated number cannot honestly supply.
 * And `playerId` lives in `@game/domain`, which `apps/cli` may not import - the
 * package boundary is deliberate, and the test runner enforced it here even
 * though the typechecker did not.
 *
 * A report reads these values and never mints them, so the cast is confined to
 * this one helper rather than spread through the fixtures.
 */
function fixtureBrand<Branded>(value: string | number): Branded {
  return value as unknown as Branded;
}

function ageAtMonth(birthIso: string, monthKey: string): number {
  return completedPlayerAgeAtDevelopmentMonth(
    fromISO(birthIso) as Parameters<typeof completedPlayerAgeAtDevelopmentMonth>[0],
    monthKey as Parameters<typeof completedPlayerAgeAtDevelopmentMonth>[1],
  );
}

/** A baseline decision carrying only what the L6.43B evaluator reads from it. */
function realizationBaseline(
  worlds: readonly { readonly worldSeed: string; readonly scenarios: readonly RealizationScenario[] }[],
): SuccessorPathwayCheckpointDecision {
  return {
    decision: "OWNER_IDENTIFIED",
    owner: "development_realization",
    ownerCoherenceWorldCount: worlds.length,
    pooledClosedWindowCount: 0,
    pooledOwnerCounts: {} as SuccessorPathwayCheckpointDecision["pooledOwnerCounts"],
    pooledOwnerShare: "not_observed",
    pooledOwnerMargin: "not_observed",
    sixStarFirstDivergences: [],
    reconciliationFailureCount: 0,
    worlds: worlds.map(({ worldSeed, scenarios }) => ({
      worldSeed,
      assignmentCount: scenarios.length,
      closedWindowCount: scenarios.length,
      openWindowCount: 0,
      terminalCounts: {} as never,
      dominantLossOwner: "development_realization",
      dominantLossShare: 1,
      reconciliationFailureCount: 0,
      players: scenarios.map((scenario) => ({
        playerId: scenario.playerId,
        assignmentSeason: 1,
        assignmentClubId: "club:1",
        role: "striker",
        assignmentAge: 20,
        terminal: "development_realization" as const,
        academyExitOutcome: "promotion_candidate" as const,
        firstSeniorSeason: 1,
        cumulativeSeniorAppearances: 40,
        cumulativeSeniorMinutes: 3600,
        reachedCurrent16: false,
        reachedFirstDivisionCurrent16: false,
        retainedFirstDivisionCurrent16AtSeasonTen: false,
        seasonTenLeader: false,
      })),
    })),
  };
}

function realizationAssignments(
  worldSeed: string,
  scenarios: readonly RealizationScenario[],
) {
  return {
    worldSeed,
    assignments: scenarios.map((scenario) => ({
      seasonNumber: 1,
      playerId: scenario.playerId,
      clubId: "club:1",
      role: "striker",
      developmentEnvironment: "good",
      projection: {
        ...potentialProjection(scenario.playerId, 17, 5 as const),
        p50Ability: scenario.p50Ability ?? 17,
      },
    })),
    boundaries: [],
    reconciliationFailureCount: 0,
  };
}

const SEASONS_PAST_BASELINE = [11, 12, 13, 14, 15] as const;

/**
 * Adds what seasons eleven to fifteen would have contributed to one arm.
 *
 * The fifteen-season fixture is the ten-season one plus this, so the extension
 * is the only difference between them and the adapter test can assert that the
 * cut removes exactly it. Building two independent fixtures instead would prove
 * only that two hand-written objects match.
 */
function extendedPastBaseline<World extends SuccessorCeilingArmWorldInput>(
  world: World,
): World {
  const lastBaselineSeason = world.successorCeilingSeasons.at(-1)!;
  const lastPlayerSeason = world.owner.playerSeasons.at(-1)!;
  return {
    ...world,
    owner: {
      ...world.owner,
      playerSeasons: [
        ...world.owner.playerSeasons,
        ...SEASONS_PAST_BASELINE.map((seasonNumber) => ({
          ...lastPlayerSeason,
          seasonNumber,
        })),
      ],
    },
    successorCeilingSeasons: [
      ...world.successorCeilingSeasons,
      ...SEASONS_PAST_BASELINE.map((seasonNumber) => ({
        ...lastBaselineSeason,
        seasonNumber,
        selectedPlayers: lastBaselineSeason.selectedPlayers.map((selected) => ({
          ...selected,
          playerId: `${selected.playerId}:season-${seasonNumber}`,
        })),
      })),
    ],
  };
}

/** The assignments and boundaries those five extra seasons would have produced. */
function extendedPathwayPastBaseline(
  pathway: SuccessorPathwayWorldFacts,
): SuccessorPathwayWorldFacts {
  const lastAssignment = pathway.assignments.at(-1)!;
  const lastBoundary = pathway.boundaries.at(-1)!;
  return {
    ...pathway,
    assignments: [
      ...pathway.assignments,
      ...SEASONS_PAST_BASELINE.map((seasonNumber) => ({
        ...lastAssignment,
        seasonNumber,
        playerId: `${lastAssignment.playerId}:season-${seasonNumber}`,
      })),
    ],
    boundaries: [
      ...pathway.boundaries,
      // Every player already assigned keeps accruing a boundary each season, so
      // the surplus is not confined to the new intake classes.
      ...pathway.assignments.flatMap(({ playerId }) =>
        SEASONS_PAST_BASELINE.map((seasonNumber) => ({
          ...lastBoundary,
          seasonNumber,
          playerId,
        }))
      ),
    ],
  };
}

function potentialProjection(
  playerId: string,
  storedCeilingAbility: number,
  storedCeilingRating: 5 | 6,
): PlayerPotentialProjection {
  return {
    playerId: playerId as PlayerPotentialProjection["playerId"],
    age: 17,
    roleFamily: "outfield" as const,
    currentAbility: 12,
    p50Ability: 15,
    upperAbility: storedCeilingAbility,
    storedCeilingAbility,
    currentRating: 3.5 as const,
    p50Rating: 4.5 as const,
    upperRating: storedCeilingRating,
    storedCeilingRating,
  };
}

function current16WorldInput(worldSeed: string): StationaryAgeSuccessionWorldInput {
  const competitions = ["competition:ita-1", "competition:ita-2", "competition:ita-3"];
  const openingPlayers = competitions.flatMap((competitionId, divisionIndex) =>
    Array.from({ length: 3 }, (_, index) => openingPlayerInCompetition({
      playerId: `player:reference:${divisionIndex + 1}:${index + 1}`,
      clubId: `club:${divisionIndex + 1}:reference`,
      competitionId,
      age: 24,
      currentAbility: 16,
    }))
  );
  const openingRows = competitions.flatMap((competitionId, divisionIndex) =>
    Array.from({ length: 3 }, (_, index) => {
      const playerId = `player:reference:${divisionIndex + 1}:${index + 1}`;
      return [
        playerSeason({
          playerId,
          clubId: `club:${divisionIndex + 1}:reference`,
          competitionId,
          seasonNumber: 1,
          age: 24,
          currentAbility: 16,
        }),
        playerSeason({
          playerId,
          clubId: `club:${divisionIndex + 1}:reference`,
          competitionId,
          seasonNumber: 10,
          age: 33,
          currentAbility: 16,
        }),
      ];
    }).flat()
  );
  const openingStatePlayers = [
    ["opening:not-active", "not_active"] as const,
    ["opening:outside", "outside"] as const,
    ["opening:below", "below"] as const,
    ["opening:retained-a", "retained"] as const,
    ["opening:retained-b", "retained"] as const,
    ["opening:retained-c", "retained"] as const,
  ];
  for (const [playerId] of openingStatePlayers) {
    openingPlayers.push(openingPlayerInCompetition({
      playerId,
      clubId: "club:1:opening-state",
      competitionId: "competition:ita-1",
      age: 25,
      currentAbility: 16,
    }));
  }
  openingPlayers.push(openingPlayerInCompetition({
    playerId: "opening:from-below",
    clubId: "club:1:opening-state",
    competitionId: "competition:ita-1",
    age: 24,
    currentAbility: 15,
  }));
  openingPlayers.push(openingPlayerInCompetition({
    playerId: "opening:generated-club-anchor",
    clubId: "club:1:generated",
    competitionId: "competition:ita-1",
    age: 24,
    currentAbility: 15,
  }));
  const openingStateRows = openingStatePlayers.flatMap(([playerId, state]) => {
    if (state === "not_active") return [];
    return [playerSeason({
      playerId,
      clubId: state === "outside" ? "club:2:reference" : "club:1:opening-state",
      competitionId: state === "outside" ? "competition:ita-2" : "competition:ita-1",
      seasonNumber: 10,
      age: 34,
      currentAbility: state === "below" ? 15 : 16,
    })];
  });
  openingStateRows.push(playerSeason({
    playerId: "opening:from-below",
    clubId: "club:1:opening-state",
    competitionId: "competition:ita-1",
    seasonNumber: 10,
    age: 33,
    currentAbility: 16,
  }));

  const generatedDefinitions = [
    { id: "generated:no-senior", stage: "no_senior" },
    { id: "generated:ceiling", stage: "ceiling" },
    { id: "generated:development", stage: "development" },
    { id: "generated:inactive", stage: "inactive" },
    { id: "generated:outside", stage: "outside" },
    { id: "generated:quality", stage: "quality" },
    { id: "generated:success", stage: "success" },
    ...Array.from({ length: 6 }, (_, index) => ({
      id: `generated:ceiling-extra-${index + 1}`,
      stage: "ceiling",
    })),
  ];
  const generatedRows = generatedDefinitions.flatMap(({ id, stage }) => {
    if (stage === "no_senior") return [];
    if (stage === "ceiling") return [playerSeason({
      playerId: id,
      clubId: "club:1:generated",
      seasonNumber: 10,
      age: 25,
      currentAbility: 14,
      potentialRoom: 1,
    })];
    if (stage === "development") return [playerSeason({
      playerId: id,
      clubId: "club:1:generated",
      seasonNumber: 10,
      age: 25,
      currentAbility: 14,
      potentialRoom: 2,
    })];
    if (stage === "inactive") return [playerSeason({
      playerId: id,
      clubId: "club:1:generated",
      seasonNumber: 4,
      age: 22,
      currentAbility: 16,
    })];
    return [
      playerSeason({
        playerId: id,
        clubId: "club:1:generated",
        seasonNumber: 4,
        age: 22,
        currentAbility: 16,
      }),
      playerSeason({
        playerId: id,
        clubId: stage === "outside" ? "club:2:reference" : "club:1:generated",
        competitionId: stage === "outside" ? "competition:ita-2" : "competition:ita-1",
        seasonNumber: 10,
        age: 28,
        currentAbility: stage === "quality" ? 15 : 16,
        goals: stage === "success" ? 100 : 0,
        assists: stage === "success" ? 100 : 0,
      }),
    ];
  });
  const lowerDivisionGenerated = [2, 3].flatMap((division) => {
    const playerId = `generated:division-${division}`;
    return {
      playerId,
      origin: {
        playerId,
        origin: "annual_academy_intake" as const,
        generatedSeasonNumber: 4,
        entryClubId: `club:${division}:reference`,
      },
      row: playerSeason({
        playerId,
        clubId: `club:${division}:reference`,
        competitionId: `competition:ita-${division}`,
        seasonNumber: 10,
        age: 25,
        currentAbility: 16,
      }),
    };
  });
  const openingOrigins = openingPlayers.map(({ playerId, clubId }) => ({
    playerId,
    origin: "opening_senior" as const,
    generatedSeasonNumber: 0,
    entryClubId: clubId,
  }));
  const generatedOrigins = generatedDefinitions.map(({ id }) => ({
    playerId: id,
    origin: "annual_academy_intake" as const,
    generatedSeasonNumber: 4,
    entryClubId: "club:1:generated",
  }));
  return {
    owner: {
      worldSeed,
      openingPlayers,
      tableSeasons: [],
      playerSeasons: [
        ...openingRows,
        ...openingStateRows,
        ...generatedRows,
        ...lowerDivisionGenerated.map(({ row }) => row),
      ],
      selectionLoadSeasons: [],
      playerUseSeasons: [],
      clubIdentitySeasons: [],
      annualRolePlanReconciliationFailureCount: 0,
      annualRolePlanPositiveRoleCounts: [],
      reconciliationFailureCount: 0,
    },
    architecture: {
      worldSeed,
      playerOrigins: [
        ...openingOrigins,
        ...generatedOrigins,
        ...lowerDivisionGenerated.map(({ origin }) => origin),
      ],
      exits: [],
    },
    renewalNeedEpisodes: [],
    exceptionalStock: emptyExceptionalStock(),
  };
}

function openingPlayerInCompetition(input: {
  readonly playerId: string;
  readonly clubId: string;
  readonly competitionId: string;
  readonly age: number;
  readonly currentAbility: number;
}) {
  return {
    ...openingPlayer(
      input.playerId,
      input.clubId,
      input.age,
      input.currentAbility,
      true,
    ),
    competitionId: input.competitionId,
  };
}

function worldInput(worldSeed: string): StationaryAgeSuccessionWorldInput {
  const seasonTenRows = Array.from({ length: 10 }, (_, index) => playerSeason({
    playerId: `player:leader-${index}`,
    clubId: "club:a",
    seasonNumber: 10,
    age: 25 + index % 5,
    currentAbility: 16,
    goals: 20 - index,
    assists: 12 - index,
  }));
  const transitionRows = [
    playerSeason({
      playerId: "player:incumbent-a",
      clubId: "club:a",
      seasonNumber: 1,
      age: 30,
      currentAbility: 16,
    }),
    playerSeason({
      playerId: "player:incumbent-a",
      clubId: "club:a",
      seasonNumber: 2,
      age: 31,
      currentAbility: 15.4,
    }),
    playerSeason({
      playerId: "player:incumbent-b",
      clubId: "club:b",
      seasonNumber: 1,
      age: 30,
      currentAbility: 15,
    }),
  ];
  const origins = [
    ...seasonTenRows.map((row, index) => ({
      playerId: row.playerId,
      origin: index < 6 ? "opening_senior" as const : "annual_academy_intake" as const,
      generatedSeasonNumber: index < 6 ? 0 : 4,
    })),
    {
      playerId: "player:incumbent-a",
      origin: "opening_senior" as const,
      generatedSeasonNumber: 0,
    },
    {
      playerId: "player:incumbent-b",
      origin: "opening_senior" as const,
      generatedSeasonNumber: 0,
    },
  ];
  return {
    owner: {
      worldSeed,
      openingPlayers: [
        openingPlayer("player:incumbent-a", "club:a", 30, 16, true),
        openingPlayer("player:incumbent-b", "club:b", 30, 15, true),
      ],
      tableSeasons: [],
      playerSeasons: [...transitionRows, ...seasonTenRows],
      selectionLoadSeasons: [],
      playerUseSeasons: [],
      clubIdentitySeasons: [],
      annualRolePlanReconciliationFailureCount: 0,
      annualRolePlanPositiveRoleCounts: [],
      reconciliationFailureCount: 0,
    },
    architecture: {
      worldSeed,
      playerOrigins: origins,
      exits: [],
    },
    renewalNeedEpisodes: [
      {
        worldSeed,
        divisionLevel: 1,
        clubId: "club:a",
        seasonNumber: 1,
        role: "striker",
        needEpisodeOrdinal: 1,
        firstAppearanceDate: 1,
        maximumStage: "fulfilled",
        terminalOutcome: "fulfilled",
        fulfilledPlayerId: "player:successor",
        roleSuccessionSnapshot: {
          incumbent: {
            playerId: "player:incumbent-a" as never,
            age: 30,
            currentAbility: 16,
            p50Ability: 16,
            upperAbility: 16,
          },
          planningFloor: 14,
          sameRoleAlternativeCount: 1,
          bestPrimeAgeAlternative: {
            playerId: "player:internal" as never,
            age: 24,
            currentAbility: 14.5,
            p50Ability: 15,
            upperAbility: 16,
          },
        },
        successionTargetPoolStage: "qualified_prime_age_loses_generic_score",
      },
      {
        worldSeed,
        divisionLevel: 1,
        clubId: "club:a",
        seasonNumber: 3,
        role: "striker",
        needEpisodeOrdinal: 2,
        firstAppearanceDate: 3,
        maximumStage: "observed",
        terminalOutcome: "recruitment_impossible",
      },
    ],
    exceptionalStock: emptyExceptionalStock(),
  };
}

function playerSeason(input: {
  readonly playerId: string;
  readonly clubId: string;
  readonly competitionId?: string;
  readonly seasonNumber: number;
  readonly age: number;
  readonly currentAbility: number;
  readonly potentialRoom?: number;
  readonly goals?: number;
  readonly assists?: number;
}) {
  return {
    competitionId: input.competitionId ?? "competition:ita-1",
    seasonNumber: input.seasonNumber,
    playerId: input.playerId,
    clubId: input.clubId,
    age: input.age,
    role: "striker" as const,
    currentAbility: input.currentAbility,
    potentialRoom: input.potentialRoom ?? 0,
    appearances: 1,
    starts: 1,
    minutes: 90,
    shots: 1,
    shotsOnTarget: 1,
    creatorNominations: 1,
    goals: input.goals ?? 0,
    assists: input.assists ?? 0,
  };
}

function openingPlayer(
  playerId: string,
  clubId: string,
  age: number,
  currentAbility: number,
  openingStarter: boolean,
) {
  return {
    competitionId: "competition:ita-1",
    clubId,
    playerId,
    age,
    role: "striker" as const,
    currentAbility,
    openingStarter,
  };
}

function emptyExceptionalStock(): PlayerGenerationExceptionalStockSummary {
  return {
    observationCount: 0,
    evaluationStatus: "not_evaluated",
    activePlayerObservationCount: 0,
    youngStoredCeilingSixObservationCount: 0,
    youngPublicUpperSixObservationCount: 0,
    transitionObservationCount: 0,
    requiredReplacementObservationCount: 0,
    completedReplacementCount: 0,
    missingReplacementCount: 0,
    inflationArrivalCount: 0,
    stockEntryObservationCount: 0,
    stockEntryPlayerObservationCount: 0,
    stockEntryCategoryPlacementViolationCount: 0,
    stockEntryClubUniquenessViolationCount: 0,
    snapshots: [],
    transitions: [],
    stockEntries: [],
  };
}
