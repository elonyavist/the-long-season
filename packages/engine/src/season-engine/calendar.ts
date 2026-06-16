import {
  fixtureId,
  gameDate,
  type ClubId,
  type CompetitionId,
  type Fixture,
  type FixtureId,
  type GameDate,
  type Round,
  type SeasonId,
} from "@game/domain";
import { addDays, deriveRng, type Rng } from "@game/shared";

/**
 * Input for deterministic double round-robin calendar generation.
 */
export interface GenerateRoundRobinCalendarInput {
  /** Run seed used to derive the schedule RNG stream. */
  readonly seed: string;
  /** Season identity used as a schedule RNG key part. */
  readonly seasonId: SeasonId;
  /** Competition identity used as a schedule RNG key part. */
  readonly competitionId: CompetitionId;
  /** Explicit ordered participant IDs before deterministic shuffling. */
  readonly clubIds: readonly ClubId[];
  /** First round date as epoch-day game time. */
  readonly seasonStartDate: GameDate;
}

/**
 * Deterministic generated calendar.
 */
export interface RoundRobinCalendar {
  /** Season identity used for all fixtures. */
  readonly seasonId: SeasonId;
  /** Competition identity used for all fixtures. */
  readonly competitionId: CompetitionId;
  /** Ordered rounds. */
  readonly rounds: readonly Round[];
  /** Ordered fixture IDs across the whole calendar. */
  readonly fixtureIds: readonly FixtureId[];
  /** Ordered fixtures across the whole calendar. */
  readonly fixtures: readonly Fixture[];
}

/** Error categories exposed by calendar generation. */
export type CalendarGenerationErrorCode = "invalid_club_count" | "duplicate_club";

/**
 * Typed error thrown when a calendar cannot be generated from the input.
 */
export class CalendarGenerationError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: CalendarGenerationErrorCode;

  /**
   * Creates a calendar-generation error.
   */
  public constructor(code: CalendarGenerationErrorCode, message: string) {
    super(message);
    this.name = "CalendarGenerationError";
    this.code = code;
  }
}

/**
 * Generates a deterministic double round-robin calendar.
 *
 * @example
 * const calendar = generateRoundRobinCalendar(input);
 */
export function generateRoundRobinCalendar(input: GenerateRoundRobinCalendarInput): RoundRobinCalendar {
  assertValidClubIds(input.clubIds);

  const rng = deriveRng(input.seed, "schedule", input.seasonId, input.competitionId);
  const shuffledClubIds = shuffleClubIds(input.clubIds, rng);
  const firstHalfRounds = buildFirstHalfRounds(shuffledClubIds);
  const allRoundPairs = [...firstHalfRounds, ...mirrorRoundPairs(firstHalfRounds)];
  const fixtures: Fixture[] = [];
  const rounds: Round[] = [];
  let nextFixtureNumber = 1;

  for (let roundIndex = 0; roundIndex < allRoundPairs.length; roundIndex += 1) {
    const roundNumber = roundIndex + 1;
    const date = gameDate(addDays(input.seasonStartDate, roundIndex * 7));
    const roundFixtureIds: FixtureId[] = [];
    const pairings = allRoundPairs[roundIndex];

    if (pairings === undefined) {
      throw new CalendarGenerationError("invalid_club_count", `Missing round pairings for round ${roundNumber}`);
    }

    for (const pairing of pairings) {
      const id = nextFixtureId(nextFixtureNumber);
      nextFixtureNumber += 1;
      roundFixtureIds.push(id);
      fixtures.push({
        id,
        competitionId: input.competitionId,
        seasonId: input.seasonId,
        roundNumber,
        date,
        homeClubId: pairing.homeClubId,
        awayClubId: pairing.awayClubId,
      });
    }

    rounds.push({
      roundNumber,
      date,
      fixtureIds: roundFixtureIds,
    });
  }

  return {
    seasonId: input.seasonId,
    competitionId: input.competitionId,
    rounds,
    fixtureIds: fixtures.map((fixture) => fixture.id),
    fixtures,
  };
}

/**
 * Validates participant count and uniqueness.
 */
function assertValidClubIds(clubIds: readonly ClubId[]): void {
  if (clubIds.length < 2 || clubIds.length % 2 !== 0) {
    throw new CalendarGenerationError(
      "invalid_club_count",
      `Double round-robin generation requires an even club count of at least 2: ${clubIds.length}`,
    );
  }

  for (let index = 0; index < clubIds.length; index += 1) {
    const current = clubIds[index];
    for (let compareIndex = index + 1; compareIndex < clubIds.length; compareIndex += 1) {
      if (current === clubIds[compareIndex]) {
        throw new CalendarGenerationError("duplicate_club", `Duplicate club in calendar input: ${String(current)}`);
      }
    }
  }
}

/**
 * Deterministically shuffles club IDs with Fisher-Yates.
 */
function shuffleClubIds(clubIds: readonly ClubId[], rng: Rng): ClubId[] {
  const shuffled = [...clubIds];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = rng.nextInt(0, index + 1);
    const current = shuffled[index];
    const swap = shuffled[swapIndex];

    if (current === undefined || swap === undefined) {
      throw new CalendarGenerationError("invalid_club_count", "Calendar shuffle encountered a missing club");
    }

    shuffled[index] = swap;
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

/**
 * Builds first-half Berger pairings through the circle method.
 */
function buildFirstHalfRounds(clubIds: readonly ClubId[]): Pairing[][] {
  let rotation = [...clubIds];
  const roundCount = clubIds.length - 1;
  const pairingsPerRound = clubIds.length / 2;
  const rounds: Pairing[][] = [];

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const roundPairings: Pairing[] = [];

    for (let pairIndex = 0; pairIndex < pairingsPerRound; pairIndex += 1) {
      const firstClubId = rotation[pairIndex];
      const secondClubId = rotation[rotation.length - 1 - pairIndex];

      if (firstClubId === undefined || secondClubId === undefined) {
        throw new CalendarGenerationError("invalid_club_count", "Calendar rotation encountered a missing club");
      }

      roundPairings.push(
        roundIndex % 2 === 0
          ? { homeClubId: firstClubId, awayClubId: secondClubId }
          : { homeClubId: secondClubId, awayClubId: firstClubId },
      );
    }

    rounds.push(roundPairings);
    rotation = rotateClubIds(rotation);
  }

  return rounds;
}

/**
 * Mirrors first-half fixtures by inverting home and away sides.
 */
function mirrorRoundPairs(firstHalfRounds: readonly (readonly Pairing[])[]): Pairing[][] {
  const mirrored: Pairing[][] = [];

  for (const round of firstHalfRounds) {
    const mirroredRound: Pairing[] = [];

    for (const pairing of round) {
      mirroredRound.push({
        homeClubId: pairing.awayClubId,
        awayClubId: pairing.homeClubId,
      });
    }

    mirrored.push(mirroredRound);
  }

  return mirrored;
}

/**
 * Rotates club IDs for the next Berger round while keeping the first slot fixed.
 */
function rotateClubIds(clubIds: readonly ClubId[]): ClubId[] {
  const firstClubId = clubIds[0];
  const lastClubId = clubIds[clubIds.length - 1];

  if (firstClubId === undefined || lastClubId === undefined) {
    throw new CalendarGenerationError("invalid_club_count", "Calendar rotation requires at least two clubs");
  }

  const rotated: ClubId[] = [firstClubId, lastClubId];

  for (let index = 1; index < clubIds.length - 1; index += 1) {
    const clubId = clubIds[index];
    if (clubId === undefined) {
      throw new CalendarGenerationError("invalid_club_count", "Calendar rotation encountered a missing club");
    }

    rotated.push(clubId);
  }

  return rotated;
}

/**
 * Builds one stable namespaced fixture ID.
 */
function nextFixtureId(fixtureNumber: number): FixtureId {
  return fixtureId(`fixture:${String(fixtureNumber).padStart(6, "0")}`);
}

/**
 * One home/away pairing inside a round.
 */
interface Pairing {
  /** Home club ID. */
  readonly homeClubId: ClubId;
  /** Away club ID. */
  readonly awayClubId: ClubId;
}
