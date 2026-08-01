import {
  addMoney,
  createCareerState,
  nonNegativeMoney,
  playerSquadDepartment,
  subtractMoney,
  type CareerState,
  type ClubId,
  type ContractOfferTerms,
  type GameDate,
  type MarketBehaviorCalibrationConfig,
  type Money,
  type PlayerContract,
  type PlayerId,
  type PlayerWagePolicyConfig,
  type PlayerSquadDepartment,
} from "@game/domain";

import type { PlayerValuationConfig } from "../market/player-valuation.ts";
import { derivePublicPlayerAssessment } from "../squad/public-player-assessment.ts";
import { evaluateCareerContractCapacity } from "./career-contract-capacity.ts";
import {
  applyContractActivationsFinance,
  ensureStructuralWageBudget,
  reconcileActiveContractWageCommitments,
  reallocateTransferBudgetsToWages,
} from "./career-finance-lifecycle.ts";
import { reconcileClosedContractNegotiations } from "./contract-negotiation.ts";
import { deriveContractDemand } from "./contract-negotiation-demand.ts";
import { selectFreeAgentPlayerIds } from "./free-agent-pool.ts";
import {
  createCareerIntakePool,
  type CareerIntakeCandidate,
} from "./player-intake.ts";
import {
  prepareSeniorSquadDepartures,
  prepareSeniorSquadSignings,
} from "./senior-squad-transfer.ts";
import {
  assessCareerSquadStructure,
  MINIMUM_CAREER_SQUAD_SIZE,
  TARGET_CAREER_SQUAD_SIZE,
  type SquadMaintenanceRecord,
} from "./squad-maintenance.ts";

/** Input for deterministic, explicit senior-squad replenishment. */
export interface ReplenishSeniorSquadsFromFreeAgentsInput {
  readonly careerState: CareerState;
  /** Explicit wage policy used for free-agent terms and capacity. */
  readonly wagePolicy: PlayerWagePolicyConfig;
  /** Exact version-selected reserve and affordability policy. */
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  /** Canonical public-assessment policy used by ranking and contract demand. */
  readonly valuationConfig: PlayerValuationConfig;
  /** Clubs whose recruitment decisions the caller explicitly owns. */
  readonly clubIds: readonly ClubId[];
  readonly occurredOn: GameDate;
  /**
   * Adapter-generated reserve candidates materialized only when the existing
   * free-agent pool cannot cover the requested clubs' hard structural needs.
   */
  readonly intakeCandidates?: readonly CareerIntakeCandidate[];
  /** Lazy equivalent used by season adapters to avoid generating unused reserves. */
  readonly createIntakeCandidates?: () => readonly CareerIntakeCandidate[];
}

/** Canonical state plus one factual result for every requested club. */
export interface ReplenishSeniorSquadsFromFreeAgentsResult {
  readonly careerState: CareerState;
  readonly records: readonly SquadMaintenanceRecord[];
  /** Transfer budget moved into annual-wage room by club for accepted signings. */
  readonly wageBudgetReallocations: readonly {
    readonly clubId: ClubId;
    readonly amount: Money;
  }[];
  /** Clubs whose planning ceiling was repaired within the calibrated tier maximum. */
  readonly structuralWageBudgetTopUps: readonly {
    readonly clubId: ClubId;
    readonly amount: Money;
  }[];
  /** Bounded non-manager contracts replaced to repair a blocked hard invariant. */
  readonly structuralReleases: readonly {
    readonly clubId: ClubId;
    readonly playerId: PlayerId;
  }[];
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
  const careerState = materializeRequiredIntakeFreeAgents(input);
  const structuralPass = replenishSeniorSquadsPass(
    {
      careerState,
      wagePolicy: input.wagePolicy,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
      valuationConfig: input.valuationConfig,
      clubIds: input.clubIds,
      occurredOn: input.occurredOn,
    },
    MINIMUM_CAREER_SQUAD_SIZE,
    false,
  );
  const depthPass = replenishSeniorSquadsPass(
    {
      ...input,
      careerState: structuralPass.careerState,
    },
    TARGET_CAREER_SQUAD_SIZE,
    true,
  );
  return mergeReplenishmentPasses(structuralPass, depthPass);
}

/**
 * Adds the smallest validated reserve needed when lifecycle exits exhaust the
 * existing free-agent pool.
 *
 * Candidates remain unattached until canonical contract, registration, and
 * finance validation accepts a signing. Unneeded generated players never enter
 * the durable world, which prevents annual report intake from inflating the
 * free-agent population.
 */
function materializeRequiredIntakeFreeAgents(
  input: ReplenishSeniorSquadsFromFreeAgentsInput,
): CareerState {
  const requestedClubIds = new Set(input.clubIds);
  const existingFreeAgentIds = selectFreeAgentPlayerIds(input.careerState);
  const structuralNeeds = requestedStructuralFreeAgentNeeds(
    input.careerState,
    requestedClubIds,
  );
  const existingDepartmentCounts = freeAgentDepartmentCounts(
    input.careerState,
    existingFreeAgentIds,
  );
  const missingDepartments = mapDepartmentCounts(
    structuralNeeds.missingDepartments,
    (count, department) =>
      Math.max(0, count - existingDepartmentCounts[department]),
  );
  const roleSpecificShortage = SQUAD_DEPARTMENTS.reduce(
    (sum, department) => sum + missingDepartments[department],
    0,
  );
  const requiredCandidateCount = Math.max(
    0,
    structuralNeeds.minimumPlayerCount - existingFreeAgentIds.length,
    roleSpecificShortage,
  );
  if (requiredCandidateCount === 0) return input.careerState;
  const intakeCandidates =
    input.intakeCandidates
    ?? input.createIntakeCandidates?.()
    ?? [];
  if (intakeCandidates.length === 0) return input.careerState;

  const pool = createCareerIntakePool({
    activePlayerIds: input.careerState.gameState.playerIds,
    activeClubIds: input.careerState.gameState.clubIds,
    candidates: intakeCandidates,
  });
  const selectedCandidates = selectRequiredIntakeCandidates({
    careerState: input.careerState,
    requestedClubIds,
    candidates: pool.candidates,
    count: requiredCandidateCount,
    missingDepartments,
  });
  if (selectedCandidates.length === 0) return input.careerState;

  return createCareerState({
    ...input.careerState,
    gameState: {
      ...input.careerState.gameState,
      players: {
        ...input.careerState.gameState.players,
        ...Object.fromEntries(
          selectedCandidates.map(({ player }) => [player.id, player]),
        ),
      },
      playerIds: [
        ...input.careerState.gameState.playerIds,
        ...selectedCandidates.map(({ player }) => player.id),
      ],
      playerStates: {
        ...input.careerState.gameState.playerStates,
        ...Object.fromEntries(
          selectedCandidates.map(({ player, playerState }) => [
            player.id,
            playerState,
          ]),
        ),
      },
    },
  });
}

const SQUAD_DEPARTMENTS = [
  "goalkeeper",
  "defender",
  "midfielder",
  "attacker",
] as const satisfies readonly PlayerSquadDepartment[];

type DepartmentCounts = Record<PlayerSquadDepartment, number>;

/** Counts the smallest global reserve needed for hard size and coverage. */
function requestedStructuralFreeAgentNeeds(
  careerState: CareerState,
  requestedClubIds: ReadonlySet<ClubId>,
): {
  readonly minimumPlayerCount: number;
  readonly missingDepartments: DepartmentCounts;
} {
  let minimumPlayerCount = 0;
  const missingDepartments = emptyDepartmentCounts();
  for (const clubId of careerState.gameState.clubIds) {
    if (!requestedClubIds.has(clubId)) continue;
    const club = careerState.gameState.clubs[clubId];
    const assessment = assessCareerSquadStructure({
      playerIds: club?.playerIds ?? [],
      players: careerState.gameState.players,
      targetSquadSize: MINIMUM_CAREER_SQUAD_SIZE,
    });
    const zeroCoverageCount = SQUAD_DEPARTMENTS.reduce(
      (count, department) => {
        if (assessment.departmentDepth[department] > 0) return count;
        missingDepartments[department] += 1;
        return count + 1;
      },
      0,
    );
    minimumPlayerCount += Math.max(
      MINIMUM_CAREER_SQUAD_SIZE - assessment.squadSize,
      zeroCoverageCount,
      0,
    );
  }
  return { minimumPlayerCount, missingDepartments };
}

/** Counts available free agents by their natural broad department. */
function freeAgentDepartmentCounts(
  careerState: CareerState,
  freeAgentIds: readonly PlayerId[],
): DepartmentCounts {
  const counts = emptyDepartmentCounts();
  for (const playerId of freeAgentIds) {
    const player = careerState.gameState.players[playerId];
    if (player !== undefined) counts[playerSquadDepartment(player)] += 1;
  }
  return counts;
}

/** Creates a mutable zeroed department counter for bounded selection. */
function emptyDepartmentCounts(): DepartmentCounts {
  return {
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    attacker: 0,
  };
}

/** Maps a department counter while preserving its exhaustive keys. */
function mapDepartmentCounts(
  counts: Readonly<DepartmentCounts>,
  mapValue: (count: number, department: PlayerSquadDepartment) => number,
): DepartmentCounts {
  return {
    goalkeeper: mapValue(counts.goalkeeper, "goalkeeper"),
    defender: mapValue(counts.defender, "defender"),
    midfielder: mapValue(counts.midfielder, "midfielder"),
    attacker: mapValue(counts.attacker, "attacker"),
  };
}

/**
 * Selects role-critical reserve candidates first, then fills the remaining
 * bounded count from candidates generated for structurally deficient clubs.
 */
function selectRequiredIntakeCandidates(input: {
  readonly careerState: CareerState;
  readonly requestedClubIds: ReadonlySet<ClubId>;
  readonly candidates: readonly CareerIntakeCandidate[];
  readonly count: number;
  readonly missingDepartments: Readonly<DepartmentCounts>;
}): readonly CareerIntakeCandidate[] {
  const assessmentByClub = new Map(
    input.careerState.gameState.clubIds
      .filter((clubId) => input.requestedClubIds.has(clubId))
      .map((clubId) => {
        const club = input.careerState.gameState.clubs[clubId];
        return [
          clubId,
          assessCareerSquadStructure({
            playerIds: club?.playerIds ?? [],
            players: input.careerState.gameState.players,
            targetSquadSize: MINIMUM_CAREER_SQUAD_SIZE,
          }),
        ] as const;
      }),
  );
  const ranked = input.candidates
    .map((candidate, index) => ({
      candidate,
      index,
      assessment: assessmentByClub.get(candidate.targetClubId),
    }))
    .sort((left, right) =>
      Number(right.assessment !== undefined) - Number(left.assessment !== undefined)
      || (
        Math.max(
          0,
          MINIMUM_CAREER_SQUAD_SIZE
            - (right.assessment?.squadSize ?? MINIMUM_CAREER_SQUAD_SIZE),
        )
        - Math.max(
          0,
          MINIMUM_CAREER_SQUAD_SIZE
            - (left.assessment?.squadSize ?? MINIMUM_CAREER_SQUAD_SIZE),
        )
      )
      || left.index - right.index);
  const selected: CareerIntakeCandidate[] = [];
  const selectedIds = new Set<PlayerId>();

  for (const department of SQUAD_DEPARTMENTS) {
    let remaining = input.missingDepartments[department];
    while (remaining > 0 && selected.length < input.count) {
      const entry = ranked.find(({ candidate, assessment }) =>
        !selectedIds.has(candidate.player.id)
        && playerSquadDepartment(candidate.player) === department
        && (
          assessment === undefined
          || assessment.departmentDepth[department] === 0
        ));
      if (entry === undefined) break;
      selected.push(entry.candidate);
      selectedIds.add(entry.candidate.player.id);
      remaining -= 1;
    }
  }

  for (const { candidate } of ranked) {
    if (selected.length >= input.count) break;
    if (selectedIds.has(candidate.player.id)) continue;
    selected.push(candidate);
    selectedIds.add(candidate.player.id);
  }
  return selected;
}

/**
 * Runs one atomic recruitment pass at a single squad-size objective.
 *
 * The public boundary invokes the minimum-size pass for every club before the
 * target-depth pass, so optional depth can never consume the shared pool ahead
 * of another club's hard 18-player floor.
 */
function replenishSeniorSquadsPass(
  input: ReplenishSeniorSquadsFromFreeAgentsInput,
  targetSquadSize: number,
  fillDepartmentDepthBeyondTarget: boolean,
): ReplenishSeniorSquadsFromFreeAgentsResult {
  if (
    input.careerState.seniorSquadState === undefined
    || input.careerState.clubFinanceState === undefined
  ) {
    return {
      careerState: input.careerState,
      records: [],
      wageBudgetReallocations: [],
      structuralWageBudgetTopUps: [],
      structuralReleases: [],
    };
  }

  let projectedCareerState = input.careerState;
  const requestedClubIds = new Set(input.clubIds);
  const freeAgentIds = new Set(selectFreeAgentPlayerIds(projectedCareerState));
  const rankedFreeAgents = rankFreeAgents(
    projectedCareerState,
    freeAgentIds,
    input.occurredOn,
    input.valuationConfig,
  );
  const sameDayDepartures = sameDayDepartureKeys(projectedCareerState, input.occurredOn);
  const plannedSignings: PlannedFreeAgentSigning[] = [];
  const plannedStructuralReleases: PlannedStructuralRelease[] = [];
  const structuralReleaseCountByClub = new Map<ClubId, number>();
  const reallocationByClub = new Map<ClubId, Money>();
  const structuralWageBudgetByClub = new Map<ClubId, Money>();
  const records: SquadMaintenanceRecord[] = [];
  const orderedClubIds = requestedClubIdsInStructuralOrder(
    projectedCareerState,
    requestedClubIds,
  );

  for (const clubId of orderedClubIds) {
    const club = projectedCareerState.gameState.clubs[clubId];
    if (club === undefined) continue;

    const beforeSquadSize = club.playerIds.length;
    const addedPlayerIds: PlayerId[] = [];
    const rejectedCandidates = new Set<PlayerId>();
    let affordableFreeAgents: readonly PlayerId[] | undefined;
    let structuralReleaseCheckpoint:
      | {
          readonly careerState: CareerState;
          readonly plannedSigningCount: number;
          readonly plannedStructuralReleaseCount: number;
          readonly addedPlayerCount: number;
          readonly previousReallocation: Money | undefined;
          readonly previousStructuralBudget: Money | undefined;
        }
      | undefined;

    while (true) {
      const currentClub = projectedCareerState.gameState.clubs[clubId];
      if (currentClub === undefined) break;
      const assessment = assessCareerSquadStructure({
        playerIds: currentClub.playerIds,
        players: projectedCareerState.gameState.players,
        targetSquadSize,
        fillDepartmentDepthBeyondTarget,
      });
      if (!assessment.requiresPlayer) break;
      const hardRepair =
        assessment.squadSize < MINIMUM_CAREER_SQUAD_SIZE
        || hasMissingMandatoryDepartment(assessment);
      const candidateOrder = hardRepair
        ? affordableFreeAgents ??= rankAffordableFreeAgentsForClub({
            careerState: projectedCareerState,
            freeAgentIds,
            clubId,
            occurredOn: input.occurredOn,
            wagePolicy: input.wagePolicy,
            valuationConfig: input.valuationConfig,
          })
        : rankedFreeAgents;

      const externalCandidate = nextCandidate({
        careerState: projectedCareerState,
        rankedFreeAgents: candidateOrder,
        freeAgentIds,
        rejectedCandidates,
        sameDayDepartures,
        clubId,
        ...(assessment.neededDepartment === undefined
          ? {}
          : { neededDepartment: assessment.neededDepartment }),
      });
      const sameDayStructuralCandidate = externalCandidate === undefined
        && assessment.neededDepartment !== undefined
        && assessment.departmentDepth[assessment.neededDepartment] === 0
          ? nextCandidate({
            careerState: projectedCareerState,
            rankedFreeAgents: candidateOrder,
            freeAgentIds,
            rejectedCandidates,
            sameDayDepartures,
            clubId,
            neededDepartment: assessment.neededDepartment,
            allowSameDayReturn: true,
          })
        : undefined;
      const minimumSquadFallbackCandidate =
        externalCandidate === undefined
        && sameDayStructuralCandidate === undefined
        && assessment.squadSize < MINIMUM_CAREER_SQUAD_SIZE
          ? nextCandidate({
              careerState: projectedCareerState,
              rankedFreeAgents: candidateOrder,
              freeAgentIds,
              rejectedCandidates,
              sameDayDepartures,
              clubId,
            })
          : undefined;
      const minimumSquadSameDayCandidate =
        externalCandidate === undefined
        && sameDayStructuralCandidate === undefined
        && minimumSquadFallbackCandidate === undefined
        && assessment.squadSize < MINIMUM_CAREER_SQUAD_SIZE
          ? nextCandidate({
              careerState: projectedCareerState,
              rankedFreeAgents: candidateOrder,
              freeAgentIds,
              rejectedCandidates,
              sameDayDepartures,
              clubId,
              allowSameDayReturn: true,
            })
          : undefined;
      const candidate = externalCandidate
        ?? sameDayStructuralCandidate
        ?? minimumSquadFallbackCandidate
        ?? minimumSquadSameDayCandidate;
      if (candidate === undefined) {
        const hasMissingDepartment = hasMissingMandatoryDepartment(assessment);
        const mayRebalance =
          (
            assessment.squadSize < MINIMUM_CAREER_SQUAD_SIZE
            || hasMissingDepartment
          )
          && (structuralReleaseCountByClub.get(clubId) ?? 0)
            < Math.max(1, TARGET_CAREER_SQUAD_SIZE - beforeSquadSize);
        const rebalanced = mayRebalance
          ? projectStructuralRelease({
              careerState: projectedCareerState,
              clubId,
            })
          : undefined;
        if (rebalanced !== undefined) {
          structuralReleaseCheckpoint ??= {
              careerState: projectedCareerState,
              plannedSigningCount: plannedSignings.length,
              plannedStructuralReleaseCount:
                plannedStructuralReleases.length,
              addedPlayerCount: addedPlayerIds.length,
              previousReallocation: reallocationByClub.get(clubId),
              previousStructuralBudget: structuralWageBudgetByClub.get(clubId),
            };
          projectedCareerState = rebalanced.careerState;
          plannedStructuralReleases.push({
            clubId,
            playerId: rebalanced.playerId,
            occurredOn: input.occurredOn,
          });
          structuralReleaseCountByClub.set(
            clubId,
            (structuralReleaseCountByClub.get(clubId) ?? 0) + 1,
          );
          rejectedCandidates.clear();
          continue;
        }
        break;
      }

      const planned = tryPlanCandidate({
        careerState: projectedCareerState,
        playerId: candidate,
        clubId,
        occurredOn: input.occurredOn,
        wagePolicy: input.wagePolicy,
        marketBehaviorPolicy: input.marketBehaviorPolicy,
        valuationConfig: input.valuationConfig,
        allowStructuralBudgetTopUp:
          assessment.squadSize < MINIMUM_CAREER_SQUAD_SIZE
          || assessment.neededDepartment !== undefined,
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
      if (
        planned.structuralBudgetTopUpUsed
        || structuralWageBudgetByClub.has(clubId)
      ) {
        const annualWageBudget =
          planned.projectedCareerState.clubFinanceState?.accounts[clubId]
            ?.annualWageBudget;
        if (annualWageBudget !== undefined) {
          structuralWageBudgetByClub.set(clubId, annualWageBudget);
        }
      }
      freeAgentIds.delete(candidate);
      addedPlayerIds.push(candidate);
    }

    let finalClub = projectedCareerState.gameState.clubs[clubId];
    let finalAssessment = assessCareerSquadStructure({
      playerIds: finalClub?.playerIds ?? [],
      players: projectedCareerState.gameState.players,
      targetSquadSize,
      fillDepartmentDepthBeyondTarget,
    });
    if (
      (
        finalAssessment.squadSize < MINIMUM_CAREER_SQUAD_SIZE
        || hasMissingMandatoryDepartment(finalAssessment)
      )
      && structuralReleaseCheckpoint !== undefined
    ) {
      for (
        const signing of plannedSignings.slice(
          structuralReleaseCheckpoint.plannedSigningCount,
        )
      ) {
        freeAgentIds.add(signing.playerId);
      }
      plannedSignings.length =
        structuralReleaseCheckpoint.plannedSigningCount;
      plannedStructuralReleases.length =
        structuralReleaseCheckpoint.plannedStructuralReleaseCount;
      structuralReleaseCountByClub.delete(clubId);
      projectedCareerState = structuralReleaseCheckpoint.careerState;
      addedPlayerIds.length = structuralReleaseCheckpoint.addedPlayerCount;
      if (structuralReleaseCheckpoint.previousReallocation === undefined) {
        reallocationByClub.delete(clubId);
      } else {
        reallocationByClub.set(
          clubId,
          structuralReleaseCheckpoint.previousReallocation,
        );
      }
      if (structuralReleaseCheckpoint.previousStructuralBudget === undefined) {
        structuralWageBudgetByClub.delete(clubId);
      } else {
        structuralWageBudgetByClub.set(
          clubId,
          structuralReleaseCheckpoint.previousStructuralBudget,
        );
      }
      finalClub = projectedCareerState.gameState.clubs[clubId];
      finalAssessment = assessCareerSquadStructure({
        playerIds: finalClub?.playerIds ?? [],
        players: projectedCareerState.gameState.players,
        targetSquadSize,
        fillDepartmentDepthBeyondTarget,
      });
    }
    records.push({
      clubId,
      beforeSquadSize,
      afterSquadSize: finalClub?.playerIds.length ?? 0,
      addedPlayerIds,
      warnings: finalAssessment.warnings,
    });
  }

  if (plannedSignings.length === 0) {
    return {
      careerState: input.careerState,
      records,
      wageBudgetReallocations: [],
      structuralWageBudgetTopUps: [],
      structuralReleases: [],
    };
  }

  const wageBudgetReallocations = [...reallocationByClub]
    .map(([clubId, amount]) => ({ clubId, amount }))
    .sort((left, right) => String(left.clubId).localeCompare(String(right.clubId)));
  const departed = applyPlannedStructuralReleases(
    input.careerState,
    plannedStructuralReleases,
  );
  const reallocated = reallocateTransferBudgetsToWages({
    careerState: departed,
    allocations: wageBudgetReallocations.map((allocation) => ({
      ...allocation,
      allowSaleProceeds: true,
    })),
  });
  if (reallocated.status === "rejected") {
    throw new Error(`Planned free-agent budget allocation failed: ${reallocated.reason}`);
  }
  let budgetedCareerState = reallocated.careerState;
  const structuralWageBudgetTopUps: {
    readonly clubId: ClubId;
    readonly amount: Money;
  }[] = [];
  for (const [clubId, requiredAnnualWageBudget] of structuralWageBudgetByClub) {
    const beforeBudget =
      budgetedCareerState.clubFinanceState?.accounts[clubId]?.annualWageBudget;
    const toppedUp = ensureStructuralWageBudget({
      careerState: budgetedCareerState,
      clubId,
      requiredAnnualWageBudget,
      wagePolicy: input.wagePolicy,
    });
    if (toppedUp.status === "rejected") {
      throw new Error(`Planned structural wage-budget repair failed: ${toppedUp.reason}`);
    }
    budgetedCareerState = toppedUp.careerState;
    const afterBudget =
      budgetedCareerState.clubFinanceState?.accounts[clubId]?.annualWageBudget;
    if (
      beforeBudget !== undefined
      && afterBudget !== undefined
      && afterBudget > beforeBudget
    ) {
      structuralWageBudgetTopUps.push({
        clubId,
        amount: nonNegativeMoney(afterBudget - beforeBudget),
      });
    }
  }
  if (budgetedCareerState.seniorSquadState === undefined) {
    throw new Error("Planned free-agent budget allocation failed: senior_squad_state_missing");
  }

  const historySequence = budgetedCareerState.seniorSquadState.contractHistoryEntryIds.length;
  const prepared = prepareSeniorSquadSignings({
    gameState: budgetedCareerState.gameState,
    seniorSquadState: budgetedCareerState.seniorSquadState,
    signings: plannedSignings.map((signing, index) => ({
      ...signing,
      transitionSequence: historySequence + index + 1,
    })),
  });
  const financed = applyContractActivationsFinance({
    careerState: budgetedCareerState,
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

  return {
    careerState: financed.careerState,
    records,
    wageBudgetReallocations,
    structuralWageBudgetTopUps,
    structuralReleases: plannedStructuralReleases.map(
      ({ clubId, playerId }) => ({ clubId, playerId }),
    ),
  };
}

/** Combines the hard-floor and optional-depth passes into one factual result. */
function mergeReplenishmentPasses(
  structuralPass: ReplenishSeniorSquadsFromFreeAgentsResult,
  depthPass: ReplenishSeniorSquadsFromFreeAgentsResult,
): ReplenishSeniorSquadsFromFreeAgentsResult {
  const depthRecordByClub = new Map(
    depthPass.records.map((record) => [record.clubId, record]),
  );
  const records = structuralPass.records.map((record) => {
    const depthRecord = depthRecordByClub.get(record.clubId);
    return depthRecord === undefined
      ? record
      : {
          clubId: record.clubId,
          beforeSquadSize: record.beforeSquadSize,
          afterSquadSize: depthRecord.afterSquadSize,
          addedPlayerIds: [
            ...record.addedPlayerIds,
            ...depthRecord.addedPlayerIds,
          ],
          warnings: depthRecord.warnings,
        };
  });
  return {
    careerState: depthPass.careerState,
    records,
    wageBudgetReallocations: mergeMoneyByClub(
      structuralPass.wageBudgetReallocations,
      depthPass.wageBudgetReallocations,
    ),
    structuralWageBudgetTopUps: mergeMoneyByClub(
      structuralPass.structuralWageBudgetTopUps,
      depthPass.structuralWageBudgetTopUps,
    ),
    structuralReleases: [
      ...structuralPass.structuralReleases,
      ...depthPass.structuralReleases,
    ],
  };
}

/** Adds per-club money facts emitted by consecutive passes. */
function mergeMoneyByClub(
  first: readonly { readonly clubId: ClubId; readonly amount: Money }[],
  second: readonly { readonly clubId: ClubId; readonly amount: Money }[],
): readonly { readonly clubId: ClubId; readonly amount: Money }[] {
  const amountByClub = new Map<ClubId, Money>();
  for (const allocation of [...first, ...second]) {
    amountByClub.set(
      allocation.clubId,
      addMoney(
        amountByClub.get(allocation.clubId) ?? nonNegativeMoney(0),
        allocation.amount,
      ),
    );
  }
  return [...amountByClub]
    .map(([clubId, amount]) => ({ clubId, amount }))
    .sort((left, right) =>
      String(left.clubId).localeCompare(String(right.clubId)));
}

function rankFreeAgents(
  careerState: CareerState,
  freeAgentIds: ReadonlySet<PlayerId>,
  occurredOn: GameDate,
  valuationConfig: PlayerValuationConfig,
): readonly PlayerId[] {
  return [...freeAgentIds]
    .flatMap((playerId) => {
      const player = careerState.gameState.players[playerId];
      return player === undefined
        ? []
        : [{
            playerId,
            currentAbility: derivePublicPlayerAssessment({
              player,
              currentDate: occurredOn,
              potentialProjectionPolicy: valuationConfig.potentialProjectionPolicy,
              ratingScale: valuationConfig.ratingScale,
            }).currentAbility,
          }];
    })
    .sort((left, right) =>
      right.currentAbility - left.currentAbility
      || String(left.playerId).localeCompare(String(right.playerId)))
    .map(({ playerId }) => playerId);
}

/**
 * Gives hard structural repairs the exact cheapest contract demand first.
 *
 * Age, role, squad status, and rating can all change terms, so ability alone
 * is not a safe affordability proxy. Ordinary depth recruitment continues to
 * use the strongest-player ranking.
 */
function rankAffordableFreeAgentsForClub(input: {
  readonly careerState: CareerState;
  readonly freeAgentIds: ReadonlySet<PlayerId>;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly valuationConfig: PlayerValuationConfig;
}): readonly PlayerId[] {
  return [...input.freeAgentIds]
    .flatMap((playerId) => {
      const player = input.careerState.gameState.players[playerId];
      if (player === undefined) return [];
      try {
        const publicAssessment = derivePublicPlayerAssessment({
          player,
          currentDate: input.occurredOn,
          potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
          ratingScale: input.valuationConfig.ratingScale,
        });
        const terms = deriveContractDemand({
          careerState: input.careerState,
          wagePolicy: input.wagePolicy,
          publicAssessment,
          playerId,
          clubId: input.clubId,
          evaluatedOn: input.occurredOn,
          isFreeAgent: true,
        }).minimumTerms;
        return [{
          playerId,
          annualWage: terms.annualWage,
          signingBonus: terms.bonuses.signingBonus,
          currentAbility: publicAssessment.currentAbility,
        }];
      } catch {
        return [];
      }
    })
    .sort((left, right) =>
      left.annualWage - right.annualWage
      || left.signingBonus - right.signingBonus
      || right.currentAbility - left.currentAbility
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
  /** Last-resort zero-department recovery after external candidates are exhausted. */
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

interface PlannedStructuralRelease {
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
}

interface PlannedCandidate {
  readonly projectedCareerState: CareerState;
  readonly terms: ContractOfferTerms;
  readonly reallocatedAmount: Money;
  readonly structuralBudgetTopUpUsed: boolean;
}

function tryPlanCandidate(input: {
  readonly careerState: CareerState;
  readonly playerId: PlayerId;
  readonly clubId: ClubId;
  readonly occurredOn: GameDate;
  readonly wagePolicy: PlayerWagePolicyConfig;
  readonly marketBehaviorPolicy: MarketBehaviorCalibrationConfig;
  readonly valuationConfig: PlayerValuationConfig;
  readonly allowStructuralBudgetTopUp: boolean;
}): PlannedCandidate | undefined {
  let proposedCareerState = input.careerState;
  let reallocatedAmount = nonNegativeMoney(0);
  let structuralBudgetTopUpUsed = false;
  let terms: ContractOfferTerms;
  try {
    const player = proposedCareerState.gameState.players[input.playerId];
    if (player === undefined) return undefined;
    const publicAssessment = derivePublicPlayerAssessment({
      player,
      currentDate: input.occurredOn,
      potentialProjectionPolicy: input.valuationConfig.potentialProjectionPolicy,
      ratingScale: input.valuationConfig.ratingScale,
    });
    terms = deriveContractDemand({
      careerState: proposedCareerState,
      wagePolicy: input.wagePolicy,
      publicAssessment,
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
    wagePolicy: input.wagePolicy,
    marketBehaviorPolicy: input.marketBehaviorPolicy,
    addedAnnualWage: terms.annualWage,
    addedSigningBonus: terms.bonuses.signingBonus,
    allowFullWageBudgetForStructuralRepair:
      input.allowStructuralBudgetTopUp,
  });
  if (capacity.status === "unaffordable" && capacity.reason === "wage_budget_exceeded") {
    if (capacity.requiredAmount === undefined || capacity.availableAmount === undefined) return undefined;
    reallocatedAmount = wageBudgetReallocationRequired(
      nonNegativeMoney(capacity.requiredAmount - capacity.availableAmount),
      input.allowStructuralBudgetTopUp
        ? 10_000
        : input.marketBehaviorPolicy.affordability.maximumWageBudgetUseBasisPoints,
    );
    let reallocated = projectTransferBudgetToWages(
      proposedCareerState,
      input.clubId,
      reallocatedAmount,
      input.wagePolicy,
    );
    if (
      reallocated === undefined
      && input.allowStructuralBudgetTopUp
    ) {
      reallocated = projectStructuralWageBudget({
        careerState: proposedCareerState,
        clubId: input.clubId,
        requiredIncrease: reallocatedAmount,
        wagePolicy: input.wagePolicy,
      });
      structuralBudgetTopUpUsed = reallocated !== undefined;
      if (structuralBudgetTopUpUsed) {
        reallocatedAmount = nonNegativeMoney(0);
      }
    }
    if (reallocated === undefined) return undefined;
    proposedCareerState = reallocated;
    capacity = evaluateCareerContractCapacity({
      careerState: proposedCareerState,
      clubId: input.clubId,
      wagePolicy: input.wagePolicy,
      marketBehaviorPolicy: input.marketBehaviorPolicy,
      addedAnnualWage: terms.annualWage,
      addedSigningBonus: terms.bonuses.signingBonus,
      allowFullWageBudgetForStructuralRepair:
        input.allowStructuralBudgetTopUp,
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
    : {
        projectedCareerState: projected,
        terms,
        reallocatedAmount,
        structuralBudgetTopUpUsed,
      };
}

/**
 * Grosses up missing usable wage room because only the configured percentage
 * of each budget unit may be committed. Integer ceiling keeps the second
 * affordability check from remaining one cent below the required capacity.
 */
function wageBudgetReallocationRequired(
  usableShortfall: Money,
  maximumUseBasisPoints: number,
): Money {
  if (usableShortfall === 0) return nonNegativeMoney(0);
  if (maximumUseBasisPoints <= 0) {
    throw new Error("Wage-budget utilization must be positive");
  }
  const basisPoints = BigInt(maximumUseBasisPoints);
  return nonNegativeMoney(Number(
    (BigInt(usableShortfall) * 10_000n + basisPoints - 1n) / basisPoints,
  ));
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
  wagePolicy: PlayerWagePolicyConfig,
): CareerState | undefined {
  const club = careerState.gameState.clubs[clubId];
  const financeState = careerState.clubFinanceState;
  const account = financeState?.accounts[clubId];
  const target = wagePolicy.wageFinanceCalibration.gameDesignTargets.find(
    (candidate) => candidate.division === club?.category,
  );
  if (
    financeState === undefined
    || account === undefined
    || target === undefined
    || amount <= 0
  ) return undefined;
  const available = account.availableTransferBudget;
  if (
    amount > available
    || account.annualWageBudget + amount
      > target.annualSeniorWageBudgetMaximumMinorUnits
  ) return undefined;
  return {
    ...careerState,
    clubFinanceState: {
      ...financeState,
      accounts: {
        ...financeState.accounts,
        [clubId]: {
          ...account,
          annualTransferBudget: nonNegativeMoney(
            Math.max(0, account.annualTransferBudget - amount),
          ),
          availableTransferBudget: subtractMoney(account.availableTransferBudget, amount),
          annualWageBudget: addMoney(account.annualWageBudget, amount),
        },
      },
    },
  };
}

/** Projects a tier-capped wage ceiling used only to restore squad structure. */
function projectStructuralWageBudget(input: {
  readonly careerState: CareerState;
  readonly clubId: ClubId;
  readonly requiredIncrease: Money;
  readonly wagePolicy: PlayerWagePolicyConfig;
}): CareerState | undefined {
  const club = input.careerState.gameState.clubs[input.clubId];
  const financeState = input.careerState.clubFinanceState;
  const account = financeState?.accounts[input.clubId];
  const target = input.wagePolicy.wageFinanceCalibration.gameDesignTargets.find(
    (candidate) => candidate.division === club?.category,
  );
  if (
    financeState === undefined
    || account === undefined
    || target === undefined
  ) return undefined;
  const annualWageBudget = account.annualWageBudget + input.requiredIncrease;
  if (
    annualWageBudget
      > target.annualSeniorWageBudgetMaximumMinorUnits
  ) return undefined;
  return {
    ...input.careerState,
    clubFinanceState: {
      ...financeState,
      accounts: {
        ...financeState.accounts,
        [input.clubId]: {
          ...account,
          annualWageBudget: nonNegativeMoney(annualWageBudget),
        },
      },
    },
  };
}

/**
 * Gives hard squad invariants first access to the shared free-agent pool.
 *
 * Stable club order remains the tie-breaker. Clubs seeking only target depth
 * cannot consume affordable candidates before another requested club reaches
 * 18 players and one natural player in every broad department.
 */
function requestedClubIdsInStructuralOrder(
  careerState: CareerState,
  requestedClubIds: ReadonlySet<ClubId>,
): readonly ClubId[] {
  return careerState.gameState.clubIds
    .filter((clubId) => requestedClubIds.has(clubId))
    .map((clubId) => {
      const club = careerState.gameState.clubs[clubId];
      const assessment = assessCareerSquadStructure({
        playerIds: club?.playerIds ?? [],
        players: careerState.gameState.players,
        fillDepartmentDepthBeyondTarget: true,
      });
      return {
        clubId,
        hardViolation:
          assessment.squadSize < MINIMUM_CAREER_SQUAD_SIZE
          || hasMissingMandatoryDepartment(assessment),
        squadDeficit: Math.max(
          0,
          MINIMUM_CAREER_SQUAD_SIZE - assessment.squadSize,
        ),
      };
    })
    .sort((left, right) =>
      Number(right.hardViolation) - Number(left.hardViolation)
      || right.squadDeficit - left.squadDeficit
      || String(left.clubId).localeCompare(String(right.clubId))
    )
    .map(({ clubId }) => clubId);
}

/** Detects only zero-coverage departments, not ordinary target-depth warnings. */
function hasMissingMandatoryDepartment(
  assessment: ReturnType<typeof assessCareerSquadStructure>,
): boolean {
  return assessment.departmentDepth.goalkeeper === 0
    || assessment.departmentDepth.defender === 0
    || assessment.departmentDepth.midfielder === 0
    || assessment.departmentDepth.attacker === 0;
}

/**
 * Projects one release when an explicitly requested club cannot fund the hard
 * squad floor or a zero-coverage department.
 *
 * A player is eligible only while another natural player remains in the same
 * broad department. This lets an unbalanced club shed an excess goalkeeper or
 * outfielder without creating a new zero-coverage failure. The normal season
 * caller omits the manager's club; report/test callers may opt into it. The
 * later batch commit repeats the same canonical departure and finance
 * reconciliation.
 */
function projectStructuralRelease(input: {
  readonly careerState: CareerState;
  readonly clubId: ClubId;
}): { readonly careerState: CareerState; readonly playerId: PlayerId } | undefined {
  const senior = input.careerState.seniorSquadState;
  const club = input.careerState.gameState.clubs[input.clubId];
  if (senior === undefined || input.careerState.clubFinanceState === undefined) {
    return undefined;
  }
  const departmentDepth = new Map<PlayerSquadDepartment, number>();
  for (const playerId of club?.playerIds ?? []) {
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined) continue;
    const department = playerSquadDepartment(player);
    departmentDepth.set(
      department,
      (departmentDepth.get(department) ?? 0) + 1,
    );
  }
  const candidates = senior.activeContractIds
    .flatMap((contractId): readonly PlayerContract[] => {
      const contract = senior.contracts[contractId];
      const player = contract === undefined
        ? undefined
        : input.careerState.gameState.players[contract.playerId];
      return contract?.clubId === input.clubId
        && club?.playerIds.includes(contract.playerId) === true
        && player !== undefined
        && (departmentDepth.get(playerSquadDepartment(player)) ?? 0) > 1
        ? [contract]
        : [];
    })
    .sort((left, right) =>
      right.annualWage - left.annualWage
      || String(left.playerId).localeCompare(String(right.playerId))
    );
  const contract = candidates[0];
  if (contract === undefined) return undefined;
  const financeState = input.careerState.clubFinanceState;
  const account = financeState?.accounts[input.clubId];
  if (club === undefined || financeState === undefined || account === undefined) {
    return undefined;
  }
  return {
    playerId: contract.playerId,
    careerState: {
      ...input.careerState,
      gameState: {
        ...input.careerState.gameState,
        clubs: {
          ...input.careerState.gameState.clubs,
          [input.clubId]: {
            ...club,
            playerIds: club.playerIds.filter(
              (playerId) => playerId !== contract.playerId,
            ),
          },
        },
      },
      clubFinanceState: {
        ...financeState,
        accounts: {
          ...financeState.accounts,
          [input.clubId]: {
            ...account,
            committedAnnualWage: subtractMoney(
              account.committedAnnualWage,
              contract.annualWage,
            ),
          },
        },
      },
    },
  };
}

/** Commits the ordered structural releases before budgets and signings. */
function applyPlannedStructuralReleases(
  careerState: CareerState,
  releases: readonly PlannedStructuralRelease[],
): CareerState {
  const senior = careerState.seniorSquadState;
  if (releases.length === 0 || senior === undefined) return careerState;
  const prepared = prepareSeniorSquadDepartures({
    gameState: careerState.gameState,
    seniorSquadState: senior,
    departures: releases.map((release, index) => ({
      playerId: release.playerId,
      occurredOn: release.occurredOn,
      transitionSequence: senior.contractHistoryEntryIds.length + index + 1,
      event: "released" as const,
    })),
  });
  const contractNegotiationState = reconcileClosedContractNegotiations({
    gameState: prepared.gameState,
    seniorSquadState: prepared.seniorSquadState,
    contractNegotiationState: careerState.contractNegotiationState,
    closedContractIds: prepared.endedContractIds,
  });
  const reconciled = reconcileActiveContractWageCommitments({
    careerState,
    gameState: prepared.gameState,
    seniorSquadState: prepared.seniorSquadState,
    contractNegotiationState: contractNegotiationState ?? null,
  });
  if (reconciled.status === "rejected") {
    throw new Error(`Structural release finance reconciliation failed: ${reconciled.reason}`);
  }
  return reconciled.careerState;
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
