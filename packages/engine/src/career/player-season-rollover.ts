import {
  createCareerState,
  resetPlayerParticipationSeason,
  stateValue,
  type CareerState,
  type GameDate,
  type PlayerDynamicState,
  type PlayerId,
  type SeasonId,
} from "@game/domain";

const RESET_FITNESS = stateValue(100);
const RESET_FORM = stateValue(50);
const NEUTRAL_MORALE = 50;
const MORALE_NORMALIZATION_STEP = 10;

/** Input for deterministic end-of-season player state rollover. */
export interface PlayerSeasonRolloverInput {
  /** Current durable career state. */
  readonly careerState: CareerState;
  /** Season that becomes active after rollover. */
  readonly nextSeasonId: SeasonId;
  /** World date for the start of the next season. */
  readonly nextSeasonStartDate: GameDate;
}

/** Result of applying player season rollover. */
export interface PlayerSeasonRolloverResult {
  /** Copied career state with calendar and player dynamic states updated. */
  readonly careerState: CareerState;
}

/**
 * Applies the MVP end-of-season player age/state rollover.
 *
 * Player age is derived from `GameDate`, so this function advances the career
 * calendar to the next season start instead of mutating immutable birth dates.
 * Abilities, potential, and role identity are intentionally unchanged because
 * their season development is owned by the dedicated development pass.
 */
export function rolloverPlayersForNextSeason(input: PlayerSeasonRolloverInput): PlayerSeasonRolloverResult {
  const playerStates: Record<PlayerId, PlayerDynamicState> = {};
  const previousSeasonId = input.careerState.gameState.calendar.currentSeasonId;
  const playerParticipationLedger = input.careerState.playerParticipationLedger === undefined
    ? undefined
    : resetPlayerParticipationSeason(input.careerState.playerParticipationLedger, previousSeasonId);

  for (const playerId of input.careerState.gameState.playerIds) {
    const currentState = input.careerState.gameState.playerStates[playerId];
    playerStates[playerId] = {
      fitness: RESET_FITNESS,
      form: RESET_FORM,
      morale: stateValue(normalizeMorale(currentState?.morale ?? stateValue(NEUTRAL_MORALE))),
    };
  }

  return {
    careerState: createCareerState({
      ...input.careerState,
      ...(playerParticipationLedger === undefined ? {} : { playerParticipationLedger }),
      gameState: {
        ...input.careerState.gameState,
        calendar: {
          ...input.careerState.gameState.calendar,
          currentDate: input.nextSeasonStartDate,
          currentSeasonId: input.nextSeasonId,
        },
        playerStates,
      },
    }),
  };
}

function normalizeMorale(morale: PlayerDynamicState["morale"]): number {
  if (morale > NEUTRAL_MORALE) {
    return Math.max(NEUTRAL_MORALE, morale - MORALE_NORMALIZATION_STEP);
  }

  if (morale < NEUTRAL_MORALE) {
    return Math.min(NEUTRAL_MORALE, morale + MORALE_NORMALIZATION_STEP);
  }

  return morale;
}
