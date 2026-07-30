import assert from "node:assert/strict";
import { test } from "vitest";

import type { Club } from "../entities/club.entity.ts";
import type { Fixture } from "../entities/fixture.entity.ts";
import { clubId, competitionId, fixtureId, seasonId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import {
  competitionIdForClub,
  createDomesticCompetitionWorld,
  DomesticCompetitionWorldError,
  type DomesticCompetitionWorld,
} from "./competition-world.ts";

test("domestic competition world preserves order, membership, and historical tiers", () => {
  const { world, references, firstClubId, secondClubId } = fixture();
  const created = createDomesticCompetitionWorld(world, references);

  assert.deepEqual(created.competitionIds, [
    competitionId("competition:first"),
    competitionId("competition:second"),
  ]);
  assert.equal(competitionIdForClub(created, firstClubId), "competition:first");
  assert.equal(competitionIdForClub(created, secondClubId), "competition:second");
  assert.equal(created.seasonHistory[0]?.competitionId, "competition:second");
});

test("domestic competition world rejects duplicate membership and invalid fixtures", () => {
  const { world, references, firstClubId } = fixture();
  const secondCompetitionId = competitionId("competition:second");
  const secondCompetition = world.competitions[secondCompetitionId]!;

  assertWorldError(
    () => createDomesticCompetitionWorld({
      ...world,
      competitions: {
        ...world.competitions,
        [secondCompetitionId]: { ...secondCompetition, clubIds: [firstClubId] },
      },
    }, references),
    "duplicate_club_membership",
  );

  const fixtureIdValue = references.fixtureIds[0]!;
  assertWorldError(
    () => createDomesticCompetitionWorld(world, {
      ...references,
      fixtures: {
        ...references.fixtures,
        [fixtureIdValue]: {
          ...references.fixtures[fixtureIdValue]!,
          competitionId: competitionId("competition:missing"),
        },
      },
    }),
    "fixture_competition_not_found",
  );
});

test("domestic competition world keeps archived fixtures valid after membership movement", () => {
  const { world, references, firstClubId, secondClubId } = fixture();
  const firstCompetitionId = competitionId("competition:first");
  const secondCompetitionId = competitionId("competition:second");
  const moved = createDomesticCompetitionWorld({
    ...world,
    competitions: {
      [firstCompetitionId]: competition(
        firstCompetitionId,
        "First",
        [secondClubId],
      ),
      [secondCompetitionId]: competition(
        secondCompetitionId,
        "Second",
        [firstClubId],
      ),
    },
    seasonHistory: [
      ...world.seasonHistory,
      {
        sequenceNumber: 2,
        seasonId: seasonId("season:current"),
        competitionId: firstCompetitionId,
        finalTable: [tableRow(firstClubId)],
      },
    ],
  }, references);

  assert.equal(competitionIdForClub(moved, firstClubId), secondCompetitionId);
  assert.equal(moved.seasonHistory[1]?.finalTable[0]?.clubId, firstClubId);
});

function fixture() {
  const firstClubId = clubId("club:first");
  const secondClubId = clubId("club:second");
  const firstCompetitionId = competitionId("competition:first");
  const secondCompetitionId = competitionId("competition:second");
  const fixtureIdValue = fixtureId("fixture:first");
  const clubs: Record<string, Club> = {
    [firstClubId]: club(firstClubId, "first_division"),
    [secondClubId]: club(secondClubId, "second_division"),
  };
  const fixtures: Record<string, Fixture> = {
    [fixtureIdValue]: {
      id: fixtureIdValue,
      competitionId: firstCompetitionId,
      seasonId: seasonId("season:current"),
      roundNumber: 1,
      date: gameDate(20_000),
      homeClubId: firstClubId,
      awayClubId: firstClubId,
    },
  };
  const world: DomesticCompetitionWorld = {
    competitionIds: [firstCompetitionId, secondCompetitionId],
    competitions: {
      [firstCompetitionId]: competition(firstCompetitionId, "First", [firstClubId]),
      [secondCompetitionId]: competition(secondCompetitionId, "Second", [secondClubId]),
    },
    seasonHistory: [{
      sequenceNumber: 1,
      seasonId: seasonId("season:previous"),
      competitionId: secondCompetitionId,
      finalTable: [tableRow(firstClubId)],
    }],
  };

  return {
    world,
    references: { clubs, fixtures, fixtureIds: [fixtureIdValue] },
    firstClubId,
    secondClubId,
  };
}

function competition(
  id: ReturnType<typeof competitionId>,
  name: string,
  clubIds: readonly ReturnType<typeof clubId>[],
) {
  return {
    id,
    name,
    clubIds,
    matchRules: {
      maximumSubstitutions: 5,
      substitutionWindowLimit: null,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    },
  } as const;
}

function club(id: ReturnType<typeof clubId>, category: Club["category"]): Club {
  return { id, name: id, shortName: id, category, reputation: 5, playerIds: [] };
}

function tableRow(id: ReturnType<typeof clubId>) {
  return {
    position: 1,
    clubId: id,
    played: 1,
    wins: 1,
    draws: 0,
    losses: 0,
    goalsFor: 1,
    goalsAgainst: 0,
    goalDifference: 1,
    points: 3,
  };
}

function assertWorldError(
  action: () => void,
  code: DomesticCompetitionWorldError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof DomesticCompetitionWorldError && error.code === code,
  );
}
