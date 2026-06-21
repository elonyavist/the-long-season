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
import { simulateMatch } from "../match-engine/simulate-match.ts";
import { applyMatchReportToFixture } from "../use-cases/apply-match-report-to-fixture.ts";
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

  const report = createMatchReport(
    simulateMatch({
      fixtureId: nextFixture.fixtureId,
      seed: input.careerState.gameState.meta.seed,
      home,
      away,
      engineConfig: input.matchEngineConfig,
    }),
  );
  const gameStateWithResult = applyMatchReportToFixture({
    state: input.careerState.gameState,
    fixtureId: nextFixture.fixtureId,
    report,
  });
  const progressedCareerState = createCareerState({
    ...input.careerState,
    gameState: {
      ...gameStateWithResult,
      calendar: {
        ...gameStateWithResult.calendar,
        currentDate: nextFixture.fixture.date > gameStateWithResult.calendar.currentDate
          ? nextFixture.fixture.date
          : gameStateWithResult.calendar.currentDate,
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
    careerState: progressedCareerState,
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
