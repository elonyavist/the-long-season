import { type PlayerDynamicState, type PlayerId } from "@game/domain";

import { DEFAULT_FITNESS_RULES, FitnessStateError, spendFitnessForPlayers, type FitnessRules } from "../player-state/fitness.ts";

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
  /** Explicit selected starters who must pay match fitness. */
  readonly selectedStarterIds: readonly PlayerId[];
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
 * The caller supplies the selected starters. This helper does not choose
 * players, infer rotation, apply recovery, mutate the input state, or write
 * rendered text. `reportPlayerIds` exists so presentation layers can show
 * rested players alongside starters without changing the consequence rules.
 */
export function applyCareerFixtureConditionConsequences(
  input: ApplyCareerFixtureConditionConsequencesInput,
): ApplyCareerFixtureConditionConsequencesResult {
  const rules = input.rules ?? DEFAULT_FITNESS_RULES;
  const playerStates = spendFitnessForPlayers({
    playerStates: input.playerStates,
    playerIds: input.selectedStarterIds,
    rules,
  });
  const starterIds = new Set(input.selectedStarterIds);
  const reportPlayerIds = input.reportPlayerIds ?? input.selectedStarterIds;

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
        started: starterIds.has(playerId),
      };
    }),
  };
}
