import type { MatchDisciplineConfig } from "../match-engine/match-engine-config.ts";

/** Builds one complete discipline calibration for engine tests. */
export function matchDisciplineConfigFixture(
  overrides: Partial<MatchDisciplineConfig> = {},
): MatchDisciplineConfig {
  return {
    version: "match-discipline-test-v1",
    penaltyAwardProbabilityAfterDangerousFoulBasisPoints: 3_500,
    directFreeKickMinimumZoneDangerBasisPoints: 8_000,
    directFreeKickShotProbabilityBasisPoints: 7_500,
    directFreeKickBaseGoalProbabilityBasisPoints: 646,
    directFreeKickReferenceTakerAbility: 14,
    directFreeKickTakerAbilityStepBasisPoints: 30,
    directFreeKickReferenceGoalkeeperReflexes: 12,
    directFreeKickGoalkeeperAbilityStepBasisPoints: 15,
    directFreeKickMinimumGoalProbabilityBasisPoints: 250,
    directFreeKickMaximumGoalProbabilityBasisPoints: 1_300,
    ...overrides,
  };
}
