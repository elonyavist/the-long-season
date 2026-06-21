import { simulateSeason, type SimulateSeasonInput, type SimulateSeasonResult } from "@game/engine";

/** Default number of seasons used by the long-run smoke report. */
export const DEFAULT_LONG_RUN_SEASON_COUNT = 10;

/** Input passed to the caller when a season simulation input is needed. */
export interface CreateLongRunSeasonInputContext {
  /** One-based season number in the long-run report. */
  readonly seasonNumber: number;
  /** Stable season-specific seed derived from the report seed. */
  readonly seasonSeed: string;
}

/** Input for the deterministic long-run season runner. */
export interface RunLongRunSimulationInput {
  /** Stable report seed used to derive each season seed. */
  readonly seed: string;
  /** Number of seasons to simulate. */
  readonly seasonCount?: number;
  /** Caller-provided bridge from content data to one engine season input. */
  readonly createSeasonInput: (context: CreateLongRunSeasonInputContext) => SimulateSeasonInput;
}

/** One simulated season in a long-run report. */
export interface LongRunSeasonResult {
  /** One-based season number. */
  readonly seasonNumber: number;
  /** Stable season-specific seed. */
  readonly seasonSeed: string;
  /** Raw deterministic engine season result for later metric steps. */
  readonly result: SimulateSeasonResult;
}

/** Result of running a deterministic multi-season simulation. */
export interface LongRunSimulationResult {
  /** Original report seed. */
  readonly seed: string;
  /** Number of simulated seasons. */
  readonly seasonCount: number;
  /** Ordered season results. */
  readonly seasons: readonly LongRunSeasonResult[];
}

/**
 * Runs a deterministic sequence of season simulations.
 *
 * The runner deliberately does not import content. Apps provide the content
 * bridge through `createSeasonInput`, keeping this package reusable for future
 * generated worlds and test fixtures.
 */
export function runLongRunSimulation(input: RunLongRunSimulationInput): LongRunSimulationResult {
  const seasonCount = input.seasonCount ?? DEFAULT_LONG_RUN_SEASON_COUNT;

  if (!Number.isSafeInteger(seasonCount) || seasonCount <= 0) {
    throw new Error(`Long-run season count must be a positive safe integer: ${seasonCount}`);
  }

  const seasons: LongRunSeasonResult[] = [];

  for (let seasonNumber = 1; seasonNumber <= seasonCount; seasonNumber += 1) {
    const seasonSeed = longRunSeasonSeed(input.seed, seasonNumber);
    const seasonInput = input.createSeasonInput({ seasonNumber, seasonSeed });

    seasons.push({
      seasonNumber,
      seasonSeed,
      result: simulateSeason(seasonInput),
    });
  }

  return {
    seed: input.seed,
    seasonCount,
    seasons,
  };
}

/**
 * Derives a stable human-readable seed for one season in a long-run report.
 */
export function longRunSeasonSeed(seed: string, seasonNumber: number): string {
  return `${seed}-season-${String(seasonNumber).padStart(3, "0")}`;
}

