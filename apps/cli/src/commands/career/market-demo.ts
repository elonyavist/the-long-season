import {
  acceptTransferPlayerCounter,
  advanceTransferNegotiations,
  advanceTransferPlayerNegotiations,
  createTransferNegotiationId,
  deriveContractDemand,
  deriveTransferCommercialSnapshot,
  submitTransferOffer,
  submitTransferPlayerOffer,
  type ApplyCareerPermanentTransferInput,
  type ApplyCareerPermanentTransferResult,
  type PlayerValuationConfig,
  type SubmitTransferOfferInput,
} from "@game/engine";

/**
 * Runs the legacy CLI fixture through the canonical two-stage market workflow.
 *
 * The CLI keeps its deterministic inspection profiles, but it no longer owns a
 * direct transfer-commit path: seller reply, player terms, transfer-window
 * checks, affordability, and atomic completion all pass through Phase 79 use
 * cases.
 */
export function applyCareerMarketDemo(input: {
  readonly careerState: ApplyCareerPermanentTransferInput["careerState"];
  readonly intent: ApplyCareerPermanentTransferInput["intent"];
  readonly transferWindows: SubmitTransferOfferInput["transferWindows"];
  readonly valuationConfig: PlayerValuationConfig;
  readonly askingPriceConfig: SubmitTransferOfferInput["askingPriceConfig"];
  readonly wagePolicy: Parameters<typeof deriveContractDemand>[0]["wagePolicy"];
  readonly marketBehaviorPolicy: SubmitTransferOfferInput["marketBehaviorPolicy"];
}): ApplyCareerPermanentTransferResult {
  const submittedOn = input.careerState.gameState.calendar.currentDate;
  const commercial = deriveTransferCommercialSnapshot({
    careerState: input.careerState,
    sellingClubId: input.intent.sellingClubId,
    playerId: input.intent.playerId,
    asOf: submittedOn,
    valuationConfig: input.valuationConfig,
    askingPriceConfig: input.askingPriceConfig,
  });
  if (commercial === undefined) {
    return rejected(input, "seller_contract_not_found");
  }

  const negotiationId = createTransferNegotiationId(
    input.intent.buyingClubId,
    input.intent.playerId,
    1,
  );
  const submitted = submitTransferOffer({
    careerState: input.careerState,
    negotiationId,
    ...input.intent,
    offeredFee: commercial.currentAskingPrice,
    submittedOn,
    transferWindows: input.transferWindows,
    valuationConfig: input.valuationConfig,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    askingPriceConfig: input.askingPriceConfig,
  });
  if (submitted.status === "rejected") {
    return rejected(
      input,
      submitted.reason === "outside_transfer_window"
        ? "outside_transfer_window"
        : "seller_contract_not_found",
      commercial.currentAskingPrice,
    );
  }
  if (submitted.negotiation.status !== "submitted") {
    return rejected(input, "seller_contract_not_found", commercial.currentAskingPrice);
  }

  const clubReply = advanceTransferNegotiations({
    careerState: submitted.careerState,
    throughDate: submitted.negotiation.clock.responseDueOn,
    valuationConfig: input.valuationConfig,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  });
  const clubAgreement = clubReply.careerState.transferNegotiationState?.negotiations[negotiationId];
  if (clubAgreement?.status !== "accepted") {
    return rejected(
      input,
      clubAgreement?.status === "unaffordable"
        ? "insufficient_transfer_budget"
        : "seller_contract_not_found",
      commercial.currentAskingPrice,
      clubReply.careerState,
    );
  }

  const currentContract = input.careerState.seniorSquadState?.activeContractIds
    .map((contractId) => input.careerState.seniorSquadState?.contracts[contractId])
    .find((contract) =>
      contract?.playerId === input.intent.playerId
      && contract.clubId === input.intent.sellingClubId,
    );
  if (currentContract === undefined) {
    return rejected(input, "seller_contract_not_found", clubAgreement.agreedFee);
  }
  const preferredTerms = deriveContractDemand({
    careerState: clubReply.careerState,
    playerId: input.intent.playerId,
    clubId: input.intent.buyingClubId,
    evaluatedOn: clubAgreement.acceptedOn,
    currentContract,
    isFreeAgent: false,
    wagePolicy: input.wagePolicy,
  }).preferredTerms;
  const minimumDurationYears = Math.max(
    1,
    Math.ceil(Math.max(0, currentContract.endsOn - clubAgreement.acceptedOn - 90) / 365),
  );
  const terms = {
    ...preferredTerms,
    durationYears: Math.max(
      preferredTerms.durationYears,
      minimumDurationYears,
    ) as typeof preferredTerms.durationYears,
    annualWage: Math.max(
      preferredTerms.annualWage,
      currentContract.annualWage,
    ) as typeof preferredTerms.annualWage,
    squadStatus: currentContract.squadStatus,
  };
  const playerOffer = submitTransferPlayerOffer({
    careerState: clubReply.careerState,
    negotiationId,
    submittedOn: clubAgreement.acceptedOn,
    terms,
    transferWindows: input.transferWindows,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  });
  if (playerOffer.status === "rejected" || playerOffer.negotiation.status !== "player_offer_submitted") {
    return rejected(
      input,
      playerOffer.status === "rejected" && playerOffer.reason === "outside_transfer_window"
        ? "outside_transfer_window"
        : "seller_contract_not_found",
      clubAgreement.agreedFee,
      clubReply.careerState,
    );
  }

  const playerReply = advanceTransferPlayerNegotiations({
    careerState: playerOffer.careerState,
    throughDate: playerOffer.negotiation.clock.responseDueOn,
    transferWindows: input.transferWindows,
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
  });
  let finalState = playerReply.careerState;
  let finalNegotiation = finalState.transferNegotiationState?.negotiations[negotiationId];
  if (finalNegotiation?.status === "player_countered") {
    const acceptedCounter = acceptTransferPlayerCounter({
      careerState: finalState,
      negotiationId,
      decidedOn: finalNegotiation.counterIssuedOn,
      transferWindows: input.transferWindows,
      wagePolicy: input.wagePolicy,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
    });
    if (acceptedCounter.status === "applied") {
      finalState = acceptedCounter.careerState;
      finalNegotiation = acceptedCounter.negotiation;
    }
  }

  if (finalNegotiation?.status === "completed") {
    return {
      intent: input.intent,
      status: "accepted",
      reasons: [],
      transferFee: finalNegotiation.agreedFee,
      careerState: finalState,
      activatedContractId: finalNegotiation.activatedContractId,
      transferHistorySequence: finalNegotiation.transferHistorySequence,
    };
  }

  return rejected(
    input,
    finalNegotiation?.status === "player_rejected"
      ? "player_unwilling"
      : finalNegotiation?.status === "completion_failed"
        ? completionReason(finalNegotiation.reason)
        : "seller_contract_not_found",
    clubAgreement.agreedFee,
    finalState,
  );
}

function completionReason(
  reason:
    | "outside_transfer_window"
    | "stale_ownership"
    | "stale_contract"
    | "registration_unavailable"
    | "unaffordable",
): ApplyCareerPermanentTransferResult["reasons"][number]["code"] {
  if (reason === "outside_transfer_window") return reason;
  if (reason === "unaffordable") return "insufficient_transfer_budget";
  if (reason === "registration_unavailable") return reason;
  return "seller_contract_not_found";
}

function rejected(
  input: {
    readonly careerState: ApplyCareerPermanentTransferInput["careerState"];
    readonly intent: ApplyCareerPermanentTransferInput["intent"];
  },
  code: ApplyCareerPermanentTransferResult["reasons"][number]["code"],
  transferFee?: ApplyCareerPermanentTransferResult["transferFee"],
  careerState = input.careerState,
): ApplyCareerPermanentTransferResult {
  return {
    intent: input.intent,
    status: "rejected",
    reasons: [{
      code,
      clubId: input.intent.buyingClubId,
      playerId: input.intent.playerId,
    }],
    ...(transferFee === undefined ? {} : { transferFee }),
    careerState,
  };
}
