import type { Translator } from "@game/i18n";

import { playerLabel } from "./format.ts";
import type { CliCareerState, PlayerId } from "./types.ts";

type CareerDevelopmentReportFormatResult = {
  readonly careerState: CliCareerState;
  readonly seasonsSimulated: number;
  readonly playersReviewed: number;
  readonly playersImproved: number;
  readonly playersDeclined: number;
  readonly stalledProspects: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
  readonly biggestImprover?: CareerDevelopmentReportPlayerExample;
  readonly biggestDecline?: CareerDevelopmentReportPlayerExample;
  readonly stalledProspect?: CareerDevelopmentReportPlayerExample;
  readonly decliningVeteran?: CareerDevelopmentReportPlayerExample;
};

type CareerDevelopmentReportPlayerExample = {
  readonly playerId: PlayerId;
  readonly startAge: number;
  readonly endAge: number;
  readonly totalGrowth: number;
  readonly totalDecline: number;
};

/** Formats the in-memory lab report for multi-season player development. */
export function formatCareerDevelopmentReportOutput(input: {
  readonly result: CareerDevelopmentReportFormatResult;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  return [
    input.text("career.developmentReport.title"),
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("career.developmentReport.seasonsSimulated")}: ${input.result.seasonsSimulated}`,
    `${input.text("career.developmentReport.inspectionOnly")}`,
    `${input.text("career.saveWritten")}: ${input.text("common.no")}`,
    `${input.text("career.developmentReport.aggregate")}:`,
    `  ${input.text("career.developmentReport.playersReviewed")}: ${input.result.playersReviewed}`,
    `  ${input.text("career.developmentReport.playersImproved")}: ${input.result.playersImproved}`,
    `  ${input.text("career.developmentReport.playersDeclined")}: ${input.result.playersDeclined}`,
    `  ${input.text("career.developmentReport.stalledProspects")}: ${input.result.stalledProspects}`,
    `  ${input.text("career.developmentReport.totalGrowth")}: ${formatDelta(input.result.totalGrowth)}`,
    `  ${input.text("career.developmentReport.totalDecline")}: ${formatDelta(input.result.totalDecline)}`,
    `${input.text("career.developmentReport.examples")}:`,
    `  ${input.text("career.developmentReport.biggestImprover")}: ${formatDevelopmentExample(
      input.result.biggestImprover,
      input.result.careerState,
      input.text,
    )}`,
    `  ${input.text("career.developmentReport.biggestDecline")}: ${formatDevelopmentExample(
      input.result.biggestDecline,
      input.result.careerState,
      input.text,
    )}`,
    `  ${input.text("career.developmentReport.stalledProspect")}: ${formatDevelopmentExample(
      input.result.stalledProspect,
      input.result.careerState,
      input.text,
    )}`,
    `  ${input.text("career.developmentReport.decliningVeteran")}: ${formatDevelopmentExample(
      input.result.decliningVeteran,
      input.result.careerState,
      input.text,
    )}`,
  ];
}

function formatDevelopmentExample(
  example: CareerDevelopmentReportPlayerExample | undefined,
  careerState: CliCareerState,
  text: Translator,
): string {
  if (example === undefined) {
    return text("common.none");
  }

  return text("career.developmentReport.exampleValue", {
    player: playerLabel(example.playerId, careerState.gameState),
    startAge: String(example.startAge),
    endAge: String(example.endAge),
    growth: formatDelta(example.totalGrowth),
    decline: formatDelta(example.totalDecline),
  });
}

function formatDelta(value: number): string {
  return value.toFixed(2);
}
