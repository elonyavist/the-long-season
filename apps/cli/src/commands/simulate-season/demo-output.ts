import type { FakeLeagueSystem } from "@game/content";
import {
  DEFAULT_FITNESS_RULES,
  type LineupSlot,
  type simulateSeason,
} from "@game/engine";
import type {
  MessageKey,
  Translator,
} from "@game/i18n";
import type {
  CliConditionDemo,
  CliLineupDemo,
  CliLineupDemoPlayerChange,
  CliLineupFixtureInspection,
  CliManualTacticSwitch,
  CliSetupDemo,
} from "./demo-builders.ts";
import { formatFixtureResult } from "./fixture-detail-output.ts";

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];

/** Player ID type derived from fake content without importing domain directly. */
type PlayerId = FakeLeagueSystem["playerIds"][number];

/** Club type derived from fake content without importing domain directly. */
type Club = FakeLeagueSystem["clubs"][number];

/** League table row type derived from the exported season simulation. */
type LeagueTableRow = ReturnType<typeof simulateSeason>["table"][number];

/** Fixture type derived from the exported season simulation. */
type Fixture = ReturnType<typeof simulateSeason>["fixtures"][number];

/**
 * Minimal season result needed by demo output renderers.
 */
export interface DemoOutputSeasonResult {
  /** Played fixtures in deterministic season order. */
  readonly fixtures: readonly Fixture[];
  /** Final table rows in ranked order. */
  readonly table: readonly LeagueTableRow[];
  /** Optional final player condition state returned by the season engine. */
  readonly finalPlayerStates: ReturnType<typeof simulateSeason>["finalPlayerStates"];
}

/**
 * Fixture detail needed to render manual tactic-switch inspection metadata.
 */
export interface ManualTacticSwitchOutputFixture {
  /** Fixture to describe in the switch timeline. */
  readonly fixture: Fixture;
  /** Whether the selected setup club actually played this fixture. */
  readonly appliesToFixture: boolean;
}

/**
 * Formats deterministic fitness lifecycle inspection for one condition demo.
 */
export function formatConditionDemoOutput(
  league: FakeLeagueSystem,
  result: DemoOutputSeasonResult,
  conditionDemo: CliConditionDemo,
  text: Translator,
): readonly string[] {
  const selectedFixtures = clubFixtures(result.fixtures, conditionDemo.clubId);
  const firstFixture = selectedFixtures[0];
  const secondFixture = selectedFixtures[1];
  const firstFixtureLabel = firstFixture === undefined ? "unavailable" : formatFixtureResult(firstFixture, league);
  const recoveryDays = firstFixture === undefined || secondFixture === undefined
    ? undefined
    : Number(secondFixture.date) - Number(firstFixture.date);
  const firstMatchFitness = DEFAULT_FITNESS_RULES.maxFitness - DEFAULT_FITNESS_RULES.matchFitnessCost;
  const recoveredFitness = recoveryDays === undefined
    ? undefined
    : Math.min(
        DEFAULT_FITNESS_RULES.maxFitness,
        firstMatchFitness + DEFAULT_FITNESS_RULES.dailyRecovery * recoveryDays,
      );
  const tableRow = findTableRow(result.table, conditionDemo.clubId);
  const lines = [
    "",
    `${text("condition.demo")}: ${conditionDemo.profileKey}`,
    `  ${text("setup.selectedClub")}: ${clubLabel(conditionDemo.clubId, league.clubsById)}`,
    `  ${text("condition.lifecycle")}: ${text("common.enabled")}`,
    `  ${text("condition.rules")}: ${text("condition.matchCost")}=${DEFAULT_FITNESS_RULES.matchFitnessCost} ${text("condition.dailyRecovery")}=${DEFAULT_FITNESS_RULES.dailyRecovery} ${text("condition.clamp")}=${DEFAULT_FITNESS_RULES.minFitness}..${DEFAULT_FITNESS_RULES.maxFitness}`,
    `  ${text("condition.firstFixture")}: ${firstFixtureLabel}`,
    `  ${text("condition.afterFirstMatch")}: ${firstMatchFitness}`,
    `  ${text("condition.beforeNextFixture", { days: recoveryDays ?? text("common.unknown") })}: ${recoveredFitness ?? text("common.unavailable")}`,
    `  ${text("condition.finalTable")}: ${formatConditionTableImpact(tableRow, league, text)}`,
    `  ${text("condition.finalCondition")}:`,
    text("condition.playerHeader"),
  ];

  for (const slot of conditionDemo.lineup) {
    lines.push(formatConditionPlayerRow(slot.playerId, league, result));
  }

  return lines;
}

/**
 * Formats a selected-lineup profile without applying it to fixtures or seasons.
 */
export function formatLineupDemoOutput(
  league: FakeLeagueSystem,
  lineupDemo: CliLineupDemo,
  text: Translator,
): readonly string[] {
  const lines = [
    "",
    `${text("lineup.demo")}: ${lineupDemo.profileKey}`,
    `  ${text("setup.selectedClub")}: ${clubLabel(lineupDemo.clubId, league.clubsById)}`,
    `  ${text("lineup.appliedToFixtures")}: ${text("lineup.profileInspectionOnly")}`,
    `  ${text("lineup.changesFromFirstTeam")}:`,
  ];

  if (lineupDemo.playerChanges.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const change of lineupDemo.playerChanges) {
      lines.push(formatLineupDemoChange(change, league, text));
    }
  }

  lines.push(`  ${text("lineup.selectedStarters")}:`);

  for (const slot of lineupDemo.lineup) {
    lines.push(formatLineupDemoStarter(slot, league, text));
  }

  return lines;
}

/**
 * Formats fixture-scoped manual lineup inspection metadata.
 */
export function formatLineupFixtureInspectionLines(
  league: FakeLeagueSystem,
  result: { readonly fixtures: readonly Fixture[] },
  inspection: CliLineupFixtureInspection,
  text: Translator,
): readonly string[] {
  const fixture = findFixtureByValue(result.fixtures, inspection.fixtureValue);
  const fixtureLabel = fixture === undefined ? inspection.fixtureValue : formatFixtureResult(fixture, league);
  const lines = [
    `${text("lineup.override")}: ${inspection.profileKey}`,
    `  ${text("setup.selectedClub")}: ${clubLabel(inspection.clubId, league.clubsById)}`,
    `  ${text("fixture.fixture")}: ${fixtureLabel}`,
    `  ${text("manualSwitch.appliesToFixture")}: ${inspection.appliesToFixture ? text("common.yes") : text("common.no")}`,
  ];

  if (!inspection.appliesToFixture) {
    lines.push(`  ${text("manualSwitch.reason")}: ${text("common.notPlayingReason", { club: clubLabel(inspection.clubId, league.clubsById) })}`);
  }

  lines.push(`  ${text("lineup.selectedStarters")}:`);

  for (const slot of inspection.lineup) {
    lines.push(formatLineupDemoStarter(slot, league, text));
  }

  lines.push(`  ${text("lineup.restedFromFirstTeam")}:`);

  if (inspection.playerChanges.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const change of inspection.playerChanges) {
      lines.push(`  ${text("lineup.replacedBy", {
        from: playerLabel(change.fromPlayerId, league.players),
        to: playerLabel(change.toPlayerId, league.players),
      })}`);
    }
  }

  lines.push(...formatLineupConditionImpactLines(league, inspection, text));

  return lines;
}

/**
 * Formats manual switch inspection metadata for fixture-focused output.
 */
export function formatManualTacticSwitchLines(
  league: FakeLeagueSystem,
  setupDemo: CliSetupDemo,
  manualTacticSwitch: CliManualTacticSwitch,
  manualFixture: ManualTacticSwitchOutputFixture,
  text: Translator,
): readonly string[] {
  const lines = [
    `${text("manualSwitch.title")}:`,
    `  ${text("setup.selectedClub")}: ${clubLabel(setupDemo.clubId, league.clubsById)}`,
    `  ${text("manualSwitch.initialProfile")}: ${setupDemo.profileKey}`,
    `  ${text("manualSwitch.switch")}: ${manualTacticSwitch.minute}' -> ${manualTacticSwitch.targetSetupDemo.profileKey}`,
    `  ${text("manualSwitch.appliesToFixture")}: ${manualFixture.appliesToFixture ? text("common.yes") : text("common.no")}`,
  ];

  if (!manualFixture.appliesToFixture) {
    lines.push(
      `  ${text("manualSwitch.reason")}: ${text("common.notPlayingReason", { club: clubLabel(setupDemo.clubId, league.clubsById) })}`,
      `${text("manualSwitch.profileTimeline")}:`,
      `  ${text("manualSwitch.unchanged")}: ${formatFixtureResult(manualFixture.fixture, league)}`,
    );
    return lines;
  }

  lines.push(`${text("manualSwitch.profileTimeline")}:`);

  if (manualTacticSwitch.minute > 1) {
    lines.push(`  1'-${manualTacticSwitch.minute - 1}': ${setupDemo.profileKey}`);
  }

  lines.push(`  ${manualTacticSwitch.minute}'-${league.matchEngineConfig.minuteCount}': ${manualTacticSwitch.targetSetupDemo.profileKey}`);

  return lines;
}

/**
 * Formats the applied setup demo context for season and fixture outputs.
 */
export function formatSetupDemoLines(league: FakeLeagueSystem, setupDemo: CliSetupDemo, text: Translator): readonly string[] {
  const lines = [
    `${text("setup.demo")}: ${setupDemo.profileKey}`,
    `${text("setup.selectedClub")}: ${clubLabel(setupDemo.clubId, league.clubsById)}`,
    `${text("setup.tactic")}: ${text("setup.mentality")}=${formatMentality(setupDemo.tactic.mentality, text)} ${text("setup.pressing")}=${formatTacticKnob(setupDemo.tactic.pressing)} ${text("setup.directness")}=${formatTacticKnob(setupDemo.tactic.directness)} ${text("setup.width")}=${formatTacticKnob(setupDemo.tactic.width)} ${text("setup.risk")}=${formatTacticKnob(setupDemo.tactic.risk)}`,
    `${text("setup.lineupRoleChanges")}:`,
  ];

  if (setupDemo.roleChanges.length === 0) {
    lines.push(`  ${text("common.none")}`);
    return lines;
  }

  for (const change of setupDemo.roleChanges) {
    lines.push(
      `  ${change.slotKey}: ${playerLabel(change.playerId, league.players)} ${formatLineupRole(change.fromRoleKey, text)} -> ${formatLineupRole(change.toRoleKey, text)}`,
    );
  }

  return lines;
}

/**
 * Formats the per-fixture fitness consequence of the selected lineup.
 */
function formatLineupConditionImpactLines(
  league: FakeLeagueSystem,
  inspection: CliLineupFixtureInspection,
  text: Translator,
): readonly string[] {
  const lines = [`  ${text("lineup.conditionImpact")}:`];

  if (!inspection.appliesToFixture) {
    lines.push(`  ${text("lineup.selectedStartersSpendZero")}`);
    return lines;
  }

  lines.push(`  ${text("lineup.selectedStartersSpend", { fitness: DEFAULT_FITNESS_RULES.matchFitnessCost })}`);

  if (inspection.playerChanges.length === 0) {
    lines.push(`  ${text("lineup.restedFirstTeamPlayers")}: ${text("common.none")}`);
    return lines;
  }

  lines.push(`  ${text("lineup.selectedReplacementsAfterFixture")}:`);
  for (const change of inspection.playerChanges) {
    lines.push(
      `  ${text("lineup.expectedFitness", {
        player: playerLabel(change.toPlayerId, league.players),
        fitness: DEFAULT_FITNESS_RULES.maxFitness - DEFAULT_FITNESS_RULES.matchFitnessCost,
      })}`,
    );
  }

  lines.push(`  ${text("lineup.restedFirstTeamAfterFixture")}:`);
  for (const change of inspection.playerChanges) {
    lines.push(`  ${text("lineup.expectedFitness", {
      player: playerLabel(change.fromPlayerId, league.players),
      fitness: DEFAULT_FITNESS_RULES.maxFitness,
    })}`);
  }

  return lines;
}

/**
 * Formats one player change relative to PRO01's first-team lineup.
 */
function formatLineupDemoChange(change: CliLineupDemoPlayerChange, league: FakeLeagueSystem, text: Translator): string {
  return `  ${change.slotId}: ${playerLabel(change.fromPlayerId, league.players)} -> ${playerLabel(
    change.toPlayerId,
    league.players,
  )} (${formatLineupRole(change.roleKey, text)})`;
}

/**
 * Formats one selected starter row for the lineup-demo inspection block.
 */
function formatLineupDemoStarter(slot: LineupSlot, league: FakeLeagueSystem, text: Translator): string {
  return `  ${slot.slotId} ${playerLabel(slot.playerId, league.players)} ${formatLineupRole(slot.roleKey, text)}`;
}

/**
 * Formats one final condition row for a selected club player.
 */
function formatConditionPlayerRow(playerId: PlayerId, league: FakeLeagueSystem, result: DemoOutputSeasonResult): string {
  const playerName = playerLabel(playerId, league.players).padEnd(19, " ");
  const startFitness = Number(league.playerStates[playerId]?.fitness ?? 0);
  const finalFitness = Number(result.finalPlayerStates?.[playerId]?.fitness ?? 0);
  const delta = finalFitness - startFitness;

  return [
    " ",
    playerName,
    String(startFitness).padStart(5, " "),
    String(finalFitness).padStart(5, " "),
    formatSignedNumber(delta).padStart(5, " "),
  ].join(" ");
}

/**
 * Formats selected-club table impact for the condition demo.
 */
function formatConditionTableImpact(row: LeagueTableRow | undefined, league: FakeLeagueSystem, text: Translator): string {
  if (row === undefined) {
    return text("common.unavailable");
  }

  return text("condition.tableImpact", {
    club: clubLabel(row.clubId, league.clubsById),
    position: row.position,
    points: row.points,
    goalDifference: formatSignedNumber(row.goalDifference),
  });
}

/**
 * Formats a number with an explicit sign for compact inspection output.
 */
function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

/**
 * Finds all played fixtures involving one club in season order.
 */
function clubFixtures(fixtures: readonly Fixture[], clubId: ClubId): readonly Fixture[] {
  const matching: Fixture[] = [];

  for (const fixture of fixtures) {
    if (fixture.homeClubId === clubId || fixture.awayClubId === clubId) {
      matching.push(fixture);
    }
  }

  return matching;
}

/**
 * Finds one final table row by club ID.
 */
function findTableRow(table: readonly LeagueTableRow[], clubId: ClubId): LeagueTableRow | undefined {
  for (const row of table) {
    if (row.clubId === clubId) {
      return row;
    }
  }

  return undefined;
}

/**
 * Finds one fixture by its string ID value.
 */
function findFixtureByValue(fixtures: readonly Fixture[], fixtureValue: string): Fixture | undefined {
  for (const fixture of fixtures) {
    if (String(fixture.id) === fixtureValue) {
      return fixture;
    }
  }

  return undefined;
}

/**
 * Formats a stable lineup role key for presentation output.
 */
function formatLineupRole(roleKey: string, text: Translator): string {
  return text(presentationMessageKey("lineup.role", roleKey));
}

/**
 * Formats a stable tactic mentality key for presentation output.
 */
function formatMentality(mentality: string, text: Translator): string {
  return text(presentationMessageKey("setup.mentalityValue", mentality));
}

/**
 * Formats a tactic knob with a stable precision for CLI inspection.
 */
function formatTacticKnob(value: number): string {
  return value.toFixed(2);
}

/**
 * Builds a typed localization key for curated presentation vocabulary.
 */
function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

/**
 * Formats a generated player display name for CLI output.
 */
function playerLabel(playerId: PlayerId, players: FakeLeagueSystem["players"]): string {
  const player = players[playerId];

  if (player === undefined) {
    return String(playerId);
  }

  return `${player.firstName} ${player.lastName}`;
}

/**
 * Reads the visible generated club name for CLI output.
 */
function clubLabel(clubId: ClubId, clubsById: Readonly<Record<ClubId, Club>>): string {
  return clubsById[clubId]?.name ?? String(clubId);
}
