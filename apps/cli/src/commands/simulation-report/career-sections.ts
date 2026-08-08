import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

import {
  assignGeneratedSquadIdentities,
  GENERATED_SQUAD_IDENTITY_KEYS,
  squadIdentityPositionForSlot,
  type FakeDomesticWorld,
  type GeneratedSquadIdentityKey,
} from "@game/content";
import { createTranslator } from "@game/i18n";
import {
  assessCareerSquadStructure,
  completedPlayerAge,
  fieldablePlayerIdsFor,
  type FormationKey,
  type SimulateSeasonResult,
} from "@game/engine";
import { toISO } from "@game/shared";
import {
  countTacticalAgencyOutOfPositionSlots,
  summarizeTacticalAgencyPrimaryRoles,
  toSimulationReportJsonValue,
  type SimulationReportDetail,
  type SimulationReportJsonValue,
} from "@game/simulation-tools";

import type { CliCareerState } from "../career/types.ts";
import {
  createCareerWorldFacts,
  type CareerWorldInspection,
  type CareerWorldFacts,
} from "./career-world-facts.ts";
import {
  readCareerSectionWorldCheckpoint,
  writeCareerSectionWorldCheckpoint,
  type CareerSectionWorldCheckpointIdentity,
} from "./long-run-profile-checkpoints.ts";

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
  readonly decision: "PASS" | "FAIL";
}

interface CareerWorldProjection {
  readonly seed: string;
  readonly sections: Readonly<Partial<Record<CareerSectionId, unknown>>>;
  readonly calibrationVersions: Readonly<Record<string, string>>;
  readonly leagueDiversity?: LeagueDiversityWorldFacts;
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
  readonly buyingClubName: string;
  readonly buyingCompetitionId: string;
  readonly buyingCompetitionName: string;
  readonly sellingClubName?: string;
  readonly sellingCompetitionId?: string;
  readonly sellingCompetitionName?: string;
}

interface ObservedCompetitionSeason {
  readonly seasonNumber: number;
  readonly competitionId: string;
  readonly competitionName: string;
  readonly seasonSeed: string;
  readonly season?: unknown;
  readonly standings?: unknown;
  readonly players?: unknown;
  readonly formations?: LeagueFormationSeasonProjection;
}

interface ObservedDomesticSeason {
  readonly seasonNumber: number;
  readonly competitions: readonly ObservedCompetitionSeason[];
}

export interface LeagueDiversityOpeningCompetitionFact {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly clubCount: number;
  readonly identityCounts: Readonly<Record<string, number>>;
  readonly identityMismatchCount: number;
  readonly primaryRolePositiveCount: number;
  readonly distinctFormationCount: number;
  readonly replicatedFormationCount: number;
  readonly topFormationShare: number;
  readonly distinctIdentityModalFormationCount: number;
  readonly catalogOrderSensitiveSelectionCount: number;
  readonly meanOutOfPositionSlots: number;
}

export interface LeagueDiversityCompetitionSeasonFact {
  readonly worldSeed: string;
  readonly competitionId: string;
  readonly seasonNumber: number;
  readonly distinctFormationCount: number;
  readonly replicatedFormationCount: number;
  readonly topFormationShare: number;
  readonly primaryRolePositiveCount: number;
  readonly fallbackSelectionCount: number;
  readonly selectionCount: number;
  readonly missingSelectionSourceCount: number;
  readonly missingStableIdCount: number;
  readonly reconciliationFailureCount: number;
}

export interface LeagueDiversityWorldFacts {
  readonly worldSeed: string;
  readonly opening: readonly LeagueDiversityOpeningCompetitionFact[];
  readonly seasons: readonly LeagueDiversityCompetitionSeasonFact[];
}

export interface LeagueDiversityCheckpointDecision {
  readonly decision: "GO" | "REFINE";
  readonly opening: {
    readonly competitionCount: number;
    readonly passingCompetitionCount: number;
    readonly failed: readonly string[];
  };
  readonly longitudinal: {
    readonly competitionSeasonCount: number;
    readonly sixFormationRetentionShare: number;
    readonly fourReplicatedFormationRetentionShare: number;
    readonly topShareAtMostThirtyRetentionShare: number;
    readonly allRolesRetentionShare: number;
    readonly maximumTopFormationShare: number;
    readonly fallbackSelectionCount: number;
    readonly missingSelectionSourceCount: number;
    readonly missingStableIdCount: number;
    readonly reconciliationFailureCount: number;
    readonly failed: readonly string[];
  };
}

interface LeagueFormationSeasonProjection {
  readonly seasonNumber: number;
  readonly seasonSeed: string;
  readonly fallbackSelectionCount: number;
  readonly selectionCount: number;
  readonly missingSelectionSourceCount: number;
  readonly missingStableIdCount: number;
  readonly reconciliationFailureCount: number;
  readonly catalogOrderSensitiveSelectionCount: number;
  readonly catalogChoiceMissingCount: number;
  readonly outOfPositionSlotCount: number;
  readonly meanOutOfPositionSlots: number;
  readonly distinctFormationCount: number;
  readonly replicatedFormationCount: number;
  readonly topFormationShare: number;
  readonly primaryRolePositiveCount: number;
  readonly primaryRoles: unknown;
  readonly roleDepthWarnings: unknown;
  readonly lateralFocus: "not_observed";
  readonly clubModalRows: readonly {
    readonly clubId: string;
    readonly clubName: string;
    readonly formation: FormationKey;
    readonly matches: number;
  }[];
  readonly rows: readonly unknown[];
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
  readonly leagueDiversityProfile?: {
    readonly profileId: string;
    readonly checkpointDirectoryPath: string;
  };
}): Promise<CareerSectionsExecutionFacts> {
  const worlds: CareerWorldProjection[] = [];
  for (let start = 0; start < input.worldSeeds.length; start += input.workerCount) {
    worlds.push(...await Promise.all(
      input.worldSeeds.slice(start, start + input.workerCount).map(async (seed, offset) => {
        const worldIndex = start + offset + 1;
        const checkpointIdentity = input.leagueDiversityProfile === undefined
          ? undefined
          : careerSectionCheckpointIdentity(input, seed, worldIndex);
        if (checkpointIdentity !== undefined) {
          const checkpoint = await readCareerSectionWorldCheckpoint(checkpointIdentity);
          if (checkpoint !== undefined) return careerWorldProjectionFromCheckpoint(checkpoint, seed);
        }

        const projectionInput = {
          seed,
          seasonCount: input.seasonCount,
          detail: input.detail,
          sectionIds: input.sectionIds,
          leagueDiversity: input.leagueDiversityProfile !== undefined,
        } as const;
        const projection = input.workerCount === 1
          ? createCareerWorldProjection(projectionInput)
          : await runCareerSectionsWorker(projectionInput);
        if (checkpointIdentity !== undefined) {
          await writeCareerSectionWorldCheckpoint(
            checkpointIdentity,
            toSimulationReportJsonValue(projection),
          );
        }
        return projection;
      }),
    ));
  }
  const first = worlds[0];
  if (first === undefined) throw new Error("Career report needs at least one world");
  for (const world of worlds) {
    if (!sameStringRecord(first.calibrationVersions, world.calibrationVersions)) {
      throw new Error(`Career worlds disagree about calibration versions: ${first.seed} != ${world.seed}`);
    }
  }

  const checkpoint = input.leagueDiversityProfile === undefined
    ? undefined
    : evaluateLeagueDiversityCheckpoint(worlds.map((world) => {
        if (world.leagueDiversity === undefined) {
          throw new Error(`Career world ${world.seed} omitted league-diversity facts`);
        }
        return world.leagueDiversity;
      }));

  const sections: Partial<Record<CareerSectionId, SimulationReportJsonValue>> = {};
  for (const sectionId of input.sectionIds) {
    sections[sectionId] = asJsonValue({
      ...(sectionId === "formations" && checkpoint !== undefined ? { checkpoint } : {}),
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
    decision: checkpoint?.decision === "REFINE" ? "FAIL" : "PASS",
  };
}

function createCareerWorldProjection(input: {
  readonly seed: string;
  readonly seasonCount: number;
  readonly detail: SimulationReportDetail;
  readonly sectionIds: readonly CareerSectionId[];
  readonly leagueDiversity: boolean;
}): CareerWorldProjection {
  const requested = new Set(input.sectionIds);
  const observedSeasons: ObservedSeason[] = [];
  const observedDomesticSeasons: ObservedDomesticSeason[] = [];
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
      ...(input.leagueDiversity
        ? {
            observeCompetitionSeasonResults: ({
              seasonNumber,
              competitions,
              careerState,
              league,
            }: Parameters<NonNullable<CareerWorldInspection["observeCompetitionSeasonResults"]>>[0]) => {
              rememberPlayerNames(careerState, names);
              observedDomesticSeasons.push({
                seasonNumber,
                competitions: competitions.map(({ competitionId, seasonSeed, result }) => {
                  const competition = league.domesticCompetitionWorld.competitions[competitionId];
                  if (competition === undefined) {
                    throw new Error(`Career report lost competition ${competitionId}`);
                  }
                  return {
                    seasonNumber,
                    competitionId: String(competitionId),
                    competitionName: competition.name,
                    seasonSeed,
                    ...(requested.has("season")
                      ? { season: competitionSeasonProjection(result, careerState, seasonNumber, seasonSeed) }
                      : {}),
                    ...(requested.has("standings")
                      ? { standings: standingsProjection(result, careerState, seasonNumber, seasonSeed) }
                      : {}),
                    ...(requested.has("players")
                      ? {
                          players: playerProjection(
                            result,
                            careerState,
                            seasonNumber,
                            seasonSeed,
                            "summary",
                          ),
                        }
                      : {}),
                    ...(requested.has("formations")
                      ? { formations: formationProjection(result, careerState, seasonNumber, seasonSeed) }
                      : {}),
                  };
                }),
              });
            },
          }
        : {
            observeSeasonResult: ({
              seasonNumber,
              seasonSeed,
              result,
              careerState,
            }: Parameters<NonNullable<CareerWorldInspection["observeSeasonResult"]>>[0]) => {
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
          }),
      observeSeasonBoundary: ({ seasonNumber, previousCareerState, careerState }) => {
        rememberPlayerNames(previousCareerState, names);
        rememberPlayerNames(careerState, names);
        const previousSequence = previousCareerState.transferHistory.at(-1)?.sequenceNumber ?? 0;
        for (const entry of careerState.transferHistory) {
          if (entry.sequenceNumber > previousSequence) {
            transfers.push(observeTransferAtBoundary(seasonNumber, entry, previousCareerState));
          }
        }
      },
    },
  );
  rememberPlayerNames(report.finalCareerState, names);

  const sections: Partial<Record<CareerSectionId, unknown>> = {};
  const domesticSection = (key: keyof ObservedCompetitionSeason) => ({
    seed: input.seed,
    seasons: observedDomesticSeasons.map((season) => ({
      seasonNumber: season.seasonNumber,
      competitions: season.competitions.map((competition) =>
        competitionSectionProjection(competition, key)
      ),
    })),
  });
  if (requested.has("season")) {
    sections.season = input.leagueDiversity ? domesticSection("season") : seasonProjection(report);
  }
  if (requested.has("standings")) {
    sections.standings = input.leagueDiversity
      ? domesticSection("standings")
      : { seed: input.seed, seasons: observedSeasons.map(required("standings")) };
  }
  if (requested.has("players")) {
    sections.players = input.leagueDiversity
      ? domesticSection("players")
      : { seed: input.seed, seasons: observedSeasons.map(required("players")) };
  }
  if (requested.has("formations")) {
    sections.formations = input.leagueDiversity
      ? {
          ...domesticSection("formations"),
          openingPopulation: openingPopulationProjection(report.league, input.seed),
        }
      : { seed: input.seed, seasons: observedSeasons.map(required("formations")) };
  }
  if (requested.has("transfers")) {
    sections.transfers = transferProjection(
      report,
      transfers,
      names,
      input.leagueDiversity ? "diagnostic" : input.detail,
    );
  }
  if (requested.has("economy")) {
    sections.economy = economyProjection(
      report,
      input.leagueDiversity ? "summary" : input.detail,
    );
  }
  if (requested.has("development")) {
    sections.development = developmentProjection(
      report,
      input.leagueDiversity ? "summary" : input.detail,
    );
  }
  if (requested.has("anomalies")) {
    sections.anomalies = { seed: input.seed, ...report.anomalyReport };
  }

  const leagueDiversity = input.leagueDiversity
    ? leagueDiversityWorldFacts(input.seed, report.league, observedDomesticSeasons)
    : undefined;
  return {
    seed: input.seed,
    sections,
    calibrationVersions: stringCalibrationVersions(
      report.league.calibrationVersions as unknown as Readonly<Record<string, unknown>>,
    ),
    ...(leagueDiversity === undefined ? {} : { leagueDiversity }),
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

/** One played competition's compact season headline, before career rollover. */
function competitionSeasonProjection(
  result: SimulateSeasonResult,
  careerState: CliCareerState,
  seasonNumber: number,
  seasonSeed: string,
): unknown {
  const champion = result.table[0];
  const last = result.table.at(-1);
  if (champion === undefined || last === undefined) {
    throw new Error(`Competition season table is empty: ${seasonSeed}`);
  }
  return {
    seasonNumber,
    seasonSeed,
    fixtureCount: result.fixtures.length,
    drawCount: result.fixtures.reduce((count, fixture) =>
      fixture.result !== undefined && fixture.result.homeGoals === fixture.result.awayGoals
        ? count + 1
        : count, 0),
    championClubId: String(champion.clubId),
    championClubName:
      careerState.gameState.clubs[champion.clubId]?.name ?? String(champion.clubId),
    championPoints: champion.points,
    lastClubId: String(last.clubId),
    lastClubName: careerState.gameState.clubs[last.clubId]?.name ?? String(last.clubId),
    lastPoints: last.points,
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
): LeagueFormationSeasonProjection {
  const counts = new Map<string, {
    clubId: string;
    clubName: string;
    formation: FormationKey;
    selectionSource: string;
    directness: number;
    pressing: number;
    width: number;
    risk: number;
    mentality: string;
    matches: number;
  }>();
  const clubFormationCounts = new Map<string, Map<FormationKey, number>>();
  let fallbackSelectionCount = 0;
  let selectionCount = 0;
  let missingSelectionSourceCount = 0;
  let missingStableIdCount = 0;
  let catalogOrderSensitiveSelectionCount = 0;
  let catalogChoiceMissingCount = 0;
  let outOfPositionSlotCount = 0;
  for (const fixture of result.fixtureParticipation) {
    for (const team of [fixture.fieldedTeams.home, fixture.fieldedTeams.away]) {
      selectionCount += 1;
      if (String(team.clubId).length === 0) missingStableIdCount += 1;
      if (team.selectionSource.length === 0) missingSelectionSourceCount += 1;
      missingStableIdCount += team.lineup.filter(({ playerId }) => String(playerId).length === 0).length;
      outOfPositionSlotCount += countTacticalAgencyOutOfPositionSlots({
        careerState,
        lineup: team.lineup,
      });
      if (team.formationKey === undefined) {
        fallbackSelectionCount += 1;
        continue;
      }
      if (team.selectionSource !== "catalog_ai") fallbackSelectionCount += 1;
      if (team.selectionSource === "catalog_ai" && team.catalogChoice === undefined) {
        catalogChoiceMissingCount += 1;
      }
      if ((team.catalogChoice?.tiedAtBestCount ?? 1) > 1) {
        catalogOrderSensitiveSelectionCount += 1;
      }
      const tactic = team.tacticalDistribution;
      const key = [
        team.clubId,
        team.formationKey,
        team.selectionSource,
        tactic.directness,
        tactic.pressing,
        tactic.width,
        tactic.risk,
        tactic.mentality,
      ].join("|");
      const current = counts.get(key);
      counts.set(key, {
        clubId: String(team.clubId),
        clubName: careerState.gameState.clubs[team.clubId]?.name ?? String(team.clubId),
        formation: team.formationKey,
        selectionSource: team.selectionSource,
        directness: tactic.directness,
        pressing: tactic.pressing,
        width: tactic.width,
        risk: tactic.risk,
        mentality: tactic.mentality,
        matches: (current?.matches ?? 0) + 1,
      });
      const formationCounts = clubFormationCounts.get(String(team.clubId)) ?? new Map<FormationKey, number>();
      formationCounts.set(team.formationKey, (formationCounts.get(team.formationKey) ?? 0) + 1);
      clubFormationCounts.set(String(team.clubId), formationCounts);
    }
  }
  const rows = [...counts.values()].sort((left, right) =>
    left.clubId.localeCompare(right.clubId)
    || left.formation.localeCompare(right.formation)
    || left.selectionSource.localeCompare(right.selectionSource)
  );
  const clubModalRows = [...clubFormationCounts].map(([clubId, formationCounts]) => {
    const selected = [...formationCounts].sort(([leftKey, leftCount], [rightKey, rightCount]) =>
      rightCount - leftCount || leftKey.localeCompare(rightKey)
    )[0];
    if (selected === undefined) throw new Error(`Club ${clubId} has no fielded catalog formation`);
    return {
      clubId,
      clubName: careerState.gameState.clubs[clubId as keyof typeof careerState.gameState.clubs]?.name ?? clubId,
      formation: selected[0],
      matches: selected[1],
    };
  }).sort((left, right) => left.clubId.localeCompare(right.clubId));
  const modalClubCountByFormation = new Map<FormationKey, number>();
  for (const { formation } of clubModalRows) {
    modalClubCountByFormation.set(formation, (modalClubCountByFormation.get(formation) ?? 0) + 1);
  }
  const primaryRolePlayerIds = [...new Set(
    result.table.flatMap(({ clubId }) =>
      fieldablePlayerIdsFor(careerState.gameState.clubs[clubId])
    ),
  )];
  const primaryRoles = summarizeTacticalAgencyPrimaryRoles(careerState, primaryRolePlayerIds);
  const roleDepthWarnings = result.table.flatMap(({ clubId }) => {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) return [];
    const assessment = assessCareerSquadStructure({
      playerIds: fieldablePlayerIdsFor(club),
      players: careerState.gameState.players,
    });
    return assessment.warnings.length === 0 ? [] : [{
      clubId: String(clubId),
      clubName: club.name,
      squadSize: assessment.squadSize,
      departmentDepth: assessment.departmentDepth,
      warnings: assessment.warnings,
    }];
  });
  const expectedSelectionCount = result.fixtureParticipation.length * 2;
  const rowSelectionCount = rows.reduce((sum, row) => sum + row.matches, 0);
  const reconciliationFailureCount = Number(selectionCount !== expectedSelectionCount)
    + Number(rowSelectionCount + result.fixtureParticipation.flatMap(({ fieldedTeams }) =>
      [fieldedTeams.home, fieldedTeams.away]
    ).filter(({ formationKey }) => formationKey === undefined).length !== selectionCount)
    + Number(clubModalRows.length !== result.table.length)
    + Number(primaryRoles.playerCount !== primaryRolePlayerIds.length)
    + Number(catalogChoiceMissingCount > 0);
  const highestModalClubCount = Math.max(0, ...modalClubCountByFormation.values());
  return {
    seasonNumber,
    seasonSeed,
    fallbackSelectionCount,
    selectionCount,
    missingSelectionSourceCount,
    missingStableIdCount,
    reconciliationFailureCount,
    catalogOrderSensitiveSelectionCount,
    catalogChoiceMissingCount,
    outOfPositionSlotCount,
    meanOutOfPositionSlots: selectionCount === 0 ? 0 : outOfPositionSlotCount / selectionCount,
    distinctFormationCount: modalClubCountByFormation.size,
    replicatedFormationCount: [...modalClubCountByFormation.values()].filter((count) => count >= 2).length,
    topFormationShare: clubModalRows.length === 0 ? 0 : highestModalClubCount / clubModalRows.length,
    primaryRolePositiveCount: primaryRoles.roleShares.filter(({ count }) => count > 0).length,
    primaryRoles,
    roleDepthWarnings,
    lateralFocus: "not_observed",
    clubModalRows,
    rows,
  };
}

interface OpeningPopulationProjection {
  readonly seed: string;
  readonly competitions: readonly {
    readonly competitionId: string;
    readonly competitionName: string;
    readonly clubCount: number;
    readonly identityCounts: Readonly<Record<string, number>>;
    readonly identityMismatchCount: number;
    readonly rows: readonly {
      readonly clubId: string;
      readonly clubName: string;
      readonly squadIdentityKey: GeneratedSquadIdentityKey;
    }[];
  }[];
}

/** Reads the opening identity owner and verifies it against generated players. */
function openingPopulationProjection(
  world: FakeDomesticWorld,
  worldSeed: string,
): OpeningPopulationProjection {
  return {
    seed: worldSeed,
    competitions: world.domesticCompetitionWorld.competitionIds.map((competitionId) => {
      const competition = world.domesticCompetitionWorld.competitions[competitionId];
      if (competition === undefined) throw new Error(`Opening competition is missing: ${competitionId}`);
      const assignments = assignGeneratedSquadIdentities({
        seed: worldSeed,
        competitionIdentityKey: competitionId,
        orderedClubIds: competition.clubIds,
      });
      const identityCounts: Record<string, number> = Object.fromEntries(
        GENERATED_SQUAD_IDENTITY_KEYS.map((key) => [key, 0]),
      );
      let identityMismatchCount = 0;
      const rows = competition.clubIds.map((clubId) => {
        const identity = assignments.get(clubId);
        const club = world.clubsById[clubId];
        if (identity === undefined || club === undefined) {
          throw new Error(`Opening identity assignment omitted ${clubId}`);
        }
        identityCounts[identity.key] = (identityCounts[identity.key] ?? 0) + 1;
        for (const [slotIndex, playerId] of club.playerIds.entries()) {
          const expected = squadIdentityPositionForSlot(identity, slotIndex + 1);
          const actual = world.players[playerId]?.naturalPositions[0];
          if (actual !== expected) identityMismatchCount += 1;
        }
        return {
          clubId: String(clubId),
          clubName: club.name,
          squadIdentityKey: identity.key,
        };
      });
      return {
        competitionId: String(competitionId),
        competitionName: competition.name,
        clubCount: competition.clubIds.length,
        identityCounts,
        identityMismatchCount,
        rows,
      };
    }),
  };
}

/** Joins opening identities to season-one fielded shapes without replaying AI. */
function leagueDiversityWorldFacts(
  worldSeed: string,
  world: FakeDomesticWorld,
  observedSeasons: readonly ObservedDomesticSeason[],
): LeagueDiversityWorldFacts {
  const openingPopulation = openingPopulationProjection(world, worldSeed);
  const firstSeason = observedSeasons.find(({ seasonNumber }) => seasonNumber === 1);
  if (firstSeason === undefined) throw new Error(`League-diversity world has no season one: ${worldSeed}`);
  const opening = openingPopulation.competitions.map((population) => {
    const observed = firstSeason.competitions.find(
      ({ competitionId }) => competitionId === population.competitionId,
    );
    const formations = observed?.formations;
    if (formations === undefined) {
      throw new Error(`League-diversity opening formations are missing: ${population.competitionId}`);
    }
    const identityByClub = new Map(population.rows.map((row) => [row.clubId, row.squadIdentityKey]));
    const shapesByIdentity = new Map<GeneratedSquadIdentityKey, Map<FormationKey, number>>();
    for (const row of formations.clubModalRows) {
      const identityKey = identityByClub.get(row.clubId);
      if (identityKey === undefined) {
        throw new Error(`Opening modal shape has no identity: ${row.clubId}`);
      }
      const counts = shapesByIdentity.get(identityKey) ?? new Map<FormationKey, number>();
      counts.set(row.formation, (counts.get(row.formation) ?? 0) + 1);
      shapesByIdentity.set(identityKey, counts);
    }
    const identityModalFormations = [...shapesByIdentity.values()].map((counts) => {
      const modal = [...counts].sort(([leftKey, leftCount], [rightKey, rightCount]) =>
        rightCount - leftCount || leftKey.localeCompare(rightKey)
      )[0];
      if (modal === undefined) throw new Error("Observed squad identity has no modal formation");
      return modal[0];
    });
    return {
      worldSeed,
      competitionId: population.competitionId,
      clubCount: population.clubCount,
      identityCounts: population.identityCounts,
      identityMismatchCount: population.identityMismatchCount,
      primaryRolePositiveCount: formations.primaryRolePositiveCount,
      distinctFormationCount: formations.distinctFormationCount,
      replicatedFormationCount: formations.replicatedFormationCount,
      topFormationShare: formations.topFormationShare,
      distinctIdentityModalFormationCount: new Set(identityModalFormations).size,
      catalogOrderSensitiveSelectionCount:
        formations.catalogOrderSensitiveSelectionCount + formations.catalogChoiceMissingCount,
      meanOutOfPositionSlots: formations.meanOutOfPositionSlots,
    };
  });
  const seasons = observedSeasons.flatMap(({ seasonNumber, competitions }) =>
    competitions.map((competition) => {
      const formations = competition.formations;
      if (formations === undefined) {
        throw new Error(`League-diversity season formations are missing: ${competition.competitionId}`);
      }
      return {
        worldSeed,
        competitionId: competition.competitionId,
        seasonNumber,
        distinctFormationCount: formations.distinctFormationCount,
        replicatedFormationCount: formations.replicatedFormationCount,
        topFormationShare: formations.topFormationShare,
        primaryRolePositiveCount: formations.primaryRolePositiveCount,
        fallbackSelectionCount: formations.fallbackSelectionCount,
        selectionCount: formations.selectionCount,
        missingSelectionSourceCount: formations.missingSelectionSourceCount,
        missingStableIdCount: formations.missingStableIdCount,
        reconciliationFailureCount: formations.reconciliationFailureCount,
      };
    })
  );
  return { worldSeed, opening, seasons };
}

/** Applies the frozen L1 opening and longitudinal gates to canonical facts. */
export function evaluateLeagueDiversityCheckpoint(
  worlds: readonly LeagueDiversityWorldFacts[],
): LeagueDiversityCheckpointDecision {
  const openingRows = worlds.flatMap(({ opening }) => opening);
  const openingFailed: string[] = [];
  let passingCompetitionCount = 0;
  for (const row of openingRows) {
    const minimum = Math.floor(row.clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);
    const maximum = Math.ceil(row.clubCount / GENERATED_SQUAD_IDENTITY_KEYS.length);
    const identityCounts = GENERATED_SQUAD_IDENTITY_KEYS.map((key) => row.identityCounts[key] ?? 0);
    const held = row.clubCount < GENERATED_SQUAD_IDENTITY_KEYS.length || (
      identityCounts.every((count) => count >= minimum && count <= maximum)
      && identityCounts.every((count) => count > 0)
      && row.identityMismatchCount === 0
      && row.primaryRolePositiveCount === 10
      && row.distinctFormationCount >= 6
      && row.replicatedFormationCount >= 4
      && row.topFormationShare <= 0.30
      && row.distinctIdentityModalFormationCount >= 6
      && row.catalogOrderSensitiveSelectionCount === 0
      && row.meanOutOfPositionSlots === 0
    );
    if (held) passingCompetitionCount += 1;
    else openingFailed.push(`${row.worldSeed}|${row.competitionId}`);
  }

  const seasonRows = worlds.flatMap(({ seasons }) => seasons);
  if (seasonRows.length === 0) throw new Error("League-diversity checkpoint has no competition-seasons");
  const share = (predicate: (row: LeagueDiversityCompetitionSeasonFact) => boolean) =>
    seasonRows.filter(predicate).length / seasonRows.length;
  const sixFormationRetentionShare = share(({ distinctFormationCount }) => distinctFormationCount >= 6);
  const fourReplicatedFormationRetentionShare = share(
    ({ replicatedFormationCount }) => replicatedFormationCount >= 4,
  );
  const topShareAtMostThirtyRetentionShare = share(
    ({ topFormationShare }) => topFormationShare <= 0.30,
  );
  const allRolesRetentionShare = share(({ primaryRolePositiveCount }) => primaryRolePositiveCount === 10);
  const maximumTopFormationShare = Math.max(...seasonRows.map(({ topFormationShare }) => topFormationShare));
  const fallbackSelectionCount = sum(seasonRows, "fallbackSelectionCount");
  const missingSelectionSourceCount = sum(seasonRows, "missingSelectionSourceCount");
  const missingStableIdCount = sum(seasonRows, "missingStableIdCount");
  const reconciliationFailureCount = sum(seasonRows, "reconciliationFailureCount");
  const longitudinalFailed = [
    ...(sixFormationRetentionShare < 0.95 ? ["six_formation_retention"] : []),
    ...(fourReplicatedFormationRetentionShare < 0.95 ? ["four_replicated_formation_retention"] : []),
    ...(topShareAtMostThirtyRetentionShare < 0.95 ? ["top_share_at_most_thirty_retention"] : []),
    ...(allRolesRetentionShare < 0.95 ? ["all_roles_retention"] : []),
    ...(maximumTopFormationShare > 0.50 ? ["absolute_top_formation_share"] : []),
    ...(fallbackSelectionCount > 0 ? ["selection_fallback"] : []),
    ...(missingSelectionSourceCount > 0 ? ["missing_selection_source"] : []),
    ...(missingStableIdCount > 0 ? ["missing_stable_id"] : []),
    ...(reconciliationFailureCount > 0 ? ["reconciliation"] : []),
  ];
  const decision = openingFailed.length === 0 && longitudinalFailed.length === 0
    ? "GO" as const
    : "REFINE" as const;
  return {
    decision,
    opening: {
      competitionCount: openingRows.length,
      passingCompetitionCount,
      failed: openingFailed,
    },
    longitudinal: {
      competitionSeasonCount: seasonRows.length,
      sixFormationRetentionShare,
      fourReplicatedFormationRetentionShare,
      topShareAtMostThirtyRetentionShare,
      allRolesRetentionShare,
      maximumTopFormationShare,
      fallbackSelectionCount,
      missingSelectionSourceCount,
      missingStableIdCount,
      reconciliationFailureCount,
      failed: longitudinalFailed,
    },
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
  const all = observed.map(({
    seasonNumber,
    entry,
    buyingClubName,
    buyingCompetitionId,
    buyingCompetitionName,
    sellingClubName,
    sellingCompetitionId,
    sellingCompetitionName,
  }) => ({
    seasonNumber,
    sequenceNumber: entry.sequenceNumber,
    kind: entry.kind,
    occurredOn: toISO(entry.occurredOn),
    playerId: String(entry.playerId),
    playerName: names.get(String(entry.playerId)) ?? String(entry.playerId),
    buyingClubId: String(entry.buyingClubId),
    buyingClubName,
    buyingCompetitionId,
    buyingCompetitionName,
    ...(entry.kind === "permanent_transfer"
      ? {
          sellingClubId: String(entry.sellingClubId),
          sellingClubName,
          sellingCompetitionId,
          sellingCompetitionName,
        }
      : {}),
    publicValueMinorUnits: Number(entry.publicValue),
    completedFeeMinorUnits: Number(entry.completedFee),
  }));
  const limit = detail === "summary" ? 10 : detail === "standard" ? 100 : all.length;
  return { seed: report.seed, total: all.length, rows: all.slice(0, limit) };
}

/**
 * Captures the clubs' divisions while the transfer is observed.
 *
 * Competition membership changes over a career, so a final-state lookup can
 * silently label an old transfer with a later promoted or relegated division.
 * The boundary observation stores the non-derivable historical presentation
 * fact beside the canonical transfer entry instead.
 */
function observeTransferAtBoundary(
  seasonNumber: number,
  entry: CliCareerState["transferHistory"][number],
  careerState: CliCareerState,
): ObservedTransfer {
  const buying = clubCompetitionAtBoundary(careerState, entry.buyingClubId);
  if (entry.kind !== "permanent_transfer") {
    return {
      seasonNumber,
      entry,
      buyingClubName: buying.clubName,
      buyingCompetitionId: buying.competitionId,
      buyingCompetitionName: buying.competitionName,
    };
  }

  const selling = clubCompetitionAtBoundary(careerState, entry.sellingClubId);
  return {
    seasonNumber,
    entry,
    buyingClubName: buying.clubName,
    buyingCompetitionId: buying.competitionId,
    buyingCompetitionName: buying.competitionName,
    sellingClubName: selling.clubName,
    sellingCompetitionId: selling.competitionId,
    sellingCompetitionName: selling.competitionName,
  };
}

/** Resolves one club through the ordered competition registry at observation time. */
function clubCompetitionAtBoundary(
  careerState: CliCareerState,
  clubId: CliCareerState["gameState"]["clubIds"][number],
): {
  readonly clubName: string;
  readonly competitionId: string;
  readonly competitionName: string;
} {
  const club = careerState.gameState.clubs[clubId];
  const registry = careerState.gameState.domesticCompetitionWorld;
  if (club === undefined || registry === undefined) {
    throw new Error(`Transfer boundary lost club or competition registry: ${clubId}`);
  }
  for (const competitionId of registry.competitionIds) {
    const competition = registry.competitions[competitionId];
    if (competition?.clubIds.includes(clubId) === true) {
      return {
        clubName: club.name,
        competitionId: String(competitionId),
        competitionName: competition.name,
      };
    }
  }
  throw new Error(`Transfer boundary club has no competition: ${clubId}`);
}

function careerSectionCheckpointIdentity(
  input: {
    readonly worldSeeds: readonly string[];
    readonly seasonCount: number;
    readonly detail: SimulationReportDetail;
    readonly sectionIds: readonly CareerSectionId[];
    readonly leagueDiversityProfile?: {
      readonly profileId: string;
      readonly checkpointDirectoryPath: string;
    };
  },
  worldSeed: string,
  worldIndex: number,
): CareerSectionWorldCheckpointIdentity {
  const profile = input.leagueDiversityProfile;
  if (profile === undefined) throw new Error("Career checkpoint identity requires a profile");
  return {
    profileId: profile.profileId,
    worldSeed,
    worldIndex,
    worldCount: input.worldSeeds.length,
    seasonCount: input.seasonCount,
    detail: input.detail,
    sectionIds: input.sectionIds,
    checkpointDirectoryPath: profile.checkpointDirectoryPath,
  };
}

/** Narrows one hashed JSON checkpoint back to the projection contract. */
function careerWorldProjectionFromCheckpoint(
  value: SimulationReportJsonValue,
  expectedSeed: string,
): CareerWorldProjection {
  const root = jsonRecord(value);
  const sections = jsonRecord(root?.sections);
  const calibrationVersions = jsonRecord(root?.calibrationVersions);
  if (
    root?.seed !== expectedSeed
    || sections === undefined
    || calibrationVersions === undefined
    || !Object.values(calibrationVersions).every((entry) => typeof entry === "string")
  ) {
    throw new Error(`Career-section checkpoint projection is invalid: ${expectedSeed}`);
  }
  const leagueDiversity = root.leagueDiversity;
  if (leagueDiversity === undefined || jsonRecord(leagueDiversity) === undefined) {
    throw new Error(`Career-section checkpoint omitted league-diversity facts: ${expectedSeed}`);
  }
  return value as unknown as CareerWorldProjection;
}

/** Adds competition identity to one already-projected section payload. */
function competitionSectionProjection(
  competition: ObservedCompetitionSeason,
  key: keyof ObservedCompetitionSeason,
): unknown {
  const value = competition[key];
  if (value === undefined) {
    throw new Error(`Competition ${competition.competitionId} omitted ${key}`);
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Competition ${competition.competitionId} has malformed ${key}`);
  }
  return {
    competitionId: competition.competitionId,
    competitionName: competition.competitionName,
    ...(value as Readonly<Record<string, unknown>>),
  };
}

function sameStringRecord(
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

function sum<K extends keyof LeagueDiversityCompetitionSeasonFact>(
  rows: readonly LeagueDiversityCompetitionSeasonFact[],
  key: K,
): number {
  return rows.reduce((total, row) => {
    const value = row[key];
    if (typeof value !== "number") throw new Error(`League-diversity ${String(key)} is not numeric`);
    return total + value;
  }, 0);
}

function jsonRecord(
  value: SimulationReportJsonValue | undefined,
): Readonly<Record<string, SimulationReportJsonValue>> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Readonly<Record<string, SimulationReportJsonValue>>
    : undefined;
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
  readonly leagueDiversity: boolean;
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
