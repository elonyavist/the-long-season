import {
  PLAYER_ROLES,
  evaluatePositionSuitability,
  type CareerState,
  type ClubId,
  type Fixture,
  type FixtureId,
  type MatchTacticsCalibrationConfig,
  type PlayerId,
  type PlayerRole,
  type PositionSuitability,
} from "@game/domain";
import {
  selectCareerAiTeam,
  simulateMatch,
  type CareerAiTeamSelectionPolicy,
  type MatchContext,
  type MatchEngineConfig,
  type MatchTacticalDistributionInput,
  type MatchTeamContext,
  type PlayerValuationConfig,
} from "@game/engine";

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
  const rows = input.workItems.map((workItem) => observeSelection(input, workItem));

  return { rows, elapsedMilliseconds: now() - startedAt };
}

/** Observes one club's selection for one fixture through the production path. */
function observeSelection(
  input: TacticalAgencySelectionSeriesInput,
  workItem: TacticalAgencySelectionWorkItem,
): TacticalAgencySelectionRow {
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
    clubId: workItem.clubId,
    fixtureId: workItem.fixture.id,
    formationKey: formationKeyOf(selection.teamContext),
    fillableShapeCount: choice.fillableShapeCount,
    bestStructuralScore: choice.bestStructuralScore,
    ...(choice.secondStructuralScore === undefined
      ? {}
      : { secondStructuralScore: choice.secondStructuralScore }),
    tiedAtBestCount: choice.tiedAtBestCount,
    outOfPositionSlotCount: outOfPositionSlotCount(input.careerState, selection.teamContext),
    tactic: { ...selection.teamContext.tacticalDistribution },
    ...(workItem.squadIdentityKey === undefined
      ? {}
      : { squadIdentityKey: workItem.squadIdentityKey }),
  };
}

/** Reads the catalog key back off the slot IDs the selector stamped. */
function formationKeyOf(teamContext: MatchTeamContext): string {
  const firstSlot = teamContext.lineup[0];
  if (firstSlot === undefined) return "";

  const separatorIndex = firstSlot.slotId.indexOf(":");

  return separatorIndex === -1 ? firstSlot.slotId : firstSlot.slotId.slice(0, separatorIndex);
}

/** Counts lineup slots the domain calls `weak` or `invalid` for their occupant. */
function outOfPositionSlotCount(careerState: CareerState, teamContext: MatchTeamContext): number {
  let count = 0;

  for (const slot of teamContext.lineup) {
    const player = careerState.gameState.players[slot.playerId];
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
