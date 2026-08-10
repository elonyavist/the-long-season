import { createLineupSlot, deriveTeamStrength } from "../match-engine/index.ts";
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
import { playerStateCurvesConfigFixture } from "../test-fixtures/player-state-curves-config.ts";


/**
 * Season simulation tests prove the first full-season use-case without content,
 * CLI formatting, persistence, or future management systems.
 */

const TEST_RECOVERY_POLICY = playerStateCurvesConfigFixture();

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

test("analysis strength replay leaves the canonical season byte-identical", () => {
  const input = seasonInput("analysis-strength-control-seed");
  const control = simulateSeason(input);
  const withReplay = simulateSeason({ ...input, analysisStrengthGapScale: 1.5 });
  const { analysisStrengthReplay, ...canonicalResult } = withReplay;

  assert.ok(analysisStrengthReplay !== undefined);
  assert.equal(analysisStrengthReplay.scale, 1.5);
  assert.deepEqual(canonicalResult, control);
  assert.deepEqual(
    simulateSeason({ ...input, analysisStrengthGapScale: 1.5 }).analysisStrengthReplay,
    analysisStrengthReplay,
  );
  assert.notDeepEqual(analysisStrengthReplay.table, control.table);
});

test("analysis strength replay rejects scales outside its frozen oracle domain", () => {
  const input = seasonInput("analysis-strength-invalid-seed");

  assertSimulateSeasonError(
    () => simulateSeason({ ...input, analysisStrengthGapScale: 0.99 }),
    "invalid_analysis_strength_gap_scale",
  );
  assertSimulateSeasonError(
    () => simulateSeason({ ...input, analysisStrengthGapScale: 2.01 }),
    "invalid_analysis_strength_gap_scale",
  );
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
  // Last moved at block 3, when the route a chance came down started deciding
  // how good that chance was, the per-minute rate started comparing the two
  // sides' plans to each other instead of to a constant, and the conversion
  // bands came down to hold the goal rate in band while all of that landed.
  //
  // Two artefacts left the table across this step and the one before it. A
  // champion once went unbeaten conceding nothing across 34 matches, and the
  // opening fixture once finished goalless without a single shot, both because
  // near-equal strengths drove the old chance rate towards zero. Neither is
  // reachable now.
  //
  // The season kept every structural fact and moved the results inside it. Same
  // champion, same runner-up, same bottom club on the same 28 points, same 34
  // rounds and 306 fixtures, same third-placed scorer on the same five goals.
  // What moved is that it now takes 50 points to win rather than 47, and the
  // golden boot changed hands: last season's seven-goal leader is second on
  // six, behind a player from another club on seven. That is what a chance
  // being worth slightly more or less than its neighbour does over 306
  // fixtures. The opening fixture finished 0-0 rather than 1-0 for the same
  // reason, one shot fewer rather than a different match.
  //
  // Step 07 then moved the scorers and nothing else. Every structural number
  // above is byte-identical - same champion on the same 50 points, same
  // runner-up, same bottom club, same 306 fixtures, same shots and events in the
  // first and last of them - while the golden boot changed hands within the same
  // club and the second and third places swapped on five goals apiece.
  //
  // That is the exact signature this step should leave. Actors are now selected
  // before the occasion is resolved and no longer keyed on a shot type that did
  // not exist yet, so a different teammate is on the end of the same chances.
  // These clubs are built without per-player attributes, so both actor edges are
  // `0` here and the chances themselves are untouched: who scored moved, how
  // many were created and how many went in did not.
  //
  // Phase 81A Step 04 then conserved the tactical allocation every outfield
  // role can spend. That is an intentional match-engine change, not actor
  // drift: over the same 306 fixtures the champion, runner-up, endpoints and
  // table membership stay fixed, while the bottom club turns one draw into a
  // loss (28 -> 27 points) and the leading scorer finishes on six rather than
  // seven. The sentinel keeps those two consequences visible so a later edit
  // cannot claim the conservation migration was result-neutral.
  //
  // Phase 81A Step 05 then made the conserved route plan the only tactical
  // owner of chance quality and control. The same 306 fixtures keep their
  // champion, bottom club, endpoints and leading scorer; the runner-up scores
  // one fewer goal, turning one win into a draw (47 -> 45 points), and the two
  // five-goal tie places therefore belong to different players. This is the
  // narrow result change expected when routes are contested before the minute
  // loop instead of control reconstructing a second tactical model.
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
        clubId: clubId("club:test-07"),
        played: 34,
        wins: 9,
        draws: 23,
        losses: 2,
        goalsFor: 9,
        goalsAgainst: 2,
        goalDifference: 7,
        points: 50,
      },
      runnerUp: {
        position: 2,
        clubId: clubId("club:test-01"),
        played: 34,
        wins: 6,
        draws: 27,
        losses: 1,
        goalsFor: 9,
        goalsAgainst: 2,
        goalDifference: 7,
        points: 45,
      },
      bottom: {
        position: 18,
        clubId: clubId("club:test-12"),
        played: 34,
        wins: 0,
        draws: 27,
        losses: 7,
        goalsFor: 3,
        goalsAgainst: 12,
        goalDifference: -9,
        points: 27,
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
        homeGoals: 0,
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
          playerId: playerId("player:test-02-04"),
          clubId: clubId("club:test-02"),
          goals: 6,
        },
        {
          playerId: playerId("player:test-18-02"),
          clubId: clubId("club:test-18"),
          goals: 6,
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

test("season opportunity rows retain creator nominations without changing durable reports", () => {
  const result = simulateSeason(seasonInput("player-opportunity-seed"));
  const shotCount = result.fixtures.reduce(
    (total, fixture) => total
      + (fixture.result?.report?.stats.home.shots ?? 0)
      + (fixture.result?.report?.stats.away.shots ?? 0),
    0,
  );
  const onTargetCount = result.fixtures.reduce(
    (total, fixture) => total
      + (fixture.result?.report?.stats.home.shotsOnTarget ?? 0)
      + (fixture.result?.report?.stats.away.shotsOnTarget ?? 0),
    0,
  );

  assert.equal(result.playerOpportunityStats.length, seasonFixturePlayerCount());
  assert.equal(result.playerOpportunityStats.reduce((sum, row) => sum + row.shots, 0), shotCount);
  assert.equal(result.playerOpportunityStats.reduce((sum, row) => sum + row.shotsOnTarget, 0), onTargetCount);
  assert.equal(result.playerOpportunityStats.some(({ creatorNominations }) => creatorNominations > 0), true);
  assert.equal(result.fixtures.every((fixture) => fixture.result?.report?.events.every(
    (event) => !("selectedCreatorPlayerId" in event),
  )), true);
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
      ({ fixtureId, contributions, fieldedTeams }) => {
        const fixture = result.fixtures.find((candidate) => candidate.id === fixtureId);
        const finalMinute = fixture?.result?.report?.finalMinute;
        return (
          finalMinute !== undefined
          && contributions.length === SEASON_FIXTURE_LINEUP_SIZE * 2
          && fieldedTeams.home.lineup.length === SEASON_FIXTURE_LINEUP_SIZE
          && fieldedTeams.away.lineup.length === SEASON_FIXTURE_LINEUP_SIZE
          && fieldedTeams.home.selectionSource === "fixed_lineup"
          && fieldedTeams.away.selectionSource === "fixed_lineup"
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
  const first = result.fixtureParticipation[0]?.fieldedTeams.home;
  assert.ok(first !== undefined);
  const team = seasonInput("participation-seed").teamsByClubId[first.clubId];
  assert.ok(team !== undefined);
  assert.deepEqual(first.kickoffStrength, deriveTeamStrength({
    lineup: team.lineup,
    players: team.players,
    roleWeights: team.roleWeights,
  }));
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

test("fitness lifecycle spends exact simulated minutes and recovers between fixture dates", () => {
  const input = seasonInputWithFitnessLifecycle("fitness-lifecycle-seed", 100);
  const result = simulateSeason(input);
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  assert.ok(result.finalPlayerStates !== undefined);
  const finalPlayerStates: Readonly<Record<PlayerId, PlayerDynamicState>> = result.finalPlayerStates;

  for (const playerId of lifecycle.playerIds) {
    const playerState = finalPlayerStates[playerId];
    assert.ok(playerState !== undefined);
    assert.ok(Number(playerState.fitness) > 92);
    assert.ok(Number(playerState.fitness) < 100);
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
    assert.ok(Number(playerState.fitness) > 92);
    assert.ok(Number(playerState.fitness) < 100);
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
  const reserveFitness = Number(result.finalPlayerStates[reservePlayerId]?.fitness);
  const restedFitness = Number(result.finalPlayerStates[restedPlayerId]?.fitness);
  const unchangedFitness = Number(result.finalPlayerStates[unchangedStarterId]?.fitness);
  assert.ok(reserveFitness > 92 && reserveFitness < 100);
  assert.ok(unchangedFitness > 92 && unchangedFitness < 100);
  assert.ok(restedFitness > unchangedFitness && restedFitness < 100);
});

test("availability lifecycle excludes an injured player and carries participation", () => {
  const input = seasonInputWithAiSelection("availability-lifecycle-seed", 100);
  const firstClubId = input.clubIds[0];
  assert.ok(firstClubId !== undefined);
  const firstTeam = input.teamsByClubId[firstClubId];
  assert.ok(firstTeam !== undefined);
  const injuredPlayerId = (Object.keys(firstTeam.players).sort() as PlayerId[])[0];
  assert.ok(injuredPlayerId !== undefined);

  const result = simulateSeason({
    ...input,
    availabilityLifecycle: {
      worldSeed: "availability-lifecycle-world",
      availability: {
        injuries: [{
          fixtureId: fixtureId("fixture:prior-injury"),
          playerId: injuredPlayerId,
          severity: "serious",
          occurredOn: gameDate(fromISO("2026-07-01")),
          unavailableUntil: gameDate(fromISO("2027-07-01")),
        }],
        suspensions: [],
        yellowCards: [],
      },
    },
  });

  const firstClubSelections = result.fixtureParticipation.flatMap(({ fieldedTeams }) =>
    [fieldedTeams.home, fieldedTeams.away].filter(({ clubId }) => clubId === firstClubId));
  assert.ok(firstClubSelections.length > 0);
  assert.equal(
    firstClubSelections.some(({ lineup }) => lineup.some(({ playerId }) => playerId === injuredPlayerId)),
    false,
  );
  assert.equal(firstClubSelections.every((selection) =>
    selection.lifecycleDiagnostics?.unavailableSelectedPlayerCount === 0), true);
  assert.equal(firstClubSelections.some((selection) =>
    (selection.lifecycleDiagnostics?.recentUsePlayerCount ?? 0) > 0), true);
  assert.ok(result.finalPlayerParticipationLedger !== undefined);
  assert.ok(result.finalPlayerParticipationLedger.rowKeys.length > 0);
  assert.ok(result.finalPlayerAvailability !== undefined);
});

test("fitness lifecycle fails clearly when team data cannot rebuild strength", () => {
  const input = seasonInput("missing-fitness-team-data-seed");
  const { playerStates, playerIds, players } = initialPlayerStates(input, 100);

  assertSimulateSeasonError(
    () =>
      simulateSeason({
        ...input,
        fitnessLifecycle: {
          playerStates,
          playerIds,
          players,
          recoveryPolicy: TEST_RECOVERY_POLICY,
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

test("invalid AI selection exposes the owning club without parsing its message", () => {
  const input = seasonInputWithAiSelection("invalid-ai-selection-club-seed", 100);
  const owningClubId = input.clubIds[0];
  assert.ok(owningClubId !== undefined);
  const team = input.teamsByClubId[owningClubId];
  assert.ok(team?.players !== undefined);
  const retainedPlayerIds = (Object.keys(team.players) as PlayerId[]).sort().slice(0, 10);
  const players = Object.fromEntries(retainedPlayerIds.map((playerId) => [playerId, team.players?.[playerId]]));

  assert.throws(
    () => simulateSeason({
      ...input,
      teamsByClubId: {
        ...input.teamsByClubId,
        [owningClubId]: { ...team, players },
      },
    }),
    (error: unknown) => error instanceof SimulateSeasonError
      && error.code === "invalid_ai_squad_selection"
      && error.clubId === owningClubId,
  );
});

test("AI selection uses same-club emergency candidates only after the ordinary roster fails", () => {
  const input = seasonInputWithAiSelection("emergency-ai-selection-seed", 100);
  const owningClubId = input.clubIds[0];
  assert.ok(owningClubId !== undefined);
  const team = input.teamsByClubId[owningClubId];
  assert.ok(team?.aiSelection !== undefined);
  const completeXi = completeAiSelectionXi(owningClubId);
  const emergencyPlayerId = completeXi.at(-1);
  assert.ok(emergencyPlayerId !== undefined);

  const result = simulateSeason({
    ...input,
    teamsByClubId: {
      ...input.teamsByClubId,
      [owningClubId]: {
        ...team,
        aiSelection: {
          ...team.aiSelection,
          rosterPlayerIds: completeXi.slice(0, -1),
          emergencyPlayerIds: [emergencyPlayerId],
        },
      },
    },
  });
  const selections = result.fixtureParticipation.flatMap(({ fieldedTeams }) =>
    [fieldedTeams.home, fieldedTeams.away].filter(({ clubId }) => clubId === owningClubId));

  assert.ok(selections.length > 0);
  assert.equal(selections.every(({ emergencyPlayerIds }) =>
    emergencyPlayerIds?.includes(emergencyPlayerId) === true), true);
});

test("AI selection leaves emergency candidates untouched when the ordinary roster succeeds", () => {
  const input = seasonInputWithAiSelection("ordinary-ai-selection-seed", 100);
  const owningClubId = input.clubIds[0];
  assert.ok(owningClubId !== undefined);
  const team = input.teamsByClubId[owningClubId];
  assert.ok(team?.aiSelection !== undefined);
  const ordinaryPlayerIds = completeAiSelectionXi(owningClubId);
  const emergencyPlayerId = playerId(`player:${String(owningClubId).slice("club:".length)}-st-03`);

  const result = simulateSeason({
    ...input,
    teamsByClubId: {
      ...input.teamsByClubId,
      [owningClubId]: {
        ...team,
        aiSelection: {
          ...team.aiSelection,
          rosterPlayerIds: ordinaryPlayerIds,
          emergencyPlayerIds: [emergencyPlayerId],
        },
      },
    },
  });
  const selections = result.fixtureParticipation.flatMap(({ fieldedTeams }) =>
    [fieldedTeams.home, fieldedTeams.away].filter(({ clubId }) => clubId === owningClubId));

  assert.ok(selections.length > 0);
  assert.equal(selections.every(({ emergencyPlayerIds }) => emergencyPlayerIds === undefined), true);
});

test("AI selection considers a strong academy call-up before the ordinary roster fails", () => {
  const input = seasonInputWithAiSelection("academy-call-up-selection-seed", 100);
  const owningClubId = input.clubIds[0];
  assert.ok(owningClubId !== undefined);
  const team = input.teamsByClubId[owningClubId];
  assert.ok(team?.aiSelection !== undefined);
  const callUpPlayerId = playerId(`player:${String(owningClubId).slice("club:".length)}-st-03`);
  const players = {
    ...team.players,
    [callUpPlayerId]: makePlayer(callUpPlayerId, 20, ["st"]),
  };
  const fitnessLifecycle = input.fitnessLifecycle;
  assert.ok(fitnessLifecycle !== undefined);

  const result = simulateSeason({
    ...input,
    teamsByClubId: {
      ...input.teamsByClubId,
      [owningClubId]: {
        ...team,
        players,
        aiSelection: {
          ...team.aiSelection,
          rosterPlayerIds: completeAiSelectionXi(owningClubId),
          callUpPlayerIds: [callUpPlayerId],
        },
      },
    },
    fitnessLifecycle: {
      ...fitnessLifecycle,
      players: { ...fitnessLifecycle.players, ...players },
    },
  });
  const selections = result.fixtureParticipation.flatMap(({ fieldedTeams }) =>
    [fieldedTeams.home, fieldedTeams.away].filter(({ clubId }) => clubId === owningClubId));

  assert.ok(selections.length > 0);
  assert.equal(selections.every(({ callUpPlayerIds }) =>
    callUpPlayerIds?.includes(callUpPlayerId) === true), true);
  assert.equal(selections.every(({ lineup }) =>
    lineup.some(({ playerId: selectedId }) => selectedId === callUpPlayerId)), true);
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
    assert.equal(fixture.fieldedTeams.home.formationKey, "4-4-2");
    assert.equal(fixture.fieldedTeams.away.formationKey, "4-4-2");
    assert.equal(fixture.fieldedTeams.home.selectionSource, "imposed_ai");
    assert.equal(fixture.fieldedTeams.away.selectionSource, "imposed_ai");
  }
});

test("selection-load diagnostics observe a real available younger alternative only when requested", () => {
  const base = seasonInputWithAiSelection("selection-load-diagnostic-seed", 100);
  const clubIds = base.clubIds.slice(0, 2);
  const teamsByClubId: Record<ClubId, SimulateSeasonTeamInput> = {};
  const fitnessLifecycle = base.fitnessLifecycle;
  assert.ok(fitnessLifecycle !== undefined);
  const lifecyclePlayers: Record<PlayerId, Player> = { ...fitnessLifecycle.players };
  for (const selectedClubId of clubIds) {
    const team = base.teamsByClubId[selectedClubId];
    assert.ok(team !== undefined);
    const veteranId = playerId(`player:${String(selectedClubId).slice("club:".length)}-cm-01`);
    const veteran = team.players[veteranId];
    assert.ok(veteran !== undefined);
    const players: Record<PlayerId, Player> = {
      ...team.players,
      [veteranId]: { ...veteran, birthDate: gameDate(fromISO("1990-01-01")) },
    };
    teamsByClubId[selectedClubId] = { ...team, players };
    lifecyclePlayers[veteranId] = players[veteranId]!;
  }
  const input: SimulateSeasonInput = {
    ...base,
    clubIds,
    teamsByClubId,
    fitnessLifecycle: { ...fitnessLifecycle, players: lifecyclePlayers },
  };
  const ordinary = simulateSeason(input);
  const observed = simulateSeason({ ...input, collectSelectionLoadDiagnostics: true });
  const diagnostics = observed.fixtureParticipation.flatMap(({ fieldedTeams }) =>
    [fieldedTeams.home.selectionLoadDiagnostics, fieldedTeams.away.selectionLoadDiagnostics]);

  assert.equal(ordinary.fixtureParticipation.every(({ fieldedTeams }) =>
    fieldedTeams.home.selectionLoadDiagnostics === undefined
      && fieldedTeams.away.selectionLoadDiagnostics === undefined), true);
  assert.equal(diagnostics.every((row) => row !== undefined), true);
  assert.equal(diagnostics.reduce((sum, row) => sum + (row?.veteranStarterCount ?? 0), 0) > 0, true);
  assert.equal(diagnostics.reduce(
    (sum, row) => sum + (row?.qualityMatchedYoungerAlternativeCount ?? 0),
    0,
  ) > 0, true);
  assert.equal(diagnostics.reduce(
    (sum, row) => sum + (row?.fresherQualityMatchedYoungerAlternativeCount ?? 0),
    0,
  ) > 0, true);
});

test("automatic season fixtures retain accepted substitutions and exact minutes for both AI teams", () => {
  const base = seasonInputWithAiSelection("progressive-ai-season-seed", 100);
  const { fitnessLifecycle: _fitnessLifecycle, ...withoutFitnessLifecycle } = base;
  const clubIds = base.clubIds.slice(0, 2);
  const firstClub = clubIds[0];
  const secondClub = clubIds[1];
  assert.ok(firstClub !== undefined && secondClub !== undefined);
  const firstTeam = base.teamsByClubId[firstClub];
  const secondTeam = base.teamsByClubId[secondClub];
  assert.ok(firstTeam !== undefined && secondTeam !== undefined);
  const result = simulateSeason({
    ...withoutFitnessLifecycle,
    clubIds,
    teamsByClubId: {
      [firstClub]: firstTeam,
      [secondClub]: secondTeam,
    },
    matchEngineConfig: { ...base.matchEngineConfig, minuteCount: 90 },
  });

  assert.equal(result.fixtureParticipation.length, 2);
  for (const fixture of result.fixtureParticipation) {
    const substitutes = fixture.contributions.filter(({ substituteAppearance }) =>
      substituteAppearance);
    assert.equal(substitutes.length > 0, true);
    assert.equal(fixture.contributions.some(({ started, minutes }) => started && minutes < 90), true);
    const totalMinutes = fixture.contributions.reduce((sum, { minutes }) => sum + minutes, 0);
    assert.equal(totalMinutes <= 22 * 90, true);
    assert.equal(totalMinutes > 20 * 90, true);
    assert.deepEqual(fixture.progression.controlledSides, ["home", "away"]);
    assert.equal(fixture.progression.aiDecisionCount.home > 0, true);
    assert.equal(fixture.progression.aiDecisionCount.away > 0, true);
    assert.equal(fixture.progression.appliedSubstitutions.length, substitutes.length);
    assert.equal(fixture.progression.finalLineups.home.length, 11);
    assert.equal(fixture.progression.finalLineups.away.length, 11);
  }
});

test("AI squad selection records the catalog shape actually fielded when none is imposed", () => {
  const input = seasonInputWithAiSelection("catalog-ai-selection-seed", 100);
  const teamsByClubId: Record<ClubId, SimulateSeasonTeamInput> = {};

  for (const clubId of input.clubIds) {
    const team = input.teamsByClubId[clubId];
    assert.ok(team?.aiSelection !== undefined);
    const { formation: _imposedFormation, ...catalogSelection } = team.aiSelection;
    teamsByClubId[clubId] = { ...team, aiSelection: catalogSelection };
  }

  const result = simulateSeason({ ...input, teamsByClubId });
  const fielded = result.fixtureParticipation.flatMap(({ fieldedTeams }) => [
    fieldedTeams.home,
    fieldedTeams.away,
  ]);

  assert.ok(fielded.length > 0);
  assert.equal(fielded.every((team) => team.selectionSource === "catalog_ai"), true);
  assert.equal(fielded.every((team) => team.formationKey !== undefined), true);
  assert.equal(fielded.every((team) => team.catalogChoice?.fillableShapeCount === 23), true);
  assert.equal(fielded.every((team) => (team.catalogChoice?.tiedAtBestCount ?? 0) >= 1), true);
  assert.equal(
    fielded.every((team) => team.tacticalDistribution.mentality === "balanced"),
    true,
  );
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
    matchRules: {
      maximumSubstitutions: 5,
      substitutionWindowLimit: 3,
      allowsPlayerReentry: false,
      yellowCardAccumulationThreshold: 5,
      straightRedSuspensionMatches: 3,
      secondYellowSuspensionMatches: 1,
      yellowAccumulationSuspensionMatches: 1,
    },
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
  const { playerStates, playerIds, players } = initialPlayerStates(input, initialFitness);

  return {
    ...input,
    teamsByClubId: fitnessReadyTeams(input),
    fitnessLifecycle: {
      playerStates,
      playerIds,
      players,
      recoveryPolicy: TEST_RECOVERY_POLICY,
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
  const { playerStates, playerIds, players } = initialPlayerStates(input, initialFitness);

  return {
    ...input,
    fitnessLifecycle: {
      playerStates,
      playerIds,
      players,
      recoveryPolicy: TEST_RECOVERY_POLICY,
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
  readonly players: Readonly<Record<PlayerId, Player>>;
} {
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const playerIds: PlayerId[] = [];
  const players: Record<PlayerId, Player> = {};

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
      const player = team.players[trackedPlayerId];
      if (player !== undefined) players[trackedPlayerId] = player;
    }
  }

  return { playerStates, playerIds, players };
}

/**
 * Extends one fitness lifecycle input with additional tracked players.
 */
function addLifecyclePlayers(input: SimulateSeasonInput, playerIds: readonly PlayerId[]): SimulateSeasonInput {
  const lifecycle = input.fitnessLifecycle;
  assert.ok(lifecycle !== undefined);
  const playerStates: Record<PlayerId, PlayerDynamicState> = { ...lifecycle.playerStates };
  const players: Record<PlayerId, Player> = { ...lifecycle.players };

  for (const playerId of playerIds) {
    playerStates[playerId] = {
      fitness: stateValue(100),
      form: stateValue(50),
      morale: stateValue(50),
    };
    players[playerId] = makePlayer(playerId, 10);
  }

  return {
    ...input,
    fitnessLifecycle: {
      ...lifecycle,
      playerStates,
      players,
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
        mentality: "balanced",
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

/** Exact natural-position skeleton that can fill the imposed test 4-4-2. */
function completeAiSelectionXi(clubId: ClubId): readonly PlayerId[] {
  const clubKey = String(clubId).slice("club:".length);
  return [
    "gk-01",
    "rb-01",
    "cb-01",
    "cb-02",
    "lb-01",
    "rm-01",
    "cm-01",
    "cm-02",
    "lm-01",
    "st-01",
    "st-02",
  ].map((suffix) => playerId(`player:${clubKey}-${suffix}`));
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
    rm: "wide_midfielder",
    lm: "wide_midfielder",
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
