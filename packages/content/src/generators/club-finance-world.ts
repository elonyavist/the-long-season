import {
  addMoney,
  clubFinanceLedgerEntryId,
  createClubFinanceState,
  createCompetitionSeasonDistribution,
  nonNegativeMoney,
  type Club,
  type ClubFinanceAccount,
  type ClubFinanceLedgerEntry,
  type ClubFinanceLedgerEntryId,
  type ClubFinanceState,
  type ClubId,
  type CompetitionSeasonDistribution,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type Money,
  type PlayerWagePolicyConfig,
  type SeniorSquadState,
} from "@game/domain";
import { deriveOpeningAnnualWageBudget } from "./opening-wage-budget.ts";

/** Inputs required to finance every generated senior squad. */
export interface InitialClubFinanceGenerationInput {
  readonly referenceDate: GameDate;
  readonly clubs: Readonly<Record<ClubId, Club>>;
  readonly clubIds: readonly ClubId[];
  readonly seniorSquadState: SeniorSquadState;
  /** Validated source-backed targets for the opening annual wage ceiling. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Validated opening cash and transfer-budget targets. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}

/**
 * Generates deterministic opening capital and annual budgets from sporting facts.
 *
 * The policy deliberately derives wage pressure from active agreements and
 * derives investment headroom from category, reputation, and roster quality.
 */
export function generateInitialClubFinanceState(
  input: InitialClubFinanceGenerationInput,
): ClubFinanceState {
  const accounts: Record<ClubId, ClubFinanceAccount> = {};
  const ledgerEntries: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = {};
  const ledgerEntryIds: ClubFinanceLedgerEntryId[] = [];

  for (let index = 0; index < input.clubIds.length; index += 1) {
    const clubId = input.clubIds[index];
    if (clubId === undefined) continue;
    const club = input.clubs[clubId];
    if (club === undefined) throw new Error(`Cannot generate finances for missing club: ${clubId}`);
    const committedAnnualWage = committedWage(input.seniorSquadState, clubId);
    const annualWageBudget = deriveOpeningAnnualWageBudget({
      club,
      clubs: input.clubs,
      clubIds: input.clubIds,
      wagePolicy: input.wagePolicy,
    });
    const annualTransferBudget = openingFinanceAmount(
      input,
      club,
      "annualTransferBudget",
    );
    const openingCash = openingFinanceAmount(input, club, "cash");

    accounts[clubId] = {
      clubId,
      currency: "EUR",
      cashBalance: openingCash,
      annualTransferBudget,
      availableTransferBudget: annualTransferBudget,
      annualWageBudget,
      committedAnnualWage,
      seasonIncome: nonNegativeMoney(0),
      seasonExpenses: nonNegativeMoney(0),
    };

    const entryId = clubFinanceLedgerEntryId(`finance-ledger:opening:${String(clubId).slice(5)}`);
    ledgerEntries[entryId] = {
      id: entryId,
      sequenceNumber: ledgerEntryIds.length + 1,
      clubId,
      occurredOn: input.referenceDate,
      currency: "EUR",
      reason: "opening_capital",
      direction: "credit",
      amount: openingCash,
      balanceAfter: openingCash,
      referenceId: `generated-world:${clubId}`,
    };
    ledgerEntryIds.push(entryId);
  }

  return createClubFinanceState(
    { clubs: input.clubs, clubIds: input.clubIds },
    input.seniorSquadState,
    {
      currency: "EUR",
      accounts,
      clubIds: [...input.clubIds],
      ledgerEntries,
      ledgerEntryIds,
    },
  );
}

/** Generates the current league's explainable final-position prize schedule. */
export function generateCompetitionSeasonDistribution(
  financeState: ClubFinanceState,
  participantClubIds: readonly ClubId[] = financeState.clubIds,
): CompetitionSeasonDistribution {
  const participantCount = participantClubIds.length;
  const maximumCommittedWage = participantClubIds.reduce((maximum, clubId) => {
    return Math.max(maximum, financeState.accounts[clubId]?.committedAnnualWage ?? 0);
  }, 0);
  const operatingDistribution = roundMoney(maximumCommittedWage * 1.08, 10_000_00);
  const prizes = Array.from({ length: participantCount }, (_, index) => {
    const position = index + 1;
    const amount = operatingDistribution
      + Math.round(((participantCount - position) / Math.max(1, participantCount - 1)) * 1_850_000_00);
    return { position, amount: nonNegativeMoney(roundMoney(amount, 10_000_00)) };
  });
  return createCompetitionSeasonDistribution({ currency: "EUR", prizes }, participantCount);
}

function committedWage(state: SeniorSquadState, clubId: ClubId): Money {
  let total = nonNegativeMoney(0);
  for (const contractId of state.activeContractIds) {
    const contract = state.contracts[contractId];
    if (contract?.clubId === clubId) total = addMoney(total, contract.annualWage);
  }
  return total;
}

function openingFinanceAmount(
  input: InitialClubFinanceGenerationInput,
  club: Club,
  kind: "annualTransferBudget" | "cash",
): Money {
  const target = input.marketBehaviorPolicy.openingFinanceTargets.find(
    (candidate) => candidate.division === club.category,
  );
  if (target === undefined) {
    throw new Error(`Opening finance target missing for ${club.category}`);
  }
  const divisionClubs = input.clubIds
    .map((clubId) => input.clubs[clubId])
    .filter((candidate): candidate is Club => candidate?.category === club.category);
  const minimumReputation = Math.min(
    ...divisionClubs.map((candidate) => candidate.reputation),
  );
  const maximumReputation = Math.max(
    ...divisionClubs.map((candidate) => candidate.reputation),
  );
  const position = maximumReputation <= minimumReputation
    ? 0.5
    : Math.max(
        0,
        Math.min(
          1,
          (club.reputation - minimumReputation)
            / (maximumReputation - minimumReputation),
        ),
      );
  const minimum = kind === "cash"
    ? target.cashMinimumMinorUnits
    : target.annualTransferBudgetMinimumMinorUnits;
  const median = kind === "cash"
    ? target.cashMedianMinorUnits
    : target.annualTransferBudgetMedianMinorUnits;
  const maximum = kind === "cash"
    ? target.cashMaximumMinorUnits
    : target.annualTransferBudgetMaximumMinorUnits;
  const amount = position <= 0.5
    ? minimum + (median - minimum) * position * 2
    : median + (maximum - median) * (position - 0.5) * 2;
  return nonNegativeMoney(roundMoney(
    amount,
    input.marketBehaviorPolicy.openingFinanceRoundingMinorUnits,
  ));
}

function roundMoney(value: number, precision: number): number {
  return Math.max(0, Math.round(value / precision) * precision);
}
