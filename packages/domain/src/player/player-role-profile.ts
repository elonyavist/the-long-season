import { PLAYER_ROLES, type PlayerRole, type PlayerRoleFamiliarityLevel } from "../entities/player.entity.ts";
import type { AbilityWeightProfile, PlayerAbilityKey } from "./player-abilities.ts";

/**
 * Canonical relevance buckets in descending role importance.
 *
 * The declared order is the single owner of both the vocabulary and its
 * traversal order, so no caller enumerates object keys to recover either.
 */
export const ROLE_ATTRIBUTE_BUCKETS = [
  "coreForRole",
  "secondaryForRole",
  "allowedButLow",
  "cappedOutOfRole",
] as const;

/** Attribute bucket shared by generation, role evaluation, and development. */
export type RoleAttributeBucket = typeof ROLE_ATTRIBUTE_BUCKETS[number];

/** Canonical role meaning, weighted attributes, and global hard caps. */
export interface PlayerRoleProfile extends AbilityWeightProfile {
  /** Attributes that define excellence for this role. */
  readonly coreForRole: readonly PlayerAbilityKey[];
  /** Attributes that support the role without defining it. */
  readonly secondaryForRole: readonly PlayerAbilityKey[];
  /** Attributes that remain valid but deliberately low-impact. */
  readonly allowedButLow: readonly PlayerAbilityKey[];
  /** Attributes that are globally incoherent for the role. */
  readonly cappedOutOfRole: readonly PlayerAbilityKey[];
  /** Global upper bounds for role-incoherent attributes. */
  readonly hardCaps: Readonly<Partial<Record<PlayerAbilityKey, number>>>;
}

/** Maximum familiarity a player may reach through real exposure in a related role. */
export type RelatedPlayerRoleExposureCeiling = Extract<PlayerRoleFamiliarityLevel, "adapted" | "natural">;

/** One directional role-learning rule used by development and reports. */
export interface RelatedPlayerRoleExposureRule {
  /** Stable primary football identity that supplies the learning path. */
  readonly fromRole: PlayerRole;
  /** Related played role that can be learned through sustained minutes. */
  readonly toRole: PlayerRole;
  /** Highest familiarity reachable without rewriting the player's primary role. */
  readonly ceiling: RelatedPlayerRoleExposureCeiling;
}

const ROLE_ATTRIBUTE_WEIGHTS: Readonly<Record<RoleAttributeBucket, number>> = {
  coreForRole: 1,
  secondaryForRole: 0.35,
  allowedButLow: 0.08,
  cappedOutOfRole: 0.02,
};

const OUTFIELD_GOALKEEPING_CAPS: Readonly<Partial<Record<PlayerAbilityKey, number>>> = {
  "goalkeeping.reflexes": 4,
  "goalkeeping.handling": 4,
  "goalkeeping.rushingOut": 4,
  "goalkeeping.goalkeeperPositioning": 4,
  "goalkeeping.footwork": 5,
};

/** Role-level Phase 33 classification data. */
export const PLAYER_ROLE_PROFILES: Readonly<Record<PlayerRole, PlayerRoleProfile>> = {
  goalkeeper: playerRoleProfile({
    coreForRole: ["goalkeeping.reflexes", "goalkeeping.handling", "goalkeeping.goalkeeperPositioning", "goalkeeping.rushingOut"],
    secondaryForRole: [
      "goalkeeping.footwork",
      "physical.agility",
      "physical.strength",
      "mental.positioning",
      "mental.anticipation",
      "mental.composure",
      "mental.determination",
      "mental.leadership",
    ],
    allowedButLow: [
      "technical.passing",
      "technical.longPassing",
      "technical.technique",
      "physical.pace",
      "physical.stamina",
      "mental.vision",
    ],
    cappedOutOfRole: [
      "technical.finishing",
      "technical.crossing",
      "technical.dribbling",
      "technical.tackling",
      "technical.penalties",
      "technical.freeKicks",
      "physical.heading",
    ],
    hardCaps: {
      "technical.finishing": 5,
      "technical.crossing": 5,
      "technical.dribbling": 6,
      "technical.tackling": 5,
      "technical.penalties": 8,
      "technical.freeKicks": 7,
      "physical.heading": 6,
    },
  }),
  center_back: playerRoleProfile({
    coreForRole: [
      "technical.tackling",
      "physical.strength",
      "physical.heading",
      "mental.positioning",
      "mental.anticipation",
    ],
    secondaryForRole: [
      "technical.passing",
      "technical.longPassing",
      "physical.pace",
      "physical.stamina",
      "mental.composure",
      "mental.determination",
      "mental.leadership",
    ],
    allowedButLow: [
      "technical.dribbling",
      "technical.technique",
      "technical.penalties",
      "technical.freeKicks",
      "physical.agility",
      "mental.vision",
    ],
    cappedOutOfRole: ["technical.finishing", "technical.crossing", ...goalkeeperKeys()],
    hardCaps: {
      "technical.finishing": 10,
      "technical.crossing": 9,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  full_back: playerRoleProfile({
    coreForRole: [
      "technical.crossing",
      "technical.tackling",
      "physical.pace",
      "physical.stamina",
      "mental.positioning",
    ],
    secondaryForRole: [
      "technical.passing",
      "technical.longPassing",
      "technical.dribbling",
      "technical.technique",
      "physical.agility",
      "mental.anticipation",
      "mental.determination",
    ],
    allowedButLow: [
      "technical.penalties",
      "technical.freeKicks",
      "physical.strength",
      "physical.heading",
      "mental.vision",
      "mental.composure",
      "mental.leadership",
    ],
    cappedOutOfRole: ["technical.finishing", ...goalkeeperKeys()],
    hardCaps: {
      "technical.finishing": 10,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  wing_back: playerRoleProfile({
    coreForRole: [
      "technical.crossing",
      "technical.dribbling",
      "technical.tackling",
      "physical.pace",
      "physical.stamina",
    ],
    secondaryForRole: [
      "technical.passing",
      "technical.technique",
      "physical.agility",
      "mental.positioning",
      "mental.vision",
      "mental.anticipation",
      "mental.determination",
    ],
    allowedButLow: [
      "technical.longPassing",
      "technical.penalties",
      "technical.freeKicks",
      "physical.strength",
      "physical.heading",
      "mental.composure",
      "mental.leadership",
    ],
    cappedOutOfRole: ["technical.finishing", ...goalkeeperKeys()],
    hardCaps: {
      "technical.finishing": 11,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  defensive_midfielder: playerRoleProfile({
    coreForRole: [
      "technical.tackling",
      "technical.passing",
      "physical.strength",
      "physical.stamina",
      "mental.positioning",
      "mental.anticipation",
    ],
    secondaryForRole: [
      "technical.longPassing",
      "technical.technique",
      "physical.pace",
      "physical.heading",
      "mental.composure",
      "mental.determination",
      "mental.leadership",
    ],
    allowedButLow: [
      "technical.crossing",
      "technical.dribbling",
      "technical.penalties",
      "technical.freeKicks",
      "physical.agility",
      "mental.vision",
    ],
    cappedOutOfRole: ["technical.finishing", ...goalkeeperKeys()],
    hardCaps: {
      "technical.finishing": 10,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  central_midfielder: playerRoleProfile({
    coreForRole: [
      "technical.passing",
      "technical.longPassing",
      "technical.technique",
      "physical.stamina",
      "mental.vision",
      "mental.anticipation",
    ],
    secondaryForRole: [
      "technical.tackling",
      "technical.dribbling",
      "physical.agility",
      "mental.positioning",
      "mental.composure",
      "mental.determination",
      "mental.leadership",
    ],
    allowedButLow: [
      "technical.finishing",
      "technical.crossing",
      "technical.penalties",
      "technical.freeKicks",
      "physical.pace",
      "physical.strength",
      "physical.heading",
    ],
    cappedOutOfRole: goalkeeperKeys(),
    hardCaps: OUTFIELD_GOALKEEPING_CAPS,
  }),
  attacking_midfielder: playerRoleProfile({
    coreForRole: [
      "technical.passing",
      "technical.dribbling",
      "technical.technique",
      "mental.vision",
      "mental.composure",
    ],
    secondaryForRole: [
      "technical.finishing",
      "technical.longPassing",
      "technical.freeKicks",
      "physical.agility",
      "mental.positioning",
      "mental.anticipation",
    ],
    allowedButLow: [
      "technical.crossing",
      "technical.penalties",
      "physical.pace",
      "physical.stamina",
      "mental.determination",
      "mental.leadership",
    ],
    cappedOutOfRole: ["technical.tackling", "physical.strength", "physical.heading", ...goalkeeperKeys()],
    hardCaps: {
      "technical.tackling": 11,
      "physical.strength": 13,
      "physical.heading": 12,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  wide_midfielder: playerRoleProfile({
    coreForRole: [
      "technical.crossing",
      "technical.dribbling",
      "technical.passing",
      "physical.pace",
      "physical.stamina",
    ],
    secondaryForRole: [
      "technical.tackling",
      "technical.technique",
      "physical.agility",
      "mental.positioning",
      "mental.vision",
      "mental.determination",
    ],
    allowedButLow: [
      "technical.finishing",
      "technical.longPassing",
      "technical.penalties",
      "technical.freeKicks",
      "physical.strength",
      "physical.heading",
      "mental.anticipation",
      "mental.composure",
      "mental.leadership",
    ],
    cappedOutOfRole: goalkeeperKeys(),
    hardCaps: OUTFIELD_GOALKEEPING_CAPS,
  }),
  winger: playerRoleProfile({
    coreForRole: [
      "technical.crossing",
      "technical.dribbling",
      "technical.technique",
      "physical.pace",
      "physical.agility",
    ],
    secondaryForRole: [
      "technical.finishing",
      "technical.passing",
      "technical.freeKicks",
      "physical.stamina",
      "mental.vision",
      "mental.composure",
    ],
    allowedButLow: [
      "technical.longPassing",
      "technical.penalties",
      "physical.strength",
      "mental.anticipation",
      "mental.determination",
      "mental.leadership",
    ],
    cappedOutOfRole: ["technical.tackling", "physical.heading", "mental.positioning", ...goalkeeperKeys()],
    hardCaps: {
      "technical.tackling": 10,
      "physical.heading": 11,
      "mental.positioning": 11,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  striker: playerRoleProfile({
    coreForRole: [
      "technical.finishing",
      "technical.technique",
      "physical.heading",
      "mental.anticipation",
      "mental.composure",
    ],
    secondaryForRole: [
      "technical.dribbling",
      "technical.penalties",
      "physical.pace",
      "physical.strength",
      "physical.agility",
      "mental.positioning",
    ],
    allowedButLow: [
      "technical.passing",
      "technical.crossing",
      "technical.freeKicks",
      "physical.stamina",
      "mental.vision",
      "mental.determination",
      "mental.leadership",
    ],
    cappedOutOfRole: ["technical.longPassing", "technical.tackling", ...goalkeeperKeys()],
    hardCaps: {
      "technical.longPassing": 11,
      "technical.tackling": 10,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
};

/** Directional role-learning graph grounded in plausible football adaptation. */
export const RELATED_PLAYER_ROLE_EXPOSURE_RULES: readonly RelatedPlayerRoleExposureRule[] = [
  { fromRole: "center_back", toRole: "full_back", ceiling: "adapted" },
  { fromRole: "center_back", toRole: "defensive_midfielder", ceiling: "adapted" },
  { fromRole: "full_back", toRole: "center_back", ceiling: "adapted" },
  { fromRole: "full_back", toRole: "wing_back", ceiling: "natural" },
  { fromRole: "full_back", toRole: "wide_midfielder", ceiling: "adapted" },
  { fromRole: "wing_back", toRole: "full_back", ceiling: "natural" },
  { fromRole: "wing_back", toRole: "wide_midfielder", ceiling: "adapted" },
  { fromRole: "wing_back", toRole: "winger", ceiling: "adapted" },
  { fromRole: "defensive_midfielder", toRole: "center_back", ceiling: "adapted" },
  { fromRole: "defensive_midfielder", toRole: "central_midfielder", ceiling: "natural" },
  { fromRole: "central_midfielder", toRole: "defensive_midfielder", ceiling: "natural" },
  { fromRole: "central_midfielder", toRole: "attacking_midfielder", ceiling: "adapted" },
  { fromRole: "central_midfielder", toRole: "wide_midfielder", ceiling: "adapted" },
  { fromRole: "attacking_midfielder", toRole: "central_midfielder", ceiling: "adapted" },
  { fromRole: "attacking_midfielder", toRole: "winger", ceiling: "adapted" },
  { fromRole: "attacking_midfielder", toRole: "striker", ceiling: "adapted" },
  { fromRole: "wide_midfielder", toRole: "wing_back", ceiling: "adapted" },
  { fromRole: "wide_midfielder", toRole: "central_midfielder", ceiling: "adapted" },
  { fromRole: "wide_midfielder", toRole: "winger", ceiling: "natural" },
  { fromRole: "winger", toRole: "wide_midfielder", ceiling: "natural" },
  { fromRole: "winger", toRole: "attacking_midfielder", ceiling: "adapted" },
  { fromRole: "winger", toRole: "striker", ceiling: "adapted" },
  { fromRole: "striker", toRole: "attacking_midfielder", ceiling: "adapted" },
  { fromRole: "striker", toRole: "winger", ceiling: "adapted" },
];


/** Returns the one canonical profile for a stable player role. */
export function getPlayerRoleProfile(role: PlayerRole): PlayerRoleProfile {
  return PLAYER_ROLE_PROFILES[role];
}

/** Returns the directional role-learning ceiling, if the roles are related. */
export function relatedPlayerRoleExposureCeiling(
  fromRole: PlayerRole,
  toRole: PlayerRole,
): RelatedPlayerRoleExposureCeiling | undefined {
  if (fromRole === toRole) {
    return "natural";
  }

  return RELATED_PLAYER_ROLE_EXPOSURE_RULES.find((rule) => rule.fromRole === fromRole && rule.toRole === toRole)?.ceiling;
}

/** Checks whether sustained minutes in `toRole` may improve familiarity. */
export function canImprovePlayerRoleFamiliarity(fromRole: PlayerRole, toRole: PlayerRole): boolean {
  return fromRole !== "goalkeeper" && fromRole !== toRole && relatedPlayerRoleExposureCeiling(fromRole, toRole) !== undefined;
}

/** Returns the deliberate classification bucket for one role ability. */
export function roleAttributeBucket(role: PlayerRole, abilityKey: PlayerAbilityKey): RoleAttributeBucket {
  const profile = getPlayerRoleProfile(role);
  if (profile.coreForRole.includes(abilityKey)) return "coreForRole";
  if (profile.secondaryForRole.includes(abilityKey)) return "secondaryForRole";
  if (profile.allowedButLow.includes(abilityKey)) return "allowedButLow";
  return "cappedOutOfRole";
}

/** Returns a global hard cap for one role/ability pair when one is defined. */
export function hardCapForRoleAbility(role: PlayerRole, abilityKey: PlayerAbilityKey): number | undefined {
  return getPlayerRoleProfile(role).hardCaps[abilityKey];
}

function playerRoleProfile(
  input: Omit<PlayerRoleProfile, "weights">,
): PlayerRoleProfile {
  const weights: Partial<Record<PlayerAbilityKey, number>> = {};

  for (const bucket of ROLE_ATTRIBUTE_BUCKETS) {
    for (const abilityKey of input[bucket]) {
      weights[abilityKey] = ROLE_ATTRIBUTE_WEIGHTS[bucket];
    }
  }

  return {
    ...input,
    weights,
  };
}

function goalkeeperKeys(): readonly PlayerAbilityKey[] {
  return [
    "goalkeeping.reflexes",
    "goalkeeping.handling",
    "goalkeeping.rushingOut",
    "goalkeeping.goalkeeperPositioning",
    "goalkeeping.footwork",
  ];
}
