import type { MatchScore } from "./match.entity.ts";

/**
 * Side marker used by persisted match events.
 */
export type MatchEventSide = "home" | "away";

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
  /** Whether the shot counted as on target. */
  readonly isShotOnTarget: boolean;
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
}

/**
 * Saved-shot outcome event.
 */
export interface SaveMatchEvent {
  /** Discriminant for a save. */
  readonly type: "save";
  /** Shared shot context. */
  readonly shot: ShotContext;
}

/**
 * Missed-shot outcome event.
 */
export interface MissMatchEvent {
  /** Discriminant for a miss. */
  readonly type: "miss";
  /** Shared shot context. */
  readonly shot: ShotContext;
}

/**
 * Blocked-shot outcome event.
 */
export interface BlockMatchEvent {
  /** Discriminant for a block. */
  readonly type: "block";
  /** Shared shot context. */
  readonly shot: ShotContext;
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
  | HalfTimeMatchEvent
  | FullTimeMatchEvent;
