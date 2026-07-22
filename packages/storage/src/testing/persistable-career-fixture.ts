import {
  addMoney,
  clubFinanceLedgerEntryId,
  createCareerState,
  createClubFinanceState,
  createSeniorSquadState,
  gameDate,
  nonNegativeMoney,
  playerContractHistoryEntryId,
  playerContractId,
  seniorSquadRegistrationId,
  type CareerState,
  type ClubFinanceAccount,
  type ClubFinanceLedgerEntry,
  type ClubFinanceLedgerEntryId,
  type ClubId,
  type Money,
  type PlayerContract,
  type PlayerContractHistoryEntry,
  type PlayerContractHistoryEntryId,
  type PlayerContractId,
  type SeniorSquadRegistration,
  type SeniorSquadRegistrationId,
} from "@game/domain";

/**
 * Adds the complete Phase 78 persistence facts to a compact career fixture.
 *
 * Storage tests use this helper so every durable snapshot crosses the same
 * registration, contract, ledger, and account validation as a generated world.
 */
export function withPersistableCareerFacts(input: CareerState): CareerState {
  const registrations: Record<SeniorSquadRegistrationId, SeniorSquadRegistration> = {};
  const registrationIds: SeniorSquadRegistrationId[] = [];
  const contracts: Record<PlayerContractId, PlayerContract> = {};
  const contractIds: PlayerContractId[] = [];
  const contractHistory: Record<PlayerContractHistoryEntryId, PlayerContractHistoryEntry> = {};
  const contractHistoryEntryIds: PlayerContractHistoryEntryId[] = [];
  const referenceDate = input.gameState.calendar.currentDate;

  for (const clubId of input.gameState.clubIds) {
    const club = input.gameState.clubs[clubId];
    if (club === undefined) continue;

    for (let index = 0; index < club.playerIds.length; index += 1) {
      const playerId = club.playerIds[index];
      if (playerId === undefined) continue;
      const registrationId = seniorSquadRegistrationId(`registration:${playerId}`);
      const contractId = playerContractId(`contract:${playerId}:initial`);
      const historyId = playerContractHistoryEntryId(`contract-history:${playerId}:initial`);
      const annualWage = nonNegativeMoney(100_000_00 + index * 10_000_00);

      registrations[registrationId] = {
        id: registrationId,
        playerId,
        clubId,
        shirtNumber: index + 1,
        registeredOn: referenceDate,
      };
      registrationIds.push(registrationId);
      contracts[contractId] = {
        id: contractId,
        playerId,
        clubId,
        type: "professional",
        startsOn: gameDate(referenceDate - 365),
        endsOn: gameDate(referenceDate + 365),
        annualWage,
        squadStatus: "squad_player",
        bonuses: {
          signingBonus: nonNegativeMoney(0),
          appearanceBonus: nonNegativeMoney(0),
        },
      };
      contractIds.push(contractId);
      contractHistory[historyId] = {
        id: historyId,
        sequenceNumber: contractHistoryEntryIds.length + 1,
        occurredOn: referenceDate,
        event: "signed",
        contractId,
        playerId,
        clubId,
      };
      contractHistoryEntryIds.push(historyId);
    }
  }

  const seniorSquadState = createSeniorSquadState(input.gameState, {
    registrations,
    registrationIds,
    contracts,
    contractIds,
    activeContractIds: [...contractIds],
    contractHistory,
    contractHistoryEntryIds,
  });
  const accounts: Record<ClubId, ClubFinanceAccount> = {};
  const ledgerEntries: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = {};
  const ledgerEntryIds: ClubFinanceLedgerEntryId[] = [];

  for (const clubId of input.gameState.clubIds) {
    const committedAnnualWage = committedWageForClub(seniorSquadState.contracts, contractIds, clubId);
    const cashBalance = nonNegativeMoney(10_000_000_00 + committedAnnualWage);
    const transferBudget = nonNegativeMoney(2_000_000_00);
    accounts[clubId] = {
      clubId,
      currency: "EUR",
      cashBalance,
      annualTransferBudget: transferBudget,
      availableTransferBudget: transferBudget,
      annualWageBudget: nonNegativeMoney(committedAnnualWage + 1_000_000_00),
      committedAnnualWage,
      seasonIncome: nonNegativeMoney(0),
      seasonExpenses: nonNegativeMoney(0),
    };
    const ledgerId = clubFinanceLedgerEntryId(`finance-ledger:opening:${clubId}`);
    ledgerEntries[ledgerId] = {
      id: ledgerId,
      sequenceNumber: ledgerEntryIds.length + 1,
      clubId,
      occurredOn: referenceDate,
      currency: "EUR",
      reason: "opening_capital",
      direction: "credit",
      amount: cashBalance,
      balanceAfter: cashBalance,
      referenceId: `storage-test:${clubId}`,
    };
    ledgerEntryIds.push(ledgerId);
  }

  const clubFinanceState = createClubFinanceState(input.gameState, seniorSquadState, {
    currency: "EUR",
    accounts,
    clubIds: [...input.gameState.clubIds],
    ledgerEntries,
    ledgerEntryIds,
  });

  return createCareerState({ ...input, seniorSquadState, clubFinanceState });
}

function committedWageForClub(
  contracts: Readonly<Record<PlayerContractId, PlayerContract>>,
  contractIds: readonly PlayerContractId[],
  clubId: ClubId,
): Money {
  let total = nonNegativeMoney(0);
  for (const contractId of contractIds) {
    const contract = contracts[contractId];
    if (contract?.clubId === clubId) total = addMoney(total, contract.annualWage);
  }
  return total;
}
