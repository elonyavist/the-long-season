import type { FixtureId, PlayerId, SeasonId } from "../types/ids.ts";
import { isCanonicalPlayerRole, type CanonicalPlayerRole } from "../tactics/player-roles.ts";

/** Stable month key used by the development ledger, for example `2026-08`. */
export type PlayerDevelopmentMonthKey = string;

/** Machine-readable player-participation ledger failure. */
export type PlayerParticipationLedgerErrorCode =
  | "invalid_month_key"
  | "invalid_row_key"
  | "duplicate_row_key"
  | "row_key_mismatch"
  | "invalid_minutes"
  | "invalid_starts"
  | "invalid_substitute_appearances"
  | "invalid_rating"
  | "invalid_role_minutes"
  | "unknown_played_role"
  | "duplicate_fixture_accrual"
  | "closed_month_accrual";

/** Typed error thrown when durable participation facts are inconsistent. */
export class PlayerParticipationLedgerError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: PlayerParticipationLedgerErrorCode;

  /** Creates a participation-ledger validation error. */
  public constructor(code: PlayerParticipationLedgerErrorCode, message: string) {
    super(message);
    this.name = "PlayerParticipationLedgerError";
    this.code = code;
  }
}

/** Durable player participation row for one player inside one season/month. */
export interface PlayerParticipationRow {
  /** Stable row key derived from season, month, and player. */
  readonly rowKey: string;
  /** Player whose participation is summarized by this row. */
  readonly playerId: PlayerId;
  /** Season that owns this row. */
  readonly seasonId: SeasonId;
  /** Development month inside the season, for example `2026-08`. */
  readonly monthKey: PlayerDevelopmentMonthKey;
  /** Number of starts in this month. */
  readonly starts: number;
  /** Number of substitute appearances in this month. */
  readonly substituteAppearances: number;
  /** Total minutes played in this month. */
  readonly minutes: number;
  /** Sum of structured match ratings sampled for this player. */
  readonly ratingTotal: number;
  /** Number of match-rating samples included in `ratingTotal`. */
  readonly ratingSamples: number;
  /** Minutes grouped by canonical role actually played. */
  readonly playedRoleMinutes: Readonly<Partial<Record<CanonicalPlayerRole, number>>>;
  /** Fixture IDs already applied to this row for idempotency. */
  readonly appliedFixtureIds: readonly FixtureId[];
}

/** Durable language-agnostic participation ledger for current-season development. */
export interface PlayerParticipationLedger {
  /** Lookup of monthly participation rows. */
  readonly rows: Readonly<Record<string, PlayerParticipationRow>>;
  /** Stable row order for deterministic consumers. */
  readonly rowKeys: readonly string[];
  /** Season/month keys already closed for development application. */
  readonly closedMonthKeys: readonly string[];
}

/** One fixture-level contribution to accrue into the participation ledger. */
export interface PlayerFixtureParticipationContribution {
  /** Fixture producing the contribution. */
  readonly fixtureId: FixtureId;
  /** Player receiving minutes and rating facts. */
  readonly playerId: PlayerId;
  /** Season that owns the contribution. */
  readonly seasonId: SeasonId;
  /** Development month receiving the contribution. */
  readonly monthKey: PlayerDevelopmentMonthKey;
  /** Whether the player started this fixture. */
  readonly started: boolean;
  /** Whether the player entered from the bench. */
  readonly substituteAppearance: boolean;
  /** Minutes played in this fixture. */
  readonly minutes: number;
  /** Optional structured match rating on the `1..10` scale. */
  readonly rating?: number;
  /** Minutes by canonical played role for this fixture. */
  readonly playedRoleMinutes: Readonly<Partial<Record<CanonicalPlayerRole, number>>>;
}

/** Builds the deterministic row key used by the participation ledger. */
export function playerParticipationRowKey(
  seasonId: SeasonId,
  monthKey: PlayerDevelopmentMonthKey,
  playerId: PlayerId,
): string {
  assertMonthKey(monthKey);
  return `${seasonId}|${monthKey}|${playerId}`;
}

/** Builds an empty durable participation ledger. */
export function createEmptyPlayerParticipationLedger(): PlayerParticipationLedger {
  return {
    rows: {},
    rowKeys: [],
    closedMonthKeys: [],
  };
}

/** Validates and copies a participation ledger while preserving row order. */
export function createPlayerParticipationLedger(input: PlayerParticipationLedger | undefined): PlayerParticipationLedger {
  if (input === undefined) {
    return createEmptyPlayerParticipationLedger();
  }

  const rows: Record<string, PlayerParticipationRow> = {};
  const seenRows = new Set<string>();
  const closedMonthKeys = validateClosedMonthKeys(input.closedMonthKeys);

  for (const rowKey of input.rowKeys) {
    if (rowKey.length === 0) {
      throw new PlayerParticipationLedgerError("invalid_row_key", "participation row key must not be empty");
    }
    if (seenRows.has(rowKey)) {
      throw new PlayerParticipationLedgerError("duplicate_row_key", `duplicate participation row key: ${rowKey}`);
    }

    const row = input.rows[rowKey];
    if (row === undefined) {
      throw new PlayerParticipationLedgerError("invalid_row_key", `participation row is missing: ${rowKey}`);
    }

    const copied = createPlayerParticipationRow(row);
    if (copied.rowKey !== rowKey) {
      throw new PlayerParticipationLedgerError("row_key_mismatch", `participation row key mismatch: ${rowKey}`);
    }

    seenRows.add(rowKey);
    rows[rowKey] = copied;
  }

  for (const rowKey of Object.keys(input.rows)) {
    if (!seenRows.has(rowKey)) {
      throw new PlayerParticipationLedgerError("invalid_row_key", `unordered participation row: ${rowKey}`);
    }
  }

  return {
    rows,
    rowKeys: [...input.rowKeys],
    closedMonthKeys,
  };
}

/** Accrues one fixture contribution exactly once into the durable ledger. */
export function accruePlayerFixtureParticipation(
  ledger: PlayerParticipationLedger,
  contribution: PlayerFixtureParticipationContribution,
): PlayerParticipationLedger {
  const source = createPlayerParticipationLedger(ledger);
  validateContribution(contribution);
  const monthKey = participationMonthKey(contribution.seasonId, contribution.monthKey);
  if (source.closedMonthKeys.includes(monthKey)) {
    throw new PlayerParticipationLedgerError("closed_month_accrual", `participation month is already closed: ${monthKey}`);
  }

  const rowKey = playerParticipationRowKey(contribution.seasonId, contribution.monthKey, contribution.playerId);
  const current = source.rows[rowKey] ?? emptyParticipationRow(rowKey, contribution);
  if (current.appliedFixtureIds.includes(contribution.fixtureId)) {
    throw new PlayerParticipationLedgerError("duplicate_fixture_accrual", `fixture already accrued for player: ${contribution.fixtureId}`);
  }

  const row = createPlayerParticipationRow({
    rowKey,
    playerId: contribution.playerId,
    seasonId: contribution.seasonId,
    monthKey: contribution.monthKey,
    starts: current.starts + (contribution.started ? 1 : 0),
    substituteAppearances: current.substituteAppearances + (contribution.substituteAppearance ? 1 : 0),
    minutes: current.minutes + contribution.minutes,
    ratingTotal: current.ratingTotal + (contribution.rating ?? 0),
    ratingSamples: current.ratingSamples + (contribution.rating === undefined ? 0 : 1),
    playedRoleMinutes: mergeRoleMinutes(current.playedRoleMinutes, contribution.playedRoleMinutes),
    appliedFixtureIds: [...current.appliedFixtureIds, contribution.fixtureId],
  });

  const rows = { ...source.rows, [rowKey]: row };
  const rowKeys = source.rowKeys.includes(rowKey) ? source.rowKeys : [...source.rowKeys, rowKey];

  return {
    rows,
    rowKeys,
    closedMonthKeys: source.closedMonthKeys,
  };
}

/** Marks a development month as closed after growth has consumed its facts. */
export function closePlayerParticipationMonth(
  ledger: PlayerParticipationLedger,
  seasonId: SeasonId,
  monthKey: PlayerDevelopmentMonthKey,
): PlayerParticipationLedger {
  const source = createPlayerParticipationLedger(ledger);
  const closedMonthKey = participationMonthKey(seasonId, monthKey);

  return {
    ...source,
    closedMonthKeys: source.closedMonthKeys.includes(closedMonthKey)
      ? source.closedMonthKeys
      : [...source.closedMonthKeys, closedMonthKey],
  };
}

/** Removes all rows and closed-month markers for one completed season. */
export function resetPlayerParticipationSeason(
  ledger: PlayerParticipationLedger,
  seasonId: SeasonId,
): PlayerParticipationLedger {
  const source = createPlayerParticipationLedger(ledger);
  const rows: Record<string, PlayerParticipationRow> = {};
  const rowKeys: string[] = [];
  const seasonPrefix = `${seasonId}|`;

  for (const rowKey of source.rowKeys) {
    if (rowKey.startsWith(seasonPrefix)) {
      continue;
    }

    const row = source.rows[rowKey];
    if (row !== undefined) {
      rows[rowKey] = row;
      rowKeys.push(rowKey);
    }
  }

  return {
    rows,
    rowKeys,
    closedMonthKeys: source.closedMonthKeys.filter((key) => !key.startsWith(seasonPrefix)),
  };
}

/** Returns the average structured match rating for one row, when available. */
export function playerParticipationAverageRating(row: PlayerParticipationRow): number | undefined {
  const copied = createPlayerParticipationRow(row);
  return copied.ratingSamples === 0 ? undefined : copied.ratingTotal / copied.ratingSamples;
}

function createPlayerParticipationRow(input: PlayerParticipationRow): PlayerParticipationRow {
  const expectedKey = playerParticipationRowKey(input.seasonId, input.monthKey, input.playerId);
  if (input.rowKey !== expectedKey) {
    throw new PlayerParticipationLedgerError("row_key_mismatch", `participation row key must be derived from season, month, and player: ${input.rowKey}`);
  }
  assertSafeNonNegativeInteger(input.starts, "invalid_starts", "starts");
  assertSafeNonNegativeInteger(input.substituteAppearances, "invalid_substitute_appearances", "substitute appearances");
  assertSafeNonNegativeInteger(input.minutes, "invalid_minutes", "minutes");
  assertSafeNonNegativeInteger(input.ratingSamples, "invalid_rating", "rating samples");

  if (!Number.isFinite(input.ratingTotal) || input.ratingTotal < 0) {
    throw new PlayerParticipationLedgerError("invalid_rating", `rating total must be non-negative and finite: ${input.ratingTotal}`);
  }
  if (input.ratingSamples === 0 && input.ratingTotal !== 0) {
    throw new PlayerParticipationLedgerError("invalid_rating", "rating total must be zero when no samples exist");
  }
  if (input.ratingSamples > 0 && input.ratingTotal / input.ratingSamples > 10) {
    throw new PlayerParticipationLedgerError("invalid_rating", `average rating must not exceed 10: ${input.ratingTotal}/${input.ratingSamples}`);
  }

  const playedRoleMinutes = createPlayedRoleMinutes(input.playedRoleMinutes);
  const roleMinuteTotal = sumRoleMinutes(playedRoleMinutes);
  if (roleMinuteTotal > input.minutes) {
    throw new PlayerParticipationLedgerError("invalid_role_minutes", `role minutes exceed total minutes: ${roleMinuteTotal}/${input.minutes}`);
  }

  return {
    rowKey: input.rowKey,
    playerId: input.playerId,
    seasonId: input.seasonId,
    monthKey: input.monthKey,
    starts: input.starts,
    substituteAppearances: input.substituteAppearances,
    minutes: input.minutes,
    ratingTotal: input.ratingTotal,
    ratingSamples: input.ratingSamples,
    playedRoleMinutes,
    appliedFixtureIds: [...input.appliedFixtureIds],
  };
}

function validateContribution(contribution: PlayerFixtureParticipationContribution): void {
  assertMonthKey(contribution.monthKey);
  assertSafeNonNegativeInteger(contribution.minutes, "invalid_minutes", "minutes");
  if (contribution.minutes > 130) {
    throw new PlayerParticipationLedgerError("invalid_minutes", `fixture minutes are not credible: ${contribution.minutes}`);
  }
  if (contribution.started && contribution.substituteAppearance) {
    throw new PlayerParticipationLedgerError("invalid_substitute_appearances", "a player cannot both start and enter as a substitute");
  }
  if (contribution.rating !== undefined && (!Number.isFinite(contribution.rating) || contribution.rating < 1 || contribution.rating > 10)) {
    throw new PlayerParticipationLedgerError("invalid_rating", `rating must be between 1 and 10: ${contribution.rating}`);
  }

  const roleMinutes = createPlayedRoleMinutes(contribution.playedRoleMinutes);
  if (sumRoleMinutes(roleMinutes) !== contribution.minutes) {
    throw new PlayerParticipationLedgerError("invalid_role_minutes", "fixture role minutes must equal fixture minutes");
  }
}

function emptyParticipationRow(
  rowKey: string,
  contribution: PlayerFixtureParticipationContribution,
): PlayerParticipationRow {
  return {
    rowKey,
    playerId: contribution.playerId,
    seasonId: contribution.seasonId,
    monthKey: contribution.monthKey,
    starts: 0,
    substituteAppearances: 0,
    minutes: 0,
    ratingTotal: 0,
    ratingSamples: 0,
    playedRoleMinutes: {},
    appliedFixtureIds: [],
  };
}

function mergeRoleMinutes(
  left: Readonly<Partial<Record<CanonicalPlayerRole, number>>>,
  right: Readonly<Partial<Record<CanonicalPlayerRole, number>>>,
): Readonly<Partial<Record<CanonicalPlayerRole, number>>> {
  const merged: Partial<Record<CanonicalPlayerRole, number>> = { ...left };
  for (const [role, minutes] of Object.entries(right)) {
    if (!isCanonicalPlayerRole(role) || minutes === undefined) {
      continue;
    }
    merged[role] = (merged[role] ?? 0) + minutes;
  }
  return createPlayedRoleMinutes(merged);
}

function createPlayedRoleMinutes(
  input: Readonly<Partial<Record<CanonicalPlayerRole, number>>>,
): Readonly<Partial<Record<CanonicalPlayerRole, number>>> {
  const playedRoleMinutes: Partial<Record<CanonicalPlayerRole, number>> = {};

  for (const [role, minutes] of Object.entries(input)) {
    if (!isCanonicalPlayerRole(role)) {
      throw new PlayerParticipationLedgerError("unknown_played_role", `unknown played role: ${role}`);
    }
    if (minutes === undefined || minutes === 0) {
      continue;
    }
    assertSafeNonNegativeInteger(minutes, "invalid_role_minutes", `minutes for ${role}`);
    playedRoleMinutes[role] = minutes;
  }

  return playedRoleMinutes;
}

function validateClosedMonthKeys(input: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const closedMonthKeys: string[] = [];

  for (const key of input) {
    if (key.length === 0 || key.split("|").length !== 2) {
      throw new PlayerParticipationLedgerError("invalid_month_key", `invalid closed month key: ${key}`);
    }
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    closedMonthKeys.push(key);
  }

  return closedMonthKeys;
}

function participationMonthKey(seasonId: SeasonId, monthKey: PlayerDevelopmentMonthKey): string {
  assertMonthKey(monthKey);
  return `${seasonId}|${monthKey}`;
}

function assertMonthKey(monthKey: PlayerDevelopmentMonthKey): void {
  if (monthKey.trim().length === 0 || monthKey.includes("|")) {
    throw new PlayerParticipationLedgerError("invalid_month_key", `invalid development month key: ${monthKey}`);
  }
}

function assertSafeNonNegativeInteger(
  value: number,
  code: Extract<PlayerParticipationLedgerErrorCode, "invalid_minutes" | "invalid_starts" | "invalid_substitute_appearances" | "invalid_rating" | "invalid_role_minutes">,
  label: string,
): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new PlayerParticipationLedgerError(code, `${label} must be a non-negative safe integer: ${value}`);
  }
}

function sumRoleMinutes(input: Readonly<Partial<Record<CanonicalPlayerRole, number>>>): number {
  return Object.values(input).reduce((total, minutes) => total + (minutes ?? 0), 0);
}
