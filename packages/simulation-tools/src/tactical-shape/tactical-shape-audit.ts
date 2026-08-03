import {
  abilityValue,
  clubId,
  fixtureId,
  FORMATION_CATALOG,
  FORMATIONS,
  gameDate,
  playerId,
  type ClubId,
  type CanonicalPlayerRole,
  type FormationDepartment,
  type FormationKey,
  type FormationSide,
  type MatchTacticsCalibrationConfig,
  type Player,
  type TacticMentalityKey,
  type PlayerAbilities,
  type PlayerId,
  type ShotChanceType,
  NEUTRAL_TACTIC_MENTALITY,
} from "@game/domain";
import {
  createLineupSlot,
  createMatchPlayerIncidentProfile,
  deriveTeamShapeAndStrength,
  simulateMatch,
  type MatchContext,
  type MatchEngineConfig,
  type MatchTeamContext,
  type RoleWeightProfile,
  type TeamStrength,
} from "@game/engine";
import { hashStringToSeedWords } from "@game/shared";

/**
 * Deterministic tactical-shape baseline audit for Phase 81 Step 01.
 *
 * The audit measures what the current match engine does with the *shape* a
 * manager selects, while holding player quality, tactics, venue, and seeds
 * fixed. It changes no gameplay: every number below comes from the production
 * `deriveTeamShapeAndStrength` and `simulateMatch` paths.
 *
 * Two facts decide the whole design:
 *
 * - The engine never sees a formation name. `deriveTeamStrength` reads the role
 *   key of each lineup slot and averages inside a department, so the only shape
 *   input that reaches it is how many outfield slots sit in each department.
 * - A manager is not limited to the `23` named presets. On the tactical board
 *   only the goalkeeper slot is locked, every other slot can be dragged into any
 *   outfield role zone, and no validator caps how many slots share a department.
 *
 * The reachable population is therefore every `(defenders, midfielders,
 * attackers)` triple summing to the ten outfield slots - exactly `66`
 * compositions - and no member of it is exempt from the dominance gate.
 */

/** Contract version recorded in the report so later steps cannot silently reuse it. */
export const TACTICAL_SHAPE_AUDIT_CONTRACT_VERSION = "phase81-step01-v1";

/** Outfield slots a manager may compose freely. The goalkeeper slot is locked. */
export const TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT = 10;

/** Total lineup size the audit builds, matching the competition rules in play. */
export const TACTICAL_SHAPE_LINEUP_SLOT_COUNT = TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT + 1;

/**
 * How many outfield slots a manager placed in each department.
 *
 * This is the complete shape input the current engine can observe, which is why
 * it - and not the formation name - is the population the dominance gate runs
 * over.
 */
export interface TacticalShapeComposition {
  /** Slots whose role contributes to the defensive department. */
  readonly defenders: number;
  /** Slots whose role contributes to the midfield department. */
  readonly midfielders: number;
  /** Slots whose role contributes to the attacking department. */
  readonly attackers: number;
}

/** Stable `defenders-midfielders-attackers` key, for example `4-4-2`. */
export type TacticalShapeCompositionKey = string;

/** Builds the stable key for one composition. */
export function tacticalShapeCompositionKey(composition: TacticalShapeComposition): TacticalShapeCompositionKey {
  return `${composition.defenders}-${composition.midfielders}-${composition.attackers}`;
}

/**
 * Every department composition a manager can actually reach.
 *
 * Ordered defenders-descending then midfielders-descending so the frozen matrix
 * has one stable row order across runs and machines.
 */
export const TACTICAL_SHAPE_COMPOSITIONS: readonly TacticalShapeComposition[] = buildCompositions();

/** Named extreme shapes carried in from the Phase 81 contract, for report labelling. */
export const TACTICAL_SHAPE_EXTREME_COMPOSITION_KEYS: readonly TacticalShapeCompositionKey[] = [
  "3-1-6",
  "2-0-8",
  "8-0-2",
  "0-0-10",
  "10-0-0",
];

/** The coherent ordinary shape used as the baseline in every comparison. */
export const TACTICAL_SHAPE_REFERENCE_COMPOSITION_KEY: TacticalShapeCompositionKey = "4-4-2";

/** The balanced formation every other formation is compared against. */
export const TACTICAL_SHAPE_REFERENCE_FORMATION_KEY: FormationKey = "4-4-2";

/**
 * Curated formations measured against the reference formation.
 *
 * Not the whole catalog: every entry is here because it isolates one axis the
 * department population cannot express. `4-3-2-1` is narrow, `4-2-4` and
 * `3-4-3` are wide and forward, `4-5-1` and `5-4-1` are deep with a lone
 * striker, `4-3-3` and `3-5-2` are the ordinary alternatives to the reference.
 * Measuring all `23` would triple the run without adding an axis.
 */
export const TACTICAL_SHAPE_MEASURED_FORMATION_KEYS: readonly FormationKey[] = [
  "4-4-2",
  "4-3-3",
  "3-5-2",
  "4-3-2-1",
  "4-2-4",
  "3-4-3",
  "4-5-1",
  "5-4-1",
];

/**
 * Measured per-department slot quality for one squad population.
 *
 * A band is a measurement, not a constant: the CLI adapter derives it from the
 * generated world so the audit stays free of content. Every slot in a
 * department is given this exact quality, which makes shape the only variable
 * left between two sides of the same band.
 */
export interface TacticalShapeQualityBand {
  /** Stable machine key, for example `first_division_contender`. */
  readonly bandKey: string;
  /** Goalkeeper slot quality on the `0..20` ability scale. */
  readonly goalkeeper: number;
  /** Defensive slot quality on the `0..20` ability scale. */
  readonly defense: number;
  /** Midfield slot quality on the `0..20` ability scale. */
  readonly midfield: number;
  /** Attacking slot quality on the `0..20` ability scale. */
  readonly attack: number;
}

/** One bounded tactic setting shared by both sides of a scenario. */
export interface TacticalShapeTacticProfile {
  /** Stable machine key, for example `neutral`. */
  readonly tacticKey: string;
  /** Directness knob, inside the engine config caps. */
  readonly directness: number;
  /** Pressing knob, inside the engine config caps. */
  readonly pressing: number;
  /** Width knob, inside the engine config caps. */
  readonly width: number;
  /** Risk knob, inside the engine config caps. */
  readonly risk: number;
  /**
   * Commitment ladder step shared by both sides of a scenario.
   *
   * Every frozen scenario holds it at the neutral step. The audit isolates
   * shape from tactics, and a scenario whose two sides committed differently
   * would be measuring commitment instead.
   */
  readonly mentality: TacticMentalityKey;
}

/** The neutral tactic used wherever a scenario isolates shape from tactics. */
export const TACTICAL_SHAPE_NEUTRAL_TACTIC: TacticalShapeTacticProfile = {
  tacticKey: "neutral",
  directness: 0.5,
  pressing: 0.5,
  width: 0.5,
  risk: 0.5,
  mentality: NEUTRAL_TACTIC_MENTALITY,
};

/**
 * How a side's eleven slots are described.
 *
 * Two populations answer two different questions and neither can answer the
 * other's. A **department composition** is the reachable space of the tactical
 * board - all `66` of it - built from centre backs, central midfielders and
 * strikers with no flank, which is what isolates "how many slots sit in a
 * department". A **formation** is what a manager actually picks, and it is the
 * only population where a full back is a full back and a winger occupies a
 * wing, so it is the only one that can say whether choosing `4-3-2-1` over
 * `4-4-2` changes anything.
 */
export type TacticalShapeSideLineup =
  | {
      /** Discriminates the department-composition population. */
      readonly kind: "composition";
      /** Department composition of the ten outfield slots. */
      readonly composition: TacticalShapeComposition;
    }
  | {
      /** Discriminates the real-formation population. */
      readonly kind: "formation";
      /** Curated formation whose slots carry the flank they occupy. */
      readonly formationKey: FormationKey;
    };

/** One complete side of a scenario: what shape, at what quality, with what tactic. */
export interface TacticalShapeSide {
  /** How this side's eleven slots are described. */
  readonly lineup: TacticalShapeSideLineup;
  /** Measured squad quality applied to every slot. */
  readonly band: TacticalShapeQualityBand;
  /** Bounded tactic settings. */
  readonly tactic: TacticalShapeTacticProfile;
}

/** Stable text identity of one side's lineup, for seeds, labels and reports. */
export function tacticalShapeLineupKey(lineup: TacticalShapeSideLineup): string {
  return lineup.kind === "composition"
    ? tacticalShapeCompositionKey(lineup.composition)
    : lineup.formationKey;
}

/** Cumulative attacking output for one side across a paired-seed series. */
export interface TacticalShapeSeriesSideTotals {
  /** Goals scored across the series. */
  readonly goals: number;
  /** Opportunities generated across the series. */
  readonly opportunities: number;
  /** Shots taken across the series. */
  readonly shots: number;
  /** Shots on target across the series. */
  readonly shotsOnTarget: number;
  /** Summed conversion probability across the series. */
  readonly expectedGoals: number;
  /** Mean possession share across the series, in the `0..1` range. */
  readonly possessionShare: number;
  /**
   * How many chances of each structured type the side produced.
   *
   * Today this is derived from a deterministic texture rather than from an
   * actual route, so it is recorded as the thing Step 06 replaces.
   */
  readonly chanceTypes: Readonly<Record<ShotChanceType, number>>;
}

/**
 * Outcome of one paired-seed series between two sides.
 *
 * Every seed is played twice with the venues swapped, so home advantage cancels
 * and any remaining edge belongs to the sides themselves.
 */
export interface TacticalShapeSeriesResult {
  /** Matches actually completed. This is the denominator; it is never zero. */
  readonly matches: number;
  /** Matches won by the first side. */
  readonly firstWins: number;
  /** Drawn matches. */
  readonly draws: number;
  /** Matches won by the second side. */
  readonly secondWins: number;
  /** `(firstWins + draws / 2) / matches`. */
  readonly firstWinShare: number;
  /** Attacking totals for the first side. */
  readonly first: TacticalShapeSeriesSideTotals;
  /** Attacking totals for the second side. */
  readonly second: TacticalShapeSeriesSideTotals;
}

/** Input for one paired-seed series. */
export interface RunTacticalShapeSeriesInput {
  /** First side; win share is reported from its point of view. */
  readonly first: TacticalShapeSide;
  /** Second side. */
  readonly second: TacticalShapeSide;
  /** Production match engine configuration supplied by the caller. */
  readonly engineConfig: MatchEngineConfig;
  /** Production match-tactics calibration supplied by the caller. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Stable seed prefix; the series derives one seed per paired fixture. */
  readonly seedPrefix: string;
  /** Number of seed pairs. Each pair plays two matches with swapped venues. */
  readonly pairedSeedCount: number;
  /**
   * Replaces the composition-derived scenario identity with a fixed one.
   *
   * Seeds and fixture IDs normally include both compositions so that unrelated
   * series never share an RNG stream. An equivalence check needs the opposite:
   * two different compositions must run on the *same* stream, so that any
   * difference in results comes from the shape rather than from the seed.
   */
  readonly scenarioKeyOverride?: string;
}

/**
 * Runs one deterministic paired-seed series between two sides.
 *
 * @example
 * const series = runTacticalShapeSeries({
 *   first: { composition, band, tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC },
 *   second: { lineup: { kind: "composition", composition: other }, band, tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC },
 *   engineConfig,
 *   seedPrefix: "phase81-baseline",
 *   pairedSeedCount: 8,
 * });
 */
export function runTacticalShapeSeries(input: RunTacticalShapeSeriesInput): TacticalShapeSeriesResult {
  assertPositiveSafeInteger(input.pairedSeedCount, "pairedSeedCount");
  assertNonEmpty(input.seedPrefix, "seedPrefix");

  const totals = createMutableSeriesTotals();

  for (let pairIndex = 0; pairIndex < input.pairedSeedCount; pairIndex += 1) {
    for (const firstIsHome of [true, false]) {
      const home = firstIsHome ? input.first : input.second;
      const away = firstIsHome ? input.second : input.first;
      const venueKey = firstIsHome ? "a" : "b";
      const identity = input.scenarioKeyOverride ?? [
        tacticalShapeLineupKey(input.first.lineup),
        input.first.band.bandKey,
        tacticalShapeLineupKey(input.second.lineup),
        input.second.band.bandKey,
      ].join("|");
      const scenarioKey = `${identity}|${pairIndex}|${venueKey}`;

      const result = simulateMatch(
        buildTacticalShapeMatchContext({
          home,
          away,
          engineConfig: input.engineConfig,
          matchTacticsCalibration: input.matchTacticsCalibration,
          seed: `${input.seedPrefix}|${scenarioKey}`,
          scenarioKey,
        }),
      );

      const telemetry = result.stats.telemetry;
      if (telemetry === undefined) {
        throw new TacticalShapeAuditError(
          "missing_telemetry",
          `Match ${scenarioKey} completed without causal telemetry`,
        );
      }

      const homeGoals = result.score.home;
      const awayGoals = result.score.away;
      const firstGoals = firstIsHome ? homeGoals : awayGoals;
      const secondGoals = firstIsHome ? awayGoals : homeGoals;

      totals.matches += 1;
      if (firstGoals > secondGoals) totals.firstWins += 1;
      else if (firstGoals < secondGoals) totals.secondWins += 1;
      else totals.draws += 1;

      const controlTotal = telemetry.controlUnits.home + telemetry.controlUnits.away;
      const homePossession = controlTotal === 0 ? 0.5 : telemetry.controlUnits.home / controlTotal;
      accumulateSide(totals.first, result, telemetry, firstIsHome ? "home" : "away", firstIsHome ? homePossession : 1 - homePossession);
      accumulateSide(totals.second, result, telemetry, firstIsHome ? "away" : "home", firstIsHome ? 1 - homePossession : homePossession);
    }
  }

  return {
    matches: totals.matches,
    firstWins: totals.firstWins,
    draws: totals.draws,
    secondWins: totals.secondWins,
    firstWinShare: roundFour((totals.firstWins + totals.draws / 2) / totals.matches),
    first: finalizeSideTotals(totals.first, totals.matches),
    second: finalizeSideTotals(totals.second, totals.matches),
  };
}

/** Input for one diagnostic match context. */
export interface BuildTacticalShapeMatchContextInput {
  /** Home side. */
  readonly home: TacticalShapeSide;
  /** Away side. */
  readonly away: TacticalShapeSide;
  /** Production match engine configuration supplied by the caller. */
  readonly engineConfig: MatchEngineConfig;
  /** Production match-tactics calibration supplied by the caller. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Run seed for the match RNG stream. */
  readonly seed: string;
  /** Stable scenario key used to build the fixture identity. */
  readonly scenarioKey: string;
}

/**
 * Builds one production `MatchContext` for a shape-versus-shape scenario.
 *
 * Both sides are composed of synthetic players whose every ability equals their
 * department's measured quality. That is what makes the comparison honest: two
 * sides of the same band differ only in how their slots are distributed.
 */
export function buildTacticalShapeMatchContext(input: BuildTacticalShapeMatchContextInput): MatchContext {
  return {
    fixtureId: fixtureId(`fixture:tactical-shape:${stableToken(input.scenarioKey)}`),
    seed: input.seed,
    home: buildTacticalShapeTeamContext(input.home, "home", input.matchTacticsCalibration),
    away: buildTacticalShapeTeamContext(input.away, "away", input.matchTacticsCalibration),
    engineConfig: input.engineConfig,
    matchTacticsCalibration: input.matchTacticsCalibration,
  };
}

/**
 * Builds one production `MatchTeamContext` for one composed side.
 *
 * Strength comes from the production `deriveTeamStrength`, so the department
 * collapse this phase exists to remove is measured rather than restated.
 */
export function buildTacticalShapeTeamContext(
  side: TacticalShapeSide,
  sideKey: "home" | "away",
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
): MatchTeamContext {
  assertValidBand(side.band);

  const slots = composeSlots(side.lineup, sideKey);
  const players = Object.fromEntries(
    slots.map((slot) => [slot.playerId, synthesizePlayer(slot.playerId, side.band[slot.department])] as const),
  ) as Record<PlayerId, Player>;

  const lineup = slots.map((slot) =>
    createLineupSlot({
      slotId: slot.slotId,
      playerId: slot.playerId,
      canonicalRole: slot.canonicalRole,
      ...(slot.side === undefined ? {} : { side: slot.side }),
    }),
  );

  return {
    clubId: tacticalShapeClubId(sideKey),
    lineup,
    ...deriveTeamShapeAndStrength({
      lineup,
      players,
      roleWeights: TACTICAL_SHAPE_ROLE_WEIGHTS,
      matchTacticsCalibration,
    }),
    tacticalDistribution: {
      directness: side.tactic.directness,
      pressing: side.tactic.pressing,
      width: side.tactic.width,
      risk: side.tactic.risk,
      mentality: side.tactic.mentality,
    },
    incidentProfiles: slots.map((slot) => createMatchPlayerIncidentProfile(players[slot.playerId] as Player)),
  };
}

/**
 * Derives the production `TeamStrength` for one composed side.
 *
 * @example
 * const strength = deriveTacticalShapeStrength({ lineup, band, tactic }, calibration);
 */
export function deriveTacticalShapeStrength(
  side: TacticalShapeSide,
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
): TeamStrength {
  return buildTacticalShapeTeamContext(side, "home", matchTacticsCalibration).strength;
}

/** One row of the strength-collapse table. */
export interface TacticalShapeStrengthRow {
  /** Composition key. */
  readonly compositionKey: TacticalShapeCompositionKey;
  /** Production team strength derived for this composition at the reference band. */
  readonly strength: TeamStrength;
  /** Stable fingerprint of the strength values, used to count distinct outcomes. */
  readonly fingerprint: string;
  /** Departments left with no slot, which the current engine scores as zero. */
  readonly emptyDepartments: readonly string[];
  /** Whether one of the `23` named presets produces this composition. */
  readonly reachableFromPreset: boolean;
}

/** One recorded shape-versus-shape equivalence check. */
export interface TacticalShapeEquivalenceRow {
  /** First composition key. */
  readonly firstCompositionKey: TacticalShapeCompositionKey;
  /** Second composition key. */
  readonly secondCompositionKey: TacticalShapeCompositionKey;
  /** Whether the derived strengths are bit-identical. */
  readonly strengthIdentical: boolean;
  /** Whether a paired-seed series produced identical scores in every match. */
  readonly resultsIdentical: boolean;
  /** Matches compared. Never zero. */
  readonly matches: number;
}

/**
 * One composition measured against the coherent reference shape.
 *
 * This is the manager's actual decision - "what do I gain by picking this shape
 * against a normal opponent" - so it is measured at high precision and is the
 * only place the bounded-swing and asymmetry invariants read from.
 */
export interface TacticalShapeVersusReferenceRow {
  /** Composition key under test. */
  readonly compositionKey: TacticalShapeCompositionKey;
  /** Win share against the reference shape at equal quality. */
  readonly winShare: number;
  /** Matches behind that share. Never zero. */
  readonly matches: number;
  /** Mean possession share this composition held. */
  readonly possessionShare: number;
  /** Whether that share sits on the engine's frozen possession floor or ceiling. */
  readonly clampedTo: "floor" | "ceiling" | "none";
  /** Opportunities generated across the series. */
  readonly opportunities: number;
  /** Summed conversion probability across the series. */
  readonly expectedGoals: number;
  /** Goals scored across the series. */
  readonly goals: number;
}

/** Aggregate standing of one composition against the whole reachable population. */
export interface TacticalShapeDominanceRow {
  /** Composition key. */
  readonly compositionKey: TacticalShapeCompositionKey;
  /** Mean win share against every composition including itself. */
  readonly meanWinShare: number;
  /**
   * Worst win share this composition held against any single opponent.
   *
   * This is what the dominance gate reads. A composition is a free win button
   * only when it stays ahead of *every* alternative, and a mean would let a
   * population full of self-destructive shapes manufacture a false positive.
   */
  readonly minimumWinShare: number;
  /** Matches behind that mean. Never zero. */
  readonly matches: number;
}

/** The full paired-seed shape-versus-shape matrix plus its aggregate rows. */
export interface TacticalShapeDominanceMatrix {
  /** Row and column order. */
  readonly compositionKeys: readonly TacticalShapeCompositionKey[];
  /** `winShare[row][column]` is the row composition's win share against the column one. */
  readonly winShare: readonly (readonly number[])[];
  /** Aggregate standing per composition, ordered as `compositionKeys`. */
  readonly rows: readonly TacticalShapeDominanceRow[];
  /** Total matches behind the matrix. Never zero. */
  readonly matches: number;
}

/** One quality-versus-structure comparison with named sides. */
export interface TacticalShapeQualityStructureRow {
  /** Stable scenario key. */
  readonly scenarioKey: string;
  /** First side description. */
  readonly first: TacticalShapeSideLabel;
  /** Second side description. */
  readonly second: TacticalShapeSideLabel;
  /** Series outcome from the first side's point of view. */
  readonly series: TacticalShapeSeriesResult;
}

/** Compact label for one side of a recorded scenario. */
export interface TacticalShapeSideLabel {
  /** Composition key. */
  readonly compositionKey: TacticalShapeCompositionKey;
  /** Quality band key. */
  readonly bandKey: string;
  /** Tactic key. */
  readonly tacticKey: string;
}

/**
 * One tactic profile measured against every other tactic at identical shape.
 *
 * Shape and quality are held constant on both sides, so whatever moves is the
 * tactic. `winShare` is kept against the neutral profile because that is the
 * question a manager asks - is changing anything better than changing nothing -
 * while `meanWinShareAgainstField` is what the dominance gate reads.
 */
export interface TacticalShapeTacticRow {
  /** Tactic profile key under test. */
  readonly tacticKey: string;
  /** Win share against the same shape playing the neutral tactic. */
  readonly winShare: number;
  /**
   * Mean win share against every *other* profile.
   *
   * The self-cell is excluded because a profile always draws with itself by
   * construction, and a mirror match cannot say anything about whether a
   * setting is a free win.
   */
  readonly meanWinShareAgainstField: number;
  /** Worst win share this profile held against any single other profile. */
  readonly minimumWinShareAgainstField: number;
  /** Matches behind that mean. Never zero. */
  readonly matches: number;
  /** Mean possession share this profile held. */
  readonly possessionShare: number;
  /** Opportunities generated across every series this profile played. */
  readonly opportunities: number;
  /** Opportunities this profile's opponents generated against it. */
  readonly opportunitiesConceded: number;
  /** Summed conversion probability across the series. */
  readonly expectedGoals: number;
  /** Structured chance types produced across the series. */
  readonly chanceTypes: Readonly<Record<ShotChanceType, number>>;
}

/**
 * The full tactic-versus-tactic matrix at the reference shape, plus its rows.
 *
 * The shape population and the tactic population need different readings, and
 * the difference is not a preference. `66` compositions are mostly
 * self-destructive, so a mean against that field measures how badly the broken
 * shapes lose and the honest reading is the worst single matchup. The six tactic
 * profiles are all legal selections on the same eleven, so the mean *is* the
 * expected value of choosing one blind - and a minimum there says nothing,
 * because sampling alone drops some cell of every row below the threshold.
 */
export interface TacticalShapeTacticDominanceMatrix {
  /** Row and column order. */
  readonly tacticKeys: readonly string[];
  /** `winShare[row][column]` is the row profile's win share against the column one. */
  readonly winShare: readonly (readonly number[])[];
  /** Aggregate standing plus texture per profile, ordered as `tacticKeys`. */
  readonly rows: readonly TacticalShapeTacticRow[];
  /** Total matches behind the matrix. Never zero. */
  readonly matches: number;
}

/**
 * One curated formation measured against the reference formation.
 *
 * The department population cannot answer this question at all: it builds every
 * side from central roles, so `4-4-2` and `4-3-2-1` differ there only by how
 * many slots sit in each department and not at all by where those players
 * stand. This row is the manager's actual decision - the one the tactical board
 * exposes - and it is the only place a wing exists.
 */
export interface TacticalShapeFormationRow {
  /** Curated formation key under test. */
  readonly formationKey: FormationKey;
  /** Win share against the reference formation at identical quality. */
  readonly winShare: number;
  /** Matches behind that share. Never zero. */
  readonly matches: number;
  /** Mean possession share this formation held. */
  readonly possessionShare: number;
  /** Opportunities generated across the series. */
  readonly opportunities: number;
  /** Summed conversion probability across the series. */
  readonly expectedGoals: number;
  /** Goals scored across the series. */
  readonly goals: number;
  /** Structured chance types produced across the series. */
  readonly chanceTypes: Readonly<Record<ShotChanceType, number>>;
}

/**
 * How much the formation decides against how much one slider decides.
 *
 * Both numbers are the share of chances that came down a flank, so they are
 * directly comparable. If the widest and narrowest formations a manager can
 * pick move that share less than dragging the `width` slider on a single
 * formation does, then where players stand matters less than one dial, which
 * is the wrong way round.
 */
export interface TacticalShapeFormationVersusSlider {
  /** Cross share of the reference formation on neutral tactics. */
  readonly referenceCrossShare: number;
  /** Widest cross share any measured formation reached on neutral tactics. */
  readonly widestFormationCrossShare: number;
  /** Narrowest cross share any measured formation reached on neutral tactics. */
  readonly narrowestFormationCrossShare: number;
  /** Cross share of the reference formation with `width` at its floor. */
  readonly sliderFloorCrossShare: number;
  /** Cross share of the reference formation with `width` at its cap. */
  readonly sliderCapCrossShare: number;
  /** Formation span divided by slider span. Above `1` means shape wins. */
  readonly formationShareOfSliderSpan: number;
}

/** Machine-readable status for one frozen invariant. */
export type TacticalShapeGateStatus = "pass" | "fail" | "not_evaluated";

/** Frozen invariants this step declares before any behaviour changes. */
export type TacticalShapeInvariantKey =
  | "asymmetric_incoherence_cost"
  | "bounded_structural_swing"
  | "distinguishable_coherent_and_incoherent_shape"
  | "empty_department_possession_clamp"
  | "no_dominant_composition"
  | "no_dominant_tactic"
  | "quality_hierarchy_survives_extreme_shape";

/** Result of one frozen invariant, always carrying its own denominator. */
export interface TacticalShapeInvariantResult {
  /** Invariant key. */
  readonly key: TacticalShapeInvariantKey;
  /** Outcome. `not_evaluated` is never reported as `pass`. */
  readonly status: TacticalShapeGateStatus;
  /** Observations behind the measurement. A zero denominator forces `not_evaluated`. */
  readonly observations: number;
  /** Measured value, or `null` when the invariant could not be evaluated. */
  readonly observed: number | null;
  /** Human-readable frozen threshold, recorded verbatim in the report. */
  readonly threshold: string;
  /** Why the status is what it is. */
  readonly detail: string;
}

/** Complete deterministic tactical-shape baseline. */
export interface TacticalShapeAuditReport {
  /** Contract version this report was produced under. */
  readonly contractVersion: string;
  /** Seed prefix behind every series. */
  readonly seedPrefix: string;
  /** Seed pairs per dominance-matrix cell. */
  readonly pairedSeedCount: number;
  /** Seed pairs per named scenario and per versus-reference row. */
  readonly scenarioPairedSeedCount: number;
  /** Bands supplied by the caller, in the order given. */
  readonly bands: readonly TacticalShapeQualityBand[];
  /** Strength collapse table over the reachable composition population. */
  readonly strengthRows: readonly TacticalShapeStrengthRow[];
  /** Distinct strength fingerprints across the population. */
  readonly distinctStrengthCount: number;
  /** Recorded equivalence checks. */
  readonly equivalences: readonly TacticalShapeEquivalenceRow[];
  /** Every reachable composition measured against the coherent reference shape. */
  readonly versusReference: readonly TacticalShapeVersusReferenceRow[];
  /** Full tactic-versus-tactic matrix at the reference shape, with its rows. */
  readonly tacticDominance: TacticalShapeTacticDominanceMatrix;
  /** Each curated formation measured against the reference formation. */
  readonly formations: readonly TacticalShapeFormationRow[];
  /** What the formation decides against what one slider decides. */
  readonly formationVersusSlider: TacticalShapeFormationVersusSlider;
  /**
   * Smallest win-share difference the versus-reference measurement can resolve.
   *
   * Recorded so a later step cannot mistake sampling noise for a structural
   * effect. It is `2.7` standard errors, which is roughly the largest value
   * pure noise produces when the maximum is taken over this many compositions.
   */
  readonly versusReferenceNoiseFloor: number;
  /** Full equal-quality dominance matrix. */
  readonly dominance: TacticalShapeDominanceMatrix;
  /** Named quality-versus-structure scenarios. */
  readonly qualityVersusStructure: readonly TacticalShapeQualityStructureRow[];
  /** Frozen invariants with their measured status. */
  readonly invariants: readonly TacticalShapeInvariantResult[];
  /** Stable hash of every recorded fact, used to prove reproducibility. */
  readonly structuredHash: string;
}

/** Quality bands the audit requires by key, measured and supplied by the caller. */
export interface TacticalShapeQualityBands {
  /** Equal-quality reference population used by every structural comparison. */
  readonly reference: TacticalShapeQualityBand;
  /** Strongest first-division squad in the generated world. */
  readonly firstDivisionContender: TacticalShapeQualityBand;
  /** Second-strongest first-division squad; the adjacent quality gap. */
  readonly firstDivisionAdjacent: TacticalShapeQualityBand;
  /** Median first-division squad; the modest quality gap. */
  readonly firstDivisionModest: TacticalShapeQualityBand;
  /** Median second-division squad; the reference for one division tier. */
  readonly secondDivisionMidTable: TacticalShapeQualityBand;
  /** Median third-division squad. */
  readonly thirdDivisionMidTable: TacticalShapeQualityBand;
}

/** Input for the complete tactical-shape baseline audit. */
export interface RunTacticalShapeAuditInput {
  /** Production match engine configuration supplied by the caller. */
  readonly engineConfig: MatchEngineConfig;
  /** Production match-tactics calibration supplied by the caller. */
  readonly matchTacticsCalibration: MatchTacticsCalibrationConfig;
  /** Measured quality bands supplied by the caller. */
  readonly bands: TacticalShapeQualityBands;
  /** Stable seed prefix. */
  readonly seedPrefix: string;
  /**
   * Seed pairs per cell of the dominance matrix.
   *
   * The matrix answers a shape question - is any composition a free win button -
   * which needs breadth across `66 x 66` cells rather than precision inside one
   * cell, because the gate reads a minimum across a whole row.
   */
  readonly pairedSeedCount: number;
  /**
   * Seed pairs per named scenario and per versus-reference row.
   *
   * These feed the numeric invariants, so they need enough observations that the
   * noise floor stays well under the frozen thresholds.
   */
  readonly scenarioPairedSeedCount: number;
  /**
   * Optional restriction of the dominance population.
   *
   * Present so focused tests can run a small frozen subset. Omitting it runs the
   * complete reachable population, which is what the recorded baseline uses.
   */
  readonly dominanceCompositionKeys?: readonly TacticalShapeCompositionKey[];
}

/**
 * Runs the complete deterministic tactical-shape baseline.
 *
 * @example
 * const report = runTacticalShapeAudit({ engineConfig, bands, seedPrefix, pairedSeedCount: 8 });
 */
export function runTacticalShapeAudit(input: RunTacticalShapeAuditInput): TacticalShapeAuditReport {
  assertPositiveSafeInteger(input.pairedSeedCount, "pairedSeedCount");
  assertPositiveSafeInteger(input.scenarioPairedSeedCount, "scenarioPairedSeedCount");
  assertNonEmpty(input.seedPrefix, "seedPrefix");

  const bandList = orderedBands(input.bands);
  for (const band of bandList) assertValidBand(band);

  const strengthRows = buildStrengthRows(input.bands.reference, input.matchTacticsCalibration);
  const equivalences = buildEquivalences(input);
  const versusReference = buildVersusReferenceRows(input);
  const tacticDominance = buildTacticDominance(input);
  const formations = buildFormationRows(input);
  const formationVersusSlider = buildFormationVersusSlider(input, formations);
  const dominance = buildDominanceMatrix(input);
  const qualityVersusStructure = buildQualityVersusStructure(input);
  const invariants = evaluateInvariants({
    strengthRows,
    equivalences,
    versusReference,
    versusReferenceNoiseFloor: winShareNoiseFloor(input.scenarioPairedSeedCount * 2),
    dominance,
    tacticDominance,
    qualityVersusStructure,
  });

  const report: Omit<TacticalShapeAuditReport, "structuredHash"> = {
    contractVersion: TACTICAL_SHAPE_AUDIT_CONTRACT_VERSION,
    seedPrefix: input.seedPrefix,
    pairedSeedCount: input.pairedSeedCount,
    scenarioPairedSeedCount: input.scenarioPairedSeedCount,
    bands: bandList,
    strengthRows,
    distinctStrengthCount: new Set(strengthRows.map((row) => row.fingerprint)).size,
    equivalences,
    versusReference,
    tacticDominance,
    formations,
    formationVersusSlider,
    versusReferenceNoiseFloor: winShareNoiseFloor(input.scenarioPairedSeedCount * 2),
    dominance,
    qualityVersusStructure,
    invariants,
  };

  return { ...report, structuredHash: stableHash(report) };
}

/**
 * Largest win-share deviation pure sampling noise typically produces.
 *
 * A win share over `matches` independent matches has a standard error of about
 * `0.5 / sqrt(matches)`. Taking a maximum over the reachable population inflates
 * that, so the floor is stated at `2.7` standard errors.
 */
function winShareNoiseFloor(matches: number): number {
  return roundFour((2.7 * 0.5) / Math.sqrt(matches));
}

/** Error categories exposed by the tactical-shape audit. */
export type TacticalShapeAuditErrorCode =
  | "invalid_band"
  | "invalid_composition"
  | "invalid_input"
  | "missing_scenario"
  | "missing_telemetry"
  | "unknown_composition";

/**
 * Typed error thrown when audit input or engine output is unusable.
 *
 * @example
 * if (error instanceof TacticalShapeAuditError && error.code === "invalid_band") {
 *   // Caller supplied a quality band outside the 0..20 ability scale.
 * }
 */
export class TacticalShapeAuditError extends Error {
  /** Machine-readable failure reason. */
  public readonly code: TacticalShapeAuditErrorCode;

  /** Creates a tactical-shape audit error. */
  public constructor(code: TacticalShapeAuditErrorCode, message: string) {
    super(message);
    this.name = "TacticalShapeAuditError";
    this.code = code;
  }
}

/* -------------------------------------------------------------------------- */
/* Frozen thresholds                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Predeclared thresholds, frozen before any behaviour change.
 *
 * They are stated here rather than in the report writer so that no later step
 * can quietly re-derive one from output it has already seen.
 */
export const TACTICAL_SHAPE_THRESHOLDS = {
  /**
   * Structure may move fewer win-share points than one division tier of squad
   * quality moves. Squad building stays the primary way to win.
   */
  maxStructuralSwingShareOfTierEdge: 0.75,
  /** No composition may beat the whole reachable population by more than this. */
  maxMeanWinShareAgainstField: 0.55,
  /**
   * No tactic profile may average more than this against the other profiles.
   *
   * Deliberately the same number as the shape gate, because it is the same
   * claim: a setting a manager can pick must not be worth picking blind. A
   * slider that is simply better is not a decision - it is found once and never
   * touched again, which is the decorative-slider defect wearing the opposite
   * disguise.
   */
  maxTacticMeanWinShareAgainstField: 0.55,
  /** Incoherence must cost at least twice what coherence pays. */
  minIncoherenceToCoherenceRatio: 2,
  /**
   * A first-division title contender must stay the aggregate favourite over a
   * third-division mid-table side even while using an extreme shape.
   */
  minQualityHierarchyWinShare: 0.55,
  /** Deterministic upsets must remain possible inside that scenario. */
  minQualityHierarchyUpsets: 1,
  /** Engine possession floor, mirrored here so a silent change fails the gate. */
  possessionFloor: 0.18,
  /** Engine possession ceiling, mirrored here so a silent change fails the gate. */
  possessionCeiling: 0.82,
} as const;

/* -------------------------------------------------------------------------- */
/* Composition space                                                          */
/* -------------------------------------------------------------------------- */

function buildCompositions(): readonly TacticalShapeComposition[] {
  const compositions: TacticalShapeComposition[] = [];

  for (let defenders = TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT; defenders >= 0; defenders -= 1) {
    for (let midfielders = TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT - defenders; midfielders >= 0; midfielders -= 1) {
      compositions.push({
        defenders,
        midfielders,
        attackers: TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT - defenders - midfielders,
      });
    }
  }

  return compositions;
}

function compositionByKey(key: TacticalShapeCompositionKey): TacticalShapeComposition {
  const found = TACTICAL_SHAPE_COMPOSITIONS.find((composition) => tacticalShapeCompositionKey(composition) === key);
  if (found === undefined) {
    throw new TacticalShapeAuditError("unknown_composition", `Unknown tactical shape composition: ${key}`);
  }
  return found;
}

/* -------------------------------------------------------------------------- */
/* Lineup construction                                                        */
/* -------------------------------------------------------------------------- */

type TacticalShapeDepartment = "goalkeeper" | "defense" | "midfield" | "attack";

interface ComposedSlot {
  readonly slotId: string;
  readonly playerId: PlayerId;
  readonly canonicalRole: CanonicalPlayerRole;
  readonly department: TacticalShapeDepartment;
  /** Channel this slot occupies; absent for the flankless department population. */
  readonly side?: FormationSide;
}

/**
 * Diagnostic role-weight profiles owned by this audit.
 *
 * They are deliberately minimal. Because every synthetic player carries one
 * uniform ability value, any non-negative weighting returns exactly that value,
 * so these profiles decide the department a slot belongs to and nothing else.
 */
const TACTICAL_SHAPE_ROLE_WEIGHTS: Readonly<Record<string, RoleWeightProfile>> = {
  gk: {
    roleKey: "gk",
    department: "goalkeeper",
    abilityWeights: { "goalkeeping.reflexes": 1, "goalkeeping.handling": 1, "goalkeeping.goalkeeperPositioning": 1 },
  },
  defender: {
    roleKey: "defender",
    department: "defense",
    abilityWeights: { "technical.tackling": 1, "mental.positioning": 1, "physical.strength": 1 },
  },
  midfielder: {
    roleKey: "midfielder",
    department: "midfield",
    abilityWeights: { "technical.passing": 1, "mental.vision": 1, "physical.stamina": 1 },
  },
  attacker: {
    roleKey: "attacker",
    department: "attack",
    abilityWeights: { "technical.finishing": 1, "technical.dribbling": 1, "physical.pace": 1 },
  },
};

function composeSlots(lineup: TacticalShapeSideLineup, sideKey: "home" | "away"): readonly ComposedSlot[] {
  return lineup.kind === "composition"
    ? composeDepartmentSlots(lineup.composition, sideKey)
    : composeFormationSlots(lineup.formationKey, sideKey);
}

function composeDepartmentSlots(
  composition: TacticalShapeComposition,
  sideKey: "home" | "away",
): readonly ComposedSlot[] {
  assertValidComposition(composition);

  const slots: ComposedSlot[] = [createSlot(sideKey, 0, "goalkeeper", "goalkeeper")];
  let index = 1;

  for (let count = 0; count < composition.defenders; count += 1, index += 1) {
    slots.push(createSlot(sideKey, index, "center_back", "defense"));
  }
  for (let count = 0; count < composition.midfielders; count += 1, index += 1) {
    slots.push(createSlot(sideKey, index, "central_midfielder", "midfield"));
  }
  for (let count = 0; count < composition.attackers; count += 1, index += 1) {
    slots.push(createSlot(sideKey, index, "striker", "attack"));
  }

  return slots;
}

/**
 * Builds the slots of one curated formation, flanks included.
 *
 * The formation's own slots decide both the role and the channel, so a right
 * midfielder covers the right and a second striker splits himself. That is the
 * whole difference from the department population, where every outfield slot is
 * central by construction: without a side on the slot, `4-4-2` and `4-3-2-1`
 * differ only in how many players sit in each department, which is precisely
 * the thing they are not about.
 */
function composeFormationSlots(formationKey: FormationKey, sideKey: "home" | "away"): readonly ComposedSlot[] {
  return FORMATION_CATALOG[formationKey].slots.map((slot, index) =>
    createSlot(sideKey, index, slot.playerRole, departmentOfFormationSlot(slot.department), slot.side),
  );
}

/** Maps a formation slot's department onto the audit's quality bands. */
function departmentOfFormationSlot(department: FormationDepartment): TacticalShapeDepartment {
  switch (department) {
    case "goalkeeping":
      return "goalkeeper";
    case "defense":
      return "defense";
    case "midfield":
      return "midfield";
    case "attack":
      return "attack";
  }
}

/**
 * Builds one composed slot at the most neutral role of its department.
 *
 * Centre back, central midfielder, and striker are the roles that carry no
 * channel of their own, which keeps the department probe about how many slots
 * sit in a department rather than about which flank they occupy. A formation
 * slot supplies its own role and channel instead.
 */
function createSlot(
  sideKey: "home" | "away",
  index: number,
  canonicalRole: CanonicalPlayerRole,
  department: TacticalShapeDepartment,
  side?: FormationSide,
): ComposedSlot {
  const suffix = String(index + 1).padStart(2, "0");
  return {
    slotId: `${sideKey}-${suffix}`,
    playerId: playerId(`player:tactical-shape-${sideKey}-${suffix}`),
    canonicalRole,
    department,
    ...(side === undefined ? {} : { side }),
  };
}

function tacticalShapeClubId(sideKey: "home" | "away"): ClubId {
  return clubId(`club:tactical-shape-${sideKey}`);
}

/**
 * Builds one synthetic player whose every ability equals the supplied quality.
 *
 * Uniform abilities are the point: they make department composition the only
 * remaining difference between two sides drawn from the same band.
 */
function synthesizePlayer(id: PlayerId, quality: number): Player {
  const abilities = uniformAbilities(quality);
  return {
    id,
    firstName: "Shape",
    lastName: "Probe",
    birthDate: gameDate(0),
    naturalPositions: [],
    abilities,
    potential: abilities,
  };
}

function uniformAbilities(quality: number): PlayerAbilities {
  const value = abilityValue(quality);
  return {
    technical: {
      finishing: value,
      passing: value,
      longPassing: value,
      crossing: value,
      dribbling: value,
      technique: value,
      tackling: value,
      penalties: value,
      freeKicks: value,
    },
    physical: { pace: value, strength: value, stamina: value, agility: value, heading: value },
    mental: {
      positioning: value,
      vision: value,
      anticipation: value,
      composure: value,
      determination: value,
      leadership: value,
    },
    goalkeeping: {
      reflexes: value,
      handling: value,
      rushingOut: value,
      goalkeeperPositioning: value,
      footwork: value,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Report sections                                                            */
/* -------------------------------------------------------------------------- */

function buildStrengthRows(
  band: TacticalShapeQualityBand,
  matchTacticsCalibration: MatchTacticsCalibrationConfig,
): readonly TacticalShapeStrengthRow[] {
  const presetKeys = new Set(TACTICAL_SHAPE_PRESET_COMPOSITION_KEYS);

  return TACTICAL_SHAPE_COMPOSITIONS.map((composition) => {
    const strength = deriveTacticalShapeStrength(
      { lineup: { kind: "composition", composition }, band, tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC },
      matchTacticsCalibration,
    );
    const key = tacticalShapeCompositionKey(composition);

    return {
      compositionKey: key,
      strength,
      fingerprint: strengthFingerprint(strength),
      emptyDepartments: emptyDepartmentsOf(composition),
      reachableFromPreset: presetKeys.has(key),
    };
  });
}

function buildEquivalences(input: RunTacticalShapeAuditInput): readonly TacticalShapeEquivalenceRow[] {
  const opponent = sideFor(TACTICAL_SHAPE_REFERENCE_COMPOSITION_KEY, input.bands.reference);

  return TACTICAL_SHAPE_EQUIVALENCE_PAIRS.map(([firstKey, secondKey]) => {
    const first = sideFor(firstKey, input.bands.reference);
    const second = sideFor(secondKey, input.bands.reference);
    const sharedIdentity = `equivalence|${firstKey}|${secondKey}`;
    const series = (side: TacticalShapeSide): TacticalShapeSeriesResult =>
      runTacticalShapeSeries({
        first: side,
        second: opponent,
        engineConfig: input.engineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
        seedPrefix: `${input.seedPrefix}|equivalence`,
        pairedSeedCount: input.scenarioPairedSeedCount,
        scenarioKeyOverride: sharedIdentity,
      });

    const firstSeries = series(first);
    const secondSeries = series(second);

    return {
      firstCompositionKey: firstKey,
      secondCompositionKey: secondKey,
      strengthIdentical:
        strengthFingerprint(deriveTacticalShapeStrength(first, input.matchTacticsCalibration))
        === strengthFingerprint(deriveTacticalShapeStrength(second, input.matchTacticsCalibration)),
      resultsIdentical: stableHash(firstSeries) === stableHash(secondSeries),
      matches: firstSeries.matches,
    };
  });
}

function buildVersusReferenceRows(
  input: RunTacticalShapeAuditInput,
): readonly TacticalShapeVersusReferenceRow[] {
  const opponent = sideFor(TACTICAL_SHAPE_REFERENCE_COMPOSITION_KEY, input.bands.reference);

  return TACTICAL_SHAPE_COMPOSITIONS.map((composition) => {
    const compositionKey = tacticalShapeCompositionKey(composition);
    const series = runTacticalShapeSeries({
      first: { lineup: { kind: "composition", composition }, band: input.bands.reference, tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC },
      second: opponent,
      engineConfig: input.engineConfig,
      matchTacticsCalibration: input.matchTacticsCalibration,
      seedPrefix: `${input.seedPrefix}|versus-reference`,
      pairedSeedCount: input.scenarioPairedSeedCount,
    });

    return {
      compositionKey,
      winShare: series.firstWinShare,
      matches: series.matches,
      possessionShare: series.first.possessionShare,
      clampedTo: clampStateOf(series.first.possessionShare),
      opportunities: series.first.opportunities,
      expectedGoals: series.first.expectedGoals,
      goals: series.first.goals,
    };
  });
}

/**
 * Runs every measured formation against the reference formation.
 *
 * Same band, same neutral tactic, same paired seeds - so anything that moves is
 * where the eleven players stand.
 */
function buildFormationRows(input: RunTacticalShapeAuditInput): readonly TacticalShapeFormationRow[] {
  const opponent = formationSideFor(TACTICAL_SHAPE_REFERENCE_FORMATION_KEY, input.bands.reference);

  return TACTICAL_SHAPE_MEASURED_FORMATION_KEYS.map((formationKey) => {
    const series = runTacticalShapeSeries({
      first: formationSideFor(formationKey, input.bands.reference),
      second: opponent,
      engineConfig: input.engineConfig,
      matchTacticsCalibration: input.matchTacticsCalibration,
      seedPrefix: `${input.seedPrefix}|formation`,
      pairedSeedCount: input.scenarioPairedSeedCount,
    });

    return {
      formationKey,
      winShare: series.firstWinShare,
      matches: series.matches,
      possessionShare: series.first.possessionShare,
      opportunities: series.first.opportunities,
      expectedGoals: series.first.expectedGoals,
      goals: series.first.goals,
      chanceTypes: series.first.chanceTypes,
    };
  });
}

/** Compares what the formation decides against what the width slider decides. */
function buildFormationVersusSlider(
  input: RunTacticalShapeAuditInput,
  formationRows: readonly TacticalShapeFormationRow[],
): TacticalShapeFormationVersusSlider {
  const opponent = formationSideFor(TACTICAL_SHAPE_REFERENCE_FORMATION_KEY, input.bands.reference);
  const sliderCrossShare = (width: number): number => {
    const series = runTacticalShapeSeries({
      first: {
        ...formationSideFor(TACTICAL_SHAPE_REFERENCE_FORMATION_KEY, input.bands.reference),
        tactic: { ...TACTICAL_SHAPE_NEUTRAL_TACTIC, tacticKey: `width_${width}`, width },
      },
      second: opponent,
      engineConfig: input.engineConfig,
      matchTacticsCalibration: input.matchTacticsCalibration,
      seedPrefix: `${input.seedPrefix}|formation-slider|${width}`,
      pairedSeedCount: input.scenarioPairedSeedCount,
    });

    return crossShareOf(series.first.chanceTypes);
  };

  const caps = input.engineConfig.tacticalDistributionCaps.width;
  const crossShares = formationRows.map((row) => crossShareOf(row.chanceTypes));
  const reference = formationRows.find((row) => row.formationKey === TACTICAL_SHAPE_REFERENCE_FORMATION_KEY);
  const sliderFloor = sliderCrossShare(caps.minInclusive);
  const sliderCap = sliderCrossShare(caps.maxInclusive);
  const sliderSpan = Math.abs(sliderCap - sliderFloor);
  const formationSpan = Math.max(...crossShares) - Math.min(...crossShares);

  return {
    referenceCrossShare: roundFour(reference === undefined ? 0 : crossShareOf(reference.chanceTypes)),
    widestFormationCrossShare: roundFour(Math.max(...crossShares)),
    narrowestFormationCrossShare: roundFour(Math.min(...crossShares)),
    sliderFloorCrossShare: roundFour(sliderFloor),
    sliderCapCrossShare: roundFour(sliderCap),
    formationShareOfSliderSpan: roundFour(sliderSpan === 0 ? 0 : formationSpan / sliderSpan),
  };
}

/** Share of one side's chances that came down a flank. */
function crossShareOf(chanceTypes: Readonly<Record<ShotChanceType, number>>): number {
  const total = chanceTypes.cross + chanceTypes.counter + chanceTypes.open_play;
  return total === 0 ? 0 : chanceTypes.cross / total;
}

/**
 * Runs every tactic profile against every other one at the reference shape.
 *
 * One pass owns both the tactic table and the dominance gate. Measuring the
 * table against neutral and the gate against the field separately would run the
 * same matchup twice on two seed streams and let the two disagree about what a
 * profile is worth.
 *
 * Only the upper triangle is played. The mirrored cell is `1 - share` because
 * the series already swaps venues, and the diagonal is left at `0.5`: a profile
 * against itself is a mirror match whose value is fixed by construction, so
 * playing it would spend matches to measure the sampling noise of a known
 * answer.
 */
function buildTacticDominance(input: RunTacticalShapeAuditInput): TacticalShapeTacticDominanceMatrix {
  const composition = compositionByKey(TACTICAL_SHAPE_REFERENCE_COMPOSITION_KEY);
  const lineup: TacticalShapeSideLineup = { kind: "composition", composition };
  const size = TACTICAL_SHAPE_TACTIC_PROFILES.length;
  const winShare: number[][] = TACTICAL_SHAPE_TACTIC_PROFILES.map(() => new Array<number>(size).fill(0.5));
  const totals = TACTICAL_SHAPE_TACTIC_PROFILES.map(() => createMutableTacticTotals());
  let matches = 0;

  for (let row = 0; row < size; row += 1) {
    for (let column = row + 1; column < size; column += 1) {
      const first = TACTICAL_SHAPE_TACTIC_PROFILES[row] as TacticalShapeTacticProfile;
      const second = TACTICAL_SHAPE_TACTIC_PROFILES[column] as TacticalShapeTacticProfile;
      const series = runTacticalShapeSeries({
        first: { lineup, band: input.bands.reference, tactic: first },
        second: { lineup, band: input.bands.reference, tactic: second },
        engineConfig: input.engineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
        seedPrefix: `${input.seedPrefix}|tactic`,
        pairedSeedCount: input.scenarioPairedSeedCount,
        scenarioKeyOverride: `${first.tacticKey}|${second.tacticKey}`,
      });

      (winShare[row] as number[])[column] = series.firstWinShare;
      (winShare[column] as number[])[row] = roundFour(1 - series.firstWinShare);
      accumulateTacticTotals(totals[row] as MutableTacticTotals, series.first, series.second, series.matches);
      accumulateTacticTotals(totals[column] as MutableTacticTotals, series.second, series.first, series.matches);
      matches += series.matches;
    }
  }

  const neutralIndex = TACTICAL_SHAPE_TACTIC_PROFILES.findIndex(
    (profile) => profile.tacticKey === TACTICAL_SHAPE_NEUTRAL_TACTIC.tacticKey,
  );

  const rows = TACTICAL_SHAPE_TACTIC_PROFILES.map((profile, index) => {
    const against = (winShare[index] as readonly number[]).filter((_, column) => column !== index);
    const total = totals[index] as MutableTacticTotals;

    return {
      tacticKey: profile.tacticKey,
      winShare: index === neutralIndex ? 0.5 : ((winShare[index] as readonly number[])[neutralIndex] as number),
      meanWinShareAgainstField: roundFour(against.reduce((sum, value) => sum + value, 0) / against.length),
      minimumWinShareAgainstField: roundFour(Math.min(...against)),
      matches: total.matches,
      possessionShare: roundFour(total.possessionShare / against.length),
      opportunities: total.opportunities,
      opportunitiesConceded: total.opportunitiesConceded,
      expectedGoals: roundFour(total.expectedGoals),
      chanceTypes: total.chanceTypes,
    };
  });

  return { tacticKeys: TACTICAL_SHAPE_TACTIC_PROFILES.map((profile) => profile.tacticKey), winShare, rows, matches };
}

interface MutableTacticTotals {
  matches: number;
  possessionShare: number;
  opportunities: number;
  opportunitiesConceded: number;
  expectedGoals: number;
  chanceTypes: Record<ShotChanceType, number>;
}

function createMutableTacticTotals(): MutableTacticTotals {
  return {
    matches: 0,
    possessionShare: 0,
    opportunities: 0,
    opportunitiesConceded: 0,
    expectedGoals: 0,
    chanceTypes: { open_play: 0, counter: 0, cross: 0, dead_ball: 0 },
  };
}

function accumulateTacticTotals(
  totals: MutableTacticTotals,
  own: TacticalShapeSeriesSideTotals,
  opponent: TacticalShapeSeriesSideTotals,
  matches: number,
): void {
  totals.matches += matches;
  totals.possessionShare += own.possessionShare;
  totals.opportunities += own.opportunities;
  totals.opportunitiesConceded += opponent.opportunities;
  totals.expectedGoals += own.expectedGoals;
  for (const chanceType of Object.keys(totals.chanceTypes) as readonly ShotChanceType[]) {
    totals.chanceTypes[chanceType] += own.chanceTypes[chanceType];
  }
}

function buildDominanceMatrix(input: RunTacticalShapeAuditInput): TacticalShapeDominanceMatrix {
  const compositionKeys = input.dominanceCompositionKeys
    ?? TACTICAL_SHAPE_COMPOSITIONS.map(tacticalShapeCompositionKey);
  const size = compositionKeys.length;
  const winShare: number[][] = compositionKeys.map(() => new Array<number>(size).fill(0));
  let matches = 0;

  for (let row = 0; row < size; row += 1) {
    for (let column = row; column < size; column += 1) {
      const rowKey = compositionKeys[row] as TacticalShapeCompositionKey;
      const columnKey = compositionKeys[column] as TacticalShapeCompositionKey;
      const series = runTacticalShapeSeries({
        first: sideFor(rowKey, input.bands.reference),
        second: sideFor(columnKey, input.bands.reference),
        engineConfig: input.engineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
        seedPrefix: `${input.seedPrefix}|dominance`,
        pairedSeedCount: input.pairedSeedCount,
      });

      (winShare[row] as number[])[column] = series.firstWinShare;
      if (column !== row) {
        (winShare[column] as number[])[row] = roundFour(1 - series.firstWinShare);
      }
      matches += series.matches;
    }
  }

  const rows = compositionKeys.map((compositionKey, index) => {
    const shares = winShare[index] as readonly number[];
    return {
      compositionKey,
      meanWinShare: roundFour(shares.reduce((sum, value) => sum + value, 0) / shares.length),
      minimumWinShare: roundFour(Math.min(...shares)),
      matches: shares.length * input.pairedSeedCount * 2,
    };
  });

  return { compositionKeys, winShare, rows, matches };
}

function buildQualityVersusStructure(
  input: RunTacticalShapeAuditInput,
): readonly TacticalShapeQualityStructureRow[] {
  return TACTICAL_SHAPE_QUALITY_SCENARIOS.map((scenario) => {
    const first: TacticalShapeSide = {
      lineup: { kind: "composition", composition: compositionByKey(scenario.firstCompositionKey) },
      band: input.bands[scenario.firstBand],
      tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC,
    };
    const second: TacticalShapeSide = {
      lineup: { kind: "composition", composition: compositionByKey(scenario.secondCompositionKey) },
      band: input.bands[scenario.secondBand],
      tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC,
    };

    return {
      scenarioKey: scenario.scenarioKey,
      first: sideLabel(first),
      second: sideLabel(second),
      series: runTacticalShapeSeries({
        first,
        second,
        engineConfig: input.engineConfig,
        matchTacticsCalibration: input.matchTacticsCalibration,
        seedPrefix: `${input.seedPrefix}|quality|${scenario.scenarioKey}`,
        pairedSeedCount: input.scenarioPairedSeedCount,
      }),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Frozen scenarios                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Compositions the `23` named presets produce, derived rather than restated.
 *
 * Recorded for context only. Several presets collapse onto the same composition
 * because the engine sees departments, not lines, and the presets cover far less
 * of the reachable population than a manager can reach by hand.
 */
export const TACTICAL_SHAPE_PRESET_COMPOSITION_KEYS: readonly TacticalShapeCompositionKey[] =
  derivePresetCompositionKeys();

function derivePresetCompositionKeys(): readonly TacticalShapeCompositionKey[] {
  const keys = new Set<TacticalShapeCompositionKey>();

  for (const formation of FORMATIONS) {
    const counts = { defenders: 0, midfielders: 0, attackers: 0 };
    for (const slot of formation.slots) {
      if (slot.department === "defense") counts.defenders += 1;
      else if (slot.department === "midfield") counts.midfielders += 1;
      else if (slot.department === "attack") counts.attackers += 1;
    }
    keys.add(tacticalShapeCompositionKey(counts));
  }

  return [...keys].sort();
}

/** Shape pairs whose current equivalence this baseline must record. */
const TACTICAL_SHAPE_EQUIVALENCE_PAIRS: readonly (readonly [
  TacticalShapeCompositionKey,
  TacticalShapeCompositionKey,
])[] = [
  ["4-4-2", "3-1-6"],
  ["4-4-2", "5-4-1"],
  ["3-1-6", "6-1-3"],
];

/**
 * Tactic profiles measured at the reference shape.
 *
 * Each moves one knob to its extreme and leaves the others neutral, so the
 * recorded effect belongs to that knob. `neutral` is included deliberately: it
 * plays itself, and its win share is the measurement's own noise reading.
 */
const TACTICAL_SHAPE_TACTIC_PROFILES: readonly TacticalShapeTacticProfile[] = [
  TACTICAL_SHAPE_NEUTRAL_TACTIC,
  { tacticKey: "high_pressing", directness: 0.5, pressing: 0.95, width: 0.5, risk: 0.5, mentality: NEUTRAL_TACTIC_MENTALITY },
  { tacticKey: "direct_play", directness: 0.95, pressing: 0.5, width: 0.5, risk: 0.5, mentality: NEUTRAL_TACTIC_MENTALITY },
  { tacticKey: "flank_overload", directness: 0.5, pressing: 0.5, width: 0.95, risk: 0.5, mentality: NEUTRAL_TACTIC_MENTALITY },
  { tacticKey: "high_risk", directness: 0.5, pressing: 0.5, width: 0.5, risk: 0.95, mentality: NEUTRAL_TACTIC_MENTALITY },
  { tacticKey: "low_block", directness: 0.05, pressing: 0.05, width: 0.05, risk: 0.05, mentality: NEUTRAL_TACTIC_MENTALITY },
];

interface TacticalShapeQualityScenario {
  readonly scenarioKey: string;
  readonly firstCompositionKey: TacticalShapeCompositionKey;
  readonly firstBand: keyof TacticalShapeQualityBands;
  readonly secondCompositionKey: TacticalShapeCompositionKey;
  readonly secondBand: keyof TacticalShapeQualityBands;
}

/**
 * Named quality-versus-structure scenarios frozen before coefficients exist.
 *
 * `division_tier_edge` is the yardstick: it measures what one division tier of
 * squad quality is worth in win share at identical shape, and the bounded-swing
 * invariant compares structure against it.
 */
const TACTICAL_SHAPE_QUALITY_SCENARIOS: readonly TacticalShapeQualityScenario[] = [
  {
    scenarioKey: "division_tier_edge",
    firstCompositionKey: "4-4-2",
    firstBand: "firstDivisionModest",
    secondCompositionKey: "4-4-2",
    secondBand: "secondDivisionMidTable",
  },
  {
    scenarioKey: "adjacent_quality_gap",
    firstCompositionKey: "4-4-2",
    firstBand: "firstDivisionContender",
    secondCompositionKey: "4-4-2",
    secondBand: "firstDivisionAdjacent",
  },
  {
    scenarioKey: "modest_quality_gap",
    firstCompositionKey: "4-4-2",
    firstBand: "firstDivisionContender",
    secondCompositionKey: "4-4-2",
    secondBand: "firstDivisionModest",
  },
  {
    scenarioKey: "modest_advantage_versus_severe_incoherence",
    firstCompositionKey: "3-1-6",
    firstBand: "firstDivisionContender",
    secondCompositionKey: "4-4-2",
    secondBand: "firstDivisionModest",
  },
  {
    scenarioKey: "contender_extreme_shape_versus_third_division",
    firstCompositionKey: "3-1-6",
    firstBand: "firstDivisionContender",
    secondCompositionKey: "4-4-2",
    secondBand: "thirdDivisionMidTable",
  },
];

/* -------------------------------------------------------------------------- */
/* Invariants                                                                 */
/* -------------------------------------------------------------------------- */

interface EvaluateInvariantsInput {
  readonly strengthRows: readonly TacticalShapeStrengthRow[];
  readonly equivalences: readonly TacticalShapeEquivalenceRow[];
  readonly versusReference: readonly TacticalShapeVersusReferenceRow[];
  readonly versusReferenceNoiseFloor: number;
  readonly dominance: TacticalShapeDominanceMatrix;
  readonly tacticDominance: TacticalShapeTacticDominanceMatrix;
  readonly qualityVersusStructure: readonly TacticalShapeQualityStructureRow[];
}

function evaluateInvariants(context: EvaluateInvariantsInput): readonly TacticalShapeInvariantResult[] {
  return [
    evaluateBoundedStructuralSwing(context),
    evaluateNoDominantComposition(context),
    evaluateNoDominantTactic(context),
    evaluateAsymmetricIncoherenceCost(context),
    evaluateQualityHierarchy(context),
    evaluatePossessionClamp(context),
    evaluateDistinguishableShape(context),
  ];
}

function evaluateBoundedStructuralSwing(context: EvaluateInvariantsInput): TacticalShapeInvariantResult {
  const threshold = `best shape's gain over the reference shape <= ${TACTICAL_SHAPE_THRESHOLDS.maxStructuralSwingShareOfTierEdge} x the division-tier edge`;
  const tierScenario = context.qualityVersusStructure.find((row) => row.scenarioKey === "division_tier_edge");
  const best = bestVersusReference(context.versusReference);
  if (tierScenario === undefined || best === undefined) {
    return notEvaluated(
      "bounded_structural_swing",
      threshold,
      "The division-tier scenario or the versus-reference column produced no observations",
    );
  }

  const tierEdge = Math.abs(tierScenario.series.firstWinShare - 0.5);
  if (tierEdge <= context.versusReferenceNoiseFloor) {
    return notEvaluated(
      "bounded_structural_swing",
      threshold,
      `One division tier of squad quality moved win share by ${roundFour(tierEdge)}, which is inside the measurement noise floor ${context.versusReferenceNoiseFloor} and cannot bound anything`,
    );
  }

  const structuralUpside = best.winShare - 0.5;
  const ratio = roundFour(structuralUpside / tierEdge);

  return {
    key: "bounded_structural_swing",
    status: ratio <= TACTICAL_SHAPE_THRESHOLDS.maxStructuralSwingShareOfTierEdge ? "pass" : "fail",
    observations: best.matches + tierScenario.series.matches,
    observed: ratio,
    threshold,
    detail:
      `The best shape against the reference is ${best.compositionKey} at ${best.winShare}, worth ${roundFour(structuralUpside)} win share, `
      + `against a division-tier edge of ${roundFour(tierEdge)}. Downside is deliberately unbounded: a manager who fields a self-destructive shape may lose as much as the engine says.`,
  };
}

function evaluateNoDominantTactic(context: EvaluateInvariantsInput): TacticalShapeInvariantResult {
  const threshold = `no tactic profile averages above ${TACTICAL_SHAPE_THRESHOLDS.maxTacticMeanWinShareAgainstField} against the other profiles`;
  if (context.tacticDominance.matches === 0 || context.tacticDominance.rows.length < 2) {
    return notEvaluated("no_dominant_tactic", threshold, "The tactic matrix produced fewer than two profiles");
  }

  const strongest = [...context.tacticDominance.rows].sort(
    (left, right) => right.meanWinShareAgainstField - left.meanWinShareAgainstField,
  )[0] as TacticalShapeTacticRow;
  const weakest = [...context.tacticDominance.rows].sort(
    (left, right) => left.meanWinShareAgainstField - right.meanWinShareAgainstField,
  )[0] as TacticalShapeTacticRow;

  return {
    key: "no_dominant_tactic",
    status:
      strongest.meanWinShareAgainstField <= TACTICAL_SHAPE_THRESHOLDS.maxTacticMeanWinShareAgainstField
        ? "pass"
        : "fail",
    observations: context.tacticDominance.matches,
    observed: strongest.meanWinShareAgainstField,
    threshold,
    detail:
      `The strongest setting is ${strongest.tacticKey} at ${strongest.meanWinShareAgainstField} against the field, `
      + `dropping to ${strongest.minimumWinShareAgainstField} against its worst opponent. `
      + `The weakest is ${weakest.tacticKey} at ${weakest.meanWinShareAgainstField}, which the gate does not bound: `
      + `a knob pushed to an extreme is allowed to cost a manager, it is only forbidden to pay one.`,
  };
}

function evaluateNoDominantComposition(context: EvaluateInvariantsInput): TacticalShapeInvariantResult {
  const threshold = `no composition stays above ${TACTICAL_SHAPE_THRESHOLDS.maxMeanWinShareAgainstField} against every single opponent`;
  if (context.dominance.matches === 0 || context.dominance.rows.length === 0) {
    return notEvaluated("no_dominant_composition", threshold, "The dominance matrix produced no observations");
  }

  const strongest = [...context.dominance.rows].sort(
    (left, right) => right.minimumWinShare - left.minimumWinShare,
  )[0];
  if (strongest === undefined) {
    return notEvaluated("no_dominant_composition", threshold, "The dominance matrix produced no rows");
  }

  return {
    key: "no_dominant_composition",
    status: strongest.minimumWinShare <= TACTICAL_SHAPE_THRESHOLDS.maxMeanWinShareAgainstField ? "pass" : "fail",
    observations: context.dominance.matches,
    observed: strongest.minimumWinShare,
    threshold,
    detail:
      `The nearest thing to a dominant shape is ${strongest.compositionKey}, which still drops to ${strongest.minimumWinShare} `
      + `against its worst matchup while averaging ${strongest.meanWinShare} against the whole population.`,
  };
}

function evaluateAsymmetricIncoherenceCost(context: EvaluateInvariantsInput): TacticalShapeInvariantResult {
  const threshold = `worst-shape deficit / best-shape surplus >= ${TACTICAL_SHAPE_THRESHOLDS.minIncoherenceToCoherenceRatio}, both measured against the reference shape`;
  const best = bestVersusReference(context.versusReference);
  const worst = worstVersusReference(context.versusReference);
  if (best === undefined || worst === undefined) {
    return notEvaluated("asymmetric_incoherence_cost", threshold, "The versus-reference column produced no rows");
  }

  const surplus = best.winShare - 0.5;
  const deficit = 0.5 - worst.winShare;

  if (surplus <= context.versusReferenceNoiseFloor) {
    return notEvaluated(
      "asymmetric_incoherence_cost",
      threshold,
      `The best shape gains ${roundFour(surplus)} over the reference, which is inside the measurement noise floor ${context.versusReferenceNoiseFloor}. `
      + `There is no coherence reward to compare against, so the ratio is undefined rather than satisfied (largest deficit ${roundFour(deficit)} from ${worst.compositionKey}).`,
    );
  }

  const ratio = roundFour(deficit / surplus);

  return {
    key: "asymmetric_incoherence_cost",
    status: ratio >= TACTICAL_SHAPE_THRESHOLDS.minIncoherenceToCoherenceRatio ? "pass" : "fail",
    observations: best.matches + worst.matches,
    observed: ratio,
    threshold,
    detail: `${worst.compositionKey} loses ${roundFour(deficit)} win share while ${best.compositionKey} gains ${roundFour(surplus)}`,
  };
}

function bestVersusReference(
  rows: readonly TacticalShapeVersusReferenceRow[],
): TacticalShapeVersusReferenceRow | undefined {
  return [...rows].sort((left, right) => right.winShare - left.winShare)[0];
}

function worstVersusReference(
  rows: readonly TacticalShapeVersusReferenceRow[],
): TacticalShapeVersusReferenceRow | undefined {
  return [...rows].sort((left, right) => left.winShare - right.winShare)[0];
}

function evaluateQualityHierarchy(context: EvaluateInvariantsInput): TacticalShapeInvariantResult {
  const threshold = `contender win share >= ${TACTICAL_SHAPE_THRESHOLDS.minQualityHierarchyWinShare} with at least ${TACTICAL_SHAPE_THRESHOLDS.minQualityHierarchyUpsets} upset`;
  const scenario = context.qualityVersusStructure.find(
    (row) => row.scenarioKey === "contender_extreme_shape_versus_third_division",
  );
  if (scenario === undefined || scenario.series.matches === 0) {
    return notEvaluated("quality_hierarchy_survives_extreme_shape", threshold, "The scenario produced no matches");
  }

  const upsets = scenario.series.secondWins;
  const favourite = scenario.series.firstWinShare >= TACTICAL_SHAPE_THRESHOLDS.minQualityHierarchyWinShare;
  const upsetsPossible = upsets >= TACTICAL_SHAPE_THRESHOLDS.minQualityHierarchyUpsets;

  return {
    key: "quality_hierarchy_survives_extreme_shape",
    status: favourite && upsetsPossible ? "pass" : "fail",
    observations: scenario.series.matches,
    observed: scenario.series.firstWinShare,
    threshold,
    detail: `First-division contender using 3-1-6 held ${scenario.series.firstWinShare} win share over third-division 4-4-2 across ${scenario.series.matches} matches with ${upsets} upsets`,
  };
}

function evaluatePossessionClamp(context: EvaluateInvariantsInput): TacticalShapeInvariantResult {
  const threshold = `every recorded possession share stays inside [${TACTICAL_SHAPE_THRESHOLDS.possessionFloor}, ${TACTICAL_SHAPE_THRESHOLDS.possessionCeiling}] and every empty-midfield shape sits on the floor`;
  if (context.versusReference.length === 0) {
    return notEvaluated("empty_department_possession_clamp", threshold, "No possession observations were recorded");
  }

  const outOfRange = context.versusReference.filter(
    (row) =>
      row.possessionShare < TACTICAL_SHAPE_THRESHOLDS.possessionFloor - POSSESSION_TOLERANCE
      || row.possessionShare > TACTICAL_SHAPE_THRESHOLDS.possessionCeiling + POSSESSION_TOLERANCE,
  );
  const emptyMidfield = context.versusReference.filter((row) => midfieldersOf(row.compositionKey) === 0);
  const emptyMidfieldOffFloor = emptyMidfield.filter((row) => row.clampedTo !== "floor");
  const probe = context.versusReference.find((row) => row.compositionKey === "2-0-8");

  return {
    key: "empty_department_possession_clamp",
    status: outOfRange.length === 0 && emptyMidfield.length > 0 && emptyMidfieldOffFloor.length === 0 ? "pass" : "fail",
    observations: context.versusReference.length,
    observed: probe?.possessionShare ?? null,
    threshold,
    detail:
      outOfRange.length === 0 && emptyMidfieldOffFloor.length === 0
        ? `All ${emptyMidfield.length} empty-midfield shapes sat on the ${TACTICAL_SHAPE_THRESHOLDS.possessionFloor} floor against 4-4-2, 2-0-8 among them at ${probe?.possessionShare ?? "no"} share, and every other recorded share stayed inside the clamp`
        : `Possession left the clamp for ${[...outOfRange, ...emptyMidfieldOffFloor].map((row) => row.compositionKey).join(", ")}`,
  };
}

function midfieldersOf(compositionKey: TacticalShapeCompositionKey): number {
  return compositionByKey(compositionKey).midfielders;
}

/**
 * Whether equal-quality coherent and incoherent shapes still play the same match.
 *
 * This is the defect the whole phase exists to remove, so it is measured on the
 * outcome rather than on an intermediate: every declared equivalence pair runs
 * the same seeds and the same fixture identities, so results that still match
 * to the byte mean the shape reached nothing.
 *
 * Step 01 stated the threshold as "different team strength" and recorded it
 * `not_evaluated`, because at that point strength was the only carrier there
 * was. Step 03 then decided intrinsic shape lives *beside* department strength
 * precisely so that shape and suitability are not charged into it twice, which
 * makes identical strength the intended state rather than a failure. Identical
 * strength with different results is the phase's goal, and is what is asserted
 * here; the strength-collapse count stays in the detail so the original
 * observation is not lost.
 */
function evaluateDistinguishableShape(context: EvaluateInvariantsInput): TacticalShapeInvariantResult {
  const threshold =
    "every equal-quality shape pair must produce different match results; owned by Step 03 and enforced from Step 06";
  const distinct = new Set(context.strengthRows.map((row) => row.fingerprint)).size;
  if (context.equivalences.length === 0) {
    return notEvaluated("distinguishable_coherent_and_incoherent_shape", threshold, "No equivalence pair was measured");
  }

  const stillIdentical = context.equivalences.filter((row) => row.resultsIdentical);
  const matches = context.equivalences.reduce((total, row) => total + row.matches, 0);

  return {
    key: "distinguishable_coherent_and_incoherent_shape",
    status: stillIdentical.length === 0 ? "pass" : "fail",
    observations: matches,
    observed: stillIdentical.length,
    threshold,
    detail:
      stillIdentical.length === 0
        ? `All ${context.equivalences.length} equal-quality shape pairs produced different results over ${matches} matches, `
          + `while still collapsing to ${distinct} distinct strength fingerprints across ${context.strengthRows.length} `
          + `reachable compositions - which is the intended shape of the fix, not a leftover of the defect.`
        : `Still bit-identical: ${stillIdentical.map((row) => `${row.firstCompositionKey} vs ${row.secondCompositionKey}`).join(", ")}`,
  };
}

const POSSESSION_TOLERANCE = 0.000_001;

function notEvaluated(
  key: TacticalShapeInvariantKey,
  threshold: string,
  detail: string,
): TacticalShapeInvariantResult {
  return { key, status: "not_evaluated", observations: 0, observed: null, threshold, detail };
}

/* -------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* -------------------------------------------------------------------------- */

function sideFor(key: TacticalShapeCompositionKey, band: TacticalShapeQualityBand): TacticalShapeSide {
  return {
    lineup: { kind: "composition", composition: compositionByKey(key) },
    band,
    tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC,
  };
}

function formationSideFor(formationKey: FormationKey, band: TacticalShapeQualityBand): TacticalShapeSide {
  return { lineup: { kind: "formation", formationKey }, band, tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC };
}

function sideLabel(side: TacticalShapeSide): TacticalShapeSideLabel {
  return {
    compositionKey: tacticalShapeLineupKey(side.lineup),
    bandKey: side.band.bandKey,
    tacticKey: side.tactic.tacticKey,
  };
}

function orderedBands(bands: TacticalShapeQualityBands): readonly TacticalShapeQualityBand[] {
  return [
    bands.reference,
    bands.firstDivisionContender,
    bands.firstDivisionAdjacent,
    bands.firstDivisionModest,
    bands.secondDivisionMidTable,
    bands.thirdDivisionMidTable,
  ];
}

function emptyDepartmentsOf(composition: TacticalShapeComposition): readonly string[] {
  const empty: string[] = [];
  if (composition.defenders === 0) empty.push("defense");
  if (composition.midfielders === 0) empty.push("midfield");
  if (composition.attackers === 0) empty.push("attack");
  return empty;
}

function clampStateOf(possessionShare: number): "floor" | "ceiling" | "none" {
  if (Math.abs(possessionShare - TACTICAL_SHAPE_THRESHOLDS.possessionFloor) <= POSSESSION_TOLERANCE) return "floor";
  if (Math.abs(possessionShare - TACTICAL_SHAPE_THRESHOLDS.possessionCeiling) <= POSSESSION_TOLERANCE) return "ceiling";
  return "none";
}

function strengthFingerprint(strength: TeamStrength): string {
  return [strength.goalkeeper, strength.defense, strength.midfield, strength.attack, strength.overall]
    .map((value) => value.toFixed(9))
    .join("/");
}

interface MutableSideTotals {
  goals: number;
  opportunities: number;
  shots: number;
  shotsOnTarget: number;
  expectedGoals: number;
  possessionTotal: number;
  readonly chanceTypes: Record<ShotChanceType, number>;
}

interface MutableSeriesTotals {
  matches: number;
  firstWins: number;
  draws: number;
  secondWins: number;
  readonly first: MutableSideTotals;
  readonly second: MutableSideTotals;
}

function createMutableSeriesTotals(): MutableSeriesTotals {
  return {
    matches: 0,
    firstWins: 0,
    draws: 0,
    secondWins: 0,
    first: createMutableSideTotals(),
    second: createMutableSideTotals(),
  };
}

function createMutableSideTotals(): MutableSideTotals {
  return {
    goals: 0,
    opportunities: 0,
    shots: 0,
    shotsOnTarget: 0,
    expectedGoals: 0,
    possessionTotal: 0,
    chanceTypes: { open_play: 0, counter: 0, cross: 0, dead_ball: 0 },
  };
}

function accumulateSide(
  totals: MutableSideTotals,
  result: ReturnType<typeof simulateMatch>,
  telemetry: NonNullable<ReturnType<typeof simulateMatch>["stats"]["telemetry"]>,
  side: "home" | "away",
  possessionShare: number,
): void {
  totals.goals += result.stats[side].goals;
  totals.opportunities += result.stats[side].opportunities;
  totals.shots += telemetry.stats[side].shots;
  totals.shotsOnTarget += telemetry.stats[side].shotsOnTarget;
  totals.expectedGoals += telemetry.stats[side].expectedGoals;
  totals.possessionTotal += possessionShare;

  for (const event of result.events) {
    if (event.type === "shot_outcome" && event.side === side) {
      totals.chanceTypes[event.chanceType] += 1;
    }
  }
}

function finalizeSideTotals(totals: MutableSideTotals, matches: number): TacticalShapeSeriesSideTotals {
  return {
    goals: totals.goals,
    opportunities: totals.opportunities,
    shots: totals.shots,
    shotsOnTarget: totals.shotsOnTarget,
    expectedGoals: roundFour(totals.expectedGoals),
    possessionShare: roundFour(totals.possessionTotal / matches),
    chanceTypes: { ...totals.chanceTypes },
  };
}

function assertValidComposition(composition: TacticalShapeComposition): void {
  const values = [composition.defenders, composition.midfielders, composition.attackers];
  if (values.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new TacticalShapeAuditError(
      "invalid_composition",
      `Composition counts must be non-negative safe integers: ${tacticalShapeCompositionKey(composition)}`,
    );
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total !== TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT) {
    throw new TacticalShapeAuditError(
      "invalid_composition",
      `Composition must use exactly ${TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT} outfield slots: ${tacticalShapeCompositionKey(composition)} uses ${total}`,
    );
  }
}

function assertValidBand(band: TacticalShapeQualityBand): void {
  if (band.bandKey.length === 0) {
    throw new TacticalShapeAuditError("invalid_band", "Quality band requires a non-empty bandKey");
  }
  for (const [department, value] of [
    ["goalkeeper", band.goalkeeper],
    ["defense", band.defense],
    ["midfield", band.midfield],
    ["attack", band.attack],
  ] as const) {
    if (!Number.isFinite(value) || value <= 0 || value > 20) {
      throw new TacticalShapeAuditError(
        "invalid_band",
        `Quality band ${band.bandKey}.${department} must sit inside (0, 20]: ${value}`,
      );
    }
  }
}

function assertPositiveSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TacticalShapeAuditError("invalid_input", `${label} must be a positive safe integer: ${value}`);
  }
}

function assertNonEmpty(value: string, label: string): void {
  if (value.length === 0) {
    throw new TacticalShapeAuditError("invalid_input", `${label} must not be empty`);
  }
}

function stableToken(value: string): string {
  return hashStringToSeedWords(value)
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("")
    .slice(0, 16);
}

function stableHash(value: unknown): string {
  return hashStringToSeedWords(JSON.stringify(value))
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}

function roundFour(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
