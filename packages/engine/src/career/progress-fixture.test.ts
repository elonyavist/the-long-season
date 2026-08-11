import { createLineupSlot } from "../match-engine/index.ts";
import assert from "node:assert/strict";
import { test } from "vitest";
import { fromISO } from "@game/shared";

import {
  CAREER_STATE_SCHEMA_VERSION,
  abilityValue,
  accruePlayerFixtureParticipation,
  clubId,
  competitionId,
  createCareerState,
  createCompetitionMatchRules,
  createEmptyPlayerParticipationLedger,
  fixtureId,
  gameDate,
  getFormation,
  playerId,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type CareerPlayerAvailabilityState,
  type Club,
  type ClubId,
  type Fixture,
  type GameState,
  type PlayerParticipationLedger,
  type PlayerDynamicState,
  type PlayerId,
  type Player,
  type PlayerPosition,
  type PlayerRole,
} from "@game/domain";

import {
  simulateMatch,
  type MatchEngineConfig,
  type MatchTeamContext,
} from "../match-engine/index.ts";
import { createMatchReport } from "../match-engine/create-match-report.ts";
import { selectCareerAiTeam } from "./career-ai-team-selection.ts";
import {
  commitCompletedCareerFixture as commitCompletedCareerFixtureWithPolicy,
  progressNextCareerFixture as progressNextCareerFixtureWithPolicy,
} from "./progress-fixture.ts";
import { playerWagePolicyConfigFixture } from "../test-fixtures/player-wage-policy-config.ts";
import { marketBehaviorConfigFixture } from "../test-fixtures/market-behavior-config.ts";
import { playerValuationConfigFixture } from "../test-fixtures/player-valuation-config.ts";
import {
  playerDevelopmentCalibrationVersionsFixture,
  playerDevelopmentEnvironmentConfigFixture,
} from "../test-fixtures/player-development-environment-config.ts";
import {
  matchTacticsCalibrationFixture,
  tacticalShapeProfileFixture,
} from "../test-fixtures/match-tactics-calibration.ts";
import { withNeutralIncidentProfiles } from "../test-fixtures/match-player-incident-profiles.ts";
import { playerStateCurvesConfigFixture } from "../test-fixtures/player-state-curves-config.ts";


function progressNextCareerFixture(
  input: Omit<
    Parameters<typeof progressNextCareerFixtureWithPolicy>[0],
    | "wagePolicy"
    | "marketBehaviorPolicy"
    | "valuationConfig"
    | "playerDevelopmentEnvironmentConfig"
    | "playerStateCurvesConfig"
  >,
) {
  return progressNextCareerFixtureWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
    valuationConfig: playerValuationConfigFixture(),
    playerDevelopmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
    playerStateCurvesConfig: playerStateCurvesConfigFixture(),
  });
}

function commitCompletedCareerFixture(
  input: Omit<
    Parameters<typeof commitCompletedCareerFixtureWithPolicy>[0],
    | "wagePolicy"
    | "marketBehaviorPolicy"
    | "valuationConfig"
    | "playerDevelopmentEnvironmentConfig"
    | "playerStateCurvesConfig"
  >,
) {
  return commitCompletedCareerFixtureWithPolicy({
    ...input,
    wagePolicy: playerWagePolicyConfigFixture(),
    marketBehaviorPolicy: marketBehaviorConfigFixture(),
    valuationConfig: playerValuationConfigFixture(),
    playerDevelopmentEnvironmentConfig: playerDevelopmentEnvironmentConfigFixture(),
    playerStateCurvesConfig: playerStateCurvesConfigFixture(),
  });
}

/**
 * Career progression tests prove one selected-club fixture can be simulated and
 * applied without writing storage or advancing unrelated fixtures.
 */

test("progressNextCareerFixture simulates and applies the next selected-club fixture without mutating input", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedFixtureId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(selectedFixtureId, selectedClubId, otherClubId)],
  });
  const before = JSON.stringify(careerState);

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.equal(result.status, "advanced");
  assert.equal(JSON.stringify(careerState), before);
  if (result.status === "advanced") {
    assert.equal(result.fixtureId, selectedFixtureId);
    assert.equal(result.report.fixtureId, selectedFixtureId);
    assert.equal(result.fixtureBefore.result, undefined);
    assert.equal(result.fixtureAfter.result?.played, true);
    assert.equal(result.careerState.gameState.fixtures[selectedFixtureId]?.result?.played, true);
    assert.equal(result.careerState.playerParticipationLedger?.rowKeys.length, 4);
    // This fixture used to finish level, which left a starter with no personal
    // contribution untouched. It is now a win to nil, so the starter carries the
    // result while the unused substitute below still carries nothing - which is
    // the distinction these three rows exist to make.
    assert.equal(result.careerState.gameState.playerStates[playerId("player:selected-01")]?.fitness, 92);
    assert.equal(result.careerState.gameState.playerStates[playerId("player:selected-01")]?.form, 52);
    assert.equal(result.careerState.gameState.playerStates[playerId("player:selected-01")]?.morale, 53);
    assert.notEqual(result.careerState.gameState.playerStates[playerId("player:selected-02")]?.form, 50);
    assert.equal(result.careerState.gameState.playerStates[playerId("player:selected-03")]?.fitness, 100);
    assert.equal(result.careerState.gameState.playerStates[playerId("player:selected-03")]?.form, 50);
    assert.equal(result.careerState.gameState.playerStates[playerId("player:selected-03")]?.morale, 50);
    assert.equal(result.playerStateConsequences.length > 0, true);
    assert.equal(result.playerStateConsequenceSummary.changedPlayerCount, result.playerStateConsequences.length);
    assert.deepEqual(result.monthlyLifecycle, []);
    assert.deepEqual(result.conditionChanges.slice(0, 3), [
      {
        playerId: playerId("player:selected-01"),
        beforeFitness: 100,
        afterFitness: 92,
        delta: -8,
        started: true,
      },
      {
        playerId: playerId("player:selected-02"),
        beforeFitness: 100,
        afterFitness: 92,
        delta: -8,
        started: true,
      },
      {
        playerId: playerId("player:selected-03"),
        beforeFitness: 100,
        afterFitness: 100,
        delta: 0,
        started: false,
      },
    ]);
    assert.equal(result.careerState.gameState.calendar.currentDate, careerState.gameState.calendar.currentDate);
  }
});

test("progressNextCareerFixture closes a complete quarter before accruing the fixture", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedFixtureId = fixtureId("fixture:000001");
  const currentDate = gameDate(fromISO("2026-08-01"));
  const fixtureDate = gameDate(fromISO("2026-11-08"));
  const monthKeys = ["2026-08", "2026-09", "2026-10"];
  let playerParticipationLedger = createEmptyPlayerParticipationLedger();
  for (const monthKey of monthKeys) {
    playerParticipationLedger = accruePlayerFixtureParticipation(playerParticipationLedger, {
      fixtureId: fixtureId(`fixture:previous-${monthKey}`),
      playerId: playerId("player:selected-01"),
      clubId: selectedClubId,
      seasonId: seasonId("season:test"),
      monthKey,
      started: true,
      substituteAppearance: false,
      minutes: 90,
      rating: 7,
      playedRoleMinutes: { goalkeeper: 90 },
    });
  }
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(selectedFixtureId, selectedClubId, otherClubId, false, fixtureDate)],
    currentDate,
    playerParticipationLedger,
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    },
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.deepEqual(result.monthlyLifecycle.map((summary) => summary.monthKey), monthKeys);
    assert.deepEqual(
      result.careerState.playerParticipationLedger?.closedMonthKeys,
      monthKeys.map((monthKey) => `season:test|${monthKey}`),
    );
    assert.equal(result.careerState.playerParticipationLedger?.rowKeys.length, 7);
  }
});

test("progressNextCareerFixture is deterministic for the same state and team contexts", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId)],
  });
  const input = {
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  };

  assert.deepEqual(progressNextCareerFixture(input), progressNextCareerFixture(input));
});

test("progressNextCareerFixture identifies every ineligible selected player without changing the plan", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedFixtureId = fixtureId("fixture:000001");
  const injuredPlayerId = playerId("player:selected-02");
  const fixture = fixtureFixture(selectedFixtureId, selectedClubId, otherClubId);
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixture],
    playerAvailability: {
      injuries: [{
        fixtureId: selectedFixtureId,
        playerId: injuredPlayerId,
        severity: "minor",
        occurredOn: gameDate(19_999),
        unavailableUntil: gameDate(20_003),
      }],
      suspensions: [],
      yellowCards: [],
    },
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    },
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.equal(result.status, "invalid");
  if (result.status === "invalid") {
    assert.equal(result.reason, "unavailable_player_selected");
    assert.deepEqual(result.eligibilityBlockers, [
      { playerId: injuredPlayerId, reason: "injured" },
    ]);
    assert.equal(result.careerState, careerState);
  }
});

test("commitCompletedCareerFixture publishes the watched final state without reconstructing its last minute", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedFixtureId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(selectedFixtureId, selectedClubId, otherClubId)],
  });
  const selectedTeam = teamContextFixture(selectedClubId, 12);
  const initialContext = {
    fixtureId: selectedFixtureId,
    seed: careerState.gameState.meta.seed,
    home: selectedTeam,
    away: teamContextFixture(otherClubId, 10),
    engineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
  };
  const completed = simulateMatch(initialContext);
  const report = createMatchReport(completed);

  const finalContext = {
    ...initialContext,
    home: {
      ...initialContext.home,
      lineup: initialContext.home.lineup.slice(1),
    },
  };
  const committed = commitCompletedCareerFixture({
    careerState,
    report,
    initialContext,
    finalContext,
    selectedClubBenchPlayerIds: [],
    appliedSubstitutions: [],
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.equal(committed.status, "advanced");
  if (committed.status === "advanced") {
    assert.deepEqual(committed.report, report);
    assert.equal(committed.fixtureAfter.result?.played, true);
    assert.equal(committed.careerState.playerParticipationLedger?.rowKeys.length, 4);
  }
});

test("progressNextCareerFixture keeps a compact deterministic progression sentinel", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const selectedFixtureId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(selectedFixtureId, selectedClubId, otherClubId)],
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    // This sentinel protects the manager-facing fixture progression contract
    // before future phases change season advancement orchestration.
    //
    // Last moved when the shot chain was reordered so the keeper decides goals
    // against saves rather than deciding how many shots reach him.
    //
    // Two strength points used to separate this fixture `15` chances to `7` and
    // still finish level. They now separate it `11` to `8`, and the stronger
    // side converts that edge: five of its eleven chances reach the goal and
    // four beat the keeper, while the weaker side works one shot on target all
    // match. Dominating a game better than two to one and drawing it was never
    // the believable reading, and the one save is the keeper existing - an
    // earlier draft let every shot on target go in.
    //
    // Everything downstream of the scoreline followed rather than drifted. Both
    // starters carry `result_win` and `team_clean_sheet`, the scorer carries
    // `player_goal` on top, and the summary is their sum. Condition changes are
    // untouched, because minutes played do not depend on the result.
    assert.deepEqual(
      {
        fixtureId: result.fixtureId,
        score: result.report.score,
        eventCount: result.report.events.length,
        stats: result.report.stats,
        fixtureAfterResult: {
          played: result.fixtureAfter.result?.played,
          homeGoals: result.fixtureAfter.result?.homeGoals,
          awayGoals: result.fixtureAfter.result?.awayGoals,
        },
        currentDate: result.careerState.gameState.calendar.currentDate,
        conditionChanges: result.conditionChanges.slice(0, 3),
        playerStateConsequences: result.playerStateConsequences,
        playerStateConsequenceSummary: result.playerStateConsequenceSummary,
        monthlyLifecycle: result.monthlyLifecycle,
      },
      {
        fixtureId: selectedFixtureId,
        score: {
          home: 4,
          away: 0,
        },
        eventCount: 46,
        stats: {
          home: {
            opportunities: 11,
            shots: 11,
            shotsOnTarget: 5,
            goals: 4,
          },
          away: {
            opportunities: 8,
            shots: 8,
            shotsOnTarget: 1,
            goals: 0,
          },
        },
        fixtureAfterResult: {
          played: true,
          homeGoals: 4,
          awayGoals: 0,
        },
        currentDate: gameDate(20_000),
        conditionChanges: [
          {
            playerId: playerId("player:selected-01"),
            beforeFitness: 100,
            afterFitness: 92,
            delta: -8,
            started: true,
          },
          {
            playerId: playerId("player:selected-02"),
            beforeFitness: 100,
            afterFitness: 92,
            delta: -8,
            started: true,
          },
          {
            playerId: playerId("player:selected-03"),
            beforeFitness: 100,
            afterFitness: 100,
            delta: 0,
            started: false,
          },
        ],
        playerStateConsequences: [
          {
            playerId: playerId("player:selected-01"),
            participantRole: "starter",
            beforeForm: 50,
            afterForm: 52,
            formDelta: 2,
            beforeMorale: 50,
            afterMorale: 53,
            moraleDelta: 3,
            reasonKeys: ["result_win", "team_clean_sheet"],
          },
          {
            playerId: playerId("player:selected-02"),
            participantRole: "starter",
            beforeForm: 50,
            afterForm: 55,
            formDelta: 5,
            beforeMorale: 50,
            afterMorale: 54,
            moraleDelta: 4,
            reasonKeys: ["result_win", "team_clean_sheet", "player_goal"],
          },
        ],
        playerStateConsequenceSummary: {
          changedPlayerCount: 2,
          totalFormDelta: 7,
          totalMoraleDelta: 7,
        },
        monthlyLifecycle: [],
      },
    );
  }
});

test("progressNextCareerFixture can include explanation trace without changing fixture progression", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId)],
  });
  const input = {
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  };

  const normal = progressNextCareerFixture(input);
  const explained = progressNextCareerFixture({
    ...input,
    includeExplanationTrace: true,
  });

  assert.equal(explained.status, "advanced");
  if (normal.status === "advanced" && explained.status === "advanced") {
    assert.equal(normal.explanationTrace, undefined);
    assert.equal(explained.explanationTrace?.fixtureId, normal.fixtureId);
    assert.equal(explained.explanationTrace?.home.conditionImpact.tracking, "tracked");
    assert.equal(explained.explanationTrace?.home.conditionImpact.effectDirection, "neutral");
    assert.deepEqual(explained.fixtureAfter, normal.fixtureAfter);
    assert.deepEqual(explained.report, normal.report);
  }
});

test("progressNextCareerFixture reports negative selected-club condition impact when starters are tired before kickoff", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId)],
    playerStateOverrides: {
      [playerId("player:selected-01")]: playerStateFixture(84),
    },
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
    includeExplanationTrace: true,
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.equal(result.explanationTrace?.home.conditionImpact.tracking, "tracked");
    assert.equal(result.explanationTrace?.home.conditionImpact.effectDirection, "negative");
    assert.equal(result.explanationTrace?.home.conditionImpact.affectedPlayerCount, 1);
  }
});

test("progressNextCareerFixture treats caller-supplied recovered state as the pre-match truth", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const recoveredFitness = 96;
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId)],
    playerStateOverrides: {
      [playerId("player:selected-01")]: playerStateFixture(recoveredFitness),
    },
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    const changedStarter = result.conditionChanges.find((change) => change.playerId === playerId("player:selected-01"));

    assert.deepEqual(changedStarter, {
      playerId: playerId("player:selected-01"),
      beforeFitness: recoveredFitness,
      afterFitness: 88,
      delta: -8,
      started: true,
    });
  }
});

test("progressNextCareerFixture returns none when there is no fixture to advance", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureId("fixture:000001"), selectedClubId, otherClubId, true)],
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
      [otherClubId]: teamContextFixture(otherClubId, 10),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.deepEqual(result, {
    status: "none",
    careerState,
  });
});

test("progressNextCareerFixture reports missing team context without simulating", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const fixtureToPlayId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureToPlayId, selectedClubId, otherClubId)],
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
    } as Record<ClubId, MatchTeamContext>,
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.deepEqual(result, {
    status: "invalid",
    reason: "missing_away_team_context",
    fixtureId: fixtureToPlayId,
    careerState,
  });
});

/**
 * Fixes that AI selection holds for the whole world, not the manager's rivals (A2).
 *
 * The step's value is a coherent league, and the background-fixture work that
 * follows selects an eleven for roughly `270` clubs a matchday through this same
 * function. A club the manager neither faces nor shares a competition with is
 * the case a narrower implementation would leave on a fallback path.
 */
test("a club the manager never meets still selects a typed eleven in a real shape", () => {
  const selectedClubId = clubId("club:selected");
  const strangerClubId = clubId("club:stranger");
  const fixtureToPlayId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), fullSquadClubFixture(strangerClubId)],
    fixtures: [fixtureFixture(fixtureToPlayId, selectedClubId, clubId("club:other"))],
  });

  const stranger = selectCareerAiTeam({
    careerState,
    clubId: strangerClubId,
    fixture: careerState.gameState.fixtures[fixtureToPlayId] as Fixture,
    policy: {
      roleWeights: roleWeightsFixture(),
      tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
    },
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    valuationConfig: playerValuationConfigFixture(),
  });

  assert.equal(stranger.teamContext.clubId, strangerClubId);
  assert.equal(stranger.teamContext.lineup.length, 11);
  assert.equal(stranger.teamContext.lineup[0]?.canonicalRole, "goalkeeper");
  assert.equal(
    stranger.teamContext.lineup.every((slot) => slot.slotId.includes(":")),
    true,
  );
  assert.equal(new Set(stranger.teamContext.lineup.map((slot) => slot.playerId)).size, 11);
  assert.equal(stranger.benchPlayerIds.length > 0, true);
});

test("career AI can field a strong academy player without adding him to the senior roster", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const academyPlayerId = playerId("player:other-academy-st-01");
  const seniorClub = fullSquadClubFixture(otherClubId);
  const academyPlayer = {
    ...playerFixtureWithPositions(academyPlayerId, ["st"]),
    abilities: abilitySetFixture(20),
    potential: abilitySetFixture(20),
  } satisfies Player;
  const fixture = fixtureFixture(fixtureId("fixture:academy-call-up"), selectedClubId, otherClubId);
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), seniorClub],
    fixtures: [fixture],
    academyPlayers: [{ clubId: otherClubId, player: academyPlayer }],
  });

  const selection = selectCareerAiTeam({
    careerState,
    clubId: otherClubId,
    fixture,
    policy: {
      roleWeights: roleWeightsFixture(),
      tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
    },
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    valuationConfig: playerValuationConfigFixture(),
  });

  assert.equal(seniorClub.playerIds.length, 15);
  assert.equal(seniorClub.playerIds.includes(academyPlayerId), false);
  assert.equal(
    selection.teamContext.lineup.some(({ playerId: selectedId }) => selectedId === academyPlayerId),
    true,
  );
  assert.deepEqual(careerState.youthAcademyState?.clubRosters[otherClubId]?.playerIds, [academyPlayerId]);
});

/**
 * Fixes that AI clubs actually rotate (Step 09).
 *
 * The selector has always had a rotation policy and nothing ever supplied it,
 * so every AI club fielded the same eleven every week for as long as a career
 * lasted. The durable participation ledger is where the minutes already are.
 */
test("an AI club rests the footballers it has been leaning on", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const fixtureToPlayId = fixtureId("fixture:000001");
  const fixtureDate = gameDate(fromISO("2026-11-08"));
  const workedIds = ["cb-01", "cb-02", "cm-01", "cm-02", "st-01", "st-02"]
    .map((name) => playerId(`player:other-${name}`));

  let ledger = createEmptyPlayerParticipationLedger();
  for (const [index, workedId] of workedIds.entries()) {
    for (let match = 0; match < 3; match += 1) {
      ledger = accruePlayerFixtureParticipation(ledger, {
        fixtureId: fixtureId(`fixture:worked-${index}-${match}`),
        playerId: workedId,
        clubId: otherClubId,
        seasonId: seasonId("season:test"),
        monthKey: "2026-11",
        started: true,
        substituteAppearance: false,
        minutes: 90,
        rating: 7,
        playedRoleMinutes: { central_midfielder: 90 },
      });
    }
  }

  const selectionFor = (playerParticipationLedger: PlayerParticipationLedger) => selectCareerAiTeam({
    careerState: careerStateFixture({
      selectedClubId,
      clubs: [clubFixture(selectedClubId), fullSquadClubFixture(otherClubId)],
      fixtures: [fixtureFixture(fixtureToPlayId, selectedClubId, otherClubId, false, fixtureDate)],
      playerParticipationLedger,
    }),
    clubId: otherClubId,
    fixture: { ...fixtureFixture(fixtureToPlayId, selectedClubId, otherClubId, false, fixtureDate) },
    policy: {
      roleWeights: roleWeightsFixture(),
      tacticalDistribution: { directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.5, mentality: "balanced" },
    },
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    valuationConfig: playerValuationConfigFixture(),
  });

  const rested = selectionFor(createEmptyPlayerParticipationLedger());
  const worked = selectionFor(ledger);
  const startedWhenWorked = new Set(worked.teamContext.lineup.map((slot) => slot.playerId));

  assert.equal(worked.teamContext.lineup.length, 11);
  assert.notDeepEqual(
    worked.teamContext.lineup.map((slot) => slot.playerId),
    rested.teamContext.lineup.map((slot) => slot.playerId),
  );
  assert.equal(workedIds.some((workedId) => !startedWhenWorked.has(workedId)), true);
});

test("progressNextCareerFixture can build the non-selected opponent context with AI selection", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const fixtureToPlayId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [clubFixture(selectedClubId), fullSquadClubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureToPlayId, selectedClubId, otherClubId)],
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [selectedClubId]: teamContextFixture(selectedClubId, 12),
    },
    aiTeamSelection: {
      roleWeights: roleWeightsFixture(),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
        mentality: "balanced",
      },
      benchSize: 8,
    },
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.equal(result.status, "advanced");
  if (result.status === "advanced") {
    assert.equal(result.fixtureId, fixtureToPlayId);
    assert.equal(result.fixtureAfter.result?.played, true);
    assert.equal(result.report.fixtureId, fixtureToPlayId);
  }
});

test("progressNextCareerFixture never auto-builds the selected club lineup", () => {
  const selectedClubId = clubId("club:selected");
  const otherClubId = clubId("club:other");
  const fixtureToPlayId = fixtureId("fixture:000001");
  const careerState = careerStateFixture({
    selectedClubId,
    clubs: [fullSquadClubFixture(selectedClubId), clubFixture(otherClubId)],
    fixtures: [fixtureFixture(fixtureToPlayId, selectedClubId, otherClubId)],
  });

  const result = progressNextCareerFixture({
    careerState,
    teamsByClubId: {
      [otherClubId]: teamContextFixture(otherClubId, 10),
    },
    aiTeamSelection: {
      roleWeights: roleWeightsFixture(),
      tacticalDistribution: {
        directness: 0.5,
        pressing: 0.5,
        width: 0.5,
        risk: 0.5,
        mentality: "balanced",
      },
    },
    matchEngineConfig: matchEngineConfigFixture(),
    matchTacticsCalibration: matchTacticsCalibrationFixture(),
    competitionMatchRules: competitionMatchRulesFixture(),
  });

  assert.deepEqual(result, {
    status: "invalid",
    reason: "missing_home_team_context",
    fixtureId: fixtureToPlayId,
    careerState,
  });
});

function careerStateFixture(input: {
  readonly selectedClubId: ClubId;
  readonly clubs: readonly Club[];
  readonly fixtures: readonly Fixture[];
  readonly playerStateOverrides?: Partial<Record<PlayerId, PlayerDynamicState>>;
  readonly currentDate?: ReturnType<typeof gameDate>;
  readonly playerParticipationLedger?: PlayerParticipationLedger;
  readonly playerAvailability?: CareerPlayerAvailabilityState;
  readonly academyPlayers?: readonly { readonly clubId: ClubId; readonly player: Player }[];
}): CareerState {
  const academyPlayers = input.academyPlayers ?? [];
  const gameState = gameStateFixture(
    input.clubs,
    input.fixtures,
    input.playerStateOverrides ?? {},
    input.currentDate ?? gameDate(20_000),
    academyPlayers.map(({ player }) => player),
  );
  const academyClubIds = [...new Set(academyPlayers.map(({ clubId }) => clubId))];
  return createCareerState({
    saveId: saveId("save:career-progress-fixture"),
    schemaVersion: CAREER_STATE_SCHEMA_VERSION,
    selectedClubId: input.selectedClubId,
    gameState,
    transferHistory: [],
    ...(input.playerParticipationLedger === undefined ? {} : { playerParticipationLedger: input.playerParticipationLedger }),
    ...(input.playerAvailability === undefined ? {} : { playerAvailability: input.playerAvailability }),
    ...(academyPlayers.length === 0 ? {} : {
      youthAcademyState: {
        clubRosterIds: academyClubIds,
        clubRosters: Object.fromEntries(academyClubIds.map((academyClubId) => [academyClubId, {
          clubId: academyClubId,
          playerIds: academyPlayers
            .filter(({ clubId: playerClubId }) => playerClubId === academyClubId)
            .map(({ player }) => player.id),
        }])) as NonNullable<CareerState["youthAcademyState"]>["clubRosters"],
        playerLifecycleIds: academyPlayers.map(({ player }) => player.id),
        playerLifecycle: Object.fromEntries(academyPlayers.map(({ clubId: academyClubId, player }) => [player.id, {
          playerId: player.id,
          clubId: academyClubId,
          status: "academy" as const,
          academyEntrySeasonId: seasonId("season:test"),
          academyEntryDate: gameDate(20_000),
        }])) as NonNullable<CareerState["youthAcademyState"]>["playerLifecycle"],
      },
    }),
  });
}

function gameStateFixture(
  clubs: readonly Club[],
  fixtures: readonly Fixture[],
  playerStateOverrides: Partial<Record<PlayerId, PlayerDynamicState>>,
  currentDate: ReturnType<typeof gameDate>,
  additionalPlayers: readonly Player[] = [],
): GameState {
  const clubsById: Partial<Record<ClubId, Club>> = {};
  const clubIds: ClubId[] = [];
  const fixturesById: Partial<Record<Fixture["id"], Fixture>> = {};
  const fixtureIds: Fixture["id"][] = [];
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};
  const players: Partial<Record<PlayerId, Player>> = {};
  const playerIds: PlayerId[] = [];

  for (const club of clubs) {
    clubsById[club.id] = club;
    clubIds.push(club.id);

    for (const clubPlayerId of club.playerIds) {
      playerStates[clubPlayerId] = playerStateOverrides[clubPlayerId] ?? playerStateFixture(100);
      players[clubPlayerId] = positionedPlayerFixture(clubPlayerId);
      playerIds.push(clubPlayerId);
    }
  }

  for (const fixture of fixtures) {
    fixturesById[fixture.id] = fixture;
    fixtureIds.push(fixture.id);
  }

  for (const player of additionalPlayers) {
    players[player.id] = player;
    playerIds.push(player.id);
    playerStates[player.id] = playerStateOverrides[player.id] ?? playerStateFixture(100);
  }

  return {
    meta: {
      seed: "career-progress-test",
      rngAlgorithmVersion: "test",
      saveSchemaVersion: 1,
      calibrationVersions: playerDevelopmentCalibrationVersionsFixture(),
    },
    calendar: {
      currentDate,
      currentSeasonId: seasonId("season:test"),
    },
    players: players as GameState["players"],
    playerIds,
    playerStates: playerStates as GameState["playerStates"],
    clubs: clubsById as GameState["clubs"],
    clubIds,
    fixtures: fixturesById as GameState["fixtures"],
    fixtureIds,
  };
}

function playerFixture(id: PlayerId): Player {
  const abilities = abilitySetFixture(10);

  const naturalPositions: readonly PlayerPosition[] = [
    String(id).endsWith("-01") ? "gk" : "cm",
  ];
  return {
    id,
    firstName: "Test",
    lastName: String(id),
    birthDate: gameDate(10_000),
    naturalPositions,
    primaryRole: primaryRoleForPosition(naturalPositions[0]!),
    abilities,
    potential: abilities,
  };
}

function abilitySetFixture(rawValue: number): Player["abilities"] {
  const value = abilityValue(rawValue);
  return {
    technical: { finishing: value, passing: value, longPassing: value, crossing: value, dribbling: value, technique: value, tackling: value, penalties: value, freeKicks: value },
    physical: { pace: value, strength: value, stamina: value, agility: value, heading: value },
    mental: { positioning: value, vision: value, anticipation: value, composure: value, determination: value, leadership: value },
    goalkeeping: { reflexes: value, handling: value, rushingOut: value, goalkeeperPositioning: value, footwork: value },
  };
}

function positionedPlayerFixture(id: PlayerId): Player {
  const key = String(id);
  if (key.includes("-gk-")) return playerFixtureWithPositions(id, ["gk"]);
  if (key.includes("-rb-")) return playerFixtureWithPositions(id, ["rb"]);
  if (key.includes("-cb-")) return playerFixtureWithPositions(id, ["cb"]);
  if (key.includes("-lb-")) return playerFixtureWithPositions(id, ["lb"]);
  if (key.includes("-rm-")) return playerFixtureWithPositions(id, ["rw"]);
  if (key.includes("-lm-")) return playerFixtureWithPositions(id, ["lw"]);
  if (key.includes("-st-")) return playerFixtureWithPositions(id, ["st"]);
  return playerFixture(id);
}

function playerFixtureWithPositions(id: PlayerId, naturalPositions: Player["naturalPositions"]): Player {
  return {
    ...playerFixture(id),
    naturalPositions,
    primaryRole: primaryRoleForPosition(naturalPositions[0]!),
  };
}

/** Keeps synthetic role identity coherent with the fixture's natural slot. */
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

function clubFixture(id: ClubId): Club {
  const playerPrefix = String(id).slice("club:".length);

  return {
    id,
    name: String(id),
    shortName: String(id).slice("club:".length).toUpperCase(),
    category: "third_division",
    reputation: 5,
    playerIds: [
      playerId(`player:${playerPrefix}-01`),
      playerId(`player:${playerPrefix}-02`),
      playerId(`player:${playerPrefix}-03`),
    ],
  };
}

function fullSquadClubFixture(id: ClubId): Club {
  const playerPrefix = String(id).slice("club:".length);

  return {
    ...clubFixture(id),
    playerIds: [
      playerId(`player:${playerPrefix}-gk-01`),
      playerId(`player:${playerPrefix}-gk-02`),
      playerId(`player:${playerPrefix}-rb-01`),
      playerId(`player:${playerPrefix}-cb-01`),
      playerId(`player:${playerPrefix}-cb-02`),
      playerId(`player:${playerPrefix}-cb-03`),
      playerId(`player:${playerPrefix}-lb-01`),
      playerId(`player:${playerPrefix}-rm-01`),
      playerId(`player:${playerPrefix}-cm-01`),
      playerId(`player:${playerPrefix}-cm-02`),
      playerId(`player:${playerPrefix}-cm-03`),
      playerId(`player:${playerPrefix}-lm-01`),
      playerId(`player:${playerPrefix}-st-01`),
      playerId(`player:${playerPrefix}-st-02`),
      playerId(`player:${playerPrefix}-st-03`),
    ],
  };
}

function fixtureFixture(
  id: Fixture["id"],
  homeClubId: ClubId,
  awayClubId: ClubId,
  played = false,
  date = gameDate(20_000),
): Fixture {
  return {
    id,
    competitionId: competitionId("competition:test"),
    seasonId: seasonId("season:test"),
    roundNumber: 1,
    date,
    homeClubId,
    awayClubId,
    ...(played
      ? {
          result: {
            played: true,
            homeGoals: 1,
            awayGoals: 0,
          },
        }
      : {}),
  };
}

function teamContextFixture(clubIdValue: ClubId, strength: number): MatchTeamContext {
  const playerPrefix = String(clubIdValue).slice("club:".length);

  return withNeutralIncidentProfiles({
    clubId: clubIdValue,
    lineup: [
      createLineupSlot({ slotId: "slot:01", playerId: playerId(`player:${playerPrefix}-01`), canonicalRole: "goalkeeper" }),
      createLineupSlot({ slotId: "slot:02", playerId: playerId(`player:${playerPrefix}-02`), canonicalRole: "center_back" }),
    ],
    strength: {
      attack: strength,
      midfield: strength,
      defense: strength,
      goalkeeper: strength,
      overall: strength,
    },
    shape: tacticalShapeProfileFixture(),
    tacticalDistribution: {
      directness: 0.5,
      pressing: 0.5,
      width: 0.5,
      risk: 0.5,
      mentality: "balanced",
    },
  });
}

function matchEngineConfigFixture(): MatchEngineConfig {
  return {
    minuteCount: 90,
    rates: {
      baseOpportunityRatePerMinute: 0.09,
      maxOpportunityRatePerMinute: 0.24,
    },
    conversionBands: [
      {
        bandKey: "low",
        minQualityInclusive: 0,
        maxQualityExclusive: 0.45,
        goalProbability: 0.105,
      },
      {
        bandKey: "medium",
        minQualityInclusive: 0.45,
        maxQualityExclusive: 0.65,
        goalProbability: 0.2,
      },
      {
        bandKey: "high",
        minQualityInclusive: 0.65,
        maxQualityExclusive: 1.01,
        goalProbability: 0.35,
      },
    ],
    homeAdvantageFactor: 1.1,
    strengthGapMultiplier: 1,
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  };
}

/** Supplies the explicit playable-league discipline contract to career progression. */
function competitionMatchRulesFixture() {
  return createCompetitionMatchRules({
    maximumSubstitutions: 5,
    substitutionWindowLimit: null,
    allowsPlayerReentry: false,
    yellowCardAccumulationThreshold: 5,
    straightRedSuspensionMatches: 3,
    secondYellowSuspensionMatches: 1,
    yellowAccumulationSuspensionMatches: 1,
  });
}

function roleWeightsFixture() {
  return {
    gk: {
      roleKey: "gk",
      department: "goalkeeper",
      abilityWeights: {
        "goalkeeping.reflexes": 3,
        "goalkeeping.handling": 2,
        "goalkeeping.goalkeeperPositioning": 2,
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
  } as const;
}

function playerStateFixture(fitness: number): PlayerDynamicState {
  return {
    fitness: stateValue(fitness),
    form: stateValue(50),
    morale: stateValue(50),
  };
}
