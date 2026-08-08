/**
 * Hard-cap reachability locked-profile facts.
 *
 * Answers one question and no others: on a real generated population, does an
 * eligible player's public value ever land exactly on the valuation hard cap?
 *
 * The corpus, the bands and the two outcome meanings are fixed in
 * `docs/audits/PHASE_81A_HARD_CAP_REACHABILITY_PREREGISTRATION.md` and are
 * deliberately not command-line flags. A probe whose corpus can be widened
 * after reading its own output is choosing a corpus for its answer, which is
 * the same move as relaxing a threshold.
 */
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

import { createTranslator } from "@game/i18n";
import type { PlayerGenerationCapSummary, PlayerGenerationEconomyObservation } from "@game/simulation-tools";

import {
  createCareerWorldFacts,
  type PlayerEconomyObservationSnapshots,
  type CareerWorldFacts,
} from "../simulation-report/career-world-facts.ts";

type CalibrationVersionBundle = CareerWorldFacts["league"]["calibrationVersions"];

/** Seed prefixes declared before execution. Never extend after reading output. */
export const HARD_CAP_REACHABILITY_SEED_PREFIXES = [
  "phase31-test",
  "phase81a-hardcap-a",
  "phase81a-hardcap-b",
] as const;

/** Worlds simulated per declared seed prefix. */
export const HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX = 7;

/** Seasons each world is carried through before its closing snapshot. */
export const HARD_CAP_REACHABILITY_SEASON_COUNT = 10;

/** Workers the probe runs with, matching the project's gate convention. */
export const HARD_CAP_REACHABILITY_WORKER_COUNT = 7;

/**
 * Proximity bands in basis points of the cap.
 *
 * Basis points rather than a second percent scale beside the existing one, so
 * there is one unit to read the artifact in.
 */
export const HARD_CAP_PROXIMITY_BASIS_POINTS = [100, 500] as const;

/** Which end of a world's simulation one row was observed at. */
export type HardCapReachabilitySnapshot = "opening" | "closing";

/** One observed-season row. Two per world: never a total standing in for rows. */
export interface HardCapReachabilityRow {
  /** Declared prefix this world's seed was built from. */
  readonly seedPrefix: string;
  /** Full deterministic world seed. */
  readonly worldSeed: string;
  /** Opening or closing observation of that world. */
  readonly snapshot: HardCapReachabilitySnapshot;
  /** Season start year the snapshot was taken in. */
  readonly seasonStartYear: number;
  /** Players eligible to reach the cap: the denominator. */
  readonly eligibleObservationCount: number;
  /** Eligible players whose public value equals the cap exactly. */
  readonly eligibleExactHardCapCount: number;
  /** Highest eligible public value, or `not_observed` when none was eligible. */
  readonly maxEligiblePublicValueMinorUnits: number | "not_observed";
  /** Eligible values within 100 basis points of the cap, both bounds inclusive. */
  readonly within100BasisPointsCount: number;
  /** Eligible values within 500 basis points; a superset of the 100 band. */
  readonly within500BasisPointsCount: number;
  /** Eligible values strictly above the cap: impossible, so counted not banded. */
  readonly eligibleAboveHardCapCount: number;
  /** Ineligible players sitting exactly on the cap. */
  readonly ineligibleExactHardCapCount: number;
  /** Ineligible players that render as the cap once rounded for display. */
  readonly ineligibleRenderedAsHardCapCount: number;
  /** Exact calibration bundle this row was measured under. */
  readonly calibrationVersionBundle: string;
}

/** The four counters a probe row set must reproduce from the canonical audit. */
export interface HardCapReconciledCounts {
  readonly eligibleObservationCount: number;
  readonly eligibleExactHardCapCount: number;
  readonly ineligibleExactHardCapCount: number;
  readonly ineligibleRenderedAsHardCapCount: number;
}

/** Whether one world's rows describe the same population its audit counted. */
export interface HardCapReconciliation {
  readonly worldSeed: string;
  /** Summed from this probe's own rows. */
  readonly fromRows: HardCapReconciledCounts;
  /** Read from the canonical audit for the same world. */
  readonly fromAudit: HardCapReconciledCounts;
  /** Human-readable disagreements; empty when the two agree exactly. */
  readonly mismatches: readonly string[];
}

/** One completed world: its two rows and its reconciliation verdict. */
export interface HardCapReachabilityWorld {
  readonly seedPrefix: string;
  readonly worldSeed: string;
  readonly rows: readonly HardCapReachabilityRow[];
  readonly reconciliation: HardCapReconciliation;
}

/** Full probe result, in deterministic world order. */
export interface HardCapReachabilityProfileFacts {
  readonly worlds: readonly HardCapReachabilityWorld[];
  /** `FOUND` only when an exact eligible hit exists and every world reconciles. */
  readonly outcome: "FOUND" | "NOT_FOUND" | "RECONCILIATION_FAILED";
  readonly totals: HardCapReconciledCounts;
  readonly worldSeasonCount: number;
  readonly rowCount: number;
}

/**
 * Lower edge of a proximity band, inclusive.
 *
 * Integer minor units throughout: no floating point enters a comparison whose
 * whole purpose is to distinguish "exactly the cap" from "very nearly it".
 */
export function hardCapProximityBandEdge(
  hardCapMinorUnits: number,
  basisPoints: number,
): number {
  return hardCapMinorUnits - Math.floor((hardCapMinorUnits * basisPoints) / 10_000);
}

/**
 * Builds one observed-season row from the observations of one snapshot.
 *
 * The eligible/ineligible counters repeat the canonical audit's own predicates
 * on purpose. They are the terms the reconciliation compares, so a row that
 * counted "nearly the same thing" would make the check pass while describing a
 * different population.
 */
export function createHardCapReachabilityRow(input: {
  readonly seedPrefix: string;
  readonly worldSeed: string;
  readonly snapshot: HardCapReachabilitySnapshot;
  readonly observations: readonly PlayerGenerationEconomyObservation[];
  readonly hardCapMinorUnits: number;
  readonly calibrationVersionBundle: string;
}): HardCapReachabilityRow {
  const { hardCapMinorUnits } = input;
  const eligible = input.observations.filter(({ hardCapEligible }) => hardCapEligible);
  const eligibleValues = eligible.map(({ publicValueMinorUnits }) => publicValueMinorUnits);
  const withinBand = (basisPoints: number): number => {
    const edge = hardCapProximityBandEdge(hardCapMinorUnits, basisPoints);
    return eligibleValues.filter((value) => value >= edge && value <= hardCapMinorUnits).length;
  };

  return {
    seedPrefix: input.seedPrefix,
    worldSeed: input.worldSeed,
    snapshot: input.snapshot,
    seasonStartYear: singleSeasonStartYear(input.observations, input.worldSeed, input.snapshot),
    eligibleObservationCount: eligible.length,
    eligibleExactHardCapCount: eligibleValues.filter((value) => value === hardCapMinorUnits).length,
    maxEligiblePublicValueMinorUnits:
      // Never `0`. Zero is a real public value meaning "worthless player", and a
      // row that cannot tell it from "nobody was eligible" cannot be re-read.
      eligibleValues.length === 0 ? "not_observed" : Math.max(...eligibleValues),
    within100BasisPointsCount: withinBand(100),
    within500BasisPointsCount: withinBand(500),
    eligibleAboveHardCapCount: eligibleValues.filter((value) => value > hardCapMinorUnits).length,
    ineligibleExactHardCapCount: input.observations.filter(
      ({ publicValueMinorUnits, hardCapEligible }) =>
        !hardCapEligible && publicValueMinorUnits === hardCapMinorUnits,
    ).length,
    ineligibleRenderedAsHardCapCount: input.observations.filter(
      ({ publicValueMinorUnits, hardCapEligible }) =>
        !hardCapEligible
        && Math.round(publicValueMinorUnits / 100) === Math.round(hardCapMinorUnits / 100),
    ).length,
    calibrationVersionBundle: input.calibrationVersionBundle,
  };
}

/**
 * Reconciles a world's own rows against the canonical audit's cap facts.
 *
 * A probe that can disagree with the thing it is evidence for is worth nothing,
 * so this is a failure condition and not a diagnostic. The two snapshots
 * partition exactly the observation list the audit was handed, so the sums must
 * be equal, not merely close.
 */
export function reconcileHardCapReachabilityRows(input: {
  readonly worldSeed: string;
  readonly rows: readonly HardCapReachabilityRow[];
  readonly cap: PlayerGenerationCapSummary;
}): HardCapReconciliation {
  const fromRows = sumHardCapReconciledCounts(input.rows);
  const fromAudit: HardCapReconciledCounts = {
    eligibleObservationCount: input.cap.eligibleObservationCount,
    eligibleExactHardCapCount: input.cap.eligibleExactHardCapCount,
    ineligibleExactHardCapCount: input.cap.ineligibleExactHardCapCount,
    ineligibleRenderedAsHardCapCount: input.cap.ineligibleRenderedAsHardCapCount,
  };
  const mismatches = RECONCILED_COUNT_KEYS.flatMap((key) =>
    fromRows[key] === fromAudit[key]
      ? []
      : [`${key}: rows=${fromRows[key]} audit=${fromAudit[key]}`],
  );

  return { worldSeed: input.worldSeed, fromRows, fromAudit, mismatches };
}

/** Adds the four reconciled counters across any set of rows. */
export function sumHardCapReconciledCounts(
  rows: readonly HardCapReachabilityRow[],
): HardCapReconciledCounts {
  return {
    eligibleObservationCount: sumBy(rows, ({ eligibleObservationCount }) => eligibleObservationCount),
    eligibleExactHardCapCount: sumBy(rows, ({ eligibleExactHardCapCount }) => eligibleExactHardCapCount),
    ineligibleExactHardCapCount: sumBy(rows, ({ ineligibleExactHardCapCount }) => ineligibleExactHardCapCount),
    ineligibleRenderedAsHardCapCount: sumBy(
      rows,
      ({ ineligibleRenderedAsHardCapCount }) => ineligibleRenderedAsHardCapCount,
    ),
  };
}

/**
 * Decides the probe's declared outcome from its completed worlds.
 *
 * Reconciliation is checked before the cap numbers are read at all: if the
 * probe is describing a population the audit is not, its hit count is not
 * evidence of anything and reporting it would be worse than reporting nothing.
 */
export function createHardCapReachabilityProfileFactsFromWorlds(
  worlds: readonly HardCapReachabilityWorld[],
): HardCapReachabilityProfileFacts {
  const rows = worlds.flatMap(({ rows: worldRows }) => worldRows);
  const totals = sumHardCapReconciledCounts(rows);
  const reconciled = worlds.every(({ reconciliation }) => reconciliation.mismatches.length === 0);

  return {
    worlds,
    outcome: !reconciled
      ? "RECONCILIATION_FAILED"
      : totals.eligibleExactHardCapCount > 0
        ? "FOUND"
        : "NOT_FOUND",
    totals,
    worldSeasonCount: worlds.length * HARD_CAP_REACHABILITY_SEASON_COUNT,
    rowCount: rows.length,
  };
}

/** Every declared world, in deterministic prefix-then-index order. */
export function hardCapReachabilityWorldItems(): readonly HardCapReachabilityWorldItem[] {
  return HARD_CAP_REACHABILITY_SEED_PREFIXES.flatMap((seedPrefix) =>
    Array.from({ length: HARD_CAP_REACHABILITY_WORLDS_PER_PREFIX }, (_unused, index) => ({
      seedPrefix,
      worldIndex: index + 1,
    })),
  );
}

/**
 * Runs the declared corpus across worker threads and returns the full report.
 *
 * `onWorldCompleted` exists because this run takes tens of minutes: a probe
 * that prints nothing until the end is indistinguishable from a hung one.
 */
export async function createHardCapReachabilityProfileFacts(
  onWorldCompleted?: (worldSeed: string) => void,
): Promise<HardCapReachabilityProfileFacts> {
  const partitions = partitionWorldItems(
    hardCapReachabilityWorldItems(),
    HARD_CAP_REACHABILITY_WORKER_COUNT,
  );
  const results = await Promise.all(
    partitions.map((items, index) =>
      runHardCapReachabilityWorkerThread({ items, partitionIndex: index }, onWorldCompleted),
    ),
  );

  return createHardCapReachabilityProfileFactsFromWorlds(
    results
      .sort((left, right) => left.partitionIndex - right.partitionIndex)
      .flatMap(({ worlds }) => worlds),
  );
}

/** Splits declared worlds into contiguous partitions, one per worker. */
export function partitionWorldItems(
  items: readonly HardCapReachabilityWorldItem[],
  workerCount: number,
): readonly (readonly HardCapReachabilityWorldItem[])[] {
  const partitions: (readonly HardCapReachabilityWorldItem[])[] = [];
  const baseSize = Math.floor(items.length / workerCount);
  const remainder = items.length % workerCount;
  let startIndex = 0;

  for (let index = 0; index < workerCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0);
    partitions.push(items.slice(startIndex, startIndex + size));
    startIndex += size;
  }

  return partitions;
}

/** One world the probe must simulate. */
export interface HardCapReachabilityWorldItem {
  readonly seedPrefix: string;
  readonly worldIndex: number;
}

interface HardCapReachabilityWorkerData {
  readonly items: readonly HardCapReachabilityWorldItem[];
  readonly partitionIndex: number;
}

interface HardCapReachabilityWorkerSuccess {
  readonly ok: true;
  readonly kind: "result";
  readonly partitionIndex: number;
  readonly worlds: readonly HardCapReachabilityWorld[];
}

type HardCapReachabilityWorkerMessage =
  | HardCapReachabilityWorkerSuccess
  | { readonly ok: true; readonly kind: "progress"; readonly worldSeed: string }
  | { readonly ok: false; readonly message: string };

const RECONCILED_COUNT_KEYS = [
  "eligibleObservationCount",
  "eligibleExactHardCapCount",
  "ineligibleExactHardCapCount",
  "ineligibleRenderedAsHardCapCount",
] as const satisfies readonly (keyof HardCapReconciledCounts)[];

const HARD_CAP_REACHABILITY_WORKER_KIND = "hard-cap-reachability";

/** Starts one worker for one contiguous partition of the declared corpus. */
function runHardCapReachabilityWorkerThread(
  input: HardCapReachabilityWorkerData,
  onWorldCompleted?: (worldSeed: string) => void,
): Promise<HardCapReachabilityWorkerSuccess> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./probe-data.ts", import.meta.url), {
      workerData: { reportKind: HARD_CAP_REACHABILITY_WORKER_KIND, ...input },
    });

    worker.on("message", (message: HardCapReachabilityWorkerMessage) => {
      if (!message.ok) {
        reject(new Error(message.message));
        return;
      }
      if (message.kind === "progress") {
        onWorldCompleted?.(message.worldSeed);
        return;
      }
      resolve(message);
    });
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Hard-cap reachability worker exited with code ${code}`));
      }
    });
  });
}

/**
 * Simulates one world through the canonical report and derives its two rows.
 *
 * The probe never simulates for itself. A separate simulator would measure its
 * own copy of the game, and any cap hit it found would prove nothing about the
 * one the gates read.
 */
function runHardCapReachabilityWorld(
  item: HardCapReachabilityWorldItem,
): HardCapReachabilityWorld {
  const worldSeed = `${item.seedPrefix}-world-${String(item.worldIndex).padStart(5, "0")}`;
  const report = createCareerWorldFacts(
    worldSeed,
    HARD_CAP_REACHABILITY_SEASON_COUNT,
    createTranslator("en"),
  );
  const snapshots = report.playerEconomyObservationSnapshots;
  const calibrationVersionBundle = formatCalibrationVersionBundle(report.league.calibrationVersions);
  const rows = (["opening", "closing"] as const).map((snapshot) =>
    createHardCapReachabilityRow({
      seedPrefix: item.seedPrefix,
      worldSeed,
      snapshot,
      observations: observationsFor(snapshots, snapshot),
      hardCapMinorUnits: snapshots.hardCapMinorUnits,
      calibrationVersionBundle,
    }),
  );

  return {
    seedPrefix: item.seedPrefix,
    worldSeed,
    rows,
    reconciliation: reconcileHardCapReachabilityRows({
      worldSeed,
      rows,
      cap: report.playerEconomyAudit.cap,
    }),
  };
}

function observationsFor(
  snapshots: PlayerEconomyObservationSnapshots,
  snapshot: HardCapReachabilitySnapshot,
): readonly PlayerGenerationEconomyObservation[] {
  return snapshot === "opening" ? snapshots.opening : snapshots.closing;
}

/** Renders the exact version bundle as one stable, sorted, readable string. */
function formatCalibrationVersionBundle(bundle: CalibrationVersionBundle): string {
  return Object.entries(bundle)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
}

/**
 * Reads the one season year a snapshot was taken in.
 *
 * A snapshot is a single instant, so two years inside one would mean the rows
 * are mixing populations and the artifact's row identity is a lie. That is
 * worth stopping for, not worth picking a winner from.
 */
function singleSeasonStartYear(
  observations: readonly PlayerGenerationEconomyObservation[],
  worldSeed: string,
  snapshot: HardCapReachabilitySnapshot,
): number {
  const years = [...new Set(observations.map(({ seasonStartYear }) => seasonStartYear))];
  const year = years[0];

  if (years.length !== 1 || year === undefined) {
    throw new Error(
      `${snapshot} snapshot of ${worldSeed} spans ${years.length} season years, so it is not one observed season`,
    );
  }

  return year;
}

function sumBy<TItem>(items: readonly TItem[], value: (item: TItem) => number): number {
  return items.reduce((total, item) => total + value(item), 0);
}

function isHardCapReachabilityWorkerData(
  value: unknown,
): value is HardCapReachabilityWorkerData {
  const input = value as (HardCapReachabilityWorkerData & { readonly reportKind?: string }) | undefined;

  return input !== undefined
    && input.reportKind === HARD_CAP_REACHABILITY_WORKER_KIND
    && Array.isArray(input.items)
    && Number.isSafeInteger(input.partitionIndex);
}

// This block runs on import, so it also runs inside other modules' workers that
// happen to import this one. Answering a payload this module does not own -
// even to reject it - posts a failure its real entry point never sent.
if (!isMainThread && isHardCapReachabilityWorkerData(workerData)) {
  try {
    const worlds = workerData.items.map((item) => {
      const world = runHardCapReachabilityWorld(item);
      parentPort?.postMessage({ ok: true, kind: "progress", worldSeed: world.worldSeed });
      return world;
    });
    parentPort?.postMessage({
      ok: true,
      kind: "result",
      partitionIndex: workerData.partitionIndex,
      worlds,
    } satisfies HardCapReachabilityWorkerSuccess);
  } catch (error) {
    parentPort?.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
