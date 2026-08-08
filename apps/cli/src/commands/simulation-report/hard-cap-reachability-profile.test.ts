import assert from "node:assert/strict";
import { test } from "vitest";

import { createFakeDomesticWorld, selectPlayerValuationConfig } from "@game/content";
import type { PlayerGenerationCapSummary, PlayerGenerationEconomyObservation } from "@game/simulation-tools";

import { phase80AInitialWorldObservations } from "../simulation-report/career-world-facts.ts";

import {
  createHardCapReachabilityProfileFactsFromWorlds,
  createHardCapReachabilityRow,
  hardCapProximityBandEdge,
  hardCapReachabilityWorldItems,
  HARD_CAP_REACHABILITY_SEED_PREFIXES,
  HARD_CAP_REACHABILITY_WORKER_COUNT,
  HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX,
  partitionWorldItems,
  reconcileHardCapReachabilityRows,
  type HardCapReachabilityRow,
  type HardCapReachabilitySnapshot,
} from "./hard-cap-reachability-profile.ts";

const HARD_CAP = 250_000_000;

/**
 * Builds one observation with only the fields the cap counters read.
 *
 * The rest of the economy observation is irrelevant here and filling it in
 * would suggest the probe depends on it.
 */
function observation(input: {
  readonly publicValueMinorUnits: number;
  readonly hardCapEligible: boolean;
  readonly seasonStartYear?: number;
}): PlayerGenerationEconomyObservation {
  return {
    observationId: `obs-${input.publicValueMinorUnits}-${String(input.hardCapEligible)}`,
    worldId: "world",
    playerId: `player-${input.publicValueMinorUnits}`,
    playerName: "Test Player",
    age: 24,
    seasonStartYear: input.seasonStartYear ?? 2025,
    division: "free_agent",
    population: "free_agent",
    clubCompetitiveTier: null,
    squadPlacement: "unattached",
    roleGroup: "outfield",
    currentRating: 5,
    storedPotentialCeilingRating: 5,
    publicPotentialP50Rating: 5,
    publicPotentialUpperRating: 5,
    publicValueMinorUnits: input.publicValueMinorUnits,
    archetype: "test",
    hardCapEligible: input.hardCapEligible,
  };
}

function row(
  observations: readonly PlayerGenerationEconomyObservation[],
  snapshot: HardCapReachabilitySnapshot = "closing",
): HardCapReachabilityRow {
  return createHardCapReachabilityRow({
    seedPrefix: "phase81a-hardcap-a",
    worldSeed: "phase81a-hardcap-a-world-00001",
    snapshot,
    observations,
    hardCapMinorUnits: HARD_CAP,
    calibrationVersionBundle: "valuationCurvesVersion=v7",
  });
}

test("band edges are integer minor units floored from basis points of the cap", () => {
  assert.equal(hardCapProximityBandEdge(HARD_CAP, 100), HARD_CAP - 2_500_000);
  assert.equal(hardCapProximityBandEdge(HARD_CAP, 500), HARD_CAP - 12_500_000);
  // Floor, not round: an odd cap must not push the edge upward and shrink the
  // band, because that would silently drop observations that are inside it.
  assert.equal(hardCapProximityBandEdge(9_999, 100), 9_999 - 99);
});

test("the proximity bands are nested, so within100 never exceeds within500", () => {
  // The declared invariant. `within100 > within500` is a bug, not a finding,
  // and this is the only place that can catch it before the artifact is read.
  const built = row([
    observation({ publicValueMinorUnits: HARD_CAP, hardCapEligible: true }),
    observation({ publicValueMinorUnits: HARD_CAP - 2_500_000, hardCapEligible: true }),
    observation({ publicValueMinorUnits: HARD_CAP - 2_500_001, hardCapEligible: true }),
    observation({ publicValueMinorUnits: HARD_CAP - 12_500_000, hardCapEligible: true }),
    observation({ publicValueMinorUnits: HARD_CAP - 12_500_001, hardCapEligible: true }),
  ]);

  assert.equal(built.within100BasisPointsCount, 2);
  assert.equal(built.within500BasisPointsCount, 4);
  assert.ok(built.within100BasisPointsCount <= built.within500BasisPointsCount);
});

test("both band bounds are inclusive and an exact hit counts in both bands", () => {
  const built = row([observation({ publicValueMinorUnits: HARD_CAP, hardCapEligible: true })]);

  assert.equal(built.eligibleExactHardCapCount, 1);
  assert.equal(built.within100BasisPointsCount, 1);
  assert.equal(built.within500BasisPointsCount, 1);
});

test("an ineligible player on the cap is a structural violation, not a hit", () => {
  const built = row([
    observation({ publicValueMinorUnits: HARD_CAP, hardCapEligible: false }),
    // 49 minor units below the cap rounds to the same displayed hundred.
    observation({ publicValueMinorUnits: HARD_CAP - 49, hardCapEligible: false }),
  ]);

  assert.equal(built.eligibleObservationCount, 0);
  assert.equal(built.eligibleExactHardCapCount, 0);
  assert.equal(built.ineligibleExactHardCapCount, 1);
  assert.equal(built.ineligibleRenderedAsHardCapCount, 2);
});

test("a value above the cap is recorded on its own and never folded into a band", () => {
  const built = row([observation({ publicValueMinorUnits: HARD_CAP + 1, hardCapEligible: true })]);

  assert.equal(built.eligibleAboveHardCapCount, 1);
  assert.equal(built.within100BasisPointsCount, 0);
  assert.equal(built.within500BasisPointsCount, 0);
  assert.equal(built.eligibleExactHardCapCount, 0);
});

test("a row with no eligible player reports not_observed rather than zero", () => {
  const built = row([observation({ publicValueMinorUnits: 1_000, hardCapEligible: false })]);

  assert.equal(built.maxEligiblePublicValueMinorUnits, "not_observed");
});

test("a genuinely worthless eligible player reports zero, not not_observed", () => {
  // The distinction the previous test protects: `0` is a real public value.
  const built = row([observation({ publicValueMinorUnits: 0, hardCapEligible: true })]);

  assert.equal(built.maxEligiblePublicValueMinorUnits, 0);
});

test("a snapshot spanning two season years is refused instead of picking one", () => {
  assert.throws(
    () =>
      row([
        observation({ publicValueMinorUnits: 10, hardCapEligible: true, seasonStartYear: 2025 }),
        observation({ publicValueMinorUnits: 20, hardCapEligible: true, seasonStartYear: 2026 }),
      ]),
    /spans 2 season years/,
  );
});

test("opening plus closing rows reconcile exactly with the audit's cap facts", () => {
  const opening = row(
    [
      observation({ publicValueMinorUnits: 1_000, hardCapEligible: true }),
      observation({ publicValueMinorUnits: HARD_CAP, hardCapEligible: false }),
    ],
    "opening",
  );
  const closing = row([
    observation({ publicValueMinorUnits: HARD_CAP, hardCapEligible: true }),
    observation({ publicValueMinorUnits: 2_000, hardCapEligible: true }),
  ]);
  const cap: PlayerGenerationCapSummary = {
    observationCount: 4,
    eligibleObservationCount: 3,
    exactHardCapCount: 2,
    eligibleExactHardCapCount: 1,
    ineligibleExactHardCapCount: 1,
    ineligibleRenderedAsHardCapCount: 1,
  };

  const reconciliation = reconcileHardCapReachabilityRows({
    worldSeed: "phase81a-hardcap-a-world-00001",
    rows: [opening, closing],
    cap,
  });

  assert.deepEqual(reconciliation.mismatches, []);
  assert.equal(reconciliation.fromRows.eligibleObservationCount, 3);
  assert.equal(reconciliation.fromRows.eligibleExactHardCapCount, 1);
});

test("dropping one snapshot is caught by reconciliation rather than silently halving the corpus", () => {
  // The failure this check exists for: a probe that rebuilt only the closing
  // observations would look complete and would be measuring half a world.
  const closing = row([
    observation({ publicValueMinorUnits: HARD_CAP, hardCapEligible: true }),
    observation({ publicValueMinorUnits: 2_000, hardCapEligible: true }),
  ]);
  const cap: PlayerGenerationCapSummary = {
    observationCount: 4,
    eligibleObservationCount: 3,
    exactHardCapCount: 2,
    eligibleExactHardCapCount: 1,
    ineligibleExactHardCapCount: 1,
    ineligibleRenderedAsHardCapCount: 1,
  };

  const reconciliation = reconcileHardCapReachabilityRows({
    worldSeed: "phase81a-hardcap-a-world-00001",
    rows: [closing],
    cap,
  });

  assert.deepEqual(reconciliation.mismatches, [
    "eligibleObservationCount: rows=2 audit=3",
    "ineligibleExactHardCapCount: rows=0 audit=1",
    "ineligibleRenderedAsHardCapCount: rows=0 audit=1",
  ]);
});

test("a world that fails reconciliation withholds the outcome instead of reporting a hit", () => {
  const hit = row([observation({ publicValueMinorUnits: HARD_CAP, hardCapEligible: true })]);
  const disagreeingCap: PlayerGenerationCapSummary = {
    observationCount: 9,
    eligibleObservationCount: 9,
    exactHardCapCount: 1,
    eligibleExactHardCapCount: 1,
    ineligibleExactHardCapCount: 0,
    ineligibleRenderedAsHardCapCount: 0,
  };

  const report = createHardCapReachabilityProfileFactsFromWorlds([
    {
      seedPrefix: "phase81a-hardcap-a",
      worldSeed: "phase81a-hardcap-a-world-00001",
      rows: [hit],
      reconciliation: reconcileHardCapReachabilityRows({
        worldSeed: "phase81a-hardcap-a-world-00001",
        rows: [hit],
        cap: disagreeingCap,
      }),
    },
  ]);

  // The hit is real in the rows, and it is still not reported as FOUND: the
  // rows describe a population the audit does not, so they prove nothing.
  assert.equal(report.totals.eligibleExactHardCapCount, 1);
  assert.equal(report.outcome, "RECONCILIATION_FAILED");
});

test("the hard-cap branch is reachable on a real generated population", () => {
  // The reachability proof the probe was run to obtain. Until this existed the
  // only evidence that an eligible player can be valued exactly at the cap was
  // `player-generation-economy-audit.test.ts`, whose observations are built by
  // a fixture that sets `hardCapEligible: true` by hand: it proves the counter
  // increments, not that generation can reach the branch.
  //
  // This world came out of the preregistered corpus recorded in
  // `docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_REPORT.md`. It is an *opening*
  // observation, so no season has to be simulated to reproduce it.
  const worldSeed = "phase81a-hardcap-a-world-00004";
  const world = createFakeDomesticWorld({ worldSeed });
  const cap = selectPlayerValuationConfig(world.calibrationVersions)
    .valuationCurves.upperTail.hardCapMinorUnits;

  const observations = phase80AInitialWorldObservations(worldSeed, world);
  const eligible = observations.filter(({ hardCapEligible }) => hardCapEligible);
  const exactHits = eligible.filter(
    ({ publicValueMinorUnits }) => publicValueMinorUnits === cap,
  );

  assert.equal(eligible.length, 1);
  assert.equal(exactHits.length, 1);
  // Non-vacuity: a proof that passed with nobody eligible would prove nothing.
  assert.ok(cap > 0);
});

test("a second generated world reaches the cap, so the proof is not one seed", () => {
  const worldSeed = "phase81a-hardcap-a-world-00007";
  const world = createFakeDomesticWorld({ worldSeed });
  const cap = selectPlayerValuationConfig(world.calibrationVersions)
    .valuationCurves.upperTail.hardCapMinorUnits;

  const exactHits = phase80AInitialWorldObservations(worldSeed, world).filter(
    ({ hardCapEligible, publicValueMinorUnits }) =>
      hardCapEligible && publicValueMinorUnits === cap,
  );

  assert.equal(exactHits.length, 1);
});

test("the declared corpus is 21 worlds spread evenly over exactly 7 workers", () => {
  const items = hardCapReachabilityWorldItems();

  assert.equal(
    items.length,
    HARD_CAP_REACHABILITY_SEED_PREFIXES.length * HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX,
  );
  const partitions = partitionWorldItems(items, HARD_CAP_REACHABILITY_WORKER_COUNT);
  assert.equal(partitions.length, HARD_CAP_REACHABILITY_WORKER_COUNT);
  assert.deepEqual(partitions.map(({ length }) => length), [3, 3, 3, 3, 3, 3, 3]);
  assert.deepEqual(partitions.flat(), items);
});
