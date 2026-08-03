import { createLineupSlot } from "../match-engine/index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";

import {
  abilityValue,
  clubId,
  competitionId,
  fixtureId,
  gameDate,
  getFormation,
  playerId,
  seasonId,
  stateValue,
  type ClubId,
  type Fixture,
  type FixtureId,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SelectedLineup,
  type TacticSetup,
} from "@game/domain";
import { fromISO } from "@game/shared";

import {
  simulateSeason,
  SimulateSeasonError,
  type SimulateSeasonFixtureLineupOverride,
  type SimulateSeasonInput,
  type SimulateSeasonSetupOverride,
  type SimulateSeasonTeamInput,
} from "./simulate-season.ts";
import type { PlayerStateMultiplierCurves, RoleWeightProfile } from "../match-engine/index.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";


/**
 * Season simulation tests prove the first full-season use-case without content,
 * CLI formatting, persistence, or future management systems.
 */

test("simulateSeason completes one 18-team, 34-round season", () => {
  const result = simulateSeason(seasonInput("season-seed"));

  assert.equal(result.rounds.length, 34);
  assert.equal(result.fixtureIds.length, 306);
  assert.equal(result.fixtures.length, 306);

  for (const fixture of result.fixtures) {
    assert.equal(fixture.result?.played, true);
  }
});

test("same seed produces same final table", () => {
  const first = simulateSeason(seasonInput("repeatable-seed"));
  const second = simulateSeason(seasonInput("repeatable-seed"));

  assert.deepEqual(first.table, second.table);
});

test("stable season seed produces a compact golden sentinel", () => {
  const result = simulateSeason(seasonInput("golden-season-seed"));
  const firstFixture = result.fixtures[0];
  const lastFixture = result.fixtures[result.fixtures.length - 1];
  assert.ok(firstFixture !== undefined);
  assert.ok(lastFixture !== undefined);
  assert.ok(firstFixture.result?.report !== undefined);
  assert.ok(lastFixture.result?.report !== undefined);

  // This sentinel catches accidental engine drift without freezing every event
  // in a full season. Update it only with an intentional gameplay rationale.
  //
  // Last moved when season team input started carrying the squad instead of a
  // precomputed strength, which let the fixture fill all four departments. Every
  // table row, score, and shot count survived that change untouched: only who
  // scored moved, because there are now four candidate actors per side instead
  // of two.
  assert.deepEqual(
    {
      rounds: result.rounds.length,
      fixtureCount: result.fixtures.length,
      champion: result.table[0],
      runnerUp: result.table[1],
      bottom: result.table[result.table.length - 1],
      firstFixture: {
        id: firstFixture.id,
        homeGoals: firstFixture.result?.homeGoals,
        awayGoals: firstFixture.result?.awayGoals,
        eventCount: firstFixture.result?.report.events.length,
        homeShots: firstFixture.result?.report.stats.home.shots,
        awayShots: firstFixture.result?.report.stats.away.shots,
      },
      lastFixture: {
        id: lastFixture.id,
        homeGoals: lastFixture.result?.homeGoals,
        awayGoals: lastFixture.result?.awayGoals,
        eventCount: lastFixture.result?.report.events.length,
        homeShots: lastFixture.result?.report.stats.home.shots,
        awayShots: lastFixture.result?.report.stats.away.shots,
      },
      topScorers: result.playerGoalStats.slice(0, 3),
    },
    {
      rounds: 34,
      fixtureCount: 306,
      champion: {
        position: 1,
        clubId: clubId("club:test-05"),
        played: 34,
        wins: 8,
        draws: 26,
        losses: 0,
        goalsFor: 10,
        goalsAgainst: 0,
        goalDifference: 10,
        points: 50,
      },
      runnerUp: {
        position: 2,
        clubId: clubId("club:test-01"),
        played: 34,
        wins: 9,
        draws: 22,
        losses: 3,
        goalsFor: 12,
        goalsAgainst: 4,
        goalDifference: 8,
        points: 49,
      },
      bottom: {
        position: 18,
        clubId: clubId("club:test-16"),
        played: 34,
        wins: 2,
        draws: 22,
        losses: 10,
        goalsFor: 2,
        goalsAgainst: 10,
        goalDifference: -8,
        points: 28,
      },
      firstFixture: {
        id: fixtureId("fixture:test-league:2026:000001"),
        homeGoals: 0,
        awayGoals: 0,
        eventCount: 10,
        homeShots: 0,
        awayShots: 0,
      },
      lastFixture: {
        id: fixtureId("fixture:test-league:2026:000306"),
        homeGoals: 1,
        awayGoals: 0,
        eventCount: 7,
        homeShots: 1,
        awayShots: 0,
      },
      topScorers: [
        {
          playerId: playerId("player:test-03-02"),
          clubId: clubId("club:test-03"),
          goals: 8,
        },
        {
          playerId: playerId("player:test-01-02"),
          clubId: clubId("club:test-01"),
          goals: 7,
        },
        {
          playerId: playerId("player:test-11-02"),
          clubId: clubId("club:test-11"),
          goals: 7,
        },
      ],
    },
  );
});

test("no team plays twice in a round", () => {
  const result = simulateSeason(seasonInput("round-seed"));

  for (const round of result.rounds) {
    const clubsInRound: ClubId[] = [];

    for (const fixtureId of round.fixtureIds) {
      const fixture = findFixture(result.fixtures, fixtureId);
      assert.ok(fixture !== undefined);
      assert.equal(clubsInRound.includes(fixture.homeClubId), false);
      assert.equal(clubsInRound.includes(fixture.awayClubId), false);
      clubsInRound.push(fixture.homeClubId, fixture.awayClubId);
    }
  }
});

test("final table contains every club once", () => {
  const input = seasonInput("table-seed");
  const result = simulateSeason(input);
  const tableClubIds: ClubId[] = [];

  for (const row of result.table) {
    assert.equal(tableClubIds.includes(row.clubId), false);
    tableClubIds.push(row.clubId);
  }

  assert.equal(result.table.length, input.clubIds.length);

  for (const clubId of input.clubIds) {
    assert.equal(tableClubIds.includes(clubId), true);
  }
});

test("season player goal stats match table goals", () => {
  const result = simulateSeason(seasonInput("player-stats-seed"));
  const totalTableGoals = result.table.reduce((total, row) => total + row.goalsFor, 0);
  const totalPlayerGoals = result.playerGoalStats.reduce((total, row) => total + row.goals, 0);

  assert.equal(totalPlayerGoals, totalTableGoals);
  assert.equal(result.playerGoalStats.length, seasonFixturePlayerCount());
});

test("season player summary stats match durable assist and save events", () => {
  const result = simulateSeason(seasonInput("player-summary-seed"));
  const totalSummaryAssists = result.playerSummaryStats.reduce((total, row) => total + row.assists, 0);
  const totalSummarySaves = result.playerSummaryStats.reduce((total, row) => total + row.saves, 0);

  assert.equal(result.playerSummaryStats.length, seasonFixturePlayerCount());
  assert.equal(totalSummaryAssists, countAssists(result.fixtures));
  assert.equal(totalSummarySaves, countSaves(result.fixtures));
});

test("season simulation exposes canonical participation from each exact match context", () => {
  const result = simulateSeason(seasonInput("participation-seed"));

  assert.equal(result.fixtureParticipation.length, result.fixtureIds.length);
  assert.deepEqual(
    result.fixtureParticipation.map(({ fixtureId }) => fixtureId),
    result.fixtureIds,
  );
  assert.ok(
    result.fixtureParticipation.every(
      ({ fixtureId, contributions }) => {
        const fixture = result.fixtures.find((candidate) => candidate.id === fixtureId);
        const finalMinute = fixture?.result?.report?.finalMinute;
        return (
          finalMinute !== undefined
          && contributions.length === SEASON_FIXTURE_LINEUP_SIZE * 2
          && contributions.every(
            (contribution) =>
              contribution.started
              && !contribution.substituteAppearance
              && contribution.minutes === finalMinute
              && contribution.rating !== undefined,
          )
        );
      },
    ),
  );
  assert.deepEqual(
    simulateSeason(seasonInput("participation-seed")).fixtureParticipation,
    result.fixtureParticipation,
  );
});

test("empty setup overrides preserve default output", () => {
  const input = seasonInput("empty-override-seed");

  assert.deepEqual(simulateSeason({ ...input, setupOverrides: [] }), simulateSeason(input));
});

test("empty fixture lineup overrides preserve default output", () => {
  const input = seasonInput("empty-fixture-lineup-override-seed");

  assert.deepEqual(simulateSeason({ ...input, fixtureLineupOverrides: [] }), simulateSeason(input));
});

test("valid fixture lineup override shape is accepted", () => {
  const input = seasonInput("fixture-lineup-override-seed");
  const fixture = firstGeneratedFixture(input);
  const withFixtureLineupOverride: SimulateSeasonInput = {
    ...input,
    fixtureLineupOverrides: [fixtureLineupOverride(input, fixture, fixture.homeClubId)],
  };
  const result = simulateSeason(withFixtureLineupOverride);

  assert.equal(result.fixtures.length, 306);
  assert.equal(result.fixtures.every((playedFixture) => playedFixture.result?.played === true), true);
});

test("fixture lineup override changes only the intended fixture result", () => {
  const input = seasonInput("fixture-lineup-applied-seed");
  const fixture = generatedFixtureById(
    input,
    fixtureId("fixture:test-league:2026:000004"),
  );
  const overrideResult = simulateSeason({
    ...input,
    fixtureLineupOverrides: [fixtureLineupOverrideWithReserve(input, fixture, fixture.homeClubId)],
  });
  const defaultResult = simulateSeason(input);

  for (const defaultFixture of defaultResult.fixtures) {
    const overriddenFixture = findFixture(overrideResult.fixtures, defaultFixture.id);
    assert.ok(overriddenFixture !== undefined);

    if (defaultFixture.id === fixture.id) {
      assert.notDeepEqual(overriddenFixture.result, defaultFixture.result);
    } else {
      assert.deepEqual(overriddenFixture.result, defaultFixture.result);
    }
  }
});

test("same seed plus same fixture lineup override is deterministic", () => {
  const input = seasonInput("repeatable-fixture-lineup-override-seed");
  const fixture = firstGeneratedFixture(input);
  const withFixtureLineupOverride: SimulateSeasonInput = {
    ...input,
    fixtureLineupOverrides: [fixtureLineupOverrideWithReserve(input, fixture, fixture.homeClubId)],
  };

  assert.deepEqual(simulateSeason(withFixtureLineupOverride), simulateSeason(withFixtureLineupOverride));
});

test("fixture lineup override registrations follow explicit override input order", () => {
  const input = seasonInput("ordered-fixture-lineup-overrides-seed");
  const firstFixture = generatedFixtureById(
    input,
    fixtureId("fixture:test-league:2026:000001"),
  );
  const secondFixture = generatedFixtureById(
    input,
    fixtureId("fixture:test-league:2026:000002"),
  );
  const firstOverride = fixtureLineupOverrideWithReserve(input, firstFixture, firstFixture.homeClubId);
  const secondOverride = fixtureLineupOverrideWithReserve(input, secondFixture, secondFixture.homeClubId);
  const withFixtureLineupOverrides: SimulateSeasonInput = {
    ...input,
    fixtureLineupOverrides: [secondOverride, firstOverride],
  };
  const result = simulateSeason(withFixtureLineupOverrides);

  assert.deepEqual(result, simulateSeason(withFixtureLineupOverrides));
  assert.equal(
    result.playerSummaryStats.some((row) => row.playerId === fixtureReservePlayerId(secondFixture.homeClubId)),
    true,
  );
  assert.equal(
    result.playerSummaryStats.some((row) => row.playerId === fixtureReservePlayerId(firstFixture.homeClubId)),
    true,
  );
});

test("setup override changes the selected club setup without mutating base input", () => {
  const input = seasonInput("setup-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  const beforeLineup = input.teamsByClubId[overriddenClubId]?.lineup;
  const defaultResult = simulateSeason(input);
  const overrideResult = simulateSeason({
    ...input,
    setupOverrides: [setupOverrideFixture(overriddenClubId)],
  });

  assert.notDeepEqual(overrideResult.table, defaultResult.table);
  assert.equal(overrideResult.playerSummaryStats.some((row) => row.playerId === playerId("player:override-01")), true);
  assert.equal(overrideResult.playerSummaryStats.some((row) => row.playerId === playerId("player:test-01-01")), false);
  assert.deepEqual(input.teamsByClubId[overriddenClubId]?.lineup, beforeLineup);
});

test("same seed plus same setup override is deterministic", () => {
  const input = seasonInput("repeatable-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  const withOverride: SimulateSeasonInput = {
    ...input,
    setupOverrides: [setupOverrideFixture(overriddenClubId)],
  };

  assert.deepEqual(simulateSeason(withOverride), simulateSeason(withOverride));
});

test("duplicate setup overrides fail clearly", () => {
  const input = seasonInput("duplicate-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        setupOverrides: [setupOverrideFixture(overriddenClubId), setupOverrideFixture(overriddenClubId)],
      }),
    "duplicate_setup_override",
  );
});

test("duplicate fixture lineup overrides fail clearly", () => {
  const input = seasonInput("duplicate-fixture-lineup-override-seed");
  const fixture = firstGeneratedFixture(input);
  const override = fixtureLineupOverride(input, fixture, fixture.homeClubId);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [override, override],
      }),
    "duplicate_fixture_lineup_override",
  );
});

test("fixture lineup override rejects missing fixture and wrong fixture club", () => {
  const input = seasonInput("invalid-fixture-lineup-scope-seed");
  const fixture = firstGeneratedFixture(input);
  const missingFixtureOverride = {
    ...fixtureLineupOverride(input, fixture, fixture.homeClubId),
    fixtureId: fixtureId("fixture:999999"),
  };
  const wrongClubId = nonParticipantClubId(input, fixture);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [missingFixtureOverride],
      }),
    "missing_fixture",
  );

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [fixtureLineupOverride(input, fixture, wrongClubId)],
      }),
    "invalid_fixture_lineup_override",
  );
});

test("invalid setup overrides fail clearly", () => {
  const input = seasonInput("invalid-override-seed");
  const overriddenClubId = input.clubIds[0];
  assert.ok(overriddenClubId !== undefined);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        setupOverrides: [
          {
            ...setupOverrideFixture(overriddenClubId),
            requiredLineupSize: 11,
          },
        ],
      }),
    "invalid_setup_override",
  );
});

test("invalid fixture lineup override data fails clearly", () => {
  const input = seasonInput("invalid-fixture-lineup-data-seed");
  const fixture = firstGeneratedFixture(input);
  const validOverride = fixtureLineupOverride(input, fixture, fixture.homeClubId);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [
          {
            ...validOverride,
            requiredLineupSize: 11,
          },
        ],
      }),
    "invalid_fixture_lineup_override",
  );

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fixtureLineupOverrides: [
          {
            ...validOverride,
            players: {},
          },
        ],
      }),
    "invalid_fixture_lineup_override",
  );
});

test("omitted fitness lifecycle keeps final player states absent", () => {
  const result = simulateSeason(seasonInput("no-fitness-lifecycle-seed"));

  assert.equal(result.finalPlayerStates, undefined);
});

test("inactive fitness-ready team data preserves default output", () => {
  const input = seasonInput("inactive-fitness-data-seed");

  assert.deepEqual(simulateSeason({ ...input, teamsByClubId: fitnessReadyTeams(input) }), simulateSeason(input));
});

test("fitness lifecycle spends match fitness and recovers between fixture dates", () => {
  const input = seasonInputWithFitnessLifecycle("fitness-lifecycle-seed", 100);
  const result = simulateSeason(input);
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  assert.ok(result.finalPlayerStates !== undefined);
  const finalPlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = result.finalPlayerStates;

  for (const playerId of lifecycle.playerIds) {
    const playerState = finalPlayerStates[playerId];
    assert.ok(playerState !== undefined);
    assert.equal(Number(playerState.fitness), 92);
    assert.equal(Number(playerState.form), 50);
    assert.equal(Number(playerState.morale), 50);
  }
});

test("fitness lifecycle can recover tired starters over a season", () => {
  const input = seasonInputWithFitnessLifecycle("fitness-recovery-seed", 50);
  const result = simulateSeason(input);
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  assert.ok(result.finalPlayerStates !== undefined);
  const finalPlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = result.finalPlayerStates;

  for (const playerId of lifecycle.playerIds) {
    const playerState = finalPlayerStates[playerId];
    assert.ok(playerState !== undefined);
    assert.equal(Number(playerState.fitness), 92);
  }
});

test("fixture lineup override spends fitness for selected reserve and rests replaced starter", () => {
  const baseInput = seasonInputWithFitnessLifecycle("fixture-lineup-fitness-seed", 100);
  const selectedClubId = baseInput.clubIds[0];
  assert.ok(selectedClubId !== undefined);
  const fixture = lastFixtureForClub(baseInput, selectedClubId);
  const override = fixtureLineupOverrideWithReserve(baseInput, fixture, selectedClubId);
  const reservePlayerId = override.lineup[1]?.playerId;
  const restedPlayerId = baseInput.teamsByClubId[selectedClubId]?.lineup[1]?.playerId;
  const unchangedStarterId = baseInput.teamsByClubId[selectedClubId]?.lineup[0]?.playerId;
  assert.ok(reservePlayerId !== undefined);
  assert.ok(restedPlayerId !== undefined);
  assert.ok(unchangedStarterId !== undefined);
  const input = addLifecyclePlayers(baseInput, [reservePlayerId]);
  const result = simulateSeason({
    ...input,
    fixtureLineupOverrides: [override],
  });

  assert.ok(result.finalPlayerStates !== undefined);
  assert.equal(Number(result.finalPlayerStates[reservePlayerId]?.fitness), 92);
  assert.equal(Number(result.finalPlayerStates[restedPlayerId]?.fitness), 100);
  assert.equal(Number(result.finalPlayerStates[unchangedStarterId]?.fitness), 92);
});

test("fitness lifecycle fails clearly when team data cannot rebuild strength", () => {
  const input = seasonInput("missing-fitness-team-data-seed");
  const { playerStates, playerIds } = initialPlayerStates(input, 100);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fitnessLifecycle: {
          playerStates,
          playerIds,
        },
      }),
    "invalid_fitness_lifecycle",
  );
});

test("AI squad selection can register full rosters for season simulations", () => {
  const input = seasonInputWithAiSelection("ai-squad-selection-seed", 100);
  const result = simulateSeason(input);
  const firstClubReserve = playerId("player:test-01-st-03");

  assert.equal(result.fixtures.length, 306);
  assert.equal(result.playerSummaryStats.some((row) => row.playerId === firstClubReserve), true);
  assert.ok(result.finalPlayerStates !== undefined);
  assert.equal(result.finalPlayerStates[firstClubReserve]?.fitness !== undefined, true);
});

test("AI squad participation retains the exact selected bench as zero-minute evidence", () => {
  const result = simulateSeason(
    seasonInputWithAiSelection("ai-squad-participation-seed", 100),
  );

  assert.ok(result.fixtureParticipation.length > 0);
  for (const fixture of result.fixtureParticipation) {
    const starters = fixture.contributions.filter(
      (contribution) => contribution.started,
    );
    const unusedBench = fixture.contributions.filter(
      (contribution) =>
        !contribution.started
        && !contribution.substituteAppearance
        && contribution.minutes === 0,
    );

    assert.equal(starters.length, 22);
    assert.equal(unusedBench.length, 16);
    assert.equal(fixture.contributions.length, 38);
  }
});

/**
 * Builds deterministic season input with 18 synthetic team contexts.
 */
function seasonInput(seed: string): SimulateSeasonInput {
  const clubIds = demoClubIds();

  return {
    seed,
    seasonId: seasonId("season:2026"),
    competitionId: competitionId("competition:test-league"),
    clubIds,
    seasonStartDate: gameDate(fromISO("2026-08-01")),
    teamsByClubId: teamsByClubId(clubIds),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    matchEngineConfig: {
      minuteCount: 12,
      rates: {
        baseOpportunityRatePerMinute: 0.06,
        maxOpportunityRatePerMinute: 0.18,
      },
      conversionBands: [
        {
          bandKey: "low",
          minQualityInclusive: 0,
          maxQualityExclusive: 0.5,
          goalProbability: 0.1,
        },
        {
          bandKey: "high",
          minQualityInclusive: 0.5,
          maxQualityExclusive: 1.01,
          goalProbability: 0.25,
        },
      ],
      homeAdvantageFactor: 1.05,
      tacticalDistributionCaps: {
        directness: { minInclusive: 0, maxInclusive: 1 },
        pressing: { minInclusive: 0, maxInclusive: 1 },
        width: { minInclusive: 0, maxInclusive: 1 },
        risk: { minInclusive: 0, maxInclusive: 1 },
      },
    },
    tableRules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  };
}

/**
 * Builds season input with explicit dynamic fitness lifecycle enabled.
 */
function seasonInputWithFitnessLifecycle(seed: string, initialFitness: number): SimulateSeasonInput {
  const input = seasonInput(seed);
  const { playerStates, playerIds } = initialPlayerStates(input, initialFitness);

  return {
    ...input,
    teamsByClubId: fitnessReadyTeams(input),
    fitnessLifecycle: {
      playerStates,
      playerIds,
    },
  };
}

/**
 * Builds season input whose base AI clubs can choose from full 20-player squads.
 */
function seasonInputWithAiSelection(seed: string, initialFitness: number): SimulateSeasonInput {
  const input = {
    ...seasonInput(seed),
    teamsByClubId: aiSelectionReadyTeams(seasonInput(seed)),
  };
  const { playerStates, playerIds } = initialPlayerStates(input, initialFitness);

  return {
    ...input,
    fitnessLifecycle: {
      playerStates,
      playerIds,
    },
  };
}

/**
 * Adds optional player, role, and state-curve data needed only by lifecycle simulations.
 */
function fitnessReadyTeams(input: SimulateSeasonInput): Readonly<Record<ClubId, SimulateSeasonTeamInput>> {
  const teams: Record<ClubId, SimulateSeasonTeamInput> = {};

  for (const clubId of input.clubIds) {
    const team = input.teamsByClubId[clubId];
    assert.ok(team !== undefined);

    const players: Record<PlayerId, Player> = {};
    for (const slot of team.lineup) {
      players[slot.playerId] = makePlayer(slot.playerId, clubRatingFor(input.clubIds, clubId));
    }

    teams[clubId] = {
      ...team,
      players,
      roleWeights: overrideRoleWeights(),
      stateMultiplierCurves: testFitnessCurves(),
    };
  }

  return teams;
}

/**
 * Adds full-roster AI selection data to every synthetic club.
 */
function aiSelectionReadyTeams(input: SimulateSeasonInput): Readonly<Record<ClubId, SimulateSeasonTeamInput>> {
  const teams: Record<ClubId, SimulateSeasonTeamInput> = {};
  const valuationConfig = playerValuationConfigFixture();

  for (const clubId of input.clubIds) {
    const team = input.teamsByClubId[clubId];
    assert.ok(team !== undefined);
    const players = aiSelectionPlayers(clubId, clubRatingFor(input.clubIds, clubId));

    teams[clubId] = {
      ...team,
      players,
      roleWeights: overrideRoleWeights(),
      stateMultiplierCurves: testFitnessCurves(),
      aiSelection: {
        formation: getFormation("4-4-2"),
        potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
        ratingScale: valuationConfig.ratingScale,
        benchSize: 8,
      },
    };
  }

  return teams;
}

/**
 * Builds initial dynamic states for every fixed lineup player in deterministic order.
 */
function initialPlayerStates(
  input: SimulateSeasonInput,
  fitness: number,
): {
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  readonly playerIds: readonly PlayerId[];
} {
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const playerIds: PlayerId[] = [];

  for (const clubId of input.clubIds) {
    const team = input.teamsByClubId[clubId];
    assert.ok(team !== undefined);
    const trackedPlayerIds = team.players === undefined
      ? team.lineup.map((slot) => slot.playerId)
      : (Object.keys(team.players).sort() as PlayerId[]);

    for (const trackedPlayerId of trackedPlayerIds) {
      playerIds.push(trackedPlayerId);
      playerStates[trackedPlayerId] = {
        fitness: stateValue(fitness),
        form: stateValue(50),
        morale: stateValue(50),
      };
    }
  }

  return { playerStates, playerIds };
}

/**
 * Extends one fitness lifecycle input with additional tracked players.
 */
function addLifecyclePlayers(input: SimulateSeasonInput, playerIds: readonly PlayerId[]): SimulateSeasonInput {
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  const playerStates: Record<PlayerId, PlayerDynamicState> = { ...lifecycle.playerStates };

  for (const playerId of playerIds) {
    playerStates[playerId] = {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    };
  }

  return {
    ...input,
    fitnessLifecycle: {
      ...lifecycle,
      playerStates,
      playerIds: [...lifecycle.playerIds, ...playerIds],
    },
  };
}

/**
 * Test curve that makes low fitness affect rebuilt team strength.
 */
function testFitnessCurves(): PlayerStateMultiplierCurves {
  return {
    fitness: [
      { maxValueInclusive: 59, multiplier: 0.9 },
      { maxValueInclusive: 100, multiplier: 1 },
    ],
  };
}

/**
 * Builds 18 namespaced demo club IDs.
 */
function demoClubIds(): readonly ClubId[] {
  const clubIds: ClubId[] = [];

  for (let clubNumber = 1; clubNumber <= 18; clubNumber += 1) {
    clubIds.push(clubId(`club:test-${String(clubNumber).padStart(2, "0")}`));
  }

  return clubIds;
}

/** Slots per club in the fixture season: one per team-strength department. */
const SEASON_FIXTURE_LINEUP_SIZE = 4;

/** Every registered player across the fixture season. */
function seasonFixturePlayerCount(): number {
  return demoClubIds().length * SEASON_FIXTURE_LINEUP_SIZE;
}

/**
 * The ability every player of one club has, decreasing down the club order.
 *
 * The season tests need a known strength ordering. Because team input now
 * carries the squad rather than a precomputed strength, the ordering is
 * expressed once here and every team's players are built at that ability, so
 * the derived strength reproduces it exactly.
 */
function clubRatingFixture(clubIds: readonly ClubId[], index: number): number {
  return 8 + (clubIds.length - index) / 3;
}

/**
 * Reads back the ability one club's synthetic players were built at.
 */
function clubRatingFor(clubIds: readonly ClubId[], clubId: ClubId): number {
  const index = clubIds.indexOf(clubId);
  assert.ok(index >= 0, `club is not part of the fixture season: ${clubId}`);
  return clubRatingFixture(clubIds, index);
}

/**
 * Builds team contexts keyed by club ID.
 */
function teamsByClubId(clubIds: readonly ClubId[]): Readonly<Record<ClubId, SimulateSeasonTeamInput>> {
  const teams: Record<ClubId, SimulateSeasonTeamInput> = {};

  for (let index = 0; index < clubIds.length; index += 1) {
    const clubId = clubIds[index];
    assert.ok(clubId !== undefined);

    const clubSlug = `test-${String(index + 1).padStart(2, "0")}`;
    // One slot per department, so the derived strength reproduces the intended
    // club rating everywhere. A two-slot fixture would leave defence and
    // midfield empty, and a season where nobody has either is not a season the
    // match engine can be sensibly measured against.
    const lineup = [
      createLineupSlot({ slotId: "slot:01", playerId: playerId(`player:${clubSlug}-01`), canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: "slot:02", playerId: playerId(`player:${clubSlug}-02`), canonicalRole: "striker" }),
      createLineupSlot({ slotId: "slot:03", playerId: playerId(`player:${clubSlug}-03`), canonicalRole: "center_back" }),
      createLineupSlot({ slotId: "slot:04", playerId: playerId(`player:${clubSlug}-04`), canonicalRole: "central_midfielder" }),
    ];
    teams[clubId] = {
      lineup,
      players: playersForLineup(lineup, clubRatingFixture(clubIds, index)),
      roleWeights: overrideRoleWeights(),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
      },
    };
  }

  return teams;
}

/**
 * Builds a selected setup override for one club.
 */
function setupOverrideFixture(clubId: ClubId): SimulateSeasonSetupOverride {
  return {
    clubId,
    lineup: selectedLineupFixture(clubId),
    tactic: tacticFixture(),
    requiredLineupSize: 2,
    players: overridePlayers(),
    roleWeights: overrideRoleWeights(),
  };
}

/**
 * Finds the first generated fixture for one deterministic input.
 */
function firstGeneratedFixture(input: SimulateSeasonInput): Fixture {
  const fixture = simulateSeason(input).fixtures[0];
  assert.ok(fixture !== undefined);

  return fixture;
}

/**
 * Finds one generated fixture by ID for tests that need a stable target.
 */
function generatedFixtureById(input: SimulateSeasonInput, id: FixtureId): Fixture {
  const fixture = findFixture(simulateSeason(input).fixtures, id);
  assert.ok(fixture !== undefined);

  return fixture;
}

/**
 * Finds the final fixture involving one club in generated season order.
 */
function lastFixtureForClub(input: SimulateSeasonInput, clubId: ClubId): Fixture {
  let lastFixture: Fixture | undefined;

  for (const fixture of simulateSeason(input).fixtures) {
    if (fixture.homeClubId === clubId || fixture.awayClubId === clubId) {
      lastFixture = fixture;
    }
  }

  assert.ok(lastFixture !== undefined);

  return lastFixture;
}

/**
 * Finds a club from the input that does not participate in one fixture.
 */
function nonParticipantClubId(input: SimulateSeasonInput, fixture: Fixture): ClubId {
  for (const clubId of input.clubIds) {
    if (clubId !== fixture.homeClubId && clubId !== fixture.awayClubId) {
      return clubId;
    }
  }

  throw new Error(`Cannot find non-participant club for fixture: ${fixture.id}`);
}

/**
 * Builds a fixture-scoped lineup override for one club.
 */
function fixtureLineupOverride(
  input: SimulateSeasonInput,
  fixture: Fixture,
  clubId: ClubId,
): SimulateSeasonFixtureLineupOverride {
  const team = input.teamsByClubId[clubId];
  assert.ok(team !== undefined);

  return {
    fixtureId: fixture.id,
    clubId,
    lineup: team.lineup,
    requiredLineupSize: team.lineup.length,
    players: playersForLineup(team.lineup, clubRatingFor(input.clubIds, clubId)),
    roleWeights: overrideRoleWeights(),
  };
}

/**
 * Builds a fixture-scoped lineup override that replaces the second starter.
 */
function fixtureLineupOverrideWithReserve(
  input: SimulateSeasonInput,
  fixture: Fixture,
  clubId: ClubId,
): SimulateSeasonFixtureLineupOverride {
  const baseOverride = fixtureLineupOverride(input, fixture, clubId);
  const reservePlayerId = fixtureReservePlayerId(clubId);
  const lineup = baseOverride.lineup.map((slot, index) =>
    index === 1
      ? {
          ...slot,
          playerId: reservePlayerId,
        }
      : slot,
  );

  return {
    ...baseOverride,
    lineup,
    players: {
      ...baseOverride.players,
      [reservePlayerId]: makePlayer(reservePlayerId, 20),
    },
  };
}

/**
 * Builds the deterministic reserve player ID used by fixture override tests.
 */
function fixtureReservePlayerId(clubId: ClubId): PlayerId {
  return playerId(`player:reserve-${String(clubId).slice("club:".length)}`);
}

/**
 * Builds player lookup data for every player in one test lineup.
 */
function playersForLineup(lineup: SimulateSeasonTeamInput["lineup"], ability: number): Readonly<Record<PlayerId, Player>> {
  const players: Record<PlayerId, Player> = {};

  for (const slot of lineup) {
    players[slot.playerId] = makePlayer(slot.playerId, ability);
  }

  return players;
}

/**
 * Builds selected lineup data for one override club.
 */
function selectedLineupFixture(clubId: ClubId): SelectedLineup {
  return {
    clubId,
    slots: [
      {
        slotKey: "slot:override-gk",
        playerId: playerId("player:override-01"),
        canonicalRole: "goalkeeper",
      },
      {
        slotKey: "slot:override-st",
        playerId: playerId("player:override-02"),
        canonicalRole: "striker",
      },
    ],
  };
}

/**
 * Builds tactical setup data for override tests.
 */
function tacticFixture(): TacticSetup {
  return {
    mentality: "attacking",
    directness: 1,
    pressing: 1,
    width: 1,
    risk: 1,
  };
}

/**
 * Builds override players with stronger ability values than the base fixtures.
 */
function overridePlayers(): Readonly<Record<PlayerId, Player>> {
  const goalkeeperId = playerId("player:override-01");
  const strikerId = playerId("player:override-02");

  return {
    [goalkeeperId]: makePlayer(goalkeeperId, 20),
    [strikerId]: makePlayer(strikerId, 20),
  };
}

/**
 * Builds role weights used by override setup tests.
 */
function overrideRoleWeights(): Readonly<Record<string, RoleWeightProfile>> {
  return {
    gk: {
      roleKey: "gk",
      department: "goalkeeper",
      abilityWeights: {
        "goalkeeping.reflexes": 1,
      },
    },
    synthetic: {
      roleKey: "synthetic",
      department: "attack",
      abilityWeights: {
        "technical.finishing": 1,
      },
    },
    defender: {
      roleKey: "defender",
      department: "defense",
      abilityWeights: {
        "technical.tackling": 2,
        "mental.positioning": 2,
        "physical.heading": 1,
      },
    },
    midfielder: {
      roleKey: "midfielder",
      department: "midfield",
      abilityWeights: {
        "technical.passing": 2,
        "mental.vision": 2,
        "physical.stamina": 1,
      },
    },
    attacker: {
      roleKey: "attacker",
      department: "attack",
      abilityWeights: {
        "technical.finishing": 3,
        "mental.composure": 2,
        "physical.heading": 1,
      },
    },
  };
}

/**
 * Builds a compact but formation-complete roster for AI-selection tests.
 */
function aiSelectionPlayers(clubId: ClubId, ability: number): Readonly<Record<PlayerId, Player>> {
  const clubKey = String(clubId).slice("club:".length);
  const players: Record<PlayerId, Player> = {};
  const specs: ReadonlyArray<readonly [string, readonly PlayerPosition[]]> = [
    ["gk-01", ["gk"]],
    ["gk-02", ["gk"]],
    ["rb-01", ["rb"]],
    ["cb-01", ["cb"]],
    ["cb-02", ["cb"]],
    ["cb-03", ["cb"]],
    ["lb-01", ["lb"]],
    ["rm-01", ["rw"]],
    ["cm-01", ["cm"]],
    ["cm-02", ["cm"]],
    ["cm-03", ["cm"]],
    ["lm-01", ["lw"]],
    ["dm-01", ["dm"]],
    ["am-01", ["am"]],
    ["rw-01", ["rw"]],
    ["lw-01", ["lw"]],
    ["st-01", ["st"]],
    ["st-02", ["st"]],
    ["st-03", ["st"]],
    ["fb-01", ["rb"]],
  ];

  for (const [suffix, positions] of specs) {
    const id = playerId(`player:${clubKey}-${suffix}`);
    players[id] = makePlayer(id, ability, positions);
  }

  return players;
}

/**
 * Builds a test player with all abilities set to the same value.
 */
function makePlayer(id: PlayerId, ability: number, positions: readonly PlayerPosition[] = ["cm"]): Player {
  const abilities = abilitySet(ability);

  return {
    id,
    firstName: "Override",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions: positions,
    primaryRole: primaryRoleForPosition(positions[0]!),
    abilities,
    potential: abilities,
  };
}

/** Keeps synthetic player identity valid for canonical public assessment. */
function primaryRoleForPosition(position: PlayerPosition): PlayerRole {
  const roles: Readonly<Record<PlayerPosition, PlayerRole>> = {
    gk: "goalkeeper",
    rb: "full_back",
    cb: "center_back",
    lb: "full_back",
    rwb: "wing_back",
    lwb: "wing_back",
    dm: "defensive_midfielder",
    cm: "central_midfielder",
    am: "attacking_midfielder",
    rw: "winger",
    lw: "winger",
    st: "striker",
  };
  return roles[position];
}

/**
 * Builds a complete 25-attribute ability object for override test players.
 */
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

/**
 * Finds one fixture by ID in explicit result order.
 */
function findFixture(fixtures: readonly Fixture[], fixtureId: FixtureId): Fixture | undefined {
  for (const fixture of fixtures) {
    if (fixture.id === fixtureId) {
      return fixture;
    }
  }

  return undefined;
}

/**
 * Counts durable assist IDs across simulated fixture reports.
 */
function countAssists(fixtures: readonly Fixture[]): number {
  let total = 0;

  for (const fixture of fixtures) {
    const events = fixture.result?.report?.events;

    if (events === undefined) {
      continue;
    }

    for (const event of events) {
      if (event.type === "goal" && event.assistPlayerId !== undefined) {
        total += 1;
      }
    }
  }

  return total;
}

/**
 * Counts durable goalkeeper-save IDs across simulated fixture reports.
 */
function countSaves(fixtures: readonly Fixture[]): number {
  let total = 0;

  for (const fixture of fixtures) {
    const events = fixture.result?.report?.events;

    if (events === undefined) {
      continue;
    }

    for (const event of events) {
      if (event.type === "save") {
        total += 1;
      }
    }
  }

  return total;
}

/**
 * Asserts a typed season simulation failure and its machine-readable code.
 */
function assertSimulateSeasonError(action: () => void, code: SimulateSeasonError["code"]): void {
  assert.throws(
    action,
    (error: unknown) => error instanceof SimulateSeasonError && error.code === code,
  );
}
