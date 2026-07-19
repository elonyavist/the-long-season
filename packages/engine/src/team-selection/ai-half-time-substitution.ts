import {
  getPlayerRoleProfile,
  isCanonicalPlayerRole,
  roleCurrentAbility,
  type AppliedMatchSubstitution,
  type MatchSubstitutionDecision,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerRole,
} from "@game/domain";

import {
  applyHalfTimeSubstitutions,
  buildPlayerMatchRatings,
  playerRatingRegistrationsFromContext,
  type MatchSide,
  type PlayerMatchRatingRow,
  type StagedMatchState,
} from "../match-engine/index.ts";

/** Stable reason explaining why the AI accepted or skipped a half-time change. */
export type AiHalfTimeSubstitutionReasonKey =
  | "fitness_protection"
  | "poor_rating"
  | "trailing_response"
  | "better_bench_option"
  | "goalkeeper_protected"
  | "no_bench_upgrade"
  | "substitution_limit_reached";

/** Diagnostic row for one AI half-time substitution decision. */
export interface AiHalfTimeSubstitutionReason {
  /** Player considered for removal from the pitch. */
  readonly outgoingPlayerId: PlayerId;
  /** Replacement selected from the bench, when a change is accepted. */
  readonly incomingPlayerId?: PlayerId;
  /** Tactical slot evaluated at half time. */
  readonly slotId: string;
  /** Role key used by the current match lineup slot. */
  readonly roleKey: string;
  /** Stable reason key for audits and reports. */
  readonly reasonKey: AiHalfTimeSubstitutionReasonKey;
  /** Outgoing player's live rating at half time, if available. */
  readonly rating?: number;
  /** Outgoing player's current fitness before the second half. */
  readonly fitness: number;
  /** Bounded quality gap between incoming and outgoing player. */
  readonly qualityDelta: number;
}

/** Input for deterministic AI half-time substitution selection. */
export interface SelectAiHalfTimeSubstitutionsInput {
  /** Staged match stopped at half time. */
  readonly state: StagedMatchState;
  /** Side controlled by this AI decision. */
  readonly side: MatchSide;
  /** Bench players available to the AI side. */
  readonly benchPlayerIds: readonly PlayerId[];
  /** Player lookup for starters and bench players. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Optional current player states used for fatigue-aware changes. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional precomputed provisional ratings. Defaults to event-derived ratings. */
  readonly provisionalRatings?: readonly PlayerMatchRatingRow[];
  /** Maximum half-time substitutions for this AI side. */
  readonly maxSubstitutions?: number;
}

/** Pure AI half-time decision output before the staged state is mutated. */
export interface AiHalfTimeSubstitutionSelection {
  /** Explicit substitution decisions accepted by the AI selector. */
  readonly decisions: readonly MatchSubstitutionDecision[];
  /** Structured diagnostic reasons for accepted and skipped candidates. */
  readonly reasons: readonly AiHalfTimeSubstitutionReason[];
}

/** Result after applying the AI selection to the staged match. */
export interface ApplyAiHalfTimeSubstitutionsResult {
  /** Updated staged match state. */
  readonly state: StagedMatchState;
  /** Substitution facts applied to the match. */
  readonly appliedSubstitutions: readonly AppliedMatchSubstitution[];
  /** Pure selected decisions and diagnostics. */
  readonly selection: AiHalfTimeSubstitutionSelection;
}

/**
 * Selects deterministic AI half-time substitutions without changing state.
 *
 * The selector is intentionally conservative: it protects goalkeepers, prefers
 * clear fatigue/rating/score-context reasons, and requires a credible bench
 * upgrade before using a substitution. It does not react minute by minute.
 */
export function selectAiHalfTimeSubstitutions(
  input: SelectAiHalfTimeSubstitutionsInput,
): AiHalfTimeSubstitutionSelection {
  if (input.state.phase !== "half_time") {
    return { decisions: [], reasons: [] };
  }

  const maxSubstitutions = Math.max(0, input.maxSubstitutions ?? 2);
  const team = input.state.simulation.context[input.side];
  const score = input.state.simulation.score;
  const scoreDelta = input.side === "home" ? score.home - score.away : score.away - score.home;
  const ratings = ratingsByPlayer(input);
  const usedIncoming = new Set<PlayerId>();
  const decisions: MatchSubstitutionDecision[] = [];
  const reasons: AiHalfTimeSubstitutionReason[] = [];

  const candidates = team.lineup
    .map((slot) => {
      const player = input.players[slot.playerId];
      const rating = ratings.get(slot.playerId)?.rating;
      const fitness = Number(input.playerStates?.[slot.playerId]?.fitness ?? 100);
      return {
        slot,
        player,
        rating,
        fitness,
        triggerScore: triggerScoreFor({ rating, fitness, scoreDelta }),
      };
    })
    .filter((candidate) => candidate.player !== undefined)
    .sort((left, right) => (
      right.triggerScore - left.triggerScore
      || left.fitness - right.fitness
      || String(left.slot.playerId).localeCompare(String(right.slot.playerId))
    ));

  for (const candidate of candidates) {
    if (decisions.length >= maxSubstitutions) {
      reasons.push(reasonForCandidate(candidate, "substitution_limit_reached", undefined, 0));
      break;
    }

    if (isGoalkeeperRoleKey(candidate.slot.roleKey)) {
      if (candidate.triggerScore > 0) {
        reasons.push(reasonForCandidate(candidate, "goalkeeper_protected", undefined, 0));
      }
      continue;
    }

    if (candidate.triggerScore <= 0) {
      continue;
    }

    const incoming = bestBenchUpgrade(input, candidate.slot.roleKey, candidate.slot.playerId, usedIncoming);
    if (incoming === undefined || incoming.qualityDelta < requiredQualityDelta(candidate.triggerScore, scoreDelta)) {
      reasons.push(reasonForCandidate(candidate, "no_bench_upgrade", incoming?.playerId, incoming?.qualityDelta ?? 0));
      continue;
    }

    usedIncoming.add(incoming.playerId);
    decisions.push({
      outgoingPlayerId: candidate.slot.playerId,
      incomingPlayerId: incoming.playerId,
      reasonKey: "half_time_manager_decision",
    });
    reasons.push(reasonForCandidate(candidate, triggerReasonFor(candidate, scoreDelta), incoming.playerId, incoming.qualityDelta));
  }

  return { decisions, reasons };
}

/**
 * Applies deterministic AI half-time substitutions to a staged match.
 */
export function applyAiHalfTimeSubstitutions(
  input: SelectAiHalfTimeSubstitutionsInput,
): ApplyAiHalfTimeSubstitutionsResult {
  const selection = selectAiHalfTimeSubstitutions(input);
  const applied = applyHalfTimeSubstitutions({
    state: input.state,
    selectedSide: input.side,
    benchPlayerIds: input.benchPlayerIds,
    decisions: selection.decisions,
    ...(input.maxSubstitutions === undefined ? {} : { maxSubstitutions: input.maxSubstitutions }),
  });

  if (applied.status === "invalid") {
    return {
      state: input.state,
      appliedSubstitutions: [],
      selection: { decisions: [], reasons: selection.reasons },
    };
  }

  return {
    state: applied.state,
    appliedSubstitutions: applied.appliedSubstitutions,
    selection,
  };
}

interface CandidateForReason {
  readonly slot: { readonly slotId: string; readonly playerId: PlayerId; readonly roleKey: string };
  readonly rating: number | undefined;
  readonly fitness: number;
}

interface BenchUpgrade {
  readonly playerId: PlayerId;
  readonly qualityDelta: number;
}

function ratingsByPlayer(input: SelectAiHalfTimeSubstitutionsInput): ReadonlyMap<PlayerId, PlayerMatchRatingRow> {
  const ratings = input.provisionalRatings ?? buildPlayerMatchRatings({
    events: input.state.events,
    playerRegistrations: playerRatingRegistrationsFromContext(input.state.simulation.context),
  });

  return new Map(ratings.map((row) => [row.playerId, row]));
}

function triggerScoreFor(input: { readonly rating: number | undefined; readonly fitness: number; readonly scoreDelta: number }): number {
  let score = 0;
  if (input.fitness < 70) score += 3;
  else if (input.fitness < 78) score += 2;
  else if (input.fitness < 84) score += 1;

  if (input.rating !== undefined && input.rating < 5.6) score += 2;
  else if (input.rating !== undefined && input.rating < 6.0) score += 1;

  if (input.scoreDelta < 0 && input.rating !== undefined && input.rating < 6.4) score += 1;

  return score;
}

function bestBenchUpgrade(
  input: SelectAiHalfTimeSubstitutionsInput,
  roleKey: string,
  outgoingPlayerId: PlayerId,
  usedIncoming: ReadonlySet<PlayerId>,
): BenchUpgrade | undefined {
  const outgoing = input.players[outgoingPlayerId];
  if (outgoing === undefined) {
    return undefined;
  }

  const outgoingScore = playerScoreForRole(outgoing, roleKey);
  return input.benchPlayerIds
    .filter((playerId) => !usedIncoming.has(playerId))
    .filter((playerId) => !isPlayerOnPitch(input.state, playerId))
    .map((playerId) => {
      const player = input.players[playerId];
      return player === undefined
        ? undefined
        : { playerId, qualityDelta: roundOneDecimal(playerScoreForRole(player, roleKey) - outgoingScore) };
    })
    .filter((candidate): candidate is BenchUpgrade => candidate !== undefined)
    .sort((left, right) => right.qualityDelta - left.qualityDelta || String(left.playerId).localeCompare(String(right.playerId)))[0];
}

function playerScoreForRole(player: Player, roleKey: string): number {
  const playerRole = playerRoleForRoleKey(roleKey, player);
  return Number(roleCurrentAbility(player.abilities, getPlayerRoleProfile(playerRole)));
}

function playerRoleForRoleKey(roleKey: string, player: Player): PlayerRole {
  if (isCanonicalPlayerRole(roleKey)) {
    switch (roleKey) {
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

  switch (roleKey) {
    case "gk":
      return "goalkeeper";
    case "defender":
      return "center_back";
    case "midfielder":
    case "balanced":
      return "central_midfielder";
    case "attacker":
      return "striker";
    default:
      return player.primaryRole ?? "central_midfielder";
  }
}

function isGoalkeeperRoleKey(roleKey: string): boolean {
  return roleKey === "gk" || roleKey === "goalkeeper";
}

function isPlayerOnPitch(state: StagedMatchState, playerId: PlayerId): boolean {
  return [...state.simulation.context.home.lineup, ...state.simulation.context.away.lineup].some((slot) => slot.playerId === playerId);
}

function requiredQualityDelta(triggerScore: number, scoreDelta: number): number {
  if (triggerScore >= 4) return -1;
  if (scoreDelta < 0) return 0;
  return 0.5;
}

function triggerReasonFor(candidate: CandidateForReason, scoreDelta: number): AiHalfTimeSubstitutionReasonKey {
  if (candidate.fitness < 78) return "fitness_protection";
  if (candidate.rating !== undefined && candidate.rating < 6) return "poor_rating";
  if (scoreDelta < 0) return "trailing_response";
  return "better_bench_option";
}

function reasonForCandidate(
  candidate: CandidateForReason,
  reasonKey: AiHalfTimeSubstitutionReasonKey,
  incomingPlayerId: PlayerId | undefined,
  qualityDelta: number,
): AiHalfTimeSubstitutionReason {
  return {
    outgoingPlayerId: candidate.slot.playerId,
    ...(incomingPlayerId === undefined ? {} : { incomingPlayerId }),
    slotId: candidate.slot.slotId,
    roleKey: candidate.slot.roleKey,
    reasonKey,
    ...(candidate.rating === undefined ? {} : { rating: candidate.rating }),
    fitness: candidate.fitness,
    qualityDelta: roundOneDecimal(qualityDelta),
  };
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
