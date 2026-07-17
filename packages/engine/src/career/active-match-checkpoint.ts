import {
  ACTIVE_MATCH_CHECKPOINT_SCHEMA_VERSION,
  createActiveMatchCheckpoint,
  type ActiveMatchCheckpoint,
  type HalfTimeTacticalBenchSlot,
  type MatchEvent,
  type MatchEventSide,
} from "@game/domain";

import { assertValidMatchContext, type MatchContext, type MatchTeamContext } from "../match-engine/match-context.ts";
import type { MatchSimulationState } from "../match-engine/match-simulation-state.ts";
import {
  progressStagedMatchToFullTime,
  type StagedMatchProgressionOptions,
  type StagedMatchProgressionResult,
  type StagedMatchState,
} from "../match-engine/staged-match-progression.ts";
import type { MatchStepEvent } from "../match-engine/step-match.ts";

/** Input used to capture a resumable staged match as domain data. */
export interface CreateStagedMatchCheckpointInput {
  readonly state: StagedMatchState;
  readonly selectedClubSide: MatchEventSide;
  readonly selectedClubBenchSlots: readonly HalfTimeTacticalBenchSlot[];
}

/**
 * Captures an unfinished staged match as a validated domain checkpoint.
 *
 * The mutable RNG stream is deliberately absent. Staged progression rebuilds
 * it from the frozen seed, fixture ID, and completed minute after restore.
 */
export function createStagedMatchCheckpoint(input: CreateStagedMatchCheckpointInput): ActiveMatchCheckpoint {
  const { state } = input;

  return createActiveMatchCheckpoint({
    schemaVersion: ACTIVE_MATCH_CHECKPOINT_SCHEMA_VERSION,
    fixtureId: state.initialContext.fixtureId,
    selectedClubSide: input.selectedClubSide,
    phase: state.phase as ActiveMatchCheckpoint["phase"],
    initialContext: copyMatchContext(state.initialContext),
    simulation: {
      minute: state.simulation.minute,
      score: { ...state.simulation.score },
      stats: copyStats(state.simulation.stats),
      local: { ...state.simulation.local, hasReachedFullTime: false },
    },
    events: state.events.map(toDomainEvent),
    selectedClubBenchSlots: input.selectedClubBenchSlots.map((slot) => ({ ...slot })),
    appliedSubstitutions: state.appliedSubstitutions.map((substitution) => ({ ...substitution })),
    ...(state.halfTimeTacticalPlan === undefined
      ? {}
      : { halfTimeTacticalPlan: structuredClone(state.halfTimeTacticalPlan) }),
  });
}

/** Restores engine-local staged state from a validated durable checkpoint. */
export function restoreStagedMatchCheckpoint(input: ActiveMatchCheckpoint): StagedMatchState {
  const checkpoint = createActiveMatchCheckpoint(input);
  const initialContext = restoreMatchContext(checkpoint.initialContext);
  assertValidMatchContext(initialContext);

  const simulation: MatchSimulationState = {
    context: initialContext,
    minute: checkpoint.simulation.minute,
    score: { ...checkpoint.simulation.score },
    stats: copyStats(checkpoint.simulation.stats),
    local: { ...checkpoint.simulation.local },
  };

  return {
    initialContext,
    simulation,
    events: checkpoint.events.map(toEngineEvent),
    phase: checkpoint.phase,
    appliedSubstitutions: checkpoint.appliedSubstitutions.map((substitution) => ({ ...substitution })),
    ...(checkpoint.halfTimeTacticalPlan === undefined
      ? {}
      : { halfTimeTacticalPlan: structuredClone(checkpoint.halfTimeTacticalPlan) }),
  };
}

/** Restores and deterministically completes one durable active match. */
export function completeStagedMatchCheckpoint(
  checkpoint: ActiveMatchCheckpoint,
  options: StagedMatchProgressionOptions = {},
): StagedMatchProgressionResult {
  return progressStagedMatchToFullTime(restoreStagedMatchCheckpoint(checkpoint), options);
}

function copyMatchContext(context: MatchContext): ActiveMatchCheckpoint["initialContext"] {
  return structuredClone(context);
}

function restoreMatchContext(context: ActiveMatchCheckpoint["initialContext"]): MatchContext {
  return {
    fixtureId: context.fixtureId,
    seed: context.seed,
    home: restoreTeamContext(context.home),
    away: restoreTeamContext(context.away),
    engineConfig: structuredClone(context.engineConfig),
  };
}

function restoreTeamContext(team: ActiveMatchCheckpoint["initialContext"]["home"]): MatchTeamContext {
  return {
    clubId: team.clubId,
    lineup: team.lineup.map((slot) => ({ ...slot })),
    strength: { ...team.strength },
    tacticalDistribution: { ...team.tacticalDistribution },
  };
}

function copyStats<T extends ActiveMatchCheckpoint["simulation"]["stats"]>(stats: T): T {
  return structuredClone(stats);
}

function toDomainEvent(event: MatchStepEvent): MatchEvent {
  switch (event.type) {
    case "kickoff":
      return { type: "kickoff", minute: 0 };
    case "half_time":
      return { type: "half_time", minute: event.minute, score: { ...event.score } };
    case "full_time":
      return { type: "full_time", minute: event.minute, score: { ...event.score } };
    case "shot_outcome": {
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
        case "save":
          if (event.goalkeeperPlayerId === undefined) throw new Error("staged save event requires a goalkeeper");
          return { type: "save", shot, shooterPlayerId: event.shooterPlayerId, goalkeeperPlayerId: event.goalkeeperPlayerId };
        case "miss":
          return { type: "miss", shot, shooterPlayerId: event.shooterPlayerId };
        case "block":
          return {
            type: "block",
            shot,
            shooterPlayerId: event.shooterPlayerId,
            ...(event.primaryDefenderPlayerId === undefined ? {} : { primaryDefenderPlayerId: event.primaryDefenderPlayerId }),
          };
      }
    }
  }
}

function toEngineEvent(event: MatchEvent): MatchStepEvent {
  switch (event.type) {
    case "kickoff":
      return { type: "kickoff", minute: 0 };
    case "half_time":
      return { type: "half_time", minute: event.minute, score: { ...event.score } };
    case "full_time":
      return { type: "full_time", minute: event.minute, score: { ...event.score } };
    case "goal":
      return {
        type: "shot_outcome",
        ...event.shot,
        outcome: "goal",
        scorerPlayerId: event.scorerPlayerId,
        ...(event.assistPlayerId === undefined ? {} : { assistPlayerId: event.assistPlayerId }),
        ...(event.creatorPlayerId === undefined ? {} : { creatorPlayerId: event.creatorPlayerId }),
      };
    case "save":
      return {
        type: "shot_outcome",
        ...event.shot,
        outcome: "save",
        shooterPlayerId: requiredShooter(event),
        goalkeeperPlayerId: event.goalkeeperPlayerId,
      };
    case "miss":
      return { type: "shot_outcome", ...event.shot, outcome: "miss", shooterPlayerId: requiredShooter(event) };
    case "block":
      return {
        type: "shot_outcome",
        ...event.shot,
        outcome: "block",
        shooterPlayerId: requiredShooter(event),
        ...(event.primaryDefenderPlayerId === undefined ? {} : { primaryDefenderPlayerId: event.primaryDefenderPlayerId }),
      };
  }
}

function requiredShooter(event: Extract<MatchEvent, { readonly type: "save" | "miss" | "block" }>) {
  if (event.shooterPlayerId === undefined) {
    throw new Error(`active-match ${event.type} event requires shooterPlayerId for deterministic resume`);
  }

  return event.shooterPlayerId;
}
