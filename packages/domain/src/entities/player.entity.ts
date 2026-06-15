import type { PlayerId } from "../types/ids.ts";
import type { GameDate } from "../value-objects/game-date.ts";
import type { AbilityValue, StateValue } from "../value-objects/rating.ts";

/**
 * Tactical positions used by the early domain model.
 *
 * Roles and role variants are introduced later. This type only captures where a
 * player naturally belongs on the pitch.
 */
export type PlayerPosition =
  | "gk"
  | "rb"
  | "cb"
  | "lb"
  | "rwb"
  | "lwb"
  | "dm"
  | "cm"
  | "am"
  | "rw"
  | "lw"
  | "st";

/** Technical outfield abilities on the 0-20 true-value scale. */
export interface TechnicalAbilities {
  /** Chance quality when finishing an action. */
  readonly finishing: AbilityValue;
  /** Short and medium passing quality. */
  readonly passing: AbilityValue;
  /** Long-range distribution quality. */
  readonly longPassing: AbilityValue;
  /** Wide delivery quality. */
  readonly crossing: AbilityValue;
  /** Ability to carry the ball past opponents. */
  readonly dribbling: AbilityValue;
  /** Ball control and execution quality. */
  readonly technique: AbilityValue;
  /** Ball-winning quality in challenges. */
  readonly tackling: AbilityValue;
  /** Penalty-taking quality. */
  readonly penalties: AbilityValue;
  /** Direct free-kick quality. */
  readonly freeKicks: AbilityValue;
}

/** Physical abilities on the 0-20 true-value scale. */
export interface PhysicalAbilities {
  /** Straight-line speed. */
  readonly pace: AbilityValue;
  /** Strength in duels and contact. */
  readonly strength: AbilityValue;
  /** Capacity to sustain effort. */
  readonly stamina: AbilityValue;
  /** Quickness and body control. */
  readonly agility: AbilityValue;
  /** Aerial ability. */
  readonly heading: AbilityValue;
}

/** Mental abilities on the 0-20 true-value scale. */
export interface MentalAbilities {
  /** Defensive and spatial positioning. */
  readonly positioning: AbilityValue;
  /** Ability to see and choose passes or attacking solutions. */
  readonly vision: AbilityValue;
  /** Ability to read play before it happens. */
  readonly anticipation: AbilityValue;
  /** Calmness under pressure. */
  readonly composure: AbilityValue;
  /** Work ethic and competitive edge. */
  readonly determination: AbilityValue;
  /** Dressing-room and on-pitch leadership. */
  readonly leadership: AbilityValue;
}

/** Goalkeeper-specific abilities on the 0-20 true-value scale. */
export interface GoalkeepingAbilities {
  /** Shot-stopping reaction quality. */
  readonly reflexes: AbilityValue;
  /** Catching and securing the ball. */
  readonly handling: AbilityValue;
  /** Timing and quality when leaving the line. */
  readonly rushingOut: AbilityValue;
  /** Goalkeeper-specific positioning. */
  readonly goalkeeperPositioning: AbilityValue;
  /** Distribution and ball-playing quality. */
  readonly footwork: AbilityValue;
}

/**
 * Full ability shape stored on every player.
 *
 * Step 1 match simulation may initially use only derived role aggregates, but
 * the raw 25 attributes are stable from the start to avoid future migrations.
 */
export interface PlayerAbilities {
  readonly technical: TechnicalAbilities;
  readonly physical: PhysicalAbilities;
  readonly mental: MentalAbilities;
  readonly goalkeeping: GoalkeepingAbilities;
}

/**
 * Stable player identity and true footballing attributes.
 *
 * Dynamic values such as fitness, form, and morale intentionally live in
 * `PlayerDynamicState`, because they change often and should not require
 * copying the full player entity.
 */
export interface Player {
  /** Stable namespaced identifier, for example `player:000001`. */
  readonly id: PlayerId;
  /** Given name from generated or authored content. */
  readonly firstName: string;
  /** Family name from generated or authored content. */
  readonly lastName: string;
  /** Birth date as game epoch-day. */
  readonly birthDate: GameDate;
  /** Natural positions, ordered by how suitable they are for the player. */
  readonly naturalPositions: readonly PlayerPosition[];
  /** Current true ability values, hidden behind UI fog later. */
  readonly abilities: PlayerAbilities;
  /** True potential landing area per ability; UI potential ranges are derived later. */
  readonly potential: PlayerAbilities;
}

/**
 * Volatile player state persisted separately from the stable player entity.
 *
 * Initial values are expected to be fitness 100, form 50, morale 50.
 */
export interface PlayerDynamicState {
  /** Current physical readiness, 0-100. */
  readonly fitness: StateValue;
  /** Recent performance state, 0-100. */
  readonly form: StateValue;
  /** Current morale state, 0-100. */
  readonly morale: StateValue;
}
