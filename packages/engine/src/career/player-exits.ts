import {
  createSeniorSquadState,
  getPlayerRoleProfile,
  rawDiagnosticAbilityAverage,
  roleCurrentAbility,
  type CareerState,
  type Club,
  type Player,
  type PlayerContractId,
  type PlayerId,
  type PlayerPosition,
  type PlayerRole,
  type SeasonId,
} from "@game/domain";
import { deriveRng } from "@game/shared";
import { reconcileActiveContractWageCommitments } from "./career-finance-lifecycle.ts";
import { reconcileClosedContractNegotiations } from "./contract-negotiation.ts";
import {
  prepareSeniorSquadDepartures,
  type PrepareSeniorSquadDepartureInput,
} from "./senior-squad-transfer.ts";

type BroadPositionGroup = "goalkeeper" | "defender" | "midfielder" | "attacker";
const MINIMUM_POST_EXIT_SQUAD_SIZE = 18;

/** Stable machine-readable reason for one end-of-season player exit. */
export type PlayerExitReason = "retirement" | "released" | "career_step_down";

/** Input for deterministic end-of-season player exits. */
export interface PlayerExitInput {
  /** Durable career state before exits are applied. */
  readonly careerState: CareerState;
  /** Stable world seed used to derive per-player exit rolls. */
  readonly worldSeed: string;
  /** Season ID being closed by this exit pass. */
  readonly seasonId: SeasonId;
}

/** One factual player-exit record for later reports and tests. */
export interface PlayerExitRecord {
  /** Player whose senior-club ownership ended. */
  readonly playerId: PlayerId;
  /** Club that owned the player before the exit; absent for an unattached player. */
  readonly clubId?: Club["id"];
  /** Whole-years age at the current career date. */
  readonly age: number;
  /** Broad role bucket used by the exit model. */
  readonly positionGroup: BroadPositionGroup;
  /** Historical raw diagnostic average used by the exit threshold model. */
  readonly currentAbilityAverage: number;
  /** Machine-readable exit reason. */
  readonly reason: PlayerExitReason;
}

/** Result of one pure end-of-season exit pass. */
export interface PlayerExitResult {
  /** Canonical career state with ownership, employment, and finance updated. */
  readonly careerState: CareerState;
  /** Structured non-presentational exit records. */
  readonly exits: readonly PlayerExitRecord[];
}

/**
 * Applies deterministic end-of-season player exits.
 *
 * Every exit first closes the registration and active contract. Retirements and
 * career step-downs then leave active world traversal, while released players
 * remain as real free agents. Immutable player and contract-history records stay
 * readable. This function never creates replacements or silently chooses a new
 * user lineup.
 */
export function applyEndOfSeasonPlayerExits(input: PlayerExitInput): PlayerExitResult {
  if (input.careerState.seniorSquadState === undefined || input.careerState.clubFinanceState === undefined) {
    throw new Error("Canonical senior-squad and club-finance state are required for player exits");
  }

  const exits: PlayerExitRecord[] = [];
  const inactivePlayerIds = new Set<PlayerId>();
  const departingPlayerIds = new Set<PlayerId>();
  const endedContractIds: PlayerContractId[] = [];
  const departures: Omit<
    PrepareSeniorSquadDepartureInput,
    "gameState" | "seniorSquadState"
  >[] = [];
  const remainingPlayersByClub = new Map(
    input.careerState.gameState.clubIds.map((clubId) => [
      clubId,
      input.careerState.gameState.clubs[clubId]?.playerIds.length ?? 0,
    ]),
  );
  const remainingDepartmentsByClub = new Map(
    input.careerState.gameState.clubIds.map((clubId) => [
      clubId,
      departmentCounts(input.careerState, clubId),
    ]),
  );
  let gameState = input.careerState.gameState;
  let seniorSquadState = input.careerState.seniorSquadState;

  for (const playerId of input.careerState.gameState.playerIds) {
    const player = input.careerState.gameState.players[playerId];
    if (player === undefined) {
      continue;
    }

    const clubId = owningClubId(input.careerState, playerId);
    const club = clubId === undefined
      ? undefined
      : input.careerState.gameState.clubs[clubId];
    const unattachedSince = clubId === undefined
      ? latestUnattachedDate(input.careerState, playerId)
      : undefined;

    const evaluation = evaluatePlayerExit({
      player,
      currentDate: input.careerState.gameState.calendar.currentDate,
      worldSeed: input.worldSeed,
      seasonId: input.seasonId,
      clubPlayerCount: clubId === undefined
        ? Number.POSITIVE_INFINITY
        : remainingPlayersByClub.get(clubId) ?? club?.playerIds.length ?? 0,
      clubDepartmentCount: clubId === undefined
        ? Number.POSITIVE_INFINITY
        : remainingDepartmentsByClub.get(clubId)?.[broadPositionGroup(player.naturalPositions[0])] ?? 0,
      ...(unattachedSince === undefined ? {} : { unattachedSince }),
    });
    if (evaluation === undefined) {
      continue;
    }
    if (clubId === undefined) {
      if (evaluation.reason === "released") continue;
      inactivePlayerIds.add(playerId);
      exits.push({
        playerId,
        age: evaluation.age,
        positionGroup: evaluation.positionGroup,
        currentAbilityAverage: evaluation.currentAbilityAverage,
        reason: evaluation.reason,
      });
      continue;
    }
    if (clubId === input.careerState.selectedClubId && evaluation.reason !== "retirement") {
      continue;
    }

    departures.push({
      playerId,
      occurredOn: input.careerState.gameState.calendar.currentDate,
      transitionSequence: seniorSquadState.contractHistoryEntryIds.length + departures.length + 1,
      event: "released",
    });
    departingPlayerIds.add(playerId);
    remainingPlayersByClub.set(clubId, Math.max(0, (remainingPlayersByClub.get(clubId) ?? 0) - 1));
    const remainingDepartments = remainingDepartmentsByClub.get(clubId);
    if (remainingDepartments !== undefined) {
      remainingDepartments[evaluation.positionGroup] = Math.max(
        0,
        remainingDepartments[evaluation.positionGroup] - 1,
      );
    }
    if (evaluation.reason !== "released") inactivePlayerIds.add(playerId);
    exits.push({
      playerId,
      clubId,
      age: evaluation.age,
      positionGroup: evaluation.positionGroup,
      currentAbilityAverage: evaluation.currentAbilityAverage,
      reason: evaluation.reason,
    });
  }

  if (exits.length === 0) {
    return {
      careerState: input.careerState,
      exits,
    };
  }

  if (departures.length > 0) {
    const prepared = prepareSeniorSquadDepartures({
      gameState,
      seniorSquadState,
      departures,
    });
    gameState = prepared.gameState;
    seniorSquadState = prepared.seniorSquadState;
    endedContractIds.push(...prepared.endedContractIds);
  }

  if (inactivePlayerIds.size > 0) {
    const playerStates = { ...gameState.playerStates };
    for (const playerId of inactivePlayerIds) delete playerStates[playerId];
    gameState = {
      ...gameState,
      playerIds: gameState.playerIds.filter((playerId) => !inactivePlayerIds.has(playerId)),
      playerStates,
    };
    seniorSquadState = createSeniorSquadState(gameState, seniorSquadState);
  }

  const matchPreparation = removePlayersFromPreparation(input.careerState.matchPreparation, departingPlayerIds);
  const contractNegotiationState = reconcileClosedContractNegotiations({
    gameState,
    seniorSquadState,
    contractNegotiationState: input.careerState.contractNegotiationState,
    closedContractIds: endedContractIds,
  });
  const reconciled = reconcileActiveContractWageCommitments({
    careerState: input.careerState,
    gameState,
    seniorSquadState,
    contractNegotiationState: contractNegotiationState ?? null,
    matchPreparation: matchPreparation ?? null,
  });
  if (reconciled.status === "rejected") {
    throw new Error(`Player-exit finance reconciliation failed: ${reconciled.reason}`);
  }

  return {
    careerState: reconciled.careerState,
    exits,
  };
}

interface PlayerExitEvaluationInput {
  readonly player: Player;
  readonly currentDate: CareerState["gameState"]["calendar"]["currentDate"];
  readonly worldSeed: string;
  readonly seasonId: SeasonId;
  readonly clubPlayerCount: number;
  /** Current players in the candidate's broad department at the owning club. */
  readonly clubDepartmentCount: number;
  /** Factual date when an unattached player most recently left a club or academy. */
  readonly unattachedSince?: CareerState["gameState"]["calendar"]["currentDate"];
}

interface PlayerExitEvaluation {
  readonly age: number;
  readonly positionGroup: BroadPositionGroup;
  readonly currentAbilityAverage: number;
  readonly reason: PlayerExitReason;
}

function evaluatePlayerExit(input: PlayerExitEvaluationInput): PlayerExitEvaluation | undefined {
  const age = Math.floor((input.currentDate - input.player.birthDate) / 365);
  const positionGroup = broadPositionGroup(input.player.naturalPositions[0]);
  const currentAbilityAverage = playerExitAbility(input.player);
  const unattachedPatienceDays = positionGroup === "goalkeeper" ? 1_825 : 730;
  const hasExhaustedLowerDivisionInterest =
    input.clubPlayerCount === Number.POSITIVE_INFINITY
    && input.unattachedSince !== undefined
    && input.currentDate - input.unattachedSince >= unattachedPatienceDays
    && currentAbilityAverage < 8;
  const candidate = hasExhaustedLowerDivisionInterest
    ? { reason: "career_step_down" as const, probability: 1 }
    : exitCandidateFor(positionGroup, age, currentAbilityAverage);
  if (candidate === undefined) {
    return undefined;
  }
  if (
    input.clubPlayerCount !== Number.POSITIVE_INFINITY
    && input.clubDepartmentCount <= 1
  ) {
    return undefined;
  }
  if (candidate.reason !== "retirement" && input.clubPlayerCount <= MINIMUM_POST_EXIT_SQUAD_SIZE) {
    return undefined;
  }

  const rng = deriveRng(input.worldSeed, "career-player-exit", input.seasonId, input.player.id);
  if (rng.nextFloat() > candidate.probability) {
    return undefined;
  }

  return {
    age,
    positionGroup,
    currentAbilityAverage,
    reason: candidate.reason,
  };
}

/** Counts current senior players by broad department for one club. */
function departmentCounts(
  careerState: CareerState,
  clubId: Club["id"],
): Record<BroadPositionGroup, number> {
  const counts: Record<BroadPositionGroup, number> = {
    goalkeeper: 0,
    defender: 0,
    midfielder: 0,
    attacker: 0,
  };
  for (const playerId of careerState.gameState.clubs[clubId]?.playerIds ?? []) {
    const player = careerState.gameState.players[playerId];
    if (player !== undefined) {
      counts[broadPositionGroup(player.naturalPositions[0])] += 1;
    }
  }
  return counts;
}

function exitCandidateFor(
  positionGroup: BroadPositionGroup,
  age: number,
  currentAbilityAverage: number,
): { readonly reason: PlayerExitReason; readonly probability: number } | undefined {
  if (positionGroup === "goalkeeper") {
    if (age >= 40) return { reason: "retirement", probability: 1 };
    if (age >= 38 && currentAbilityAverage <= 8.5) return { reason: "retirement", probability: 0.85 };
    if (age >= 36 && currentAbilityAverage <= 7.5) return { reason: "career_step_down", probability: 0.45 };
    return undefined;
  }

  if (age >= 37) return { reason: "retirement", probability: 1 };
  if (age >= 35 && currentAbilityAverage <= 8.5) return { reason: "retirement", probability: 0.8 };
  if (age >= 33 && currentAbilityAverage <= 7.5) return { reason: "career_step_down", probability: 0.6 };
  if (age >= 32 && currentAbilityAverage <= 6.5) return { reason: "released", probability: 0.45 };
  return undefined;
}

/** Returns the role-shaped active quality used for exit decisions. */
function playerExitAbility(player: Player): number {
  const role = player.primaryRole ?? roleForPosition(player.naturalPositions[0]);
  if (role === undefined) {
    return roundAverage(Number(rawDiagnosticAbilityAverage(player.abilities)));
  }

  return roundAverage(Number(roleCurrentAbility(player.abilities, getPlayerRoleProfile(role))));
}

/**
 * Finds the latest explicit transition that made a player available to this
 * career layer, including academy releases that have no senior contract row.
 */
function latestUnattachedDate(
  careerState: CareerState,
  playerId: PlayerId,
): CareerState["gameState"]["calendar"]["currentDate"] | undefined {
  let latest: number | undefined;
  for (const historyId of careerState.seniorSquadState?.contractHistoryEntryIds ?? []) {
    const history = careerState.seniorSquadState?.contractHistory[historyId];
    if (
      history?.playerId !== playerId
      || (history.event !== "expired" && history.event !== "released")
    ) {
      continue;
    }
    latest = latest === undefined
      ? Number(history.occurredOn)
      : Math.max(latest, Number(history.occurredOn));
  }

  const youthLifecycle = careerState.youthAcademyState?.playerLifecycle[playerId];
  if (
    youthLifecycle?.statusChangedAt !== undefined
    && (
      youthLifecycle.status === "released"
      || youthLifecycle.status === "external_move_candidate"
    )
  ) {
    latest = latest === undefined
      ? Number(youthLifecycle.statusChangedAt)
      : Math.max(latest, Number(youthLifecycle.statusChangedAt));
  }

  return latest as CareerState["gameState"]["calendar"]["currentDate"] | undefined;
}

function removePlayersFromPreparation(
  preparation: CareerState["matchPreparation"],
  departedPlayerIds: ReadonlySet<PlayerId>,
): CareerState["matchPreparation"] {
  if (preparation === undefined) return undefined;
  return {
    ...preparation,
    ...(preparation.selectedLineup === undefined
      ? {}
      : {
          selectedLineup: {
            ...preparation.selectedLineup,
            slots: preparation.selectedLineup.slots.filter((slot) => !departedPlayerIds.has(slot.playerId)),
          },
        }),
    ...(preparation.benchSlots === undefined
      ? {}
      : { benchSlots: preparation.benchSlots.filter((slot) => !departedPlayerIds.has(slot.playerId)) }),
  };
}

function owningClubId(careerState: CareerState, playerId: PlayerId): Club["id"] | undefined {
  for (const clubId of careerState.gameState.clubIds) {
    const club = careerState.gameState.clubs[clubId];
    if (club === undefined) {
      continue;
    }

    if (club.playerIds.includes(playerId)) {
      return clubId;
    }
  }

  return undefined;
}

function broadPositionGroup(position: PlayerPosition | undefined): BroadPositionGroup {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "rb":
    case "cb":
    case "lb":
    case "rwb":
    case "lwb":
      return "defender";
    case "dm":
    case "cm":
    case "am":
      return "midfielder";
    case "rw":
    case "lw":
    case "st":
    default:
      return "attacker";
  }
}

function roleForPosition(position: PlayerPosition | undefined): PlayerRole | undefined {
  switch (position) {
    case "gk":
      return "goalkeeper";
    case "cb":
      return "center_back";
    case "rb":
    case "lb":
      return "full_back";
    case "rwb":
    case "lwb":
      return "wing_back";
    case "dm":
      return "defensive_midfielder";
    case "cm":
      return "central_midfielder";
    case "am":
      return "attacking_midfielder";
    case "rw":
    case "lw":
      return "winger";
    case "st":
      return "striker";
    default:
      return undefined;
  }
}

function roundAverage(value: number): number {
  return Math.round(value * 100) / 100;
}
