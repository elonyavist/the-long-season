import {
  PLAYER_ARCHETYPES_BY_ROLE,
  PLAYER_ROLES,
  type PlayerArchetype,
  type PlayerRole,
} from "@game/domain";

/** Stable path key for one visible player ability. */
export type PlayerAbilityKey =
  | "technical.finishing"
  | "technical.passing"
  | "technical.longPassing"
  | "technical.crossing"
  | "technical.dribbling"
  | "technical.technique"
  | "technical.tackling"
  | "technical.penalties"
  | "technical.freeKicks"
  | "physical.pace"
  | "physical.strength"
  | "physical.stamina"
  | "physical.agility"
  | "physical.heading"
  | "mental.positioning"
  | "mental.vision"
  | "mental.anticipation"
  | "mental.composure"
  | "mental.determination"
  | "mental.leadership"
  | "goalkeeping.reflexes"
  | "goalkeeping.handling"
  | "goalkeeping.rushingOut"
  | "goalkeeping.goalkeeperPositioning"
  | "goalkeeping.footwork";

/** Attribute bucket used by generation, development caps, and quality reports. */
export type RoleAttributeBucket = "coreForRole" | "secondaryForRole" | "allowedButLow" | "cappedOutOfRole";

/** Explicit deterministic ability-key order for classification tests and reports. */
export const PLAYER_ABILITY_KEYS: readonly PlayerAbilityKey[] = [
  "technical.finishing",
  "technical.passing",
  "technical.longPassing",
  "technical.crossing",
  "technical.dribbling",
  "technical.technique",
  "technical.tackling",
  "technical.penalties",
  "technical.freeKicks",
  "physical.pace",
  "physical.strength",
  "physical.stamina",
  "physical.agility",
  "physical.heading",
  "mental.positioning",
  "mental.vision",
  "mental.anticipation",
  "mental.composure",
  "mental.determination",
  "mental.leadership",
  "goalkeeping.reflexes",
  "goalkeeping.handling",
  "goalkeeping.rushingOut",
  "goalkeeping.goalkeeperPositioning",
  "goalkeeping.footwork",
];

/** Reusable classification and hard caps for one role profile. */
export interface RoleAttributeClassification {
  /** Attributes that define excellence for this role. */
  readonly coreForRole: readonly PlayerAbilityKey[];
  /** Attributes that can become good but should not dominate the role. */
  readonly secondaryForRole: readonly PlayerAbilityKey[];
  /** Attributes that may exist but should normally stay modest. */
  readonly allowedButLow: readonly PlayerAbilityKey[];
  /** Attributes that must stay capped because they are incoherent for the role. */
  readonly cappedOutOfRole: readonly PlayerAbilityKey[];
  /** Upper bound for role-incoherent attributes on the 1..20 ability scale. */
  readonly hardCaps: Readonly<Partial<Record<PlayerAbilityKey, number>>>;
}

const OUTFIELD_GOALKEEPING_CAPS: Readonly<Partial<Record<PlayerAbilityKey, number>>> = {
  "goalkeeping.reflexes": 4,
  "goalkeeping.handling": 4,
  "goalkeeping.rushingOut": 4,
  "goalkeeping.goalkeeperPositioning": 4,
  "goalkeeping.footwork": 5,
};

/** Role-level Phase 33 classification data. */
export const PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS: Readonly<Record<PlayerRole, RoleAttributeClassification>> = {
  goalkeeper: classification({
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
  center_back: classification({
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
  full_back: classification({
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
  wing_back: classification({
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
  defensive_midfielder: classification({
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
  central_midfielder: classification({
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
  attacking_midfielder: classification({
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
  wide_midfielder: classification({
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
  winger: classification({
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
  striker: classification({
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

/** Archetype-level lookup for future overrides; v1 maps each archetype to its parent role classification. */
export const PLAYER_ARCHETYPE_ATTRIBUTE_CLASSIFICATIONS: Readonly<Record<PlayerArchetype, RoleAttributeClassification>> =
  buildArchetypeClassifications();

/** Returns the attribute classification for one stable player role. */
export function getRoleAttributeClassification(role: PlayerRole): RoleAttributeClassification {
  return PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS[role];
}

/** Returns the attribute classification for one stable player archetype. */
export function getArchetypeAttributeClassification(archetype: PlayerArchetype): RoleAttributeClassification {
  return PLAYER_ARCHETYPE_ATTRIBUTE_CLASSIFICATIONS[archetype];
}

/** Returns a hard cap for one role/ability pair, if the ability is role-capped. */
export function hardCapForRoleAbility(role: PlayerRole, abilityKey: PlayerAbilityKey): number | undefined {
  return PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS[role].hardCaps[abilityKey];
}

function classification(input: RoleAttributeClassification): RoleAttributeClassification {
  return input;
}

function buildArchetypeClassifications(): Record<PlayerArchetype, RoleAttributeClassification> {
  const result: Partial<Record<PlayerArchetype, RoleAttributeClassification>> = {};

  for (const role of PLAYER_ROLES) {
    const classificationForRole = PLAYER_ROLE_ATTRIBUTE_CLASSIFICATIONS[role];
    for (const archetype of PLAYER_ARCHETYPES_BY_ROLE[role]) {
      result[archetype] = classificationForRole;
    }
  }

  return result as Record<PlayerArchetype, RoleAttributeClassification>;
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
