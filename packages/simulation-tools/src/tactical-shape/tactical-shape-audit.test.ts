import type { MatchEngineConfig } from "@game/engine";
import { describe, expect, it } from "vitest";

import {
  buildTacticalShapeTeamContext,
  deriveTacticalShapeStrength,
  runTacticalShapeAudit,
  runTacticalShapeSeries,
  tacticalShapeCompositionKey,
  TacticalShapeAuditError,
  TACTICAL_SHAPE_COMPOSITIONS,
  TACTICAL_SHAPE_EXTREME_COMPOSITION_KEYS,
  TACTICAL_SHAPE_LINEUP_SLOT_COUNT,
  TACTICAL_SHAPE_NEUTRAL_TACTIC,
  TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT,
  TACTICAL_SHAPE_PRESET_COMPOSITION_KEYS,
  TACTICAL_SHAPE_THRESHOLDS,
  type RunTacticalShapeAuditInput,
  type TacticalShapeComposition,
  type TacticalShapeCompositionKey,
  type TacticalShapeQualityBand,
  type TacticalShapeQualityBands,
} from "../index.ts";
import { matchTacticsCalibrationFixture } from "../test-fixtures/match-tactics-calibration.ts";


const CALIBRATION = matchTacticsCalibrationFixture();

const ENGINE_CONFIG: MatchEngineConfig = {
  minuteCount: 90,
  rates: { baseOpportunityRatePerMinute: 0.06, maxOpportunityRatePerMinute: 0.2 },
  conversionBands: [
    { bandKey: "low", minQualityInclusive: 0, maxQualityExclusive: 0.35, goalProbability: 0.04 },
    { bandKey: "medium", minQualityInclusive: 0.35, maxQualityExclusive: 0.7, goalProbability: 0.12 },
    { bandKey: "high", minQualityInclusive: 0.7, maxQualityExclusive: 1.01, goalProbability: 0.3 },
  ],
  homeAdvantageFactor: 1.05,
  tacticalDistributionCaps: {
    directness: { minInclusive: 0, maxInclusive: 1 },
    pressing: { minInclusive: 0, maxInclusive: 1 },
    width: { minInclusive: 0, maxInclusive: 1 },
    risk: { minInclusive: 0, maxInclusive: 1 },
  },
};

function band(bandKey: string, value: number): TacticalShapeQualityBand {
  return { bandKey, goalkeeper: value, defense: value, midfield: value, attack: value };
}

const BANDS: TacticalShapeQualityBands = {
  reference: band("reference", 12),
  firstDivisionContender: band("first_division_contender", 16),
  firstDivisionAdjacent: band("first_division_adjacent", 15.5),
  firstDivisionModest: band("first_division_modest", 14),
  secondDivisionMidTable: band("second_division_mid_table", 11),
  thirdDivisionMidTable: band("third_division_mid_table", 9),
};

function compositionFor(key: TacticalShapeCompositionKey): TacticalShapeComposition {
  const found = TACTICAL_SHAPE_COMPOSITIONS.find(
    (composition) => tacticalShapeCompositionKey(composition) === key,
  );
  if (found === undefined) throw new Error(`Missing composition ${key}`);
  return found;
}

function sideFor(key: TacticalShapeCompositionKey, quality: TacticalShapeQualityBand = BANDS.reference) {
  return {
    lineup: { kind: "composition" as const, composition: compositionFor(key) },
    band: quality,
    tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC,
  };
}

const AUDIT_INPUT: RunTacticalShapeAuditInput = {
  engineConfig: ENGINE_CONFIG,
  matchTacticsCalibration: CALIBRATION,
  bands: BANDS,
  seedPrefix: "tactical-shape-test",
  pairedSeedCount: 1,
  scenarioPairedSeedCount: 8,
  dominanceCompositionKeys: ["4-4-2", "3-1-6", "2-0-8", "0-0-10"],
};

describe("tactical shape composition space", () => {
  it("enumerates every reachable department composition exactly once", () => {
    const keys = TACTICAL_SHAPE_COMPOSITIONS.map(tacticalShapeCompositionKey);

    expect(TACTICAL_SHAPE_COMPOSITIONS).toHaveLength(66);
    expect(new Set(keys).size).toBe(66);
    for (const composition of TACTICAL_SHAPE_COMPOSITIONS) {
      expect(composition.defenders + composition.midfielders + composition.attackers).toBe(
        TACTICAL_SHAPE_OUTFIELD_SLOT_COUNT,
      );
    }
  });

  it("contains every extreme shape a manager can build on the board", () => {
    const keys = new Set(TACTICAL_SHAPE_COMPOSITIONS.map(tacticalShapeCompositionKey));

    for (const extreme of TACTICAL_SHAPE_EXTREME_COMPOSITION_KEYS) {
      expect(keys.has(extreme)).toBe(true);
    }
  });

  it("records that the named presets cover only part of the reachable population", () => {
    const presets = new Set(TACTICAL_SHAPE_PRESET_COMPOSITION_KEYS);

    expect(presets.size).toBeGreaterThan(0);
    expect(presets.size).toBeLessThan(TACTICAL_SHAPE_COMPOSITIONS.length);
    for (const extreme of TACTICAL_SHAPE_EXTREME_COMPOSITION_KEYS) {
      expect(presets.has(extreme)).toBe(false);
    }
  });

  it("rejects a composition that does not fill the outfield", () => {
    expect(() =>
      buildTacticalShapeTeamContext(
        {
          lineup: { kind: "composition", composition: { defenders: 4, midfielders: 4, attackers: 1 } },
          band: BANDS.reference,
          tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC,
        },
        "home",
        CALIBRATION,
      ),
    ).toThrow(TacticalShapeAuditError);
  });

  it("rejects a quality band outside the ability scale", () => {
    expect(() =>
      buildTacticalShapeTeamContext({ ...sideFor("4-4-2"), band: band("broken", 21) }, "home", CALIBRATION),
    ).toThrow(TacticalShapeAuditError);
  });
});

describe("tactical shape team context", () => {
  it("always composes a complete eleven with one goalkeeper", () => {
    for (const key of ["4-4-2", "0-0-10", "10-0-0", "0-10-0"] as const) {
      const team = buildTacticalShapeTeamContext(sideFor(key), "home", CALIBRATION);

      expect(team.lineup).toHaveLength(TACTICAL_SHAPE_LINEUP_SLOT_COUNT);
      expect(team.lineup.filter((slot) => slot.canonicalRole === "goalkeeper")).toHaveLength(1);
      expect(new Set(team.lineup.map((slot) => slot.playerId)).size).toBe(TACTICAL_SHAPE_LINEUP_SLOT_COUNT);
    }
  });

  it("scores an empty department as zero and a populated one at the band value", () => {
    const strength = deriveTacticalShapeStrength(sideFor("2-0-8"), CALIBRATION);

    expect(strength.midfield).toBe(0);
    expect(strength.defense).toBeCloseTo(12, 9);
    expect(strength.attack).toBeCloseTo(12, 9);
    expect(strength.goalkeeper).toBeCloseTo(12, 9);
  });

  it("collapses every fully populated composition onto one team strength", () => {
    const populated = TACTICAL_SHAPE_COMPOSITIONS.filter(
      (composition) => composition.defenders > 0 && composition.midfielders > 0 && composition.attackers > 0,
    );
    const fingerprints = new Set(
      populated.map((composition) => {
        const strength = deriveTacticalShapeStrength({
          lineup: { kind: "composition", composition },
          band: BANDS.reference,
          tactic: TACTICAL_SHAPE_NEUTRAL_TACTIC,
        }, CALIBRATION);
        return [strength.goalkeeper, strength.defense, strength.midfield, strength.attack, strength.overall].join("/");
      }),
    );

    expect(populated).toHaveLength(36);
    expect(fingerprints.size).toBe(1);
  });
});

describe("tactical shape paired series", () => {
  it("plays each seed twice with the venues swapped and keeps a positive denominator", () => {
    const series = runTacticalShapeSeries({
      first: sideFor("4-4-2"),
      second: sideFor("3-1-6"),
      engineConfig: ENGINE_CONFIG,
      matchTacticsCalibration: CALIBRATION,
      seedPrefix: "series-test",
      pairedSeedCount: 3,
    });

    expect(series.matches).toBe(6);
    expect(series.firstWins + series.draws + series.secondWins).toBe(6);
    // The report rounds this share to four decimals, so it can only equal the
    // exact quotient when the quotient happens to land on four decimals - five
    // of the thirteen results a six-match series can produce. Asserting to nine
    // places was asserting which of those thirteen came out.
    expect(series.firstWinShare).toBeCloseTo((series.firstWins + series.draws / 2) / 6, 3);
  });

  it("is reproducible for identical input", () => {
    const run = () =>
      runTacticalShapeSeries({
        first: sideFor("4-4-2"),
        second: sideFor("5-3-2"),
        engineConfig: ENGINE_CONFIG,
        matchTacticsCalibration: CALIBRATION,
        seedPrefix: "series-test",
        pairedSeedCount: 2,
      });

    expect(run()).toEqual(run());
  });

  it("puts a series on the overridden stream rather than on its own", () => {
    // The override is what lets two different shapes be measured against the
    // same random world. It used to be provable by two shapes producing
    // identical results, which is exactly the defect the phase removed, so what
    // is left to assert is the mechanism: the override decides the seed, and
    // nothing else about the run changed.
    const run = (scenarioKeyOverride?: string) =>
      runTacticalShapeSeries({
        first: sideFor("3-1-6"),
        second: sideFor("4-4-2"),
        engineConfig: ENGINE_CONFIG,
        matchTacticsCalibration: CALIBRATION,
        seedPrefix: "series-test",
        pairedSeedCount: 2,
        ...(scenarioKeyOverride === undefined ? {} : { scenarioKeyOverride }),
      });

    expect(run("shared-identity")).toEqual(run("shared-identity"));
    expect(run("shared-identity")).not.toEqual(run());
  });

  it("separates two shapes onto different streams when no override is given", () => {
    const run = (key: TacticalShapeCompositionKey) =>
      runTacticalShapeSeries({
        first: sideFor(key),
        second: sideFor("4-4-2"),
        engineConfig: ENGINE_CONFIG,
        matchTacticsCalibration: CALIBRATION,
        seedPrefix: "series-test",
        pairedSeedCount: 2,
      });

    expect(run("3-1-6")).not.toEqual(run("5-4-1"));
  });

  it("rejects a non-positive seed pair count", () => {
    expect(() =>
      runTacticalShapeSeries({
        first: sideFor("4-4-2"),
        second: sideFor("4-4-2"),
        engineConfig: ENGINE_CONFIG,
        matchTacticsCalibration: CALIBRATION,
        seedPrefix: "series-test",
        pairedSeedCount: 0,
      }),
    ).toThrow(TacticalShapeAuditError);
  });
});

describe("tactical shape audit report", () => {
  const report = runTacticalShapeAudit(AUDIT_INPUT);

  // A second full audit, not an assertion on a cached one: comparing two
  // independent runs is what reproducibility means here. It measures 3301ms
  // idle, so vitest's 5000ms default left too little headroom and the test
  // failed under full-suite parallelism while passing in isolation. The budget
  // is a harness limit, not a behaviour threshold - the input, the seeds and
  // the compared hash are unchanged.
  it("is reproducible", () => {
    expect(runTacticalShapeAudit(AUDIT_INPUT).structuredHash).toBe(report.structuredHash);
  }, 7_000);

  it("records the current department collapse over the whole reachable population", () => {
    expect(report.strengthRows).toHaveLength(66);
    expect(report.distinctStrengthCount).toBe(7);
  });

  it("proves that 4-4-2 and 3-1-6 play different matches at identical strength", () => {
    // The defect the phase exists to remove, stated where it was first proved.
    // Identical strength is now the *intended* state: Step 03 put intrinsic
    // shape beside department strength so neither shape nor suitability is
    // charged into it twice. What may no longer be identical is the football.
    const equivalence = report.equivalences.find(
      (row) => row.firstCompositionKey === "4-4-2" && row.secondCompositionKey === "3-1-6",
    );

    expect(equivalence?.strengthIdentical).toBe(true);
    expect(equivalence?.resultsIdentical).toBe(false);
    expect(equivalence?.matches).toBeGreaterThan(0);
  });

  it("holds every empty-midfield shape on the frozen possession floor", () => {
    const emptyMidfield = report.versusReference.filter(
      (row) => compositionFor(row.compositionKey).midfielders === 0,
    );

    expect(emptyMidfield.length).toBeGreaterThan(0);
    for (const row of emptyMidfield) {
      expect(row.possessionShare).toBeCloseTo(TACTICAL_SHAPE_THRESHOLDS.possessionFloor, 6);
      expect(row.clampedTo).toBe("floor");
    }
  });

  it("keeps every recorded possession share inside the engine clamp", () => {
    expect(report.versusReference.length).toBeGreaterThan(0);
    for (const row of report.versusReference) {
      expect(row.possessionShare).toBeGreaterThanOrEqual(TACTICAL_SHAPE_THRESHOLDS.possessionFloor - 1e-6);
      expect(row.possessionShare).toBeLessThanOrEqual(TACTICAL_SHAPE_THRESHOLDS.possessionCeiling + 1e-6);
    }
  });

  it("fills the dominance matrix symmetrically without touching the diagonal twice", () => {
    const { compositionKeys, winShare } = report.dominance;

    expect(winShare).toHaveLength(compositionKeys.length);
    for (let row = 0; row < compositionKeys.length; row += 1) {
      expect(winShare[row]).toHaveLength(compositionKeys.length);
      for (let column = row + 1; column < compositionKeys.length; column += 1) {
        const forward = (winShare[row] as readonly number[])[column] as number;
        const reverse = (winShare[column] as readonly number[])[row] as number;
        expect(forward + reverse).toBeCloseTo(1, 6);
      }
    }
    expect(report.dominance.matches).toBeGreaterThan(0);
  });

  it("gives every invariant a positive denominator or an explicit not_evaluated", () => {
    expect(report.invariants.length).toBeGreaterThan(0);
    for (const invariant of report.invariants) {
      if (invariant.status === "not_evaluated") {
        expect(invariant.detail.length).toBeGreaterThan(0);
        continue;
      }
      expect(invariant.observations).toBeGreaterThan(0);
      expect(invariant.observed).not.toBeNull();
      expect(invariant.threshold.length).toBeGreaterThan(0);
    }
  });

  it("measures every tactic profile against every other one at the same shape", () => {
    const matrix = report.tacticDominance;
    expect(matrix.tacticKeys).toEqual([
      "neutral",
      "high_pressing",
      "direct_play",
      "flank_overload",
      "high_risk",
      "low_block",
    ]);
    expect(matrix.rows.map((row) => row.tacticKey)).toEqual(matrix.tacticKeys);
    expect(matrix.matches).toBeGreaterThan(0);

    for (const row of matrix.rows) {
      expect(row.matches).toBeGreaterThan(0);
      expect(row.opportunities).toBeGreaterThan(0);
      expect(row.opportunitiesConceded).toBeGreaterThan(0);
      // A penalty counts as an opportunity but only emits a shot event when it is
      // scored, so the typed chances are a subset of the opportunity count.
      const chances = Object.values(row.chanceTypes).reduce((sum, value) => sum + value, 0);
      expect(chances).toBeGreaterThan(0);
      expect(chances).toBeLessThanOrEqual(row.opportunities);
    }
  });

  it("keeps the tactic matrix mirrored and never plays a profile against itself", () => {
    const { tacticKeys, winShare } = report.tacticDominance;

    for (const [row] of tacticKeys.entries()) {
      expect(winShare[row]?.[row]).toBe(0.5);
      for (let column = row + 1; column < tacticKeys.length; column += 1) {
        const forward = winShare[row]?.[column] as number;
        const mirrored = winShare[column]?.[row] as number;
        expect(forward + mirrored).toBeCloseTo(1, 4);
      }
    }
  });

  it("gates tactics on the strongest profile against the field, never on a mirror match", () => {
    // The twin of `no_dominant_composition`, and the reason the whole matrix is
    // played rather than only each profile against neutral. A slider that beats
    // the field is not a decision: it is found once and never touched again.
    //
    // Whether the *shipped* numbers satisfy it is not asked here and cannot be:
    // this file runs a deliberately small engine config at `8` seed pairs, so a
    // cell carries `16` matches and the field mean carries `80`. That is a
    // standard error of `0.056` against a threshold `0.05` above even, which
    // would make the assertion a reading of sampling noise. The shipped
    // calibration is measured at the baseline sample count and recorded in the
    // step document, exactly as the shape gate is. What is asserted here is
    // that the gate reads the right number.
    const invariant = report.invariants.find((row) => row.key === "no_dominant_tactic");
    const means = report.tacticDominance.rows.map((row) => row.meanWinShareAgainstField);

    expect(invariant?.status).not.toBe("not_evaluated");
    expect(invariant?.observed).toBe(Math.max(...means));
    expect(invariant?.observed).toBeGreaterThan(Math.min(...means));
    expect(invariant?.observations).toBe(report.tacticDominance.matches);
    expect(invariant?.threshold).toContain(
      String(TACTICAL_SHAPE_THRESHOLDS.maxTacticMeanWinShareAgainstField),
    );
  });

  it("leaves no chance type structurally impossible for a tactic", () => {
    // This replaces an assertion that a low block produced exactly zero crosses
    // and zero counters. That was true of the texture inference it recorded:
    // chance type was read from width and directness against thresholds, so a
    // side below them could never be credited with those chances at all.
    //
    // Chance type now names the route a chance came down, and routes are a
    // weighted draw, so a deep block breaking down one flank is possible - it
    // is simply rarer. Each profile plays too few matches here for the counts
    // to rank profiles against each other; `opportunity-route.test.ts` owns
    // that claim at model level, where it is not a sampling question. What this
    // report can state is that no tactic is locked out of a chance type.
    for (const row of report.tacticDominance.rows) {
      expect(row.chanceTypes.cross).toBeGreaterThan(0);
      expect(row.chanceTypes.counter).toBeGreaterThan(0);
      expect(row.chanceTypes.open_play).toBeGreaterThan(0);
    }
  });

  it("prices incoherence against a yardstick that exists rather than against itself", () => {
    // A9 retired `asymmetric_incoherence_cost`, which divided the worst shape's
    // deficit by the best shape's surplus. The surplus is inside the noise floor
    // at every calibration ever measured, because in a population of ten central
    // clones the reference `4-4-2` is already the optimum - so the ratio had no
    // denominator and could never be evaluated. The half that is a design claim
    // survives against the division-tier edge, and its pair with the bounded
    // swing is the asymmetry: gain at most `0.75` of a tier, lose at least `1`.
    // Whether the shipped numbers clear it is measured at baseline scale and
    // recorded in the step document, as for every other numeric invariant: this
    // file's `8` seed pairs put a `0.3375` noise floor in front of a tier edge
    // of about a quarter, so both tier-edge invariants report `not_evaluated`
    // here and asserting a pass would be asserting noise.
    const invariant = report.invariants.find((row) => row.key === "incoherence_costs_a_division_tier");
    const swing = report.invariants.find((row) => row.key === "bounded_structural_swing");

    // Both halves of the asymmetry read the same yardstick, so they must agree
    // on whether it is measurable at all. Disagreement means one of them stopped
    // reading the division-tier scenario.
    expect(invariant?.status === "not_evaluated").toBe(swing?.status === "not_evaluated");
    expect(invariant?.threshold).toContain("division-tier edge");
    if (invariant?.status !== "not_evaluated") {
      expect(invariant?.observed).toBeGreaterThanOrEqual(
        TACTICAL_SHAPE_THRESHOLDS.minIncoherenceCostShareOfTierEdge,
      );
    }

    // The asymmetry is now this ordering rather than a ratio: incoherence must
    // cost more than coherence may pay, both against a quantity that exists.
    expect(TACTICAL_SHAPE_THRESHOLDS.minIncoherenceCostShareOfTierEdge).toBeGreaterThan(
      TACTICAL_SHAPE_THRESHOLDS.maxStructuralSwingShareOfTierEdge,
    );
  });

  it("reads the shape distinction from results rather than from strength", () => {
    const invariant = report.invariants.find(
      (row) => row.key === "distinguishable_coherent_and_incoherent_shape",
    );

    expect(invariant?.status).toBe("pass");
    expect(invariant?.observed).toBe(0);
    expect(invariant?.observations).toBeGreaterThan(0);
  });

  it("rejects a non-positive scenario seed pair count", () => {
    expect(() => runTacticalShapeAudit({ ...AUDIT_INPUT, scenarioPairedSeedCount: 0 })).toThrow(
      TacticalShapeAuditError,
    );
  });
});
