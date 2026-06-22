import {
  abilityValue,
  createCareerState,
  type CareerState,
  type Player,
  type PlayerAbilities,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SeasonId,
} from "@game/domain";
import { deriveRng } from "@game/shared";

type BroadPositionGroup = "goalkeeper" | "defender" | "midfielder" | "attacker";
type DevelopmentAttributeBucket = "coreForRole" | "secondaryForRole" | "allowedButLow" | "cappedOutOfRole";
type AbilityPath =
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

const DAYS_PER_YEAR = 365;
const MINIMUM_GROWTH_ROOM = 0.05;
const MAX_SINGLE_SEASON_GROWTH = 0.65;
const MAX_SINGLE_SEASON_DECLINE = 0.55;

const ALL_ABILITY_PATHS: readonly AbilityPath[] = [
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

interface DevelopmentRoleProfile {
  readonly coreForRole: ReadonlySet<AbilityPath>;
  readonly secondaryForRole: ReadonlySet<AbilityPath>;
  readonly allowedButLow: ReadonlySet<AbilityPath>;
  readonly cappedOutOfRole: ReadonlySet<AbilityPath>;
  readonly hardCaps: Readonly<Partial<Record<AbilityPath, number>>>;
}

const OUTFIELD_GOALKEEPING_CAPS: Readonly<Partial<Record<AbilityPath, number>>> = {
  "goalkeeping.reflexes": 4,
  "goalkeeping.handling": 4,
  "goalkeeping.rushingOut": 4,
  "goalkeeping.goalkeeperPositioning": 4,
  "goalkeeping.footwork": 5,
};

const DEVELOPMENT_ROLE_PROFILES: Readonly<Record<PlayerRole, DevelopmentRoleProfile>> = {
  goalkeeper: developmentProfile({
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
  center_back: developmentProfile({
    coreForRole: ["technical.tackling", "physical.strength", "physical.heading", "mental.positioning", "mental.anticipation"],
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
    cappedOutOfRole: ["technical.finishing", "technical.crossing", ...goalkeeperAbilityPaths()],
    hardCaps: {
      "technical.finishing": 10,
      "technical.crossing": 9,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  full_back: developmentProfile({
    coreForRole: ["technical.crossing", "technical.tackling", "physical.pace", "physical.stamina", "mental.positioning"],
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
    cappedOutOfRole: ["technical.finishing", ...goalkeeperAbilityPaths()],
    hardCaps: {
      "technical.finishing": 10,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  wing_back: developmentProfile({
    coreForRole: ["technical.crossing", "technical.dribbling", "technical.tackling", "physical.pace", "physical.stamina"],
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
    cappedOutOfRole: ["technical.finishing", ...goalkeeperAbilityPaths()],
    hardCaps: {
      "technical.finishing": 11,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  defensive_midfielder: developmentProfile({
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
    cappedOutOfRole: ["technical.finishing", ...goalkeeperAbilityPaths()],
    hardCaps: {
      "technical.finishing": 10,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  central_midfielder: developmentProfile({
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
    cappedOutOfRole: goalkeeperAbilityPaths(),
    hardCaps: OUTFIELD_GOALKEEPING_CAPS,
  }),
  attacking_midfielder: developmentProfile({
    coreForRole: ["technical.passing", "technical.dribbling", "technical.technique", "mental.vision", "mental.composure"],
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
    cappedOutOfRole: ["technical.tackling", "physical.strength", "physical.heading", ...goalkeeperAbilityPaths()],
    hardCaps: {
      "technical.tackling": 11,
      "physical.strength": 13,
      "physical.heading": 12,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  wide_midfielder: developmentProfile({
    coreForRole: ["technical.crossing", "technical.dribbling", "technical.passing", "physical.pace", "physical.stamina"],
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
    cappedOutOfRole: goalkeeperAbilityPaths(),
    hardCaps: OUTFIELD_GOALKEEPING_CAPS,
  }),
  winger: developmentProfile({
    coreForRole: ["technical.crossing", "technical.dribbling", "technical.technique", "physical.pace", "physical.agility"],
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
    cappedOutOfRole: ["technical.tackling", "physical.heading", "mental.positioning", ...goalkeeperAbilityPaths()],
    hardCaps: {
      "technical.tackling": 10,
      "physical.heading": 11,
      "mental.positioning": 11,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
  striker: developmentProfile({
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
    cappedOutOfRole: ["technical.longPassing", "technical.tackling", ...goalkeeperAbilityPaths()],
    hardCaps: {
      "technical.longPassing": 11,
      "technical.tackling": 10,
      ...OUTFIELD_GOALKEEPING_CAPS,
    },
  }),
};

/** Input for deterministic positive player development over one season boundary. */
export interface PlayerDevelopmentInput {
  /** Durable career state before development is applied. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive per-player development streams. */
  readonly worldSeed: string;
  /** Season ID that is being developed. */
  readonly seasonId: SeasonId;
  /** Optional explicit player order to develop. Defaults to all active players. */
  readonly playerIds?: readonly PlayerId[];
}

/** One player development summary for later reports and tests. */
export interface PlayerDevelopmentChange {
  /** Player affected by this development pass. */
  readonly playerId: PlayerId;
  /** Age in whole years at the career state's current date. */
  readonly age: number;
  /** Broad position bucket used by the development model. */
  readonly positionGroup: BroadPositionGroup;
  /** Total positive ability growth across all attributes. */
  readonly totalGrowth: number;
  /** Total ability decline across all attributes. */
  readonly totalDecline: number;
  /** Number of individual abilities that improved. */
  readonly improvedAbilityCount: number;
  /** Number of individual abilities that declined. */
  readonly declinedAbilityCount: number;
}

/** Result of one pure player-development pass. */
export interface PlayerDevelopmentResult {
  /** Copied career state with developed player abilities. */
  readonly careerState: CareerState;
  /** Structured non-presentational development summary. */
  readonly changes: readonly PlayerDevelopmentChange[];
}

/**
 * Applies deterministic positive player growth for one season.
 *
 * This step intentionally contains no decline, staff, training, injuries, or
 * storage writes. Growth is bounded by each player's true potential and biased
 * toward role-relevant abilities so development remains credible over long
 * saves.
 */
export function developPlayersForSeason(input: PlayerDevelopmentInput): PlayerDevelopmentResult {
  const players: Partial<Record<PlayerId, Player>> = { ...input.careerState.gameState.players };
  const changes: PlayerDevelopmentChange[] = [];

  for (const playerId of input.playerIds ?? input.careerState.gameState.playerIds) {
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined) {
      continue;
    }

    const age = playerAgeYears(player, input.careerState.gameState.calendar.currentDate);
    const positionGroup = broadPositionGroup(player.naturalPositions[0]);
    const developmentRole = player.primaryRole ?? developmentRoleForPosition(player.naturalPositions[0]);
    const developed = developOnePlayer({
      player,
      age,
      positionGroup,
      developmentRole,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
    });

    players[playerId] = developed.player;
    changes.push({
      playerId,
      age,
      positionGroup,
      totalGrowth: roundDelta(developed.totalGrowth),
      totalDecline: roundDelta(developed.totalDecline),
      improvedAbilityCount: developed.improvedAbilityCount,
      declinedAbilityCount: developed.declinedAbilityCount,
    });
  }

  return {
    careerState: createCareerState({
      ...input.careerState,
      gameState: {
        ...input.careerState.gameState,
        players: players as CareerState["gameState"]["players"],
      },
    }),
    changes,
  };
}

interface DevelopOnePlayerInput {
  readonly player: Player;
  readonly age: number;
  readonly positionGroup: BroadPositionGroup;
  readonly developmentRole: PlayerRole;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
}

function developOnePlayer(input: DevelopOnePlayerInput): {
  readonly player: Player;
  readonly totalGrowth: number;
  readonly totalDecline: number;
  readonly improvedAbilityCount: number;
  readonly declinedAbilityCount: number;
} {
  const ageMultiplier = growthAgeMultiplier(input.positionGroup, input.age);
  const growthRng = deriveRng(input.worldSeed, "player-development-growth", input.seasonId, input.player.id);
  const declineRng = deriveRng(input.worldSeed, "player-development-decline", input.seasonId, input.player.id);
  const realizationModifier = playerRealizationModifier(input);
  let totalGrowth = 0;
  let totalDecline = 0;
  let improvedAbilityCount = 0;
  let declinedAbilityCount = 0;
  let abilities = input.player.abilities;

  if (ageMultiplier > 0) {
    for (const abilityPath of ALL_ABILITY_PATHS) {
      const current = readAbility(abilities, abilityPath);
      const potential = readAbility(input.player.potential, abilityPath);
      const hardCap = hardCapForDevelopmentRole(input.developmentRole, abilityPath);
      const effectivePotential = hardCap === undefined ? potential : Math.min(potential, hardCap);
      const room = effectivePotential - current;
      if (room <= MINIMUM_GROWTH_ROOM) {
        continue;
      }

      const relevance = roleRelevance(input.developmentRole, abilityPath);
      const seasonVariance = 0.65 + growthRng.nextFloat() * 0.7;
      const roomMultiplier = Math.min(1, room / 5);
      const dynamicDelta = MAX_SINGLE_SEASON_GROWTH * ageMultiplier * relevance * roomMultiplier * realizationModifier * seasonVariance;
      const delta = Math.min(room, roundDelta(dynamicDelta));
      if (delta <= 0) {
        continue;
      }

      abilities = writeAbility(abilities, abilityPath, current + delta);
      totalGrowth += delta;
      improvedAbilityCount += 1;
    }
  }

  const declineAgeMultiplier = declineAgeMultiplierFor(input.positionGroup, input.age);
  if (declineAgeMultiplier > 0) {
    for (const abilityPath of ALL_ABILITY_PATHS) {
      const current = readAbility(abilities, abilityPath);
      const relevance = declineRelevance(input.positionGroup, input.age, abilityPath);
      if (relevance <= 0 || current <= 0) {
        continue;
      }

      const realization = 0.65 + declineRng.nextFloat() * 0.7;
      const dynamicDelta = MAX_SINGLE_SEASON_DECLINE * declineAgeMultiplier * relevance * realization;
      const delta = Math.min(current, roundDelta(dynamicDelta));
      if (delta <= 0) {
        continue;
      }

      abilities = writeAbility(abilities, abilityPath, current - delta);
      totalDecline += delta;
      declinedAbilityCount += 1;
    }
  }

  return {
    player: {
      ...input.player,
      abilities,
    },
    totalGrowth,
    totalDecline,
    improvedAbilityCount,
    declinedAbilityCount,
  };
}

function playerRealizationModifier(input: DevelopOnePlayerInput): number {
  const rng = deriveRng(input.worldSeed, "player-development-realization", input.player.id);
  const currentAverage = averageAbilities(input.player.abilities);
  const potentialAverage = averageAbilities(input.player.potential);
  const roomAverage = Math.max(0, potentialAverage - currentAverage);
  const roll = rng.nextFloat();

  if (roomAverage >= 7) {
    return 0.45 + roll * 0.7;
  }

  if (roomAverage >= 5) {
    return 0.35 + roll * 0.75;
  }

  if (roomAverage >= 3) {
    return 0.25 + roll * 0.65;
  }

  if (roomAverage >= 1.5) {
    return 0.15 + roll * 0.5;
  }

  return 0.05 + roll * 0.25;
}

function averageAbilities(abilities: PlayerAbilities): number {
  let total = 0;

  for (const abilityPath of ALL_ABILITY_PATHS) {
    total += readAbility(abilities, abilityPath);
  }

  return total / ALL_ABILITY_PATHS.length;
}

function developmentProfile(input: {
  readonly coreForRole: readonly AbilityPath[];
  readonly secondaryForRole: readonly AbilityPath[];
  readonly allowedButLow: readonly AbilityPath[];
  readonly cappedOutOfRole: readonly AbilityPath[];
  readonly hardCaps: Readonly<Partial<Record<AbilityPath, number>>>;
}): DevelopmentRoleProfile {
  return {
    coreForRole: new Set(input.coreForRole),
    secondaryForRole: new Set(input.secondaryForRole),
    allowedButLow: new Set(input.allowedButLow),
    cappedOutOfRole: new Set(input.cappedOutOfRole),
    hardCaps: input.hardCaps,
  };
}

function goalkeeperAbilityPaths(): readonly AbilityPath[] {
  return [
    "goalkeeping.reflexes",
    "goalkeeping.handling",
    "goalkeeping.rushingOut",
    "goalkeeping.goalkeeperPositioning",
    "goalkeeping.footwork",
  ];
}

function playerAgeYears(player: Player, currentDate: CareerState["gameState"]["calendar"]["currentDate"]): number {
  return Math.floor((currentDate - player.birthDate) / DAYS_PER_YEAR);
}

function broadPositionGroup(position: PlayerPosition | undefined): BroadPositionGroup {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "cb":
    case "lb":
    case "rwb":
    case "lwb":
      return "defender";
    case "dm":
    case "cm":
    case "am":
      return "midfielder";
    case "rw":
    case "lw":
    case "st":
    default:
      return "attacker";
  }
}

function developmentRoleForPosition(position: PlayerPosition | undefined): PlayerRole {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "cb":
      return "center_back";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "dm":
      return "defensive_midfielder";
    case "cm":
      return "central_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
    case "lw":
      return "winger";
    case "st":
    default:
      return "striker";
  }
}

function growthAgeMultiplier(group: BroadPositionGroup, age: number): number {
  if (group === "goalkeeper") {
    if (age >= 18 && age <= 21) return 0.6;
    if (age >= 22 && age <= 24) return 0.75;
    if (age >= 25 && age <= 27) return 0.45;
    if (age >= 16 && age <= 17) return 0.3;
    return 0;
  }

  if (age >= 17 && age <= 20) return 0.85;
  if (age >= 21 && age <= 23) return 0.65;
  if (age >= 24 && age <= 25) return 0.35;
  if (group === "midfielder" && age === 26) return 0.2;
  if (age === 16) return 0.25;
  return 0;
}

function declineAgeMultiplierFor(group: BroadPositionGroup, age: number): number {
  switch (group) {
    case "goalkeeper":
      if (age >= 37) return 0.55;
      if (age >= 34) return 0.25;
      return 0;
    case "defender":
      if (age >= 34) return 0.55;
      if (age >= 31) return 0.2;
      return 0;
    case "midfielder":
      if (age >= 35) return 0.55;
      if (age >= 32) return 0.2;
      return 0;
    case "attacker":
      if (age >= 33) return 0.6;
      if (age >= 30) return 0.25;
      return 0;
  }
}

function roleRelevance(role: PlayerRole, abilityPath: AbilityPath): number {
  switch (attributeBucketForDevelopmentRole(role, abilityPath)) {
    case "coreForRole":
      return 1;
    case "secondaryForRole":
      return 0.35;
    case "allowedButLow":
      return 0.08;
    case "cappedOutOfRole":
      return 0.02;
  }
}

function declineRelevance(group: BroadPositionGroup, age: number, abilityPath: AbilityPath): number {
  if (group === "goalkeeper") {
    return goalkeeperDeclineRelevance(age, abilityPath);
  }

  if (isPrimaryPhysicalDeclineAbility(abilityPath)) {
    return 1;
  }

  if (abilityPath === "physical.heading") {
    return 0.45;
  }

  if (age >= lateDeclineAge(group)) {
    if (abilityPath.startsWith("technical.")) {
      return 0.16;
    }

    if (abilityPath.startsWith("mental.")) {
      return 0.08;
    }
  }

  return 0;
}

function goalkeeperDeclineRelevance(age: number, abilityPath: AbilityPath): number {
  if (abilityPath === "goalkeeping.rushingOut" || abilityPath === "goalkeeping.footwork") {
    return 1;
  }

  if (age >= 37 && abilityPath === "goalkeeping.reflexes") {
    return 0.75;
  }

  if (age >= 37 && (abilityPath === "goalkeeping.handling" || abilityPath === "goalkeeping.goalkeeperPositioning")) {
    return 0.3;
  }

  return 0;
}

function isPrimaryPhysicalDeclineAbility(abilityPath: AbilityPath): boolean {
  return abilityPath === "physical.pace" || abilityPath === "physical.stamina" || abilityPath === "physical.agility" || abilityPath === "physical.strength";
}

function lateDeclineAge(group: BroadPositionGroup): number {
  switch (group) {
    case "defender":
      return 34;
    case "midfielder":
      return 35;
    case "attacker":
      return 33;
    case "goalkeeper":
      return 37;
  }
}

function attributeBucketForDevelopmentRole(role: PlayerRole, abilityPath: AbilityPath): DevelopmentAttributeBucket {
  const profile = DEVELOPMENT_ROLE_PROFILES[role];
  if (profile.coreForRole.has(abilityPath)) return "coreForRole";
  if (profile.secondaryForRole.has(abilityPath)) return "secondaryForRole";
  if (profile.allowedButLow.has(abilityPath)) return "allowedButLow";
  if (profile.cappedOutOfRole.has(abilityPath)) return "cappedOutOfRole";
  return "allowedButLow";
}

function hardCapForDevelopmentRole(role: PlayerRole, abilityPath: AbilityPath): number | undefined {
  return DEVELOPMENT_ROLE_PROFILES[role].hardCaps[abilityPath];
}

function readAbility(abilities: PlayerAbilities, abilityPath: AbilityPath): number {
  switch (abilityPath) {
    case "technical.finishing":
      return abilities.technical.finishing;
    case "technical.passing":
      return abilities.technical.passing;
    case "technical.longPassing":
      return abilities.technical.longPassing;
    case "technical.crossing":
      return abilities.technical.crossing;
    case "technical.dribbling":
      return abilities.technical.dribbling;
    case "technical.technique":
      return abilities.technical.technique;
    case "technical.tackling":
      return abilities.technical.tackling;
    case "technical.penalties":
      return abilities.technical.penalties;
    case "technical.freeKicks":
      return abilities.technical.freeKicks;
    case "physical.pace":
      return abilities.physical.pace;
    case "physical.strength":
      return abilities.physical.strength;
    case "physical.stamina":
      return abilities.physical.stamina;
    case "physical.agility":
      return abilities.physical.agility;
    case "physical.heading":
      return abilities.physical.heading;
    case "mental.positioning":
      return abilities.mental.positioning;
    case "mental.vision":
      return abilities.mental.vision;
    case "mental.anticipation":
      return abilities.mental.anticipation;
    case "mental.composure":
      return abilities.mental.composure;
    case "mental.determination":
      return abilities.mental.determination;
    case "mental.leadership":
      return abilities.mental.leadership;
    case "goalkeeping.reflexes":
      return abilities.goalkeeping.reflexes;
    case "goalkeeping.handling":
      return abilities.goalkeeping.handling;
    case "goalkeeping.rushingOut":
      return abilities.goalkeeping.rushingOut;
    case "goalkeeping.goalkeeperPositioning":
      return abilities.goalkeeping.goalkeeperPositioning;
    case "goalkeeping.footwork":
      return abilities.goalkeeping.footwork;
  }
}

function writeAbility(abilities: PlayerAbilities, abilityPath: AbilityPath, value: number): PlayerAbilities {
  const nextValue = abilityValue(roundAbility(value));

  switch (abilityPath) {
    case "technical.finishing":
      return { ...abilities, technical: { ...abilities.technical, finishing: nextValue } };
    case "technical.passing":
      return { ...abilities, technical: { ...abilities.technical, passing: nextValue } };
    case "technical.longPassing":
      return { ...abilities, technical: { ...abilities.technical, longPassing: nextValue } };
    case "technical.crossing":
      return { ...abilities, technical: { ...abilities.technical, crossing: nextValue } };
    case "technical.dribbling":
      return { ...abilities, technical: { ...abilities.technical, dribbling: nextValue } };
    case "technical.technique":
      return { ...abilities, technical: { ...abilities.technical, technique: nextValue } };
    case "technical.tackling":
      return { ...abilities, technical: { ...abilities.technical, tackling: nextValue } };
    case "technical.penalties":
      return { ...abilities, technical: { ...abilities.technical, penalties: nextValue } };
    case "technical.freeKicks":
      return { ...abilities, technical: { ...abilities.technical, freeKicks: nextValue } };
    case "physical.pace":
      return { ...abilities, physical: { ...abilities.physical, pace: nextValue } };
    case "physical.strength":
      return { ...abilities, physical: { ...abilities.physical, strength: nextValue } };
    case "physical.stamina":
      return { ...abilities, physical: { ...abilities.physical, stamina: nextValue } };
    case "physical.agility":
      return { ...abilities, physical: { ...abilities.physical, agility: nextValue } };
    case "physical.heading":
      return { ...abilities, physical: { ...abilities.physical, heading: nextValue } };
    case "mental.positioning":
      return { ...abilities, mental: { ...abilities.mental, positioning: nextValue } };
    case "mental.vision":
      return { ...abilities, mental: { ...abilities.mental, vision: nextValue } };
    case "mental.anticipation":
      return { ...abilities, mental: { ...abilities.mental, anticipation: nextValue } };
    case "mental.composure":
      return { ...abilities, mental: { ...abilities.mental, composure: nextValue } };
    case "mental.determination":
      return { ...abilities, mental: { ...abilities.mental, determination: nextValue } };
    case "mental.leadership":
      return { ...abilities, mental: { ...abilities.mental, leadership: nextValue } };
    case "goalkeeping.reflexes":
      return { ...abilities, goalkeeping: { ...abilities.goalkeeping, reflexes: nextValue } };
    case "goalkeeping.handling":
      return { ...abilities, goalkeeping: { ...abilities.goalkeeping, handling: nextValue } };
    case "goalkeeping.rushingOut":
      return { ...abilities, goalkeeping: { ...abilities.goalkeeping, rushingOut: nextValue } };
    case "goalkeeping.goalkeeperPositioning":
      return { ...abilities, goalkeeping: { ...abilities.goalkeeping, goalkeeperPositioning: nextValue } };
    case "goalkeeping.footwork":
      return { ...abilities, goalkeeping: { ...abilities.goalkeeping, footwork: nextValue } };
  }
}

function roundAbility(value: number): number {
  return Math.max(0, Math.min(20, Math.round(value * 100) / 100));
}

function roundDelta(value: number): number {
  return Math.round(value * 100) / 100;
}
