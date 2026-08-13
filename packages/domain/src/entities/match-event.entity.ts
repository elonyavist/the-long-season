import type { MatchScore } from "./match.entity.ts";
import type { PlayerId } from "../types/ids.ts";
import type { MatchSubstitutionReasonKey } from "../match/substitution.ts";
import type { TacticalRoute } from "../balance/match-tactics-calibration.ts";

/**
 * Side marker used by persisted match events.
 */
export type MatchEventSide = "home" | "away";

/**
 * Structured shot execution type used by persisted shot events.
 */
export type ShotType = "normal" | "header" | "set_piece";

/**
 * Structured chance source used by persisted shot events.
 */
export type ShotChanceType = "open_play" | "counter" | "cross" | "dead_ball";

/** Exact restart that produced a dead-ball shot. */
export type ShotDeadBallKind = "penalty" | "direct_free_kick";

const SHOT_TYPES = ["normal", "header", "set_piece"] as const satisfies readonly ShotType[];

const SHOT_CHANCE_TYPES = [
  "open_play",
  "counter",
  "cross",
  "dead_ball",
] as const satisfies readonly ShotChanceType[];

/**
 * Reports whether an unknown value is a supported shot execution type.
 *
 * Persisted events come back as open strings. Asserting the union with a cast
 * would make a corrupt or foreign row simulate and display as a normal shot
 * instead of failing, which is the quiet kind of wrong this project spends its
 * time removing.
 *
 * @example
 * if (!isShotType(value)) throw new Error(`unsupported shot type: ${value}`);
 */
export function isShotType(value: unknown): value is ShotType {
  return typeof value === "string" && (SHOT_TYPES as readonly string[]).includes(value);
}

/** Reports whether an unknown value is a supported chance source. */
export function isShotChanceType(value: unknown): value is ShotChanceType {
  return typeof value === "string" && (SHOT_CHANCE_TYPES as readonly string[]).includes(value);
}

/** Injury severity emitted by the match and consumed by career consequences. */
export type MatchInjurySeverity = "knock" | "minor" | "moderate" | "serious";

/** Structured outcome of a taken penalty. */
export type PenaltyOutcome = "scored" | "saved" | "missed";

/**
 * Shared context carried by persisted shot-outcome events.
 *
 * The context contains only primitives and stable side markers. Future nominal
 * duel events can add player IDs without changing the current aggregate shape.
 */
export interface ShotContext {
  /** Simulated minute of the shot outcome. */
  readonly minute: number;
  /** Team side that produced the shot. */
  readonly side: MatchEventSide;
  /** Normalized opportunity quality in the `[0, 1]` range. */
  readonly quality: number;
  /** Canonical goal probability after shot, defence and goalkeeper context. */
  readonly expectedGoals: number;
  /** Whether the shot counted as on target. */
  readonly isShotOnTarget: boolean;
  /** Structured execution type for the shot. */
  readonly shotType: ShotType;
  /** Structured source type for the chance. */
  readonly chanceType: ShotChanceType;
  /** Present for new dead-ball shots; absent for worked chances. */
  readonly deadBallKind?: ShotDeadBallKind;
  /**
   * The way through the chance actually came down.
   *
   * `chanceType` is derived from this and stays because it is the vocabulary
   * statistics and narration already speak. The route is the finer fact and the
   * only one that answers *which* flank, which two crosses cannot be told apart
   * by: a manager who moved his width wants to see that his chances moved with
   * it. It is persisted rather than re-derived because the shape and tactics
   * that produced it are gone by the time anyone reads the report.
   *
   * Absent for a penalty or direct free kick, which is awarded rather than
   * worked: there is no way through a defence to fill in with `central`.
   */
  readonly route?: TacticalRoute;
}

/**
 * Kickoff marker event.
 */
export interface KickoffMatchEvent {
  /** Discriminant for kickoff. */
  readonly type: "kickoff";
  /** Kickoff marker minute. */
  readonly minute: 0;
}

/**
 * Goal outcome event.
 */
export interface GoalMatchEvent {
  /** Discriminant for a goal. */
  readonly type: "goal";
  /** Shared shot context. */
  readonly shot: ShotContext;
  /** Player credited with the goal. */
  readonly scorerPlayerId: PlayerId;
  /** Player credited with the assist, when the goal has one. */
  readonly assistPlayerId?: PlayerId;
  /** Chance creator when not already represented by the assist or scorer. */
  readonly creatorPlayerId?: PlayerId;
}

/**
 * Saved-shot outcome event.
 */
export interface SaveMatchEvent {
  /** Discriminant for a save. */
  readonly type: "save";
  /** Shared shot context. */
  readonly shot: ShotContext;
  /** Attacking player credited with taking the saved shot. */
  readonly shooterPlayerId?: PlayerId;
  /** Defending goalkeeper credited with the save. */
  readonly goalkeeperPlayerId: PlayerId;
}

/**
 * Missed-shot outcome event.
 */
export interface MissMatchEvent {
  /** Discriminant for a miss. */
  readonly type: "miss";
  /** Shared shot context. */
  readonly shot: ShotContext;
  /** Attacking player credited with taking the missed shot. */
  readonly shooterPlayerId?: PlayerId;
}

/**
 * Blocked-shot outcome event.
 */
export interface BlockMatchEvent {
  /** Discriminant for a block. */
  readonly type: "block";
  /** Shared shot context. */
  readonly shot: ShotContext;
  /** Attacking player credited with taking the blocked shot. */
  readonly shooterPlayerId?: PlayerId;
  /** Defending outfield player credited as the primary blocker. */
  readonly primaryDefenderPlayerId?: PlayerId;
}

/** Foul fact emitted when one player commits an infringement. */
export interface FoulMatchEvent {
  readonly type: "foul";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly committedByPlayerId: PlayerId;
  readonly sufferedByPlayerId?: PlayerId;
  /** Normalized danger of the location in the inclusive 0..1 range. */
  readonly zoneDanger: number;
}

/** Yellow-card disciplinary fact. */
export interface YellowCardMatchEvent {
  readonly type: "yellow_card";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly playerId: PlayerId;
}

/** Second-yellow dismissal fact; the first yellow remains a separate event. */
export interface SecondYellowCardMatchEvent {
  readonly type: "second_yellow_card";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly playerId: PlayerId;
}

/** Straight-red dismissal fact. */
export interface RedCardMatchEvent {
  readonly type: "red_card";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly playerId: PlayerId;
}

/** Penalty-award fact emitted before its eventual outcome. */
export interface PenaltyAwardedMatchEvent {
  readonly type: "penalty_awarded";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly fouledPlayerId?: PlayerId;
  readonly committedByPlayerId?: PlayerId;
}

/** Penalty result fact. A scored penalty also produces the ordinary goal fact. */
export interface PenaltyOutcomeMatchEvent {
  readonly type: "penalty_outcome";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly takerPlayerId: PlayerId;
  readonly goalkeeperPlayerId: PlayerId;
  readonly outcome: PenaltyOutcome;
}

/** Injury fact emitted during play without deciding the career recovery policy. */
export interface InjuryMatchEvent {
  readonly type: "injury";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly playerId: PlayerId;
  readonly severity: MatchInjurySeverity;
}

/** Accepted substitution fact emitted after an atomic team change. */
export interface SubstitutionMatchEvent {
  readonly type: "substitution";
  readonly minute: number;
  readonly side: MatchEventSide;
  readonly outgoingPlayerId: PlayerId;
  readonly incomingPlayerId: PlayerId;
  readonly slotId: string;
  readonly reasonKey: MatchSubstitutionReasonKey;
}

/**
 * Half-time marker event.
 */
export interface HalfTimeMatchEvent {
  /** Discriminant for half time. */
  readonly type: "half_time";
  /** Simulated minute of the half-time marker. */
  readonly minute: number;
  /** Score at half time. */
  readonly score: MatchScore;
}

/**
 * Full-time marker event.
 */
export interface FullTimeMatchEvent {
  /** Discriminant for full time. */
  readonly type: "full_time";
  /** Simulated final minute. */
  readonly minute: number;
  /** Score at full time. */
  readonly score: MatchScore;
}

/**
 * Durable language-agnostic match event contract.
 *
 * Events are sparse and contain data only. Narration layers may render them as
 * text later, but the engine and domain never store prose.
 */
export type MatchEvent =
  | KickoffMatchEvent
  | GoalMatchEvent
  | SaveMatchEvent
  | MissMatchEvent
  | BlockMatchEvent
  | FoulMatchEvent
  | YellowCardMatchEvent
  | SecondYellowCardMatchEvent
  | RedCardMatchEvent
  | PenaltyAwardedMatchEvent
  | PenaltyOutcomeMatchEvent
  | InjuryMatchEvent
  | SubstitutionMatchEvent
  | HalfTimeMatchEvent
  | FullTimeMatchEvent;

/** Incident facts added for progressive live simulation in Phase 77. */
export type LiveMatchIncidentEvent =
  | FoulMatchEvent
  | YellowCardMatchEvent
  | SecondYellowCardMatchEvent
  | RedCardMatchEvent
  | PenaltyAwardedMatchEvent
  | PenaltyOutcomeMatchEvent
  | InjuryMatchEvent
  | SubstitutionMatchEvent;

/**
 * Complete event vocabulary of the progressive live session.
 *
 * `MatchEvent` remains the active batch-report vocabulary until Step 02 moves
 * its callers to this union; this keeps the migration compile-safe without a
 * second simulation contract.
 */
export type LiveMatchEvent = MatchEvent;
