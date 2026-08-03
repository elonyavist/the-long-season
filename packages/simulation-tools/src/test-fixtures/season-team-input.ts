import {
  abilityValue,
  gameDate,
  NEUTRAL_TACTIC_MENTALITY,
  type Player,
  type PlayerAbilities,
  type PlayerId,
} from "@game/domain";
import { createLineupSlot, type RoleWeightProfile, type SimulateSeasonTeamInput } from "@game/engine";

/**
 * Role weights that score every department off one flat ability set.
 *
 * With uniform players, a club's derived department strength equals the ability
 * it was built at. That is what lets a long-run test state "this club is worth
 * `9.5`" and have the engine agree without a stored strength.
 */
export const SEASON_FIXTURE_ROLE_WEIGHTS: Readonly<Record<string, RoleWeightProfile>> = {
  gk: {
    roleKey: "gk",
    department: "goalkeeper",
    abilityWeights: { "goalkeeping.reflexes": 1, "goalkeeping.handling": 1, "goalkeeping.goalkeeperPositioning": 1 },
  },
  defender: {
    roleKey: "defender",
    department: "defense",
    abilityWeights: { "technical.tackling": 1, "mental.positioning": 1, "physical.strength": 1 },
  },
  midfielder: {
    roleKey: "midfielder",
    department: "midfield",
    abilityWeights: { "technical.passing": 1, "mental.vision": 1, "physical.stamina": 1 },
  },
  attacker: {
    roleKey: "attacker",
    department: "attack",
    abilityWeights: { "technical.finishing": 1, "technical.dribbling": 1, "physical.pace": 1 },
  },
};

/**
 * Builds one two-player season team whose derived strength is exactly `rating`.
 *
 * Season input carries the squad rather than a precomputed strength, so a test
 * that wants a known club ordering supplies uniform players at the rating it
 * wants and lets the engine derive both readings of them.
 *
 * @example
 * const team = seasonTeamInputFixture(clubId("club:alpha"), 9.5);
 */
export function seasonTeamInputFixture(clubSlug: string, rating: number): SimulateSeasonTeamInput {
  const lineup = [
    createLineupSlot({ slotId: "slot:01", playerId: `player:${clubSlug}-01` as PlayerId, canonicalRole: "goalkeeper" }),
    createLineupSlot({ slotId: "slot:02", playerId: `player:${clubSlug}-02` as PlayerId, canonicalRole: "striker" }),
  ];

  return {
    lineup,
    players: Object.fromEntries(
      lineup.map((slot) => [slot.playerId, uniformPlayerFixture(slot.playerId, rating)]),
    ) as Readonly<Record<PlayerId, Player>>,
    roleWeights: SEASON_FIXTURE_ROLE_WEIGHTS,
    tacticalDistribution: {
      directness: 0.5,
      pressing: 0.5,
      width: 0.5,
      risk: 0.5,
      mentality: NEUTRAL_TACTIC_MENTALITY,
    },
  };
}

/** One synthetic player whose every ability is the same number. */
function uniformPlayerFixture(id: PlayerId, quality: number): Player {
  const abilities = uniformAbilitiesFixture(quality);

  return {
    id,
    firstName: "Season",
    lastName: "Fixture",
    birthDate: gameDate(0),
    naturalPositions: [],
    abilities,
    potential: abilities,
  };
}

function uniformAbilitiesFixture(quality: number): PlayerAbilities {
  const value = abilityValue(quality);

  return {
    technical: {
      crossing: value,
      dribbling: value,
      finishing: value,
      freeKicks: value,
      longPassing: value,
      passing: value,
      penalties: value,
      tackling: value,
      technique: value,
    },
    mental: {
      anticipation: value,
      composure: value,
      determination: value,
      leadership: value,
      positioning: value,
      vision: value,
    },
    physical: {
      agility: value,
      heading: value,
      pace: value,
      stamina: value,
      strength: value,
    },
    goalkeeping: {
      reflexes: value,
      handling: value,
      rushingOut: value,
      goalkeeperPositioning: value,
      footwork: value,
    },
  };
}
