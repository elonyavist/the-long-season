import {
  createCareerState,
  type CareerState,
  type Club,
  type ClubId,
  type Player,
  type PlayerId,
  type YouthAcademyClubRoster,
  type YouthAcademyState,
  type YouthPlayerLifecycle,
} from "@game/domain";

/** Phase 32 senior squad target upper bound. */
export const YOUTH_PROMOTION_SENIOR_TARGET_SIZE = 25;

/** Input for promoting explicit youth candidates into senior squads. */
export interface PromoteYouthCandidatesInput {
  /** Durable career state before promotions are applied. */
  readonly careerState: CareerState;
  /** Whether the selected club can be automated by a lab/report command. */
  readonly allowSelectedClubPromotion?: boolean;
  /** Optional senior roster target. Defaults to Phase 32 target `25`. */
  readonly seniorTargetSize?: number;
}

/** Factual youth promotion record for reports. */
export interface YouthPromotionRecord {
  /** Club evaluated for promotion. */
  readonly clubId: ClubId;
  /** Candidate player evaluated. */
  readonly playerId: PlayerId;
  /** Whether this candidate entered the senior squad. */
  readonly promoted: boolean;
  /** Factual reason for the result. */
  readonly reason: YouthPromotionReason;
}

/** Stable machine-readable promotion result reason. */
export type YouthPromotionReason =
  | "promoted"
  | "selected_club_protected"
  | "senior_squad_full"
  | "not_useful_enough";

/** Result of one youth-to-senior promotion pass. */
export interface PromoteYouthCandidatesResult {
  /** Copied career state after explicit promotions. */
  readonly careerState: CareerState;
  /** Factual promotion records in deterministic order. */
  readonly records: readonly YouthPromotionRecord[];
}

/**
 * Promotes explicit youth candidates into senior squads when there is room.
 *
 * This function does not choose a user lineup or tactic. The selected club is
 * protected by default; long-run lab commands can opt in explicitly.
 */
export function promoteYouthCandidatesToSeniorSquads(input: PromoteYouthCandidatesInput): PromoteYouthCandidatesResult {
  const youthState = input.careerState.youthAcademyState;
  if (youthState === undefined) {
    return {
      careerState: input.careerState,
      records: [],
    };
  }

  const seniorTargetSize = input.seniorTargetSize ?? YOUTH_PROMOTION_SENIOR_TARGET_SIZE;
  const clubs: Partial<Record<ClubId, Club>> = {};
  const clubRosters: Record<ClubId, YouthAcademyClubRoster> = {};
  const clubRosterIds: ClubId[] = [];
  const playerLifecycle: Record<PlayerId, YouthPlayerLifecycle> = {};
  const playerLifecycleIds: PlayerId[] = [];
  const records: YouthPromotionRecord[] = [];
  const promotedPlayerIds = new Set<PlayerId>();

  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    const nextClubPlayerIds = [...club.playerIds];
    const candidates = promotionCandidatesForClub(input.careerState, youthState, clubId);

    for (const candidate of candidates) {
      const reason = promotionReason({
        careerState: input.careerState,
        club,
        player: candidate.player,
        currentSeniorSize: nextClubPlayerIds.length,
        seniorTargetSize,
        allowSelectedClubPromotion: input.allowSelectedClubPromotion ?? false,
      });

      if (reason === "promoted") {
        nextClubPlayerIds.push(candidate.player.id);
        promotedPlayerIds.add(candidate.player.id);
        records.push({
          clubId,
          playerId: candidate.player.id,
          promoted: true,
          reason,
        });
      } else {
        records.push({
          clubId,
          playerId: candidate.player.id,
          promoted: false,
          reason,
        });
      }
    }

    clubs[clubId] = {
      ...club,
      playerIds: nextClubPlayerIds,
    };

    const activeRoster = youthState.clubRosters[clubId];
    clubRosters[clubId] = {
      clubId,
      playerIds: [...(activeRoster?.playerIds ?? [])],
    };
    clubRosterIds.push(clubId);
  }

  for (const playerId of youthState.playerLifecycleIds) {
    if (promotedPlayerIds.has(playerId)) {
      continue;
    }

    const lifecycle = youthState.playerLifecycle[playerId];
    if (lifecycle === undefined) {
      continue;
    }

    playerLifecycle[playerId] = { ...lifecycle };
    playerLifecycleIds.push(playerId);
  }

  const nextYouthState: YouthAcademyState = {
    clubRosters,
    clubRosterIds,
    playerLifecycle,
    playerLifecycleIds,
  };

  return {
    careerState: createCareerState({
      ...input.careerState,
      gameState: {
        ...input.careerState.gameState,
        clubs: clubs as CareerState["gameState"]["clubs"],
      },
      youthAcademyState: nextYouthState,
    }),
    records,
  };
}

function promotionCandidatesForClub(
  careerState: CareerState,
  youthState: YouthAcademyState,
  clubId: ClubId,
): readonly { readonly player: Player }[] {
  const candidates: { readonly player: Player }[] = [];

  for (const playerId of youthState.playerLifecycleIds) {
    const lifecycle = youthState.playerLifecycle[playerId];
    if (lifecycle === undefined || lifecycle.clubId !== clubId || lifecycle.status !== "promotion_candidate") {
      continue;
    }

    const player = careerState.gameState.players[playerId];
    if (player !== undefined) {
      candidates.push({ player });
    }
  }

  return candidates;
}

function promotionReason(input: {
  readonly careerState: CareerState;
  readonly club: Club;
  readonly player: Player;
  readonly currentSeniorSize: number;
  readonly seniorTargetSize: number;
  readonly allowSelectedClubPromotion: boolean;
}): YouthPromotionReason {
  if (input.club.id === input.careerState.selectedClubId && !input.allowSelectedClubPromotion) {
    return "selected_club_protected";
  }

  if (input.currentSeniorSize >= input.seniorTargetSize) {
    return "senior_squad_full";
  }

  if (!isUsefulPromotionCandidate(input.player)) {
    return "not_useful_enough";
  }

  return "promoted";
}

function isUsefulPromotionCandidate(player: Player): boolean {
  const currentAverage = averageAbilities(player.abilities);
  const potentialAverage = averageAbilities(player.potential);

  return currentAverage >= 7.4 || potentialAverage - currentAverage >= 3.5;
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
