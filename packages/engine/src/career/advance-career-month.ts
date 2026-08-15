import {
  accruePlayerFixtureParticipations,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  closePlayerParticipationMonth,
  selectNextPlayerParticipationDevelopmentBatch,
  type CareerState,
  type AskingPriceCurvesConfig,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type PlayerDevelopmentEnvironmentConfig,
  type PlayerDevelopmentMonthKey,
  type PlayerWagePolicyConfig,
  type PlayerParticipationRow,
  type SeasonTransferWindows,
  type SeasonId,
} from "@game/domain";

import {
  advanceAiMarketLifecycle,
  type AdvanceAiMarketLifecycleResult,
} from "./ai-market-lifecycle.ts";
import {
  developPlayersFromParticipationRows,
  type PlayerMonthlyDevelopmentChange,
} from "./player-development.ts";
import {
  advanceAiContractLifecycle,
  type AdvanceAiContractLifecycleResult,
} from "./ai-contract-lifecycle.ts";
import type { PlayerValuationConfig } from "../market/player-valuation.ts";
import {
  buildLowDetailAcademyParticipation,
  isLowDetailAcademyFixtureId,
  LOW_DETAIL_ACADEMY_FIXTURE_MINUTES,
} from "./academy-participation.ts";

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
  /** Version-linked wage policy required by monthly contract lifecycles. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Version-linked market policy required by affordability and AI decisions. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  /** Canonical public-assessment policy used by contract and market decisions. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Version-linked policy used to derive each row's recorded club environment. */
  readonly playerDevelopmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
  /** Normal quarterly cadence or the explicit season-end residual flush. */
  readonly developmentCheckpointMode: "complete_quarters" | "season_end_flush";
  /** Season whose participation facts are being closed. Defaults to the active season. */
  readonly seasonId?: SeasonId;
  /**
   * Adapter-owned transfer windows for the active competition season.
   *
   * The engine cannot infer competition dates. When omitted, monthly contract
   * and development work still advances, but no AI market decision is made.
   */
  readonly transferWindows?: SeasonTransferWindows;
  /** Versioned asking-price content paired with `valuationConfig`. */
  readonly askingPriceConfig?: AskingPriceCurvesConfig;
  /** Analysis-only Phase 81A ablation seam; closeout owns removal. */
  readonly useRoleSuccessionMarketNeeds?: boolean;
  /** Analysis-only Phase 81A legacy-order control; closeout owns removal. */
  readonly aiMarketNeedSubmissionOrder?: "legacy" | "bounded_succession";
  /** Observation-only L6.40 succession facts; ordinary careers leave it off. */
  readonly collectRoleSuccessionSnapshots?: boolean;
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
  /** Low-detail academy activity derived from the rows closed this month. */
  readonly academyParticipation?: CareerAcademyParticipationSummary;
}

/** Structured academy activity read from canonical participation fixture IDs. */
export interface CareerAcademyParticipationSummary {
  readonly fixtureCount: number;
  readonly appearanceCount: number;
  readonly playerCount: number;
  readonly minutes: number;
  readonly fullProgrammePlayerMonthCount: number;
  readonly reducedProgrammePlayerMonthCount: number;
  readonly fullyReplacedPlayerMonthCount: number;
  readonly missingPlayerMonthCount: number;
  readonly invalidMinuteCount: number;
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
        wagePolicy: input.wagePolicy,
        marketBehaviorPolicy: input.marketBehaviorPolicy,
        valuationConfig: input.valuationConfig,
      });
  const careerStateAfterContracts = contractLifecycle?.careerState ?? input.careerState;
  if (
    input.transferWindows !== undefined
    && input.askingPriceConfig === undefined
  ) {
    throw new Error("AI market advancement requires explicit asking-price config");
  }
  const marketLifecycle = input.transferWindows === undefined
    || careerStateAfterContracts.seniorSquadState === undefined
    || careerStateAfterContracts.clubFinanceState === undefined
    ? undefined
    : advanceAiMarketLifecycle({
        careerState: careerStateAfterContracts,
        fromDate,
        throughDate: input.toDate,
        transferWindows: input.transferWindows,
        valuationConfig: input.valuationConfig,
        askingPriceConfig: input.askingPriceConfig!,
        wagePolicy: input.wagePolicy,
        marketBehaviorPolicy: input.marketBehaviorPolicy,
        ...(input.useRoleSuccessionMarketNeeds === undefined
          ? {}
          : { useRoleSuccessionNeeds: input.useRoleSuccessionMarketNeeds }),
        ...(input.aiMarketNeedSubmissionOrder === undefined
          ? {}
          : { needSubmissionOrder: input.aiMarketNeedSubmissionOrder }),
        ...(input.collectRoleSuccessionSnapshots === undefined
          ? {}
          : { collectRoleSuccessionSnapshots: input.collectRoleSuccessionSnapshots }),
      });
  const careerStateAfterMarket = marketLifecycle?.careerState ?? careerStateAfterContracts;
  if (input.toDate <= fromDate) {
    return {
      careerState: careerStateAfterMarket,
      summaries: [],
      ...(contractLifecycle === undefined ? {} : { contractLifecycle }),
      ...(marketLifecycle === undefined ? {} : { marketLifecycle }),
    };
  }

  const academyContributions = buildLowDetailAcademyParticipation({
    careerState: careerStateAfterMarket,
    seasonId,
    beforeMonthKey: monthKeyForCareerDate(input.toDate),
  });
  const careerStateWithAcademyParticipation = academyContributions.length === 0
    ? careerStateAfterMarket
    : createCareerState({
        ...careerStateAfterMarket,
        playerParticipationLedger: accruePlayerFixtureParticipations(
          careerStateAfterMarket.playerParticipationLedger
            ?? createEmptyPlayerParticipationLedger(),
          academyContributions,
        ),
      });
  let careerState = careerStateWithAcademyParticipation;
  const summaries: CareerMonthlyLifecycleSummary[] = [];

  while (true) {
    const batch = selectNextPlayerParticipationDevelopmentBatch({
      ledger: careerState.playerParticipationLedger,
      seasonId,
      beforeMonthKey: monthKeyForCareerDate(input.toDate),
      mode: input.developmentCheckpointMode,
    });
    if (batch === undefined) {
      break;
    }

    const developed = developPlayersFromParticipationRows({
      careerState,
      worldSeed: input.worldSeed,
      seasonId,
      participationRows: batch.rows,
      developmentEnvironmentConfig: input.playerDevelopmentEnvironmentConfig,
    });
    let playerParticipationLedger = developed.careerState.playerParticipationLedger;
    if (playerParticipationLedger === undefined) {
      throw new Error("quarterly development requires its source participation ledger");
    }
    for (const monthKey of batch.monthKeys) {
      playerParticipationLedger = closePlayerParticipationMonth(
        playerParticipationLedger,
        seasonId,
        monthKey,
      );
    }

    careerState = createCareerState({
      ...developed.careerState,
      playerParticipationLedger,
    });

    for (const monthKey of batch.monthKeys) {
      summaries.push(monthlySummary({
        seasonId,
        monthKey,
        rows: batch.rows.filter((row) => row.monthKey === monthKey),
        changes: developed.monthlyChanges.filter((change) => change.monthKey === monthKey),
        closedMonthKeys: playerParticipationLedger.closedMonthKeys,
        academyPlayerIds:
          careerState.youthAcademyState?.clubRosterIds.flatMap((clubId) =>
            careerState.youthAcademyState?.clubRosters[clubId]?.playerIds ?? [])
          ?? [],
      }));
    }
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

function monthlySummary(input: {
  readonly seasonId: SeasonId;
  readonly monthKey: PlayerDevelopmentMonthKey;
  readonly rows: readonly PlayerParticipationRow[];
  readonly changes: readonly PlayerMonthlyDevelopmentChange[];
  readonly closedMonthKeys: readonly string[];
  readonly academyPlayerIds: readonly PlayerParticipationRow["playerId"][];
}): CareerMonthlyLifecycleSummary {
  const rowPlayers = new Set(input.rows.map((row) => row.playerId));
  const changes = input.changes.filter((change) => rowPlayers.has(change.playerId));

  const academyParticipation = academyParticipationSummary(
    input.rows,
    new Set(input.academyPlayerIds),
  );
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
    ...(academyParticipation === undefined ? {} : { academyParticipation }),
  };
}

function academyParticipationSummary(
  rows: readonly PlayerParticipationRow[],
  activeAcademyPlayerIds: ReadonlySet<PlayerParticipationRow["playerId"]>,
): CareerAcademyParticipationSummary | undefined {
  if (activeAcademyPlayerIds.size === 0) return undefined;
  const fixtureIds = new Set<string>();
  const playerIds = new Set<PlayerParticipationRow["playerId"]>();
  let appearanceCount = 0;
  let fullProgrammePlayerMonthCount = 0;
  let reducedProgrammePlayerMonthCount = 0;
  let fullyReplacedPlayerMonthCount = 0;
  let missingPlayerMonthCount = 0;
  let invalidMinuteCount = 0;

  for (const playerId of activeAcademyPlayerIds) {
    const row = rows.find((candidate) => candidate.playerId === playerId);
    const academyFixtureIds = row?.appliedFixtureIds.filter(
      isLowDetailAcademyFixtureId,
    ) ?? [];
    const academyMinutes =
      academyFixtureIds.length * LOW_DETAIL_ACADEMY_FIXTURE_MINUTES;
    const nonAcademyMinutes = (row?.minutes ?? 0) - academyMinutes;
    for (const academyFixtureId of academyFixtureIds) {
      fixtureIds.add(String(academyFixtureId));
    }
    if (academyFixtureIds.length > 0) {
      playerIds.add(playerId);
      appearanceCount += academyFixtureIds.length;
    }
    if (academyFixtureIds.length === 3) fullProgrammePlayerMonthCount += 1;
    else if (academyFixtureIds.length > 0 && nonAcademyMinutes >= 90) {
      reducedProgrammePlayerMonthCount += 1;
    } else if (academyFixtureIds.length === 0 && nonAcademyMinutes >= 270) {
      fullyReplacedPlayerMonthCount += 1;
    } else {
      missingPlayerMonthCount += 1;
    }
    if (
      academyMinutes < 0
      || academyMinutes > 270
      || academyMinutes % LOW_DETAIL_ACADEMY_FIXTURE_MINUTES !== 0
    ) invalidMinuteCount += 1;
  }

  return {
    fixtureCount: fixtureIds.size,
    appearanceCount,
    playerCount: playerIds.size,
    minutes: appearanceCount * LOW_DETAIL_ACADEMY_FIXTURE_MINUTES,
    fullProgrammePlayerMonthCount,
    reducedProgrammePlayerMonthCount,
    fullyReplacedPlayerMonthCount,
    missingPlayerMonthCount,
    invalidMinuteCount,
  };
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
