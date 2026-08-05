import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import { createTranslator, type SupportedLanguage } from "@game/i18n";
import type { FakeDomesticWorld } from "@game/content";
import {
  buildSeasonRecap,
  evaluateSeasonRecapGates,
  formationForClub,
  type SeasonRecap,
  type SeasonRecapGateResult,
  type SeasonRecapPlayer,
} from "@game/simulation-tools";
// `@game/domain` is not a CLI dependency. Formation contracts arrive through
// `@game/engine`; club and player identifiers through the career aliases, which
// is how every other command in this app names them.
import type { FormationKey } from "@game/engine";

import type { ClubId, CliCareerState, PlayerId } from "../career/types.ts";
import {
  createSingleWorldReport,
  summarizeClubAbilityHierarchySnapshot,
} from "../ten-season-report/report-data.ts";

/**
 * Runs one world of the season-recap inspection.
 *
 * The world is simulated by the existing single-world report path, unchanged,
 * with two hooks: one supplies a per-club shape where the report has always
 * fielded a fixed `4-4-2`, and one reads each completed season while its full
 * result still exists. Nothing here simulates, sequences or seeds anything of
 * its own.
 */

/** One season's charts and verdicts inside an inspection world. */
export interface SeasonRecapSeasonSummary {
  /** One-based season number inside this world. */
  readonly seasonNumber: number;
  /** Stable season seed the runner derived. */
  readonly seasonSeed: string;
  /** The four football charts. */
  readonly recap: SeasonRecap;
  /** Every band with its observed value and verdict. */
  readonly gates: SeasonRecapGateResult;
}

/**
 * One season of the squad-quality trace.
 *
 * Not a football chart and not gated. It exists because a compressed league
 * table has two possible causes - a match engine that cannot separate unequal
 * sides, and a world whose sides have stopped being unequal - and the charts
 * alone cannot tell them apart.
 */
export interface SeasonRecapAbilityTraceRow {
  /** One-based season number inside this world. */
  readonly seasonNumber: number;
  /** Average current ability of the strongest senior squad. */
  readonly topClubAbility: number;
  /** Average current ability of the weakest senior squad. */
  readonly bottomClubAbility: number;
  /** Strongest minus weakest. */
  readonly abilitySpread: number;
  /** Share of senior players that were present in season one. */
  readonly originalPlayerShare: number;
}

/** Everything one inspection world contributes to the report. */
export interface SeasonRecapWorldSummary {
  /** One-based world index. */
  readonly worldIndex: number;
  /** World seed. */
  readonly seed: string;
  /** Clubs in the observed competition. */
  readonly clubCount: number;
  /** Ordered seasons. */
  readonly seasons: readonly SeasonRecapSeasonSummary[];
  /** Ordered squad-quality trace. */
  readonly abilityTrace: readonly SeasonRecapAbilityTraceRow[];
  /**
   * Senior players by canonical role at the opening of the world.
   *
   * A chart is only as good as the population behind it. If a role the shape
   * catalog asks for is never generated, an empty column in the assist chart
   * says nothing about the match engine and everything about the world - and
   * the two are indistinguishable without this.
   */
  readonly openingRoleCounts: Readonly<Record<string, number>>;
}

/** Input for one inspection world. */
export interface RunSeasonRecapWorldInput {
  /** One-based world index. */
  readonly worldIndex: number;
  /** Seed prefix shared by every world in the run. */
  readonly seedPrefix: string;
  /** Seasons to simulate in this world. */
  readonly seasonCount: number;
  /** Report language. */
  readonly language: SupportedLanguage;
}

/** Contiguous slice of world indexes handed to one worker. */
export interface SeasonRecapWorkerPartition {
  /** First one-based world index, inclusive. */
  readonly startIndex: number;
  /** Last one-based world index, inclusive. */
  readonly endIndex: number;
}

/** Worker payload for one partition of inspection worlds. */
export interface SeasonRecapWorkerData extends SeasonRecapWorkerPartition {
  /** Discriminator read by the worker entry point below. */
  readonly reportKind: "season-recap";
  /** Seed prefix shared by every world in the run. */
  readonly seedPrefix: string;
  /** Seasons to simulate per world. */
  readonly seasonCount: number;
  /** Report language. */
  readonly language: SupportedLanguage;
}

/**
 * A world that could not be simulated to the end, and why.
 *
 * Recorded rather than thrown, because the commonest cause is a finding in its
 * own right: a curated shape this step assigned that the club's roster cannot
 * fill. `simulateSeason(...)` takes the formation as a fixed input and has no
 * fallback, so an unfillable shape ends the world. Dropping these silently would
 * report a hundred healthy seasons that were never simulated; hiding the whole
 * run behind the first one would report nothing at all.
 */
export interface SeasonRecapWorldFailure {
  /** One-based world index. */
  readonly worldIndex: number;
  /** World seed. */
  readonly seed: string;
  /** Why it stopped. */
  readonly message: string;
}

/** Successful worker result for one partition. */
export interface SeasonRecapWorkerSuccess {
  readonly ok: true;
  readonly partition: SeasonRecapWorkerPartition;
  readonly worlds: readonly SeasonRecapWorldSummary[];
  readonly failures: readonly SeasonRecapWorldFailure[];
}

/** Failed worker result for one partition. */
export interface SeasonRecapWorkerFailure {
  readonly ok: false;
  readonly message: string;
}

/** Builds the deterministic seed for one inspection world. */
export function seasonRecapWorldSeed(seedPrefix: string, worldIndex: number): string {
  return `${seedPrefix}-world-${String(worldIndex).padStart(5, "0")}`;
}

/**
 * Simulates one world and returns its charts, verdicts and quality trace.
 *
 * @example
 * runSeasonRecapWorld({ worldIndex: 1, seedPrefix: "probe", seasonCount: 5, language: "en" });
 */
export function runSeasonRecapWorld(
  input: RunSeasonRecapWorldInput,
): SeasonRecapWorldSummary {
  const seed = seasonRecapWorldSeed(input.seedPrefix, input.worldIndex);
  const text = createTranslator(input.language);
  const seasons: SeasonRecapSeasonSummary[] = [];
  const abilityTrace: SeasonRecapAbilityTraceRow[] = [];
  let openingPlayerIds: ReadonlySet<string> = new Set();
  let openingRoleCounts: Readonly<Record<string, number>> = {};
  let clubCount = 0;

  createSingleWorldReport(
    seed,
    input.seasonCount,
    text,
    undefined,
    (careerState) => {
      openingPlayerIds = new Set(seniorPlayerIds(careerState));
      openingRoleCounts = countSeniorRoles(careerState);
    },
    {
      formationForClub: (clubId) => formationForClub(seed, clubId as ClubId),
      observeSeasonResult: ({ seasonNumber, seasonSeed, result, careerState, league }) => {
        const clubIds = result.table.map((row) => row.clubId);
        clubCount = clubIds.length;
        const recap = buildSeasonRecap({
          season: result,
          players: recapPlayers(careerState),
          clubNames: recapClubNames(careerState, clubIds),
          formationByClubId: recapFormations(seed, clubIds),
        });

        seasons.push({
          seasonNumber,
          seasonSeed,
          recap,
          gates: evaluateSeasonRecapGates(recap),
        });
        abilityTrace.push(abilityTraceRow(seasonNumber, league, careerState, openingPlayerIds));
      },
    },
  );

  return {
    worldIndex: input.worldIndex,
    seed,
    clubCount,
    seasons,
    abilityTrace,
    openingRoleCounts,
  };
}

/** Counts senior players by canonical role, in stable role order. */
function countSeniorRoles(careerState: CliCareerState): Readonly<Record<string, number>> {
  const counts = new Map<string, number>();

  for (const clubId of careerState.gameState.clubIds) {
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
      const role = careerState.gameState.players[playerId]?.primaryRole;
      if (role === undefined) continue;
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

/**
 * Reads one season's squad-quality facts from the career state.
 *
 * `summarizeClubAbilityHierarchySnapshot(...)` is the report's own definition of
 * how strong a club is, reused rather than restated, so the trace and the
 * initial/final hierarchy can never disagree.
 */
function abilityTraceRow(
  seasonNumber: number,
  league: FakeDomesticWorld,
  careerState: CliCareerState,
  openingPlayerIds: ReadonlySet<string>,
): SeasonRecapAbilityTraceRow {
  const hierarchy = summarizeClubAbilityHierarchySnapshot(league, careerState);
  const current = seniorPlayerIds(careerState);
  const survivors = current.filter((playerId) => openingPlayerIds.has(playerId));

  return {
    seasonNumber,
    topClubAbility: hierarchy.top.averageCurrentAbility,
    bottomClubAbility: hierarchy.bottom.averageCurrentAbility,
    abilitySpread: hierarchy.spread,
    originalPlayerShare:
      current.length === 0 ? 0 : survivors.length / current.length,
  };
}

/** Every senior player currently on a club roster, as plain identifiers. */
function seniorPlayerIds(careerState: CliCareerState): readonly string[] {
  return careerState.gameState.clubIds.flatMap((clubId) =>
    (careerState.gameState.clubs[clubId]?.playerIds ?? []).map(String),
  );
}

/** Name and canonical role for everyone the season statistics can name. */
function recapPlayers(
  careerState: CliCareerState,
): Readonly<Record<PlayerId, SeasonRecapPlayer>> {
  const players: Partial<Record<PlayerId, SeasonRecapPlayer>> = {};

  for (const playerId of careerState.gameState.playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player === undefined) continue;
    players[playerId as PlayerId] = {
      firstName: player.firstName,
      lastName: player.lastName,
      ...(player.primaryRole === undefined ? {} : { primaryRole: player.primaryRole }),
    };
  }

  return players as Readonly<Record<PlayerId, SeasonRecapPlayer>>;
}

/** Display names for the clubs that appear in one league table. */
function recapClubNames(
  careerState: CliCareerState,
  clubIds: readonly ClubId[],
): Readonly<Record<ClubId, string>> {
  const names: Partial<Record<ClubId, string>> = {};

  for (const clubId of clubIds) {
    const club = careerState.gameState.clubs[clubId as never];
    names[clubId] = club === undefined ? String(clubId) : club.name;
  }

  return names as Readonly<Record<ClubId, string>>;
}

/** The shape each club was set up in, read from the same policy the run used. */
function recapFormations(
  seed: string,
  clubIds: readonly ClubId[],
): Readonly<Record<ClubId, FormationKey>> {
  const formations: Partial<Record<ClubId, FormationKey>> = {};

  for (const clubId of clubIds) {
    formations[clubId] = formationForClub(seed, clubId);
  }

  return formations as Readonly<Record<ClubId, FormationKey>>;
}

/** Splits one-based world indexes into stable contiguous partitions. */
export function createSeasonRecapPartitions(
  worldCount: number,
  workerCount: number,
): readonly SeasonRecapWorkerPartition[] {
  const partitions: SeasonRecapWorkerPartition[] = [];
  const baseSize = Math.floor(worldCount / workerCount);
  const remainder = worldCount % workerCount;
  let startIndex = 1;

  for (let index = 0; index < workerCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0);
    if (size === 0) continue;
    const endIndex = startIndex + size - 1;
    partitions.push({ startIndex, endIndex });
    startIndex = endIndex + 1;
  }

  return partitions;
}

/** Runs one partition of worlds in the current thread. */
export function runSeasonRecapPartition(
  input: SeasonRecapWorkerData,
): SeasonRecapWorkerSuccess {
  const worlds: SeasonRecapWorldSummary[] = [];
  const failures: SeasonRecapWorldFailure[] = [];

  for (let index = input.startIndex; index <= input.endIndex; index += 1) {
    try {
      worlds.push(runSeasonRecapWorld({
        worldIndex: index,
        seedPrefix: input.seedPrefix,
        seasonCount: input.seasonCount,
        language: input.language,
      }));
    } catch (error) {
      failures.push({
        worldIndex: index,
        seed: seasonRecapWorldSeed(input.seedPrefix, index),
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    ok: true,
    partition: { startIndex: input.startIndex, endIndex: input.endIndex },
    worlds,
    failures,
  };
}

/** Starts one Node worker for a partition of inspection worlds. */
export function runSeasonRecapWorkerThread(
  input: SeasonRecapWorkerData,
): Promise<SeasonRecapWorkerSuccess> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./recap-world.ts", import.meta.url), {
      workerData: input,
    });

    worker.once("message", (message: SeasonRecapWorkerSuccess | SeasonRecapWorkerFailure) => {
      if (message.ok) {
        resolve(message);
        return;
      }

      reject(new Error(message.message));
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Season recap worker exited with code ${code}`));
      }
    });
  });
}

/** Checks worker input before executing this module as a worker entry point. */
function isSeasonRecapWorkerData(value: unknown): value is SeasonRecapWorkerData {
  const input = value as (SeasonRecapWorkerData & { readonly reportKind?: string }) | undefined;

  return (
    input !== undefined
    && input.reportKind === "season-recap"
    && typeof input.seedPrefix === "string"
    && Number.isSafeInteger(input.seasonCount)
    && Number.isSafeInteger(input.startIndex)
    && Number.isSafeInteger(input.endIndex)
    && typeof input.language === "string"
  );
}

if (!isMainThread) {
  try {
    if (!isSeasonRecapWorkerData(workerData)) {
      throw new Error("Unsupported season recap worker payload");
    }

    parentPort?.postMessage(runSeasonRecapPartition(workerData));
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    } satisfies SeasonRecapWorkerFailure);
  }
}
