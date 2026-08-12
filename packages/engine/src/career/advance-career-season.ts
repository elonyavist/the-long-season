import {
  beginClubFinanceTransaction,
  commitClubFinanceTransaction,
  createCareerState,
  type CareerSeasonAggregateGoals,
  type CareerSeasonArchiveEntry,
  type CareerState,
  type AskingPriceCurvesConfig,
  type ClubCategory,
  type ClubId,
  type CompetitionId,
  type CompetitionSeasonHistoryEntry,
  type CompetitionSeasonDistribution,
  type DomesticCompetitionWorld,
  type Fixture,
  type FixtureId,
  type GameDate,
  type LeagueTableRow,
  type LeagueTableRules,
  type MarketBehaviorCalibrationConfig,
  type PlayerDevelopmentEnvironmentConfig,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type SeasonTransferWindows,
  type SeasonId,
  seasonId,
} from "@game/domain";

import { computeLeagueTable } from "../season-engine/league-table.ts";
import {
  createSeasonRolloverInboxMessage,
  deliverCareerInboxMessages,
} from "./career-inbox-lifecycle.ts";
import { advanceCareerMonths, type CareerMonthlyLifecycleSummary } from "./advance-career-month.ts";
import {
  applyEndOfSeasonPlayerExits,
  type PlayerExitReason,
  type PlayerExitRecord,
} from "./player-exits.ts";
import { type CareerIntakeCandidate } from "./player-intake.ts";
import { generateNextSeasonCalendar, type NextSeasonCalendarGenerated } from "./next-season-calendar.ts";
import { rolloverPlayersForNextSeason } from "./player-season-rollover.ts";
import {
  CLUB_COMPETITIVE_TIER_DIVISION_SIZE,
  deriveClubSeasonTierUpdate,
  type ClubCompletedSeasonResult,
  type ClubSeasonTierFact,
} from "./club-season-tier.ts";
import { maintainCareerSquadShape, MINIMUM_CAREER_SQUAD_SIZE } from "./squad-maintenance.ts";
import { type YouthIntakeCandidate, applySeasonalYouthIntake } from "./youth-intake.ts";
import { applyYouthAcademyLifecycle, type YouthLifecycleRecord } from "./youth-lifecycle.ts";
import { promoteYouthCandidatesToSeniorSquads } from "./youth-promotion.ts";
import {
  selectCareerActivePlayerStock,
  type CareerActivePlayerStockEntry,
} from "./active-player-stock.ts";
import {
  refreshAnnualTransferBudgetAvailability,
  settleAnnualPayroll,
  settleSeasonDistribution,
} from "./career-finance-lifecycle.ts";
import { replenishSeniorSquadsFromFreeAgents } from "./senior-squad-replenishment.ts";
import type {
  AiMarketDiagnosticFact,
  AiMarketLifecycleFact,
} from "./ai-market-lifecycle.ts";
import type { AiContractLifecycleFact } from "./ai-contract-lifecycle.ts";
import type { PreliminaryAgreementLifecycleFact } from "./preliminary-agreement.ts";
import { buildCareerPlayerSeasonStatistics } from "./player-statistics.ts";
import {
  applyDomesticPromotionRelegation,
  type DomesticCompetitionMovement,
} from "./promotion-relegation.ts";
import type { PlayerValuationConfig } from "../market/player-valuation.ts";

const YOUTH_ROSTER_TARGET_MINIMUM = 8;
const YOUTH_ROSTER_TARGET_MAXIMUM = 12;

/** Mode used when a completed durable career season should roll into the next season. */
export interface AdvanceCareerCompletedSeasonMode {
  /** Discriminator for durable completed-season rollover. */
  readonly kind: "completedSeason";
  /** Competition point rules supplied by an Adapter because engine cannot import content. */
  readonly tableRules: LeagueTableRules;
}

/** One report-only competition result supplied without durable fixture history. */
export interface AdvanceCareerReportCompetitionResult {
  /** Competition whose simulated season produced this table. */
  readonly competitionId: CompetitionId;
  /** Complete deterministic final table for the competition. */
  readonly finalTable: readonly LeagueTableRow[];
  /** Optional competition-owned prize distribution paired with the table. */
  readonly seasonDistribution?: CompetitionSeasonDistribution;
}

/** Mode used by reports that need a season refresh without persisted fixture history. */
export interface AdvanceCareerReportRefreshMode {
  /** Discriminator for report-only season refresh. */
  readonly kind: "reportRefresh";
  /** Adapter-provided next season ID for report progression. */
  readonly nextSeasonId: SeasonId;
  /** Adapter-provided next season start date for report progression. */
  readonly nextSeasonStartDate: GameDate;
  /** Ordered simulated competition results; an empty report has no table evidence. */
  readonly competitionResults: readonly AdvanceCareerReportCompetitionResult[];
}

/** Explicit advancement modes supported by the canonical career-season use-case. */
export type AdvanceCareerOneSeasonMode =
  | AdvanceCareerCompletedSeasonMode
  | AdvanceCareerReportRefreshMode;

/** Context for Adapter-owned youth-intake candidate generation. */
export interface CareerYouthIntakeCandidateProviderContext {
  /** Career state after youth lifecycle has removed aged-out academy players. */
  readonly careerState: CareerState;
  /** Canonical advancement season id used by deterministic generators. */
  readonly seasonId: SeasonId;
  /** Date that should be used as the intake reference date. */
  readonly intakeDate: GameDate;
  /** Canonical active population after exits and academy lifecycle decisions. */
  readonly activePlayerStock: readonly CareerActivePlayerStockEntry[];
}

/** Context for Adapter-owned senior-intake candidate generation. */
export interface CareerSeniorIntakeCandidateProviderContext {
  /** Career state after youth promotion decisions and before senior maintenance. */
  readonly careerState: CareerState;
  /** Canonical advancement season id used by deterministic generators. */
  readonly seasonId: SeasonId;
  /** Canonical start date of the season receiving these players. */
  readonly intakeDate: GameDate;
}

/** Input for the canonical season advancement Module. */
export interface AdvanceCareerOneSeasonInput {
  /** Durable career state before one season advancement is applied. */
  readonly careerState: CareerState;
  /** Stable world seed used by deterministic career subsystems. */
  readonly worldSeed: string;
  /** Advancement mode and mode-specific content inputs. */
  readonly mode: AdvanceCareerOneSeasonMode;
  /** Version-linked wage policy used by every season-boundary contract path. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Version-linked market policy used by every affordability and AI decision. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  /** Version-linked club-environment policy applied by quarterly development. */
  readonly playerDevelopmentEnvironmentConfig: PlayerDevelopmentEnvironmentConfig;
  /** Canonical public-assessment policy used by every contract and market path. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Adapter-generated senior intake candidates used by squad maintenance. */
  readonly seniorIntakeCandidates?: readonly CareerIntakeCandidate[];
  /** Adapter-owned senior intake provider called at the canonical maintenance point. */
  readonly createSeniorIntakeCandidates?: (context: CareerSeniorIntakeCandidateProviderContext) => readonly CareerIntakeCandidate[];
  /** Adapter-generated annual youth intake candidates. */
  readonly youthIntakeCandidates?: readonly YouthIntakeCandidate[];
  /** Adapter-owned youth intake provider called after youth lifecycle. */
  readonly createYouthIntakeCandidates?: (context: CareerYouthIntakeCandidateProviderContext) => readonly YouthIntakeCandidate[];
  /** Whether selected-club youth promotion can be automated. Defaults to protected. */
  readonly allowSelectedClubYouthPromotion?: boolean;
  /**
   * Whether an Adapter-controlled simulation may replenish the selected club.
   *
   * Interactive careers must leave this disabled so the manager owns every
   * signing. Long-run reports may enable it to model a deterministic test
   * manager without mutating the saved lineup or bench.
   */
  readonly allowSelectedClubSquadReplenishment?: boolean;
  /**
   * Adapter-owned windows used by AI clubs during this calendar advancement.
   *
   * Omit only when the caller cannot supply a competition calendar; the engine
   * never invents or guesses transfer dates.
   */
  readonly transferWindows?: SeasonTransferWindows;
  /** Versioned asking-price content required with AI market windows. */
  readonly askingPriceConfig?: AskingPriceCurvesConfig;
  /** Analysis-only Phase 81A ablation seam; never persisted or player-visible. */
  readonly useRoleSuccessionMarketNeeds?: boolean;
  /** Analysis-only Phase 81A legacy-order control; never persisted. */
  readonly aiMarketNeedSubmissionOrder?: "legacy" | "bounded_succession";
}

/** Stable operation keys emitted to let tests and reports verify ordering. */
export type CareerSeasonAdvancementOperation =
  | "completed_season_validation"
  | "season_archive"
  | "annual_payroll"
  | "monthly_lifecycle"
  | "season_distribution"
  | "annual_transfer_budget_refresh"
  | "player_exits"
  | "youth_lifecycle"
  | "youth_intake"
  | "youth_promotion"
  | "squad_maintenance"
  | "ai_market_lifecycle"
  | "post_transfer_squad_maintenance"
  | "promotion_relegation"
  | "next_calendar_merge"
  | "club_competitive_tier_freeze"
  | "player_state_rollover"
  | "season_inbox_delivery";

/** Compact fact for an archived completed season. */
export interface CareerSeasonArchiveFact {
  /** Completed season ID. */
  readonly seasonId: SeasonId;
  /** Champion club ID from the computed final table. */
  readonly championClubId: ClubId;
  /** Position where the selected club finished. */
  readonly selectedClubPosition: number;
  /** Aggregate goal facts captured in the archive entry. */
  readonly aggregateGoals: CareerSeasonAggregateGoals;
}

/** One completed competition and the movements selected from its final table. */
export interface CareerCompetitionSeasonArchiveFact {
  readonly competitionId: CompetitionId;
  readonly championClubId: ClubId;
  readonly finalTable: readonly LeagueTableRow[];
}

/** Aggregate player development facts emitted by one advancement. */
export interface CareerPlayerDevelopmentFact {
  /** Number of player development rows emitted. */
  readonly changeCount: number;
  /** Number of rows with any positive growth. */
  readonly playersImproved: number;
  /** Number of rows with any decline. */
  readonly playersDeclined: number;
  /** Rounded total growth across rows. */
  readonly totalGrowth: number;
  /** Rounded total decline across rows. */
  readonly totalDecline: number;
  /** Canonical low-detail academy activity included in development rows. */
  readonly academyParticipation?: {
    readonly fixtureCount: number;
    readonly appearanceCount: number;
    readonly playerCount: number;
    readonly minutes: number;
    readonly fullProgrammePlayerMonthCount: number;
    readonly reducedProgrammePlayerMonthCount: number;
    readonly fullyReplacedPlayerMonthCount: number;
    readonly missingPlayerMonthCount: number;
    readonly invalidMinuteCount: number;
  };
}

/** Aggregate player exit facts emitted by one advancement. */
export interface CareerPlayerExitFact {
  /** Number of players leaving active senior rosters. */
  readonly exitCount: number;
  /** Exit counts grouped by deterministic reason. */
  readonly reasons: Readonly<Record<PlayerExitReason, number>>;
  /** Stable IDs grouped by reason so downstream stock-flow reports avoid guessing. */
  readonly playerIdsByReason: Readonly<Record<PlayerExitReason, readonly PlayerId[]>>;
}

/** Aggregate youth lifecycle facts emitted by one advancement. */
export interface CareerYouthLifecycleFact {
  /** Number of youth lifecycle records. */
  readonly recordCount: number;
  /** Number of age-out records that became senior-promotion candidates. */
  readonly promotionCandidateCount: number;
  /** Number of age-out records that became external-move candidates. */
  readonly externalMoveCandidateCount: number;
  /** Number of youth players released from the active world. */
  readonly releasedCount: number;
  /** Selected-club lifecycle decisions that future UI may need to surface. */
  readonly selectedClubDecisionCount: number;
  /** Stable player IDs grouped by academy exit outcome for stock-flow reports. */
  readonly playerIdsByOutcome: {
    readonly promotion_candidate: readonly PlayerId[];
    readonly external_move_candidate: readonly PlayerId[];
    readonly released: readonly PlayerId[];
  };
}

/** Aggregate youth intake facts emitted by one advancement. */
export interface CareerYouthIntakeFact {
  /** Number of generated youth candidates supplied by the Adapter. */
  readonly candidateCount: number;
  /** Number of youth candidates accepted into active academies. */
  readonly acceptedPlayerCount: number;
  /** Number of generated candidates skipped because no academy slot remained. */
  readonly skippedPlayerCount: number;
  /** Stable accepted IDs used by composition diagnostics without re-deriving state. */
  readonly acceptedPlayerIds: readonly PlayerId[];
  /** Stable skipped IDs used to distinguish allocation from acceptance. */
  readonly skippedPlayerIds: readonly PlayerId[];
}

/** Aggregate youth promotion facts emitted by one advancement. */
export interface CareerYouthPromotionFact {
  /** Number of promotion candidates evaluated. */
  readonly candidateCount: number;
  /** Number of promotion candidates moved into senior squads. */
  readonly promotedCount: number;
  /** Number of selected-club candidates protected from automatic promotion. */
  readonly selectedClubProtectedCount: number;
}

/** Aggregate senior squad maintenance facts emitted by one advancement. */
export interface CareerSquadMaintenanceFact {
  /** Number of generated senior intake candidates supplied by the Adapter. */
  readonly candidateCount: number;
  /** Number of players actually added to senior rosters. */
  readonly addedPlayerCount: number;
  /** Number of structural warnings remaining after maintenance. */
  readonly warningCount: number;
  /** Number of clubs that moved transfer budget into annual-wage room. */
  readonly wageBudgetReallocationClubCount: number;
  /** Clubs where that reallocation was followed by exact annual-wage ceiling use. */
  readonly wageBudgetReallocationExactCeilingCount: number;
  /** Clubs receiving a tier-capped planning repair to preserve playable structure. */
  readonly structuralWageBudgetTopUpClubCount: number;
  /** Explicit structural contract releases used to restore a hard squad invariant. */
  readonly structuralReleaseClubCount: number;
  /**
   * Canonical free-agent contracts completed by post-transfer replenishment.
   *
   * These season-scoped facts let diagnostics count structural recruitment
   * without pretending that generated intake candidates were direct signings.
   */
  readonly freeAgentSignings: readonly {
    readonly clubId: ClubId;
    readonly playerId: PlayerId;
  }[];
}

/** Aggregate completed canonical market movements emitted by one advancement. */
export interface CareerTransferTurnoverFact {
  /** Number of completed inter-club transfers negotiated by AI clubs. */
  readonly transferCount: number;
}

/** Structured market evidence retained only until report tooling aggregates one season. */
export interface CareerSeasonMarketLifecycleFact {
  /** Canonical negotiation and preliminary-agreement lifecycle facts. */
  readonly facts: readonly AiMarketLifecycleFact[];
  /** Recruitment opportunity observations that never affect gameplay choices. */
  readonly diagnostics: readonly AiMarketDiagnosticFact[];
  /** Preliminary lifecycle facts resolved by the contract pass before market checkpoints. */
  readonly preliminaryAgreementFacts: readonly PreliminaryAgreementLifecycleFact[];
  /** Contract expiry and free-agent creation facts from the same calendar pass. */
  readonly contractLifecycleFacts: readonly AiContractLifecycleFact[];
}

/** Senior squad health facts after one advancement. */
export interface CareerSquadHealthFact {
  /** Total senior players in active club rosters. */
  readonly seniorPlayerCount: number;
  /** Smallest senior squad size. */
  readonly minimumSquadSize: number;
  /** Average senior squad size. */
  readonly averageSquadSize: number;
  /** Largest senior squad size. */
  readonly maximumSquadSize: number;
  /** Number of clubs below the minimum playable squad size. */
  readonly clubsBelowMinimumSquadSize: number;
  /** Number of clubs without a natural goalkeeper. */
  readonly clubsWithoutNaturalGoalkeeper: number;
}

/** Youth academy health facts after one advancement. */
export interface CareerYouthHealthFact {
  /** Total active academy players. */
  readonly youthPlayerCount: number;
  /** Active senior plus academy player count. */
  readonly activePlayerCount: number;
  /** Smallest active youth roster size. */
  readonly minimumYouthRosterSize: number;
  /** Average active youth roster size. */
  readonly averageYouthRosterSize: number;
  /** Largest active youth roster size. */
  readonly maximumYouthRosterSize: number;
  /** Active youth size for the manager-selected club. */
  readonly selectedClubYouthSize: number;
  /** Number of clubs above the target youth roster band. */
  readonly clubsAboveYouthTarget: number;
  /** Number of clubs below the target youth roster band. */
  readonly clubsBelowYouthMinimum: number;
}

/** Stable warning keys emitted by the canonical advancement use-case. */
export type CareerSeasonAdvancementWarning =
  | "selected_club_youth_decision_pending";

/** Structured facts returned by the canonical season advancement Module. */
export interface CareerSeasonAdvancementFacts {
  /** Advancement mode used by this call. */
  readonly mode: AdvanceCareerOneSeasonMode["kind"];
  /** Manager-selected club affected by protected manager-decision rules. */
  readonly selectedClubId: ClubId;
  /** Previous active season. */
  readonly previousSeasonId: SeasonId;
  /** Next active season. */
  readonly nextSeasonId: SeasonId;
  /** Previous career date. */
  readonly previousDate: GameDate;
  /** Date applied as the next season start. */
  readonly nextSeasonStartDate: GameDate;
  /** Ordered operation keys that describe the canonical sequence. */
  readonly operationOrder: readonly CareerSeasonAdvancementOperation[];
  /** Completed-season archive facts when durable rollover was used. */
  readonly seasonArchive?: CareerSeasonArchiveFact;
  /** Ordered completed domestic tables when a full competition world exists. */
  readonly competitionSeasonArchives?: readonly CareerCompetitionSeasonArchiveFact[];
  /** Ordered promotion/relegation facts selected from pre-movement tables. */
  readonly competitionMovements?: readonly DomesticCompetitionMovement[];
  /** Transparent next-season tier and reputation calculation rows. */
  readonly clubCompetitiveTiers: readonly ClubSeasonTierFact[];
  /** Player development aggregate facts. */
  readonly playerDevelopment: CareerPlayerDevelopmentFact;
  /** Player exit aggregate facts. */
  readonly playerExits: CareerPlayerExitFact;
  /** Youth lifecycle aggregate facts. */
  readonly youthLifecycle: CareerYouthLifecycleFact;
  /** Youth intake aggregate facts. */
  readonly youthIntake: CareerYouthIntakeFact;
  /** Youth promotion aggregate facts. */
  readonly youthPromotions: CareerYouthPromotionFact;
  /** Senior squad maintenance aggregate facts. */
  readonly squadMaintenance: CareerSquadMaintenanceFact;
  /** Transfer turnover aggregate facts. */
  readonly transferTurnover: CareerTransferTurnoverFact;
  /** Optional market funnel evidence when competition windows were supplied. */
  readonly marketLifecycle?: CareerSeasonMarketLifecycleFact;
  /** Senior squad health after advancement. */
  readonly squadHealth: CareerSquadHealthFact;
  /** Youth academy health after advancement. */
  readonly youthHealth: CareerYouthHealthFact;
  /** Machine-readable warnings for future UI/report adapters. */
  readonly warnings: readonly CareerSeasonAdvancementWarning[];
}

/** Invalid reasons emitted before any partial advancement is applied. */
export type AdvanceCareerOneSeasonInvalidReason =
  | "current_season_incomplete"
  | "fixture_missing"
  | "fixture_home_club_not_found"
  | "fixture_away_club_not_found"
  | "no_current_season_fixtures"
  | "fixture_id_collision"
  | "season_table_empty"
  | "selected_club_not_in_table"
  | "promotion_relegation_invalid"
  | "finance_lifecycle_rejected";

/** Successful canonical season advancement result. */
export interface AdvanceCareerOneSeasonAdvanced {
  /** Discriminator for successful advancement. */
  readonly status: "advanced";
  /** Copied career state after advancement. */
  readonly careerState: CareerState;
  /** Structured facts describing the advancement. */
  readonly facts: CareerSeasonAdvancementFacts;
}

/** Invalid canonical season advancement result. */
export interface AdvanceCareerOneSeasonInvalid {
  /** Discriminator for invalid state. */
  readonly status: "invalid";
  /** Original career state, unchanged. */
  readonly careerState: CareerState;
  /** Stable invalid reason. */
  readonly reason: AdvanceCareerOneSeasonInvalidReason;
  /** Related fixture ID when available. */
  readonly fixtureId?: FixtureId;
  /**
   * Exact canonical finance operation that rejected the transaction.
   *
   * The generic reason cannot distinguish payroll, distribution and budget
   * refresh. Reports may observe this fact; no caller may use it as a fallback.
   */
  readonly failedOperation?: Extract<
    CareerSeasonAdvancementOperation,
    "annual_payroll" | "season_distribution" | "annual_transfer_budget_refresh"
  >;
}

/** Canonical season advancement result. */
export type AdvanceCareerOneSeasonResult =
  | AdvanceCareerOneSeasonAdvanced
  | AdvanceCareerOneSeasonInvalid;

/**
 * Advances one career season through the canonical engine order.
 *
 * The Module owns season-level orchestration and emits structured facts. It
 * does not load saves, generate content candidates, render text, or make hidden
 * selected-club decisions.
 */
export function advanceCareerOneSeason(input: AdvanceCareerOneSeasonInput): AdvanceCareerOneSeasonResult {
  const previousSeasonId = input.careerState.gameState.calendar.currentSeasonId;
  const previousDate = input.careerState.gameState.calendar.currentDate;
  const seasonContext = prepareSeasonContext(input);

  if (seasonContext.status === "invalid") {
    return {
      status: "invalid",
      careerState: input.careerState,
      reason: seasonContext.reason,
      ...(seasonContext.fixtureId === undefined ? {} : { fixtureId: seasonContext.fixtureId }),
    };
  }

  const operationOrder: CareerSeasonAdvancementOperation[] = [...seasonContext.operationOrder];
  const advancementSeasonId = seasonId(`${previousSeasonId}:advance:${seasonContext.nextSeasonId}`);
  const workingCareerState = input.careerState.clubFinanceState === undefined
    ? input.careerState
    : {
        ...input.careerState,
        clubFinanceState: beginClubFinanceTransaction(input.careerState.clubFinanceState),
      };

  const annualPayroll = workingCareerState.clubFinanceState === undefined
    && workingCareerState.seniorSquadState === undefined
    ? undefined
    : settleAnnualPayroll({
        careerState: workingCareerState,
        seasonId: previousSeasonId,
        occurredOn: previousDate,
      });
  if (annualPayroll?.status === "rejected") {
    return {
      status: "invalid",
      careerState: input.careerState,
      reason: "finance_lifecycle_rejected",
      failedOperation: "annual_payroll",
    };
  }
  if (annualPayroll !== undefined) operationOrder.push("annual_payroll");

  operationOrder.push("monthly_lifecycle");
  const monthlyLifecycle = advanceCareerMonths({
    careerState: annualPayroll?.careerState ?? workingCareerState,
    worldSeed: input.worldSeed,
    fromDate: previousDate,
    toDate: seasonContext.nextSeasonStartDate,
    seasonId: previousSeasonId,
    developmentCheckpointMode: "season_end_flush",
    playerDevelopmentEnvironmentConfig:
      input.playerDevelopmentEnvironmentConfig,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    valuationConfig: input.valuationConfig,
    ...(input.transferWindows === undefined ? {} : { transferWindows: input.transferWindows }),
    ...(input.askingPriceConfig === undefined ? {} : { askingPriceConfig: input.askingPriceConfig }),
    ...(input.useRoleSuccessionMarketNeeds === undefined
      ? {}
      : { useRoleSuccessionMarketNeeds: input.useRoleSuccessionMarketNeeds }),
    ...(input.aiMarketNeedSubmissionOrder === undefined
      ? {}
      : { aiMarketNeedSubmissionOrder: input.aiMarketNeedSubmissionOrder }),
  });
  if (monthlyLifecycle.marketLifecycle !== undefined) {
    operationOrder.push("ai_market_lifecycle");
  }
  const distributionInputs = seasonDistributionInputs(input, seasonContext);
  let stateAfterDistribution = monthlyLifecycle.careerState;
  let distributionApplied = false;
  if (
    distributionInputs.length > 0
    && (stateAfterDistribution.clubFinanceState !== undefined
      || stateAfterDistribution.seniorSquadState !== undefined)
  ) {
    for (const distributionInput of distributionInputs) {
      const distributed = settleSeasonDistribution({
        careerState: stateAfterDistribution,
        seasonId: previousSeasonId,
        occurredOn: seasonContext.nextSeasonStartDate,
        distribution: distributionInput.distribution,
        finalTable: distributionInput.finalTable,
      });
      if (distributed.status === "rejected") {
        return {
          status: "invalid",
          careerState: input.careerState,
          reason: "finance_lifecycle_rejected",
          failedOperation: "season_distribution",
        };
      }
      stateAfterDistribution = distributed.careerState;
      distributionApplied = true;
    }
  }
  if (distributionApplied) operationOrder.push("season_distribution");
  const refreshedTransferBudgets = stateAfterDistribution.clubFinanceState === undefined
    && stateAfterDistribution.seniorSquadState === undefined
    ? undefined
    : refreshAnnualTransferBudgetAvailability({ careerState: stateAfterDistribution });
  if (refreshedTransferBudgets?.status === "rejected") {
    return {
      status: "invalid",
      careerState: input.careerState,
      reason: "finance_lifecycle_rejected",
      failedOperation: "annual_transfer_budget_refresh",
    };
  }
  if (refreshedTransferBudgets !== undefined) operationOrder.push("annual_transfer_budget_refresh");

  const stateAfterFinance = refreshedTransferBudgets?.careerState ?? stateAfterDistribution;
  const usesCanonicalSeniorSquads = stateAfterFinance.seniorSquadState !== undefined
    && stateAfterFinance.clubFinanceState !== undefined;

  operationOrder.push("player_exits");
  const exits = usesCanonicalSeniorSquads
    ? applyEndOfSeasonPlayerExits({
        careerState: stateAfterFinance,
        worldSeed: input.worldSeed,
        seasonId: advancementSeasonId,
      })
    : { careerState: stateAfterFinance, exits: [] };

  operationOrder.push("youth_lifecycle");
  const youthLifecycle = applyYouthAcademyLifecycle({
    careerState: exits.careerState,
    worldSeed: input.worldSeed,
    seasonId: advancementSeasonId,
    lifecycleDate: seasonContext.nextSeasonStartDate,
    valuationConfig: input.valuationConfig,
  });

  operationOrder.push("youth_intake");
  const activePlayerStock = selectCareerActivePlayerStock(
    youthLifecycle.careerState,
  );
  const youthIntakeCandidates =
    input.createYouthIntakeCandidates?.({
      careerState: youthLifecycle.careerState,
      seasonId: advancementSeasonId,
      intakeDate: seasonContext.nextSeasonStartDate,
      activePlayerStock,
    }) ??
    input.youthIntakeCandidates ??
    [];
  const youthIntake = applyYouthIntakeIfCandidatesExist({
    careerState: youthLifecycle.careerState,
    seasonId: advancementSeasonId,
    intakeDate: seasonContext.nextSeasonStartDate,
    candidates: youthIntakeCandidates,
  });

  operationOrder.push("youth_promotion");
  const youthPromotions = usesCanonicalSeniorSquads
    ? promoteYouthCandidatesToSeniorSquads({
        careerState: youthIntake.careerState,
        wagePolicy: input.wagePolicy,
        marketBehaviorPolicy: input.marketBehaviorPolicy,
        valuationConfig: input.valuationConfig,
        allowSelectedClubPromotion: input.allowSelectedClubYouthPromotion ?? false,
        occurredOn: seasonContext.nextSeasonStartDate,
      })
    : { careerState: youthIntake.careerState, records: [] };

  operationOrder.push("squad_maintenance");
  const resolveSeniorIntakeCandidates = () =>
    input.createSeniorIntakeCandidates?.({
      careerState: youthPromotions.careerState,
      seasonId: advancementSeasonId,
      intakeDate: seasonContext.nextSeasonStartDate,
    }) ??
    input.seniorIntakeCandidates ??
    [];
  let canonicalSeniorIntakeCandidates: readonly CareerIntakeCandidate[] = [];
  const seniorIntakeCandidates = usesCanonicalSeniorSquads
    ? []
    : resolveSeniorIntakeCandidates();
  const maintained = usesCanonicalSeniorSquads
    ? { careerState: youthPromotions.careerState, records: [] }
    : maintainCareerSquadShape({
        careerState: youthPromotions.careerState,
        intakeCandidates: seniorIntakeCandidates,
      });

  operationOrder.push("post_transfer_squad_maintenance");
  const replenishmentClubIds = maintained.careerState.gameState.clubIds.filter(
    (clubId) =>
      clubId !== input.careerState.selectedClubId
      || input.allowSelectedClubSquadReplenishment === true,
  );
  const postTransferMaintained = usesCanonicalSeniorSquads
    ? replenishSeniorSquadsFromFreeAgents({
        careerState: maintained.careerState,
        wagePolicy: input.wagePolicy,
        marketBehaviorPolicy: input.marketBehaviorPolicy,
        valuationConfig: input.valuationConfig,
        clubIds: replenishmentClubIds,
        occurredOn: seasonContext.nextSeasonStartDate,
        createIntakeCandidates: () => {
          canonicalSeniorIntakeCandidates = resolveSeniorIntakeCandidates();
          return canonicalSeniorIntakeCandidates;
        },
      })
    : {
        ...maintainCareerSquadShape({
          careerState: maintained.careerState,
          intakeCandidates: intakeCandidatesNotYetActive(maintained.careerState, seniorIntakeCandidates),
        }),
        wageBudgetReallocations: [],
        structuralWageBudgetTopUps: [],
        structuralReleases: [],
      };
  const maintenanceRecords = [...maintained.records, ...postTransferMaintained.records];
  const wageBudgetReallocations = postTransferMaintained.wageBudgetReallocations;
  const structuralWageBudgetTopUps =
    postTransferMaintained.structuralWageBudgetTopUps;
  const structuralReleases = postTransferMaintained.structuralReleases;

  const stateBeforePlayerRollover = applyCompletedSeasonChangesIfNeeded(postTransferMaintained.careerState, seasonContext, operationOrder);
  const clubSeasonTierUpdate = deriveClubSeasonTierUpdate({
    careerState: stateBeforePlayerRollover,
    nextSeasonId: seasonContext.nextSeasonId,
    completedResultByClubId: completedClubResults(input, seasonContext),
  });
  operationOrder.push("club_competitive_tier_freeze");

  operationOrder.push("player_state_rollover");
  const rolledOver = rolloverPlayersForNextSeason({
    careerState: stateBeforePlayerRollover,
    nextSeasonId: seasonContext.nextSeasonId,
    nextSeasonStartDate: seasonContext.nextSeasonStartDate,
    clubSeasonTierUpdate,
  });
  const careerStateBeforeFinanceCommit = seasonContext.archive === undefined
    ? rolledOver.careerState
    : deliverCareerInboxMessages(rolledOver.careerState, [createSeasonRolloverInboxMessage({
        nextSeasonId: seasonContext.nextSeasonId,
        date: seasonContext.nextSeasonStartDate,
      selectedClubId: input.careerState.selectedClubId,
    })]);
  const careerState = careerStateBeforeFinanceCommit.clubFinanceState === undefined
    ? careerStateBeforeFinanceCommit
    : createCareerState({
        ...careerStateBeforeFinanceCommit,
        clubFinanceState: commitClubFinanceTransaction(careerStateBeforeFinanceCommit.clubFinanceState),
      });
  if (seasonContext.archive !== undefined) operationOrder.push("season_inbox_delivery");

  const warnings = advancementWarnings(youthLifecycle.records, input.careerState.selectedClubId);
  return {
    status: "advanced",
    careerState,
    facts: {
      mode: input.mode.kind,
      selectedClubId: input.careerState.selectedClubId,
      previousSeasonId,
      nextSeasonId: seasonContext.nextSeasonId,
      previousDate,
      nextSeasonStartDate: seasonContext.nextSeasonStartDate,
      operationOrder,
      ...(seasonContext.archive === undefined ? {} : { seasonArchive: seasonContext.archive.fact }),
      ...(seasonContext.competitionArchives === undefined
        ? {}
        : {
            competitionSeasonArchives: seasonContext.competitionArchives.map(
              ({ entry }) => ({
                competitionId: entry.competitionId,
                championClubId: entry.finalTable[0]!.clubId,
                finalTable: entry.finalTable,
              }),
            ),
          }),
      ...(seasonContext.movements === undefined
        ? {}
        : { competitionMovements: seasonContext.movements }),
      clubCompetitiveTiers: clubSeasonTierUpdate.facts,
      playerDevelopment: monthlyPlayerDevelopmentFact(monthlyLifecycle.summaries),
      playerExits: playerExitFact(exits.exits),
      youthLifecycle: youthLifecycleFact(
        youthLifecycle.records,
        input.careerState.selectedClubId,
      ),
      youthIntake: {
        candidateCount: youthIntakeCandidates.length,
        acceptedPlayerCount: youthIntake.records.reduce((sum, record) => sum + record.acceptedPlayerIds.length, 0),
        skippedPlayerCount: youthIntake.records.reduce(
          (sum, record) => sum + record.skippedPlayerIds.length,
          0,
        ),
        acceptedPlayerIds: youthIntake.records.flatMap(
          (record) => record.acceptedPlayerIds,
        ),
        skippedPlayerIds: youthIntake.records.flatMap(
          (record) => record.skippedPlayerIds,
        ),
      },
      youthPromotions: {
        candidateCount: youthPromotions.records.length,
        promotedCount: youthPromotions.records.filter((record) => record.promoted).length,
        selectedClubProtectedCount: youthPromotions.records.filter((record) => record.reason === "selected_club_protected").length,
      },
      squadMaintenance: {
        candidateCount: usesCanonicalSeniorSquads
          ? canonicalSeniorIntakeCandidates.length
          : seniorIntakeCandidates.length,
        addedPlayerCount: maintenanceRecords.reduce((sum, record) => sum + record.addedPlayerIds.length, 0),
        warningCount: maintenanceRecords.reduce((sum, record) => sum + record.warnings.length, 0),
        wageBudgetReallocationClubCount: wageBudgetReallocations.length,
        wageBudgetReallocationExactCeilingCount: wageBudgetReallocations.filter(({ clubId }) => {
          const account = rolledOver.careerState.clubFinanceState?.accounts[clubId];
          return account !== undefined
            && account.annualWageBudget > 0
            && account.committedAnnualWage === account.annualWageBudget;
        }).length,
        structuralWageBudgetTopUpClubCount:
          structuralWageBudgetTopUps.length,
        structuralReleaseClubCount: structuralReleases.length,
        freeAgentSignings: usesCanonicalSeniorSquads
          ? postTransferMaintained.records.flatMap((record) =>
              record.addedPlayerIds.map((playerId) => ({
                clubId: record.clubId,
                playerId,
              })))
          : [],
      },
      transferTurnover: {
        transferCount: monthlyLifecycle.marketLifecycle?.facts.filter(
          (fact) => fact.event === "transfer_completed",
        ).length ?? 0,
      },
      ...(monthlyLifecycle.marketLifecycle === undefined
        ? {}
        : {
            marketLifecycle: {
              facts: monthlyLifecycle.marketLifecycle.facts,
              diagnostics: monthlyLifecycle.marketLifecycle.diagnostics,
              preliminaryAgreementFacts:
                monthlyLifecycle.contractLifecycle?.preliminaryAgreementFacts ?? [],
              contractLifecycleFacts: monthlyLifecycle.contractLifecycle?.facts ?? [],
            },
          }),
      squadHealth: squadHealthFact(rolledOver.careerState),
      youthHealth: youthHealthFact(rolledOver.careerState),
      warnings,
    },
  };
}

type PreparedSeasonContext =
  | PreparedSeasonContextValid
  | {
      readonly status: "invalid";
      readonly reason: AdvanceCareerOneSeasonInvalidReason;
      readonly fixtureId?: FixtureId;
    };

interface PreparedSeasonContextValid {
  readonly status: "valid";
  readonly nextSeasonId: SeasonId;
  readonly nextSeasonStartDate: GameDate;
  readonly operationOrder: readonly CareerSeasonAdvancementOperation[];
  readonly archive?: {
    readonly entry: CareerSeasonArchiveEntry;
    readonly fact: CareerSeasonArchiveFact;
  };
  readonly nextSeasonFixtures?: readonly Fixture[];
  readonly nextCompetitionWorld?: DomesticCompetitionWorld;
  readonly categoryByClubId?: Readonly<Record<ClubId, CareerState["gameState"]["clubs"][ClubId]["category"]>>;
  readonly competitionArchives?: readonly {
    readonly entry: CompetitionSeasonHistoryEntry;
    readonly distribution?: CompetitionSeasonDistribution;
  }[];
  readonly movements?: readonly DomesticCompetitionMovement[];
}

/**
 * Rejects partial or reordered report tables before any career fact changes.
 *
 * A domestic report may deliberately supply no table evidence. Once it
 * supplies results, however, every competition must appear exactly once in
 * the registry's canonical order with the exact registered club membership.
 * This prevents a bounded report from silently treating unsimulated clubs as
 * completed-season evidence.
 */
function assertReportCompetitionResults(
  careerState: CareerState,
  results: readonly AdvanceCareerReportCompetitionResult[],
): void {
  if (results.length === 0) return;

  const seenCompetitionIds = new Set<CompetitionId>();
  for (const result of results) {
    if (seenCompetitionIds.has(result.competitionId)) {
      throw new Error(
        `Report refresh contains duplicate competition evidence: ${result.competitionId}`,
      );
    }
    seenCompetitionIds.add(result.competitionId);
    if (result.finalTable.length === 0) {
      throw new Error(
        `Report refresh contains an empty final table: ${result.competitionId}`,
      );
    }
  }

  const world = careerState.gameState.domesticCompetitionWorld;
  if (world === undefined) return;
  if (results.length !== world.competitionIds.length) {
    throw new Error(
      `Report refresh requires ${world.competitionIds.length} competition results, received ${results.length}`,
    );
  }

  for (const [index, expectedCompetitionId] of world.competitionIds.entries()) {
    const result = results[index];
    if (result?.competitionId !== expectedCompetitionId) {
      throw new Error(
        `Report refresh competition order mismatch at ${index}: expected ${expectedCompetitionId}, received ${String(result?.competitionId)}`,
      );
    }
    const competition = world.competitions[expectedCompetitionId];
    if (competition === undefined) {
      throw new Error(
        `Report refresh competition is missing from the registry: ${expectedCompetitionId}`,
      );
    }
    const expectedClubIds = new Set(competition.clubIds);
    const tableClubIds = result.finalTable.map(({ clubId }) => clubId);
    if (
      tableClubIds.length !== expectedClubIds.size
      || new Set(tableClubIds).size !== tableClubIds.length
      || tableClubIds.some((clubId) => !expectedClubIds.has(clubId))
    ) {
      throw new Error(
        `Report refresh final table does not match competition membership: ${expectedCompetitionId}`,
      );
    }
  }
}

function prepareSeasonContext(input: AdvanceCareerOneSeasonInput): PreparedSeasonContext {
  if (input.mode.kind === "reportRefresh") {
    assertReportCompetitionResults(input.careerState, input.mode.competitionResults);
    return {
      status: "valid",
      nextSeasonId: input.mode.nextSeasonId,
      nextSeasonStartDate: input.mode.nextSeasonStartDate,
      operationOrder: [],
    };
  }

  const domesticWorld = input.careerState.gameState.domesticCompetitionWorld;
  const domesticBoundary = domesticWorld === undefined
    ? undefined
    : prepareDomesticMovement(
        input.careerState,
        buildDomesticFinalTables(input.careerState, input.mode.tableRules),
      );
  if (domesticBoundary?.status === "invalid") return domesticBoundary;
  const nextCalendar = generateNextSeasonCalendar(
    input.careerState,
    domesticBoundary?.nextCompetitionWorld,
  );
  if (nextCalendar.status === "invalid") {
    return {
      status: "invalid",
      reason: nextCalendar.reason,
      ...(nextCalendar.fixtureId === undefined ? {} : { fixtureId: nextCalendar.fixtureId }),
    };
  }

  const archive = domesticBoundary === undefined
    ? buildSeasonArchive(input.careerState, nextCalendar, input.mode.tableRules)
    : buildSelectedSeasonArchive(
        input.careerState,
        domesticBoundary.finalTables,
      );
  if (archive.status === "invalid") {
    return archive;
  }

  return {
    status: "valid",
    nextSeasonId: nextCalendar.seasonId,
    nextSeasonStartDate: nextCalendar.seasonStartDate,
    operationOrder: [
      "completed_season_validation",
      "season_archive",
      ...(domesticBoundary === undefined ? [] : ["promotion_relegation" as const]),
    ],
    archive: archive.archive,
    nextSeasonFixtures: nextCalendar.fixtures,
    ...(domesticBoundary === undefined
      ? {}
      : {
          nextCompetitionWorld: domesticBoundary.nextCompetitionWorld,
          categoryByClubId: domesticBoundary.categoryByClubId,
          competitionArchives: domesticBoundary.competitionArchives,
          movements: domesticBoundary.movements,
        }),
  };
}

type SeasonArchiveBuildResult =
  | { readonly status: "valid"; readonly archive: NonNullable<PreparedSeasonContextValid["archive"]> }
  | { readonly status: "invalid"; readonly reason: "season_table_empty" | "selected_club_not_in_table" };

function buildSeasonArchive(
  careerState: CareerState,
  nextCalendar: NextSeasonCalendarGenerated,
  tableRules: LeagueTableRules,
): SeasonArchiveBuildResult {
  const fixtureIds = currentSeasonFixtureIds(careerState);
  const finalTable = computeLeagueTable({
    clubIds: careerState.gameState.clubIds,
    fixtures: careerState.gameState.fixtures,
    fixtureIds,
    rules: tableRules,
  });
  const champion = finalTable[0];
  if (champion === undefined) {
    return {
      status: "invalid",
      reason: "season_table_empty",
    };
  }

  const selectedClubFinish = finalTable.find((row) => row.clubId === careerState.selectedClubId);
  if (selectedClubFinish === undefined) {
    return {
      status: "invalid",
      reason: "selected_club_not_in_table",
    };
  }

  const aggregateGoals = aggregateGoalsFor(careerState, fixtureIds);
  const playerStatistics = buildCareerPlayerSeasonStatistics({
    careerState,
    seasonId: nextCalendar.previousSeasonId,
  });
  const entry: CareerSeasonArchiveEntry = {
    sequenceNumber: nextSeasonSequenceNumber(careerState),
    seasonId: nextCalendar.previousSeasonId,
    competitionId: nextCalendar.competitionIds[0]!,
    finalTable,
    championClubId: champion.clubId,
    selectedClubFinish,
    aggregateGoals,
    playerStatistics,
  };

  return {
    status: "valid",
    archive: {
      entry,
      fact: {
        seasonId: entry.seasonId,
        championClubId: entry.championClubId,
        selectedClubPosition: selectedClubFinish.position,
        aggregateGoals,
      },
    },
  };
}

interface PreparedDomesticMovement {
  readonly status: "valid";
  readonly finalTables: Readonly<Record<CompetitionId, readonly LeagueTableRow[]>>;
  readonly nextCompetitionWorld: DomesticCompetitionWorld;
  readonly categoryByClubId: NonNullable<PreparedSeasonContextValid["categoryByClubId"]>;
  readonly competitionArchives: NonNullable<PreparedSeasonContextValid["competitionArchives"]>;
  readonly movements: readonly DomesticCompetitionMovement[];
}

/**
 * Computes one immutable table per ordered competition from current fixtures.
 */
function buildDomesticFinalTables(
  careerState: CareerState,
  tableRules: LeagueTableRules,
): Readonly<Record<CompetitionId, readonly LeagueTableRow[]>> {
  const world = careerState.gameState.domesticCompetitionWorld;
  if (world === undefined) return {};
  return Object.fromEntries(world.competitionIds.map((competitionId) => {
    const competition = world.competitions[competitionId]!;
    const fixtureIds = currentSeasonFixtureIds(careerState).filter((fixtureId) =>
      careerState.gameState.fixtures[fixtureId]?.competitionId === competitionId
    );
    return [
      competitionId,
      computeLeagueTable({
        clubIds: competition.clubIds,
        fixtures: careerState.gameState.fixtures,
        fixtureIds,
        rules: tableRules,
      }),
    ];
  })) as Readonly<Record<CompetitionId, readonly LeagueTableRow[]>>;
}

/**
 * Applies movement and appends all completed tables without mutating the input.
 */
function prepareDomesticMovement(
  careerState: CareerState,
  finalTables: Readonly<Record<CompetitionId, readonly LeagueTableRow[]>>,
): PreparedDomesticMovement | {
  readonly status: "invalid";
  readonly reason: "season_table_empty" | "selected_club_not_in_table" | "promotion_relegation_invalid";
} {
  const world = careerState.gameState.domesticCompetitionWorld;
  if (world === undefined) {
    return { status: "invalid", reason: "promotion_relegation_invalid" };
  }
  if (world.competitionIds.some((competitionId) =>
    finalTables[competitionId]?.[0] === undefined
  )) {
    return { status: "invalid", reason: "season_table_empty" };
  }
  const selectedCompetitionId = world.competitionIds.find((competitionId) =>
    world.competitions[competitionId]?.clubIds.includes(careerState.selectedClubId)
      === true
  );
  if (
    selectedCompetitionId === undefined
    || finalTables[selectedCompetitionId]?.some((row) =>
      row.clubId === careerState.selectedClubId
    ) !== true
  ) {
    return { status: "invalid", reason: "selected_club_not_in_table" };
  }
  const movement = applyDomesticPromotionRelegation({
    competitionWorld: world,
    finalTables,
  });
  if (movement.status === "invalid") {
    return { status: "invalid", reason: "promotion_relegation_invalid" };
  }
  const firstSequence = nextCompetitionSeasonSequenceNumber(world);
  const competitionArchives = world.competitionIds.map(
    (competitionId, index) => ({
      entry: {
        sequenceNumber: firstSequence + index,
        seasonId: careerState.gameState.calendar.currentSeasonId,
        competitionId,
        finalTable: finalTables[competitionId]!.map((row) => ({ ...row })),
      },
      ...(world.competitions[competitionId]?.seasonDistribution === undefined
        ? {}
        : {
            distribution:
              world.competitions[competitionId]!.seasonDistribution,
          }),
    }),
  );

  return {
    status: "valid",
    finalTables,
    nextCompetitionWorld: {
      ...movement.competitionWorld,
      seasonHistory: [
        ...world.seasonHistory,
        ...competitionArchives.map(({ entry }) => entry),
      ],
    },
    categoryByClubId: movement.categoryByClubId,
    competitionArchives,
    movements: movement.movements,
  };
}

/**
 * Builds the manager-facing archive from the selected club's completed tier.
 */
function buildSelectedSeasonArchive(
  careerState: CareerState,
  finalTables: Readonly<Record<CompetitionId, readonly LeagueTableRow[]>>,
): SeasonArchiveBuildResult {
  const world = careerState.gameState.domesticCompetitionWorld;
  const competitionId = world?.competitionIds.find((candidateId) =>
    world.competitions[candidateId]?.clubIds.includes(careerState.selectedClubId)
      === true
  );
  const finalTable = competitionId === undefined
    ? undefined
    : finalTables[competitionId];
  const champion = finalTable?.[0];
  if (competitionId === undefined || finalTable === undefined || champion === undefined) {
    return { status: "invalid", reason: "season_table_empty" };
  }
  const selectedClubFinish = finalTable.find((row) =>
    row.clubId === careerState.selectedClubId
  );
  if (selectedClubFinish === undefined) {
    return { status: "invalid", reason: "selected_club_not_in_table" };
  }
  const fixtureIds = currentSeasonFixtureIds(careerState).filter((fixtureId) =>
    careerState.gameState.fixtures[fixtureId]?.competitionId === competitionId
  );
  const aggregateGoals = aggregateGoalsFor(careerState, fixtureIds);
  const entry: CareerSeasonArchiveEntry = {
    sequenceNumber: nextSeasonSequenceNumber(careerState),
    seasonId: careerState.gameState.calendar.currentSeasonId,
    competitionId,
    finalTable,
    championClubId: champion.clubId,
    selectedClubFinish,
    aggregateGoals,
    playerStatistics: buildCareerPlayerSeasonStatistics({
      careerState,
      seasonId: careerState.gameState.calendar.currentSeasonId,
    }),
  };
  return {
    status: "valid",
    archive: {
      entry,
      fact: {
        seasonId: entry.seasonId,
        championClubId: entry.championClubId,
        selectedClubPosition: selectedClubFinish.position,
        aggregateGoals,
      },
    },
  };
}

function nextCompetitionSeasonSequenceNumber(
  world: DomesticCompetitionWorld,
): number {
  return world.seasonHistory.reduce(
    (maximum, entry) => Math.max(maximum, entry.sequenceNumber),
    0,
  ) + 1;
}

function applyYouthIntakeIfCandidatesExist(input: {
  readonly careerState: CareerState;
  readonly seasonId: SeasonId;
  readonly intakeDate: GameDate;
  readonly candidates: readonly YouthIntakeCandidate[];
}): { readonly careerState: CareerState; readonly records: ReturnType<typeof applySeasonalYouthIntake>["records"] } {
  if (input.candidates.length === 0) {
    return {
      careerState: input.careerState,
      records: [],
    };
  }

  return applySeasonalYouthIntake(input);
}

function seasonDistributionInputs(
  input: AdvanceCareerOneSeasonInput,
  seasonContext: PreparedSeasonContextValid,
): readonly {
  readonly distribution: CompetitionSeasonDistribution;
  readonly finalTable: readonly LeagueTableRow[];
}[] {
  const mode = input.mode;
  if (mode.kind === "completedSeason") {
    return (seasonContext.competitionArchives ?? []).flatMap(
      ({ entry, distribution }) =>
        distribution === undefined
          ? []
          : [{ distribution, finalTable: entry.finalTable }],
    );
  }
  return mode.competitionResults.flatMap(({ seasonDistribution, finalTable }) =>
    seasonDistribution === undefined
      ? []
      : [{ distribution: seasonDistribution, finalTable }]
  );
}

/**
 * Projects authoritative completed tables into one-shot tier inputs.
 *
 * The frozen policy is defined for the canonical 18-club pyramid. Smaller
 * report fixtures deliberately emit no partial evidence, causing the owning
 * division to carry forward rather than mixing observed and invented rows.
 */
function completedClubResults(
  input: AdvanceCareerOneSeasonInput,
  seasonContext: PreparedSeasonContextValid,
): Readonly<Partial<Record<ClubId, ClubCompletedSeasonResult>>> {
  const tables = input.mode.kind === "reportRefresh"
    ? input.mode.competitionResults.map(({ finalTable }) => finalTable)
    : seasonContext.competitionArchives?.map(({ entry }) => entry.finalTable)
      ?? (seasonContext.archive === undefined ? [] : [seasonContext.archive.entry.finalTable]);
  const movementByClubId = new Map(
    (seasonContext.movements ?? []).map((movement) => [movement.clubId, movement] as const),
  );
  const completedResultByClubId: Partial<Record<ClubId, ClubCompletedSeasonResult>> = {};

  for (const table of tables) {
    if (table.length !== CLUB_COMPETITIVE_TIER_DIVISION_SIZE) continue;
    for (const row of table) {
      const previousCategory: ClubCategory | undefined =
        input.careerState.gameState.clubs[row.clubId]?.category;
      if (previousCategory === undefined) continue;
      const movement = movementByClubId.get(row.clubId);
      completedResultByClubId[row.clubId] = {
        previousCategory,
        finalPosition: row.position,
        clubCount: table.length,
        champion: row.position === 1,
        ...(movement === undefined ? {} : { movement: movement.outcome }),
      };
    }
  }

  return completedResultByClubId;
}

function intakeCandidatesNotYetActive(
  careerState: CareerState,
  candidates: readonly CareerIntakeCandidate[],
): readonly CareerIntakeCandidate[] {
  const activePlayerIds = new Set(careerState.gameState.playerIds);
  return candidates.filter((candidate) => !activePlayerIds.has(candidate.player.id));
}

function applyCompletedSeasonChangesIfNeeded(
  careerState: CareerState,
  seasonContext: PreparedSeasonContextValid,
  operationOrder: CareerSeasonAdvancementOperation[],
): CareerState {
  if (
    seasonContext.archive === undefined
    && seasonContext.nextCompetitionWorld === undefined
  ) {
    return careerState;
  }

  const mergedFixtures = seasonContext.nextSeasonFixtures === undefined
    ? {
        fixtures: careerState.gameState.fixtures,
        fixtureIds: careerState.gameState.fixtureIds,
      }
    : mergeFixtures(careerState, seasonContext.nextSeasonFixtures);
  if (seasonContext.nextSeasonFixtures !== undefined) {
    operationOrder.push("next_calendar_merge");
  }
  const clubs = seasonContext.categoryByClubId === undefined
    ? careerState.gameState.clubs
    : Object.fromEntries(careerState.gameState.clubIds.map((clubId) => {
        const club = careerState.gameState.clubs[clubId]!;
        return [
          clubId,
          {
            ...club,
            category: seasonContext.categoryByClubId?.[clubId] ?? club.category,
          },
        ];
      })) as CareerState["gameState"]["clubs"];
  const careerStateWithoutPreparation = seasonContext.archive === undefined
    ? careerState
    : withoutCurrentSeasonManagerPreparation(careerState);

  return createCareerState({
    ...careerStateWithoutPreparation,
    gameState: {
      ...careerState.gameState,
      clubs,
      fixtures: mergedFixtures.fixtures,
      fixtureIds: mergedFixtures.fixtureIds,
      ...(seasonContext.nextCompetitionWorld === undefined
        ? {}
        : { domesticCompetitionWorld: seasonContext.nextCompetitionWorld }),
    },
    ...(seasonContext.archive === undefined
      ? {}
      : {
          seasonHistory: [
            ...(careerState.seasonHistory ?? []),
            seasonContext.archive.entry,
          ],
          currentSeasonInbox: [],
        }),
  });
}

function withoutCurrentSeasonManagerPreparation(
  careerState: CareerState,
): Omit<CareerState, "matchPreparation" | "currentSeasonInbox"> {
  const {
    matchPreparation: _matchPreparation,
    currentSeasonInbox: _currentSeasonInbox,
    ...remaining
  } = careerState;
  return remaining;
}

function currentSeasonFixtureIds(careerState: CareerState): readonly FixtureId[] {
  const fixtureIds: FixtureId[] = [];
  const currentSeasonId = careerState.gameState.calendar.currentSeasonId;

  for (const fixtureId of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureId];
    if (fixture?.seasonId === currentSeasonId) {
      fixtureIds.push(fixtureId);
    }
  }

  return fixtureIds;
}

function aggregateGoalsFor(careerState: CareerState, fixtureIds: readonly FixtureId[]): CareerSeasonAggregateGoals {
  let fixtureCount = 0;
  let totalGoals = 0;

  for (const fixtureId of fixtureIds) {
    const result = careerState.gameState.fixtures[fixtureId]?.result;
    if (result === undefined) {
      continue;
    }

    fixtureCount += 1;
    totalGoals += result.homeGoals + result.awayGoals;
  }

  return { fixtureCount, totalGoals };
}

function mergeFixtures(
  careerState: CareerState,
  nextFixtures: readonly Fixture[],
): { readonly fixtures: CareerState["gameState"]["fixtures"]; readonly fixtureIds: CareerState["gameState"]["fixtureIds"] } {
  const fixtures = { ...careerState.gameState.fixtures };
  const fixtureIds = [...careerState.gameState.fixtureIds];

  for (const fixture of nextFixtures) {
    fixtures[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  return { fixtures, fixtureIds };
}

function nextSeasonSequenceNumber(careerState: CareerState): number {
  let maxSequenceNumber = 0;

  for (const entry of careerState.seasonHistory ?? []) {
    maxSequenceNumber = Math.max(maxSequenceNumber, entry.sequenceNumber);
  }

  return maxSequenceNumber + 1;
}

function monthlyPlayerDevelopmentFact(summaries: readonly CareerMonthlyLifecycleSummary[]): CareerPlayerDevelopmentFact {
  const academy = summaries.flatMap((summary) =>
    summary.academyParticipation === undefined ? [] : [summary.academyParticipation]);
  return {
    changeCount: summaries.reduce((sum, summary) => sum + summary.developmentChangeCount, 0),
    playersImproved: summaries.reduce((sum, summary) => sum + summary.playersImproved, 0),
    playersDeclined: summaries.reduce((sum, summary) => sum + summary.playersDeclined, 0),
    totalGrowth: roundFactNumber(summaries.reduce((sum, summary) => sum + summary.totalGrowth, 0)),
    totalDecline: roundFactNumber(summaries.reduce((sum, summary) => sum + summary.totalDecline, 0)),
    ...(academy.length === 0
      ? {}
      : {
          academyParticipation: {
            fixtureCount: academy.reduce((sum, row) => sum + row.fixtureCount, 0),
            appearanceCount: academy.reduce((sum, row) => sum + row.appearanceCount, 0),
            playerCount: academy.reduce((sum, row) => sum + row.playerCount, 0),
            minutes: academy.reduce((sum, row) => sum + row.minutes, 0),
            fullProgrammePlayerMonthCount: academy.reduce(
              (sum, row) => sum + row.fullProgrammePlayerMonthCount,
              0,
            ),
            reducedProgrammePlayerMonthCount: academy.reduce(
              (sum, row) => sum + row.reducedProgrammePlayerMonthCount,
              0,
            ),
            fullyReplacedPlayerMonthCount: academy.reduce(
              (sum, row) => sum + row.fullyReplacedPlayerMonthCount,
              0,
            ),
            missingPlayerMonthCount: academy.reduce(
              (sum, row) => sum + row.missingPlayerMonthCount,
              0,
            ),
            invalidMinuteCount: academy.reduce(
              (sum, row) => sum + row.invalidMinuteCount,
              0,
            ),
          },
        }),
  };
}

function playerExitFact(exits: readonly PlayerExitRecord[]): CareerPlayerExitFact {
  return {
    exitCount: exits.length,
    reasons: {
      retirement: exits.filter((exit) => exit.reason === "retirement").length,
      released: exits.filter((exit) => exit.reason === "released").length,
      career_step_down: exits.filter((exit) => exit.reason === "career_step_down").length,
    },
    playerIdsByReason: {
      retirement: exits.filter((exit) => exit.reason === "retirement").map((exit) => exit.playerId),
      released: exits.filter((exit) => exit.reason === "released").map((exit) => exit.playerId),
      career_step_down: exits.filter((exit) => exit.reason === "career_step_down").map((exit) => exit.playerId),
    },
  };
}

function youthLifecycleFact(
  records: readonly YouthLifecycleRecord[],
  selectedClubId: ClubId,
): CareerYouthLifecycleFact {
  return {
    recordCount: records.length,
    promotionCandidateCount: records.filter((record) => record.outcome === "promotion_candidate").length,
    externalMoveCandidateCount: records.filter((record) => record.outcome === "external_move_candidate").length,
    releasedCount: records.filter((record) => record.outcome === "released").length,
    selectedClubDecisionCount: records.filter((record) => record.clubId === selectedClubId && record.outcome === "promotion_candidate").length,
    playerIdsByOutcome: {
      promotion_candidate: records
        .filter((record) => record.outcome === "promotion_candidate")
        .map((record) => record.playerId),
      external_move_candidate: records
        .filter((record) => record.outcome === "external_move_candidate")
        .map((record) => record.playerId),
      released: records
        .filter((record) => record.outcome === "released")
        .map((record) => record.playerId),
    },
  };
}

function advancementWarnings(records: readonly YouthLifecycleRecord[], selectedClubId: ClubId): readonly CareerSeasonAdvancementWarning[] {
  return records.some((record) => record.clubId === selectedClubId && record.outcome === "promotion_candidate")
    ? ["selected_club_youth_decision_pending"]
    : [];
}

function squadHealthFact(careerState: CareerState): CareerSquadHealthFact {
  const squadSizes = careerState.gameState.clubIds.map((clubId) => careerState.gameState.clubs[clubId]?.playerIds.length ?? 0);
  const seniorPlayerCount = squadSizes.reduce((sum, size) => sum + size, 0);

  return {
    seniorPlayerCount,
    minimumSquadSize: safeMin(squadSizes),
    averageSquadSize: average(squadSizes),
    maximumSquadSize: safeMax(squadSizes),
    clubsBelowMinimumSquadSize: squadSizes.filter((size) => size < MINIMUM_CAREER_SQUAD_SIZE).length,
    clubsWithoutNaturalGoalkeeper: careerState.gameState.clubIds.filter((clubId) => !hasNaturalGoalkeeper(careerState, clubId)).length,
  };
}

function youthHealthFact(careerState: CareerState): CareerYouthHealthFact {
  const youthSizes = careerState.gameState.clubIds.map((clubId) => careerState.youthAcademyState?.clubRosters[clubId]?.playerIds.length ?? 0);
  const seniorPlayerCount = careerState.gameState.clubIds.reduce(
    (total, clubId) =>
      total + (careerState.gameState.clubs[clubId]?.playerIds.length ?? 0),
    0,
  );
  const youthPlayerCount = youthSizes.reduce((sum, size) => sum + size, 0);

  return {
    youthPlayerCount,
    activePlayerCount: seniorPlayerCount + youthPlayerCount,
    minimumYouthRosterSize: safeMin(youthSizes),
    averageYouthRosterSize: average(youthSizes),
    maximumYouthRosterSize: safeMax(youthSizes),
    selectedClubYouthSize: careerState.youthAcademyState?.clubRosters[careerState.selectedClubId]?.playerIds.length ?? 0,
    clubsAboveYouthTarget: youthSizes.filter((size) => size > YOUTH_ROSTER_TARGET_MAXIMUM).length,
    clubsBelowYouthMinimum: youthSizes.filter((size) => size < YOUTH_ROSTER_TARGET_MINIMUM).length,
  };
}

function hasNaturalGoalkeeper(careerState: CareerState, clubId: ClubId): boolean {
  const club = careerState.gameState.clubs[clubId];
  if (club === undefined) {
    return false;
  }

  return club.playerIds.some((playerId) => careerState.gameState.players[playerId]?.naturalPositions[0] === "gk");
}

function safeMin(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.min(...values);
}

function safeMax(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : roundFactNumber(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function roundFactNumber(value: number): number {
  return Math.round(value * 100) / 100;
}
