import {
  createCareerState,
  type CareerState,
  type ClubId,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type SeasonId,
  type YouthAcademyClubRoster,
  type YouthAcademyState,
  type YouthPlayerLifecycle,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import { developPlayersForSeason, type PlayerDevelopmentChange } from "./player-development.ts";

const DAYS_PER_YEAR = 365;

/** Youth lifecycle outcome emitted when a player leaves the active academy. */
export type YouthLifecycleOutcome = "promotion_candidate" | "external_move_candidate" | "released";

/** Input for applying one end-of-season youth academy lifecycle pass. */
export interface YouthAcademyLifecycleInput {
  /** Durable career state before youth lifecycle processing. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive lifecycle decisions. */
  readonly worldSeed: string;
  /** Season ID being processed. */
  readonly seasonId: SeasonId;
}

/** Factual youth lifecycle record for reports. */
export interface YouthLifecycleRecord {
  /** Club whose academy held the player before this lifecycle decision. */
  readonly clubId: ClubId;
  /** Player affected by this lifecycle decision. */
  readonly playerId: PlayerId;
  /** Age in whole years at the career state's current date. */
  readonly age: number;
  /** Outcome applied at this lifecycle pass. */
  readonly outcome: YouthLifecycleOutcome;
}

/** Result of one youth academy lifecycle pass. */
export interface YouthAcademyLifecycleResult {
  /** Copied career state after youth development and age-out decisions. */
  readonly careerState: CareerState;
  /** Development summaries for active youth players only. */
  readonly developmentChanges: readonly PlayerDevelopmentChange[];
  /** Factual records for youth players removed from active academy rosters. */
  readonly records: readonly YouthLifecycleRecord[];
}

/**
 * Develops active youth players and resolves age-out decisions.
 *
 * Senior rosters are not changed. Released/external-move youth leave the active
 * world immediately; promotion candidates remain in the world but outside the
 * active academy roster for the next promotion step.
 */
export function applyYouthAcademyLifecycle(input: YouthAcademyLifecycleInput): YouthAcademyLifecycleResult {
  const youthState = input.careerState.youthAcademyState;
  if (youthState === undefined) {
    return {
      careerState: input.careerState,
      developmentChanges: [],
      records: [],
    };
  }

  const activeYouthPlayerIds = activeYouthIds(youthState);
  const developed = developPlayersForSeason({
    careerState: input.careerState,
    worldSeed: input.worldSeed,
    seasonId: input.seasonId,
    playerIds: activeYouthPlayerIds,
  });
  const players: Partial<Record<PlayerId, Player>> = { ...developed.careerState.gameState.players };
  const playerStates: Partial<Record<PlayerId, PlayerDynamicState>> = { ...developed.careerState.gameState.playerStates };
  const playerIds = [...developed.careerState.gameState.playerIds];
  const clubRosters: Record<ClubId, YouthAcademyClubRoster> = {};
  const clubRosterIds: ClubId[] = [];
  const playerLifecycle: Record<PlayerId, YouthPlayerLifecycle> = {};
  const playerLifecycleIds: PlayerId[] = [];
  const records: YouthLifecycleRecord[] = [];
  const removedPlayerIds = new Set<PlayerId>();

  for (const clubId of developed.careerState.gameState.clubIds) {
    const roster = youthState.clubRosters[clubId];
    const nextRosterPlayerIds: PlayerId[] = [];

    for (const playerId of roster?.playerIds ?? []) {
      const player = developed.careerState.gameState.players[playerId];
      if (player === undefined) {
        continue;
      }

      const age = playerAgeYears(player, developed.careerState);
      if (age <= 19) {
        nextRosterPlayerIds.push(playerId);
        playerLifecycle[playerId] = {
          ...requiredLifecycle(youthState, playerId),
          status: "academy",
        };
        playerLifecycleIds.push(playerId);
        continue;
      }

      const outcome = ageOutOutcome({
        worldSeed: input.worldSeed,
        seasonId: input.seasonId,
        player,
        age,
      });
      records.push({
        clubId,
        playerId,
        age,
        outcome,
      });

      if (outcome === "promotion_candidate") {
        playerLifecycle[playerId] = {
          ...requiredLifecycle(youthState, playerId),
          status: "promotion_candidate",
          statusChangedAt: developed.careerState.gameState.calendar.currentDate,
        };
        playerLifecycleIds.push(playerId);
      } else {
        removedPlayerIds.add(playerId);
        delete players[playerId];
        delete playerStates[playerId];
      }
    }

    clubRosters[clubId] = {
      clubId,
      playerIds: nextRosterPlayerIds,
    };
    clubRosterIds.push(clubId);
  }

  preserveNonRosterLifecycleRows({
    youthState,
    currentCareerState: developed.careerState,
    playerLifecycle,
    playerLifecycleIds,
    removedPlayerIds,
  });

  const nextPlayerIds = playerIds.filter((playerId) => !removedPlayerIds.has(playerId));
  const nextYouthState: YouthAcademyState = {
    clubRosters,
    clubRosterIds,
    playerLifecycle,
    playerLifecycleIds,
  };

  return {
    careerState: createCareerState({
      ...developed.careerState,
      gameState: {
        ...developed.careerState.gameState,
        players: players as CareerState["gameState"]["players"],
        playerIds: nextPlayerIds,
        playerStates: playerStates as CareerState["gameState"]["playerStates"],
      },
      youthAcademyState: nextYouthState,
    }),
    developmentChanges: developed.changes,
    records,
  };
}

function activeYouthIds(youthState: YouthAcademyState): readonly PlayerId[] {
  const playerIds: PlayerId[] = [];

  for (const clubId of youthState.clubRosterIds) {
    const roster = youthState.clubRosters[clubId];
    if (roster === undefined) {
      continue;
    }

    for (const playerId of roster.playerIds) {
      playerIds.push(playerId);
    }
  }

  return playerIds;
}

function preserveNonRosterLifecycleRows(input: {
  readonly youthState: YouthAcademyState;
  readonly currentCareerState: CareerState;
  readonly playerLifecycle: Record<PlayerId, YouthPlayerLifecycle>;
  readonly playerLifecycleIds: PlayerId[];
  readonly removedPlayerIds: ReadonlySet<PlayerId>;
}): void {
  const seen = new Set<PlayerId>(input.playerLifecycleIds);

  for (const playerId of input.youthState.playerLifecycleIds) {
    if (seen.has(playerId) || input.removedPlayerIds.has(playerId)) {
      continue;
    }

    const lifecycle = input.youthState.playerLifecycle[playerId];
    if (lifecycle === undefined || lifecycle.status === "academy" || input.currentCareerState.gameState.players[playerId] === undefined) {
      continue;
    }

    input.playerLifecycle[playerId] = { ...lifecycle };
    input.playerLifecycleIds.push(playerId);
    seen.add(playerId);
  }
}

function requiredLifecycle(youthState: YouthAcademyState, playerId: PlayerId): YouthPlayerLifecycle {
  const lifecycle = youthState.playerLifecycle[playerId];
  if (lifecycle === undefined) {
    throw new Error(`Missing youth lifecycle row: ${playerId}`);
  }

  return lifecycle;
}

function ageOutOutcome(input: {
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly player: Player;
  readonly age: number;
}): YouthLifecycleOutcome {
  const rng = deriveRng(input.worldSeed, "youth-age-out", input.seasonId, input.player.id);
  const currentAverage = averageAbilities(input.player.abilities);
  const potentialAverage = averageAbilities(input.player.potential);
  const potentialRoom = potentialAverage - currentAverage;

  if (currentAverage >= 8.8 || potentialRoom >= 4.5) {
    return "promotion_candidate";
  }

  if (currentAverage >= 7.4 && rng.nextFloat() < 0.35) {
    return "external_move_candidate";
  }

  return "released";
}

function playerAgeYears(player: Player, careerState: CareerState): number {
  return Math.floor((careerState.gameState.calendar.currentDate - player.birthDate) / DAYS_PER_YEAR);
}

function averageAbilities(abilities: Player["abilities"]): number {
  let total = 0;

  total += abilities.technical.finishing;
  total += abilities.technical.passing;
  total += abilities.technical.longPassing;
  total += abilities.technical.crossing;
  total += abilities.technical.dribbling;
  total += abilities.technical.technique;
  total += abilities.technical.tackling;
  total += abilities.technical.penalties;
  total += abilities.technical.freeKicks;
  total += abilities.physical.pace;
  total += abilities.physical.strength;
  total += abilities.physical.stamina;
  total += abilities.physical.agility;
  total += abilities.physical.heading;
  total += abilities.mental.positioning;
  total += abilities.mental.vision;
  total += abilities.mental.anticipation;
  total += abilities.mental.composure;
  total += abilities.mental.determination;
  total += abilities.mental.leadership;
  total += abilities.goalkeeping.reflexes;
  total += abilities.goalkeeping.handling;
  total += abilities.goalkeeping.rushingOut;
  total += abilities.goalkeeping.goalkeeperPositioning;
  total += abilities.goalkeeping.footwork;

  return total / 25;
}
