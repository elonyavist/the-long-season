import {
  abilityValue,
  gameDate,
  type GameDate,
  type Player,
  type PlayerId,
  type PlayerStateCurvesConfig,
} from "@game/domain";

/** Complete deterministic player-state policy for engine tests. */
export function playerStateCurvesConfigFixture(): PlayerStateCurvesConfig {
  return {
    schemaVersion: 1,
    version: "test-player-state-curves-v2",
    baseRecoveryHalfLifeDaysBasisPoints: 7_500,
    ageHalfLifeDaysPerYearBasisPoints: 5_000,
    agePenaltyStartsAtYears: 30,
    ageMatchLoadPerYearBasisPoints: 3_000,
    maximumAgeMatchLoadMultiplierBasisPoints: 25_000,
    resilienceWeightsBasisPoints: {
      stamina: 6_000,
      agility: 2_500,
      strength: 1_500,
    },
    lowResilienceHalfLifeMultiplierBasisPoints: 18_000,
    highResilienceHalfLifeMultiplierBasisPoints: 14_000,
  };
}

/** Generated-shaped outfielder for dated load and recovery tests. */
export function playerStateCurvePlayerFixture(
  id: PlayerId,
  age: number,
  physical: number,
  currentDate: GameDate,
): Player {
  const value = abilityValue(10);
  const physicalValue = abilityValue(physical);
  const abilities: Player["abilities"] = {
    technical: { finishing: value, passing: value, longPassing: value, crossing: value, dribbling: value, technique: value, tackling: value, penalties: value, freeKicks: value },
    physical: { pace: value, strength: physicalValue, stamina: physicalValue, agility: physicalValue, heading: value },
    mental: { positioning: value, vision: value, anticipation: value, composure: value, determination: value, leadership: value },
    goalkeeping: { reflexes: value, handling: value, rushingOut: value, goalkeeperPositioning: value, footwork: value },
  };
  return {
    id,
    firstName: "State",
    lastName: String(id),
    birthDate: gameDate(Number(currentDate) - Math.round(age * 365.2425)),
    naturalPositions: ["cm"],
    abilities,
    potential: abilities,
  };
}
