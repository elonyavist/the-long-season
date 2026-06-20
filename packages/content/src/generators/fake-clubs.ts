import { clubId, playerId, type Club, type ClubId, type PlayerId } from "@game/domain";

/** Number of fake clubs in the first deterministic demo league. */
export const FAKE_CLUB_COUNT = 18;

/** Number of generated senior players per fake club, including reserves. */
export const FAKE_PLAYERS_PER_CLUB = 22;

/** Number of players selected by the default fixed fake lineup. */
export const FAKE_LINEUP_SIZE = 11;

/**
 * Generated fake club collection for the first CLI milestone.
 */
export interface FakeClubs {
  /** Clubs in deterministic display order. */
  readonly clubs: readonly Club[];
  /** Explicit deterministic club ID order. */
  readonly clubIds: readonly ClubId[];
  /** Club lookup by ID. */
  readonly clubsById: Readonly<Record<ClubId, Club>>;
}

/**
 * Generates a fictional 18-team third-division league.
 *
 * @example
 * const clubs = generateFakeClubs();
 */
export function generateFakeClubs(): FakeClubs {
  const clubs: Club[] = [];
  const clubIds: ClubId[] = [];
  const clubsById: Record<ClubId, Club> = {};

  for (let clubNumber = 1; clubNumber <= FAKE_CLUB_COUNT; clubNumber += 1) {
    const id = fakeClubId(clubNumber);
    const club: Club = {
      id,
      name: `Province ${String(clubNumber).padStart(2, "0")}`,
      shortName: `PRO${String(clubNumber).padStart(2, "0")}`,
      category: "third_division",
      reputation: 4 + ((clubNumber - 1) % 6),
      playerIds: fakeClubPlayerIds(clubNumber),
    };

    clubs.push(club);
    clubIds.push(id);
    clubsById[id] = club;
  }

  return {
    clubs,
    clubIds,
    clubsById,
  };
}

/**
 * Builds one fake club ID from its one-based generated number.
 */
export function fakeClubId(clubNumber: number): ClubId {
  return clubId(`club:province-${String(clubNumber).padStart(2, "0")}`);
}

/**
 * Builds one fake player ID from one-based club and slot numbers.
 */
export function fakePlayerId(clubNumber: number, slotNumber: number): PlayerId {
  return playerId(
    `player:province-${String(clubNumber).padStart(2, "0")}-${String(slotNumber).padStart(2, "0")}`,
  );
}

/**
 * Builds the deterministic first-team player ID order for one fake club.
 */
function fakeClubPlayerIds(clubNumber: number): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];

  for (let slotNumber = 1; slotNumber <= FAKE_PLAYERS_PER_CLUB; slotNumber += 1) {
    playerIds.push(fakePlayerId(clubNumber, slotNumber));
  }

  return playerIds;
}
