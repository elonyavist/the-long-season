import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

import { createTranslator } from "@game/i18n";
import {
  completedPlayerAge,
  type FormationKey,
  type SimulateSeasonResult,
} from "@game/engine";
import { toISO } from "@game/shared";
import {
  toSimulationReportJsonValue,
  type SimulationReportDetail,
  type SimulationReportJsonValue,
} from "@game/simulation-tools";

import type { CliCareerState } from "../career/types.ts";
import {
  createCareerWorldFacts,
  type CareerWorldFacts,
} from "./career-world-facts.ts";

/** Career modules sharing one world execution. */
export const CAREER_SECTION_IDS = [
  "season",
  "standings",
  "players",
  "transfers",
  "formations",
  "economy",
  "development",
  "anomalies",
] as const;
export type CareerSectionId = typeof CAREER_SECTION_IDS[number];

export interface CareerSectionsExecutionFacts {
  readonly sections: Readonly<Partial<Record<CareerSectionId, SimulationReportJsonValue>>>;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly worldSeeds: readonly string[];
}

interface CareerWorldProjection {
  readonly seed: string;
  readonly sections: Readonly<Partial<Record<CareerSectionId, unknown>>>;
  readonly calibrationVersions: Readonly<Record<string, string>>;
}

interface ObservedSeason {
  readonly seasonNumber: number;
  readonly seasonSeed: string;
  readonly standings?: unknown;
  readonly players?: unknown;
  readonly formations?: unknown;
}

interface ObservedTransfer {
  readonly seasonNumber: number;
  readonly entry: CliCareerState["transferHistory"][number];
}

/**
 * Executes each requested world exactly once and appends only requested facts.
 *
 * Worker completion order cannot affect the artifact: batches preserve input
 * order, and each world carries the seed that generated it.
 */
export async function createCareerSectionsFacts(input: {
  readonly worldSeeds: readonly string[];
  readonly seasonCount: number;
  readonly workerCount: number;
  readonly detail: SimulationReportDetail;
  readonly sectionIds: readonly CareerSectionId[];
}): Promise<CareerSectionsExecutionFacts> {
  const worlds: CareerWorldProjection[] = [];
  for (let start = 0; start < input.worldSeeds.length; start += input.workerCount) {
    worlds.push(...await Promise.all(
      input.worldSeeds.slice(start, start + input.workerCount).map((seed) =>
        input.workerCount === 1
          ? Promise.resolve(createCareerWorldProjection({ ...input, seed }))
          : runCareerSectionsWorker({ ...input, seed })
      ),
    ));
  }
  const first = worlds[0];
  if (first === undefined) throw new Error("Career report needs at least one world");

  const sections: Partial<Record<CareerSectionId, SimulationReportJsonValue>> = {};
  for (const sectionId of input.sectionIds) {
    sections[sectionId] = asJsonValue({
      worlds: worlds.map((world) => {
        const section = world.sections[sectionId];
        if (section === undefined) {
          throw new Error(`Career world ${world.seed} omitted requested section ${sectionId}`);
        }
        return section;
      }),
    });
  }

  return {
    sections,
    calibrationVersions: first.calibrationVersions,
    worldSeeds: worlds.map(({ seed }) => seed),
  };
}

function createCareerWorldProjection(input: {
  readonly seed: string;
  readonly seasonCount: number;
  readonly detail: SimulationReportDetail;
  readonly sectionIds: readonly CareerSectionId[];
}): CareerWorldProjection {
  const requested = new Set(input.sectionIds);
  const observedSeasons: ObservedSeason[] = [];
  const names = new Map<string, string>();
  const transfers: ObservedTransfer[] = [];

  const report = createCareerWorldFacts(
    input.seed,
    input.seasonCount,
    createTranslator("en"),
    undefined,
    (careerState) => rememberPlayerNames(careerState, names),
    {
      selectCatalogFormation: true,
      observeSeasonResult: ({ seasonNumber, seasonSeed, result, careerState }) => {
        rememberPlayerNames(careerState, names);
        observedSeasons.push({
          seasonNumber,
          seasonSeed,
          ...(requested.has("standings")
            ? { standings: standingsProjection(result, careerState, seasonNumber, seasonSeed) }
            : {}),
          ...(requested.has("players")
            ? { players: playerProjection(result, careerState, seasonNumber, seasonSeed, input.detail) }
            : {}),
          ...(requested.has("formations")
            ? { formations: formationProjection(result, careerState, seasonNumber, seasonSeed) }
            : {}),
        });
      },
      observeSeasonBoundary: ({ seasonNumber, previousCareerState, careerState }) => {
        rememberPlayerNames(previousCareerState, names);
        rememberPlayerNames(careerState, names);
        const previousSequence = previousCareerState.transferHistory.at(-1)?.sequenceNumber ?? 0;
        for (const entry of careerState.transferHistory) {
          if (entry.sequenceNumber > previousSequence) transfers.push({ seasonNumber, entry });
        }
      },
    },
  );
  rememberPlayerNames(report.finalCareerState, names);

  const sections: Partial<Record<CareerSectionId, unknown>> = {};
  if (requested.has("season")) sections.season = seasonProjection(report);
  if (requested.has("standings")) {
    sections.standings = { seed: input.seed, seasons: observedSeasons.map(required("standings")) };
  }
  if (requested.has("players")) {
    sections.players = { seed: input.seed, seasons: observedSeasons.map(required("players")) };
  }
  if (requested.has("formations")) {
    sections.formations = { seed: input.seed, seasons: observedSeasons.map(required("formations")) };
  }
  if (requested.has("transfers")) {
    sections.transfers = transferProjection(report, transfers, names, input.detail);
  }
  if (requested.has("economy")) {
    sections.economy = economyProjection(report, input.detail);
  }
  if (requested.has("development")) {
    sections.development = developmentProjection(report, input.detail);
  }
  if (requested.has("anomalies")) {
    sections.anomalies = { seed: input.seed, ...report.anomalyReport };
  }

  return {
    seed: input.seed,
    sections,
    calibrationVersions: stringCalibrationVersions(
      report.league.calibrationVersions as unknown as Readonly<Record<string, unknown>>,
    ),
  };
}

function economyProjection(report: CareerWorldFacts, detail: SimulationReportDetail): unknown {
  if (detail !== "summary") {
    return {
      seed: report.seed,
      playerEconomy: report.playerEconomyAudit,
      contractFinance: report.contractFinanceStabilityReport,
    };
  }
  const finance = report.contractFinanceStabilityReport;
  return {
    seed: report.seed,
    playerEconomy: {
      observationCount: report.playerEconomyAudit.observationCount,
      gates: report.playerEconomyAudit.gates.map((gate) => ({
        key: gate.key,
        status: gate.status,
        observationCount: gate.observationCount,
        violationCount: gate.violationCount,
        threshold: gate.threshold,
      })),
    },
    contractFinance: {
      status: finance.status,
      structuralViolationCount: finance.structuralViolationCount,
      minimumCashBalanceObserved: finance.minimumCashBalanceObserved,
      maximumWageBudgetUtilizationObserved: finance.maximumWageBudgetUtilizationObserved,
      completedTransferCount: finance.completedTransferCount,
      renewalCount: finance.renewalCount,
      releaseCount: finance.releaseCount,
      expiryCount: finance.expiryCount,
    },
  };
}

function developmentProjection(report: CareerWorldFacts, detail: SimulationReportDetail): unknown {
  if (detail !== "summary") return { seed: report.seed, ...report.playerEvolutionReport };
  const evolution = report.playerEvolutionReport;
  return {
    seed: report.seed,
    startAverageCurrentAbility: evolution.startAverageCurrentAbility,
    endAverageCurrentAbility: evolution.endAverageCurrentAbility,
    playersImproved: evolution.playersImproved,
    playersDeclined: evolution.playersDeclined,
    seriousProspects: evolution.seriousProspects,
    rareProdigies: evolution.rareProdigies,
    usefulAfterLongRun: evolution.usefulAfterLongRun,
    finalAgeUnder22: evolution.finalAgeUnder22,
    finalAge22To29: evolution.finalAge22To29,
    finalAge30Plus: evolution.finalAge30Plus,
  };
}

function seasonProjection(report: CareerWorldFacts): unknown {
  return {
    seed: report.seed,
    seasons: report.seasons.map((season) => {
      const champion = season.result.table[0];
      const last = season.result.table.at(-1);
      if (champion === undefined || last === undefined) {
        throw new Error(`Season table is empty: ${season.seasonSeed}`);
      }
      return {
        seasonNumber: season.seasonNumber,
        seasonSeed: season.seasonSeed,
        fixtureCount: season.result.fixtureCount,
        drawCount: season.result.drawCount,
        championClubId: String(champion.clubId),
        championPoints: champion.points,
        lastClubId: String(last.clubId),
        lastPoints: last.points,
        transferTurnoverCount: season.refresh.transferTurnoverCount,
      };
    }),
  };
}

function standingsProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
): unknown {
  return {
    seasonNumber,
    seasonSeed,
    rows: result.table.map((row) => ({
      ...row,
      clubName: careerState.gameState.clubs[row.clubId]?.name ?? String(row.clubId),
    })),
  };
}

function playerProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
  detail: SimulationReportDetail,
): unknown {
  const participation = new Map<string, { appearances: number; minutes: number }>();
  for (const fixture of result.fixtureParticipation) {
    for (const row of fixture.contributions) {
      if (!row.started && !row.substituteAppearance) continue;
      const current = participation.get(String(row.playerId)) ?? { appearances: 0, minutes: 0 };
      participation.set(String(row.playerId), {
        appearances: current.appearances + 1,
        minutes: current.minutes + row.minutes,
      });
    }
  }
  const seasonEnd = result.fixtures.reduce(
    (latest, fixture) => Number(fixture.date) > Number(latest) ? fixture.date : latest,
    result.fixtures[0]?.date ?? careerState.gameState.calendar.currentDate,
  );
  const rows = result.playerSummaryStats.map((stat) => {
    const player = careerState.gameState.players[stat.playerId];
    if (player === undefined) throw new Error(`Season stats reference unknown player ${stat.playerId}`);
    const played = participation.get(String(stat.playerId)) ?? { appearances: 0, minutes: 0 };
    return {
      playerId: String(stat.playerId),
      playerName: `${player.firstName} ${player.lastName}`,
      age: completedPlayerAge(player.birthDate, seasonEnd),
      role: player.primaryRole,
      clubId: String(stat.clubId),
      clubName: careerState.gameState.clubs[stat.clubId]?.name ?? String(stat.clubId),
      goals: stat.goals,
      assists: stat.assists,
      saves: stat.saves,
      appearances: played.appearances,
      minutes: played.minutes,
    };
  });
  const limit = detail === "summary" ? 10 : detail === "standard" ? 50 : rows.length;
  const byGoals = rows.toSorted((left, right) =>
    right.goals - left.goals || right.assists - left.assists || left.playerId.localeCompare(right.playerId)
  ).slice(0, limit);
  const byAssists = rows.toSorted((left, right) =>
    right.assists - left.assists || right.goals - left.goals || left.playerId.localeCompare(right.playerId)
  ).slice(0, limit);
  return { seasonNumber, seasonSeed, topScorers: byGoals, topAssists: byAssists };
}

function formationProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
): unknown {
  const counts = new Map<string, {
    clubId: string;
    clubName: string;
    formation: FormationKey;
    selectionSource: string;
    matches: number;
  }>();
  let fallbackSelectionCount = 0;
  for (const fixture of result.fixtureParticipation) {
    for (const team of [fixture.fieldedTeams.home, fixture.fieldedTeams.away]) {
      if (team.formationKey === undefined) {
        fallbackSelectionCount += 1;
        continue;
      }
      if (team.selectionSource !== "catalog_ai") fallbackSelectionCount += 1;
      const key = `${team.clubId}|${team.formationKey}|${team.selectionSource}`;
      const current = counts.get(key);
      counts.set(key, {
        clubId: String(team.clubId),
        clubName: careerState.gameState.clubs[team.clubId]?.name ?? String(team.clubId),
        formation: team.formationKey,
        selectionSource: team.selectionSource,
        matches: (current?.matches ?? 0) + 1,
      });
    }
  }
  const rows = [...counts.values()].sort((left, right) =>
    left.clubId.localeCompare(right.clubId)
    || left.formation.localeCompare(right.formation)
    || left.selectionSource.localeCompare(right.selectionSource)
  );
  return {
    seasonNumber,
    seasonSeed,
    fallbackSelectionCount,
    distinctFormationCount: new Set(rows.map(({ formation }) => formation)).size,
    rows,
  };
}

function transferProjection(
  report: CareerWorldFacts,
  observed: readonly ObservedTransfer[],
  names: ReadonlyMap<string, string>,
  detail: SimulationReportDetail,
): unknown {
  if (observed.length !== report.finalCareerState.transferHistory.length) {
    throw new Error(
      `Transfer boundary rows do not reconcile: ${observed.length} != ${report.finalCareerState.transferHistory.length}`,
    );
  }
  const all = observed.map(({ seasonNumber, entry }) => ({
    seasonNumber,
    sequenceNumber: entry.sequenceNumber,
    kind: entry.kind,
    occurredOn: toISO(entry.occurredOn),
    playerId: String(entry.playerId),
    playerName: names.get(String(entry.playerId)) ?? String(entry.playerId),
    buyingClubId: String(entry.buyingClubId),
    buyingClubName:
      report.finalCareerState.gameState.clubs[entry.buyingClubId]?.name ?? String(entry.buyingClubId),
    ...(entry.kind === "permanent_transfer"
      ? {
          sellingClubId: String(entry.sellingClubId),
          sellingClubName:
            report.finalCareerState.gameState.clubs[entry.sellingClubId]?.name ?? String(entry.sellingClubId),
        }
      : {}),
    publicValueMinorUnits: Number(entry.publicValue),
    completedFeeMinorUnits: Number(entry.completedFee),
  }));
  const limit = detail === "summary" ? 10 : detail === "standard" ? 100 : all.length;
  return { seed: report.seed, total: all.length, rows: all.slice(0, limit) };
}

function rememberPlayerNames(careerState: CliCareerState, names: Map<string, string>): void {
  for (const playerId of careerState.gameState.playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player !== undefined) names.set(String(playerId), `${player.firstName} ${player.lastName}`);
  }
}

function required(key: keyof ObservedSeason): (season: ObservedSeason) => unknown {
  return (season) => {
    const value = season[key];
    if (value === undefined) throw new Error(`Observed season omitted ${key}`);
    return value;
  };
}

function stringCalibrationVersions(
  versions: Readonly<Record<string, unknown>>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(versions)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]),
  );
}

function asJsonValue(value: unknown): SimulationReportJsonValue {
  return toSimulationReportJsonValue(value);
}

function runCareerSectionsWorker(input: {
  readonly seed: string;
  readonly seasonCount: number;
  readonly detail: SimulationReportDetail;
  readonly sectionIds: readonly CareerSectionId[];
}): Promise<CareerWorldProjection> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./career-sections.ts", import.meta.url), {
      workerData: { kind: "simulation-report-career", ...input },
    });
    worker.once("message", (message: CareerWorldProjection) => resolve(message));
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Career report worker exited with code ${code}: ${input.seed}`));
    });
  });
}

if (!isMainThread && workerData?.kind === "simulation-report-career") {
  parentPort?.postMessage(createCareerWorldProjection(workerData));
}
