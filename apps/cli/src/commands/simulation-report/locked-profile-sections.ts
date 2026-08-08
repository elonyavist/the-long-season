import {
  calibrationV1SeasonCalibrationTargets,
  createFakeLeagueSystem,
  defaultSeasonCalibrationTargets,
  strictFailureSmokeTargets,
} from "@game/content";
import { createTranslator } from "@game/i18n";
import {
  createCalibrationReport,
  toSimulationReportJsonValue,
  type SimulationReportJsonValue,
} from "@game/simulation-tools";

import { createFakeSeasonInput } from "../fake-season-input.ts";
import {
  HARD_CAP_REACHABILITY_SEASON_COUNT,
  HARD_CAP_REACHABILITY_SEED_PREFIXES,
  HARD_CAP_REACHABILITY_WORKER_COUNT,
  HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX,
  createHardCapReachabilityProfileFacts,
} from "./hard-cap-reachability-profile.ts";
import {
  createSeasonRecapProfileFacts,
} from "./season-recap-profile.ts";
import {
  createSeasonRecapPartitions,
  runSeasonRecapWorkerThread,
} from "./season-recap-profile-world.ts";
import { resolveWorkspaceOutputPath } from "../workspace-output-path.ts";
import { createLiveMatchControlProfileFacts } from "./live-match-control-profile.ts";
import { longRunGateExitCode } from "./long-run-gate-status.ts";
import {
  createResumableLongRunGateFacts,
  createResumablePlayerDevelopmentCohortFacts,
} from "./long-run-profile-checkpoints.ts";

export const LOCKED_MIGRATION_PROFILE_IDS = [
  "balance-default-v1",
  "balance-calibration-v1",
  "balance-strict-fail-smoke-v1",
  "phase81-season-recap-20x5",
  "phase81-long-run-50x20",
  "phase80a-player-development-750x3",
  "phase81a-hard-cap-reachability",
  "phase77-live-match-control",
] as const;
export type LockedMigrationProfileId = typeof LOCKED_MIGRATION_PROFILE_IDS[number];

export interface LockedProfileExecutionFacts {
  readonly sections: Readonly<Record<string, SimulationReportJsonValue>>;
  readonly decision: "PASS" | "FAIL" | "NOT_EVALUATED";
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

/** Runs one frozen population through its existing canonical fact producers. */
export async function createLockedProfileFacts(
  profileId: LockedMigrationProfileId,
): Promise<LockedProfileExecutionFacts> {
  if (
    profileId === "balance-default-v1"
    || profileId === "balance-calibration-v1"
    || profileId === "balance-strict-fail-smoke-v1"
  ) return balanceFacts(profileId);
  if (profileId === "phase81-season-recap-20x5") return seasonRecapFacts();
  if (profileId === "phase81-long-run-50x20") return longRunFacts();
  if (profileId === "phase80a-player-development-750x3") return developmentFacts();
  if (profileId === "phase81a-hard-cap-reachability") return hardCapFacts();
  return liveMatchFacts();
}

function balanceFacts(
  profileId: Extract<LockedMigrationProfileId, `balance-${string}`>,
): LockedProfileExecutionFacts {
  const targetProfile = profileId === "balance-calibration-v1"
    ? "calibration-v1"
    : profileId === "balance-strict-fail-smoke-v1"
      ? "strict-fail-smoke"
      : "default";
  const seedPrefix = targetProfile === "calibration-v1"
    ? "test-balance"
    : targetProfile === "strict-fail-smoke"
      ? "strict-smoke"
      : "balance-demo";
  const seasonCount = targetProfile === "calibration-v1"
    ? 20
    : targetProfile === "strict-fail-smoke"
      ? 1
      : 5;
  const targets = targetProfile === "calibration-v1"
    ? calibrationV1SeasonCalibrationTargets
    : targetProfile === "strict-fail-smoke"
      ? strictFailureSmokeTargets
      : defaultSeasonCalibrationTargets;
  const league = createFakeLeagueSystem();
  const report = createCalibrationReport({
    seedPrefix,
    seasonCount,
    targets,
    createSeasonInput: (seed) => createFakeSeasonInput(league, seed),
  });
  const strict = targetProfile === "strict-fail-smoke";
  const canonicalReport = {
    ...report,
    metrics: report.metrics.map(({ target, ...metric }) => ({
      ...metric,
      ...(target === undefined ? {} : { target }),
    })),
  };
  return {
    sections: { economy: toSimulationReportJsonValue({ targetProfile, strict, report: canonicalReport }) },
    decision: strict && report.status === "fail" ? "FAIL" : "PASS",
    calibrationVersions: { balanceProfile: `${targetProfile}-v1` },
    worldSeeds: [seedPrefix],
  };
}

async function seasonRecapFacts(): Promise<LockedProfileExecutionFacts> {
  const worldCount = 20;
  const seasonCount = 5;
  const partitions = createSeasonRecapPartitions(worldCount, 7);
  const results = await Promise.all(partitions.map((partition) =>
    runSeasonRecapWorkerThread({
      reportKind: "season-recap",
      seedPrefix: "phase81-season-recap",
      seasonCount,
      language: "en",
      ...partition,
    })
  ));
  const ordered = results.toSorted(
    (left, right) => left.partition.startIndex - right.partition.startIndex,
  );
  const worlds = ordered.flatMap(({ worlds: rows }) => rows);
  const report = createSeasonRecapProfileFacts({
    seedPrefix: "phase81-season-recap",
    seasonCount,
    worlds,
    failures: ordered.flatMap(({ failures }) => failures),
  });
  return {
    sections: {
      season: toSimulationReportJsonValue({ population: report.population, checks: report.checks }),
      standings: toSimulationReportJsonValue({ worlds: worlds.map(({ seed, seasons }) => ({
        seed,
        seasons: seasons.map(({ seasonNumber, recap }) => ({ seasonNumber, rows: recap.table })),
      })) }),
      players: toSimulationReportJsonValue({ worlds: worlds.map(({ seed, seasons }) => ({
        seed,
        seasons: seasons.map(({ seasonNumber, recap }) => ({
          seasonNumber,
          topScorers: recap.topScorers,
          topAssists: recap.topAssists,
        })),
      })) }),
      formations: toSimulationReportJsonValue({ shapes: report.shapes }),
      anomalies: toSimulationReportJsonValue({ failedCheckKeys: report.failedCheckKeys }),
    },
    decision: report.failedCheckKeys.length === 0 ? "PASS" : "FAIL",
    calibrationVersions: { seasonRecapBands: "phase81-a10-v1" },
    worldSeeds: worlds.map(({ seed }) => seed),
  };
}

async function longRunFacts(): Promise<LockedProfileExecutionFacts> {
  const checkpointDirectoryPath = await resolveWorkspaceOutputPath(
    "saves/long-run-checkpoints/phase81-tactical-shape-50x20",
  );
  const report = await createResumableLongRunGateFacts({
    seedPrefix: "phase81-tactical-shape-50x20",
    worldCount: 50,
    seasonCount: 20,
    language: "en",
    checkpointDirectoryPath,
    shardCount: 50,
    workerCount: 7,
  });
  return {
    sections: {
      anomalies: toSimulationReportJsonValue(report),
      economy: toSimulationReportJsonValue({
        playerEconomyGates: report.playerEconomyGates,
        playerMarketCalibration: report.closingPlayerMarketCalibration,
      }),
    },
    decision: longRunGateExitCode(report.status) === 0 ? "PASS" : "FAIL",
    calibrationVersions: { longRunDiagnostic: "long-run-gate-v1" },
    worldSeeds: Array.from(
      { length: 50 },
      (_unused, index) => `phase81-tactical-shape-50x20-world-${String(index + 1).padStart(5, "0")}`,
    ),
  };
}

async function developmentFacts(): Promise<LockedProfileExecutionFacts> {
  const report = await createResumablePlayerDevelopmentCohortFacts({
    seedPrefix: "phase80a-player-development-750x3-v1",
    worldCount: 750,
    seasonCount: 3,
    language: "en",
    checkpointDirectoryPath: await resolveWorkspaceOutputPath(
      "saves/long-run-checkpoints/phase80a-player-development-750x3-v1",
    ),
    workerCount: 7,
  });
  return {
    sections: { development: toSimulationReportJsonValue(report) },
    decision: report.status === "pass" ? "PASS" : "FAIL",
    calibrationVersions: { playerDevelopmentCohort: report.diagnosticContractVersion },
    worldSeeds: Array.from(
      { length: 750 },
      (_unused, index) => `phase80a-player-development-750x3-v1-world-${String(index + 1).padStart(5, "0")}`,
    ),
  };
}

async function hardCapFacts(): Promise<LockedProfileExecutionFacts> {
  const report = await createHardCapReachabilityProfileFacts(() => undefined);
  return {
    sections: { economy: toSimulationReportJsonValue(report) },
    decision: report.outcome === "RECONCILIATION_FAILED" ? "FAIL" : "PASS",
    calibrationVersions: { hardCapProbe: "phase81a-preregistered-v1" },
    worldSeeds: report.worlds.map(({ worldSeed }) => worldSeed),
  };
}

function liveMatchFacts(): LockedProfileExecutionFacts {
  const report = createLiveMatchControlProfileFacts();
  return {
    sections: { anomalies: toSimulationReportJsonValue(report) },
    decision: report.status === "pass" ? "PASS" : "FAIL",
    calibrationVersions: { liveMatchControl: "phase77-v1" },
    worldSeeds: report.worlds.map(({ worldSeed }) => worldSeed),
  };
}

/** Frozen profile measurement requests are exposed without executing them. */
export const LOCKED_PROFILE_MEASUREMENTS = {
  "balance-default-v1": measurement(1, 5, ["economy"], "balance-demo", 1),
  "balance-calibration-v1": measurement(1, 20, ["economy"], "test-balance", 1),
  "balance-strict-fail-smoke-v1": measurement(1, 1, ["economy"], "strict-smoke", 1),
  "phase81-season-recap-20x5": measurement(20, 5, ["season", "standings", "players", "formations", "anomalies"], "phase81-season-recap", 7),
  "phase81-long-run-50x20": measurement(50, 20, ["economy", "anomalies"], "phase81-tactical-shape-50x20", 7),
  "phase80a-player-development-750x3": measurement(750, 3, ["development"], "phase80a-player-development-750x3-v1", 7),
  "phase81a-hard-cap-reachability": measurement(
    HARD_CAP_REACHABILITY_SEED_PREFIXES.length * HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX,
    HARD_CAP_REACHABILITY_SEASON_COUNT,
    ["economy"],
    "phase81a-hard-cap-preregistered",
    HARD_CAP_REACHABILITY_WORKER_COUNT,
  ),
  "phase77-live-match-control": measurement(50, 1, ["anomalies"], "phase77-live-match-control", 7),
} as const;

function measurement(
  worldCount: number,
  seasonCount: number,
  includedSectionIds: readonly string[],
  seedPrefix: string,
  workerCount: number,
) {
  return {
    mode: "profile" as const,
    profileId: null,
    worldCount,
    seasonCount,
    includedSectionIds,
    detail: "diagnostic" as const,
    seedPrefix,
    workerCount,
  };
}
