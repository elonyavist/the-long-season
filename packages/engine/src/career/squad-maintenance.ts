import {
  createCareerState,
  playerSquadDepartment,
  type CareerState,
  type Club,
  type ClubId,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerSquadDepartment,
} from "@game/domain";

import { createCareerIntakePool, type CareerIntakeCandidate } from "./player-intake.ts";

/** Default minimum active squad size for a playable club. */
export const MINIMUM_CAREER_SQUAD_SIZE = 18;

/** Default target active squad size after maintenance. */
export const TARGET_CAREER_SQUAD_SIZE = 22;

/** Minimum role-defined department depth protected by career lifecycle moves. */
export const MINIMUM_CAREER_DEPARTMENT_DEPTH: Readonly<Record<PlayerSquadDepartment, number>> = {
  goalkeeper: 2,
  defender: 6,
  midfielder: 6,
  attacker: 3,
};

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

/** Derived squad depth used by maintenance and long-run AI recruitment. */
export interface CareerSquadStructureAssessment {
  /** Number of senior players currently owned by the club. */
  readonly squadSize: number;
  /** Current player count in each broad football department. */
  readonly departmentDepth: Readonly<Record<PlayerSquadDepartment, number>>;
  /** Whether one more player is required to reach the configured target. */
  readonly requiresPlayer: boolean;
  /** Department that must be filled before generic squad depth. */
  readonly neededDepartment?: PlayerSquadDepartment;
  /** Factual structural warnings remaining in the squad. */
  readonly warnings: readonly SquadMaintenanceWarning[];
}

/**
 * Assesses one squad without mutating ownership or inventing recruitment.
 *
 * Department needs are strict before generic target size: goalkeeper first,
 * then defenders, midfielders, and attackers. This ordering is shared by the
 * legacy intake path and canonical free-agent recruitment.
 */
export function assessCareerSquadStructure(input: {
  readonly playerIds: readonly PlayerId[];
  readonly players: CareerState["gameState"]["players"];
  readonly minimumSquadSize?: number;
  readonly targetSquadSize?: number;
  /** Allow canonical recruitment to repair department depth above target size. */
  readonly fillDepartmentDepthBeyondTarget?: boolean;
}): CareerSquadStructureAssessment {
  const minimumSquadSize = input.minimumSquadSize ?? MINIMUM_CAREER_SQUAD_SIZE;
  const targetSquadSize = input.targetSquadSize ?? TARGET_CAREER_SQUAD_SIZE;
  const departmentDepth: Record<PlayerSquadDepartment, number> = {
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    attacker: 0,
  };

  for (const playerId of input.playerIds) {
    const player = input.players[playerId];
    if (player !== undefined) departmentDepth[playerSquadDepartment(player)] += 1;
  }

  const warnings: SquadMaintenanceWarning[] = [];
  if (input.playerIds.length < minimumSquadSize) warnings.push("below_minimum_squad_size");
  if (departmentDepth.goalkeeper === 0) warnings.push("no_natural_goalkeeper");
  if (departmentDepth.goalkeeper < MINIMUM_CAREER_DEPARTMENT_DEPTH.goalkeeper) {
    warnings.push("weak_goalkeeper_depth");
  }
  if (departmentDepth.defender < MINIMUM_CAREER_DEPARTMENT_DEPTH.defender) {
    warnings.push("weak_defender_depth");
  }
  if (departmentDepth.midfielder < MINIMUM_CAREER_DEPARTMENT_DEPTH.midfielder) {
    warnings.push("weak_midfielder_depth");
  }
  if (departmentDepth.attacker < MINIMUM_CAREER_DEPARTMENT_DEPTH.attacker) {
    warnings.push("weak_attacker_depth");
  }

  const mayFillDepartment = input.fillDepartmentDepthBeyondTarget === true
    || input.playerIds.length < targetSquadSize;
  const neededDepartment = departmentDepth.goalkeeper === 0
    ? "goalkeeper"
    : mayFillDepartment && departmentDepth.goalkeeper < MINIMUM_CAREER_DEPARTMENT_DEPTH.goalkeeper
      ? "goalkeeper"
      : mayFillDepartment && departmentDepth.defender < MINIMUM_CAREER_DEPARTMENT_DEPTH.defender
        ? "defender"
        : mayFillDepartment && departmentDepth.midfielder < MINIMUM_CAREER_DEPARTMENT_DEPTH.midfielder
          ? "midfielder"
          : mayFillDepartment && departmentDepth.attacker < MINIMUM_CAREER_DEPARTMENT_DEPTH.attacker
            ? "attacker"
            : undefined;

  return {
    squadSize: input.playerIds.length,
    departmentDepth,
    requiresPlayer: neededDepartment !== undefined || input.playerIds.length < targetSquadSize,
    ...(neededDepartment === undefined ? {} : { neededDepartment }),
    warnings,
  };
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
    let needs = assessCareerSquadStructure({
      playerIds: nextClub.playerIds,
      players: players as CareerState["gameState"]["players"],
      minimumSquadSize,
      targetSquadSize,
    });

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
      needs = assessCareerSquadStructure({
        playerIds: nextClub.playerIds,
        players: players as CareerState["gameState"]["players"],
        minimumSquadSize,
        targetSquadSize,
      });
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

function bestCandidateIndexForClub(
  candidates: readonly CareerIntakeCandidate[],
  clubId: Club["id"],
  needs: CareerSquadStructureAssessment,
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

    if (
      needs.neededDepartment !== undefined
      && playerSquadDepartment(candidate.player) === needs.neededDepartment
    ) {
      return index;
    }
  }

  return fallbackIndex;
}
