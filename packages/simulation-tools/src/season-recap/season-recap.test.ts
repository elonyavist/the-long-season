import { describe, expect, it } from "vitest";
import type { ClubId, FormationKey, PlayerId, PlayerRole } from "@game/domain";

import {
  buildSeasonRecap,
  SEASON_RECAP_CHART_SIZE,
  SEASON_RECAP_CREATOR_ROLE,
  SEASON_RECAP_ROLE_GROUP,
  SeasonRecapError,
  isCreatorRole,
  type BuildSeasonRecapInput,
} from "./season-recap.ts";

const CLUBS: readonly ClubId[] = ["club:a", "club:b", "club:c"] as ClubId[];

/** One club row with the numbers a table actually carries. */
function tableRow(position: number, clubId: ClubId, points: number) {
  return {
    position,
    clubId,
    played: 10,
    wins: 3,
    draws: 1,
    losses: 6,
    goalsFor: 12,
    goalsAgainst: 14,
    goalDifference: -2,
    points,
  };
}

function stat(playerId: string, clubId: ClubId, goals: number, assists: number) {
  return { playerId: playerId as PlayerId, clubId, goals, assists, saves: 0 };
}

function player(firstName: string, primaryRole: PlayerRole) {
  return { firstName, lastName: "Test", primaryRole };
}

function fixture(id: string, homeGoals: number, awayGoals: number) {
  return {
    id: id as never,
    competitionId: "competition:league" as never,
    seasonId: "season:1" as never,
    roundNumber: 1,
    date: 0 as never,
    homeClubId: CLUBS[0] as ClubId,
    awayClubId: CLUBS[1] as ClubId,
    result: { played: true as const, homeGoals, awayGoals },
  };
}

function baseInput(overrides: Partial<BuildSeasonRecapInput> = {}): BuildSeasonRecapInput {
  return {
    season: {
      table: [
        tableRow(1, CLUBS[0] as ClubId, 22),
        tableRow(2, CLUBS[1] as ClubId, 14),
        tableRow(3, CLUBS[2] as ClubId, 5),
      ],
      playerSummaryStats: [
        stat("player:001", CLUBS[0] as ClubId, 7, 2),
        stat("player:002", CLUBS[1] as ClubId, 4, 3),
        stat("player:003", CLUBS[2] as ClubId, 0, 0),
      ],
      fixtureParticipation: [
        {
          fixtureId: "fixture:001" as never,
          fieldedTeams: {
            home: {
              clubId: CLUBS[0] as ClubId,
              lineup: [],
              formationKey: "4-4-2" as FormationKey,
              selectionSource: "fixed_lineup",
              tacticalDistribution: {
                directness: 0.5,
                pressing: 0.5,
                width: 0.5,
                risk: 0.5,
                mentality: "balanced",
              },
            },
            away: {
              clubId: CLUBS[1] as ClubId,
              lineup: [],
              formationKey: "4-3-3" as FormationKey,
              selectionSource: "fixed_lineup",
              tacticalDistribution: {
                directness: 0.5,
                pressing: 0.5,
                width: 0.5,
                risk: 0.5,
                mentality: "balanced",
              },
            },
          },
          contributions: [
            {
              fixtureId: "fixture:001" as never,
              playerId: "player:001" as PlayerId,
              clubId: CLUBS[0] as ClubId,
              seasonId: "season:1" as never,
              monthKey: "2026-08" as never,
              started: true,
              substituteAppearance: false,
              minutes: 90,
              playedRoleMinutes: {},
            },
            {
              fixtureId: "fixture:001" as never,
              playerId: "player:002" as PlayerId,
              clubId: CLUBS[1] as ClubId,
              seasonId: "season:1" as never,
              monthKey: "2026-08" as never,
              started: false,
              substituteAppearance: true,
              minutes: 20,
              playedRoleMinutes: {},
            },
            {
              fixtureId: "fixture:001" as never,
              playerId: "player:003" as PlayerId,
              clubId: CLUBS[2] as ClubId,
              seasonId: "season:1" as never,
              monthKey: "2026-08" as never,
              started: false,
              substituteAppearance: false,
              minutes: 0,
              playedRoleMinutes: {},
            },
          ],
          progression: {
            controlledSides: [],
            aiDecisionCount: { home: 0, away: 0 },
            aiCommandCount: { home: 0, away: 0 },
            aiReasonCounts: {
              home: zeroAiReasonCounts(),
              away: zeroAiReasonCounts(),
            },
            aiReplacementFailureCounts: {
              home: zeroAiReplacementFailureCounts(),
              away: zeroAiReplacementFailureCounts(),
            },
            appliedSubstitutions: [],
            finalLineups: { home: [], away: [] },
          },
        },
      ],
      fixtures: [fixture("fixture:001", 2, 1), fixture("fixture:002", 1, 1)],
    },
    players: {
      ["player:001" as PlayerId]: player("Alpha", "striker"),
      ["player:002" as PlayerId]: player("Bravo", "winger"),
      ["player:003" as PlayerId]: player("Charlie", "goalkeeper"),
    },
    clubNames: {
      [CLUBS[0] as ClubId]: "Alpha FC",
      [CLUBS[1] as ClubId]: "Bravo FC",
      [CLUBS[2] as ClubId]: "Charlie FC",
    },
    formationByClubId: {
      [CLUBS[0] as ClubId]: "4-4-2" as FormationKey,
      [CLUBS[1] as ClubId]: "4-3-3" as FormationKey,
      [CLUBS[2] as ClubId]: "4-4-2" as FormationKey,
    },
    ...overrides,
  };
}

function zeroAiReasonCounts() {
  return {
    forced_injury_replacement: 0,
    dismissal_reorganization: 0,
    low_condition: 0,
    poor_performance: 0,
    trailing_response: 0,
    protecting_lead: 0,
    no_legal_substitute: 0,
    no_material_change: 0,
    command_rejected: 0,
  } as const;
}

function zeroAiReplacementFailureCounts() {
  return {
    substitution_limit: 0,
    no_available_bench: 0,
    no_positionally_credible_bench: 0,
    quality_floor: 0,
  } as const;
}

describe("buildSeasonRecap", () => {
  it("names the clubs in the table instead of leaving identifiers", () => {
    const recap = buildSeasonRecap(baseInput());

    expect(recap.table.map((row) => row.clubName)).toStrictEqual([
      "Alpha FC",
      "Bravo FC",
      "Charlie FC",
    ]);
    expect(recap.table[0]?.position).toBe(1);
  });

  it("carries the canonical role onto every chart row", () => {
    const recap = buildSeasonRecap(baseInput());

    expect(recap.topScorers.map((row) => row.role)).toStrictEqual(["striker", "winger"]);
    expect(recap.topScorers.map((row) => row.roleGroup)).toStrictEqual(["finisher", "finisher"]);
  });

  it("leaves out players who neither scored nor assisted", () => {
    const recap = buildSeasonRecap(baseInput());

    expect(recap.topScorers.some((row) => row.playerId === "player:003")).toBe(false);
    expect(recap.topAssists.some((row) => row.playerId === "player:003")).toBe(false);
  });

  it("orders scorers by goals and assists by assists", () => {
    const recap = buildSeasonRecap(baseInput());

    expect(recap.topScorers.map((row) => row.playerId)).toStrictEqual(["player:001", "player:002"]);
    expect(recap.topAssists.map((row) => row.playerId)).toStrictEqual(["player:002", "player:001"]);
  });

  it("breaks an exact tie on the player identifier, never on input order", () => {
    const input = baseInput();
    const tied = buildSeasonRecap({
      ...input,
      season: {
        ...input.season,
        playerSummaryStats: [
          stat("player:009", CLUBS[0] as ClubId, 5, 1),
          stat("player:002", CLUBS[1] as ClubId, 5, 1),
        ],
      },
      players: {
        ["player:009" as PlayerId]: player("Zulu", "striker"),
        ["player:002" as PlayerId]: player("Bravo", "winger"),
      },
    });

    expect(tied.topScorers.map((row) => row.playerId)).toStrictEqual(["player:002", "player:009"]);
  });

  it("counts an appearance from the bench and not a player who never came on", () => {
    const recap = buildSeasonRecap(baseInput());
    const byId = new Map(recap.topScorers.map((row) => [row.playerId, row]));

    expect(byId.get("player:001" as PlayerId)?.appearances).toBe(1);
    expect(byId.get("player:002" as PlayerId)?.appearances).toBe(1);
  });

  it("groups shapes in canonical catalog order with the mean points of their clubs", () => {
    const recap = buildSeasonRecap(baseInput());

    expect(recap.shapes).toStrictEqual([
      { formation: "4-4-2", clubCount: 2, meanPoints: 13.5 },
      { formation: "4-3-3", clubCount: 1, meanPoints: 14 },
    ]);
  });

  it("derives the season facts the bands read", () => {
    const recap = buildSeasonRecap(baseInput());

    expect(recap.facts).toMatchObject({
      matchesPerClub: 10,
      playedFixtures: 2,
      goalsPerMatch: 2.5,
      homeWinShare: 0.5,
      drawShare: 0.5,
      championPoints: 22,
      bottomPoints: 5,
      pointsSpread: 17,
      topScorerGoals: 7,
      topAssistCount: 3,
      distinctFormations: 2,
    });
  });

  it("caps each chart at the frozen size", () => {
    const input = baseInput();
    const many = Array.from({ length: 25 }, (_value, index) => index);
    const recap = buildSeasonRecap({
      ...input,
      season: {
        ...input.season,
        playerSummaryStats: many.map((index) =>
          stat(`player:${String(index).padStart(3, "0")}`, CLUBS[0] as ClubId, 25 - index, index + 1),
        ),
      },
      players: Object.fromEntries(
        many.map((index) => [
          `player:${String(index).padStart(3, "0")}` as PlayerId,
          player(`Player${index}`, "striker"),
        ]),
      ),
    });

    expect(recap.topScorers).toHaveLength(SEASON_RECAP_CHART_SIZE);
    expect(recap.topAssists).toHaveLength(SEASON_RECAP_CHART_SIZE);
  });

  it("is a pure reading of its input", () => {
    expect(buildSeasonRecap(baseInput())).toStrictEqual(buildSeasonRecap(baseInput()));
  });

  it("refuses a season with no table", () => {
    const input = baseInput();

    expect(() => buildSeasonRecap({ ...input, season: { ...input.season, table: [] } }))
      .toThrow(SeasonRecapError);
  });

  it("refuses statistics naming a player the lookup does not cover", () => {
    const input = baseInput();

    expect(() => buildSeasonRecap({ ...input, players: {} })).toThrow(SeasonRecapError);
  });

  it("refuses a player with no canonical role rather than guessing one", () => {
    const input = baseInput();

    expect(() => buildSeasonRecap({
      ...input,
      players: {
        ...input.players,
        ["player:001" as PlayerId]: { firstName: "Alpha", lastName: "Test" },
      },
    })).toThrow(SeasonRecapError);
  });

  it("refuses facts naming a club it has no name for", () => {
    const input = baseInput();

    expect(() => buildSeasonRecap({ ...input, clubNames: {} })).toThrow(SeasonRecapError);
  });
});

describe("season recap role groups", () => {
  it("puts every canonical role in exactly one group", () => {
    const groups = Object.values(SEASON_RECAP_ROLE_GROUP);

    expect(groups.length).toBe(Object.keys(SEASON_RECAP_ROLE_GROUP).length);
    expect(new Set(groups)).toStrictEqual(new Set(["finisher", "creator", "anchor"]));
  });

  it("keeps keepers and centre backs out of the creator group", () => {
    expect(isCreatorRole("goalkeeper")).toBe(false);
    expect(isCreatorRole("center_back")).toBe(false);
  });

  it("counts wingers and attacking midfielders as creators as well as finishers", () => {
    // They lead real assist charts. A creator group that excluded them would
    // fail the assist band on correct football.
    expect(isCreatorRole("winger")).toBe(true);
    expect(isCreatorRole("attacking_midfielder")).toBe(true);
    expect(SEASON_RECAP_ROLE_GROUP.winger).toBe("finisher");
  });

  it("keeps the striker out of the creator group on purpose", () => {
    // The two questions are answered by two total mappings. Deriving "creates"
    // from "finishes" swept the striker in, because wingers do both.
    expect(isCreatorRole("striker")).toBe(false);
    expect(SEASON_RECAP_ROLE_GROUP.striker).toBe("finisher");
  });

  it("answers creation for every canonical role", () => {
    expect(Object.keys(SEASON_RECAP_CREATOR_ROLE).toSorted())
      .toStrictEqual(Object.keys(SEASON_RECAP_ROLE_GROUP).toSorted());
  });
});
