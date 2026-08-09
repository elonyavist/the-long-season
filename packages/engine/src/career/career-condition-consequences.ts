import {
  type GameDate,
  type Player,
  type PlayerDynamicState,
  type PlayerFixtureParticipationContribution,
  type PlayerId,
  type PlayerStateCurvesConfig,
} from "@game/domain";

import { DEFAULT_FITNESS_RULES, FitnessStateError, spendFitnessForMinutes, type FitnessRules } from "../player-state/fitness.ts";

/** One player-level condition change produced by a played career fixture. */
export interface CareerFixtureConditionChange {
  /** Player whose condition was reviewed. */
  readonly playerId: PlayerId;
  /** Fitness before the fixture consequence was applied. */
  readonly beforeFitness: number;
  /** Fitness after the fixture consequence was applied. */
  readonly afterFitness: number;
  /** Signed fitness delta, normally negative for starters and zero for rested players. */
  readonly delta: number;
  /** Whether this player was in the selected starting lineup for the fixture. */
  readonly started: boolean;
}

/** Input for applying one career fixture's deterministic condition consequence. */
export interface ApplyCareerFixtureConditionConsequencesInput {
  /** Current player-state lookup. This object is never mutated. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Exact committed appearance intervals for both match sides. */
  readonly contributions: readonly PlayerFixtureParticipationContribution[];
  readonly players: Readonly<Record<PlayerId, Player>>;
  readonly fixtureDate: GameDate;
  readonly playerStateCurves: PlayerStateCurvesConfig;
  /** Optional ordered players to include in the returned summary. */
  readonly reportPlayerIds?: readonly PlayerId[];
  /** Fitness rules to apply; defaults match the existing fitness prototype. */
  readonly rules?: FitnessRules;
}

/** Result of applying one played career fixture's condition consequence. */
export interface ApplyCareerFixtureConditionConsequencesResult {
  /** Copy-on-write player-state lookup after starter spend. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Ordered, structured player-level condition changes for presentation. */
  readonly changes: readonly CareerFixtureConditionChange[];
}

/**
 * Applies deterministic fitness spend for one played career fixture.
 *
 * The caller supplies canonical participation rows. This helper does not choose
 * players, infer minutes, apply recovery, mutate the input state, or write
 * rendered text. `reportPlayerIds` exists so presentation layers can show
 * rested players alongside starters without changing the consequence rules.
 */
export function applyCareerFixtureConditionConsequences(
  input: ApplyCareerFixtureConditionConsequencesInput,
): ApplyCareerFixtureConditionConsequencesResult {
  const rules = input.rules ?? DEFAULT_FITNESS_RULES;
  const playerStates = spendFitnessForMinutes({
    playerStates: input.playerStates,
    loads: input.contributions.map(({ playerId, minutes }) => ({ playerId, minutes })),
    players: input.players,
    currentDate: input.fixtureDate,
    loadPolicy: input.playerStateCurves,
    rules,
  });
  const contributionByPlayer = new Map(input.contributions.map((contribution) => [contribution.playerId, contribution]));
  const reportPlayerIds = input.reportPlayerIds ?? input.contributions.map(({ playerId }) => playerId);

  return {
    playerStates,
    changes: reportPlayerIds.map((playerId) => {
      const beforeState = input.playerStates[playerId];
      const afterState = playerStates[playerId];

      if (beforeState === undefined || afterState === undefined) {
        throw new FitnessStateError(
          "missing_player_state",
          `Missing player state for career fixture condition summary: ${playerId}`,
        );
      }

      const beforeFitness = Number(beforeState.fitness);
      const afterFitness = Number(afterState.fitness);

      return {
        playerId,
        beforeFitness,
        afterFitness,
        delta: afterFitness - beforeFitness,
        started: contributionByPlayer.get(playerId)?.started ?? false,
      };
    }),
  };
}
