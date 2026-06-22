import { simulateSeason, type SimulateSeasonInput, type SimulateSeasonResult } from "@game/engine";
import type { CareerState } from "@game/domain";

import { DEFAULT_LONG_RUN_SEASON_COUNT, longRunSeasonSeed } from "./long-runner.ts";

/** Refresh facts emitted after one career long-run season. */
export interface CareerLongRunRefreshSummary {
  /** Number of active players that left rosters. */
  readonly exitCount: number;
  /** Player exits grouped by deterministic career reason. */
  readonly exitReasons: {
    /** Players who left because they reached retirement age. */
    readonly retirement: number;
    /** Players released because they no longer fit the active squad layer. */
    readonly released: number;
    /** Players who stepped down from this career layer. */
    readonly careerStepDown: number;
  };
  /** Number of generated intake candidates considered. */
  readonly intakeCount: number;
  /** Number of intake players actually added to club rosters. */
  readonly squadMaintenanceAddedCount: number;
  /** Number of academy promotion candidates added to senior squads. */
  readonly youthPromotionCount: number;
  /** Number of youth intake players accepted into academy rosters. */
  readonly youthIntakeCount: number;
  /** Number of youth players that left active academy rosters. */
  readonly youthExitCount: number;
  /** Number of inter-club player movements. */
  readonly transferTurnoverCount: number;
  /** Total active senior players after refresh. */
  readonly seniorPlayerCount: number;
  /** Total active academy players after refresh. */
  readonly youthPlayerCount: number;
  /** Total active senior plus academy players after refresh. */
  readonly activePlayerCount: number;
  /** Smallest club roster size observed after refresh. */
  readonly minimumSquadSize: number;
  /** Average club roster size observed after refresh. */
  readonly averageSquadSize: number;
  /** Largest club roster size observed after refresh. */
  readonly maximumSquadSize: number;
  /** Number of clubs below the minimum squad-size gate after refresh. */
  readonly clubsBelowMinimumSquadSize: number;
  /** Number of clubs without a natural goalkeeper after refresh. */
  readonly clubsWithoutNaturalGoalkeeper: number;
  /** Total role/depth warnings emitted by squad maintenance. */
  readonly roleCoverageWarningCount: number;
  /** Smallest active youth roster size observed after refresh. */
  readonly minimumYouthRosterSize: number;
  /** Average active youth roster size observed after refresh. */
  readonly averageYouthRosterSize: number;
  /** Largest active youth roster size observed after refresh. */
  readonly maximumYouthRosterSize: number;
  /** Active youth roster size for the user-selected club after refresh. */
  readonly selectedClubYouthSize: number;
  /** Number of clubs above the configured youth roster target after refresh. */
  readonly clubsAboveYouthTarget: number;
  /** Number of clubs below the configured youth roster minimum after refresh. */
  readonly clubsBelowYouthMinimum: number;
}

/** Context passed when the app creates one season input from a career state. */
export interface CreateCareerLongRunSeasonInputContext {
  /** One-based season number. */
  readonly seasonNumber: number;
  /** Stable season seed. */
  readonly seasonSeed: string;
  /** Career state at the start of the season. */
  readonly careerState: CareerState;
}

/** Context passed when the app advances the career state after a season. */
export interface AdvanceCareerLongRunSeasonContext {
  /** One-based season number. */
  readonly seasonNumber: number;
  /** Stable season seed. */
  readonly seasonSeed: string;
  /** Career state before post-season refresh. */
  readonly careerState: CareerState;
  /** Simulated season result. */
  readonly seasonResult: SimulateSeasonResult;
}

/** App-provided post-season refresh result. */
export interface AdvanceCareerLongRunSeasonResult {
  /** Career state after development, exits, intake, maintenance, and turnover. */
  readonly careerState: CareerState;
  /** Refresh summary for reports. */
  readonly refresh: CareerLongRunRefreshSummary;
}

/** Input for the career-aware long-run simulation. */
export interface RunCareerLongRunSimulationInput {
  /** Stable report seed used to derive season seeds. */
  readonly seed: string;
  /** Initial career state. */
  readonly initialCareerState: CareerState;
  /** Number of seasons to simulate. */
  readonly seasonCount?: number;
  /** App bridge from current career state to one season input. */
  readonly createSeasonInput: (context: CreateCareerLongRunSeasonInputContext) => SimulateSeasonInput;
  /** App bridge that applies post-season career refresh. */
  readonly advanceCareerState: (context: AdvanceCareerLongRunSeasonContext) => AdvanceCareerLongRunSeasonResult;
}

/** One simulated career season in a long-run report. */
export interface CareerLongRunSeasonResult {
  /** One-based season number. */
  readonly seasonNumber: number;
  /** Stable season-specific seed. */
  readonly seasonSeed: string;
  /** Raw deterministic engine season result. */
  readonly result: SimulateSeasonResult;
  /** Post-season refresh facts. */
  readonly refresh: CareerLongRunRefreshSummary;
}

/** Result of a career-aware long-run simulation. */
export interface CareerLongRunSimulationResult {
  /** Original report seed. */
  readonly seed: string;
  /** Number of simulated seasons. */
  readonly seasonCount: number;
  /** Career state after the final post-season refresh. */
  readonly finalCareerState: CareerState;
  /** Ordered season results and refresh facts. */
  readonly seasons: readonly CareerLongRunSeasonResult[];
}

/**
 * Runs a career-aware deterministic long-run simulation.
 *
 * The runner owns sequencing only. Apps still provide content-specific season
 * inputs and refresh logic, so this package remains independent from content,
 * storage, and CLI code.
 */
export function runCareerLongRunSimulation(input: RunCareerLongRunSimulationInput): CareerLongRunSimulationResult {
  const seasonCount = input.seasonCount ?? DEFAULT_LONG_RUN_SEASON_COUNT;

  if (!Number.isSafeInteger(seasonCount) || seasonCount <= 0) {
    throw new Error(`Career long-run season count must be a positive safe integer: ${seasonCount}`);
  }

  const seasons: CareerLongRunSeasonResult[] = [];
  let careerState = input.initialCareerState;

  for (let seasonNumber = 1; seasonNumber <= seasonCount; seasonNumber += 1) {
    const seasonSeed = longRunSeasonSeed(input.seed, seasonNumber);
    const seasonInput = input.createSeasonInput({ seasonNumber, seasonSeed, careerState });
    const result = simulateSeason(seasonInput);
    const advanced = input.advanceCareerState({ seasonNumber, seasonSeed, careerState, seasonResult: result });

    seasons.push({
      seasonNumber,
      seasonSeed,
      result,
      refresh: advanced.refresh,
    });
    careerState = advanced.careerState;
  }

  return {
    seed: input.seed,
    seasonCount,
    finalCareerState: careerState,
    seasons,
  };
}
