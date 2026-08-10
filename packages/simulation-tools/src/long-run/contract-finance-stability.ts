import {
  createClubFinanceState,
  createContractNegotiationState,
  createPreliminaryAgreementState,
  createSeniorSquadState,
  createTransferNegotiationState,
  isLivePreliminaryAgreement,
  isOpenContractNegotiation,
  NEGOTIATION_STAGE_MAX_DAYS,
  playerSquadDepartment,
  resolveTransferWindowStatus,
  type CareerState,
  type ClubFinanceLedgerEntry,
  type ClubFinanceLedgerReason,
  type ClubCategory,
  type ClubId,
  type ContractNegotiation,
  type ContractOfferTerms,
  type PlayerContract,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type SeasonTransferWindows,
  type SeniorSquadRegistration,
} from "@game/domain";
import {
  aiMarketTargetDepartment,
  checkContractOfferAffordability,
  deriveMarketPendingExposure,
  derivePlayerValuation,
  derivePublicPlayerAssessment,
  selectFreeAgentPlayerIds,
  type CareerSeasonMarketLifecycleFact,
  type CareerSquadMaintenanceFact,
  type CareerPlayerExitFact,
  type CareerYouthLifecycleFact,
  type PlayerValuationConfig,
} from "@game/engine";

import type { LongRunAnomalyStatus } from "./anomaly-scoring.ts";

/** Coarse squad departments used only by long-run structural diagnostics. */
export type LongRunSquadDepartment = "goalkeeper" | "defender" | "midfielder" | "attacker";

/** Money posted by one ledger reason during one simulated season. */
export type LongRunLedgerReasonAmounts = Readonly<Record<ClubFinanceLedgerReason, number>>;

/** One stable market loss slice compacted by buyer, department, and reason. */
export interface LongRunMarketLossSlice {
  readonly clubId: string;
  readonly department: LongRunSquadDepartment;
  readonly reason: string;
  /** Separates actionable in-window losses from normal closed-window observations. */
  readonly transferWindowOpen: boolean;
  readonly count: number;
}

/** One club's permanent and preliminary recruitment activity. */
export interface LongRunMarketClubActivity {
  readonly clubId: string;
  readonly needsEvaluatedCount: number;
  readonly recruitableNeedCount: number;
  readonly permanentTargetFoundCount: number;
  readonly permanentOfferSubmittedCount: number;
  readonly permanentCompletedCount: number;
  readonly preliminaryOfferSubmittedCount: number;
}

/** Compact permanent-transfer funnel counters for one season or aggregate run. */
export interface LongRunPermanentTransferFunnel {
  readonly needsEvaluatedCount: number;
  readonly recruitableNeedCount: number;
  readonly targetFoundCount: number;
  readonly targetUnavailableCount: number;
  readonly offerSubmittedCount: number;
  readonly sellerRejectedCount: number;
  readonly sellerCounteredCount: number;
  readonly sellerAcceptedCount: number;
  readonly sellerExpiredCount: number;
  readonly sellerWithdrawnCount: number;
  readonly playerTermsStartedCount: number;
  readonly playerCounteredCount: number;
  readonly playerRejectedCount: number;
  readonly playerCounterAcceptedCount: number;
  readonly unaffordableCompletionCount: number;
  readonly completedCount: number;
  /** Stable engine reason counts for lost stages. */
  readonly lostReasonCounts: Readonly<Record<string, number>>;
  /** Stable loss rows used to inspect frequency by club and department. */
  readonly lostByClubDepartment: readonly LongRunMarketLossSlice[];
  /** Club activity rows that keep permanent and preliminary starts comparable. */
  readonly clubActivity: readonly LongRunMarketClubActivity[];
}

/** Compact preliminary-agreement funnel counters for one season or aggregate run. */
export interface LongRunPreliminaryAgreementFunnel {
  readonly candidateFoundCount: number;
  readonly candidateUnavailableCount: number;
  readonly offerSubmittedCount: number;
  readonly offerRejectedCount: number;
  readonly counteredCount: number;
  readonly counterAcceptedCount: number;
  readonly counterRejectedCount: number;
  readonly agreementCreatedCount: number;
  readonly expiredCount: number;
  readonly activationCount: number;
  readonly activationFailureCount: number;
  /** Stable engine reason counts for lost stages. */
  readonly lostReasonCounts: Readonly<Record<string, number>>;
}

/** Closing free-agent population bands used by the long-run economy diagnosis. */
export interface LongRunFreeAgentBands {
  readonly age: Readonly<Record<"under_23" | "prime_23_29" | "age_30_34" | "age_35_plus", number>>;
  readonly currentAbility: Readonly<Record<"under_8" | "ability_8_9" | "ability_10_11" | "ability_12_plus", number>>;
  readonly unattached: Readonly<Record<"under_1_season" | "one_to_two_seasons" | "three_plus_seasons", number>>;
}

/** Stock-flow reconciliation for free agents across one season transition. */
export interface LongRunFreeAgentFlow {
  readonly openingStock: number;
  readonly expiryInflow: number;
  readonly releaseInflow: number;
  /** Academy age-outs that enter the unattached senior-player pool. */
  readonly youthExternalMoveInflow: number;
  /** Academy releases that enter the unattached senior-player pool. */
  readonly youthReleaseInflow: number;
  readonly otherInflow: number;
  readonly ordinarySigningOutflow: number;
  readonly preliminaryActivationOutflow: number;
  readonly retirementOutflow: number;
  readonly careerStepDownOutflow: number;
  readonly otherOutflow: number;
  readonly closingStock: number;
  /** Must be zero when opening + inflows - outflows equals closing stock. */
  readonly reconciliationDelta: number;
  /** Prime-age free agents with public current ability at or above 10. */
  readonly usefulClosingStock: number;
  readonly bands: LongRunFreeAgentBands;
}

/**
 * Compact source-backed wage and contract distribution for one division.
 *
 * The row deliberately keeps salary, bonuses, club commitment, utilization,
 * and headroom separate so diagnostics never imply that wages come from public
 * market value.
 */
export interface LongRunDivisionWageEconomyRow {
  readonly division: ClubCategory;
  readonly clubCount: number;
  readonly playerCount: number;
  readonly annualWageP50: number;
  readonly annualWageP90: number;
  readonly annualWageP99: number;
  readonly signingBonusP50: number;
  readonly appearanceBonusP50: number;
  readonly goalBonusP50: number;
  readonly cleanSheetBonusP50: number;
  readonly committedAnnualWageP50: number;
  readonly committedAnnualWageP90: number;
  readonly committedAnnualWageP99: number;
  readonly wageBudgetUtilizationP50: number;
  readonly wageBudgetUtilizationP90: number;
  readonly wageBudgetUtilizationP99: number;
  readonly annualWageHeadroomP50: number;
  readonly annualWageHeadroomP10: number;
}

/**
 * Compact club-finance and market activity distribution for one division.
 *
 * Cash, transfer allocation, pending cash, and pending annual wages remain
 * separate because none is an interchangeable affordability constraint.
 */
export interface LongRunDivisionMarketEconomyRow {
  readonly division: ClubCategory;
  readonly clubCount: number;
  readonly cashBalanceP50: number;
  readonly cashBalanceP90: number;
  readonly cashBalanceP99: number;
  readonly availableTransferBudgetP50: number;
  readonly availableTransferBudgetP90: number;
  readonly availableTransferBudgetP99: number;
  readonly pendingCashExposureP50: number;
  readonly pendingCashExposureP90: number;
  readonly pendingCashExposureP99: number;
  readonly pendingAnnualWageExposureP50: number;
  readonly pendingAnnualWageExposureP90: number;
  readonly pendingAnnualWageExposureP99: number;
  readonly permanentAttemptCount: number;
  readonly permanentCompletionCount: number;
  readonly freeAgentSigningCount: number;
}

/** One source-to-destination tier transfer slice for the current season. */
export interface LongRunCrossTierTransferRow {
  readonly sourceDivision: ClubCategory;
  readonly destinationDivision: ClubCategory;
  readonly attemptCount: number;
  readonly completionCount: number;
  readonly publicValueP50: number;
  readonly askingPriceP50: number;
  readonly completedFeeP50: number;
  readonly rejectionReasonCounts: Readonly<Record<string, number>>;
}

/** One season snapshot of contract, registration, finance, and plan health. */
export interface LongRunContractFinanceSeasonRow {
  /** One-based simulated season number. */
  readonly seasonNumber: number;
  /** Current in-world date after the season refresh. */
  readonly currentDate: number;
  /** Owned senior players after refresh. */
  readonly ownedSeniorPlayerCount: number;
  /** Current free agents derived from ownership truth. */
  readonly freeAgentCount: number;
  /** Free-agent share of the active player universe. */
  readonly freeAgentShare: number;
  /** Public values of free agents signed by canonical squad replenishment. */
  readonly freeAgentSigningPublicValues: readonly number[];
  /** Missing mandatory Phase 78 aggregate states. */
  readonly missingStateCount: number;
  /** Canonical senior-squad validation failures. */
  readonly seniorSquadInvariantViolationCount: number;
  /** Registration, ownership, shirt-number, and active-contract violations. */
  readonly ownershipInvariantViolationCount: number;
  /** AI active agreements outside their valid date interval. */
  readonly activeContractDateViolationCount: number;
  /** Selected-club expired agreements awaiting an explicit manager decision. */
  readonly selectedClubExpiredDecisionCount: number;
  /** Free agents that still have ownership, registration, contract, or academy facts. */
  readonly freeAgentInvariantViolationCount: number;
  /** Canonical negotiation-state validation failures. */
  readonly negotiationInvariantViolationCount: number;
  /** Open AI terms that bypass current cash or annual-wage affordability. */
  readonly unaffordableAiOfferCount: number;
  /** Canonical finance-state validation failures. */
  readonly financeInvariantViolationCount: number;
  /** Duplicate new ledger business facts that would charge one event twice. */
  readonly duplicateLedgerBusinessFactCount: number;
  /** Clubs whose annual payroll debit does not match eligible starting agreements. */
  readonly annualPayrollReconciliationViolationCount: number;
  /** Clubs with negative cash, impossible transfer room, or excessive wage commitment. */
  readonly financeLimitViolationCount: number;
  /** Lowest club cash balance after refresh, in minor units. */
  readonly minimumCashBalance: number;
  /** Highest committed-wage share of an annual wage budget. */
  readonly maximumWageBudgetUtilization: number;
  /** One bounded utilization observation for every active club account. */
  readonly wageBudgetUtilizations: readonly number[];
  /** Remaining annual-wage budget for every active club account. */
  readonly annualWageHeadrooms: readonly number[];
  /** Clubs at or above the pressure boundary during this season. */
  readonly wagePressureClubCount: number;
  /** Clubs exactly at their annual-wage ceiling during this season. */
  readonly exactWageCeilingClubCount: number;
  /** Clubs above their annual-wage ceiling during this season. */
  readonly aboveWageBudgetClubCount: number;
  /** Exact-ceiling clubs reached after transfer-to-wage reallocation. */
  readonly reallocationExactCeilingClubCount: number;
  /** Smallest senior squad after refresh. */
  readonly minimumSquadSize: number;
  /** Largest senior squad after refresh. */
  readonly maximumSquadSize: number;
  /** Lowest natural goalkeeper count at one club. */
  readonly minimumGoalkeeperCount: number;
  /** Lowest natural defender count at one club. */
  readonly minimumDefenderCount: number;
  /** Lowest natural midfielder count at one club. */
  readonly minimumMidfielderCount: number;
  /** Lowest natural attacker count at one club. */
  readonly minimumAttackerCount: number;
  /** Youngest senior-player age. */
  readonly minimumAge: number;
  /** Average senior-player age. */
  readonly averageAge: number;
  /** Oldest senior-player age. */
  readonly maximumAge: number;
  /** Lowest active annual wage, in minor units. */
  readonly minimumAnnualWage: number;
  /** Average active annual wage, in minor units. */
  readonly averageAnnualWage: number;
  /** Highest active annual wage, in minor units. */
  readonly maximumAnnualWage: number;
  /** Per-division wage, bonus, commitment, utilization, and headroom diagnostics. */
  readonly divisionWageEconomy: readonly LongRunDivisionWageEconomyRow[];
  /** Per-division liquid finance, exposure, and completed recruitment diagnostics. */
  readonly divisionMarketEconomy: readonly LongRunDivisionMarketEconomyRow[];
  /** Source/destination division attempts, completions, prices, and losses. */
  readonly crossTierTransfers: readonly LongRunCrossTierTransferRow[];
  /** Number of players valued on this checkpoint season. */
  readonly valuationSampleCount: number;
  /** Lowest sampled player value, in minor units. */
  readonly minimumPlayerValue: number;
  /** Average sampled player value, in minor units. */
  readonly averagePlayerValue: number;
  /** Highest sampled player value, in minor units. */
  readonly maximumPlayerValue: number;
  /** Agreements ending within the next 365 days. */
  readonly expiringContractCount: number;
  /** Open contract negotiations after refresh. */
  readonly openNegotiationCount: number;
  /** Renewals recorded during this season refresh. */
  readonly renewalCount: number;
  /** Releases recorded during this season refresh. */
  readonly releaseCount: number;
  /** Expiries recorded during this season refresh. */
  readonly expiryCount: number;
  /** Ledger money posted during this season, grouped by concrete reason. */
  readonly ledgerReasonAmounts: LongRunLedgerReasonAmounts;
  /** Season transitions where a selected plan existed before refresh. */
  readonly selectedPlanObservationCount: number;
  /** Still-owned selected players removed without a manager decision. */
  readonly selectedPlanRetainedPlayerMissingCount: number;
  /** Players inserted into the selected plan without a manager decision. */
  readonly selectedPlanHiddenReplacementCount: number;
  /** Completed permanent transfers in this season transition. */
  readonly completedTransferCount: number;
  /** Completed permanent transfers outside an open window. */
  readonly transferWindowViolationCount: number;
  /** Negotiation stage clocks exceeding 3 days or expired without resolution. */
  readonly negotiationClockViolationCount: number;
  /** Completed transfers exceeding buyer cash, transfer budget, or wage headroom. */
  readonly unaffordableCompletedTransferCount: number;
  /** Live or agreed preliminary agreements. */
  readonly preliminaryAgreementCount: number;
  /** Preliminary agreements activated in this season transition. */
  readonly preliminaryAgreementActivationCount: number;
  /** Preliminary agreement invariant violations. */
  readonly preliminaryAgreementViolationCount: number;
  /** Permanent-transfer activity funnel for this season. */
  readonly permanentTransferFunnel: LongRunPermanentTransferFunnel;
  /** Preliminary-agreement activity funnel for this season. */
  readonly preliminaryAgreementFunnel: LongRunPreliminaryAgreementFunnel;
  /** Free-agent opening stock, flows, closing stock, and population bands. */
  readonly freeAgentFlow: LongRunFreeAgentFlow;
}

/** One machine-readable contract and finance long-run check. */
export interface LongRunContractFinanceCheck {
  /** Stable report key. */
  readonly key: string;
  /** PASS/WARN/FAIL status. */
  readonly status: LongRunAnomalyStatus;
  /** Numeric value that produced the status. */
  readonly value: number;
  /** Number of inspected facts; independent from the numeric result. */
  readonly observationCount: number;
  /** Whether the check had at least one fact to evaluate. */
  readonly evaluationStatus: "evaluated" | "not_evaluated";
  /** Locked interpretation written before release-gate execution. */
  readonly threshold: string;
  /** Player-facing reason this check matters. */
  readonly gameplayMeaning: "structure" | "decision" | "football_story";
}

/** Aggregate stability report for one deterministic career world. */
export interface LongRunContractFinanceStabilityReport {
  /** Worst status across contract and finance checks. */
  readonly status: LongRunAnomalyStatus;
  /** Total structural violations across all season rows. */
  readonly structuralViolationCount: number;
  /** Lowest cash balance observed. */
  readonly minimumCashBalanceObserved: number;
  /** Highest annual wage-budget utilization observed. */
  readonly maximumWageBudgetUtilizationObserved: number;
  /** Highest free-agent share observed. */
  readonly maximumFreeAgentShareObserved: number;
  /** Lowest sampled player value observed. */
  readonly minimumPlayerValueObserved: number;
  /** Highest sampled player value observed. */
  readonly maximumPlayerValueObserved: number;
  /** Total renewals across the run. */
  readonly renewalCount: number;
  /** Total releases across the run. */
  readonly releaseCount: number;
  /** Total expiries across the run. */
  readonly expiryCount: number;
  /** Total selected-club expiry decisions intentionally left to the manager. */
  readonly selectedClubExpiredDecisionCount: number;
  /** Total completed permanent transfers across the run. */
  readonly completedTransferCount: number;
  /** Total preliminary agreements recorded across the run. */
  readonly preliminaryAgreementCount: number;
  /** Total preliminary agreements activated across the run. */
  readonly preliminaryAgreementActivationCount: number;
  /** Permanent-transfer funnel aggregated across every season. */
  readonly permanentTransferFunnel: LongRunPermanentTransferFunnel;
  /** Preliminary-agreement funnel aggregated across every season. */
  readonly preliminaryAgreementFunnel: LongRunPreliminaryAgreementFunnel;
  /** Median club-season wage utilization. */
  readonly wageBudgetUtilizationP50: number;
  /** 90th-percentile club-season wage utilization. */
  readonly wageBudgetUtilizationP90: number;
  /** 95th-percentile club-season wage utilization. */
  readonly wageBudgetUtilizationP95: number;
  /** 99th-percentile club-season wage utilization. */
  readonly wageBudgetUtilizationP99: number;
  /** Share of club-seasons at or above 95% utilization. */
  readonly wagePressureClubSeasonShare: number;
  /** Share of club-seasons exactly at the wage ceiling. */
  readonly exactWageCeilingClubSeasonShare: number;
  /** Share of club-seasons above the wage budget. */
  readonly aboveWageBudgetClubSeasonShare: number;
  /** Exact-ceiling club-seasons reached after transfer-to-wage reallocation. */
  readonly reallocationExactCeilingClubSeasonCount: number;
  /** Median remaining annual-wage headroom in minor units. */
  readonly annualWageHeadroomP50: number;
  /** 10th-percentile remaining annual-wage headroom in minor units. */
  readonly annualWageHeadroomP10: number;
  /** Highest useful closing free-agent count observed. */
  readonly maximumUsefulFreeAgentCountObserved: number;
  /** Closing-stock band observations aggregated across the run's seasons. */
  readonly freeAgentBandObservations: LongRunFreeAgentBands;
  /** Per-division economy at the final retained season boundary. */
  readonly closingDivisionWageEconomy: readonly LongRunDivisionWageEconomyRow[];
  /** Per-division cash, transfer-room, exposure, and market-flow diagnostics at the final boundary. */
  readonly closingDivisionMarketEconomy: readonly LongRunDivisionMarketEconomyRow[];
  /** Cross-tier permanent-transfer attempts and completions at the final boundary. */
  readonly closingCrossTierTransfers: readonly LongRunCrossTierTransferRow[];
  /** Ordered checks used by CLI and structured gates. */
  readonly checks: readonly LongRunContractFinanceCheck[];
  /** Original compact season rows. */
  readonly seasons: readonly LongRunContractFinanceSeasonRow[];
}

/** Inputs needed to inspect one canonical season transition. */
export interface CreateLongRunContractFinanceSeasonRowInput {
  /** One-based simulated season number. */
  readonly seasonNumber: number;
  /** Career before annual payroll and season lifecycle. */
  readonly previousCareerState: CareerState;
  /** Career after the canonical season lifecycle. */
  readonly careerState: CareerState;
  /**
   * Resolved competition-owned registration windows for this career.
   *
   * Required so the gate checks completion dates against the same catalog the
   * engine enforces. Simulation tooling must never restate window dates: that
   * truth belongs to the competition content the caller already resolved.
   */
  readonly transferWindows: SeasonTransferWindows;
  /** Versioned public-value content supplied by the application composition root. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Exact version-selected wage policy used by engine affordability checks. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Season-scoped market facts emitted by the canonical engine advancement. */
  readonly marketLifecycle?: CareerSeasonMarketLifecycleFact;
  /** Season-scoped exit IDs and reasons used for free-agent stock reconciliation. */
  readonly playerExits?: CareerPlayerExitFact;
  /** Reallocation facts used to attribute exact-ceiling wage states. */
  readonly squadMaintenance?: CareerSquadMaintenanceFact;
  /** Academy age-out IDs used to explain non-contract free-agent inflow. */
  readonly youthLifecycle?: CareerYouthLifecycleFact;
}

const LEDGER_REASONS: readonly ClubFinanceLedgerReason[] = [
  "opening_capital",
  "season_distribution",
  "transfer_fee_paid",
  "transfer_fee_received",
  "contract_signing_bonus",
  "annual_base_wage",
  "appearance_bonus",
  "goal_bonus",
  "clean_sheet_bonus",
];

/** Minimum senior squad that remains meaningfully usable by the current match layer. */
const MINIMUM_STRUCTURAL_SQUAD_SIZE = 18;

/** Wage pressure above this level is surfaced for design review, not treated as corruption. */
const WAGE_UTILIZATION_WARNING = 0.95;

/** One in four pressured club-seasons indicates league-wide wage compression. */
const WAGE_PRESSURE_PREVALENCE_WARNING = 0.25;

/** Repeated exact-ceiling contact becomes a story signal at one in ten club-seasons. */
const EXACT_WAGE_CEILING_PREVALENCE_WARNING = 0.1;

/** A free-agent pool above this share can make turnover feel noisy or disposable. */
const FREE_AGENT_SHARE_WARNING = 0.25;

/** Valuations are sampled at stable checkpoints to keep 10,000 x 50 gates practical. */
const VALUATION_CHECKPOINT_INTERVAL = 10;

/**
 * Inspects one real career transition without retaining a copy of the world.
 *
 * Canonical validators remain the source of structural truth. The additional
 * counters explain failures by football concept and keep large reports small.
 */
export function createLongRunContractFinanceSeasonRow(
  input: CreateLongRunContractFinanceSeasonRowInput,
): LongRunContractFinanceSeasonRow {
  const previous = input.previousCareerState;
  const current = input.careerState;
  const senior = current.seniorSquadState;
  const finance = current.clubFinanceState;
  const negotiations = current.contractNegotiationState;
  const currentDate = current.gameState.calendar.currentDate;
  let seniorSquadInvariantViolationCount = 0;
  let financeInvariantViolationCount = 0;
  let negotiationInvariantViolationCount = 0;

  if (senior !== undefined) {
    try {
      createSeniorSquadState(current.gameState, senior);
    } catch {
      seniorSquadInvariantViolationCount += 1;
    }
  }
  if (senior !== undefined && finance !== undefined) {
    try {
      createClubFinanceState(current.gameState, senior, finance);
    } catch {
      financeInvariantViolationCount += 1;
    }
  }
  if (negotiations !== undefined) {
    try {
      createContractNegotiationState(current.gameState, senior, negotiations);
    } catch {
      negotiationInvariantViolationCount += 1;
    }
  }

  const ownedPlayerClub = ownedPlayerClubs(current);
  const activeContracts = activeContractsFor(senior);
  const activeContractByPlayer = new Map(activeContracts.map((contract) => [contract.playerId, contract]));
  const registrations = senior?.registrationIds.flatMap((id) => {
    const registration = senior.registrations[id];
    return registration === undefined ? [] : [registration];
  }) ?? [];
  const registrationByPlayer = new Map(registrations.map((registration) => [registration.playerId, registration]));
  const ownershipInvariantViolationCount = countOwnershipViolations(
    current,
    ownedPlayerClub,
    activeContracts,
    activeContractByPlayer,
    registrations,
    registrationByPlayer,
  );
  const contractDates = countContractDateFacts(current, activeContracts, currentDate);
  const freeAgentPlayerIds = selectFreeAgentPlayerIds(current);
  const freeAgentInvariantViolationCount = countFreeAgentViolations(
    current,
    freeAgentPlayerIds,
    ownedPlayerClub,
    activeContractByPlayer,
    registrationByPlayer,
  );
  const financeFacts = inspectFinanceTransition(previous, current);
  const negotiationFacts = inspectNegotiations(current, input.wagePolicy);
  const marketFacts = inspectTransferMarketTransition(
    previous,
    current,
    ownedPlayerClub,
    input.transferWindows,
  );
  const squadFacts = inspectSquads(current);
  const ages = [...ownedPlayerClub.keys()].flatMap((playerId) => {
    const player = current.gameState.players[playerId];
    return player === undefined ? [] : [ageOn(player.birthDate, currentDate)];
  });
  const wages = activeContracts.map((contract) => Number(contract.annualWage));
  const divisionWageEconomy = deriveDivisionWageEconomy(current, activeContracts);
  const freeAgentSigningPublicValues = deriveFreeAgentSigningPublicValues(
    current,
    input.squadMaintenance?.freeAgentSignings ?? [],
    input.valuationConfig,
  );
  const divisionMarketEconomy = deriveDivisionMarketEconomy(
    previous,
    current,
    input.squadMaintenance?.freeAgentSignings ?? [],
  );
  const crossTierTransfers = deriveCrossTierTransfers(previous, current);
  const valuations = shouldSampleValuations(input.seasonNumber)
    ? sampledPlayerValues(current, ownedPlayerClub, input.valuationConfig)
    : [];
  const historyFacts = inspectNewContractHistory(previous, current);
  const planFacts = inspectSelectedPlanContinuity(previous, current, ownedPlayerClub);
  const permanentTransferFunnel = inspectPermanentTransferFunnel(input.marketLifecycle);
  const preliminaryAgreementFunnel = inspectPreliminaryAgreementFunnel(input.marketLifecycle);
  const freeAgentFlow = inspectFreeAgentFlow({
    previous,
    current,
    currentFreeAgentPlayerIds: freeAgentPlayerIds,
    valuationConfig: input.valuationConfig,
    ...(input.marketLifecycle === undefined ? {} : { marketLifecycle: input.marketLifecycle }),
    ...(input.playerExits === undefined ? {} : { playerExits: input.playerExits }),
    ...(input.youthLifecycle === undefined ? {} : { youthLifecycle: input.youthLifecycle }),
  });

  return {
    seasonNumber: input.seasonNumber,
    currentDate,
    ownedSeniorPlayerCount: ownedPlayerClub.size,
    freeAgentCount: freeAgentPlayerIds.length,
    freeAgentShare: roundMetric(safeRatio(freeAgentPlayerIds.length, current.gameState.playerIds.length)),
    freeAgentSigningPublicValues,
    // An absent negotiation state canonically means that no negotiation has
    // ever been opened; senior ownership and finance are mandatory from day 1.
    missingStateCount: Number(senior === undefined) + Number(finance === undefined),
    seniorSquadInvariantViolationCount,
    ownershipInvariantViolationCount,
    activeContractDateViolationCount: contractDates.aiViolationCount,
    selectedClubExpiredDecisionCount: contractDates.selectedClubExpiredDecisionCount,
    freeAgentInvariantViolationCount,
    negotiationInvariantViolationCount:
      negotiationInvariantViolationCount +
      marketFacts.transferNegotiationInvariantViolationCount +
      marketFacts.preliminaryAgreementInvariantViolationCount,
    unaffordableAiOfferCount: negotiationFacts.unaffordableAiOfferCount,
    financeInvariantViolationCount,
    duplicateLedgerBusinessFactCount: financeFacts.duplicateLedgerBusinessFactCount,
    annualPayrollReconciliationViolationCount: financeFacts.annualPayrollReconciliationViolationCount,
    financeLimitViolationCount: financeFacts.financeLimitViolationCount,
    minimumCashBalance: financeFacts.minimumCashBalance,
    maximumWageBudgetUtilization: financeFacts.maximumWageBudgetUtilization,
    wageBudgetUtilizations: financeFacts.wageBudgetUtilizations,
    annualWageHeadrooms: financeFacts.annualWageHeadrooms,
    wagePressureClubCount: financeFacts.wagePressureClubCount,
    exactWageCeilingClubCount: financeFacts.exactWageCeilingClubCount,
    aboveWageBudgetClubCount: financeFacts.aboveWageBudgetClubCount,
    reallocationExactCeilingClubCount:
      input.squadMaintenance?.wageBudgetReallocationExactCeilingCount ?? 0,
    minimumSquadSize: squadFacts.minimumSquadSize,
    maximumSquadSize: squadFacts.maximumSquadSize,
    minimumGoalkeeperCount: squadFacts.minimumByDepartment.goalkeeper,
    minimumDefenderCount: squadFacts.minimumByDepartment.defender,
    minimumMidfielderCount: squadFacts.minimumByDepartment.midfielder,
    minimumAttackerCount: squadFacts.minimumByDepartment.attacker,
    minimumAge: minimumOrZero(ages),
    averageAge: roundMetric(average(ages)),
    maximumAge: maximumOrZero(ages),
    minimumAnnualWage: minimumOrZero(wages),
    averageAnnualWage: roundMetric(average(wages)),
    maximumAnnualWage: maximumOrZero(wages),
    divisionWageEconomy,
    divisionMarketEconomy,
    crossTierTransfers,
    valuationSampleCount: valuations.length,
    minimumPlayerValue: minimumOrZero(valuations),
    averagePlayerValue: roundMetric(average(valuations)),
    maximumPlayerValue: maximumOrZero(valuations),
    expiringContractCount: activeContracts.filter(
      (contract) => contract.endsOn > currentDate && contract.endsOn - currentDate <= 365,
    ).length,
    openNegotiationCount: negotiationFacts.openNegotiationCount,
    renewalCount: historyFacts.renewalCount,
    releaseCount: historyFacts.releaseCount,
    expiryCount: historyFacts.expiryCount,
    ledgerReasonAmounts: financeFacts.ledgerReasonAmounts,
    selectedPlanObservationCount: planFacts.observationCount,
    selectedPlanRetainedPlayerMissingCount: planFacts.retainedPlayerMissingCount,
    selectedPlanHiddenReplacementCount: planFacts.hiddenReplacementCount,
    completedTransferCount: marketFacts.completedTransferCount,
    transferWindowViolationCount: marketFacts.transferWindowViolationCount,
    negotiationClockViolationCount: marketFacts.negotiationClockViolationCount,
    unaffordableCompletedTransferCount: marketFacts.unaffordableCompletedTransferCount,
    preliminaryAgreementCount: marketFacts.preliminaryAgreementCount,
    preliminaryAgreementActivationCount: marketFacts.preliminaryAgreementActivationCount,
    preliminaryAgreementViolationCount: marketFacts.preliminaryAgreementViolationCount,
    permanentTransferFunnel,
    preliminaryAgreementFunnel,
    freeAgentFlow,
  };
}

/**
 * Aggregates season rows into locked structural checks and football signals.
 */
export function createLongRunContractFinanceStabilityReport(
  seasons: readonly LongRunContractFinanceSeasonRow[],
): LongRunContractFinanceStabilityReport {
  if (seasons.length === 0) {
    throw new Error("Contract and finance stability report requires at least one season row");
  }

  const structuralViolationCount = seasons.reduce((sum, season) => sum + structuralViolations(season), 0);
  const maximumWageBudgetUtilizationObserved = Math.max(...seasons.map((season) => season.maximumWageBudgetUtilization));
  const maximumFreeAgentShareObserved = Math.max(...seasons.map((season) => season.freeAgentShare));
  const sampledRows = seasons.filter((season) => season.valuationSampleCount > 0);
  const selectedClubExpiredDecisionCount = seasons.reduce(
    (sum, season) => sum + season.selectedClubExpiredDecisionCount,
    0,
  );
  const completedTransferCount = seasons.reduce((sum, season) => sum + season.completedTransferCount, 0);
  const preliminaryAgreementCount = seasons.reduce((sum, season) => sum + season.preliminaryAgreementCount, 0);
  const preliminaryAgreementActivationCount = seasons.reduce(
    (sum, season) => sum + season.preliminaryAgreementActivationCount,
    0,
  );
  const permanentTransferFunnel = sumPermanentTransferFunnels(
    seasons.map((season) => season.permanentTransferFunnel),
  );
  const preliminaryAgreementFunnel = sumPreliminaryAgreementFunnels(
    seasons.map((season) => season.preliminaryAgreementFunnel),
  );
  const wageBudgetUtilizations = seasons.flatMap((season) => season.wageBudgetUtilizations);
  const annualWageHeadrooms = seasons.flatMap((season) => season.annualWageHeadrooms);
  const wagePressureClubSeasonCount = seasons.reduce(
    (sum, season) => sum + season.wagePressureClubCount,
    0,
  );
  const exactWageCeilingClubSeasonCount = seasons.reduce(
    (sum, season) => sum + season.exactWageCeilingClubCount,
    0,
  );
  const aboveWageBudgetClubSeasonCount = seasons.reduce(
    (sum, season) => sum + season.aboveWageBudgetClubCount,
    0,
  );

  const checks: LongRunContractFinanceCheck[] = [
    contractFinanceCheck(
      "contract_finance_structural_integrity",
      structuralViolationCount,
      "pass 0; fail >0",
      structuralViolationCount > 0 ? "fail" : "pass",
      "structure",
      seasons.length,
    ),
    contractFinanceCheck(
      "transfer_market_window_integrity",
      seasons.reduce((sum, s) => sum + s.transferWindowViolationCount, 0),
      "pass 0; fail >0",
      seasons.some((s) => s.transferWindowViolationCount > 0) ? "fail" : "pass",
      "structure",
      seasons.length,
    ),
    contractFinanceCheck(
      "negotiation_clock_integrity",
      seasons.reduce((sum, s) => sum + s.negotiationClockViolationCount, 0),
      "pass 0; fail >0",
      seasons.some((s) => s.negotiationClockViolationCount > 0) ? "fail" : "pass",
      "structure",
      seasons.length,
    ),
    contractFinanceCheck(
      "preliminary_agreement_integrity",
      seasons.reduce((sum, s) => sum + s.preliminaryAgreementViolationCount, 0),
      "pass 0; fail >0",
      seasons.some((s) => s.preliminaryAgreementViolationCount > 0) ? "fail" : "pass",
      "structure",
      seasons.length,
    ),
    contractFinanceCheck(
      "wage_budget_overspend",
      aboveWageBudgetClubSeasonCount,
      "pass 0; fail >0",
      aboveWageBudgetClubSeasonCount > 0 ? "fail" : "pass",
      "structure",
      wageBudgetUtilizations.length,
    ),
    contractFinanceCheck(
      "wage_budget_pressure_prevalence",
      roundMetric(safeRatio(wagePressureClubSeasonCount, wageBudgetUtilizations.length)),
      `pass <${WAGE_PRESSURE_PREVALENCE_WARNING}; warn at or above`,
      safeRatio(wagePressureClubSeasonCount, wageBudgetUtilizations.length)
          >= WAGE_PRESSURE_PREVALENCE_WARNING
        ? "warn"
        : "pass",
      "football_story",
      wageBudgetUtilizations.length,
    ),
    contractFinanceCheck(
      "wage_budget_exact_ceiling_prevalence",
      roundMetric(safeRatio(exactWageCeilingClubSeasonCount, wageBudgetUtilizations.length)),
      `pass <${EXACT_WAGE_CEILING_PREVALENCE_WARNING}; warn at or above; overspend is separate`,
      safeRatio(exactWageCeilingClubSeasonCount, wageBudgetUtilizations.length)
          >= EXACT_WAGE_CEILING_PREVALENCE_WARNING
        ? "warn"
        : "pass",
      "football_story",
      wageBudgetUtilizations.length,
    ),
    contractFinanceCheck(
      "wage_budget_headroom_p10",
      quantile(annualWageHeadrooms, 0.1),
      "informational remaining annual-wage headroom in minor units",
      "pass",
      "football_story",
      annualWageHeadrooms.length,
    ),
    contractFinanceCheck(
      "free_agent_population_share",
      maximumFreeAgentShareObserved,
      `pass <=${FREE_AGENT_SHARE_WARNING}; warn above; integrity failures are separate`,
      maximumFreeAgentShareObserved > FREE_AGENT_SHARE_WARNING ? "warn" : "pass",
      "football_story",
      seasons.length,
    ),
    contractFinanceCheck(
      "selected_club_expiry_decisions",
      selectedClubExpiredDecisionCount,
      "monitor only: the manager, never AI, owns these decisions",
      "pass",
      "decision",
      seasons.length,
    ),
  ];

  return {
    status: worstStatus(checks),
    structuralViolationCount,
    minimumCashBalanceObserved: Math.min(...seasons.map((season) => season.minimumCashBalance)),
    maximumWageBudgetUtilizationObserved: roundMetric(maximumWageBudgetUtilizationObserved),
    maximumFreeAgentShareObserved: roundMetric(maximumFreeAgentShareObserved),
    minimumPlayerValueObserved: minimumOrZero(sampledRows.map((season) => season.minimumPlayerValue)),
    maximumPlayerValueObserved: maximumOrZero(sampledRows.map((season) => season.maximumPlayerValue)),
    renewalCount: seasons.reduce((sum, season) => sum + season.renewalCount, 0),
    releaseCount: seasons.reduce((sum, season) => sum + season.releaseCount, 0),
    expiryCount: seasons.reduce((sum, season) => sum + season.expiryCount, 0),
    selectedClubExpiredDecisionCount,
    completedTransferCount,
    preliminaryAgreementCount,
    preliminaryAgreementActivationCount,
    permanentTransferFunnel,
    preliminaryAgreementFunnel,
    wageBudgetUtilizationP50: quantile(wageBudgetUtilizations, 0.5),
    wageBudgetUtilizationP90: quantile(wageBudgetUtilizations, 0.9),
    wageBudgetUtilizationP95: quantile(wageBudgetUtilizations, 0.95),
    wageBudgetUtilizationP99: quantile(wageBudgetUtilizations, 0.99),
    wagePressureClubSeasonShare: roundMetric(safeRatio(
      wagePressureClubSeasonCount,
      wageBudgetUtilizations.length,
    )),
    exactWageCeilingClubSeasonShare: roundMetric(safeRatio(
      exactWageCeilingClubSeasonCount,
      wageBudgetUtilizations.length,
    )),
    aboveWageBudgetClubSeasonShare: roundMetric(safeRatio(
      aboveWageBudgetClubSeasonCount,
      wageBudgetUtilizations.length,
    )),
    reallocationExactCeilingClubSeasonCount: seasons.reduce(
      (sum, season) => sum + season.reallocationExactCeilingClubCount,
      0,
    ),
    annualWageHeadroomP50: quantile(annualWageHeadrooms, 0.5),
    annualWageHeadroomP10: quantile(annualWageHeadrooms, 0.1),
    maximumUsefulFreeAgentCountObserved: maximumOrZero(
      seasons.map((season) => season.freeAgentFlow.usefulClosingStock),
    ),
    freeAgentBandObservations: sumFreeAgentBands(
      seasons.map((season) => season.freeAgentFlow.bands),
    ),
    closingDivisionWageEconomy:
      seasons[seasons.length - 1]?.divisionWageEconomy ?? [],
    closingDivisionMarketEconomy:
      seasons[seasons.length - 1]?.divisionMarketEconomy ?? [],
    closingCrossTierTransfers:
      seasons[seasons.length - 1]?.crossTierTransfers ?? [],
    checks,
    seasons,
  };
}

function countOwnershipViolations(
  careerState: CareerState,
  ownedPlayerClub: ReadonlyMap<PlayerId, ClubId>,
  activeContracts: readonly PlayerContract[],
  activeContractByPlayer: ReadonlyMap<PlayerId, PlayerContract>,
  registrations: readonly SeniorSquadRegistration[],
  registrationByPlayer: ReadonlyMap<PlayerId, SeniorSquadRegistration>,
): number {
  let violations = 0;
  const shirtKeys = new Set<string>();
  const activePlayers = new Set<PlayerId>();
  const activeWorldPlayerIds = new Set(careerState.gameState.playerIds);
  const registeredPlayers = new Set<PlayerId>();

  for (const registration of registrations) {
    if (registration === undefined) continue;
    const owner = ownedPlayerClub.get(registration.playerId);
    if (owner !== registration.clubId || registeredPlayers.has(registration.playerId)) violations += 1;
    const shirtKey = `${registration.clubId}|${registration.shirtNumber}`;
    if (shirtKeys.has(shirtKey)) violations += 1;
    shirtKeys.add(shirtKey);
    registeredPlayers.add(registration.playerId);
  }
  for (const contract of activeContracts) {
    const owner = ownedPlayerClub.get(contract.playerId);
    if (owner !== contract.clubId || activePlayers.has(contract.playerId)) violations += 1;
    activePlayers.add(contract.playerId);
  }
  for (const playerId of ownedPlayerClub.keys()) {
    if (registrationByPlayer.get(playerId) === undefined) violations += 1;
    if (activeContractByPlayer.get(playerId) === undefined) violations += 1;
    if (careerState.gameState.players[playerId] === undefined) violations += 1;
    if (!activeWorldPlayerIds.has(playerId)) violations += 1;
    if (careerState.gameState.playerStates[playerId] === undefined) violations += 1;
  }
  return violations;
}

function countContractDateFacts(
  careerState: CareerState,
  contracts: readonly PlayerContract[],
  currentDate: number,
): { readonly aiViolationCount: number; readonly selectedClubExpiredDecisionCount: number } {
  let aiViolationCount = 0;
  let selectedClubExpiredDecisionCount = 0;
  for (const contract of contracts) {
    if (contract.startsOn > currentDate) {
      aiViolationCount += 1;
      continue;
    }
    if (contract.endsOn > currentDate) continue;
    if (contract.clubId === careerState.selectedClubId) selectedClubExpiredDecisionCount += 1;
    else aiViolationCount += 1;
  }
  return { aiViolationCount, selectedClubExpiredDecisionCount };
}

function countFreeAgentViolations(
  careerState: CareerState,
  freeAgentPlayerIds: readonly PlayerId[],
  ownedPlayerClub: ReadonlyMap<PlayerId, ClubId>,
  activeContractByPlayer: ReadonlyMap<PlayerId, PlayerContract>,
  registrationByPlayer: ReadonlyMap<PlayerId, unknown>,
): number {
  const academyPlayers = new Set(
    (careerState.youthAcademyState?.clubRosterIds ?? []).flatMap(
      (clubId) => careerState.youthAcademyState?.clubRosters[clubId]?.playerIds ?? [],
    ),
  );
  return freeAgentPlayerIds.filter(
    (playerId) =>
      ownedPlayerClub.has(playerId)
      || activeContractByPlayer.has(playerId)
      || registrationByPlayer.has(playerId)
      || academyPlayers.has(playerId),
  ).length;
}

function inspectFinanceTransition(previous: CareerState, current: CareerState): {
  readonly duplicateLedgerBusinessFactCount: number;
  readonly annualPayrollReconciliationViolationCount: number;
  readonly financeLimitViolationCount: number;
  readonly minimumCashBalance: number;
  readonly maximumWageBudgetUtilization: number;
  readonly wageBudgetUtilizations: readonly number[];
  readonly annualWageHeadrooms: readonly number[];
  readonly wagePressureClubCount: number;
  readonly exactWageCeilingClubCount: number;
  readonly aboveWageBudgetClubCount: number;
  readonly ledgerReasonAmounts: LongRunLedgerReasonAmounts;
} {
  const finance = current.clubFinanceState;
  if (finance === undefined) {
    return {
      duplicateLedgerBusinessFactCount: 0,
      annualPayrollReconciliationViolationCount: 0,
      financeLimitViolationCount: 0,
      minimumCashBalance: 0,
      maximumWageBudgetUtilization: 0,
      wageBudgetUtilizations: [],
      annualWageHeadrooms: [],
      wagePressureClubCount: 0,
      exactWageCeilingClubCount: 0,
      aboveWageBudgetClubCount: 0,
      ledgerReasonAmounts: emptyLedgerReasonAmounts(),
    };
  }
  const previousLedgerIds = new Set(previous.clubFinanceState?.ledgerEntryIds ?? []);
  const newEntries = finance.ledgerEntryIds.flatMap((id) => {
    if (previousLedgerIds.has(id)) return [];
    const entry = finance.ledgerEntries[id];
    return entry === undefined ? [] : [entry];
  });
  const businessFacts = new Set<string>();
  let duplicateLedgerBusinessFactCount = 0;
  for (const entry of newEntries) {
    const key = ledgerBusinessKey(entry);
    if (businessFacts.has(key)) duplicateLedgerBusinessFactCount += 1;
    businessFacts.add(key);
  }
  const accounts = finance.clubIds.flatMap((clubId) => {
    const account = finance.accounts[clubId];
    return account === undefined ? [] : [account];
  });
  const financeLimitViolationCount = accounts.filter(
    (account) =>
      account.cashBalance < 0
      || account.availableTransferBudget < 0
      || account.availableTransferBudget > account.cashBalance
      || account.committedAnnualWage > account.annualWageBudget,
  ).length;
  const wageBudgetUtilizations = accounts.map((account) =>
    roundMetric(safeRatio(account.committedAnnualWage, account.annualWageBudget))
  );
  const annualWageHeadrooms = accounts.map((account) =>
    Number(account.annualWageBudget - account.committedAnnualWage)
  );
  const maximumWageBudgetUtilization = Math.max(...wageBudgetUtilizations, 0);

  return {
    duplicateLedgerBusinessFactCount,
    annualPayrollReconciliationViolationCount: countPayrollReconciliationViolations(previous, newEntries),
    financeLimitViolationCount,
    minimumCashBalance: minimumOrZero(accounts.map((account) => Number(account.cashBalance))),
    maximumWageBudgetUtilization: roundMetric(maximumWageBudgetUtilization),
    wageBudgetUtilizations,
    annualWageHeadrooms,
    wagePressureClubCount: wageBudgetUtilizations.filter(
      (utilization) => utilization >= WAGE_UTILIZATION_WARNING,
    ).length,
    exactWageCeilingClubCount: accounts.filter(
      (account) => account.annualWageBudget > 0
        && account.committedAnnualWage === account.annualWageBudget,
    ).length,
    aboveWageBudgetClubCount: accounts.filter(
      (account) => account.committedAnnualWage > account.annualWageBudget,
    ).length,
    ledgerReasonAmounts: sumLedgerReasons(newEntries),
  };
}

function countPayrollReconciliationViolations(
  previous: CareerState,
  newEntries: readonly ClubFinanceLedgerEntry[],
): number {
  const expected = new Map<ClubId, number>();
  const occurredOn = previous.gameState.calendar.currentDate;
  for (const contract of activeContractsFor(previous.seniorSquadState)) {
    if (contract.startsOn <= occurredOn && contract.endsOn > occurredOn) {
      expected.set(contract.clubId, (expected.get(contract.clubId) ?? 0) + contract.annualWage);
    }
  }
  const actual = new Map<ClubId, number>();
  for (const entry of newEntries) {
    if (entry.reason === "annual_base_wage" && entry.direction === "debit") {
      actual.set(entry.clubId, (actual.get(entry.clubId) ?? 0) + entry.amount);
    }
  }
  const clubIds = new Set([...expected.keys(), ...actual.keys()]);
  return [...clubIds].filter((clubId) => (expected.get(clubId) ?? 0) !== (actual.get(clubId) ?? 0)).length;
}

function inspectNegotiations(
  careerState: CareerState,
  wagePolicy: PlayerWagePolicyConfig,
): {
  readonly openNegotiationCount: number;
  readonly unaffordableAiOfferCount: number;
} {
  const state = careerState.contractNegotiationState;
  if (state === undefined) return { openNegotiationCount: 0, unaffordableAiOfferCount: 0 };
  let openNegotiationCount = 0;
  let unaffordableAiOfferCount = 0;
  for (const id of state.negotiationIds) {
    const negotiation = state.negotiations[id];
    if (negotiation === undefined || !isOpenContractNegotiation(negotiation)) continue;
    openNegotiationCount += 1;
    if (negotiation.clubId === careerState.selectedClubId) continue;
    const terms = affordabilityTerms(negotiation);
    if (terms === undefined) continue;
    const result = checkContractOfferAffordability({
      careerState,
      clubId: negotiation.clubId,
      replacedContractId: negotiation.currentContractId,
      terms,
      wagePolicy,
    });
    if (result.status === "rejected") {
      if (process.env.TLS_CONTRACT_FINANCE_DIAGNOSTICS === "1") {
        console.error(JSON.stringify({
          negotiationId: negotiation.id,
          negotiationStatus: negotiation.status,
          clubId: negotiation.clubId,
          playerId: negotiation.playerId,
          currentContractId: negotiation.currentContractId,
          terms,
          rejectionReason: result.reason,
          requiredAmount: result.requiredAmount,
          availableAmount: result.availableAmount,
          account: careerState.clubFinanceState?.accounts[negotiation.clubId],
          currentContract: careerState.seniorSquadState?.contracts[negotiation.currentContractId],
          currentDate: careerState.gameState.calendar.currentDate,
        }));
      }
      unaffordableAiOfferCount += 1;
    }
  }
  return { openNegotiationCount, unaffordableAiOfferCount };
}

function affordabilityTerms(negotiation: ContractNegotiation): ContractOfferTerms | undefined {
  if (negotiation.status === "awaiting_response") return negotiation.submittedOffer.terms;
  if (negotiation.status === "countered") return negotiation.counterOffer.terms;
  return undefined;
}

function inspectSquads(careerState: CareerState): {
  readonly minimumSquadSize: number;
  readonly maximumSquadSize: number;
  readonly minimumByDepartment: Record<LongRunSquadDepartment, number>;
} {
  const sizes: number[] = [];
  const departmentRows: Record<LongRunSquadDepartment, number>[] = [];
  for (const clubId of careerState.gameState.clubIds) {
    const playerIds = careerState.gameState.clubs[clubId]?.playerIds ?? [];
    const departments: Record<LongRunSquadDepartment, number> = {
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      attacker: 0,
    };
    sizes.push(playerIds.length);
    for (const playerId of playerIds) {
      const player = careerState.gameState.players[playerId];
      if (player === undefined) continue;
      const department = playerSquadDepartment(player);
      departments[department] += 1;
    }
    departmentRows.push(departments);
  }
  return {
    minimumSquadSize: minimumOrZero(sizes),
    maximumSquadSize: maximumOrZero(sizes),
    minimumByDepartment: {
      goalkeeper: minimumOrZero(departmentRows.map((row) => row.goalkeeper)),
      defender: minimumOrZero(departmentRows.map((row) => row.defender)),
      midfielder: minimumOrZero(departmentRows.map((row) => row.midfielder)),
      attacker: minimumOrZero(departmentRows.map((row) => row.attacker)),
    },
  };
}

function deriveDivisionWageEconomy(
  careerState: CareerState,
  activeContracts: readonly PlayerContract[],
): readonly LongRunDivisionWageEconomyRow[] {
  const divisions: readonly ClubCategory[] = [
    "first_division",
    "second_division",
    "third_division",
  ];
  const finance = careerState.clubFinanceState;

  return divisions.flatMap((division) => {
    const clubIds = careerState.gameState.clubIds.filter(
      (clubId) => careerState.gameState.clubs[clubId]?.category === division,
    );
    if (clubIds.length === 0) return [];
    const clubs = new Set(clubIds);
    const contracts = activeContracts.filter((contract) => clubs.has(contract.clubId));
    const accounts = clubIds.flatMap((clubId) => {
      const account = finance?.accounts[clubId];
      return account === undefined ? [] : [account];
    });
    const wages = contracts.map((contract) => Number(contract.annualWage));
    const signingBonuses = contracts.map((contract) => Number(contract.bonuses.signingBonus));
    const appearanceBonuses = contracts.map((contract) => Number(contract.bonuses.appearanceBonus));
    const goalBonuses = contracts.map((contract) => Number(contract.bonuses.goalBonus ?? 0));
    const cleanSheetBonuses = contracts.map(
      (contract) => Number(contract.bonuses.cleanSheetBonus ?? 0),
    );
    const committedWages = accounts.map((account) => Number(account.committedAnnualWage));
    const utilizations = accounts.map((account) =>
      safeRatio(account.committedAnnualWage, account.annualWageBudget)
    );
    const headrooms = accounts.map(
      (account) => Number(account.annualWageBudget - account.committedAnnualWage),
    );

    return [{
      division,
      clubCount: accounts.length,
      playerCount: contracts.length,
      annualWageP50: quantile(wages, 0.5),
      annualWageP90: quantile(wages, 0.9),
      annualWageP99: quantile(wages, 0.99),
      signingBonusP50: quantile(signingBonuses, 0.5),
      appearanceBonusP50: quantile(appearanceBonuses, 0.5),
      goalBonusP50: quantile(goalBonuses, 0.5),
      cleanSheetBonusP50: quantile(cleanSheetBonuses, 0.5),
      committedAnnualWageP50: quantile(committedWages, 0.5),
      committedAnnualWageP90: quantile(committedWages, 0.9),
      committedAnnualWageP99: quantile(committedWages, 0.99),
      wageBudgetUtilizationP50: quantile(utilizations, 0.5),
      wageBudgetUtilizationP90: quantile(utilizations, 0.9),
      wageBudgetUtilizationP99: quantile(utilizations, 0.99),
      annualWageHeadroomP50: quantile(headrooms, 0.5),
      annualWageHeadroomP10: quantile(headrooms, 0.1),
    }];
  });
}

/** Derives tier finance and pending-exposure rows from canonical account facts. */
function deriveDivisionMarketEconomy(
  previous: CareerState,
  current: CareerState,
  replenishmentSignings: readonly {
    readonly clubId: ClubId;
    readonly playerId: PlayerId;
  }[],
): readonly LongRunDivisionMarketEconomyRow[] {
  const newNegotiationIds = new Set(
    (current.transferNegotiationState?.negotiationIds ?? []).filter(
      (id) => previous.transferNegotiationState?.negotiations[id] === undefined,
    ),
  );
  const newHistory = current.transferHistory.slice(previous.transferHistory.length);
  return divisionOrder().flatMap((division) => {
    const clubIds = current.gameState.clubIds.filter(
      (clubId) => current.gameState.clubs[clubId]?.category === division,
    );
    if (clubIds.length === 0) return [];
    const clubSet = new Set(clubIds);
    const accounts = clubIds.flatMap((clubId) => {
      const account = current.clubFinanceState?.accounts[clubId];
      return account === undefined ? [] : [account];
    });
    const exposures = clubIds.map((clubId) => pendingMarketExposure(current, clubId));
    const attempts = [...newNegotiationIds].filter((id) => {
      const negotiation = current.transferNegotiationState?.negotiations[id];
      return negotiation !== undefined && clubSet.has(negotiation.buyingClubId);
    }).length;
    const permanentCompletions = newHistory.filter(
      (entry) => entry.kind === "permanent_transfer" && clubSet.has(entry.buyingClubId),
    ).length;
    const explicitFreeAgentSignings = newHistory.filter(
      (entry) => entry.kind === "free_agent_signing" && clubSet.has(entry.buyingClubId),
    ).length;
    const replenishmentSigningCount = replenishmentSignings.filter(
      (signing) => clubSet.has(signing.clubId),
    ).length;

    return [{
      division,
      clubCount: accounts.length,
      cashBalanceP50: quantile(accounts.map((account) => Number(account.cashBalance)), 0.5),
      cashBalanceP90: quantile(accounts.map((account) => Number(account.cashBalance)), 0.9),
      cashBalanceP99: quantile(accounts.map((account) => Number(account.cashBalance)), 0.99),
      availableTransferBudgetP50: quantile(
        accounts.map((account) => Number(account.availableTransferBudget)),
        0.5,
      ),
      availableTransferBudgetP90: quantile(
        accounts.map((account) => Number(account.availableTransferBudget)),
        0.9,
      ),
      availableTransferBudgetP99: quantile(
        accounts.map((account) => Number(account.availableTransferBudget)),
        0.99,
      ),
      pendingCashExposureP50: quantile(exposures.map((row) => row.cash), 0.5),
      pendingCashExposureP90: quantile(exposures.map((row) => row.cash), 0.9),
      pendingCashExposureP99: quantile(exposures.map((row) => row.cash), 0.99),
      pendingAnnualWageExposureP50: quantile(exposures.map((row) => row.annualWage), 0.5),
      pendingAnnualWageExposureP90: quantile(exposures.map((row) => row.annualWage), 0.9),
      pendingAnnualWageExposureP99: quantile(exposures.map((row) => row.annualWage), 0.99),
      permanentAttemptCount: attempts,
      permanentCompletionCount: permanentCompletions,
      freeAgentSigningCount:
        explicitFreeAgentSignings + replenishmentSigningCount,
    }];
  });
}

/** Values canonical replenishment signings in their free-agent market context. */
function deriveFreeAgentSigningPublicValues(
  careerState: CareerState,
  signings: readonly {
    readonly clubId: ClubId;
    readonly playerId: PlayerId;
  }[],
  valuationConfig: PlayerValuationConfig,
): readonly number[] {
  return signings.flatMap(({ playerId }) => {
    const player = careerState.gameState.players[playerId];
    const primaryPosition = player?.naturalPositions[0];
    if (player === undefined || primaryPosition === undefined) return [];
    const assessment = derivePublicPlayerAssessment({
      player,
      currentDate: careerState.gameState.calendar.currentDate,
      potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
    return [derivePlayerValuation({
      assessment,
      primaryPosition,
      config: valuationConfig,
    }).value];
  });
}

/** Derives compact cross-tier transfer attempts and completed price facts. */
function deriveCrossTierTransfers(
  previous: CareerState,
  current: CareerState,
): readonly LongRunCrossTierTransferRow[] {
  interface MutableCrossTierRow {
    attempts: number;
    completions: number;
    publicValues: number[];
    askingPrices: number[];
    completedFees: number[];
    rejectionReasons: Record<string, number>;
  }
  const rows = new Map<string, MutableCrossTierRow>();
  const rowFor = (
    sourceDivision: ClubCategory,
    destinationDivision: ClubCategory,
  ): MutableCrossTierRow => {
    const key = `${sourceDivision}->${destinationDivision}`;
    const existing = rows.get(key);
    if (existing !== undefined) return existing;
    const created: MutableCrossTierRow = {
      attempts: 0,
      completions: 0,
      publicValues: [],
      askingPrices: [],
      completedFees: [],
      rejectionReasons: {},
    };
    rows.set(key, created);
    return created;
  };

  for (const id of current.transferNegotiationState?.negotiationIds ?? []) {
    if (previous.transferNegotiationState?.negotiations[id] !== undefined) continue;
    const negotiation = current.transferNegotiationState?.negotiations[id];
    if (negotiation === undefined) continue;
    const sourceDivision = clubDivision(previous, current, negotiation.sellingClubId);
    const destinationDivision = clubDivision(previous, current, negotiation.buyingClubId);
    if (sourceDivision === undefined || destinationDivision === undefined) continue;
    const row = rowFor(sourceDivision, destinationDivision);
    row.attempts += 1;
    row.publicValues.push(Number(negotiation.publicValue));
    row.askingPrices.push(Number(negotiation.initialAskingPrice));
    if ("reason" in negotiation && typeof negotiation.reason === "string") {
      row.rejectionReasons[negotiation.reason] =
        (row.rejectionReasons[negotiation.reason] ?? 0) + 1;
    }
  }

  for (const entry of current.transferHistory.slice(previous.transferHistory.length)) {
    if (entry.kind !== "permanent_transfer") continue;
    const sourceDivision = clubDivision(previous, current, entry.sellingClubId);
    const destinationDivision = clubDivision(previous, current, entry.buyingClubId);
    if (sourceDivision === undefined || destinationDivision === undefined) continue;
    const row = rowFor(sourceDivision, destinationDivision);
    row.completions += 1;
    row.completedFees.push(Number(entry.completedFee));
  }

  return [...rows.entries()]
    .map(([key, row]) => {
      const [sourceDivision, destinationDivision] = key.split("->") as [
        ClubCategory,
        ClubCategory,
      ];
      return {
        sourceDivision,
        destinationDivision,
        attemptCount: row.attempts,
        completionCount: row.completions,
        publicValueP50: quantile(row.publicValues, 0.5),
        askingPriceP50: quantile(row.askingPrices, 0.5),
        completedFeeP50: quantile(row.completedFees, 0.5),
        rejectionReasonCounts: row.rejectionReasons,
      };
    })
    .sort((left, right) =>
      divisionOrder().indexOf(left.sourceDivision)
        - divisionOrder().indexOf(right.sourceDivision)
      || divisionOrder().indexOf(left.destinationDivision)
        - divisionOrder().indexOf(right.destinationDivision)
    );
}

/** Returns all unresolved acquisition and renewal exposure for one club. */
function pendingMarketExposure(
  careerState: CareerState,
  clubId: ClubId,
): { readonly cash: number; readonly annualWage: number } {
  const renewal = deriveMarketPendingExposure(careerState, clubId);
  let cash = Number(renewal.pendingSigningExposure);
  let annualWage = Number(renewal.pendingAnnualWageExposure);

  for (const id of careerState.transferNegotiationState?.negotiationIds ?? []) {
    const negotiation = careerState.transferNegotiationState?.negotiations[id];
    if (negotiation?.buyingClubId !== clubId) continue;
    if (negotiation.status === "submitted") cash += Number(negotiation.offeredFee);
    if (negotiation.status === "countered") cash += Number(negotiation.counterFee);
    if (negotiation.status === "accepted") cash += Number(negotiation.agreedFee);
    if (negotiation.status === "player_offer_submitted") {
      cash += Number(negotiation.agreedFee) + Number(negotiation.offeredTerms.bonuses.signingBonus);
      annualWage += Number(negotiation.offeredTerms.annualWage);
    }
    if (negotiation.status === "player_countered") {
      cash += Number(negotiation.agreedFee) + Number(negotiation.counterTerms.bonuses.signingBonus);
      annualWage += Number(negotiation.counterTerms.annualWage);
    }
  }
  for (const id of careerState.preliminaryAgreementState?.agreementIds ?? []) {
    const agreement = careerState.preliminaryAgreementState?.agreements[id];
    if (agreement?.offeringClubId !== clubId) continue;
    if (agreement.status === "offer_submitted") {
      cash += Number(agreement.offeredTerms.bonuses.signingBonus);
      annualWage += Number(agreement.offeredTerms.annualWage);
    }
    if (agreement.status === "countered") {
      cash += Number(agreement.counterTerms.bonuses.signingBonus);
      annualWage += Number(agreement.counterTerms.annualWage);
    }
    if (agreement.status === "agreed") {
      cash += Number(agreement.agreedTerms.bonuses.signingBonus);
      annualWage += Number(agreement.agreedTerms.annualWage);
    }
  }
  return { cash, annualWage };
}

function clubDivision(
  previous: CareerState,
  current: CareerState,
  clubId: ClubId,
): ClubCategory | undefined {
  return previous.gameState.clubs[clubId]?.category
    ?? current.gameState.clubs[clubId]?.category;
}

function divisionOrder(): readonly ClubCategory[] {
  return ["first_division", "second_division", "third_division"];
}

function sampledPlayerValues(
  careerState: CareerState,
  ownedPlayerClub: ReadonlyMap<PlayerId, ClubId>,
  valuationConfig: PlayerValuationConfig,
): readonly number[] {
  const values: number[] = [];
  for (const [playerId, clubId] of ownedPlayerClub) {
    const player = careerState.gameState.players[playerId];
    const club = careerState.gameState.clubs[clubId];
    const primaryPosition = player?.naturalPositions[0];
    if (player === undefined || club === undefined || primaryPosition === undefined) continue;
    const assessment = derivePublicPlayerAssessment({
      player,
      currentDate: careerState.gameState.calendar.currentDate,
      potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
    values.push(
      derivePlayerValuation({
        assessment,
        primaryPosition,
        config: valuationConfig,
      }).value,
    );
  }
  return values;
}

function inspectNewContractHistory(previous: CareerState, current: CareerState): {
  readonly renewalCount: number;
  readonly releaseCount: number;
  readonly expiryCount: number;
} {
  const previousIds = new Set(previous.seniorSquadState?.contractHistoryEntryIds ?? []);
  let renewalCount = 0;
  let releaseCount = 0;
  let expiryCount = 0;
  for (const id of current.seniorSquadState?.contractHistoryEntryIds ?? []) {
    if (previousIds.has(id)) continue;
    const entry = current.seniorSquadState?.contractHistory[id];
    if (entry?.event === "renewed") renewalCount += 1;
    if (entry?.event === "released") releaseCount += 1;
    if (entry?.event === "expired") expiryCount += 1;
  }
  return { renewalCount, releaseCount, expiryCount };
}

function inspectSelectedPlanContinuity(
  previous: CareerState,
  current: CareerState,
  ownedPlayerClub: ReadonlyMap<PlayerId, ClubId>,
): { readonly observationCount: number; readonly retainedPlayerMissingCount: number; readonly hiddenReplacementCount: number } {
  const previousIds = preparationPlayerIds(previous);
  if (previousIds.size === 0) return { observationCount: 0, retainedPlayerMissingCount: 0, hiddenReplacementCount: 0 };
  const currentIds = preparationPlayerIds(current);
  let retainedPlayerMissingCount = 0;
  let hiddenReplacementCount = 0;
  for (const playerId of previousIds) {
    if (ownedPlayerClub.get(playerId) === current.selectedClubId && !currentIds.has(playerId)) {
      retainedPlayerMissingCount += 1;
    }
  }
  for (const playerId of currentIds) {
    if (!previousIds.has(playerId)) hiddenReplacementCount += 1;
  }
  return { observationCount: 1, retainedPlayerMissingCount, hiddenReplacementCount };
}

function preparationPlayerIds(careerState: CareerState): Set<PlayerId> {
  return new Set([
    ...(careerState.matchPreparation?.selectedLineup?.slots.map((slot) => slot.playerId) ?? []),
    ...(careerState.matchPreparation?.benchSlots?.map((slot) => slot.playerId) ?? []),
  ]);
}

function inspectTransferMarketTransition(
  previous: CareerState,
  current: CareerState,
  ownedPlayerClub: ReadonlyMap<PlayerId, ClubId>,
  transferWindows: SeasonTransferWindows,
): {
  readonly transferNegotiationInvariantViolationCount: number;
  readonly completedTransferCount: number;
  readonly transferWindowViolationCount: number;
  readonly negotiationClockViolationCount: number;
  readonly unaffordableCompletedTransferCount: number;
  readonly preliminaryAgreementInvariantViolationCount: number;
  readonly preliminaryAgreementCount: number;
  readonly preliminaryAgreementActivationCount: number;
  readonly preliminaryAgreementViolationCount: number;
} {
  const senior = current.seniorSquadState;
  const transferNegotiations = current.transferNegotiationState;
  let transferNegotiationInvariantViolationCount = 0;
  let completedTransferCount = 0;
  let transferWindowViolationCount = 0;
  let negotiationClockViolationCount = 0;
  let unaffordableCompletedTransferCount = 0;

  if (transferNegotiations !== undefined) {
    try {
      createTransferNegotiationState(transferNegotiations);
    } catch {
      transferNegotiationInvariantViolationCount += 1;
    }

    const prevDate = previous.gameState.calendar.currentDate;
    const currentDate = current.gameState.calendar.currentDate;
    for (const id of transferNegotiations.negotiationIds) {
      const negotiation = transferNegotiations.negotiations[id];
      if (negotiation === undefined) continue;

      if ("clock" in negotiation && negotiation.clock !== undefined) {
        if (negotiation.clock.deadline - negotiation.clock.submittedOn > NEGOTIATION_STAGE_MAX_DAYS) {
          negotiationClockViolationCount += 1;
        }
        if (
          currentDate > negotiation.clock.deadline &&
          (negotiation.status === "submitted" ||
            negotiation.status === "countered" ||
            negotiation.status === "player_offer_submitted" ||
            negotiation.status === "player_countered")
        ) {
          negotiationClockViolationCount += 1;
        }
      }

      if (negotiation.status === "completed" && negotiation.completedOn > prevDate) {
        completedTransferCount += 1;
        if (resolveTransferWindowStatus(transferWindows, negotiation.completedOn).state !== "open") {
          transferWindowViolationCount += 1;
        }
        const buyerAccount = current.clubFinanceState?.accounts[negotiation.buyingClubId];
        if (
          buyerAccount !== undefined &&
          (buyerAccount.cashBalance < 0 || buyerAccount.availableTransferBudget < 0)
        ) {
          unaffordableCompletedTransferCount += 1;
        }
      }
    }
  }

  const preliminaryAgreements = current.preliminaryAgreementState;
  let preliminaryAgreementInvariantViolationCount = 0;
  let preliminaryAgreementCount = 0;
  let preliminaryAgreementActivationCount = 0;
  let preliminaryAgreementViolationCount = 0;

  if (preliminaryAgreements !== undefined && senior !== undefined) {
    try {
      createPreliminaryAgreementState(current.gameState, senior, preliminaryAgreements);
    } catch {
      preliminaryAgreementInvariantViolationCount += 1;
    }

    const prevDate = previous.gameState.calendar.currentDate;
    const currentDate = current.gameState.calendar.currentDate;
    for (const id of preliminaryAgreements.agreementIds) {
      const agreement = preliminaryAgreements.agreements[id];
      if (agreement === undefined) continue;

      if (isLivePreliminaryAgreement(agreement)) {
        preliminaryAgreementCount += 1;
      }
      if (agreement.status === "activated" && agreement.activatedOn > prevDate) {
        preliminaryAgreementActivationCount += 1;
      }

      if (agreement.status === "agreed" || agreement.status === "activated") {
        if ("agreedTerms" in agreement && agreement.agreedTerms !== undefined) {
          if (agreement.agreedTerms.annualWage < 0) {
            preliminaryAgreementViolationCount += 1;
          }
        }
        if (currentDate < agreement.futureStartsOn) {
          const owner = ownedPlayerClub.get(agreement.playerId);
          if (owner !== undefined && owner !== agreement.currentClubId) {
            preliminaryAgreementViolationCount += 1;
          }
        }
      }
    }
  }

  return {
    transferNegotiationInvariantViolationCount,
    completedTransferCount,
    transferWindowViolationCount,
    negotiationClockViolationCount,
    unaffordableCompletedTransferCount,
    preliminaryAgreementInvariantViolationCount,
    preliminaryAgreementCount,
    preliminaryAgreementActivationCount,
    preliminaryAgreementViolationCount,
  };
}

function inspectPermanentTransferFunnel(
  marketLifecycle: CareerSeasonMarketLifecycleFact | undefined,
): LongRunPermanentTransferFunnel {
  const diagnostics = marketLifecycle?.diagnostics ?? [];
  const facts = marketLifecycle?.facts ?? [];
  const lostDiagnostics = diagnostics.filter(
    (fact) => fact.event === "permanent_target_unavailable" && fact.reason !== undefined,
  );
  const affordabilityLosses = facts.filter(
    (fact) => fact.reason === "counter_exceeds_capacity" || fact.reason === "terms_exceed_capacity",
  );
  return {
    needsEvaluatedCount: diagnosticCount(diagnostics, "need_evaluated"),
    recruitableNeedCount: diagnosticCount(diagnostics, "need_recruitable"),
    targetFoundCount: diagnosticCount(diagnostics, "permanent_target_found"),
    targetUnavailableCount: diagnosticCount(diagnostics, "permanent_target_unavailable"),
    offerSubmittedCount: facts.filter((fact) => fact.event === "club_offer_submitted").length,
    sellerRejectedCount: facts.filter((fact) => fact.event === "club_offer_rejected").length,
    sellerCounteredCount: facts.filter((fact) => fact.event === "club_offer_countered").length,
    sellerAcceptedCount: facts.filter((fact) => fact.event === "club_offer_accepted").length,
    sellerExpiredCount: facts.filter((fact) => fact.event === "club_offer_expired").length,
    sellerWithdrawnCount: facts.filter((fact) => fact.event === "club_offer_withdrawn").length,
    playerTermsStartedCount: facts.filter((fact) => fact.event === "player_terms_submitted").length,
    playerCounteredCount: facts.filter((fact) => fact.event === "player_terms_countered").length,
    playerRejectedCount: facts.filter((fact) =>
      fact.event === "player_terms_rejected" || fact.event === "player_counter_rejected"
    ).length,
    playerCounterAcceptedCount: facts.filter(
      (fact) => fact.event === "player_counter_accepted",
    ).length,
    unaffordableCompletionCount: affordabilityLosses.length,
    completedCount: facts.filter((fact) => fact.event === "transfer_completed").length,
    lostReasonCounts: mergeReasonCounts([
      countDiagnosticReasons(lostDiagnostics),
      countReasons(
        affordabilityLosses.flatMap((fact) => fact.reason === undefined ? [] : [fact.reason]),
      ),
    ]),
    lostByClubDepartment: marketLossSlices(lostDiagnostics),
    clubActivity: marketClubActivity(diagnostics, facts),
  };
}

function inspectPreliminaryAgreementFunnel(
  marketLifecycle: CareerSeasonMarketLifecycleFact | undefined,
): LongRunPreliminaryAgreementFunnel {
  const diagnostics = marketLifecycle?.diagnostics ?? [];
  const facts = marketLifecycle?.facts ?? [];
  const contractFacts = marketLifecycle?.preliminaryAgreementFacts ?? [];
  const lostDiagnostics = diagnostics.filter(
    (fact) => fact.event === "preliminary_candidate_unavailable" && fact.reason !== undefined,
  );
  const terminalFailures = facts.filter((fact) =>
    fact.event === "preliminary_offer_rejected"
    || fact.event === "preliminary_counter_rejected"
    || fact.event === "preliminary_expired"
    || fact.event === "preliminary_activation_cancelled"
  );
  const contractTerminalFailures = contractFacts.filter((fact) =>
    fact.event === "offer_rejected"
    || fact.event === "expired"
    || fact.event === "activation_cancelled"
  );
  return {
    candidateFoundCount: diagnosticCount(diagnostics, "preliminary_candidate_found"),
    candidateUnavailableCount: diagnosticCount(
      diagnostics,
      "preliminary_candidate_unavailable",
    ),
    offerSubmittedCount: facts.filter((fact) => fact.event === "preliminary_offer_submitted").length,
    offerRejectedCount:
      facts.filter((fact) => fact.event === "preliminary_offer_rejected").length
      + contractFacts.filter((fact) => fact.event === "offer_rejected").length,
    counteredCount:
      facts.filter((fact) => fact.event === "preliminary_offer_countered").length
      + contractFacts.filter((fact) => fact.event === "countered").length,
    counterAcceptedCount: facts.filter(
      (fact) => fact.event === "preliminary_counter_accepted",
    ).length,
    counterRejectedCount: facts.filter(
      (fact) => fact.event === "preliminary_counter_rejected",
    ).length,
    agreementCreatedCount:
      facts.filter((fact) => fact.event === "preliminary_agreed").length
      + contractFacts.filter((fact) => fact.event === "agreed").length,
    expiredCount:
      facts.filter((fact) => fact.event === "preliminary_expired").length
      + contractFacts.filter((fact) => fact.event === "expired").length,
    activationCount:
      facts.filter((fact) => fact.event === "preliminary_activated").length
      + contractFacts.filter((fact) => fact.event === "activated").length,
    activationFailureCount:
      facts.filter((fact) => fact.event === "preliminary_activation_cancelled").length
      + contractFacts.filter((fact) => fact.event === "activation_cancelled").length,
    lostReasonCounts: mergeReasonCounts([
      countDiagnosticReasons(lostDiagnostics),
      countReasons([
        ...terminalFailures.flatMap((fact) => fact.reason === undefined ? [] : [fact.reason]),
        ...contractTerminalFailures.flatMap(
          (fact) => fact.reason === undefined ? [] : [fact.reason],
        ),
      ]),
    ]),
  };
}

function inspectFreeAgentFlow(input: {
  readonly previous: CareerState;
  readonly current: CareerState;
  readonly currentFreeAgentPlayerIds: readonly PlayerId[];
  readonly valuationConfig: PlayerValuationConfig;
  readonly marketLifecycle?: CareerSeasonMarketLifecycleFact;
  readonly playerExits?: CareerPlayerExitFact;
  readonly youthLifecycle?: CareerYouthLifecycleFact;
}): LongRunFreeAgentFlow {
  const previousFreeAgents = new Set(selectFreeAgentPlayerIds(input.previous));
  const currentFreeAgents = new Set(input.currentFreeAgentPlayerIds);
  const inflowPlayerIds = [...currentFreeAgents].filter((playerId) => !previousFreeAgents.has(playerId));
  const outflowPlayerIds = [...previousFreeAgents].filter((playerId) => !currentFreeAgents.has(playerId));
  const newHistoryByPlayer = new Map<PlayerId, "expired" | "released" | "other">();
  const previousHistoryIds = new Set(input.previous.seniorSquadState?.contractHistoryEntryIds ?? []);
  for (const historyId of input.current.seniorSquadState?.contractHistoryEntryIds ?? []) {
    if (previousHistoryIds.has(historyId)) continue;
    const entry = input.current.seniorSquadState?.contractHistory[historyId];
    if (entry === undefined) continue;
    newHistoryByPlayer.set(
      entry.playerId,
      entry.event === "expired" || entry.event === "released" ? entry.event : "other",
    );
  }
  const preliminaryActivations = new Set(
    [
      ...(input.marketLifecycle?.facts ?? []).flatMap(
        (fact) => fact.event === "preliminary_activated" ? [fact.playerId] : [],
      ),
      ...(input.marketLifecycle?.preliminaryAgreementFacts ?? []).flatMap(
        (fact) => fact.event === "activated" ? [fact.playerId] : [],
      ),
    ],
  );
  const retirementIds = new Set(input.playerExits?.playerIdsByReason.retirement ?? []);
  const releaseIds = new Set(input.playerExits?.playerIdsByReason.released ?? []);
  const youthExternalMoveIds = new Set(
    input.youthLifecycle?.playerIdsByOutcome.external_move_candidate ?? [],
  );
  const youthReleaseIds = new Set(input.youthLifecycle?.playerIdsByOutcome.released ?? []);
  const careerStepDownIds = new Set(input.playerExits?.playerIdsByReason.career_step_down ?? []);
  const expiryIds = new Set(
    (input.marketLifecycle?.contractLifecycleFacts ?? []).flatMap(
      (fact) => fact.event === "free_agent_created" ? [fact.playerId] : [],
    ),
  );
  let ordinarySigningOutflow = 0;
  let preliminaryActivationOutflow = 0;
  let retirementOutflow = 0;
  let careerStepDownOutflow = 0;
  let otherOutflow = 0;
  const currentOwners = ownedPlayerClubs(input.current);
  for (const playerId of outflowPlayerIds) {
    if (preliminaryActivations.has(playerId)) preliminaryActivationOutflow += 1;
    else if (currentOwners.has(playerId)) ordinarySigningOutflow += 1;
    else if (retirementIds.has(playerId)) retirementOutflow += 1;
    else if (careerStepDownIds.has(playerId)) careerStepDownOutflow += 1;
    else otherOutflow += 1;
  }
  const expiryInflow = inflowPlayerIds.filter(
    (playerId) => expiryIds.has(playerId) || newHistoryByPlayer.get(playerId) === "expired",
  ).length;
  const releaseInflow = inflowPlayerIds.filter(
    (playerId) => releaseIds.has(playerId) || newHistoryByPlayer.get(playerId) === "released",
  ).length;
  const youthExternalMoveInflow = inflowPlayerIds.filter(
    (playerId) => youthExternalMoveIds.has(playerId),
  ).length;
  const youthReleaseInflow = inflowPlayerIds.filter(
    (playerId) => youthReleaseIds.has(playerId),
  ).length;
  const otherInflow =
    inflowPlayerIds.length
    - expiryInflow
    - releaseInflow
    - youthExternalMoveInflow
    - youthReleaseInflow;
  const bands = freeAgentBands(
    input.current,
    input.currentFreeAgentPlayerIds,
    input.valuationConfig,
  );
  const usefulClosingStock = input.currentFreeAgentPlayerIds.filter((playerId) => {
    const player = input.current.gameState.players[playerId];
    if (player === undefined) return false;
    const assessment = derivePublicPlayerAssessment({
      player,
      currentDate: input.current.gameState.calendar.currentDate,
      potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    return assessment.age >= 23
      && assessment.age <= 29
      && assessment.currentAbility >= 10;
  }).length;
  const expectedClosingStock =
    previousFreeAgents.size
    + expiryInflow
    + releaseInflow
    + youthExternalMoveInflow
    + youthReleaseInflow
    + otherInflow
    - ordinarySigningOutflow
    - preliminaryActivationOutflow
    - retirementOutflow
    - careerStepDownOutflow
    - otherOutflow;

  return {
    openingStock: previousFreeAgents.size,
    expiryInflow,
    releaseInflow,
    youthExternalMoveInflow,
    youthReleaseInflow,
    otherInflow,
    ordinarySigningOutflow,
    preliminaryActivationOutflow,
    retirementOutflow,
    careerStepDownOutflow,
    otherOutflow,
    closingStock: currentFreeAgents.size,
    reconciliationDelta: currentFreeAgents.size - expectedClosingStock,
    usefulClosingStock,
    bands,
  };
}

function freeAgentBands(
  careerState: CareerState,
  playerIds: readonly PlayerId[],
  valuationConfig: PlayerValuationConfig,
): LongRunFreeAgentBands {
  const age: Record<keyof LongRunFreeAgentBands["age"], number> = {
    under_23: 0,
    prime_23_29: 0,
    age_30_34: 0,
    age_35_plus: 0,
  };
  const currentAbility: Record<keyof LongRunFreeAgentBands["currentAbility"], number> = {
    under_8: 0,
    ability_8_9: 0,
    ability_10_11: 0,
    ability_12_plus: 0,
  };
  const unattached: Record<keyof LongRunFreeAgentBands["unattached"], number> = {
    under_1_season: 0,
    one_to_two_seasons: 0,
    three_plus_seasons: 0,
  };
  for (const playerId of playerIds) {
    const player = careerState.gameState.players[playerId];
    if (player === undefined) continue;
    const assessment = derivePublicPlayerAssessment({
      player,
      currentDate: careerState.gameState.calendar.currentDate,
      potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
    const playerAge = assessment.age;
    if (playerAge < 23) age.under_23 += 1;
    else if (playerAge < 30) age.prime_23_29 += 1;
    else if (playerAge < 35) age.age_30_34 += 1;
    else age.age_35_plus += 1;

    const ability = assessment.currentAbility;
    if (ability < 8) currentAbility.under_8 += 1;
    else if (ability < 10) currentAbility.ability_8_9 += 1;
    else if (ability < 12) currentAbility.ability_10_11 += 1;
    else currentAbility.ability_12_plus += 1;

    const latestDeparture = latestFreeAgentDepartureDate(careerState, playerId);
    const seasonsUnattached = latestDeparture === undefined
      ? 0
      : Math.max(0, (careerState.gameState.calendar.currentDate - latestDeparture) / 365);
    if (seasonsUnattached < 1) unattached.under_1_season += 1;
    else if (seasonsUnattached < 3) unattached.one_to_two_seasons += 1;
    else unattached.three_plus_seasons += 1;
  }
  return { age, currentAbility, unattached };
}

function latestFreeAgentDepartureDate(
  careerState: CareerState,
  playerId: PlayerId,
): number | undefined {
  let latest: number | undefined;
  for (const historyId of careerState.seniorSquadState?.contractHistoryEntryIds ?? []) {
    const entry = careerState.seniorSquadState?.contractHistory[historyId];
    if (
      entry?.playerId !== playerId
      || (entry.event !== "expired" && entry.event !== "released")
    ) continue;
    latest = latest === undefined ? entry.occurredOn : Math.max(latest, entry.occurredOn);
  }
  const youthLifecycle = careerState.youthAcademyState?.playerLifecycle[playerId];
  if (
    youthLifecycle?.statusChangedAt !== undefined
    && (
      youthLifecycle.status === "released"
      || youthLifecycle.status === "external_move_candidate"
    )
  ) {
    latest = latest === undefined
      ? youthLifecycle.statusChangedAt
      : Math.max(latest, youthLifecycle.statusChangedAt);
  }
  return latest;
}

function sumPermanentTransferFunnels(
  funnels: readonly LongRunPermanentTransferFunnel[],
): LongRunPermanentTransferFunnel {
  return {
    needsEvaluatedCount: sumField(funnels, "needsEvaluatedCount"),
    recruitableNeedCount: sumField(funnels, "recruitableNeedCount"),
    targetFoundCount: sumField(funnels, "targetFoundCount"),
    targetUnavailableCount: sumField(funnels, "targetUnavailableCount"),
    offerSubmittedCount: sumField(funnels, "offerSubmittedCount"),
    sellerRejectedCount: sumField(funnels, "sellerRejectedCount"),
    sellerCounteredCount: sumField(funnels, "sellerCounteredCount"),
    sellerAcceptedCount: sumField(funnels, "sellerAcceptedCount"),
    sellerExpiredCount: sumField(funnels, "sellerExpiredCount"),
    sellerWithdrawnCount: sumField(funnels, "sellerWithdrawnCount"),
    playerTermsStartedCount: sumField(funnels, "playerTermsStartedCount"),
    playerCounteredCount: sumField(funnels, "playerCounteredCount"),
    playerRejectedCount: sumField(funnels, "playerRejectedCount"),
    playerCounterAcceptedCount: sumField(funnels, "playerCounterAcceptedCount"),
    unaffordableCompletionCount: sumField(funnels, "unaffordableCompletionCount"),
    completedCount: sumField(funnels, "completedCount"),
    lostReasonCounts: mergeReasonCounts(funnels.map((funnel) => funnel.lostReasonCounts)),
    lostByClubDepartment: mergeMarketLossSlices(
      funnels.flatMap((funnel) => funnel.lostByClubDepartment),
    ),
    clubActivity: mergeMarketClubActivity(
      funnels.flatMap((funnel) => funnel.clubActivity),
    ),
  };
}

function sumPreliminaryAgreementFunnels(
  funnels: readonly LongRunPreliminaryAgreementFunnel[],
): LongRunPreliminaryAgreementFunnel {
  return {
    candidateFoundCount: sumField(funnels, "candidateFoundCount"),
    candidateUnavailableCount: sumField(funnels, "candidateUnavailableCount"),
    offerSubmittedCount: sumField(funnels, "offerSubmittedCount"),
    offerRejectedCount: sumField(funnels, "offerRejectedCount"),
    counteredCount: sumField(funnels, "counteredCount"),
    counterAcceptedCount: sumField(funnels, "counterAcceptedCount"),
    counterRejectedCount: sumField(funnels, "counterRejectedCount"),
    agreementCreatedCount: sumField(funnels, "agreementCreatedCount"),
    expiredCount: sumField(funnels, "expiredCount"),
    activationCount: sumField(funnels, "activationCount"),
    activationFailureCount: sumField(funnels, "activationFailureCount"),
    lostReasonCounts: mergeReasonCounts(funnels.map((funnel) => funnel.lostReasonCounts)),
  };
}

function sumFreeAgentBands(rows: readonly LongRunFreeAgentBands[]): LongRunFreeAgentBands {
  return {
    age: {
      under_23: rows.reduce((sum, row) => sum + row.age.under_23, 0),
      prime_23_29: rows.reduce((sum, row) => sum + row.age.prime_23_29, 0),
      age_30_34: rows.reduce((sum, row) => sum + row.age.age_30_34, 0),
      age_35_plus: rows.reduce((sum, row) => sum + row.age.age_35_plus, 0),
    },
    currentAbility: {
      under_8: rows.reduce((sum, row) => sum + row.currentAbility.under_8, 0),
      ability_8_9: rows.reduce((sum, row) => sum + row.currentAbility.ability_8_9, 0),
      ability_10_11: rows.reduce((sum, row) => sum + row.currentAbility.ability_10_11, 0),
      ability_12_plus: rows.reduce((sum, row) => sum + row.currentAbility.ability_12_plus, 0),
    },
    unattached: {
      under_1_season: rows.reduce((sum, row) => sum + row.unattached.under_1_season, 0),
      one_to_two_seasons: rows.reduce((sum, row) => sum + row.unattached.one_to_two_seasons, 0),
      three_plus_seasons: rows.reduce((sum, row) => sum + row.unattached.three_plus_seasons, 0),
    },
  };
}

function sumField<T extends object, K extends keyof T>(
  rows: readonly T[],
  key: K,
): number {
  return rows.reduce((sum, row) => sum + Number(row[key]), 0);
}

function diagnosticCount(
  diagnostics: CareerSeasonMarketLifecycleFact["diagnostics"],
  event: CareerSeasonMarketLifecycleFact["diagnostics"][number]["event"],
): number {
  return diagnostics.reduce(
    (sum, fact) => sum + (fact.event === event ? fact.count : 0),
    0,
  );
}

function marketLossSlices(
  diagnostics: CareerSeasonMarketLifecycleFact["diagnostics"],
): readonly LongRunMarketLossSlice[] {
  const counts = new Map<string, LongRunMarketLossSlice>();
  for (const fact of diagnostics) {
    if (fact.event !== "permanent_target_unavailable" || fact.reason === undefined) continue;
    const transferWindowOpen = fact.transferWindowOpen === true;
    const department = aiMarketTargetDepartment(fact.target);
    const key = `${fact.clubId}|${department}|${fact.reason}|${transferWindowOpen}`;
    const previous = counts.get(key);
    counts.set(key, {
      clubId: String(fact.clubId),
      department,
      reason: fact.reason,
      transferWindowOpen,
      count: (previous?.count ?? 0) + fact.count,
    });
  }
  return [...counts.values()].sort(compareMarketLossSlice);
}

function marketClubActivity(
  diagnostics: CareerSeasonMarketLifecycleFact["diagnostics"],
  facts: CareerSeasonMarketLifecycleFact["facts"],
): readonly LongRunMarketClubActivity[] {
  const clubIds = new Set([
    ...diagnostics.map((fact) => String(fact.clubId)),
    ...facts.map((fact) => String(fact.buyingClubId)),
  ]);
  return [...clubIds].sort().map((clubId) => ({
    clubId,
    needsEvaluatedCount: diagnostics.reduce(
      (sum, fact) =>
        sum + (String(fact.clubId) === clubId && fact.event === "need_evaluated" ? fact.count : 0),
      0,
    ),
    recruitableNeedCount: diagnostics.reduce(
      (sum, fact) =>
        sum + (String(fact.clubId) === clubId && fact.event === "need_recruitable" ? fact.count : 0),
      0,
    ),
    permanentTargetFoundCount: diagnostics.reduce(
      (sum, fact) =>
        sum + (String(fact.clubId) === clubId && fact.event === "permanent_target_found" ? fact.count : 0),
      0,
    ),
    permanentOfferSubmittedCount: facts.filter(
      (fact) => String(fact.buyingClubId) === clubId && fact.event === "club_offer_submitted",
    ).length,
    permanentCompletedCount: facts.filter(
      (fact) => String(fact.buyingClubId) === clubId && fact.event === "transfer_completed",
    ).length,
    preliminaryOfferSubmittedCount: facts.filter(
      (fact) =>
        String(fact.buyingClubId) === clubId && fact.event === "preliminary_offer_submitted",
    ).length,
  }));
}

function mergeMarketLossSlices(
  rows: readonly LongRunMarketLossSlice[],
): readonly LongRunMarketLossSlice[] {
  const totals = new Map<string, LongRunMarketLossSlice>();
  for (const row of rows) {
    const key = `${row.clubId}|${row.department}|${row.reason}|${row.transferWindowOpen}`;
    const previous = totals.get(key);
    totals.set(key, { ...row, count: (previous?.count ?? 0) + row.count });
  }
  return [...totals.values()].sort(compareMarketLossSlice);
}

function compareMarketLossSlice(
  left: LongRunMarketLossSlice,
  right: LongRunMarketLossSlice,
): number {
  return left.clubId.localeCompare(right.clubId)
    || left.department.localeCompare(right.department)
    || left.reason.localeCompare(right.reason)
    || Number(right.transferWindowOpen) - Number(left.transferWindowOpen);
}

function mergeMarketClubActivity(
  rows: readonly LongRunMarketClubActivity[],
): readonly LongRunMarketClubActivity[] {
  const totals = new Map<string, LongRunMarketClubActivity>();
  for (const row of rows) {
    const previous = totals.get(row.clubId);
    totals.set(row.clubId, {
      clubId: row.clubId,
      needsEvaluatedCount: (previous?.needsEvaluatedCount ?? 0) + row.needsEvaluatedCount,
      recruitableNeedCount: (previous?.recruitableNeedCount ?? 0) + row.recruitableNeedCount,
      permanentTargetFoundCount:
        (previous?.permanentTargetFoundCount ?? 0) + row.permanentTargetFoundCount,
      permanentOfferSubmittedCount:
        (previous?.permanentOfferSubmittedCount ?? 0) + row.permanentOfferSubmittedCount,
      permanentCompletedCount:
        (previous?.permanentCompletedCount ?? 0) + row.permanentCompletedCount,
      preliminaryOfferSubmittedCount:
        (previous?.preliminaryOfferSubmittedCount ?? 0) + row.preliminaryOfferSubmittedCount,
    });
  }
  return [...totals.values()].sort((left, right) => left.clubId.localeCompare(right.clubId));
}

function countDiagnosticReasons(
  diagnostics: CareerSeasonMarketLifecycleFact["diagnostics"],
): Readonly<Record<string, number>> {
  const counts = new Map<string, number>();
  for (const fact of diagnostics) {
    if (fact.reason === undefined) continue;
    counts.set(fact.reason, (counts.get(fact.reason) ?? 0) + fact.count);
  }
  return Object.fromEntries([...counts].sort(([left], [right]) => left.localeCompare(right)));
}

function countReasons(reasons: readonly string[]): Readonly<Record<string, number>> {
  const counts = new Map<string, number>();
  for (const reason of reasons) counts.set(reason, (counts.get(reason) ?? 0) + 1);
  return Object.fromEntries([...counts].sort(([left], [right]) => left.localeCompare(right)));
}

function mergeReasonCounts(
  rows: readonly Readonly<Record<string, number>>[],
): Readonly<Record<string, number>> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const [reason, count] of Object.entries(row)) {
      counts.set(reason, (counts.get(reason) ?? 0) + count);
    }
  }
  return Object.fromEntries([...counts].sort(([left], [right]) => left.localeCompare(right)));
}

function structuralViolations(season: LongRunContractFinanceSeasonRow): number {
  const missingDepartmentCount =
    Number(season.minimumGoalkeeperCount < 1)
    + Number(season.minimumDefenderCount < 1)
    + Number(season.minimumMidfielderCount < 1)
    + Number(season.minimumAttackerCount < 1);
  return season.missingStateCount
    + season.seniorSquadInvariantViolationCount
    + season.ownershipInvariantViolationCount
    + season.activeContractDateViolationCount
    + season.freeAgentInvariantViolationCount
    + season.negotiationInvariantViolationCount
    + season.financeInvariantViolationCount
    + season.duplicateLedgerBusinessFactCount
    + season.annualPayrollReconciliationViolationCount
    + season.financeLimitViolationCount
    + season.selectedPlanRetainedPlayerMissingCount
    + season.selectedPlanHiddenReplacementCount
    + season.transferWindowViolationCount
    + season.negotiationClockViolationCount
    + season.unaffordableCompletedTransferCount
    + season.preliminaryAgreementViolationCount
    + Number(season.minimumSquadSize < MINIMUM_STRUCTURAL_SQUAD_SIZE)
    + missingDepartmentCount;
}

function activeContractsFor(state: CareerState["seniorSquadState"]): readonly PlayerContract[] {
  return state?.activeContractIds.flatMap((id) => {
    const contract = state.contracts[id];
    return contract === undefined ? [] : [contract];
  }) ?? [];
}

function ownedPlayerClubs(careerState: CareerState): ReadonlyMap<PlayerId, ClubId> {
  const result = new Map<PlayerId, ClubId>();
  for (const clubId of careerState.gameState.clubIds) {
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) result.set(playerId, clubId);
  }
  return result;
}

function ledgerBusinessKey(entry: ClubFinanceLedgerEntry): string {
  return `${entry.clubId}|${entry.reason}|${entry.direction}|${entry.referenceId}`;
}

function sumLedgerReasons(entries: readonly ClubFinanceLedgerEntry[]): LongRunLedgerReasonAmounts {
  const totals = emptyLedgerReasonAmounts() as Record<ClubFinanceLedgerReason, number>;
  for (const entry of entries) totals[entry.reason] += entry.amount;
  return totals;
}

function emptyLedgerReasonAmounts(): LongRunLedgerReasonAmounts {
  return Object.fromEntries(LEDGER_REASONS.map((reason) => [reason, 0])) as Record<ClubFinanceLedgerReason, number>;
}

function shouldSampleValuations(seasonNumber: number): boolean {
  return seasonNumber === 1 || seasonNumber % VALUATION_CHECKPOINT_INTERVAL === 0;
}

function ageOn(birthDate: number, currentDate: number): number {
  return Math.max(0, Math.floor((currentDate - birthDate) / 365));
}

function contractFinanceCheck(
  key: string,
  value: number,
  threshold: string,
  status: LongRunAnomalyStatus,
  gameplayMeaning: LongRunContractFinanceCheck["gameplayMeaning"],
  observationCount: number,
): LongRunContractFinanceCheck {
  return {
    key,
    value: roundMetric(value),
    threshold,
    status: observationCount === 0 ? "fail" : status,
    observationCount,
    evaluationStatus: observationCount === 0 ? "not_evaluated" : "evaluated",
    gameplayMeaning,
  };
}

function worstStatus(checks: readonly LongRunContractFinanceCheck[]): LongRunAnomalyStatus {
  if (checks.some((check) => check.status === "fail")) return "fail";
  if (checks.some((check) => check.status === "warn")) return "warn";
  return "pass";
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator <= 0 ? 0 : numerator / denominator;
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function minimumOrZero(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.min(...values);
}

function maximumOrZero(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

function quantile(values: readonly number[], probability: number): number {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  const position = (ordered.length - 1) * probability;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lower = ordered[lowerIndex] ?? 0;
  const upper = ordered[upperIndex] ?? lower;
  return roundMetric(lower + (upper - lower) * (position - lowerIndex));
}

function roundMetric(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
