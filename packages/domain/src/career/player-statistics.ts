import type { PlayerId } from "../types/ids.ts";

/**
 * How much of one statistics source is known for an archived season.
 *
 * `partial` is deliberately distinct from `unavailable`: callers can show the
 * known totals without implying that the omitted fixtures were inspected.
 */
export type CareerPlayerStatisticsCoverage = "complete" | "partial" | "unavailable";

/** Durable per-player totals for one completed career season. */
export interface CareerPlayerSeasonStatisticsRow {
  /** Player summarized by this row, even if the player later leaves the active world. */
  readonly playerId: PlayerId;
  /** Matches started during the season. */
  readonly starts: number;
  /** Matches entered from the substitutes' bench. */
  readonly substituteAppearances: number;
  /** Total minutes recorded by the participation ledger. */
  readonly minutes: number;
  /** Sum of structured match ratings used for a weighted career average. */
  readonly ratingTotal: number;
  /** Number of structured match-rating samples included in `ratingTotal`. */
  readonly ratingSamples: number;
  /** Goals present in structured match reports. */
  readonly goals: number;
  /** Assists present in structured match reports. */
  readonly assists: number;
  /** Goalkeeper saves present in structured match reports. */
  readonly saves: number;
}

/**
 * Durable player-statistics slice attached to one completed-season archive.
 *
 * Rows are ordered lexicographically by `playerId`; no active-player foreign
 * key is part of this contract because retired players remain historical facts.
 */
export interface CareerPlayerSeasonStatistics {
  /** Coverage of starts, substitute appearances, minutes, and ratings. */
  readonly participationCoverage: CareerPlayerStatisticsCoverage;
  /** Coverage of goals, assists, and goalkeeper saves. */
  readonly eventCoverage: CareerPlayerStatisticsCoverage;
  /** Canonically ordered per-player totals. */
  readonly rows: readonly CareerPlayerSeasonStatisticsRow[];
}

/** Machine-readable validation failures for archived player statistics. */
export type CareerPlayerStatisticsContractErrorCode =
  | "invalid_coverage"
  | "invalid_count"
  | "invalid_rating"
  | "duplicate_player"
  | "unordered_player";

/** Typed error thrown when archived player-statistics facts are inconsistent. */
export class CareerPlayerStatisticsContractError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: CareerPlayerStatisticsContractErrorCode;

  /** Creates an archived player-statistics validation error. */
  public constructor(code: CareerPlayerStatisticsContractErrorCode, message: string) {
    super(message);
    this.name = "CareerPlayerStatisticsContractError";
    this.code = code;
  }
}

/**
 * Validates and copies one archived player-statistics slice.
 *
 * Missing legacy data is normalized to explicit unavailable coverage so every
 * downstream selector can distinguish it from a truthful season of zeroes.
 */
export function createCareerPlayerSeasonStatistics(
  input: CareerPlayerSeasonStatistics | undefined,
): CareerPlayerSeasonStatistics {
  if (input === undefined) {
    return {
      participationCoverage: "unavailable",
      eventCoverage: "unavailable",
      rows: [],
    };
  }

  assertCoverage(input.participationCoverage, "participation");
  assertCoverage(input.eventCoverage, "event");

  const rows: CareerPlayerSeasonStatisticsRow[] = [];
  const seenPlayerIds = new Set<PlayerId>();
  let previousPlayerId: PlayerId | undefined;

  for (const inputRow of input.rows) {
    if (seenPlayerIds.has(inputRow.playerId)) {
      throw new CareerPlayerStatisticsContractError(
        "duplicate_player",
        `duplicate archived player-statistics row: ${inputRow.playerId}`,
      );
    }
    if (previousPlayerId !== undefined && String(inputRow.playerId) < String(previousPlayerId)) {
      throw new CareerPlayerStatisticsContractError(
        "unordered_player",
        `archived player-statistics rows must be ordered by player ID: ${inputRow.playerId}`,
      );
    }

    const row = createRow(inputRow);
    rows.push(row);
    seenPlayerIds.add(row.playerId);
    previousPlayerId = row.playerId;
  }

  return {
    participationCoverage: input.participationCoverage,
    eventCoverage: input.eventCoverage,
    rows,
  };
}

/** Builds and validates one defensive copy of a durable season row. */
function createRow(input: CareerPlayerSeasonStatisticsRow): CareerPlayerSeasonStatisticsRow {
  assertCount(input.starts, "starts", input.playerId);
  assertCount(input.substituteAppearances, "substitute appearances", input.playerId);
  assertCount(input.minutes, "minutes", input.playerId);
  assertCount(input.ratingSamples, "rating samples", input.playerId);
  assertCount(input.goals, "goals", input.playerId);
  assertCount(input.assists, "assists", input.playerId);
  assertCount(input.saves, "saves", input.playerId);

  if (input.ratingSamples > input.starts + input.substituteAppearances) {
    throw new CareerPlayerStatisticsContractError(
      "invalid_rating",
      `archived rating samples exceed appearances for ${input.playerId}`,
    );
  }
  if (!Number.isFinite(input.ratingTotal) || input.ratingTotal < 0) {
    throw new CareerPlayerStatisticsContractError(
      "invalid_rating",
      `archived rating total must be non-negative and finite for ${input.playerId}: ${input.ratingTotal}`,
    );
  }
  if (input.ratingSamples === 0 && input.ratingTotal !== 0) {
    throw new CareerPlayerStatisticsContractError(
      "invalid_rating",
      `archived rating total must be zero without samples for ${input.playerId}`,
    );
  }
  if (input.ratingSamples > 0) {
    const averageRating = input.ratingTotal / input.ratingSamples;
    if (averageRating < 1 || averageRating > 10) {
      throw new CareerPlayerStatisticsContractError(
        "invalid_rating",
        `archived average rating must stay in the inclusive 1..10 range for ${input.playerId}`,
      );
    }
  }

  return { ...input };
}

/** Rejects unsupported runtime coverage values loaded from external storage. */
function assertCoverage(value: CareerPlayerStatisticsCoverage, source: string): void {
  if (value !== "complete" && value !== "partial" && value !== "unavailable") {
    throw new CareerPlayerStatisticsContractError(
      "invalid_coverage",
      `invalid ${source} player-statistics coverage: ${String(value)}`,
    );
  }
}

/** Rejects negative, fractional, or unsafe count values. */
function assertCount(value: number, label: string, playerId: PlayerId): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new CareerPlayerStatisticsContractError(
      "invalid_count",
      `archived ${label} must be a non-negative safe integer for ${playerId}: ${value}`,
    );
  }
}
