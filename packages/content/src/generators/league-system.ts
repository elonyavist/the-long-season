import {
  competitionId,
  gameDate,
  seasonId,
  type Competition,
  type GameDate,
  type LeagueTableRules,
  type SeasonId,
} from "@game/domain";
import { fromISO } from "@game/shared";

import { generateFakeClubs, type FakeClubs } from "./fake-clubs.ts";
import { generateFakePlayersForClubs, type FakePlayers } from "./fake-players.ts";

/**
 * Ability weight keys mirrored as data so content does not import engine code.
 */
export type FakeAbilityWeightKey =
  | "goalkeeping.footwork"
  | "goalkeeping.goalkeeperPositioning"
  | "goalkeeping.handling"
  | "goalkeeping.reflexes"
  | "goalkeeping.rushingOut"
  | "mental.anticipation"
  | "mental.composure"
  | "mental.determination"
  | "mental.leadership"
  | "mental.positioning"
  | "mental.vision"
  | "physical.agility"
  | "physical.heading"
  | "physical.pace"
  | "physical.stamina"
  | "physical.strength"
  | "technical.crossing"
  | "technical.dribbling"
  | "technical.finishing"
  | "technical.freeKicks"
  | "technical.longPassing"
  | "technical.passing"
  | "technical.penalties"
  | "technical.tackling"
  | "technical.technique";

/**
 * Team-strength department key mirrored as data.
 */
export type FakeTeamStrengthDepartment = "attack" | "defense" | "goalkeeper" | "midfield";

/**
 * Role-weight profile emitted by fake content.
 */
export interface FakeRoleWeightProfile {
  /** Stable role key referenced by fake lineups. */
  readonly roleKey: string;
  /** Department where the role contributes. */
  readonly department: FakeTeamStrengthDepartment;
  /** Ability weights used by engine team-strength derivation. */
  readonly abilityWeights: Readonly<Partial<Record<FakeAbilityWeightKey, number>>>;
}

/**
 * State multiplier curve point emitted by content without importing engine code.
 */
export interface FakeStateMultiplierCurve {
  /** Upper inclusive state value bound, normally in the 0-100 range. */
  readonly maxValueInclusive: number;
  /** Multiplier applied when the state value is inside this point. */
  readonly multiplier: number;
}

/**
 * Player-state multiplier curves emitted by fake content.
 */
export interface FakePlayerStateMultiplierCurves {
  /** Fitness curve used by engine team-strength derivation. */
  readonly fitness?: readonly FakeStateMultiplierCurve[];
}

/**
 * Match-engine config shape emitted by content without importing engine code.
 */
export interface FakeMatchEngineConfig {
  readonly minuteCount: number;
  readonly rates: {
    readonly baseOpportunityRatePerMinute: number;
    readonly maxOpportunityRatePerMinute: number;
  };
  readonly conversionBands: readonly {
    readonly bandKey: string;
    readonly minQualityInclusive: number;
    readonly maxQualityExclusive: number;
    readonly goalProbability: number;
  }[];
  readonly homeAdvantageFactor: number;
  readonly tacticalDistributionCaps: {
    readonly directness: { readonly minInclusive: number; readonly maxInclusive: number };
    readonly pressing: { readonly minInclusive: number; readonly maxInclusive: number };
    readonly width: { readonly minInclusive: number; readonly maxInclusive: number };
    readonly risk: { readonly minInclusive: number; readonly maxInclusive: number };
  };
}

/**
 * Complete fake league system used by the first season CLI milestone.
 */
export interface FakeLeagueSystem extends FakeClubs, FakePlayers {
  /** Generated season ID. */
  readonly seasonId: SeasonId;
  /** Generated single competition. */
  readonly competition: Competition;
  /** First round date. */
  readonly seasonStartDate: GameDate;
  /** Basic three-points-for-a-win table rules. */
  readonly tableRules: LeagueTableRules;
  /** Aggregate match-engine tuning for the fake season. */
  readonly matchEngineConfig: FakeMatchEngineConfig;
  /** Role weights consumed structurally by engine team-strength derivation. */
  readonly roleWeights: Readonly<Record<string, FakeRoleWeightProfile>>;
  /** Dynamic-state multiplier curves consumed structurally by engine strength derivation. */
  readonly stateMultiplierCurves: FakePlayerStateMultiplierCurves;
}

/** Options for deterministic fake league creation. */
export interface FakeLeagueSystemOptions {
  /** World/content seed used by generated players, identities, and squads. */
  readonly worldSeed?: string;
}

/**
 * Creates the deterministic fake league system for `simulate-season`.
 *
 * @example
 * const league = createFakeLeagueSystem({ worldSeed: "career-001" });
 */
export function createFakeLeagueSystem(options: FakeLeagueSystemOptions = {}): FakeLeagueSystem {
  const clubs = generateFakeClubs();
  const players = generateFakePlayersForClubs(
    clubs.clubIds,
    options.worldSeed === undefined ? {} : { seed: options.worldSeed },
  );
  const season = seasonId("season:demo-001");
  const competition: Competition = {
    id: competitionId("competition:demo-third-division"),
    name: "Demo Third Division",
    clubIds: clubs.clubIds,
  };

  return {
    ...clubs,
    ...players,
    seasonId: season,
    competition,
    seasonStartDate: gameDate(fromISO("2026-08-01")),
    tableRules: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
    matchEngineConfig: fakeMatchEngineConfig(),
    roleWeights: fakeRoleWeights(),
    stateMultiplierCurves: fakeStateMultiplierCurves(),
  };
}

/**
 * Builds the first aggregate match-engine config for fake season simulation.
 */
function fakeMatchEngineConfig(): FakeMatchEngineConfig {
  return {
    minuteCount: 90,
    rates: {
      baseOpportunityRatePerMinute: 0.09,
      maxOpportunityRatePerMinute: 0.24,
    },
    conversionBands: [
      {
        bandKey: "low",
        minQualityInclusive: 0,
        maxQualityExclusive: 0.45,
        goalProbability: 0.105,
      },
      {
        bandKey: "medium",
        minQualityInclusive: 0.45,
        maxQualityExclusive: 0.65,
        goalProbability: 0.2,
      },
      {
        bandKey: "high",
        minQualityInclusive: 0.65,
        maxQualityExclusive: 1.01,
        goalProbability: 0.35,
      },
    ],
    homeAdvantageFactor: 1.1,
    tacticalDistributionCaps: {
      directness: { minInclusive: 0, maxInclusive: 1 },
      pressing: { minInclusive: 0, maxInclusive: 1 },
      width: { minInclusive: 0, maxInclusive: 1 },
      risk: { minInclusive: 0, maxInclusive: 1 },
    },
  };
}

/**
 * Builds deterministic role weights for the fixed fake 4-4-2 lineups.
 */
function fakeRoleWeights(): Readonly<Record<string, FakeRoleWeightProfile>> {
  return {
    gk: {
      roleKey: "gk",
      department: "goalkeeper",
      abilityWeights: {
        "goalkeeping.reflexes": 3,
        "goalkeeping.handling": 2,
        "goalkeeping.goalkeeperPositioning": 2,
        "goalkeeping.footwork": 1,
      },
    },
    defender: {
      roleKey: "defender",
      department: "defense",
      abilityWeights: {
        "technical.tackling": 2,
        "physical.strength": 1,
        "physical.heading": 1,
        "mental.positioning": 2,
        "mental.anticipation": 1,
      },
    },
    midfielder: {
      roleKey: "midfielder",
      department: "midfield",
      abilityWeights: {
        "technical.passing": 2,
        "technical.technique": 1,
        "physical.stamina": 1,
        "mental.vision": 2,
        "mental.determination": 1,
      },
    },
    attacker: {
      roleKey: "attacker",
      department: "attack",
      abilityWeights: {
        "technical.finishing": 3,
        "technical.dribbling": 1,
        "physical.pace": 1,
        "mental.composure": 2,
        "physical.heading": 1,
      },
    },
  };
}

/**
 * Builds bounded dynamic-state multiplier curves for fake content.
 */
function fakeStateMultiplierCurves(): FakePlayerStateMultiplierCurves {
  return {
    fitness: [
      { maxValueInclusive: 39, multiplier: 0.88 },
      { maxValueInclusive: 59, multiplier: 0.94 },
      { maxValueInclusive: 79, multiplier: 0.98 },
      { maxValueInclusive: 100, multiplier: 1 },
    ],
  };
}
