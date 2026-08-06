import {
  selectPlayerWagePolicyConfig,
} from "@game/content";
import {
  checkContractOfferAffordability,
  derivePlayerValuation,
  derivePublicPlayerAssessment,
  findNextFixtureEligibilityBlockers,
  playerSquadDepartment,
  selectCareerPlayerStatistics,
  type CareerFinanceRejectionReason,
  type PlayerValuationConfig,
} from "@game/engine";
import { toISO } from "@game/shared";
import {
  CAREER_MATCH_PREPARATION_FORMATIONS,
  buildCareerPlayerProfileView,
  careerMoneyFromMinorUnits,
  hasCareerContractExpiryAlert,
  type CareerContractBonusField,
  type CareerContractHistoryInput,
  type CareerContractNegotiationInput,
  type CareerContractTermsInput,
  type CareerPlayerProfileView,
  type CareerSquadPlayerInput,
  type CareerSquadSelection,
} from "@game/ui";

import type { WebCareerState } from "../../runtime/web-career-runtime";
import type { MatchPreparationDraft } from "../match-preparation/match-preparation-adapter";
import { matchPreparationBenchSlotKeys } from "../match-preparation/match-preparation-adapter";
import { TACTICAL_BOARD_ROLE_CODES, TACTICAL_BOARD_ROLES } from "../tactics-board/tactical-board-roles";
import {
  buildTacticalBoardSquadPlayers,
  type TacticalBoardSquadPlayer,
} from "../tactics-board/tactical-board-squad";
import type { TacticalBoardRoleSuitability } from "../tactics-board/tactical-board-suitability";
import type { CareerSquadPlacementSlot } from "./career-squad-placement";

type Money = CareerContractTermsInput["annualWage"];
type ContractOfferTerms = CareerContractTermsInput;
type SeniorSquadState = NonNullable<WebCareerState["seniorSquadState"]>;
type PlayerContractId = SeniorSquadState["activeContractIds"][number];
type ActivePlayerContract = NonNullable<SeniorSquadState["contracts"][PlayerContractId]>;
type ContractNegotiationState = NonNullable<WebCareerState["contractNegotiationState"]>;
type ContractNegotiation = ContractNegotiationState["negotiations"][
  ContractNegotiationState["negotiationIds"][number]
];

/** Complete real-data projection consumed by the current Squad workspace. */
export type CareerSquadPresentation =
  | Readonly<{
      status: "ready";
      selectedClubName: string;
      currentDateIso: string;
      players: readonly CareerSquadPlayerInput[];
      profilesByPlayerId: ReadonlyMap<string, CareerPlayerProfileView>;
      placementContext: Readonly<{
        lineupSlots: readonly CareerSquadPlacementSlot[];
        benchSlots: readonly CareerSquadPlacementSlot[];
      }>;
    }>
  | Readonly<{
      status: "error";
      selectedClubName: string;
      currentDateIso: string;
      messageKey: "career.squad.error.missingData";
    }>;

/** Engine-backed before/after finance projection for one renewal draft. */
export type CareerContractFinancePreview =
  | Readonly<{
      status: "affordable";
      currentCommittedAnnualWage: Money;
      projectedCommittedAnnualWage: Money;
      annualWageBudget: Money;
      currentRemainingAnnualWageBudget: Money;
      projectedRemainingAnnualWageBudget: Money;
      currentCashBalance: Money;
      projectedCashBalance: Money;
    }>
  | Readonly<{
      status: "rejected";
      reason: CareerFinanceRejectionReason | "contract_context_missing";
      requiredAmount?: Money;
      availableAmount?: Money;
    }>;

/**
 * Previews one renewal through the canonical finance boundary.
 *
 * The browser component receives the completed integer-money projection and
 * never recreates wage-cap or signing-cash rules.
 */
export function previewCareerContractOffer(
  career: WebCareerState,
  playerId: string,
  terms: ContractOfferTerms,
): CareerContractFinancePreview {
  const finance = career.clubFinanceState?.accounts[career.selectedClubId];
  const seniorSquad = career.seniorSquadState;
  const contractId = seniorSquad?.activeContractIds.find((candidateId) => {
    const contract = seniorSquad.contracts[candidateId];
    return contract?.clubId === career.selectedClubId && String(contract.playerId) === playerId;
  });
  if (finance === undefined || contractId === undefined) {
    return { status: "rejected", reason: "contract_context_missing" };
  }

  const result = checkContractOfferAffordability({
    careerState: career,
    clubId: career.selectedClubId,
    replacedContractId: contractId,
    terms,
    wagePolicy: selectPlayerWagePolicyConfig(
      career.gameState.meta.calibrationVersions,
    ),
  });
  if (result.status === "rejected") {
    return {
      status: "rejected",
      reason: result.reason,
      ...(result.requiredAmount === undefined ? {} : { requiredAmount: result.requiredAmount }),
      ...(result.availableAmount === undefined ? {} : { availableAmount: result.availableAmount }),
    };
  }

  return {
    status: "affordable",
    currentCommittedAnnualWage: finance.committedAnnualWage,
    projectedCommittedAnnualWage: result.projectedCommittedAnnualWage,
    annualWageBudget: result.availableAnnualWageBudget,
    currentRemainingAnnualWageBudget: subtractCareerMoney(
      finance.annualWageBudget,
      finance.committedAnnualWage,
    ),
    projectedRemainingAnnualWageBudget: subtractCareerMoney(
      result.availableAnnualWageBudget,
      result.projectedCommittedAnnualWage,
    ),
    currentCashBalance: result.availableCash,
    projectedCashBalance: subtractCareerMoney(result.availableCash, terms.bonuses.signingBonus),
  };
}

/**
 * Projects the selected club's canonical roster without copying football rules.
 *
 * Hidden ability numbers remain inside the engine. The web receives only
 * public global ratings, exact current attributes, and deterministic
 * market value already derived by approved package APIs.
 */
export function presentCareerSquad(
  career: WebCareerState,
  draft: MatchPreparationDraft,
  valuationConfig: PlayerValuationConfig,
): CareerSquadPresentation {
  const club = career.gameState.clubs[career.selectedClubId];
  const currentDate = career.gameState.calendar.currentDate;
  const currentDateIso = toISO(currentDate);
  if (club === undefined) {
    return missingData("", currentDateIso);
  }

  const seniorSquad = career.seniorSquadState;
  const finance = career.clubFinanceState?.accounts[career.selectedClubId];
  if (seniorSquad === undefined || finance === undefined) {
    return missingData(club.name, currentDateIso);
  }

  const players = club.playerIds.flatMap((playerId) => {
    const player = career.gameState.players[playerId];
    return player === undefined ? [] : [player];
  });
  if (players.length !== club.playerIds.length) {
    return missingData(club.name, currentDateIso);
  }

  const formation = CAREER_MATCH_PREPARATION_FORMATIONS.find(
    (candidate) => candidate.formationId === draft.selectedFormationId,
  );
  if (
    formation === undefined
    || draft.tacticalBoardDraft.baseFormationId !== draft.selectedFormationId
    || formation.slots.length !== draft.tacticalBoardDraft.slots.length
  ) {
    return missingData(club.name, currentDateIso);
  }
  const formationSlotByKey = new Map(formation.slots.map((slot) => [slot.slotKey, slot]));
  if (
    formationSlotByKey.size !== formation.slots.length
    || draft.tacticalBoardDraft.slots.some((slot) => !formationSlotByKey.has(slot.slotId))
  ) {
    return missingData(club.name, currentDateIso);
  }

  const tacticalPlayers = buildTacticalBoardSquadPlayers(
    players.map((player) => {
      const positionKey = player.naturalPositions[0];
      const fitness = career.gameState.playerStates[player.id]?.fitness;
      return {
        playerId: String(player.id),
        name: `${player.firstName} ${player.lastName}`,
        roleKey: playerSquadDepartment(player),
        ...(positionKey === undefined ? {} : { positionKey }),
        ...(fitness === undefined ? {} : { fitness }),
      };
    }),
  );
  const tacticalPlayerById = new Map(tacticalPlayers.map((player) => [player.playerId, player]));
  const dynamicStateByPlayerId = new Map(
    players.flatMap((player) => {
      const dynamicState = career.gameState.playerStates[player.id];
      return dynamicState === undefined ? [] : [[String(player.id), dynamicState] as const];
    }),
  );
  const assessmentById = new Map(
    players.map((player) => {
      const assessment = derivePublicPlayerAssessment({
        player,
        ratingScale: valuationConfig.ratingScale,
        potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
        currentDate,
      });
      return [String(assessment.playerId), assessment] as const;
    }),
  );
  const registrationByPlayerId = new Map(
    seniorSquad.registrationIds.flatMap((registrationId) => {
      const registration = seniorSquad.registrations[registrationId];
      return registration?.clubId === career.selectedClubId
        ? [[String(registration.playerId), registration] as const]
        : [];
    }),
  );
  const contractByPlayerId = new Map(
    seniorSquad.activeContractIds.flatMap((contractId) => {
      const contract = seniorSquad.contracts[contractId];
      return contract?.clubId === career.selectedClubId
        ? [[String(contract.playerId), contract] as const]
        : [];
    }),
  );
  const availabilityByPlayerId = new Map(
    findNextFixtureEligibilityBlockers(career, club.playerIds)
      .map((blocker) => [String(blocker.playerId), blocker.reason] as const),
  );
  const startingIds = new Set(
    draft.tacticalBoardDraft.slots.flatMap((slot) => slot.playerId === null ? [] : [slot.playerId]),
  );
  const substituteIds = new Set(
    matchPreparationBenchSlotKeys().flatMap((slotKey) => {
      const playerId = draft.selectedBenchPlayerIdsBySlot[slotKey];
      return playerId === undefined ? [] : [playerId];
    }),
  );
  const selectedLineupSlotByPlayerId = new Map(
    draft.tacticalBoardDraft.slots.flatMap((slot) => slot.playerId === null
      ? []
      : [[slot.playerId, slot.slotId] as const]),
  );
  const selectedBenchSlotByPlayerId = new Map(
    matchPreparationBenchSlotKeys().flatMap((slotKey) => {
      const playerId = draft.selectedBenchPlayerIdsBySlot[slotKey];
      return playerId === undefined ? [] : [[playerId, slotKey] as const];
    }),
  );
  const availableBenchSlotKey = matchPreparationBenchSlotKeys().find(
    (slotKey) => draft.selectedBenchPlayerIdsBySlot[slotKey] === undefined,
  );
  const contractHistoryByPlayerId = indexContractHistory(
    seniorSquad,
    career.selectedClubId,
  );
  const contractNegotiationByPlayerId = indexLatestContractNegotiations(
    career.contractNegotiationState,
    career.selectedClubId,
    contractByPlayerId,
  );
  const profilesByPlayerId = new Map<string, CareerPlayerProfileView>();
  const playerInputs: CareerSquadPlayerInput[] = [];

  for (const player of players) {
    const playerId = String(player.id);
    const dynamic = career.gameState.playerStates[player.id];
    const registration = registrationByPlayerId.get(playerId);
    const contract = contractByPlayerId.get(playerId);
    const assessment = assessmentById.get(playerId);
    const tacticalPlayer = tacticalPlayerById.get(playerId);
    const primaryPosition = player.naturalPositions[0];
    if (
      dynamic === undefined
      || registration === undefined
      || contract === undefined
      || assessment === undefined
      || tacticalPlayer === undefined
      || primaryPosition === undefined
    ) {
      return missingData(club.name, currentDateIso);
    }

    const valuation = derivePlayerValuation({
      assessment,
      primaryPosition,
      config: valuationConfig,
    });
    const remainingDays = Math.max(0, contract.endsOn - currentDate);
    const selection = selectionFor(playerId, startingIds, substituteIds);
    const availabilityReason = availabilityByPlayerId.get(playerId);
    const availabilityReasons = availabilityReason === undefined ? [] : [availabilityReason];
    const lineupSlotChoices = draft.tacticalBoardDraft.slots.map((slot) => {
      const formationSlot = formationSlotByKey.get(slot.slotId);
      if (formationSlot === undefined) {
        throw new Error(`Missing formation slot for Squad placement: ${slot.slotId}`);
      }
      const occupantAssessment = slot.playerId === null ? undefined : assessmentById.get(slot.playerId);
      const occupantCondition = slot.playerId === null
        ? undefined
        : dynamicStateByPlayerId.get(slot.playerId)?.fitness;
      return {
        slotKey: slot.slotId,
        labelKey: formationSlot.labelKey,
        role: slot.canonicalRole,
        suitability: toPositionSuitability(tacticalPlayer.suitabilityByRole[slot.role]),
        ...(slot.playerId === null ? {} : {
          occupantPlayerId: slot.playerId,
          occupantName: tacticalPlayerById.get(slot.playerId)?.name ?? slot.playerId,
          ...(occupantAssessment === undefined
            ? {}
            : { occupantCurrentRating: occupantAssessment.currentRating }),
          ...(occupantCondition === undefined ? {} : { occupantCondition: Number(occupantCondition) }),
        }),
      };
    });
    const contractHistory = contractHistoryByPlayerId.get(playerId) ?? [];
    const supportedBonusFields = contractBonusFields(contract);
    const negotiation = contractNegotiationByPlayerId.get(playerId);
    const statistics = selectCareerPlayerStatistics({
      careerState: career,
      playerId: player.id,
    });
    const profile = buildCareerPlayerProfileView({
      playerId,
      shirtNumber: registration.shirtNumber,
      firstName: player.firstName,
      lastName: player.lastName,
      age: valuation.age,
      primaryRole: tacticalPlayer.primaryRole,
      roles: roleSuitabilities(tacticalPlayer),
      currentAbilities: player.abilities,
      condition: Number(dynamic.fitness),
      form: Number(dynamic.form),
      morale: Number(dynamic.morale),
      selection,
      availabilityReasons,
      value: valuation.value,
      currency: finance.currency,
      currentRating: assessment.currentRating,
      potentialRange: {
        p50Stars: assessment.p50Rating.stars,
        upperStars: assessment.upperRating.stars,
      },
      statistics,
      contract: {
        activeContract: {
          contractId: String(contract.id),
          type: contract.type,
          startsOnIso: toISO(contract.startsOn),
          endsOnIso: toISO(contract.endsOn),
          annualWage: contract.annualWage,
          squadStatus: contract.squadStatus,
          bonuses: contract.bonuses,
          remainingDays,
        },
        history: contractHistory,
        finance: {
          currency: finance.currency,
          cashBalance: finance.cashBalance,
          availableTransferBudget: finance.availableTransferBudget,
          annualWageBudget: finance.annualWageBudget,
          committedAnnualWage: finance.committedAnnualWage,
          remainingAnnualWageBudget: subtractCareerMoney(
            finance.annualWageBudget,
            finance.committedAnnualWage,
          ),
        },
        ...(negotiation === undefined ? {} : { negotiation }),
        supportedBonusFields,
      },
    });

    profilesByPlayerId.set(playerId, profile);
    const selectedLineupSlotKey = selectedLineupSlotByPlayerId.get(playerId);
    const selectedBenchSlotKey = selectedBenchSlotByPlayerId.get(playerId);
    playerInputs.push({
      playerId,
      shirtNumber: registration.shirtNumber,
      firstName: player.firstName,
      lastName: player.lastName,
      // The valuation already owns the canonical age; the table never recomputes it.
      age: valuation.age,
      primaryRole: tacticalPlayer.primaryRole,
      condition: Number(dynamic.fitness),
      morale: Number(dynamic.morale),
      selection,
      availabilityReasons,
      value: valuation.value,
      currency: finance.currency,
      currentRating: assessment.currentRating,
      potentialRange: {
        p50Stars: assessment.p50Rating.stars,
        upperStars: assessment.upperRating.stars,
      },
      hasExpiringContract: hasCareerContractExpiryAlert(remainingDays),
      lineupSlotChoices,
      ...(selectedLineupSlotKey === undefined ? {} : { selectedLineupSlotKey }),
      ...(selectedBenchSlotKey === undefined ? {} : { selectedBenchSlotKey }),
      ...(availableBenchSlotKey === undefined ? {} : { availableBenchSlotKey }),
    });
  }

  return {
    status: "ready",
    selectedClubName: club.name,
    currentDateIso,
    players: playerInputs,
    profilesByPlayerId,
    placementContext: {
      lineupSlots: draft.tacticalBoardDraft.slots.map((slot) => ({
        slotKey: slot.slotId,
        ...(slot.playerId === null ? {} : { playerId: slot.playerId }),
      })),
      benchSlots: matchPreparationBenchSlotKeys().map((slotKey) => ({
        slotKey,
        ...(draft.selectedBenchPlayerIdsBySlot[slotKey] === undefined
          ? {}
          : { playerId: draft.selectedBenchPlayerIdsBySlot[slotKey] }),
      })),
    },
  };
}

function negotiationMatchesActiveContract(
  negotiation: ContractNegotiation,
  activeContractId: PlayerContractId,
): boolean {
  return negotiation.currentContractId === activeContractId
    || (negotiation.status === "accepted" && negotiation.activatedContractId === activeContractId);
}

function indexContractHistory(
  seniorSquad: SeniorSquadState,
  selectedClubId: WebCareerState["selectedClubId"],
): ReadonlyMap<string, readonly CareerContractHistoryInput[]> {
  const historyByPlayerId = new Map<string, CareerContractHistoryInput[]>();

  for (const historyId of seniorSquad.contractHistoryEntryIds) {
    const history = seniorSquad.contractHistory[historyId];
    if (history === undefined || history.clubId !== selectedClubId) continue;
    const playerId = String(history.playerId);
    const playerHistory = historyByPlayerId.get(playerId) ?? [];
    playerHistory.push({
      historyId: String(history.id),
      sequenceNumber: history.sequenceNumber,
      occurredOnIso: toISO(history.occurredOn),
      event: history.event,
      contractId: String(history.contractId),
    });
    historyByPlayerId.set(playerId, playerHistory);
  }

  return historyByPlayerId;
}

function indexLatestContractNegotiations(
  state: WebCareerState["contractNegotiationState"],
  selectedClubId: WebCareerState["selectedClubId"],
  contractByPlayerId: ReadonlyMap<string, ActivePlayerContract>,
): ReadonlyMap<string, CareerContractNegotiationInput> {
  const negotiationByPlayerId = new Map<string, CareerContractNegotiationInput>();
  if (state === undefined) return negotiationByPlayerId;

  for (const negotiationId of state.negotiationIds) {
    const negotiation = state.negotiations[negotiationId];
    if (negotiation === undefined || negotiation.clubId !== selectedClubId) continue;
    const playerId = String(negotiation.playerId);
    const activeContract = contractByPlayerId.get(playerId);
    if (
      activeContract === undefined
      || !negotiationMatchesActiveContract(negotiation, activeContract.id)
    ) continue;
    negotiationByPlayerId.set(playerId, toContractNegotiationInput(negotiation));
  }

  return negotiationByPlayerId;
}

function toContractNegotiationInput(
  negotiation: ContractNegotiation,
): CareerContractNegotiationInput {
  switch (negotiation.status) {
    case "draft": return {
      negotiationId: String(negotiation.id),
      status: "draft",
      createdOnIso: toISO(negotiation.draft.createdOn),
      draftTerms: toContractTermsInput(negotiation.draft.terms),
    };
    case "awaiting_response": return {
      negotiationId: String(negotiation.id),
      status: "awaiting_response",
      submittedOnIso: toISO(negotiation.submittedOffer.submittedOn),
      responseDueOnIso: toISO(negotiation.submittedOffer.responseDueOn),
      submittedTerms: toContractTermsInput(negotiation.submittedOffer.terms),
    };
    case "countered": return {
      negotiationId: String(negotiation.id),
      status: "countered",
      submittedOnIso: toISO(negotiation.submittedOffer.submittedOn),
      counterIssuedOnIso: toISO(negotiation.counterOffer.issuedOn),
      counterExpiresOnIso: toISO(negotiation.counterOffer.expiresOn),
      submittedTerms: toContractTermsInput(negotiation.submittedOffer.terms),
      counterTerms: toContractTermsInput(negotiation.counterOffer.terms),
    };
    case "accepted": return {
      negotiationId: String(negotiation.id),
      status: "accepted",
      acceptedOnIso: toISO(negotiation.acceptedOn),
      acceptedTerms: toContractTermsInput(negotiation.acceptedTerms),
      acceptedSource: negotiation.acceptedSource,
    };
    case "rejected": return {
      negotiationId: String(negotiation.id),
      status: "rejected",
      rejectedOnIso: toISO(negotiation.rejectedOn),
      rejectedBy: negotiation.rejectedBy,
    };
    case "withdrawn": return {
      negotiationId: String(negotiation.id),
      status: "withdrawn",
      withdrawnOnIso: toISO(negotiation.withdrawnOn),
    };
    case "expired": return {
      negotiationId: String(negotiation.id),
      status: "expired",
      expiredOnIso: toISO(negotiation.expiredOn),
      reason: negotiation.reason,
    };
    case "release_at_expiry": return {
      negotiationId: String(negotiation.id),
      status: "release_at_expiry",
      decidedOnIso: toISO(negotiation.decidedOn),
    };
  }
}

function toContractTermsInput(terms: ContractOfferTerms): CareerContractTermsInput {
  return {
    durationYears: terms.durationYears,
    annualWage: terms.annualWage,
    squadStatus: terms.squadStatus,
    bonuses: { ...terms.bonuses },
  };
}

function missingData(selectedClubName: string, currentDateIso: string): CareerSquadPresentation {
  return {
    status: "error",
    selectedClubName,
    currentDateIso,
    messageKey: "career.squad.error.missingData",
  };
}

function selectionFor(
  playerId: string,
  startingIds: ReadonlySet<string>,
  substituteIds: ReadonlySet<string>,
): CareerSquadSelection {
  if (startingIds.has(playerId)) return "starting_xi";
  if (substituteIds.has(playerId)) return "substitute";
  return "unselected";
}

function toPositionSuitability(suitability: TacticalBoardRoleSuitability): "natural" | "adapted" | "weak" {
  if (suitability === "natural") return "natural";
  if (suitability === "accomplished" || suitability === "competent") return "adapted";
  return "weak";
}

function roleSuitabilities(
  player: TacticalBoardSquadPlayer,
): readonly Readonly<{ role: CareerSquadPlayerInput["primaryRole"]; suitability: "natural" | "adapted" | "weak" }>[] {
  return TACTICAL_BOARD_ROLE_CODES.map((roleCode) => ({
    role: TACTICAL_BOARD_ROLES[roleCode].canonicalRole,
    suitability: toPositionSuitability(player.suitabilityByRole[roleCode]),
  }));
}

function contractBonusFields(
  contract: Readonly<{
    bonuses: Readonly<{
      goalBonus?: unknown;
      cleanSheetBonus?: unknown;
    }>;
  }>,
): readonly CareerContractBonusField[] {
  return [
    "signing_bonus",
    "appearance_bonus",
    ...(contract.bonuses.goalBonus === undefined ? [] : ["goal_bonus" as const]),
    ...(contract.bonuses.cleanSheetBonus === undefined ? [] : ["clean_sheet_bonus" as const]),
  ];
}

/** Preserves integer minor-unit semantics while crossing the UI read-model boundary. */
function subtractCareerMoney(left: Money, right: Money): Money {
  return careerMoneyFromMinorUnits(left - right);
}
