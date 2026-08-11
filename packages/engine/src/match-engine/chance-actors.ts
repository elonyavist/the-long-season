import {
  lateralChannelShares,
  type FixtureId,
  type MatchTacticsCalibrationConfig,
  type PlayerId,
  type TacticalRoute,
  type TacticalShapeTask,
} from "@game/domain";
import { deriveRng } from "@game/shared";

import type { MatchTeamContext } from "./match-context.ts";
import { incidentProfileFor } from "./match-discipline.ts";
import type { MatchScore, MatchSide } from "./match-simulation-state.ts";
import { roleWeightKeyForCanonicalRole } from "./team-strength.ts";
import type { LineupSlot } from "./team-strength.ts";

/**
 * Engine-local deterministic actor selection for one attacking opportunity.
 *
 * It answers *who*, and only who. Whether the chance becomes a goal, save, miss
 * or block is the resolver's question, and how much each of these players tilts
 * it is `occasion-context.ts`'s - which is also the only caller. Reached through
 * `buildOccasionContext` rather than exported from the package, so nothing can
 * pick a shooter without the route and the edges that belong with him.
 */

/** Stable RNG stream name used only for opportunity actor selection. */
const CHANCE_ACTORS_STREAM = "chance-actors";

/** Role weights used when choosing the primary defender from the defending lineup. */
const PRIMARY_DEFENDER_ROLE_WEIGHTS: ChanceActorRoleWeights = {
  attacker: 1,
  midfielder: 3,
  defender: 5,
  gk: 0,
};

/**
 * Weight lookup over the total role-weight vocabulary.
 *
 * `roleWeightKeyForCanonicalRole` maps every canonical role onto exactly one of
 * these four keys, so the tables above are total and no fallback is needed. A
 * missing entry would be a build failure, not a value to guess at.
 */
type ChanceActorRoleWeights = Readonly<Record<ChanceActorRoleKey, number>>;

/** The four role-weight profile keys chance selection distinguishes. */
type ChanceActorRoleKey = "attacker" | "midfielder" | "defender" | "gk";

/** Existing tactical-shape task that owns creator responsibility for each route. */
const CREATOR_TASK_BY_ROUTE = {
  central: "central_progression",
  left: "lateral_progression",
  right: "lateral_progression",
  direct: "build_up",
  transition: "counter_threat",
} as const satisfies Readonly<Record<TacticalRoute, TacticalShapeTask>>;

/**
 * Input needed to select actors for one attacking opportunity.
 */
export interface SelectChanceActorsInput {
  /** Run seed used by the match context. */
  readonly seed: string;
  /** Stable fixture identifier for the match. */
  readonly fixtureId: FixtureId;
  /** Simulated minute of the opportunity. */
  readonly minute: number;
  /** Side that created the attacking opportunity. */
  readonly attackingSide: MatchSide;
  /** Score before resolving this opportunity, used to distinguish contexts. */
  readonly scoreBeforeChance: MatchScore;
  /** Team context for the side creating the opportunity. */
  readonly attackingTeam: MatchTeamContext;
  /** Team context for the side defending the opportunity. */
  readonly defendingTeam: MatchTeamContext;
  /** Route already selected for the opportunity; chance type derives from it. */
  readonly route: TacticalRoute;
  /** Exact versioned task allocation already carried by the match context. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}

/**
 * Minimal set of nominal players involved in one opportunity.
 */
export interface ChanceActors {
  /** Attacking player who created the opportunity. */
  readonly creatorPlayerId: PlayerId;
  /** Attacking player who took the shot. */
  readonly shooterPlayerId: PlayerId;
  /** Defending outfield player most directly involved in the chance. */
  readonly primaryDefenderPlayerId: PlayerId;
  /** Defending goalkeeper for this opportunity. */
  readonly goalkeeperPlayerId: PlayerId;
  /**
   * Exact shooter pool used by this opportunity.
   *
   * The conversion owner consumes these ephemeral weights to centre the
   * selected shooter's execution edge on the distribution that actually chose
   * him. Keeping the pool here avoids a second task table or a reconstructed
   * selection after the actor is known.
   */
  readonly shooterSelectionPool: readonly ChanceActorSelectionWeight[];
}

/** One ephemeral actor-selection weight carried into occasion construction. */
export interface ChanceActorSelectionWeight {
  readonly playerId: PlayerId;
  readonly weight: number;
}

/**
 * Selects chance actors from explicit attacking and defending lineups.
 *
 * The selection uses a separate deterministic stream so introducing actor
 * selection does not consume the main match RNG. Goalkeepers are excluded from
 * attacking creator/shooter roles in this early causal model, while the
 * defending goalkeeper must come from the explicit `roleKey: "gk"` slot.
 *
 * @example
 * const actors = selectChanceActors({
 *   seed: context.seed,
 *   fixtureId: context.fixtureId,
 *   minute: 18,
 *   attackingSide: "home",
 *   scoreBeforeChance: { home: 0, away: 0 },
 *   attackingTeam: context.home,
 *   defendingTeam: context.away,
 *   route: "central",
 *   matchTacticsCalibration,
 * });
 */
export function selectChanceActors(input: SelectChanceActorsInput): ChanceActors {
  const creatorCandidates = qualityWeightedCandidates(
    input.attackingTeam,
    (slot) => creatorResponsibilityForSlot(slot, input.route, input.matchTacticsCalibration),
    (profile) => creatorTaskQuality(profile, input.route),
  );
  const shooterCandidates = qualityWeightedCandidates(
    input.attackingTeam,
    (slot) => shooterPropensityForSlot(slot, input.matchTacticsCalibration),
    (profile) => shooterTaskQuality(profile, input.route),
  );
  const defenderCandidates = roleWeightedCandidates(
    input.defendingTeam.lineup,
    primaryDefenderWeightForRole,
  );
  const goalkeeperPlayerId = selectGoalkeeper(input.defendingTeam);

  if (creatorCandidates.length === 0 || shooterCandidates.length === 0) {
    throw new Error(`Cannot select ${input.attackingSide} chance actors without attacking outfield players`);
  }

  if (defenderCandidates.length === 0) {
    throw new Error(`Cannot select primary defender for ${input.defendingTeam.clubId} without defending outfield players`);
  }

  const rng = deriveRng(
    input.seed,
    CHANCE_ACTORS_STREAM,
    input.fixtureId,
    input.minute,
    input.attackingSide,
    input.scoreBeforeChance.home,
    input.scoreBeforeChance.away,
    input.route,
  );
  const creatorPlayerId = pickWeightedPlayer(creatorCandidates, rng.nextFloat());
  const shooterPool = shooterCandidates;

  return {
    creatorPlayerId,
    shooterPlayerId: pickWeightedPlayer(shooterPool, rng.nextFloat()),
    primaryDefenderPlayerId: pickWeightedPlayer(defenderCandidates, rng.nextFloat()),
    goalkeeperPlayerId,
    shooterSelectionPool: shooterPool.map(({ slot, weight }) => ({
      playerId: slot.playerId,
      weight,
    })),
  };
}

/**
 * Returns the primary-defender weight for a role key.
 *
 * Defenders are favored, midfielders can be involved, attackers are rare, and
 * the goalkeeper is represented separately by `goalkeeperPlayerId`.
 *
 * @example
 * const weight = primaryDefenderWeightForRole("defender");
 */
export function primaryDefenderWeightForRole(roleKey: string): number {
  return PRIMARY_DEFENDER_ROLE_WEIGHTS[roleKey as ChanceActorRoleKey];
}

/**
 * Builds an ordered weighted candidate list from lineup slots.
 */
interface WeightedChanceActorCandidate {
  readonly slot: LineupSlot;
  readonly weight: number;
}

/** Builds role-only candidates for actors whose task quality is owned elsewhere. */
function roleWeightedCandidates(
  lineup: readonly LineupSlot[],
  weightForRole: (roleKey: string) => number,
): readonly WeightedChanceActorCandidate[] {
  const candidates: WeightedChanceActorCandidate[] = [];

  for (const slot of lineup) {
    const weight = weightForRole(roleWeightKeyForCanonicalRole(slot.canonicalRole));
    if (weight > 0) candidates.push({ slot, weight });
  }

  return candidates;
}

/**
 * Builds an actor pool from one role-owned frequency and live task quality.
 *
 * Creator frequency comes from formation-task responsibility; shooter
 * frequency comes from the externally calibrated role propensity. Multiplying
 * either by current task quality distributes it among the named players without
 * a response coefficient. Absolute scale is irrelevant to a weighted draw.
 */
function qualityWeightedCandidates(
  team: MatchTeamContext,
  responsibilityForSlot: (slot: LineupSlot) => number,
  taskQualityFor: (profile: MatchTeamContext["incidentProfiles"][number]) => number,
): readonly WeightedChanceActorCandidate[] {
  const candidates: WeightedChanceActorCandidate[] = [];

  for (const slot of team.lineup) {
    const responsibility = responsibilityForSlot(slot);
    if (responsibility <= 0) continue;
    const quality = taskQualityFor(incidentProfileFor(team, slot.playerId));
    candidates.push({ slot, weight: responsibility * quality });
  }

  return candidates;
}

/** Reads the assigned role's externally calibrated non-set-piece shot rate. */
function shooterPropensityForSlot(
  slot: LineupSlot,
  calibration: MatchTacticsCalibrationConfig,
): number {
  return calibration.chanceActorSelection.shooterPropensityBasisPointsByRole[slot.canonicalRole];
}

/** Reads one role's existing allocation to the task selected by the route. */
function roleTaskResponsibility(
  slot: LineupSlot,
  task: TacticalShapeTask,
  calibration: MatchTacticsCalibrationConfig,
): number {
  return calibration.tacticalShape.taskAllocationBasisPointsByRole[slot.canonicalRole][task] / 10_000;
}

/** Applies the existing flank channel policy only to lateral creation work. */
function creatorResponsibilityForSlot(
  slot: LineupSlot,
  route: TacticalRoute,
  calibration: MatchTacticsCalibrationConfig,
): number {
  const responsibility = roleTaskResponsibility(slot, CREATOR_TASK_BY_ROUTE[route], calibration);
  if (route !== "left" && route !== "right") return responsibility;

  return responsibility * lateralChannelShares(slot.side, calibration.tacticalShape.channelPolicy)[route];
}

/**
 * Selects the defending goalkeeper from explicit lineup order.
 */
function selectGoalkeeper(team: MatchTeamContext): PlayerId {
  for (const slot of team.lineup) {
    if (slot.canonicalRole === "goalkeeper") {
      return slot.playerId;
    }
  }

  throw new Error(`Cannot select goalkeeper for ${team.clubId} without a goalkeeper slot`);
}

/**
 * Picks one candidate by cumulative weight and lineup order.
 */
function pickWeightedPlayer(
  candidates: readonly WeightedChanceActorCandidate[],
  roll: number,
): PlayerId {
  const totalWeight = candidates.reduce((total, candidate) => total + candidate.weight, 0);
  const scaledRoll = roll * totalWeight;
  let cumulativeWeight = 0;

  for (const candidate of candidates) {
    cumulativeWeight += candidate.weight;

    if (scaledRoll < cumulativeWeight) {
      return candidate.slot.playerId;
    }
  }

  const fallbackSlot = candidates[candidates.length - 1];
  if (fallbackSlot === undefined) {
    throw new Error("Cannot pick chance actor from an empty candidate list");
  }

  return fallbackSlot.slot.playerId;
}

/** Task quality of the player working the chance, on the canonical 0..20 scale. */
function creatorTaskQuality(
  profile: MatchTeamContext["incidentProfiles"][number],
  route: TacticalRoute,
): number {
  switch (route) {
    case "central":
    case "direct":
      return weightedMean([
        [profile.passing, 3], [profile.vision, 3], [profile.technique, 2],
        [profile.dribbling, 1], [profile.anticipation, 1],
      ]);
    case "transition":
      return weightedMean([
        [profile.passing, 2], [profile.vision, 2], [profile.technique, 1],
        [profile.pace, 2], [profile.dribbling, 2], [profile.anticipation, 1],
      ]);
    case "left":
    case "right":
      return weightedMean([
        [profile.crossing, 4], [profile.vision, 2], [profile.technique, 2],
        [profile.passing, 1],
      ]);
  }
}

/** Task quality of the player finishing the chance, on the canonical 0..20 scale. */
function shooterTaskQuality(
  profile: MatchTeamContext["incidentProfiles"][number],
  route: TacticalRoute,
): number {
  switch (route) {
    case "central":
    case "direct":
      return weightedMean([
        [profile.finishing, 3], [profile.composure, 2], [profile.technique, 1],
        [profile.anticipation, 1],
      ]);
    case "transition":
      return weightedMean([
        [profile.finishing, 3], [profile.composure, 2], [profile.pace, 2],
        [profile.anticipation, 1], [profile.technique, 1],
      ]);
    case "left":
    case "right":
      return weightedMean([
        [profile.heading, 3], [profile.finishing, 2], [profile.anticipation, 1],
        [profile.composure, 1], [profile.strength, 1],
      ]);
  }
}

/** Computes one explicit weighted mean without storing a derived player score. */
function weightedMean(entries: readonly (readonly [value: number, weight: number])[]): number {
  const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);
  return entries.reduce((total, [value, weight]) => total + value * weight, 0) / totalWeight;
}
