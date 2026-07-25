import {
  addMoney,
  nonNegativeMoney,
  playerSquadDepartment,
  subtractMoney,
  type CareerState,
  type ClubId,
  type ContractOfferTerms,
  type GameDate,
  type Money,
  type PlayerId,
  type PlayerSquadDepartment,
} from "@game/domain";

import { derivePlayerMarketAbility } from "../market/player-valuation.ts";
import { evaluateCareerContractCapacity } from "./career-contract-capacity.ts";
import {
  applyContractActivationsFinance,
  reallocateTransferBudgetsToWages,
} from "./career-finance-lifecycle.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";
import { prepareSeniorSquadSignings } from "./senior-squad-transfer.ts";
import {
  assessCareerSquadStructure,
  type SquadMaintenanceRecord,
} from "./squad-maintenance.ts";

/** Input for deterministic, explicit senior-squad replenishment. */
export interface ReplenishSeniorSquadsFromFreeAgentsInput {
  readonly careerState: CareerState;
  /** Clubs whose recruitment decisions the caller explicitly owns. */
  readonly clubIds: readonly ClubId[];
  readonly occurredOn: GameDate;
}

/** Canonical state plus one factual result for every requested club. */
export interface ReplenishSeniorSquadsFromFreeAgentsResult {
  readonly careerState: CareerState;
  readonly records: readonly SquadMaintenanceRecord[];
}

/**
 * Replenishes requested senior squads from the existing free-agent pool.
 *
 * Structural departments are filled before generic depth. Candidates are
 * ranked by current ability and stable ID; every accepted move still passes
 * through canonical contract and finance validation. Callers choose the club
 * IDs explicitly, so the season engine can exclude the manager's club while a
 * report adapter may model a deterministic test manager without hidden policy.
 */
export function replenishSeniorSquadsFromFreeAgents(
  input: ReplenishSeniorSquadsFromFreeAgentsInput,
): ReplenishSeniorSquadsFromFreeAgentsResult {
  if (
    input.careerState.seniorSquadState === undefined
    || input.careerState.clubFinanceState === undefined
  ) {
    return { careerState: input.careerState, records: [] };
  }

  let projectedCareerState = input.careerState;
  const requestedClubIds = new Set(input.clubIds);
  const freeAgentIds = new Set(selectFreeAgentPlayerIds(projectedCareerState));
  const rankedFreeAgents = rankFreeAgents(projectedCareerState, freeAgentIds);
  const sameDayDepartures = sameDayDepartureKeys(projectedCareerState, input.occurredOn);
  const plannedSignings: PlannedFreeAgentSigning[] = [];
  const reallocationByClub = new Map<ClubId, Money>();
  const records: SquadMaintenanceRecord[] = [];

  for (const clubId of projectedCareerState.gameState.clubIds) {
    if (!requestedClubIds.has(clubId)) continue;
    const club = projectedCareerState.gameState.clubs[clubId];
    if (club === undefined) continue;

    const beforeSquadSize = club.playerIds.length;
    const addedPlayerIds: PlayerId[] = [];
    const rejectedCandidates = new Set<PlayerId>();

    while (true) {
      const currentClub = projectedCareerState.gameState.clubs[clubId];
      if (currentClub === undefined) break;
      const assessment = assessCareerSquadStructure({
        playerIds: currentClub.playerIds,
        players: projectedCareerState.gameState.players,
        fillDepartmentDepthBeyondTarget: true,
      });
      if (!assessment.requiresPlayer) break;

      const externalCandidate = nextCandidate({
        careerState: projectedCareerState,
        rankedFreeAgents,
        freeAgentIds,
        rejectedCandidates,
        sameDayDepartures,
        clubId,
        ...(assessment.neededDepartment === undefined
          ? {}
          : { neededDepartment: assessment.neededDepartment }),
      });
      const candidate = externalCandidate ?? (
        assessment.neededDepartment === "goalkeeper"
        && assessment.departmentDepth.goalkeeper === 0
          ? nextCandidate({
              careerState: projectedCareerState,
              rankedFreeAgents,
              freeAgentIds,
              rejectedCandidates,
              sameDayDepartures,
              clubId,
              neededDepartment: "goalkeeper",
              allowSameDayReturn: true,
            })
          : undefined
      );
      if (candidate === undefined) {
        break;
      }

      const planned = tryPlanCandidate({
        careerState: projectedCareerState,
        playerId: candidate,
        clubId,
        occurredOn: input.occurredOn,
      });
      if (planned === undefined) {
        rejectedCandidates.add(candidate);
        continue;
      }

      projectedCareerState = planned.projectedCareerState;
      plannedSignings.push({
        playerId: candidate,
        clubId,
        occurredOn: input.occurredOn,
        acceptedTerms: planned.terms,
      });
      if (planned.reallocatedAmount > 0) {
        reallocationByClub.set(
          clubId,
          addMoney(reallocationByClub.get(clubId) ?? nonNegativeMoney(0), planned.reallocatedAmount),
        );
      }
      freeAgentIds.delete(candidate);
      addedPlayerIds.push(candidate);
    }

    const finalClub = projectedCareerState.gameState.clubs[clubId];
    const finalAssessment = assessCareerSquadStructure({
      playerIds: finalClub?.playerIds ?? [],
      players: projectedCareerState.gameState.players,
      fillDepartmentDepthBeyondTarget: true,
    });
    records.push({
      clubId,
      beforeSquadSize,
      afterSquadSize: finalClub?.playerIds.length ?? 0,
      addedPlayerIds,
      warnings: finalAssessment.warnings,
    });
  }

  if (plannedSignings.length === 0) return { careerState: input.careerState, records };

  const reallocated = reallocateTransferBudgetsToWages({
    careerState: input.careerState,
    allocations: [...reallocationByClub].map(([clubId, amount]) => ({ clubId, amount })),
  });
  if (reallocated.status === "rejected") {
    throw new Error(`Planned free-agent budget allocation failed: ${reallocated.reason}`);
  }
  if (reallocated.careerState.seniorSquadState === undefined) {
    throw new Error("Planned free-agent budget allocation failed: senior_squad_state_missing");
  }

  const historySequence = reallocated.careerState.seniorSquadState.contractHistoryEntryIds.length;
  const prepared = prepareSeniorSquadSignings({
    gameState: reallocated.careerState.gameState,
    seniorSquadState: reallocated.careerState.seniorSquadState,
    signings: plannedSignings.map((signing, index) => ({
      ...signing,
      transitionSequence: historySequence + index + 1,
    })),
  });
  const financed = applyContractActivationsFinance({
    careerState: reallocated.careerState,
    proposedGameState: prepared.gameState,
    seniorSquadState: prepared.seniorSquadState,
    activations: prepared.activatedContractIds.map((contractId, index) => ({
      contractId,
      occurredOn: plannedSignings[index]?.occurredOn ?? input.occurredOn,
    })),
  });
  if (financed.status === "rejected") {
    throw new Error(`Planned free-agent signing finance failed: ${financed.reason}`);
  }

  return { careerState: financed.careerState, records };
}

function rankFreeAgents(
  careerState: CareerState,
  freeAgentIds: ReadonlySet<PlayerId>,
): readonly PlayerId[] {
  return [...freeAgentIds]
    .flatMap((playerId) => {
      const player = careerState.gameState.players[playerId];
      return player === undefined
        ? []
        : [{ playerId, currentAbility: derivePlayerMarketAbility(player).currentAbility }];
    })
    .sort((left, right) =>
      right.currentAbility - left.currentAbility
      || String(left.playerId).localeCompare(String(right.playerId)))
    .map(({ playerId }) => playerId);
}

function nextCandidate(input: {
  readonly careerState: CareerState;
  readonly rankedFreeAgents: readonly PlayerId[];
  readonly freeAgentIds: ReadonlySet<PlayerId>;
  readonly rejectedCandidates: ReadonlySet<PlayerId>;
  readonly sameDayDepartures: ReadonlySet<string>;
  readonly clubId: ClubId;
  readonly neededDepartment?: PlayerSquadDepartment;
  /** Last-resort zero-goalkeeper recovery after external candidates are exhausted. */
  readonly allowSameDayReturn?: boolean;
}): PlayerId | undefined {
  for (const playerId of input.rankedFreeAgents) {
    if (
      !input.freeAgentIds.has(playerId)
      || input.rejectedCandidates.has(playerId)
      || (
        input.allowSameDayReturn !== true
        && input.sameDayDepartures.has(departureKey(input.clubId, playerId))
      )
    ) continue;
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined) continue;
    if (
      input.neededDepartment !== undefined
      && playerSquadDepartment(player) !== input.neededDepartment
    ) continue;
    return playerId;
  }
  return undefined;
}

interface PlannedFreeAgentSigning {
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
  readonly acceptedTerms: ContractOfferTerms;
}

interface PlannedCandidate {
  readonly projectedCareerState: CareerState;
  readonly terms: ContractOfferTerms;
  readonly reallocatedAmount: Money;
}

function tryPlanCandidate(input: {
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
}): PlannedCandidate | undefined {
  let proposedCareerState = input.careerState;
  let reallocatedAmount = nonNegativeMoney(0);
  let terms: ContractOfferTerms;
  try {
    terms = deriveContractDemand({
      careerState: proposedCareerState,
      playerId: input.playerId,
      clubId: input.clubId,
      evaluatedOn: input.occurredOn,
      isFreeAgent: true,
    }).minimumTerms;
  } catch {
    return undefined;
  }

  let capacity = evaluateCareerContractCapacity({
    careerState: proposedCareerState,
    clubId: input.clubId,
    addedAnnualWage: terms.annualWage,
    addedSigningBonus: terms.bonuses.signingBonus,
  });
  if (capacity.status === "unaffordable" && capacity.reason === "wage_budget_exceeded") {
    if (capacity.requiredAmount === undefined || capacity.availableAmount === undefined) return undefined;
    reallocatedAmount = nonNegativeMoney(capacity.requiredAmount - capacity.availableAmount);
    const reallocated = projectTransferBudgetToWages(
      proposedCareerState,
      input.clubId,
      reallocatedAmount,
    );
    if (reallocated === undefined) return undefined;
    proposedCareerState = reallocated;
    capacity = evaluateCareerContractCapacity({
      careerState: proposedCareerState,
      clubId: input.clubId,
      addedAnnualWage: terms.annualWage,
      addedSigningBonus: terms.bonuses.signingBonus,
    });
    if (capacity.status === "unaffordable") return undefined;
  } else if (capacity.status === "unaffordable") {
    return undefined;
  }

  const projected = projectAcceptedFreeAgentSigning({
    careerState: proposedCareerState,
    playerId: input.playerId,
    clubId: input.clubId,
    terms,
  });
  return projected === undefined
    ? undefined
    : { projectedCareerState: projected, terms, reallocatedAmount };
}

/** Projects only the facts needed to plan later choices in the same atomic batch. */
function projectAcceptedFreeAgentSigning(input: {
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly terms: ContractOfferTerms;
}): CareerState | undefined {
  const club = input.careerState.gameState.clubs[input.clubId];
  const financeState = input.careerState.clubFinanceState;
  const account = financeState?.accounts[input.clubId];
  if (club === undefined || financeState === undefined || account === undefined) return undefined;
  return {
    ...input.careerState,
    gameState: {
      ...input.careerState.gameState,
      clubs: {
        ...input.careerState.gameState.clubs,
        [input.clubId]: { ...club, playerIds: [...club.playerIds, input.playerId] },
      },
    },
    clubFinanceState: {
      ...financeState,
      accounts: {
        ...financeState.accounts,
        [input.clubId]: {
          ...account,
          cashBalance: subtractMoney(account.cashBalance, input.terms.bonuses.signingBonus),
          committedAnnualWage: addMoney(account.committedAnnualWage, input.terms.annualWage),
        },
      },
    },
  };
}

/** Projects one affordable allocation without publishing an invalid intermediate career. */
function projectTransferBudgetToWages(
  careerState: CareerState,
  clubId: ClubId,
  amount: Money,
): CareerState | undefined {
  const financeState = careerState.clubFinanceState;
  const account = financeState?.accounts[clubId];
  if (financeState === undefined || account === undefined || amount <= 0) return undefined;
  const available = Math.min(account.annualTransferBudget, account.availableTransferBudget);
  if (amount > available) return undefined;
  return {
    ...careerState,
    clubFinanceState: {
      ...financeState,
      accounts: {
        ...financeState.accounts,
        [clubId]: {
          ...account,
          annualTransferBudget: subtractMoney(account.annualTransferBudget, amount),
          availableTransferBudget: subtractMoney(account.availableTransferBudget, amount),
          annualWageBudget: addMoney(account.annualWageBudget, amount),
        },
      },
    },
  };
}

function sameDayDepartureKeys(careerState: CareerState, occurredOn: GameDate): ReadonlySet<string> {
  const keys = new Set<string>();
  for (const historyId of careerState.seniorSquadState?.contractHistoryEntryIds ?? []) {
    const history = careerState.seniorSquadState?.contractHistory[historyId];
    if (
      history?.occurredOn === occurredOn
      && (history.event === "expired" || history.event === "released")
    ) {
      keys.add(departureKey(history.clubId, history.playerId));
    }
  }
  return keys;
}

function departureKey(clubId: ClubId, playerId: PlayerId): string {
  return `${clubId}:${playerId}`;
}
