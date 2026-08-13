import assert from "node:assert/strict";

import { test } from "vitest";

import type { CareerState } from "@game/domain";

import { insertCareerStateRows } from "./career-state-mapper.ts";
import type { SqliteBindValue, SqliteWorldDatabase } from "./world-state-mapper.ts";

/** Relational mapping covers every current durable career slice without blobs. */
test("career rows use explicit relational tables and scalar binds", () => {
  const database = new RecordingDatabase();

  insertCareerStateRows(database, richCareerFixture());

  const insertedTables = new Set(database.statements.map(({ sql }) => insertedTable(sql)));
  assert.deepEqual(insertedTables, new Set([
    "career_world",
    "club_competitive_tier_state",
    "club_competitive_tier_assignments",
    "transfer_history",
    "senior_squad_registrations",
    "player_contracts",
    "active_player_contracts",
    "player_contract_history",
    "club_finance_accounts",
    "club_finance_ledger",
    "contract_negotiation_states",
    "contract_negotiations",
    "contract_negotiation_terms",
    "contract_negotiation_evaluations",
    "contract_negotiation_evaluation_reasons",
    "career_inbox_messages",
    "career_inbox_blockers",
    "career_inbox_actions",
    "career_player_injuries",
    "career_player_suspensions",
    "career_player_yellow_cards",
    "player_participation_ledgers",
    "player_participation_rows",
    "player_participation_role_minutes",
    "player_participation_club_minutes",
    "player_participation_applied_fixtures",
    "player_participation_closed_months",
    "youth_state",
    "youth_club_rosters",
    "youth_roster_players",
    "youth_lifecycle",
    "season_history",
    "season_table_rows",
    "season_player_statistics",
    "match_preparation",
    "match_preparation_lineup",
    "match_preparation_board_slots",
    "match_preparation_bench",
    "match_reports",
    "match_events",
    "match_tactical_commands",
  ]));
  assert.ok(database.statements.every(({ bind }) => bind.every(isSqliteScalar)));
  assert.ok(database.statements.every(({ sql }) => !/json/i.test(sql)));
  const tierHeader = database.statements.find(({ sql }) =>
    sql.includes("INSERT INTO club_competitive_tier_state")
  );
  const tierAssignments = database.statements
    .filter(({ sql }) => sql.includes("INSERT INTO club_competitive_tier_assignments"))
    .map(({ bind }) => bind);
  assert.deepEqual(tierHeader?.bind, [
    "save:mapper",
    "club-competitive-tier-v1",
    "season:2026",
  ]);
  assert.deepEqual(tierAssignments, [
    ["save:mapper", 0, "club:home", "title_contender"],
    ["save:mapper", 1, "club:away", "playoff_contender"],
  ]);
  const inboxInsert = database.statements.find(({ sql }) => sql.includes("career_inbox_messages"));
  assert.equal(inboxInsert?.bind[3], 20_100);
  assert.equal(inboxInsert?.bind[7], "until_resolved");
  assert.equal(inboxInsert?.bind[14], "contract:one");
  assert.equal(inboxInsert?.bind[15], "contract-negotiation:one");
  const historyEvents = database.statements
    .filter(({ sql }) => sql.includes("INSERT INTO player_contract_history"))
    .map(({ bind }) => bind[5]);
  assert.deepEqual(historyEvents, ["signed", "renewed", "transfer_terminated", "expired", "released"]);
  const seasonHistoryInsert = database.statements.find(({ sql }) => sql.includes("INSERT INTO season_history\n"));
  const seasonPlayerStatisticsInsert = database.statements.find(
    ({ sql }) => sql.includes("INSERT INTO season_player_statistics\n"),
  );
  assert.equal(seasonHistoryInsert?.bind[7], "complete");
  assert.equal(seasonHistoryInsert?.bind[8], "partial");
  assert.deepEqual(seasonPlayerStatisticsInsert?.bind, [
    "save:mapper",
    1,
    0,
    "player:retired",
    12,
    3,
    1_100,
    104.5,
    15,
    8,
    4,
    0,
  ]);
  const participationClubMinutes = database.statements.find(({ sql }) =>
    sql.includes("INSERT INTO player_participation_club_minutes")
  );
  assert.deepEqual(participationClubMinutes?.bind, [
    "save:mapper",
    "season:2026|2026-08|player:one",
    0,
    "club:home",
    90,
  ]);
});

/**
 * Fixes the shot columns a match event is written through.
 *
 * The fixture carried no shot event at all until this test, which is how
 * `match_events` came to have no `route` column while `ShotContext` had the
 * field: nothing ever wrote one. The load side is proved separately, against a
 * real database, in `world-state-mapper.test.ts`.
 */
test("shot events write their route, and a penalty writes none", () => {
  const database = new RecordingDatabase();

  insertCareerStateRows(database, richCareerFixture());

  const shotEventBinds = database.statements
    .filter(({ sql }) => sql.includes("INSERT INTO match_events"))
    .map(({ bind }) => [bind[4], bind[9], bind[10], bind[11]]);

  assert.deepEqual(shotEventBinds.filter(([type]) => type === "goal"), [
    ["goal", "header", "cross", "left"],
  ]);
  assert.deepEqual(shotEventBinds.filter(([type]) => type === "miss"), [
    ["miss", "set_piece", "dead_ball", null],
  ]);
  assert.deepEqual(shotEventBinds.filter(([type]) => type === "kickoff"), [
    ["kickoff", null, null, null],
  ]);
});

test("season history without legacy player statistics writes explicit unavailable coverage", () => {
  const database = new RecordingDatabase();
  const state = richCareerFixture();
  const archivedSeason = state.seasonHistory?.[0];
  assert.ok(archivedSeason);
  const { playerStatistics: _legacyMissingStatistics, ...legacyArchivedSeason } = archivedSeason;

  insertCareerStateRows(database, {
    ...state,
    seasonHistory: [legacyArchivedSeason],
  });

  const seasonHistoryInsert = database.statements.find(({ sql }) => sql.includes("INSERT INTO season_history\n"));
  assert.equal(seasonHistoryInsert?.bind[7], "unavailable");
  assert.equal(seasonHistoryInsert?.bind[8], "unavailable");
  assert.equal(
    database.statements.some(({ sql }) => sql.includes("INSERT INTO season_player_statistics\n")),
    false,
  );
});

test("market clocks persist their exact response date instead of reseeding it from submission", () => {
  const database = new RecordingDatabase();
  const state = richCareerFixture();
  const terms = negotiationTerms(120_000_00);
  const demand = {
    evaluatedOn: 20_010,
    age: 25,
    currentAbility: 10,
    publicPotentialP50Ability: 12,
    role: "central_midfielder",
    expectedSquadStatus: "squad_player",
    currentAnnualWage: 100_000_00,
    remainingContractDays: 170,
    clubReputation: 5,
    clubCategory: "third_division",
    freeAgentLeverageBasisPoints: 0,
    preferredTerms: terms,
    minimumTerms: terms,
  } as const;

  insertCareerStateRows(database, {
    ...state,
    transferNegotiationState: {
      negotiations: {
        "transfer-negotiation:clock": {
          id: "transfer-negotiation:clock",
          buyingClubId: "club:away",
          sellingClubId: "club:home",
          playerId: "player:one",
          publicValue: 900_000_00,
          initialAskingPrice: 1_100_000_00,
          currentAskingPrice: 1_100_000_00,
          status: "submitted",
          submittedOn: 20_010,
          offeredFee: 1_000_000_00,
          clock: {
            submittedOn: 20_010,
            responseDueOn: 20_012,
            deadline: 20_013,
          },
        },
      },
      negotiationIds: ["transfer-negotiation:clock"],
    },
    preliminaryAgreementState: {
      agreements: {
        "preliminary-agreement:clock": {
          id: "preliminary-agreement:clock",
          playerId: "player:one",
          currentClubId: "club:home",
          offeringClubId: "club:away",
          currentContractId: "contract:one",
          createdOn: 20_010,
          futureStartsOn: 20_180,
          status: "offer_submitted",
          offeredTerms: terms,
          demand,
          clock: {
            submittedOn: 20_010,
            responseDueOn: 20_011,
            deadline: 20_013,
          },
        },
      },
      agreementIds: ["preliminary-agreement:clock"],
    },
  } as unknown as CareerState);

  const transferInsert = database.statements.find(({ sql }) =>
    sql.includes("INSERT INTO transfer_negotiations\n"),
  );
  const preliminaryInsert = database.statements.find(({ sql }) =>
    sql.includes("INSERT INTO preliminary_agreements\n"),
  );
  assert.equal(transferInsert?.bind[10], 20_010);
  assert.equal(transferInsert?.bind[11], 20_012);
  assert.equal(preliminaryInsert?.bind[7], 20_010);
  assert.equal(preliminaryInsert?.bind[8], 20_011);
});

/** Captures mapper writes without pretending to implement persistence. */
class RecordingDatabase implements SqliteWorldDatabase {
  public readonly statements: Array<{ readonly sql: string; readonly bind: readonly SqliteBindValue[] }> = [];

  public run(sql: string, bind: readonly SqliteBindValue[] = []): void {
    this.statements.push({ sql, bind });
  }

  public queryAll(): readonly Record<string, unknown>[] {
    throw new Error("The insert-only mapper test must not query the database");
  }

  public transaction<T>(operation: () => T): T {
    return operation();
  }
}

/** Returns the table targeted by one mapper INSERT statement. */
function insertedTable(sql: string): string {
  const match = /INSERT INTO\s+([a-z_]+)/i.exec(sql);
  assert.ok(match?.[1], `Expected INSERT statement, received: ${sql}`);
  return match[1];
}

/** Narrows mapper binds to the only scalar values accepted by SQLite. */
function isSqliteScalar(value: unknown): value is SqliteBindValue {
  return value === null || typeof value === "string" || typeof value === "number";
}

/**
 * Builds a dense mapper fixture containing every durable optional career slice.
 * Domain validation and exact reconstruction are covered by the browser OPFS
 * test; this fixture keeps this unit test focused on relational write coverage.
 */
function richCareerFixture(): CareerState {
  return {
    saveId: "save:mapper",
    schemaVersion: 2,
    selectedClubId: "club:home",
    gameState: {
      meta: { seed: "mapper", rngAlgorithmVersion: "sfc32-v1", saveSchemaVersion: 1 },
      calendar: { currentDate: 20_100, currentSeasonId: "season:2026" },
      players: {},
      playerIds: [],
      playerStates: {},
      clubs: {
        "club:home": {
          id: "club:home",
          name: "Home",
          shortName: "Home",
          category: "third_division",
          reputation: 5,
          playerIds: [],
        },
        "club:away": {
          id: "club:away",
          name: "Away",
          shortName: "Away",
          category: "third_division",
          reputation: 4,
          playerIds: [],
        },
      },
      clubIds: ["club:home", "club:away"],
      fixtures: {
        "fixture:played": {
          id: "fixture:played",
          competitionId: "competition:demo",
          seasonId: "season:2026",
          roundNumber: 1,
          date: 20_100,
          homeClubId: "club:home",
          awayClubId: "club:away",
          result: {
            played: true,
            homeGoals: 1,
            awayGoals: 0,
            report: {
              eventSchemaVersion: 9,
              fixtureId: "fixture:played",
              finalMinute: 90,
              score: { home: 1, away: 0 },
              stats: { home: sideStats(1), away: sideStats(0) },
              events: [
                { type: "kickoff", minute: 0 },
                { type: "goal", shot: { minute: 12, side: "home", quality: 0.62, expectedGoals: 0.44, isShotOnTarget: true, shotType: "header", chanceType: "cross", route: "left" }, scorerPlayerId: "player:one", assistPlayerId: "player:bench", creatorPlayerId: "player:bench" },
                { type: "foul", minute: 21, side: "home", committedByPlayerId: "player:one", sufferedByPlayerId: "player:bench", zoneDanger: 0.7 },
                { type: "yellow_card", minute: 21, side: "home", playerId: "player:one" },
                { type: "penalty_awarded", minute: 30, side: "away", fouledPlayerId: "player:bench", committedByPlayerId: "player:one" },
                { type: "penalty_outcome", minute: 30, side: "away", takerPlayerId: "player:bench", goalkeeperPlayerId: "player:one", outcome: "saved" },
                // A worked chance the goalkeeper saved: it has a route.
                { type: "save", shot: { minute: 41, side: "away", quality: 0.4, expectedGoals: 0.18, isShotOnTarget: true, shotType: "normal", chanceType: "counter", route: "transition" }, shooterPlayerId: "player:bench", goalkeeperPlayerId: "player:one" },
                // A penalty is awarded rather than worked, so it has no route at
                // all. Absence is the fact and must survive as absence.
                { type: "miss", shot: { minute: 47, side: "away", quality: 0.9, expectedGoals: 0.76, isShotOnTarget: false, shotType: "set_piece", chanceType: "dead_ball" }, shooterPlayerId: "player:bench" },
                { type: "block", shot: { minute: 52, side: "home", quality: 0.31, expectedGoals: 0.12, isShotOnTarget: false, shotType: "normal", chanceType: "open_play", route: "central" }, shooterPlayerId: "player:one", primaryDefenderPlayerId: "player:bench" },
                { type: "injury", minute: 55, side: "home", playerId: "player:one", severity: "minor" },
                { type: "substitution", minute: 60, side: "home", outgoingPlayerId: "player:one", incomingPlayerId: "player:bench", slotId: "home-out", reasonKey: "injury" },
                { type: "full_time", minute: 90, score: { home: 1, away: 0 } },
              ],
              tacticalContext: {
                home: { formation: "4-3-3", lateralFocus: "left" },
                away: { formation: "not_observed", lateralFocus: "balanced" },
                commands: [{
                  owner: "manager",
                  fact: {
                    type: "formation_change",
                    minute: 60,
                    side: "home",
                    fromFormation: "4-3-3",
                    toFormation: "4-2-3-1",
                  },
                }],
              },
            },
          },
        },
      },
      fixtureIds: ["fixture:played"],
    },
    clubCompetitiveTierState: {
      policyVersion: "club-competitive-tier-v1",
      seasonId: "season:2026",
      tierByClubId: {
        "club:home": "title_contender",
        "club:away": "playoff_contender",
      },
    },
    careerWorld: { worldSeed: "mapper-world", generatorVersion: 1, creationSourceKey: "test" },
    seniorSquadState: {
      registrations: {
        "registration:one": {
          id: "registration:one",
          playerId: "player:one",
          clubId: "club:home",
          shirtNumber: 1,
          registeredOn: 20_000,
        },
      },
      registrationIds: ["registration:one"],
      contracts: {
        "contract:one": {
          id: "contract:one",
          playerId: "player:one",
          clubId: "club:home",
          type: "professional",
          startsOn: 20_000,
          endsOn: 20_365,
          annualWage: 100_000_00,
          squadStatus: "squad_player",
          bonuses: { signingBonus: 1_000_00, appearanceBonus: 100_00 },
        },
      },
      contractIds: ["contract:one"],
      activeContractIds: ["contract:one"],
      contractHistory: {
        "contract-history:one": {
          id: "contract-history:one",
          sequenceNumber: 1,
          occurredOn: 20_000,
          event: "signed",
          contractId: "contract:one",
          playerId: "player:one",
          clubId: "club:home",
        },
        "contract-history:renewed": {
          id: "contract-history:renewed",
          sequenceNumber: 2,
          occurredOn: 20_010,
          event: "renewed",
          contractId: "contract:one",
          playerId: "player:one",
          clubId: "club:home",
        },
        "contract-history:transfer-terminated": {
          id: "contract-history:transfer-terminated",
          sequenceNumber: 3,
          occurredOn: 20_020,
          event: "transfer_terminated",
          contractId: "contract:one",
          playerId: "player:one",
          clubId: "club:home",
        },
        "contract-history:expired": {
          id: "contract-history:expired",
          sequenceNumber: 4,
          occurredOn: 20_030,
          event: "expired",
          contractId: "contract:one",
          playerId: "player:one",
          clubId: "club:home",
        },
        "contract-history:released": {
          id: "contract-history:released",
          sequenceNumber: 5,
          occurredOn: 20_040,
          event: "released",
          contractId: "contract:one",
          playerId: "player:one",
          clubId: "club:home",
        },
      },
      contractHistoryEntryIds: [
        "contract-history:one",
        "contract-history:renewed",
        "contract-history:transfer-terminated",
        "contract-history:expired",
        "contract-history:released",
      ],
    },
    clubFinanceState: {
      currency: "EUR",
      accounts: {
        "club:home": {
          clubId: "club:home",
          currency: "EUR",
          cashBalance: 2_000_000_00,
          annualTransferBudget: 500_000_00,
          availableTransferBudget: 500_000_00,
          annualWageBudget: 200_000_00,
          committedAnnualWage: 100_000_00,
          seasonIncome: 0,
          seasonExpenses: 0,
        },
      },
      clubIds: ["club:home"],
      ledgerEntries: {
        "ledger:opening": {
          id: "ledger:opening",
          sequenceNumber: 1,
          clubId: "club:home",
          occurredOn: 20_000,
          currency: "EUR",
          reason: "opening_capital",
          direction: "credit",
          amount: 2_000_000_00,
          balanceAfter: 2_000_000_00,
          referenceId: "mapper-fixture",
        },
      },
      ledgerEntryIds: ["ledger:opening"],
    },
    contractNegotiationState: {
      negotiations: {
        "contract-negotiation:one": {
          id: "contract-negotiation:one",
          playerId: "player:one",
          clubId: "club:home",
          currentContractId: "contract:one",
          createdOn: 20_010,
          status: "countered",
          submittedOffer: {
            submittedOn: 20_011,
            responseDueOn: 20_013,
            terms: negotiationTerms(120_000_00),
          },
          counterOffer: {
            issuedOn: 20_013,
            expiresOn: 20_027,
            terms: negotiationTerms(130_000_00),
            evaluation: {
              decision: "countered",
              scoreBasisPoints: 8_500,
              reasons: ["annual_wage_below_demand"],
              demand: {
                evaluatedOn: 20_013,
                age: 25,
                currentAbility: 10,
                publicPotentialP50Ability: 12,
                role: "central_midfielder",
                expectedSquadStatus: "squad_player",
                currentAnnualWage: 100_000_00,
                remainingContractDays: 352,
                clubReputation: 5,
                clubCategory: "third_division",
                freeAgentLeverageBasisPoints: 0,
                preferredTerms: negotiationTerms(140_000_00),
                minimumTerms: negotiationTerms(130_000_00),
              },
            },
          },
        },
      },
      negotiationIds: ["contract-negotiation:one"],
    },
    transferHistory: [{
      kind: "permanent_transfer",
      sequenceNumber: 1,
      occurredOn: 20_000,
      buyingClubId: "club:home",
      sellingClubId: "club:away",
      playerId: "player:one",
      publicValue: 90_000_000,
      initialAskingPrice: 110_000_000,
      offeredFee: 100_000_000,
      agreedFee: 100_000_000,
      completedFee: 100_000_000,
    }],
    currentSeasonInbox: [{
      id: "inbox:matchday:fixture:played",
      date: 20_100,
      category: "matchday",
      source: "technical_staff",
      level: "blocking",
      continuePolicy: "until_resolved",
      lifecycle: { read: true, acknowledged: false, resolved: false },
      related: {
        fixtureId: "fixture:played",
        contractId: "contract:one",
        contractNegotiationId: "contract-negotiation:one",
      },
      blockerKeys: ["missing_saved_tactic"],
      actionIds: ["prepare_match"],
    }],
    playerAvailability: {
      injuries: [{
        playerId: "player:one",
        fixtureId: "fixture:played",
        severity: "minor",
        occurredOn: 20_100,
        unavailableUntil: 20_106,
      }],
      suspensions: [{
        playerId: "player:bench",
        fixtureId: "fixture:played",
        competitionId: "competition:demo",
        reason: "straight_red",
        remainingMatches: 2,
      }],
      yellowCards: [{
        playerId: "player:one",
        competitionId: "competition:demo",
        count: 3,
      }],
    },
    playerParticipationLedger: {
      rows: {
        "season:2026|2026-08|player:one": {
          rowKey: "season:2026|2026-08|player:one",
          playerId: "player:one",
          seasonId: "season:2026",
          monthKey: "2026-08",
          starts: 1,
          substituteAppearances: 0,
          minutes: 90,
          ratingTotal: 7.1,
          ratingSamples: 1,
          playedRoleMinutes: { striker: 90 },
          clubMinutes: { "club:home": 90 },
          appliedFixtureIds: ["fixture:played"],
        },
      },
      rowKeys: ["season:2026|2026-08|player:one"],
      closedMonthKeys: ["season:2026|2026-08"],
    },
    youthAcademyState: {
      clubRosters: { "club:home": { clubId: "club:home", playerIds: ["player:youth"] } },
      clubRosterIds: ["club:home"],
      playerLifecycle: { "player:youth": { playerId: "player:youth", clubId: "club:home", status: "academy", academyEntrySeasonId: "season:2026", academyEntryDate: 20_000 } },
      playerLifecycleIds: ["player:youth"],
    },
    seasonHistory: [{
      sequenceNumber: 1,
      seasonId: "season:2025",
      competitionId: "competition:demo",
      finalTable: [tableRow()],
      championClubId: "club:home",
      selectedClubFinish: tableRow(),
      aggregateGoals: { fixtureCount: 1, totalGoals: 1 },
      playerStatistics: {
        participationCoverage: "complete",
        eventCoverage: "partial",
        rows: [{
          playerId: "player:retired",
          starts: 12,
          substituteAppearances: 3,
          minutes: 1_100,
          ratingTotal: 104.5,
          ratingSamples: 15,
          goals: 8,
          assists: 4,
          saves: 0,
        }],
      },
    }],
    matchPreparation: {
      selectedClubId: "club:home",
      targetFixtureId: "fixture:future",
      updatedAt: 20_100,
      selectedLineup: { clubId: "club:home", slots: [{ slotKey: "gk", playerId: "player:one", canonicalRole: "goalkeeper" }] },
      tactic: { mentality: "balanced", pressing: 0.5, directness: 0.5, width: 0.5, risk: 0.5 },
      baseFormationId: "4-4-2",
      boardSlots: [{ slotKey: "gk", nx: 0.5, ny: 0.92, roleKey: "POR" }],
      benchSlots: [{ slotKey: "bench:01", playerId: "player:bench" }],
    },
  } as unknown as CareerState;
}

/** Builds compact match statistics for one side. */
function sideStats(goals: number) {
  return { opportunities: goals, shots: goals, shotsOnTarget: goals, goals };
}

/** Builds one final-table row used in both ordered and selected-club fields. */
function tableRow() {
  return { position: 1, clubId: "club:home", played: 1, wins: 1, draws: 0, losses: 0, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, points: 3 };
}

/** Builds one complete supported offer term set for relational mapper coverage. */
function negotiationTerms(annualWage: number) {
  return {
    durationYears: 2,
    annualWage,
    squadStatus: "squad_player",
    bonuses: {
      signingBonus: 5_000_00,
      appearanceBonus: 500_00,
      goalBonus: 250_00,
    },
  };
}
