import type { Club } from "../entities/club.entity.ts";
import { createCompetition, type Competition } from "../entities/competition.entity.ts";
import type { Fixture } from "../entities/fixture.entity.ts";
import type { LeagueTableRow } from "../entities/league-table.entity.ts";
import type { ClubId, CompetitionId, FixtureId, SeasonId } from "../types/ids.ts";

/** One completed competition table preserved before clubs can change tier. */
export interface CompetitionSeasonHistoryEntry {
  /** Stable 1-based order across the domestic world history. */
  readonly sequenceNumber: number;
  /** Completed season. */
  readonly seasonId: SeasonId;
  /** Competition occupied by these clubs during that season. */
  readonly competitionId: CompetitionId;
  /** Immutable final table in deterministic position order. */
  readonly finalTable: readonly LeagueTableRow[];
}

/**
 * Ordered playable domestic competition registry.
 *
 * `Competition.clubIds` is the only current-membership owner. Callers derive a
 * club's current competition from this registry instead of storing a second
 * division field.
 */
export interface DomesticCompetitionWorld {
  /** Deterministic top-to-bottom competition traversal. */
  readonly competitionIds: readonly CompetitionId[];
  /** Competition lookup keyed by stable ID. */
  readonly competitions: Readonly<Record<CompetitionId, Competition>>;
  /** Ordered completed-season snapshots retained across future movement. */
  readonly seasonHistory: readonly CompetitionSeasonHistoryEntry[];
}

/** Entity lookups needed to validate one domestic registry. */
export interface DomesticCompetitionWorldReferences {
  /** Complete club lookup owned by `GameState`. */
  readonly clubs: Readonly<Record<ClubId, Club>>;
  /** Deterministic fixture traversal owned by `GameState`. */
  readonly fixtureIds: readonly FixtureId[];
  /** Complete fixture lookup owned by `GameState`. */
  readonly fixtures: Readonly<Record<FixtureId, Fixture>>;
}

/** Stable validation reasons for an invalid domestic competition world. */
export type DomesticCompetitionWorldErrorCode =
  | "duplicate_competition"
  | "competition_lookup_mismatch"
  | "member_club_not_found"
  | "duplicate_club_membership"
  | "fixture_competition_not_found"
  | "fixture_club_not_member"
  | "invalid_history_sequence"
  | "duplicate_history_sequence"
  | "history_competition_not_found"
  | "history_table_invalid";

/** Typed error raised when competition topology is internally inconsistent. */
export class DomesticCompetitionWorldError extends Error {
  /** Stable machine-readable failure reason. */
  public readonly code: DomesticCompetitionWorldErrorCode;

  /** Creates one domestic-world validation error. */
  public constructor(code: DomesticCompetitionWorldErrorCode, message: string) {
    super(message);
    this.name = "DomesticCompetitionWorldError";
    this.code = code;
  }
}

/**
 * Validates and copies an ordered domestic competition registry.
 *
 * The constructor checks current membership, fixture ownership, and historical
 * table snapshots without mutating clubs, fixtures, or any gameplay state.
 */
export function createDomesticCompetitionWorld(
  input: DomesticCompetitionWorld,
  references: DomesticCompetitionWorldReferences,
): DomesticCompetitionWorld {
  if (new Set(input.competitionIds).size !== input.competitionIds.length) {
    fail("duplicate_competition", "domestic competition order contains duplicate IDs");
  }
  if (Object.keys(input.competitions).length !== input.competitionIds.length) {
    fail("competition_lookup_mismatch", "domestic competition lookup and order differ");
  }

  const competitions: Record<CompetitionId, Competition> = {};
  const membership = new Map<ClubId, CompetitionId>();
  for (const competitionId of input.competitionIds) {
    const rawCompetition = input.competitions[competitionId];
    if (rawCompetition === undefined || rawCompetition.id !== competitionId) {
      fail("competition_lookup_mismatch", `ordered competition is missing or mismatched: ${competitionId}`);
    }
    const competition = createCompetition(rawCompetition);
    competitions[competitionId] = competition;
    for (const memberClubId of competition.clubIds) {
      if (references.clubs[memberClubId] === undefined) {
        fail("member_club_not_found", `competition member club does not exist: ${memberClubId}`);
      }
      const existing = membership.get(memberClubId);
      if (existing !== undefined) {
        fail(
          "duplicate_club_membership",
          `club belongs to both ${existing} and ${competitionId}: ${memberClubId}`,
        );
      }
      membership.set(memberClubId, competitionId);
    }
  }

  const seenSequences = new Set<number>();
  const seasonHistory = input.seasonHistory.map((entry) => {
    if (!Number.isSafeInteger(entry.sequenceNumber) || entry.sequenceNumber <= 0) {
      fail("invalid_history_sequence", `invalid competition history sequence: ${entry.sequenceNumber}`);
    }
    if (seenSequences.has(entry.sequenceNumber)) {
      fail("duplicate_history_sequence", `duplicate competition history sequence: ${entry.sequenceNumber}`);
    }
    if (competitions[entry.competitionId] === undefined) {
      fail("history_competition_not_found", `history competition does not exist: ${entry.competitionId}`);
    }
    validateFinalTable(entry.finalTable, references.clubs, entry);
    seenSequences.add(entry.sequenceNumber);
    return {
      ...entry,
      finalTable: entry.finalTable.map((row) => ({ ...row })),
    };
  });

  for (const fixtureId of references.fixtureIds) {
    const fixture = references.fixtures[fixtureId];
    if (fixture === undefined) continue;
    const competition = competitions[fixture.competitionId];
    if (competition === undefined) {
      fail("fixture_competition_not_found", `fixture competition does not exist: ${fixture.id}`);
    }
    const currentMembers = new Set(competition.clubIds);
    const historicalMembers = seasonHistory.find(
      (entry) =>
        entry.seasonId === fixture.seasonId
        && entry.competitionId === fixture.competitionId,
    )?.finalTable.map((row) => row.clubId);
    const validMembers = currentMembers.has(fixture.homeClubId)
      && currentMembers.has(fixture.awayClubId)
      || historicalMembers !== undefined
        && historicalMembers.includes(fixture.homeClubId)
        && historicalMembers.includes(fixture.awayClubId);
    if (!validMembers) {
      fail("fixture_club_not_member", `fixture clubs are not members of ${fixture.competitionId}: ${fixture.id}`);
    }
  }

  return {
    competitionIds: [...input.competitionIds],
    competitions,
    seasonHistory,
  };
}

/** Derives one club's current competition from the canonical membership order. */
export function competitionIdForClub(
  world: DomesticCompetitionWorld,
  clubId: ClubId,
): CompetitionId | undefined {
  for (const competitionId of world.competitionIds) {
    if (world.competitions[competitionId]?.clubIds.includes(clubId) === true) {
      return competitionId;
    }
  }
  return undefined;
}

function validateFinalTable(
  table: readonly LeagueTableRow[],
  clubs: Readonly<Record<ClubId, Club>>,
  entry: CompetitionSeasonHistoryEntry,
): void {
  if (table.length === 0 || new Set(table.map((row) => row.clubId)).size !== table.length) {
    fail("history_table_invalid", `competition history table is empty or duplicated: ${entry.sequenceNumber}`);
  }
  for (let index = 0; index < table.length; index += 1) {
    const row = table[index];
    if (row === undefined || row.position !== index + 1 || clubs[row.clubId] === undefined) {
      fail("history_table_invalid", `competition history table order/reference is invalid: ${entry.sequenceNumber}`);
    }
  }
}

function fail(code: DomesticCompetitionWorldErrorCode, message: string): never {
  throw new DomesticCompetitionWorldError(code, message);
}
