import {
  createContractNegotiationState,
  createEmptyContractNegotiationState,
  nonNegativeMoney,
  playerSquadDepartment,
  publishContractNegotiations,
  type CareerMatchPreparation,
  type CareerState,
  type ClubId,
  type ContractNegotiation,
  type ContractNegotiationId,
  type ContractNegotiationPublication,
  type ContractOfferTerms,
  type GameDate,
  type Money,
  type PlayerContract,
  type PlayerId,
  type PlayerSquadDepartment,
} from "@game/domain";

import {
  checkContractOfferAffordability,
  reconcileActiveContractWageCommitments,
  reallocateTransferBudgetToWages,
} from "./career-finance-lifecycle.ts";
import { deriveCareerContractOfferReservations } from "./career-contract-reservations.ts";
import {
  acceptContractCounterOffer,
  advanceContractNegotiations,
  createRenewalNegotiationId,
  prepareSubmittedContractRenewal,
  rejectContractCounterOffer,
  type ContractNegotiationFact,
} from "./contract-negotiation.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";
import { prepareSeniorSquadDepartures } from "./senior-squad-transfer.ts";
import {
  MINIMUM_CAREER_DEPARTMENT_DEPTH,
  MINIMUM_CAREER_SQUAD_SIZE,
} from "./squad-maintenance.ts";

const AI_RENEWAL_WINDOW_DAYS = 243;

/** Stable reason explaining one deterministic AI contract decision. */
export type AiContractDecisionReason =
  | "structural_depth"
  | "key_player"
  | "regular_starter"
  | "useful_squad_player"
  | "developing_prospect"
  | "surplus_player"
  | "unaffordable_terms"
  | "counter_terms_unaffordable"
  | "selected_club_release_instruction";

/** One structured fact emitted by the AI renewal and expiry lifecycle. */
export interface AiContractLifecycleFact {
  readonly occurredOn: GameDate;
  readonly clubId: ClubId;
  readonly playerId: PlayerId;
  readonly contractId: PlayerContract["id"];
  readonly event:
    | "renewal_started"
    | "renewal_counter_accepted"
    | "renewal_counter_rejected"
    | "renewal_not_offered"
    | "contract_expired"
    | "free_agent_created";
  readonly reason: AiContractDecisionReason;
  readonly negotiationId?: ContractNegotiationId;
}

/** Result of advancing AI contract decisions and real ownership expiries. */
export interface AdvanceAiContractLifecycleResult {
  readonly careerState: CareerState;
  readonly facts: readonly AiContractLifecycleFact[];
  readonly negotiationFacts: readonly ContractNegotiationFact[];
}

/**
 * Advances AI renewals and applies contract expiries through one career date.
 *
 * AI clubs use the same canonical negotiation shapes and validations as the
 * selected club, published in one deterministic calendar batch. The manager's
 * club is never offered or accepted terms automatically; only a previously
 * recorded release-at-expiry instruction may take effect there.
 */
export function advanceAiContractLifecycle(input: {
  readonly careerState: CareerState;
  readonly fromDate: GameDate;
  readonly throughDate: GameDate;
}): AdvanceAiContractLifecycleResult {
  if (
    input.throughDate <= input.fromDate
    || input.careerState.seniorSquadState === undefined
  ) {
    return { careerState: input.careerState, facts: [], negotiationFacts: [] };
  }

  let careerState = input.careerState;
  const facts: AiContractLifecycleFact[] = [];
  const negotiationFacts: ContractNegotiationFact[] = [];

  const resolvedExisting = resolveAiNegotiations(careerState, input.throughDate);
  careerState = resolvedExisting.careerState;
  negotiationFacts.push(...resolvedExisting.negotiationFacts);
  facts.push(...resolvedExisting.facts);

  const started = startDueAiNegotiations({
    careerState,
    fromDate: input.fromDate,
    throughDate: input.throughDate,
  });
  careerState = started.careerState;
  negotiationFacts.push(...started.negotiationFacts);
  facts.push(...started.facts);

  const resolvedStarted = resolveAiNegotiations(careerState, input.throughDate);
  careerState = resolvedStarted.careerState;
  negotiationFacts.push(...resolvedStarted.negotiationFacts);
  facts.push(...resolvedStarted.facts);

  const expired = expireDueContracts(careerState, input.throughDate);
  return {
    careerState: expired.careerState,
    facts: [...facts, ...expired.facts],
    negotiationFacts,
  };
}

function startDueAiNegotiations(input: {
  readonly careerState: CareerState;
  readonly fromDate: GameDate;
  readonly throughDate: GameDate;
}): AdvanceAiContractLifecycleResult {
  let careerState = input.careerState;
  const facts: AiContractLifecycleFact[] = [];
  const negotiationFacts: ContractNegotiationFact[] = [];
  const attemptedContractIds = new Set<PlayerContract["id"]>();

  while (true) {
    const lifecycleIndex = createAiContractLifecycleIndex(careerState);
    const dueContracts = dueAiContracts({
      careerState,
      fromDate: input.fromDate,
      throughDate: input.throughDate,
      attemptedContractIds,
      lifecycleIndex,
    });
    if (dueContracts.length === 0) break;
    const reservations = createAiOfferReservations(careerState);
    const publications: ContractNegotiationPublication[] = [];
    let submittedOfferCount = 0;

    for (const { contract, decisionDate } of dueContracts) {
      attemptedContractIds.add(contract.id);
      const decision = aiRenewalDecision(careerState, contract, decisionDate, lifecycleIndex);
      if (!decision.retain) {
        const release = prepareAiReleaseDecision(
          nextRenewalNegotiationId(careerState, contract.playerId),
          contract,
          decisionDate,
        );
        publications.push({ negotiation: release, append: true });
        markProjectedDeparture(careerState, lifecycleIndex, contract);
        negotiationFacts.push(negotiationFact(release, decisionDate, "club_chose_release_at_expiry"));
        facts.push({
          ...lifecycleFact(contract, decisionDate, "renewal_not_offered", decision.reason),
          negotiationId: release.id,
        });
        continue;
      }

      const demand = deriveContractDemand({
        careerState,
        playerId: contract.playerId,
        clubId: contract.clubId,
        evaluatedOn: decisionDate,
      });
      const affordable = affordableAiTerms(
        careerState,
        contract,
        decision.preferredTerms(demand.preferredTerms, demand.minimumTerms),
        decision.reason === "structural_depth",
        reservations,
      );
      if (affordable === undefined) {
        const release = prepareAiReleaseDecision(
          nextRenewalNegotiationId(careerState, contract.playerId),
          contract,
          decisionDate,
        );
        publications.push({ negotiation: release, append: true });
        markProjectedDeparture(careerState, lifecycleIndex, contract);
        negotiationFacts.push(negotiationFact(release, decisionDate, "club_chose_release_at_expiry"));
        facts.push({
          ...lifecycleFact(contract, decisionDate, "renewal_not_offered", "unaffordable_terms"),
          negotiationId: release.id,
        });
        continue;
      }
      careerState = affordable.careerState;

      const negotiationId = nextRenewalNegotiationId(careerState, contract.playerId);
      const submitted = prepareSubmittedContractRenewal({
        careerState,
        negotiationId,
        playerId: contract.playerId,
        clubId: contract.clubId,
        offeredOn: decisionDate,
        terms: affordable.terms,
      });
      if (submitted === undefined) {
        throw new Error(`AI renewal lost its active contract before publication: ${contract.id}`);
      }
      publications.push({ negotiation: submitted, append: true });
      markProjectedDeparture(careerState, lifecycleIndex, contract);
      reserveAiOffer(reservations, contract, affordable.terms);
      submittedOfferCount += 1;
      negotiationFacts.push(
        negotiationFact(submitted, decisionDate, "draft_created"),
        negotiationFact(submitted, decisionDate, "offer_submitted"),
      );
      facts.push({
        ...lifecycleFact(contract, decisionDate, "renewal_started", decision.reason),
        negotiationId,
      });
    }

    careerState = publishAiDecisionBatch(careerState, publications);

    if (submittedOfferCount === 0) continue;
    const unresolvedState = careerState;
    const resolved = resolveAiNegotiations(careerState, input.throughDate);
    careerState = resolved.careerState;
    negotiationFacts.push(...resolved.negotiationFacts);
    facts.push(...resolved.facts);
    if (careerState === unresolvedState) break;
  }

  return { careerState, facts, negotiationFacts };
}

interface DueAiContract {
  readonly contract: PlayerContract;
  readonly decisionDate: GameDate;
}

/** Selects deterministic renewal decisions from the current live state. */
function dueAiContracts(input: {
  readonly careerState: CareerState;
  readonly fromDate: GameDate;
  readonly throughDate: GameDate;
  readonly attemptedContractIds: ReadonlySet<PlayerContract["id"]>;
  readonly lifecycleIndex: AiContractLifecycleIndex;
}): readonly DueAiContract[] {
  return (input.careerState.seniorSquadState?.activeContractIds ?? [])
    .flatMap((contractId): readonly DueAiContract[] => {
      const contract = input.careerState.seniorSquadState?.contracts[contractId];
      if (
        contract === undefined
        || input.attemptedContractIds.has(contract.id)
        || contract.clubId === input.careerState.selectedClubId
        || contract.startsOn > input.fromDate
        || contract.endsOn <= input.fromDate
        || contract.endsOn - AI_RENEWAL_WINDOW_DAYS > input.throughDate
        || input.lifecycleIndex.contractIdsWithDecisions.has(contract.id)
      ) return [];

      return [{
        contract,
        decisionDate: Math.max(
          input.fromDate,
          contract.startsOn,
          contract.endsOn - AI_RENEWAL_WINDOW_DAYS,
        ) as GameDate,
      }];
    })
    .sort((left, right) =>
      left.decisionDate - right.decisionDate
      || String(left.contract.clubId).localeCompare(String(right.contract.clubId))
      || String(left.contract.id).localeCompare(String(right.contract.id)),
    );
}

function resolveAiNegotiations(
  inputState: CareerState,
  throughDate: GameDate,
  clubIds: readonly ClubId[] = inputState.gameState.clubIds,
): AdvanceAiContractLifecycleResult {
  let careerState = inputState;
  const facts: AiContractLifecycleFact[] = [];
  const negotiationFacts: ContractNegotiationFact[] = [];

  const includedClubIds = new Set(clubIds.filter((clubId) => clubId !== careerState.selectedClubId));
  const advanced = advanceContractNegotiations(careerState, throughDate, includedClubIds);
  careerState = advanced.careerState;
  negotiationFacts.push(...advanced.facts);

  const lifecycleIndex = createAiContractLifecycleIndex(careerState);

  for (const negotiationId of [...(careerState.contractNegotiationState?.negotiationIds ?? [])]) {
    const negotiation = careerState.contractNegotiationState?.negotiations[negotiationId];
    if (
      negotiation?.status !== "countered"
      || negotiation.clubId === careerState.selectedClubId
      || !includedClubIds.has(negotiation.clubId)
      || negotiation.counterOffer.issuedOn > throughDate
    ) continue;

    const contract = careerState.seniorSquadState?.contracts[negotiation.currentContractId];
    if (contract === undefined) continue;
    const decision = aiRenewalDecision(
      careerState,
      contract,
      negotiation.counterOffer.issuedOn,
      lifecycleIndex,
    );
    const reservations = createAiOfferReservations(careerState, negotiationId);
    const affordable = decision.retain
      ? affordableAiTerms(
          careerState,
          contract,
          [negotiation.counterOffer.terms],
          decision.reason === "structural_depth",
          reservations,
          negotiationId,
        )
      : undefined;
    const shouldAccept = affordable !== undefined;
    const resolved = shouldAccept
      ? acceptContractCounterOffer({
          careerState: affordable.careerState,
          negotiationId,
          decidedOn: negotiation.counterOffer.issuedOn,
        })
      : rejectContractCounterOffer({
          careerState,
          negotiationId,
          decidedOn: negotiation.counterOffer.issuedOn,
        });
    if (resolved.status === "rejected") continue;
    careerState = resolved.careerState;
    if (shouldAccept) markRetainedPlayer(careerState, lifecycleIndex, contract);
    negotiationFacts.push(...resolved.facts);
    facts.push({
      ...lifecycleFact(
        contract,
        negotiation.counterOffer.issuedOn,
        shouldAccept ? "renewal_counter_accepted" : "renewal_counter_rejected",
        shouldAccept ? decision.reason : "counter_terms_unaffordable",
      ),
      negotiationId,
    });
  }

  return { careerState, facts, negotiationFacts };
}

function expireDueContracts(
  inputState: CareerState,
  throughDate: GameDate,
): { readonly careerState: CareerState; readonly facts: readonly AiContractLifecycleFact[] } {
  const seniorSquadState = inputState.seniorSquadState;
  if (seniorSquadState === undefined) return { careerState: inputState, facts: [] };

  const expiringContracts: {
    readonly contract: PlayerContract;
    readonly reason: AiContractDecisionReason;
  }[] = [];
  const facts: AiContractLifecycleFact[] = [];
  const lifecycleIndex = createAiContractLifecycleIndex(inputState);

  for (const contractId of seniorSquadState.activeContractIds) {
    const contract = seniorSquadState.contracts[contractId];
    if (contract === undefined || contract.endsOn > throughDate) continue;
    const selectedRelease = contract.clubId === inputState.selectedClubId
      && contractNegotiationsForContract(inputState, contract.id).some((negotiation) =>
        negotiation.status === "release_at_expiry",
      );
    if (contract.clubId === inputState.selectedClubId && !selectedRelease) continue;

    const reason: AiContractDecisionReason = selectedRelease
      ? "selected_club_release_instruction"
      : aiRenewalDecision(inputState, contract, contract.endsOn, lifecycleIndex).reason;
    markProjectedDeparture(inputState, lifecycleIndex, contract);
    expiringContracts.push({ contract, reason });
    facts.push(lifecycleFact(contract, contract.endsOn, "contract_expired", reason));
    facts.push(lifecycleFact(contract, contract.endsOn, "free_agent_created", reason));
  }

  if (expiringContracts.length === 0) return { careerState: inputState, facts };

  const prepared = prepareSeniorSquadDepartures({
    gameState: inputState.gameState,
    seniorSquadState,
    departures: expiringContracts.map(({ contract }, index) => ({
      playerId: contract.playerId,
      occurredOn: contract.endsOn,
      transitionSequence: seniorSquadState.contractHistoryEntryIds.length + index + 1,
      event: "expired",
    })),
  });
  const contractNegotiationState = expireOpenNegotiations(
    inputState,
    prepared.gameState,
    expiringContracts.map(({ contract }) => contract),
    prepared.seniorSquadState,
  );
  const selectedPlayerIds = new Set(
    expiringContracts
      .map(({ contract }) => contract)
      .filter((contract) => contract.clubId === inputState.selectedClubId)
      .map((contract) => contract.playerId),
  );
  const matchPreparation = removePlayersFromPreparation(
    inputState.matchPreparation,
    selectedPlayerIds,
  );
  const reconciled = reconcileActiveContractWageCommitments({
    careerState: inputState,
    gameState: prepared.gameState,
    seniorSquadState: prepared.seniorSquadState,
    contractNegotiationState: contractNegotiationState ?? null,
    matchPreparation: matchPreparation ?? null,
  });
  if (reconciled.status === "rejected") {
    throw new Error(`Expired-contract finance reconciliation failed: ${reconciled.reason}`);
  }
  return { careerState: reconciled.careerState, facts };
}

function expireOpenNegotiations(
  careerState: CareerState,
  gameState: CareerState["gameState"],
  contracts: readonly PlayerContract[],
  seniorSquadState: CareerState["seniorSquadState"],
): CareerState["contractNegotiationState"] {
  const state = careerState.contractNegotiationState;
  if (state === undefined || seniorSquadState === undefined) return state;
  const expiredContractById = new Map(contracts.map((contract) => [contract.id, contract]));
  const negotiations = { ...state.negotiations };
  const negotiationIds: ContractNegotiationId[] = [];
  let changed = false;
  for (const negotiationId of state.negotiationIds) {
    const negotiation = negotiations[negotiationId];
    if (
      negotiation?.status === "accepted"
      && expiredContractById.has(negotiation.activatedContractId)
    ) {
      delete negotiations[negotiationId];
      changed = true;
      continue;
    }
    negotiationIds.push(negotiationId);
    const contract = negotiation === undefined
      ? undefined
      : expiredContractById.get(negotiation.currentContractId);
    if (
      contract === undefined
      || negotiation === undefined
      || (negotiation.status !== "draft"
        && negotiation.status !== "awaiting_response"
        && negotiation.status !== "countered")
    ) continue;
    negotiations[negotiationId] = {
      id: negotiation.id,
      playerId: negotiation.playerId,
      clubId: negotiation.clubId,
      currentContractId: negotiation.currentContractId,
      createdOn: negotiation.createdOn,
      status: "expired",
      expiredOn: contract.endsOn,
      reason: "current_contract_expired",
    };
    changed = true;
  }
  return changed
    ? createContractNegotiationState(gameState, seniorSquadState, {
        negotiations,
        negotiationIds,
      })
    : state;
}

function removePlayersFromPreparation(
  preparation: CareerMatchPreparation | undefined,
  playerIds: ReadonlySet<PlayerId>,
): CareerMatchPreparation | undefined {
  if (preparation === undefined || playerIds.size === 0) return preparation;
  return {
    ...preparation,
    ...(preparation.selectedLineup === undefined
      ? {}
      : {
          selectedLineup: {
            ...preparation.selectedLineup,
            slots: preparation.selectedLineup.slots.filter((slot) => !playerIds.has(slot.playerId)),
          },
        }),
    ...(preparation.boardSlots === undefined ? {} : { boardSlots: preparation.boardSlots }),
    ...(preparation.benchSlots === undefined
      ? {}
      : { benchSlots: preparation.benchSlots.filter((slot) => !playerIds.has(slot.playerId)) }),
  };
}

function prepareAiReleaseDecision(
  negotiationId: ContractNegotiationId,
  contract: PlayerContract,
  decidedOn: GameDate,
): Extract<ContractNegotiation, { readonly status: "release_at_expiry" }> {
  return {
    id: negotiationId,
    playerId: contract.playerId,
    clubId: contract.clubId,
    currentContractId: contract.id,
    createdOn: decidedOn,
    status: "release_at_expiry",
    decidedOn,
  };
}

function publishAiDecisionBatch(
  careerState: CareerState,
  publications: readonly ContractNegotiationPublication[],
): CareerState {
  if (publications.length === 0) return careerState;
  const state = careerState.contractNegotiationState ?? createEmptyContractNegotiationState();
  const contractNegotiationState = publishContractNegotiations(
    careerState.gameState,
    careerState.seniorSquadState,
    state,
    publications,
  );
  return { ...careerState, contractNegotiationState };
}

function negotiationFact(
  negotiation: Pick<ContractNegotiation, "id" | "playerId" | "clubId">,
  occurredOn: GameDate,
  event: ContractNegotiationFact["event"],
): ContractNegotiationFact {
  return {
    negotiationId: negotiation.id,
    playerId: negotiation.playerId,
    clubId: negotiation.clubId,
    occurredOn,
    event,
  };
}

function aiRenewalDecision(
  careerState: CareerState,
  contract: PlayerContract,
  evaluatedOn: GameDate,
  lifecycleIndex: AiContractLifecycleIndex = createAiContractLifecycleIndex(careerState),
): {
  readonly retain: boolean;
  readonly reason: AiContractDecisionReason;
  readonly preferredTerms: (preferred: ContractOfferTerms, minimum: ContractOfferTerms) => readonly ContractOfferTerms[];
} {
  const demand = deriveContractDemand({
    careerState,
    playerId: contract.playerId,
    clubId: contract.clubId,
    evaluatedOn,
  });
  const protectedDepth = wouldBreakSquadStructure(
    careerState,
    contract.clubId,
    contract.playerId,
    lifecycleIndex,
  );
  if (protectedDepth) return retain("structural_depth", true);
  if (demand.expectedSquadStatus === "key_player") return retain("key_player", true);
  if (demand.expectedSquadStatus === "regular_starter") return retain("regular_starter", true);
  if (demand.expectedSquadStatus === "squad_player" && demand.age <= 31 && demand.currentAbility >= 7.5) {
    return retain("useful_squad_player", false);
  }
  if (demand.age <= 24 && demand.reachablePotential - demand.currentAbility >= 1.5) {
    return retain("developing_prospect", false);
  }
  return {
    retain: false,
    reason: "surplus_player",
    preferredTerms: () => [],
  };
}

function retain(reason: AiContractDecisionReason, prioritizeAcceptance: boolean) {
  return {
    retain: true,
    reason,
    preferredTerms: (preferred: ContractOfferTerms, minimum: ContractOfferTerms) =>
      prioritizeAcceptance ? [preferred, minimum] as const : [minimum, preferred] as const,
  };
}

interface AffordableAiTerms {
  readonly careerState: CareerState;
  readonly terms: ContractOfferTerms;
}

interface AiOfferReservations {
  readonly committedAnnualWageByClub: Map<ClubId, Money>;
  readonly signingBonusByClub: Map<ClubId, Money>;
}

function affordableAiTerms(
  careerState: CareerState,
  contract: PlayerContract,
  candidates: readonly ContractOfferTerms[],
  allowStructuralReallocation: boolean,
  reservations?: AiOfferReservations,
  excludedNegotiationId?: ContractNegotiationId,
): AffordableAiTerms | undefined {
  for (const terms of candidates) {
    const affordability = checkContractOfferAffordability({
      careerState,
      clubId: contract.clubId,
      replacedContractId: contract.id,
      terms,
      ...(excludedNegotiationId === undefined ? {} : { excludedNegotiationId }),
    });
    const account = careerState.clubFinanceState?.accounts[contract.clubId];
    if (account === undefined) continue;
    const reservedWage = reservations?.committedAnnualWageByClub.get(contract.clubId)
      ?? account.committedAnnualWage;
    const projectedWage = nonNegativeMoney(
      reservedWage - contract.annualWage + terms.annualWage,
    );
    const reservedSigningBonus = reservations?.signingBonusByClub.get(contract.clubId)
      ?? nonNegativeMoney(0);
    const projectedSigningBonus = nonNegativeMoney(
      reservedSigningBonus + terms.bonuses.signingBonus,
    );
    if (
      affordability.status === "affordable"
      && projectedWage <= account.annualWageBudget
      && projectedSigningBonus <= account.cashBalance
    ) return { careerState, terms };
    if (
      !allowStructuralReallocation
      || projectedSigningBonus > account.cashBalance
      || (affordability.status === "rejected" && affordability.reason !== "wage_budget_exceeded")
    ) continue;

    const amount = nonNegativeMoney(Math.max(0, projectedWage - account.annualWageBudget));
    if (amount === 0) continue;
    const reallocated = reallocateTransferBudgetToWages({
      careerState,
      clubId: contract.clubId,
      amount,
    });
    if (reallocated.status === "rejected") continue;
    return { careerState: reallocated.careerState, terms };
  }
  return undefined;
}

function createAiOfferReservations(
  careerState: CareerState,
  excludedNegotiationId?: ContractNegotiationId,
): AiOfferReservations {
  const committedAnnualWageByClub = new Map<ClubId, Money>();
  const signingBonusByClub = new Map<ClubId, Money>();
  for (const clubId of careerState.clubFinanceState?.clubIds ?? []) {
    const reserved = deriveCareerContractOfferReservations(careerState, clubId, {
      ...(excludedNegotiationId === undefined ? {} : { excludedNegotiationId }),
    });
    committedAnnualWageByClub.set(clubId, reserved.projectedCommittedAnnualWage);
    signingBonusByClub.set(clubId, reserved.reservedSigningBonus);
  }

  return { committedAnnualWageByClub, signingBonusByClub };
}

function reserveAiOffer(
  reservations: AiOfferReservations,
  contract: PlayerContract,
  terms: ContractOfferTerms,
): void {
  const committed = reservations.committedAnnualWageByClub.get(contract.clubId)
    ?? nonNegativeMoney(0);
  reservations.committedAnnualWageByClub.set(
    contract.clubId,
    nonNegativeMoney(committed - contract.annualWage + terms.annualWage),
  );
  const signingBonus = reservations.signingBonusByClub.get(contract.clubId)
    ?? nonNegativeMoney(0);
  reservations.signingBonusByClub.set(
    contract.clubId,
    nonNegativeMoney(signingBonus + terms.bonuses.signingBonus),
  );
}

interface AiClubStructuralDepth {
  retainedPlayerCount: number;
  readonly retainedByDepartment: Record<PlayerSquadDepartment, number>;
  readonly projectedDeparturePlayerIds: Set<PlayerId>;
}

interface AiContractLifecycleIndex {
  readonly contractIdsWithDecisions: Set<PlayerContract["id"]>;
  readonly depthByClub: Map<ClubId, AiClubStructuralDepth>;
}

/** Builds the lookup facts reused by every decision in one AI renewal batch. */
function createAiContractLifecycleIndex(careerState: CareerState): AiContractLifecycleIndex {
  const contractIdsWithDecisions = new Set<PlayerContract["id"]>();
  const projectedContractIds = new Set<PlayerContract["id"]>();
  for (const negotiationId of careerState.contractNegotiationState?.negotiationIds ?? []) {
    const negotiation = careerState.contractNegotiationState?.negotiations[negotiationId];
    if (negotiation === undefined) continue;
    contractIdsWithDecisions.add(negotiation.currentContractId);
    if (negotiation.status !== "accepted") projectedContractIds.add(negotiation.currentContractId);
  }

  const activeContractByClubAndPlayer = new Map<string, PlayerContract>();
  for (const contractId of careerState.seniorSquadState?.activeContractIds ?? []) {
    const contract = careerState.seniorSquadState?.contracts[contractId];
    if (contract !== undefined) {
      activeContractByClubAndPlayer.set(clubPlayerKey(contract.clubId, contract.playerId), contract);
    }
  }

  const depthByClub = new Map<ClubId, AiClubStructuralDepth>();
  for (const clubId of careerState.gameState.clubIds) {
    const depth: AiClubStructuralDepth = {
      retainedPlayerCount: 0,
      retainedByDepartment: {
        goalkeeper: 0,
        defender: 0,
        midfielder: 0,
        attacker: 0,
      },
      projectedDeparturePlayerIds: new Set<PlayerId>(),
    };
    for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
      const contract = activeContractByClubAndPlayer.get(clubPlayerKey(clubId, playerId));
      if (contract === undefined || projectedContractIds.has(contract.id)) {
        depth.projectedDeparturePlayerIds.add(playerId);
        continue;
      }
      depth.retainedPlayerCount += 1;
      const player = careerState.gameState.players[playerId];
      if (player === undefined) continue;
      const department = playerSquadDepartment(player);
      depth.retainedByDepartment[department] += 1;
    }
    depthByClub.set(clubId, depth);
  }

  return { contractIdsWithDecisions, depthByClub };
}

function wouldBreakSquadStructure(
  careerState: CareerState,
  clubId: ClubId,
  playerId: PlayerId,
  lifecycleIndex: AiContractLifecycleIndex,
): boolean {
  const depth = lifecycleIndex.depthByClub.get(clubId);
  if (depth === undefined) return true;
  const candidateIsRetained = !depth.projectedDeparturePlayerIds.has(playerId);
  const retainedPlayerCount = depth.retainedPlayerCount - (candidateIsRetained ? 1 : 0);
  if (retainedPlayerCount < MINIMUM_CAREER_SQUAD_SIZE) return true;
  const player = careerState.gameState.players[playerId];
  if (player === undefined) return true;
  const department = playerSquadDepartment(player);
  const count = depth.retainedByDepartment[department] - (candidateIsRetained ? 1 : 0);
  return count < MINIMUM_CAREER_DEPARTMENT_DEPTH[department];
}

function markProjectedDeparture(
  careerState: CareerState,
  index: AiContractLifecycleIndex,
  contract: PlayerContract,
): void {
  const depth = index.depthByClub.get(contract.clubId);
  if (depth === undefined || depth.projectedDeparturePlayerIds.has(contract.playerId)) return;
  depth.projectedDeparturePlayerIds.add(contract.playerId);
  depth.retainedPlayerCount -= 1;
  const player = careerState.gameState.players[contract.playerId];
  if (player === undefined) return;
  const department = playerSquadDepartment(player);
  depth.retainedByDepartment[department] -= 1;
  index.contractIdsWithDecisions.add(contract.id);
}

function markRetainedPlayer(
  careerState: CareerState,
  index: AiContractLifecycleIndex,
  contract: PlayerContract,
): void {
  const depth = index.depthByClub.get(contract.clubId);
  if (depth === undefined || !depth.projectedDeparturePlayerIds.delete(contract.playerId)) return;
  depth.retainedPlayerCount += 1;
  const player = careerState.gameState.players[contract.playerId];
  if (player === undefined) return;
  const department = playerSquadDepartment(player);
  depth.retainedByDepartment[department] += 1;
}

function clubPlayerKey(clubId: ClubId, playerId: PlayerId): string {
  return `${clubId}|${playerId}`;
}

function contractNegotiationsForContract(
  careerState: CareerState,
  contractId: PlayerContract["id"],
): readonly ContractNegotiation[] {
  return (careerState.contractNegotiationState?.negotiationIds ?? []).flatMap((id) => {
    const negotiation = careerState.contractNegotiationState?.negotiations[id];
    return negotiation?.currentContractId === contractId ? [negotiation] : [];
  });
}

function nextRenewalNegotiationId(careerState: CareerState, playerId: PlayerId): ContractNegotiationId {
  let sequence = contractNegotiationsForPlayer(careerState, playerId).length + 1;
  let candidate = createRenewalNegotiationId(playerId, sequence);
  while (careerState.contractNegotiationState?.negotiations[candidate] !== undefined) {
    sequence += 1;
    candidate = createRenewalNegotiationId(playerId, sequence);
  }
  return candidate;
}

function contractNegotiationsForPlayer(careerState: CareerState, playerId: PlayerId): readonly ContractNegotiation[] {
  return (careerState.contractNegotiationState?.negotiationIds ?? []).flatMap((id) => {
    const negotiation = careerState.contractNegotiationState?.negotiations[id];
    return negotiation?.playerId === playerId ? [negotiation] : [];
  });
}

function lifecycleFact(
  contract: PlayerContract,
  occurredOn: GameDate,
  event: AiContractLifecycleFact["event"],
  reason: AiContractDecisionReason,
): AiContractLifecycleFact {
  return {
    occurredOn,
    clubId: contract.clubId,
    playerId: contract.playerId,
    contractId: contract.id,
    event,
    reason,
  };
}
