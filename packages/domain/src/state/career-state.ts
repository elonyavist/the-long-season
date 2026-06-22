import type { LeagueTableRow } from "../entities/league-table.entity.ts";
import type { ClubId, CompetitionId, FixtureId, PlayerId, SaveId, SeasonId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { Money } from "../value-objects/money.ts";
import { createSelectedLineup, createTacticSetup, type SelectedLineup, type TacticSetup } from "../entities/tactic.entity.ts";
import { createMarketState, type MarketState } from "../entities/transfer.entity.ts";
import { createCareerWorldMetadata, type CareerWorldMetadata } from "./career-world.ts";
import type { GameState } from "./game-state.ts";
import { createYouthAcademyState, type YouthAcademyState } from "./youth-academy-state.ts";

/** Current schema version for durable career-state snapshots. */
export const CAREER_STATE_SCHEMA_VERSION = 1;

/**
 * One completed permanent transfer stored in the career timeline.
 *
 * The first durable history keeps only facts already supported by the market
 * MVP: buyer, seller, player, fee, and date. Loans, wages, clauses, agents, and
 * negotiations are future systems and are intentionally absent.
 */
export interface PermanentTransferHistoryEntry {
  /** Deterministic 1-based history order inside the career save. */
  readonly sequenceNumber: number;
  /** In-world date when the transfer became durable. */
  readonly occurredOn: GameDate;
  /** Club receiving the player. */
  readonly buyingClubId: ClubId;
  /** Club losing the player. */
  readonly sellingClubId: ClubId;
  /** Player moved by this permanent transfer. */
  readonly playerId: PlayerId;
  /** Permanent transfer fee in minor units. */
  readonly transferFee: Money;
}

/**
 * Durable manager preparation for the selected club's upcoming match work.
 *
 * The preparation slice stores explicit user choices only. It may be partial
 * while the manager has saved a lineup but not a tactic, or vice versa. Match
 * advancement can later require both pieces before simulating a fixture.
 */
export interface CareerMatchPreparation {
  /** Club controlled by this preparation snapshot. */
  readonly selectedClubId: ClubId;
  /** Optional fixture this preparation is intended for. */
  readonly targetFixtureId?: FixtureId;
  /** Saved selected lineup, when the manager has chosen one. */
  readonly selectedLineup?: SelectedLineup;
  /** Saved tactic setup, when the manager has chosen one. */
  readonly tactic?: TacticSetup;
  /** In-world date when this preparation snapshot was last updated. */
  readonly updatedAt: GameDate;
}

/**
 * Compact aggregate goal facts for one archived career season.
 *
 * The archive stores structured numbers only. Presentation adapters can render
 * goals per match or labels later through localization.
 */
export interface CareerSeasonAggregateGoals {
  /** Number of played fixtures included in the archived season. */
  readonly fixtureCount: number;
  /** Total goals scored in those fixtures. */
  readonly totalGoals: number;
}

/**
 * Durable compact history for one completed season.
 *
 * The archive intentionally stores the final table snapshot and key facts, not
 * rendered report text. This keeps saves language-agnostic and small enough for
 * multi-season reports.
 */
export interface CareerSeasonArchiveEntry {
  /** Deterministic 1-based history order inside the career save. */
  readonly sequenceNumber: number;
  /** Completed season ID. */
  readonly seasonId: SeasonId;
  /** Competition summarized by this entry. */
  readonly competitionId: CompetitionId;
  /** Final table snapshot at season end. */
  readonly finalTable: readonly LeagueTableRow[];
  /** Champion club from the final table. */
  readonly championClubId: ClubId;
  /** Final table row for the manager's selected club. */
  readonly selectedClubFinish: LeagueTableRow;
  /** Aggregate goal facts for the archived season. */
  readonly aggregateGoals: CareerSeasonAggregateGoals;
}

/**
 * Minimal durable state for one manager career.
 *
 * `CareerState` wraps the current `GameState` instead of duplicating world data.
 * It adds only the manager-facing persistence slice needed after the market MVP:
 * selected club, transfer funds, permanent-transfer history, and optional
 * career systems such as the youth academy.
 */
export interface CareerState {
  /** Stable save/career identifier, for example `save:career-demo`. */
  readonly saveId: SaveId;
  /** Career snapshot schema version for future migrations. */
  readonly schemaVersion: number;
  /** Optional durable metadata for the generated world used by this career. */
  readonly careerWorld?: CareerWorldMetadata;
  /** Club controlled by the manager. */
  readonly selectedClubId: ClubId;
  /** Current playable world snapshot. */
  readonly gameState: GameState;
  /** Durable transfer funds for the current market MVP. */
  readonly marketState: MarketState;
  /** Ordered permanent-transfer decisions already applied to this career. */
  readonly transferHistory: readonly PermanentTransferHistoryEntry[];
  /** Optional durable youth academy membership and lifecycle state. */
  readonly youthAcademyState?: YouthAcademyState;
  /** Optional saved match-preparation choices for the selected club. */
  readonly matchPreparation?: CareerMatchPreparation;
  /** Ordered compact completed-season history. */
  readonly seasonHistory?: readonly CareerSeasonArchiveEntry[];
}

/** Machine-readable career-state validation failure. */
export type CareerStateContractErrorCode =
  | "unsupported_schema_version"
  | "selected_club_not_found"
  | "selected_club_not_ordered"
  | "budget_club_not_found"
  | "invalid_money"
  | "invalid_history_sequence"
  | "duplicate_history_sequence"
  | "history_buying_club_not_found"
  | "history_selling_club_not_found"
  | "history_player_not_found"
  | "invalid_season_history_sequence"
  | "duplicate_season_history_sequence"
  | "season_history_final_table_empty"
  | "season_history_final_table_club_not_found"
  | "season_history_champion_club_not_found"
  | "season_history_champion_not_first"
  | "season_history_selected_club_mismatch"
  | "season_history_invalid_aggregate_goals"
  | "match_preparation_selected_club_mismatch"
  | "match_preparation_fixture_not_found"
  | "match_preparation_fixture_selected_club_missing"
  | "match_preparation_lineup_club_mismatch"
  | "match_preparation_player_not_found"
  | "match_preparation_player_not_owned";

/**
 * Typed error thrown when a career-state snapshot is inconsistent.
 *
 * @example
 * if (error instanceof CareerStateContractError && error.code === "selected_club_not_found") {
 *   // Ask the caller to rebuild the save from a valid game snapshot.
 * }
 */
export class CareerStateContractError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: CareerStateContractErrorCode;

  /** Creates a career-state validation error. */
  public constructor(code: CareerStateContractErrorCode, message: string) {
    super(message);
    this.name = "CareerStateContractError";
    this.code = code;
  }
}

/**
 * Builds a validated career-state snapshot.
 *
 * This helper validates only durable state shape and references. It does not
 * evaluate transfers, advance time, write files, or infer manager decisions.
 *
 * @example
 * const career = createCareerState({
 *   saveId: saveId("save:career-demo"),
 *   schemaVersion: CAREER_STATE_SCHEMA_VERSION,
 *   selectedClubId: clubId("club:pro01"),
 *   gameState,
 *   marketState,
 *   transferHistory: [],
 * });
 */
export function createCareerState(input: CareerState): CareerState {
  if (input.schemaVersion !== CAREER_STATE_SCHEMA_VERSION) {
    throw new CareerStateContractError(
      "unsupported_schema_version",
      `unsupported career-state schema version: ${input.schemaVersion}`,
    );
  }

  assertClubExists(input.gameState, input.selectedClubId, "selected_club_not_found");

  if (!hasClubInOrder(input.gameState, input.selectedClubId)) {
    throw new CareerStateContractError("selected_club_not_ordered", `selected club is not ordered: ${input.selectedClubId}`);
  }

  const marketState = createMarketState(input.marketState);
  for (const clubId of marketState.clubBudgetIds) {
    assertClubExists(input.gameState, clubId, "budget_club_not_found");
    assertNonNegativeMoney(marketState.clubBudgets[clubId]?.transferBudget);
  }

  const seenHistorySequences = new Set<number>();
  const transferHistory: PermanentTransferHistoryEntry[] = [];

  for (const entry of input.transferHistory) {
    if (!Number.isSafeInteger(entry.sequenceNumber) || entry.sequenceNumber <= 0) {
      throw new CareerStateContractError("invalid_history_sequence", `invalid transfer history sequence: ${entry.sequenceNumber}`);
    }

    if (seenHistorySequences.has(entry.sequenceNumber)) {
      throw new CareerStateContractError("duplicate_history_sequence", `duplicate transfer history sequence: ${entry.sequenceNumber}`);
    }

    assertClubExists(input.gameState, entry.buyingClubId, "history_buying_club_not_found");
    assertClubExists(input.gameState, entry.sellingClubId, "history_selling_club_not_found");
    assertPlayerExists(input.gameState, entry.playerId);
    assertNonNegativeMoney(entry.transferFee);

    seenHistorySequences.add(entry.sequenceNumber);
    transferHistory.push({ ...entry });
  }

  const seasonHistory = createSeasonHistory(input);
  const youthAcademyState = input.youthAcademyState === undefined
    ? undefined
    : createYouthAcademyState(input.gameState, input.youthAcademyState);

  return {
    saveId: input.saveId,
    schemaVersion: input.schemaVersion,
    ...(input.careerWorld === undefined ? {} : { careerWorld: createCareerWorldMetadata(input.careerWorld) }),
    selectedClubId: input.selectedClubId,
    gameState: input.gameState,
    marketState,
    transferHistory,
    ...(youthAcademyState === undefined ? {} : { youthAcademyState }),
    ...(seasonHistory.length === 0 ? {} : { seasonHistory }),
    ...(input.matchPreparation === undefined
      ? {}
      : { matchPreparation: createCareerMatchPreparation(input.gameState, input.selectedClubId, input.matchPreparation) }),
  };
}

/**
 * Returns the next 1-based permanent-transfer sequence number.
 *
 * The helper uses explicit history order and never enumerates object keys.
 */
export function nextTransferHistorySequence(careerState: CareerState): number {
  let highestSequence = 0;

  for (const entry of careerState.transferHistory) {
    if (entry.sequenceNumber > highestSequence) {
      highestSequence = entry.sequenceNumber;
    }
  }

  return highestSequence + 1;
}

function assertClubExists(
  gameState: GameState,
  clubId: ClubId,
  code: Extract<CareerStateContractErrorCode, `${string}_club_not_found`>,
): void {
  if (gameState.clubs[clubId] === undefined) {
    throw new CareerStateContractError(code, `club does not exist in career game state: ${clubId}`);
  }
}

function assertPlayerExists(gameState: GameState, playerId: PlayerId): void {
  if (gameState.players[playerId] === undefined) {
    throw new CareerStateContractError("history_player_not_found", `player does not exist in career game state: ${playerId}`);
  }
}

function createCareerMatchPreparation(
  gameState: GameState,
  selectedClubId: ClubId,
  input: CareerMatchPreparation,
): CareerMatchPreparation {
  if (input.selectedClubId !== selectedClubId) {
    throw new CareerStateContractError(
      "match_preparation_selected_club_mismatch",
      `match preparation club must match selected club: ${input.selectedClubId}`,
    );
  }

  validatePreparationFixture(gameState, selectedClubId, input.targetFixtureId);
  const selectedLineup = input.selectedLineup === undefined ? undefined : createValidatedPreparationLineup(gameState, selectedClubId, input.selectedLineup);
  const tactic = input.tactic === undefined ? undefined : createTacticSetup(input.tactic);

  return {
    selectedClubId: input.selectedClubId,
    ...(input.targetFixtureId === undefined ? {} : { targetFixtureId: input.targetFixtureId }),
    ...(selectedLineup === undefined ? {} : { selectedLineup }),
    ...(tactic === undefined ? {} : { tactic }),
    updatedAt: input.updatedAt,
  };
}

function createSeasonHistory(input: CareerState): CareerSeasonArchiveEntry[] {
  const seenHistorySequences = new Set<number>();
  const seasonHistory: CareerSeasonArchiveEntry[] = [];

  for (const entry of input.seasonHistory ?? []) {
    if (!Number.isSafeInteger(entry.sequenceNumber) || entry.sequenceNumber <= 0) {
      throw new CareerStateContractError("invalid_season_history_sequence", `invalid season history sequence: ${entry.sequenceNumber}`);
    }

    if (seenHistorySequences.has(entry.sequenceNumber)) {
      throw new CareerStateContractError("duplicate_season_history_sequence", `duplicate season history sequence: ${entry.sequenceNumber}`);
    }

    if (entry.finalTable.length === 0) {
      throw new CareerStateContractError("season_history_final_table_empty", `season history final table must not be empty: ${entry.seasonId}`);
    }

    for (const row of entry.finalTable) {
      assertClubExists(input.gameState, row.clubId, "season_history_final_table_club_not_found");
    }

    assertClubExists(input.gameState, entry.championClubId, "season_history_champion_club_not_found");

    const championRow = entry.finalTable[0];
    if (championRow === undefined || championRow.clubId !== entry.championClubId || championRow.position !== 1) {
      throw new CareerStateContractError("season_history_champion_not_first", `season history champion must be first: ${entry.championClubId}`);
    }

    if (entry.selectedClubFinish.clubId !== input.selectedClubId) {
      throw new CareerStateContractError(
        "season_history_selected_club_mismatch",
        `season history selected club finish must match selected club: ${entry.selectedClubFinish.clubId}`,
      );
    }

    validateAggregateGoals(entry.aggregateGoals);
    seenHistorySequences.add(entry.sequenceNumber);
    seasonHistory.push({
      ...entry,
      finalTable: entry.finalTable.map((row) => ({ ...row })),
      selectedClubFinish: { ...entry.selectedClubFinish },
      aggregateGoals: { ...entry.aggregateGoals },
    });
  }

  return seasonHistory;
}

function validateAggregateGoals(aggregateGoals: CareerSeasonAggregateGoals): void {
  if (
    !Number.isSafeInteger(aggregateGoals.fixtureCount) ||
    aggregateGoals.fixtureCount < 0 ||
    !Number.isSafeInteger(aggregateGoals.totalGoals) ||
    aggregateGoals.totalGoals < 0
  ) {
    throw new CareerStateContractError(
      "season_history_invalid_aggregate_goals",
      `season history aggregate goals must be non-negative safe integers: ${aggregateGoals.fixtureCount}/${aggregateGoals.totalGoals}`,
    );
  }
}

function validatePreparationFixture(gameState: GameState, selectedClubId: ClubId, fixtureId: FixtureId | undefined): void {
  if (fixtureId === undefined) {
    return;
  }

  const fixture = gameState.fixtures[fixtureId];
  if (fixture === undefined) {
    throw new CareerStateContractError("match_preparation_fixture_not_found", `match preparation fixture does not exist: ${fixtureId}`);
  }

  if (fixture.homeClubId !== selectedClubId && fixture.awayClubId !== selectedClubId) {
    throw new CareerStateContractError(
      "match_preparation_fixture_selected_club_missing",
      `match preparation fixture does not include selected club: ${fixtureId}`,
    );
  }
}

function createValidatedPreparationLineup(
  gameState: GameState,
  selectedClubId: ClubId,
  input: SelectedLineup,
): SelectedLineup {
  if (input.clubId !== selectedClubId) {
    throw new CareerStateContractError("match_preparation_lineup_club_mismatch", `lineup club must match selected club: ${input.clubId}`);
  }

  const selectedLineup = createSelectedLineup(input);
  const selectedClub = gameState.clubs[selectedClubId];
  const selectedClubPlayerIds = new Set<PlayerId>(selectedClub?.playerIds ?? []);

  for (const slot of selectedLineup.slots) {
    if (gameState.players[slot.playerId] === undefined) {
      throw new CareerStateContractError("match_preparation_player_not_found", `lineup player does not exist: ${slot.playerId}`);
    }

    if (!selectedClubPlayerIds.has(slot.playerId)) {
      throw new CareerStateContractError("match_preparation_player_not_owned", `lineup player is not owned by selected club: ${slot.playerId}`);
    }
  }

  return selectedLineup;
}

function hasClubInOrder(gameState: GameState, clubId: ClubId): boolean {
  for (const orderedClubId of gameState.clubIds) {
    if (orderedClubId === clubId) {
      return true;
    }
  }

  return false;
}

function assertNonNegativeMoney(amount: Money | undefined): void {
  if (amount === undefined || !Number.isSafeInteger(amount) || amount < 0) {
    throw new CareerStateContractError("invalid_money", `money must be a non-negative safe integer: ${amount}`);
  }
}
