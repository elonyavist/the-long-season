import {
  getPlayerRoleProfile,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  rolePotentialAbility,
  createCareerState,
  type CareerState,
  type Club,
  type ClubId,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type Player,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type SeniorSquadState,
  type YouthAcademyState,
} from "@game/domain";

import { applyContractActivationFinance } from "./career-finance-lifecycle.ts";
import { evaluateCareerContractCapacity } from "./career-contract-capacity.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import { prepareSeniorSquadSigning } from "./senior-squad-transfer.ts";

/** Phase 32 senior squad target upper bound. */
export const YOUTH_PROMOTION_SENIOR_TARGET_SIZE = 25;

/** Input for promoting explicit youth candidates into senior squads. */
export interface PromoteYouthCandidatesInput {
  /** Durable career state before promotions are applied. */
  readonly careerState: CareerState;
  /** Explicit wage policy used by every promoted player's terms and capacity. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Exact version-selected reserve and affordability policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  /** Whether the selected club can be automated by a lab/report command. */
  readonly allowSelectedClubPromotion?: boolean;
  /** Optional senior roster target. Defaults to Phase 32 target `25`. */
  readonly seniorTargetSize?: number;
  /** Date used for the new senior registration, contract, and history facts. */
  readonly occurredOn?: GameDate;
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
  | "not_useful_enough"
  | "contract_unaffordable";

/** Result of one youth-to-senior promotion pass. */
export interface PromoteYouthCandidatesResult {
  /** Copied career state after explicit promotions. */
  readonly careerState: CareerState;
  /** Factual promotion records in deterministic order. */
  readonly records: readonly YouthPromotionRecord[];
}

/**
 * Promotes explicit youth candidates through the canonical senior lifecycle.
 *
 * Every accepted promotion adds ownership, registration, professional terms,
 * annual wage commitment, signing cost, contract history, and youth history in
 * one valid career snapshot. The selected club remains protected by default.
 */
export function promoteYouthCandidatesToSeniorSquads(input: PromoteYouthCandidatesInput): PromoteYouthCandidatesResult {
  const youthState = input.careerState.youthAcademyState;
  if (youthState === undefined) return { careerState: input.careerState, records: [] };
  if (input.careerState.seniorSquadState === undefined || input.careerState.clubFinanceState === undefined) {
    throw new Error("Youth promotion requires canonical senior-squad and club-finance state");
  }

  const seniorTargetSize = input.seniorTargetSize ?? YOUTH_PROMOTION_SENIOR_TARGET_SIZE;
  const records: YouthPromotionRecord[] = [];
  const activePlayerIds = new Set(input.careerState.gameState.playerIds);
  let careerState = input.careerState;

  for (const clubId of input.careerState.gameState.clubIds) {
    const candidates = promotionCandidatesForClub(
      input.careerState,
      youthState,
      clubId,
      activePlayerIds,
    );
    for (const player of candidates) {
      const club = careerState.gameState.clubs[clubId];
      if (club === undefined) continue;
      const reason = promotionReason({
        careerState,
        club,
        player,
        seniorTargetSize,
        allowSelectedClubPromotion: input.allowSelectedClubPromotion ?? false,
      });
      if (reason !== "promoted") {
        records.push({ clubId, playerId: player.id, promoted: false, reason });
        continue;
      }

      const promoted = promoteCandidate(
        careerState,
        clubId,
        player,
        input.occurredOn ?? careerState.gameState.calendar.currentDate,
        input.wagePolicy,
        input.marketBehaviorPolicy,
      );
      if (promoted === undefined) {
        records.push({
          clubId,
          playerId: player.id,
          promoted: false,
          reason: "contract_unaffordable",
        });
        continue;
      }
      careerState = promoted;
      records.push({ clubId, playerId: player.id, promoted: true, reason: "promoted" });
    }
  }

  return { careerState, records };
}

function promoteCandidate(
  careerState: CareerState,
  clubId: ClubId,
  player: Player,
  occurredOn: GameDate,
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): CareerState | undefined {
  const seniorSquadState = requiredSeniorState(careerState);
  const demand = deriveContractDemand({
    careerState,
    wagePolicy,
    playerId: player.id,
    clubId,
    evaluatedOn: occurredOn,
    isFreeAgent: true,
  });
  const capacity = evaluateCareerContractCapacity({
    careerState,
    clubId,
    wagePolicy,
    marketBehaviorPolicy,
    addedAnnualWage: demand.minimumTerms.annualWage,
    addedSigningBonus: demand.minimumTerms.bonuses.signingBonus,
  });
  if (capacity.status === "unaffordable") return undefined;

  const signing = prepareSeniorSquadSigning({
    gameState: careerState.gameState,
    seniorSquadState,
    playerId: player.id,
    clubId,
    occurredOn,
    transitionSequence: nextOwnershipTransitionSequence(seniorSquadState),
    acceptedTerms: demand.minimumTerms,
    preferredShirtNumber: preferredShirtNumber(player),
  });
  const youthAcademyState = markYouthPromoted(
    requiredYouthState(careerState),
    clubId,
    player.id,
    occurredOn,
  );
  const activated = applyContractActivationFinance({
    careerState,
    proposedGameState: signing.gameState,
    seniorSquadState: signing.seniorSquadState,
    activatedContractIds: [signing.activatedContractId],
    occurredOn,
  });
  return activated.status === "applied"
    ? createCareerState({ ...activated.careerState, youthAcademyState })
    : undefined;
}

function markYouthPromoted(
  state: YouthAcademyState,
  clubId: ClubId,
  playerId: PlayerId,
  occurredOn: CareerState["gameState"]["calendar"]["currentDate"],
): YouthAcademyState {
  const lifecycle = state.playerLifecycle[playerId];
  if (lifecycle === undefined || lifecycle.clubId !== clubId) {
    throw new Error(`Youth lifecycle not found for promoted player: ${playerId}`);
  }
  const clubRoster = state.clubRosters[clubId];
  return {
    ...state,
    clubRosters: clubRoster === undefined
      ? state.clubRosters
      : {
          ...state.clubRosters,
          [clubId]: {
            ...clubRoster,
            playerIds: clubRoster.playerIds.filter((candidateId) => candidateId !== playerId),
          },
        },
    playerLifecycle: {
      ...state.playerLifecycle,
      [playerId]: {
        ...lifecycle,
        status: "promoted",
        statusChangedAt: occurredOn,
      },
    },
  };
}

function promotionCandidatesForClub(
  careerState: CareerState,
  youthState: YouthAcademyState,
  clubId: ClubId,
  activePlayerIds: ReadonlySet<PlayerId>,
): readonly Player[] {
  const candidates: Player[] = [];
  for (const playerId of youthState.playerLifecycleIds) {
    const lifecycle = youthState.playerLifecycle[playerId];
    if (lifecycle?.clubId !== clubId || lifecycle.status !== "promotion_candidate") continue;
    if (!activePlayerIds.has(playerId) || careerState.gameState.playerStates[playerId] === undefined) continue;
    const player = careerState.gameState.players[playerId];
    if (player !== undefined) candidates.push(player);
  }
  return candidates;
}

function promotionReason(input: {
  readonly careerState: CareerState;
  readonly club: Club;
  readonly player: Player;
  readonly seniorTargetSize: number;
  readonly allowSelectedClubPromotion: boolean;
}): YouthPromotionReason {
  if (input.club.id === input.careerState.selectedClubId && !input.allowSelectedClubPromotion) {
    return "selected_club_protected";
  }
  if (input.club.playerIds.length >= input.seniorTargetSize) return "senior_squad_full";
  if (!isUsefulPromotionCandidate(input.player)) return "not_useful_enough";
  return "promoted";
}

function isUsefulPromotionCandidate(player: Player): boolean {
  const ability = youthPromotionAbility(player);
  return ability.current >= 7.4 || ability.potentialRoom >= 3.5;
}

/** Returns the football measures needed only by senior-promotion decisions. */
function youthPromotionAbility(player: Player): { readonly current: number; readonly potentialRoom: number } {
  if (player.primaryRole === undefined) {
    const current = Number(rawDiagnosticAbilityAverage(player.abilities));
    const potential = Number(rawDiagnosticAbilityAverage(player.potential));
    return { current, potentialRoom: potential - current };
  }
  const profile = getPlayerRoleProfile(player.primaryRole);
  const current = Number(roleCurrentAbility(player.abilities, profile));
  const potential = Number(rolePotentialAbility(player.potential, profile));
  return { current, potentialRoom: potential - current };
}

function nextOwnershipTransitionSequence(state: SeniorSquadState): number {
  return state.contractHistoryEntryIds.length + 1;
}

function preferredShirtNumber(player: Player): number {
  switch (player.primaryRole) {
    case "goalkeeper": return 1;
    case "center_back": return 5;
    case "full_back": return 2;
    case "wing_back": return 3;
    case "defensive_midfielder": return 6;
    case "central_midfielder": return 8;
    case "attacking_midfielder": return 10;
    case "wide_midfielder": return 7;
    case "winger": return 11;
    case "striker": return 9;
    default: return 1;
  }
}

function requiredSeniorState(careerState: CareerState): SeniorSquadState {
  if (careerState.seniorSquadState === undefined) throw new Error("Senior squad state is required");
  return careerState.seniorSquadState;
}

function requiredYouthState(careerState: CareerState): YouthAcademyState {
  if (careerState.youthAcademyState === undefined) throw new Error("Youth academy state is required");
  return careerState.youthAcademyState;
}
