import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createFakeDomesticWorld,
  selectPlayerValuationConfig,
} from "@game/content";
import { completedPlayerAge } from "@game/engine";
import { createTranslator } from "@game/i18n";
import { fromISO, toISO } from "@game/shared";
import {
  type PlayerGenerationEconomyGate,
  type PlayerDevelopmentCohortWorldSummary,
} from "@game/simulation-tools";
import { test } from "vitest";

import {
  DEFAULT_TEN_SEASON_REPORT_SEED,
  runTenSeasonReportCommand,
} from "./ten-season-report.ts";
import {
  createResumableLongRunGateReport,
  createResumablePlayerDevelopmentCohortReport,
} from "./ten-season-report/gate-checkpoint.ts";
import {
  aggregatePlayerEconomyGateEvidence,
  createPlayerDevelopmentCohortReportFromAggregate,
  createPlayerDevelopmentCohortReportFromWorlds,
  createPhase80APotentialOutcomeCalibration,
  createLongRunGateReport,
  createSingleWorldReport,
  hashPhase79CComposition,
  phase80APotentialOutcomeMonthKeys,
  resolveLongRunGateWorkerCount,
  seasonStartYearAtDate,
  transferNegotiationEventDate,
} from "./ten-season-report/report-data.ts";
import {
  formatPlayerDevelopmentCohortReportMarkdown,
  formatPlayerDevelopmentCohortReportOutput,
} from "./ten-season-report/gate-output.ts";

/**
 * Runs the real default ten-season composition rather than a reduced fixture.
 * The timeout is an execution budget for the expanded 54-club world and does
 * not change the default arguments or any report assertion.
 */
test("ten-season-report uses deterministic default arguments", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand([], io);

  assert.equal(exitCode, 0);
  assert.equal(io.stderrLines.length, 0);
  assert.equal(io.stdoutLines.includes(`Seed: ${DEFAULT_TEN_SEASON_REPORT_SEED}`), true);
  assert.equal(io.stdoutLines.includes("Seasons: 10"), true);
  assert.equal(countSeasonSummaryRows(io.stdoutLines), 10);
  assert.equal(
    io.stdoutLines.some((line) => line.includes("last_pts=") && line.includes("table_spread=") && line.includes("draw_rate=")),
    true,
  );
  assert.equal(io.stdoutLines.includes("Player evolution:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Current ability avg:"), true);
  assert.equal(io.stdoutLines.includes("Production leaders:"), true);
  assert.equal(io.stdoutLines.some((line) => line.includes("Top creator=") && line.includes("creator_club=")), true);
  assert.equal(io.stdoutLines.includes("Strength hierarchy:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Initial ability spread:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Final ability spread:"), true);
  assert.equal(io.stdoutLines.includes("Club stability:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Unique champions:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Transfer turnover: enabled"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Squad turnover: enabled"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Player exits:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Exit reasons:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Squad size min/avg/max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Clubs below minimum squad size:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Clubs without natural goalkeeper:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Youth academy stability:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Active players senior/youth/total:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Active players min/max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth roster min/avg/max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth intake:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth exits:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Youth promotions:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Clubs above youth target:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Youth checks:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Contract and finance stability:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Annual wage utilization max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  Contract lifecycle:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "Anomaly scoring:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  top_assist_max:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  clubs_below_minimum_squad_size:"), true);
  assert.equal(hasLineStartingWith(io.stdoutLines, "  youth_roster_max_size:"), true);
}, 600_000);

// Runs two full 2-season simulations back to back; the default 5s test timeout
// is too tight for this heavy determinism check under concurrent suite load.
// These gate tests now also advance the AI transfer market (the report harness
// threads real transfer windows), which roughly doubles their cost, so the
// budgets below stay generous enough to survive a loaded `pnpm check` run.
test("same seed and season count produce the same report output", async () => {
  const first = captureIo();
  const second = captureIo();
  const args = ["--seed=world-a", "--seasons=2"];

  assert.equal(await runTenSeasonReportCommand(args, first), 0);
  assert.equal(await runTenSeasonReportCommand(args, second), 0);
  assert.deepEqual(first.stdoutLines, second.stdoutLines);
}, 90_000);

test("ten-season-report respects explicit season count", async () => {
  const io = captureIo();

  assert.equal(await runTenSeasonReportCommand(["--seed=world-b", "--seasons=3"], io), 0);
  assert.equal(io.stdoutLines.includes("Seasons: 3"), true);
  assert.equal(countSeasonSummaryRows(io.stdoutLines), 3);
  assert.equal(io.stdoutLines.some((line) => line.includes("world-b-season-003")), true);
}, 90_000);

test("ten-season-report keeps role-weighted player quality diagnostics deterministic", async () => {
  const io = captureIo();

  assert.equal(await runTenSeasonReportCommand(["--seed=world-a", "--seasons=1"], io), 0);
  assert.equal(io.stdoutLines.includes("  Current ability avg: 9.28 -> 9.21"), true);
  assert.equal(
    io.stdoutLines.includes("  Initial ability spread: spread=5.57 top=Virtus Turin:13.30 bottom=U.S. Ravenna:7.73"),
    true,
  );
  assert.equal(
    io.stdoutLines.includes("  Final ability spread: spread=5.21 top=Virtus Palermo:12.94 bottom=U.S. Ravenna:7.73"),
    true,
  );
}, 30_000);

test("ten-season-report writes deterministic non-vacuous reports for an underpowered multi-world sample", async () => {
  const directoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-"));

  try {
    const first = captureIo();
    const second = captureIo();
    const reportPath = join(directoryPath, "gate.md");
    const args = ["--seed-prefix=phase31-test", "--worlds=2", "--seasons=2", `--report-output=${reportPath}`];

    const firstExitCode = await runTenSeasonReportCommand(args, first);
    const firstReport = await readFile(reportPath, "utf8");
    const secondExitCode = await runTenSeasonReportCommand(args, second);
    const secondReport = await readFile(reportPath, "utf8");

    // Two worlds deliberately cannot prove the cohort-level economy bands.
    // The command must stay deterministic and fail honestly instead of turning
    // a small denominator into a false green gate.
    assert.equal(firstExitCode, 1);
    assert.equal(secondExitCode, 1);
    assert.deepEqual(first.stdoutLines, second.stdoutLines);
    assert.equal(firstReport, secondReport);
    assert.equal(first.stdoutLines.includes("The Long Season long-run gate report"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Worlds: 2"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Table spread avg/min:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Draw rate avg/max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Champion streak max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Production warning max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Youth roster max observed:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Active players min/max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Clubs above youth target:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Contract/finance structural violations:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Annual wage utilization max:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Contract lifecycle:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Execution:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Warning check counts:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Player-economy gate violations:"), true);
    assert.equal(first.stdoutLines.includes("Status: FAIL"), true);
    assert.equal(
      first.stdoutLines.some((line) =>
        line.startsWith("Player economy hard_cap_eligibility_and_display:")
        && line.includes("observations=2")
        && line.includes("violations=0")
        && line.includes("matching=1")
        && line.includes("share_bps=5000")
      ),
      true,
    );
    for (const stockGate of [
      "young_stored_ceiling_six_active_stock",
      "young_stored_ceiling_six_stock_arrival_category_placement",
      "young_stored_ceiling_six_stock_arrival_club_uniqueness",
      "young_stored_ceiling_six_no_inflation",
    ]) {
      assert.equal(
        first.stdoutLines.some((line) =>
          line.startsWith(`Player economy ${stockGate}:`)
          && line.includes("violations=0")
        ),
        true,
      );
    }
    const vacancyReplacementLine = first.stdoutLines.find((line) =>
      line.startsWith(
        "Player economy young_stored_ceiling_six_vacancy_replacement:",
      )
    );
    assert.notEqual(vacancyReplacementLine, undefined);
    assert.match(vacancyReplacementLine!, /violations=0/);
    assert.match(vacancyReplacementLine!, /cohort_evidence=[1-9][0-9]*/);
    assert.match(vacancyReplacementLine!, /cohort_minimum=1/);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Closing division value fit:"), true);
    const closingValueLine = first.stdoutLines.find((line) =>
      line.startsWith("Closing division value fit:")
    );
    assert.match(closingValueLine ?? "", /season_start_year=[1-9][0-9]*/);
    assert.match(closingValueLine ?? "", /observations=[1-9][0-9]*/);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Year-10 rating stock observations:"), true);
    assert.equal(
      first.stdoutLines.includes(
        "Year-10 six-star max: current=n/a stored_ceiling=n/a lower_tier_stored_ceiling=n/a",
      ),
      true,
    );
    assert.equal(
      first.stdoutLines.some((line) =>
        line.startsWith("Player economy public_potential_range_ordering:")
        && line.includes("observations=")
        && line.includes("matching=")
        && line.includes("cohort_minimum=")
      ),
      true,
    );
    const playerEconomyLines = first.stdoutLines.filter((line) =>
      line.startsWith("Player economy ")
    );
    assert.equal(playerEconomyLines.length > 0, true);
    assert.equal(
      playerEconomyLines.every((line) =>
        /observations=[1-9][0-9]*/.test(line)
      ),
      true,
    );
    assert.equal(hasLineStartingWith(first.stdoutLines, "Composition hashes:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Permanent public values:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Free-agent non-zero completed fees:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Signal check counts:"), true);
    assert.equal(hasLineStartingWith(first.stdoutLines, "Failing check counts:"), true);
    assert.equal(first.stdoutLines.some((line) => line.includes("creator_snapshot=season:")), true);
    assert.equal(
      first.stdoutLines.some(
        (line) => line.includes("table_spread=avg:") && line.includes("ability_spread:") && line.includes("draw_rate=avg:"),
      ),
      true,
    );
    assert.equal(firstReport.includes("Worlds: 2"), true);
    assert.equal(firstReport.includes("Status: FAIL"), true);
    assert.equal(firstReport.includes("Table spread average:"), true);
    assert.equal(firstReport.includes("Draw rate average:"), true);
    assert.equal(firstReport.includes("Champion streak max observed:"), true);
    assert.equal(firstReport.includes("Production warning max:"), true);
    assert.equal(firstReport.includes("Production Warning Snapshots"), true);
    assert.equal(firstReport.includes("Dynasty Warning Snapshots"), true);
    assert.equal(firstReport.includes("Table Spread Warning Snapshots"), true);
    assert.equal(firstReport.includes("Youth roster max observed:"), true);
    assert.equal(firstReport.includes("Active player count min/max:"), true);
    assert.equal(firstReport.includes("Contract/finance structural violations:"), true);
    assert.equal(firstReport.includes("Maximum annual wage utilization:"), true);
    assert.equal(firstReport.includes("Contract lifecycle:"), true);
    assert.equal(firstReport.includes("Execution:"), true);
    assert.equal(firstReport.includes("Warning check counts:"), true);
    assert.equal(firstReport.includes("Player Economy Non-Vacuous Gates"), true);
    assert.equal(firstReport.includes("Closing Checkpoint Division Public Values"), true);
    assert.equal(firstReport.includes("Date: 2026-08-01"), true);
    assert.equal(firstReport.includes("nvm use 24"), true);
    assert.equal(firstReport.includes("Phase 79C Version And Replay Evidence"), true);
    assert.equal(firstReport.includes("Phase 79C Closing Division Economy"), true);
    assert.equal(firstReport.includes("Year-10 Exceptional Stock Locations"), true);
    assert.equal(firstReport.includes("Free-agent non-zero completed fees: 0"), true);
    assert.equal(firstReport.includes("Signal check counts:"), true);
    assert.equal(firstReport.includes("Warn checks"), true);
    assert.equal(firstReport.includes("Creator snapshot"), true);
    assert.equal(firstReport.includes("Table spread snapshot"), true);
    assert.equal(firstReport.includes(`--report-output=${reportPath}`), true);
    assert.equal(firstReport.includes("phase31-test-world-00001"), true);
  } finally {
    await rm(directoryPath, { recursive: true, force: true });
  }
}, 180_000);

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
  assert.equal(baseline.audit.abovePublicUpperCount, 65);
  assert.equal(baseline.audit.abovePublicUpperRateBasisPoints, 401);
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
}, 30_000);

test("Phase 80A canonical rollover wires full stock and non-vacuous replacement gates", () => {
  const representedClubs = new Set<string>();
  const observedPlayersByClub = new Map<string, Set<string>>();
  const positivePlayersByClub = new Map<string, Set<string>>();
  const report = createSingleWorldReport(
    "phase80a-replacement-29",
    2,
    createTranslator("en"),
    (seasonNumber, rows, careerState) => {
      if (seasonNumber !== 1) return;
      const ownerClubIdByPlayerId = new Map(
        careerState.gameState.clubIds.flatMap((clubId) => {
          const club = careerState.gameState.clubs[clubId];
          return club?.playerIds.map((playerId) => [playerId, clubId] as const)
            ?? [];
        }),
      );
      for (const row of rows) {
        const ownerClubId = ownerClubIdByPlayerId.get(row.playerId);
        assert.notEqual(ownerClubId, undefined);
        const observedPlayers = observedPlayersByClub.get(String(ownerClubId))
          ?? new Set<string>();
        observedPlayers.add(row.playerId);
        observedPlayersByClub.set(String(ownerClubId), observedPlayers);
        for (const [clubId, minutes] of Object.entries(row.clubMinutes)) {
          representedClubs.add(clubId);
          const canonicalClubId = careerState.gameState.clubIds.find(
            (candidate) => String(candidate) === clubId,
          );
          const representedClub = canonicalClubId === undefined
            ? undefined
            : careerState.gameState.clubs[canonicalClubId];
          assert.equal(representedClub?.playerIds.includes(row.playerId), true);
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
  assert.equal(annualIntakeAudit.allocatedStoredCeilingSixCount, 1);
  assert.equal(annualIntakeAudit.generatedStoredCeilingSixCount, 1);
  assert.equal(annualIntakeAudit.acceptedStoredCeilingSixCount, 1);
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
  assert.equal(stock.requiredReplacementObservationCount, 1);
  assert.equal(stock.completedReplacementCount, 1);
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
}, 90_000);

test("multi-world gate partitions produce the same world summaries as the sequential runner", async () => {
  const text = createTranslator("en");
  const sequential = await createLongRunGateReport({
    seedPrefix: "phase75-partition-test",
    worldCount: 3,
    seasonCount: 1,
    text,
    language: "en",
    workerCount: 1,
  });
  const partitioned = await createLongRunGateReport({
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
    const first = await createResumableLongRunGateReport(input);
    const resumed = await createResumableLongRunGateReport(input);
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
    const sequential = await createLongRunGateReport({
      seedPrefix: "phase78-multi-world-hash-test",
      worldCount: 3,
      seasonCount: 1,
      text,
      language: "en",
      workerCount: 1,
    });
    const sharded = await createResumableLongRunGateReport({
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
    const report = await createResumableLongRunGateReport({
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
    await createResumableLongRunGateReport(input);
    const [checkpointFilename] = await readdir(checkpointDirectoryPath);
    assert.notEqual(checkpointFilename, undefined);

    const checkpointPath = join(checkpointDirectoryPath, checkpointFilename!);
    const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8")) as Record<string, unknown>;
    checkpoint.schemaVersion = 1;
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateReport(input),
      /checkpoint metadata or world range is invalid/,
    );

    checkpoint.schemaVersion = 2;
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateReport(input),
      /checkpoint metadata or world range is invalid/,
    );

    checkpoint.schemaVersion = 3;
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateReport(input),
      /checkpoint metadata or world range is invalid/,
    );

    checkpoint.schemaVersion = 4;
    const [checkpointWorld] = checkpoint.worlds as Record<string, unknown>[];
    assert.notEqual(checkpointWorld, undefined);
    checkpointWorld!.playerEconomyGates = [];
    await writeFile(checkpointPath, JSON.stringify(checkpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateReport(input),
      /checkpoint metadata or world range is invalid/,
    );

    await rm(checkpointDirectoryPath, { recursive: true, force: true });
    await createResumableLongRunGateReport(input);
    const refreshedCheckpoint = JSON.parse(
      await readFile(checkpointPath, "utf8"),
    ) as Record<string, unknown>;
    refreshedCheckpoint.summaryHash = "corrupt";
    await writeFile(checkpointPath, JSON.stringify(refreshedCheckpoint), "utf8");

    await assert.rejects(
      createResumableLongRunGateReport(input),
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
    const fresh = await createResumablePlayerDevelopmentCohortReport(input);
    const resumed = await createResumablePlayerDevelopmentCohortReport(input);
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
    const orderedReport = createPlayerDevelopmentCohortReportFromWorlds({
      seedPrefix: input.seedPrefix,
      worldCount: 2,
      seasonCount: input.seasonCount,
      execution,
      worlds: [firstWorld, secondWorld],
    });
    const reversedReport = createPlayerDevelopmentCohortReportFromWorlds({
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
      () => createPlayerDevelopmentCohortReportFromAggregate({
        ...foldedInput,
        anomalyCheckCounts: orderedReport.anomalyCheckCounts.slice(1),
      }),
      /anomaly counts are incomplete/,
    );
    const duplicateAnomalyCounts = [...orderedReport.anomalyCheckCounts];
    duplicateAnomalyCounts[duplicateAnomalyCounts.length - 1] =
      duplicateAnomalyCounts[0]!;
    assert.throws(
      () => createPlayerDevelopmentCohortReportFromAggregate({
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
      () => createPlayerDevelopmentCohortReportFromAggregate({
        ...foldedInput,
        anomalyCheckCounts: zeroedAnomalyCounts,
      }),
      /anomaly count is invalid/,
    );

    const terminalOutput = formatPlayerDevelopmentCohortReportOutput(
      fresh,
      "artifacts/cohort.md",
    );
    const markdownOutput = formatPlayerDevelopmentCohortReportMarkdown(
      fresh,
      "artifacts/cohort.md",
    );
    assert.equal(
      terminalOutput.includes(
        `Final aggregate hash: ${fresh.finalAggregateHash}`,
      ),
      true,
    );
    assert.equal(
      markdownOutput.includes(
        `Final aggregate hash: \`${fresh.finalAggregateHash}\``,
      ),
      true,
    );
    const resumedTerminalOutput = formatPlayerDevelopmentCohortReportOutput(
      resumed,
      "artifacts/cohort-resumed.md",
    );
    assert.equal(
      terminalOutput.find((line) => line.startsWith("Ordered shard hashes:")),
      resumedTerminalOutput.find((line) =>
        line.startsWith("Ordered shard hashes:")
      ),
    );
    assert.match(markdownOutput, /--shards=1/);
    assert.match(markdownOutput, /\| opening \|/);
    assert.match(markdownOutput, /\| closing \|/);
    assert.match(markdownOutput, /## New Entrants At Closing/);
    assert.match(markdownOutput, /Failed worlds \| Not evaluated worlds/);
    assert.equal(
      terminalOutput.some((line) =>
        line.startsWith("Development gate ")
        && line.includes("failed_worlds=")
        && line.includes("not_evaluated_worlds=")
      ),
      true,
    );
    assert.match(markdownOutput, /Below-one-star plateau/);
    assert.match(markdownOutput, /Room realization buckets/);
    assert.match(markdownOutput, /Exact stored-upper/);
    assert.match(markdownOutput, /Stored-upper star gap/);
    assert.match(markdownOutput, /## Structural Violation Examples/);
    assert.match(markdownOutput, /not_evaluated/);
    assert.doesNotMatch(
      markdownOutput,
      /omitted combinations remain explicitly `not_evaluated`/,
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
        createResumablePlayerDevelopmentCohortReport(input),
        pattern,
      );
    }
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 180_000);

test("ten-season-report wires an explicit worker limit into resumable gates", async () => {
  const checkpointDirectoryPath = await mkdtemp(join(tmpdir(), "the-long-season-gate-workers-"));
  const io = captureIo();

  try {
    await runTenSeasonReportCommand([
      "--seed-prefix=phase78-worker-cli-test",
      "--worlds=1",
      "--seasons=1",
      `--checkpoint-dir=${checkpointDirectoryPath}`,
      "--shards=1",
      "--workers=1",
    ], io);

    assert.equal(io.stderrLines.length, 0);
    assert.equal(io.stdoutLines.some((line) => line.includes("Execution: sharded; workers=1")), true);
  } finally {
    await rm(checkpointDirectoryPath, { recursive: true, force: true });
  }
}, 60_000);

test("ten-season-report exits nonzero on invalid season count", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--seasons=0"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--seasons requires a positive integer: 0");
});

test("ten-season-report exits nonzero on invalid world count", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--worlds=0"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--worlds requires a positive integer: 0");
});

test("ten-season-report rejects an invalid worker count", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--workers=0"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--workers requires a positive integer: 0");
});

test("player-development cohort CLI rejects every exploratory contract variant", async () => {
  const cases = [
    ["--report-kind=unknown"],
    ["--report-kind=player-development-cohort"],
    [
      "--report-kind=player-development-cohort",
      "--seed-prefix=phase80a-player-development-750x3-v1",
      "--worlds=749",
      "--seasons=3",
    ],
  ] as const;

  for (const args of cases) {
    const io = captureIo();
    const exitCode = await runTenSeasonReportCommand(args, io);
    assert.equal(exitCode, 1);
    assert.equal(io.stdoutLines.length, 0);
    assert.equal(io.stderrLines.length > 0, true);
  }
});

test("ten-season-report requires checkpoints for an explicit worker limit", async () => {
  const io = captureIo();
  const exitCode = await runTenSeasonReportCommand(["--worlds=1", "--workers=1"], io);

  assert.equal(exitCode, 1);
  assert.equal(io.stdoutLines.length, 0);
  assert.equal(io.stderrLines[0], "--workers requires --checkpoint-dir");
});

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

/**
 * Creates an IO adapter that records written lines for assertions.
 */
function captureIo() {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];

  return {
    stdoutLines,
    stderrLines,
    stdout: (line: string) => {
      stdoutLines.push(line);
    },
    stderr: (line: string) => {
      stderrLines.push(line);
    },
  };
}

/**
 * Counts numbered season summary rows in the command output.
 */
function countSeasonSummaryRows(lines: readonly string[]): number {
  return lines.filter((line) => /^  [0-9]+\. .*-season-[0-9]{3}/.test(line)).length;
}

/**
 * Checks whether any output line starts with a prefix.
 */
function hasLineStartingWith(lines: readonly string[], prefix: string): boolean {
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}
