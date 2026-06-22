import {
  createCareerState,
  type CareerState,
  type Club,
  type ClubId,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerPosition,
} from "@game/domain";

import { createCareerIntakePool, type CareerIntakeCandidate } from "./player-intake.ts";

/** Default minimum active squad size for a playable club. */
export const MINIMUM_CAREER_SQUAD_SIZE = 18;

/** Default target active squad size after maintenance. */
export const TARGET_CAREER_SQUAD_SIZE = 22;

/** Factual role-balance warning emitted by squad maintenance. */
export type SquadMaintenanceWarning =
  | "below_minimum_squad_size"
  | "no_natural_goalkeeper"
  | "weak_goalkeeper_depth"
  | "weak_defender_depth"
  | "weak_midfielder_depth"
  | "weak_attacker_depth";

/** Input for deterministic squad-size and broad role-balance maintenance. */
export interface MaintainCareerSquadShapeInput {
  /** Durable career state before maintenance is applied. */
  readonly careerState: CareerState;
  /** Generated intake candidates in deterministic order. */
  readonly intakeCandidates: readonly CareerIntakeCandidate[];
  /** Optional minimum squad size. Defaults to `18`. */
  readonly minimumSquadSize?: number;
  /** Optional target squad size. Defaults to `22`. */
  readonly targetSquadSize?: number;
}

/** Per-club factual maintenance record. */
export interface SquadMaintenanceRecord {
  /** Club inspected by this pass. */
  readonly clubId: Club["id"];
  /** Active squad size before maintenance. */
  readonly beforeSquadSize: number;
  /** Active squad size after maintenance. */
  readonly afterSquadSize: number;
  /** Intake players added to this club in deterministic order. */
  readonly addedPlayerIds: readonly PlayerId[];
  /** Remaining factual warnings after maintenance. */
  readonly warnings: readonly SquadMaintenanceWarning[];
}

/** Result of squad-shape maintenance. */
export interface MaintainCareerSquadShapeResult {
  /** Copied career state with applied intake players. */
  readonly careerState: CareerState;
  /** Factual per-club records for reports. */
  readonly records: readonly SquadMaintenanceRecord[];
}

/**
 * Applies generated intake players where clubs need structural squad depth.
 *
 * The function keeps the world playable without choosing the user's lineup,
 * tactic, or market strategy. It fills only broad squad-shape gaps: minimum
 * size, natural goalkeeper coverage, and coarse department depth.
 */
export function maintainCareerSquadShape(input: MaintainCareerSquadShapeInput): MaintainCareerSquadShapeResult {
  const minimumSquadSize = input.minimumSquadSize ?? MINIMUM_CAREER_SQUAD_SIZE;
  const targetSquadSize = input.targetSquadSize ?? TARGET_CAREER_SQUAD_SIZE;
  const pool = createCareerIntakePool({
    activePlayerIds: input.careerState.gameState.playerIds,
    activeClubIds: input.careerState.gameState.clubIds,
    candidates: input.intakeCandidates,
  });
  const unusedCandidates = [...pool.candidates];
  const players: Partial<Record<PlayerId, Player>> = { ...input.careerState.gameState.players };
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = { ...input.careerState.gameState.playerStates };
  const activePlayerIds = [...input.careerState.gameState.playerIds];
  const clubs: Partial<Record<ClubId, Club>> = {};
  const records: SquadMaintenanceRecord[] = [];

  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    const beforeSquadSize = club.playerIds.length;
    const addedPlayerIds: PlayerId[] = [];
    let nextClub = { ...club, playerIds: [...club.playerIds] };
    let needs = squadNeeds(nextClub.playerIds, players as CareerState["gameState"]["players"], minimumSquadSize, targetSquadSize);

    while (needs.requiresPlayer && unusedCandidates.length > 0) {
      const candidateIndex = bestCandidateIndexForClub(unusedCandidates, clubId, needs);
      if (candidateIndex < 0) {
        break;
      }

      const [candidate] = unusedCandidates.splice(candidateIndex, 1);
      if (candidate === undefined) {
        break;
      }

      players[candidate.player.id] = candidate.player;
      playerStates[candidate.player.id] = candidate.playerState;
      activePlayerIds.push(candidate.player.id);
      nextClub = {
        ...nextClub,
        playerIds: [...nextClub.playerIds, candidate.player.id],
      };
      addedPlayerIds.push(candidate.player.id);
      needs = squadNeeds(nextClub.playerIds, players as CareerState["gameState"]["players"], minimumSquadSize, targetSquadSize);
    }

    clubs[clubId] = nextClub;
    records.push({
      clubId,
      beforeSquadSize,
      afterSquadSize: nextClub.playerIds.length,
      addedPlayerIds,
      warnings: needs.warnings,
    });
  }

  return {
    careerState: createCareerState({
      ...input.careerState,
      gameState: {
        ...input.careerState.gameState,
        players: players as CareerState["gameState"]["players"],
        playerIds: activePlayerIds,
        playerStates: playerStates as CareerState["gameState"]["playerStates"],
        clubs: clubs as CareerState["gameState"]["clubs"],
      },
    }),
    records,
  };
}

interface SquadNeeds {
  readonly requiresPlayer: boolean;
  readonly neededGroup?: "goalkeeper" | "defender" | "midfielder" | "attacker";
  readonly warnings: readonly SquadMaintenanceWarning[];
}

function squadNeeds(
  playerIds: readonly PlayerId[],
  players: CareerState["gameState"]["players"],
  minimumSquadSize: number,
  targetSquadSize: number,
): SquadNeeds {
  let goalkeepers = 0;
  let defenders = 0;
  let midfielders = 0;
  let attackers = 0;

  for (const playerId of playerIds) {
    const player = players[playerId];
    if (player === undefined) {
      continue;
    }

    switch (positionGroup(player.naturalPositions[0])) {
      case "goalkeeper":
        goalkeepers += 1;
        break;
      case "defender":
        defenders += 1;
        break;
      case "midfielder":
        midfielders += 1;
        break;
      case "attacker":
        attackers += 1;
        break;
    }
  }

  const warnings: SquadMaintenanceWarning[] = [];
  if (playerIds.length < minimumSquadSize) warnings.push("below_minimum_squad_size");
  if (goalkeepers === 0) warnings.push("no_natural_goalkeeper");
  if (goalkeepers < 2) warnings.push("weak_goalkeeper_depth");
  if (defenders < 6) warnings.push("weak_defender_depth");
  if (midfielders < 6) warnings.push("weak_midfielder_depth");
  if (attackers < 3) warnings.push("weak_attacker_depth");

  if (goalkeepers === 0) {
    return { requiresPlayer: true, neededGroup: "goalkeeper", warnings };
  }

  if (playerIds.length >= targetSquadSize) {
    return {
      requiresPlayer: false,
      warnings,
    };
  }

  if (goalkeepers < 2) {
    return { requiresPlayer: true, neededGroup: "goalkeeper", warnings };
  }

  if (defenders < 6) {
    return { requiresPlayer: true, neededGroup: "defender", warnings };
  }

  if (midfielders < 6) {
    return { requiresPlayer: true, neededGroup: "midfielder", warnings };
  }

  if (attackers < 3) {
    return { requiresPlayer: true, neededGroup: "attacker", warnings };
  }

  return {
    requiresPlayer: playerIds.length < targetSquadSize,
    warnings,
  };
}

function bestCandidateIndexForClub(
  candidates: readonly CareerIntakeCandidate[],
  clubId: Club["id"],
  needs: SquadNeeds,
): number {
  let fallbackIndex = -1;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (candidate === undefined || candidate.targetClubId !== clubId) {
      continue;
    }

    if (fallbackIndex < 0) {
      fallbackIndex = index;
    }

    if (needs.neededGroup !== undefined && positionGroup(candidate.player.naturalPositions[0]) === needs.neededGroup) {
      return index;
    }
  }

  return fallbackIndex;
}

function positionGroup(position: PlayerPosition | undefined): "goalkeeper" | "defender" | "midfielder" | "attacker" {
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
