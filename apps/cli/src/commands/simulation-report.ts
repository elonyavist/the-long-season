import {
  createTranslator,
  isSupportedLanguage,
  type MessageKey,
  type MessageVariables,
  type SupportedLanguage,
} from "@game/i18n";
import { readFile } from "node:fs/promises";
import {
  parseSimulationReportArtifact,
  type SimulationReportArtifact,
} from "@game/simulation-tools";

import {
  resolveWorkspaceOutputPath,
  writeWorkspaceTextFile,
} from "./workspace-output-path.ts";
import {
  describeSimulationReportModule,
  describeSimulationReportProfile,
  simulationReportHelp,
  simulationReportModuleList,
  simulationReportProfileList,
} from "./simulation-report/report-help.ts";
import {
  createSimulationReportPlan,
  SIMULATION_REPORT_FORMATS,
  SimulationReportRequestError,
  type SimulationReportExecutionPlan,
  type SimulationReportFormat,
  type SimulationReportRawRequest,
} from "./simulation-report/report-planner.ts";
import {
  createSimulationReportFromPlan,
  SIMULATION_REPORT_MODULE_IDS,
  SIMULATION_REPORT_PROFILE_IDS,
  type SimulationReportModuleId,
  type SimulationReportProfileId,
} from "./simulation-report/report-registry.ts";
import { renderSimulationReport } from "./simulation-report/report-renderers.ts";

export interface SimulationReportCommandDependencies {
  readonly stdout: (line: string) => void;
  readonly stderr: (line: string) => void;
  readonly writeReport: (path: string, contents: string) => Promise<void>;
  readonly readReport: (path: string) => Promise<string>;
  readonly createReport: (plan: SimulationReportExecutionPlan) => Promise<SimulationReportArtifact>;
}

/** Runs the single modular simulation-report Interface. */
export async function runSimulationReportCommand(
  args: readonly string[],
  dependencies: SimulationReportCommandDependencies = defaultDependencies(),
): Promise<number> {
  const parsed = parseSimulationReportArgs(args);
  const text = createTranslator(parsed.language);
  if (!parsed.ok) {
    dependencies.stderr(parsed.message);
    dependencies.stderr(text("simulationReport.usage"));
    return 1;
  }
  if (parsed.discovery !== null) {
    dependencies.stdout(renderDiscovery(parsed.discovery, text));
    return 0;
  }
  if (parsed.fromReport !== null) {
    try {
      const report = parseSimulationReportArtifact(
        JSON.parse(await dependencies.readReport(parsed.fromReport)),
      );
      const format = parsed.request.format ?? "html";
      const language = parsed.request.language ?? "en";
      if (format === "html" && language !== "en") {
        throw new Error(text("simulationReport.error.htmlEnglishOnly"));
      }
      const rendered = renderSimulationReport(report, format, createTranslator(language));
      if (parsed.request.reportOutput === undefined) dependencies.stdout(rendered);
      else {
        await dependencies.writeReport(parsed.request.reportOutput, rendered);
        dependencies.stdout(text("simulationReport.output.written", { path: parsed.request.reportOutput }));
      }
      return report.decision === "FAIL" ? 1 : 0;
    } catch (error) {
      dependencies.stderr(error instanceof Error ? error.message : String(error));
      return 1;
    }
  }
  let plan: SimulationReportExecutionPlan;
  try {
    plan = createSimulationReportPlan(parsed.request);
  } catch (error) {
    dependencies.stderr(error instanceof SimulationReportRequestError
      ? text(error.messageKey, error.variables)
      : error instanceof Error ? error.message : String(error));
    return 1;
  }
  if (
    plan.presentationRequest.format === "html"
    && plan.presentationRequest.language !== "en"
  ) {
    dependencies.stderr(text("simulationReport.error.htmlEnglishOnly"));
    return 1;
  }
  if (parsed.explainPlan) {
    dependencies.stdout(`${text("simulationReport.plan.title")}\n${JSON.stringify(plan, null, 2)}`);
    return 0;
  }

  try {
    const report = await dependencies.createReport(plan);
    const rendered = renderSimulationReport(
      report,
      plan.presentationRequest.format,
      createTranslator(plan.presentationRequest.language),
    );
    if (plan.presentationRequest.reportOutput === null) {
      dependencies.stdout(rendered);
    } else {
      await dependencies.writeReport(plan.presentationRequest.reportOutput, rendered);
      dependencies.stdout(text("simulationReport.output.written", {
        path: plan.presentationRequest.reportOutput,
      }));
    }
    return report.decision === "FAIL" ? 1 : 0;
  } catch (error) {
    dependencies.stderr(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

type DiscoveryRequest =
  | { readonly kind: "help" }
  | { readonly kind: "modules" }
  | { readonly kind: "profiles" }
  | { readonly kind: "module"; readonly id: SimulationReportModuleId }
  | { readonly kind: "profile"; readonly id: SimulationReportProfileId };

export type ParsedSimulationReportArgs =
  | {
      readonly ok: true;
      readonly language: SupportedLanguage;
      readonly discovery: DiscoveryRequest | null;
      readonly explainPlan: boolean;
      readonly fromReport: string | null;
      readonly request: SimulationReportRawRequest;
    }
  | {
      readonly ok: false;
      readonly language: SupportedLanguage;
      readonly message: string;
    };

/** Pure parser shared by recipes and command tests; it executes no producer. */
export function parseSimulationReportArgs(args: readonly string[]): ParsedSimulationReportArgs {
  let language: SupportedLanguage = "en";
  let discovery: DiscoveryRequest | null = null;
  let explainPlan = false;
  let fromReport: string | null = null;
  const request: {
    profileId?: string;
    worldCount?: number;
    seasonCount?: number;
    includedSectionIds?: readonly string[];
    detail?: "summary" | "standard" | "diagnostic";
    seedPrefix?: string;
    workerCount?: number;
    format?: SimulationReportFormat;
    language?: SupportedLanguage;
    reportOutput?: string;
  } = {};

  for (const arg of args) {
    if (arg === "--help") {
      if (discovery !== null) return invalid(language, "simulationReport.error.oneDiscoveryOnly");
      discovery = { kind: "help" };
      continue;
    }
    if (arg === "--list-modules") {
      if (discovery !== null) return invalid(language, "simulationReport.error.oneDiscoveryOnly");
      discovery = { kind: "modules" };
      continue;
    }
    if (arg === "--list-profiles") {
      if (discovery !== null) return invalid(language, "simulationReport.error.oneDiscoveryOnly");
      discovery = { kind: "profiles" };
      continue;
    }
    if (arg === "--explain-plan") {
      explainPlan = true;
      continue;
    }
    const [flag, value = ""] = splitFlag(arg);
    if (flag === "--lang") {
      if (!isSupportedLanguage(value)) {
        return invalid(language, "simulationReport.error.unsupportedLanguage", { value });
      }
      language = value;
      request.language = value;
      continue;
    }
    if (flag === "--describe-module") {
      if (!SIMULATION_REPORT_MODULE_IDS.includes(value as SimulationReportModuleId)) {
        return invalid(language, "simulationReport.error.unknownModule", { value });
      }
      if (discovery !== null) return invalid(language, "simulationReport.error.oneDiscoveryOnly");
      discovery = { kind: "module", id: value as SimulationReportModuleId };
      continue;
    }
    if (flag === "--describe-profile") {
      if (!SIMULATION_REPORT_PROFILE_IDS.includes(value as SimulationReportProfileId)) {
        return invalid(language, "simulationReport.error.unknownProfile", { value });
      }
      if (discovery !== null) return invalid(language, "simulationReport.error.oneDiscoveryOnly");
      discovery = { kind: "profile", id: value as SimulationReportProfileId };
      continue;
    }
    if (flag === "--profile") {
      request.profileId = value;
      continue;
    }
    if (flag === "--from-report") {
      if (value.length === 0) return invalid(language, "simulationReport.error.fromReportPathRequired");
      fromReport = value;
      continue;
    }
    if (flag === "--include") {
      request.includedSectionIds = value.split(",").filter((entry) => entry.length > 0);
      continue;
    }
    if (flag === "--detail") {
      if (value !== "summary" && value !== "standard" && value !== "diagnostic") {
        return invalid(language, "simulationReport.error.unsupportedDetail", { value });
      }
      request.detail = value;
      continue;
    }
    if (flag === "--format") {
      if (!SIMULATION_REPORT_FORMATS.includes(value as SimulationReportFormat)) {
        return invalid(language, "simulationReport.error.unsupportedFormat", { value });
      }
      request.format = value as SimulationReportFormat;
      continue;
    }
    if (flag === "--seed-prefix") {
      if (value.length === 0) return invalid(language, "simulationReport.error.seedPrefixRequired");
      request.seedPrefix = value;
      continue;
    }
    if (flag === "--report-output") {
      if (value.length === 0) return invalid(language, "simulationReport.error.reportOutputRequired");
      request.reportOutput = value;
      continue;
    }
    if (flag === "--worlds" || flag === "--seasons" || flag === "--workers") {
      const parsed = Number(value);
      if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        return invalid(language, "simulationReport.error.positiveInteger", { flag, value });
      }
      if (flag === "--worlds") request.worldCount = parsed;
      if (flag === "--seasons") request.seasonCount = parsed;
      if (flag === "--workers") request.workerCount = parsed;
      continue;
    }
    return invalid(language, "simulationReport.error.unknownArgument", { value: arg });
  }
  if (discovery !== null && explainPlan) {
    return invalid(language, "simulationReport.error.discoveryExplainConflict");
  }
  if (fromReport !== null) {
    const measurementOverrides = [
      request.profileId,
      request.worldCount,
      request.seasonCount,
      request.includedSectionIds,
      request.detail,
      request.seedPrefix,
      request.workerCount,
    ];
    if (measurementOverrides.some((value) => value !== undefined)) {
      return invalid(language, "simulationReport.error.fromReportMeasurementConflict");
    }
    if (discovery !== null || explainPlan) {
      return invalid(language, "simulationReport.error.fromReportDiscoveryConflict");
    }
  }
  return { ok: true, language, discovery, explainPlan, fromReport, request };
}

function renderDiscovery(
  request: DiscoveryRequest,
  text: ReturnType<typeof createTranslator>,
): string {
  if (request.kind === "help") return simulationReportHelp(text);
  if (request.kind === "modules") return simulationReportModuleList(text);
  if (request.kind === "profiles") return simulationReportProfileList(text);
  if (request.kind === "module") return describeSimulationReportModule(request.id, text);
  return describeSimulationReportProfile(request.id, text);
}

function splitFlag(arg: string): readonly [string, string | undefined] {
  const separator = arg.indexOf("=");
  return separator === -1 ? [arg, undefined] : [arg.slice(0, separator), arg.slice(separator + 1)];
}

function invalid(
  language: SupportedLanguage,
  key: MessageKey,
  variables?: MessageVariables,
): ParsedSimulationReportArgs {
  return { ok: false, language, message: createTranslator(language)(key, variables) };
}

function defaultDependencies(): SimulationReportCommandDependencies {
  return {
    stdout: (line) => process.stdout.write(`${line}\n`),
    stderr: (line) => process.stderr.write(`${line}\n`),
    writeReport: writeWorkspaceTextFile,
    readReport: async (path) => readFile(await resolveWorkspaceOutputPath(path), "utf8"),
    createReport: (plan) => createSimulationReportFromPlan({
      measurementRequest: plan.measurementRequest,
      executionNodes: plan.executionNodes,
    }),
  };
}
