import type { FakeLeagueSystem } from "@game/content";
import {
  FORMATION_CATALOG,
  buildFormationSquadFitReport,
  createSquadDepth,
  type FormationKey,
  type FormationSlotFit,
  type FormationSquadFitReport,
} from "@game/engine";
import type {
  MessageKey,
  Translator,
} from "@game/i18n";

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];

/** Player ID type derived from fake content without importing domain directly. */
type PlayerId = FakeLeagueSystem["playerIds"][number];

/**
 * Formats a standalone formation-fit inspection report.
 */
export function formatFormationFitOutput(
  league: FakeLeagueSystem,
  seed: string,
  formationKey: FormationKey,
  text: Translator,
): readonly string[] {
  const clubId = firstGeneratedClubId(league, "formation-fit inspection");
  const club = league.clubsById[clubId];
  const report = buildFormationFitReportForCli(league, clubId, formationKey);
  const formation = FORMATION_CATALOG[formationKey];
  const lines = [
    text("formation.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("season.competition")}: ${league.competition.name}`,
    `${text("setup.selectedClub")}: ${clubLabel(clubId, league)}`,
    `${text("formation.squadSize")}: ${club?.playerIds.length ?? 0}`,
    `${text("formation.selectedFormation")}: ${formationKey}`,
    text("formation.inspectionOnly"),
    "",
    `${text("formation.slots")}:`,
  ];

  for (const slot of formation.slots) {
    lines.push(
      `  ${slot.slotKey} ${formatFormationPositionFamily(slot.positionFamily, text)} ${text("formation.department")}=${formatFormationDepartment(slot.department, text)}${slot.side === undefined ? "" : ` ${text("formation.side")}=${formatFormationSide(slot.side, text)}`}`,
    );
  }

  lines.push(`${text("formation.coveredSlots")}:`);
  lines.push(...formatFormationSlotFitRows(report.coveredSlots, text));
  lines.push(`${text("formation.adaptedWeakSlots")}:`);
  lines.push(...formatFormationSlotFitRows([...report.adaptedSlots, ...report.weakSlots], text));
  lines.push(`${text("formation.missingSlots")}:`);
  lines.push(...formatFormationSlotFitRows(report.uncoveredSlots, text));
  lines.push(`${text("formation.surplusGroups")}:`);

  if (report.surplusGroups.length === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    for (const group of report.surplusGroups) {
      lines.push(
        `  ${formatFormationSurplusGroup(group.key, text)} ${text("formation.players")}=${group.playerCount} ${text("formation.slotCount")}=${group.slotCount}`,
      );
    }
  }

  lines.push(`${text("formation.fitWarnings")}:`);
  lines.push(...formatFormationFitWarningRows(report, text));
  lines.push(`${text("formation.squadFitNotes")}:`);
  lines.push(
    `  ${report.squadFitHints.length === 0
      ? text("common.none")
      : report.squadFitHints.map((hint) => formatFormationFitNote(hint, text)).join(", ")}`,
  );

  return lines;
}

/**
 * Builds the first CLI-visible formation-fit report from generated fake content.
 */
function buildFormationFitReportForCli(
  league: FakeLeagueSystem,
  clubId: ClubId,
  formationKey: FormationKey,
): FormationSquadFitReport {
  const club = league.clubsById[clubId];
  const lineup = league.lineupsByClubId[clubId];

  if (club === undefined) {
    throw new Error(`Cannot build formation-fit report without club: ${clubId}`);
  }

  if (lineup === undefined) {
    throw new Error(`Cannot build formation-fit report without lineup: ${clubId}`);
  }

  const starterPlayerIds = lineup.map((slot) => slot.playerId);
  const starterPlayerSet = new Set<PlayerId>(starterPlayerIds);

  return buildFormationSquadFitReport({
    formation: FORMATION_CATALOG[formationKey],
    squadDepth: createSquadDepth({
      clubId,
      squadPlayerIds: club.playerIds,
      starterPlayerIds,
      benchReservePlayerIds: club.playerIds.filter((playerId) => !starterPlayerSet.has(playerId)),
    }),
    players: league.players,
  });
}

/**
 * Formats compact slot-fit rows or a stable `none` marker.
 */
function formatFormationSlotFitRows(slots: readonly FormationSlotFit[], text: Translator): readonly string[] {
  if (slots.length === 0) {
    return [`  ${text("common.none")}`];
  }

  return slots.map(
    (slot) =>
      `  ${slot.slotKey} ${formatFormationPositionFamily(slot.positionFamily, text)} ${text("formation.best")}=${formatFormationSuitability(slot.bestSuitability, text)} ${text("formation.natural")}=${countSlotCandidates(slot, "natural")} ${text("formation.adapted")}=${countSlotCandidates(slot, "adapted")} ${text("formation.weak")}=${countSlotCandidates(slot, "weak")}`,
  );
}

/**
 * Formats role-depth warnings for slots covered only through adaptation.
 */
function formatFormationFitWarningRows(report: FormationSquadFitReport, text: Translator): readonly string[] {
  const warnings = report.squadFitHints
    .filter((hint) => hint.startsWith("adapted_only:"))
    .map((hint) =>
      `  ${text("formation.warning.weakDepth", {
        position: formatFormationPositionFamily(hint.slice("adapted_only:".length), text),
      })}`,
    );

  return warnings.length === 0 ? [`  ${text("common.none")}`] : warnings;
}

/**
 * Formats a stable formation department key for presentation output.
 */
function formatFormationDepartment(department: string, text: Translator): string {
  return text(presentationMessageKey("formation.department", department));
}

/**
 * Formats a stable formation side key for presentation output.
 */
function formatFormationSide(side: string, text: Translator): string {
  return text(presentationMessageKey("formation.side", side));
}

/**
 * Formats a stable position-family key for presentation output.
 */
function formatFormationPositionFamily(positionFamily: string, text: Translator): string {
  return text(presentationMessageKey("formation.position", positionFamily));
}

/**
 * Formats a stable slot suitability key for presentation output.
 */
function formatFormationSuitability(suitability: string, text: Translator): string {
  return text(presentationMessageKey("formation.suitability", suitability));
}

/**
 * Formats a stable surplus-group key for presentation output.
 */
function formatFormationSurplusGroup(group: string, text: Translator): string {
  return text(presentationMessageKey("formation.surplus", group));
}

/**
 * Formats a stable factual formation-fit note by localizing its prefix and target key.
 */
function formatFormationFitNote(hint: string, text: Translator): string {
  const [kind, value] = hint.split(":");

  if (kind === "gap" && value !== undefined) {
    return text("formation.fitNote.coverageGap", { position: formatFormationFitTarget(value, text) });
  }

  if (kind === "adapted_only" && value !== undefined) {
    return text("formation.fitNote.adaptedOnly", { position: formatFormationPositionFamily(value, text) });
  }

  if (kind === "extra_depth" && value !== undefined) {
    return text("formation.fitNote.extraGroup", { group: formatFormationSurplusGroup(value, text) });
  }

  return hint;
}

/**
 * Formats either a position-family target or a broader factual coverage target.
 */
function formatFormationFitTarget(value: string, text: Translator): string {
  if (value === "center_back_depth" || value === "wide_midfielder" || value === "striker_depth") {
    return text(presentationMessageKey("formation.fitTarget", value));
  }

  return formatFormationPositionFamily(value, text);
}

/**
 * Builds a typed localization key for curated formation vocabulary.
 */
function presentationMessageKey(prefix: string, value: string): MessageKey {
  return `${prefix}.${value}` as MessageKey;
}

/**
 * Counts slot candidates by suitability for clearer CLI inspection.
 */
function countSlotCandidates(slot: FormationSlotFit, suitability: FormationSlotFit["bestSuitability"]): number {
  return slot.candidates.filter((candidate) => candidate.suitability === suitability).length;
}

/**
 * Reads the first generated club ID for deterministic CLI inspection.
 */
function firstGeneratedClubId(league: FakeLeagueSystem, label: string): ClubId {
  const clubId = league.clubIds[0];

  if (clubId === undefined) {
    throw new Error(`Cannot build ${label} without a generated club`);
  }

  return clubId;
}

/**
 * Reads a compact club label for CLI output.
 */
function clubLabel(clubId: ClubId, league: FakeLeagueSystem): string {
  return league.clubsById[clubId]?.name ?? String(clubId);
}
