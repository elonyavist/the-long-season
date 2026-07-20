import {
  canonicalPlayerRoleDepartment,
  evaluatePositionSuitability,
  getPlayerRoleProfile,
  roleCurrentAbility,
  rolePotentialAbility,
  type ClubId,
  type Formation,
  type FormationSlot,
  type GameDate,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerRole,
  type PositionSuitability,
} from "@game/domain";

import {
  deriveTeamStrength,
  TeamStrengthError,
  type LineupSlot,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
} from "../match-engine/index.ts";
import { createMatchPlayerIncidentProfile } from "../match-engine/tactic-team-context.ts";

/** Recent deterministic usage facts that can gently rotate an AI squad. */
export interface AiRecentPlayerUse {
  /** Minutes played in the recent window owned by the caller. */
  readonly recentMinutes: number;
  /** Starts in the recent window owned by the caller. */
  readonly recentStarts: number;
}

/** One structured reason row for diagnostics and long-run audits. */
export interface AiSquadSelectionReason {
  /** Whether the player was selected for the XI or the bench. */
  readonly selection: "lineup" | "bench";
  /** Formation slot used by the selected player. Bench rows use `bench`. */
  readonly slotKey: string;
  /** Role profile key used by the match engine. */
  readonly roleKey: string;
  /** Player chosen for the slot or bench place. */
  readonly playerId: PlayerId;
  /** Canonical football suitability for the requested role. */
  readonly suitability: PositionSuitability;
  /** Role-weighted current ability before dynamic-state modifiers. */
  readonly currentAbility: number;
  /** Fitness percentage used for bounded rotation pressure. */
  readonly fitness: number;
  /** Recent minutes used for bounded rotation pressure. */
  readonly recentMinutes: number;
  /** Small prospect boost applied when there is genuine role potential room. */
  readonly prospectOpportunity: number;
  /** Final deterministic ordering score. */
  readonly score: number;
}

/** Input for deterministic AI match-squad selection. */
export interface AiSquadSelectionInput {
  /** Club whose squad is being selected. */
  readonly clubId: ClubId;
  /** Base formation that supplies the required slots and role coverage. */
  readonly formation: Formation;
  /** Explicit ordered roster IDs; this order is used only before stable ID tie-breaks. */
  readonly playerIds: readonly PlayerId[];
  /** Player lookup for the roster. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Match-engine role profiles available to the selected lineup. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional dynamic states for fitness-aware selection. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional recent usage facts supplied by the caller. */
  readonly recentUse?: Readonly<Partial<Record<PlayerId, AiRecentPlayerUse>>>;
  /** Fixture date used only to identify prospect age bands. */
  readonly currentDate?: GameDate;
  /** Maximum bench players to choose after the XI. */
  readonly benchSize?: number;
}

/** Deterministic AI squad selected for one match. */
export interface AiSquadSelectionResult {
  /** Ordered match-engine lineup built from the supplied formation. */
  readonly lineup: readonly LineupSlot[];
  /** Ordered bench IDs with no duplicates from the XI. */
  readonly benchPlayerIds: readonly PlayerId[];
  /** Structured diagnostics explaining why players were chosen. */
  readonly reasons: readonly AiSquadSelectionReason[];
}

/** Input for producing a match-ready team context from the AI selector. */
export interface BuildAiSquadMatchTeamContextInput extends AiSquadSelectionInput {
  /** Tactical distribution applied after squad selection. */
  readonly tacticalDistribution: MatchTacticalDistributionInput;
  /** Optional state curves used when deriving strength from selected players. */
  readonly stateMultiplierCurves?: PlayerStateMultiplierCurves;
}

/** Match-ready AI context plus diagnostics. */
export interface BuildAiSquadMatchTeamContextResult {
  /** Team context consumed by the match engine. */
  readonly teamContext: MatchTeamContext;
  /** Selected squad and diagnostics. */
  readonly selection: AiSquadSelectionResult;
}

/** Stable failure reason for invalid AI squad selection input. */
export type AiSquadSelectionErrorCode =
  | "empty_formation"
  | "missing_player"
  | "missing_role_weight"
  | "not_enough_players"
  | "invalid_team_strength";

/** Typed error raised when the AI selector cannot build a credible squad. */
export class AiSquadSelectionError extends Error {
  /** Machine-readable reason. */
  public readonly code: AiSquadSelectionErrorCode;

  /** Creates a deterministic AI squad-selection error. */
  public constructor(code: AiSquadSelectionErrorCode, message: string) {
    super(message);
    this.name = "AiSquadSelectionError";
    this.code = code;
  }
}

/** Selects a deterministic AI XI and bench for one formation. */
export function selectAiMatchSquad(input: AiSquadSelectionInput): AiSquadSelectionResult {
  if (input.formation.slots.length === 0) {
    throw new AiSquadSelectionError("empty_formation", `AI formation has no slots for club: ${input.clubId}`);
  }

  validateRosterPlayers(input);

  if (input.playerIds.length < input.formation.slots.length) {
    throw new AiSquadSelectionError(
      "not_enough_players",
      `AI club ${input.clubId} has ${input.playerIds.length} players for ${input.formation.slots.length} slots`,
    );
  }

  const usedPlayerIds = new Set<PlayerId>();
  const reasons: AiSquadSelectionReason[] = [];
  const lineup = input.formation.slots.map((slot): LineupSlot => {
    const candidate = bestCandidateForSlot(input, slot, usedPlayerIds);
    usedPlayerIds.add(candidate.playerId);
    reasons.push(reasonForCandidate("lineup", slot.slotKey, candidate));

    return {
      slotId: `${input.formation.key}:${slot.slotKey}`,
      playerId: candidate.playerId,
      roleKey: roleWeightKeyForSlot(input.roleWeights, slot),
    };
  });

  const benchCandidates = benchCandidatesForInput(input, usedPlayerIds);
  const benchPlayerIds = chooseBenchPlayerIds(input, benchCandidates);
  for (const benchPlayerId of benchPlayerIds) {
    const player = input.players[benchPlayerId];
    if (player === undefined) {
      throw new AiSquadSelectionError("missing_player", `Missing AI bench player ${benchPlayerId}`);
    }
    reasons.push(reasonForCandidate("bench", "bench", benchCandidateForPlayer(input, player)));
  }

  return {
    lineup,
    benchPlayerIds,
    reasons,
  };
}

/** Builds a match-engine team context from one deterministic AI selection. */
export function buildAiSquadMatchTeamContext(
  input: BuildAiSquadMatchTeamContextInput,
): BuildAiSquadMatchTeamContextResult {
  const selection = selectAiMatchSquad(input);

  try {
    return {
      selection,
      teamContext: {
        clubId: input.clubId,
        lineup: selection.lineup,
        strength: deriveTeamStrength({
          lineup: selection.lineup,
          players: input.players,
          roleWeights: input.roleWeights,
          ...(input.playerStates === undefined ? {} : { playerStates: input.playerStates }),
          ...(input.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: input.stateMultiplierCurves }),
        }),
        tacticalDistribution: input.tacticalDistribution,
        incidentProfiles: selection.lineup.map((slot) =>
          createMatchPlayerIncidentProfile(
            requiredPlayer(input, slot.playerId),
            input.playerStates?.[slot.playerId],
          ),
        ),
      },
    };
  } catch (error) {
    if (error instanceof TeamStrengthError) {
      throw new AiSquadSelectionError("invalid_team_strength", error.message);
    }

    throw error;
  }
}

interface AiCandidateScore {
  readonly playerId: PlayerId;
  readonly roleKey: string;
  readonly suitability: PositionSuitability;
  readonly currentAbility: number;
  readonly fitness: number;
  readonly recentMinutes: number;
  readonly recentStarts: number;
  readonly prospectOpportunity: number;
  readonly score: number;
}

function validateRosterPlayers(input: AiSquadSelectionInput): void {
  for (const playerId of input.playerIds) {
    if (input.players[playerId] === undefined) {
      throw new AiSquadSelectionError("missing_player", `Missing AI roster player ${playerId} for club ${input.clubId}`);
    }
  }
}

function bestCandidateForSlot(
  input: AiSquadSelectionInput,
  slot: FormationSlot,
  usedPlayerIds: ReadonlySet<PlayerId>,
): AiCandidateScore {
  const candidates = input.playerIds
    .filter((candidateId) => !usedPlayerIds.has(candidateId))
    .map((candidateId) => candidateForSlot(input, candidateId, slot))
    .filter((candidate) => candidate.suitability !== "invalid")
    .sort(compareCandidateScores);

  const best = candidates[0];
  if (best === undefined) {
    throw new AiSquadSelectionError(
      "not_enough_players",
      `AI club ${input.clubId} has no usable player for ${input.formation.key}.${slot.slotKey}`,
    );
  }

  return best;
}

function candidateForSlot(input: AiSquadSelectionInput, playerId: PlayerId, slot: FormationSlot): AiCandidateScore {
  const player = input.players[playerId];
  if (player === undefined) {
    throw new AiSquadSelectionError("missing_player", `Missing AI candidate player ${playerId}`);
  }

  const roleKey = roleWeightKeyForSlot(input.roleWeights, slot);
  const suitability = evaluatePositionSuitability(player.naturalPositions, slot);
  const currentAbility = Number(roleCurrentAbility(player.abilities, getPlayerRoleProfile(playerRoleForSlot(slot))));
  const potentialAbility = Number(rolePotentialAbility(player.potential, getPlayerRoleProfile(playerRoleForSlot(slot))));
  const fitness = Number(input.playerStates?.[playerId]?.fitness ?? 100);
  const recent = input.recentUse?.[playerId] ?? { recentMinutes: 0, recentStarts: 0 };
  const prospectOpportunity = prospectOpportunityForPlayer(input.currentDate, player, currentAbility, potentialAbility);
  const score = roundScore(
    currentAbility
      + suitabilityBonus(suitability)
      + sideBonus(player, slot)
      + boundedFitnessModifier(fitness)
      + boundedRecentUseModifier(recent)
      + prospectOpportunity,
  );

  return {
    playerId,
    roleKey,
    suitability,
    currentAbility: roundScore(currentAbility),
    fitness,
    recentMinutes: recent.recentMinutes,
    recentStarts: recent.recentStarts,
    prospectOpportunity,
    score,
  };
}

function benchCandidatesForInput(
  input: AiSquadSelectionInput,
  usedPlayerIds: ReadonlySet<PlayerId>,
): readonly AiCandidateScore[] {
  return input.playerIds
    .filter((candidateId) => !usedPlayerIds.has(candidateId))
    .map((candidateId) => benchCandidateForPlayer(input, requiredPlayer(input, candidateId)))
    .sort(compareCandidateScores);
}

function benchCandidateForPlayer(input: AiSquadSelectionInput, player: Player): AiCandidateScore {
  const bestSlot = input.formation.slots
    .map((slot) => candidateForSlot(input, player.id, slot))
    .sort(compareCandidateScores)[0];

  if (bestSlot === undefined) {
    throw new AiSquadSelectionError("empty_formation", `AI formation has no bench reference slots: ${input.formation.key}`);
  }

  return bestSlot;
}

function chooseBenchPlayerIds(
  input: AiSquadSelectionInput,
  benchCandidates: readonly AiCandidateScore[],
): readonly PlayerId[] {
  const benchSize = Math.max(0, input.benchSize ?? 8);
  const selected: PlayerId[] = [];
  const benchGoalkeeper = benchCandidates.find((candidate) => isGoalkeeperCandidate(input, candidate.playerId));

  if (benchGoalkeeper !== undefined && selected.length < benchSize) {
    selected.push(benchGoalkeeper.playerId);
  }

  for (const candidate of benchCandidates) {
    if (selected.length >= benchSize) {
      break;
    }

    if (!selected.includes(candidate.playerId)) {
      selected.push(candidate.playerId);
    }
  }

  return selected;
}

function roleWeightKeyForSlot(
  roleWeights: Readonly<Record<string, RoleWeightProfile>>,
  slot: FormationSlot,
): string {
  if (roleWeights[slot.playerRole] !== undefined) {
    return slot.playerRole;
  }

  const fallback = roleWeightKeyByDepartment(slot);
  if (roleWeights[fallback] !== undefined) {
    return fallback;
  }

  throw new AiSquadSelectionError(
    "missing_role_weight",
    `Missing role weight for AI slot ${slot.slotKey}: ${slot.playerRole} or ${fallback}`,
  );
}

function roleWeightKeyByDepartment(slot: FormationSlot): string {
  const department = canonicalPlayerRoleDepartment(slot.playerRole);

  switch (department) {
    case "goalkeeping":
      return "gk";
    case "defense":
      return "defender";
    case "midfield":
      return "midfielder";
    case "attack":
      return "attacker";
  }
}

function playerRoleForSlot(slot: FormationSlot): PlayerRole {
  switch (slot.playerRole) {
    case "goalkeeper":
      return "goalkeeper";
    case "right_full_back":
    case "left_full_back":
      return "full_back";
    case "center_back":
      return "center_back";
    case "defensive_midfielder":
      return "defensive_midfielder";
    case "central_midfielder":
      return "central_midfielder";
    case "right_midfielder":
    case "left_midfielder":
      return "wide_midfielder";
    case "attacking_midfielder":
      return "attacking_midfielder";
    case "right_winger":
    case "left_winger":
      return "winger";
    case "striker":
      return "striker";
  }
}

function suitabilityBonus(suitability: PositionSuitability): number {
  switch (suitability) {
    case "natural":
      return 2.4;
    case "adapted":
      return 1.2;
    case "weak":
      return -3.5;
    case "invalid":
      return -1_000;
  }
}

function sideBonus(player: Player, slot: FormationSlot): number {
  if (slot.side === undefined || slot.side === "center") {
    return 0;
  }

  const sideMap: Readonly<Record<string, string>> = {
    rb: "right",
    rwb: "right",
    rw: "right",
    lb: "left",
    lwb: "left",
    lw: "left",
  };

  return player.naturalPositions.some((position) => sideMap[position] === slot.side) ? 0.35 : 0;
}

function boundedFitnessModifier(fitness: number): number {
  if (fitness >= 92) return 0.35;
  if (fitness >= 84) return 0;
  if (fitness >= 72) return -0.7;
  if (fitness >= 60) return -1.35;
  return -2.25;
}

function boundedRecentUseModifier(recent: AiRecentPlayerUse): number {
  const minutePressure = Math.min(Math.max(recent.recentMinutes, 0), 270) / 270;
  const startPressure = Math.min(Math.max(recent.recentStarts, 0), 3) / 3;

  return roundScore(-(minutePressure * 1.2 + startPressure * 0.45));
}

function prospectOpportunityForPlayer(
  currentDate: GameDate | undefined,
  player: Player,
  currentAbility: number,
  potentialAbility: number,
): number {
  if (currentDate === undefined) {
    return 0;
  }

  const age = Math.floor((Number(currentDate) - Number(player.birthDate)) / 365.25);
  const potentialRoom = potentialAbility - currentAbility;
  if (age <= 19 && potentialRoom >= 2.5) return 0.55;
  if (age <= 21 && potentialRoom >= 2) return 0.35;
  return 0;
}

function isGoalkeeperCandidate(input: AiSquadSelectionInput, playerId: PlayerId): boolean {
  const player = input.players[playerId];

  return player !== undefined && evaluatePositionSuitability(player.naturalPositions, { playerRole: "goalkeeper" }) !== "invalid";
}

function requiredPlayer(input: AiSquadSelectionInput, playerId: PlayerId): Player {
  const player = input.players[playerId];
  if (player === undefined) {
    throw new AiSquadSelectionError("missing_player", `Missing AI candidate player ${playerId}`);
  }

  return player;
}

function reasonForCandidate(
  selection: AiSquadSelectionReason["selection"],
  slotKey: string,
  candidate: AiCandidateScore,
): AiSquadSelectionReason {
  return {
    selection,
    slotKey,
    roleKey: candidate.roleKey,
    playerId: candidate.playerId,
    suitability: candidate.suitability,
    currentAbility: candidate.currentAbility,
    fitness: candidate.fitness,
    recentMinutes: candidate.recentMinutes,
    prospectOpportunity: candidate.prospectOpportunity,
    score: candidate.score,
  };
}

function compareCandidateScores(left: AiCandidateScore, right: AiCandidateScore): number {
  const scoreDelta = right.score - left.score;
  if (scoreDelta !== 0) return scoreDelta;

  const abilityDelta = right.currentAbility - left.currentAbility;
  if (abilityDelta !== 0) return abilityDelta;

  return String(left.playerId).localeCompare(String(right.playerId));
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
