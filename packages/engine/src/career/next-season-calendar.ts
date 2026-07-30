import {
  fixtureId,
  gameDate,
  seasonId,
  type CareerState,
  type CompetitionId,
  type DomesticCompetitionWorld,
  type Fixture,
  type FixtureId,
  type GameDate,
  type SeasonId,
} from "@game/domain";
import { addDays } from "@game/shared";

import {
  combineDomesticCompetitionCalendars,
  generateRoundRobinCalendar,
} from "../season-engine/calendar.ts";
import { assessCareerSeasonCompletion, type CareerSeasonCompletionInvalidReason } from "./season-completion.ts";

const NEXT_SEASON_BREAK_DAYS = 70;
const SEASON_NUMERIC_SUFFIX = /^season:(.*?)(\d+)$/;
const FIXTURE_NUMERIC_SUFFIX = /^fixture:(\d+)$/;

/** Invalid-state reasons for next-season calendar generation. */
export type NextSeasonCalendarInvalidReason =
  | CareerSeasonCompletionInvalidReason
  | "current_season_incomplete"
  | "fixture_id_collision";

/** Result returned when a deterministic next-season calendar was generated. */
export interface NextSeasonCalendarGenerated {
  /** Discriminator for successful generation. */
  readonly status: "generated";
  /** Completed season used as source. */
  readonly previousSeasonId: SeasonId;
  /** Newly derived season ID. */
  readonly seasonId: SeasonId;
  /** Ordered competitions that received a complete next-season calendar. */
  readonly competitionIds: readonly CompetitionId[];
  /** First scheduled date of the next season. */
  readonly seasonStartDate: GameDate;
  /** Ordered new fixture IDs with no collision against existing fixtures. */
  readonly fixtureIds: readonly FixtureId[];
  /** Ordered new fixtures for the next season. */
  readonly fixtures: readonly Fixture[];
}

/** Result returned when a next season cannot be generated safely. */
export interface NextSeasonCalendarInvalid {
  /** Discriminator for validation failures. */
  readonly status: "invalid";
  /** Stable invalid-state reason. */
  readonly reason: NextSeasonCalendarInvalidReason;
  /** Fixture ID related to the invalid state when available. */
  readonly fixtureId?: FixtureId;
}

/** Pure next-season calendar generation result. */
export type NextSeasonCalendarResult =
  | NextSeasonCalendarGenerated
  | NextSeasonCalendarInvalid;

/**
 * Generates every ordered next-season domestic calendar.
 *
 * This function is deterministic and read-only. It requires the current season
 * to be complete, starts the next season 70 days after the latest
 * current-season fixture, and rejects any identity collision atomically.
 */
export function generateNextSeasonCalendar(
  careerState: CareerState,
  nextCompetitionWorld: DomesticCompetitionWorld | undefined =
    careerState.gameState.domesticCompetitionWorld,
): NextSeasonCalendarResult {
  const completion = assessCareerSeasonCompletion(careerState);

  if (completion.status === "invalid") {
    return {
      status: "invalid",
      reason: completion.reason,
      ...(completion.fixtureId === undefined ? {} : { fixtureId: completion.fixtureId }),
    };
  }

  if (completion.status === "incomplete") {
    return {
      status: "invalid",
      reason: "current_season_incomplete",
      fixtureId: completion.firstUnplayedFixtureId,
    };
  }

  const seasonDetails = collectCurrentSeasonDetails(careerState, completion.seasonId);
  if (seasonDetails.status === "invalid") {
    return seasonDetails;
  }

  const nextSeasonId = nextSeasonIdFrom(completion.seasonId);
  const seasonStartDate = gameDate(addDays(
    seasonDetails.latestFixtureDate,
    NEXT_SEASON_BREAK_DAYS,
  ));
  const competitionIds = nextCompetitionWorld?.competitionIds
    ?? [seasonDetails.competitionIds[0]!];
  const calendars = competitionIds.map((competitionId) => {
    const clubIds = nextCompetitionWorld?.competitions[competitionId]?.clubIds
      ?? careerState.gameState.clubIds;
    return generateRoundRobinCalendar({
      seed: careerState.gameState.meta.seed,
      seasonId: nextSeasonId,
      competitionId,
      clubIds,
      seasonStartDate,
    });
  });
  const generated = nextCompetitionWorld === undefined
    ? calendars[0]!
    : combineDomesticCompetitionCalendars(nextCompetitionWorld, calendars);
  const publishedFixtures = nextCompetitionWorld === undefined
    ? remapFixtureIds(careerState.gameState.fixtureIds, generated.fixtures)
    : generated.fixtures;
  const existingFixtureIds = new Set(careerState.gameState.fixtureIds);
  const collision = publishedFixtures.find((fixture) =>
    existingFixtureIds.has(fixture.id)
  );
  if (collision !== undefined) {
    return {
      status: "invalid",
      reason: "fixture_id_collision",
      fixtureId: collision.id,
    };
  }

  return {
    status: "generated",
    previousSeasonId: completion.seasonId,
    seasonId: nextSeasonId,
    competitionIds,
    seasonStartDate,
    fixtureIds: publishedFixtures.map((fixture) => fixture.id),
    fixtures: publishedFixtures,
  };
}

function remapFixtureIds(
  existingFixtureIds: readonly FixtureId[],
  generatedFixtures: readonly Fixture[],
): Fixture[] {
  const existingFixtureIdSet = new Set(existingFixtureIds);
  let nextFixtureNumber = 1;
  for (const existingFixtureId of existingFixtureIds) {
    const match = FIXTURE_NUMERIC_SUFFIX.exec(String(existingFixtureId));
    if (match !== null) {
      nextFixtureNumber = Math.max(
        nextFixtureNumber,
        Number.parseInt(match[1] ?? "0", 10) + 1,
      );
    }
  }
  return generatedFixtures.map((fixture) => {
    let id = fixtureId(`fixture:${String(nextFixtureNumber).padStart(6, "0")}`);
    nextFixtureNumber += 1;
    while (existingFixtureIdSet.has(id)) {
      id = fixtureId(`fixture:${String(nextFixtureNumber).padStart(6, "0")}`);
      nextFixtureNumber += 1;
    }
    existingFixtureIdSet.add(id);
    return { ...fixture, id };
  });
}

function collectCurrentSeasonDetails(
  careerState: CareerState,
  currentSeasonId: SeasonId,
):
  | {
      readonly status: "valid";
      readonly competitionIds: readonly CompetitionId[];
      readonly latestFixtureDate: GameDate;
    }
  | NextSeasonCalendarInvalid {
  const competitionIds: CompetitionId[] = [];
  const seenCompetitionIds = new Set<CompetitionId>();
  let latestFixtureDate: GameDate | undefined;

  for (const fixtureIdValue of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureIdValue];
    if (fixture === undefined || fixture.seasonId !== currentSeasonId) {
      continue;
    }

    if (!seenCompetitionIds.has(fixture.competitionId)) {
      seenCompetitionIds.add(fixture.competitionId);
      competitionIds.push(fixture.competitionId);
    }

    latestFixtureDate = latestFixtureDate === undefined || fixture.date > latestFixtureDate ? fixture.date : latestFixtureDate;
  }

  if (competitionIds.length === 0 || latestFixtureDate === undefined) {
    return {
      status: "invalid",
      reason: "no_current_season_fixtures",
    };
  }

  return {
    status: "valid",
    competitionIds,
    latestFixtureDate,
  };
}

function nextSeasonIdFrom(currentSeasonId: SeasonId): SeasonId {
  const text = String(currentSeasonId);
  const match = SEASON_NUMERIC_SUFFIX.exec(text);

  if (match === null) {
    return seasonId(`${text}-next`);
  }

  const prefix = match[1] ?? "";
  const numeric = match[2] ?? "0";
  const nextNumber = Number.parseInt(numeric, 10) + 1;

  return seasonId(`season:${prefix}${String(nextNumber).padStart(numeric.length, "0")}`);
}
