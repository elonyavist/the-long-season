import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createFakeDomesticWorld,
  selectPlayerValuationConfig,
} from "@game/content";
import { completedPlayerAge, monthlyOpportunityMultiplier } from "@game/engine";
import { createTranslator } from "@game/i18n";
import { fromISO, toISO } from "@game/shared";
import {
  type PlayerGenerationEconomyGate,
  type PlayerDevelopmentCohortWorldSummary,
} from "@game/simulation-tools";
import { test } from "vitest";

import {
  createResumableLongRunGateFacts,
  createResumablePlayerDevelopmentCohortFacts,
} from "./long-run-profile-checkpoints.ts";
import {
  aggregatePlayerEconomyGateEvidence,
  createPlayerDevelopmentCohortFactsFromAggregate,
  createPlayerDevelopmentCohortFactsFromWorlds,
  createPhase80APotentialOutcomeCalibration,
  createLongRunGateFacts,
  createCareerWorldFacts,
  hashPhase79CComposition,
  phase80APotentialOutcomeMonthKeys,
  resolveLongRunGateWorkerCount,
  seasonStartYearAtDate,
  transferNegotiationEventDate,
} from "./career-world-facts.ts";

test("transfer diagnostics use counter time and exact civil age/season boundaries", () => {
  type DiagnosticDate = Parameters<typeof transferNegotiationEventDate>[1];
  const submittedOn = fromISO("2026-07-31") as DiagnosticDate;
  const counterIssuedOn = fromISO("2026-08-01") as DiagnosticDate;
  const fallback = fromISO("2026-08-05") as DiagnosticDate;
  const birthDate = fromISO("2008-08-01") as DiagnosticDate;
  const countered = {
    status: "countered",
    submittedOn,
    counterIssuedOn,
  } as unknown as Parameters<typeof transferNegotiationEventDate>[0];
  const playerCountered = {
    status: "player_countered",
    submittedOn,
    counterIssuedOn,
  } as unknown as Parameters<typeof transferNegotiationEventDate>[0];

  assert.equal(transferNegotiationEventDate(countered, fallback), counterIssuedOn);
  assert.equal(
    transferNegotiationEventDate(playerCountered, fallback),
    counterIssuedOn,
  );
  assert.equal(completedPlayerAge(birthDate, submittedOn), 17);
  assert.equal(completedPlayerAge(birthDate, counterIssuedOn), 18);
  assert.equal(
    seasonStartYearAtDate(submittedOn, fromISO("2025-08-01")),
    2025,
  );
  assert.equal(
    seasonStartYearAtDate(counterIssuedOn, fromISO("2025-08-01")),
    2026,
  );
});

test("same-seed Phase 79C composition hashes replay without a second cohort", () => {
  const first = createFakeDomesticWorld({ worldSeed: "phase79c-composition-hash" });
  const replay = createFakeDomesticWorld({ worldSeed: "phase79c-composition-hash" });
  const different = createFakeDomesticWorld({ worldSeed: "phase79c-composition-hash-other" });

  assert.equal(hashPhase79CComposition(first), hashPhase79CComposition(replay));
  assert.notEqual(hashPhase79CComposition(first), hashPhase79CComposition(different));
});

test("Phase 80A potential-outcome cycles follow the August career year", () => {
  const openingDate = fromISO("2026-08-01");

  assert.deepEqual(
    phase80APotentialOutcomeMonthKeys(openingDate, 0),
    [
      "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01",
      "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07",
    ],
  );
  assert.deepEqual(
    phase80APotentialOutcomeMonthKeys(openingDate, 1),
    [
      "2027-08", "2027-09", "2027-10", "2027-11", "2027-12", "2028-01",
      "2028-02", "2028-03", "2028-04", "2028-05", "2028-06", "2028-07",
    ],
  );
});

test("Phase 80A potential-outcome matrix composes engine owners across every locked cell", () => {
  const baseline = createPhase80APotentialOutcomeCalibration();
  const replay = createPhase80APotentialOutcomeCalibration();

  assert.equal(baseline.audit.observationCount, 1_620);
  assert.deepEqual(
    baseline.outfieldTemplateSelections.map(({ department }) => department),
    ["defender", "defender", "midfielder", "midfielder", "attacker"],
  );
  assert.equal(
    new Set(
      baseline.outfieldTemplateSelections.map(({ playerId }) => playerId),
    ).size,
    5,
  );
  assert.equal(baseline.audit.cells.length, 324);
  assert.equal(baseline.audit.cells.every(({ observationCount }) => observationCount === 5), true);
  assert.equal(baseline.audit.expectedCellCount, 324);
  assert.equal(baseline.audit.missingCellCount, 0);
  assert.equal(baseline.audit.underObservedCellCount, 0);
  assert.equal(baseline.audit.projectionOrderingViolationCount, 0);
  assert.equal(baseline.audit.nonWideningAgeViolationCount, 0);
  assert.equal(
    baseline.audit.gates.find(({ key }) =>
      key === "public_projection_non_widening_age"
    )?.status,
    "pass",
  );
  assert.equal(
    baseline.audit.gates.find(({ key }) =>
      key === "public_projection_non_widening_age"
    )?.observationCount,
    1_620,
  );
  assert.equal(baseline.projectionPolicyCalibration.length, 24);
  assert.equal(
    baseline.projectionPolicyCalibration.reduce(
      (total, band) => total + band.observationCount,
      0,
    ),
    1_620,
  );
  assert.equal(
    baseline.projectionPolicyCalibration.filter(
      ({ evaluationStatus }) => evaluationStatus === "evaluated",
    ).length,
    24,
  );
  const projectionPolicy = selectPlayerValuationConfig(
    createFakeDomesticWorld({ worldSeed: baseline.seedPrefix })
      .calibrationVersions,
  ).potentialProjectionPolicy;
  for (const calibrationBand of baseline.projectionPolicyCalibration) {
    const configuredBand = projectionPolicy.ageBandsByRoleFamily[
      calibrationBand.roleGroup
    ].find(({ minimumAge, maximumAge }) =>
      minimumAge === calibrationBand.minimumAge
      && maximumAge === calibrationBand.maximumAge
    );
    assert.notEqual(configuredBand, undefined);
    assert.equal(
      configuredBand?.p50RealizationBasisPoints,
      calibrationBand.p50RealizationBasisPoints,
    );
    let contractUpper = calibrationBand.p90RealizationBasisPoints;
    if (calibrationBand.maximumAge <= 20) {
      contractUpper = 10_000;
    }
    const isTerminalBand = calibrationBand.roleGroup === "outfield"
      ? calibrationBand.minimumAge >= 28
      : calibrationBand.minimumAge >= 32;
    if (isTerminalBand) {
      contractUpper = 0;
    }
    assert.equal(
      configuredBand?.upperRealizationBasisPoints,
      contractUpper,
    );
  }
  assert.equal(baseline.audit.unobservedCalibrationBandCount, 0);
  // Descriptive reachability counters under the exact v10 bundle. The
  // structural gates below, not these goldens, own acceptance.
  assert.equal(baseline.audit.abovePublicUpperCount, 66);
  assert.equal(baseline.audit.abovePublicUpperRateBasisPoints, 407);
  assert.equal(baseline.audit.storedCeilingViolationCount, 0);
  assert.equal(
    baseline.audit.gates.find(({ key }) =>
      key === "projection_policy_calibration_coverage"
    )?.status,
    "pass",
  );
  assert.equal(
    baseline.audit.gates.find(({ key }) => key === "stored_ceiling_integrity")
      ?.status,
    "pass",
  );
  assert.equal(
    baseline.audit.gates.find(({ key }) => key === "stored_ceiling_integrity")
      ?.observationCount,
    1_620,
  );
  assert.deepEqual(
    new Set(baseline.audit.cells.map(({ startAge }) => startAge)),
    new Set(Array.from({ length: 18 }, (_, index) => index + 15)),
  );
  assert.deepEqual(
    new Set(baseline.audit.cells.map(({ roleGroup }) => roleGroup)),
    new Set(["goalkeeper", "outfield"]),
  );
  assert.deepEqual(baseline, replay);
});

test("Phase 80A canonical rollover wires full stock and non-vacuous replacement gates", () => {
  const representedClubs = new Set<string>();
  const observedPlayersByClub = new Map<string, Set<string>>();
  const positivePlayersByClub = new Map<string, Set<string>>();
  let reachedFullOpportunityAtCanonicalAcademyLoad = false;
  const report = createCareerWorldFacts(
    "phase80a-replacement-29",
    2,
    createTranslator("en"),
    (seasonNumber, rows, careerState) => {
      if (seasonNumber !== 1) return;
      reachedFullOpportunityAtCanonicalAcademyLoad ||= rows.some(
        (row) => row.minutes === 270 && monthlyOpportunityMultiplier(row.minutes) === 1,
      );
      const ownedPlayersByClub = new Map(careerState.gameState.clubIds.map((clubId) => {
        const seniorPlayerIds = careerState.gameState.clubs[clubId]?.playerIds.map(String) ?? [];
        const academyPlayerIds = careerState.youthAcademyState?.clubRosters[clubId]?.playerIds.map(String) ?? [];
        return [String(clubId), new Set([...seniorPlayerIds, ...academyPlayerIds])] as const;
      }));
      const ownerClubIdByPlayerId = new Map([...ownedPlayersByClub].flatMap(
        ([clubId, playerIds]) => [...playerIds].map((playerId) => [playerId, clubId] as const),
      ));
      for (const row of rows) {
        const ownerClubId = ownerClubIdByPlayerId.get(row.playerId);
        assert.notEqual(ownerClubId, undefined);
        const observedPlayers = observedPlayersByClub.get(String(ownerClubId))
          ?? new Set<string>();
        observedPlayers.add(row.playerId);
        observedPlayersByClub.set(String(ownerClubId), observedPlayers);
        for (const [clubId, minutes] of Object.entries(row.clubMinutes)) {
          representedClubs.add(clubId);
          assert.equal(ownedPlayersByClub.get(clubId)?.has(String(row.playerId)), true);
          if ((minutes ?? 0) > 0) {
            const positivePlayers = positivePlayersByClub.get(clubId)
              ?? new Set<string>();
            positivePlayers.add(row.playerId);
            positivePlayersByClub.set(clubId, positivePlayers);
          }
        }
      }
    },
  );
  const annualIntakeAudit = report.annualIntakeAudit;
  const stock = report.playerEconomyAudit.youngExceptionalStock;
  assert.equal(representedClubs.size, 54);
  assert.equal(observedPlayersByClub.size, 54);
  assert.equal(
    [...observedPlayersByClub.values()].every((players) => players.size > 11),
    true,
  );
  assert.equal(positivePlayersByClub.size, 54);
  assert.equal(reachedFullOpportunityAtCanonicalAcademyLoad, true);
  const positivePlayerCounts = [...positivePlayersByClub.values()].map(
    (players) => players.size,
  );
  assert.equal(
    positivePlayerCounts.every((count) => count >= 11),
    true,
  );
  assert.equal(
    toISO(report.finalCareerState.gameState.calendar.currentDate),
    "2028-08-01",
  );
  assert.equal(annualIntakeAudit.evaluationStatus, "evaluated");
  assert.equal(annualIntakeAudit.observationCount, 2);
  // Canonical academy participation now lets aging compress the stored
  // ceiling of academy players too. Across these two transitions the annual
  // role-continuous academy generation changes which opening prospects age
  // out on this seed: the soft club blueprint now replaces seven departures.
  // The
  // stock remains exactly four per snapshot and the audit still rejects inflation.
  assert.equal(annualIntakeAudit.allocatedStoredCeilingSixCount, 7);
  assert.equal(annualIntakeAudit.generatedStoredCeilingSixCount, 7);
  assert.equal(annualIntakeAudit.acceptedStoredCeilingSixCount, 7);
  assert.equal(annualIntakeAudit.activeStoredCeilingSixCount, 8);
  assert.equal(
    annualIntakeAudit.allocatedStoredCeilingSixMissingGeneratedCount,
    0,
  );
  assert.equal(
    annualIntakeAudit.generatedStoredCeilingSixMissingAcceptedCount,
    0,
  );
  assert.equal(stock.observationCount, 3);
  assert.equal(stock.activePlayerObservationCount > 0, true);
  assert.equal(stock.requiredReplacementObservationCount, 2);
  assert.equal(stock.completedReplacementCount, 7);
  assert.equal(stock.missingReplacementCount, 0);
  assert.equal(stock.inflationArrivalCount, 0);
  assert.equal(stock.stockEntryObservationCount > 0, true);
  assert.equal(stock.stockEntryPlayerObservationCount > 0, true);
  assert.equal(stock.stockEntryCategoryPlacementViolationCount, 0);
  assert.equal(stock.stockEntryClubUniquenessViolationCount, 0);
  assert.equal(
    stock.stockEntries.some(({ entryKind }) => entryKind === "opening_allocation"),
    true,
  );
  assert.equal(
    stock.stockEntries.some(({ entryKind }) => entryKind === "stock_arrival"),
    true,
  );
  for (const key of [
    "young_stored_ceiling_six_active_stock",
    "young_stored_ceiling_six_stock_arrival_category_placement",
    "young_stored_ceiling_six_stock_arrival_club_uniqueness",
    "young_stored_ceiling_six_vacancy_replacement",
    "young_stored_ceiling_six_no_inflation",
  ]) {
    const gate = report.playerEconomyAudit.gates.find(
      (candidate) => candidate.key === key,
    );
    assert.equal(gate?.status, "pass");
    assert.equal((gate?.observationCount ?? 0) > 0, true);
  }
// Measured at 39.9s alone and 110.2s under the full seven-worker suite after
// canonical development became materially active. The old 90s budget failed
// only under contention; 180s preserves a finite hang detector with margin on
// the measured contended path.
}, 180_000);

test("multi-world gate partitions produce the same world summaries as the sequential runner", async () => {
  const text = createTranslator("en");
  const sequential = await createLongRunGateFacts({
    seedPrefix: "phase75-partition-test",
    worldCount: 3,
    seasonCount: 1,
    text,
    language: "en",
    workerCount: 1,
  });
  const partitioned = await createLongRunGateFacts({
    seedPrefix: "phase75-partition-test",
    worldCount: 3,
    seasonCount: 1,
    text,
    language: "en",
    workerCount: 2,
  });

  assert.equal(partitioned.execution.mode, "parallel");
  assert.equal(partitioned.execution.workerCount, 2);
  assert.deepEqual(partitioned.worstWorlds, sequential.worstWorlds);
  assert.deepEqual(partitioned.productionWarningWorlds, sequential.productionWarningWorlds);
  assert.deepEqual(partitioned.dynastyWarningWorlds, sequential.dynastyWarningWorlds);
  assert.deepEqual(partitioned.tableSpreadWarningWorlds, sequential.tableSpreadWarningWorlds);
  assert.deepEqual(partitioned.warningCheckCounts, sequential.warningCheckCounts);
  assert.deepEqual(partitioned.failingCheckCounts, sequential.failingCheckCounts);
}, 180_000);

test("resumable gate reuses complete deterministic shards without changing aggregate results", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-checkpoints-"));
  const input = {
    seedPrefix: "phase78-resume-test",
    worldCount: 2,
    seasonCount: 1,
    language: "en" as const,
    checkpointDirectoryPath,
    shardCount: 2,
    workerCount: 1,
  };

  try {
    const first = await createResumableLongRunGateFacts(input);
    const resumed = await createResumableLongRunGateFacts(input);
    const { execution: firstExecution, ...firstAggregate } = first;
    const { execution: resumedExecution, ...resumedAggregate } = resumed;

    assert.equal(firstExecution.mode, "sharded");
    assert.equal(firstExecution.resumedShardCount, 0);
    assert.equal(firstExecution.resumedWorldCount, 0);
    assert.equal(firstExecution.simulatedWorldCount, 2);
    assert.equal(resumedExecution.mode, "sharded");
    assert.equal(resumedExecution.resumedShardCount, 2);
    assert.equal(resumedExecution.resumedWorldCount, 2);
    assert.equal(resumedExecution.simulatedWorldCount, 0);
    assert.deepEqual(resumedExecution.partitionHashes, firstExecution.partitionHashes);
    assert.deepEqual(resumedAggregate, firstAggregate);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 180_000);

test("resumable multi-world shards preserve the canonical sequential hash", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-multi-world-"));
  const text = createTranslator("en");

  try {
    const sequential = await createLongRunGateFacts({
      seedPrefix: "phase78-multi-world-hash-test",
      worldCount: 3,
      seasonCount: 1,
      text,
      language: "en",
      workerCount: 1,
    });
    const sharded = await createResumableLongRunGateFacts({
      seedPrefix: "phase78-multi-world-hash-test",
      worldCount: 3,
      seasonCount: 1,
      language: "en",
      checkpointDirectoryPath,
      shardCount: 1,
      workerCount: 2,
    });
    const { execution: sequentialExecution, ...sequentialAggregate } = sequential;
    const { execution: shardedExecution, ...shardedAggregate } = sharded;

    assert.deepEqual(shardedExecution.partitionHashes, sequentialExecution.partitionHashes);
    assert.deepEqual(shardedAggregate, sequentialAggregate);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 180_000);

test("resumable gates parallelize explicit shards without the small-sample threshold", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-parallel-"));
  const shardCount = 2;

  try {
    const report = await createResumableLongRunGateFacts({
      seedPrefix: "phase78-parallel-shard-test",
      worldCount: shardCount,
      seasonCount: 1,
      language: "en",
      checkpointDirectoryPath,
      shardCount,
    });
    const expectedWorkerCount = resolveLongRunGateWorkerCount({
      worldCount: shardCount,
    });

    assert.equal(report.execution.workerCount, expectedWorkerCount);
    assert.equal(report.execution.shardCount, shardCount);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("resumable gate rejects a corrupted shard instead of trusting partial evidence", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-corrupt-"));
  const input = {
    seedPrefix: "phase78-corrupt-test",
    worldCount: 1,
    seasonCount: 1,
    language: "en" as const,
    checkpointDirectoryPath,
    shardCount: 1,
    workerCount: 1,
  };

  try {
    await createResumableLongRunGateFacts(input);
    const [checkpointFilename] = await readdir(checkpointDirectoryPath);
    assert.notEqual(checkpointFilename, undefined);

    const checkpointPath = join(checkpointDirectoryPath, checkpointFilename!);
    const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8")) as Record<string, unknown>;
    checkpoint.schemaVersion = 1;
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateFacts(input),
      /checkpoint metadata or world range is invalid/,
    );

    checkpoint.schemaVersion = 2;
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateFacts(input),
      /checkpoint metadata or world range is invalid/,
    );

    checkpoint.schemaVersion = 3;
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateFacts(input),
      /checkpoint metadata or world range is invalid/,
    );

    checkpoint.schemaVersion = 4;
    const [checkpointWorld] = checkpoint.worlds as Record<string, unknown>[];
    assert.notEqual(checkpointWorld, undefined);
    checkpointWorld!.playerEconomyGates = [];
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateFacts(input),
      /checkpoint metadata or world range is invalid/,
    );

    await rm(checkpointDirectoryPath, { recursive: true, force: true });
    await createResumableLongRunGateFacts(input);
    const refreshedCheckpoint = JSON.parse(
      await readFile(checkpointPath, "utf8"),
    ) as Record<string, unknown>;
    refreshedCheckpoint.summaryHash = "corrupt";
    await writeFile(checkpointPath, JSON.stringify(refreshedCheckpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateFacts(input),
      /checkpoint hash mismatch/,
    );
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("development cohort checkpoints are compact, deterministic, resumable, and strict", async () => {
  const checkpointDirectoryPath = await mkdtemp(
    join(tmpdir(), "the-long-season-development-cohort-"),
  );
  const input = {
    seedPrefix: "phase80a-development-checkpoint-test",
    worldCount: 1,
    seasonCount: 3 as const,
    language: "en" as const,
    checkpointDirectoryPath,
    workerCount: 1,
  };

  try {
    const fresh = await createResumablePlayerDevelopmentCohortFacts(input);
    const resumed = await createResumablePlayerDevelopmentCohortFacts(input);
    assert.equal(fresh.execution.resumedWorldCount, 0);
    assert.equal(fresh.execution.simulatedWorldCount, 1);
    assert.equal(resumed.execution.resumedWorldCount, 1);
    assert.equal(resumed.execution.simulatedWorldCount, 0);
    assert.deepEqual(
      resumed.execution.partitionHashes,
      fresh.execution.partitionHashes,
    );
    assert.equal(resumed.finalAggregateHash, fresh.finalAggregateHash);
    assert.deepEqual(resumed.aggregate, fresh.aggregate);
    assert.equal(fresh.aggregate.openingCheckpoint.observationCount > 0, true);
    assert.equal(fresh.aggregate.closingCheckpoint.observationCount > 0, true);
    assert.equal(
      fresh.aggregate.gates.find(({ key }) =>
        key === "positive_opportunity_evidence"
      )?.observationCount! > 0,
      true,
    );
    assert.equal(
      fresh.aggregate.gates.find(({ key }) =>
        key === "zero_minute_evidence"
      )?.observationCount! > 0,
      true,
    );

    const [checkpointFilename] = await readdir(checkpointDirectoryPath);
    assert.notEqual(checkpointFilename, undefined);
    const checkpointPath = join(
      checkpointDirectoryPath,
      checkpointFilename!,
    );
    const validCheckpoint = JSON.parse(
      await readFile(checkpointPath, "utf8"),
    ) as Record<string, unknown>;
    assert.equal(validCheckpoint.startIndex, 1);
    assert.equal(validCheckpoint.endIndex, 1);
    const firstWorld = validCheckpoint.world as
      PlayerDevelopmentCohortWorldSummary;
    const secondWorld: PlayerDevelopmentCohortWorldSummary = {
      ...structuredClone(firstWorld),
      worldId: `${input.seedPrefix}-world-00002`,
    };
    const execution = {
      ...fresh.execution,
      shardCount: 2,
      partitionHashes: ["first", "second"],
    } as const;
    const orderedReport = createPlayerDevelopmentCohortFactsFromWorlds({
      seedPrefix: input.seedPrefix,
      worldCount: 2,
      seasonCount: input.seasonCount,
      execution,
      worlds: [firstWorld, secondWorld],
    });
    const reversedReport = createPlayerDevelopmentCohortFactsFromWorlds({
      seedPrefix: input.seedPrefix,
      worldCount: 2,
      seasonCount: input.seasonCount,
      execution,
      worlds: [secondWorld, firstWorld],
    });
    assert.equal(
      reversedReport.finalAggregateHash,
      orderedReport.finalAggregateHash,
    );
    const foldedInput = {
      seedPrefix: input.seedPrefix,
      worldCount: 2,
      seasonCount: input.seasonCount,
      execution,
      aggregate: orderedReport.aggregate,
    } as const;
    assert.throws(
      () => createPlayerDevelopmentCohortFactsFromAggregate({
        ...foldedInput,
        anomalyCheckCounts: orderedReport.anomalyCheckCounts.slice(1),
      }),
      /anomaly counts are incomplete/,
    );
    const duplicateAnomalyCounts = [...orderedReport.anomalyCheckCounts];
    duplicateAnomalyCounts[duplicateAnomalyCounts.length - 1] =
      duplicateAnomalyCounts[0]!;
    assert.throws(
      () => createPlayerDevelopmentCohortFactsFromAggregate({
        ...foldedInput,
        anomalyCheckCounts: duplicateAnomalyCounts,
      }),
      /anomaly count is invalid/,
    );
    const zeroedAnomalyCounts = orderedReport.anomalyCheckCounts.map(
      (row, index) => index === 0
        ? {
            ...row,
            rawStatusCounts: { pass: 0, warn: 0, fail: 0 },
          }
        : row,
    );
    assert.throws(
      () => createPlayerDevelopmentCohortFactsFromAggregate({
        ...foldedInput,
        anomalyCheckCounts: zeroedAnomalyCounts,
      }),
      /anomaly count is invalid/,
    );

    for (const [field, value, pattern] of [
      ["schemaVersion", 3, /metadata or shape is invalid/],
      ["reportKind", "long-run-gate", /metadata or shape is invalid/],
      ["diagnosticContractVersion", "stale", /metadata or shape is invalid/],
      ["unexpectedField", true, /metadata or shape is invalid/],
      ["startIndex", 0, /metadata or shape is invalid/],
      ["endIndex", 2, /metadata or shape is invalid/],
      ["summaryHash", "corrupt", /checkpoint hash mismatch/],
    ] as const) {
      const corrupted = structuredClone(validCheckpoint);
      corrupted[field] = value;
      await writeFile(checkpointPath, JSON.stringify(corrupted), "utf8");
      await assert.rejects(
        createResumablePlayerDevelopmentCohortFacts(input),
        pattern,
      );
    }
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 180_000);

test("multi-world gates default to the repository seven-worker policy", () => {
  assert.equal(resolveLongRunGateWorkerCount({ worldCount: 50 }), 7);
  assert.equal(resolveLongRunGateWorkerCount({ worldCount: 3 }), 3);
  assert.equal(
    resolveLongRunGateWorkerCount({ worldCount: 50, workerCount: 12 }),
    7,
  );
});

test("cohort prospect-share gates add world evidence before applying the frozen band", () => {
  const passing = aggregatePlayerEconomyGateEvidence([
    [prospectShareEvidenceGate(10, 1)],
    [prospectShareEvidenceGate(10, 2)],
  ])[0];
  assert.equal(passing?.observationCount, 20);
  assert.equal(passing?.matchingObservationCount, 3);
  assert.equal(passing?.shareBasisPoints, 1_500);
  assert.equal(passing?.violationCount, 0);
  assert.equal(passing?.failedWorldCount, 0);

  const mixedDenominators = aggregatePlayerEconomyGateEvidence([
    [prospectShareEvidenceGate(0, 0)],
    [prospectShareEvidenceGate(10, 2)],
  ])[0];
  assert.equal(mixedDenominators?.observationCount, 10);
  assert.equal(mixedDenominators?.matchingObservationCount, 2);
  assert.equal(mixedDenominators?.shareBasisPoints, 2_000);
  assert.equal(mixedDenominators?.violationCount, 0);
  assert.equal(mixedDenominators?.failedWorldCount, 0);
  assert.equal(mixedDenominators?.notEvaluatedWorldCount, 1);

  const failing = aggregatePlayerEconomyGateEvidence([
    [prospectShareEvidenceGate(10, 1)],
    [prospectShareEvidenceGate(10, 1)],
  ])[0];
  assert.equal(failing?.observationCount, 20);
  assert.equal(failing?.matchingObservationCount, 2);
  assert.equal(failing?.shareBasisPoints, 1_000);
  assert.equal(failing?.violationCount, 1);
  assert.equal(failing?.failedWorldCount, 0);

  const empty = aggregatePlayerEconomyGateEvidence([
    [prospectShareEvidenceGate(0, 0)],
    [prospectShareEvidenceGate(0, 0)],
  ])[0];
  assert.equal(empty?.shareBasisPoints, undefined);
  assert.equal(empty?.violationCount, 1);
  assert.equal(empty?.failedWorldCount, 0);
  assert.equal(empty?.notEvaluatedWorldCount, 2);
});

test("player-economy aggregation rejects partial gate sets across worlds", () => {
  assert.throws(
    () => aggregatePlayerEconomyGateEvidence([
      [prospectShareEvidenceGate(10, 1)],
      [prospectShareEvidenceGate(10, 1), hardCapEvidenceGate(1, 0, 0)],
    ]),
    /Player-economy gate key-set mismatch in world 2/,
  );
});

test("global hard-cap rarity aggregates eligible evidence without hiding local collisions", () => {
  const mixed = aggregatePlayerEconomyGateEvidence([
    [hardCapEvidenceGate(1, 1, 0)],
    [hardCapEvidenceGate(1, 0, 0)],
  ])[0];
  assert.equal(mixed?.observationCount, 2);
  assert.equal(mixed?.matchingObservationCount, 1);
  assert.equal(mixed?.shareBasisPoints, 5_000);
  assert.equal(mixed?.violationCount, 0);

  const saturated = aggregatePlayerEconomyGateEvidence([
    [hardCapEvidenceGate(1, 1, 0)],
    [hardCapEvidenceGate(1, 1, 0)],
  ])[0];
  assert.equal(saturated?.shareBasisPoints, 10_000);
  assert.equal(saturated?.violationCount, 1);

  const collision = aggregatePlayerEconomyGateEvidence([
    [hardCapEvidenceGate(1, 0, 1)],
    [hardCapEvidenceGate(1, 0, 0)],
  ])[0];
  assert.equal(collision?.shareBasisPoints, 0);
  assert.equal(collision?.violationCount, 1);
  assert.equal(collision?.failedWorldCount, 1);
});

test("cohort replacement evidence requires one real completed vacancy", () => {
  const noVacancy = aggregatePlayerEconomyGateEvidence([
    [replacementMinimumEvidenceGate(0)],
    [replacementMinimumEvidenceGate(0)],
  ])[0];
  assert.equal(noVacancy?.observationCount, 2);
  assert.equal(noVacancy?.cohortEvidenceObservationCount, 0);
  assert.equal(noVacancy?.minimumCohortEvidenceObservationCount, 1);
  assert.equal(noVacancy?.violationCount, 1);
  assert.equal(noVacancy?.failedWorldCount, 0);

  const mixed = aggregatePlayerEconomyGateEvidence([
    [replacementMinimumEvidenceGate(0)],
    [replacementMinimumEvidenceGate(1)],
  ])[0];
  assert.equal(mixed?.observationCount, 2);
  assert.equal(mixed?.cohortEvidenceObservationCount, 1);
  assert.equal(mixed?.minimumCohortEvidenceObservationCount, 1);
  assert.equal(mixed?.violationCount, 0);
  assert.equal(mixed?.failedWorldCount, 0);
});

/** Builds one additive world sample for the First Division prospect band. */
function prospectShareEvidenceGate(
  observationCount: number,
  matchingObservationCount: number,
): PlayerGenerationEconomyGate {
  return {
    key: "young_stored_ceiling_prospect_share_first_division",
    status: observationCount === 0 ? "not_evaluated" : "pass",
    observationCount,
    violationCount: 0,
    threshold:
      "active senior age 15..20 with stored ceiling >=3.5: 1500..2500 basis points",
    examples: [],
    cohortShareEvidence: {
      matchingObservationCount,
      minimumBasisPoints: 1_500,
      maximumBasisPoints: 2_500,
    },
  };
}

/** Builds one additive world sample for the global hard-cap gate. */
function hardCapEvidenceGate(
  eligibleObservationCount: number,
  eligibleExactHardCapCount: number,
  structuralViolationCount: number,
): PlayerGenerationEconomyGate {
  return {
    key: "hard_cap_eligibility_and_display",
    status: structuralViolationCount > 0
      ? "fail"
      : eligibleObservationCount === 0 ? "not_evaluated" : "pass",
    observationCount: eligibleObservationCount,
    violationCount: structuralViolationCount,
    threshold:
      "positive cohort eligible population; zero ineligible exact/display collisions; eligible exact cap share <10000 basis points",
    examples: [],
    cohortShareEvidence: {
      matchingObservationCount: eligibleExactHardCapCount,
      minimumBasisPoints: 0,
      maximumBasisPoints: 9_999,
    },
  };
}

/** Builds one adjacent-transition sample for cohort-owned replacement evidence. */
function replacementMinimumEvidenceGate(
  completedReplacementCount: number,
): PlayerGenerationEconomyGate {
  return {
    key: "young_stored_ceiling_six_vacancy_replacement",
    status: "pass",
    observationCount: 1,
    violationCount: 0,
    threshold:
      "adjacent-season vacancies are replenished to the closing snapshot's deterministic target",
    examples: [],
    cohortMinimumEvidence: {
      evidenceObservationCount: completedReplacementCount,
      minimumObservationCount: 1,
    },
  };
}
