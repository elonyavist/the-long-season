import {
  createCareerState,
  getPlayerRoleProfile,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  type CareerState,
  type Club,
  type Player,
  type PlayerId,
  type PlayerPosition,
  type SeasonId,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { MINIMUM_CAREER_SQUAD_SIZE } from "./squad-maintenance.ts";

type BroadPositionGroup = "goalkeeper" | "defender" | "midfielder" | "attacker";

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
}

/** Input for deterministic transfer-turnover simulation. */
export interface SimulateTransferTurnoverInput {
  /** Durable career state before turnover is applied. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive movement choices. */
  readonly worldSeed: string;
  /** Season ID being closed by this turnover pass. */
  readonly seasonId: SeasonId;
  /** Optional move cap. Defaults to roughly one move per four clubs. */
  readonly maxMoves?: number;
}

/** Result of deterministic transfer turnover. */
export interface SimulateTransferTurnoverResult {
  /** Copied career state with roster ownership updated. */
  readonly careerState: CareerState;
  /** Factual movements applied by the turnover pass. */
  readonly transfers: readonly TransferTurnoverRecord[];
}

/**
 * Applies a tiny deterministic inter-club turnover pass.
 *
 * This is not the market system. It has no fees, contracts, negotiations,
 * wages, or loans. It only gives the long-run world some believable movement
 * while preserving roster ownership validity.
 */
export function simulateTransferTurnover(input: SimulateTransferTurnoverInput): SimulateTransferTurnoverResult {
  const maxMoves = input.maxMoves ?? Math.max(1, Math.floor(input.careerState.gameState.clubIds.length / 4));
  const clubs: Partial<Record<Club["id"], Club>> = {};
  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.careerState.gameState.clubs[clubId];
    if (club !== undefined) {
      clubs[clubId] = { ...club, playerIds: [...club.playerIds] };
    }
  }

  const transfers: TransferTurnoverRecord[] = [];
  for (const toClubId of shuffledClubIds(input.careerState.gameState.clubIds, input.worldSeed, input.seasonId)) {
    if (transfers.length >= maxMoves) {
      break;
    }

    const toClub = clubs[toClubId];
    if (toClub === undefined) {
      continue;
    }

    const neededGroup = weakestPositionGroup(toClub, input.careerState.gameState.players);
    const fromClub = findSourceClub({
      clubs,
      toClub,
      neededGroup,
      careerState: input.careerState,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
    });
    if (fromClub === undefined) {
      continue;
    }

    const candidate = findMovablePlayer({
      fromClub,
      toClub,
      neededGroup,
      careerState: input.careerState,
    });
    if (candidate === undefined) {
      continue;
    }

    clubs[fromClub.id] = {
      ...fromClub,
      playerIds: fromClub.playerIds.filter((playerId) => playerId !== candidate.id),
    };
    clubs[toClub.id] = {
      ...toClub,
      playerIds: [...toClub.playerIds, candidate.id],
    };
    transfers.push({
      playerId: candidate.id,
      fromClubId: fromClub.id,
      toClubId: toClub.id,
      positionGroup: positionGroup(candidate.naturalPositions[0]),
      currentAbilityAverage: roundAverage(turnoverCurrentAbility(candidate)),
    });
  }

  return {
    careerState: createCareerState({
      ...input.careerState,
      gameState: {
        ...input.careerState.gameState,
        clubs: clubs as CareerState["gameState"]["clubs"],
      },
    }),
    transfers,
  };
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
  readonly clubs: Partial<Record<Club["id"], Club>>;
  readonly toClub: Club;
  readonly neededGroup: BroadPositionGroup;
  readonly careerState: CareerState;
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
}

function findSourceClub(input: FindSourceClubInput): Club | undefined {
  const candidates: Club[] = [];
  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.clubs[clubId];
    if (club === undefined || club.id === input.toClub.id || club.playerIds.length <= MINIMUM_CAREER_SQUAD_SIZE + 1) {
      continue;
    }

    if (findMovablePlayer({ fromClub: club, toClub: input.toClub, neededGroup: input.neededGroup, careerState: input.careerState }) !== undefined) {
      candidates.push(club);
    }
  }

  if (candidates.length === 0) {
    return undefined;
  }

  const rng = deriveRng(input.worldSeed, "career-transfer-turnover-source", input.seasonId, input.toClub.id, input.neededGroup);
  return candidates[rng.nextInt(0, candidates.length)];
}

interface FindMovablePlayerInput {
  readonly fromClub: Club;
  readonly toClub: Club;
  readonly neededGroup: BroadPositionGroup;
  readonly careerState: CareerState;
}

function findMovablePlayer(input: FindMovablePlayerInput): Player | undefined {
  for (const playerId of input.fromClub.playerIds) {
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined || positionGroup(player.naturalPositions[0]) !== input.neededGroup) {
      continue;
    }

    if (!canSourceClubLosePlayer(input.fromClub, player, input.careerState)) {
      continue;
    }

    if (!playerAcceptsMove(player, input.fromClub, input.toClub)) {
      continue;
    }

    return player;
  }

  return undefined;
}

function canSourceClubLosePlayer(fromClub: Club, player: Player, careerState: CareerState): boolean {
  if (fromClub.playerIds.length <= MINIMUM_CAREER_SQUAD_SIZE + 1) {
    return false;
  }

  if (positionGroup(player.naturalPositions[0]) !== "goalkeeper") {
    return true;
  }

  let goalkeepers = 0;
  for (const playerId of fromClub.playerIds) {
    const clubPlayer = careerState.gameState.players[playerId];
    if (clubPlayer !== undefined && positionGroup(clubPlayer.naturalPositions[0]) === "goalkeeper") {
      goalkeepers += 1;
    }
  }

  return goalkeepers > 2;
}

function playerAcceptsMove(player: Player, fromClub: Club, toClub: Club): boolean {
  const abilityAverage = turnoverCurrentAbility(player);
  const reputationDrop = fromClub.reputation - toClub.reputation;
  const categoryDrop = categoryLevel(fromClub.category) - categoryLevel(toClub.category);

  if (abilityAverage >= 12 && (reputationDrop >= 2 || categoryDrop >= 1)) {
    return false;
  }

  if (abilityAverage >= 10 && reputationDrop >= 4) {
    return false;
  }

  return true;
}

function weakestPositionGroup(club: Club, players: CareerState["gameState"]["players"]): BroadPositionGroup {
  const counts = { goalkeeper: 0, defender: 0, midfielder: 0, attacker: 0 };

  for (const playerId of club.playerIds) {
    const player = players[playerId];
    if (player !== undefined) {
      counts[positionGroup(player.naturalPositions[0])] += 1;
    }
  }

  if (counts.goalkeeper < 2) return "goalkeeper";
  if (counts.defender < 6) return "defender";
  if (counts.midfielder < 6) return "midfielder";
  if (counts.attacker < 3) return "attacker";

  if (counts.defender <= counts.midfielder && counts.defender <= counts.attacker) return "defender";
  if (counts.midfielder <= counts.attacker) return "midfielder";
  return "attacker";
}

function positionGroup(position: PlayerPosition | undefined): BroadPositionGroup {
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

function categoryLevel(category: Club["category"]): number {
  switch (category) {
    case "first_division":
      return 3;
    case "second_division":
      return 2;
    case "third_division":
      return 1;
  }
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
