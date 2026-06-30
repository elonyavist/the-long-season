import {
  DEFAULT_REGULATION_SUBSTITUTION_LIMIT,
  type AppliedMatchSubstitution,
  type HalfTimeTacticalDecisionPlan,
  type HalfTimeTacticalDecisionValidationFact,
  type MatchSubstitutionDecision,
  type PlayerId,
  validateHalfTimeTacticalDecisionPlan,
} from "@game/domain";

import type { MatchSide, MatchSimulationState } from "./match-simulation-state.ts";
import type { StagedMatchState } from "./staged-match-progression.ts";
import type { LineupSlot } from "./team-strength.ts";

/** Validation failures for half-time substitution application. */
export type HalfTimeSubstitutionInvalidReason =
  | "not_half_time"
  | "too_many_substitutions"
  | "missing_decision"
  | "duplicate_outgoing_player"
  | "duplicate_incoming_player"
  | "outgoing_not_on_pitch"
  | "incoming_not_on_bench"
  | "incoming_already_on_pitch"
  | "duplicate_player_after_substitution"
  | "invalid_half_time_tactical_plan";

/** Input for applying selected-club half-time substitutions. */
export interface ApplyHalfTimeSubstitutionsInput {
  /** Staged match state currently stopped at half-time. */
  readonly state: StagedMatchState;
  /** Side controlled by the selected-club manager for this fixture. */
  readonly selectedSide: MatchSide;
  /** Bench player IDs available to the selected-club manager. */
  readonly benchPlayerIds: readonly PlayerId[];
  /** Explicit manager-declared substitutions. Empty means no changes. */
  readonly decisions: readonly MatchSubstitutionDecision[];
  /** Optional full tactical board plan declared by the manager for the second half. */
  readonly tacticalPlan?: HalfTimeTacticalDecisionPlan;
  /** Optional v1 limit override; future competition rules should own this. */
  readonly maxSubstitutions?: number;
}

/** Successful substitution application. */
export interface HalfTimeSubstitutionsApplied {
  /** Discriminator for successful application. */
  readonly status: "applied";
  /** Updated staged state for second-half continuation. */
  readonly state: StagedMatchState;
  /** Structured substitution facts accepted by validation. */
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  /** Tactical plan consumed for the second-half lineup, when supplied. */
  readonly tacticalPlan?: HalfTimeTacticalDecisionPlan;
}

/** Invalid substitution application. */
export interface HalfTimeSubstitutionsInvalid {
  /** Discriminator for validation failures. */
  readonly status: "invalid";
  /** Stable invalid-state reason. */
  readonly reason: HalfTimeSubstitutionInvalidReason;
  /** Original staged state, unchanged. */
  readonly state: StagedMatchState;
  /** Decision index that failed validation, when applicable. */
  readonly decisionIndex?: number;
  /** Structured tactical-plan validation facts, when the plan is invalid. */
  readonly tacticalPlanFacts?: readonly HalfTimeTacticalDecisionValidationFact[];
}

/** Result of trying to apply half-time substitutions. */
export type ApplyHalfTimeSubstitutionsResult = HalfTimeSubstitutionsApplied | HalfTimeSubstitutionsInvalid;

/**
 * Applies explicit selected-club half-time substitutions to the staged context.
 *
 * This v1 changes player IDs inside existing tactical slots and preserves the
 * current team-strength numbers. Future competition and squad-context work can
 * rebuild strength after substitutions, but this step keeps attribution and
 * second-half lineups correct without hidden manager choices.
 */
export function applyHalfTimeSubstitutions(input: ApplyHalfTimeSubstitutionsInput): ApplyHalfTimeSubstitutionsResult {
  if (input.state.phase !== "half_time") {
    return invalid(input, "not_half_time");
  }

  if (input.tacticalPlan !== undefined) {
    const tacticalPlanValidation = validateHalfTimeTacticalDecisionPlan(input.tacticalPlan);

    if (tacticalPlanValidation.status === "invalid") {
      return invalid(input, "invalid_half_time_tactical_plan", undefined, tacticalPlanValidation.facts);
    }
  }

  const declaredDecisions = input.tacticalPlan?.substitutions ?? input.decisions;
  const maxSubstitutions = input.tacticalPlan?.maxSubstitutions
    ?? input.maxSubstitutions
    ?? DEFAULT_REGULATION_SUBSTITUTION_LIMIT;

  if (declaredDecisions.length > maxSubstitutions) {
    return invalid(input, "too_many_substitutions");
  }

  if (declaredDecisions.length === 0 && input.tacticalPlan === undefined) {
    return {
      status: "applied",
      state: input.state,
      appliedSubstitutions: [],
    };
  }

  const selectedTeam = teamBySide(input.state.simulation, input.selectedSide);
  const updatedLineup: LineupSlot[] = [...selectedTeam.lineup];
  const benchIds = new Set(input.benchPlayerIds);
  const usedOutgoing = new Set<PlayerId>();
  const usedIncoming = new Set<PlayerId>();
  const applied: AppliedMatchSubstitution[] = [];

  for (let decisionIndex = 0; decisionIndex < declaredDecisions.length; decisionIndex += 1) {
    const decision = declaredDecisions[decisionIndex];

    if (decision === undefined) {
      return invalid(input, "missing_decision", decisionIndex);
    }

    if (usedOutgoing.has(decision.outgoingPlayerId)) {
      return invalid(input, "duplicate_outgoing_player", decisionIndex);
    }

    if (usedIncoming.has(decision.incomingPlayerId)) {
      return invalid(input, "duplicate_incoming_player", decisionIndex);
    }

    const outgoingIndex = updatedLineup.findIndex((slot) => slot.playerId === decision.outgoingPlayerId);

    if (outgoingIndex < 0) {
      return invalid(input, "outgoing_not_on_pitch", decisionIndex);
    }

    if (!benchIds.has(decision.incomingPlayerId)) {
      return invalid(input, "incoming_not_on_bench", decisionIndex);
    }

    if (isPlayerOnEitherPitch(input.state.simulation, decision.incomingPlayerId)) {
      return invalid(input, "incoming_already_on_pitch", decisionIndex);
    }

    const outgoingSlot = updatedLineup[outgoingIndex];

    if (outgoingSlot === undefined) {
      return invalid(input, "outgoing_not_on_pitch", decisionIndex);
    }

    updatedLineup[outgoingIndex] = {
      ...outgoingSlot,
      playerId: decision.incomingPlayerId,
    };
    usedOutgoing.add(decision.outgoingPlayerId);
    usedIncoming.add(decision.incomingPlayerId);
    applied.push({
      side: input.selectedSide,
      minute: input.state.simulation.minute,
      outgoingPlayerId: decision.outgoingPlayerId,
      incomingPlayerId: decision.incomingPlayerId,
      slotId: outgoingSlot.slotId,
      reasonKey: decision.reasonKey,
    });
  }

  const nextLineup = input.tacticalPlan === undefined ? updatedLineup : lineupFromTacticalPlan(input.tacticalPlan);

  if (hasDuplicatePlayers(nextLineup)) {
    return invalid(input, "duplicate_player_after_substitution");
  }

  const nextSimulation = withSelectedLineup(input.state.simulation, input.selectedSide, nextLineup);
  const nextState: StagedMatchState = {
    ...input.state,
    simulation: nextSimulation,
    appliedSubstitutions: [...input.state.appliedSubstitutions, ...applied],
    ...(input.tacticalPlan === undefined ? {} : { halfTimeTacticalPlan: input.tacticalPlan }),
  };

  return {
    status: "applied",
    state: nextState,
    appliedSubstitutions: applied,
    ...(input.tacticalPlan === undefined ? {} : { tacticalPlan: input.tacticalPlan }),
  };
}

function invalid(
  input: ApplyHalfTimeSubstitutionsInput,
  reason: HalfTimeSubstitutionInvalidReason,
  decisionIndex?: number,
  tacticalPlanFacts?: readonly HalfTimeTacticalDecisionValidationFact[],
): HalfTimeSubstitutionsInvalid {
  return {
    status: "invalid",
    reason,
    state: input.state,
    ...(decisionIndex === undefined ? {} : { decisionIndex }),
    ...(tacticalPlanFacts === undefined ? {} : { tacticalPlanFacts }),
  };
}

function lineupFromTacticalPlan(plan: HalfTimeTacticalDecisionPlan): LineupSlot[] {
  return plan.lineupSlots.map((slot) => {
    if (slot.playerId === null) {
      throw new Error(`Cannot build second-half lineup from empty slot ${slot.slotId}`);
    }

    return {
      slotId: slot.slotId,
      playerId: slot.playerId,
      roleKey: slot.roleKey,
    };
  });
}

function teamBySide(simulation: MatchSimulationState, side: MatchSide): MatchSimulationState["context"]["home"] {
  return side === "home" ? simulation.context.home : simulation.context.away;
}

function withSelectedLineup(
  simulation: MatchSimulationState,
  side: MatchSide,
  lineup: readonly LineupSlot[],
): MatchSimulationState {
  const updatedTeam = {
    ...teamBySide(simulation, side),
    lineup,
  };

  return {
    ...simulation,
    context: side === "home"
      ? { ...simulation.context, home: updatedTeam }
      : { ...simulation.context, away: updatedTeam },
  };
}

function isPlayerOnEitherPitch(simulation: MatchSimulationState, playerId: PlayerId): boolean {
  return [...simulation.context.home.lineup, ...simulation.context.away.lineup].some((slot) => slot.playerId === playerId);
}

function hasDuplicatePlayers(lineup: readonly LineupSlot[]): boolean {
  const seen = new Set<PlayerId>();

  for (const slot of lineup) {
    if (seen.has(slot.playerId)) {
      return true;
    }

    seen.add(slot.playerId);
  }

  return false;
}
