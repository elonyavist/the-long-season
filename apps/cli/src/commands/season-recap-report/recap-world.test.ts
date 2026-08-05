import { describe, expect, it } from "vitest";
import { formationForClub } from "@game/simulation-tools";

import {
  createSeasonRecapPartitions,
  runSeasonRecapPartition,
  runSeasonRecapWorld,
  seasonRecapWorldSeed,
} from "./recap-world.ts";

describe("createSeasonRecapPartitions", () => {
  it("covers every world index exactly once", () => {
    const partitions = createSeasonRecapPartitions(20, 7);
    const covered = partitions.flatMap((partition) =>
      Array.from(
        { length: partition.endIndex - partition.startIndex + 1 },
        (_value, offset) => partition.startIndex + offset,
      ),
    );

    expect(covered).toStrictEqual(Array.from({ length: 20 }, (_value, index) => index + 1));
  });

  it("does not emit an empty partition when workers outnumber worlds", () => {
    // An empty partition starts a worker that simulates nothing and returns
    // nothing, which costs a thread and reports as a healthy run.
    const partitions = createSeasonRecapPartitions(3, 7);

    expect(partitions).toHaveLength(3);
    for (const partition of partitions) {
      expect(partition.endIndex).toBeGreaterThanOrEqual(partition.startIndex);
    }
  });

  it("splits evenly and puts the remainder first", () => {
    expect(createSeasonRecapPartitions(5, 2)).toStrictEqual([
      { startIndex: 1, endIndex: 3 },
      { startIndex: 4, endIndex: 5 },
    ]);
  });
});

describe("seasonRecapWorldSeed", () => {
  it("pads the index so seeds sort in world order", () => {
    expect(seasonRecapWorldSeed("probe", 7)).toBe("probe-world-00007");
  });
});

describe("runSeasonRecapPartition", () => {
  it("records a world it could not finish instead of losing the whole partition", () => {
    // `seasonCount: 0` is refused by the long-run runner, which is a cheap way
    // to make a world fail for certain. What matters is the shape of the
    // answer: the partition returns, and the failure is named.
    const result = runSeasonRecapPartition({
      reportKind: "season-recap",
      seedPrefix: "recap-partition-test",
      seasonCount: 0,
      language: "en",
      startIndex: 1,
      endIndex: 2,
    });

    expect(result.ok).toBe(true);
    expect(result.worlds).toHaveLength(0);
    expect(result.failures).toHaveLength(2);
    expect(result.failures[0]?.seed).toBe("recap-partition-test-world-00001");
    expect(result.failures[0]?.message).not.toBe("");
  });
});

describe("runSeasonRecapWorld", () => {
  // One real world of one real season. Slow on purpose: it is the only check
  // that the shape chart reports the shape the season was actually played in.
  const world = runSeasonRecapWorld({
    worldIndex: 1,
    seedPrefix: "recap-world-test",
    seasonCount: 1,
    language: "en",
  });

  it("reports one season with all four charts", () => {
    const season = world.seasons[0];

    expect(world.seasons).toHaveLength(1);
    expect(season?.recap.table.length).toBe(world.clubCount);
    expect(season?.recap.topScorers.length).toBeGreaterThan(0);
    expect(season?.recap.topAssists.length).toBeGreaterThan(0);
    expect(season?.recap.shapes.length).toBeGreaterThan(0);
  });

  it("reports the shape every club was actually set up in", () => {
    // The season input and the chart resolve the formation independently. If
    // they ever disagreed, the chart would report football that was never
    // played, and every shape conclusion after it would be worthless.
    const season = world.seasons[0];
    const expected = new Map<string, number>();

    for (const row of season?.recap.table ?? []) {
      const formation = formationForClub(world.seed, row.clubId);
      expected.set(formation, (expected.get(formation) ?? 0) + 1);
    }

    for (const shape of season?.recap.shapes ?? []) {
      expect(shape.clubCount).toBe(expected.get(shape.formation));
    }
    expect(season?.recap.shapes.reduce((sum, shape) => sum + shape.clubCount, 0))
      .toBe(world.clubCount);
  });

  it("fields more than one shape, which the fixed report path never did", () => {
    expect(world.seasons[0]?.recap.facts.distinctFormations).toBeGreaterThan(1);
  });

  it("traces squad quality once per season", () => {
    const row = world.abilityTrace[0];

    expect(world.abilityTrace).toHaveLength(1);
    expect(row?.abilitySpread).toBeCloseTo(
      (row?.topClubAbility ?? 0) - (row?.bottomClubAbility ?? 0),
      3,
    );
    // Nobody has left yet after one season's refresh, so the opening squads are
    // still most of the league. A trace that read 0 here would be measuring the
    // wrong set of players.
    expect(row?.originalPlayerShare).toBeGreaterThan(0.5);
  });

  it("is deterministic from its seed", () => {
    const again = runSeasonRecapWorld({
      worldIndex: 1,
      seedPrefix: "recap-world-test",
      seasonCount: 1,
      language: "en",
    });

    expect(again).toStrictEqual(world);
  });
});
