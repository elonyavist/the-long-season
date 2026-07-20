import {
  createLiveMatchStatistics,
  type LiveMatchStatistics,
  type MatchEventSide,
  type PlayerId,
} from "@game/domain";

import type { MatchSimulationState } from "./match-simulation-state.ts";
import { telemetryFor } from "./match-simulation-state.ts";
import {
  buildPlayerMatchRatings,
  playerRatingRegistrationsFromContext,
  type PlayerMatchRatingRegistration,
  type PlayerMatchRatingRow,
} from "./player-match-rating.ts";
import type { MatchStepEvent } from "./step-match.ts";

/** Live player row derived from contribution facts and match-relative condition. */
export interface LivePlayerMatchProjection extends PlayerMatchRatingRow {
  /** Current match-relative condition in the inclusive 1..100 range. */
  readonly condition: number;
}

/** Complete engine-owned projection used by live and final match adapters. */
export interface LiveMatchProjection {
  readonly statistics: LiveMatchStatistics;
  readonly players: readonly LivePlayerMatchProjection[];
}

/** Input for the canonical live match projection. */
export interface BuildLiveMatchProjectionInput {
  readonly simulation: MatchSimulationState;
  readonly events: readonly MatchStepEvent[];
  /** Include former starters or future substitutes not present in current context. */
  readonly playerRegistrations?: readonly PlayerMatchRatingRegistration[];
}

/** Builds cumulative statistics, ratings, and condition from engine facts only. */
export function buildLiveMatchProjection(input: BuildLiveMatchProjectionInput): LiveMatchProjection {
  const telemetry = telemetryFor(input.simulation);
  assertScoreAgreement(input.simulation);
  const controlTotal = telemetry.controlUnits.home + telemetry.controlUnits.away;
  const possession =
    controlTotal === 0
      ? { home: 0, away: 0 }
      : {
          home: telemetry.controlUnits.home / controlTotal,
          away: telemetry.controlUnits.away / controlTotal,
        };
  const statistics = createLiveMatchStatistics({
    home: {
      possessionShare: possession.home,
      ...telemetry.stats.home,
    },
    away: {
      possessionShare: possession.away,
      ...telemetry.stats.away,
    },
  });
  const registrations = input.playerRegistrations ?? playerRatingRegistrationsFromContext(input.simulation.context);
  const ratings = buildPlayerMatchRatings({
    events: input.events,
    playerRegistrations: registrations,
    sortBy: "side_order",
  });

  return {
    statistics,
    players: ratings.map((rating) => ({
      ...rating,
      condition: telemetry.playerCondition[rating.playerId] ?? 100,
    })),
  };
}

function assertScoreAgreement(simulation: MatchSimulationState): void {
  const telemetry = telemetryFor(simulation);
  if (
    telemetry.stats.home.goals !== simulation.score.home ||
    telemetry.stats.away.goals !== simulation.score.away
  ) {
    throw new LiveMatchProjectionError(
      "score_statistics_mismatch",
      `Score ${simulation.score.home}-${simulation.score.away} disagrees with live statistics ` +
        `${telemetry.stats.home.goals}-${telemetry.stats.away.goals}`,
    );
  }
}

/** Machine-readable projection consistency failures. */
export type LiveMatchProjectionErrorCode = "score_statistics_mismatch";

/** Raised when cumulative engine facts cannot form a truthful projection. */
export class LiveMatchProjectionError extends Error {
  public readonly code: LiveMatchProjectionErrorCode;

  public constructor(code: LiveMatchProjectionErrorCode, message: string) {
    super(message);
    this.name = "LiveMatchProjectionError";
    this.code = code;
  }
}

/** Builds one explicit registration without leaking adapter-specific row types. */
export function livePlayerRegistration(playerId: PlayerId, side: MatchEventSide): PlayerMatchRatingRegistration {
  return { playerId, side };
}
