import { hashStringToSeedWords } from "@game/shared";

/** Version of the canonical modular simulation-report envelope. */
export const SIMULATION_REPORT_CONTRACT_VERSION = "simulation-report-v1";

/** Diagnostic resolution retained in the canonical artifact. */
export type SimulationReportDetail = "summary" | "standard" | "diagnostic";

/** Explicit observation state for one registered section. */
export type SimulationReportSectionStatus =
  | "observed"
  | "not_requested"
  | "not_observed"
  | "not_evaluated";

/** JSON values accepted by the language-agnostic canonical artifact. */
export type SimulationReportJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly SimulationReportJsonValue[]
  | { readonly [key: string]: SimulationReportJsonValue };

/** Simulation identity. Presentation choices deliberately do not live here. */
export interface SimulationReportMeasurementRequest {
  readonly mode: "custom" | "profile";
  readonly profileId: string | null;
  readonly worldCount: number;
  readonly seasonCount: number;
  readonly includedSectionIds: readonly string[];
  readonly detail: SimulationReportDetail;
  readonly seedPrefix: string;
  readonly workerCount: number;
}

/** One deterministic execution node recorded in dependency order. */
export interface SimulationReportExecutionNode {
  readonly key: string;
  readonly depth: "none" | "world" | "match" | "season" | "career";
}

/** Provenance needed to reproduce the measured population. */
export interface SimulationReportManifest {
  readonly worldSeeds: readonly string[];
  readonly executionNodes: readonly SimulationReportExecutionNode[];
  readonly calibrationVersions: Readonly<Record<string, string>>;
}

/** A section is always present; absence is represented by status, never shape. */
export type SimulationReportSection =
  | {
      readonly id: string;
      readonly status: "observed";
      readonly data: SimulationReportJsonValue;
    }
  | {
      readonly id: string;
      readonly status: Exclude<SimulationReportSectionStatus, "observed">;
      readonly reason: string;
    };

/** Canonical machine artifact consumed by every output adapter. */
export interface SimulationReportArtifact {
  readonly contractVersion: typeof SIMULATION_REPORT_CONTRACT_VERSION;
  readonly measurementRequest: SimulationReportMeasurementRequest;
  readonly manifest: SimulationReportManifest;
  readonly sections: readonly SimulationReportSection[];
  readonly decision: "PASS" | "FAIL" | "NOT_EVALUATED";
  readonly reportHash: string;
  /**
   * Continuity hash over season-`1..10` facts alone, when the run reaches them.
   *
   * Deliberately a sibling of `reportHash` and excluded from it. Folding it
   * into the report hash would change the hash of every artifact this project
   * has already recorded, invalidating locked profile identities that predate
   * this field for no measurement reason.
   */
  readonly seasonTenPrefixHash?: string;
}

/** Season boundary compared when one run's horizon differs from another's. */
export const SEASON_PREFIX_CONTINUITY_BOUNDARY = 10;

/** Input without the derived stable hashes. */
export type CreateSimulationReportArtifactInput = Omit<
  SimulationReportArtifact,
  "contractVersion" | "reportHash" | "seasonTenPrefixHash"
>;

/**
 * Builds and hashes one canonical artifact.
 *
 * The hash is derived only from measurement facts. Output format, language and
 * destination never reach this function, so rendering cannot change evidence.
 */
export function createSimulationReportArtifact(
  input: CreateSimulationReportArtifactInput,
): SimulationReportArtifact {
  assertArtifactInput(input);
  const facts = {
    contractVersion: SIMULATION_REPORT_CONTRACT_VERSION,
    ...input,
  } as const;

  return {
    ...facts,
    reportHash: stableSimulationReportHash(facts),
    ...(input.measurementRequest.seasonCount < SEASON_PREFIX_CONTINUITY_BOUNDARY
      ? {}
      : {
          seasonTenPrefixHash: seasonPrefixReportHash(
            input.sections,
            SEASON_PREFIX_CONTINUITY_BOUNDARY,
          ),
        }),
  };
}

/** Serializes JSON with recursively sorted object keys and stable array order. */
export function canonicalSimulationReportJson(value: unknown): string {
  return JSON.stringify(sortCanonicalValue(value), null, 2);
}

/** Produces the stable full-width shared hash used by report artifacts. */
export function stableSimulationReportHash(value: unknown): string {
  return hashStringToSeedWords(canonicalSimulationReportJson(value))
    .map((word) => word.toString(16).padStart(8, "0"))
    .join("");
}

/** Converts structured producer output to canonical JSON or refuses residue. */
export function toSimulationReportJsonValue(value: unknown): SimulationReportJsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`Non-finite report number: ${value}`);
    return value;
  }
  if (Array.isArray(value)) return value.map(toSimulationReportJsonValue);
  if (isRecord(value)) {
    const entries = Object.entries(value).map(([key, entry]) => {
      if (entry === undefined) {
        throw new TypeError(`Undefined report property: ${key}`);
      }
      return [key, toSimulationReportJsonValue(entry)] as const;
    });
    return Object.fromEntries(entries);
  }
  throw new TypeError(`Unsupported report value: ${typeof value}`);
}

/** Refuses malformed artifacts loaded by the render-only path. */
export function parseSimulationReportArtifact(value: unknown): SimulationReportArtifact {
  if (!isRecord(value) || value.contractVersion !== SIMULATION_REPORT_CONTRACT_VERSION) {
    throw new TypeError("Unsupported simulation-report contract");
  }
  const { reportHash, seasonTenPrefixHash, ...facts } = value;
  if (typeof reportHash !== "string" || stableSimulationReportHash(facts) !== reportHash) {
    throw new TypeError("Simulation-report hash does not match its canonical facts");
  }
  if (
    seasonTenPrefixHash !== undefined
    && seasonTenPrefixHash !== seasonPrefixReportHash(
      facts["sections"],
      SEASON_PREFIX_CONTINUITY_BOUNDARY,
    )
  ) {
    throw new TypeError("Season-prefix hash does not match its canonical season facts");
  }
  assertArtifactInput(facts as CreateSimulationReportArtifactInput);
  return value as unknown as SimulationReportArtifact;
}

function assertArtifactInput(input: CreateSimulationReportArtifactInput): void {
  assertPositiveSafeInteger(input.measurementRequest.worldCount, "worldCount");
  assertPositiveSafeInteger(input.measurementRequest.seasonCount, "seasonCount");
  assertPositiveSafeInteger(input.measurementRequest.workerCount, "workerCount");

  const sectionIds = input.sections.map(({ id }) => id);
  if (new Set(sectionIds).size !== sectionIds.length) {
    throw new TypeError("Simulation-report section IDs must be unique");
  }
  const requested = new Set(input.measurementRequest.includedSectionIds);
  for (const section of input.sections) {
    if (section.status === "not_requested" && requested.has(section.id)) {
      throw new TypeError(`Requested section cannot be not_requested: ${section.id}`);
    }
    if (section.status !== "not_requested" && !requested.has(section.id)) {
      throw new TypeError(`Unrequested section must be not_requested: ${section.id}`);
    }
  }
}

function sortCanonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortCanonicalValue);
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, sortCanonicalValue(value[key])]),
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertPositiveSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive safe integer: ${value}`);
  }
}

/**
 * Collects every canonical season row at or below one season boundary.
 *
 * A cross-horizon continuity check cannot compare whole reports: counters that
 * legitimately span the requested horizon differ by construction, so a
 * ten-season and a fifteen-season run of the same seeds never share an overall
 * hash. Comparing only season-indexed rows isolates the facts that must match.
 *
 * An object carrying a numeric `seasonNumber` is one season row and is the
 * unit of comparison; traversal stops there rather than descending into it.
 * Everything reached without passing through such a row is a whole-horizon
 * aggregate and is deliberately excluded. Rows are keyed by their structural
 * path so two sections cannot collide, and the result is sorted so array order
 * inside a producer cannot change the hash.
 */
export function seasonPrefixFacts(
  value: unknown,
  throughSeason: number,
): readonly (readonly [string, unknown])[] {
  assertPositiveSafeInteger(throughSeason, "throughSeason");
  const rows: (readonly [string, unknown])[] = [];

  const walk = (node: unknown, path: string): void => {
    if (Array.isArray(node)) {
      for (const [index, entry] of node.entries()) {
        walk(entry, `${path}[${arrayElementIdentity(entry, index)}]`);
      }
      return;
    }
    if (!isRecord(node)) return;

    const seasonNumber = node["seasonNumber"];
    if (typeof seasonNumber === "number") {
      if (seasonNumber <= throughSeason) {
        rows.push([`${path}#${seasonNumber}`, sortCanonicalValue(node)]);
      }
      return;
    }

    for (const key of Object.keys(node).sort((left, right) => left.localeCompare(right))) {
      walk(node[key], `${path}.${key}`);
    }
  };

  walk(value, "$");
  return rows
    .map((row) => [row[0], JSON.stringify(row[1])] as const)
    .sort((left, right) => left[0].localeCompare(right[0]) || left[1].localeCompare(right[1]))
    .map(([rowPath, serialized]) => [rowPath, JSON.parse(serialized) as unknown] as const);
}

/**
 * Names one array element so sibling containers cannot share a row path.
 *
 * A bare positional index is not usable here: two runs over different horizons
 * may hold a different number of elements, so the same shared fact can sit at
 * different indices. A declared identity is stable across horizons; the index
 * remains only as the last resort for arrays of anonymous records.
 */
function arrayElementIdentity(entry: unknown, index: number): string {
  if (!isRecord(entry)) return String(index);

  for (const key of ["id", "seed", "worldSeed", "competitionId", "playerId", "rowKey"]) {
    const value = entry[key];
    if (typeof value === "string" && value.length > 0) return `${key}=${value}`;
  }

  // `seasonNumber` is checked after the string keys, never before them: a
  // transfer row carries both, and leading with the season would collapse every
  // transfer of one season onto one path. It still precedes the index, so a
  // bare season row is named by its season rather than by its position.
  const seasonNumber = entry["seasonNumber"];
  if (typeof seasonNumber === "number" && Number.isFinite(seasonNumber)) {
    return `seasonNumber=${seasonNumber}`;
  }
  return String(index);
}

/**
 * Hashes only the canonical season rows at or below one season boundary.
 *
 * Two runs of the same seeds over different horizons must produce the same
 * value here for their shared seasons. It reuses the canonical report hash, so
 * the prefix hash and the full hash cannot drift apart in their serialization.
 *
 * This covers every section it is given, so it answers "is this whole report
 * unchanged through that season". A run that adds a diagnostic section changes
 * it by construction. Comparing such a run against an earlier baseline is a
 * different question, answered by `baselineContinuityHash`.
 */
export function seasonPrefixReportHash(value: unknown, throughSeason: number): string {
  return stableSimulationReportHash(seasonPrefixFacts(value, throughSeason));
}

/**
 * Hashes one earlier run's sections only, ignoring anything a later run added.
 *
 * A diagnostic step adds sections its baseline never had. Comparing whole
 * reports would then always differ, and the difference would report the
 * instrument rather than the engine. This restricts the comparison to an
 * explicitly declared baseline section set, so added evidence is additive and
 * a divergence means the shared facts really moved.
 *
 * The baseline list is required to be complete: a declared section missing from
 * the run throws rather than silently shrinking the comparison, because a gate
 * that quietly compares less than it claims is worse than no gate. Duplicates
 * are refused for the same reason.
 *
 * **No production caller, deliberately, with a documented removal path.** Its
 * consumer is the L6.43B replay gate, which verifies a completed artifact
 * against the frozen L6.43A baseline `5f1cad79889795de6d02ab31ba899396`. That
 * gate runs against artifacts rather than inside the report, so nothing in the
 * pipeline calls this. It is retained while the locked L6.43B profile remains
 * executable as the historical baseline of the superseded model, and **Phase
 * 81B owns its removal** once new instrumentation and new evidence replace it.
 * Its sibling `seasonPrefixReportHash` is called by the report itself and is
 * not covered by this note.
 */
export function baselineContinuityHash(input: {
  readonly sections: readonly SimulationReportSection[];
  readonly baselineSectionIds: readonly string[];
  readonly throughSeason: number;
}): string {
  const { sections, baselineSectionIds, throughSeason } = input;
  if (baselineSectionIds.length === 0) {
    throw new TypeError("Baseline continuity needs at least one declared section id");
  }
  if (new Set(baselineSectionIds).size !== baselineSectionIds.length) {
    throw new TypeError("Baseline continuity section ids must be unique");
  }

  const byId = new Map(sections.map((section) => [section.id, section]));
  const baselineSections = baselineSectionIds.map((id) => {
    const section = byId.get(id);
    if (section === undefined) {
      throw new TypeError(`Baseline continuity section is missing from the run: ${id}`);
    }
    return section;
  });

  return seasonPrefixReportHash(baselineSections, throughSeason);
}
