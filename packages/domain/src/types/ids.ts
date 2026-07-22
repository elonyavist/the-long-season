import { brand, type Brand } from "./brand.ts";

/**
 * Stable domain identifiers.
 *
 * All IDs are strings at runtime, but each one has a different TypeScript brand.
 * This makes it hard to accidentally pass a `ClubId` where a `PlayerId` is
 * expected.
 *
 * @example
 * const player = playerId("player:000001");
 * const club = clubId("club:perugia");
 *
 * // TypeScript rejects this:
 * // const wrong: PlayerId = club;
 */
export type PlayerId = Brand<string, "PlayerId">;
export type ClubId = Brand<string, "ClubId">;
export type CompetitionId = Brand<string, "CompetitionId">;
export type FixtureId = Brand<string, "FixtureId">;
export type SeasonId = Brand<string, "SeasonId">;
export type SaveId = Brand<string, "SaveId">;
/** Stable identifier for one senior-squad registration. */
export type SeniorSquadRegistrationId = Brand<string, "SeniorSquadRegistrationId">;
/** Stable identifier for one immutable player contract agreement. */
export type PlayerContractId = Brand<string, "PlayerContractId">;
/** Stable identifier for one ordered factual contract-history entry. */
export type PlayerContractHistoryEntryId = Brand<string, "PlayerContractHistoryEntryId">;
/** Stable identifier for one immutable club-finance ledger entry. */
export type ClubFinanceLedgerEntryId = Brand<string, "ClubFinanceLedgerEntryId">;

/**
 * Matches strings that JavaScript treats as integer-like object keys.
 *
 * Integer-like keys are enumerated before normal string keys, which can create
 * subtle determinism bugs if simulation code ever relies on object key order.
 */
const INTEGER_LIKE_ID = /^(0|[1-9][0-9]*)$/;

/**
 * Validates the complete runtime rules for namespaced domain IDs.
 *
 * IDs use a common `type:value` namespace convention. They may be semantic
 * strings from content (`club:perugia`) or deterministic generated strings
 * (`player:000123`, `fixture:000001`), but they must never be empty or
 * integer-like (`"1"`, `"42"`).
 *
 * @example
 * namespacedId("club:perugia", "club:"); // ok
 * namespacedId("player:000001", "player:"); // ok
 * namespacedId("123", "player:"); // throws
 * namespacedId("", "player:"); // throws
 * namespacedId("perugia", "club:"); // throws
 */
function namespacedId(value: string, prefix: string): string {
  if (value.length === 0) {
    throw new Error("ID must not be empty");
  }

  if (INTEGER_LIKE_ID.test(value)) {
    throw new Error(`ID must not be integer-like: ${value}`);
  }

  if (!value.startsWith(prefix)) {
    throw new Error(`ID must start with "${prefix}": ${value}`);
  }

  if (value.length === prefix.length) {
    throw new Error(`ID must include a value after "${prefix}": ${value}`);
  }

  return value;
}

/**
 * Builds a validated player ID.
 *
 * @example
 * const id = playerId("player:000001");
 */
export function playerId(value: string): PlayerId {
  return brand<string, "PlayerId">(namespacedId(value, "player:"));
}

/**
 * Builds a validated club ID.
 *
 * @example
 * const id = clubId("club:perugia");
 */
export function clubId(value: string): ClubId {
  return brand<string, "ClubId">(namespacedId(value, "club:"));
}

/**
 * Builds a validated competition ID.
 *
 * @example
 * const id = competitionId("competition:ita-3");
 */
export function competitionId(value: string): CompetitionId {
  return brand<string, "CompetitionId">(namespacedId(value, "competition:"));
}

/**
 * Builds a validated fixture ID.
 *
 * @example
 * const id = fixtureId("fixture:000001");
 */
export function fixtureId(value: string): FixtureId {
  return brand<string, "FixtureId">(namespacedId(value, "fixture:"));
}

/**
 * Builds a validated season ID.
 *
 * @example
 * const id = seasonId("season:2026");
 */
export function seasonId(value: string): SeasonId {
  return brand<string, "SeasonId">(namespacedId(value, "season:"));
}

/**
 * Builds a validated save ID.
 *
 * @example
 * const id = saveId("save:demo-001");
 */
export function saveId(value: string): SaveId {
  return brand<string, "SaveId">(namespacedId(value, "save:"));
}

/** Builds a validated senior-squad registration ID. */
export function seniorSquadRegistrationId(value: string): SeniorSquadRegistrationId {
  return brand<string, "SeniorSquadRegistrationId">(namespacedId(value, "registration:"));
}

/** Builds a validated player-contract ID. */
export function playerContractId(value: string): PlayerContractId {
  return brand<string, "PlayerContractId">(namespacedId(value, "contract:"));
}

/** Builds a validated player contract-history entry ID. */
export function playerContractHistoryEntryId(value: string): PlayerContractHistoryEntryId {
  return brand<string, "PlayerContractHistoryEntryId">(namespacedId(value, "contract-history:"));
}

/** Builds a validated club-finance ledger entry ID. */
export function clubFinanceLedgerEntryId(value: string): ClubFinanceLedgerEntryId {
  return brand<string, "ClubFinanceLedgerEntryId">(namespacedId(value, "finance-ledger:"));
}
