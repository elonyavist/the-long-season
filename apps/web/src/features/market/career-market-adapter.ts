import {
  DEFAULT_PLAYER_VALUATION_CONFIG,
  deriveMarketPendingExposure,
  derivePlayerValuation,
  derivePublicClubPlayerAssessments,
  evaluateCareerContractCapacity,
  evaluateMarketActionEligibility,
  evaluateTransferFeeCapacity,
  selectFreeAgentPlayerIds,
} from "@game/engine";
import { toISO } from "@game/shared";
import {
  careerMoneyFromMinorUnits,
  type CareerContractTermsInput,
  type CareerMarketFinanceView,
  type CareerMarketNegotiationInput,
  type CareerMarketOfferPreviewView,
  type CareerMarketTargetEligibility,
  type CareerMarketTargetInput,
  type CareerMarketViewInput,
} from "@game/ui";

import type { WebCareerState } from "../../runtime/web-career-runtime";
import { TACTICAL_BOARD_ROLE_CODES, TACTICAL_BOARD_ROLES } from "../tactics-board/tactical-board-roles";
import {
  buildTacticalBoardSquadPlayers,
  type TacticalBoardSquadPlayer,
} from "../tactics-board/tactical-board-squad";
import type { TacticalBoardRoleSuitability } from "../tactics-board/tactical-board-suitability";
import { resolveCareerTransferWindows } from "./market-transfer-windows";

type Money = CareerContractTermsInput["annualWage"];
type TransferNegotiationState = NonNullable<WebCareerState["transferNegotiationState"]>;
type TransferNegotiation = NonNullable<TransferNegotiationState["negotiations"][
  TransferNegotiationState["negotiationIds"][number]
]>;
type PreliminaryAgreementState = NonNullable<WebCareerState["preliminaryAgreementState"]>;
type PreliminaryAgreement = NonNullable<PreliminaryAgreementState["agreements"][
  PreliminaryAgreementState["agreementIds"][number]
]>;
type SeniorSquadState = NonNullable<WebCareerState["seniorSquadState"]>;
type ActiveContract = NonNullable<
  SeniorSquadState["contracts"][SeniorSquadState["activeContractIds"][number]]
>;
type ClubId = WebCareerState["gameState"]["clubIds"][number];
type GameDate = WebCareerState["gameState"]["calendar"]["currentDate"];

/** One in-progress market draft the manager is previewing before submission. */
export type MarketOfferDraft =
  | Readonly<{ kind: "transfer_offer"; playerId: string; fee: Money }>
  | Readonly<{ kind: "player_offer"; negotiationId: string; terms: CareerContractTermsInput }>
  | Readonly<{ kind: "counter_offer"; negotiationId: string; terms: CareerContractTermsInput }>
  | Readonly<{ kind: "preliminary_agreement"; playerId: string; terms: CareerContractTermsInput }>
  | Readonly<{ kind: "free_agent_offer"; playerId: string; terms: CareerContractTermsInput }>;

const OPEN_TRANSFER_STATUSES = new Set<TransferNegotiation["status"]>([
  "submitted",
  "countered",
  "accepted",
  "player_offer_submitted",
  "player_countered",
]);

const LIVE_PRELIMINARY_STATUSES = new Set<PreliminaryAgreement["status"]>([
  "offer_submitted",
  "countered",
  "agreed",
]);

/** Projects the complete Market source from canonical career facts in linear passes. */
export function presentCareerMarket(career: WebCareerState): CareerMarketViewInput {
  try {
    return buildReadyMarketPresentation(career);
  } catch {
    return { status: "error", messageKey: "career.market.error.missingData" };
  }
}

function buildReadyMarketPresentation(career: WebCareerState): CareerMarketViewInput {
  const seniorSquad = career.seniorSquadState;
  const selectedClub = career.gameState.clubs[career.selectedClubId];
  const finance = career.clubFinanceState?.accounts[career.selectedClubId];
  if (seniorSquad === undefined || selectedClub === undefined || finance === undefined) {
    throw new Error("Market source is incomplete.");
  }

  const currentDate = career.gameState.calendar.currentDate;
  const windows = resolveCareerTransferWindows(career);
  const transferWindowEligibility = evaluateMarketActionEligibility({
    action: "permanent_transfer_offer",
    windows,
    asOf: currentDate,
  });
  const window = transferWindowEligibility.status === "allowed"
    ? (() => {
        if (transferWindowEligibility.closesOn === undefined) {
          throw new Error("Open transfer window has no closing date.");
        }
        return {
          status: "open" as const,
          currentDateIso: toISO(currentDate),
          closesOnIso: toISO(transferWindowEligibility.closesOn),
        };
      })()
    : {
        status: "closed" as const,
        currentDateIso: toISO(currentDate),
        ...(transferWindowEligibility.nextOpensOn === undefined
          ? {}
          : { nextOpensOnIso: toISO(transferWindowEligibility.nextOpensOn) }),
      };

  const ownerByPlayerId = indexPlayerOwners(career);
  const contractByPlayerId = indexActiveContracts(seniorSquad);
  const assessmentByPlayerId = indexPublicAssessments(career, ownerByPlayerId);
  // Market targets are the senior population only: players owned by another
  // club plus the canonical free-agent pool. Academy players stay out of the
  // Market (no Youth UI in this phase), and the engine selector is the single
  // owner of what "free agent" means.
  const freeAgentIds = new Set(selectFreeAgentPlayerIds(career).map(String));
  const targetPlayers = career.gameState.playerIds.flatMap((playerId) => {
    const player = career.gameState.players[playerId];
    if (player === undefined) return [];
    const ownerId = ownerByPlayerId.get(String(player.id));
    if (ownerId === career.selectedClubId) return [];
    if (ownerId === undefined && !freeAgentIds.has(String(player.id))) return [];
    return [player];
  });
  const tacticalPlayerById = new Map(
    buildTacticalBoardSquadPlayers(targetPlayers.map((player) => {
      const dynamic = career.gameState.playerStates[player.id];
      const positionKey = player.naturalPositions[0];
      return {
        playerId: String(player.id),
        name: `${player.firstName} ${player.lastName}`,
        roleKey: broadRole(player.primaryRole),
        ...(positionKey === undefined ? {} : { positionKey }),
        ...(dynamic === undefined ? {} : { fitness: Number(dynamic.fitness) }),
      };
    })).map((player) => [player.playerId, player]),
  );
  const selectedOpenTransferByPlayerId = indexSelectedOpenTransfers(career);
  const selectedLivePreliminaryByPlayerId = indexSelectedLivePreliminaryAgreements(career);

  const targets: CareerMarketTargetInput[] = targetPlayers.map((player) => {
    const playerId = String(player.id);
    const ownerId = ownerByPlayerId.get(playerId);
    const owner = ownerId === undefined ? undefined : career.gameState.clubs[ownerId];
    const contract = contractByPlayerId.get(playerId);
    const dynamic = career.gameState.playerStates[player.id];
    const assessment = assessmentByPlayerId.get(playerId);
    const tacticalPlayer = tacticalPlayerById.get(playerId);
    if (
      dynamic === undefined
      || assessment === undefined
      || tacticalPlayer === undefined
      || (owner !== undefined && contract === undefined)
    ) {
      throw new Error(`Market target is incomplete: ${playerId}`);
    }

    const valuation = derivePlayerValuation({
      player,
      club: owner ?? selectedClub,
      currentDate,
      ...(contract === undefined ? {} : { contract }),
      currentForm: Number(dynamic.form),
      config: DEFAULT_PLAYER_VALUATION_CONFIG,
    });
    const remainingDays = contract === undefined ? undefined : Math.max(0, contract.endsOn - currentDate);

    return {
      playerId,
      firstName: player.firstName,
      lastName: player.lastName,
      age: valuation.age,
      primaryRole: tacticalPlayer.primaryRole,
      roleFits: roleSuitabilities(tacticalPlayer),
      condition: Number(dynamic.fitness),
      form: Number(dynamic.form),
      morale: Number(dynamic.morale),
      currentLevel: assessment.currentLevel,
      potentialLevel: assessment.potentialLevel,
      value: valuation.value,
      currency: finance.currency,
      employment: owner === undefined || contract === undefined
        ? { status: "free_agent" }
        : {
            status: "contracted",
            clubId: String(owner.id),
            clubName: owner.name,
            contractEndsOnIso: toISO(contract.endsOn),
            contractRemainingDays: remainingDays ?? 0,
          },
      availability: owner === undefined ? "free_agent" : "negotiable",
      eligibility: targetEligibility({
        playerId,
        isFreeAgent: owner === undefined,
        remainingDays,
        windows,
        currentDate,
        transferWindowEligibility,
        hasOpenTransfer: selectedOpenTransferByPlayerId.has(playerId),
        hasLivePreliminary: selectedLivePreliminaryByPlayerId.has(playerId),
      }),
    };
  });

  const negotiations = buildNegotiationViews(career);
  const pendingExposure = buildPendingExposure(career);

  return {
    status: "ready",
    competitionName: competitionName(String(windows.competitionId)),
    window,
    finance: { ...baseFinanceView(finance), pendingExposure },
    targets,
    negotiations,
  };
}

/** Builds the actual (non-pending) finance facts shared by the overview and every offer preview. */
function baseFinanceView(
  finance: NonNullable<WebCareerState["clubFinanceState"]>["accounts"][ClubId],
): Omit<CareerMarketFinanceView, "pendingExposure"> {
  return {
    currency: finance.currency,
    cashBalance: finance.cashBalance,
    transferBudget: finance.availableTransferBudget,
    annualWageBudget: finance.annualWageBudget,
    committedAnnualWage: finance.committedAnnualWage,
    annualWageHeadroom: careerMoneyFromMinorUnits(
      Math.max(0, finance.annualWageBudget - finance.committedAnnualWage),
    ),
  };
}

/**
 * Previews one market draft through the canonical finance boundary.
 *
 * The browser never recreates transfer-budget or wage-cap rules: every branch
 * delegates affordability to the matching engine query and only composes the
 * already-derived integer minor-unit results into one before/after view.
 */
export function previewMarketOffer(
  career: WebCareerState,
  draft: MarketOfferDraft,
): CareerMarketOfferPreviewView {
  const previewId = draftPreviewId(draft);
  const finance = career.clubFinanceState?.accounts[career.selectedClubId];
  if (finance === undefined) return { status: "blocked", previewId, reason: "missing_finance" };
  const currentFinance = baseFinanceView(finance);
  const existingPendingExposure = buildPendingExposure(career);

  if (draft.kind === "transfer_offer") {
    const capacity = evaluateTransferFeeCapacity({
      careerState: career,
      buyingClubId: career.selectedClubId,
      fee: draft.fee,
    });
    if (capacity.status === "unaffordable") return { status: "blocked", previewId, reason: capacity.reason };
    return {
      status: "ready",
      previewId,
      kind: "transfer_offer",
      transferFee: draft.fee,
      currentFinance,
      projectedFinance: {
        ...currentFinance,
        transferBudget: capacity.projectedTransferBudget,
        cashBalance: capacity.projectedCash,
      },
      existingPendingExposure,
    };
  }

  if (draft.kind === "preliminary_agreement" || draft.kind === "free_agent_offer") {
    const capacity = evaluateCareerContractCapacity({
      careerState: career,
      clubId: career.selectedClubId,
      addedAnnualWage: draft.terms.annualWage,
      addedSigningBonus: draft.terms.bonuses.signingBonus,
    });
    if (capacity.status === "unaffordable") return { status: "blocked", previewId, reason: capacity.reason };
    return {
      status: "ready",
      previewId,
      kind: draft.kind,
      transferFee: careerMoneyFromMinorUnits(0),
      contractTerms: draft.terms,
      currentFinance,
      projectedFinance: {
        ...currentFinance,
        committedAnnualWage: capacity.requiredAnnualWage,
        annualWageHeadroom: careerMoneyFromMinorUnits(
          Math.max(0, capacity.availableAnnualWageBudget - capacity.requiredAnnualWage),
        ),
        cashBalance: careerMoneyFromMinorUnits(capacity.availableCash - capacity.requiredCash),
      },
      existingPendingExposure,
    };
  }

  const negotiation = findTransferNegotiationByRawId(career, draft.negotiationId);
  if (negotiation === undefined || !("agreedFee" in negotiation)) {
    return { status: "blocked", previewId, reason: "negotiation_not_found" };
  }
  const fee = negotiation.agreedFee;
  const feeCapacity = evaluateTransferFeeCapacity({
    careerState: career,
    buyingClubId: negotiation.buyingClubId,
    fee,
  });
  if (feeCapacity.status === "unaffordable") return { status: "blocked", previewId, reason: feeCapacity.reason };
  const wageCapacity = evaluateCareerContractCapacity({
    careerState: career,
    clubId: negotiation.buyingClubId,
    addedAnnualWage: draft.terms.annualWage,
    addedSigningBonus: draft.terms.bonuses.signingBonus,
    additionalImmediateCost: fee,
  });
  if (wageCapacity.status === "unaffordable") return { status: "blocked", previewId, reason: wageCapacity.reason };
  return {
    status: "ready",
    previewId,
    kind: draft.kind,
    transferFee: fee,
    contractTerms: draft.terms,
    currentFinance,
    projectedFinance: {
      ...currentFinance,
      transferBudget: feeCapacity.projectedTransferBudget,
      cashBalance: careerMoneyFromMinorUnits(wageCapacity.availableCash - wageCapacity.requiredCash),
      committedAnnualWage: wageCapacity.requiredAnnualWage,
      annualWageHeadroom: careerMoneyFromMinorUnits(
        Math.max(0, wageCapacity.availableAnnualWageBudget - wageCapacity.requiredAnnualWage),
      ),
    },
    existingPendingExposure,
  };
}

/** Stable preview identity so the UI can key repeated previews without new IDs. */
function draftPreviewId(draft: MarketOfferDraft): string {
  return draft.kind === "player_offer" || draft.kind === "counter_offer"
    ? `${draft.kind}:${draft.negotiationId}`
    : `${draft.kind}:${draft.playerId}`;
}

/** Finds one transfer negotiation by its stringified runtime identity. */
function findTransferNegotiationByRawId(
  career: WebCareerState,
  rawNegotiationId: string,
): TransferNegotiation | undefined {
  const state = career.transferNegotiationState;
  if (state === undefined) return undefined;
  for (const negotiationId of state.negotiationIds) {
    if (String(negotiationId) === rawNegotiationId) return state.negotiations[negotiationId];
  }
  return undefined;
}

function indexPlayerOwners(career: WebCareerState): ReadonlyMap<string, ClubId> {
  const ownerByPlayerId = new Map<string, ClubId>();
  for (const clubId of career.gameState.clubIds) {
    const club = career.gameState.clubs[clubId];
    if (club === undefined) continue;
    for (const playerId of club.playerIds) ownerByPlayerId.set(String(playerId), clubId);
  }
  return ownerByPlayerId;
}

function indexActiveContracts(seniorSquad: SeniorSquadState): ReadonlyMap<string, ActiveContract> {
  const contractByPlayerId = new Map<string, ActiveContract>();
  for (const contractId of seniorSquad.activeContractIds) {
    const contract = seniorSquad.contracts[contractId];
    if (contract !== undefined) contractByPlayerId.set(String(contract.playerId), contract);
  }
  return contractByPlayerId;
}

function indexPublicAssessments(
  career: WebCareerState,
  ownerByPlayerId: ReadonlyMap<string, ClubId>,
) {
  const assessmentByPlayerId = new Map<
    string,
    ReturnType<typeof derivePublicClubPlayerAssessments>[number]
  >();
  for (const clubId of career.gameState.clubIds) {
    const club = career.gameState.clubs[clubId];
    if (club === undefined) continue;
    const players = club.playerIds.flatMap((playerId) => {
      const player = career.gameState.players[playerId];
      return player === undefined ? [] : [player];
    });
    for (const assessment of derivePublicClubPlayerAssessments(players)) {
      assessmentByPlayerId.set(String(assessment.playerId), assessment);
    }
  }

  const freeAgents = career.gameState.playerIds.flatMap((playerId) => {
    const player = career.gameState.players[playerId];
    return player === undefined || ownerByPlayerId.has(String(player.id)) ? [] : [player];
  });
  const selectedClub = career.gameState.clubs[career.selectedClubId];
  const selectedPlayers = selectedClub?.playerIds.flatMap((playerId) => {
    const player = career.gameState.players[playerId];
    return player === undefined ? [] : [player];
  }) ?? [];
  for (const assessment of derivePublicClubPlayerAssessments([...selectedPlayers, ...freeAgents])) {
    if (!ownerByPlayerId.has(String(assessment.playerId))) {
      assessmentByPlayerId.set(String(assessment.playerId), assessment);
    }
  }
  return assessmentByPlayerId;
}

function indexSelectedOpenTransfers(career: WebCareerState): ReadonlySet<string> {
  const playerIds = new Set<string>();
  for (const negotiationId of career.transferNegotiationState?.negotiationIds ?? []) {
    const negotiation = career.transferNegotiationState?.negotiations[negotiationId];
    if (
      negotiation !== undefined
      && negotiation.buyingClubId === career.selectedClubId
      && OPEN_TRANSFER_STATUSES.has(negotiation.status)
    ) {
      playerIds.add(String(negotiation.playerId));
    }
  }
  return playerIds;
}

function indexSelectedLivePreliminaryAgreements(career: WebCareerState): ReadonlySet<string> {
  const playerIds = new Set<string>();
  for (const agreementId of career.preliminaryAgreementState?.agreementIds ?? []) {
    const agreement = career.preliminaryAgreementState?.agreements[agreementId];
    if (
      agreement !== undefined
      && agreement.offeringClubId === career.selectedClubId
      && LIVE_PRELIMINARY_STATUSES.has(agreement.status)
    ) {
      playerIds.add(String(agreement.playerId));
    }
  }
  return playerIds;
}

function targetEligibility(input: Readonly<{
  playerId: string;
  isFreeAgent: boolean;
  remainingDays: number | undefined;
  windows: Parameters<typeof evaluateMarketActionEligibility>[0]["windows"];
  currentDate: Parameters<typeof evaluateMarketActionEligibility>[0]["asOf"];
  transferWindowEligibility: ReturnType<typeof evaluateMarketActionEligibility>;
  hasOpenTransfer: boolean;
  hasLivePreliminary: boolean;
}>): CareerMarketTargetEligibility {
  if (input.hasOpenTransfer) {
    return { status: "blocked", reason: "negotiation_already_open" };
  }
  if (input.hasLivePreliminary) {
    return { status: "blocked", reason: "future_agreement_already_exists" };
  }
  if (input.isFreeAgent) {
    const eligibility = evaluateMarketActionEligibility({
      action: "external_free_agent_registration",
      windows: input.windows,
      asOf: input.currentDate,
    });
    return eligibility.status === "allowed"
      ? { status: "allowed", action: "submit_free_agent_contract_offer" }
      : {
          status: "blocked",
          reason: "outside_transfer_window",
          ...(eligibility.nextOpensOn === undefined
            ? {}
            : { nextAllowedOnIso: toISO(eligibility.nextOpensOn) }),
        };
  }
  if (input.transferWindowEligibility.status === "allowed") {
    return { status: "allowed", action: "submit_transfer_offer" };
  }

  const preliminaryEligibility = evaluateMarketActionEligibility({
    action: "preliminary_agreement",
    windows: input.windows,
    asOf: input.currentDate,
    ...(input.remainingDays === undefined ? {} : { targetContractRemainingDays: input.remainingDays }),
  });
  if (preliminaryEligibility.status === "allowed") {
    return { status: "allowed", action: "submit_preliminary_agreement" };
  }
  return {
    status: "blocked",
    reason: "outside_transfer_window",
    ...(input.transferWindowEligibility.nextOpensOn === undefined
      ? {}
      : { nextAllowedOnIso: toISO(input.transferWindowEligibility.nextOpensOn) }),
  };
}

function buildPendingExposure(career: WebCareerState) {
  const renewalExposure = deriveMarketPendingExposure(career, career.selectedClubId);
  let transferFees = 0;
  let annualWages = Number(renewalExposure.pendingAnnualWageExposure);
  let signingBonuses = Number(renewalExposure.pendingSigningExposure);
  let openNegotiationCount = 0;

  for (const negotiationId of career.transferNegotiationState?.negotiationIds ?? []) {
    const negotiation = career.transferNegotiationState?.negotiations[negotiationId];
    if (
      negotiation === undefined
      || negotiation.buyingClubId !== career.selectedClubId
      || !OPEN_TRANSFER_STATUSES.has(negotiation.status)
    ) continue;
    openNegotiationCount += 1;
    transferFees += transferFeeFor(negotiation) ?? 0;
    const terms = transferTermsFor(negotiation);
    annualWages += Number(terms?.annualWage ?? 0);
    signingBonuses += Number(terms?.bonuses.signingBonus ?? 0);
  }
  for (const agreementId of career.preliminaryAgreementState?.agreementIds ?? []) {
    const agreement = career.preliminaryAgreementState?.agreements[agreementId];
    if (
      agreement === undefined
      || agreement.offeringClubId !== career.selectedClubId
      || !LIVE_PRELIMINARY_STATUSES.has(agreement.status)
    ) continue;
    openNegotiationCount += 1;
    const terms = preliminaryTermsFor(agreement);
    annualWages += Number(terms?.annualWage ?? 0);
    signingBonuses += Number(terms?.bonuses.signingBonus ?? 0);
  }
  for (const negotiationId of career.contractNegotiationState?.negotiationIds ?? []) {
    const negotiation = career.contractNegotiationState?.negotiations[negotiationId];
    if (
      negotiation?.clubId === career.selectedClubId
      && (negotiation.status === "awaiting_response" || negotiation.status === "countered")
    ) {
      openNegotiationCount += 1;
    }
  }

  return {
    transferFees: careerMoneyFromMinorUnits(transferFees),
    annualWages: careerMoneyFromMinorUnits(annualWages),
    signingBonuses: careerMoneyFromMinorUnits(signingBonuses),
    immediateCash: careerMoneyFromMinorUnits(transferFees + signingBonuses),
    openNegotiationCount,
  };
}

function buildNegotiationViews(career: WebCareerState): readonly CareerMarketNegotiationInput[] {
  const views: CareerMarketNegotiationInput[] = [];
  for (const negotiationId of career.transferNegotiationState?.negotiationIds ?? []) {
    const negotiation = career.transferNegotiationState?.negotiations[negotiationId];
    if (
      negotiation === undefined
      || (
        negotiation.buyingClubId !== career.selectedClubId
        && negotiation.sellingClubId !== career.selectedClubId
      )
    ) continue;
    const player = career.gameState.players[negotiation.playerId];
    const counterpartId = negotiation.buyingClubId === career.selectedClubId
      ? negotiation.sellingClubId
      : negotiation.buyingClubId;
    if (player === undefined) continue;
    const counterpartClubName = career.gameState.clubs[counterpartId]?.name;
    const deadline = transferDeadline(negotiation);
    const resolvedOn = transferResolvedOn(negotiation);
    const transferFee = transferFeeFor(negotiation);
    const terms = transferTermsFor(negotiation);
    const offeredTerms = negotiation.status === "player_offer_submitted" || negotiation.status === "player_countered"
      ? negotiation.offeredTerms
      : undefined;
    const counterTerms = negotiation.status === "player_countered" ? negotiation.counterTerms : undefined;
    views.push({
      negotiationId: String(negotiation.id),
      playerId: String(player.id),
      playerName: `${player.firstName} ${player.lastName}`,
      ...(counterpartClubName === undefined ? {} : { counterpartClubName }),
      stage: negotiation.status === "player_offer_submitted" || negotiation.status === "player_countered"
        ? "player"
        : "club",
      status: negotiation.status,
      openedOnIso: toISO(transferOpenedOn(negotiation)),
      ...(deadline === undefined ? {} : { deadlineOnIso: toISO(deadline) }),
      ...(resolvedOn === undefined ? {} : { resolvedOnIso: toISO(resolvedOn) }),
      ...(transferFee === undefined ? {} : { transferFee }),
      ...(terms === undefined ? {} : { annualWage: terms.annualWage }),
      ...(offeredTerms === undefined ? {} : { offeredTerms: toCareerContractTermsInput(offeredTerms) }),
      ...(counterTerms === undefined ? {} : { counterTerms: toCareerContractTermsInput(counterTerms) }),
      ...("reason" in negotiation ? { outcomeReason: negotiation.reason } : {}),
    });
  }

  for (const agreementId of career.preliminaryAgreementState?.agreementIds ?? []) {
    const agreement = career.preliminaryAgreementState?.agreements[agreementId];
    if (agreement === undefined || agreement.offeringClubId !== career.selectedClubId) continue;
    const player = career.gameState.players[agreement.playerId];
    if (player === undefined) continue;
    const counterpartClubName = career.gameState.clubs[agreement.currentClubId]?.name;
    const deadline = preliminaryDeadline(agreement);
    const resolvedOn = preliminaryResolvedOn(agreement);
    const terms = preliminaryTermsFor(agreement);
    const offeredTerms = agreement.status === "offer_submitted" || agreement.status === "countered"
      ? agreement.offeredTerms
      : undefined;
    const counterTerms = agreement.status === "countered" ? agreement.counterTerms : undefined;
    views.push({
      negotiationId: String(agreement.id),
      playerId: String(player.id),
      playerName: `${player.firstName} ${player.lastName}`,
      ...(counterpartClubName === undefined ? {} : { counterpartClubName }),
      stage: "preliminary_agreement",
      status: agreement.status,
      openedOnIso: toISO(agreement.createdOn),
      ...(deadline === undefined ? {} : { deadlineOnIso: toISO(deadline) }),
      ...(resolvedOn === undefined ? {} : { resolvedOnIso: toISO(resolvedOn) }),
      ...(offeredTerms === undefined ? {} : { offeredTerms: toCareerContractTermsInput(offeredTerms) }),
      ...(counterTerms === undefined ? {} : { counterTerms: toCareerContractTermsInput(counterTerms) }),
      ...(terms === undefined ? {} : { annualWage: terms.annualWage }),
      ...("reason" in agreement ? { outcomeReason: agreement.reason } : {}),
    });
  }
  return views;
}

function transferOpenedOn(negotiation: TransferNegotiation): GameDate {
  switch (negotiation.status) {
    case "submitted":
    case "countered":
      return negotiation.submittedOn;
    case "accepted":
      return negotiation.acceptedOn;
    case "player_offer_submitted":
    case "player_countered":
      return negotiation.clubAcceptedOn;
    case "player_rejected":
    case "rejected":
      return negotiation.rejectedOn;
    case "player_expired":
    case "expired":
      return negotiation.expiredOn;
    case "completion_failed":
      return negotiation.failedOn;
    case "completed":
      return negotiation.completedOn;
    case "withdrawn":
      return negotiation.withdrawnOn;
    case "unaffordable":
      return negotiation.cancelledOn;
  }
}

function transferDeadline(negotiation: TransferNegotiation): GameDate | undefined {
  return "clock" in negotiation ? negotiation.clock.deadline : undefined;
}

function transferResolvedOn(negotiation: TransferNegotiation): GameDate | undefined {
  switch (negotiation.status) {
    case "submitted":
    case "countered":
    case "accepted":
    case "player_offer_submitted":
    case "player_countered":
      return undefined;
    case "player_rejected":
    case "rejected":
      return negotiation.rejectedOn;
    case "player_expired":
    case "expired":
      return negotiation.expiredOn;
    case "completion_failed":
      return negotiation.failedOn;
    case "completed":
      return negotiation.completedOn;
    case "withdrawn":
      return negotiation.withdrawnOn;
    case "unaffordable":
      return negotiation.cancelledOn;
  }
}

/** Copies a domain-shaped offer into the presentation-safe annual-terms input. */
function toCareerContractTermsInput(terms: {
  readonly durationYears: number;
  readonly annualWage: Money;
  readonly squadStatus: CareerContractTermsInput["squadStatus"];
  readonly bonuses: CareerContractTermsInput["bonuses"];
}): CareerContractTermsInput {
  return {
    durationYears: terms.durationYears,
    annualWage: terms.annualWage,
    squadStatus: terms.squadStatus,
    bonuses: { ...terms.bonuses },
  };
}

function transferFeeFor(
  negotiation: TransferNegotiation,
): CareerMarketNegotiationInput["transferFee"] {
  if (negotiation.status === "submitted") return negotiation.offeredFee;
  if (negotiation.status === "countered") return negotiation.counterFee;
  return "agreedFee" in negotiation ? negotiation.agreedFee : undefined;
}

function transferTermsFor(negotiation: TransferNegotiation) {
  if (negotiation.status === "player_offer_submitted") return negotiation.offeredTerms;
  if (negotiation.status === "player_countered") return negotiation.counterTerms;
  if (negotiation.status === "completed") return negotiation.acceptedTerms;
  return undefined;
}

function preliminaryDeadline(agreement: PreliminaryAgreement): GameDate | undefined {
  return "clock" in agreement ? agreement.clock.deadline : undefined;
}

function preliminaryResolvedOn(agreement: PreliminaryAgreement): GameDate | undefined {
  switch (agreement.status) {
    case "offer_submitted":
    case "countered":
    case "agreed":
      return undefined;
    case "rejected":
      return agreement.rejectedOn;
    case "withdrawn":
      return agreement.withdrawnOn;
    case "expired":
      return agreement.expiredOn;
    case "activation_cancelled":
      return agreement.cancelledOn;
    case "activated":
      return agreement.activatedOn;
  }
}

function preliminaryTermsFor(agreement: PreliminaryAgreement) {
  if (agreement.status === "offer_submitted") return agreement.offeredTerms;
  if (agreement.status === "countered") return agreement.counterTerms;
  if (
    agreement.status === "agreed"
    || agreement.status === "activation_cancelled"
    || agreement.status === "activated"
  ) return agreement.agreedTerms;
  return undefined;
}

function roleSuitabilities(player: TacticalBoardSquadPlayer): CareerMarketTargetInput["roleFits"] {
  return TACTICAL_BOARD_ROLE_CODES.map((roleCode) => ({
    role: TACTICAL_BOARD_ROLES[roleCode].canonicalRole,
    suitability: toPositionSuitability(player.suitabilityByRole[roleCode]),
    isPrimary: TACTICAL_BOARD_ROLES[roleCode].canonicalRole === player.primaryRole,
  }));
}

function toPositionSuitability(
  suitability: TacticalBoardRoleSuitability,
): CareerMarketTargetInput["roleFits"][number]["suitability"] {
  if (suitability === "natural") return "natural";
  if (suitability === "accomplished" || suitability === "competent") return "adapted";
  return "weak";
}

function broadRole(role: string | undefined): "goalkeeper" | "defender" | "midfielder" | "attacker" {
  if (role === "goalkeeper") return "goalkeeper";
  if (role === "center_back" || role === "full_back") return "defender";
  if (role === "striker" || role === "wide_forward") return "attacker";
  return "midfielder";
}

function competitionName(competitionId: string): string {
  if (competitionId === "competition:demo-third-division") return "Demo Third Division";
  return competitionId;
}
