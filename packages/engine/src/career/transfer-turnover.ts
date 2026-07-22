import {
  getPlayerRoleProfile,
  playerSquadDepartment,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  type CareerState,
  type Club,
  type GameDate,
  type Money,
  type Player,
  type PlayerId,
  type PlayerSquadDepartment,
  type SeasonId,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { applyCareerPermanentTransfer } from "./apply-career-transfer.ts";
import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  MINIMUM_CAREER_SQUAD_SIZE,
} from "./squad-maintenance.ts";

type BroadPositionGroup = PlayerSquadDepartment;

/** One deterministic minimal player movement between clubs. */
export interface TransferTurnoverRecord {
  /** Player moved by the turnover pass. */
  readonly playerId: PlayerId;
  /** Club losing the player. */
  readonly fromClubId: Club["id"];
  /** Club receiving the player. */
  readonly toClubId: Club["id"];
  /** Broad group used to match destination squad shape. */
  readonly positionGroup: BroadPositionGroup;
  /** Rounded role current ability used by willingness/suitability checks. */
  readonly currentAbilityAverage: number;
  /** Canonical permanent-transfer fee paid by the buyer. */
  readonly transferFee: Money;
}

/** Input for deterministic transfer-turnover simulation. */
export interface SimulateTransferTurnoverInput {
  /** Durable career state before turnover is applied. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive movement choices. */
  readonly worldSeed: string;
  /** Season ID being closed by this turnover pass. */
  readonly seasonId: SeasonId;
  /** Effective date shared by transfer, contract, history, and finance facts. */
  readonly occurredOn?: GameDate;
  /** Optional move cap. Defaults to roughly one move per four clubs. */
  readonly maxMoves?: number;
}

/** Result of deterministic transfer turnover. */
export interface SimulateTransferTurnoverResult {
  /** Canonical career state after accepted atomic market transitions. */
  readonly careerState: CareerState;
  /** Factual movements applied by the turnover pass. */
  readonly transfers: readonly TransferTurnoverRecord[];
}

/**
 * Applies a small deterministic AI-only permanent-transfer pass.
 *
 * Candidate discovery is intentionally narrow, but every accepted movement
 * uses the canonical market transaction so fee, ownership, registration,
 * employment, annual wage commitment, and history change together.
 */
export function simulateTransferTurnover(input: SimulateTransferTurnoverInput): SimulateTransferTurnoverResult {
  if (input.careerState.seniorSquadState === undefined || input.careerState.clubFinanceState === undefined) {
    throw new Error("Canonical senior-squad and club-finance state are required for transfer turnover");
  }

  const maxMoves = input.maxMoves ?? Math.max(1, Math.floor(input.careerState.gameState.clubIds.length / 4));
  let careerState = input.careerState;
  const transfers: TransferTurnoverRecord[] = [];
  for (const toClubId of shuffledClubIds(input.careerState.gameState.clubIds, input.worldSeed, input.seasonId)) {
    if (transfers.length >= maxMoves) {
      break;
    }
    if (toClubId === input.careerState.selectedClubId) continue;

    const toClub = careerState.gameState.clubs[toClubId];
    if (toClub === undefined) {
      continue;
    }

    const neededGroup = weakestPositionGroup(toClub, careerState.gameState.players);
    const sourceClubs = findSourceClubs({
      toClub,
      neededGroup,
      careerState,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
    });
    let accepted = false;
    for (const fromClub of sourceClubs) {
      for (const candidate of findMovablePlayers({ fromClub, neededGroup, careerState })) {
        const application = applyCareerPermanentTransfer({
          careerState,
          ...(input.occurredOn === undefined ? {} : { occurredOn: input.occurredOn }),
          intent: {
            buyingClubId: toClub.id,
            sellingClubId: fromClub.id,
            playerId: candidate.id,
          },
        });
        if (application.status !== "accepted" || application.transferFee === undefined) continue;
        careerState = application.careerState;
        transfers.push({
          playerId: candidate.id,
          fromClubId: fromClub.id,
          toClubId: toClub.id,
          positionGroup: playerSquadDepartment(candidate),
          currentAbilityAverage: roundAverage(turnoverCurrentAbility(candidate)),
          transferFee: application.transferFee,
        });
        accepted = true;
        break;
      }
      if (accepted) break;
    }
  }

  return { careerState, transfers };
}

/**
 * Returns a deterministic per-season destination order.
 *
 * The turnover pass has a move cap, so using raw club-id order would give early
 * clubs more chances to receive players every season. A seed-derived order keeps
 * the simulation reproducible while spreading market pressure across the league.
 */
function shuffledClubIds(
  clubIds: readonly Club["id"][],
  worldSeed: string,
  seasonId: SeasonId,
): readonly Club["id"][] {
  const keyed = clubIds.map((clubId) => ({
    clubId,
    roll: deriveRng(worldSeed, "career-transfer-turnover-destination", seasonId, clubId).nextFloat(),
  }));

  return keyed.sort((left, right) => left.roll - right.roll || String(left.clubId).localeCompare(String(right.clubId))).map((row) => row.clubId);
}

interface FindSourceClubInput {
  readonly toClub: Club;
  readonly neededGroup: BroadPositionGroup;
  readonly careerState: CareerState;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
}

function findSourceClubs(input: FindSourceClubInput): readonly Club[] {
  const candidates: Club[] = [];
  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.careerState.gameState.clubs[clubId];
    if (
      club === undefined
      || club.id === input.toClub.id
      || club.id === input.careerState.selectedClubId
      || club.playerIds.length <= MINIMUM_CAREER_SQUAD_SIZE + 1
    ) {
      continue;
    }

    if (findMovablePlayers({ fromClub: club, neededGroup: input.neededGroup, careerState: input.careerState }).length > 0) {
      candidates.push(club);
    }
  }

  return candidates
    .map((club) => ({
      club,
      order: deriveRng(
        input.worldSeed,
        "career-transfer-turnover-source",
        input.seasonId,
        input.toClub.id,
        input.neededGroup,
        club.id,
      ).nextFloat(),
    }))
    .sort((left, right) => left.order - right.order || String(left.club.id).localeCompare(String(right.club.id)))
    .map(({ club }) => club);
}

interface FindMovablePlayerInput {
  readonly fromClub: Club;
  readonly neededGroup: BroadPositionGroup;
  readonly careerState: CareerState;
}

function findMovablePlayers(input: FindMovablePlayerInput): readonly Player[] {
  const candidates: Player[] = [];
  for (const playerId of input.fromClub.playerIds) {
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined || playerSquadDepartment(player) !== input.neededGroup) {
      continue;
    }

    if (!canSourceClubLosePlayer(input.fromClub, player, input.careerState)) {
      continue;
    }

    candidates.push(player);
  }

  return candidates;
}

function canSourceClubLosePlayer(fromClub: Club, player: Player, careerState: CareerState): boolean {
  if (fromClub.playerIds.length <= MINIMUM_CAREER_SQUAD_SIZE + 1) {
    return false;
  }

  const department = playerSquadDepartment(player);
  let departmentCount = 0;
  for (const playerId of fromClub.playerIds) {
    const clubPlayer = careerState.gameState.players[playerId];
    if (clubPlayer !== undefined && playerSquadDepartment(clubPlayer) === department) {
      departmentCount += 1;
    }
  }

  return departmentCount > MINIMUM_CAREER_DEPARTMENT_DEPTH[department];
}

function weakestPositionGroup(club: Club, players: CareerState["gameState"]["players"]): BroadPositionGroup {
  const counts = { goalkeeper: 0, defender: 0, midfielder: 0, attacker: 0 };

  for (const playerId of club.playerIds) {
    const player = players[playerId];
    if (player !== undefined) {
      counts[playerSquadDepartment(player)] += 1;
    }
  }

  if (counts.goalkeeper < MINIMUM_CAREER_DEPARTMENT_DEPTH.goalkeeper) return "goalkeeper";
  if (counts.defender < MINIMUM_CAREER_DEPARTMENT_DEPTH.defender) return "defender";
  if (counts.midfielder < MINIMUM_CAREER_DEPARTMENT_DEPTH.midfielder) return "midfielder";
  if (counts.attacker < MINIMUM_CAREER_DEPARTMENT_DEPTH.attacker) return "attacker";

  if (counts.defender <= counts.midfielder && counts.defender <= counts.attacker) return "defender";
  if (counts.midfielder <= counts.attacker) return "midfielder";
  return "attacker";
}

/** Returns current football quality for turnover willingness decisions. */
function turnoverCurrentAbility(player: Player): number {
  if (player.primaryRole === undefined) {
    return Number(rawDiagnosticAbilityAverage(player.abilities));
  }

  return Number(roleCurrentAbility(player.abilities, getPlayerRoleProfile(player.primaryRole)));
}

function roundAverage(value: number): number {
  return Math.round(value * 100) / 100;
}
