import type { Translator } from "@game/i18n";
import {
  canonicalSimulationReportJson,
  type SimulationReportArtifact,
} from "@game/simulation-tools";

import type { SimulationReportFormat } from "./report-planner.ts";
import { renderSimulationReportHtml } from "./report-html.ts";

/** Renders an existing artifact without executing or re-evaluating anything. */
export function renderSimulationReport(
  report: SimulationReportArtifact,
  format: SimulationReportFormat,
  text: Translator,
): string {
  if (format === "json") return `${canonicalSimulationReportJson(report)}\n`;
  if (format === "html") return renderSimulationReportHtml(report);
  if (format === "markdown") return renderMarkdown(report, text);
  return renderConsole(report, text);
}

function renderConsole(report: SimulationReportArtifact, text: Translator): string {
  return `${[
    text("simulationReport.output.title"),
    `${text("simulationReport.output.decision")}: ${report.decision}`,
    `${text("simulationReport.output.hash")}: ${report.reportHash}`,
    `${text("simulationReport.output.worlds")}: ${report.measurementRequest.worldCount}`,
    `${text("simulationReport.output.seasons")}: ${report.measurementRequest.seasonCount}`,
    `${text("simulationReport.output.workers")}: ${report.measurementRequest.workerCount}`,
    ...report.sections.map((section) =>
      `${text("simulationReport.output.section")}: ${section.id} [${section.status}]`
    ),
  ].join("\n")}\n`;
}

function renderMarkdown(report: SimulationReportArtifact, text: Translator): string {
  const lines = [
    `# ${text("simulationReport.output.title")}`,
    "",
    `- ${text("simulationReport.output.decision")}: **${report.decision}**`,
    `- ${text("simulationReport.output.hash")}: \`${report.reportHash}\``,
    `- ${text("simulationReport.output.worlds")}: ${report.measurementRequest.worldCount}`,
    `- ${text("simulationReport.output.seasons")}: ${report.measurementRequest.seasonCount}`,
    `- ${text("simulationReport.output.workers")}: ${report.measurementRequest.workerCount}`,
    "",
  ];
  for (const section of report.sections) {
    lines.push(`## ${section.id}`, "", `Status: \`${section.status}\``, "");
    if (section.status === "observed") {
      lines.push("```json", canonicalSimulationReportJson(section.data), "```", "");
    } else {
      lines.push(section.reason, "");
    }
  }
  return `${lines.join("\n")}\n`;
}
