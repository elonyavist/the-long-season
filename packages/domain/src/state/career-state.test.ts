import { test } from "vitest";
import assert from "node:assert/strict";

import type { Club } from "../entities/club.entity.ts";
import type { Fixture } from "../entities/fixture.entity.ts";
import type { Player, PlayerAbilities, PlayerDynamicState } from "../entities/player.entity.ts";
import { TacticContractError } from "../entities/tactic.entity.ts";
import { clubId, competitionId, fixtureId, playerId, saveId, seasonId } from "../types/ids.ts";
import { gameDate } from "../value-objects/game-date.ts";
import { nonNegativeMoney } from "../value-objects/money.ts";
import { abilityValue, stateValue } from "../value-objects/rating.ts";
import { CAREER_WORLD_GENERATOR_VERSION } from "./career-world.ts";
import type { GameState } from "./game-state.ts";
import { YouthAcademyStateError, type YouthAcademyState } from "./youth-academy-state.ts";
import {
  CAREER_STATE_SCHEMA_VERSION,
  CareerStateContractError,
  createCareerState,
  nextTransferHistorySequence,
  type CareerState,
} from "./career-state.ts";
import { careerInboxMessageId, createCareerInboxMessage } from "../career/inbox.ts";
import {
  accruePlayerFixtureParticipation,
  createEmptyPlayerParticipationLedger,
} from "../career/player-participation.ts";
import { competitionIdForClub } from "../career/competition-world.ts";
import {
  CLUB_COMPETITIVE_TIER_POLICY_VERSION,
  ClubCompetitiveTierStateError,
} from "../career/club-competitive-tier.ts";

/**
 * Career-state tests cover durable domain shape only.
 *
 * Storage, market evaluation, transfer application, and CLI rendering are later
 * step responsibilities.
 */
test("createCareerState preserves a minimal durable career snapshot", () => {
  const gameState = gameStateFixture();
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const player18 = playerId("player:180010");

  const career = createCareerState({
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    careerWorld: {
      worldSeed: " scalata-001 ",
      generatorVersion: CAREER_WORLD_GENERATOR_VERSION,
      creationSourceKey: " career:cli-new-world ",
    },
    selectedClubId: pro01,
    gameState,
    transferHistory: [
      {
        kind: "permanent_transfer",
        sequenceNumber: 1,
        occurredOn: gameDate(20_000),
        buyingClubId: pro01,
        sellingClubId: pro18,
        playerId: player18,
        publicValue: nonNegativeMoney(1_400_000_00),
        initialAskingPrice: nonNegativeMoney(1_600_000_00),
        offeredFee: nonNegativeMoney(1_500_000_00),
        agreedFee: nonNegativeMoney(1_500_000_00),
        completedFee: nonNegativeMoney(1_500_000_00),
      },
    ],
  });

  assert.equal(career.saveId, "save:career-demo");
  assert.equal(career.selectedClubId, pro01);
  assert.equal(career.schemaVersion, CAREER_STATE_SCHEMA_VERSION);
  assert.deepEqual(career.careerWorld, {
    worldSeed: "scalata-001",
    generatorVersion: CAREER_WORLD_GENERATOR_VERSION,
    creationSourceKey: "career:cli-new-world",
  });
  assert.equal(career.transferHistory[0]?.playerId, player18);
  assert.equal(nextTransferHistorySequence(career), 2);
  assert.deepEqual(career.clubCompetitiveTierState, {
    policyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
    seasonId: seasonId("season:0001"),
    tierByClubId: {
      [pro01]: "title_contender",
      [pro18]: "title_contender",
    },
  });
  assert.equal(
    competitionIdForClub(career.gameState.domesticCompetitionWorld!, career.selectedClubId),
    "competition:0001",
  );
});

test("createCareerState rejects incomplete or stale competitive-tier snapshots", () => {
  const state = careerStateFixture();
  const pro01 = clubId("club:pro01");

  assert.throws(
    () => createCareerState({
      ...state,
      clubCompetitiveTierState: {
        policyVersion: CLUB_COMPETITIVE_TIER_POLICY_VERSION,
        seasonId: state.gameState.calendar.currentSeasonId,
        tierByClubId: { [pro01]: "title_contender" },
      },
    }),
    (error: unknown) => error instanceof ClubCompetitiveTierStateError
      && error.code === "competitive_tier_club_missing",
  );

  assert.throws(
    () => createCareerState({
      ...state,
      clubCompetitiveTierState: {
        ...state.clubCompetitiveTierState,
        seasonId: seasonId("season:stale"),
      },
    }),
    (error: unknown) => error instanceof ClubCompetitiveTierStateError
      && error.code === "competitive_tier_season_mismatch",
  );
});

test("createCareerState rejects unsupported schema versions", () => {
  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        schemaVersion: CAREER_STATE_SCHEMA_VERSION + 1,
      }),
    "unsupported_schema_version",
  );
});

test("createCareerState rejects missing or unordered selected clubs", () => {
  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        selectedClubId: clubId("club:missing"),
      }),
    "selected_club_not_found",
  );

  const gameState = gameStateFixture();
  const unorderedClubId = clubId("club:unordered");

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        selectedClubId: unorderedClubId,
        gameState: {
          ...gameState,
          clubs: {
            ...gameState.clubs,
            [unorderedClubId]: {
              id: unorderedClubId,
              name: "Unordered",
              shortName: "UNO",
              category: "third_division",
              reputation: 1,
              playerIds: [],
            },
          },
        },
      }),
    "selected_club_not_ordered",
  );
});

test("createCareerState rejects invalid transfer history references", () => {
  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        transferHistory: [
          {
            kind: "permanent_transfer",
            sequenceNumber: 0,
            occurredOn: gameDate(20_000),
            buyingClubId: clubId("club:pro01"),
            sellingClubId: clubId("club:pro18"),
            playerId: playerId("player:180010"),
            publicValue: nonNegativeMoney(1_400_000_00),
            initialAskingPrice: nonNegativeMoney(1_600_000_00),
            offeredFee: nonNegativeMoney(1_500_000_00),
            agreedFee: nonNegativeMoney(1_500_000_00),
            completedFee: nonNegativeMoney(1_500_000_00),
          },
        ],
      }),
    "invalid_history_sequence",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        transferHistory: [
          historyEntryFixture(1),
          historyEntryFixture(1),
        ],
      }),
    "duplicate_history_sequence",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        transferHistory: [
          {
            ...historyEntryFixture(1),
            playerId: playerId("player:missing"),
          },
        ],
      }),
    "history_player_not_found",
  );
});

test("createCareerState preserves saved selected-club match preparation", () => {
  const pro01 = clubId("club:pro01");
  const player01 = playerId("player:010010");
  const fixture = fixtureId("fixture:000001");

  const career = createCareerState({
    ...careerStateFixture(),
    matchPreparation: {
      selectedClubId: pro01,
      targetFixtureId: fixture,
      selectedLineup: {
        clubId: pro01,
        slots: [
          { slotKey: "st", playerId: player01, roleKey: "attacker" },
        ],
      },
      tactic: {
        mentality: "balanced",
        pressing: 0.5,
        directness: 0.5,
        width: 0.5,
        risk: 0.5,
      },
      baseFormationId: "4-4-2",
      boardSlots: [{ slotKey: "st", nx: 0.5, ny: 0.18, roleKey: "ATT" }],
      updatedAt: gameDate(20_000),
    },
  });

  assert.equal(career.matchPreparation?.selectedClubId, pro01);
  assert.equal(career.matchPreparation?.targetFixtureId, fixture);
  assert.equal(career.matchPreparation?.selectedLineup?.slots[0]?.playerId, player01);
  assert.equal(career.matchPreparation?.tactic?.mentality, "balanced");
  assert.equal(career.matchPreparation?.baseFormationId, "4-4-2");
  assert.deepEqual(career.matchPreparation?.boardSlots, [
    { slotKey: "st", nx: 0.5, ny: 0.18, roleKey: "ATT" },
  ]);
});

test("createCareerState preserves an unavailable owned player in the durable manager plan", () => {
  const base = careerStateFixture();
  const fixture = fixtureId("fixture:000001");
  const selectedPlayer = playerId("player:010010");
  const matchPreparation = {
    selectedClubId: base.selectedClubId,
    targetFixtureId: fixture,
    selectedLineup: {
      clubId: base.selectedClubId,
      slots: [{ slotKey: "st", playerId: selectedPlayer, roleKey: "attacker" }],
    },
    updatedAt: gameDate(20_000),
  } as const;
  const playerAvailability = {
    injuries: [{
      fixtureId: fixture,
      playerId: selectedPlayer,
      severity: "minor" as const,
      occurredOn: gameDate(19_999),
      unavailableUntil: gameDate(20_006),
    }],
    suspensions: [],
    yellowCards: [],
  };

  const preserved = createCareerState({ ...base, matchPreparation, playerAvailability });
  assert.equal(preserved.matchPreparation?.selectedLineup?.slots[0]?.playerId, selectedPlayer);
  assert.equal(preserved.playerAvailability?.injuries[0]?.playerId, selectedPlayer);
});

test("createCareerState preserves ordered substitutes and rejects XI overlap", () => {
  const fixture = careerStateFixture();
  const selectedClubId = fixture.selectedClubId;
  const substituteId = playerId("player:010099");
  const selectedClub = fixture.gameState.clubs[selectedClubId];
  if (selectedClub === undefined) throw new Error("Expected selected club fixture");
  const gameState = {
    ...fixture.gameState,
    clubs: {
      ...fixture.gameState.clubs,
      [selectedClubId]: { ...selectedClub, playerIds: [...selectedClub.playerIds, substituteId] },
    },
  };
  const preparation = {
    selectedClubId,
    selectedLineup: {
      clubId: selectedClubId,
      slots: [{ slotKey: "st", playerId: playerId("player:010010"), roleKey: "striker" }],
    },
    benchSlots: [{ slotKey: "bench:01", playerId: substituteId }],
    updatedAt: gameDate(20_000),
  } as const;

  const career = createCareerState({ ...fixture, gameState, matchPreparation: preparation });
  assert.deepEqual(career.matchPreparation?.benchSlots, preparation.benchSlots);

  assertCareerStateError(
    () => createCareerState({
      ...fixture,
      gameState,
      matchPreparation: {
        ...preparation,
        benchSlots: [{ slotKey: "bench:01", playerId: playerId("player:010010") }],
      },
    }),
    "match_preparation_bench_lineup_overlap",
  );
});

test("createCareerState rejects invalid normalized tactical-board geometry", () => {
  assertCareerStateError(
    () => createCareerState({
      ...careerStateFixture(),
      matchPreparation: {
        selectedClubId: clubId("club:pro01"),
        selectedLineup: {
          clubId: clubId("club:pro01"),
          slots: [{ slotKey: "st", playerId: playerId("player:010010"), roleKey: "striker" }],
        },
        boardSlots: [{ slotKey: "st", nx: 1.1, ny: 0.2, roleKey: "ATT" }],
        updatedAt: gameDate(20_000),
      },
    }),
    "match_preparation_invalid_board_coordinate",
  );
});

test("createCareerState preserves compact completed-season history", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");

  const career = createCareerState({
    ...careerStateFixture(),
    seasonHistory: [
      {
        sequenceNumber: 1,
        seasonId: seasonId("season:0001"),
        competitionId: competitionId("competition:0001"),
        finalTable: [
          leagueTableRowFixture(1, pro01, 3),
          leagueTableRowFixture(2, pro18, 0),
        ],
        championClubId: pro01,
        selectedClubFinish: leagueTableRowFixture(1, pro01, 3),
        aggregateGoals: {
          fixtureCount: 1,
          totalGoals: 2,
        },
      },
    ],
  });

  assert.equal(career.seasonHistory?.[0]?.seasonId, "season:0001");
  assert.equal(career.seasonHistory?.[0]?.championClubId, pro01);
  assert.equal(career.seasonHistory?.[0]?.selectedClubFinish.clubId, pro01);
  assert.deepEqual(career.seasonHistory?.[0]?.aggregateGoals, { fixtureCount: 1, totalGoals: 2 });
  assert.deepEqual(career.seasonHistory?.[0]?.playerStatistics, {
    participationCoverage: "unavailable",
    eventCoverage: "unavailable",
    rows: [],
  });
});

test("createCareerState preserves archived statistics for players outside the active world", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const retiredPlayerId = playerId("player:retired");

  const career = createCareerState({
    ...careerStateFixture(),
    seasonHistory: [
      {
        sequenceNumber: 1,
        seasonId: seasonId("season:0001"),
        competitionId: competitionId("competition:0001"),
        finalTable: [
          leagueTableRowFixture(1, pro01, 3),
          leagueTableRowFixture(2, pro18, 0),
        ],
        championClubId: pro01,
        selectedClubFinish: leagueTableRowFixture(1, pro01, 3),
        aggregateGoals: { fixtureCount: 1, totalGoals: 2 },
        playerStatistics: {
          participationCoverage: "complete",
          eventCoverage: "complete",
          rows: [{
            playerId: retiredPlayerId,
            starts: 1,
            substituteAppearances: 0,
            minutes: 90,
            ratingTotal: 7.5,
            ratingSamples: 1,
            goals: 1,
            assists: 0,
            saves: 0,
          }],
        },
      },
    ],
  });

  assert.equal(career.gameState.players[retiredPlayerId], undefined);
  assert.equal(career.seasonHistory?.[0]?.playerStatistics?.rows[0]?.playerId, retiredPlayerId);
});

test("createCareerState keeps old saves without season history valid", () => {
  const career = createCareerState(careerStateFixture());

  assert.equal(career.seasonHistory, undefined);
});

test("createCareerState defaults legacy saves to an empty current-season Inbox", () => {
  const career = createCareerState(careerStateFixture());

  assert.deepEqual(career.currentSeasonInbox, []);
});

test("createCareerState preserves ordered Inbox lifecycle and validates references", () => {
  const fixture = careerStateFixture();
  const message = createCareerInboxMessage({
    id: careerInboxMessageId("inbox:matchday:fixture:000001"),
    date: fixture.gameState.calendar.currentDate,
    category: "matchday",
    source: "technical_staff",
    level: "blocking",
    lifecycle: { read: true, acknowledged: false, resolved: false },
    related: {
      fixtureId: fixtureId("fixture:000001"),
      clubId: fixture.selectedClubId,
    },
    blockerKeys: ["missing_saved_tactic"],
    actionIds: ["prepare_match"],
  });
  const career = createCareerState({ ...fixture, currentSeasonInbox: [message] });

  assert.deepEqual(career.currentSeasonInbox, [message]);
  assertCareerStateError(
    () => createCareerState({ ...fixture, currentSeasonInbox: [message, message] }),
    "duplicate_inbox_message",
  );
  assertCareerStateError(
    () => createCareerState({
      ...fixture,
      currentSeasonInbox: [{
        ...message,
        id: careerInboxMessageId("inbox:matchday:fixture:missing"),
        related: { fixtureId: fixtureId("fixture:missing") },
      }],
    }),
    "inbox_fixture_not_found",
  );
});

test("createCareerState preserves a valid player participation ledger", () => {
  const contribution = {
    fixtureId: fixtureId("fixture:000001"),
    playerId: playerId("player:010010"),
    clubId: clubId("club:pro01"),
    seasonId: seasonId("season:0001"),
    monthKey: "2026-08",
    started: true,
    substituteAppearance: false,
    minutes: 90,
    rating: 7.4,
    playedRoleMinutes: { striker: 90 },
  } as const;
  const ledger = accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), contribution);
  const career = createCareerState({ ...careerStateFixture(), playerParticipationLedger: ledger });

  assert.deepEqual(career.playerParticipationLedger, ledger);
  assert.notEqual(career.playerParticipationLedger, ledger);
});

test("createCareerState rejects participation rows for unknown players", () => {
  const ledger = accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), {
    fixtureId: fixtureId("fixture:000001"),
    playerId: playerId("player:missing"),
    clubId: clubId("club:pro01"),
    seasonId: seasonId("season:0001"),
    monthKey: "2026-08",
    started: true,
    substituteAppearance: false,
    minutes: 90,
    rating: 7.4,
    playedRoleMinutes: { striker: 90 },
  });

  assertCareerStateError(
    () => createCareerState({ ...careerStateFixture(), playerParticipationLedger: ledger }),
    "player_participation_player_not_found",
  );
});

test("createCareerState rejects participation rows for unknown represented clubs", () => {
  const ledger = accruePlayerFixtureParticipation(createEmptyPlayerParticipationLedger(), {
    fixtureId: fixtureId("fixture:000001"),
    playerId: playerId("player:010010"),
    clubId: clubId("club:missing"),
    seasonId: seasonId("season:0001"),
    monthKey: "2026-08",
    started: true,
    substituteAppearance: false,
    minutes: 90,
    rating: 7.4,
    playedRoleMinutes: { striker: 90 },
  });

  assertCareerStateError(
    () => createCareerState({ ...careerStateFixture(), playerParticipationLedger: ledger }),
    "player_participation_club_not_found",
  );
});

test("createCareerState preserves optional youth academy state", () => {
  const career = createCareerState({
    ...careerStateFixture(),
    youthAcademyState: youthAcademyStateFixture(),
  });

  assert.equal(career.youthAcademyState?.clubRosterIds[0], "club:pro01");
  assert.deepEqual(career.youthAcademyState?.clubRosters[clubId("club:pro01")]?.playerIds, [playerId("player:010099")]);
  assert.equal(career.youthAcademyState?.playerLifecycle[playerId("player:010099")]?.status, "academy");
});

test("createCareerState keeps old saves without youth academy state valid", () => {
  const career = createCareerState(careerStateFixture());

  assert.equal(career.youthAcademyState, undefined);
});

test("createCareerState rejects invalid youth academy references", () => {
  assertYouthAcademyStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        youthAcademyState: {
          ...youthAcademyStateFixture(),
          clubRosters: {
            [clubId("club:pro01")]: {
              clubId: clubId("club:pro01"),
              playerIds: [playerId("player:010010")],
            },
          },
        },
      }),
    "youth_player_already_senior",
  );

  assertYouthAcademyStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        youthAcademyState: {
          ...youthAcademyStateFixture(),
          playerLifecycle: {},
        },
      }),
    "lifecycle_not_found",
  );

  assertYouthAcademyStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        youthAcademyState: {
          ...youthAcademyStateFixture(),
          playerLifecycle: {
            [playerId("player:010099")]: {
              ...youthAcademyLifecycleFixture(playerId("player:010099"), clubId("club:pro01")),
              status: "released",
            },
          },
        },
      }),
    "lifecycle_inactive_player_still_rostered",
  );
});

test("createCareerState rejects invalid season history", () => {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const validEntry = {
    sequenceNumber: 1,
    seasonId: seasonId("season:0001"),
    competitionId: competitionId("competition:0001"),
    finalTable: [
      leagueTableRowFixture(1, pro01, 3),
      leagueTableRowFixture(2, pro18, 0),
    ],
    championClubId: pro01,
    selectedClubFinish: leagueTableRowFixture(1, pro01, 3),
    aggregateGoals: {
      fixtureCount: 1,
      totalGoals: 2,
    },
  };

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        seasonHistory: [{ ...validEntry, sequenceNumber: 0 }],
      }),
    "invalid_season_history_sequence",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        seasonHistory: [validEntry, validEntry],
      }),
    "duplicate_season_history_sequence",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        seasonHistory: [{ ...validEntry, finalTable: [] }],
      }),
    "season_history_final_table_empty",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        seasonHistory: [{ ...validEntry, championClubId: pro18 }],
      }),
    "season_history_champion_not_first",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        seasonHistory: [
          {
            ...validEntry,
            aggregateGoals: {
              fixtureCount: -1,
              totalGoals: 2,
            },
          },
        ],
      }),
    "season_history_invalid_aggregate_goals",
  );
});

test("createCareerState rejects invalid match-preparation references", () => {
  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        matchPreparation: {
          selectedClubId: clubId("club:pro18"),
          updatedAt: gameDate(20_000),
        },
      }),
    "match_preparation_selected_club_mismatch",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        matchPreparation: {
          selectedClubId: clubId("club:pro01"),
          targetFixtureId: fixtureId("fixture:missing"),
          updatedAt: gameDate(20_000),
        },
      }),
    "match_preparation_fixture_not_found",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        matchPreparation: {
          selectedClubId: clubId("club:pro01"),
          selectedLineup: {
            clubId: clubId("club:pro01"),
            slots: [
              { slotKey: "st", playerId: playerId("player:missing"), roleKey: "attacker" },
            ],
          },
          updatedAt: gameDate(20_000),
        },
      }),
    "match_preparation_player_not_found",
  );

  assertCareerStateError(
    () =>
      createCareerState({
        ...careerStateFixture(),
        matchPreparation: {
          selectedClubId: clubId("club:pro01"),
          selectedLineup: {
            clubId: clubId("club:pro01"),
            slots: [
              { slotKey: "st", playerId: playerId("player:180010"), roleKey: "attacker" },
            ],
          },
          updatedAt: gameDate(20_000),
        },
      }),
    "match_preparation_player_not_owned",
  );
});

test("createCareerState rejects ambiguous lineup and invalid tactic values", () => {
  assert.throws(
    () =>
      createCareerState({
        ...careerStateFixture(),
        matchPreparation: {
          selectedClubId: clubId("club:pro01"),
          selectedLineup: {
            clubId: clubId("club:pro01"),
            slots: [
              { slotKey: "st-left", playerId: playerId("player:010010"), roleKey: "attacker" },
              { slotKey: "st-right", playerId: playerId("player:010010"), roleKey: "attacker" },
            ],
          },
          updatedAt: gameDate(20_000),
        },
      }),
    (error) => error instanceof TacticContractError && error.code === "duplicate_player",
  );

  assert.throws(
    () =>
      createCareerState({
        ...careerStateFixture(),
        matchPreparation: {
          selectedClubId: clubId("club:pro01"),
          tactic: {
            mentality: "balanced",
            pressing: 2,
            directness: 0.5,
            width: 0.5,
            risk: 0.5,
          },
          updatedAt: gameDate(20_000),
        },
      }),
    (error) => error instanceof TacticContractError && error.code === "invalid_tactic_value",
  );
});

/** Builds a valid career-state fixture for mutation inside tests. */
function careerStateFixture(): CareerState {
  return createCareerState({
    saveId: saveId("save:career-demo"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: clubId("club:pro01"),
    gameState: gameStateFixture(),
    transferHistory: [],
  });
}

/** Builds a valid history entry fixture. */
function historyEntryFixture(sequenceNumber: number): CareerState["transferHistory"][number] {
  return {
    kind: "permanent_transfer",
    sequenceNumber,
    occurredOn: gameDate(20_000),
    buyingClubId: clubId("club:pro01"),
    sellingClubId: clubId("club:pro18"),
    playerId: playerId("player:180010"),
    publicValue: nonNegativeMoney(1_400_000_00),
    initialAskingPrice: nonNegativeMoney(1_600_000_00),
    offeredFee: nonNegativeMoney(1_500_000_00),
    agreedFee: nonNegativeMoney(1_500_000_00),
    completedFee: nonNegativeMoney(1_500_000_00),
  };
}

/** Builds a minimal game snapshot containing two clubs and two players. */
function gameStateFixture(): GameState {
  const pro01 = clubId("club:pro01");
  const pro18 = clubId("club:pro18");
  const player01 = playerId("player:010010");
  const youth01 = playerId("player:010099");
  const player18 = playerId("player:180010");
  const fixture = fixtureId("fixture:000001");

  const clubs: Record<Club["id"], Club> = {
    [pro01]: {
      id: pro01,
      name: "PRO01",
      shortName: "PRO01",
      category: "third_division",
      reputation: 5,
      playerIds: [player01],
    },
    [pro18]: {
      id: pro18,
      name: "PRO18",
      shortName: "PRO18",
      category: "third_division",
      reputation: 2,
      playerIds: [player18],
    },
  };

  const players: Record<Player["id"], Player> = {
    [player01]: playerFixture(player01, "Player01"),
    [youth01]: playerFixture(youth01, "Youth01"),
    [player18]: playerFixture(player18, "Player18"),
  };

  const playerStates: Record<Player["id"], PlayerDynamicState> = {
    [player01]: playerStateFixture(),
    [youth01]: playerStateFixture(),
    [player18]: playerStateFixture(),
  };

  const fixtures: Record<Fixture["id"], Fixture> = {
    [fixture]: {
      id: fixture,
      competitionId: competitionId("competition:0001"),
      seasonId: seasonId("season:0001"),
      roundNumber: 1,
      date: gameDate(20_000),
      homeClubId: pro01,
      awayClubId: pro18,
    },
  };

  return {
    meta: {
      seed: "demo-001",
      rngAlgorithmVersion: "sfc32-v1",
      saveSchemaVersion: 1,
      calibrationVersions: calibrationVersionsFixture(),
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: seasonId("season:0001"),
    },
    players,
    playerIds: [player01, youth01, player18],
    playerStates,
    clubs,
    clubIds: [pro01, pro18],
    fixtures,
    fixtureIds: [fixture],
    domesticCompetitionWorld: {
      competitionIds: [competitionId("competition:0001")],
      competitions: {
        [competitionId("competition:0001")]: {
          id: competitionId("competition:0001"),
          name: "Test League",
          clubIds: [pro01, pro18],
          matchRules: {
            maximumSubstitutions: 5,
            substitutionWindowLimit: null,
            allowsPlayerReentry: false,
            yellowCardAccumulationThreshold: 5,
            straightRedSuspensionMatches: 3,
            secondYellowSuspensionMatches: 1,
            yellowAccumulationSuspensionMatches: 1,
          },
        },
      },
      seasonHistory: [],
    },
  };
}

function calibrationVersionsFixture() {
  return {
    topologyDecisionId: "fictional-three-tier-v1",
    playerRatingScaleVersion: "rating-v1",
    playerMarketCalibrationVersion: "market-v1",
    valuationCurvesVersion: "valuation-v1",
    askingPriceCurvesVersion: "asking-v1",
    marketBehaviorCalibrationVersion: "behavior-v1",
    wageFinanceCalibrationVersion: "wage-v1",
    playerDevelopmentEnvironmentVersion: "development-environment-v1",
  } as const;
}

/** Builds a minimal valid youth-academy state fixture. */
function youthAcademyStateFixture(): YouthAcademyState {
  const pro01 = clubId("club:pro01");
  const youth01 = playerId("player:010099");

  return {
    clubRosters: {
      [pro01]: {
        clubId: pro01,
        playerIds: [youth01],
      },
    },
    clubRosterIds: [pro01],
    playerLifecycle: {
      [youth01]: youthAcademyLifecycleFixture(youth01, pro01),
    },
    playerLifecycleIds: [youth01],
  };
}

/** Builds a compact youth lifecycle row for domain tests. */
function youthAcademyLifecycleFixture(playerIdValue: Player["id"], clubIdValue: Club["id"]): YouthAcademyState["playerLifecycle"][Player["id"]] {
  return {
    playerId: playerIdValue,
    clubId: clubIdValue,
    status: "academy",
    academyEntrySeasonId: seasonId("season:0001"),
    academyEntryDate: gameDate(20_000),
  };
}

/** Builds a compact player fixture. */
function playerFixture(id: Player["id"], firstName: string): Player {
  return {
    id,
    firstName,
    lastName: "No10",
    birthDate: gameDate(10_000),
    naturalPositions: ["st"],
    abilities: abilitySet(10),
    potential: abilitySet(12),
  };
}

/** Builds a complete ability object with the same value everywhere. */
function abilitySet(value: number): PlayerAbilities {
  const ability = abilityValue(value);

  return {
    technical: {
      finishing: ability,
      passing: ability,
      longPassing: ability,
      crossing: ability,
      dribbling: ability,
      technique: ability,
      tackling: ability,
      penalties: ability,
      freeKicks: ability,
    },
    physical: {
      pace: ability,
      strength: ability,
      stamina: ability,
      agility: ability,
      heading: ability,
    },
    mental: {
      positioning: ability,
      vision: ability,
      anticipation: ability,
      composure: ability,
      determination: ability,
      leadership: ability,
    },
    goalkeeping: {
      reflexes: ability,
      handling: ability,
      rushingOut: ability,
      goalkeeperPositioning: ability,
      footwork: ability,
    },
  };
}

/** Builds the default dynamic state used by tests. */
function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

/** Builds a compact final-table row for season-history tests. */
function leagueTableRowFixture(
  position: number,
  tableClubId: Club["id"],
  points: number,
): NonNullable<CareerState["seasonHistory"]>[number]["finalTable"][number] {
  return {
    position,
    clubId: tableClubId,
    played: 1,
    wins: points === 3 ? 1 : 0,
    draws: 0,
    losses: points === 0 ? 1 : 0,
    goalsFor: points === 3 ? 2 : 0,
    goalsAgainst: points === 0 ? 2 : 0,
    goalDifference: points === 3 ? 2 : -2,
    points,
  };
}

/** Asserts a typed career-state failure and its machine-readable code. */
function assertCareerStateError(
  action: () => void,
  code: CareerStateContractError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof CareerStateContractError && error.code === code,
  );
}

/** Asserts a typed youth-academy validation failure and its code. */
function assertYouthAcademyStateError(
  action: () => void,
  code: YouthAcademyStateError["code"],
): void {
  assert.throws(
    action,
    (error) => error instanceof YouthAcademyStateError && error.code === code,
  );
}
