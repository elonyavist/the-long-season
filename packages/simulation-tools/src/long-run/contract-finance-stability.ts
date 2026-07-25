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
  type ClubId,
  type ContractNegotiation,
  type ContractOfferTerms,
  type PlayerContract,
  type PlayerId,
  type SeasonTransferWindows,
  type SeniorSquadRegistration,
} from "@game/domain";
import {
  checkContractOfferAffordability,
  DEFAULT_PLAYER_VALUATION_CONFIG,
  derivePlayerValuation,
  selectFreeAgentPlayerIds,
} from "@game/engine";

import type { LongRunAnomalyStatus } from "./anomaly-scoring.ts";

/** Coarse squad departments used only by long-run structural diagnostics. */
export type LongRunSquadDepartment = "goalkeeper" | "defender" | "midfielder" | "attacker";

/** Money posted by one ledger reason during one simulated season. */
export type LongRunLedgerReasonAmounts = Readonly<Record<ClubFinanceLedgerReason, number>>;

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
}

/** One machine-readable contract and finance long-run check. */
export interface LongRunContractFinanceCheck {
  /** Stable report key. */
  readonly key: string;
  /** PASS/WARN/FAIL status. */
  readonly status: LongRunAnomalyStatus;
  /** Numeric value that produced the status. */
  readonly value: number;
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
  const negotiationFacts = inspectNegotiations(current);
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
  const valuations = shouldSampleValuations(input.seasonNumber)
    ? sampledPlayerValues(current, ownedPlayerClub, activeContractByPlayer)
    : [];
  const historyFacts = inspectNewContractHistory(previous, current);
  const planFacts = inspectSelectedPlanContinuity(previous, current, ownedPlayerClub);

  return {
    seasonNumber: input.seasonNumber,
    currentDate,
    ownedSeniorPlayerCount: ownedPlayerClub.size,
    freeAgentCount: freeAgentPlayerIds.length,
    freeAgentShare: roundMetric(safeRatio(freeAgentPlayerIds.length, current.gameState.playerIds.length)),
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

  const checks: LongRunContractFinanceCheck[] = [
    contractFinanceCheck(
      "contract_finance_structural_integrity",
      structuralViolationCount,
      "pass 0; fail >0",
      structuralViolationCount > 0 ? "fail" : "pass",
      "structure",
    ),
    contractFinanceCheck(
      "transfer_market_window_integrity",
      seasons.reduce((sum, s) => sum + s.transferWindowViolationCount, 0),
      "pass 0; fail >0",
      seasons.some((s) => s.transferWindowViolationCount > 0) ? "fail" : "pass",
      "structure",
    ),
    contractFinanceCheck(
      "negotiation_clock_integrity",
      seasons.reduce((sum, s) => sum + s.negotiationClockViolationCount, 0),
      "pass 0; fail >0",
      seasons.some((s) => s.negotiationClockViolationCount > 0) ? "fail" : "pass",
      "structure",
    ),
    contractFinanceCheck(
      "preliminary_agreement_integrity",
      seasons.reduce((sum, s) => sum + s.preliminaryAgreementViolationCount, 0),
      "pass 0; fail >0",
      seasons.some((s) => s.preliminaryAgreementViolationCount > 0) ? "fail" : "pass",
      "structure",
    ),
    contractFinanceCheck(
      "wage_budget_utilization",
      maximumWageBudgetUtilizationObserved,
      `pass <${WAGE_UTILIZATION_WARNING}; warn ${WAGE_UTILIZATION_WARNING}..1; fail >1`,
      maximumWageBudgetUtilizationObserved > 1
        ? "fail"
        : maximumWageBudgetUtilizationObserved >= WAGE_UTILIZATION_WARNING
          ? "warn"
          : "pass",
      "football_story",
    ),
    contractFinanceCheck(
      "free_agent_population_share",
      maximumFreeAgentShareObserved,
      `pass <=${FREE_AGENT_SHARE_WARNING}; warn above; integrity failures are separate`,
      maximumFreeAgentShareObserved > FREE_AGENT_SHARE_WARNING ? "warn" : "pass",
      "football_story",
    ),
    contractFinanceCheck(
      "selected_club_expiry_decisions",
      selectedClubExpiredDecisionCount,
      "monitor only: the manager, never AI, owns these decisions",
      "pass",
      "decision",
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
  const maximumWageBudgetUtilization = Math.max(
    ...accounts.map((account) => safeRatio(account.committedAnnualWage, account.annualWageBudget)),
    0,
  );

  return {
    duplicateLedgerBusinessFactCount,
    annualPayrollReconciliationViolationCount: countPayrollReconciliationViolations(previous, newEntries),
    financeLimitViolationCount,
    minimumCashBalance: minimumOrZero(accounts.map((account) => Number(account.cashBalance))),
    maximumWageBudgetUtilization: roundMetric(maximumWageBudgetUtilization),
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

function inspectNegotiations(careerState: CareerState): {
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

function sampledPlayerValues(
  careerState: CareerState,
  ownedPlayerClub: ReadonlyMap<PlayerId, ClubId>,
  activeContractByPlayer: ReadonlyMap<PlayerId, PlayerContract>,
): readonly number[] {
  const values: number[] = [];
  for (const [playerId, clubId] of ownedPlayerClub) {
    const player = careerState.gameState.players[playerId];
    const club = careerState.gameState.clubs[clubId];
    if (player === undefined || club === undefined) continue;
    const contract = activeContractByPlayer.get(playerId);
    const currentForm = careerState.gameState.playerStates[playerId]?.form;
    values.push(
      derivePlayerValuation({
        player,
        club,
        currentDate: careerState.gameState.calendar.currentDate,
        config: DEFAULT_PLAYER_VALUATION_CONFIG,
        ...(contract === undefined ? {} : { contract }),
        ...(currentForm === undefined ? {} : { currentForm }),
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
): LongRunContractFinanceCheck {
  return { key, value: roundMetric(value), threshold, status, gameplayMeaning };
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

function roundMetric(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
