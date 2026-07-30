import {
  addMoney,
  ClubFinanceStateError,
  clubFinanceLedgerEntryId,
  createCareerState,
  findClubFinanceAccount,
  nonNegativeMoney,
  postClubFinanceLedgerEntry,
  postClubFinanceLedgerEntries,
  replaceClubFinanceAccounts,
  subtractMoney,
  type CareerState,
  type ClubFinanceLedgerEntryId,
  type ClubFinanceState,
  type ClubId,
  type CompetitionSeasonDistribution,
  type ContractNegotiationId,
  type ContractOfferTerms,
  type Fixture,
  type GameDate,
  type GameState,
  type LeagueTableRow,
  type MatchReport,
  type Money,
  type AppliedMatchSubstitution,
  type PlayerContractId,
  type PlayerWagePolicyConfig,
  type PlayerId,
  type SeasonId,
  type SeniorSquadState,
} from "@game/domain";
import {
  buildFixtureParticipationContributions,
  type FixtureParticipationSideContext,
} from "./player-participation.ts";

/** Stable reasons why a financial command could not be applied atomically. */
export type CareerFinanceRejectionReason =
  | "finance_state_missing"
  | "senior_squad_state_missing"
  | "club_finance_account_missing"
  | "contract_not_found"
  | "contract_not_active"
  | "wage_budget_exceeded"
  | "transfer_budget_insufficient"
  | "invalid_budget_reallocation"
  | "insufficient_cash"
  | "currency_mismatch"
  | "invalid_season_distribution";

/** Successful immutable finance lifecycle transaction. */
export interface CareerFinanceApplied {
  readonly status: "applied";
  readonly careerState: CareerState;
  readonly postedEntryIds: readonly ClubFinanceLedgerEntryId[];
}

/** Rejected transaction that preserves the exact input career reference. */
export interface CareerFinanceRejected {
  readonly status: "rejected";
  readonly reason: CareerFinanceRejectionReason;
  readonly careerState: CareerState;
  readonly clubId?: ClubId;
  readonly contractId?: PlayerContractId;
  readonly requiredAmount?: Money;
  readonly availableAmount?: Money;
}

/** Typed result shared by contract, fixture, month, and season finance boundaries. */
export type CareerFinanceLifecycleResult = CareerFinanceApplied | CareerFinanceRejected;

/** Positive affordability projection for one replacement contract. */
export interface ContractOfferAffordable {
  readonly status: "affordable";
  readonly clubId: ClubId;
  readonly projectedCommittedAnnualWage: Money;
  readonly availableAnnualWageBudget: Money;
  readonly availableCash: Money;
}

/** Result of checking an offer without mutating contracts, cash, or ledgers. */
export type ContractOfferAffordabilityResult = ContractOfferAffordable | CareerFinanceRejected;

/** Input for checking a renewal against both wage budget and signing cash. */
export interface CheckContractOfferAffordabilityInput {
  readonly careerState: CareerState;
  readonly clubId: ClubId;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly replacedContractId: PlayerContractId;
  readonly terms: ContractOfferTerms;
}

/**
 * Projects a renewal after replacing its current active wage commitment.
 *
 * Drafts may be edited freely, but submission and acceptance both call this
 * boundary so neither stale cash nor stale wage room can be bypassed.
 */
export function checkContractOfferAffordability(
  input: CheckContractOfferAffordabilityInput,
): ContractOfferAffordabilityResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;
  const account = findClubFinanceAccount(prerequisites.financeState, input.clubId);
  if (account === undefined) {
    return rejected(input.careerState, "club_finance_account_missing", { clubId: input.clubId });
  }
  const contract = prerequisites.seniorSquadState.contracts[input.replacedContractId];
  if (contract === undefined) {
    return rejected(input.careerState, "contract_not_found", { contractId: input.replacedContractId });
  }
  if (
    contract.clubId !== input.clubId
    || !prerequisites.seniorSquadState.activeContractIds.includes(input.replacedContractId)
  ) {
    return rejected(input.careerState, "contract_not_active", {
      clubId: input.clubId,
      contractId: input.replacedContractId,
    });
  }

  const requiredAnnualWage = addMoney(
    nonNegativeMoney(account.committedAnnualWage - contract.annualWage),
    input.terms.annualWage,
  );
  if (requiredAnnualWage > account.annualWageBudget) {
    return rejected(input.careerState, "wage_budget_exceeded", {
      clubId: input.clubId,
      contractId: input.replacedContractId,
      requiredAmount: requiredAnnualWage,
      availableAmount: account.annualWageBudget,
    });
  }
  if (input.terms.bonuses.signingBonus > account.cashBalance) {
    return rejected(input.careerState, "insufficient_cash", {
      clubId: input.clubId,
      contractId: input.replacedContractId,
      requiredAmount: input.terms.bonuses.signingBonus,
      availableAmount: account.cashBalance,
    });
  }

  return {
    status: "affordable",
    clubId: input.clubId,
    projectedCommittedAnnualWage: requiredAnnualWage,
    availableAnnualWageBudget: account.annualWageBudget,
    availableCash: account.cashBalance,
  };
}

/** Input for moving one explicit allocation from transfers to annual wages. */
export interface ReallocateTransferBudgetToWagesInput {
  readonly careerState: CareerState;
  readonly clubId: ClubId;
  readonly amount: Money;
}

/** One explicit transfer-to-wage allocation inside an ordered batch. */
export interface TransferBudgetToWageAllocation {
  readonly clubId: ClubId;
  readonly amount: Money;
  /**
   * Allows an automated structural-squad repair to convert real unspent sale
   * proceeds after the normal annual transfer allocation is exhausted.
   */
  readonly allowSaleProceeds?: boolean;
}

/** Input for applying several transfer-to-wage allocations atomically. */
export interface ReallocateTransferBudgetsToWagesInput {
  readonly careerState: CareerState;
  readonly allocations: readonly TransferBudgetToWageAllocation[];
}

/** Input for a source-calibrated structural squad wage-budget repair. */
export interface EnsureStructuralWageBudgetInput {
  readonly careerState: CareerState;
  readonly clubId: ClubId;
  /** Minimum planning ceiling required by an already-derived structural signing. */
  readonly requiredAnnualWageBudget: Money;
  /** Versioned tier targets that cap the repair without inventing a new number. */
  readonly wagePolicy: PlayerWagePolicyConfig;
}

/**
 * Moves real available transfer allocation into the annual wage ceiling.
 *
 * This changes no cash and therefore creates no ledger movement. Both annual
 * and currently available transfer limits decrease by the same amount so the
 * account remains explainable and no hidden spending room is introduced.
 */
export function reallocateTransferBudgetToWages(
  input: ReallocateTransferBudgetToWagesInput,
): CareerFinanceLifecycleResult {
  return reallocateTransferBudgetsToWages({
    careerState: input.careerState,
    allocations: [{ clubId: input.clubId, amount: input.amount }],
  });
}

/**
 * Applies ordered transfer-to-wage allocations through one finance snapshot.
 *
 * Season lifecycle jobs can plan several independent club decisions and commit
 * them together without rebuilding the complete career after every club. A bad
 * allocation rejects the whole batch and exposes no partial budget movement.
 */
export function reallocateTransferBudgetsToWages(
  input: ReallocateTransferBudgetsToWagesInput,
): CareerFinanceLifecycleResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;
  const accountByClub = new Map(
    prerequisites.financeState.clubIds.flatMap((clubId) => {
      const account = findClubFinanceAccount(prerequisites.financeState, clubId);
      return account === undefined ? [] : [[clubId, account] as const];
    }),
  );
  const changedClubIds = new Set<ClubId>();

  for (const allocation of input.allocations) {
    if (allocation.amount <= 0) {
      return rejected(input.careerState, "invalid_budget_reallocation", {
        clubId: allocation.clubId,
        requiredAmount: allocation.amount,
      });
    }
    const account = accountByClub.get(allocation.clubId);
    if (account === undefined) {
      return rejected(input.careerState, "club_finance_account_missing", {
        clubId: allocation.clubId,
      });
    }
    const reallocatableTransferBudget = allocation.allowSaleProceeds === true
      ? account.availableTransferBudget
      : nonNegativeMoney(
          Math.min(account.annualTransferBudget, account.availableTransferBudget),
        );
    if (allocation.amount > reallocatableTransferBudget) {
      return rejected(input.careerState, "transfer_budget_insufficient", {
        clubId: allocation.clubId,
        requiredAmount: allocation.amount,
        availableAmount: reallocatableTransferBudget,
      });
    }

    accountByClub.set(allocation.clubId, {
      ...account,
      annualTransferBudget: nonNegativeMoney(
        Math.max(0, account.annualTransferBudget - allocation.amount),
      ),
      availableTransferBudget: subtractMoney(account.availableTransferBudget, allocation.amount),
      annualWageBudget: addMoney(account.annualWageBudget, allocation.amount),
    });
    changedClubIds.add(allocation.clubId);
  }

  const financeState = replaceClubFinanceAccounts(
    prerequisites.financeState,
    [...changedClubIds].flatMap((clubId) => {
      const account = accountByClub.get(clubId);
      return account === undefined ? [] : [account];
    }),
  );
  return applied(withFinanceState(input.careerState, financeState), []);
}

/**
 * Raises an AI club's wage planning ceiling only for structural squad repair.
 *
 * The ceiling never exceeds the versioned division maximum and does not move
 * or spend cash. The later contract-activation boundary still validates the
 * exact wage and signing bonus against both budget and cash before publishing
 * a signing.
 */
export function ensureStructuralWageBudget(
  input: EnsureStructuralWageBudgetInput,
): CareerFinanceLifecycleResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;
  const account = findClubFinanceAccount(prerequisites.financeState, input.clubId);
  const club = input.careerState.gameState.clubs[input.clubId];
  const target = input.wagePolicy.wageFinanceCalibration.gameDesignTargets.find(
    (candidate) => candidate.division === club?.category,
  );
  if (account === undefined || target === undefined) {
    return rejected(input.careerState, "club_finance_account_missing", {
      clubId: input.clubId,
    });
  }
  if (input.requiredAnnualWageBudget <= account.annualWageBudget) {
    return applied(input.careerState, []);
  }
  const maximum = nonNegativeMoney(
    target.annualSeniorWageBudgetMaximumMinorUnits,
  );
  if (input.requiredAnnualWageBudget > maximum) {
    return rejected(input.careerState, "wage_budget_exceeded", {
      clubId: input.clubId,
      requiredAmount: input.requiredAnnualWageBudget,
      availableAmount: maximum,
    });
  }
  const financeState = replaceClubFinanceAccounts(prerequisites.financeState, [{
    ...account,
    annualWageBudget: input.requiredAnnualWageBudget,
  }]);
  return applied(withFinanceState(input.careerState, financeState), []);
}

/** Input for reopening each club's transfer allowance at a season boundary. */
export interface RefreshAnnualTransferBudgetAvailabilityInput {
  readonly careerState: CareerState;
}

/**
 * Reopens the spendable transfer allowance for the incoming season.
 *
 * The refresh never creates cash or changes either annual allocation. It only
 * restores a spent allowance up to the club's transfer ceiling, while keeping
 * larger unspent sale proceeds and clamping every result to real cash.
 */
export function refreshAnnualTransferBudgetAvailability(
  input: RefreshAnnualTransferBudgetAvailabilityInput,
): CareerFinanceLifecycleResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;

  const replacements = prerequisites.financeState.clubIds.flatMap((clubId) => {
    const account = prerequisites.financeState.accounts[clubId];
    if (account === undefined) return [];
    const availableTransferBudget = nonNegativeMoney(Math.min(
      account.cashBalance,
      Math.max(account.annualTransferBudget, account.availableTransferBudget),
    ));
    return availableTransferBudget === account.availableTransferBudget
      ? []
      : [{ ...account, availableTransferBudget }];
  });
  const financeState = replaceClubFinanceAccounts(prerequisites.financeState, replacements);
  return applied(withFinanceState(input.careerState, financeState), []);
}

/** One completed football season charged by the annual payroll boundary. */
export interface CareerAnnualPayrollFact {
  readonly seasonId: SeasonId;
  readonly chargedContractCount: number;
  readonly postedEntryIds: readonly ClubFinanceLedgerEntryId[];
}

/** Result of settling annual base wages for one football season. */
export type CareerAnnualPayrollResult =
  | (CareerFinanceApplied & { readonly payroll: CareerAnnualPayrollFact })
  | CareerFinanceRejected;

/** Input for charging one season of annual wages at its canonical boundary. */
export interface SettleAnnualPayrollInput {
  readonly careerState: CareerState;
  readonly seasonId: SeasonId;
  readonly occurredOn: GameDate;
}

/**
 * Charges every active agreement once for the completed football season.
 *
 * Contract amounts are already annual values and are aggregated into one
 * club/season ledger movement. Stable club/season IDs make retries and reloads
 * no-ops without adding twelve artificial payroll checkpoints to every season.
 */
export function settleAnnualPayroll(input: SettleAnnualPayrollInput): CareerAnnualPayrollResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;

  let financeState = prerequisites.financeState;
  const postedEntryIds: ClubFinanceLedgerEntryId[] = [];
  const annualCostByClub = new Map<ClubId, Money>();
  let chargedContractCount = 0;

  for (const contractId of prerequisites.seniorSquadState.activeContractIds) {
    const contract = prerequisites.seniorSquadState.contracts[contractId];
    if (
      contract === undefined
      || !contractIsActiveOn(contract.startsOn, contract.endsOn, input.occurredOn)
      || contract.annualWage === 0
    ) continue;
    annualCostByClub.set(
      contract.clubId,
      addMoney(annualCostByClub.get(contract.clubId) ?? nonNegativeMoney(0), contract.annualWage),
    );
    chargedContractCount += 1;
  }

  for (const clubId of financeState.clubIds) {
    const amount = annualCostByClub.get(clubId);
    if (amount === undefined || amount === 0) continue;
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:payroll:${input.seasonId}:${clubId}`);
    const before = financeState;
    const posted = tryPost(financeState, {
      id: entryId,
      clubId,
      occurredOn: input.occurredOn,
      currency: financeState.currency,
      reason: "annual_base_wage",
      direction: "debit",
      amount,
      referenceId: `payroll:${input.seasonId}:${clubId}`,
    }, input.careerState);
    if (posted.status === "rejected") return posted;
    financeState = posted.financeState;
    if (financeState !== before) postedEntryIds.push(entryId);
  }

  return applied(withFinanceState(input.careerState, financeState), postedEntryIds, {
    payroll: {
      seasonId: input.seasonId,
      chargedContractCount,
      postedEntryIds,
    },
  });
}

/** Input for the atomic contract-activation finance boundary. */
export interface ApplyContractActivationFinanceInput {
  readonly careerState: CareerState;
  /** Ownership snapshot paired with the proposed registration, when changed. */
  readonly proposedGameState?: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly activatedContractIds: readonly PlayerContractId[];
  readonly occurredOn: GameDate;
}

/** One contract activation and the date its signing bonus became payable. */
export interface ContractActivationFinanceFact {
  readonly contractId: PlayerContractId;
  readonly occurredOn: GameDate;
}

/** Input for applying multiple accepted agreements through one finance snapshot. */
export interface ApplyContractActivationsFinanceInput {
  readonly careerState: CareerState;
  /** Ownership snapshot paired with the proposed registration, when changed. */
  readonly proposedGameState?: GameState;
  readonly seniorSquadState: SeniorSquadState;
  readonly activations: readonly ContractActivationFinanceFact[];
}

/** Input for aligning club wage commitments with one proposed senior-squad state. */
export interface ReconcileActiveContractWageCommitmentsInput {
  readonly careerState: CareerState;
  /** Proposed ownership snapshot when the contract change moves a player. */
  readonly gameState?: GameState;
  readonly seniorSquadState: SeniorSquadState;
  /** Dependent negotiation state already reconciled with the proposed contracts. */
  readonly contractNegotiationState?: CareerState["contractNegotiationState"] | null;
  /** Dependent selected-club preparation after a departing player is removed. */
  readonly matchPreparation?: CareerState["matchPreparation"] | null;
}

/**
 * Rebuilds every club's annual wage commitment from active contracts.
 *
 * Departures, expiries, and other ownership transitions use this boundary so
 * finance never relies on fragile incremental subtraction. Annual wages remain
 * budget commitments here; cash is charged only by the season payroll boundary.
 */
export function reconcileActiveContractWageCommitments(
  input: ReconcileActiveContractWageCommitmentsInput,
): CareerFinanceLifecycleResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;
  const projection = validateAnnualWageCommitments(
    input.careerState,
    prerequisites.financeState,
    input.seniorSquadState,
  );
  if (projection.status === "rejected") return projection;
  const clubFinanceState = withAnnualWageCommitments(
    prerequisites.financeState,
    projection.committedByClub,
  );
  const {
    contractNegotiationState: _previousNegotiations,
    matchPreparation: _previousPreparation,
    ...unchangedCareerState
  } = input.careerState;
  const contractNegotiationState = input.contractNegotiationState === undefined
    ? input.careerState.contractNegotiationState
    : input.contractNegotiationState ?? undefined;
  const matchPreparation = input.matchPreparation === undefined
    ? input.careerState.matchPreparation
    : input.matchPreparation ?? undefined;
  return applied(createCareerState({
    ...unchangedCareerState,
    gameState: input.gameState ?? input.careerState.gameState,
    seniorSquadState: input.seniorSquadState,
    clubFinanceState,
    ...(contractNegotiationState === undefined ? {} : { contractNegotiationState }),
    ...(matchPreparation === undefined ? {} : { matchPreparation }),
  }), []);
}

/**
 * Reconciles wage commitments and pays signing bonuses for new active terms.
 *
 * Callers pass their proposed senior-squad state. The function checks wage and
 * cash affordability before publishing one valid career snapshot, which avoids
 * an intermediate state where contracts and committed wages disagree.
 */
export function applyContractActivationFinance(
  input: ApplyContractActivationFinanceInput,
): CareerFinanceLifecycleResult {
  return applyContractActivationsFinance({
    careerState: input.careerState,
    ...(input.proposedGameState === undefined ? {} : { proposedGameState: input.proposedGameState }),
    seniorSquadState: input.seniorSquadState,
    activations: input.activatedContractIds.map((contractId) => ({
      contractId,
      occurredOn: input.occurredOn,
    })),
  });
}

/**
 * Reconciles and funds an ordered group of accepted agreements atomically.
 *
 * Every signing bonus is preflighted against the balance left by earlier
 * activations. Ledger rows and annual wage commitments are then published in
 * batches, avoiding transient career snapshots and repeated collection copies.
 */
export function applyContractActivationsFinance(
  input: ApplyContractActivationsFinanceInput,
): CareerFinanceLifecycleResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;

  const activeIds = new Set(input.seniorSquadState.activeContractIds);
  for (const activation of input.activations) {
    const contract = input.seniorSquadState.contracts[activation.contractId];
    if (contract === undefined) {
      return rejected(input.careerState, "contract_not_found", { contractId: activation.contractId });
    }
    if (!activeIds.has(activation.contractId)) {
      return rejected(input.careerState, "contract_not_active", { contractId: activation.contractId });
    }
  }

  const projection = validateAnnualWageCommitments(
    input.careerState,
    prerequisites.financeState,
    input.seniorSquadState,
  );
  if (projection.status === "rejected") return projection;

  const financeState = prerequisites.financeState;
  const ledgerInputs: Array<Parameters<typeof postClubFinanceLedgerEntries>[1][number]> = [];
  const postedEntryIds: ClubFinanceLedgerEntryId[] = [];
  const scheduledEntryIds = new Set<ClubFinanceLedgerEntryId>();
  const availableCashByClub = new Map<ClubId, Money>();
  for (const activation of input.activations) {
    const contract = input.seniorSquadState.contracts[activation.contractId];
    if (contract === undefined || contract.bonuses.signingBonus === 0) continue;
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:signing:${contract.id}`);
    const ledgerInput = {
      id: entryId,
      clubId: contract.clubId,
      occurredOn: activation.occurredOn,
      currency: financeState.currency,
      reason: "contract_signing_bonus",
      direction: "debit",
      amount: contract.bonuses.signingBonus,
      referenceId: `contract-activation:${contract.id}`,
    } as const;
    ledgerInputs.push(ledgerInput);
    if (financeState.ledgerEntries[entryId] !== undefined || scheduledEntryIds.has(entryId)) continue;

    const account = findClubFinanceAccount(financeState, contract.clubId);
    if (account === undefined) {
      return rejected(input.careerState, "club_finance_account_missing", { clubId: contract.clubId });
    }
    const availableCash = availableCashByClub.get(contract.clubId) ?? account.cashBalance;
    if (contract.bonuses.signingBonus > availableCash) {
      return rejected(input.careerState, "insufficient_cash", {
        clubId: contract.clubId,
        contractId: contract.id,
        requiredAmount: contract.bonuses.signingBonus,
        availableAmount: availableCash,
      });
    }
    availableCashByClub.set(
      contract.clubId,
      subtractMoney(availableCash, contract.bonuses.signingBonus),
    );
    scheduledEntryIds.add(entryId);
    postedEntryIds.push(entryId);
  }

  let updatedFinanceState: ClubFinanceState;
  try {
    updatedFinanceState = postClubFinanceLedgerEntries(financeState, ledgerInputs);
  } catch (error) {
    if (error instanceof ClubFinanceStateError && error.code === "finance_currency_mismatch") {
      return rejected(input.careerState, "currency_mismatch");
    }
    throw error;
  }
  updatedFinanceState = withAnnualWageCommitments(updatedFinanceState, projection.committedByClub);

  return applied(createCareerState({
    ...input.careerState,
    ...(input.proposedGameState === undefined ? {} : { gameState: input.proposedGameState }),
    seniorSquadState: input.seniorSquadState,
    clubFinanceState: updatedFinanceState,
  }), postedEntryIds);
}

/** Input for the full-time contract bonus boundary. */
export interface SettleFixtureContractBonusesInput {
  readonly careerState: CareerState;
  readonly fixture: Fixture;
  readonly report: MatchReport;
  readonly participationSides: readonly FixtureParticipationSideContext[];
  readonly appliedSubstitutions?: readonly AppliedMatchSubstitution[];
}

/** Charges appearance, goal, and clean-sheet bonuses from committed facts. */
export function settleFixtureContractBonuses(
  input: SettleFixtureContractBonusesInput,
): CareerFinanceLifecycleResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;
  const contributions = buildFixtureParticipationContributions({
    fixtureId: input.fixture.id,
    seasonId: input.fixture.seasonId,
    fixtureDate: input.fixture.date,
    finalMinute: input.report.finalMinute,
    sides: input.participationSides,
    ...(input.appliedSubstitutions === undefined ? {} : { appliedSubstitutions: input.appliedSubstitutions }),
  }).contributions;
  const contributionByPlayer = new Map(contributions.map((contribution) => [contribution.playerId, contribution]));
  const sideByPlayer = participantSides(input.participationSides, input.appliedSubstitutions ?? []);
  const goalsByPlayer = goalCounts(input.report);
  const financeState = prerequisites.financeState;
  const ledgerInputs: Array<Parameters<typeof postClubFinanceLedgerEntries>[1][number]> = [];
  const postedEntryIds: ClubFinanceLedgerEntryId[] = [];
  const availableCashByClub = new Map<ClubId, Money>();

  for (const contractId of prerequisites.seniorSquadState.activeContractIds) {
    const contract = prerequisites.seniorSquadState.contracts[contractId];
    const participation = contract === undefined ? undefined : contributionByPlayer.get(contract.playerId);
    if (
      contract === undefined
      || participation === undefined
      || participation.minutes <= 0
      || !contractIsActiveOn(contract.startsOn, contract.endsOn, input.fixture.date)
    ) continue;

    const bonuses: readonly ["appearance_bonus" | "goal_bonus" | "clean_sheet_bonus", Money][] = [
      ["appearance_bonus", contract.bonuses.appearanceBonus],
      ["goal_bonus", multipliedMoney(contract.bonuses.goalBonus, goalsByPlayer.get(contract.playerId) ?? 0)],
      ["clean_sheet_bonus", cleanSheetAmount(contract.bonuses.cleanSheetBonus, sideByPlayer.get(contract.playerId), input.report)],
    ];

    for (const [reason, amount] of bonuses) {
      if (amount === 0) continue;
      const entryId = clubFinanceLedgerEntryId(`finance-ledger:fixture:${input.fixture.id}:${contract.id}:${reason}`);
      const ledgerInput = {
        id: entryId,
        clubId: contract.clubId,
        occurredOn: input.fixture.date,
        currency: financeState.currency,
        reason,
        direction: "debit",
        amount,
        referenceId: `fixture:${input.fixture.id}:${contract.id}:${reason}`,
      } as const;
      ledgerInputs.push(ledgerInput);
      if (financeState.ledgerEntries[entryId] !== undefined) continue;

      const account = findClubFinanceAccount(financeState, contract.clubId);
      if (account === undefined) {
        return rejected(input.careerState, "club_finance_account_missing", {
          clubId: contract.clubId,
          contractId: contract.id,
        });
      }
      const availableCash = availableCashByClub.get(contract.clubId) ?? account.cashBalance;
      if (amount > availableCash) {
        return rejected(input.careerState, "insufficient_cash", {
          clubId: contract.clubId,
          contractId: contract.id,
          requiredAmount: amount,
          availableAmount: availableCash,
        });
      }
      availableCashByClub.set(contract.clubId, subtractMoney(availableCash, amount));
      postedEntryIds.push(entryId);
    }
  }

  let updatedFinanceState: ClubFinanceState;
  try {
    updatedFinanceState = postClubFinanceLedgerEntries(financeState, ledgerInputs);
  } catch (error) {
    if (error instanceof ClubFinanceStateError && error.code === "finance_currency_mismatch") {
      return rejected(input.careerState, "currency_mismatch");
    }
    throw error;
  }
  return applied(withFinanceState(input.careerState, updatedFinanceState), postedEntryIds);
}

/** Input for one completed competition season distribution. */
export interface SettleSeasonDistributionInput {
  readonly careerState: CareerState;
  readonly seasonId: SeasonId;
  readonly occurredOn: GameDate;
  readonly distribution: CompetitionSeasonDistribution;
  readonly finalTable: readonly LeagueTableRow[];
}

/** Credits each final-table position exactly once from competition-owned data. */
export function settleSeasonDistribution(input: SettleSeasonDistributionInput): CareerFinanceLifecycleResult {
  const prerequisites = requiredFinanceState(input.careerState);
  if (prerequisites.status === "rejected") return prerequisites;
  if (
    input.distribution.currency !== prerequisites.financeState.currency
    || input.distribution.prizes.length !== input.finalTable.length
  ) {
    return rejected(input.careerState, "invalid_season_distribution");
  }

  const financeState = prerequisites.financeState;
  const ledgerInputs: Array<Parameters<typeof postClubFinanceLedgerEntries>[1][number]> = [];
  const postedEntryIds: ClubFinanceLedgerEntryId[] = [];
  for (let index = 0; index < input.finalTable.length; index += 1) {
    const row = input.finalTable[index];
    const prize = input.distribution.prizes[index];
    if (row === undefined || prize === undefined || row.position !== prize.position) {
      return rejected(input.careerState, "invalid_season_distribution");
    }
    if (prize.amount === 0) continue;
    const entryId = clubFinanceLedgerEntryId(`finance-ledger:season:${input.seasonId}:${row.clubId}:distribution`);
    ledgerInputs.push({
      id: entryId,
      clubId: row.clubId,
      occurredOn: input.occurredOn,
      currency: financeState.currency,
      reason: "season_distribution",
      direction: "credit",
      amount: prize.amount,
      referenceId: `season:${input.seasonId}:position:${row.position}`,
    });
    if (financeState.ledgerEntries[entryId] === undefined) postedEntryIds.push(entryId);
  }

  let updatedFinanceState: ClubFinanceState;
  try {
    updatedFinanceState = postClubFinanceLedgerEntries(financeState, ledgerInputs);
  } catch (error) {
    if (error instanceof ClubFinanceStateError && error.code === "finance_currency_mismatch") {
      return rejected(input.careerState, "currency_mismatch");
    }
    throw error;
  }
  return applied(withFinanceState(input.careerState, updatedFinanceState), postedEntryIds);
}

interface RequiredFinanceState {
  readonly status: "available";
  readonly financeState: ClubFinanceState;
  readonly seniorSquadState: SeniorSquadState;
}

function requiredFinanceState(careerState: CareerState): RequiredFinanceState | CareerFinanceRejected {
  if (careerState.clubFinanceState === undefined) return rejected(careerState, "finance_state_missing");
  if (careerState.seniorSquadState === undefined) return rejected(careerState, "senior_squad_state_missing");
  return {
    status: "available",
    financeState: careerState.clubFinanceState,
    seniorSquadState: careerState.seniorSquadState,
  };
}

function tryPost(
  financeState: ClubFinanceState,
  entry: Parameters<typeof postClubFinanceLedgerEntry>[1],
  careerState: CareerState,
  contractId?: PlayerContractId,
): { readonly status: "posted"; readonly financeState: ClubFinanceState } | CareerFinanceRejected {
  try {
    return { status: "posted", financeState: postClubFinanceLedgerEntry(financeState, entry) };
  } catch (error) {
    if (error instanceof ClubFinanceStateError && error.code === "insufficient_cash") {
      const account = findClubFinanceAccount(financeState, entry.clubId);
      return rejected(careerState, "insufficient_cash", {
        clubId: entry.clubId,
        ...(contractId === undefined ? {} : { contractId }),
        requiredAmount: entry.amount,
        ...(account === undefined ? {} : { availableAmount: account.cashBalance }),
      });
    }
    if (error instanceof ClubFinanceStateError && error.code === "finance_currency_mismatch") {
      return rejected(careerState, "currency_mismatch", {
        clubId: entry.clubId,
        ...(contractId === undefined ? {} : { contractId }),
      });
    }
    throw error;
  }
}

function applied<T extends object>(
  careerState: CareerState,
  postedEntryIds: readonly ClubFinanceLedgerEntryId[],
  extra?: T,
): CareerFinanceApplied & T {
  return { status: "applied", careerState, postedEntryIds, ...(extra ?? {} as T) };
}

function rejected(
  careerState: CareerState,
  reason: CareerFinanceRejectionReason,
  facts: Omit<CareerFinanceRejected, "status" | "reason" | "careerState"> = {},
): CareerFinanceRejected {
  return { status: "rejected", reason, careerState, ...facts };
}

function withFinanceState(careerState: CareerState, clubFinanceState: ClubFinanceState): CareerState {
  if (clubFinanceState === careerState.clubFinanceState) return careerState;
  return createCareerState({ ...careerState, clubFinanceState });
}

function committedAnnualWages(state: SeniorSquadState): ReadonlyMap<ClubId, Money> {
  const result = new Map<ClubId, Money>();
  for (const contractId of state.activeContractIds) {
    const contract = state.contracts[contractId];
    if (contract === undefined) continue;
    result.set(contract.clubId, nonNegativeMoney((result.get(contract.clubId) ?? 0) + contract.annualWage));
  }
  return result;
}

interface AnnualWageCommitmentsAvailable {
  readonly status: "available";
  readonly committedByClub: ReadonlyMap<ClubId, Money>;
}

function validateAnnualWageCommitments(
  careerState: CareerState,
  financeState: ClubFinanceState,
  seniorSquadState: SeniorSquadState,
): AnnualWageCommitmentsAvailable | CareerFinanceRejected {
  const committedByClub = committedAnnualWages(seniorSquadState);
  for (const [clubId, requiredAmount] of committedByClub) {
    const account = findClubFinanceAccount(financeState, clubId);
    if (account === undefined) {
      return rejected(careerState, "club_finance_account_missing", { clubId });
    }
    if (requiredAmount > account.annualWageBudget) {
      return rejected(careerState, "wage_budget_exceeded", {
        clubId,
        requiredAmount,
        availableAmount: account.annualWageBudget,
      });
    }
  }
  return { status: "available", committedByClub };
}

function withAnnualWageCommitments(
  financeState: ClubFinanceState,
  committedByClub: ReadonlyMap<ClubId, Money>,
): ClubFinanceState {
  const replacements = [];
  for (const clubId of financeState.clubIds) {
    const account = findClubFinanceAccount(financeState, clubId);
    if (account === undefined) continue;
    const committedAnnualWage = committedByClub.get(clubId) ?? nonNegativeMoney(0);
    if (account.committedAnnualWage === committedAnnualWage) continue;
    replacements.push({ ...account, committedAnnualWage });
  }
  return replaceClubFinanceAccounts(financeState, replacements);
}

function participantSides(
  sides: readonly FixtureParticipationSideContext[],
  substitutions: readonly AppliedMatchSubstitution[],
): ReadonlyMap<PlayerId, "home" | "away"> {
  const result = new Map<PlayerId, "home" | "away">();
  for (const side of sides) {
    for (const slot of side.initialContext.lineup) result.set(slot.playerId, side.side);
    for (const substitution of substitutions) {
      if (substitution.side === side.side) result.set(substitution.incomingPlayerId, side.side);
    }
  }
  return result;
}

function goalCounts(report: MatchReport): ReadonlyMap<PlayerId, number> {
  const result = new Map<PlayerId, number>();
  for (const event of report.events) {
    if (event.type !== "goal") continue;
    result.set(event.scorerPlayerId, (result.get(event.scorerPlayerId) ?? 0) + 1);
  }
  return result;
}

function cleanSheetAmount(
  amount: Money | undefined,
  side: "home" | "away" | undefined,
  report: MatchReport,
): Money {
  if (amount === undefined || side === undefined) return nonNegativeMoney(0);
  const conceded = side === "home" ? report.score.away : report.score.home;
  return conceded === 0 ? amount : nonNegativeMoney(0);
}

function multipliedMoney(amount: Money | undefined, count: number): Money {
  return amount === undefined || count <= 0 ? nonNegativeMoney(0) : nonNegativeMoney(amount * count);
}

function contractIsActiveOn(startsOn: GameDate, endsOn: GameDate, date: GameDate): boolean {
  return startsOn <= date && endsOn > date;
}
