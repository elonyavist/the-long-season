import {
  stateValue,
  type ClubId,
  type Fixture,
  type MatchEventSide,
  type MatchReport,
  type PlayerDynamicState,
  type PlayerId,
} from "@game/domain";

const MIN_STATE_VALUE = 0;
const MAX_STATE_VALUE = 100;
const MIN_FORM_DELTA = -5;
const MAX_FORM_DELTA = 5;
const MIN_MORALE_DELTA = -4;
const MAX_MORALE_DELTA = 4;

/** Stable language-agnostic reasons for post-match player-state movement. */
export type CareerMatchStateConsequenceReasonKey =
  | "result_win"
  | "result_draw"
  | "result_loss"
  | "team_clean_sheet"
  | "team_heavy_loss"
  | "player_goal"
  | "player_assist"
  | "goalkeeper_saves";

/** Current v1 participant categories supported by match consequences. */
export type CareerMatchStateParticipantRole = "starter";

/** Error categories for invalid post-match state consequence input. */
export type CareerMatchStateConsequenceErrorCode =
  | "duplicate_player_id"
  | "missing_player_state"
  | "selected_club_not_in_fixture";

/** Typed error thrown when post-match state consequences cannot be applied. */
export class CareerMatchStateConsequenceError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: CareerMatchStateConsequenceErrorCode;

  /** Creates a match-state consequence error. */
  public constructor(code: CareerMatchStateConsequenceErrorCode, message: string) {
    super(message);
    this.name = "CareerMatchStateConsequenceError";
    this.code = code;
  }
}

/** One player-level form/morale change caused by a completed selected-club fixture. */
export interface CareerMatchPlayerStateConsequence {
  /** Player whose dynamic state changed. */
  readonly playerId: PlayerId;
  /** Participation category that made this player eligible for v1 consequences. */
  readonly participantRole: CareerMatchStateParticipantRole;
  /** Form before the post-match rule ran. */
  readonly beforeForm: number;
  /** Form after the post-match rule ran. */
  readonly afterForm: number;
  /** Signed form movement after state clamps are applied. */
  readonly formDelta: number;
  /** Morale before the post-match rule ran. */
  readonly beforeMorale: number;
  /** Morale after the post-match rule ran. */
  readonly afterMorale: number;
  /** Signed morale movement after state clamps are applied. */
  readonly moraleDelta: number;
  /** Stable reason keys that explain why this consequence was considered. */
  readonly reasonKeys: readonly CareerMatchStateConsequenceReasonKey[];
}

/** Aggregate facts for compact CLI/UI summaries. */
export interface CareerMatchStateConsequenceSummary {
  /** Number of players whose form or morale actually moved. */
  readonly changedPlayerCount: number;
  /** Sum of actual form deltas after clamps. */
  readonly totalFormDelta: number;
  /** Sum of actual morale deltas after clamps. */
  readonly totalMoraleDelta: number;
}

/** Input for applying selected-club post-match form/morale consequences. */
export interface ApplyCareerMatchStateConsequencesInput {
  /** Current player-state lookup. This object is never mutated. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Club whose career state is being advanced. */
  readonly selectedClubId: ClubId;
  /** Fixture that has just been played. */
  readonly fixture: Fixture;
  /** Durable language-agnostic report for the played fixture. */
  readonly report: MatchReport;
  /** Explicit ordered selected-club starter IDs. */
  readonly selectedStarterIds: readonly PlayerId[];
}

/** Result of applying selected-club post-match form/morale consequences. */
export interface ApplyCareerMatchStateConsequencesResult {
  /** Copy-on-write player-state lookup after post-match consequences. */
  readonly playerStates: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Ordered player-level consequence facts for presentation layers. */
  readonly changes: readonly CareerMatchPlayerStateConsequence[];
  /** Compact aggregate facts for summaries. */
  readonly summary: CareerMatchStateConsequenceSummary;
}

/**
 * Applies bounded post-match form and morale consequences for selected-club starters.
 *
 * This function deliberately does not spend fitness, render labels, inspect
 * tactics, create advice, or infer bench psychology. It reacts only to durable
 * match report facts that already exist today.
 */
export function applyCareerMatchStateConsequences(
  input: ApplyCareerMatchStateConsequencesInput,
): ApplyCareerMatchStateConsequencesResult {
  const selectedSide = selectedFixtureSide(input.fixture, input.selectedClubId);
  const score = selectedScore(input.report, selectedSide);
  const involvement = collectSelectedSideInvolvement(input.report, selectedSide);
  const nextStates: Record<PlayerId, PlayerDynamicState> = { ...input.playerStates };
  const changes: CareerMatchPlayerStateConsequence[] = [];
  const seen = new Set<PlayerId>();

  for (const playerId of input.selectedStarterIds) {
    assertUniquePlayerId(playerId, seen);
    const playerState = input.playerStates[playerId];

    if (playerState === undefined) {
      throw new CareerMatchStateConsequenceError(
        "missing_player_state",
        `Missing player state for match consequence: ${playerId}`,
      );
    }

    const planned = plannedDeltasForStarter({
      playerId,
      selectedGoals: score.selectedGoals,
      opponentGoals: score.opponentGoals,
      goals: involvement.goalsByPlayer.get(playerId) ?? 0,
      assists: involvement.assistsByPlayer.get(playerId) ?? 0,
      saves: involvement.savesByPlayer.get(playerId) ?? 0,
    });
    const beforeForm = Number(playerState.form);
    const beforeMorale = Number(playerState.morale);
    const afterForm = clampStateValue(beforeForm + planned.formDelta);
    const afterMorale = clampStateValue(beforeMorale + planned.moraleDelta);
    const formDelta = afterForm - beforeForm;
    const moraleDelta = afterMorale - beforeMorale;

    if (formDelta === 0 && moraleDelta === 0) {
      continue;
    }

    nextStates[playerId] = {
      ...playerState,
      form: stateValue(afterForm),
      morale: stateValue(afterMorale),
    };
    changes.push({
      playerId,
      participantRole: "starter",
      beforeForm,
      afterForm,
      formDelta,
      beforeMorale,
      afterMorale,
      moraleDelta,
      reasonKeys: planned.reasonKeys,
    });
  }

  return {
    playerStates: nextStates,
    changes,
    summary: {
      changedPlayerCount: changes.length,
      totalFormDelta: sumDeltas(changes, "formDelta"),
      totalMoraleDelta: sumDeltas(changes, "moraleDelta"),
    },
  };
}

function selectedFixtureSide(fixture: Fixture, selectedClubId: ClubId): MatchEventSide {
  if (fixture.homeClubId === selectedClubId) {
    return "home";
  }

  if (fixture.awayClubId === selectedClubId) {
    return "away";
  }

  throw new CareerMatchStateConsequenceError(
    "selected_club_not_in_fixture",
    `Selected club is not part of fixture ${fixture.id}: ${selectedClubId}`,
  );
}

function selectedScore(report: MatchReport, selectedSide: MatchEventSide): {
  readonly selectedGoals: number;
  readonly opponentGoals: number;
} {
  return selectedSide === "home"
    ? { selectedGoals: report.score.home, opponentGoals: report.score.away }
    : { selectedGoals: report.score.away, opponentGoals: report.score.home };
}

function collectSelectedSideInvolvement(
  report: MatchReport,
  selectedSide: MatchEventSide,
): {
  readonly goalsByPlayer: ReadonlyMap<PlayerId, number>;
  readonly assistsByPlayer: ReadonlyMap<PlayerId, number>;
  readonly savesByPlayer: ReadonlyMap<PlayerId, number>;
} {
  const goalsByPlayer = new Map<PlayerId, number>();
  const assistsByPlayer = new Map<PlayerId, number>();
  const savesByPlayer = new Map<PlayerId, number>();

  for (const event of report.events) {
    if (event.type === "goal" && event.shot.side === selectedSide) {
      increment(goalsByPlayer, event.scorerPlayerId);

      if (event.assistPlayerId !== undefined) {
        increment(assistsByPlayer, event.assistPlayerId);
      }
    }

    if (event.type === "save" && event.shot.side !== selectedSide) {
      increment(savesByPlayer, event.goalkeeperPlayerId);
    }
  }

  return { goalsByPlayer, assistsByPlayer, savesByPlayer };
}

function plannedDeltasForStarter(input: {
  readonly playerId: PlayerId;
  readonly selectedGoals: number;
  readonly opponentGoals: number;
  readonly goals: number;
  readonly assists: number;
  readonly saves: number;
}): {
  readonly formDelta: number;
  readonly moraleDelta: number;
  readonly reasonKeys: readonly CareerMatchStateConsequenceReasonKey[];
} {
  let formDelta = 0;
  let moraleDelta = 0;
  const reasonKeys: CareerMatchStateConsequenceReasonKey[] = [];

  if (input.selectedGoals > input.opponentGoals) {
    formDelta += 1;
    moraleDelta += 2;
    reasonKeys.push("result_win");
  } else if (input.selectedGoals < input.opponentGoals) {
    formDelta -= 1;
    moraleDelta -= 2;
    reasonKeys.push("result_loss");
  } else {
    reasonKeys.push("result_draw");
  }

  if (input.opponentGoals === 0) {
    formDelta += 1;
    moraleDelta += 1;
    reasonKeys.push("team_clean_sheet");
  }

  if (input.selectedGoals - input.opponentGoals <= -3) {
    formDelta -= 1;
    moraleDelta -= 1;
    reasonKeys.push("team_heavy_loss");
  }

  if (input.goals > 0) {
    formDelta += input.goals * 3;
    moraleDelta += input.goals * 2;
    reasonKeys.push("player_goal");
  }

  if (input.assists > 0) {
    formDelta += input.assists * 2;
    moraleDelta += input.assists;
    reasonKeys.push("player_assist");
  }

  if (input.saves >= 2) {
    formDelta += Math.min(2, Math.floor(input.saves / 2));
    moraleDelta += 1;
    reasonKeys.push("goalkeeper_saves");
  }

  return {
    formDelta: clampDelta(formDelta, MIN_FORM_DELTA, MAX_FORM_DELTA),
    moraleDelta: clampDelta(moraleDelta, MIN_MORALE_DELTA, MAX_MORALE_DELTA),
    reasonKeys,
  };
}

function assertUniquePlayerId(playerId: PlayerId, seen: Set<PlayerId>): void {
  if (seen.has(playerId)) {
    throw new CareerMatchStateConsequenceError("duplicate_player_id", `Duplicate starter ID in match consequences: ${playerId}`);
  }

  seen.add(playerId);
}

function increment(counts: Map<PlayerId, number>, playerId: PlayerId): void {
  counts.set(playerId, (counts.get(playerId) ?? 0) + 1);
}

function clampDelta(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampStateValue(value: number): number {
  return Math.min(MAX_STATE_VALUE, Math.max(MIN_STATE_VALUE, value));
}

function sumDeltas(changes: readonly CareerMatchPlayerStateConsequence[], key: "formDelta" | "moraleDelta"): number {
  return changes.reduce((total, change) => total + change[key], 0);
}
