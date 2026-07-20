import type { CompetitionMatchRules } from "../entities/competition.entity.ts";
import type { MatchEventSide } from "../entities/match-event.entity.ts";
import type { PlayerId } from "../types/ids.ts";
import { createLiveMatchTeamState, LiveMatchSessionError, type LiveMatchSession, type LiveMatchTeamState } from "./live-match-session.ts";
import type { MatchSubstitutionDecision } from "./substitution.ts";

/** Manager command that stops presentation after the current minute. */
export interface PauseLiveMatchCommand {
  readonly type: "pause";
}

/** Manager command that resumes the minute loop after all decisions are valid. */
export interface ResumeLiveMatchCommand {
  readonly type: "resume";
}

/**
 * Atomic tactical command for one controlled side.
 *
 * `nextTeam` is the complete intended result, so slot moves and role changes
 * are explicit and can be validated together with substitutions and tactics.
 */
export interface ApplyLiveMatchTeamChangesCommand {
  readonly type: "apply_team_changes";
  readonly side: MatchEventSide;
  readonly substitutions: readonly MatchSubstitutionDecision[];
  readonly nextTeam: LiveMatchTeamState;
}

/** Every manager command supported by the current regulation live match. */
export type LiveMatchCommand = PauseLiveMatchCommand | ResumeLiveMatchCommand | ApplyLiveMatchTeamChangesCommand;

/** Stable reasons why a live command cannot be accepted. */
export type LiveMatchCommandRejectionCode =
  | "phase_not_commandable"
  | "match_already_paused"
  | "match_not_paused"
  | "pending_decision_unresolved"
  | "wrong_controlled_side"
  | "invalid_team_state"
  | "duplicate_player"
  | "player_unavailable"
  | "player_cannot_reenter"
  | "goalkeeper_role_or_area_change"
  | "dismissed_player"
  | "injured_player"
  | "maximum_substitutions_reached"
  | "substitution_mismatch";

/** Structured rejection fact; presentation supplies any explanatory text. */
export interface LiveMatchCommandRejection {
  readonly code: LiveMatchCommandRejectionCode;
  readonly playerId?: PlayerId;
  readonly slotId?: string;
}

/** Result of validating one manager command without applying it. */
export type LiveMatchCommandValidation =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly rejections: readonly LiveMatchCommandRejection[] };

/**
 * Validates one live command against the current snapshot and competition.
 *
 * This function is pure and never advances a minute. The engine will apply an
 * accepted command atomically in Step 02.
 */
export function validateLiveMatchCommand(
  session: LiveMatchSession,
  command: LiveMatchCommand,
  rules: CompetitionMatchRules,
): LiveMatchCommandValidation {
  if (command.type === "pause") {
    if (session.phase !== "first_half" && session.phase !== "second_half") {
      return rejected("phase_not_commandable");
    }
    return session.runState === "paused" ? rejected("match_already_paused") : { accepted: true };
  }

  if (command.type === "resume") {
    if (session.phase !== "first_half" && session.phase !== "second_half") {
      return rejected("phase_not_commandable");
    }
    if (session.runState !== "paused") return rejected("match_not_paused");
    return session.pendingDecision === undefined ? { accepted: true } : rejected("pending_decision_unresolved");
  }

  return validateTeamChanges(session, command, rules);
}

function validateTeamChanges(
  session: LiveMatchSession,
  command: ApplyLiveMatchTeamChangesCommand,
  rules: CompetitionMatchRules,
): LiveMatchCommandValidation {
  const rejections: LiveMatchCommandRejection[] = [];
  if (session.phase !== "first_half" && session.phase !== "half_time" && session.phase !== "second_half") {
    rejections.push({ code: "phase_not_commandable" });
  }
  if (session.runState !== "paused") rejections.push({ code: "match_not_paused" });
  if (command.side !== session.controlledSide || command.nextTeam.side !== command.side) {
    rejections.push({ code: "wrong_controlled_side" });
  }

  const currentTeam = command.side === "home" ? session.home : session.away;
  let nextTeam: LiveMatchTeamState | undefined;
  try {
    nextTeam = createLiveMatchTeamState(command.nextTeam, rules);
  } catch (error) {
    if (error instanceof LiveMatchSessionError && error.code === "duplicate_player") {
      rejections.push({ code: "duplicate_player" });
    } else {
      rejections.push({ code: "invalid_team_state" });
    }
  }

  if (currentTeam.substitutionsUsed + command.substitutions.length > rules.maximumSubstitutions) {
    rejections.push({ code: "maximum_substitutions_reached" });
  }

  if (nextTeam !== undefined) {
    validateGoalkeeper(currentTeam, nextTeam, rejections);
    validateSubstitutions(session, currentTeam, nextTeam, command.substitutions, rules, rejections);
  }

  return rejections.length === 0 ? { accepted: true } : { accepted: false, rejections: uniqueRejections(rejections) };
}

function validateGoalkeeper(
  currentTeam: LiveMatchTeamState,
  nextTeam: LiveMatchTeamState,
  rejections: LiveMatchCommandRejection[],
): void {
  const currentGoalkeeper = currentTeam.lineup.find((slot) => slot.role === "goalkeeper");
  const nextGoalkeeper = nextTeam.lineup.find((slot) => slot.role === "goalkeeper");

  if (
    currentGoalkeeper === undefined
    || nextGoalkeeper === undefined
    || currentGoalkeeper.slotId !== nextGoalkeeper.slotId
    || currentGoalkeeper.nx !== nextGoalkeeper.nx
    || currentGoalkeeper.ny !== nextGoalkeeper.ny
  ) {
    rejections.push({
      code: "goalkeeper_role_or_area_change",
      ...(currentGoalkeeper === undefined ? {} : { slotId: currentGoalkeeper.slotId }),
    });
  }
}

function validateSubstitutions(
  session: LiveMatchSession,
  currentTeam: LiveMatchTeamState,
  nextTeam: LiveMatchTeamState,
  substitutions: readonly MatchSubstitutionDecision[],
  rules: CompetitionMatchRules,
  rejections: LiveMatchCommandRejection[],
): void {
  const currentLineup = playerSet(currentTeam.lineup);
  const nextLineup = playerSet(nextTeam.lineup);
  const nextBench = new Map(nextTeam.bench.map((player) => [player.playerId, player]));
  const currentBench = new Map(currentTeam.bench.map((player) => [player.playerId, player]));
  const unavailable = new Map(currentTeam.unavailable.map((player) => [player.playerId, player.reason]));
  const seenOutgoing = new Set<PlayerId>();
  const seenIncoming = new Set<PlayerId>();
  const pendingIncident = session.pendingDecision?.side === currentTeam.side
    && (session.pendingDecision.type === "forced_injury" || session.pendingDecision.type === "red_card_reorganization")
    ? session.pendingDecision
    : undefined;

  for (const substitution of substitutions) {
    if (seenOutgoing.has(substitution.outgoingPlayerId) || seenIncoming.has(substitution.incomingPlayerId)) {
      rejections.push({ code: "duplicate_player" });
    }
    seenOutgoing.add(substitution.outgoingPlayerId);
    seenIncoming.add(substitution.incomingPlayerId);

    if (!currentLineup.has(substitution.outgoingPlayerId)) {
      rejections.push({ code: "player_unavailable", playerId: substitution.outgoingPlayerId });
    }

    const incomingBench = currentBench.get(substitution.incomingPlayerId);
    if (incomingBench === undefined) {
      const reason = unavailable.get(substitution.incomingPlayerId);
      rejections.push({
        code: reason === "dismissed" ? "dismissed_player" : reason === "injured" ? "injured_player" : "player_unavailable",
        playerId: substitution.incomingPlayerId,
      });
    } else if (incomingBench.status === "substituted_out" && !rules.allowsPlayerReentry) {
      rejections.push({ code: "player_cannot_reenter", playerId: substitution.incomingPlayerId });
    }

    if (!nextLineup.has(substitution.incomingPlayerId) || nextLineup.has(substitution.outgoingPlayerId)) {
      rejections.push({ code: "substitution_mismatch", playerId: substitution.incomingPlayerId });
    }

    const forcedInjuryPlayer =
      session.pendingDecision?.type === "forced_injury" ? session.pendingDecision.playerId : undefined;
    const outgoingUnavailable = nextTeam.unavailable.find((player) => player.playerId === substitution.outgoingPlayerId);
    const outgoingBench = nextBench.get(substitution.outgoingPlayerId);
    const outgoingRecorded = forcedInjuryPlayer === substitution.outgoingPlayerId
      ? outgoingUnavailable?.reason === "injured"
      : outgoingBench?.status === "substituted_out";
    if (!outgoingRecorded) {
      rejections.push({ code: "substitution_mismatch", playerId: substitution.outgoingPlayerId });
    }
  }

  const removed = [...currentLineup].filter((playerId) => !nextLineup.has(playerId));
  const added = [...nextLineup].filter((playerId) => !currentLineup.has(playerId));
  const incidentPlayerRemoved = pendingIncident !== undefined && removed.includes(pendingIncident.playerId);
  const incidentPlayerSubstituted = pendingIncident !== undefined
    && substitutions.some((substitution) => substitution.outgoingPlayerId === pendingIncident.playerId);
  const allowedRemovalWithoutReplacement = incidentPlayerRemoved && !incidentPlayerSubstituted ? 1 : 0;

  if (pendingIncident !== undefined) {
    const expectedReason = pendingIncident.type === "forced_injury" ? "injured" : "dismissed";
    const recordedUnavailable = nextTeam.unavailable.some(
      (player) => player.playerId === pendingIncident.playerId && player.reason === expectedReason,
    );
    if (!incidentPlayerRemoved || !recordedUnavailable) {
      rejections.push({
        code: expectedReason === "injured" ? "injured_player" : "dismissed_player",
        playerId: pendingIncident.playerId,
      });
    }
    if (pendingIncident.type === "red_card_reorganization" && incidentPlayerSubstituted) {
      rejections.push({ code: "dismissed_player", playerId: pendingIncident.playerId });
    }
  }

  if (
    removed.length !== substitutions.length + allowedRemovalWithoutReplacement
    || added.length !== substitutions.length
    || nextTeam.substitutionsUsed !== currentTeam.substitutionsUsed + substitutions.length
  ) {
    rejections.push({ code: "substitution_mismatch" });
  }

  for (const player of nextTeam.unavailable) {
    if (player.reason === "dismissed" && nextLineup.has(player.playerId)) {
      rejections.push({ code: "dismissed_player", playerId: player.playerId });
    }
    if (player.reason === "injured" && nextLineup.has(player.playerId)) {
      rejections.push({ code: "injured_player", playerId: player.playerId });
    }
  }
}

function playerSet(slots: LiveMatchTeamState["lineup"]): ReadonlySet<PlayerId> {
  return new Set(slots.map((slot) => slot.playerId));
}

function rejected(code: LiveMatchCommandRejectionCode): LiveMatchCommandValidation {
  return { accepted: false, rejections: [{ code }] };
}

function uniqueRejections(rejections: readonly LiveMatchCommandRejection[]): readonly LiveMatchCommandRejection[] {
  const seen = new Set<string>();
  return rejections.filter((rejection) => {
    const key = `${rejection.code}:${rejection.playerId ?? ""}:${rejection.slotId ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
