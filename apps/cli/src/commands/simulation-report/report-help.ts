import type { Translator } from "@game/i18n";

import {
  SIMULATION_REPORT_MODULE_IDS,
  SIMULATION_REPORT_MODULES,
  SIMULATION_REPORT_PROFILE_IDS,
  SIMULATION_REPORT_PROFILES,
  SIMULATION_REPORT_RECIPES,
  type SimulationReportModuleId,
  type SimulationReportProfileId,
} from "./report-registry.ts";

/** Registry-derived command help with executable, commented recipes. */
export function simulationReportHelp(text: Translator): string {
  return `${[
    text("simulationReport.usage"),
    "",
    text("simulationReport.help.options"),
    text("simulationReport.help.discovery"),
    "",
    text("simulationReport.help.recipes"),
    ...SIMULATION_REPORT_RECIPES.flatMap((recipe) => [
      `# ${text(recipe.descriptionKey)}`,
      `pnpm cli simulation-report ${recipe.args.join(" ")}`,
    ]),
  ].join("\n")}\n`;
}

/** Lists every executable module in canonical registry order. */
export function simulationReportModuleList(text: Translator): string {
  return `${SIMULATION_REPORT_MODULE_IDS.map((id) => {
    const module = SIMULATION_REPORT_MODULES[id];
    return `${id}: ${text(module.descriptionKey)}`;
  }).join("\n")}\n`;
}

/** Lists every locked profile in canonical registry order. */
export function simulationReportProfileList(text: Translator): string {
  return `${SIMULATION_REPORT_PROFILE_IDS.map((id) => {
    const profile = SIMULATION_REPORT_PROFILES[id];
    return `${id}: ${text(profile.descriptionKey)}`;
  }).join("\n")}\n`;
}

/** Describes one module including the claim it deliberately cannot support. */
export function describeSimulationReportModule(
  id: SimulationReportModuleId,
  text: Translator,
): string {
  const module = SIMULATION_REPORT_MODULES[id];
  return `${[
    `${id}: ${text(module.titleKey)}`,
    text(module.descriptionKey),
    `${text("simulationReport.help.doesNotMeasure")}: ${text(module.unavailableClaimKey)}`,
    `${text("simulationReport.help.executionNodes")}: ${module.executionNodes.map(({ key }) => key).join(", ")}`,
  ].join("\n")}\n`;
}

/** Describes the immutable population behind one locked profile. */
export function describeSimulationReportProfile(
  id: SimulationReportProfileId,
  text: Translator,
): string {
  const profile = SIMULATION_REPORT_PROFILES[id];
  return `${[
    `${id}: ${text(profile.titleKey)}`,
    text(profile.descriptionKey),
    JSON.stringify(profile.measurementRequest),
  ].join("\n")}\n`;
}
