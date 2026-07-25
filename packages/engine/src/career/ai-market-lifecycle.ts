import {
  isLivePreliminaryAgreement,
  isOpenTransferNegotiation,
  playerSquadDepartment,
  transferNegotiationId,
  type CareerState,
  type Club,
  type ClubId,
  type GameDate,
  type Money,
  type Player,
  type PlayerContract,
  type PlayerId,
  type PlayerSquadDepartment,
  type PreliminaryAgreement,
  type SeasonTransferWindows,
  type TransferNegotiation,
  type TransferNegotiationId,
} from "@game/domain";

import {
  DEFAULT_PLAYER_VALUATION_CONFIG,
  derivePlayerMarketAbility,
  derivePlayerValuation,
} from "../market/player-valuation.ts";
import { evaluateCareerContractCapacity } from "./career-contract-capacity.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import {
  acceptPreliminaryAgreementCounter,
  advancePreliminaryAgreementLifecycle,
  createPreliminaryAgreementId,
  rejectPreliminaryAgreementCounter,
  submitPreliminaryAgreementOffer,
} from "./preliminary-agreement.ts";
import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  MINIMUM_CAREER_SQUAD_SIZE,
  TARGET_CAREER_SQUAD_SIZE,
} from "./squad-maintenance.ts";
import {
  acceptTransferCounter,
  advanceTransferNegotiations,
  deriveSellerTransferWillingness,
  submitTransferOffer,
  withdrawTransferNegotiation,
} from "./transfer-negotiation.ts";
import {
  acceptTransferPlayerCounter,
  advanceTransferPlayerNegotiations,
  rejectTransferPlayerCounter,
  submitTransferPlayerOffer,
} from "./transfer-player-negotiation.ts";

const MAX_ACTIVE_AI_MARKET_TALKS = 2;
const MAX_AI_MARKET_STARTS_PER_SEASON = 6;
const MAX_AI_PRELIMINARY_STARTS_PER_SEASON = 4;
const PERMANENT_MARKET_CHECKPOINT_DAYS = 3;
const PRELIMINARY_MARKET_CHECKPOINT_DAYS = 14;
const PRELIMINARY_AGREEMENT_DAYS = 183;

const TARGET_DEPARTMENT_DEPTH: Readonly<Record<PlayerSquadDepartment, number>> = {
  goalkeeper: 2,
  defender: 7,
  midfielder: 7,
  attacker: 4,
};

/** Stable football reason behind one AI recruitment need. */
export type AiMarketNeedReason =
  | "structural_depth"
  | "expiring_contracts"
  | "aging_department"
  | "quality_gap";

/** Deterministic recruitment need derived from current squad and finance facts. */
export interface AiMarketNeed {
  readonly clubId: ClubId;
  readonly department: PlayerSquadDepartment;
  readonly reasons: readonly AiMarketNeedReason[];
  readonly priority: number;
  readonly currentDepth: number;
  readonly targetDepth: number;
  readonly averageAge: number;
  readonly averageAbility: number;
  readonly expiringContractCount: number;
  readonly wageLoadRatio: number;
  readonly canRecruit: boolean;
}

/** One non-blocking structured market history fact emitted by the AI policy. */
export interface AiMarketLifecycleFact {
  readonly occurredOn: GameDate;
  readonly event:
    | "club_offer_submitted"
    | "club_offer_countered"
    | "club_offer_accepted"
    | "club_offer_rejected"
    | "club_offer_expired"
    | "club_offer_withdrawn"
    | "player_terms_submitted"
    | "player_terms_countered"
    | "player_counter_accepted"
    | "player_counter_rejected"
    | "player_terms_rejected"
    | "transfer_completed"
    | "transfer_failed"
    | "preliminary_offer_submitted"
    | "preliminary_counter_accepted"
    | "preliminary_counter_rejected"
    | "preliminary_agreed"
    | "preliminary_activated";
  readonly buyingClubId: ClubId;
  readonly sellingClubId?: ClubId;
  readonly playerId: PlayerId;
  readonly negotiationId: string;
  readonly reason?: string;
}

/** Result of advancing the deterministic AI market client. */
export interface AdvanceAiMarketLifecycleResult {
  readonly careerState: CareerState;
  readonly facts: readonly AiMarketLifecycleFact[];
  readonly needs: readonly AiMarketNeed[];
}

/**
 * Derives ordered AI recruitment needs without mutating the career.
 *
 * Structural depth dominates quality and age concerns. Wage pressure does not
 * create a hidden sale policy: it only prevents new commitments until the club
 * has real annual-wage room again.
 */
export function deriveAiMarketNeeds(input: {
  readonly careerState: CareerState;
  readonly asOf: GameDate;
}): readonly AiMarketNeed[] {
  const contracts = activeContractsByPlayer(input.careerState);
  const needs: AiMarketNeed[] = [];

  for (const clubId of [...input.careerState.gameState.clubIds].sort()) {
    if (clubId === input.careerState.selectedClubId) continue;
    const club = input.careerState.gameState.clubs[clubId];
    const account = input.careerState.clubFinanceState?.accounts[clubId];
    if (club === undefined || account === undefined) continue;

    const squadAbility = average(
      club.playerIds.flatMap((playerId) => {
        const player = input.careerState.gameState.players[playerId];
        return player === undefined ? [] : [derivePlayerMarketAbility(player).currentAbility];
      }),
    );
    const wageLoadRatio = account.annualWageBudget <= 0
      ? 1
      : account.committedAnnualWage / account.annualWageBudget;

    for (const department of departmentOrder()) {
      const players = club.playerIds.flatMap((playerId): readonly Player[] => {
        const player = input.careerState.gameState.players[playerId];
        return player !== undefined && playerSquadDepartment(player) === department ? [player] : [];
      });
      const expiringContractCount = players.filter((player) => {
        const contract = contracts.get(player.id);
        return contract !== undefined
          && contract.endsOn > input.asOf
          && contract.endsOn - input.asOf <= 365;
      }).length;
      const averageAge = average(players.map((player) => playerAge(player, input.asOf)));
      const averageAbility = average(
        players.map((player) => derivePlayerMarketAbility(player).currentAbility),
      );
      const reasons: AiMarketNeedReason[] = [];
      if (players.length < MINIMUM_CAREER_DEPARTMENT_DEPTH[department]) {
        reasons.push("structural_depth");
      }
      if (expiringContractCount > 0 && players.length - expiringContractCount < TARGET_DEPARTMENT_DEPTH[department]) {
        reasons.push("expiring_contracts");
      }
      const agingThreshold = department === "goalkeeper" ? 33 : 30;
      if (players.length > 0 && averageAge >= agingThreshold) reasons.push("aging_department");
      if (players.length > 0 && averageAbility + 0.75 < squadAbility) reasons.push("quality_gap");
      if (reasons.length === 0) continue;

      const structuralDeficit = Math.max(
        0,
        MINIMUM_CAREER_DEPARTMENT_DEPTH[department] - players.length,
      );
      const targetDeficit = Math.max(0, TARGET_DEPARTMENT_DEPTH[department] - players.length);
      const priority =
        structuralDeficit * 100
        + targetDeficit * 12
        + expiringContractCount * 20
        + (reasons.includes("aging_department") ? 8 : 0)
        + (reasons.includes("quality_gap") ? 6 : 0);
      needs.push({
        clubId,
        department,
        reasons,
        priority,
        currentDepth: players.length,
        targetDepth: TARGET_DEPARTMENT_DEPTH[department],
        averageAge: round(averageAge),
        averageAbility: round(averageAbility),
        expiringContractCount,
        wageLoadRatio: round(wageLoadRatio),
        canRecruit:
          club.playerIds.length < TARGET_CAREER_SQUAD_SIZE + 3
          && wageLoadRatio < 1
          && account.cashBalance > 0
          && account.availableTransferBudget > 0,
      });
    }
  }

  return needs.sort((left, right) =>
    right.priority - left.priority
    || String(left.clubId).localeCompare(String(right.clubId))
    || departmentOrder().indexOf(left.department) - departmentOrder().indexOf(right.department),
  );
}

/**
 * Advances AI transfer and preliminary-agreement decisions through real commands.
 *
 * The manager-selected club is protected on both sides of every AI decision.
 * The policy never mutates ownership, contracts, or finance directly; accepted
 * deals reach the existing atomic transfer and preliminary activation boundaries.
 */
export function advanceAiMarketLifecycle(input: {
  readonly careerState: CareerState;
  readonly fromDate: GameDate;
  readonly throughDate: GameDate;
  readonly transferWindows: SeasonTransferWindows;
}): AdvanceAiMarketLifecycleResult {
  if (
    input.throughDate <= input.fromDate
    || input.careerState.seniorSquadState === undefined
    || input.careerState.clubFinanceState === undefined
  ) {
    return {
      careerState: input.careerState,
      facts: [],
      needs: deriveAiMarketNeeds({ careerState: input.careerState, asOf: input.throughDate }),
    };
  }

  let careerState = input.careerState;
  const facts: AiMarketLifecycleFact[] = [];
  for (const checkpoint of marketCheckpoints(input)) {
    const beforeOffers = settleDueAiMarketTables({
      careerState,
      throughDate: checkpoint,
      transferWindows: input.transferWindows,
    });
    careerState = beforeOffers.careerState;
    facts.push(...beforeOffers.facts);

    const submitted = submitDueAiMarketTalks({
      careerState,
      submittedOn: checkpoint,
      transferWindows: input.transferWindows,
    });
    careerState = submitted.careerState;
    facts.push(...submitted.facts);

    const afterOffers = settleDueAiMarketTables({
      careerState,
      throughDate: checkpoint,
      transferWindows: input.transferWindows,
    });
    careerState = afterOffers.careerState;
    facts.push(...afterOffers.facts);
  }

  return {
    careerState,
    facts,
    needs: deriveAiMarketNeeds({ careerState, asOf: input.throughDate }),
  };
}

function settleDueAiMarketTables(input: {
  readonly careerState: CareerState;
  readonly throughDate: GameDate;
  readonly transferWindows: SeasonTransferWindows;
}): { readonly careerState: CareerState; readonly facts: readonly AiMarketLifecycleFact[] } {
  let careerState = input.careerState;
  const facts: AiMarketLifecycleFact[] = [];
  const selectedClubIds = [careerState.selectedClubId];

  const clubReplies = advanceTransferNegotiations({
    careerState,
    throughDate: input.throughDate,
    protectedSellingClubIds: selectedClubIds,
    protectSquadDepth: true,
  });
  careerState = clubReplies.careerState;
  for (const resolution of clubReplies.resolved) {
    const negotiation = careerState.transferNegotiationState?.negotiations[resolution.negotiationId];
    if (negotiation !== undefined) {
      facts.push(transferResolutionFact(negotiation, input.throughDate));
    }
  }

  const clubDecisions = resolveAiClubTransferDecisions(
    careerState,
    input.throughDate,
    input.transferWindows,
  );
  careerState = clubDecisions.careerState;
  facts.push(...clubDecisions.facts);

  const playerReplies = advanceTransferPlayerNegotiations({
    careerState,
    throughDate: input.throughDate,
    transferWindows: input.transferWindows,
    protectedBuyingClubIds: selectedClubIds,
  });
  careerState = playerReplies.careerState;
  for (const resolution of playerReplies.resolved) {
    const negotiation = careerState.transferNegotiationState?.negotiations[resolution.negotiationId];
    if (negotiation !== undefined) {
      facts.push(transferResolutionFact(negotiation, input.throughDate));
    }
  }

  const playerDecisions = resolveAiPlayerTransferCounters(
    careerState,
    input.throughDate,
    input.transferWindows,
  );
  careerState = playerDecisions.careerState;
  facts.push(...playerDecisions.facts);

  const preliminaryReplies = advancePreliminaryAgreementLifecycle({
    careerState,
    throughDate: input.throughDate,
  });
  careerState = preliminaryReplies.careerState;
  for (const preliminaryFact of preliminaryReplies.facts) {
    if (preliminaryFact.offeringClubId === careerState.selectedClubId) continue;
    const agreement = careerState.preliminaryAgreementState?.agreements[preliminaryFact.agreementId];
    if (agreement !== undefined && (preliminaryFact.event === "agreed" || preliminaryFact.event === "activated")) {
      facts.push(preliminaryFactFromAgreement(
        agreement,
        preliminaryFact.event === "agreed" ? "preliminary_agreed" : "preliminary_activated",
        preliminaryFact.occurredOn,
      ));
    }
  }

  const preliminaryDecisions = resolveAiPreliminaryCounters(careerState, input.throughDate);
  return {
    careerState: preliminaryDecisions.careerState,
    facts: [...facts, ...preliminaryDecisions.facts],
  };
}

function resolveAiClubTransferDecisions(
  inputState: CareerState,
  decidedOn: GameDate,
  transferWindows: SeasonTransferWindows,
): { readonly careerState: CareerState; readonly facts: readonly AiMarketLifecycleFact[] } {
  let careerState = inputState;
  const facts: AiMarketLifecycleFact[] = [];
  const negotiationIds = [...(careerState.transferNegotiationState?.negotiationIds ?? [])].sort();

  for (const negotiationId of negotiationIds) {
    const negotiation = careerState.transferNegotiationState?.negotiations[negotiationId];
    if (
      negotiation === undefined
      || negotiation.buyingClubId === careerState.selectedClubId
      || negotiation.sellingClubId === careerState.selectedClubId
    ) continue;

    if (negotiation.status === "countered") {
      const demand = demandForTransfer(careerState, negotiation, decidedOn);
      const affordable = demand !== undefined
        && transferTermsAreAffordable(
          careerState,
          negotiation.buyingClubId,
          demand.preferredTerms,
          negotiation.counterFee,
        );
      const decision = affordable
        ? acceptTransferCounter({ careerState, negotiationId, decidedOn })
        : withdrawTransferNegotiation({ careerState, negotiationId, decidedOn });
      if (decision.status === "applied") {
        careerState = decision.careerState;
        facts.push(transferFact(
          decision.negotiation,
          affordable ? "club_offer_accepted" : "club_offer_withdrawn",
          decidedOn,
          affordable ? "counter_within_capacity" : "counter_exceeds_capacity",
        ));
      }
      continue;
    }

    if (negotiation.status !== "accepted") continue;
    const demand = demandForTransfer(careerState, negotiation, decidedOn);
    if (demand === undefined) continue;
    const submitted = submitTransferPlayerOffer({
      careerState,
      negotiationId,
      submittedOn: decidedOn,
      terms: demand.preferredTerms,
      transferWindows,
    });
    if (submitted.status === "applied") {
      careerState = submitted.careerState;
      facts.push(transferFact(submitted.negotiation, "player_terms_submitted", decidedOn));
    }
  }

  return { careerState, facts };
}

function resolveAiPlayerTransferCounters(
  inputState: CareerState,
  decidedOn: GameDate,
  transferWindows: SeasonTransferWindows,
): { readonly careerState: CareerState; readonly facts: readonly AiMarketLifecycleFact[] } {
  let careerState = inputState;
  const facts: AiMarketLifecycleFact[] = [];
  const negotiationIds = [...(careerState.transferNegotiationState?.negotiationIds ?? [])].sort();

  for (const negotiationId of negotiationIds) {
    const negotiation = careerState.transferNegotiationState?.negotiations[negotiationId];
    if (
      negotiation?.status !== "player_countered"
      || negotiation.buyingClubId === careerState.selectedClubId
      || negotiation.sellingClubId === careerState.selectedClubId
    ) continue;

    const affordable = transferTermsAreAffordable(
      careerState,
      negotiation.buyingClubId,
      negotiation.counterTerms,
      negotiation.agreedFee,
    );
    const decision = affordable
      ? acceptTransferPlayerCounter({
          careerState,
          negotiationId,
          decidedOn,
          transferWindows,
        })
      : rejectTransferPlayerCounter({
          careerState,
          negotiationId,
          decidedOn,
          transferWindows,
        });
    if (decision.status === "applied") {
      careerState = decision.careerState;
      facts.push(transferFact(
        decision.negotiation,
        affordable ? "player_counter_accepted" : "player_counter_rejected",
        decidedOn,
        affordable ? "terms_within_capacity" : "terms_exceed_capacity",
      ));
      if (decision.negotiation.status === "completed") {
        facts.push(transferFact(decision.negotiation, "transfer_completed", decidedOn));
      }
    }
  }
  return { careerState, facts };
}

function resolveAiPreliminaryCounters(
  inputState: CareerState,
  decidedOn: GameDate,
): { readonly careerState: CareerState; readonly facts: readonly AiMarketLifecycleFact[] } {
  let careerState = inputState;
  const facts: AiMarketLifecycleFact[] = [];
  const agreementIds = [...(careerState.preliminaryAgreementState?.agreementIds ?? [])].sort();

  for (const agreementId of agreementIds) {
    const agreement = careerState.preliminaryAgreementState?.agreements[agreementId];
    if (agreement?.status !== "countered" || agreement.offeringClubId === careerState.selectedClubId) {
      continue;
    }
    const affordable = contractTermsAreAffordable(
      careerState,
      agreement.offeringClubId,
      agreement.counterTerms,
    );
    const decision = affordable
      ? acceptPreliminaryAgreementCounter({ careerState, agreementId, decidedOn })
      : rejectPreliminaryAgreementCounter({ careerState, agreementId, decidedOn });
    if (decision.status === "applied") {
      careerState = decision.careerState;
      facts.push(preliminaryFactFromAgreement(
        decision.agreement,
        affordable ? "preliminary_counter_accepted" : "preliminary_counter_rejected",
        decidedOn,
      ));
    }
  }
  return { careerState, facts };
}

function submitDueAiMarketTalks(input: {
  readonly careerState: CareerState;
  readonly submittedOn: GameDate;
  readonly transferWindows: SeasonTransferWindows;
}): { readonly careerState: CareerState; readonly facts: readonly AiMarketLifecycleFact[] } {
  let careerState = input.careerState;
  const facts: AiMarketLifecycleFact[] = [];
  const needs = deriveAiMarketNeeds({ careerState, asOf: input.submittedOn });
  const handledClubIds = new Set<ClubId>();

  for (const need of needs) {
    if (
      need.clubId === careerState.selectedClubId
      || handledClubIds.has(need.clubId)
      || !need.canRecruit
      || activeAiTalkCount(careerState, need.clubId) >= MAX_ACTIVE_AI_MARKET_TALKS
    ) continue;

    const starts = marketStartsForClub(careerState, need.clubId, input.transferWindows);
    let submitted = false;
    if (isTransferWindowOpen(input.transferWindows, input.submittedOn) && starts.transfers < MAX_AI_MARKET_STARTS_PER_SEASON) {
      const target = selectPermanentTransferTarget(careerState, need, input.submittedOn);
      if (target !== undefined) {
        const negotiationId = nextAiTransferNegotiationId(
          careerState,
          need.clubId,
          target.player.id,
          input.submittedOn,
        );
        const result = submitTransferOffer({
          careerState,
          negotiationId,
          buyingClubId: need.clubId,
          sellingClubId: target.sellingClub.id,
          playerId: target.player.id,
          offeredFee: target.offerFee,
          submittedOn: input.submittedOn,
          transferWindows: input.transferWindows,
        });
        if (result.status === "applied") {
          careerState = result.careerState;
          facts.push(transferFact(
            result.negotiation,
            "club_offer_submitted",
            input.submittedOn,
            need.reasons[0],
          ));
          submitted = true;
        }
      }
    }

    if (!submitted && starts.preliminary < MAX_AI_PRELIMINARY_STARTS_PER_SEASON) {
      const target = selectPreliminaryAgreementTarget(careerState, need, input.submittedOn);
      if (target !== undefined) {
        const agreementId = nextPreliminaryAgreementId(careerState, target.player.id, need.clubId);
        const result = submitPreliminaryAgreementOffer({
          careerState,
          agreementId,
          playerId: target.player.id,
          offeringClubId: need.clubId,
          submittedOn: input.submittedOn,
          terms: target.terms,
          transferWindows: input.transferWindows,
        });
        if (result.status === "applied") {
          careerState = result.careerState;
          facts.push(preliminaryFactFromAgreement(
            result.agreement,
            "preliminary_offer_submitted",
            input.submittedOn,
            need.reasons[0],
          ));
          submitted = true;
        }
      }
    }
    if (submitted) handledClubIds.add(need.clubId);
  }

  return { careerState, facts };
}

interface TransferTarget {
  readonly player: Player;
  readonly sellingClub: Club;
  readonly offerFee: Money;
  readonly score: number;
}

function selectPermanentTransferTarget(
  careerState: CareerState,
  need: AiMarketNeed,
  submittedOn: GameDate,
): TransferTarget | undefined {
  const buyer = careerState.gameState.clubs[need.clubId];
  if (buyer === undefined) return undefined;
  const contracts = activeContractsByPlayer(careerState);
  const candidates: TransferTarget[] = [];

  for (const sellingClubId of [...careerState.gameState.clubIds].sort()) {
    const sellingClub = careerState.gameState.clubs[sellingClubId];
    if (
      sellingClub === undefined
      || sellingClub.id === buyer.id
      || sellingClub.id === careerState.selectedClubId
      || sellingClub.playerIds.length - 1 < MINIMUM_CAREER_SQUAD_SIZE
    ) continue;

    for (const playerId of sellingClub.playerIds) {
      const player = careerState.gameState.players[playerId];
      const contract = contracts.get(playerId);
      if (
        player === undefined
        || contract === undefined
        || playerSquadDepartment(player) !== need.department
        || hasAnyLiveMarketTalk(careerState, playerId)
        || !sellerCanLosePlayer(careerState, sellingClub, player)
      ) continue;

      const ability = derivePlayerMarketAbility(player);
      if (isImplausibleDownwardMove(sellingClub, buyer, ability.currentAbility)) continue;
      const valuation = derivePlayerValuation({
        player,
        club: sellingClub,
        currentDate: submittedOn,
        contract,
        config: DEFAULT_PLAYER_VALUATION_CONFIG,
        currentForm: Number(careerState.gameState.playerStates[player.id]?.form ?? 50),
      });
      const willingness = deriveSellerTransferWillingness({
        careerState,
        negotiation: {
          buyingClubId: buyer.id,
          sellingClubId: sellingClub.id,
          playerId: player.id,
          offeredFee: valuation.value,
          submittedOn,
        },
        protectSquadDepth: true,
      });
      if (willingness.decision === "reject" && willingness.reason === "player_not_for_sale") continue;
      const offerFee = willingness.askingFee ?? valuation.value;
      const demand = deriveContractDemand({
        careerState,
        playerId: player.id,
        clubId: buyer.id,
        evaluatedOn: submittedOn,
        currentContract: contract,
        isFreeAgent: false,
      });
      if (!transferTermsAreAffordable(careerState, buyer.id, demand.preferredTerms, offerFee)) continue;
      const account = careerState.clubFinanceState?.accounts[buyer.id];
      if (account === undefined || offerFee > account.availableTransferBudget) continue;

      candidates.push({
        player,
        sellingClub,
        offerFee,
        score:
          ability.currentAbility * 100
          + ability.potentialAbility * 20
          - playerAge(player, submittedOn) * 2
          - Number(offerFee) / Math.max(1, Number(account.availableTransferBudget)) * 25,
      });
    }
  }

  return candidates.sort((left, right) =>
    right.score - left.score
    || String(left.player.id).localeCompare(String(right.player.id)),
  )[0];
}

interface PreliminaryTarget {
  readonly player: Player;
  readonly terms: ReturnType<typeof deriveContractDemand>["preferredTerms"];
  readonly score: number;
}

function selectPreliminaryAgreementTarget(
  careerState: CareerState,
  need: AiMarketNeed,
  submittedOn: GameDate,
): PreliminaryTarget | undefined {
  const buyer = careerState.gameState.clubs[need.clubId];
  if (buyer === undefined) return undefined;
  const contracts = activeContractsByPlayer(careerState);
  const candidates: PreliminaryTarget[] = [];

  for (const playerId of [...careerState.gameState.playerIds].sort()) {
    const player = careerState.gameState.players[playerId];
    const contract = contracts.get(playerId);
    const currentClub = contract === undefined
      ? undefined
      : careerState.gameState.clubs[contract.clubId];
    const remainingDays = contract === undefined ? Number.POSITIVE_INFINITY : contract.endsOn - submittedOn;
    if (
      player === undefined
      || contract === undefined
      || currentClub === undefined
      || currentClub.id === buyer.id
      || currentClub.id === careerState.selectedClubId
      || playerSquadDepartment(player) !== need.department
      || remainingDays <= 0
      || remainingDays > PRELIMINARY_AGREEMENT_DAYS
      || hasLivePreliminaryAgreement(careerState, player.id)
      || isImplausibleDownwardMove(currentClub, buyer, derivePlayerMarketAbility(player).currentAbility)
    ) continue;

    const demand = deriveContractDemand({
      careerState,
      playerId: player.id,
      clubId: buyer.id,
      evaluatedOn: submittedOn,
      currentContract: contract,
      isFreeAgent: false,
    });
    if (!contractTermsAreAffordable(careerState, buyer.id, demand.preferredTerms)) continue;
    const ability = derivePlayerMarketAbility(player);
    candidates.push({
      player,
      terms: demand.preferredTerms,
      score:
        ability.currentAbility * 100
        + ability.potentialAbility * 20
        - playerAge(player, submittedOn) * 2,
    });
  }

  return candidates.sort((left, right) =>
    right.score - left.score
    || String(left.player.id).localeCompare(String(right.player.id)),
  )[0];
}

function demandForTransfer(
  careerState: CareerState,
  negotiation: TransferNegotiation,
  evaluatedOn: GameDate,
): ReturnType<typeof deriveContractDemand> | undefined {
  const currentContract = activeContractsByPlayer(careerState).get(negotiation.playerId);
  if (currentContract === undefined) return undefined;
  return deriveContractDemand({
    careerState,
    playerId: negotiation.playerId,
    clubId: negotiation.buyingClubId,
    evaluatedOn,
    currentContract,
    isFreeAgent: false,
  });
}

function transferTermsAreAffordable(
  careerState: CareerState,
  clubId: ClubId,
  terms: ReturnType<typeof deriveContractDemand>["preferredTerms"],
  transferFee: Money,
): boolean {
  const account = careerState.clubFinanceState?.accounts[clubId];
  if (account === undefined || transferFee > account.availableTransferBudget) return false;
  return evaluateCareerContractCapacity({
    careerState,
    clubId,
    addedAnnualWage: terms.annualWage,
    addedSigningBonus: terms.bonuses.signingBonus,
    additionalImmediateCost: transferFee,
  }).status === "affordable";
}

function contractTermsAreAffordable(
  careerState: CareerState,
  clubId: ClubId,
  terms: ReturnType<typeof deriveContractDemand>["preferredTerms"],
): boolean {
  return evaluateCareerContractCapacity({
    careerState,
    clubId,
    addedAnnualWage: terms.annualWage,
    addedSigningBonus: terms.bonuses.signingBonus,
  }).status === "affordable";
}

function sellerCanLosePlayer(careerState: CareerState, club: Club, player: Player): boolean {
  if (club.playerIds.length - 1 < MINIMUM_CAREER_SQUAD_SIZE) return false;
  const department = playerSquadDepartment(player);
  const depth = club.playerIds.filter((playerId) => {
    const teammate = careerState.gameState.players[playerId];
    return teammate !== undefined && playerSquadDepartment(teammate) === department;
  }).length;
  return depth - 1 >= MINIMUM_CAREER_DEPARTMENT_DEPTH[department];
}

function activeAiTalkCount(careerState: CareerState, clubId: ClubId): number {
  const transfers = (careerState.transferNegotiationState?.negotiationIds ?? []).filter((id) => {
    const negotiation = careerState.transferNegotiationState?.negotiations[id];
    return negotiation !== undefined
      && negotiation.buyingClubId === clubId
      && isOpenTransferNegotiation(negotiation);
  }).length;
  const preliminary = (careerState.preliminaryAgreementState?.agreementIds ?? []).filter((id) => {
    const agreement = careerState.preliminaryAgreementState?.agreements[id];
    return agreement !== undefined
      && agreement.offeringClubId === clubId
      && isLivePreliminaryAgreement(agreement);
  }).length;
  return transfers + preliminary;
}

function marketStartsForClub(
  careerState: CareerState,
  clubId: ClubId,
  windows: SeasonTransferWindows,
): { readonly transfers: number; readonly preliminary: number } {
  const seasonStartsOn = windows.windows[0].opensOn;
  const seasonEndsOn = windows.windows[1].closesOn;
  const transfers = (careerState.transferNegotiationState?.negotiationIds ?? []).filter((id) => {
    const negotiation = careerState.transferNegotiationState?.negotiations[id];
    const date = negotiation === undefined ? undefined : transferReferenceDate(negotiation);
    return negotiation?.buyingClubId === clubId
      && date !== undefined
      && date >= seasonStartsOn
      && date <= seasonEndsOn;
  }).length;
  const preliminary = (careerState.preliminaryAgreementState?.agreementIds ?? []).filter((id) => {
    const agreement = careerState.preliminaryAgreementState?.agreements[id];
    return agreement?.offeringClubId === clubId
      && agreement.createdOn >= seasonStartsOn
      && agreement.createdOn <= seasonEndsOn;
  }).length;
  return { transfers, preliminary };
}

function transferReferenceDate(negotiation: TransferNegotiation): GameDate | undefined {
  if ("submittedOn" in negotiation) return negotiation.submittedOn;
  if ("acceptedOn" in negotiation) return negotiation.acceptedOn;
  if ("rejectedOn" in negotiation) return negotiation.rejectedOn;
  if ("withdrawnOn" in negotiation) return negotiation.withdrawnOn;
  if ("expiredOn" in negotiation) return negotiation.expiredOn;
  if ("cancelledOn" in negotiation) return negotiation.cancelledOn;
  if ("completedOn" in negotiation) return negotiation.completedOn;
  if ("failedOn" in negotiation) return negotiation.failedOn;
  return undefined;
}

function marketCheckpoints(input: {
  readonly careerState: CareerState;
  readonly fromDate: GameDate;
  readonly throughDate: GameDate;
  readonly transferWindows: SeasonTransferWindows;
}): readonly GameDate[] {
  const dates = new Set<GameDate>([input.throughDate]);
  for (let date = input.fromDate + PRELIMINARY_MARKET_CHECKPOINT_DAYS; date < input.throughDate; date += PRELIMINARY_MARKET_CHECKPOINT_DAYS) {
    dates.add(date as GameDate);
  }
  for (const window of input.transferWindows.windows) {
    const first = Math.max(input.fromDate + 1, window.opensOn);
    const last = Math.min(input.throughDate, window.closesOn);
    for (let date = first; date <= last; date += PERMANENT_MARKET_CHECKPOINT_DAYS) {
      dates.add(date as GameDate);
    }
    if (window.closesOn > input.fromDate && window.closesOn <= input.throughDate) {
      dates.add(window.closesOn);
    }
  }
  for (const contractId of input.careerState.seniorSquadState?.activeContractIds ?? []) {
    const contract = input.careerState.seniorSquadState?.contracts[contractId];
    if (contract === undefined) continue;
    const eligibilityDate = contract.endsOn - PRELIMINARY_AGREEMENT_DAYS;
    if (eligibilityDate > input.fromDate && eligibilityDate <= input.throughDate) {
      dates.add(eligibilityDate as GameDate);
    }
  }
  return [...dates].filter((date) => date > input.fromDate && date <= input.throughDate).sort((a, b) => a - b);
}

function activeContractsByPlayer(careerState: CareerState): ReadonlyMap<PlayerId, PlayerContract> {
  const contracts = new Map<PlayerId, PlayerContract>();
  const senior = careerState.seniorSquadState;
  if (senior === undefined) return contracts;
  for (const contractId of senior.activeContractIds) {
    const contract = senior.contracts[contractId];
    if (contract !== undefined) contracts.set(contract.playerId, contract);
  }
  return contracts;
}

function hasAnyLiveMarketTalk(careerState: CareerState, playerId: PlayerId): boolean {
  const hasTransfer = (careerState.transferNegotiationState?.negotiationIds ?? []).some((id) => {
    const negotiation = careerState.transferNegotiationState?.negotiations[id];
    return negotiation !== undefined
      && negotiation.playerId === playerId
      && isOpenTransferNegotiation(negotiation);
  });
  return hasTransfer || hasLivePreliminaryAgreement(careerState, playerId);
}

function hasLivePreliminaryAgreement(careerState: CareerState, playerId: PlayerId): boolean {
  return (careerState.preliminaryAgreementState?.agreementIds ?? []).some((id) => {
    const agreement = careerState.preliminaryAgreementState?.agreements[id];
    return agreement !== undefined
      && agreement.playerId === playerId
      && isLivePreliminaryAgreement(agreement);
  });
}

function nextAiTransferNegotiationId(
  careerState: CareerState,
  buyingClubId: ClubId,
  playerId: PlayerId,
  submittedOn: GameDate,
): TransferNegotiationId {
  let sequence = (careerState.transferNegotiationState?.negotiationIds.length ?? 0) + 1;
  while (true) {
    const id = transferNegotiationId(
      `transfer-negotiation:ai:${safeId(buyingClubId)}:${safeId(playerId)}:${submittedOn}:${sequence}`,
    );
    if (careerState.transferNegotiationState?.negotiations[id] === undefined) return id;
    sequence += 1;
  }
}

function nextPreliminaryAgreementId(
  careerState: CareerState,
  playerId: PlayerId,
  offeringClubId: ClubId,
) {
  let sequence = (careerState.preliminaryAgreementState?.agreementIds.length ?? 0) + 1;
  while (true) {
    const id = createPreliminaryAgreementId(playerId, offeringClubId, sequence);
    if (careerState.preliminaryAgreementState?.agreements[id] === undefined) return id;
    sequence += 1;
  }
}

function transferResolutionFact(
  negotiation: TransferNegotiation,
  occurredOn: GameDate,
): AiMarketLifecycleFact {
  if (negotiation.status === "countered") {
    return transferFact(negotiation, "club_offer_countered", occurredOn);
  }
  if (negotiation.status === "accepted") {
    return transferFact(negotiation, "club_offer_accepted", occurredOn);
  }
  if (negotiation.status === "rejected") {
    return transferFact(negotiation, "club_offer_rejected", occurredOn, negotiation.reason);
  }
  if (negotiation.status === "expired") {
    return transferFact(negotiation, "club_offer_expired", occurredOn);
  }
  if (negotiation.status === "player_rejected") {
    return transferFact(negotiation, "player_terms_rejected", occurredOn, negotiation.reason);
  }
  if (negotiation.status === "player_countered") {
    return transferFact(negotiation, "player_terms_countered", occurredOn);
  }
  if (negotiation.status === "completed") {
    return transferFact(negotiation, "transfer_completed", occurredOn);
  }
  return transferFact(negotiation, "transfer_failed", occurredOn, negotiation.status);
}

function transferFact(
  negotiation: TransferNegotiation,
  event: AiMarketLifecycleFact["event"],
  occurredOn: GameDate,
  reason?: string,
): AiMarketLifecycleFact {
  return {
    occurredOn,
    event,
    buyingClubId: negotiation.buyingClubId,
    sellingClubId: negotiation.sellingClubId,
    playerId: negotiation.playerId,
    negotiationId: negotiation.id,
    ...(reason === undefined ? {} : { reason }),
  };
}

function preliminaryFactFromAgreement(
  agreement: PreliminaryAgreement,
  event: AiMarketLifecycleFact["event"],
  occurredOn: GameDate,
  reason?: string,
): AiMarketLifecycleFact {
  return {
    occurredOn,
    event,
    buyingClubId: agreement.offeringClubId,
    sellingClubId: agreement.currentClubId,
    playerId: agreement.playerId,
    negotiationId: agreement.id,
    ...(reason === undefined ? {} : { reason }),
  };
}

function isTransferWindowOpen(windows: SeasonTransferWindows, date: GameDate): boolean {
  return windows.windows.some((window) => date >= window.opensOn && date <= window.closesOn);
}

function isImplausibleDownwardMove(seller: Club, buyer: Club, ability: number): boolean {
  const categoryRank = { third_division: 1, second_division: 2, first_division: 3 } as const;
  const categoryDrop = categoryRank[seller.category] - categoryRank[buyer.category];
  return categoryDrop >= 2
    || (categoryDrop >= 1 && seller.reputation - buyer.reputation >= 4 && ability >= 12);
}

function playerAge(player: Player, asOf: GameDate): number {
  return Math.max(15, Math.floor((asOf - player.birthDate) / 365.2425));
}

function departmentOrder(): readonly PlayerSquadDepartment[] {
  return ["goalkeeper", "defender", "midfielder", "attacker"];
}

function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
