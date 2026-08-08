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
}

/** Input without the derived stable hash. */
export type CreateSimulationReportArtifactInput = Omit<
  SimulationReportArtifact,
  "contractVersion" | "reportHash"
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
  const { reportHash, ...facts } = value;
  if (typeof reportHash !== "string" || stableSimulationReportHash(facts) !== reportHash) {
    throw new TypeError("Simulation-report hash does not match its canonical facts");
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
