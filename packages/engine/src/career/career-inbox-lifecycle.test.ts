import { describe, expect, it } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  careerInboxMessageId,
  clubId,
  competitionId,
  createCareerInboxMessage,
  createCareerState,
  createMarketState,
  fixtureId,
  gameDate,
  saveId,
  seasonId,
  type CareerInboxMessage,
  type CareerState,
  type Fixture,
  type GameState,
} from "@game/domain";

import {
  CareerInboxLifecycleError,
  acknowledgeImportantCareerInboxMessage,
  createPlayedFixtureResultInboxMessage,
  createSeasonRolloverInboxMessage,
  deliverCareerInboxMessages,
  openCareerInboxMessage,
  reconcileCareerInboxResolution,
} from "./career-inbox-lifecycle.ts";

describe("career inbox lifecycle", () => {
  it("delivers stable IDs once, refreshes facts, and preserves lifecycle", () => {
    const initial = careerFixture();
    const first = matchdayMessage("blocking", ["missing_saved_lineup"]);
    const delivered = deliverCareerInboxMessages(initial, [first, first]);
    const opened = openCareerInboxMessage(delivered, first.id);
    const refreshed = deliverCareerInboxMessages(opened, [matchdayMessage("blocking", [])]);

    expect(refreshed.currentSeasonInbox).toHaveLength(1);
    expect(refreshed.currentSeasonInbox?.[0]).toMatchObject({
      blockerKeys: [],
      actionIds: ["open_matchday"],
      lifecycle: { read: true, acknowledged: false, resolved: false },
    });
    expect(deliverCareerInboxMessages(refreshed, [matchdayMessage("blocking", [])])).toBe(refreshed);
  });

  it("opens idempotently and acknowledges only opened important attention", () => {
    const important = matchdayMessage("important", []);
    const delivered = deliverCareerInboxMessages(careerFixture(), [important]);

    expect(() => acknowledgeImportantCareerInboxMessage(delivered, important.id)).toThrowError(
      expect.objectContaining<Partial<CareerInboxLifecycleError>>({ code: "message_not_opened" }),
    );

    const opened = openCareerInboxMessage(delivered, important.id);
    expect(openCareerInboxMessage(opened, important.id)).toBe(opened);
    const acknowledged = acknowledgeImportantCareerInboxMessage(opened, important.id);
    expect(acknowledged.currentSeasonInbox?.[0]?.lifecycle).toEqual({
      read: true,
      acknowledged: true,
      resolved: false,
    });
    expect(acknowledgeImportantCareerInboxMessage(acknowledged, important.id)).toBe(acknowledged);
  });

  it("never acknowledges blocking attention", () => {
    const blocking = matchdayMessage("blocking", []);
    const opened = openCareerInboxMessage(
      deliverCareerInboxMessages(careerFixture(), [blocking]),
      blocking.id,
    );

    expect(() => acknowledgeImportantCareerInboxMessage(opened, blocking.id)).toThrowError(
      expect.objectContaining<Partial<CareerInboxLifecycleError>>({ code: "message_not_important" }),
    );
  });

  it("resolves a blocking matchday message only from its played fixture", () => {
    const blocking = matchdayMessage("blocking", []);
    const delivered = deliverCareerInboxMessages(careerFixture(), [blocking]);

    expect(reconcileCareerInboxResolution(delivered)).toBe(delivered);

    const fixture = delivered.gameState.fixtures[TEST_FIXTURE_ID];
    if (fixture === undefined) throw new Error("Expected test fixture");
    const played = createCareerState({
      ...delivered,
      gameState: {
        ...delivered.gameState,
        fixtures: {
          ...delivered.gameState.fixtures,
          [fixture.id]: { ...fixture, result: { played: true, homeGoals: 1, awayGoals: 0 } },
        },
      },
    });

    const reconciled = reconcileCareerInboxResolution(played);
    expect(reconciled.currentSeasonInbox?.[0]?.lifecycle.resolved).toBe(true);
    expect(reconciled.currentSeasonInbox?.[1]).toMatchObject({
      id: `inbox:match-result:${TEST_FIXTURE_ID}`,
      category: "match_result",
      source: "match_report",
      level: "informational",
    });
    expect(reconcileCareerInboxResolution(reconciled)).toBe(reconciled);
  });

  it("creates summaries only from committed fixture and rollover facts", () => {
    const career = careerFixture();
    expect(createPlayedFixtureResultInboxMessage(career, TEST_FIXTURE_ID)).toBeUndefined();

    const rollover = createSeasonRolloverInboxMessage({
      nextSeasonId: seasonId("season:next"),
      date: gameDate(20_100),
      selectedClubId: TEST_CLUB_ID,
    });

    expect(rollover).toMatchObject({
      id: "inbox:season-rollover:season:next",
      category: "season_rollover",
      source: "competition_office",
      level: "important",
      lifecycle: { read: false, acknowledged: false, resolved: false },
    });
  });
});

const TEST_CLUB_ID = clubId("club:selected");
const TEST_OPPONENT_ID = clubId("club:opponent");
const TEST_FIXTURE_ID = fixtureId("fixture:inbox-lifecycle");

function matchdayMessage(
  level: CareerInboxMessage["level"],
  blockerKeys: CareerInboxMessage["blockerKeys"],
): CareerInboxMessage {
  return createCareerInboxMessage({
    id: careerInboxMessageId(`inbox:matchday:${TEST_FIXTURE_ID}`),
    date: gameDate(20_000),
    category: "matchday",
    source: "technical_staff",
    level,
    lifecycle: { read: false, acknowledged: false, resolved: false },
    related: { fixtureId: TEST_FIXTURE_ID, clubId: TEST_CLUB_ID },
    blockerKeys,
    actionIds: level === "blocking"
      ? [blockerKeys.length > 0 ? "prepare_match" : "open_matchday"]
      : [],
  });
}

function careerFixture(): CareerState {
  const fixture: Fixture = {
    id: TEST_FIXTURE_ID,
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:test"),
    roundNumber: 1,
    date: gameDate(20_000),
    homeClubId: TEST_CLUB_ID,
    awayClubId: TEST_OPPONENT_ID,
  };
  const gameState: GameState = {
    meta: { seed: "inbox-lifecycle", rngAlgorithmVersion: "test", saveSchemaVersion: 1 },
    calendar: { currentDate: gameDate(20_000), currentSeasonId: seasonId("season:test") },
    players: {},
    playerIds: [],
    playerStates: {},
    clubs: {
      [TEST_CLUB_ID]: {
        id: TEST_CLUB_ID,
        name: "Selected",
        shortName: "SEL",
        category: "third_division",
        reputation: 5,
        playerIds: [],
      },
      [TEST_OPPONENT_ID]: {
        id: TEST_OPPONENT_ID,
        name: "Opponent",
        shortName: "OPP",
        category: "third_division",
        reputation: 5,
        playerIds: [],
      },
    },
    clubIds: [TEST_CLUB_ID, TEST_OPPONENT_ID],
    fixtures: { [TEST_FIXTURE_ID]: fixture },
    fixtureIds: [TEST_FIXTURE_ID],
  };

  return createCareerState({
    saveId: saveId("save:inbox-lifecycle"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: TEST_CLUB_ID,
    gameState,
    marketState: createMarketState({ clubBudgets: {}, clubBudgetIds: [] }),
    transferHistory: [],
  });
}
