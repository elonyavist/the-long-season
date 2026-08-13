import type { MatchInjurySeverity } from "../entities/match-event.entity.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { CompetitionId, FixtureId, PlayerId } from "../types/ids.ts";
import type { TacticalRoute } from "../balance/match-tactics-calibration.ts";

/** Durable reason for a competition suspension after one completed match. */
export type MatchSuspensionReason = "straight_red" | "second_yellow" | "yellow_accumulation";

/** Minimum durable injury facts committed after full time. */
export interface MatchInjuryConsequence {
  readonly type: "injury";
  readonly fixtureId: FixtureId;
  readonly playerId: PlayerId;
  readonly severity: MatchInjurySeverity;
  readonly occurredOn: GameDate;
  readonly unavailableUntil: GameDate;
}

/** Minimum durable suspension facts committed after full time. */
export interface MatchSuspensionConsequence {
  readonly type: "suspension";
  readonly fixtureId: FixtureId;
  readonly competitionId: CompetitionId;
  readonly playerId: PlayerId;
  readonly reason: MatchSuspensionReason;
  readonly matches: number;
}

/** Durable player consequences produced only after a completed fixture. */
export type MatchPlayerConsequence = MatchInjuryConsequence | MatchSuspensionConsequence;

/** Who owned an accepted live tactical decision. */
export type MatchTacticalCommandOwner = "manager" | "ai";

/** Stable kind of accepted change that opened a new tactical chapter. */
export type MatchTacticalChapterChangeKind = "substitution" | "formation" | "role" | "tactic";

/** One route count derived from canonical shot events. */
export interface MatchTacticalChapterRouteCount {
  readonly route: TacticalRoute;
  readonly count: number;
}

/** Observable football produced by one side during one closed chapter. */
export interface MatchTacticalChapterSideFact {
  readonly shots: number;
  readonly goals: number;
  readonly expectedGoals: number;
  readonly averageChanceQuality: number | "not_observed";
  readonly attemptedRoutes: readonly MatchTacticalChapterRouteCount[];
  readonly scoringRoutes: readonly MatchTacticalChapterRouteCount[];
}

/** Why a chapter began; multiple owners are retained when commands share a minute. */
export type MatchTacticalChapterTrigger =
  | { readonly type: "kickoff" }
  | {
      readonly type: "command";
      readonly owners: readonly MatchTacticalCommandOwner[];
      readonly sides: readonly ("home" | "away")[];
      readonly changeKinds: readonly MatchTacticalChapterChangeKind[];
    };

/** Derived, presentation-neutral chapter over canonical match facts. */
export interface MatchTacticalChapterFact {
  readonly startMinute: number;
  readonly endMinute: number;
  readonly trigger: MatchTacticalChapterTrigger;
  readonly home: MatchTacticalChapterSideFact;
  readonly away: MatchTacticalChapterSideFact;
}
