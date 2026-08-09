import {
  evaluatePositionSuitability,
  FORMATIONS,
  getPlayerRoleProfile,
  roleCurrentAbility,
  scorePlayerForFormationSlot,
  type ClubId,
  type Formation,
  type FormationSlot,
  type GameDate,
  type MatchTacticsCalibrationConfig,
  type Player,
  type PlayerDynamicState,
  type PlayerId,
  type PlayerRole,
  type PositionSuitability,
} from "@game/domain";

import {
  createLineupSlot,
  roleWeightKeyForCanonicalRole,
  TeamStrengthError,
  type LineupSlot,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  type PlayerStateMultiplierCurves,
  type RoleWeightProfile,
} from "../match-engine/index.ts";
import { assembleMatchTeamContext } from "../match-engine/tactic-team-context.ts";
import { assignFootballXi, type FootballXiSlotCandidate } from "./football-xi-assignment.ts";
import type { PublicPlayerAssessment } from "../squad/public-player-assessment.ts";

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
  /** Small prospect boost applied when there is genuine public upside room. */
  readonly prospectOpportunity: number;
  /** Final deterministic ordering score. */
  readonly score: number;
}

/** Input for deterministic AI match-squad selection. */
export interface AiSquadSelectionInput {
  /** Club whose squad is being selected. */
  readonly clubId: ClubId;
  /**
   * Shape to field, or absent to let the squad choose its own.
   *
   * A caller that is measuring one shape supplies it, because holding the shape
   * fixed is the whole point of that measurement. A caller simulating a club
   * nobody prepared supplies nothing, and the club lines up in the catalog shape
   * its footballers are actually built for.
   */
  readonly formation?: Formation;
  /** Explicit ordered roster IDs; this order is used only before stable ID tie-breaks. */
  readonly playerIds: readonly PlayerId[];
  /** Player lookup for the roster. */
  readonly players: Readonly<Record<PlayerId, Player>>;
  /** Dated public assessments used for age and prospect-upside decisions. */
  readonly publicAssessments: Readonly<Record<PlayerId, PublicPlayerAssessment>>;
  /** Exact fixture date that every supplied assessment must describe. */
  readonly currentDate: GameDate;
  /** Match-engine role profiles available to the selected lineup. */
  readonly roleWeights: Readonly<Record<string, RoleWeightProfile>>;
  /** Optional dynamic states for fitness-aware selection. */
  readonly playerStates?: Readonly<Record<PlayerId, PlayerDynamicState>>;
  /** Optional recent usage facts supplied by the caller. */
  readonly recentUse?: Readonly<Partial<Record<PlayerId, AiRecentPlayerUse>>>;
  /** Maximum bench players to choose after the XI. */
  readonly benchSize?: number;
}

/** Deterministic AI squad selected for one match. */
export interface AiSquadSelectionResult {
  /** Shape actually fielded, whether supplied by the caller or chosen here. */
  readonly formation: Formation;
  /** Ordered match-engine lineup built from the fielded formation. */
  readonly lineup: readonly LineupSlot[];
  /** Ordered bench IDs with no duplicates from the XI. */
  readonly benchPlayerIds: readonly PlayerId[];
  /** Structured diagnostics explaining why players were chosen. */
  readonly reasons: readonly AiSquadSelectionReason[];
  /**
   * How close the club's own shape decision was.
   *
   * Absent when the caller imposed a formation: a club that was told what to
   * play expressed no preference, and inventing one would read as a choice it
   * never made.
   *
   * The gap to the runner-up and the number of shapes tied at the top are the
   * two facts the chosen `Formation` cannot carry, and they are what say whether
   * football or catalog order decided the shape. They come from the walk the
   * selector already does, because a second walk would be free to disagree with
   * the shape clubs actually line up in.
   */
  readonly catalogChoice?: CatalogShapeChoice;
}

/** Input for producing a match-ready team context from the AI selector. */
export interface BuildAiSquadMatchTeamContextInput extends AiSquadSelectionInput {
  /**
   * Tactical distribution, read from the shape the club ended up in.
   *
   * A function rather than a value because the shape is a *result* of selection,
   * and a caller that wants a side's instructions to follow its shape can only
   * decide them once that shape is known. A caller with a fixed setup - one
   * measuring a single shape, for instance - ignores the argument.
   */
  readonly tacticalDistribution: (formation: Formation) => MatchTacticalDistributionInput;
  /** Versioned match-tactics calibration, supplied by a composition root. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
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
  | "missing_public_assessment"
  | "stale_public_assessment"
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

/**
 * Selects a deterministic AI XI and bench.
 *
 * Every club in the world reaches the match through this one function, whether
 * the manager plays it this weekend or never meets it at all. There is no
 * second, cheaper path for clubs nobody is watching: a world where the
 * unwatched clubs pick their teams by a different rule is a world whose league
 * table means something different from the matches the manager plays in it.
 */
export function selectAiMatchSquad(input: AiSquadSelectionInput): AiSquadSelectionResult {
  if (input.formation !== undefined && input.formation.slots.length === 0) {
    throw new AiSquadSelectionError("empty_formation", `AI formation has no slots for club: ${input.clubId}`);
  }

  const rosterPlayerIds = orderedUniquePlayerIds(input.playerIds);
  validateRosterPlayers(input, rosterPlayerIds);

  const candidates = new SlotCandidateCache(input, rosterPlayerIds);
  const fielded = bestFieldedShape(input, candidates);
  if (fielded === undefined) {
    throw new AiSquadSelectionError(
      "not_enough_players",
      `AI club ${input.clubId} has no complete usable XI from ${rosterPlayerIds.length} players`,
    );
  }

  const usedPlayerIds = new Set(fielded.selected.map((candidate) => candidate.playerId));
  const reasons: AiSquadSelectionReason[] = [];
  const lineup = fielded.selected.map((candidate, slotIndex): LineupSlot => {
    const slot = fielded.formation.slots[slotIndex] as FormationSlot;
    reasons.push(reasonForCandidate("lineup", slot.slotKey, candidate));

    return createLineupSlot({
      slotId: `${fielded.formation.key}:${slot.slotKey}`,
      playerId: candidate.playerId,
      canonicalRole: slot.playerRole,
      ...(slot.side === undefined ? {} : { side: slot.side }),
    });
  });

  const benchCandidates = rosterPlayerIds
    .filter((candidateId) => !usedPlayerIds.has(candidateId))
    .map((candidateId) => bestSlotCandidateForPlayer(fielded.formation, candidates, candidateId))
    .sort(compareCandidateScores);
  const benchPlayerIds = chooseBenchPlayerIds(input, benchCandidates);
  for (const benchPlayerId of benchPlayerIds) {
    reasons.push(reasonForCandidate(
      "bench",
      "bench",
      bestSlotCandidateForPlayer(fielded.formation, candidates, benchPlayerId),
    ));
  }

  return {
    formation: fielded.formation,
    lineup,
    benchPlayerIds,
    reasons,
    ...(fielded.catalogChoice === undefined ? {} : { catalogChoice: fielded.catalogChoice }),
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
      teamContext: assembleMatchTeamContext({
        clubId: input.clubId,
        lineup: selection.lineup,
        tacticalDistribution: input.tacticalDistribution(selection.formation),
        players: input.players,
        roleWeights: input.roleWeights,
        matchTacticsCalibration: input.matchTacticsCalibration,
        ...(input.playerStates === undefined ? {} : { playerStates: input.playerStates }),
        ...(input.stateMultiplierCurves === undefined ? {} : { stateMultiplierCurves: input.stateMultiplierCurves }),
      }),
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
  /**
   * What this footballer is worth in this slot before today's circumstances.
   *
   * Ability and positional fit only. Choosing a club's *shape* from this rather
   * than from `score` is what stops a tired centre back changing the side's
   * formation for one week: a squad is built for a shape over a season, and
   * fatigue is a fact about a Saturday.
   */
  readonly structuralScore: number;
  /** Full ordering score, including fitness, recent workload and upside. */
  readonly score: number;
}

/** One complete shape with the eleven it would actually field. */
interface FieldedShape {
  readonly formation: Formation;
  readonly selected: readonly AiCandidateScore[];
  readonly totalScore: number;
  /** How close the shape decision was; absent when the caller imposed one. */
  readonly catalogChoice?: CatalogShapeChoice;
}

/**
 * Scores each footballer against each kind of slot exactly once.
 *
 * A candidate's score depends on the slot's canonical role and channel and on
 * nothing else, so the twenty-three catalog shapes ask the same few questions
 * over and over. Answering each one once is what makes choosing a club's shape
 * affordable rather than twenty-three times the work.
 */
class SlotCandidateCache {
  private readonly input: AiSquadSelectionInput;
  private readonly rosterPlayerIds: readonly PlayerId[];
  private readonly rankedBySlotKind = new Map<string, readonly AiCandidateScore[]>();

  public constructor(input: AiSquadSelectionInput, rosterPlayerIds: readonly PlayerId[]) {
    this.input = input;
    this.rosterPlayerIds = rosterPlayerIds;
  }

  /** Returns every fieldable candidate for one slot, best first. */
  public rankedFor(slot: FormationSlot): readonly AiCandidateScore[] {
    const slotKind = `${slot.playerRole}|${slot.side ?? ""}`;
    const cached = this.rankedBySlotKind.get(slotKind);
    if (cached !== undefined) {
      return cached;
    }

    const usable = this.rosterPlayerIds
      .map((playerId) => candidateForSlot(this.input, playerId, slot))
      .filter((candidate) => isUsableSuitability(candidate.suitability))
      .sort(compareCandidateScores);
    const ranked = usable.length > 0 || slot.playerRole !== "goalkeeper"
      ? usable
      : emergencyGoalkeeperCandidates(this.input, this.rosterPlayerIds, slot);
    this.rankedBySlotKind.set(slotKind, ranked);

    return ranked;
  }

  /**
   * Returns every footballer on the roster for one slot, out of position or not.
   *
   * The ordinary list drops `invalid` fits, which is right when a shape is being
   * *chosen*: a club should not line up in a system it has nobody for. It is
   * wrong when a shape has been *given*, because then dropping them does not
   * produce a better team, it produces no team at all.
   *
   * The scores are the same ones the ordinary list carries, so an out-of-position
   * footballer arrives already priced at the `invalid` selection penalty and the
   * assignment uses him only where nothing else reaches.
   */
  public everyCandidateFor(slot: FormationSlot): readonly AiCandidateScore[] {
    const slotKind = `any|${slot.playerRole}|${slot.side ?? ""}`;
    const cached = this.rankedBySlotKind.get(slotKind);
    if (cached !== undefined) {
      return cached;
    }

    const ranked = this.rosterPlayerIds
      .map((playerId) => candidateForSlot(this.input, playerId, slot))
      .sort(compareCandidateScores);
    this.rankedBySlotKind.set(slotKind, ranked);

    return ranked;
  }
}

/**
 * Chooses the shape the squad is built for, then the eleven that fills it today.
 *
 * A caller-supplied shape is used as given. Otherwise every catalog shape is
 * assigned and the strongest resulting eleven wins, so a club with three centre
 * backs and no wingers lines up as a back three instead of leaving a winger slot
 * to somebody who cannot play there. Shapes are compared in catalog order, so a
 * squad that fits two shapes equally well fields the same one every time.
 *
 * The shape is chosen on `structuralScore` and the eleven on `score`. Choosing
 * both on the full score let a tired defender change a club's formation for one
 * week, which is not a thing football does: a squad is built for a shape over a
 * season, and fatigue is a fact about a Saturday.
 *
 * **An emergency shape is filled out of position rather than refused.** A
 * caller-supplied formation keeps that formation. A club choosing freely first
 * searches only credible fits; only when no catalog shape can field eleven does
 * it rank the same catalog with the existing `invalid` penalty included. That
 * keeps the fixture alive without selecting an unavailable footballer or
 * inventing a fixed fallback shape. The selected reasons retain every invalid
 * slot, so reports can distinguish emergency coverage from ordinary football.
 */
function bestFieldedShape(
  input: AiSquadSelectionInput,
  candidates: SlotCandidateCache,
): FieldedShape | undefined {
  const chosen = input.formation === undefined
    ? strongestCatalogShape(candidates) ?? strongestEmergencyCatalogShape(candidates)
    : undefined;
  const formation = input.formation ?? chosen?.formation;
  if (formation === undefined) {
    return undefined;
  }

  const slots = formation.slots;
  const filled =
    fillShape(formation, slots.map((slot) => candidates.rankedFor(slot)))
    ?? fillShape(formation, slots.map((slot) => candidates.everyCandidateFor(slot)));

  return filled === undefined || chosen === undefined
    ? filled
    : { ...filled, catalogChoice: chosen.choice };
}

/** Fills one shape from one candidate list per slot, or reports it cannot be filled. */
function fillShape(
  formation: Formation,
  rankedBySlot: readonly (readonly AiCandidateScore[])[],
): FieldedShape | undefined {
  const assignment = assignFootballXi({
    candidatesBySlot: rankedBySlot.map((ranked) =>
      rankedXiCandidates(ranked, (candidate) => candidate.score)),
  });
  if (assignment === undefined) {
    return undefined;
  }

  return {
    formation,
    selected: assignment.candidateBySlot.map((candidate, slotIndex) =>
      requiredCandidate(rankedBySlot[slotIndex] as readonly AiCandidateScore[], candidate.rank)),
    totalScore: assignment.totalScore,
  };
}

/**
 * How the squad's own shape ranking looked, without keeping the ranking.
 *
 * Four numbers rather than twenty-three rows, on purpose. This is produced for
 * every club on every career fixture, so anything retained here is retained
 * millions of times over a long run - and nobody needs the rows. These four
 * facts are the whole of what the rows were wanted for.
 *
 * `secondStructuralScore` is absent when only one shape was fillable, which is
 * a squad with no choice rather than a squad with an obvious one.
 */
export interface CatalogShapeChoice {
  /** Catalog shapes this squad could fill at all. */
  readonly fillableShapeCount: number;
  /** Structural score of the shape that won. */
  readonly bestStructuralScore: number;
  /** Structural score of the best shape that did not win. */
  readonly secondStructuralScore?: number;
  /**
   * Shapes still tied after every declared decision rule, including the winner.
   *
   * Structural fit, live XI quality, weakest-link quality and finally the
   * stable formation key normally leave exactly one. Above `1` would mean the
   * catalog walk still owns the decision, so the value remains a direct
   * catalog-order sensitivity assertion rather than a rebuilt proxy.
   */
  readonly tiedAtBestCount: number;
}

/** The shape a squad is built for, and how close the decision was. */
interface StrongestCatalogShape {
  readonly formation: Formation;
  readonly choice: CatalogShapeChoice;
}

/**
 * Finds the catalog shape this squad is built for.
 *
 * Structural fit remains primary. Only an exact structural tie pays for a
 * second assignment using the live score already owned by selection (condition,
 * recent load and public prospect opportunity). The weakest starter then
 * breaks an equal total, and the stable formation key resolves exact football
 * equality independently of catalog traversal. `tiedAtBestCount` asserts that
 * no traversal-owned tie survived.
 */
function strongestCatalogShape(candidates: SlotCandidateCache): StrongestCatalogShape | undefined {
  return strongestShapeFromCatalog((slot) => candidates.rankedFor(slot));
}

/**
 * Finds the least-bad catalog shape when injuries leave no ordinary complete XI.
 *
 * This is an emergency continuation of the canonical catalog decision, not a
 * second selector: the same structural score, assignment and stable catalog
 * order are used, with invalid fits admitted at their existing penalty. A zero
 * `fillableShapeCount` records the fact that the ordinary walk found nothing;
 * exact invalid-slot counts remain derived from the selected reason rows.
 */
function strongestEmergencyCatalogShape(candidates: SlotCandidateCache): StrongestCatalogShape | undefined {
  const emergency = strongestShapeFromCatalog((slot) => candidates.everyCandidateFor(slot));
  if (emergency === undefined) return undefined;

  return {
    ...emergency,
    choice: { ...emergency.choice, fillableShapeCount: 0 },
  };
}

/** Walks the formation catalog once with one declared source of slot candidates. */
function strongestShapeFromCatalog(
  candidatesForSlot: (slot: FormationSlot) => readonly AiCandidateScore[],
): StrongestCatalogShape | undefined {
  let formation: Formation | undefined;
  let best = Number.NEGATIVE_INFINITY;
  let second = Number.NEGATIVE_INFINITY;
  let tiedAtBestCount = 0;
  let fillableShapeCount = 0;
  let winningCandidatesBySlot: readonly (readonly AiCandidateScore[])[] | undefined;
  let winningLiveRank: LiveAssignmentRank | undefined;

  for (const candidateFormation of FORMATIONS) {
    const candidatesBySlot = candidateFormation.slots.map((slot) => candidatesForSlot(slot));
    const assignment = structuralAssignment(candidatesBySlot);
    if (assignment === undefined) continue;

    fillableShapeCount += 1;
    const score = assignment.totalScore;
    if (score > best) {
      if (formation !== undefined) second = best;
      best = score;
      tiedAtBestCount = 1;
      formation = candidateFormation;
      winningCandidatesBySlot = candidatesBySlot;
      winningLiveRank = undefined;
    } else if (score === best) {
      second = best;
      if (winningCandidatesBySlot === undefined) {
        throw new Error("Catalog shape tie has no incumbent candidates");
      }
      const candidateLiveRank = requiredAssignmentRank(candidatesBySlot, (candidate) => candidate.score);
      winningLiveRank ??= requiredAssignmentRank(
        winningCandidatesBySlot,
        (candidate) => candidate.score,
      );
      const liveComparison = compareLiveAssignmentRank(candidateLiveRank, winningLiveRank);
      if (liveComparison > 0) {
        formation = candidateFormation;
        winningCandidatesBySlot = candidatesBySlot;
        winningLiveRank = candidateLiveRank;
        tiedAtBestCount = 1;
      } else if (
        liveComparison === 0
          && formation !== undefined
          && candidateFormation.key.localeCompare(formation.key) < 0
      ) {
        // Exact football equality has no better sporting answer. The stable
        // formation key makes the choice independent from catalog traversal;
        // it therefore does not increase catalog-order sensitivity.
        formation = candidateFormation;
        winningCandidatesBySlot = candidatesBySlot;
        winningLiveRank = candidateLiveRank;
      }
    } else if (score > second) {
      second = score;
    }
  }

  if (formation === undefined) return undefined;

  return {
    formation,
    choice: {
      fillableShapeCount,
      bestStructuralScore: best,
      ...(second === Number.NEGATIVE_INFINITY ? {} : { secondStructuralScore: second }),
      tiedAtBestCount,
    },
  };
}

/** Assigns one structurally ranked XI without reading transient match-day state. */
function structuralAssignment(
  candidatesBySlot: readonly (readonly AiCandidateScore[])[],
): ReturnType<typeof assignFootballXi> {
  return assignFootballXi({
    candidatesBySlot: candidatesBySlot.map((ranked) =>
      rankedXiCandidates(ranked, (candidate) => candidate.structuralScore)),
  });
}

interface LiveAssignmentRank {
  readonly totalScore: number;
  readonly weakestFirstScores: readonly number[];
}

/** Ranks an assignment by total XI quality, then by its weakest footballer. */
function requiredAssignmentRank(
  candidatesBySlot: readonly (readonly AiCandidateScore[])[],
  scoreOf: (candidate: AiCandidateScore) => number,
): LiveAssignmentRank {
  const assignment = assignFootballXi({
    candidatesBySlot: candidatesBySlot.map((ranked) => rankedXiCandidates(ranked, scoreOf)),
  });
  if (assignment === undefined) {
    throw new Error("Structurally fillable catalog shape has no live assignment");
  }
  return {
    totalScore: assignment.totalScore,
    weakestFirstScores: assignment.candidateBySlot.map((candidate, slotIndex) =>
      scoreOf(requiredCandidate(candidatesBySlot[slotIndex] ?? [], candidate.rank))
    ).toSorted((left, right) => left - right),
  };
}

/** Prefers the stronger whole XI, then raises the weakest link lexicographically. */
function compareLiveAssignmentRank(left: LiveAssignmentRank, right: LiveAssignmentRank): number {
  if (left.totalScore !== right.totalScore) return left.totalScore - right.totalScore;
  for (let index = 0; index < left.weakestFirstScores.length; index += 1) {
    const difference = (left.weakestFirstScores[index] ?? 0) - (right.weakestFirstScores[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/** Projects scored candidates onto the assignment Module's football-free view. */
function rankedXiCandidates(
  ranked: readonly AiCandidateScore[],
  scoreOf: (candidate: AiCandidateScore) => number,
): readonly FootballXiSlotCandidate[] {
  return ranked.map((candidate, rank) => ({ playerId: candidate.playerId, score: scoreOf(candidate), rank }));
}

function requiredCandidate(ranked: readonly AiCandidateScore[], rank: number): AiCandidateScore {
  return ranked[rank] as AiCandidateScore;
}

function validateRosterPlayers(
  input: AiSquadSelectionInput,
  rosterPlayerIds: readonly PlayerId[],
): void {
  for (const playerId of rosterPlayerIds) {
    if (input.players[playerId] === undefined) {
      throw new AiSquadSelectionError("missing_player", `Missing AI roster player ${playerId} for club ${input.clubId}`);
    }
    requiredPublicAssessment(input, playerId);
  }
}

function candidateForSlot(input: AiSquadSelectionInput, playerId: PlayerId, slot: FormationSlot): AiCandidateScore {
  const player = input.players[playerId];
  if (player === undefined) {
    throw new AiSquadSelectionError("missing_player", `Missing AI candidate player ${playerId}`);
  }

  const roleKey = roleWeightKeyForSlot(input.roleWeights, slot);
  const suitability = evaluatePositionSuitability(player.naturalPositions, slot);
  const currentAbility = Number(roleCurrentAbility(player.abilities, getPlayerRoleProfile(playerRoleForSlot(slot))));
  const fitness = Number(input.playerStates?.[playerId]?.fitness ?? 100);
  const recent = input.recentUse?.[playerId] ?? { recentMinutes: 0, recentStarts: 0 };
  const prospectOpportunity = prospectOpportunityForAssessment(
    requiredPublicAssessment(input, playerId),
  );
  const structuralScore = roundScore(scorePlayerForFormationSlot({
    naturalPositions: player.naturalPositions,
    slot,
    playerStrength: currentAbility,
  }));

  return {
    playerId,
    roleKey,
    suitability,
    currentAbility: roundScore(currentAbility),
    fitness,
    recentMinutes: recent.recentMinutes,
    recentStarts: recent.recentStarts,
    prospectOpportunity,
    structuralScore,
    score: roundScore(
      structuralScore
        + boundedFitnessModifier(fitness)
        + boundedRecentUseModifier(recent)
        + prospectOpportunity,
    ),
  };
}

/**
 * Names the footballer who takes the gloves when no goalkeeper is available.
 *
 * Nothing but a natural goalkeeper is even a weak fit for the role, so a club
 * that loses both keepers to injury and suspension could otherwise field no
 * eleven at all in any of the twenty-three shapes - and its fixture would simply
 * fail to be played. Football's answer, and this engine's own answer when a
 * keeper is sent off mid-match, is that somebody puts the gloves on.
 *
 * Ranked by the same two attributes `promoteEmergencyGoalkeeper` uses at match
 * time, so the man the selector picks before kickoff is the man the minute loop
 * would have picked after it. His suitability is still recorded as `invalid`,
 * because it is: this is coverage, not a decision anybody is happy with.
 */
function emergencyGoalkeeperCandidates(
  input: AiSquadSelectionInput,
  rosterPlayerIds: readonly PlayerId[],
  slot: FormationSlot,
): readonly AiCandidateScore[] {
  return rosterPlayerIds
    .map((playerId) => {
      const candidate = candidateForSlot(input, playerId, slot);
      const player = requiredPlayer(input, playerId);
      const goalkeeping = (
        Number(player.abilities.goalkeeping.reflexes) + Number(player.abilities.goalkeeping.handling)
      ) / 2;

      // Scored on the gloves rather than on the outfield role he is leaving, and
      // without the fit bonus that does not apply to a man out of position. The
      // level only ever ranks emergency options against each other: this list is
      // built at all only when no real goalkeeper is left.
      return { ...candidate, structuralScore: roundScore(goalkeeping), score: roundScore(goalkeeping) };
    })
    .sort(compareCandidateScores);
}

/** Reads one player from the roster, failing loudly rather than guessing. */
function requiredPlayer(input: AiSquadSelectionInput, playerId: PlayerId): Player {
  const player = input.players[playerId];
  if (player === undefined) {
    throw new AiSquadSelectionError("missing_player", `Missing AI candidate player ${playerId}`);
  }

  return player;
}

/** Keeps the caller's first stable occurrence while preventing duplicate XI IDs. */
function orderedUniquePlayerIds(playerIds: readonly PlayerId[]): readonly PlayerId[] {
  return [...new Set(playerIds)];
}

/** Describes a bench player by the fielded slot he would cover best. */
function bestSlotCandidateForPlayer(
  formation: Formation,
  candidates: SlotCandidateCache,
  playerId: PlayerId,
): AiCandidateScore {
  const usable = formation.slots
    .flatMap((slot) => candidates.rankedFor(slot).filter((candidate) => candidate.playerId === playerId))
    .sort(compareCandidateScores)[0];
  const best = usable ?? formation.slots
    .flatMap((slot) => candidates.everyCandidateFor(slot).filter((candidate) => candidate.playerId === playerId))
    .sort(compareCandidateScores)[0];

  if (best === undefined) {
    throw new AiSquadSelectionError(
      "not_enough_players",
      `AI bench player ${playerId} cannot cover any slot of ${formation.key}`,
    );
  }

  return best;
}

/**
 * Names the substitutes, and a goalkeeper among them whenever one exists.
 *
 * The reserve keeper takes the first bench place, ahead of every better
 * footballer, because he is the only one who answers the question a sending-off
 * or an injury in goal asks. A bench without him means an outfielder in goal for
 * the rest of the match, and no other substitute can cover that.
 *
 * This is why the emergency-keeper path in selection should stay unreachable in
 * a real career: a squad with a spare keeper always has him sitting there.
 */
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

/**
 * Resolves the role-weight profile for one formation slot.
 *
 * The canonical-role-to-profile mapping is owned once by the match engine. This
 * helper only proves the caller actually supplied that profile, and fails
 * deterministically when it did not: a missing profile is a content defect, not
 * a case to fall back from.
 */
function roleWeightKeyForSlot(
  roleWeights: Readonly<Record<string, RoleWeightProfile>>,
  slot: FormationSlot,
): string {
  const roleKey = roleWeightKeyForCanonicalRole(slot.playerRole);
  if (roleWeights[roleKey] !== undefined) {
    return roleKey;
  }

  throw new AiSquadSelectionError(
    "missing_role_weight",
    `Missing role weight for AI slot ${slot.slotKey}: ${slot.playerRole} resolves to ${roleKey}`,
  );
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

/** Weak fits remain valid emergency coverage; only invalid fits are unusable. */
function isUsableSuitability(suitability: PositionSuitability): boolean {
  return suitability !== "invalid";
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

function prospectOpportunityForAssessment(
  assessment: PublicPlayerAssessment,
): number {
  const publicUpsideRoom = assessment.upperAbility - assessment.currentAbility;
  if (assessment.age <= 19 && publicUpsideRoom >= 2.5) return 0.55;
  if (assessment.age <= 21 && publicUpsideRoom >= 2) return 0.35;
  return 0;
}

/** Returns the safe public fact required by every live AI candidate decision. */
function requiredPublicAssessment(
  input: AiSquadSelectionInput,
  playerId: PlayerId,
): PublicPlayerAssessment {
  const assessment = input.publicAssessments[playerId];
  if (assessment === undefined || assessment.playerId !== playerId) {
    throw new AiSquadSelectionError(
      "missing_public_assessment",
      `Missing AI public assessment ${playerId} for club ${input.clubId}`,
    );
  }
  if (assessment.assessedOn !== input.currentDate) {
    throw new AiSquadSelectionError(
      "stale_public_assessment",
      `AI public assessment ${playerId} is not dated for the current fixture`,
    );
  }
  return assessment;
}

function isGoalkeeperCandidate(input: AiSquadSelectionInput, playerId: PlayerId): boolean {
  const player = input.players[playerId];

  return player !== undefined && evaluatePositionSuitability(player.naturalPositions, { playerRole: "goalkeeper" }) !== "invalid";
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
