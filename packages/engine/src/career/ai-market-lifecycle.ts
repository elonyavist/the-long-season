import {
  isLivePreliminaryAgreement,
  isOpenTransferNegotiation,
  playerSquadDepartment,
  transferNegotiationId,
  type CareerState,
  type AskingPriceCurvesConfig,
  type Club,
  type ClubId,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type Money,
  type Player,
  type PlayerContract,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type PlayerSquadDepartment,
  type PreliminaryAgreement,
  type SeasonTransferWindows,
  type TransferNegotiation,
  type TransferNegotiationId,
} from "@game/domain";

import {
  derivePlayerMarketAbility,
  derivePlayerValuation,
  type PlayerValuationConfig,
} from "../market/player-valuation.ts";
import { derivePlayerWillingness } from "../market/player-willingness.ts";
import {
  evaluateCareerContractCapacity,
  evaluateTransferFeeCapacity,
} from "./career-contract-capacity.ts";
import {
  buildCareerMarketCatalog,
  type CareerMarketCatalogTarget,
} from "./career-market-catalog.ts";
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
  deriveTransferCommercialSnapshot,
  submitTransferOffer,
  withdrawTransferNegotiation,
} from "./transfer-negotiation.ts";
import {
  acceptTransferPlayerCounter,
  advanceTransferPlayerNegotiations,
  rejectTransferPlayerCounter,
  submitTransferPlayerOffer,
} from "./transfer-player-negotiation.ts";

/** Stable football reason behind one AI recruitment need. */
export type AiMarketNeedReason =
  | "structural_depth"
  | "expiring_contracts"
  | "aging_department"
  | "quality_gap"
  | "elite_prospect_opportunity";

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
    | "preliminary_offer_rejected"
    | "preliminary_offer_countered"
    | "preliminary_agreed"
    | "preliminary_expired"
    | "preliminary_activated"
    | "preliminary_activation_cancelled";
  readonly buyingClubId: ClubId;
  readonly sellingClubId?: ClubId;
  readonly playerId: PlayerId;
  readonly negotiationId: string;
  readonly reason?: string;
}

/** Stable reason why one AI recruitment checkpoint did not reach a later funnel stage. */
export type AiMarketDiagnosticReason =
  | "selected_club_protected"
  | "club_already_handled"
  | "club_cannot_recruit"
  | "active_talk_limit_reached"
  | "transfer_window_closed"
  | "permanent_start_limit_reached"
  | "permanent_target_unavailable"
  | "seller_squad_floor"
  | "department_target_unavailable"
  | "target_has_live_market_talk"
  | "seller_department_floor"
  | "implausible_downward_move"
  | "seller_not_for_sale"
  | "transfer_terms_unaffordable"
  | "transfer_budget_insufficient"
  | "permanent_offer_rejected"
  | "preliminary_start_limit_reached"
  | "preliminary_target_unavailable"
  | "preliminary_offer_rejected";

/** One compact, language-agnostic observation from an AI recruitment checkpoint. */
export interface AiMarketDiagnosticFact {
  readonly occurredOn: GameDate;
  readonly clubId: ClubId;
  readonly department: PlayerSquadDepartment;
  readonly event:
    | "need_evaluated"
    | "need_recruitable"
    | "permanent_target_found"
    | "permanent_target_unavailable"
    | "preliminary_candidate_found"
    | "preliminary_candidate_unavailable";
  readonly reason?: AiMarketDiagnosticReason;
  readonly playerId?: PlayerId;
  /** Whether the competition transfer window was open for this observation. */
  readonly transferWindowOpen?: boolean;
  /** Number of identical observations compacted into this row. */
  readonly count: number;
}

/** Result of advancing the deterministic AI market client. */
export interface AdvanceAiMarketLifecycleResult {
  readonly careerState: CareerState;
  readonly facts: readonly AiMarketLifecycleFact[];
  /** Compact funnel observations that never participate in gameplay decisions. */
  readonly diagnostics: readonly AiMarketDiagnosticFact[];
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
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
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
          && contract.endsOn - input.asOf
            <= input.marketBehaviorPolicy.aiLifecycle.expiringContractDays;
      }).length;
      const averageAge = average(players.map((player) => playerAge(player, input.asOf)));
      const averageAbility = average(
        players.map((player) => derivePlayerMarketAbility(player).currentAbility),
      );
      const reasons: AiMarketNeedReason[] = [];
      if (players.length < MINIMUM_CAREER_DEPARTMENT_DEPTH[department]) {
        reasons.push("structural_depth");
      }
      const targetDepth = input.marketBehaviorPolicy.aiLifecycle.targetDepartmentDepth[department];
      if (expiringContractCount > 0 && players.length - expiringContractCount < targetDepth) {
        reasons.push("expiring_contracts");
      }
      const agingThreshold = department === "goalkeeper"
        ? input.marketBehaviorPolicy.aiLifecycle.goalkeeperAgingAge
        : input.marketBehaviorPolicy.aiLifecycle.outfieldAgingAge;
      if (players.length > 0 && averageAge >= agingThreshold) reasons.push("aging_department");
      const weakestAbility = Math.min(
        ...players.map((player) => derivePlayerMarketAbility(player).currentAbility),
      );
      if (
        players.length > 0
        && (
          averageAbility + input.marketBehaviorPolicy.aiLifecycle.averageQualityGap < squadAbility
          || weakestAbility + input.marketBehaviorPolicy.aiLifecycle.weakestQualityGap < averageAbility
        )
      ) {
        reasons.push("quality_gap");
      }
      if (reasons.length === 0) continue;

      const structuralDeficit = Math.max(
        0,
        MINIMUM_CAREER_DEPARTMENT_DEPTH[department] - players.length,
      );
      const targetDeficit = Math.max(0, targetDepth - players.length);
      const priorityWeights = input.marketBehaviorPolicy.aiLifecycle.needPriorityWeights;
      const priority =
        structuralDeficit * priorityWeights.structuralDeficit
        + targetDeficit * priorityWeights.targetDeficit
        + expiringContractCount * priorityWeights.expiringContract
        + (reasons.includes("aging_department") ? priorityWeights.agingDepartment : 0)
        + (reasons.includes("quality_gap") ? priorityWeights.qualityGap : 0);
      needs.push({
        clubId,
        department,
        reasons,
        priority,
        currentDepth: players.length,
        targetDepth,
        averageAge: round(averageAge),
        averageAbility: round(averageAbility),
        expiringContractCount,
        wageLoadRatio: round(wageLoadRatio),
        canRecruit: clubCanRecruit(
          input.careerState,
          clubId,
          input.marketBehaviorPolicy,
        ),
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
  /** Explicit versioned public-value content. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Explicit versioned seller asking-price content. */
  readonly askingPriceConfig: AskingPriceCurvesConfig;
  /** Explicit wage policy used by player terms and every capacity check. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Exact version-selected seller, willingness, affordability, and AI policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): AdvanceAiMarketLifecycleResult {
  if (
    input.throughDate <= input.fromDate
    || input.careerState.seniorSquadState === undefined
    || input.careerState.clubFinanceState === undefined
  ) {
    return {
      careerState: input.careerState,
      facts: [],
      diagnostics: [],
      needs: deriveAiMarketNeeds({
        careerState: input.careerState,
        asOf: input.throughDate,
        marketBehaviorPolicy: input.marketBehaviorPolicy,
      }),
    };
  }

  let careerState = input.careerState;
  const facts: AiMarketLifecycleFact[] = [];
  const diagnostics = new Map<string, AiMarketDiagnosticFact>();
  for (const checkpoint of marketCheckpoints(input)) {
    const beforeOffers = settleDueAiMarketTables({
      careerState,
      throughDate: checkpoint,
      transferWindows: input.transferWindows,
      valuationConfig: input.valuationConfig,
      askingPriceConfig: input.askingPriceConfig,
      wagePolicy: input.wagePolicy,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
    });
    careerState = beforeOffers.careerState;
    facts.push(...beforeOffers.facts);

    const submitted = submitDueAiMarketTalks({
      careerState,
      submittedOn: checkpoint,
      transferWindows: input.transferWindows,
      valuationConfig: input.valuationConfig,
      askingPriceConfig: input.askingPriceConfig,
      wagePolicy: input.wagePolicy,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
    });
    careerState = submitted.careerState;
    facts.push(...submitted.facts);
    accumulateDiagnosticFacts(
      diagnostics,
      submitted.diagnostics.map((fact) => ({
        ...fact,
        transferWindowOpen: isTransferWindowOpen(input.transferWindows, checkpoint),
      })),
    );

    const afterOffers = settleDueAiMarketTables({
      careerState,
      throughDate: checkpoint,
      transferWindows: input.transferWindows,
      valuationConfig: input.valuationConfig,
      askingPriceConfig: input.askingPriceConfig,
      wagePolicy: input.wagePolicy,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
    });
    careerState = afterOffers.careerState;
    facts.push(...afterOffers.facts);
  }

  return {
    careerState,
    facts,
    diagnostics: [...diagnostics.values()],
    needs: deriveAiMarketNeeds({
      careerState,
      asOf: input.throughDate,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
    }),
  };
}

function settleDueAiMarketTables(input: {
  readonly careerState: CareerState;
  readonly throughDate: GameDate;
  readonly transferWindows: SeasonTransferWindows;
  readonly valuationConfig: PlayerValuationConfig;
  readonly askingPriceConfig: AskingPriceCurvesConfig;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): { readonly careerState: CareerState; readonly facts: readonly AiMarketLifecycleFact[] } {
  let careerState = input.careerState;
  const facts: AiMarketLifecycleFact[] = [];
  const selectedClubIds = [careerState.selectedClubId];

  const clubReplies = advanceTransferNegotiations({
    careerState,
    throughDate: input.throughDate,
    protectedSellingClubIds: selectedClubIds,
    protectSquadDepth: true,
    valuationConfig: input.valuationConfig,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
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
    input.wagePolicy,
    input.marketBehaviorPolicy,
  );
  careerState = clubDecisions.careerState;
  facts.push(...clubDecisions.facts);

  const playerReplies = advanceTransferPlayerNegotiations({
    careerState,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    throughDate: input.throughDate,
    transferWindows: input.transferWindows,
    protectedBuyingClubIds: selectedClubIds,
    protectSellerSquadDepth: true,
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
    input.wagePolicy,
    input.marketBehaviorPolicy,
  );
  careerState = playerDecisions.careerState;
  facts.push(...playerDecisions.facts);

  const preliminaryReplies = advancePreliminaryAgreementLifecycle({
    careerState,
    throughDate: input.throughDate,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  });
  careerState = preliminaryReplies.careerState;
  for (const preliminaryFact of preliminaryReplies.facts) {
    if (preliminaryFact.offeringClubId === careerState.selectedClubId) continue;
    const agreement = careerState.preliminaryAgreementState?.agreements[preliminaryFact.agreementId];
    if (agreement !== undefined) {
      facts.push(preliminaryFactFromAgreement(
        agreement,
        preliminaryLifecycleEvent(preliminaryFact.event),
        preliminaryFact.occurredOn,
        preliminaryFact.reason,
      ));
    }
  }

  const preliminaryDecisions = resolveAiPreliminaryCounters(
    careerState,
    input.throughDate,
    input.wagePolicy,
    input.marketBehaviorPolicy,
  );
  return {
    careerState: preliminaryDecisions.careerState,
    facts: [...facts, ...preliminaryDecisions.facts],
  };
}

function resolveAiClubTransferDecisions(
  inputState: CareerState,
  decidedOn: GameDate,
  transferWindows: SeasonTransferWindows,
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
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
      const demand = demandForTransfer(careerState, negotiation, decidedOn, wagePolicy);
      const affordable = demand !== undefined
        && transferTermsAreAffordable(
          careerState,
          negotiation.buyingClubId,
          demand.preferredTerms,
          negotiation.counterFee,
          wagePolicy,
          marketBehaviorPolicy,
        );
      const decision = affordable
        ? acceptTransferCounter({
            careerState,
            negotiationId,
            decidedOn,
            marketBehaviorPolicy,
          })
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
    const demand = demandForTransfer(careerState, negotiation, decidedOn, wagePolicy);
    if (demand === undefined) continue;
    const submitted = submitTransferPlayerOffer({
      careerState,
      wagePolicy,
      marketBehaviorPolicy,
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
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
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
      wagePolicy,
      marketBehaviorPolicy,
    );
    const decision = affordable
      ? acceptTransferPlayerCounter({
          careerState,
          wagePolicy,
          marketBehaviorPolicy,
          negotiationId,
          decidedOn,
          transferWindows,
          protectSellerSquadDepth: true,
        })
      : rejectTransferPlayerCounter({
          careerState,
          wagePolicy,
          marketBehaviorPolicy,
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
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
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
      wagePolicy,
      marketBehaviorPolicy,
    );
    const decision = affordable
      ? acceptPreliminaryAgreementCounter({
          careerState,
          wagePolicy,
          marketBehaviorPolicy,
          agreementId,
          decidedOn,
        })
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
  readonly valuationConfig: PlayerValuationConfig;
  readonly askingPriceConfig: AskingPriceCurvesConfig;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): {
  readonly careerState: CareerState;
  readonly facts: readonly AiMarketLifecycleFact[];
  readonly diagnostics: readonly AiMarketDiagnosticFact[];
} {
  let careerState = input.careerState;
  const facts: AiMarketLifecycleFact[] = [];
  const diagnostics: AiMarketDiagnosticFact[] = [];
  const ordinaryNeeds = deriveAiMarketNeeds({
    careerState,
    asOf: input.submittedOn,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  });
  const opportunityNeeds = deriveEliteProspectOpportunityNeeds({
    careerState,
    asOf: input.submittedOn,
    valuationConfig: input.valuationConfig,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  });
  const needs = [
    ...opportunityNeeds,
    ...ordinaryNeeds,
  ];
  const marketTargets = buildCareerMarketCatalog(careerState).targets;
  const handledClubIds = new Set<ClubId>();

  for (let needIndex = 0; needIndex < needs.length; needIndex += 1) {
    const need = needs[needIndex]!;
    diagnostics.push(diagnosticFact(need, input.submittedOn, "need_evaluated"));
    if (need.clubId === careerState.selectedClubId) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "permanent_target_unavailable",
        "selected_club_protected",
      ));
      continue;
    }
    if (handledClubIds.has(need.clubId)) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "permanent_target_unavailable",
        "club_already_handled",
      ));
      continue;
    }
    if (!need.canRecruit) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "permanent_target_unavailable",
        "club_cannot_recruit",
      ));
      continue;
    }
    if (
      activeAiTalkCount(careerState, need.clubId, false)
      >= input.marketBehaviorPolicy.aiLifecycle.maximumActiveTalks
    ) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "permanent_target_unavailable",
        "active_talk_limit_reached",
      ));
      continue;
    }
    diagnostics.push(diagnosticFact(need, input.submittedOn, "need_recruitable"));

    const starts = marketStartsForClub(careerState, need.clubId, input.transferWindows);
    let submitted = false;
    if (!isTransferWindowOpen(input.transferWindows, input.submittedOn)) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "permanent_target_unavailable",
        "transfer_window_closed",
      ));
    } else if (
      starts.transfers
        >= input.marketBehaviorPolicy.aiLifecycle.maximumPermanentStartsPerSeason
    ) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "permanent_target_unavailable",
        "permanent_start_limit_reached",
      ));
    } else {
      const selection = selectPermanentTransferTarget(
        careerState,
        marketTargets,
        need,
        input.submittedOn,
        input.valuationConfig,
        input.askingPriceConfig,
        input.wagePolicy,
        input.marketBehaviorPolicy,
      );
      const target = selection.target;
      if (target !== undefined) {
        diagnostics.push(diagnosticFact(
          need,
          input.submittedOn,
          "permanent_target_found",
        ));
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
          valuationConfig: input.valuationConfig,
          askingPriceConfig: input.askingPriceConfig,
          marketBehaviorPolicy: input.marketBehaviorPolicy,
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
        } else {
          diagnostics.push(diagnosticFact(
            need,
            input.submittedOn,
            "permanent_target_unavailable",
            "permanent_offer_rejected",
            target.player.id,
          ));
        }
      } else {
        diagnostics.push(diagnosticFact(
          need,
          input.submittedOn,
          "permanent_target_unavailable",
          selection.reason,
        ));
      }
    }

    const hasLaterNeedForClub = needs
      .slice(needIndex + 1)
      .some((candidate) => candidate.clubId === need.clubId);
    const deferPreliminaryUntilPermanentNeedsAreChecked =
      isTransferWindowOpen(input.transferWindows, input.submittedOn)
      && hasLaterNeedForClub;
    if (!submitted && deferPreliminaryUntilPermanentNeedsAreChecked) {
      continue;
    }
    if (
      !submitted
      && activeAiTalkCount(careerState, need.clubId, true)
        >= input.marketBehaviorPolicy.aiLifecycle.maximumActiveTalks
    ) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "preliminary_candidate_unavailable",
        "active_talk_limit_reached",
      ));
    } else if (
      !submitted
      && starts.preliminary
        >= input.marketBehaviorPolicy.aiLifecycle.maximumPreliminaryStartsPerSeason
    ) {
      diagnostics.push(diagnosticFact(
        need,
        input.submittedOn,
        "preliminary_candidate_unavailable",
        "preliminary_start_limit_reached",
      ));
    } else if (!submitted) {
      const target = selectPreliminaryAgreementTarget(
        careerState,
        marketTargets,
        need,
        input.submittedOn,
        input.wagePolicy,
        input.marketBehaviorPolicy,
      );
      if (target !== undefined) {
        diagnostics.push(diagnosticFact(
          need,
          input.submittedOn,
          "preliminary_candidate_found",
        ));
        const agreementId = nextPreliminaryAgreementId(careerState, target.player.id, need.clubId);
        const result = submitPreliminaryAgreementOffer({
          careerState,
          wagePolicy: input.wagePolicy,
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
        } else {
          diagnostics.push(diagnosticFact(
            need,
            input.submittedOn,
            "preliminary_candidate_unavailable",
            "preliminary_offer_rejected",
            target.player.id,
          ));
        }
      } else {
        diagnostics.push(diagnosticFact(
          need,
          input.submittedOn,
          "preliminary_candidate_unavailable",
          "preliminary_target_unavailable",
        ));
      }
    }
    if (submitted) handledClubIds.add(need.clubId);
  }

  return { careerState, facts, diagnostics };
}

interface TransferTarget {
  readonly player: Player;
  readonly sellingClub: Club;
  readonly offerFee: Money;
  readonly score: number;
}

/** Explicit facts used by the deterministic affordability-bounded AI bid. */
export interface DeriveAiTransferOfferFeeInput {
  readonly askingPrice: Money;
  readonly maximumAffordableFee: Money;
  readonly buyingClubId: ClubId;
  readonly playerId: PlayerId;
  readonly submittedOn: GameDate;
  readonly policy: MarketBehaviorCalibrationConfig["aiTransferOffer"];
}

/**
 * Derives one stable AI offer below or at asking without unseeded randomness.
 *
 * The policy version and immutable negotiation facts choose a configured
 * asking-price band. Available finance can only lower that desired bid.
 */
export function deriveAiTransferOfferFee(
  input: DeriveAiTransferOfferFeeInput,
): Money {
  const stepCount = Math.floor(
    (
      input.policy.maximumAskingBasisPoints
        - input.policy.minimumAskingBasisPoints
    ) / input.policy.askingBasisPointsStep,
  ) + 1;
  const bucket = stableOfferBucket(
    [
      input.policy.version,
      input.buyingClubId,
      input.playerId,
      input.submittedOn,
    ].join(":"),
    stepCount,
  );
  const basisPoints = input.policy.minimumAskingBasisPoints
    + bucket * input.policy.askingBasisPointsStep;
  const desiredFee = basisPoints === 10_000
    ? input.askingPrice
    : floorMoneyToWholeEuro(
        percentageMoney(input.askingPrice, basisPoints),
      );
  return Math.min(desiredFee, input.maximumAffordableFee) as Money;
}

function selectPermanentTransferTarget(
  careerState: CareerState,
  marketTargets: readonly CareerMarketCatalogTarget[],
  need: AiMarketNeed,
  submittedOn: GameDate,
  valuationConfig: PlayerValuationConfig,
  askingPriceConfig: AskingPriceCurvesConfig,
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): {
  readonly target?: TransferTarget;
  readonly reason: Extract<
    AiMarketDiagnosticReason,
    | "permanent_target_unavailable"
    | "seller_squad_floor"
    | "department_target_unavailable"
    | "target_has_live_market_talk"
    | "seller_department_floor"
    | "implausible_downward_move"
    | "seller_not_for_sale"
    | "transfer_terms_unaffordable"
    | "transfer_budget_insufficient"
  >;
} {
  const buyer = careerState.gameState.clubs[need.clubId];
  if (buyer === undefined) return { reason: "permanent_target_unavailable" };
  const contracts = activeContractsByPlayer(careerState);
  const candidates: TransferTarget[] = [];
  let sellerAboveSquadFloor = false;
  let departmentTargetFound = false;
  let talkFreeTargetFound = false;
  let sellerSafeTargetFound = false;
  let plausibleTargetFound = false;
  let sellerWillingTargetFound = false;
  let termsAffordableTargetFound = false;
  const eliteProspectOpportunity = need.reasons.includes(
    "elite_prospect_opportunity",
  );
  const elitePotentialMinimum = eliteProspectOpportunity
    ? sixStarMinimumAbility(valuationConfig)
    : undefined;

  for (const marketTarget of marketTargets) {
    if (marketTarget.employment.status !== "contracted") continue;
    const sellingClub = careerState.gameState.clubs[marketTarget.employment.clubId];
    if (
      sellingClub === undefined
      || sellingClub.id === buyer.id
      || sellingClub.playerIds.length - 1 < MINIMUM_CAREER_SQUAD_SIZE
    ) continue;
    sellerAboveSquadFloor = true;

    const player = careerState.gameState.players[marketTarget.playerId];
    const contract = contracts.get(marketTarget.playerId);
    if (
      player === undefined
      || contract === undefined
      || playerSquadDepartment(player) !== need.department
    ) continue;
    departmentTargetFound = true;
    if (hasAnyLiveMarketTalk(careerState, player.id)) continue;
    talkFreeTargetFound = true;
    if (!sellerCanLosePlayer(careerState, sellingClub, player)) continue;
    sellerSafeTargetFound = true;

    const ability = derivePlayerMarketAbility(player);
    if (
      eliteProspectOpportunity
      && (
        sellingClub.id === careerState.selectedClubId
        || sellingClub.category === "first_division"
        || ability.potentialAbility
          < (elitePotentialMinimum ?? Number.POSITIVE_INFINITY)
      )
    ) continue;
    const willingness = derivePlayerWillingness({
      player,
      sellingClub,
      buyingClub: buyer,
      currentTier: sellingClub.category,
      destinationTier: buyer.category,
      currentDate: submittedOn,
      currentContract: contract,
      marketBehaviorPolicy,
      ratingScale: valuationConfig.ratingScale,
    });
    if (willingness.status === "rejected") continue;
    plausibleTargetFound = true;
    const commercial = deriveTransferCommercialSnapshot({
      careerState,
      sellingClubId: sellingClub.id,
      playerId: player.id,
      asOf: submittedOn,
      valuationConfig,
      askingPriceConfig,
    });
    if (commercial === undefined) continue;
    sellerWillingTargetFound = true;
    const account = careerState.clubFinanceState?.accounts[buyer.id];
    if (account === undefined) continue;
    const availableTransferCapacity = percentageMoney(
      account.availableTransferBudget,
      marketBehaviorPolicy.affordability.maximumTransferBudgetUseBasisPoints,
    );
    const availableCashCapacity = Math.max(
      0,
      account.cashBalance
        - percentageMoney(
          account.annualWageBudget,
          marketBehaviorPolicy.affordability.minimumCashReserveBasisPoints,
        ),
    ) as Money;
    const offerFee = deriveAiTransferOfferFee({
      askingPrice: commercial.currentAskingPrice,
      maximumAffordableFee: Math.min(
        availableTransferCapacity,
        availableCashCapacity,
      ) as Money,
      buyingClubId: buyer.id,
      playerId: player.id,
      submittedOn,
      policy: marketBehaviorPolicy.aiTransferOffer,
    });
    if (offerFee <= 0) continue;
    const demand = deriveContractDemand({
      careerState,
      wagePolicy,
      playerId: player.id,
      clubId: buyer.id,
      evaluatedOn: submittedOn,
      currentContract: contract,
      isFreeAgent: false,
    });
    if (!transferTermsAreAffordable(
      careerState,
      buyer.id,
      demand.preferredTerms,
      offerFee,
      wagePolicy,
      marketBehaviorPolicy,
    )) continue;
    termsAffordableTargetFound = true;
    const weights = marketBehaviorPolicy.aiTargetWeights;
    const roleNeedScore = Math.min(100, Math.max(
      0,
      (need.targetDepth - need.currentDepth) / Math.max(1, need.targetDepth) * 100,
    ));
    const affordabilityScore = Math.max(
      0,
      100 - Number(offerFee) / Math.max(1, Number(availableTransferCapacity)) * 100,
    );

    candidates.push({
      player,
      sellingClub,
      offerFee,
      score:
        ability.currentAbility / 20 * 100 * weights.quality
        + ability.potentialAbility / 20 * 100 * weights.potential
        + roleNeedScore * weights.roleNeed
        + affordabilityScore * weights.affordability,
    });
  }

  const target = candidates.sort((left, right) =>
    right.score - left.score
    || String(left.player.id).localeCompare(String(right.player.id)),
  )[0];
  if (target !== undefined) return { target, reason: "permanent_target_unavailable" };
  if (!sellerAboveSquadFloor) return { reason: "seller_squad_floor" };
  if (!departmentTargetFound) return { reason: "department_target_unavailable" };
  if (!talkFreeTargetFound) return { reason: "target_has_live_market_talk" };
  if (!sellerSafeTargetFound) return { reason: "seller_department_floor" };
  if (!plausibleTargetFound) return { reason: "implausible_downward_move" };
  if (!sellerWillingTargetFound) return { reason: "seller_not_for_sale" };
  if (!termsAffordableTargetFound) return { reason: "transfer_terms_unaffordable" };
  return { reason: "transfer_budget_insufficient" };
}

/**
 * Adds rare, finance-safe first-division interest in six-star prospects.
 *
 * These rare opportunities are checked before ordinary department needs so a
 * top-flight club does not ignore a generational prospect merely because that
 * department also needs routine depth. The existing one-action-per-club,
 * affordability, seller-floor, negotiation, and transfer-window gates still
 * decide whether a deal can actually complete.
 */
function deriveEliteProspectOpportunityNeeds(input: {
  readonly careerState: CareerState;
  readonly asOf: GameDate;
  readonly valuationConfig: PlayerValuationConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): readonly AiMarketNeed[] {
  const contracts = activeContractsByPlayer(input.careerState);
  const minimumPotentialAbility = sixStarMinimumAbility(input.valuationConfig);
  const opportunityCountByDepartment = new Map<PlayerSquadDepartment, number>();

  for (const clubId of input.careerState.gameState.clubIds) {
    const club = input.careerState.gameState.clubs[clubId];
    if (
      club === undefined
      || club.id === input.careerState.selectedClubId
      || club.category === "first_division"
    ) continue;
    for (const playerId of club.playerIds) {
      const player = input.careerState.gameState.players[playerId];
      if (
        player !== undefined
        && contracts.has(playerId)
        && derivePlayerMarketAbility(player).potentialAbility
          >= minimumPotentialAbility
      ) {
        const department = playerSquadDepartment(player);
        opportunityCountByDepartment.set(
          department,
          (opportunityCountByDepartment.get(department) ?? 0) + 1,
        );
      }
    }
  }
  if (opportunityCountByDepartment.size === 0) return [];

  const buyers = input.careerState.gameState.clubIds
    .flatMap((clubId): readonly Club[] => {
      const club = input.careerState.gameState.clubs[clubId];
      return club !== undefined
        && club.id !== input.careerState.selectedClubId
        && club.category === "first_division"
        ? [club]
        : [];
    })
    .sort((left, right) =>
      clubSquadAbility(input.careerState, right)
        - clubSquadAbility(input.careerState, left)
      || right.reputation - left.reputation
      || String(left.id).localeCompare(String(right.id))
    );
  const opportunities: AiMarketNeed[] = [];

  for (const department of departmentOrder()) {
    let remainingOpportunityCount =
      opportunityCountByDepartment.get(department) ?? 0;
    if (remainingOpportunityCount === 0) continue;
    for (const buyer of buyers) {
      if (remainingOpportunityCount === 0) break;
      if (
        !clubCanRecruit(
          input.careerState,
          buyer.id,
          input.marketBehaviorPolicy,
        )
      ) continue;
      const account = input.careerState.clubFinanceState?.accounts[buyer.id];
      if (account === undefined) continue;
      const wageLoadRatio = account.annualWageBudget <= 0
        ? 1
        : account.committedAnnualWage / account.annualWageBudget;
      const players = buyer.playerIds.flatMap((playerId): readonly Player[] => {
        const player = input.careerState.gameState.players[playerId];
        return player !== undefined
          && playerSquadDepartment(player) === department
          ? [player]
          : [];
      });
      opportunities.push({
        clubId: buyer.id,
        department,
        reasons: ["elite_prospect_opportunity"],
        priority: 0,
        currentDepth: players.length,
        targetDepth:
          input.marketBehaviorPolicy.aiLifecycle.targetDepartmentDepth[
            department
          ],
        averageAge: round(average(
          players.map((player) => playerAge(player, input.asOf)),
        )),
        averageAbility: round(average(
          players.map(
            (player) => derivePlayerMarketAbility(player).currentAbility,
          ),
        )),
        expiringContractCount: 0,
        wageLoadRatio: round(wageLoadRatio),
        canRecruit: true,
      });
      remainingOpportunityCount -= 1;
    }
  }
  return opportunities;
}

/**
 * Ranks exceptional-prospect buyers by the same role-aware ability used by the
 * market, so the rare opportunity goes to an established strong top-flight
 * squad before a newly promoted but similarly reputable club.
 */
function clubSquadAbility(
  careerState: CareerState,
  club: Club,
): number {
  return average(club.playerIds.flatMap((playerId): readonly number[] => {
    const player = careerState.gameState.players[playerId];
    return player === undefined
      ? []
      : [derivePlayerMarketAbility(player).currentAbility];
  }));
}

/** Resolves the six-star potential threshold from immutable rating content. */
function sixStarMinimumAbility(
  valuationConfig: PlayerValuationConfig,
): number {
  const threshold = valuationConfig.ratingScale.abilityThresholds.find(
    ({ rating }) => rating === 6,
  )?.minimumAbilityInclusive;
  if (threshold === undefined) {
    throw new Error("Player rating scale is missing its six-star threshold");
  }
  return threshold;
}

/** Shares the exact existing squad, wage, cash, and transfer-room gate. */
function clubCanRecruit(
  careerState: CareerState,
  clubId: ClubId,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): boolean {
  const club = careerState.gameState.clubs[clubId];
  const account = careerState.clubFinanceState?.accounts[clubId];
  if (club === undefined || account === undefined) return false;
  return club.playerIds.length
      < TARGET_CAREER_SQUAD_SIZE
        + marketBehaviorPolicy.aiLifecycle.maximumSquadAboveTarget
    && account.committedAnnualWage
      < percentageMoney(
        account.annualWageBudget,
        marketBehaviorPolicy.affordability.maximumWageBudgetUseBasisPoints,
      )
    && account.cashBalance
      > percentageMoney(
        account.annualWageBudget,
        marketBehaviorPolicy.affordability.minimumCashReserveBasisPoints,
      )
    && percentageMoney(
      account.availableTransferBudget,
      marketBehaviorPolicy.affordability.maximumTransferBudgetUseBasisPoints,
    ) > 0;
}

interface PreliminaryTarget {
  readonly player: Player;
  readonly terms: ReturnType<typeof deriveContractDemand>["preferredTerms"];
  readonly score: number;
}

function selectPreliminaryAgreementTarget(
  careerState: CareerState,
  marketTargets: readonly CareerMarketCatalogTarget[],
  need: AiMarketNeed,
  submittedOn: GameDate,
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): PreliminaryTarget | undefined {
  const buyer = careerState.gameState.clubs[need.clubId];
  if (buyer === undefined) return undefined;
  const contracts = activeContractsByPlayer(careerState);
  const candidates: PreliminaryTarget[] = [];

  for (const marketTarget of marketTargets) {
    if (marketTarget.employment.status !== "contracted") continue;
    const player = careerState.gameState.players[marketTarget.playerId];
    const contract = contracts.get(marketTarget.playerId);
    const currentClub = careerState.gameState.clubs[marketTarget.employment.clubId];
    const remainingDays = contract === undefined ? Number.POSITIVE_INFINITY : contract.endsOn - submittedOn;
    if (
      player === undefined
      || contract === undefined
      || currentClub === undefined
      || currentClub.id === buyer.id
      || currentClub.id === careerState.selectedClubId
      || playerSquadDepartment(player) !== need.department
      || remainingDays <= 0
      || remainingDays > marketBehaviorPolicy.aiLifecycle.preliminaryEligibilityDays
      || hasLivePreliminaryAgreement(careerState, player.id)
    ) continue;
    const willingness = derivePlayerWillingness({
      player,
      sellingClub: currentClub,
      buyingClub: buyer,
      currentTier: currentClub.category,
      destinationTier: buyer.category,
      currentDate: submittedOn,
      currentContract: contract,
      marketBehaviorPolicy,
      ratingScale: wagePolicy.ratingScale,
    });
    if (willingness.status === "rejected") continue;

    const demand = deriveContractDemand({
      careerState,
      wagePolicy,
      playerId: player.id,
      clubId: buyer.id,
      evaluatedOn: submittedOn,
      currentContract: contract,
      isFreeAgent: false,
    });
    if (!contractTermsAreAffordable(
      careerState,
      buyer.id,
      demand.preferredTerms,
      wagePolicy,
      marketBehaviorPolicy,
    )) continue;
    const ability = derivePlayerMarketAbility(player);
    const weights = marketBehaviorPolicy.aiTargetWeights;
    const roleNeedScore = Math.min(100, Math.max(
      0,
      (need.targetDepth - need.currentDepth) / Math.max(1, need.targetDepth) * 100,
    ));
    const account = careerState.clubFinanceState?.accounts[buyer.id];
    const wageCapacity = account === undefined
      ? 0
      : percentageMoney(
          account.annualWageBudget,
          marketBehaviorPolicy.affordability.maximumWageBudgetUseBasisPoints,
        );
    const wageRoom = account === undefined
      ? 0
      : Math.max(0, wageCapacity - account.committedAnnualWage);
    const affordabilityScore = Math.max(
      0,
      100 - Number(demand.preferredTerms.annualWage) / Math.max(1, wageRoom) * 100,
    );
    candidates.push({
      player,
      terms: demand.preferredTerms,
      score:
        ability.currentAbility / 20 * 100 * weights.quality
        + ability.potentialAbility / 20 * 100 * weights.potential
        + roleNeedScore * weights.roleNeed
        + affordabilityScore * weights.affordability,
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
  wagePolicy: PlayerWagePolicyConfig,
): ReturnType<typeof deriveContractDemand> | undefined {
  const currentContract = activeContractsByPlayer(careerState).get(negotiation.playerId);
  if (currentContract === undefined) return undefined;
  return deriveContractDemand({
    careerState,
    wagePolicy,
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
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): boolean {
  if (evaluateTransferFeeCapacity({
    careerState,
    buyingClubId: clubId,
    fee: transferFee,
    marketBehaviorPolicy,
  }).status === "unaffordable") {
    return false;
  }
  return evaluateCareerContractCapacity({
    careerState,
    clubId,
    wagePolicy,
    marketBehaviorPolicy,
    addedAnnualWage: terms.annualWage,
    addedSigningBonus: terms.bonuses.signingBonus,
    additionalImmediateCost: transferFee,
  }).status === "affordable";
}

function contractTermsAreAffordable(
  careerState: CareerState,
  clubId: ClubId,
  terms: ReturnType<typeof deriveContractDemand>["preferredTerms"],
  wagePolicy: PlayerWagePolicyConfig,
  marketBehaviorPolicy: MarketBehaviorCalibrationConfig,
): boolean {
  return evaluateCareerContractCapacity({
    careerState,
    clubId,
    wagePolicy,
    marketBehaviorPolicy,
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

function activeAiTalkCount(
  careerState: CareerState,
  clubId: ClubId,
  includeAgreedPreliminary: boolean,
): number {
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
      && (
        includeAgreedPreliminary
          ? isLivePreliminaryAgreement(agreement)
          : agreement.status === "offer_submitted" || agreement.status === "countered"
      );
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
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
}): readonly GameDate[] {
  const dates = new Set<GameDate>([input.throughDate]);
  for (
    let date = input.fromDate
      + input.marketBehaviorPolicy.aiLifecycle.preliminaryCheckpointDays;
    date < input.throughDate;
    date += input.marketBehaviorPolicy.aiLifecycle.preliminaryCheckpointDays
  ) {
    dates.add(date as GameDate);
  }
  for (const window of input.transferWindows.windows) {
    const first = Math.max(input.fromDate + 1, window.opensOn);
    const last = Math.min(input.throughDate, window.closesOn);
    for (
      let date = first;
      date <= last;
      date += input.marketBehaviorPolicy.aiLifecycle.permanentCheckpointDays
    ) {
      dates.add(date as GameDate);
    }
    if (window.closesOn > input.fromDate && window.closesOn <= input.throughDate) {
      dates.add(window.closesOn);
    }
  }
  for (const contractId of input.careerState.seniorSquadState?.activeContractIds ?? []) {
    const contract = input.careerState.seniorSquadState?.contracts[contractId];
    if (contract === undefined) continue;
    const eligibilityDate = contract.endsOn
      - input.marketBehaviorPolicy.aiLifecycle.preliminaryEligibilityDays;
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

function preliminaryLifecycleEvent(
  event: "offer_rejected" | "countered" | "agreed" | "expired" | "activated" | "activation_cancelled",
): AiMarketLifecycleFact["event"] {
  if (event === "offer_rejected") return "preliminary_offer_rejected";
  if (event === "countered") return "preliminary_offer_countered";
  if (event === "agreed") return "preliminary_agreed";
  if (event === "expired") return "preliminary_expired";
  if (event === "activated") return "preliminary_activated";
  return "preliminary_activation_cancelled";
}

function diagnosticFact(
  need: AiMarketNeed,
  occurredOn: GameDate,
  event: AiMarketDiagnosticFact["event"],
  reason?: AiMarketDiagnosticReason,
  playerId?: PlayerId,
): AiMarketDiagnosticFact {
  return {
    occurredOn,
    clubId: need.clubId,
    department: need.department,
    event,
    ...(reason === undefined ? {} : { reason }),
    ...(playerId === undefined ? {} : { playerId }),
    count: 1,
  };
}

function accumulateDiagnosticFacts(
  accumulator: Map<string, AiMarketDiagnosticFact>,
  facts: readonly AiMarketDiagnosticFact[],
): void {
  for (const fact of facts) {
    const key = [
      fact.clubId,
      fact.department,
      fact.event,
      fact.reason ?? "",
      fact.playerId ?? "",
      fact.transferWindowOpen === true ? "open" : "closed",
    ].join("|");
    const previous = accumulator.get(key);
    accumulator.set(key, previous === undefined
      ? fact
      : { ...previous, count: previous.count + fact.count });
  }
}

function isTransferWindowOpen(windows: SeasonTransferWindows, date: GameDate): boolean {
  return windows.windows.some((window) => date >= window.opensOn && date <= window.closesOn);
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

/** Maps one stable negotiation key into the configured finite offer spread. */
function stableOfferBucket(key: string, bucketCount: number): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) % Math.max(1, bucketCount);
}

/** Keeps sub-asking AI bids on the same whole-euro precision as public value. */
function floorMoneyToWholeEuro(value: Money): Money {
  return Math.floor(value / 100) * 100 as Money;
}

/** Applies one integer basis-point percentage without floating-point drift. */
function percentageMoney(value: Money, basisPoints: number): Money {
  return Number((BigInt(value) * BigInt(basisPoints)) / 10_000n) as Money;
}
