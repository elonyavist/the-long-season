import type { GameState } from "../state/game-state.ts";
import type { SeniorSquadState } from "./senior-squad.ts";
import type { ClubFinanceLedgerEntryId, ClubId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import {
  addMoney,
  nonNegativeMoney,
  subtractMoney,
  type CurrencyCode,
  type Money,
} from "../value-objects/money.ts";

/** Financial causes that have a concrete Phase 78 gameplay consumer. */
export type ClubFinanceLedgerReason =
  | "opening_capital"
  | "season_distribution"
  | "transfer_fee_paid"
  | "transfer_fee_received"
  | "contract_signing_bonus"
  | "annual_base_wage"
  | "appearance_bonus"
  | "goal_bonus"
  | "clean_sheet_bonus";

/** Direction of money movement relative to the club. */
export type ClubFinanceLedgerDirection = "credit" | "debit";

/** One immutable, ordered movement in a club's financial ledger. */
export interface ClubFinanceLedgerEntry {
  readonly id: ClubFinanceLedgerEntryId;
  readonly sequenceNumber: number;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
  readonly currency: CurrencyCode;
  readonly reason: ClubFinanceLedgerReason;
  readonly direction: ClubFinanceLedgerDirection;
  readonly amount: Money;
  readonly balanceAfter: Money;
  /** Stable business fact that caused the entry, used for idempotency audits. */
  readonly referenceId: string;
}

/** Current financial position and annual spending limits for one club. */
export interface ClubFinanceAccount {
  readonly clubId: ClubId;
  readonly currency: CurrencyCode;
  readonly cashBalance: Money;
  readonly annualTransferBudget: Money;
  readonly availableTransferBudget: Money;
  readonly annualWageBudget: Money;
  readonly committedAnnualWage: Money;
  readonly seasonIncome: Money;
  readonly seasonExpenses: Money;
}

/** Canonical ordered finances for every club in one career world. */
export interface ClubFinanceState {
  readonly currency: CurrencyCode;
  readonly accounts: Readonly<Record<ClubId, ClubFinanceAccount>>;
  readonly clubIds: readonly ClubId[];
  readonly ledgerEntries: Readonly<Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry>>;
  readonly ledgerEntryIds: readonly ClubFinanceLedgerEntryId[];
}

/** Input for one idempotent cash-ledger transaction. */
export type PostClubFinanceLedgerEntryInput = Omit<ClubFinanceLedgerEntry, "sequenceNumber" | "balanceAfter">;

/** Stable validation failures for club-finance contracts. */
export type ClubFinanceStateErrorCode =
  | "duplicate_finance_club"
  | "finance_account_not_found"
  | "finance_account_club_mismatch"
  | "finance_club_not_found"
  | "finance_club_missing"
  | "finance_currency_mismatch"
  | "invalid_finance_money"
  | "committed_wage_mismatch"
  | "duplicate_ledger_entry"
  | "ledger_entry_not_found"
  | "ledger_entry_mismatch"
  | "invalid_ledger_sequence"
  | "invalid_ledger_reference"
  | "ledger_balance_mismatch"
  | "insufficient_cash";

/** Error raised when financial state cannot be explained by its contracts and ledger. */
export class ClubFinanceStateError extends Error {
  public readonly code: ClubFinanceStateErrorCode;

  public constructor(code: ClubFinanceStateErrorCode, message: string) {
    super(message);
    this.name = "ClubFinanceStateError";
    this.code = code;
  }
}

// Finance rows are immutable ledger facts. Reusing canonical row objects
// avoids repeatedly cloning a growing ledger while balances, totals,
// currencies, references, and wage commitments remain fully revalidated.
const validatedFinanceAccounts = new WeakSet<ClubFinanceAccount>();
const validatedLedgerEntries = new WeakSet<ClubFinanceLedgerEntry>();
const validatedFinanceRecords = new WeakSet<object>();
const validatedFinanceOrders = new WeakSet<readonly unknown[]>();
const validatedLedgerStates = new WeakSet<ClubFinanceState>();
const openFinanceTransactionRecords = new WeakSet<object>();
const validatedFinanceStates = new WeakMap<ClubFinanceState, {
  readonly clubs: GameState["clubs"];
  readonly clubIds: GameState["clubIds"];
  readonly seniorSquadState: SeniorSquadState;
}>();

/**
 * Validates a complete finance state against world ownership and active wages.
 *
 * Account records are lookups only; `clubIds` and `ledgerEntryIds` own every
 * deterministic traversal order.
 */
export function createClubFinanceState(
  gameState: Pick<GameState, "clubs" | "clubIds">,
  seniorSquadState: SeniorSquadState,
  input: ClubFinanceState,
): ClubFinanceState {
  const previousContext = validatedFinanceStates.get(input);
  if (
    previousContext?.clubs === gameState.clubs
    && previousContext.clubIds === gameState.clubIds
    && previousContext.seniorSquadState === seniorSquadState
  ) return input;

  const accounts = validateAccounts(gameState, seniorSquadState, input);
  const ledgerEntries = validatedLedgerStates.has(input)
    ? input.ledgerEntries
    : validateLedger(input, accounts);
  if (!validatedLedgerStates.has(input)) validateAccountTotals(input, accounts, ledgerEntries);

  const result: ClubFinanceState = {
    currency: input.currency,
    accounts,
    clubIds: validatedFinanceOrder(input.clubIds),
    ledgerEntries,
    ledgerEntryIds: validatedFinanceOrder(input.ledgerEntryIds),
  };
  validatedFinanceStates.set(result, {
    clubs: gameState.clubs,
    clubIds: gameState.clubIds,
    seniorSquadState,
  });
  validatedLedgerStates.add(result);
  return result;
}

/**
 * Opens an isolated finance transaction for a multi-operation engine use case.
 *
 * The returned state owns copied records, so transaction-scoped updates never
 * mutate the caller's snapshot. Posting and account replacement can then reuse
 * those records until `commitClubFinanceTransaction` closes the boundary.
 */
export function beginClubFinanceTransaction(state: ClubFinanceState): ClubFinanceState {
  if (isOpenFinanceTransaction(state)) return state;

  const accounts: Record<ClubId, ClubFinanceAccount> = { ...state.accounts };
  const ledgerEntries: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = {
    ...state.ledgerEntries,
  };
  const ledgerEntryIds = [...state.ledgerEntryIds];
  const result: ClubFinanceState = {
    ...state,
    accounts,
    ledgerEntries,
    ledgerEntryIds,
  };

  openFinanceTransactionRecords.add(accounts);
  openFinanceTransactionRecords.add(ledgerEntries);
  openFinanceTransactionRecords.add(ledgerEntryIds);
  validatedFinanceRecords.add(accounts);
  validatedFinanceRecords.add(ledgerEntries);
  validatedFinanceOrders.add(ledgerEntryIds);
  if (validatedLedgerStates.has(state)) validatedLedgerStates.add(result);
  const previousContext = validatedFinanceStates.get(state);
  if (previousContext !== undefined) validatedFinanceStates.set(result, previousContext);
  return result;
}

/** Closes a transaction so later updates return to normal immutable copying. */
export function commitClubFinanceTransaction(state: ClubFinanceState): ClubFinanceState {
  openFinanceTransactionRecords.delete(state.accounts);
  openFinanceTransactionRecords.delete(state.ledgerEntries);
  openFinanceTransactionRecords.delete(state.ledgerEntryIds);
  return state;
}

/** Finds one club account without deriving order from a record. */
export function findClubFinanceAccount(
  state: ClubFinanceState,
  clubId: ClubId,
): ClubFinanceAccount | undefined {
  return state.clubIds.includes(clubId) ? state.accounts[clubId] : undefined;
}

/** Returns the annual wage headroom derived from one validated account. */
export function remainingAnnualWageBudget(account: ClubFinanceAccount): Money {
  return subtractMoney(account.annualWageBudget, account.committedAnnualWage);
}

/** Replaces one existing account while preserving canonical traversal order. */
export function replaceClubFinanceAccount(
  state: ClubFinanceState,
  account: ClubFinanceAccount,
): ClubFinanceState {
  return replaceClubFinanceAccounts(state, [account]);
}

/**
 * Replaces an ordered group of club accounts in one atomic state change.
 *
 * Repeated club IDs behave like sequential replacements, while the complete
 * account record is cloned only once. Invalid input never exposes a partial
 * finance state.
 */
export function replaceClubFinanceAccounts(
  state: ClubFinanceState,
  replacements: readonly ClubFinanceAccount[],
): ClubFinanceState {
  if (replacements.length === 0) return state;

  const projectedAccounts = new Map<ClubId, ClubFinanceAccount>();
  const canonicalAccounts: ClubFinanceAccount[] = [];
  let preservesLedgerValidation = validatedLedgerStates.has(state);
  const previousContext = validatedFinanceStates.get(state);
  let preservesFinanceContext = previousContext !== undefined;

  for (const account of replacements) {
    const current = projectedAccounts.get(account.clubId) ?? state.accounts[account.clubId];
    if (current === undefined) fail("finance_account_not_found", `finance account not found: ${account.clubId}`);
    validateAccountMoney(account);
    if (account.currency !== state.currency) {
      fail("finance_currency_mismatch", `finance account currency mismatch: ${account.clubId}`);
    }
    const canonicalAccount = { ...account };
    projectedAccounts.set(account.clubId, canonicalAccount);
    canonicalAccounts.push(canonicalAccount);
    if (
      account.cashBalance !== current.cashBalance
      || account.seasonIncome !== current.seasonIncome
      || account.seasonExpenses !== current.seasonExpenses
    ) {
      preservesLedgerValidation = false;
    }
    if (account.committedAnnualWage !== current.committedAnnualWage) {
      preservesFinanceContext = false;
    }
  }

  const accounts: Record<ClubId, ClubFinanceAccount> = isOpenFinanceTransaction(state)
    ? state.accounts as Record<ClubId, ClubFinanceAccount>
    : { ...state.accounts };
  for (const [clubId, account] of projectedAccounts) accounts[clubId] = account;

  const result: ClubFinanceState = {
    ...state,
    accounts,
  };
  for (const account of canonicalAccounts) validatedFinanceAccounts.add(account);
  validatedFinanceRecords.add(accounts);
  if (preservesLedgerValidation) validatedLedgerStates.add(result);
  if (preservesFinanceContext && previousContext !== undefined) validatedFinanceStates.set(result, previousContext);
  return result;
}

/**
 * Posts one cash movement exactly once and updates the account season totals.
 *
 * Replaying the same ID and facts is a no-op. Reusing an ID for different
 * facts is rejected so retries cannot silently corrupt a career.
 */
export function postClubFinanceLedgerEntry(
  state: ClubFinanceState,
  input: PostClubFinanceLedgerEntryInput,
): ClubFinanceState {
  return postClubFinanceLedgerEntries(state, [input]);
}

/**
 * Posts ordered ledger facts in one atomic transaction.
 *
 * Balance and sequence calculations observe preceding items in the batch, so
 * the result is identical to sequential posting without repeatedly copying a
 * growing ledger.
 */
export function postClubFinanceLedgerEntries(
  state: ClubFinanceState,
  inputs: readonly PostClubFinanceLedgerEntryInput[],
): ClubFinanceState {
  if (inputs.length === 0) return state;

  const projectedAccounts = new Map<ClubId, ClubFinanceAccount>();
  const projectedEntries = new Map<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry>();
  const addedEntries: ClubFinanceLedgerEntry[] = [];

  for (const input of inputs) {
    const existing = projectedEntries.get(input.id) ?? state.ledgerEntries[input.id];
    if (existing !== undefined) {
      if (samePostedEntry(existing, input)) continue;
      fail("ledger_entry_mismatch", `ledger entry ID reused for different facts: ${input.id}`);
    }

    const account = projectedAccounts.get(input.clubId) ?? state.accounts[input.clubId];
    if (account === undefined) fail("finance_account_not_found", `finance account not found: ${input.clubId}`);
    if (input.currency !== state.currency || input.currency !== account.currency) {
      fail("finance_currency_mismatch", `ledger currency mismatch: ${input.id}`);
    }
    validateMoney(input.amount);
    if (input.referenceId.trim().length === 0) {
      fail("invalid_ledger_reference", `ledger reference must not be empty: ${input.id}`);
    }
    if (input.direction === "debit" && account.cashBalance < input.amount) {
      fail("insufficient_cash", `club ${input.clubId} cannot fund ledger entry ${input.id}`);
    }

    const cashBalance = input.direction === "credit"
      ? addMoney(account.cashBalance, input.amount)
      : subtractMoney(account.cashBalance, input.amount);
    const availableTransferBudget = account.availableTransferBudget > cashBalance
      ? cashBalance
      : account.availableTransferBudget;
    const seasonIncome = isSeasonIncome(input.reason)
      ? addMoney(account.seasonIncome, input.amount)
      : account.seasonIncome;
    const seasonExpenses = input.direction === "debit"
      ? addMoney(account.seasonExpenses, input.amount)
      : account.seasonExpenses;
    const entry: ClubFinanceLedgerEntry = {
      ...input,
      sequenceNumber: state.ledgerEntryIds.length + addedEntries.length + 1,
      balanceAfter: cashBalance,
    };
    const nextAccount: ClubFinanceAccount = {
      ...account,
      cashBalance,
      availableTransferBudget,
      seasonIncome,
      seasonExpenses,
    };
    projectedAccounts.set(account.clubId, nextAccount);
    projectedEntries.set(entry.id, entry);
    addedEntries.push(entry);
  }

  if (addedEntries.length === 0) return state;

  const transactional = isOpenFinanceTransaction(state);
  const accounts: Record<ClubId, ClubFinanceAccount> = transactional
    ? state.accounts as Record<ClubId, ClubFinanceAccount>
    : { ...state.accounts };
  const ledgerEntries: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = transactional
    ? state.ledgerEntries as Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry>
    : { ...state.ledgerEntries };
  const ledgerEntryIds: ClubFinanceLedgerEntryId[] = transactional
    ? state.ledgerEntryIds as ClubFinanceLedgerEntryId[]
    : [...state.ledgerEntryIds];
  for (const [clubId, account] of projectedAccounts) accounts[clubId] = account;
  for (const entry of addedEntries) {
    ledgerEntries[entry.id] = entry;
    ledgerEntryIds.push(entry.id);
  }

  const result: ClubFinanceState = {
    ...state,
    accounts,
    ledgerEntries,
    ledgerEntryIds,
  };
  if (validatedLedgerStates.has(state)) {
    for (const account of projectedAccounts.values()) validatedFinanceAccounts.add(account);
    for (const entry of addedEntries) validatedLedgerEntries.add(entry);
    validatedFinanceRecords.add(accounts);
    validatedFinanceRecords.add(ledgerEntries);
    validatedFinanceOrders.add(ledgerEntryIds);
    validatedLedgerStates.add(result);
  }
  const previousContext = validatedFinanceStates.get(state);
  if (previousContext !== undefined) validatedFinanceStates.set(result, previousContext);
  return result;
}

function isOpenFinanceTransaction(state: ClubFinanceState): boolean {
  return openFinanceTransactionRecords.has(state.accounts)
    && openFinanceTransactionRecords.has(state.ledgerEntries)
    && openFinanceTransactionRecords.has(state.ledgerEntryIds);
}

function validateAccounts(
  gameState: Pick<GameState, "clubs" | "clubIds">,
  seniorSquadState: SeniorSquadState,
  input: ClubFinanceState,
): Record<ClubId, ClubFinanceAccount> {
  const reuseRecord = validatedFinanceRecords.has(input.accounts);
  const result: Record<ClubId, ClubFinanceAccount> = reuseRecord
    ? input.accounts as Record<ClubId, ClubFinanceAccount>
    : {};
  const seen = new Set<ClubId>();
  const committedWages = committedWagesByClub(seniorSquadState);
  for (const clubId of input.clubIds) {
    if (seen.has(clubId)) fail("duplicate_finance_club", `duplicate finance club: ${clubId}`);
    if (gameState.clubs[clubId] === undefined) fail("finance_club_not_found", `finance club not found: ${clubId}`);
    const account = input.accounts[clubId];
    if (account === undefined) fail("finance_account_not_found", `finance account not found: ${clubId}`);
    if (account.clubId !== clubId) fail("finance_account_club_mismatch", `finance account club mismatch: ${clubId}`);
    if (account.currency !== input.currency) fail("finance_currency_mismatch", `finance account currency mismatch: ${clubId}`);
    if (!validatedFinanceAccounts.has(account)) validateAccountMoney(account);
    const committedAnnualWage = committedWages.get(clubId) ?? nonNegativeMoney(0);
    if (account.committedAnnualWage !== committedAnnualWage) {
      fail("committed_wage_mismatch", `committed annual wage mismatch for ${clubId}`);
    }
    seen.add(clubId);
    if (!reuseRecord) {
      const canonical = validatedFinanceAccounts.has(account) ? account : { ...account };
      validatedFinanceAccounts.add(canonical);
      result[clubId] = canonical;
    }
  }
  for (const clubId of gameState.clubIds) {
    if (!seen.has(clubId)) fail("finance_club_missing", `world club has no finance account: ${clubId}`);
  }
  validatedFinanceRecords.add(result);
  return result;
}

function validateLedger(
  state: ClubFinanceState,
  accounts: Readonly<Record<ClubId, ClubFinanceAccount>>,
): Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> {
  const reuseRecord = validatedFinanceRecords.has(state.ledgerEntries);
  const result: Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry> = reuseRecord
    ? state.ledgerEntries as Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry>
    : {};
  const seen = new Set<ClubFinanceLedgerEntryId>();
  const balances = new Map<ClubId, Money>();
  for (let index = 0; index < state.ledgerEntryIds.length; index += 1) {
    const id = state.ledgerEntryIds[index];
    if (id === undefined) continue;
    if (seen.has(id)) fail("duplicate_ledger_entry", `duplicate ledger entry: ${id}`);
    const entry = state.ledgerEntries[id];
    if (entry === undefined || entry.id !== id) fail("ledger_entry_not_found", `ledger entry not found: ${id}`);
    if (entry.sequenceNumber !== index + 1) fail("invalid_ledger_sequence", `invalid ledger sequence: ${id}`);
    const account = accounts[entry.clubId];
    if (account === undefined) fail("finance_account_not_found", `ledger club has no finance account: ${entry.clubId}`);
    if (entry.currency !== state.currency || entry.currency !== account.currency) {
      fail("finance_currency_mismatch", `ledger currency mismatch: ${id}`);
    }
    if (!validatedLedgerEntries.has(entry)) {
      validateMoney(entry.amount);
      if (entry.referenceId.trim().length === 0) fail("invalid_ledger_reference", `ledger reference must not be empty: ${id}`);
    }
    const previousBalance = balances.get(entry.clubId) ?? nonNegativeMoney(0);
    if (entry.direction === "debit" && previousBalance < entry.amount) {
      fail("insufficient_cash", `ledger debit cannot be funded: ${id}`);
    }
    const expectedBalance = entry.direction === "credit"
      ? addMoney(previousBalance, entry.amount)
      : subtractMoney(previousBalance, entry.amount);
    if (entry.balanceAfter !== expectedBalance) fail("ledger_balance_mismatch", `ledger balance mismatch: ${id}`);
    balances.set(entry.clubId, expectedBalance);
    seen.add(id);
    if (!reuseRecord) {
      const canonical = validatedLedgerEntries.has(entry) ? entry : { ...entry };
      validatedLedgerEntries.add(canonical);
      result[id] = canonical;
    }
  }
  validatedFinanceRecords.add(result);
  return result;
}

function validatedFinanceOrder<T>(input: readonly T[]): readonly T[] {
  if (validatedFinanceOrders.has(input)) return input;
  const result = [...input];
  validatedFinanceOrders.add(result);
  return result;
}

function validateAccountTotals(
  state: ClubFinanceState,
  accounts: Readonly<Record<ClubId, ClubFinanceAccount>>,
  entries: Readonly<Record<ClubFinanceLedgerEntryId, ClubFinanceLedgerEntry>>,
): void {
  const balances = new Map<ClubId, Money>();
  const incomes = new Map<ClubId, Money>();
  const expenses = new Map<ClubId, Money>();
  for (const id of state.ledgerEntryIds) {
    const entry = entries[id];
    if (entry === undefined) continue;
    balances.set(entry.clubId, entry.balanceAfter);
    if (isSeasonIncome(entry.reason)) {
      incomes.set(entry.clubId, addMoney(incomes.get(entry.clubId) ?? nonNegativeMoney(0), entry.amount));
    }
    if (entry.direction === "debit") {
      expenses.set(entry.clubId, addMoney(expenses.get(entry.clubId) ?? nonNegativeMoney(0), entry.amount));
    }
  }

  for (const clubId of state.clubIds) {
    const account = accounts[clubId];
    if (account === undefined) continue;
    const balance = balances.get(clubId) ?? nonNegativeMoney(0);
    const income = incomes.get(clubId) ?? nonNegativeMoney(0);
    const expense = expenses.get(clubId) ?? nonNegativeMoney(0);
    if (account.cashBalance !== balance || account.seasonIncome !== income || account.seasonExpenses !== expense) {
      fail("ledger_balance_mismatch", `finance account totals do not match ledger: ${clubId}`);
    }
  }
}

function committedWagesByClub(state: SeniorSquadState): ReadonlyMap<ClubId, Money> {
  const totals = new Map<ClubId, Money>();
  for (const id of state.activeContractIds) {
    const contract = state.contracts[id];
    if (contract !== undefined) {
      totals.set(
        contract.clubId,
        addMoney(totals.get(contract.clubId) ?? nonNegativeMoney(0), contract.annualWage),
      );
    }
  }
  return totals;
}

function validateAccountMoney(account: ClubFinanceAccount): void {
  validateMoney(account.cashBalance);
  validateMoney(account.annualTransferBudget);
  validateMoney(account.availableTransferBudget);
  validateMoney(account.annualWageBudget);
  validateMoney(account.committedAnnualWage);
  validateMoney(account.seasonIncome);
  validateMoney(account.seasonExpenses);
  if (account.availableTransferBudget > account.cashBalance) {
    fail("invalid_finance_money", `available transfer budget exceeds cash for ${account.clubId}`);
  }
  if (account.committedAnnualWage > account.annualWageBudget) {
    fail("invalid_finance_money", `committed wages exceed wage budget for ${account.clubId}`);
  }
}

function validateMoney(value: Money): void {
  try {
    nonNegativeMoney(value);
  } catch {
    fail("invalid_finance_money", `invalid non-negative finance amount: ${value}`);
  }
}

function isSeasonIncome(reason: ClubFinanceLedgerReason): boolean {
  return reason === "season_distribution" || reason === "transfer_fee_received";
}

function samePostedEntry(entry: ClubFinanceLedgerEntry, input: PostClubFinanceLedgerEntryInput): boolean {
  return entry.clubId === input.clubId
    && entry.occurredOn === input.occurredOn
    && entry.currency === input.currency
    && entry.reason === input.reason
    && entry.direction === input.direction
    && entry.amount === input.amount
    && entry.referenceId === input.referenceId;
}

function fail(code: ClubFinanceStateErrorCode, message: string): never {
  throw new ClubFinanceStateError(code, message);
}
