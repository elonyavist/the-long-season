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

/**
 * Stable football identity roles used by generation and development.
 *
 * `PlayerPosition` answers where a player lines up on the pitch; `PlayerRole`
 * answers what kind of footballer he is for generation, growth, and reports.
 */
export type PlayerRole =
  | "goalkeeper"
  | "center_back"
  | "full_back"
  | "wing_back"
  | "defensive_midfielder"
  | "central_midfielder"
  | "attacking_midfielder"
  | "wide_midfielder"
  | "winger"
  | "striker";

/**
 * Archetype keys for the Phase 33 v1 role model.
 *
 * Archetypes are machine-readable style descriptors. Presentation layers must
 * localize them if they are ever shown to the user.
 */
export type PlayerArchetype =
  | "goalkeeper_shot_stopper"
  | "goalkeeper_sweeper"
  | "center_back_stopper"
  | "center_back_ball_playing"
  | "full_back_defensive"
  | "full_back_attacking"
  | "wing_back_runner"
  | "wing_back_creator"
  | "defensive_midfielder_ball_winner"
  | "defensive_midfielder_deep_lying_playmaker"
  | "central_midfielder_box_to_box"
  | "central_midfielder_playmaker"
  | "attacking_midfielder_creator"
  | "attacking_midfielder_shadow_striker"
  | "wide_midfielder_balanced"
  | "wide_midfielder_worker"
  | "winger_creator"
  | "winger_inside_forward"
  | "striker_poacher"
  | "striker_target_forward";

/** Familiarity level for using one player in a role. */
export type PlayerRoleFamiliarityLevel = "natural" | "adapted" | "weak";

/** Explicit deterministic role order used by generators, tests, and reports. */
export const PLAYER_ROLES: readonly PlayerRole[] = [
  "goalkeeper",
  "center_back",
  "full_back",
  "wing_back",
  "defensive_midfielder",
  "central_midfielder",
  "attacking_midfielder",
  "wide_midfielder",
  "winger",
  "striker",
];

/** Small v1 archetype set for each official player role. */
export const PLAYER_ARCHETYPES_BY_ROLE: Readonly<Record<PlayerRole, readonly PlayerArchetype[]>> = {
  goalkeeper: ["goalkeeper_shot_stopper", "goalkeeper_sweeper"],
  center_back: ["center_back_stopper", "center_back_ball_playing"],
  full_back: ["full_back_defensive", "full_back_attacking"],
  wing_back: ["wing_back_runner", "wing_back_creator"],
  defensive_midfielder: ["defensive_midfielder_ball_winner", "defensive_midfielder_deep_lying_playmaker"],
  central_midfielder: ["central_midfielder_box_to_box", "central_midfielder_playmaker"],
  attacking_midfielder: ["attacking_midfielder_creator", "attacking_midfielder_shadow_striker"],
  wide_midfielder: ["wide_midfielder_balanced", "wide_midfielder_worker"],
  winger: ["winger_creator", "winger_inside_forward"],
  striker: ["striker_poacher", "striker_target_forward"],
};

/** Structured role identity fields that can be spread onto a `Player`. */
export interface PlayerRoleIdentity {
  /** Stable football identity used for generation and development. */
  readonly primaryRole: PlayerRole;
  /** Style inside the primary role. */
  readonly archetype: PlayerArchetype;
  /** Roles where the player is naturally comfortable. */
  readonly naturalRoles: readonly PlayerRole[];
  /** Nearby roles the player can cover with compromises. */
  readonly adaptedRoles: readonly PlayerRole[];
  /** Emergency roles that should not count as real squad coverage. */
  readonly weakRoles: readonly PlayerRole[];
  /** Familiarity levels by role; this is not a primary-role rewrite system. */
  readonly roleFamiliarity: Readonly<Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>>>;
}

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
  /** Stable football identity used for generation and development. */
  readonly primaryRole?: PlayerRole;
  /** Style inside the primary role. */
  readonly archetype?: PlayerArchetype;
  /** Roles where the player is naturally comfortable. */
  readonly naturalRoles?: readonly PlayerRole[];
  /** Nearby roles the player can cover with compromises. */
  readonly adaptedRoles?: readonly PlayerRole[];
  /** Emergency roles that should not count as real squad coverage. */
  readonly weakRoles?: readonly PlayerRole[];
  /** Familiarity level by role; improving this does not change primary role. */
  readonly roleFamiliarity?: Readonly<Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>>>;
  /** Current true ability values, hidden behind UI fog later. */
  readonly abilities: PlayerAbilities;
  /** True potential landing area per ability; UI potential ranges are derived later. */
  readonly potential: PlayerAbilities;
}

/** Machine-readable validation failure for player role identity. */
export type PlayerRoleIdentityErrorCode =
  | "archetype_not_allowed_for_role"
  | "primary_role_not_natural"
  | "duplicate_role"
  | "conflicting_role_familiarity";

/** Error thrown when role identity data is inconsistent. */
export class PlayerRoleIdentityError extends Error {
  /** Stable machine-readable validation code. */
  public readonly code: PlayerRoleIdentityErrorCode;

  /** Creates a player role identity validation error. */
  public constructor(code: PlayerRoleIdentityErrorCode, message: string) {
    super(message);
    this.name = "PlayerRoleIdentityError";
    this.code = code;
  }
}

/**
 * Builds validated role identity fields for a player.
 *
 * @example
 * const identity = createPlayerRoleIdentity({
 *   primaryRole: "center_back",
 *   archetype: "center_back_stopper",
 *   naturalRoles: ["center_back"],
 *   adaptedRoles: ["full_back", "defensive_midfielder"],
 *   weakRoles: ["wing_back"],
 * });
 */
export function createPlayerRoleIdentity(input: Omit<PlayerRoleIdentity, "roleFamiliarity"> & {
  readonly roleFamiliarity?: PlayerRoleIdentity["roleFamiliarity"];
}): PlayerRoleIdentity {
  if (!PLAYER_ARCHETYPES_BY_ROLE[input.primaryRole].includes(input.archetype)) {
    throw new PlayerRoleIdentityError(
      "archetype_not_allowed_for_role",
      `archetype ${input.archetype} is not allowed for role ${input.primaryRole}`,
    );
  }

  if (!input.naturalRoles.includes(input.primaryRole)) {
    throw new PlayerRoleIdentityError("primary_role_not_natural", `primary role must be natural: ${input.primaryRole}`);
  }

  assertDisjointRoles(input.naturalRoles, input.adaptedRoles, input.weakRoles);

  const roleFamiliarity = {
    ...familiarityEntries(input.naturalRoles, "natural"),
    ...familiarityEntries(input.adaptedRoles, "adapted"),
    ...familiarityEntries(input.weakRoles, "weak"),
    ...(input.roleFamiliarity ?? {}),
  };

  assertRoleFamiliarity(input.naturalRoles, input.adaptedRoles, input.weakRoles, roleFamiliarity);

  return {
    primaryRole: input.primaryRole,
    archetype: input.archetype,
    naturalRoles: [...input.naturalRoles],
    adaptedRoles: [...input.adaptedRoles],
    weakRoles: [...input.weakRoles],
    roleFamiliarity,
  };
}

function assertDisjointRoles(
  naturalRoles: readonly PlayerRole[],
  adaptedRoles: readonly PlayerRole[],
  weakRoles: readonly PlayerRole[],
): void {
  const seen = new Set<PlayerRole>();

  for (const role of [...naturalRoles, ...adaptedRoles, ...weakRoles]) {
    if (seen.has(role)) {
      throw new PlayerRoleIdentityError("duplicate_role", `role identity contains duplicate role: ${role}`);
    }

    seen.add(role);
  }
}

function familiarityEntries(
  roles: readonly PlayerRole[],
  level: PlayerRoleFamiliarityLevel,
): Readonly<Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>>> {
  const result: Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>> = {};

  for (const role of roles) {
    result[role] = level;
  }

  return result;
}

function assertRoleFamiliarity(
  naturalRoles: readonly PlayerRole[],
  adaptedRoles: readonly PlayerRole[],
  weakRoles: readonly PlayerRole[],
  roleFamiliarity: Readonly<Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>>>,
): void {
  for (const role of naturalRoles) {
    if (roleFamiliarity[role] !== "natural") {
      throw new PlayerRoleIdentityError("conflicting_role_familiarity", `natural role has conflicting familiarity: ${role}`);
    }
  }

  for (const role of adaptedRoles) {
    if (roleFamiliarity[role] !== "adapted") {
      throw new PlayerRoleIdentityError("conflicting_role_familiarity", `adapted role has conflicting familiarity: ${role}`);
    }
  }

  for (const role of weakRoles) {
    if (roleFamiliarity[role] !== "weak") {
      throw new PlayerRoleIdentityError("conflicting_role_familiarity", `weak role has conflicting familiarity: ${role}`);
    }
  }
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
