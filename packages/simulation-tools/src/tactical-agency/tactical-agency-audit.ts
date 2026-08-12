import {
  CANONICAL_PLAYER_ROLES,
  FORMATION_KEYS,
  LATERAL_FOCUSES,
  PLAYER_ROLES,
  TACTICAL_ROUTES,
  TACTICAL_SHAPE_CAPACITIES,
  TACTICAL_SHAPE_CAPACITY_MIRROR,
  TACTICAL_SHAPE_TASKS,
  evaluatePositionSuitability,
  fixtureId,
  tacticalRoleAllocationTotal,
  type CareerState,
  type CanonicalPlayerRole,
  type ClubId,
  type Fixture,
  type FixtureId,
  type FormationKey,
  type LateralFocus,
  type MatchTacticsCalibrationConfig,
  type PlayerId,
  type PlayerRole,
  type PositionSuitability,
} from "@game/domain";
import {
  selectCareerAiTeam,
  deriveOpportunityRoutePlan,
  expectedRouteSaturation,
  opportunityRouteBudget,
  opportunityRouteQualityEdge,
  opportunityRouteStrategicSignature,
  opportunityRouteWeights,
  simulateMatch,
  type CareerAiTeamSelectionPolicy,
  type MatchContext,
  type MatchEngineConfig,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  type PlayerValuationConfig,
  type TacticalShapeProfile,
} from "@game/engine";

import {
  buildTacticalShapeTeamContext,
  TACTICAL_SHAPE_NEUTRAL_TACTIC,
  TACTICAL_SHAPE_TACTIC_PROFILES,
  type TacticalShapeQualityBand,
  type TacticalShapeTacticProfile,
} from "../tactical-shape/tactical-shape-audit.ts";

/**
 * Deterministic before-state audit of contextual tactical agency, Phase 81A
 * Step 02.
 *
 * The Phase 81 cohort forced every club into `4-4-2` on purpose, as an engine
 * control. That makes it silent about the question this phase asks: what a
 * player actually meets. So this audit traverses the *career* path instead -
 *
 * ```text
 * generated world -> selectable squad -> selectCareerAiTeam -> fixture
 * ```
 *
 * - and records what came out of it. It changes no gameplay: every number is
 * produced by the production selector and the production match engine, and this
 * Module owns sequencing and arithmetic only.
 *
 * Two design rules run through it.
 *
 * **Nothing here re-implements a decision.** How close the shape decision was
 * comes back from the selector's own walk as `catalogChoice`; suitability comes
 * from `evaluatePositionSuitability(...)`, which owns it. An audit that rebuilt
 * either would be free to disagree with the football clubs actually play, and
 * would then be measuring itself.
 *
 * **Content stays outside.** This package may not import content, so a caller
 * supplies the generated world already turned into a `CareerState`, along with
 * the policy, calibration and engine config a composition root owns.
 */

/** Contract version recorded in the report so a later step cannot reuse it silently. */
export const TACTICAL_AGENCY_AUDIT_CONTRACT_VERSION = "phase81a-step02-v1";

/** Stable failure reasons for tactical-agency audit input. */
export type TacticalAgencyAuditErrorCode =
  | "empty_work_items"
  | "missing_telemetry"
  | "unfillable_squad";

/** Typed error raised when the audit cannot produce a trustworthy reading. */
export class TacticalAgencyAuditError extends Error {
  /** Machine-readable reason. */
  public readonly code: TacticalAgencyAuditErrorCode;

  /** Creates one deterministic audit failure. */
  public constructor(code: TacticalAgencyAuditErrorCode, message: string) {
    super(message);
    this.name = "TacticalAgencyAuditError";
    this.code = code;
  }
}

/** One canonical role's derived use of the common tactical budget. */
export interface TacticalContributionConservationRoleRow {
  /** Role whose authored allocation is being inspected. */
  readonly role: CanonicalPlayerRole;
  /** Sum derived in the domain's canonical task order. */
  readonly allocatedBasisPoints: number;
  /** Difference from the required budget; goalkeeper is compared with zero. */
  readonly budgetDeltaBasisPoints: number;
  /** Tasks receiving a reachable positive allocation. */
  readonly positiveTaskCount: number;
}

/** Algebraic conservation reading for one versioned tactical calibration. */
export interface TacticalContributionConservationSummary {
  /** Calibration whose allocation table was read. */
  readonly calibrationVersion: string;
  /** One common budget authored for every outfield role. */
  readonly outfieldRoleBudgetBasisPoints: number;
  /** Every canonical role in domain order, including the isolated goalkeeper. */
  readonly rows: readonly TacticalContributionConservationRoleRow[];
}

/**
 * Derives the conservation evidence without simulating a match.
 *
 * Step 04 is an algebraic contract, so a Monte Carlo result cannot excuse a
 * row that creates or destroys budget. This diagnostic reuses the domain's
 * total derivation and records every canonical role, including zero-valued
 * goalkeeper isolation and positive reachability on all outfield tasks.
 */
export function summarizeTacticalContributionConservation(
  calibration: MatchTacticsCalibrationConfig,
): TacticalContributionConservationSummary {
  const shape = calibration.tacticalShape;
  const rows = CANONICAL_PLAYER_ROLES.map((role): TacticalContributionConservationRoleRow => {
    const allocations = shape.taskAllocationBasisPointsByRole[role];
    let positiveTaskCount = 0;
    for (const task of TACTICAL_SHAPE_TASKS) {
      if (allocations[task] > 0) positiveTaskCount += 1;
    }

    const allocatedBasisPoints = tacticalRoleAllocationTotal(allocations);
    const requiredBudget = role === "goalkeeper" ? 0 : shape.outfieldRoleBudgetBasisPoints;

    return {
      role,
      allocatedBasisPoints,
      budgetDeltaBasisPoints: allocatedBasisPoints - requiredBudget,
      positiveTaskCount,
    };
  });

  return {
    calibrationVersion: calibration.version,
    outfieldRoleBudgetBasisPoints: shape.outfieldRoleBudgetBasisPoints,
    rows,
  };
}

/** One club selecting for one fixture, in the caller's deterministic order. */
export interface TacticalAgencySelectionWorkItem {
  /** Club that is selecting. Any club in the world is a legal argument. */
  readonly clubId: ClubId;
  /** Fixture being selected for, which dates assessments and suspensions. */
  readonly fixture: Fixture;
  /**
   * Which squad identity generated this club, when the caller knows.
   *
   * Supplied rather than derived: squad identities are content's, and this
   * package may not import content. The composition root that generated the
   * world is the only place that can say which chart a club was built from
   * without a second copy of the draw that would be free to disagree with it.
   *
   * Absent for the Step 02 before-state, which was measured before identities
   * existed. An absent key is never counted as an identity.
   */
  readonly squadIdentityKey?: string;
}

/** Everything one selection series needs from its composition root. */
export interface TacticalAgencySelectionSeriesInput {
  /** Career the clubs and their footballers are read from. */
  readonly careerState: CareerState;
  /** Ordered work items. Order is the caller's and is preserved in the rows. */
  readonly workItems: readonly TacticalAgencySelectionWorkItem[];
  /** The one AI policy every unprepared club is selected under. */
  readonly policy: CareerAiTeamSelectionPolicy;
  /** Versioned match-tactics calibration supplied by a composition root. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Canonical public-assessment policy the selector may consult. */
  readonly valuationConfig: PlayerValuationConfig;
}

/** The tactic setup one selection ended up with. */
export interface TacticalAgencyTacticRow {
  readonly directness: number;
  readonly pressing: number;
  readonly width: number;
  readonly risk: number;
  readonly mentality: MatchTacticalDistributionInput["mentality"];
}

/** What one real career selection did, and how close it was to doing otherwise. */
export interface TacticalAgencySelectionRow {
  /** Club that selected. */
  readonly clubId: ClubId;
  /** Fixture it selected for. */
  readonly fixtureId: FixtureId;
  /** Catalog key of the shape it lined up in. */
  readonly formationKey: string;
  /** Catalog shapes this squad could fill at all. */
  readonly fillableShapeCount: number;
  /** Structural score of the shape that won. */
  readonly bestStructuralScore: number;
  /**
   * Structural score of the best shape that did **not** win.
   *
   * Absent when only one shape was fillable, which is a squad with no choice
   * rather than a squad with an obvious one. The two are different findings.
   */
  readonly secondStructuralScore?: number;
  /**
   * How many shapes scored exactly the winning score, including the winner.
   *
   * Above `1` means the selector's strictly-greater comparison decided the
   * shape by catalog position. That is the reorder sensitivity: reordering
   * `FORMATIONS` can change the outcome for exactly these selections and for no
   * others, so it is measured rather than measured again by permuting.
   */
  readonly tiedAtBestCount: number;
  /** Lineup slots filled by a footballer the domain calls `weak` or `invalid` there. */
  readonly outOfPositionSlotCount: number;
  /** Instructions the club ended up with, derived from the shape it chose. */
  readonly tactic: TacticalAgencyTacticRow;
  /** Squad identity this club was generated from, when the caller supplied one. */
  readonly squadIdentityKey?: string;
}

/** One selection series with the cost of producing it. */
export interface TacticalAgencySelectionSeriesResult {
  /** One row per work item, in the caller's order. */
  readonly rows: readonly TacticalAgencySelectionRow[];
  /** Wall-clock milliseconds the caller measured around the series. */
  readonly elapsedMilliseconds: number;
}

/** One production selection plus the audit row derived from that same call. */
export interface TacticalAgencyObservedSelection {
  readonly row: TacticalAgencySelectionRow;
  readonly teamContext: MatchTeamContext;
}

/**
 * Runs the real career selector once per work item and records what it did.
 *
 * Every row goes through `selectCareerAiTeam(...)`, the one door career AI
 * selection has, so nothing here can field an eleven the career would not.
 *
 * @example
 * const series = runTacticalAgencySelectionSeries({ careerState, workItems, policy, ... });
 * series.rows[0].tiedAtBestCount; // 1 means football decided the shape
 */
export function runTacticalAgencySelectionSeries(
  input: TacticalAgencySelectionSeriesInput,
  now: () => number,
): TacticalAgencySelectionSeriesResult {
  if (input.workItems.length === 0) {
    throw new TacticalAgencyAuditError("empty_work_items", "A selection series needs at least one work item");
  }

  const startedAt = now();
  const rows = input.workItems.map((workItem) =>
    observeTacticalAgencyTeamSelection(input, workItem).row);

  return { rows, elapsedMilliseconds: now() - startedAt };
}

/** Observes one club's selection for one fixture through the production path. */
export function observeTacticalAgencyTeamSelection(
  input: Omit<TacticalAgencySelectionSeriesInput, "workItems">,
  workItem: TacticalAgencySelectionWorkItem,
): TacticalAgencyObservedSelection {
  const selection = selectCareerAiTeam({
    careerState: input.careerState,
    clubId: workItem.clubId,
    fixture: workItem.fixture,
    policy: input.policy,
    matchTacticsCalibration: input.matchTacticsCalibration,
    valuationConfig: input.valuationConfig,
  });

  // Career AI never imposes a formation, so the club always chose and the
  // selector always reports how close it was. An absent choice means somebody
  // handed this path a shape, which would make every shape number below a
  // reading of the caller rather than of the squad.
  const choice = selection.catalogChoice;
  if (choice === undefined) {
    throw new TacticalAgencyAuditError(
      "unfillable_squad",
      `Club ${workItem.clubId} was given a shape rather than choosing one`,
    );
  }

  return {
    teamContext: selection.teamContext,
    row: {
      clubId: workItem.clubId,
      fixtureId: workItem.fixture.id,
      formationKey: formationKeyOf(selection.teamContext),
      fillableShapeCount: choice.fillableShapeCount,
      bestStructuralScore: choice.bestStructuralScore,
      ...(choice.secondStructuralScore === undefined
        ? {}
        : { secondStructuralScore: choice.secondStructuralScore }),
      tiedAtBestCount: choice.tiedAtBestCount,
      outOfPositionSlotCount: countTacticalAgencyOutOfPositionSlots({
        careerState: input.careerState,
        lineup: selection.teamContext.lineup,
      }),
      tactic: { ...selection.teamContext.tacticalDistribution },
      ...(workItem.squadIdentityKey === undefined
        ? {}
        : { squadIdentityKey: workItem.squadIdentityKey }),
    },
  };
}

/** Reads the catalog key back off the slot IDs the selector stamped. */
function formationKeyOf(teamContext: MatchTeamContext): string {
  const firstSlot = teamContext.lineup[0];
  if (firstSlot === undefined) return "";

  const separatorIndex = firstSlot.slotId.indexOf(":");

  return separatorIndex === -1 ? firstSlot.slotId : firstSlot.slotId.slice(0, separatorIndex);
}

/**
 * Counts lineup slots the domain calls `weak` or `invalid` for their occupant.
 *
 * A2 and the longitudinal L1 report both need the same definition. Keeping the
 * suitability read here prevents the CLI from growing a second interpretation
 * of what "out of position" means.
 */
export function countTacticalAgencyOutOfPositionSlots(input: {
  readonly careerState: CareerState;
  readonly lineup: MatchTeamContext["lineup"];
}): number {
  let count = 0;

  for (const slot of input.lineup) {
    const player = input.careerState.gameState.players[slot.playerId];
    if (player === undefined) continue;

    const suitability: PositionSuitability = evaluatePositionSuitability(player.naturalPositions, {
      playerRole: slot.canonicalRole,
      ...(slot.side === undefined ? {} : { side: slot.side }),
    });
    if (suitability === "weak" || suitability === "invalid") count += 1;
  }

  return count;
}

/** One shape and how often the population lined up in it. */
export interface TacticalAgencyFormationShareRow {
  readonly formationKey: string;
  readonly count: number;
  readonly share: number;
}

/** What a whole selection population did, with its denominator beside it. */
export interface TacticalAgencySelectionSummary {
  /** Selections observed. Every share below divides by this. */
  readonly selectionCount: number;
  /** Shapes actually selected, most frequent first, ties by key. */
  readonly formationShares: readonly TacticalAgencyFormationShareRow[];
  /** How many distinct shapes the population produced at all. */
  readonly distinctFormationCount: number;
  /** Share held by the single most frequent shape. */
  readonly topFormationShare: number;
  /**
   * Share of selections whose shape was decided by catalog order.
   *
   * The headline before-state number: a squad that ties at the top has no
   * football reason to prefer the shape it got.
   */
  readonly tieDecidedShare: number;
  /** Share of selections that could fill only one catalog shape. */
  readonly noChoiceShare: number;
  /** Mean gap between the winning shape and the best shape that lost. */
  readonly meanBestMinusSecond: number;
  /** Mean out-of-position slots per fielded eleven. */
  readonly meanOutOfPositionSlots: number;
}

/**
 * Aggregates one selection population.
 *
 * Shares are reported beside the count they divide by, because a share whose
 * denominator is not written down is not evidence.
 */
export function summarizeTacticalAgencySelections(
  rows: readonly TacticalAgencySelectionRow[],
): TacticalAgencySelectionSummary {
  if (rows.length === 0) {
    throw new TacticalAgencyAuditError("empty_work_items", "A selection summary needs at least one row");
  }

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.formationKey, (counts.get(row.formationKey) ?? 0) + 1);
  }

  const formationShares = [...counts.entries()]
    .map(([formationKey, count]) => ({ formationKey, count, share: count / rows.length }))
    .sort((left, right) =>
      right.count - left.count || left.formationKey.localeCompare(right.formationKey));

  const withSecond = rows.filter((row) => row.secondStructuralScore !== undefined);
  const gapTotal = withSecond.reduce(
    (sum, row) => sum + (row.bestStructuralScore - (row.secondStructuralScore ?? row.bestStructuralScore)),
    0,
  );

  return {
    selectionCount: rows.length,
    formationShares,
    distinctFormationCount: formationShares.length,
    topFormationShare: formationShares[0]?.share ?? 0,
    tieDecidedShare: rows.filter((row) => row.tiedAtBestCount > 1).length / rows.length,
    noChoiceShare: rows.filter((row) => row.fillableShapeCount === 1).length / rows.length,
    meanBestMinusSecond: withSecond.length === 0 ? 0 : gapTotal / withSecond.length,
    meanOutOfPositionSlots:
      rows.reduce((sum, row) => sum + row.outOfPositionSlotCount, 0) / rows.length,
  };
}

/**
 * Share of selections whose shape survives any reordering of the catalog.
 *
 * Derived rather than stored, and derived rather than replayed. The selector
 * keeps the **first strict maximum** while walking `FORMATIONS`, so:
 *
 * - `tiedAtBestCount === 1` - the maximum is unique and no permutation can
 *   change which shape wins. Invariant, provably.
 * - `tiedAtBestCount >= 2` - the winner is whichever tied shape the catalog
 *   lists first, and reversing the catalog makes it the last one instead, which
 *   is a different shape whenever two or more are tied. Not invariant, provably.
 *
 * So invariance holds exactly on the untied selections, and selecting every
 * squad a second time against a reversed catalog would spend a full extra pass
 * to recompute a number the first pass already determines. It would also need a
 * catalog seam in the selector, and a checkpoint may not edit the thing it is
 * measuring.
 *
 * @example
 * tacticalAgencyReorderInvariantShare(summary); // 1 means no shape hung on catalog order
 */
export function tacticalAgencyReorderInvariantShare(
  summary: Pick<TacticalAgencySelectionSummary, "tieDecidedShare">,
): number {
  return 1 - summary.tieDecidedShare;
}

/** One squad identity and the shape its clubs actually lined up in. */
export interface TacticalAgencySquadIdentityRow {
  /** Declared identity key, present whether or not any club drew it. */
  readonly squadIdentityKey: string;
  /** Selections made by clubs built from this identity. */
  readonly selectionCount: number;
  /**
   * Most frequent shape among those selections, ties broken by key.
   *
   * `not_evaluated` when no club drew this identity. A modal shape computed
   * from zero clubs is not a weak result, it is an absent one, and writing it
   * as a shape would let an unobserved row clear a distinctness gate.
   */
  readonly modalFormationKey: string | "not_evaluated";
  /** Selections that landed on the modal shape, so the row carries its own weight. */
  readonly modalFormationCount: number;
}

/** How the eight identities distributed across shapes, and which were unobserved. */
export interface TacticalAgencySquadIdentitySummary {
  /** One row per declared identity, in the caller's declared order. */
  readonly rows: readonly TacticalAgencySquadIdentityRow[];
  /** Distinct modal shapes across the identities that were actually observed. */
  readonly distinctModalFormationCount: number;
  /** Identities no club drew. Never empty-and-ignored: it blocks the checkpoint. */
  readonly unevaluatedIdentityKeys: readonly string[];
  /** Selections carrying no identity at all, counted rather than dropped. */
  readonly unattributedSelectionCount: number;
}

/**
 * Groups one selection population by the squad identity that generated it.
 *
 * `declaredIdentityKeys` is passed in rather than discovered from the rows,
 * because the question this answers is "did every identity appear?" - and a
 * table built only from what appeared can never say no.
 */
export function summarizeTacticalAgencySquadIdentities(
  rows: readonly TacticalAgencySelectionRow[],
  declaredIdentityKeys: readonly string[],
): TacticalAgencySquadIdentitySummary {
  if (declaredIdentityKeys.length === 0) {
    throw new TacticalAgencyAuditError(
      "empty_work_items",
      "An identity summary needs the declared identity keys to check coverage against",
    );
  }

  const byIdentity = new Map<string, Map<string, number>>(
    declaredIdentityKeys.map((key) => [key, new Map<string, number>()]),
  );
  let unattributedSelectionCount = 0;

  for (const row of rows) {
    const key = row.squadIdentityKey;
    const shapes = key === undefined ? undefined : byIdentity.get(key);
    if (shapes === undefined) {
      unattributedSelectionCount += 1;
      continue;
    }
    shapes.set(row.formationKey, (shapes.get(row.formationKey) ?? 0) + 1);
  }

  const identityRows = declaredIdentityKeys.map((squadIdentityKey) => {
    const shapes = byIdentity.get(squadIdentityKey) ?? new Map<string, number>();
    const selectionCount = [...shapes.values()].reduce((sum, count) => sum + count, 0);
    const modal = [...shapes.entries()].sort(
      ([leftKey, leftCount], [rightKey, rightCount]) =>
        rightCount - leftCount || leftKey.localeCompare(rightKey),
    )[0];

    return {
      squadIdentityKey,
      selectionCount,
      modalFormationKey: modal === undefined ? ("not_evaluated" as const) : modal[0],
      modalFormationCount: modal?.[1] ?? 0,
    };
  });

  return {
    rows: identityRows,
    distinctModalFormationCount: new Set(
      identityRows
        .filter((row) => row.modalFormationKey !== "not_evaluated")
        .map((row) => row.modalFormationKey),
    ).size,
    unevaluatedIdentityKeys: identityRows
      .filter((row) => row.modalFormationKey === "not_evaluated")
      .map((row) => row.squadIdentityKey),
    unattributedSelectionCount,
  };
}

/** One primary role and how much of the generated population carries it. */
export interface TacticalAgencyRoleShareRow {
  readonly role: PlayerRole;
  readonly count: number;
  readonly share: number;
}

/** The ten primary roles as the generated population actually distributes them. */
export interface TacticalAgencyRoleSummary {
  /** Players counted. Every share divides by this. */
  readonly playerCount: number;
  /** All ten roles, in `PLAYER_ROLES` order, including the absent ones. */
  readonly roleShares: readonly TacticalAgencyRoleShareRow[];
  /** Roles no footballer in the population carries as a primary role. */
  readonly absentRoles: readonly PlayerRole[];
  /**
   * Players whose primary role the generator never declared.
   *
   * Counted rather than defaulted. A missing role is a fact about generation,
   * and folding it into one of the ten would hide exactly the gap this phase
   * is looking for.
   */
  readonly undeclaredRoleCount: number;
}

/**
 * Counts the ten primary roles across an explicit player population.
 *
 * All ten roles are reported whether or not anybody has them: the finding this
 * audit exists to record is which roles the generator never produces, and a row
 * that is absent from a table is easy to read as a row that was not measured.
 */
export function summarizeTacticalAgencyPrimaryRoles(
  careerState: CareerState,
  playerIds: readonly PlayerId[],
): TacticalAgencyRoleSummary {
  const counts = new Map<PlayerRole, number>(PLAYER_ROLES.map((role) => [role, 0]));
  let undeclaredRoleCount = 0;

  for (const playerId of playerIds) {
    const role = careerState.gameState.players[playerId]?.primaryRole;
    if (role === undefined) {
      undeclaredRoleCount += 1;
      continue;
    }
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }

  const declaredCount = playerIds.length - undeclaredRoleCount;
  const roleShares = PLAYER_ROLES.map((role) => {
    const count = counts.get(role) ?? 0;
    return { role, count, share: declaredCount === 0 ? 0 : count / declaredCount };
  });

  return {
    playerCount: playerIds.length,
    roleShares,
    absentRoles: roleShares.filter((row) => row.count === 0).map((row) => row.role),
    undeclaredRoleCount,
  };
}

/** One side of a paired low-block reading, in the unit the gate is written in. */
export interface TacticalAgencyExpectedGoalsRow {
  /** Expected goals this side created. */
  readonly created: number;
  /** Expected goals it conceded. */
  readonly conceded: number;
  /** Opportunities it generated, kept as the historical volume diagnostic only. */
  readonly opportunities: number;
}

/** A low block measured against the neutral plan, at equal quality. */
export interface TacticalAgencyLowBlockResult {
  /** Matches simulated in each arm. Both arms use the same count. */
  readonly matchesPerArm: number;
  /** The neutral plan's own reading. */
  readonly neutral: TacticalAgencyExpectedGoalsRow;
  /** The low block's reading over the same seeds and the same eleven. */
  readonly lowBlock: TacticalAgencyExpectedGoalsRow;
  /** Fractional reduction in conceded xG. Positive means the block worked. */
  readonly concededExpectedGoalsReduction: number;
  /**
   * Own xG given up per unit of conceded xG saved.
   *
   * `no_reduction` when the block conceded no less, because a plan that bought
   * nothing has no exchange rate: reporting `0` would read as free, and
   * `Infinity` does not survive JSON - it comes back as `null`, which is how a
   * report written to disk loses the finding it was written to record.
   */
  readonly ownLossPerConcededReduction: number | "no_reduction";
}

/**
 * Pools several worlds' low-block readings into one.
 *
 * The expected goals are added and the two ratios are then re-derived from the
 * pooled totals, using the same formulas `runTacticalAgencyLowBlockSeries(...)`
 * uses on a single world. **The ratios are never averaged.**
 * `ownLossPerConcededReduction` is a quotient whose denominator can be near
 * zero, so a world that saved almost nothing produces an enormous ratio and
 * would dominate a mean of ratios while contributing almost no football to it.
 * Pooling the numerators and denominators first gives each world exactly the
 * weight of the xG it actually produced.
 *
 * @example
 * poolTacticalAgencyLowBlockResults(perWorld); // one reading over every world
 */
export function poolTacticalAgencyLowBlockResults(
  results: readonly TacticalAgencyLowBlockResult[],
): TacticalAgencyLowBlockResult {
  const first = results[0];
  if (first === undefined) {
    throw new TacticalAgencyAuditError("empty_work_items", "Pooling needs at least one low-block reading");
  }

  const add = (
    pick: (result: TacticalAgencyLowBlockResult) => TacticalAgencyExpectedGoalsRow,
  ): TacticalAgencyExpectedGoalsRow => ({
    created: results.reduce((sum, result) => sum + pick(result).created, 0),
    conceded: results.reduce((sum, result) => sum + pick(result).conceded, 0),
    opportunities: results.reduce((sum, result) => sum + pick(result).opportunities, 0),
  });

  const neutral = add((result) => result.neutral);
  const lowBlock = add((result) => result.lowBlock);
  const concededSaved = neutral.conceded - lowBlock.conceded;
  const ownLoss = Math.max(0, neutral.created - lowBlock.created);

  return {
    matchesPerArm: results.reduce((sum, result) => sum + result.matchesPerArm, 0),
    neutral,
    lowBlock,
    concededExpectedGoalsReduction:
      neutral.conceded === 0 ? 0 : concededSaved / neutral.conceded,
    ownLossPerConcededReduction: concededSaved <= 0 ? "no_reduction" : ownLoss / concededSaved,
  };
}

/** Everything the low-block reading needs from its composition root. */
export interface TacticalAgencyLowBlockSeriesInput {
  /** The side under test, already assembled by a production path. */
  readonly own: MatchTeamContext;
  /** Its opponent, held identical across both arms. */
  readonly opponent: MatchTeamContext;
  /** Instructions the neutral arm plays. */
  readonly neutralTactics: MatchTacticalDistributionInput;
  /** Instructions the low-block arm plays. Only this differs between arms. */
  readonly lowBlockTactics: MatchTacticalDistributionInput;
  /** Engine config both arms share. */
  readonly engineConfig: MatchEngineConfig;
  /** Versioned match-tactics calibration both arms share. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Fixture identity used to build every match seed. */
  readonly fixtureId: FixtureId;
  /** Seed prefix; selection and replay prefixes must never overlap. */
  readonly seedPrefix: string;
  /** Paired seeds per arm. */
  readonly pairedSeedCount: number;
}

/**
 * Measures a low block against the neutral plan in expected goals.
 *
 * Phase 81 measured this in *occasions* and found the block giving up about
 * `22.6%` of its own to take about `1.7%` off the opponent. That reading stays
 * a diagnostic, because it cannot tell a plan that concedes fewer chances from
 * one that concedes worse chances, and the gate Step 05 must pass is written in
 * xG for exactly that reason. Both are recorded here so the two are never
 * confused for one another again.
 *
 * The two arms share seeds, eleven, opponent and venue, so the only thing that
 * differs is the instruction under test.
 */
export function runTacticalAgencyLowBlockSeries(
  input: TacticalAgencyLowBlockSeriesInput,
): TacticalAgencyLowBlockResult {
  if (input.pairedSeedCount <= 0) {
    throw new TacticalAgencyAuditError("empty_work_items", "A low-block series needs at least one paired seed");
  }

  const neutral = runArm(input, input.neutralTactics, "neutral");
  const lowBlock = runArm(input, input.lowBlockTactics, "low-block");
  const concededReduction =
    neutral.conceded === 0 ? 0 : (neutral.conceded - lowBlock.conceded) / neutral.conceded;
  const ownLoss = Math.max(0, neutral.created - lowBlock.created);
  const concededSaved = neutral.conceded - lowBlock.conceded;

  return {
    matchesPerArm: input.pairedSeedCount * 2,
    neutral,
    lowBlock,
    concededExpectedGoalsReduction: concededReduction,
    ownLossPerConcededReduction: concededSaved <= 0 ? "no_reduction" : ownLoss / concededSaved,
  };
}

/** Runs one arm home and away over every paired seed. */
function runArm(
  input: TacticalAgencyLowBlockSeriesInput,
  tactics: MatchTacticalDistributionInput,
  armKey: string,
): TacticalAgencyExpectedGoalsRow {
  let created = 0;
  let conceded = 0;
  let opportunities = 0;

  for (let pairIndex = 0; pairIndex < input.pairedSeedCount; pairIndex += 1) {
    for (const ownIsHome of [true, false]) {
      const own: MatchTeamContext = { ...input.own, tacticalDistribution: tactics };
      const scenarioKey = `${armKey}|${pairIndex}|${ownIsHome ? "h" : "a"}`;
      const context: MatchContext = {
        fixtureId: input.fixtureId,
        seed: `${input.seedPrefix}|${scenarioKey}`,
        home: ownIsHome ? own : input.opponent,
        away: ownIsHome ? input.opponent : own,
        engineConfig: input.engineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
      };

      const result = simulateMatch(context);
      const telemetry = result.stats.telemetry;
      if (telemetry === undefined) {
        throw new TacticalAgencyAuditError(
          "missing_telemetry",
          `Low-block match ${scenarioKey} completed without causal telemetry`,
        );
      }

      const ownSide = ownIsHome ? "home" : "away";
      const opponentSide = ownIsHome ? "away" : "home";
      created += telemetry.stats[ownSide].expectedGoals;
      conceded += telemetry.stats[opponentSide].expectedGoals;
      opportunities += result.stats[ownSide].opportunities;
    }
  }

  const matches = input.pairedSeedCount * 2;

  return { created: created / matches, conceded: conceded / matches, opportunities: opportunities / matches };
}

/**
 * What a reading was taken on.
 *
 * Carried beside every number rather than inferred from the command that
 * produced it, because a correctly-measured number answering the wrong question
 * does not announce itself the way a wrong one does.
 */
export interface TacticalAgencyPopulationManifest {
  /** World seeds observed, in the order they were run. */
  readonly worldSeeds: readonly string[];
  /** Seed prefix used for the low-block replay. */
  readonly lowBlockSeedPrefix: string;
  /** Stamped match-tactics calibration version every reading used. */
  readonly matchTacticsCalibrationVersion: string;
  /** Workers the run actually used. Execution metadata, never an input to a number. */
  readonly workerCount: number;
  /** Whether the run declared itself a checkpoint, which pins the worker count. */
  readonly checkpointMode: boolean;
}

/** The complete Step 02 before-state. */
export interface TacticalAgencyAuditReport {
  /** Contract version, so a later step cannot quietly reuse this reading. */
  readonly contractVersion: typeof TACTICAL_AGENCY_AUDIT_CONTRACT_VERSION;
  /** What this was measured on. */
  readonly manifest: TacticalAgencyPopulationManifest;
  /** What the real career selector did. */
  readonly selections: TacticalAgencySelectionSummary;
  /** How the generated population distributes the ten primary roles. */
  readonly roles: TacticalAgencyRoleSummary;
  /** The low block against the neutral plan, in xG. */
  readonly lowBlock: TacticalAgencyLowBlockResult;
  /** Selections per second, so later checkpoints can be costed before they run. */
  readonly selectionsPerSecond: number;
  /** Wall-clock milliseconds spent selecting. */
  readonly selectionElapsedMilliseconds: number;
}

/** Assembles the before-state from readings the caller already took. */
export function buildTacticalAgencyAuditReport(input: {
  readonly manifest: TacticalAgencyPopulationManifest;
  readonly selectionSeries: TacticalAgencySelectionSeriesResult;
  readonly roles: TacticalAgencyRoleSummary;
  readonly lowBlock: TacticalAgencyLowBlockResult;
}): TacticalAgencyAuditReport {
  const elapsed = input.selectionSeries.elapsedMilliseconds;

  return {
    contractVersion: TACTICAL_AGENCY_AUDIT_CONTRACT_VERSION,
    manifest: input.manifest,
    selections: summarizeTacticalAgencySelections(input.selectionSeries.rows),
    roles: input.roles,
    lowBlock: input.lowBlock,
    selectionsPerSecond: elapsed <= 0 ? 0 : (input.selectionSeries.rows.length * 1_000) / elapsed,
    selectionElapsedMilliseconds: elapsed,
  };
}

/** Versioned analytic interpretation of the Step 05 minute-plan facts. */
export const TACTICAL_AGENCY_B_ANALYTIC_CONTRACT_VERSION = "phase81a-b-analytic-threat-v1";

/** Material advantage required for one directed structural arc. */
export const TACTICAL_AGENCY_B_MATERIAL_ARC_BASIS_POINTS = 100;

/** Existing tactic rows admitted to the complete Checkpoint B action space. */
export const TACTICAL_AGENCY_B_TACTIC_KEYS = [
  "high_pressing",
  "direct_play",
  "low_block",
] as const;
export type TacticalAgencyBTacticKey = typeof TACTICAL_AGENCY_B_TACTIC_KEYS[number];

/** One formation, tactic profile and lateral instruction in the analytic space. */
export interface TacticalAgencyStructuralAction {
  readonly actionId: string;
  readonly formationKey: FormationKey;
  readonly tacticKey: TacticalAgencyBTacticKey;
  readonly tactic: MatchTacticalDistributionInput;
  readonly lateralFocus: LateralFocus;
  readonly shape: TacticalShapeProfile;
}

/** Builds the declared `23 x 3 x 3` action space from shared authored facts. */
export function buildTacticalAgencyStructuralActions(input: {
  readonly referenceBand: TacticalShapeQualityBand;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}): readonly TacticalAgencyStructuralAction[] {
  const profiles = TACTICAL_AGENCY_B_TACTIC_KEYS.map((tacticKey) => {
    const profile = TACTICAL_SHAPE_TACTIC_PROFILES.find((row) => row.tacticKey === tacticKey);
    if (profile === undefined) {
      throw new TacticalAgencyAuditError(
        "empty_work_items",
        `The shared tactic population has no ${tacticKey} row`,
      );
    }
    return profile;
  });

  const actions: TacticalAgencyStructuralAction[] = [];
  for (const formationKey of FORMATION_KEYS) {
    const shape = buildTacticalShapeTeamContext(
      {
        lineup: { kind: "formation", formationKey },
        band: input.referenceBand,
        tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC,
      },
      "home",
      input.matchTacticsCalibration,
    ).shape;

    for (const profile of profiles) {
      for (const lateralFocus of LATERAL_FOCUSES) {
        actions.push(structuralAction(formationKey, profile, lateralFocus, shape));
      }
    }
  }

  return actions;
}

function structuralAction(
  formationKey: FormationKey,
  profile: TacticalShapeTacticProfile,
  lateralFocus: LateralFocus,
  shape: TacticalShapeProfile,
): TacticalAgencyStructuralAction {
  const tacticKey = profile.tacticKey as TacticalAgencyBTacticKey;
  return {
    actionId: `${formationKey}|${tacticKey}|${lateralFocus}`,
    formationKey,
    tacticKey,
    lateralFocus,
    shape,
    tactic: {
      directness: profile.directness,
      pressing: profile.pressing,
      width: profile.width,
      risk: profile.risk,
      mentality: profile.mentality,
    },
  };
}

/** Versioned interpretation of B2's formation-conditioned response space. */
export const TACTICAL_AGENCY_B2_ANALYTIC_CONTRACT_VERSION =
  "phase81a-b2-conditioned-analytic-v1";

/** One of the nine legal tactic-and-side responses, with no formation choice. */
export interface TacticalAgencyConditionedResponse {
  readonly responseId: string;
  readonly tacticKey: TacticalAgencyBTacticKey;
  readonly tactic: MatchTacticalDistributionInput;
  readonly lateralFocus: LateralFocus;
}

/** Builds the fixed `3 tactic x 3 lateralFocus` B2 response population. */
export function buildTacticalAgencyConditionedResponses(): readonly TacticalAgencyConditionedResponse[] {
  const responses: TacticalAgencyConditionedResponse[] = [];
  for (const tacticKey of TACTICAL_AGENCY_B_TACTIC_KEYS) {
    const profile = TACTICAL_SHAPE_TACTIC_PROFILES.find((row) => row.tacticKey === tacticKey);
    if (profile === undefined) {
      throw new TacticalAgencyAuditError(
        "empty_work_items",
        `The shared tactic population has no ${tacticKey} row`,
      );
    }
    for (const lateralFocus of LATERAL_FOCUSES) {
      responses.push({
        responseId: `${tacticKey}|${lateralFocus}`,
        tacticKey,
        lateralFocus,
        tactic: {
          directness: profile.directness,
          pressing: profile.pressing,
          width: profile.width,
          risk: profile.risk,
          mentality: profile.mentality,
        },
      });
    }
  }
  return responses;
}

/** One real directed shape matchup before the opponent response is expanded. */
export interface TacticalAgencyConditionedMatchupInput {
  readonly matchupId: string;
  readonly ownShape: TacticalShapeProfile;
  readonly opponentShape: TacticalShapeProfile;
}

/** Real selected elevens retained only long enough for independent B2 replay. */
export interface TacticalAgencyConditionedReplayMatchupInput
  extends TacticalAgencyConditionedMatchupInput {
  readonly reciprocalMatchupId: string;
  readonly own: MatchTeamContext;
  readonly opponent: MatchTeamContext;
}

/** One deterministically selected Phase-2 context and its population weight. */
export interface TacticalAgencyConditionedReplayContext {
  readonly contextIndex: number;
  readonly contextId: string;
  readonly matchupId: string;
  readonly opponentResponseIndex: number;
  readonly opponentResponseId: string;
  readonly populationWeightCount: number;
  readonly own: MatchTeamContext;
  readonly opponent: MatchTeamContext;
}

/** Frozen B2 replay sizes; changing either creates a new checkpoint contract. */
export const TACTICAL_AGENCY_B2_SELECTION_SEEDS_PER_CANDIDATE = 8;
export const TACTICAL_AGENCY_B2_REPLAY_SEEDS_PER_CONTEXT = 207;
export const TACTICAL_AGENCY_B2_MAX_REPLAY_CONTEXTS = 32;

/** Selects the output-blind stratified farthest-first B2 replay population. */
export function selectTacticalAgencyConditionedReplayContexts(input: {
  readonly responses: readonly TacticalAgencyConditionedResponse[];
  readonly contexts: readonly TacticalAgencyConditionedContextRow[];
  readonly matchups: readonly TacticalAgencyConditionedReplayMatchupInput[];
  readonly maximumContextCount?: number;
}): readonly TacticalAgencyConditionedReplayContext[] {
  const maximumContextCount = input.maximumContextCount
    ?? TACTICAL_AGENCY_B2_MAX_REPLAY_CONTEXTS;
  if (!Number.isSafeInteger(maximumContextCount) || maximumContextCount < input.responses.length * 2) {
    throw new TacticalAgencyAuditError(
      "empty_work_items",
      `B2 replay needs at least ${input.responses.length * 2} contexts for reciprocal response strata: ${maximumContextCount}`,
    );
  }
  const ordered = [...input.contexts].sort((left, right) =>
    left.contextId.localeCompare(right.contextId));
  if (ordered.length === 0) {
    throw new TacticalAgencyAuditError("empty_work_items", "B2 replay has no analytic contexts");
  }
  const matchupById = new Map(input.matchups.map((matchup) => [matchup.matchupId, matchup]));
  const contextByMatchupAndResponse = new Map(ordered.map((context) => [
    `${context.matchupId}|${context.opponentResponseId}`,
    context,
  ]));
  interface ReciprocalUnit {
    readonly unitId: string;
    readonly opponentResponseId: string;
    readonly rows: readonly [TacticalAgencyConditionedContextRow, TacticalAgencyConditionedContextRow];
    readonly vector: readonly (number | string)[];
  }
  const units: ReciprocalUnit[] = [];
  for (const row of ordered) {
    const matchup = matchupById.get(row.matchupId);
    if (matchup === undefined) {
      throw new TacticalAgencyAuditError("missing_telemetry", `B2 replay lost ${row.matchupId}`);
    }
    const reciprocal = contextByMatchupAndResponse.get(
      `${matchup.reciprocalMatchupId}|${row.opponentResponseId}`,
    );
    if (reciprocal === undefined) {
      throw new TacticalAgencyAuditError(
        "missing_telemetry",
        `B2 replay lost reciprocal context for ${row.contextId}`,
      );
    }
    if (row.contextId > reciprocal.contextId) continue;
    const rows = [row, reciprocal] as const;
    units.push({
      unitId: `${row.contextId}<>${reciprocal.contextId}`,
      opponentResponseId: row.opponentResponseId,
      rows,
      vector: rows.flatMap(conditionedContextSignatureVector),
    });
  }
  if (units.length * 2 !== ordered.length) {
    throw new TacticalAgencyAuditError(
      "missing_telemetry",
      `B2 replay paired ${units.length * 2} of ${ordered.length} directed contexts`,
    );
  }
  units.sort((left, right) => left.unitId.localeCompare(right.unitId));
  const selectionLimit = Math.min(Math.floor(maximumContextCount / 2), units.length);
  const selected: ReciprocalUnit[] = [];
  const selectedIds = new Set<string>();

  // Start with one reciprocal matchup from every opponent-response stratum.
  for (const response of [...input.responses].sort((left, right) =>
    left.responseId.localeCompare(right.responseId))) {
    const unit = units.find(({ opponentResponseId }) => opponentResponseId === response.responseId);
    if (unit !== undefined) {
      selected.push(unit);
      selectedIds.add(unit.unitId);
    }
  }

  const minimumDistanceByUnitId = new Map<string, number>();
  for (const candidate of units) {
    if (selectedIds.has(candidate.unitId)) continue;
    minimumDistanceByUnitId.set(
      candidate.unitId,
      Math.min(...selected.map((unit) => conditionedContextSignatureDistance(
        candidate.vector,
        unit.vector,
      ))),
    );
  }
  while (selected.length < selectionLimit) {
    let next: ReciprocalUnit | undefined;
    let nextDistance = -1;
    for (const candidate of units) {
      if (selectedIds.has(candidate.unitId)) continue;
      const distance = minimumDistanceByUnitId.get(candidate.unitId) ?? -1;
      if (
        distance > nextDistance
        || (distance === nextDistance
          && (next === undefined || candidate.unitId < next.unitId))
      ) {
        next = candidate;
        nextDistance = distance;
      }
    }
    if (next === undefined) break;
    selected.push(next);
    selectedIds.add(next.unitId);
    minimumDistanceByUnitId.delete(next.unitId);
    for (const candidate of units) {
      if (selectedIds.has(candidate.unitId)) continue;
      const distance = conditionedContextSignatureDistance(candidate.vector, next.vector);
      minimumDistanceByUnitId.set(
        candidate.unitId,
        Math.min(minimumDistanceByUnitId.get(candidate.unitId) ?? Number.POSITIVE_INFINITY, distance),
      );
    }
  }

  const populationWeights = new Map(selected.map(({ unitId }) => [unitId, 0]));
  for (const unit of units) {
    const sameStratum = selected.filter(
      ({ opponentResponseId }) => opponentResponseId === unit.opponentResponseId,
    );
    let nearest: ReciprocalUnit | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of sameStratum) {
      const distance = conditionedContextSignatureDistance(unit.vector, candidate.vector);
      if (
        distance < nearestDistance
        || (distance === nearestDistance
          && (nearest === undefined || candidate.unitId < nearest.unitId))
      ) {
        nearest = candidate;
        nearestDistance = distance;
      }
    }
    if (nearest === undefined) {
      throw new TacticalAgencyAuditError("empty_work_items", "B2 replay selected no representative");
    }
    populationWeights.set(
      nearest.unitId,
      (populationWeights.get(nearest.unitId) ?? 0) + 1,
    );
  }

  return selected.flatMap((unit) => unit.rows.map((row) => {
    const matchup = matchupById.get(row.matchupId);
    if (matchup === undefined) {
      throw new TacticalAgencyAuditError(
        "missing_telemetry",
        `B2 replay lost real matchup ${row.matchupId}`,
      );
    }
    return {
      contextIndex: row.contextIndex,
      contextId: row.contextId,
      matchupId: row.matchupId,
      opponentResponseIndex: row.opponentResponseIndex,
      opponentResponseId: row.opponentResponseId,
      populationWeightCount: populationWeights.get(unit.unitId) ?? 0,
      own: matchup.own,
      opponent: matchup.opponent,
    };
  }));
}

/** Squared Euclidean distance over complete basis-point plan facts. */
function conditionedContextSignatureVector(
  context: TacticalAgencyConditionedContextRow,
): readonly (number | string)[] {
  return context.candidates.flatMap(({ planSignature }) =>
    planSignature.split("|").map((field) => {
      const numeric = Number(field);
      return Number.isFinite(numeric) ? numeric / 10_000 : field;
    }));
}

function conditionedContextSignatureDistance(
  leftFields: readonly (number | string)[],
  rightFields: readonly (number | string)[],
): number {
  if (leftFields.length !== rightFields.length) {
    throw new TacticalAgencyAuditError("missing_telemetry", "B2 context signatures have different widths");
  }
  let distance = 0;
  for (const [index, leftField] of leftFields.entries()) {
    const rightField = rightFields[index] as number | string;
    if (typeof leftField === "number" && typeof rightField === "number") {
      const delta = leftField - rightField;
      distance += delta * delta;
    } else if (leftField !== rightField) {
      distance += 1;
    }
  }
  return distance;
}

/** One selected context after independent selection and replay streams. */
export interface TacticalAgencyConditionedReplayContextResult {
  readonly contextIndex: number;
  readonly contextId: string;
  readonly opponentResponseId: string;
  readonly populationWeightCount: number;
  readonly bestResponseId: string;
  readonly exposedResponseId: string;
  readonly selectionWinShares: readonly {
    readonly responseId: string;
    readonly winShare: number;
  }[];
  readonly bestReplayWinShare: number;
  readonly exposedReplayWinShare: number;
  readonly contextFreeReplayWinShare: number;
  /** Paired replay observations retained for the one canonical summarizer. */
  readonly counterMoveDeltas: readonly number[];
  readonly exposureDeltas: readonly number[];
  readonly contextFreeDeltas: readonly number[];
}

/** Executes independent selection and replay streams for one context shard. */
export function runTacticalAgencyConditionedReplayPartition(input: {
  readonly responses: readonly TacticalAgencyConditionedResponse[];
  readonly contexts: readonly TacticalAgencyConditionedReplayContext[];
  readonly engineConfig: MatchEngineConfig;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  readonly selectionSeedPrefix: string;
  readonly replaySeedPrefix: string;
}): readonly TacticalAgencyConditionedReplayContextResult[] {
  if (input.selectionSeedPrefix === input.replaySeedPrefix) {
    throw new TacticalAgencyAuditError(
      "empty_work_items",
      "B2 selection and replay seed prefixes must be disjoint",
    );
  }
  return input.contexts.map((context) => {
    const opponentResponse = input.responses[context.opponentResponseIndex];
    if (opponentResponse === undefined) {
      throw new TacticalAgencyAuditError(
        "missing_telemetry",
        `B2 replay lost opponent response ${context.opponentResponseIndex}`,
      );
    }
    const selectionWinShares = input.responses.map((response) => ({
      responseId: response.responseId,
      winShare: meanTacticalAgencyReplayWinShare({
        context,
        response,
        opponentResponse,
        seedPrefix: input.selectionSeedPrefix,
        pairedSeedCount: TACTICAL_AGENCY_B2_SELECTION_SEEDS_PER_CANDIDATE,
        engineConfig: input.engineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
      }),
    }));
    const ranked = [...selectionWinShares].sort((left, right) =>
      right.winShare - left.winShare || left.responseId.localeCompare(right.responseId));
    const reverseRanked = [...selectionWinShares].sort((left, right) =>
      left.winShare - right.winShare || left.responseId.localeCompare(right.responseId));
    const bestResponseId = ranked[0]?.responseId;
    const exposedResponseId = reverseRanked[0]?.responseId;
    const bestResponse = input.responses.find(({ responseId }) => responseId === bestResponseId);
    const exposedResponse = input.responses.find(({ responseId }) => responseId === exposedResponseId);
    if (bestResponse === undefined || exposedResponse === undefined) {
      throw new TacticalAgencyAuditError("missing_telemetry", `B2 replay could not rank ${context.contextId}`);
    }

    const bestValues: number[] = [];
    const exposedValues: number[] = [];
    const contextFreeValues: number[] = [];
    for (
      let pairIndex = 0;
      pairIndex < TACTICAL_AGENCY_B2_REPLAY_SEEDS_PER_CONTEXT;
      pairIndex += 1
    ) {
      const contextFreeResponse = input.responses[pairIndex % input.responses.length];
      if (contextFreeResponse === undefined) {
        throw new TacticalAgencyAuditError("missing_telemetry", "B2 context-free cycle is incomplete");
      }
      for (const ownIsHome of [true, false]) {
        const replayKey = `${context.contextId}|${pairIndex}|${ownIsHome ? "h" : "a"}`;
        bestValues.push(tacticalAgencyReplayWinShare({
          context,
          response: bestResponse,
          opponentResponse,
          seed: `${input.replaySeedPrefix}|${replayKey}`,
          ownIsHome,
          engineConfig: input.engineConfig,
          matchTacticsCalibration: input.matchTacticsCalibration,
        }));
        exposedValues.push(tacticalAgencyReplayWinShare({
          context,
          response: exposedResponse,
          opponentResponse,
          seed: `${input.replaySeedPrefix}|${replayKey}`,
          ownIsHome,
          engineConfig: input.engineConfig,
          matchTacticsCalibration: input.matchTacticsCalibration,
        }));
        contextFreeValues.push(tacticalAgencyReplayWinShare({
          context,
          response: contextFreeResponse,
          opponentResponse,
          seed: `${input.replaySeedPrefix}|${replayKey}`,
          ownIsHome,
          engineConfig: input.engineConfig,
          matchTacticsCalibration: input.matchTacticsCalibration,
        }));
      }
    }

    return {
      contextIndex: context.contextIndex,
      contextId: context.contextId,
      opponentResponseId: context.opponentResponseId,
      populationWeightCount: context.populationWeightCount,
      bestResponseId: bestResponse.responseId,
      exposedResponseId: exposedResponse.responseId,
      selectionWinShares,
      bestReplayWinShare: mean(bestValues),
      exposedReplayWinShare: mean(exposedValues),
      contextFreeReplayWinShare: mean(contextFreeValues),
      counterMoveDeltas: bestValues.map((value, index) =>
        value - (contextFreeValues[index] as number)),
      exposureDeltas: exposedValues.map((value, index) =>
        value - (contextFreeValues[index] as number)),
      contextFreeDeltas: contextFreeValues.map((value) => value - 0.5),
    };
  });
}

function meanTacticalAgencyReplayWinShare(input: {
  readonly context: TacticalAgencyConditionedReplayContext;
  readonly response: TacticalAgencyConditionedResponse;
  readonly opponentResponse: TacticalAgencyConditionedResponse;
  readonly seedPrefix: string;
  readonly pairedSeedCount: number;
  readonly engineConfig: MatchEngineConfig;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}): number {
  const values: number[] = [];
  for (let pairIndex = 0; pairIndex < input.pairedSeedCount; pairIndex += 1) {
    for (const ownIsHome of [true, false]) {
      values.push(tacticalAgencyReplayWinShare({
        ...input,
        seed: `${input.seedPrefix}|${input.context.contextId}|${pairIndex}|${ownIsHome ? "h" : "a"}`,
        ownIsHome,
      }));
    }
  }
  return mean(values);
}

function tacticalAgencyReplayWinShare(input: {
  readonly context: TacticalAgencyConditionedReplayContext;
  readonly response: TacticalAgencyConditionedResponse;
  readonly opponentResponse: TacticalAgencyConditionedResponse;
  readonly seed: string;
  readonly ownIsHome: boolean;
  readonly engineConfig: MatchEngineConfig;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}): number {
  const own = { ...input.context.own, tacticalDistribution: input.response.tactic };
  const opponent = { ...input.context.opponent, tacticalDistribution: input.opponentResponse.tactic };
  const result = simulateMatch({
    fixtureId: fixtureId(`fixture:b2-replay-${String(input.context.contextIndex).padStart(4, "0")}`),
    seed: input.seed,
    home: input.ownIsHome ? own : opponent,
    away: input.ownIsHome ? opponent : own,
    engineConfig: input.engineConfig,
    matchTacticsCalibration: input.matchTacticsCalibration,
  }, {
    lateralFocusBySide: input.ownIsHome
      ? { home: input.response.lateralFocus, away: input.opponentResponse.lateralFocus }
      : { home: input.opponentResponse.lateralFocus, away: input.response.lateralFocus },
  });
  const ownGoals = input.ownIsHome ? result.score.home : result.score.away;
  const opponentGoals = input.ownIsHome ? result.score.away : result.score.home;
  return ownGoals > opponentGoals ? 1 : ownGoals < opponentGoals ? 0 : 0.5;
}

function mean(values: readonly number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Weighted replay estimate and its deterministic normal 95% interval. */
export interface TacticalAgencyConditionedReplayEstimate {
  readonly value: number;
  readonly interval95: readonly [number, number];
}

/** Complete independent B2 replay decision for one seed set. */
export interface TacticalAgencyConditionedReplaySummary {
  readonly contractVersion: "phase81a-b2-independent-replay-v1";
  readonly selectedContextCount: number;
  readonly declaredContextCount: number;
  readonly selectionSeedsPerCandidate: number;
  readonly replaySeedsPerContext: number;
  readonly simulatedMatchCount: number;
  readonly counterMoveCeiling: TacticalAgencyConditionedReplayEstimate;
  readonly counterMoveExposure: TacticalAgencyConditionedReplayEstimate;
  readonly contextFreeDelta: TacticalAgencyConditionedReplayEstimate;
  readonly selectedContexts: readonly Omit<
    TacticalAgencyConditionedReplayContextResult,
    "counterMoveDeltas" | "exposureDeltas" | "contextFreeDeltas"
  >[];
  readonly decision: "GO" | "REFINE";
}

/** Aggregates only replay observations; analytic output cannot enter the result. */
export function summarizeTacticalAgencyConditionedReplay(input: {
  readonly declaredContextCount: number;
  readonly contexts: readonly TacticalAgencyConditionedReplayContextResult[];
}): TacticalAgencyConditionedReplaySummary {
  if (input.contexts.length === 0) {
    throw new TacticalAgencyAuditError("empty_work_items", "B2 replay produced no contexts");
  }
  const weightTotal = input.contexts.reduce(
    (sum, context) => sum + context.populationWeightCount,
    0,
  );
  if (weightTotal !== input.declaredContextCount) {
    throw new TacticalAgencyAuditError(
      "missing_telemetry",
      `B2 replay weights sum to ${weightTotal}; expected ${input.declaredContextCount}`,
    );
  }
  const estimate = (
    pick: (context: TacticalAgencyConditionedReplayContextResult) => readonly number[],
  ): TacticalAgencyConditionedReplayEstimate => weightedReplayEstimate(
    input.contexts.flatMap((context) => {
      const values = pick(context);
      const weight = context.populationWeightCount / weightTotal / values.length;
      return values.map((value) => ({ value, weight }));
    }),
  );
  const counterMoveCeiling = estimate(({ counterMoveDeltas }) => counterMoveDeltas);
  const counterMoveExposure = estimate(({ exposureDeltas }) => exposureDeltas);
  const contextFreeDelta = estimate(({ contextFreeDeltas }) => contextFreeDeltas);
  const decision = counterMoveCeiling.value >= 0.045
    && counterMoveExposure.value <= -0.045
    && Math.abs(contextFreeDelta.value) <= 0.015
    && contextFreeDelta.interval95[0] <= 0
    && contextFreeDelta.interval95[1] >= 0
    ? "GO" as const
    : "REFINE" as const;
  return {
    contractVersion: "phase81a-b2-independent-replay-v1",
    selectedContextCount: input.contexts.length,
    declaredContextCount: input.declaredContextCount,
    selectionSeedsPerCandidate: TACTICAL_AGENCY_B2_SELECTION_SEEDS_PER_CANDIDATE,
    replaySeedsPerContext: TACTICAL_AGENCY_B2_REPLAY_SEEDS_PER_CONTEXT,
    simulatedMatchCount: input.contexts.length * (
      (input.contexts[0]?.selectionWinShares.length ?? 0)
        * TACTICAL_AGENCY_B2_SELECTION_SEEDS_PER_CANDIDATE
        * 2
      + 3 * TACTICAL_AGENCY_B2_REPLAY_SEEDS_PER_CONTEXT * 2
    ),
    counterMoveCeiling,
    counterMoveExposure,
    contextFreeDelta,
    selectedContexts: input.contexts.map(({
      counterMoveDeltas: _counterMoveDeltas,
      exposureDeltas: _exposureDeltas,
      contextFreeDeltas: _contextFreeDeltas,
      ...context
    }) => context),
    decision,
  };
}

function weightedReplayEstimate(
  observations: readonly { readonly value: number; readonly weight: number }[],
): TacticalAgencyConditionedReplayEstimate {
  const value = observations.reduce(
    (sum, observation) => sum + observation.value * observation.weight,
    0,
  );
  const squaredWeightTotal = observations.reduce(
    (sum, observation) => sum + observation.weight * observation.weight,
    0,
  );
  const varianceOfMean = squaredWeightTotal >= 1
    ? 0
    : observations.reduce(
      (sum, observation) => sum
        + observation.weight * observation.weight * (observation.value - value) ** 2,
      0,
    ) / (1 - squaredWeightTotal);
  const margin = 1.96 * Math.sqrt(varianceOfMean);
  return { value, interval95: [value - margin, value + margin] };
}

/** Multiplicative facts already consumed by the canonical analytic threat. */
export interface TacticalAgencyAnalyticThreatComponents {
  readonly volumeMultiplier: number;
  readonly effectiveControl: number;
  readonly routeSaturation: number;
  readonly expectedRouteQuality: number;
  readonly leftAllocation: number;
  readonly rightAllocation: number;
  readonly threat: number;
}

/** A conditioned candidate plus the facts that produced its payoff. */
export interface TacticalAgencyConditionedCandidateRow extends TacticalAgencyStructuralCandidateRow {
  readonly ownThreat: TacticalAgencyAnalyticThreatComponents;
  readonly opponentThreat: TacticalAgencyAnalyticThreatComponents;
}

/** One analytic column: fixed real shapes plus one declared opponent response. */
export interface TacticalAgencyConditionedContextRow {
  readonly contextIndex: number;
  readonly contextId: string;
  readonly matchupId: string;
  readonly opponentResponseIndex: number;
  readonly opponentResponseId: string;
  readonly candidates: readonly TacticalAgencyConditionedCandidateRow[];
  readonly mirrorMismatchCount: number;
}

/** Runs independent B2 columns; callers shard only the canonical context indexes. */
export function runTacticalAgencyConditionedAnalyticPartition(input: {
  readonly responses: readonly TacticalAgencyConditionedResponse[];
  readonly matchups: readonly TacticalAgencyConditionedMatchupInput[];
  readonly contextIndexes: readonly number[];
  readonly engineConfig: MatchEngineConfig;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}): readonly TacticalAgencyConditionedContextRow[] {
  const contextCount = input.matchups.length * input.responses.length;
  return input.contextIndexes.map((contextIndex) => {
    if (contextIndex < 0 || contextIndex >= contextCount) {
      throw new TacticalAgencyAuditError(
        "empty_work_items",
        `Conditioned analytic context is outside the declared space: ${contextIndex}`,
      );
    }
    const matchupIndex = Math.floor(contextIndex / input.responses.length);
    const opponentResponseIndex = contextIndex % input.responses.length;
    const matchup = input.matchups[matchupIndex];
    const opponentResponse = input.responses[opponentResponseIndex];
    if (matchup === undefined || opponentResponse === undefined) {
      throw new TacticalAgencyAuditError("empty_work_items", `Incomplete B2 context ${contextIndex}`);
    }

    const candidates = input.responses.map((response) => conditionedCandidateRow({
      ownShape: matchup.ownShape,
      opponentShape: matchup.opponentShape,
      response,
      opponentResponse,
      engineConfig: input.engineConfig,
      matchTacticsCalibration: input.matchTacticsCalibration,
    }));
    const mirroredOwnShape = mirrorTacticalAgencyShape(matchup.ownShape);
    const mirroredOpponentShape = mirrorTacticalAgencyShape(matchup.opponentShape);
    const mirroredOpponentResponse = requiredMirroredResponse(input.responses, opponentResponse);
    let mirrorMismatchCount = 0;
    for (const [candidateIndex, candidate] of candidates.entries()) {
      const response = input.responses[candidateIndex];
      if (response === undefined) {
        mirrorMismatchCount += 1;
        continue;
      }
      const mirrored = conditionedCandidateRow({
        ownShape: mirroredOwnShape,
        opponentShape: mirroredOpponentShape,
        response: requiredMirroredResponse(input.responses, response),
        opponentResponse: mirroredOpponentResponse,
        engineConfig: input.engineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
      });
      if (candidate.payoffBasisPoints !== mirrored.payoffBasisPoints) mirrorMismatchCount += 1;
    }

    return {
      contextIndex,
      contextId: `${matchup.matchupId}|opponent:${opponentResponse.responseId}`,
      matchupId: matchup.matchupId,
      opponentResponseIndex,
      opponentResponseId: opponentResponse.responseId,
      candidates,
      mirrorMismatchCount,
    };
  });
}

function conditionedCandidateRow(input: {
  readonly ownShape: TacticalShapeProfile;
  readonly opponentShape: TacticalShapeProfile;
  readonly response: TacticalAgencyConditionedResponse;
  readonly opponentResponse: TacticalAgencyConditionedResponse;
  readonly engineConfig: MatchEngineConfig;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}): TacticalAgencyConditionedCandidateRow {
  const ownPlan = deriveOpportunityRoutePlan({
    own: input.ownShape,
    opponent: input.opponentShape,
    ownTactics: input.response.tactic,
    opponentTactics: input.opponentResponse.tactic,
    lateralFocus: input.response.lateralFocus,
    opponentLateralFocus: input.opponentResponse.lateralFocus,
    caps: input.engineConfig.tacticalDistributionCaps,
    calibration: input.matchTacticsCalibration,
    goalDifference: 0,
  });
  const opponentPlan = deriveOpportunityRoutePlan({
    own: input.opponentShape,
    opponent: input.ownShape,
    ownTactics: input.opponentResponse.tactic,
    opponentTactics: input.response.tactic,
    lateralFocus: input.opponentResponse.lateralFocus,
    opponentLateralFocus: input.response.lateralFocus,
    caps: input.engineConfig.tacticalDistributionCaps,
    calibration: input.matchTacticsCalibration,
    goalDifference: 0,
  });
  const ownThreat = analyticThreatComponents(ownPlan, opponentPlan);
  const opponentThreat = analyticThreatComponents(opponentPlan, ownPlan);
  return {
    actionId: input.response.responseId,
    planSignature: opportunityRouteStrategicSignature(ownPlan),
    routeBudget: opportunityRouteBudget(ownPlan),
    payoffBasisPoints: analyticPayoffFromThreat(ownThreat.threat, opponentThreat.threat),
    ownThreat,
    opponentThreat,
  };
}

function mirrorTacticalAgencyShape(source: TacticalShapeProfile): TacticalShapeProfile {
  return {
    policyVersion: source.policyVersion,
    capacities: Object.fromEntries(TACTICAL_SHAPE_CAPACITIES.map((capacity) => [
      capacity,
      source.capacities[TACTICAL_SHAPE_CAPACITY_MIRROR[capacity]],
    ])) as TacticalShapeProfile["capacities"],
  };
}

function requiredMirroredResponse(
  responses: readonly TacticalAgencyConditionedResponse[],
  response: TacticalAgencyConditionedResponse,
): TacticalAgencyConditionedResponse {
  const responseId = mirroredResponseId(response);
  const mirrored = responses.find((candidate) => candidate.responseId === responseId);
  if (mirrored === undefined) {
    throw new TacticalAgencyAuditError("missing_telemetry", `B2 has no mirrored response ${responseId}`);
  }
  return mirrored;
}

/** One material cycle that exists wholly inside one real-shape matchup. */
export interface TacticalAgencyConditionedCycle {
  readonly matchupId: string;
  readonly responseIds: readonly [string, string, string];
  readonly arcBasisPoints: readonly [number, number, number];
}

/** Complete Phase-1 B2 evidence. */
export interface TacticalAgencyConditionedAnalysis {
  readonly contractVersion: typeof TACTICAL_AGENCY_B2_ANALYTIC_CONTRACT_VERSION;
  readonly rawResponseCount: number;
  readonly matchupCount: number;
  readonly declaredContextCount: number;
  readonly effectiveSignatureCount: number;
  readonly responseSignatureCount: number;
  readonly responseDiversityShare: number;
  readonly maximumResponseContextCount: number;
  readonly bestResponseUbiquityMultiple: number;
  readonly responseCoverage: readonly TacticalAgencyStructuralResponseCoverage[];
  readonly conservationMismatchCount: number;
  readonly mirrorMismatchCount: number;
  readonly dominantResponseIds: readonly string[];
  readonly strongestStanding: TacticalAgencyStructuralStanding | null;
  readonly materialCycles: readonly TacticalAgencyConditionedCycle[];
  readonly materialArcBasisPoints: number;
  readonly phaseTwoStatus: "required" | "not_run_by_protocol";
  readonly decision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
}

/** Applies B2's frozen relative gates to the complete conditioned population. */
export function summarizeTacticalAgencyConditionedAnalysis(input: {
  readonly responses: readonly TacticalAgencyConditionedResponse[];
  readonly contexts: readonly TacticalAgencyConditionedContextRow[];
}): TacticalAgencyConditionedAnalysis {
  const contexts = [...input.contexts].sort((left, right) => left.contextIndex - right.contextIndex);
  const expectedContextCount = new Set(contexts.map(({ matchupId }) => matchupId)).size
    * input.responses.length;
  if (contexts.length === 0 || contexts.length !== expectedContextCount) {
    throw new TacticalAgencyAuditError(
      "empty_work_items",
      `B2 matrix has ${contexts.length} columns; expected ${expectedContextCount}`,
    );
  }
  for (const [index, context] of contexts.entries()) {
    if (context.contextIndex !== index || context.candidates.length !== input.responses.length) {
      throw new TacticalAgencyAuditError("empty_work_items", `B2 column ${index} is incomplete`);
    }
  }

  const vectors = input.responses.map((response, responseIndex) => ({
    response,
    index: responseIndex,
    values: contexts.map((context) => context.candidates[responseIndex]?.planSignature ?? ""),
  }));
  const groups: {
    representative: TacticalAgencyConditionedResponse;
    indexes: number[];
    values: readonly string[];
  }[] = [];
  for (const vector of vectors) {
    const group = groups.find((candidate) => equalStringVectors(candidate.values, vector.values));
    if (group === undefined) {
      groups.push({ representative: vector.response, indexes: [vector.index], values: vector.values });
    } else {
      group.indexes.push(vector.index);
      if (vector.response.responseId < group.representative.responseId) {
        group.representative = vector.response;
      }
    }
  }
  groups.sort((left, right) =>
    left.representative.responseId.localeCompare(right.representative.responseId));
  const representativeIndexes = groups.map(({ representative }) => {
    const index = input.responses.findIndex(({ responseId }) => responseId === representative.responseId);
    if (index < 0) throw new TacticalAgencyAuditError("missing_telemetry", "B2 lost a response representative");
    return index;
  });

  const bestResponseCounts = new Map<number, number>();
  for (const context of contexts) {
    let bestGroup = 0;
    for (let groupIndex = 1; groupIndex < groups.length; groupIndex += 1) {
      const candidateIndex = representativeIndexes[groupIndex] as number;
      const bestIndex = representativeIndexes[bestGroup] as number;
      const current = context.candidates[candidateIndex]?.payoffBasisPoints ?? 0;
      const best = context.candidates[bestIndex]?.payoffBasisPoints ?? 0;
      if (current > best) bestGroup = groupIndex;
    }
    bestResponseCounts.set(bestGroup, (bestResponseCounts.get(bestGroup) ?? 0) + 1);
  }

  const contextsByMatchup = new Map<string, TacticalAgencyConditionedContextRow[]>();
  for (const context of contexts) {
    const rows = contextsByMatchup.get(context.matchupId) ?? [];
    rows.push(context);
    contextsByMatchup.set(context.matchupId, rows);
  }
  for (const [matchupId, rows] of contextsByMatchup) {
    const opponentIndexes = rows
      .map(({ opponentResponseIndex }) => opponentResponseIndex)
      .sort((left, right) => left - right);
    if (
      rows.length !== input.responses.length
      || opponentIndexes.some((opponentIndex, index) => opponentIndex !== index)
    ) {
      throw new TacticalAgencyAuditError(
        "empty_work_items",
        `B2 matchup ${matchupId} does not contain each opponent response exactly once`,
      );
    }
  }
  const materialCycles = [...contextsByMatchup.entries()].flatMap(([matchupId, rows]) => {
    const cycle = firstConditionedMaterialCycle(
      matchupId,
      groups.map(({ representative }) => representative.responseId),
      representativeIndexes,
      rows,
    );
    return cycle === undefined ? [] : [cycle];
  });
  const dominantResponseIds = groups.flatMap((group, groupIndex) => {
    const candidateIndex = representativeIndexes[groupIndex] as number;
    const dominates = contexts.every((context) => {
      const opponentGroupIndex = groups.findIndex(({ indexes }) =>
        indexes.includes(context.opponentResponseIndex));
      return opponentGroupIndex === groupIndex
        || (context.candidates[candidateIndex]?.payoffBasisPoints ?? 0) > 5_000;
    });
    return dominates ? [group.representative.responseId] : [];
  });
  const standings = groups.map((group, groupIndex): TacticalAgencyStructuralStanding => {
    const candidateIndex = representativeIndexes[groupIndex] as number;
    const values = contexts.flatMap((context) => {
      const opponentGroupIndex = groups.findIndex(({ indexes }) =>
        indexes.includes(context.opponentResponseIndex));
      return opponentGroupIndex === groupIndex
        ? []
        : [context.candidates[candidateIndex]?.payoffBasisPoints ?? 5_000];
    });
    return {
      actionId: group.representative.responseId,
      meanPayoffBasisPoints: values.length === 0
        ? 5_000
        : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
      minimumPayoffBasisPoints: values.length === 0 ? 5_000 : Math.min(...values),
    };
  });
  const strongestStanding = [...standings].sort(
    (left, right) => right.minimumPayoffBasisPoints - left.minimumPayoffBasisPoints
      || right.meanPayoffBasisPoints - left.meanPayoffBasisPoints
      || left.actionId.localeCompare(right.actionId),
  )[0] ?? null;
  const conservationMismatchCount = contexts.reduce((total, context) => {
    const expected = context.candidates[0]?.routeBudget;
    return total + context.candidates.filter(({ routeBudget }) => routeBudget !== expected).length;
  }, 0);
  const mirrorMismatchCount = contexts.reduce(
    (sum, context) => sum + context.mirrorMismatchCount,
    0,
  );
  const effectiveSignatureCount = groups.length;
  const responseSignatureCount = bestResponseCounts.size;
  const maximumResponseContextCount = Math.max(0, ...bestResponseCounts.values());
  const responseDiversityShare = effectiveSignatureCount === 0
    ? 0
    : responseSignatureCount / effectiveSignatureCount;
  const bestResponseUbiquityMultiple = contexts.length === 0 || effectiveSignatureCount === 0
    ? 0
    : (maximumResponseContextCount / contexts.length) / (1 / effectiveSignatureCount);
  const responseCoverage = [...bestResponseCounts.entries()].map(([groupIndex, contextCount]) => ({
    actionId: (groups[groupIndex] as typeof groups[number]).representative.responseId,
    contextCount,
  })).sort((left, right) => right.contextCount - left.contextCount
    || left.actionId.localeCompare(right.actionId));
  const phaseOnePassed = conservationMismatchCount === 0
    && mirrorMismatchCount === 0
    && responseDiversityShare >= 0.25
    && bestResponseUbiquityMultiple <= 4
    && materialCycles.length > 0
    && dominantResponseIds.length === 0;

  return {
    contractVersion: TACTICAL_AGENCY_B2_ANALYTIC_CONTRACT_VERSION,
    rawResponseCount: input.responses.length,
    matchupCount: contextsByMatchup.size,
    declaredContextCount: contexts.length,
    effectiveSignatureCount,
    responseSignatureCount,
    responseDiversityShare,
    maximumResponseContextCount,
    bestResponseUbiquityMultiple,
    responseCoverage,
    conservationMismatchCount,
    mirrorMismatchCount,
    dominantResponseIds,
    strongestStanding,
    materialCycles,
    materialArcBasisPoints: TACTICAL_AGENCY_B_MATERIAL_ARC_BASIS_POINTS,
    phaseTwoStatus: phaseOnePassed ? "required" : "not_run_by_protocol",
    decision: phaseOnePassed
      ? "PASS_PHASE_1"
      : materialCycles.length === 0 || dominantResponseIds.length > 0
        ? "STOP_RETHINK"
        : "REFINE",
  };
}

function firstConditionedMaterialCycle(
  matchupId: string,
  responseIds: readonly string[],
  representativeIndexes: readonly number[],
  rows: readonly TacticalAgencyConditionedContextRow[],
): TacticalAgencyConditionedCycle | undefined {
  const orderedRows = [...rows].sort(
    (left, right) => left.opponentResponseIndex - right.opponentResponseIndex,
  );
  const material = 5_000 + TACTICAL_AGENCY_B_MATERIAL_ARC_BASIS_POINTS;
  for (let first = 0; first < responseIds.length; first += 1) {
    for (let second = 0; second < responseIds.length; second += 1) {
      if (first === second) continue;
      const firstArc = conditionedPayoff(
        orderedRows,
        representativeIndexes[first] as number,
        representativeIndexes[second] as number,
      );
      if (firstArc < material) continue;
      for (let third = 0; third < responseIds.length; third += 1) {
        if (third === first || third === second) continue;
        const secondArc = conditionedPayoff(
          orderedRows,
          representativeIndexes[second] as number,
          representativeIndexes[third] as number,
        );
        const thirdArc = conditionedPayoff(
          orderedRows,
          representativeIndexes[third] as number,
          representativeIndexes[first] as number,
        );
        if (secondArc >= material && thirdArc >= material) {
          return {
            matchupId,
            responseIds: [
              responseIds[first] as string,
              responseIds[second] as string,
              responseIds[third] as string,
            ],
            arcBasisPoints: [firstArc, secondArc, thirdArc],
          };
        }
      }
    }
  }
  return undefined;
}

function conditionedPayoff(
  rows: readonly TacticalAgencyConditionedContextRow[],
  candidateIndex: number,
  opponentResponseIndex: number,
): number {
  return rows.find((row) => row.opponentResponseIndex === opponentResponseIndex)
    ?.candidates[candidateIndex]?.payoffBasisPoints ?? 0;
}

function mirroredResponseId(response: TacticalAgencyConditionedResponse): string {
  const focus = response.lateralFocus === "left"
    ? "right"
    : response.lateralFocus === "right"
      ? "left"
      : "balanced";
  return `${response.tacticKey}|${focus}`;
}

/** One candidate response measured analytically against one opponent action. */
export interface TacticalAgencyStructuralCandidateRow {
  readonly actionId: string;
  readonly planSignature: string;
  readonly routeBudget: number;
  readonly payoffBasisPoints: number;
}

/** One opponent column of the complete analytic matrix. */
export interface TacticalAgencyStructuralContextRow {
  readonly opponentIndex: number;
  readonly opponentActionId: string;
  readonly candidates: readonly TacticalAgencyStructuralCandidateRow[];
}

/** Runs independent opponent columns; callers may shard the index list. */
export function runTacticalAgencyStructuralAnalyticPartition(input: {
  readonly actions: readonly TacticalAgencyStructuralAction[];
  readonly opponentIndexes: readonly number[];
  readonly engineConfig: MatchEngineConfig;
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
}): readonly TacticalAgencyStructuralContextRow[] {
  return input.opponentIndexes.map((opponentIndex) => {
    const opponent = input.actions[opponentIndex];
    if (opponent === undefined) {
      throw new TacticalAgencyAuditError(
        "empty_work_items",
        `Analytic opponent index is outside the action space: ${opponentIndex}`,
      );
    }

    const candidates = input.actions.map((candidate): TacticalAgencyStructuralCandidateRow => {
      const ownPlan = deriveOpportunityRoutePlan({
        own: candidate.shape,
        opponent: opponent.shape,
        ownTactics: candidate.tactic,
        opponentTactics: opponent.tactic,
        lateralFocus: candidate.lateralFocus,
        opponentLateralFocus: opponent.lateralFocus,
        caps: input.engineConfig.tacticalDistributionCaps,
        calibration: input.matchTacticsCalibration,
        goalDifference: 0,
      });
      const opponentPlan = deriveOpportunityRoutePlan({
        own: opponent.shape,
        opponent: candidate.shape,
        ownTactics: opponent.tactic,
        opponentTactics: candidate.tactic,
        lateralFocus: opponent.lateralFocus,
        opponentLateralFocus: candidate.lateralFocus,
        caps: input.engineConfig.tacticalDistributionCaps,
        calibration: input.matchTacticsCalibration,
        goalDifference: 0,
      });

      return {
        actionId: candidate.actionId,
        planSignature: opportunityRouteStrategicSignature(ownPlan),
        routeBudget: opportunityRouteBudget(ownPlan),
        payoffBasisPoints: analyticPayoffBasisPoints(ownPlan, opponentPlan),
      };
    });

    return { opponentIndex, opponentActionId: opponent.actionId, candidates };
  });
}

function analyticPayoffBasisPoints(
  ownPlan: ReturnType<typeof deriveOpportunityRoutePlan>,
  opponentPlan: ReturnType<typeof deriveOpportunityRoutePlan>,
): number {
  const ownThreat = analyticThreatComponents(ownPlan, opponentPlan).threat;
  const opponentThreat = analyticThreatComponents(opponentPlan, ownPlan).threat;
  return analyticPayoffFromThreat(ownThreat, opponentThreat);
}

function analyticPayoffFromThreat(ownThreat: number, opponentThreat: number): number {
  const total = ownThreat + opponentThreat;
  return Math.round((total === 0 ? 0.5 : ownThreat / total) * 10_000);
}

/** Outcome-blind threat implied by facts the minute loop already consumes. */
function analyticThreatComponents(
  plan: ReturnType<typeof deriveOpportunityRoutePlan>,
  opponentPlan: ReturnType<typeof deriveOpportunityRoutePlan>,
): TacticalAgencyAnalyticThreatComponents {
  const controlTotal = plan.controlMultiplier + opponentPlan.controlMultiplier;
  const possessionClaim = controlTotal === 0 ? 0.5 : plan.controlMultiplier / controlTotal;
  const effectiveControl = possessionClaim
    + (1 - possessionClaim) * plan.counterOpportunityRelief;
  const weights = opportunityRouteWeights(plan);
  let expectedQuality = 0;
  for (const route of TACTICAL_ROUTES) {
    expectedQuality += weights[route] * clampShare(0.5 + opportunityRouteQualityEdge(plan, route));
  }

  const routeSaturation = expectedRouteSaturation(plan);
  const threat = Math.max(
    0,
    plan.volumeMultiplier
      * effectiveControl
      * routeSaturation
      * expectedQuality,
  );
  return {
    volumeMultiplier: plan.volumeMultiplier,
    effectiveControl,
    routeSaturation,
    expectedRouteQuality: expectedQuality,
    leftAllocation: weights.left,
    rightAllocation: weights.right,
    threat,
  };
}

function clampShare(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** One material three-cycle, reported by canonical action ID. */
export interface TacticalAgencyStructuralCycle {
  readonly tacticKey: TacticalAgencyBTacticKey;
  readonly actionIds: readonly [string, string, string];
  readonly arcBasisPoints: readonly [number, number, number];
}

/** How many uniform opponent signatures choose one canonical response. */
export interface TacticalAgencyStructuralResponseCoverage {
  readonly actionId: string;
  readonly contextCount: number;
}

/** Complete-field standing of one effective action under the analytic score. */
export interface TacticalAgencyStructuralStanding {
  readonly actionId: string;
  readonly meanPayoffBasisPoints: number;
  readonly minimumPayoffBasisPoints: number;
}

/** Complete Phase-1 evidence and its protocol decision. */
export interface TacticalAgencyStructuralAnalysis {
  readonly contractVersion: typeof TACTICAL_AGENCY_B_ANALYTIC_CONTRACT_VERSION;
  readonly rawActionCount: number;
  readonly effectiveSignatureCount: number;
  readonly responseSignatureCount: number;
  readonly responseDiversityShare: number;
  readonly maximumResponseContextCount: number;
  readonly bestResponseUbiquityMultiple: number;
  readonly responseCoverage: readonly TacticalAgencyStructuralResponseCoverage[];
  readonly conservationMismatchCount: number;
  readonly dominantActionIds: readonly string[];
  readonly strongestStanding: TacticalAgencyStructuralStanding | null;
  readonly materialCycles: readonly TacticalAgencyStructuralCycle[];
  readonly materialArcBasisPoints: number;
  readonly phaseTwoStatus: "required" | "not_run_by_protocol";
  readonly decision: "PASS_PHASE_1" | "REFINE" | "STOP_RETHINK";
}

/** Merges all analytic columns and applies the frozen complete-space gates. */
export function summarizeTacticalAgencyStructuralAnalysis(input: {
  readonly actions: readonly TacticalAgencyStructuralAction[];
  readonly contexts: readonly TacticalAgencyStructuralContextRow[];
}): TacticalAgencyStructuralAnalysis {
  const contexts = [...input.contexts].sort((left, right) => left.opponentIndex - right.opponentIndex);
  if (contexts.length !== input.actions.length) {
    throw new TacticalAgencyAuditError(
      "empty_work_items",
      `Analytic matrix has ${contexts.length} columns for ${input.actions.length} actions`,
    );
  }
  for (const [index, context] of contexts.entries()) {
    if (context.opponentIndex !== index || context.candidates.length !== input.actions.length) {
      throw new TacticalAgencyAuditError(
        "empty_work_items",
        `Analytic column ${index} is incomplete or out of order`,
      );
    }
  }

  const signatureVectors = input.actions.map((action, actionIndex) => ({
    action,
    values: contexts.map((context) => context.candidates[actionIndex]?.planSignature ?? ""),
  }));
  const groups: { representative: TacticalAgencyStructuralAction; indexes: number[]; values: readonly string[] }[] = [];
  for (const [actionIndex, vector] of signatureVectors.entries()) {
    const group = groups.find((candidate) => equalStringVectors(candidate.values, vector.values));
    if (group === undefined) {
      groups.push({ representative: vector.action, indexes: [actionIndex], values: vector.values });
    } else {
      group.indexes.push(actionIndex);
      if (vector.action.actionId < group.representative.actionId) group.representative = vector.action;
    }
  }
  groups.sort((left, right) => left.representative.actionId.localeCompare(right.representative.actionId));

  const representativeIndexes = groups.map((group) => input.actions.findIndex(
    (action) => action.actionId === group.representative.actionId,
  ));
  const payoff = representativeIndexes.map((candidateIndex) =>
    representativeIndexes.map((contextIndex) =>
      contexts[contextIndex]?.candidates[candidateIndex]?.payoffBasisPoints ?? 5_000));

  const bestResponseCounts = new Map<number, number>();
  for (const column of payoff[0]?.map((_, index) => index) ?? []) {
    let bestRow = 0;
    for (let row = 1; row < payoff.length; row += 1) {
      const current = payoff[row]?.[column] ?? 0;
      const best = payoff[bestRow]?.[column] ?? 0;
      if (current > best) bestRow = row;
    }
    bestResponseCounts.set(bestRow, (bestResponseCounts.get(bestRow) ?? 0) + 1);
  }

  const materialCycles = TACTICAL_AGENCY_B_TACTIC_KEYS.flatMap((tacticKey) => {
    const cycle = firstMaterialCycle(groups.map((group) => group.representative), payoff, tacticKey);
    return cycle === undefined ? [] : [cycle];
  });
  const dominantActionIds = groups.flatMap((group, row) => {
    const dominates = groups.every((_, column) =>
      row === column || (payoff[row]?.[column] ?? 0) > 5_000);
    return dominates ? [group.representative.actionId] : [];
  });
  const standings = groups.map((group, row): TacticalAgencyStructuralStanding => {
    const against = (payoff[row] ?? []).filter((_, column) => column !== row);
    return {
      actionId: group.representative.actionId,
      meanPayoffBasisPoints: against.length === 0
        ? 5_000
        : Math.round(against.reduce((sum, value) => sum + value, 0) / against.length),
      minimumPayoffBasisPoints: against.length === 0 ? 5_000 : Math.min(...against),
    };
  });
  const strongestStanding = [...standings].sort(
    (left, right) => right.minimumPayoffBasisPoints - left.minimumPayoffBasisPoints
      || right.meanPayoffBasisPoints - left.meanPayoffBasisPoints
      || left.actionId.localeCompare(right.actionId),
  )[0] ?? null;
  const conservationMismatchCount = conservationMismatches(input.actions, contexts);
  const effectiveSignatureCount = groups.length;
  const responseSignatureCount = bestResponseCounts.size;
  const maximumResponseContextCount = Math.max(0, ...bestResponseCounts.values());
  const responseCoverage = [...bestResponseCounts.entries()]
    .map(([row, contextCount]) => ({
      actionId: (groups[row] as typeof groups[number]).representative.actionId,
      contextCount,
    }))
    .sort((left, right) => right.contextCount - left.contextCount
      || left.actionId.localeCompare(right.actionId));
  const responseDiversityShare = effectiveSignatureCount === 0
    ? 0
    : responseSignatureCount / effectiveSignatureCount;
  const phaseOnePassed = conservationMismatchCount === 0
    && responseDiversityShare >= 0.25
    && maximumResponseContextCount <= 4
    && materialCycles.length === TACTICAL_AGENCY_B_TACTIC_KEYS.length
    && dominantActionIds.length === 0;
  const hasAnyMaterialCycle = materialCycles.length > 0;

  return {
    contractVersion: TACTICAL_AGENCY_B_ANALYTIC_CONTRACT_VERSION,
    rawActionCount: input.actions.length,
    effectiveSignatureCount,
    responseSignatureCount,
    responseDiversityShare,
    maximumResponseContextCount,
    bestResponseUbiquityMultiple: maximumResponseContextCount,
    responseCoverage,
    conservationMismatchCount,
    dominantActionIds,
    strongestStanding,
    materialCycles,
    materialArcBasisPoints: TACTICAL_AGENCY_B_MATERIAL_ARC_BASIS_POINTS,
    phaseTwoStatus: phaseOnePassed ? "required" : "not_run_by_protocol",
    decision: phaseOnePassed ? "PASS_PHASE_1" : hasAnyMaterialCycle ? "REFINE" : "STOP_RETHINK",
  };
}

function equalStringVectors(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function firstMaterialCycle(
  actions: readonly TacticalAgencyStructuralAction[],
  payoff: readonly (readonly number[])[],
  tacticKey: TacticalAgencyBTacticKey,
): TacticalAgencyStructuralCycle | undefined {
  const indexes = actions.flatMap((action, index) => action.tacticKey === tacticKey ? [index] : []);
  const material = 5_000 + TACTICAL_AGENCY_B_MATERIAL_ARC_BASIS_POINTS;
  for (const first of indexes) {
    for (const second of indexes) {
      if (first === second || (payoff[first]?.[second] ?? 0) < material) continue;
      for (const third of indexes) {
        if (
          third === first
          || third === second
          || (payoff[second]?.[third] ?? 0) < material
          || (payoff[third]?.[first] ?? 0) < material
        ) continue;
        return {
          tacticKey,
          actionIds: [
            (actions[first] as TacticalAgencyStructuralAction).actionId,
            (actions[second] as TacticalAgencyStructuralAction).actionId,
            (actions[third] as TacticalAgencyStructuralAction).actionId,
          ],
          arcBasisPoints: [
            payoff[first]?.[second] ?? 0,
            payoff[second]?.[third] ?? 0,
            payoff[third]?.[first] ?? 0,
          ],
        };
      }
    }
  }
  return undefined;
}

function conservationMismatches(
  actions: readonly TacticalAgencyStructuralAction[],
  contexts: readonly TacticalAgencyStructuralContextRow[],
): number {
  let mismatches = 0;
  for (const context of contexts) {
    for (const formationKey of FORMATION_KEYS) {
      const indexes = actions.flatMap((action, index) => action.formationKey === formationKey ? [index] : []);
      const expected = context.candidates[indexes[0] as number]?.routeBudget;
      for (const index of indexes) {
        if (context.candidates[index]?.routeBudget !== expected) mismatches += 1;
      }
    }
  }
  return mismatches;
}

/**
 * The worker count every Phase 81A checkpoint command must run with.
 *
 * Declared here rather than in the command so the audit and its callers cannot
 * disagree about what a checkpoint is. The repository worker budget is still
 * `simulation-execution-policy.ts`'s; this is the narrower rule that a
 * checkpoint may not silently fall below it either.
 */
export const TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT = 7;

/**
 * Reports whether a worker count is legal for a checkpoint run.
 *
 * A checkpoint that quietly ran on one worker produces the same numbers and a
 * different wall clock, and wall clock is what the next checkpoint is budgeted
 * from - so the count is pinned rather than capped.
 */
export function isValidTacticalAgencyCheckpointWorkerCount(workerCount: number): boolean {
  return workerCount === TACTICAL_AGENCY_CHECKPOINT_WORKER_COUNT;
}

/**
 * The pre-Phase-81A `controlWeight(...)` tactical term, character for character.
 *
 * **This is an analysis oracle and nothing else.** It exists so Checkpoint A can
 * prove that moving the four possession-control coefficients into the versioned
 * asset changed no match, and it is deliberately the only place the old literals
 * survive. It must never gain a production caller, a feature flag, or a
 * selectable path in the engine; its removal owner is the Phase 81A closeout
 * report, which deletes it once Checkpoint F has recorded the proof.
 *
 * Three properties are load-bearing and none may be "tidied":
 *
 * 1. the literals `0.12 / 0.04 / 0.03 / -0.08` are written out, not read from
 *    the asset - an oracle that read the new asset would prove nothing;
 * 2. the term order is the original `pressing, risk, width, directness`;
 * 3. the final term is a subtraction, as it was.
 *
 * Every argument is a knob intensity in `0..1`, which is what
 * `normalizedTactic(...)` produces.
 */
export function legacyPhase81ControlWeightReference(intensity: {
  readonly directness: number;
  readonly pressing: number;
  readonly width: number;
  readonly risk: number;
}): number {
  return (
    1
    + intensity.pressing * 0.12
    + intensity.risk * 0.04
    + intensity.width * 0.03
    - intensity.directness * 0.08
  );
}

/** One exhaustive ownership-replay sweep over the reachable knob space. */
export interface TacticalAgencyOwnershipReplayResult {
  /** Grid steps per knob. The sweep visits `(steps + 1) ^ 4` points. */
  readonly gridSteps: number;
  /** Points compared. Every one is a reachable intensity combination. */
  readonly comparedPoints: number;
  /** Points where the two doubles differ at all. `0` is the only pass. */
  readonly differingPoints: number;
  /** Largest absolute difference seen, in units of the control term. */
  readonly maximumAbsoluteDifference: number;
}

/**
 * Proves the migrated control magnitudes reproduce the old arithmetic exactly.
 *
 * The intended ownership replay - play the same matches before and after Step 01
 * and compare - is not available: `controlWeight(...)` has no injection point,
 * so running the old arm would need either a legacy switch inside the production
 * engine or a second copy of the minute loop. Both are refused. This is the
 * declared fallback, and it is stronger than a sampled replay for the thing it
 * covers: the control term is a pure function of four bounded intensities, so
 * sweeping that space densely is closer to a proof than any number of matches.
 *
 * What it does **not** cover is everything downstream of the term, which is why
 * Checkpoint A pairs it with a golden hash of seeded matches.
 *
 * `normalizedTactic(...)` clamps to `0..1`, so the grid is the whole reachable
 * space rather than a sample of it.
 */
export function runTacticalAgencyOwnershipReplay(input: {
  readonly gridSteps: number;
  readonly controlBasisPointsByKnob: Readonly<Record<"directness" | "pressing" | "width" | "risk", number>>;
  readonly controlDirectionByKnob: Readonly<
    Record<"directness" | "pressing" | "width" | "risk", "increase" | "decrease">
  >;
}): TacticalAgencyOwnershipReplayResult {
  if (!Number.isSafeInteger(input.gridSteps) || input.gridSteps <= 0) {
    throw new TacticalAgencyAuditError(
      "empty_work_items",
      `An ownership replay needs a positive grid step count: ${input.gridSteps}`,
    );
  }

  const signed = {} as Record<"directness" | "pressing" | "width" | "risk", number>;
  for (const knob of ["directness", "pressing", "width", "risk"] as const) {
    const share = input.controlBasisPointsByKnob[knob] / 10_000;
    signed[knob] = input.controlDirectionByKnob[knob] === "increase" ? share : -share;
  }

  const steps = input.gridSteps;
  let comparedPoints = 0;
  let differingPoints = 0;
  let maximumAbsoluteDifference = 0;

  for (let a = 0; a <= steps; a += 1) {
    for (let b = 0; b <= steps; b += 1) {
      for (let c = 0; c <= steps; c += 1) {
        for (let d = 0; d <= steps; d += 1) {
          const intensity = {
            directness: a / steps,
            pressing: b / steps,
            width: c / steps,
            risk: d / steps,
          };
          // The production order, which `controlWeight(...)` writes out for
          // exactly this reason: float addition is not associative.
          const current =
            1
            + intensity.pressing * signed.pressing
            + intensity.risk * signed.risk
            + intensity.width * signed.width
            + intensity.directness * signed.directness;
          const legacy = legacyPhase81ControlWeightReference(intensity);

          comparedPoints += 1;
          if (current !== legacy) {
            differingPoints += 1;
            maximumAbsoluteDifference = Math.max(
              maximumAbsoluteDifference,
              Math.abs(current - legacy),
            );
          }
        }
      }
    }
  }

  return { gridSteps: steps, comparedPoints, differingPoints, maximumAbsoluteDifference };
}
