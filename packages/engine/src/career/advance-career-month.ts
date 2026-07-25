import {
  createCareerState,
  createPlayerParticipationLedger,
  type CareerState,
  type GameDate,
  type PlayerDevelopmentMonthKey,
  type PlayerId,
  type PlayerParticipationLedger,
  type PlayerParticipationRow,
  type SeasonTransferWindows,
  type SeasonId,
} from "@game/domain";

import {
  advanceAiMarketLifecycle,
  type AdvanceAiMarketLifecycleResult,
} from "./ai-market-lifecycle.ts";
import { developPlayersForSeason, type PlayerDevelopmentChange } from "./player-development.ts";
import {
  advanceAiContractLifecycle,
  type AdvanceAiContractLifecycleResult,
} from "./ai-contract-lifecycle.ts";

/** Input for the canonical monthly career player lifecycle checkpoint. */
export interface AdvanceCareerMonthsInput {
  /** Durable career state before monthly lifecycle is applied. */
  readonly careerState: CareerState;
  /** Stable world seed used by deterministic player development. */
  readonly worldSeed: string;
  /** Date where the advancement starts. Defaults to the current career date. */
  readonly fromDate?: GameDate;
  /** Date reached by the caller's calendar route. */
  readonly toDate: GameDate;
  /** Season whose participation facts are being closed. Defaults to the active season. */
  readonly seasonId?: SeasonId;
  /** Optional explicit player order. Defaults to players with eligible participation rows. */
  readonly playerIds?: readonly PlayerId[];
  /**
   * Adapter-owned transfer windows for the active competition season.
   *
   * The engine cannot infer competition dates. When omitted, monthly contract
   * and development work still advances, but no AI market decision is made.
   */
  readonly transferWindows?: SeasonTransferWindows;
}

/** Structured diagnostic for one applied season/month checkpoint. */
export interface CareerMonthlyLifecycleSummary {
  /** Season whose participation window was processed. */
  readonly seasonId: SeasonId;
  /** Month key that became closed, for example `2026-08`. */
  readonly monthKey: PlayerDevelopmentMonthKey;
  /** Number of open participation rows consumed for this month. */
  readonly participationRowCount: number;
  /** Number of players represented by consumed rows. */
  readonly playerCount: number;
  /** Number of player development summaries emitted by the underlying lifecycle pass. */
  readonly developmentChangeCount: number;
  /** Number of rows with positive growth. */
  readonly playersImproved: number;
  /** Number of rows with any decline. */
  readonly playersDeclined: number;
  /** Rounded total positive growth across emitted rows. */
  readonly totalGrowth: number;
  /** Rounded total decline across emitted rows. */
  readonly totalDecline: number;
  /** Durable checkpoint key stored in the player participation ledger. */
  readonly checkpointKey: string;
}

/** Result of a pure monthly lifecycle advancement. */
export interface AdvanceCareerMonthsResult {
  /** Copied career state with eligible months processed exactly once. */
  readonly careerState: CareerState;
  /** Structured summaries for each newly closed month. */
  readonly summaries: readonly CareerMonthlyLifecycleSummary[];
  /** AI renewal decisions and ownership expiries reached by this calendar route. */
  readonly contractLifecycle?: AdvanceAiContractLifecycleResult;
  /** AI market facts reached through canonical negotiations when windows were supplied. */
  readonly marketLifecycle?: AdvanceAiMarketLifecycleResult;
}

/**
 * Applies player lifecycle work for participation months that are safely past.
 *
 * The participation ledger's `closedMonthKeys` is the durable idempotency
 * checkpoint. Callers may re-run this function after reloads or through another
 * calendar route; already closed months are ignored instead of re-developed.
 */
export function advanceCareerMonths(input: AdvanceCareerMonthsInput): AdvanceCareerMonthsResult {
  const seasonId = input.seasonId ?? input.careerState.gameState.calendar.currentSeasonId;
  const fromDate = input.fromDate ?? input.careerState.gameState.calendar.currentDate;
  const contractLifecycle = input.careerState.seniorSquadState === undefined
    ? undefined
    : advanceAiContractLifecycle({
        careerState: input.careerState,
        fromDate,
        throughDate: input.toDate,
      });
  const careerStateAfterContracts = contractLifecycle?.careerState ?? input.careerState;
  const marketLifecycle = input.transferWindows === undefined
    || careerStateAfterContracts.seniorSquadState === undefined
    || careerStateAfterContracts.clubFinanceState === undefined
    ? undefined
    : advanceAiMarketLifecycle({
        careerState: careerStateAfterContracts,
        fromDate,
        throughDate: input.toDate,
        transferWindows: input.transferWindows,
      });
  const careerStateAfterMarket = marketLifecycle?.careerState ?? careerStateAfterContracts;
  const eligibleRows = eligibleOpenParticipationRows({
    ledger: careerStateAfterMarket.playerParticipationLedger,
    seasonId,
    beforeMonthKey: monthKeyForCareerDate(input.toDate),
    playerIds: input.playerIds,
  });

  if (input.toDate <= fromDate || eligibleRows.length === 0) {
    return {
      careerState: careerStateAfterMarket,
      summaries: [],
      ...(contractLifecycle === undefined ? {} : { contractLifecycle }),
      ...(marketLifecycle === undefined ? {} : { marketLifecycle }),
    };
  }

  let careerState = careerStateAfterMarket;
  const summaries: CareerMonthlyLifecycleSummary[] = [];

  for (const monthKey of uniqueSortedMonthKeys(eligibleRows)) {
    const monthRows = eligibleRows.filter((row) => row.monthKey === monthKey);
    const filteredLedger = ledgerForEligibleRows(careerState.playerParticipationLedger, monthRows);
    const developed = developPlayersForSeason({
      careerState: createCareerState({
        ...careerState,
        playerParticipationLedger: filteredLedger,
      }),
      worldSeed: input.worldSeed,
      seasonId,
      playerIds: input.playerIds ?? uniquePlayerIds(monthRows),
    });
    const playerParticipationLedger = mergeClosedMonths(
      careerState.playerParticipationLedger,
      developed.careerState.playerParticipationLedger,
    );

    careerState = createCareerState({
      ...careerState,
      gameState: {
        ...careerState.gameState,
        players: developed.careerState.gameState.players,
      },
      ...(playerParticipationLedger === undefined ? {} : { playerParticipationLedger }),
    });

    summaries.push(monthlySummary({
      seasonId,
      monthKey,
      rows: monthRows,
      changes: developed.changes,
      closedMonthKeys: developed.careerState.playerParticipationLedger?.closedMonthKeys ?? [],
    }));
  }

  return {
    careerState,
    summaries,
    ...(contractLifecycle === undefined ? {} : { contractLifecycle }),
    ...(marketLifecycle === undefined ? {} : { marketLifecycle }),
  };
}

/** Returns the stable development month key for a game date. */
export function monthKeyForCareerDate(date: GameDate): PlayerDevelopmentMonthKey {
  const { year, month } = civilDateFromEpochDay(Number(date));
  return `${year}-${String(month).padStart(2, "0")}`;
}

function eligibleOpenParticipationRows(input: {
  readonly ledger: PlayerParticipationLedger | undefined;
  readonly seasonId: SeasonId;
  readonly beforeMonthKey: PlayerDevelopmentMonthKey;
  readonly playerIds: readonly PlayerId[] | undefined;
}): readonly PlayerParticipationRow[] {
  if (input.ledger === undefined) {
    return [];
  }

  const playerFilter = input.playerIds === undefined ? undefined : new Set(input.playerIds);
  const closed = new Set(input.ledger.closedMonthKeys);
  return input.ledger.rowKeys
    .map((rowKey) => input.ledger?.rows[rowKey])
    .filter((row): row is PlayerParticipationRow =>
      row !== undefined
      && row.seasonId === input.seasonId
      && row.monthKey < input.beforeMonthKey
      && !closed.has(`${row.seasonId}|${row.monthKey}`)
      && (playerFilter === undefined || playerFilter.has(row.playerId)),
    );
}

function ledgerForEligibleRows(
  sourceLedger: PlayerParticipationLedger | undefined,
  rows: readonly PlayerParticipationRow[],
): PlayerParticipationLedger {
  const source = createPlayerParticipationLedger(sourceLedger);
  const copiedRows: Record<string, PlayerParticipationRow> = {};
  const rowKeys: string[] = [];

  for (const row of rows) {
    copiedRows[row.rowKey] = row;
    rowKeys.push(row.rowKey);
  }

  return createPlayerParticipationLedger({
    rows: copiedRows,
    rowKeys,
    closedMonthKeys: source.closedMonthKeys,
  });
}

function mergeClosedMonths(
  originalLedger: PlayerParticipationLedger | undefined,
  developedLedger: PlayerParticipationLedger | undefined,
): PlayerParticipationLedger | undefined {
  if (originalLedger === undefined && developedLedger === undefined) {
    return undefined;
  }

  const original = createPlayerParticipationLedger(originalLedger);
  const developed = createPlayerParticipationLedger(developedLedger);
  return createPlayerParticipationLedger({
    rows: original.rows,
    rowKeys: original.rowKeys,
    closedMonthKeys: [...original.closedMonthKeys, ...developed.closedMonthKeys],
  });
}

function monthlySummary(input: {
  readonly seasonId: SeasonId;
  readonly monthKey: PlayerDevelopmentMonthKey;
  readonly rows: readonly PlayerParticipationRow[];
  readonly changes: readonly PlayerDevelopmentChange[];
  readonly closedMonthKeys: readonly string[];
}): CareerMonthlyLifecycleSummary {
  const rowPlayers = new Set(input.rows.map((row) => row.playerId));
  const changes = input.changes.filter((change) => rowPlayers.has(change.playerId));

  return {
    seasonId: input.seasonId,
    monthKey: input.monthKey,
    participationRowCount: input.rows.length,
    playerCount: rowPlayers.size,
    developmentChangeCount: changes.length,
    playersImproved: changes.filter((change) => change.totalGrowth > 0).length,
    playersDeclined: changes.filter((change) => change.totalDecline > 0).length,
    totalGrowth: roundSummaryDelta(changes.reduce((sum, change) => sum + change.totalGrowth, 0)),
    totalDecline: roundSummaryDelta(changes.reduce((sum, change) => sum + change.totalDecline, 0)),
    checkpointKey: input.closedMonthKeys.find((key) => key === `${input.seasonId}|${input.monthKey}`) ?? `${input.seasonId}|${input.monthKey}`,
  };
}

function uniqueSortedMonthKeys(rows: readonly PlayerParticipationRow[]): readonly PlayerDevelopmentMonthKey[] {
  return [...new Set(rows.map((row) => row.monthKey))].sort();
}

function uniquePlayerIds(rows: readonly PlayerParticipationRow[]): readonly PlayerId[] {
  return [...new Set(rows.map((row) => row.playerId))];
}

function roundSummaryDelta(value: number): number {
  return Math.round(value * 100) / 100;
}

function civilDateFromEpochDay(epochDay: number): { readonly year: number; readonly month: number } {
  const shiftedDay = epochDay + 719_468;
  const era = Math.floor(shiftedDay / 146_097);
  const dayOfEra = shiftedDay - era * 146_097;
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1_460) + Math.floor(dayOfEra / 36_524) - Math.floor(dayOfEra / 146_096)) / 365);
  const yearDay = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPrime = Math.floor((5 * yearDay + 2) / 153);
  const month = monthPrime < 10 ? monthPrime + 3 : monthPrime - 9;
  const year = era * 400 + yearOfEra + (month <= 2 ? 1 : 0);

  return { year, month };
}
