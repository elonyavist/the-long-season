import {
  fixtureId,
  gameDate,
  seasonId,
  type CareerState,
  type CompetitionId,
  type Fixture,
  type FixtureId,
  type GameDate,
  type SeasonId,
} from "@game/domain";
import { addDays } from "@game/shared";

import { generateRoundRobinCalendar } from "../season-engine/calendar.ts";
import { assessCareerSeasonCompletion, type CareerSeasonCompletionInvalidReason } from "./season-completion.ts";

const NEXT_SEASON_BREAK_DAYS = 70;
const SEASON_NUMERIC_SUFFIX = /^season:(.*?)(\d+)$/;
const FIXTURE_NUMERIC_SUFFIX = /^fixture:(\d+)$/;

/** Invalid-state reasons for next-season calendar generation. */
export type NextSeasonCalendarInvalidReason =
  | CareerSeasonCompletionInvalidReason
  | "current_season_incomplete"
  | "multiple_current_season_competitions";

/** Result returned when a deterministic next-season calendar was generated. */
export interface NextSeasonCalendarGenerated {
  /** Discriminator for successful generation. */
  readonly status: "generated";
  /** Completed season used as source. */
  readonly previousSeasonId: SeasonId;
  /** Newly derived season ID. */
  readonly seasonId: SeasonId;
  /** Competition carried forward unchanged for this MVP. */
  readonly competitionId: CompetitionId;
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
 * Generates the next season calendar for the current career competition.
 *
 * This function is deterministic and read-only. It requires the current season
 * to be complete, keeps the same clubs and competition for the MVP, starts the
 * next season 70 days after the latest current-season fixture, and remaps
 * generated fixture IDs so old fixtures are never overwritten.
 */
export function generateNextSeasonCalendar(careerState: CareerState): NextSeasonCalendarResult {
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
  const generated = generateRoundRobinCalendar({
    seed: careerState.gameState.meta.seed,
    seasonId: nextSeasonId,
    competitionId: seasonDetails.competitionId,
    clubIds: careerState.gameState.clubIds,
    seasonStartDate: gameDate(addDays(seasonDetails.latestFixtureDate, NEXT_SEASON_BREAK_DAYS)),
  });
  const remappedFixtures = remapFixtureIds(careerState.gameState.fixtureIds, generated.fixtures);

  return {
    status: "generated",
    previousSeasonId: completion.seasonId,
    seasonId: nextSeasonId,
    competitionId: seasonDetails.competitionId,
    seasonStartDate: generated.rounds[0]?.date ?? gameDate(addDays(seasonDetails.latestFixtureDate, NEXT_SEASON_BREAK_DAYS)),
    fixtureIds: remappedFixtures.map((fixture) => fixture.id),
    fixtures: remappedFixtures,
  };
}

function collectCurrentSeasonDetails(
  careerState: CareerState,
  currentSeasonId: SeasonId,
):
  | { readonly status: "valid"; readonly competitionId: CompetitionId; readonly latestFixtureDate: GameDate }
  | NextSeasonCalendarInvalid {
  let competitionIdValue: CompetitionId | undefined;
  let latestFixtureDate: GameDate | undefined;

  for (const fixtureIdValue of careerState.gameState.fixtureIds) {
    const fixture = careerState.gameState.fixtures[fixtureIdValue];
    if (fixture === undefined || fixture.seasonId !== currentSeasonId) {
      continue;
    }

    if (competitionIdValue !== undefined && fixture.competitionId !== competitionIdValue) {
      return {
        status: "invalid",
        reason: "multiple_current_season_competitions",
        fixtureId: fixtureIdValue,
      };
    }

    competitionIdValue = fixture.competitionId;
    latestFixtureDate = latestFixtureDate === undefined || fixture.date > latestFixtureDate ? fixture.date : latestFixtureDate;
  }

  if (competitionIdValue === undefined || latestFixtureDate === undefined) {
    return {
      status: "invalid",
      reason: "no_current_season_fixtures",
    };
  }

  return {
    status: "valid",
    competitionId: competitionIdValue,
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

function remapFixtureIds(existingFixtureIds: readonly FixtureId[], generatedFixtures: readonly Fixture[]): Fixture[] {
  const existingFixtureIdSet = new Set<FixtureId>();
  let nextFixtureNumber = 1;

  for (const existingFixtureId of existingFixtureIds) {
    existingFixtureIdSet.add(existingFixtureId);
    const match = FIXTURE_NUMERIC_SUFFIX.exec(String(existingFixtureId));

    if (match === null) {
      continue;
    }

    nextFixtureNumber = Math.max(nextFixtureNumber, Number.parseInt(match[1] ?? "0", 10) + 1);
  }

  const remapped: Fixture[] = [];

  for (const generatedFixture of generatedFixtures) {
    let nextFixtureId = fixtureId(`fixture:${String(nextFixtureNumber).padStart(6, "0")}`);
    nextFixtureNumber += 1;

    while (existingFixtureIdSet.has(nextFixtureId)) {
      nextFixtureId = fixtureId(`fixture:${String(nextFixtureNumber).padStart(6, "0")}`);
      nextFixtureNumber += 1;
    }

    existingFixtureIdSet.add(nextFixtureId);
    remapped.push({
      ...generatedFixture,
      id: nextFixtureId,
    });
  }

  return remapped;
}
