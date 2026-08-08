import { resolveSimulationWorkerCount } from "@game/simulation-tools";
import { createTranslator, type MessageKey, type MessageVariables } from "@game/i18n";

import {
  SIMULATION_REPORT_MODULE_IDS,
  SIMULATION_REPORT_MODULES,
  SIMULATION_REPORT_PROFILE_IDS,
  SIMULATION_REPORT_PROFILES,
  type SimulationReportModuleId,
  type SimulationReportProfileId,
} from "./report-registry.ts";

export const SIMULATION_REPORT_FORMATS = ["console", "json", "markdown", "html"] as const;
export type SimulationReportFormat = typeof SIMULATION_REPORT_FORMATS[number];

export interface SimulationReportPresentationRequest {
  readonly format: SimulationReportFormat;
  readonly language: "it" | "en" | "de" | "es" | "fr";
  readonly reportOutput: string | null;
}

export interface SimulationReportRawRequest {
  readonly profileId?: string;
  readonly worldCount?: number;
  readonly seasonCount?: number;
  readonly includedSectionIds?: readonly string[];
  readonly detail?: "summary" | "standard" | "diagnostic";
  readonly seedPrefix?: string;
  readonly workerCount?: number;
  readonly format?: SimulationReportFormat;
  readonly language?: "it" | "en" | "de" | "es" | "fr";
  readonly reportOutput?: string;
}

export interface SimulationReportExecutionPlan {
  readonly measurementRequest: import("@game/simulation-tools").SimulationReportMeasurementRequest;
  readonly presentationRequest: SimulationReportPresentationRequest;
  readonly sectionIds: readonly SimulationReportModuleId[];
  readonly executionNodes: readonly import("@game/simulation-tools").SimulationReportExecutionNode[];
}

/** Structured request error so the CLI can render it in the selected language. */
export class SimulationReportRequestError extends Error {
  public readonly messageKey: MessageKey;
  public readonly variables: MessageVariables | undefined;

  public constructor(
    messageKey: MessageKey,
    variables?: MessageVariables,
  ) {
    super(createTranslator("en")(messageKey, variables));
    this.name = "SimulationReportRequestError";
    this.messageKey = messageKey;
    this.variables = variables;
  }
}

/** Normalizes one custom request or exact locked profile into a stable plan. */
export function createSimulationReportPlan(
  raw: SimulationReportRawRequest,
): SimulationReportExecutionPlan {
  const presentationRequest: SimulationReportPresentationRequest = {
    format: raw.format ?? "console",
    language: raw.language ?? "en",
    reportOutput: raw.reportOutput ?? null,
  };

  if (raw.profileId !== undefined) {
    const profileId = parseProfileId(raw.profileId);
    const fixed = SIMULATION_REPORT_PROFILES[profileId].measurementRequest;
    const illegalOverrides = [
      ["worlds", raw.worldCount !== undefined && raw.worldCount !== fixed.worldCount],
      ["seasons", raw.seasonCount !== undefined && raw.seasonCount !== fixed.seasonCount],
      ["include", raw.includedSectionIds !== undefined
        && !sameStringSet(raw.includedSectionIds, fixed.includedSectionIds)],
      ["detail", raw.detail !== undefined && raw.detail !== fixed.detail],
      ["seed-prefix", raw.seedPrefix !== undefined && raw.seedPrefix !== fixed.seedPrefix],
      ["workers", raw.workerCount !== undefined && raw.workerCount !== fixed.workerCount],
    ].filter(([, changed]) => changed).map(([name]) => name);
    if (illegalOverrides.length > 0) {
      throw new SimulationReportRequestError(
        "simulationReport.error.profileOverrides",
        { profileId, overrides: illegalOverrides.join(", ") },
      );
    }
    return planFromMeasurement(fixed, presentationRequest);
  }

  const worldCount = raw.worldCount ?? 1;
  const seasonCount = raw.seasonCount ?? 1;
  assertPositiveSafeInteger(worldCount, "worlds");
  assertPositiveSafeInteger(seasonCount, "seasons");
  const sectionIds = canonicalSectionIds(raw.includedSectionIds ?? ["season"]);
  const workerCount = resolveSimulationWorkerCount({
    workItemCount: worldCount,
    ...(raw.workerCount === undefined ? {} : { requestedWorkerCount: raw.workerCount }),
  });
  return planFromMeasurement({
    mode: "custom",
    profileId: null,
    worldCount,
    seasonCount,
    includedSectionIds: sectionIds,
    detail: raw.detail ?? "standard",
    seedPrefix: raw.seedPrefix ?? "simulation-report",
    workerCount,
  }, presentationRequest);
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length
    && new Set(left).size === left.length
    && left.every((value) => right.includes(value));
}

function planFromMeasurement(
  measurementRequest: import("@game/simulation-tools").SimulationReportMeasurementRequest,
  presentationRequest: SimulationReportPresentationRequest,
): SimulationReportExecutionPlan {
  const sectionIds = canonicalSectionIds(measurementRequest.includedSectionIds);
  const seen = new Set<string>();
  const executionNodes = sectionIds.flatMap((id) =>
    (measurementRequest.mode === "custom" && !SIMULATION_REPORT_MODULES[id].customReachable
      ? []
      : SIMULATION_REPORT_MODULES[id].executionNodes).filter(({ key }) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  );
  return { measurementRequest, presentationRequest, sectionIds, executionNodes };
}

function canonicalSectionIds(ids: readonly string[]): readonly SimulationReportModuleId[] {
  if (ids.length === 0) {
    throw new SimulationReportRequestError("simulationReport.error.moduleRequired");
  }
  const requested = new Set(ids.map(parseModuleId));
  return SIMULATION_REPORT_MODULE_IDS.filter((id) => requested.has(id));
}

function parseModuleId(value: string): SimulationReportModuleId {
  if (!SIMULATION_REPORT_MODULE_IDS.includes(value as SimulationReportModuleId)) {
    throw new SimulationReportRequestError("simulationReport.error.unknownModule", { value });
  }
  return value as SimulationReportModuleId;
}

function parseProfileId(value: string): SimulationReportProfileId {
  if (!SIMULATION_REPORT_PROFILE_IDS.includes(value as SimulationReportProfileId)) {
    throw new SimulationReportRequestError("simulationReport.error.unknownProfile", { value });
  }
  return value as SimulationReportProfileId;
}

function assertPositiveSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new SimulationReportRequestError(
      "simulationReport.error.positiveSafeInteger",
      { label, value },
    );
  }
}
