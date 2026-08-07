import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

import {
  createFakeDomesticWorld,
  selectPlayerValuationConfig,
  type FakeDomesticWorld,
} from "@game/content";
import { generateRoundRobinCalendar, selectCareerAiTeam } from "@game/engine";
import {
  runTacticalAgencySelectionSeries,
  summarizeTacticalAgencyPrimaryRoles,
  type TacticalAgencyLowBlockSeriesInput,
  type TacticalAgencyRoleSummary,
  type TacticalAgencySelectionRow,
  type TacticalAgencySelectionWorkItem,
} from "@game/simulation-tools";

import { careerStateFromNewWorld } from "../career/scenarios.ts";
import type { ClubId, CliCareerState, CliSaveId, PlayerId } from "../career/types.ts";

/** Competition identity as the CLI names it, through the career aliases. */
type CliCompetitionId = FakeDomesticWorld["domesticCompetitionWorld"]["competitionIds"][number];

/**
 * One world of the Phase 81A Step 02 before-state, and the worker that runs it.
 *
 * A world is the shard key. It is the largest unit that shares nothing with any
 * other unit - its own seed, its own generated squads, its own calendar - so
 * partitioning by world is what makes the run identical at one worker and at
 * seven. Worker count is execution metadata; it may never touch a number.
 *
 * Nothing is sent across the boundary except the seed in and plain rows out.
 * Each worker generates its own world, so no `CareerState` is ever cloned and
 * the shard cannot inherit anything from the shard before it.
 */

/** What one shard is asked to measure. */
export interface TacticalAgencyWorldInput {
  /** World seed. The only thing that distinguishes one shard from another. */
  readonly worldSeed: string;
  /** Rounds of the observed competition to select for. */
  readonly roundCount: number;
}

/** What one shard produces. */
export interface TacticalAgencyWorldResult {
  /** World seed this came from, so a row can always be traced back. */
  readonly worldSeed: string;
  /** Competition the selections were observed in. */
  readonly competitionId: CliCompetitionId;
  /** One row per club per fixture, in calendar order. */
  readonly rows: readonly TacticalAgencySelectionRow[];
  /** Primary roles across every senior squad in that competition. */
  readonly roles: TacticalAgencyRoleSummary;
  /** Stamped calibration the world was generated and measured under. */
  readonly matchTacticsCalibrationVersion: string;
  /** Milliseconds spent inside the selector, for cost estimation. */
  readonly elapsedMilliseconds: number;
}

/** Envelope a worker posts back, so a failure is a message rather than a hang. */
export type TacticalAgencyWorkerMessage =
  | { readonly ok: true; readonly result: TacticalAgencyWorldResult }
  | { readonly ok: false; readonly message: string };

/**
 * Measures one generated world through the real career path.
 *
 * The traversal is the one the step names: generated world, selectable squad,
 * `selectCareerAiTeam(...)`, fixture. The calendar is the production
 * `generateRoundRobinCalendar(...)` rather than hand-paired clubs, so the dates
 * that age assessments and suspensions are the dates a career would have.
 */
export function runTacticalAgencyWorld(input: TacticalAgencyWorldInput): TacticalAgencyWorldResult {
  const world = createFakeDomesticWorld({ worldSeed: input.worldSeed });
  const careerState = careerStateFromNewWorld(
    careerSaveIdFor(input.worldSeed),
    world,
    input.worldSeed,
  );

  const competitionId = observedCompetitionId(world);
  const clubIds = world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [];
  const calendar = generateRoundRobinCalendar({
    seed: input.worldSeed,
    seasonId: world.seasonId,
    competitionId,
    clubIds,
    seasonStartDate: world.seasonStartDate,
  });

  const workItems: TacticalAgencySelectionWorkItem[] = [];
  for (const fixture of calendar.fixtures) {
    if (fixture.roundNumber > input.roundCount) continue;
    workItems.push({ clubId: fixture.homeClubId, fixture });
    workItems.push({ clubId: fixture.awayClubId, fixture });
  }

  const series = runTacticalAgencySelectionSeries(
    {
      careerState,
      workItems,
      policy: {
        roleWeights: world.roleWeights,
        tacticalDistribution: NEUTRAL_TACTICS,
        stateMultiplierCurves: world.stateMultiplierCurves,
        benchSize: BENCH_SIZE,
      },
      matchTacticsCalibration: world.matchTacticsCalibration,
      valuationConfig: selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions),
    },
    () => performance.now(),
  );

  return {
    worldSeed: input.worldSeed,
    competitionId,
    rows: series.rows,
    roles: summarizeTacticalAgencyPrimaryRoles(careerState, seniorPlayerIds(careerState, clubIds)),
    matchTacticsCalibrationVersion: world.matchTacticsCalibration.version,
    elapsedMilliseconds: series.elapsedMilliseconds,
  };
}

/**
 * The competition the before-state is measured in.
 *
 * The third division, because that is where a career starts and therefore what
 * a player actually meets first. It is declared here rather than taken as an
 * argument so two runs cannot quietly measure different populations.
 */
function observedCompetitionId(world: FakeDomesticWorld): CliCompetitionId {
  const competitionId = world.domesticCompetitionWorld.competitionIds[2];
  if (competitionId === undefined) {
    throw new Error(`Generated world has no third division: ${world.domesticCompetitionWorld.competitionIds.length}`);
  }

  return competitionId;
}

/** Every senior footballer on the observed competition's rosters, in club order. */
function seniorPlayerIds(
  careerState: CliCareerState,
  clubIds: readonly ClubId[],
): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];
  for (const clubId of clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) continue;
    playerIds.push(...club.playerIds);
  }

  return playerIds;
}

/** Save identity for a throwaway measurement career, stable per world seed. */
function careerSaveIdFor(worldSeed: string): CliSaveId {
  return `save:agency-${worldSeed}` as CliSaveId;
}

/**
 * The instruction set every AI club deviates from.
 *
 * Neutral on every knob, because the before-state measures what the *shape*
 * chooser does. `deriveShapeTacticalDistribution(...)` moves each club away from
 * this according to the shape it picked, which is the tactic distribution the
 * step asks for.
 */
const NEUTRAL_TACTICS = {
  directness: 0.5,
  pressing: 0.5,
  width: 0.5,
  risk: 0.5,
  mentality: "balanced",
} as const;

/** Bench size the career path uses, so selection pressure matches a real match. */
const BENCH_SIZE = 8;

/**
 * Builds the paired low-block reading from one generated world.
 *
 * Two real clubs from the observed competition, both selected by the production
 * career path, so the elevens are ones a career would field rather than a
 * synthesised pair. Only the instruction under test differs between arms; the
 * seeds, the elevens, the opponent and the venue rotation are shared.
 *
 * The block itself is the extreme legal setting on every knob that shuts a game
 * down: deep, narrow, patient, low-risk. Reading it against the neutral plan is
 * what gives Step 05 an xG before-state instead of the occasion-volume figures,
 * which cannot tell fewer chances from worse ones.
 */
export function buildTacticalAgencyLowBlockInput(input: {
  readonly worldSeed: string;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
}): TacticalAgencyLowBlockSeriesInput {
  const world = createFakeDomesticWorld({ worldSeed: input.worldSeed });
  const careerState = careerStateFromNewWorld(
    careerSaveIdFor(input.worldSeed),
    world,
    input.worldSeed,
  );
  const competitionId = observedCompetitionId(world);
  const clubIds = world.domesticCompetitionWorld.competitions[competitionId]?.clubIds ?? [];
  const calendar = generateRoundRobinCalendar({
    seed: input.worldSeed,
    seasonId: world.seasonId,
    competitionId,
    clubIds,
    seasonStartDate: world.seasonStartDate,
  });

  const fixture = calendar.fixtures[0];
  if (fixture === undefined) {
    throw new Error(`Generated world produced no fixtures: ${input.worldSeed}`);
  }

  const valuationConfig = selectPlayerValuationConfig(careerState.gameState.meta.calibrationVersions);
  const select = (clubId: ClubId) =>
    selectCareerAiTeam({
      careerState,
      clubId,
      fixture,
      policy: {
        roleWeights: world.roleWeights,
        tacticalDistribution: NEUTRAL_TACTICS,
        stateMultiplierCurves: world.stateMultiplierCurves,
        benchSize: BENCH_SIZE,
      },
      matchTacticsCalibration: world.matchTacticsCalibration,
      valuationConfig,
    }).teamContext;

  return {
    own: select(fixture.homeClubId),
    opponent: select(fixture.awayClubId),
    neutralTactics: NEUTRAL_TACTICS,
    lowBlockTactics: LOW_BLOCK_TACTICS,
    engineConfig: world.matchEngineConfig,
    matchTacticsCalibration: world.matchTacticsCalibration,
    fixtureId: fixture.id,
    seedPrefix: input.seedPrefix,
    pairedSeedCount: input.pairedSeedCount,
  };
}

/**
 * The most shut-down plan the knob caps allow.
 *
 * Every knob at the end of its range that takes football out of the game: short,
 * narrow, passive, cautious. Deliberately extreme, because the question is what
 * the block *can* buy at its limit, not what a moderate one buys.
 */
const LOW_BLOCK_TACTICS = {
  directness: 0,
  pressing: 0,
  width: 0,
  risk: 0,
  mentality: "very_defensive",
} as const;

/** Runs one world in its own thread. */
export function runTacticalAgencyWorldInWorker(
  input: TacticalAgencyWorldInput,
): Promise<TacticalAgencyWorldResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./agency-world.ts", import.meta.url), { workerData: input });

    worker.once("message", (message: TacticalAgencyWorkerMessage) => {
      if (message.ok) {
        resolve(message.result);
        return;
      }
      reject(new Error(message.message));
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Tactical agency worker exited with code ${code}`));
    });
  });
}

/** Narrows the untyped worker payload before this module runs as a worker entry. */
function isTacticalAgencyWorldInput(value: unknown): value is TacticalAgencyWorldInput {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<TacticalAgencyWorldInput>;

  return typeof candidate.worldSeed === "string" && typeof candidate.roundCount === "number";
}

if (!isMainThread) {
  try {
    if (!isTacticalAgencyWorldInput(workerData)) {
      throw new Error("Tactical agency worker received an unusable payload");
    }
    parentPort?.postMessage({ ok: true, result: runTacticalAgencyWorld(workerData) });
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
