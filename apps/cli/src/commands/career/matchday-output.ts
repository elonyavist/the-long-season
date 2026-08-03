import { fieldablePlayerIdsFor } from "@game/engine";
import type { CanonicalPlayerRole } from "@game/engine";
import type { MatchExplanationTrace } from "@game/engine";
import type { Translator } from "@game/i18n";

import {
  clubLabel,
  compareAscii,
  findNextSelectedClubFixture,
  formatLineupRole,
  formatNextSelectedClubFixtureLines,
  formatSignedNumber,
  formatTacticKnob,
  playerLabel,
  presentationMessageKey,
} from "./format.ts";
import type { CareerAdvanceResult } from "./progression.ts";
import type { CliGameState, ClubId, PlayerId } from "./types.ts";

/** Formats the result of save-writing career fixture advancement. */
export function formatCareerAdvanceOutput(input: {
  readonly result: CareerAdvanceResult;
  readonly saveId: string;
  readonly saveDirectoryPath: string;
  readonly text: Translator;
}): readonly string[] {
  if (input.result.status === "none") {
    return [
      input.text("career.advance.title"),
      `${input.text("career.save")}: ${input.saveId}`,
      `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
      `${input.text("career.advance.status")}: ${input.text("career.advance.status.none")}`,
      `${input.text("career.saveWritten")}: ${input.text("common.no")}`,
    ];
  }

  if (input.result.status === "invalid") {
    return [
      input.text("career.advance.title"),
      `${input.text("career.save")}: ${input.saveId}`,
      `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
      `${input.text("career.advance.status")}: ${input.text("career.advance.status.invalid")}`,
      `${input.text("career.advance.reason")}: ${formatCareerAdvanceInvalidReason(input.result.reason, input.text)}`,
      `${input.text("career.saveWritten")}: ${input.text("common.no")}`,
    ];
  }

  const nextFixture = findNextSelectedClubFixture(input.result.careerState);

  const lines = [
    input.text("career.advance.title"),
    `${input.text("career.save")}: ${input.saveId}`,
    `${input.text("career.saveDirectory")}: ${input.saveDirectoryPath}`,
    `${input.text("career.advance.status")}: ${input.text("career.advance.status.advanced")}`,
    `${input.text("career.advance.fixture")}: ${input.result.fixtureId}`,
    `${input.text("career.advance.result")}: ${clubLabel(
      input.result.fixtureAfter.homeClubId,
      input.result.careerState.gameState,
    )} ${input.result.fixtureAfter.result?.homeGoals ?? 0}-${input.result.fixtureAfter.result?.awayGoals ?? 0} ${clubLabel(
      input.result.fixtureAfter.awayClubId,
      input.result.careerState.gameState,
    )}`,
    `${input.text("career.saveWritten")}: ${input.text("common.yes")}`,
    `${input.text("career.advance.recovery")}:`,
    ...formatCareerAdvanceRecoveryLines(input.result, input.text),
    `${input.text("career.advance.conditionChanges")}:`,
    ...formatCareerAdvanceConditionLines(input.result, input.text),
    `${input.text("career.advance.playerStateChanges")}:`,
    ...formatCareerAdvancePlayerStateLines(input.result, input.text),
    `${input.text("career.nextSelectedClubFixture")}:`,
    ...formatNextSelectedClubFixtureLines(input.result.careerState, nextFixture, input.text),
  ];

  if (input.result.explanationTrace !== undefined) {
    lines.push(...formatCareerFixtureExplanationTraceOutput(input.result.explanationTrace, input.result.careerState.gameState, input.text));
  }

  return lines;
}

function formatCareerAdvanceRecoveryLines(
  result: Extract<CareerAdvanceResult, { readonly status: "advanced" }>,
  text: Translator,
): readonly string[] {
  const changes = result.preMatchRecovery.changes;
  const improvedCount = changes.filter((change) => change.recovered).length;

  return [
    `  ${text("career.advance.recoveryDays")}: ${result.preMatchRecovery.dayCount}`,
    `  ${text("career.advance.recoveryPlayersImproved")}: ${improvedCount}`,
    `  ${text("career.advance.recoveryFitnessRange")}: ${formatFitnessRange(changes, text)}`,
  ];
}

function formatCareerAdvanceConditionLines(
  result: Extract<CareerAdvanceResult, { readonly status: "advanced" }>,
  text: Translator,
): readonly string[] {
  const startedChanges = result.conditionChanges.filter((change) => change.started);
  const restedFirstTeamChanges = restedFirstTeamConditionChanges(result);

  return [
    `  ${text("career.advance.conditionStarted")}:`,
    ...formatConditionChangeLines(startedChanges, result.careerState.gameState, text),
    `  ${text("career.advance.conditionRestedFirstTeam")}:`,
    ...formatConditionChangeLines(restedFirstTeamChanges, result.careerState.gameState, text),
  ];
}

function formatCareerAdvancePlayerStateLines(
  result: Extract<CareerAdvanceResult, { readonly status: "advanced" }>,
  text: Translator,
): readonly string[] {
  if (result.playerStateConsequences.length === 0) {
    return [`  ${text("common.none")}`];
  }

  return [
    `  ${text("career.advance.playerStateSummary", {
      players: String(result.playerStateConsequenceSummary.changedPlayerCount),
      formDelta: formatSignedNumber(result.playerStateConsequenceSummary.totalFormDelta),
      moraleDelta: formatSignedNumber(result.playerStateConsequenceSummary.totalMoraleDelta),
    })}`,
    ...result.playerStateConsequences.map((change) =>
      `  ${text("career.advance.playerStateLine", {
        player: playerLabel(change.playerId, result.careerState.gameState),
        formBefore: String(change.beforeForm),
        formAfter: String(change.afterForm),
        formDelta: formatSignedNumber(change.formDelta),
        moraleBefore: String(change.beforeMorale),
        moraleAfter: String(change.afterMorale),
        moraleDelta: formatSignedNumber(change.moraleDelta),
        reasons: change.reasonKeys.map((reasonKey) => formatPlayerStateReason(reasonKey, text)).join(", "),
      })}`
    ),
  ];
}

function restedFirstTeamConditionChanges(
  result: Extract<CareerAdvanceResult, { readonly status: "advanced" }>,
): readonly (typeof result.conditionChanges)[number][] {
  const selectedClub = result.careerState.gameState.clubs[result.careerState.selectedClubId];
  const firstTeamIds = fieldablePlayerIdsFor(selectedClub).slice(0, 11);
  const firstTeamIdSet = new Set(firstTeamIds);

  return result.conditionChanges.filter((change) => !change.started && firstTeamIdSet.has(change.playerId));
}

function formatConditionChangeLines(
  changes: readonly { readonly playerId: PlayerId; readonly beforeFitness: number; readonly afterFitness: number; readonly delta: number }[],
  gameState: CliGameState,
  text: Translator,
): readonly string[] {
  if (changes.length === 0) {
    return [`    ${text("common.none")}`];
  }

  return changes.map((change) =>
    `    ${text("career.advance.conditionLine", {
      player: playerLabel(change.playerId, gameState),
      before: String(change.beforeFitness),
      after: String(change.afterFitness),
      delta: formatSignedNumber(change.delta),
    })}`
  );
}

function formatFitnessRange(
  changes: readonly { readonly beforeFitness: number; readonly afterFitness: number }[],
  text: Translator,
): string {
  if (changes.length === 0) {
    return text("common.none");
  }

  const beforeValues = changes.map((change) => change.beforeFitness);
  const afterValues = changes.map((change) => change.afterFitness);

  return text("career.advance.recoveryRangeValue", {
    beforeMin: String(Math.min(...beforeValues)),
    beforeMax: String(Math.max(...beforeValues)),
    afterMin: String(Math.min(...afterValues)),
    afterMax: String(Math.max(...afterValues)),
  });
}

function formatCareerAdvanceInvalidReason(reason: string, text: Translator): string {
  switch (reason) {
    case "missing_match_preparation":
      return text("career.advance.reason.missingMatchPreparation");
    case "missing_saved_lineup":
      return text("career.advance.reason.missingSavedLineup");
    case "missing_saved_tactic":
      return text("career.advance.reason.missingSavedTactic");
    default:
      return reason;
  }
}

function formatPlayerStateReason(reasonKey: string, text: Translator): string {
  return text(presentationMessageKey("career.advance.playerStateReason", reasonKey));
}

/**
 * Formats optional career fixture explanation output from language-agnostic
 * engine trace data.
 */
function formatCareerFixtureExplanationTraceOutput(
  trace: MatchExplanationTrace,
  gameState: CliGameState,
  text: Translator,
): readonly string[] {
  return [
    `${text("fixture.explanation.title")}:`,
    `  ${text("fixture.explanation.teamStrength")}:`,
    formatExplanationStrengthLine(trace.home, gameState, text),
    formatExplanationStrengthLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.tacticDistribution")}:`,
    formatExplanationTacticLine(trace.home, gameState, text),
    formatExplanationTacticLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.lineupRoles")}:`,
    formatExplanationLineupLine(trace.home, gameState, text),
    formatExplanationLineupLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.conditionImpact")}:`,
    formatExplanationConditionLine(trace.home, gameState, text),
    formatExplanationConditionLine(trace.away, gameState, text),
    `  ${text("fixture.explanation.chanceSummary")}:`,
    formatExplanationOpportunityLine(trace.home.clubId, trace.opportunitySummary.home, gameState, text),
    formatExplanationOpportunityLine(trace.away.clubId, trace.opportunitySummary.away, gameState, text),
    `  ${text("fixture.explanation.variance")}: ${trace.variance.markers.map((marker) => formatVarianceMarker(marker, text)).join(", ")}`,
  ];
}

/** Formats one team's strength snapshot. */
function formatExplanationStrengthLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${text("fixture.explanation.attack")}=${formatDecimal(team.strength.attack)} ${text("fixture.explanation.midfield")}=${formatDecimal(team.strength.midfield)} ${text("fixture.explanation.defense")}=${formatDecimal(team.strength.defense)} ${text("fixture.explanation.goalkeeper")}=${formatDecimal(team.strength.goalkeeper)} ${text("fixture.explanation.overall")}=${formatDecimal(team.strength.overall)}`;
}

/** Formats one team's tactic snapshot. */
function formatExplanationTacticLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${text("setup.directness")}=${formatTacticKnob(team.tacticDistribution.directness)} ${text("setup.pressing")}=${formatTacticKnob(team.tacticDistribution.pressing)} ${text("setup.width")}=${formatTacticKnob(team.tacticDistribution.width)} ${text("setup.risk")}=${formatTacticKnob(team.tacticDistribution.risk)}`;
}

/** Formats one team's role-count snapshot. */
function formatExplanationLineupLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${formatRoleCounts(team, text)}`;
}

/** Formats one team's condition-impact snapshot. */
function formatExplanationConditionLine(
  team: MatchExplanationTrace["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, gameState)}: ${formatConditionTracking(team.conditionImpact.tracking, text)} ${text("fixture.explanation.effect")}=${formatConditionEffect(team.conditionImpact.effectDirection, text)} ${text("fixture.explanation.affectedPlayers")}=${team.conditionImpact.affectedPlayerCount}`;
}

/** Formats one team's chance and shot summary. */
function formatExplanationOpportunityLine(
  clubId: ClubId,
  summary: MatchExplanationTrace["opportunitySummary"]["home"],
  gameState: CliGameState,
  text: Translator,
): string {
  return `    ${clubLabel(clubId, gameState)}: ${text("fixture.explanation.opportunities")}=${summary.opportunities} ${text("fixture.explanation.shots")}=${summary.shots} ${text("fixture.explanation.shotsOnTarget")}=${summary.shotsOnTarget} ${text("fixture.explanation.goals")}=${summary.goals} ${text("fixture.explanation.blocks")}=${summary.blockedShots} ${text("fixture.explanation.savedShots")}=${summary.savedShots} ${text("fixture.explanation.chanceTypes")}=${formatTraceBuckets(summary.chanceTypeCounts, (key) => formatChanceType(key, text), text)} ${text("fixture.explanation.shotTypes")}=${formatTraceBuckets(summary.shotTypeCounts, (key) => formatShotType(key, text), text)}`;
}

/** Formats a numeric trace value with stable precision. */
function formatDecimal(value: number): string {
  return value.toFixed(2);
}

/** Formats a stable shot-type key for presentation output. */
function formatShotType(shotType: string, text: Translator): string {
  return text(presentationMessageKey("event.shotType", shotType));
}

/** Formats a stable chance-type key for presentation output. */
function formatChanceType(chanceType: string, text: Translator): string {
  return text(presentationMessageKey("event.chanceType", chanceType));
}

/** Formats sorted role counts for one explanation snapshot. */
function formatRoleCounts(team: MatchExplanationTrace["home"], text: Translator): string {
  const counts: { readonly canonicalRole: CanonicalPlayerRole; readonly count: number }[] = [];

  for (const slot of team.lineup.slots) {
    const existing = counts.find((candidate) => candidate.canonicalRole === slot.canonicalRole);

    if (existing === undefined) {
      counts.push({ canonicalRole: slot.canonicalRole, count: 1 });
      continue;
    }

    counts.splice(counts.indexOf(existing), 1, { canonicalRole: existing.canonicalRole, count: existing.count + 1 });
  }

  return counts
    .sort((left, right) => compareAscii(left.canonicalRole, right.canonicalRole))
    .map((entry) => `${formatLineupRole(entry.canonicalRole, text)}=${entry.count}`)
    .join(" ");
}

/** Formats trace buckets with stable machine-key order. */
function formatTraceBuckets(
  buckets: readonly { readonly key: string; readonly count: number }[],
  formatKey: (key: string) => string,
  text: Translator,
): string {
  if (buckets.length === 0) {
    return text("common.none");
  }

  return buckets.map((bucket) => `${formatKey(bucket.key)}=${bucket.count}`).join(",");
}

/** Formats condition tracking state. */
function formatConditionTracking(
  tracking: MatchExplanationTrace["home"]["conditionImpact"]["tracking"],
  text: Translator,
): string {
  return text(presentationMessageKey("fixture.explanation.conditionTracking", tracking));
}

/** Formats condition effect direction. */
function formatConditionEffect(
  effect: MatchExplanationTrace["home"]["conditionImpact"]["effectDirection"],
  text: Translator,
): string {
  return text(presentationMessageKey("fixture.explanation.effectDirection", effect));
}

/** Formats one variance marker. */
function formatVarianceMarker(marker: MatchExplanationTrace["variance"]["markers"][number], text: Translator): string {
  return text(presentationMessageKey("fixture.explanation.varianceMarker", marker));
}
