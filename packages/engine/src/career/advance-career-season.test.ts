import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CAREER_STATE_SCHEMA_VERSION,
  MATCH_EVENT_SCHEMA_VERSION,
  abilityValue,
  accruePlayerFixtureParticipation,
  clubId,
  competitionId,
  createCareerState,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type Club,
  type ClubId,
  type Fixture,
  type GameState,
  type LeagueTableRules,
  type MatchReport,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";
import { addDays } from "@game/shared";

import {
  advanceCareerOneSeason as advanceCareerOneSeasonWithPolicy,
} from "./advance-career-season.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { playerDevelopmentEnvironmentConfigFixture } from "../test-fixtures/player-development-environment-config.ts";

function advanceCareerOneSeason(
  input: Omit<
    Parameters<typeof advanceCareerOneSeasonWithPolicy>[0],
    | "wagePolicy"
    | "marketBehaviorPolicy"
    | "valuationConfig"
    | "playerDevelopmentEnvironmentConfig"
  >,
) {
  return advanceCareerOneSeasonWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
    valuationConfig: playerValuationConfigFixture(),
    playerDevelopmentEnvironmentConfig:
      playerDevelopmentEnvironmentConfigFixture(),
  });
}

/**
 * Canonical season-advancement tests protect the single engine use-case that
 * future CLI and web adapters must call instead of reimplementing rollover.
 */

const TABLE_RULES: LeagueTableRules = {
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
};

test("advanceCareerOneSeason advances a completed durable season through the documented operation order", () => {
  const state = completedCareerStateFixture();

  const result = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "canonical-advancement-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.deepEqual(result.facts.operationOrder, [
      "completed_season_validation",
      "season_archive",
      "monthly_lifecycle",
      "player_exits",
      "youth_lifecycle",
      "youth_intake",
      "youth_promotion",
      "squad_maintenance",
      "post_transfer_squad_maintenance",
      "next_calendar_merge",
      "club_competitive_tier_freeze",
      "player_state_rollover",
      "season_inbox_delivery",
    ]);
    assert.equal(result.facts.selectedClubId, "club:selected");
    assert.equal(result.facts.previousSeasonId, "season:0001");
    assert.equal(result.facts.nextSeasonId, "season:0002");
    assert.equal(result.facts.playerDevelopment.changeCount, 0);
    assert.equal(result.facts.playerExits.exitCount, 0);
    assert.equal(result.facts.youthLifecycle.recordCount, 0);
    assert.equal(result.facts.youthLifecycle.promotionCandidateCount, 0);
    assert.equal(result.facts.youthLifecycle.externalMoveCandidateCount, 0);
    assert.equal(result.facts.youthLifecycle.releasedCount, 0);
    assert.equal(result.facts.youthIntake.acceptedPlayerCount, 0);
    assert.equal(result.facts.youthIntake.skippedPlayerCount, 0);
    assert.deepEqual(result.facts.youthIntake.acceptedPlayerIds, []);
    assert.deepEqual(result.facts.youthIntake.skippedPlayerIds, []);
    assert.equal(result.facts.youthPromotions.promotedCount, 0);
    assert.equal(result.facts.squadMaintenance.warningCount > 0, true);
    assert.equal(result.facts.transferTurnover.transferCount, 0);
    assert.equal(result.facts.squadHealth.seniorPlayerCount, 8);
    assert.equal(result.facts.youthHealth.activePlayerCount, 8);
    assert.equal(result.facts.seasonArchive?.championClubId, "club:selected");
    assert.equal(result.facts.clubCompetitiveTiers.length, 2);
    assert.ok(result.facts.clubCompetitiveTiers.every(
      (fact) => fact.calculation === "carried_forward",
    ));
    assert.equal(result.careerState.gameState.calendar.currentSeasonId, "season:0002");
    assert.equal(result.careerState.clubCompetitiveTierState.seasonId, "season:0002");
    assert.equal(result.careerState.gameState.calendar.currentDate, gameDate(addDays(gameDate(20_007), 70)));
    assert.equal(result.careerState.seasonHistory?.length, 1);
    assert.equal(result.careerState.matchPreparation, undefined);
    assert.deepEqual(result.careerState.currentSeasonInbox, [{
      id: "inbox:season-rollover:season:0002",
      date: gameDate(addDays(gameDate(20_007), 70)),
      category: "season_rollover",
      source: "competition_office",
      level: "important",
      continuePolicy: "until_acknowledged",
      lifecycle: { read: false, acknowledged: false, resolved: false },
      related: { clubId: "club:selected" },
      blockerKeys: [],
      actionIds: [],
    }]);
    assert.equal(result.careerState.gameState.fixtureIds.includes(fixtureId("fixture:000003")), true);
  }
});

test("advanceCareerOneSeason archives player statistics before participation reset", () => {
  const baseState = completedCareerStateFixture();
  const playedFixtureId = fixtureId("fixture:000001");
  const scorerPlayerId = playerId("player:selected-st");
  const fixture = baseState.gameState.fixtures[playedFixtureId]!;
  const report: MatchReport = {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: playedFixtureId,
    finalMinute: 90,
    score: { home: 2, away: 0 },
    stats: {
      home: { opportunities: 2, shots: 2, shotsOnTarget: 2, goals: 2 },
      away: { opportunities: 0, shots: 0, shotsOnTarget: 0, goals: 0 },
    },
    events: [{
      type: "goal",
      shot: {
        minute: 25,
        side: "home",
        quality: 0.7,
        expectedGoals: 0.49,
        isShotOnTarget: true,
        shotType: "normal",
        chanceType: "open_play",
      },
      scorerPlayerId,
    }],
    tacticalContext: {
      home: { formation: "4-3-3", lateralFocus: "balanced" },
      away: { formation: "4-4-2", lateralFocus: "balanced" },
      commands: [],
    },
  };
  const playerParticipationLedger = accruePlayerFixtureParticipation(
    createEmptyPlayerParticipationLedger(),
    {
      fixtureId: playedFixtureId,
      playerId: scorerPlayerId,
      clubId: clubId("club:selected"),
      seasonId: seasonId("season:0001"),
      monthKey: "2024-10",
      started: true,
      substituteAppearance: false,
      minutes: 90,
      rating: 8,
      playedRoleMinutes: { striker: 90 },
    },
  );
  const state = createCareerState({
    ...baseState,
    gameState: {
      ...baseState.gameState,
      fixtures: {
        ...baseState.gameState.fixtures,
        [playedFixtureId]: {
          ...fixture,
          result: {
            ...fixture.result!,
            report,
          },
        },
      },
    },
    playerParticipationLedger,
  });

  const result = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "player-statistics-archive-world",
    mode: { kind: "completedSeason", tableRules: TABLE_RULES },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    const statistics = result.careerState.seasonHistory?.[0]?.playerStatistics;
    const row = statistics?.rows.find((candidate) => candidate.playerId === scorerPlayerId);
    assert.equal(statistics?.participationCoverage, "partial");
    assert.equal(statistics?.eventCoverage, "partial");
    assert.deepEqual(row, {
      playerId: scorerPlayerId,
      starts: 1,
      substituteAppearances: 0,
      minutes: 90,
      ratingTotal: 8,
      ratingSamples: 1,
      goals: 1,
      assists: 0,
      saves: 0,
    });
    assert.equal(result.careerState.playerParticipationLedger?.rowKeys.length, 0);
  }
});

test("advanceCareerOneSeason flushes residual youth participation through the canonical development owner", () => {
  const youthId = playerId("player:selected-youth");
  const state = careerStateWithYouthParticipation(youthId);
  const finishingBefore = Number(
    state.gameState.players[youthId]?.abilities.technical.finishing,
  );

  const result = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "youth-residual-flush-world",
    mode: { kind: "completedSeason", tableRules: TABLE_RULES },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.equal(result.facts.playerDevelopment.changeCount, 1);
    assert.equal(result.facts.youthLifecycle.recordCount, 0);
    assert.equal(
      Number(
        result.careerState.gameState.players[youthId]?.abilities.technical
          .finishing,
      ) > finishingBefore,
      true,
    );
    assert.equal(
      result.careerState.youthAcademyState?.clubRosters[
        clubId("club:selected")
      ]?.playerIds.includes(youthId),
      true,
    );
  }
});

test("the observed season reports exactly the development months its lifecycle closed", () => {
  const youthId = playerId("player:selected-youth");
  const input = {
    careerState: careerStateWithYouthParticipation(youthId),
    worldSeed: "youth-residual-flush-world",
    mode: { kind: "completedSeason", tableRules: TABLE_RULES },
  } as const;

  const unobserved = advanceCareerOneSeason(input);
  const observed = advanceCareerOneSeason({
    ...input,
    observeMonthlyDevelopmentForPlayerIds: [youthId],
  });

  assert.equal(unobserved.status, "advanced");
  assert.equal(observed.status, "advanced");
  if (unobserved.status !== "advanced" || observed.status !== "advanced") return;

  // An unobserved season must stay structurally identical to one produced
  // before this seam existed: the month record is observation, not a product
  // fact, and a caller that never asked for it must not receive it.
  assert.equal(unobserved.closedDevelopmentMonthKeys, undefined);

  const closedMonthKeys = observed.closedDevelopmentMonthKeys ?? [];
  assert.ok(closedMonthKeys.length > 0);
  // Chronological and closed exactly once. A repeated month would silently
  // double whatever a consumer charges against it.
  assert.deepEqual([...closedMonthKeys], [...new Set(closedMonthKeys)].toSorted());
  // The binding claim: development happens only inside a closed checkpoint, so
  // a consumer may treat this list as the complete set of months in which
  // development was possible, and charge nothing outside it.
  for (const { change } of observed.monthlyDevelopmentObservations ?? []) {
    assert.ok(closedMonthKeys.includes(change.monthKey), change.monthKey);
  }
  assert.equal(
    unobserved.facts.playerDevelopment.changeCount,
    observed.facts.playerDevelopment.changeCount,
  );
});

test("advanceCareerOneSeason facts are enough for an adapter report without rerunning season rules", () => {
  const result = advanceCareerOneSeason({
    careerState: completedCareerStateFixture(),
    worldSeed: "adapter-facts-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    const adapterReport = factsOnlyReport(result.facts);

    assert.deepEqual(adapterReport, {
      selectedClubId: "club:selected",
      season: {
        from: "season:0001",
        to: "season:0002",
        startDate: gameDate(addDays(gameDate(20_007), 70)),
      },
      archive: {
        championClubId: "club:selected",
        selectedClubPosition: 1,
        fixtureCount: 2,
        totalGoals: 3,
      },
      activity: {
        developmentRows: 0,
        playerExits: 0,
        youthLifecycleRows: 0,
        youthPromotionCandidates: 0,
        youthPromotions: 0,
        seniorAdds: 0,
        transfers: 0,
      },
      health: {
        seniorPlayers: 8,
        activePlayers: 8,
        clubsBelowMinimumSquadSize: 2,
        clubsWithoutNaturalGoalkeeper: 0,
      },
      warnings: [],
    });
  }
});

test("advanceCareerOneSeason is deterministic and does not mutate the input career state", () => {
  const state = completedCareerStateFixture();
  const snapshot = structuredClone(state);

  const first = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "same-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });
  const second = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "same-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.deepEqual(first, second);
  assert.deepEqual(state, snapshot);
});

test("advanceCareerOneSeason returns an invalid result for an incomplete durable season", () => {
  const unplayedFixtureId = fixtureId("fixture:000002");
  const result = advanceCareerOneSeason({
    careerState: incompleteCareerStateFixture(unplayedFixtureId),
    worldSeed: "canonical-advancement-world",
    mode: {
      kind: "completedSeason",
      tableRules: TABLE_RULES,
    },
  });

  assert.deepEqual(result, {
    status: "invalid",
    careerState: incompleteCareerStateFixture(unplayedFixtureId),
    reason: "current_season_incomplete",
    fixtureId: unplayedFixtureId,
  });
});

test("advanceCareerOneSeason supports report refresh without completed-season archive work", () => {
  const state = incompleteCareerStateFixture(fixtureId("fixture:000002"));

  const result = advanceCareerOneSeason({
    careerState: state,
    worldSeed: "report-refresh-world",
    mode: {
      kind: "reportRefresh",
      nextSeasonId: seasonId("season:report-0002"),
      nextSeasonStartDate: gameDate(20_365),
      competitionResults: [],
    },
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.deepEqual(result.facts.operationOrder, [
      "monthly_lifecycle",
      "player_exits",
      "youth_lifecycle",
      "youth_intake",
      "youth_promotion",
      "squad_maintenance",
      "post_transfer_squad_maintenance",
      "club_competitive_tier_freeze",
      "player_state_rollover",
    ]);
    assert.equal(result.facts.seasonArchive, undefined);
    assert.equal(result.careerState.seasonHistory, undefined);
    assert.equal(result.careerState.gameState.calendar.currentSeasonId, "season:report-0002");
    assert.equal(result.careerState.clubCompetitiveTierState.seasonId, "season:report-0002");
    assert.equal(result.careerState.gameState.calendar.currentDate, gameDate(20_365));
  }
});

test("report refresh rejects duplicate competition results before advancement", () => {
  const state = incompleteCareerStateFixture(fixtureId("fixture:000002"));
  const duplicateCompetitionId = competitionId("competition:duplicate");
  const finalTable = [{
    position: 1,
    clubId: clubId("club:selected"),
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }];

  assert.throws(
    () => advanceCareerOneSeason({
      careerState: state,
      worldSeed: "duplicate-report-competition-world",
      mode: {
        kind: "reportRefresh",
        nextSeasonId: seasonId("season:report-0002"),
        nextSeasonStartDate: gameDate(20_365),
        competitionResults: [
          { competitionId: duplicateCompetitionId, finalTable },
          { competitionId: duplicateCompetitionId, finalTable },
        ],
      },
    }),
    /duplicate competition evidence/,
  );
  assert.deepEqual(state, incompleteCareerStateFixture(fixtureId("fixture:000002")));
});

test("report refresh rejects partial, reordered, and mismatched competition evidence", () => {
  const state = reportCompetitionCareerStateFixture();
  const snapshot = structuredClone(state);
  const firstCompetitionId = competitionId("competition:report:first");
  const secondCompetitionId = competitionId("competition:report:second");
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const firstResult = {
    competitionId: firstCompetitionId,
    finalTable: [reportTableRow(selectedClubId)],
  } as const;
  const secondResult = {
    competitionId: secondCompetitionId,
    finalTable: [reportTableRow(otherClubId)],
  } as const;

  for (const [label, competitionResults, pattern] of [
    [
      "partial",
      [firstResult],
      /requires 2 competition results, received 1/,
    ],
    [
      "reordered",
      [secondResult, firstResult],
      /competition order mismatch/,
    ],
    [
      "mismatched membership",
      [
        { ...firstResult, finalTable: [reportTableRow(otherClubId)] },
        secondResult,
      ],
      /final table does not match competition membership/,
    ],
  ] as const) {
    assert.throws(
      () => advanceCareerOneSeason({
        careerState: state,
        worldSeed: `invalid-report-evidence-${label}`,
        mode: {
          kind: "reportRefresh",
          nextSeasonId: seasonId("season:report-0002"),
          nextSeasonStartDate: gameDate(20_365),
          competitionResults,
        },
      }),
      pattern,
    );
    assert.deepEqual(state, snapshot);
  }
});

test("annual candidate providers share the canonical incoming season start date", () => {
  const nextSeasonStartDate = gameDate(20_365);
  let youthIntakeDate: GameState["calendar"]["currentDate"] | undefined;
  let seniorIntakeDate: GameState["calendar"]["currentDate"] | undefined;
  let youthActiveStockSources: readonly string[] | undefined;

  const result = advanceCareerOneSeason({
    careerState: incompleteCareerStateFixture(fixtureId("fixture:000002")),
    worldSeed: "incoming-intake-date-world",
    mode: {
      kind: "reportRefresh",
      nextSeasonId: seasonId("season:report-0002"),
      nextSeasonStartDate,
      competitionResults: [],
    },
    createYouthIntakeCandidates: (context) => {
      youthIntakeDate = context.intakeDate;
      youthActiveStockSources = context.activePlayerStock.map(
        ({ source }) => source,
      );
      return [];
    },
    createSeniorIntakeCandidates: (context) => {
      seniorIntakeDate = context.intakeDate;
      return [];
    },
  });

  assert.equal(result.status, "advanced");
  assert.equal(youthIntakeDate, nextSeasonStartDate);
  assert.equal(seniorIntakeDate, nextSeasonStartDate);
  assert.deepEqual(youthActiveStockSources, Array(8).fill("senior"));
});

function completedCareerStateFixture(): CareerState {
  return careerStateFixture({
    currentSeasonId: seasonId("season:0001"),
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), seasonId("season:0001"), clubId("club:selected"), clubId("club:other"), true, gameDate(20_000)),
      fixtureFixture(fixtureId("fixture:000002"), seasonId("season:0001"), clubId("club:other"), clubId("club:selected"), true, gameDate(20_007)),
    ],
  });
}

function careerStateWithYouthParticipation(youthId: PlayerId): CareerState {
  const baseState = completedCareerStateFixture();
  const selectedClubId = clubId("club:selected");
  const youth = playerFixture(youthId, "st", 17);
  const playerParticipationLedger = [
    fixtureId("fixture:000001"),
    fixtureId("fixture:000002"),
  ].reduce(
    (ledger, playedFixtureId) => accruePlayerFixtureParticipation(ledger, {
      fixtureId: playedFixtureId,
      playerId: youthId,
      clubId: selectedClubId,
      seasonId: seasonId("season:0001"),
      monthKey: "2024-10",
      started: true,
      substituteAppearance: false,
      minutes: 90,
      rating: 8,
      playedRoleMinutes: { striker: 90 },
    }),
    createEmptyPlayerParticipationLedger(),
  );

  return createCareerState({
    ...baseState,
    gameState: {
      ...baseState.gameState,
      players: {
        ...baseState.gameState.players,
        [youthId]: youth,
      },
      playerIds: [...baseState.gameState.playerIds, youthId],
      playerStates: {
        ...baseState.gameState.playerStates,
        [youthId]: playerStateFixture(),
      },
    },
    youthAcademyState: {
      clubRosters: {
        [selectedClubId]: {
          clubId: selectedClubId,
          playerIds: [youthId],
        },
      },
      clubRosterIds: [selectedClubId],
      playerLifecycle: {
        [youthId]: {
          playerId: youthId,
          clubId: selectedClubId,
          status: "academy",
          academyEntrySeasonId: seasonId("season:0001"),
          academyEntryDate: gameDate(19_000),
        },
      },
      playerLifecycleIds: [youthId],
    },
    playerParticipationLedger,
  });
}

function factsOnlyReport(facts: Extract<ReturnType<typeof advanceCareerOneSeason>, { status: "advanced" }>["facts"]) {
  return {
    selectedClubId: facts.selectedClubId,
    season: {
      from: facts.previousSeasonId,
      to: facts.nextSeasonId,
      startDate: facts.nextSeasonStartDate,
    },
    archive: facts.seasonArchive === undefined
      ? undefined
      : {
          championClubId: facts.seasonArchive.championClubId,
          selectedClubPosition: facts.seasonArchive.selectedClubPosition,
          fixtureCount: facts.seasonArchive.aggregateGoals.fixtureCount,
          totalGoals: facts.seasonArchive.aggregateGoals.totalGoals,
        },
    activity: {
      developmentRows: facts.playerDevelopment.changeCount,
      playerExits: facts.playerExits.exitCount,
      youthLifecycleRows: facts.youthLifecycle.recordCount,
      youthPromotionCandidates: facts.youthLifecycle.promotionCandidateCount,
      youthPromotions: facts.youthPromotions.promotedCount,
      seniorAdds: facts.squadMaintenance.addedPlayerCount,
      transfers: facts.transferTurnover.transferCount,
    },
    health: {
      seniorPlayers: facts.squadHealth.seniorPlayerCount,
      activePlayers: facts.youthHealth.activePlayerCount,
      clubsBelowMinimumSquadSize: facts.squadHealth.clubsBelowMinimumSquadSize,
      clubsWithoutNaturalGoalkeeper: facts.squadHealth.clubsWithoutNaturalGoalkeeper,
    },
    warnings: facts.warnings,
  };
}

function incompleteCareerStateFixture(unplayedFixtureId: Fixture["id"]): CareerState {
  return careerStateFixture({
    currentSeasonId: seasonId("season:0001"),
    fixtures: [
      fixtureFixture(fixtureId("fixture:000001"), seasonId("season:0001"), clubId("club:selected"), clubId("club:other"), true, gameDate(20_000)),
      fixtureFixture(unplayedFixtureId, seasonId("season:0001"), clubId("club:other"), clubId("club:selected"), false, gameDate(20_007)),
    ],
  });
}

/** Builds the smallest canonical registry that can prove report-table coverage. */
function reportCompetitionCareerStateFixture(): CareerState {
  const state = incompleteCareerStateFixture(fixtureId("fixture:000002"));
  const firstCompetitionId = competitionId("competition:report:first");
  const secondCompetitionId = competitionId("competition:report:second");
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");

  return createCareerState({
    ...state,
    gameState: {
      ...state.gameState,
      // These tests stop at the report-evidence guard, so unrelated fixture
      // topology would only obscure the registry contract being exercised.
      fixtures: {},
      fixtureIds: [],
      domesticCompetitionWorld: {
        competitionIds: [firstCompetitionId, secondCompetitionId],
        competitions: {
          [firstCompetitionId]: reportCompetitionFixture(
            firstCompetitionId,
            [selectedClubId],
          ),
          [secondCompetitionId]: reportCompetitionFixture(
            secondCompetitionId,
            [otherClubId],
          ),
        },
        seasonHistory: [],
      },
    },
  });
}

/** Creates one registered competition without adding unrelated season policy. */
function reportCompetitionFixture(
  id: ReturnType<typeof competitionId>,
  clubIds: readonly ClubId[],
) {
  return {
    id,
    name: String(id),
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

/** Produces one structurally valid table row for registry-validation tests. */
function reportTableRow(tableClubId: ClubId) {
  return {
    position: 1,
    clubId: tableClubId,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  } as const;
}

function careerStateFixture(input: {
  readonly currentSeasonId: GameState["calendar"]["currentSeasonId"];
  readonly fixtures: readonly Fixture[];
}): CareerState {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedPlayers = [
    playerFixture(playerId("player:selected-gk"), "gk", 24),
    playerFixture(playerId("player:selected-cb"), "cb", 25),
    playerFixture(playerId("player:selected-cm"), "cm", 23),
    playerFixture(playerId("player:selected-st"), "st", 22),
  ];
  const otherPlayers = [
    playerFixture(playerId("player:other-gk"), "gk", 24),
    playerFixture(playerId("player:other-cb"), "cb", 25),
    playerFixture(playerId("player:other-cm"), "cm", 23),
    playerFixture(playerId("player:other-st"), "st", 22),
  ];
  const players = [...selectedPlayers, ...otherPlayers];

  return createCareerState({
    saveId: saveId("save:canonical-advancement"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId,
    gameState: gameStateFixture({
      currentSeasonId: input.currentSeasonId,
      clubs: [
        clubFixture(selectedClubId, selectedPlayers.map((player) => player.id)),
        clubFixture(otherClubId, otherPlayers.map((player) => player.id)),
      ],
      fixtures: input.fixtures,
      players,
    }),
    transferHistory: [],
  });
}

function gameStateFixture(input: {
  readonly currentSeasonId: GameState["calendar"]["currentSeasonId"];
  readonly clubs: readonly Club[];
  readonly fixtures: readonly Fixture[];
  readonly players: readonly Player[];
}): GameState {
  const clubsById: Partial<Record<ClubId, Club>> = {};
  const clubIds: ClubId[] = [];
  const fixturesById: Partial<Record<Fixture["id"], Fixture>> = {};
  const fixtureIds: Fixture["id"][] = [];
  const playersById: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};

  for (const club of input.clubs) {
    clubsById[club.id] = club;
    clubIds.push(club.id);
  }

  for (const fixture of input.fixtures) {
    fixturesById[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  for (const player of input.players) {
    playersById[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = playerStateFixture();
  }

  return {
    meta: {
      seed: "canonical-advancement-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
      calibrationVersions: {
        topologyDecisionId: "topology:test",
        playerRatingScaleVersion: "rating:test",
        playerMarketCalibrationVersion: "market:test",
        valuationCurvesVersion: "valuation:test",
        askingPriceCurvesVersion: "asking-price:test",
        marketBehaviorCalibrationVersion: "market-behavior:test",
        wageFinanceCalibrationVersion: "wage-finance:test",
        playerDevelopmentEnvironmentVersion:
          playerDevelopmentEnvironmentConfigFixture().version,
      },
    },
    calendar: {
      currentDate: gameDate(20_000),
      currentSeasonId: input.currentSeasonId,
    },
    players: playersById as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: clubsById as GameState["clubs"],
    clubIds,
    fixtures: fixturesById as GameState["fixtures"],
    fixtureIds,
  };
}

function clubFixture(id: ClubId, playerIds: readonly PlayerId[]): Club {
  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds,
  };
}

function fixtureFixture(
  id: Fixture["id"],
  fixtureSeasonId: Fixture["seasonId"],
  homeClubId: ClubId,
  awayClubId: ClubId,
  played: boolean,
  date: Fixture["date"],
): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: fixtureSeasonId,
    roundNumber: 1,
    date,
    homeClubId,
    awayClubId,
    ...(played
      ? {
          result: {
            played: true,
            homeGoals: homeClubId === clubId("club:selected") ? 2 : 0,
            awayGoals: awayClubId === clubId("club:selected") ? 1 : 0,
          },
        }
      : {}),
  };
}

function playerFixture(id: PlayerId, naturalPosition: PlayerPosition, age: number): Player {
  return {
    id,
    firstName: String(id),
    lastName: "Fixture",
    birthDate: gameDate(20_000 - age * 365),
    naturalPositions: [naturalPosition],
    abilities: abilitySet(9),
    potential: abilitySet(12),
  };
}

function playerStateFixture(): PlayerDynamicState {
  return {
    fitness: stateValue(100),
    form: stateValue(50),
    morale: stateValue(50),
  };
}

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
