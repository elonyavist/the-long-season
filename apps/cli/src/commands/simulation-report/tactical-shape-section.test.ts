import { describe, expect, it } from "vitest";

import {
  createTacticalShapeSectionFacts,
  measureTacticalShapeQualityBands,
} from "./tactical-shape-section.ts";

describe("tactical-shape canonical section", () => {
  it("measures ordered bands from the generated three-division world", () => {
    const measurement = measureTacticalShapeQualityBands("tactical-shape-measurement-test");
    const { bands, provenance } = measurement;

    expect(bands.firstDivisionContender.attack).toBeGreaterThan(bands.thirdDivisionMidTable.attack);
    expect(bands.firstDivisionModest.midfield).toBeGreaterThan(bands.secondDivisionMidTable.midfield);
    expect(bands.secondDivisionMidTable.defense).toBeGreaterThan(bands.thirdDivisionMidTable.defense);
    expect(provenance.first_division_contender?.divisionRank).toBe(1);
    expect(provenance.third_division_mid_table?.divisionSize).toBeGreaterThan(2);
    expect(bands.reference.defense).toBe(bands.reference.attack);
    expect(bands.reference.midfield).toBe(bands.reference.goalkeeper);
  });

  it("measures the same bands twice for the same world seed", () => {
    const run = () => measureTacticalShapeQualityBands("tactical-shape-measurement-test").bands;
    expect(run()).toEqual(run());
  });

  it(
    "hands measured bands to the unchanged audit population",
    () => {
      const facts = createTacticalShapeSectionFacts({
        worldSeed: "tactical-shape-bundle-test",
        seedPrefix: "tactical-shape-bundle-test",
        pairedSeedCount: 1,
        scenarioPairedSeedCount: 1,
        formationPairedSeedCount: 1,
      });

      expect(facts.report.bands).toEqual([
        facts.measurement.bands.reference,
        facts.measurement.bands.firstDivisionContender,
        facts.measurement.bands.firstDivisionAdjacent,
        facts.measurement.bands.firstDivisionModest,
        facts.measurement.bands.secondDivisionMidTable,
        facts.measurement.bands.thirdDivisionMidTable,
      ]);
      expect(facts.report.strengthRows).toHaveLength(66);
      expect(facts.report.dominance.compositionKeys).toHaveLength(66);
      expect(facts.report.formationDominance.formationKeys).toHaveLength(23);
      expect(facts.report.formationDominance.counterMoves).toHaveLength(23);
    },
    60_000,
  );
});
