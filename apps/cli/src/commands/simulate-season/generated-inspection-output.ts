import {
  generateInitialYouthAcademies,
  getGeneratedPlayerArchetype,
  openingCompetitiveTierForClubRank,
  type FakeLeagueSystem,
} from "@game/content";
import { summarizePlayerDevelopmentAbilities } from "@game/engine";
import type {
  MessageKey,
  Translator,
} from "@game/i18n";

/** Club ID type derived from fake content without importing domain directly. */
type ClubId = FakeLeagueSystem["clubIds"][number];

/** Player ID type derived from fake content without importing domain directly. */
type PlayerId = FakeLeagueSystem["playerIds"][number];

/**
 * Formats a read-only review of generated player identity metadata.
 */
export function formatIdentityReviewOutput(league: FakeLeagueSystem, seed: string, text: Translator): readonly string[] {
  const clubId = firstGeneratedClubId(league, "identity review");
  const club = league.clubsById[clubId];

  if (club === undefined) {
    throw new Error(`Cannot build identity review without club: ${clubId}`);
  }

  const lines = [
    text("identity.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("season.competition")}: ${league.competition.name}`,
    `${text("setup.selectedClub")}: ${clubLabel(clubId, league)}`,
    `${text("formation.squadSize")}: ${club.playerIds.length}`,
    `${text("identity.scope")}: ${text("identity.scopeValue")}`,
    "",
    `${text("identity.players")}:`,
    text("identity.playerHeader"),
  ];

  for (const playerId of club.playerIds) {
    lines.push(formatIdentityPlayerRow(playerId, league, text));
  }

  lines.push("");
  lines.push(`${text("identity.nationalitySummary")}:`);

  for (const summaryLine of formatIdentityNationalitySummary(club.playerIds, league, text)) {
    lines.push(summaryLine);
  }

  return lines;
}

/**
 * Formats an inspection-only report for generated player quality.
 *
 * The report intentionally aggregates hidden generation data. It helps us
 * review content quality without showing exact potential or turning internal
 * archetypes into player-facing scouting truth.
 */
export function formatPlayerGenerationReportOutput(
  league: FakeLeagueSystem,
  seed: string,
  text: Translator,
): readonly string[] {
  const report = buildPlayerGenerationQualityReport(league, seed);

  const lines = [
    text("playerGeneration.title"),
    `${text("season.seed")}: ${seed}`,
    `${text("season.competition")}: ${league.competition.name}`,
    `${text("playerGeneration.division")}: ${text(presentationMessageKey("playerGeneration.category", report.division))}`,
    `${text("playerGeneration.clubs")}: ${report.clubCount}`,
    `${text("playerGeneration.players")}: ${report.playerCount}`,
    text("playerGeneration.inspectionOnly"),
    "",
    `${text("playerGeneration.currentAbilityDistribution")}:`,
    `  0-8: ${report.currentAbilityDistribution.low}`,
    `  9-11: ${report.currentAbilityDistribution.categoryDepth}`,
    `  12-14: ${report.currentAbilityDistribution.categoryStrong}`,
    `  15+: ${report.currentAbilityDistribution.highCurrent}`,
    "",
    `${text("playerGeneration.potentialDistribution")}:`,
  ];

  for (const potentialClass of ["limited", "category", "interesting", "serious", "elite"] as const) {
    lines.push(
      `  ${text(presentationMessageKey("playerGeneration.potentialClass", potentialClass))}: ${report.potentialDistribution[potentialClass]}`,
    );
  }

  lines.push("");
  lines.push(`${text("playerGeneration.potentialRoomByAge")}:`);
  for (const ageBand of ["under18", "age18To21", "age22To25", "age26To29", "age30Plus"] as const) {
    const row = report.potentialRoomByAge[ageBand];
    lines.push(
      `  ${text(presentationMessageKey("playerGeneration.ageBand", ageBand))}: avg=${formatReportNumber(row.average)} max=${formatReportNumber(row.max)} players=${row.players}`,
    );
  }
  lines.push(`  ${text("playerGeneration.matureHighRoomWarnings")}: ${report.matureHighRoomWarnings.count}`);
  if (report.matureHighRoomWarnings.examplePlayerId !== undefined) {
    lines.push(`  ${text("playerGeneration.matureHighRoomExample")}: ${report.matureHighRoomWarnings.examplePlayerId}`);
  }

  lines.push("");
  lines.push(`${text("playerGeneration.rarityBudget")}:`);
  lines.push(
    `  ${text("playerGeneration.rarity.whiteFly")}: ${report.rarityUsage.whiteFly} / ${league.playerRarityBudget.whiteFlyCount}`,
  );
  lines.push(
    `  ${text("playerGeneration.rarity.seriousProspect")}: ${report.rarityUsage.seriousProspect} / ${league.playerRarityBudget.seriousProspectCount}`,
  );
  lines.push("");
  lines.push(`${text("playerGeneration.prospectCoverage")}:`);
  lines.push(
    `  ${text("playerGeneration.clubsWithProspects")}: ${report.clubsWithProspects} / ${report.clubCount}`,
  );
  lines.push("");
  lines.push(`${text("playerGeneration.roleCoherenceWarnings")}:`);

  if (report.roleCoherenceWarnings.total === 0) {
    lines.push(`  ${text("common.none")}`);
  } else {
    lines.push(
      `  ${text("playerGeneration.warning.defenderFinishing")}: ${report.roleCoherenceWarnings.defenderFinishing}`,
    );
    lines.push(
      `  ${text("playerGeneration.warning.strikerTackling")}: ${report.roleCoherenceWarnings.strikerTackling}`,
    );
    lines.push(
      `  ${text("playerGeneration.warning.outfieldGoalkeeping")}: ${report.roleCoherenceWarnings.outfieldGoalkeeping}`,
    );
  }

  lines.push("");
  lines.push(`${text("playerGeneration.youthAcademyBaseline")}:`);
  lines.push(`  ${text("playerGeneration.players")}: ${report.youthAcademy.playerCount}`);
  lines.push(
    `  ${text("playerGeneration.youthExactSize")}: ${report.youthAcademy.clubsAtExactTarget} / ${report.clubCount}`,
  );
  lines.push(
    `  ${text("playerGeneration.youthRosterSizeMinMax")}: ${report.youthAcademy.minRosterSize} / ${report.youthAcademy.maxRosterSize}`,
  );
  lines.push(
    `  ${text("playerGeneration.youthDepartments")}: GK=${report.youthAcademy.departments.goalkeepers} DEF=${report.youthAcademy.departments.defenders} MID=${report.youthAcademy.departments.midfielders} ATT=${report.youthAcademy.departments.attackers}`,
  );
  lines.push(
    `  ${text("playerGeneration.youthAges")}: 15=${report.youthAcademy.ages.fifteen} 16=${report.youthAcademy.ages.sixteen} 17=${report.youthAcademy.ages.seventeen} 18=${report.youthAcademy.ages.eighteen} 19=${report.youthAcademy.ages.nineteen} 20+=${report.youthAcademy.ages.overNineteen}`,
  );
  lines.push(`  ${text("playerGeneration.youthRoleCoherenceWarnings")}:`);
  if (report.youthAcademy.roleCoherenceWarnings.total === 0) {
    lines.push(`    ${text("common.none")}`);
  } else {
    lines.push(
      `    ${text("playerGeneration.warning.defenderFinishing")}: ${report.youthAcademy.roleCoherenceWarnings.defenderFinishing}`,
    );
    lines.push(
      `    ${text("playerGeneration.warning.strikerTackling")}: ${report.youthAcademy.roleCoherenceWarnings.strikerTackling}`,
    );
    lines.push(
      `    ${text("playerGeneration.warning.outfieldGoalkeeping")}: ${report.youthAcademy.roleCoherenceWarnings.outfieldGoalkeeping}`,
    );
  }

  return lines;
}

/**
 * Aggregate player-generation quality metrics printed by the inspection report.
 */
interface PlayerGenerationQualityReport {
  /** Broad division category represented by the generated league. */
  readonly division: "first_division" | "second_division" | "third_division";
  /** Number of generated clubs inspected. */
  readonly clubCount: number;
  /** Number of generated players inspected. */
  readonly playerCount: number;
  /** Current-ability bands based on each player's canonical role quality. */
  readonly currentAbilityDistribution: {
    readonly low: number;
    readonly categoryDepth: number;
    readonly categoryStrong: number;
    readonly highCurrent: number;
  };
  /** Broad potential-class counts from generation archetypes. */
  readonly potentialDistribution: {
    readonly limited: number;
    readonly category: number;
    readonly interesting: number;
    readonly serious: number;
    readonly elite: number;
  };
  /** Average and maximum current-to-potential room by age band. */
  readonly potentialRoomByAge: Record<
    "under18" | "age18To21" | "age22To25" | "age26To29" | "age30Plus",
    {
      readonly players: number;
      readonly average: number;
      readonly max: number;
    }
  >;
  /** Mature players whose remaining room should be inspected by developers. */
  readonly matureHighRoomWarnings: {
    readonly count: number;
    readonly examplePlayerId?: string;
  };
  /** Actual usage of league-level rarity assignments. */
  readonly rarityUsage: {
    readonly whiteFly: number;
    readonly seriousProspect: number;
  };
  /** Clubs that have at least one generated prospect archetype. */
  readonly clubsWithProspects: number;
  /** Counts for role-incoherent ability spikes that should stay at zero. */
  readonly roleCoherenceWarnings: {
    readonly defenderFinishing: number;
    readonly strikerTackling: number;
    readonly outfieldGoalkeeping: number;
    readonly total: number;
  };
  /** Initial academy/refill baseline generated from the same world seed. */
  readonly youthAcademy: {
    readonly playerCount: number;
    readonly clubsAtExactTarget: number;
    readonly minRosterSize: number;
    readonly maxRosterSize: number;
    readonly departments: {
      readonly goalkeepers: number;
      readonly defenders: number;
      readonly midfielders: number;
      readonly attackers: number;
    };
    readonly ages: {
      readonly fifteen: number;
      readonly sixteen: number;
      readonly seventeen: number;
      readonly eighteen: number;
      readonly nineteen: number;
      readonly overNineteen: number;
    };
    readonly roleCoherenceWarnings: {
      readonly defenderFinishing: number;
      readonly strikerTackling: number;
      readonly outfieldGoalkeeping: number;
      readonly total: number;
    };
  };
}

/**
 * Formats one player row for the generated identity review.
 */
function formatIdentityPlayerRow(playerId: PlayerId, league: FakeLeagueSystem, text: Translator): string {
  const identity = league.playerIdentities[playerId];

  if (identity === undefined) {
    return `  ${playerLabel(playerId, league).padEnd(19, " ")} ${text("common.unavailable")}`;
  }

  const player = playerLabel(playerId, league).padEnd(19, " ");
  const nationality = formatIdentityNationality(identity.nationality, text).padEnd(14, " ");
  const secondNationality = (identity.secondNationality === undefined
    ? text("common.none")
    : formatIdentityNationality(identity.secondNationality, text)
  ).padEnd(14, " ");
  const birthCountry = formatIdentityNationality(identity.birthCountry, text).padEnd(14, " ");
  const nameCulture = formatIdentityNameCulture(identity.nameCulture, text);

  return `  ${player} ${nationality} ${secondNationality} ${birthCountry} ${nameCulture}`;
}

/**
 * Formats the deterministic nationality mix for the reviewed club.
 */
function formatIdentityNationalitySummary(
  playerIds: readonly PlayerId[],
  league: FakeLeagueSystem,
  text: Translator,
): readonly string[] {
  const counts: Record<string, number> = {};

  for (const playerId of playerIds) {
    const identity = league.playerIdentities[playerId];

    if (identity === undefined) {
      continue;
    }

    counts[identity.nationality] = (counts[identity.nationality] ?? 0) + 1;
  }

  return Object.keys(counts)
    .sort()
    .map((nationality) => `  ${formatIdentityNationality(nationality, text)}: ${counts[nationality] ?? 0}`);
}

/**
 * Builds aggregate quality metrics for generated player content.
 */
function buildPlayerGenerationQualityReport(league: FakeLeagueSystem, seed: string): PlayerGenerationQualityReport {
  const currentAbilityDistribution = {
    low: 0,
    categoryDepth: 0,
    categoryStrong: 0,
    highCurrent: 0,
  };
  const potentialDistribution = {
    limited: 0,
    category: 0,
    interesting: 0,
    serious: 0,
    elite: 0,
  };
  const rarityUsage = {
    whiteFly: 0,
    seriousProspect: 0,
  };
  const roleCoherenceWarnings = {
    defenderFinishing: 0,
    strikerTackling: 0,
    outfieldGoalkeeping: 0,
    total: 0,
  };
  const potentialRoomsByAge: Record<keyof PlayerGenerationQualityReport["potentialRoomByAge"], number[]> = {
    under18: [],
    age18To21: [],
    age22To25: [],
    age26To29: [],
    age30Plus: [],
  };
  const matureHighRoomPlayerIds: string[] = [];
  const clubsWithProspects = new Set<ClubId>();
  const firstClubId = league.clubIds[0];
  const firstClub = firstClubId === undefined ? undefined : league.clubsById[firstClubId];

  for (const playerId of league.playerIds) {
    const player = league.players[playerId];
    const archetypeKey = league.playerArchetypes[playerId];

    if (player === undefined || archetypeKey === undefined) {
      continue;
    }

    if (player.primaryRole === undefined) {
      throw new Error(`Generated player is missing canonical role identity: ${player.id}`);
    }

    const abilitySummary = summarizePlayerDevelopmentAbilities(player);
    const currentAbility = abilitySummary.currentAbility;
    const age = Math.floor((league.seasonStartDate - player.birthDate) / 365);
    potentialRoomsByAge[playerGenerationAgeBand(age)].push(abilitySummary.potentialRoom);
    if (age >= 26 && abilitySummary.potentialRoom > 2.5) {
      matureHighRoomPlayerIds.push(String(playerId));
    }

    if (currentAbility <= 8) {
      currentAbilityDistribution.low += 1;
    } else if (currentAbility <= 11) {
      currentAbilityDistribution.categoryDepth += 1;
    } else if (currentAbility < 15) {
      currentAbilityDistribution.categoryStrong += 1;
    } else {
      currentAbilityDistribution.highCurrent += 1;
    }

    const archetype = getGeneratedPlayerArchetype(archetypeKey);
    potentialDistribution[archetype.potentialClass] += 1;

    const assignment = league.playerRarityAssignments[playerId];
    if (assignment?.rarityKind === "white_fly") {
      rarityUsage.whiteFly += 1;
    } else if (assignment?.rarityKind === "serious_prospect") {
      rarityUsage.seriousProspect += 1;
    }

    addRoleCoherenceWarnings(roleCoherenceWarnings, player);
  }

  for (const clubId of league.clubIds) {
    const club = league.clubsById[clubId];

    if (club === undefined) {
      continue;
    }

    for (const playerId of club.playerIds) {
      const archetypeKey = league.playerArchetypes[playerId];

      if (archetypeKey !== undefined && getGeneratedPlayerArchetype(archetypeKey).depthRole === "prospect") {
        clubsWithProspects.add(clubId);
        break;
      }
    }
  }

  return {
    division: firstClub?.category ?? "third_division",
    clubCount: league.clubIds.length,
    playerCount: league.playerIds.length,
    currentAbilityDistribution,
    potentialDistribution,
    potentialRoomByAge: mapPotentialRoomByAge(potentialRoomsByAge),
    matureHighRoomWarnings: {
      count: matureHighRoomPlayerIds.length,
      ...(matureHighRoomPlayerIds[0] === undefined ? {} : { examplePlayerId: matureHighRoomPlayerIds[0] }),
    },
    rarityUsage,
    clubsWithProspects: clubsWithProspects.size,
    roleCoherenceWarnings: {
      ...roleCoherenceWarnings,
      total:
        roleCoherenceWarnings.defenderFinishing +
        roleCoherenceWarnings.strikerTackling +
        roleCoherenceWarnings.outfieldGoalkeeping,
    },
    youthAcademy: buildYouthAcademyQualityReport(league, seed),
  };
}

/** Builds the youth-academy part of the generation report from the same world seed. */
function buildYouthAcademyQualityReport(
  league: FakeLeagueSystem,
  seed: string,
): PlayerGenerationQualityReport["youthAcademy"] {
  const generated = generateInitialYouthAcademies({
    worldSeed: seed,
    seasonId: league.seasonId,
    referenceDate: league.seasonStartDate,
    clubIds: league.clubIds,
    clubContexts: youthReportClubContexts(league),
  });
  const rosterSizes = league.clubIds.map((clubId) => generated.youthAcademyState.clubRosters[clubId]?.playerIds.length ?? 0);
  const departments = {
    goalkeepers: 0,
    defenders: 0,
    midfielders: 0,
    attackers: 0,
  };
  const ages = {
    fifteen: 0,
    sixteen: 0,
    seventeen: 0,
    eighteen: 0,
    nineteen: 0,
    overNineteen: 0,
  };
  const roleCoherenceWarnings = {
    defenderFinishing: 0,
    strikerTackling: 0,
    outfieldGoalkeeping: 0,
    total: 0,
  };

  for (const playerId of generated.playerIds) {
    const player = generated.players[playerId];
    if (player === undefined) {
      continue;
    }

    switch (positionDepartment(player.naturalPositions[0])) {
      case "goalkeeper":
        departments.goalkeepers += 1;
        break;
      case "defender":
        departments.defenders += 1;
        break;
      case "midfielder":
        departments.midfielders += 1;
        break;
      case "attacker":
        departments.attackers += 1;
        break;
    }

    const age = Math.floor((league.seasonStartDate - player.birthDate) / 365);
    if (age <= 15) ages.fifteen += 1;
    else if (age === 16) ages.sixteen += 1;
    else if (age === 17) ages.seventeen += 1;
    else if (age === 18) ages.eighteen += 1;
    else if (age === 19) ages.nineteen += 1;
    else ages.overNineteen += 1;

    addRoleCoherenceWarnings(roleCoherenceWarnings, player);
  }

  return {
    playerCount: generated.playerIds.length,
    clubsAtExactTarget: rosterSizes.filter((size) => size === 11).length,
    minRosterSize: Math.min(...rosterSizes),
    maxRosterSize: Math.max(...rosterSizes),
    departments,
    ages,
    roleCoherenceWarnings: {
      ...roleCoherenceWarnings,
      total:
        roleCoherenceWarnings.defenderFinishing +
        roleCoherenceWarnings.strikerTackling +
        roleCoherenceWarnings.outfieldGoalkeeping,
    },
  };
}

function youthReportClubContexts(
  league: FakeLeagueSystem,
): Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"] {
  type YouthClubContexts = Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"];
  const contexts: Partial<Record<ClubId, YouthClubContexts[ClubId]>> = {};

  for (let index = 0; index < league.clubIds.length; index += 1) {
    const clubId = league.clubIds[index];
    if (clubId === undefined) {
      continue;
    }
    const club = league.clubsById[clubId];
    if (club === undefined) {
      continue;
    }

    contexts[clubId] = {
      category: club.category,
      reputation: club.reputation,
      competitiveTier: openingCompetitiveTierForClubRank(index + 1),
    };
  }

  return contexts as Parameters<typeof generateInitialYouthAcademies>[0]["clubContexts"];
}

function addRoleCoherenceWarnings(
  warnings: { defenderFinishing: number; strikerTackling: number; outfieldGoalkeeping: number },
  player: FakeLeagueSystem["players"][PlayerId],
): void {
  const position = player.naturalPositions[0];
  if (position !== undefined && isDefensivePosition(position) && Number(player.abilities.technical.finishing) > 11) {
    warnings.defenderFinishing += 1;
  }

  if (position === "st" && Number(player.abilities.technical.tackling) > 10) {
    warnings.strikerTackling += 1;
  }

  if (position !== "gk" && Number(player.abilities.goalkeeping.reflexes) > 4) {
    warnings.outfieldGoalkeeping += 1;
  }
}

function positionDepartment(position: string | undefined): "goalkeeper" | "defender" | "midfielder" | "attacker" {
  if (position === "gk") return "goalkeeper";
  if (isDefensivePosition(position ?? "")) return "defender";
  if (position === "dm" || position === "cm" || position === "am") return "midfielder";
  return "attacker";
}

function playerGenerationAgeBand(age: number): keyof PlayerGenerationQualityReport["potentialRoomByAge"] {
  if (age < 18) return "under18";
  if (age <= 21) return "age18To21";
  if (age <= 25) return "age22To25";
  if (age <= 29) return "age26To29";
  return "age30Plus";
}

function mapPotentialRoomByAge(
  valuesByBand: Record<keyof PlayerGenerationQualityReport["potentialRoomByAge"], number[]>,
): PlayerGenerationQualityReport["potentialRoomByAge"] {
  return {
    under18: summarizeNumbers(valuesByBand.under18),
    age18To21: summarizeNumbers(valuesByBand.age18To21),
    age22To25: summarizeNumbers(valuesByBand.age22To25),
    age26To29: summarizeNumbers(valuesByBand.age26To29),
    age30Plus: summarizeNumbers(valuesByBand.age30Plus),
  };
}

function summarizeNumbers(values: readonly number[]): { readonly players: number; readonly average: number; readonly max: number } {
  if (values.length === 0) {
    return { players: 0, average: 0, max: 0 };
  }

  return {
    players: values.length,
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
    max: Math.max(...values),
  };
}

function formatReportNumber(value: number): string {
  return value.toFixed(2);
}

/**
 * Returns whether a position is part of the defensive line.
 */
function isDefensivePosition(position: string): boolean {
  return position === "rb" || position === "cb" || position === "lb" || position === "rwb" || position === "lwb";
}

/**
 * Localizes a supported nationality code for CLI presentation.
 */
function formatIdentityNationality(nationality: string, text: Translator): string {
  return text(presentationMessageKey("identity.nationality", nationality));
}

/**
 * Localizes a supported name-culture code for CLI presentation.
 */
function formatIdentityNameCulture(nameCulture: string, text: Translator): string {
  return text(presentationMessageKey("identity.nameCulture", nameCulture));
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
function playerLabel(playerId: PlayerId, league: FakeLeagueSystem): string {
  const player = league.players[playerId];

  if (player === undefined) {
    return String(playerId);
  }

  return `${player.firstName} ${player.lastName}`;
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
