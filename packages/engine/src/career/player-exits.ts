import {
  createCareerState,
  type CareerState,
  type Club,
  type ClubId,
  type Player,
  type PlayerAbilities,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
  type SeasonId,
} from "@game/domain";
import { deriveRng } from "@game/shared";

type BroadPositionGroup = "goalkeeper" | "defender" | "midfielder" | "attacker";

/** Stable machine-readable reason for one end-of-season player exit. */
export type PlayerExitReason = "retirement" | "released" | "career_step_down";

/** Input for deterministic end-of-season player exits. */
export interface PlayerExitInput {
  /** Durable career state before exits are applied. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive per-player exit rolls. */
  readonly worldSeed: string;
  /** Season ID being closed by this exit pass. */
  readonly seasonId: SeasonId;
}

/** One factual player-exit record for later reports and tests. */
export interface PlayerExitRecord {
  /** Player that left the active career-world roster. */
  readonly playerId: PlayerId;
  /** Club that owned the player before the exit. */
  readonly clubId: Club["id"];
  /** Whole-years age at the current career date. */
  readonly age: number;
  /** Broad role bucket used by the exit model. */
  readonly positionGroup: BroadPositionGroup;
  /** Current ability average used by the exit model. */
  readonly currentAbilityAverage: number;
  /** Machine-readable exit reason. */
  readonly reason: PlayerExitReason;
}

/** Result of one pure end-of-season exit pass. */
export interface PlayerExitResult {
  /** Copied career state with active rosters and player order updated. */
  readonly careerState: CareerState;
  /** Structured non-presentational exit records. */
  readonly exits: readonly PlayerExitRecord[];
}

/**
 * Applies deterministic end-of-season player exits.
 *
 * Exited players leave club rosters and the active `playerIds` traversal order,
 * but their immutable player record stays in `players` so old transfer history
 * and report references remain readable. This function never creates
 * replacements and never chooses a new user lineup.
 */
export function applyEndOfSeasonPlayerExits(input: PlayerExitInput): PlayerExitResult {
  const exits: PlayerExitRecord[] = [];
  const exitedPlayerIds = new Set<PlayerId>();

  for (const playerId of input.careerState.gameState.playerIds) {
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined) {
      continue;
    }

    const clubId = owningClubId(input.careerState, playerId);
    if (clubId === undefined) {
      continue;
    }

    const evaluation = evaluatePlayerExit({
      player,
      currentDate: input.careerState.gameState.calendar.currentDate,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
    });
    if (evaluation === undefined) {
      continue;
    }

    exitedPlayerIds.add(playerId);
    exits.push({
      playerId,
      clubId,
      age: evaluation.age,
      positionGroup: evaluation.positionGroup,
      currentAbilityAverage: evaluation.currentAbilityAverage,
      reason: evaluation.reason,
    });
  }

  if (exits.length === 0) {
    return {
      careerState: input.careerState,
      exits,
    };
  }

  const activePlayerIds = input.careerState.gameState.playerIds.filter((playerId) => !exitedPlayerIds.has(playerId));
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = {};
  for (const playerId of activePlayerIds) {
    const playerState = input.careerState.gameState.playerStates[playerId];
    if (playerState !== undefined) {
      playerStates[playerId] = playerState;
    }
  }

  const clubs: Partial<Record<ClubId, Club>> = {};
  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    clubs[clubId] = {
      ...club,
      playerIds: club.playerIds.filter((playerId) => !exitedPlayerIds.has(playerId)),
    };
  }

  const matchPreparation = isMatchPreparationStillOwned(input.careerState, exitedPlayerIds) ? input.careerState.matchPreparation : undefined;
  const { matchPreparation: _removedMatchPreparation, ...careerStateWithoutPreparation } = input.careerState;

  return {
    careerState: createCareerState({
      ...careerStateWithoutPreparation,
      gameState: {
        ...input.careerState.gameState,
        playerIds: activePlayerIds,
        playerStates: playerStates as CareerState["gameState"]["playerStates"],
        clubs: clubs as CareerState["gameState"]["clubs"],
      },
      ...(matchPreparation === undefined ? {} : { matchPreparation }),
    }),
    exits,
  };
}

interface PlayerExitEvaluationInput {
  readonly player: Player;
  readonly currentDate: CareerState["gameState"]["calendar"]["currentDate"];
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
}

interface PlayerExitEvaluation {
  readonly age: number;
  readonly positionGroup: BroadPositionGroup;
  readonly currentAbilityAverage: number;
  readonly reason: PlayerExitReason;
}

function evaluatePlayerExit(input: PlayerExitEvaluationInput): PlayerExitEvaluation | undefined {
  const age = Math.floor((input.currentDate - input.player.birthDate) / 365);
  const positionGroup = broadPositionGroup(input.player.naturalPositions[0]);
  const currentAbilityAverage = roundAverage(averageAbilities(input.player.abilities));
  const candidate = exitCandidateFor(positionGroup, age, currentAbilityAverage);
  if (candidate === undefined) {
    return undefined;
  }

  const rng = deriveRng(input.worldSeed, "career-player-exit", input.seasonId, input.player.id);
  if (rng.nextFloat() > candidate.probability) {
    return undefined;
  }

  return {
    age,
    positionGroup,
    currentAbilityAverage,
    reason: candidate.reason,
  };
}

function exitCandidateFor(
  positionGroup: BroadPositionGroup,
  age: number,
  currentAbilityAverage: number,
): { readonly reason: PlayerExitReason; readonly probability: number } | undefined {
  if (positionGroup === "goalkeeper") {
    if (age >= 40) return { reason: "retirement", probability: 1 };
    if (age >= 38 && currentAbilityAverage <= 8.5) return { reason: "retirement", probability: 0.85 };
    if (age >= 35 && currentAbilityAverage <= 7.5) return { reason: "career_step_down", probability: 0.5 };
    return undefined;
  }

  if (age >= 37) return { reason: "retirement", probability: 1 };
  if (age >= 35 && currentAbilityAverage <= 8.5) return { reason: "retirement", probability: 0.8 };
  if (age >= 33 && currentAbilityAverage <= 7.5) return { reason: "career_step_down", probability: 0.6 };
  if (age >= 30 && currentAbilityAverage <= 6.5) return { reason: "released", probability: 0.45 };
  return undefined;
}

function isMatchPreparationStillOwned(careerState: CareerState, exitedPlayerIds: ReadonlySet<PlayerId>): boolean {
  const selectedLineup = careerState.matchPreparation?.selectedLineup;
  if (selectedLineup === undefined) {
    return true;
  }

  for (const slot of selectedLineup.slots) {
    if (exitedPlayerIds.has(slot.playerId)) {
      return false;
    }
  }

  return true;
}

function owningClubId(careerState: CareerState, playerId: PlayerId): Club["id"] | undefined {
  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    if (club.playerIds.includes(playerId)) {
      return clubId;
    }
  }

  return undefined;
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

function averageAbilities(abilities: PlayerAbilities): number {
  return (
    abilities.technical.finishing +
    abilities.technical.passing +
    abilities.technical.longPassing +
    abilities.technical.crossing +
    abilities.technical.dribbling +
    abilities.technical.technique +
    abilities.technical.tackling +
    abilities.technical.penalties +
    abilities.technical.freeKicks +
    abilities.physical.pace +
    abilities.physical.strength +
    abilities.physical.stamina +
    abilities.physical.agility +
    abilities.physical.heading +
    abilities.mental.positioning +
    abilities.mental.vision +
    abilities.mental.anticipation +
    abilities.mental.composure +
    abilities.mental.determination +
    abilities.mental.leadership +
    abilities.goalkeeping.reflexes +
    abilities.goalkeeping.handling +
    abilities.goalkeeping.rushingOut +
    abilities.goalkeeping.goalkeeperPositioning +
    abilities.goalkeeping.footwork
  ) / 25;
}

function roundAverage(value: number): number {
  return Math.round(value * 100) / 100;
}
