import {
  MATCH_EVENT_SCHEMA_VERSION,
  type MatchEvent,
  type MatchReport,
  type MatchStats,
} from "@game/domain";

import type { SimulateMatchResult } from "./simulate-match.ts";
import type { MatchStepEvent, MatchShotOutcomeStepEvent } from "./step-match.ts";

/**
 * Creates the durable domain report for one completed simulation result.
 *
 * @example
 * const report = createMatchReport(simulateMatch(context));
 */
export function createMatchReport(result: SimulateMatchResult): MatchReport {
  return {
    eventSchemaVersion: MATCH_EVENT_SCHEMA_VERSION,
    fixtureId: result.fixtureId,
    finalMinute: result.finalMinute,
    score: {
      home: result.score.home,
      away: result.score.away,
    },
    stats: copyStats(result.stats),
    events: result.events.map(toMatchEvent),
  };
}

/**
 * Converts one engine-local step event to the durable domain event contract.
 */
function toMatchEvent(event: MatchStepEvent): MatchEvent {
  switch (event.type) {
    case "kickoff":
      return {
        type: "kickoff",
        minute: event.minute,
      };
    case "shot_outcome":
      return toShotOutcomeEvent(event);
    case "half_time":
      return {
        type: "half_time",
        minute: event.minute,
        score: {
          home: event.score.home,
          away: event.score.away,
        },
      };
    case "full_time":
      return {
        type: "full_time",
        minute: event.minute,
        score: {
          home: event.score.home,
          away: event.score.away,
        },
      };
  }
}

/**
 * Converts one aggregate shot outcome to a specific domain event type.
 */
function toShotOutcomeEvent(event: MatchShotOutcomeStepEvent): MatchEvent {
  const shot = {
    minute: event.minute,
    side: event.side,
    quality: event.quality,
    isShotOnTarget: event.isShotOnTarget,
    shotType: event.shotType,
    chanceType: event.chanceType,
  };

  switch (event.outcome) {
    case "goal":
      return {
        type: "goal",
        shot,
        scorerPlayerId: event.scorerPlayerId,
        ...(event.assistPlayerId === undefined ? {} : { assistPlayerId: event.assistPlayerId }),
        ...(event.creatorPlayerId === undefined ? {} : { creatorPlayerId: event.creatorPlayerId }),
      };
    case "save": {
      if (event.goalkeeperPlayerId === undefined) {
        throw new Error("Save match event requires goalkeeperPlayerId");
      }

      return { type: "save", shot, shooterPlayerId: event.shooterPlayerId, goalkeeperPlayerId: event.goalkeeperPlayerId };
    }
    case "miss":
      return { type: "miss", shot, shooterPlayerId: event.shooterPlayerId };
    case "block":
      return {
        type: "block",
        shot,
        shooterPlayerId: event.shooterPlayerId,
        ...(event.primaryDefenderPlayerId === undefined
          ? {}
          : { primaryDefenderPlayerId: event.primaryDefenderPlayerId }),
      };
  }
}

/**
 * Copies aggregate stats into the domain report shape.
 */
function copyStats(stats: SimulateMatchResult["stats"]): MatchStats {
  return {
    home: {
      opportunities: stats.home.opportunities,
      shots: stats.home.shots,
      shotsOnTarget: stats.home.shotsOnTarget,
      goals: stats.home.goals,
    },
    away: {
      opportunities: stats.away.opportunities,
      shots: stats.away.shots,
      shotsOnTarget: stats.away.shotsOnTarget,
      goals: stats.away.goals,
    },
  };
}
