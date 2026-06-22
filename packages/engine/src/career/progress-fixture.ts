import {
  createCareerState,
  type CareerState,
  type ClubId,
  type Fixture,
  type FixtureId,
  type MatchReport,
} from "@game/domain";

import type { MatchEngineConfig } from "../match-engine/match-engine-config.ts";
import type { MatchTeamContext } from "../match-engine/match-context.ts";
import { createMatchReport } from "../match-engine/create-match-report.ts";
import type { MatchExplanationConditionSnapshot, MatchExplanationTrace } from "../match-engine/match-explanation-trace.ts";
import { simulateMatch } from "../match-engine/simulate-match.ts";
import { applyMatchReportToFixture } from "../use-cases/apply-match-report-to-fixture.ts";
import { applyCareerFixtureConditionConsequences, type CareerFixtureConditionChange } from "./career-condition-consequences.ts";
import { findNextCareerFixture, type NextCareerFixtureInvalidReason } from "./next-fixture.ts";

/** Invalid-state reasons specific to career fixture progression. */
export type ProgressCareerFixtureInvalidReason =
  | NextCareerFixtureInvalidReason
  | "missing_home_team_context"
  | "missing_away_team_context"
  | "home_team_context_mismatch"
  | "away_team_context_mismatch";

/** Input for simulating and applying exactly one next selected-club fixture. */
export interface ProgressNextCareerFixtureInput {
  /** Current durable career state loaded by the caller. */
  readonly careerState: CareerState;
  /** Match-ready team contexts keyed by club ID; no team decisions are inferred here. */
  readonly teamsByClubId: Readonly<Record<ClubId, MatchTeamContext>>;
  /** Match-engine tuning supplied by caller content/config. */
  readonly matchEngineConfig: MatchEngineConfig;
  /** Whether to attach optional explanation data for the played fixture. */
  readonly includeExplanationTrace?: boolean;
}

/** Result returned when one selected-club fixture was simulated and applied. */
export interface ProgressCareerFixtureAdvanced {
  /** Discriminator for successful progression. */
  readonly status: "advanced";
  /** Fixture ID that was selected and played. */
  readonly fixtureId: FixtureId;
  /** Fixture before applying the match report. */
  readonly fixtureBefore: Fixture;
  /** Fixture after applying the match report. */
  readonly fixtureAfter: Fixture;
  /** Durable match report produced by the simulation. */
  readonly report: MatchReport;
  /** Optional language-agnostic explanation trace for the played fixture. */
  readonly explanationTrace?: MatchExplanationTrace;
  /** Selected-club condition changes caused by this played fixture. */
  readonly conditionChanges: readonly CareerFixtureConditionChange[];
  /** Copied career state with the fixture result applied. */
  readonly careerState: CareerState;
}

/** Result returned when there is no selected-club fixture left to play. */
export interface ProgressCareerFixtureNone {
  /** Discriminator for the no-op no-fixture branch. */
  readonly status: "none";
  /** Original career state reference, unchanged. */
  readonly careerState: CareerState;
}

/** Result returned when progression cannot safely run from the supplied state. */
export interface ProgressCareerFixtureInvalid {
  /** Discriminator for validation failures. */
  readonly status: "invalid";
  /** Stable invalid-state reason. */
  readonly reason: ProgressCareerFixtureInvalidReason;
  /** Fixture related to the failure when available. */
  readonly fixtureId?: FixtureId;
  /** Original career state reference, unchanged. */
  readonly careerState: CareerState;
}

/** Result of trying to progress exactly one career fixture. */
export type ProgressCareerFixtureResult =
  | ProgressCareerFixtureAdvanced
  | ProgressCareerFixtureInvalid
  | ProgressCareerFixtureNone;

/**
 * Simulates and applies the selected club's next unplayed fixture.
 *
 * This function is deterministic for the same `CareerState`, team contexts,
 * and match config. It does not write storage, advance unrelated fixtures,
 * choose lineups, choose tactics, or run a full season.
 */
export function progressNextCareerFixture(input: ProgressNextCareerFixtureInput): ProgressCareerFixtureResult {
  const nextFixture = findNextCareerFixture(input.careerState);

  if (nextFixture.status === "none") {
    return {
      status: "none",
      careerState: input.careerState,
    };
  }

  if (nextFixture.status === "invalid") {
    return {
      status: "invalid",
      reason: nextFixture.reason,
      ...(nextFixture.fixtureId === undefined ? {} : { fixtureId: nextFixture.fixtureId }),
      careerState: input.careerState,
    };
  }

  const home = input.teamsByClubId[nextFixture.fixture.homeClubId];
  const away = input.teamsByClubId[nextFixture.fixture.awayClubId];

  if (home === undefined) {
    return invalidResult(input.careerState, "missing_home_team_context", nextFixture.fixtureId);
  }

  if (away === undefined) {
    return invalidResult(input.careerState, "missing_away_team_context", nextFixture.fixtureId);
  }

  if (home.clubId !== nextFixture.fixture.homeClubId) {
    return invalidResult(input.careerState, "home_team_context_mismatch", nextFixture.fixtureId);
  }

  if (away.clubId !== nextFixture.fixture.awayClubId) {
    return invalidResult(input.careerState, "away_team_context_mismatch", nextFixture.fixtureId);
  }

  const simulatedMatch = simulateMatch({
    fixtureId: nextFixture.fixtureId,
    seed: input.careerState.gameState.meta.seed,
    home,
    away,
    engineConfig: input.matchEngineConfig,
  }, {
    includeExplanationTrace: input.includeExplanationTrace === true,
  });
  const report = createMatchReport(
    simulatedMatch,
  );
  const gameStateWithResult = applyMatchReportToFixture({
    state: input.careerState.gameState,
    fixtureId: nextFixture.fixtureId,
    report,
  });
  const selectedClubContext = selectedClubTeamContext(input.careerState.selectedClubId, nextFixture.fixture, home, away);
  const selectedStarterIds = selectedClubContext.lineup.map((slot) => slot.playerId);
  const selectedClub = gameStateWithResult.clubs[input.careerState.selectedClubId];
  const conditionConsequences = applyCareerFixtureConditionConsequences({
    playerStates: gameStateWithResult.playerStates,
    selectedStarterIds,
    reportPlayerIds: selectedClub?.playerIds ?? selectedStarterIds,
  });
  const gameStateWithCondition = {
    ...gameStateWithResult,
    playerStates: conditionConsequences.playerStates,
  };
  const progressedCareerState = createCareerState({
    ...input.careerState,
    gameState: {
      ...gameStateWithCondition,
      calendar: {
        ...gameStateWithCondition.calendar,
        currentDate: nextFixture.fixture.date > gameStateWithCondition.calendar.currentDate
          ? nextFixture.fixture.date
          : gameStateWithCondition.calendar.currentDate,
      },
    },
  });
  const fixtureAfter = progressedCareerState.gameState.fixtures[nextFixture.fixtureId];

  if (fixtureAfter === undefined) {
    return invalidResult(input.careerState, "fixture_missing", nextFixture.fixtureId);
  }

  return {
    status: "advanced",
    fixtureId: nextFixture.fixtureId,
    fixtureBefore: nextFixture.fixture,
    fixtureAfter,
    report,
    ...(simulatedMatch.explanationTrace === undefined
      ? {}
      : {
          explanationTrace: withSelectedClubConditionTrace(
            simulatedMatch.explanationTrace,
            input.careerState.selectedClubId,
            conditionConsequences.changes,
          ),
        }),
    conditionChanges: conditionConsequences.changes,
    careerState: progressedCareerState,
  };
}

/**
 * Returns the match team context belonging to the selected club.
 */
function selectedClubTeamContext(
  selectedClubId: ClubId,
  fixture: Fixture,
  home: MatchTeamContext,
  away: MatchTeamContext,
): MatchTeamContext {
  return fixture.homeClubId === selectedClubId ? home : away;
}

/**
 * Marks selected-club condition tracking inside an optional explanation trace.
 */
function withSelectedClubConditionTrace(
  trace: MatchExplanationTrace,
  selectedClubId: ClubId,
  conditionChanges: readonly CareerFixtureConditionChange[],
): MatchExplanationTrace {
  const conditionImpact = conditionImpactFromChanges(conditionChanges);

  if (trace.home.clubId === selectedClubId) {
    return {
      ...trace,
      home: {
        ...trace.home,
        conditionImpact,
      },
    };
  }

  if (trace.away.clubId === selectedClubId) {
    return {
      ...trace,
      away: {
        ...trace.away,
        conditionImpact,
      },
    };
  }

  return trace;
}

/**
 * Converts pre-match starter fitness into a trace-level condition summary.
 */
function conditionImpactFromChanges(
  conditionChanges: readonly CareerFixtureConditionChange[],
): MatchExplanationConditionSnapshot {
  const tiredStarterCount = conditionChanges.filter((change) => change.started && change.beforeFitness < 100).length;

  return {
    tracking: "tracked",
    effectDirection: tiredStarterCount > 0 ? "negative" : "neutral",
    affectedPlayerCount: tiredStarterCount,
  };
}

function invalidResult(
  careerState: CareerState,
  reason: ProgressCareerFixtureInvalidReason,
  fixtureId: FixtureId,
): ProgressCareerFixtureInvalid {
  return {
    status: "invalid",
    reason,
    fixtureId,
    careerState,
  };
}
