import type { FakeLeagueSystem } from "@game/content";
import {
  computePlayerMatchStats,
  type LineupSlot,
  type MatchExplanationTrace,
  type PlayerMatchStatRegistration,
  type PlayerMatchStatRow,
  type simulateSeason,
} from "@game/engine";
import type {
  MessageKey,
  Translator,
} from "@game/i18n";

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];

/** Player ID type derived from fake content without importing domain directly. */
type PlayerId = FakeLeagueSystem["playerIds"][number];

/** Club type derived from fake content without importing domain directly. */
type Club = FakeLeagueSystem["clubs"][number];

/** Fixture type derived from the exported season simulation. */
type Fixture = ReturnType<typeof simulateSeason>["fixtures"][number];

/** Match event side marker used by durable fixture report events. */
type MatchEventSide = "home" | "away";

/**
 * Fixture-scoped lineup metadata needed to render all-starter player stats.
 */
export interface FixtureDetailLineupInspection {
  /** Club whose lineup is being overridden for the rendered fixture. */
  readonly clubId: ClubId;
  /** Ordered starters selected by the CLI lineup profile. */
  readonly lineup: readonly LineupSlot[];
  /** Whether the selected lineup applies to this fixture. */
  readonly appliesToFixture: boolean;
}

/**
 * Input required to render one already-selected fixture detail block.
 */
export interface FixtureDetailOutputInput {
  /** Generated fake league data used only for presentation labels and lineups. */
  readonly league: FakeLeagueSystem;
  /** Fixture to render; `undefined` keeps the old unavailable output path. */
  readonly fixture: Fixture | undefined;
  /** Original fixture ID value requested by the user. */
  readonly fixtureValue: string;
  /** Localized CLI label reader. */
  readonly text: Translator;
  /** Optional lineup override inspection used to include overridden starters. */
  readonly lineupFixtureInspection: FixtureDetailLineupInspection | undefined;
  /** Optional engine explanation trace rendered after player stats. */
  readonly explanationTrace: MatchExplanationTrace | undefined;
}

/**
 * Formats rich structured detail for one requested fixture.
 */
export function formatFixtureDetailOutput(input: FixtureDetailOutputInput): readonly string[] {
  const { league, fixture, fixtureValue, text, lineupFixtureInspection, explanationTrace } = input;

  if (fixture === undefined) {
    return ["", `${text("fixture.fixture")} ${fixtureValue}: ${text("common.unavailable")}`];
  }

  const report = fixture.result?.report;
  const lines = [formatFixtureResult(fixture, league)];

  if (report === undefined) {
    lines.push(text("fixture.eventsUnavailable"));
    lines.push(text("fixture.playerStatsUnavailable"));
    return lines;
  }

  lines.push(`${text("fixture.events")}:`);

  const eventLines = formatFixtureEvents(fixture, league, text);
  if (eventLines.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    lines.push(...eventLines);
  }

  lines.push(`${text("fixture.playerStatsAllStarters")}:`);

  const statLines = formatFixturePlayerStats(fixture, league, lineupFixtureInspection);
  if (statLines.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    lines.push(text("fixture.playerStatsHeader"));
    lines.push(...statLines);
  }

  if (explanationTrace !== undefined) {
    lines.push(...formatFixtureExplanationTraceOutput(explanationTrace, league, text));
  }

  return lines;
}

/**
 * Formats one fixture result line.
 */
export function formatFixtureResult(fixture: Fixture, league: FakeLeagueSystem): string {
  const result = fixture.result;
  const score = result === undefined ? "vs" : `${result.homeGoals}-${result.awayGoals}`;

  return [
    String(fixture.id),
    clubLabel(fixture.homeClubId, league.clubsById),
    score,
    clubLabel(fixture.awayClubId, league.clubsById),
  ].join(" ");
}

/**
 * Formats available goal scorers from one fixture report.
 */
export function formatFixtureScorers(fixture: Fixture, league: FakeLeagueSystem): readonly string[] {
  const report = fixture.result?.report;
  const scorers: string[] = [];

  if (report === undefined) {
    return scorers;
  }

  for (const event of report.events) {
    if (event.type !== "goal") {
      continue;
    }

    const clubId = event.shot.side === "home" ? fixture.homeClubId : fixture.awayClubId;
    scorers.push(`${event.shot.minute}' ${playerLabel(event.scorerPlayerId, league.players)} (${clubLabel(clubId, league.clubsById)})`);
  }

  return scorers;
}

/**
 * Formats structured goal, save, miss, and block events for one fixture.
 */
function formatFixtureEvents(fixture: Fixture, league: FakeLeagueSystem, text: Translator): readonly string[] {
  const report = fixture.result?.report;
  const events: string[] = [];

  if (report === undefined) {
    return events;
  }

  for (const event of report.events) {
    switch (event.type) {
      case "goal": {
        const clubId = sideClubId(fixture, event.shot.side);
        const assist = event.assistPlayerId === undefined ? "" : ` ${text("event.assist")}=${playerLabel(event.assistPlayerId, league.players)}`;
        const creator = event.creatorPlayerId === undefined ? "" : ` ${text("event.creator")}=${playerLabel(event.creatorPlayerId, league.players)}`;
        events.push(
          `  ${event.shot.minute}' ${text("event.goal")} ${clubLabel(clubId, league.clubsById)} ${playerLabel(event.scorerPlayerId, league.players)}${assist}${creator} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
        );
        break;
      }

      case "save": {
        const defendingClubId = sideClubId(fixture, oppositeSide(event.shot.side));
        const attackingClubId = sideClubId(fixture, event.shot.side);
        events.push(
          `  ${event.shot.minute}' ${text("event.save")} ${clubLabel(defendingClubId, league.clubsById)} ${playerLabel(event.goalkeeperPlayerId, league.players)} ${text("event.vs")} ${clubLabel(attackingClubId, league.clubsById)} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
        );
        break;
      }

      case "miss": {
        const clubId = sideClubId(fixture, event.shot.side);
        events.push(
          `  ${event.shot.minute}' ${text("event.miss")} ${clubLabel(clubId, league.clubsById)} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
        );
        break;
      }

      case "block": {
        const clubId = sideClubId(fixture, event.shot.side);
        const defender = event.primaryDefenderPlayerId === undefined
          ? ""
          : ` ${text("event.defender")}=${playerLabel(event.primaryDefenderPlayerId, league.players)}`;
        events.push(
          `  ${event.shot.minute}' ${text("event.block")} ${clubLabel(clubId, league.clubsById)}${defender} ${text("event.shot")}=${formatShotType(event.shot.shotType, text)} ${text("event.chance")}=${formatChanceType(event.shot.chanceType, text)}`,
        );
        break;
      }

      case "full_time":
      case "half_time":
      case "kickoff":
        break;
    }
  }

  return events;
}

/**
 * Formats compact engine-derived player match stats for one fixture.
 */
function formatFixturePlayerStats(
  fixture: Fixture,
  league: FakeLeagueSystem,
  lineupFixtureInspection: FixtureDetailLineupInspection | undefined,
): readonly string[] {
  const report = fixture.result?.report;

  if (report === undefined) {
    return [];
  }

  return computePlayerMatchStats({
    report,
    playerRegistrations: fixturePlayerRegistrations(fixture, league, lineupFixtureInspection),
    sortBy: "contribution",
  }).map((row) => formatPlayerMatchStatRow(row, fixture, league));
}

/**
 * Builds explicit fixture player registrations from the fake home and away lineups.
 */
function fixturePlayerRegistrations(
  fixture: Fixture,
  league: FakeLeagueSystem,
  lineupFixtureInspection: FixtureDetailLineupInspection | undefined,
): readonly PlayerMatchStatRegistration[] {
  const registrations: PlayerMatchStatRegistration[] = [];
  const overriddenLineup =
    lineupFixtureInspection?.appliesToFixture === true ? lineupFixtureInspection.lineup : undefined;
  const homeLineup =
    fixture.homeClubId === lineupFixtureInspection?.clubId && overriddenLineup !== undefined
      ? overriddenLineup
      : league.lineupsByClubId[fixture.homeClubId];
  const awayLineup =
    fixture.awayClubId === lineupFixtureInspection?.clubId && overriddenLineup !== undefined
      ? overriddenLineup
      : league.lineupsByClubId[fixture.awayClubId];

  appendLineupRegistrations(registrations, homeLineup, "home");
  appendLineupRegistrations(registrations, awayLineup, "away");

  return registrations;
}

/**
 * Appends one side's lineup to the explicit player-registration list.
 */
function appendLineupRegistrations(
  registrations: PlayerMatchStatRegistration[],
  lineup: readonly LineupSlot[] | undefined,
  side: MatchEventSide,
): void {
  if (lineup === undefined) {
    return;
  }

  for (const slot of lineup) {
    registrations.push({
      playerId: slot.playerId,
      side,
    });
  }
}

/**
 * Formats one compact player match-stat row.
 */
function formatPlayerMatchStatRow(row: PlayerMatchStatRow, fixture: Fixture, league: FakeLeagueSystem): string {
  const playerName = playerLabel(row.playerId, league.players).padEnd(19, " ");
  const clubName = clubLabel(sideClubId(fixture, row.side), league.clubsById).padEnd(20, " ");

  return [
    " ",
    playerName,
    clubName,
    String(row.goals).padStart(1, " "),
    String(row.assists).padStart(1, " "),
    String(row.shots).padStart(2, " "),
    String(row.shotsOnTarget).padStart(3, " "),
    String(row.saves).padStart(2, " "),
  ].join(" ");
}

/**
 * Formats compact localized explanation trace output for one fixture.
 */
function formatFixtureExplanationTraceOutput(
  trace: MatchExplanationTrace,
  league: FakeLeagueSystem,
  text: Translator,
): readonly string[] {
  return [
    `${text("fixture.explanation.title")}:`,
    `  ${text("fixture.explanation.teamStrength")}:`,
    formatExplanationStrengthLine(trace.home, league, text),
    formatExplanationStrengthLine(trace.away, league, text),
    `  ${text("fixture.explanation.tacticDistribution")}:`,
    formatExplanationTacticLine(trace.home, league, text),
    formatExplanationTacticLine(trace.away, league, text),
    `  ${text("fixture.explanation.lineupRoles")}:`,
    formatExplanationLineupLine(trace.home, league, text),
    formatExplanationLineupLine(trace.away, league, text),
    `  ${text("fixture.explanation.conditionImpact")}:`,
    formatExplanationConditionLine(trace.home, league, text),
    formatExplanationConditionLine(trace.away, league, text),
    `  ${text("fixture.explanation.chanceSummary")}:`,
    formatExplanationOpportunityLine(trace.home.clubId, trace.opportunitySummary.home, league, text),
    formatExplanationOpportunityLine(trace.away.clubId, trace.opportunitySummary.away, league, text),
    `  ${text("fixture.explanation.variance")}: ${trace.variance.markers.map((marker) => formatVarianceMarker(marker, text)).join(", ")}`,
  ];
}

/**
 * Formats one team's strength snapshot.
 */
function formatExplanationStrengthLine(
  team: MatchExplanationTrace["home"],
  league: FakeLeagueSystem,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, league.clubsById)}: ${text("fixture.explanation.attack")}=${formatDecimal(team.strength.attack)} ${text("fixture.explanation.midfield")}=${formatDecimal(team.strength.midfield)} ${text("fixture.explanation.defense")}=${formatDecimal(team.strength.defense)} ${text("fixture.explanation.goalkeeper")}=${formatDecimal(team.strength.goalkeeper)} ${text("fixture.explanation.overall")}=${formatDecimal(team.strength.overall)}`;
}

/**
 * Formats one team's tactic snapshot.
 */
function formatExplanationTacticLine(
  team: MatchExplanationTrace["home"],
  league: FakeLeagueSystem,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, league.clubsById)}: ${text("setup.directness")}=${formatTacticKnob(team.tacticDistribution.directness)} ${text("setup.pressing")}=${formatTacticKnob(team.tacticDistribution.pressing)} ${text("setup.width")}=${formatTacticKnob(team.tacticDistribution.width)} ${text("setup.risk")}=${formatTacticKnob(team.tacticDistribution.risk)}`;
}

/**
 * Formats one team's role-count snapshot.
 */
function formatExplanationLineupLine(
  team: MatchExplanationTrace["home"],
  league: FakeLeagueSystem,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, league.clubsById)}: ${formatRoleCounts(team, text)}`;
}

/**
 * Formats one team's condition-impact snapshot.
 */
function formatExplanationConditionLine(
  team: MatchExplanationTrace["home"],
  league: FakeLeagueSystem,
  text: Translator,
): string {
  return `    ${clubLabel(team.clubId, league.clubsById)}: ${formatConditionTracking(team.conditionImpact.tracking, text)} ${text("fixture.explanation.effect")}=${formatConditionEffect(team.conditionImpact.effectDirection, text)} ${text("fixture.explanation.affectedPlayers")}=${team.conditionImpact.affectedPlayerCount}`;
}

/**
 * Formats one team's chance and shot summary.
 */
function formatExplanationOpportunityLine(
  clubId: ClubId,
  summary: MatchExplanationTrace["opportunitySummary"]["home"],
  league: FakeLeagueSystem,
  text: Translator,
): string {
  return `    ${clubLabel(clubId, league.clubsById)}: ${text("fixture.explanation.opportunities")}=${summary.opportunities} ${text("fixture.explanation.shots")}=${summary.shots} ${text("fixture.explanation.shotsOnTarget")}=${summary.shotsOnTarget} ${text("fixture.explanation.goals")}=${summary.goals} ${text("fixture.explanation.blocks")}=${summary.blockedShots} ${text("fixture.explanation.savedShots")}=${summary.savedShots} ${text("fixture.explanation.chanceTypes")}=${formatTraceBuckets(summary.chanceTypeCounts, (key) => formatChanceType(key, text), text)} ${text("fixture.explanation.shotTypes")}=${formatTraceBuckets(summary.shotTypeCounts, (key) => formatShotType(key, text), text)}`;
}

/**
 * Returns the fixture club ID for one match side.
 */
function sideClubId(fixture: Fixture, side: MatchEventSide): ClubId {
  return side === "home" ? fixture.homeClubId : fixture.awayClubId;
}

/**
 * Returns the other side of one match event.
 */
function oppositeSide(side: MatchEventSide): MatchEventSide {
  return side === "home" ? "away" : "home";
}

/**
 * Formats a stable shot-type key for presentation output.
 */
function formatShotType(shotType: string, text: Translator): string {
  return text(presentationMessageKey("event.shotType", shotType));
}

/**
 * Formats a stable chance-type key for presentation output.
 */
function formatChanceType(chanceType: string, text: Translator): string {
  return text(presentationMessageKey("event.chanceType", chanceType));
}

/**
 * Formats sorted role counts for one explanation snapshot.
 */
function formatRoleCounts(team: MatchExplanationTrace["home"], text: Translator): string {
  const counts: { readonly roleKey: string; readonly count: number }[] = [];

  for (const slot of team.lineup.slots) {
    const existing = counts.find((candidate) => candidate.roleKey === slot.roleKey);

    if (existing === undefined) {
      counts.push({ roleKey: slot.roleKey, count: 1 });
      continue;
    }

    counts.splice(counts.indexOf(existing), 1, { roleKey: existing.roleKey, count: existing.count + 1 });
  }

  return counts
    .sort((left, right) => compareAscii(left.roleKey, right.roleKey))
    .map((entry) => `${formatLineupRole(entry.roleKey, text)}=${entry.count}`)
    .join(" ");
}

/**
 * Formats trace buckets with stable machine-key order.
 */
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

/**
 * Formats condition tracking state.
 */
function formatConditionTracking(
  tracking: MatchExplanationTrace["home"]["conditionImpact"]["tracking"],
  text: Translator,
): string {
  return text(presentationMessageKey("fixture.explanation.conditionTracking", tracking));
}

/**
 * Formats condition effect direction.
 */
function formatConditionEffect(
  effect: MatchExplanationTrace["home"]["conditionImpact"]["effectDirection"],
  text: Translator,
): string {
  return text(presentationMessageKey("fixture.explanation.effectDirection", effect));
}

/**
 * Formats one variance marker.
 */
function formatVarianceMarker(marker: MatchExplanationTrace["variance"]["markers"][number], text: Translator): string {
  return text(presentationMessageKey("fixture.explanation.varianceMarker", marker));
}

/**
 * Formats a stable lineup role key for presentation output.
 */
function formatLineupRole(roleKey: string, text: Translator): string {
  return text(presentationMessageKey("lineup.role", roleKey));
}

/**
 * Formats a tactic knob with a stable precision for CLI inspection.
 */
function formatTacticKnob(value: number): string {
  return value.toFixed(2);
}

/**
 * Formats a numeric trace value with stable precision.
 */
function formatDecimal(value: number): string {
  return value.toFixed(2);
}

/**
 * Builds a typed localization key for curated presentation vocabulary.
 */
function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

/**
 * Compares stable ASCII keys without locale-dependent ordering.
 */
function compareAscii(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
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
