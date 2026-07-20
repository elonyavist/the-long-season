import type { LiveMatchEvent, MatchEventSide, MatchInjurySeverity } from "../entities/match-event.entity.ts";
import type { MatchScore } from "../entities/match.entity.ts";
import { createTacticSetup, type TacticSetup } from "../entities/tactic.entity.ts";
import type { FixtureId, PlayerId } from "../types/ids.ts";
import {
  isCanonicalPlayerRole,
  isFormationKey,
  type CanonicalPlayerRole,
  type FormationKey,
} from "../tactics/index.ts";
import type { CompetitionMatchRules } from "../entities/competition.entity.ts";
import { createLiveMatchStatistics, type LiveMatchStatistics } from "./live-match-statistics.ts";
import type { LiveMatchPhase } from "./match-phase.ts";
import type { AppliedMatchSubstitution } from "./substitution.ts";

/** Whether the minute loop is currently advancing or waiting for a decision. */
export type LiveMatchRunState = "running" | "paused";

/** Explicit reason why a live session is waiting. Manual pauses have no limit. */
export type LiveMatchPauseReason =
  | "pre_match"
  | "manual"
  | "half_time"
  | "forced_injury"
  | "selected_club_red_card"
  | "full_time";

/** Availability of a player still displayed in one bench slot. */
export type LiveMatchBenchStatus = "available" | "substituted_out";

/** Why a player is no longer selectable from either XI or bench. */
export type LiveMatchUnavailableReason = "dismissed" | "injured";

/** One normalized tactical-board slot in the current XI. */
export interface LiveMatchLineupSlot {
  readonly slotId: string;
  readonly playerId: PlayerId;
  readonly role: CanonicalPlayerRole;
  readonly nx: number;
  readonly ny: number;
}

/** One fixed bench slot and its current match availability. */
export interface LiveMatchBenchPlayer {
  readonly slotId: string;
  readonly playerId: PlayerId;
  readonly status: LiveMatchBenchStatus;
}

/** Player removed from all selectable tactical surfaces for this match. */
export interface LiveMatchUnavailablePlayer {
  readonly playerId: PlayerId;
  readonly reason: LiveMatchUnavailableReason;
}

/** Complete current tactical facts for one match side. */
export interface LiveMatchTeamState {
  readonly side: MatchEventSide;
  readonly formation: FormationKey;
  readonly lineup: readonly LiveMatchLineupSlot[];
  readonly bench: readonly LiveMatchBenchPlayer[];
  readonly unavailable: readonly LiveMatchUnavailablePlayer[];
  readonly substitutionsUsed: number;
  readonly tactic: TacticSetup;
}

interface LiveMatchPendingDecisionBase {
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly playerId?: PlayerId;
}

/** Required manager decision attached to an automatic pause. */
export type LiveMatchPendingDecision =
  | (LiveMatchPendingDecisionBase & { readonly type: "half_time" })
  | (LiveMatchPendingDecisionBase & {
      readonly type: "forced_injury";
      readonly playerId: PlayerId;
      readonly severity: MatchInjurySeverity;
    })
  | (LiveMatchPendingDecisionBase & {
      readonly type: "red_card_reorganization";
      readonly playerId: PlayerId;
    });

/** Serializable memory-only snapshot for one progressive regulation match. */
export interface LiveMatchSession {
  readonly fixtureId: FixtureId;
  readonly controlledSide: MatchEventSide;
  readonly phase: LiveMatchPhase;
  readonly currentMinute: number;
  readonly runState: LiveMatchRunState;
  readonly pauseReason?: LiveMatchPauseReason;
  readonly score: MatchScore;
  readonly statistics: LiveMatchStatistics;
  readonly home: LiveMatchTeamState;
  readonly away: LiveMatchTeamState;
  readonly events: readonly LiveMatchEvent[];
  readonly substitutions: readonly AppliedMatchSubstitution[];
  readonly pendingDecision?: LiveMatchPendingDecision;
}

/** Stable validation failures for live session facts. */
export type LiveMatchSessionErrorCode =
  | "invalid_minute"
  | "invalid_run_state"
  | "invalid_pause_reason"
  | "invalid_pending_decision"
  | "invalid_side"
  | "invalid_formation"
  | "invalid_role"
  | "invalid_lineup_size"
  | "invalid_slot"
  | "invalid_coordinate"
  | "duplicate_slot"
  | "duplicate_player"
  | "invalid_goalkeeper"
  | "invalid_bench_status"
  | "invalid_unavailable_player"
  | "invalid_substitution_count"
  | "score_statistics_mismatch";

/** Typed domain error for impossible live session snapshots. */
export class LiveMatchSessionError extends Error {
  public readonly code: LiveMatchSessionErrorCode;

  public constructor(code: LiveMatchSessionErrorCode, message: string) {
    super(message);
    this.name = "LiveMatchSessionError";
    this.code = code;
  }
}

/** Validates and copies one team snapshot for use by session and commands. */
export function createLiveMatchTeamState(
  input: LiveMatchTeamState,
  rules: CompetitionMatchRules,
): LiveMatchTeamState {
  if (!isFormationKey(input.formation)) {
    throw new LiveMatchSessionError("invalid_formation", `Unsupported live formation: ${input.formation}`);
  }

  if (!Number.isSafeInteger(input.substitutionsUsed) || input.substitutionsUsed < 0 || input.substitutionsUsed > rules.maximumSubstitutions) {
    throw new LiveMatchSessionError(
      "invalid_substitution_count",
      `Substitutions used must be between 0 and ${rules.maximumSubstitutions}: ${input.substitutionsUsed}`,
    );
  }

  if (input.lineup.length < 7 || input.lineup.length > 11) {
    throw new LiveMatchSessionError("invalid_lineup_size", `Live lineup must contain 7 to 11 players: ${input.lineup.length}`);
  }

  const seenSlotIds = new Set<string>();
  const seenPlayerIds = new Set<PlayerId>();
  let goalkeeperCount = 0;
  const lineup = input.lineup.map((slot) => {
    assertNonEmptySlotId(slot.slotId);
    assertUniqueSlot(slot.slotId, seenSlotIds);
    assertUniquePlayer(slot.playerId, seenPlayerIds);
    if (!isCanonicalPlayerRole(slot.role)) {
      throw new LiveMatchSessionError("invalid_role", `Unsupported live role: ${String(slot.role)}`);
    }
    assertNormalizedCoordinate(slot.nx, slot.slotId, "nx");
    assertNormalizedCoordinate(slot.ny, slot.slotId, "ny");
    seenSlotIds.add(slot.slotId);
    seenPlayerIds.add(slot.playerId);
    if (slot.role === "goalkeeper") goalkeeperCount += 1;
    return { ...slot };
  });

  if (goalkeeperCount !== 1) {
    throw new LiveMatchSessionError("invalid_goalkeeper", `Live lineup must contain exactly one goalkeeper: ${goalkeeperCount}`);
  }

  const bench = input.bench.map((slot) => {
    assertNonEmptySlotId(slot.slotId);
    assertUniqueSlot(slot.slotId, seenSlotIds);
    assertUniquePlayer(slot.playerId, seenPlayerIds);
    if (slot.status !== "available" && slot.status !== "substituted_out") {
      throw new LiveMatchSessionError("invalid_bench_status", `Unsupported bench status: ${String(slot.status)}`);
    }
    seenSlotIds.add(slot.slotId);
    seenPlayerIds.add(slot.playerId);
    return { ...slot };
  });

  const unavailable = input.unavailable.map((player) => {
    assertUniquePlayer(player.playerId, seenPlayerIds);
    if (player.reason !== "dismissed" && player.reason !== "injured") {
      throw new LiveMatchSessionError("invalid_unavailable_player", `Unsupported unavailable reason: ${String(player.reason)}`);
    }
    seenPlayerIds.add(player.playerId);
    return { ...player };
  });

  return {
    side: input.side,
    formation: input.formation,
    lineup,
    bench,
    unavailable,
    substitutionsUsed: input.substitutionsUsed,
    tactic: createTacticSetup(input.tactic),
  };
}

/** Validates and copies a complete live match snapshot. */
export function createLiveMatchSession(input: LiveMatchSession, rules: CompetitionMatchRules): LiveMatchSession {
  assertMinuteForPhase(input.phase, input.currentMinute);
  assertRunState(input);

  const home = createLiveMatchTeamState(input.home, rules);
  const away = createLiveMatchTeamState(input.away, rules);
  if (home.side !== "home" || away.side !== "away") {
    throw new LiveMatchSessionError("invalid_side", "Home and away team snapshots must match their session sides");
  }

  const statistics = createLiveMatchStatistics(input.statistics);
  if (statistics.home.goals !== input.score.home || statistics.away.goals !== input.score.away) {
    throw new LiveMatchSessionError(
      "score_statistics_mismatch",
      "Live score must equal the cumulative home and away goal statistics",
    );
  }

  const optionalPause = input.pauseReason === undefined ? {} : { pauseReason: input.pauseReason };
  const optionalDecision = input.pendingDecision === undefined ? {} : { pendingDecision: { ...input.pendingDecision } };

  return {
    fixtureId: input.fixtureId,
    controlledSide: input.controlledSide,
    phase: input.phase,
    currentMinute: input.currentMinute,
    runState: input.runState,
    ...optionalPause,
    score: { ...input.score },
    statistics,
    home,
    away,
    events: [...input.events],
    substitutions: input.substitutions.map((substitution) => ({ ...substitution })),
    ...optionalDecision,
  };
}

function assertMinuteForPhase(phase: LiveMatchPhase, minute: number): void {
  const valid = Number.isSafeInteger(minute) && minute >= 0 && minute <= 90;
  const validForPhase =
    (phase === "pre_match" && minute === 0)
    || (phase === "first_half" && minute >= 0 && minute <= 45)
    || (phase === "half_time" && minute === 45)
    || (phase === "second_half" && minute >= 45 && minute <= 90)
    || (phase === "full_time" && minute === 90);

  if (!valid || !validForPhase) {
    throw new LiveMatchSessionError("invalid_minute", `Minute ${minute} is invalid for phase ${phase}`);
  }
}

function assertRunState(input: LiveMatchSession): void {
  const isPlayablePhase = input.phase === "first_half" || input.phase === "second_half";

  if (input.runState === "running") {
    if (!isPlayablePhase || input.pauseReason !== undefined || input.pendingDecision !== undefined) {
      throw new LiveMatchSessionError("invalid_run_state", "Only a playable phase without a pending decision may run");
    }
    return;
  }

  if (input.pauseReason === undefined) {
    throw new LiveMatchSessionError("invalid_pause_reason", "A paused live match must state why it paused");
  }

  if (input.pendingDecision !== undefined) {
    if (input.pendingDecision.minute !== input.currentMinute) {
      throw new LiveMatchSessionError("invalid_pending_decision", "Pending decision minute must match session minute");
    }
    const expectedPauseReason: LiveMatchPauseReason =
      input.pendingDecision.type === "half_time"
        ? "half_time"
        : input.pendingDecision.type === "forced_injury"
          ? "forced_injury"
          : "selected_club_red_card";
    if (input.pauseReason !== expectedPauseReason) {
      throw new LiveMatchSessionError(
        "invalid_pending_decision",
        `${input.pendingDecision.type} decision requires the ${expectedPauseReason} pause reason`,
      );
    }
  } else if (
    input.pauseReason === "half_time"
    || input.pauseReason === "forced_injury"
    || input.pauseReason === "selected_club_red_card"
  ) {
    throw new LiveMatchSessionError(
      "invalid_pending_decision",
      `${input.pauseReason} pause requires a pending decision`,
    );
  }
}

function assertNonEmptySlotId(slotId: string): void {
  if (slotId.length === 0) throw new LiveMatchSessionError("invalid_slot", "Live tactical slot ID must not be empty");
}

function assertUniqueSlot(slotId: string, seen: ReadonlySet<string>): void {
  if (seen.has(slotId)) throw new LiveMatchSessionError("duplicate_slot", `Live tactical slot is duplicated: ${slotId}`);
}

function assertUniquePlayer(playerId: PlayerId, seen: ReadonlySet<PlayerId>): void {
  if (seen.has(playerId)) throw new LiveMatchSessionError("duplicate_player", `Live match player is duplicated: ${playerId}`);
}

function assertNormalizedCoordinate(value: number, slotId: string, axis: "nx" | "ny"): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new LiveMatchSessionError("invalid_coordinate", `${slotId} ${axis} must be between 0 and 1: ${value}`);
  }
}
