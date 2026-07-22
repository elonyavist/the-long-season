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
  type Money,
  type RoleIdentifiedPlayer,
  type SeniorSquadState,
} from "@game/domain";

/** Inputs required to finance every generated senior squad. */
export interface InitialClubFinanceGenerationInput {
  readonly referenceDate: GameDate;
  readonly clubs: Readonly<Record<ClubId, Club>>;
  readonly clubIds: readonly ClubId[];
  readonly players: Readonly<Record<RoleIdentifiedPlayer["id"], RoleIdentifiedPlayer>>;
  readonly seniorSquadState: SeniorSquadState;
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
    const quality = rosterQuality(club, input.players);
    const annualWageBudget = wageBudget(club, committedAnnualWage);
    const annualTransferBudget = transferBudget(club, committedAnnualWage, quality);
    const openingCash = cashRequirement(club, committedAnnualWage, annualTransferBudget, quality);

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
): CompetitionSeasonDistribution {
  const participantCount = financeState.clubIds.length;
  const maximumCommittedWage = financeState.clubIds.reduce((maximum, clubId) => {
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

function rosterQuality(
  club: Club,
  players: Readonly<Record<RoleIdentifiedPlayer["id"], RoleIdentifiedPlayer>>,
): number {
  if (club.playerIds.length === 0) return 0;
  let total = 0;
  for (const playerId of club.playerIds) {
    const player = players[playerId];
    if (player === undefined) throw new Error(`Cannot value missing generated player: ${playerId}`);
    const abilities = player.abilities;
    const values = [
      ...Object.values(abilities.technical),
      ...Object.values(abilities.mental),
      ...Object.values(abilities.physical),
      ...Object.values(abilities.goalkeeping),
    ];
    total += values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  return total / club.playerIds.length;
}

function wageBudget(club: Club, committedAnnualWage: Money): Money {
  const headroom = 1.08 + Math.min(0.14, club.reputation * 0.012);
  return nonNegativeMoney(roundMoney(committedAnnualWage * headroom, 10_000_00));
}

function transferBudget(club: Club, committedAnnualWage: Money, quality: number): Money {
  const categoryFactor = club.category === "first_division" ? 4 : club.category === "second_division" ? 2 : 1;
  const amount = committedAnnualWage * 0.18
    + club.reputation * 85_000_00
    + quality * 30_000_00;
  return nonNegativeMoney(roundMoney(amount * categoryFactor, 10_000_00));
}

function cashRequirement(
  club: Club,
  committedAnnualWage: Money,
  annualTransferBudget: Money,
  quality: number,
): Money {
  const operatingBuffer = committedAnnualWage * (1.35 + club.reputation * 0.015);
  const sportingBuffer = annualTransferBudget * 1.15 + quality * 20_000_00;
  return nonNegativeMoney(roundMoney(operatingBuffer + sportingBuffer, 10_000_00));
}

function roundMoney(value: number, precision: number): number {
  return Math.max(0, Math.round(value / precision) * precision);
}
