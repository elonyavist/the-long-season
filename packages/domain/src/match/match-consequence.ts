import type { MatchInjurySeverity } from "../entities/match-event.entity.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { CompetitionId, FixtureId, PlayerId } from "../types/ids.ts";

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
