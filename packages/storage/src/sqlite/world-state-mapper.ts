import {
  abilityValue,
  clubId,
  competitionId,
  createCompetitionMatchRules,
  createCareerState,
  fixtureId,
  gameDate,
  PLAYER_ABILITY_KEYS,
  playerId,
  readPlayerAbility,
  nonNegativeMoney,
  saveId,
  seasonId,
  stateValue,
  type CareerState,
  type CreateCareerStateInput,
  type Competition,
  type CompetitionSeasonHistoryEntry,
  type CurrencyCode,
  type DomesticCompetitionWorld,
  type Fixture,
  type Player,
  type PlayerAbilities,
  type PlayerAbilityKey,
  type PlayerDynamicState,
  type PlayerRole,
  type PlayerRoleFamiliarityLevel,
  type SaveId,
} from "@game/domain";

import type { SaveCareerInput } from "../career-storage.interface.ts";
import {
  DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS,
  isCareerAutosaveIntervalDays,
  type CareerAutosaveIntervalDays,
  type CareerSaveMetadata,
} from "../save-metadata.ts";
import { insertCareerStateRows, loadCareerStateRows } from "./career-state-mapper.ts";

/** Scalar values supported by SQLite prepared statements in the web worker. */
export type SqliteBindValue = string | number | null;

/** Minimal synchronous database seam used by the worker-owned world mapper. */
export interface SqliteWorldDatabase {
  run(sql: string, bind?: readonly SqliteBindValue[]): void;
  queryAll(sql: string, bind?: readonly SqliteBindValue[]): readonly Record<string, unknown>[];
  transaction<T>(operation: () => T): T;
}

/** Stable mapper error surfaced through the worker protocol. */
export class SqliteWorldStateError extends Error {
  public readonly code: "save_not_found" | "unsupported_bootstrap_state" | "sqlite_unavailable";

  public constructor(
    code: "save_not_found" | "unsupported_bootstrap_state" | "sqlite_unavailable",
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = "SqliteWorldStateError";
  }
}

type AbilityScope = "current" | "potential";
type AbilityGroup = keyof PlayerAbilities;
type RoleKind = "natural" | "adapted" | "weak";

interface WorldRows {
  readonly save: Record<string, unknown>;
  readonly meta: Record<string, unknown>;
  readonly calendar: Record<string, unknown>;
  readonly clubs: readonly Record<string, unknown>[];
  readonly clubOrder: readonly Record<string, unknown>[];
  readonly clubPlayers: readonly Record<string, unknown>[];
  readonly players: readonly Record<string, unknown>[];
  readonly playerOrder: readonly Record<string, unknown>[];
  readonly positions: readonly Record<string, unknown>[];
  readonly roles: readonly Record<string, unknown>[];
  readonly familiarity: readonly Record<string, unknown>[];
  readonly abilities: readonly Record<string, unknown>[];
  readonly playerStates: readonly Record<string, unknown>[];
  readonly fixtures: readonly Record<string, unknown>[];
  readonly fixtureOrder: readonly Record<string, unknown>[];
  readonly fixtureResults: readonly Record<string, unknown>[];
  readonly competitions: readonly Record<string, unknown>[];
  readonly competitionClubs: readonly Record<string, unknown>[];
  readonly competitionPrizes: readonly Record<string, unknown>[];
  readonly competitionHistory: readonly Record<string, unknown>[];
  readonly competitionHistoryRows: readonly Record<string, unknown>[];
}

/**
 * Atomically replaces one save's ordered world state.
 *
 * Career systems beyond the game world intentionally remain unsupported until
 * the next migration step; accepting them here would silently lose data.
 */
export function saveCareerWorld(
  database: SqliteWorldDatabase,
  input: SaveCareerInput,
  nowISO: string,
): CareerSaveMetadata {
  const previous = database.queryAll(
    "SELECT created_at_iso, autosave_interval_days FROM career_saves WHERE save_id = ?",
    [input.saveId],
  )[0];
  const previousPolicy = previous === undefined
    ? DEFAULT_CAREER_AUTOSAVE_INTERVAL_DAYS
    : requiredAutosavePolicy(previous, "autosave_interval_days");
  const metadata: CareerSaveMetadata = {
    saveId: input.saveId,
    name: input.name,
    createdAtISO: optionalText(previous, "created_at_iso") ?? nowISO,
    updatedAtISO: nowISO,
    saveSchemaVersion: input.state.gameState.meta.saveSchemaVersion,
    autosaveIntervalDays: previousPolicy,
  };
  const rows = mapCareerWorldRows(input, metadata);

  database.transaction(() => {
    database.run("DELETE FROM career_saves WHERE save_id = ?", [input.saveId]);
    insertMappedRows(database, rows);
    insertCareerStateRows(database, input.state);
  });

  return metadata;
}

/** Updates only per-career cadence metadata and returns the unchanged save row. */
export function updateCareerAutosavePolicy(
  database: SqliteWorldDatabase,
  saveId: SaveId,
  autosaveIntervalDays: CareerAutosaveIntervalDays,
): CareerSaveMetadata {
  const row = database.queryAll(
    `SELECT save_id, name, created_at_iso, updated_at_iso, save_schema_version
     FROM career_saves WHERE save_id = ?`,
    [saveId],
  )[0];
  if (row === undefined) {
    throw new SqliteWorldStateError("save_not_found", `career save not found: ${saveId}`);
  }

  database.run(
    "UPDATE career_saves SET autosave_interval_days = ? WHERE save_id = ?",
    [autosaveIntervalDays, saveId],
  );

  return {
    saveId,
    name: requiredText(row, "name"),
    createdAtISO: requiredText(row, "created_at_iso"),
    updatedAtISO: requiredText(row, "updated_at_iso"),
    saveSchemaVersion: requiredNumber(row, "save_schema_version"),
    autosaveIntervalDays,
  };
}

/** Loads and validates one world-only career snapshot. */
export function loadCareerWorld(database: SqliteWorldDatabase, requestedSaveId: SaveId): CareerState {
  const saveRows = database.queryAll(
    `SELECT save_id, save_schema_version, career_schema_version, selected_club_id
     FROM career_saves WHERE save_id = ?`,
    [requestedSaveId],
  );
  if (saveRows.length === 0) {
    throw new SqliteWorldStateError("save_not_found", `career save not found: ${requestedSaveId}`);
  }

  const world = reconstructCareerWorldRows({
    save: saveRows[0]!,
    meta: requiredOnlyRow(database, `SELECT seed, rng_algorithm_version, save_schema_version,
      topology_decision_id, player_rating_scale_version, player_market_calibration_version,
      valuation_curves_version, asking_price_curves_version, market_behavior_calibration_version,
      wage_finance_calibration_version, player_development_environment_version
      FROM game_meta WHERE save_id = ?`, requestedSaveId),
    calendar: requiredOnlyRow(database, 'SELECT "current_date", current_season_id FROM game_calendar WHERE save_id = ?', requestedSaveId),
    clubs: database.queryAll("SELECT club_id, name, short_name, category, reputation FROM clubs WHERE save_id = ?", [requestedSaveId]),
    clubOrder: database.queryAll("SELECT sort_order, club_id FROM club_order WHERE save_id = ? ORDER BY sort_order", [requestedSaveId]),
    clubPlayers: database.queryAll("SELECT club_id, sort_order, player_id FROM club_player_order WHERE save_id = ? ORDER BY club_id, sort_order", [requestedSaveId]),
    players: database.queryAll(`SELECT player_id, first_name, last_name, birth_date, primary_role, archetype,
      has_natural_roles, has_adapted_roles, has_weak_roles, has_role_familiarity
      FROM players WHERE save_id = ?`, [requestedSaveId]),
    playerOrder: database.queryAll("SELECT sort_order, player_id FROM player_order WHERE save_id = ? ORDER BY sort_order", [requestedSaveId]),
    positions: database.queryAll("SELECT player_id, sort_order, position_code FROM player_positions WHERE save_id = ? ORDER BY player_id, sort_order", [requestedSaveId]),
    roles: database.queryAll("SELECT player_id, role_kind, sort_order, role_code FROM player_roles WHERE save_id = ? ORDER BY player_id, role_kind, sort_order", [requestedSaveId]),
    familiarity: database.queryAll("SELECT player_id, role_code, familiarity_level FROM player_role_familiarity WHERE save_id = ? ORDER BY player_id, role_code", [requestedSaveId]),
    abilities: database.queryAll(`SELECT player_id, ability_scope, ability_group, ability_key, ability_value
      FROM player_abilities WHERE save_id = ? ORDER BY player_id, ability_scope, ability_group, ability_key`, [requestedSaveId]),
    playerStates: database.queryAll("SELECT player_id, fitness, form, morale FROM player_states WHERE save_id = ?", [requestedSaveId]),
    fixtures: database.queryAll(`SELECT fixture_id, competition_id, season_id, round_number, fixture_date,
      home_club_id, away_club_id FROM fixtures WHERE save_id = ?`, [requestedSaveId]),
    fixtureOrder: database.queryAll("SELECT sort_order, fixture_id FROM fixture_order WHERE save_id = ? ORDER BY sort_order", [requestedSaveId]),
    fixtureResults: database.queryAll("SELECT fixture_id, home_goals, away_goals FROM fixture_results WHERE save_id = ?", [requestedSaveId]),
    competitions: database.queryAll(
      "SELECT * FROM domestic_competitions WHERE save_id = ? ORDER BY sort_order",
      [requestedSaveId],
    ),
    competitionClubs: database.queryAll(
      "SELECT * FROM domestic_competition_clubs WHERE save_id = ? ORDER BY competition_id, sort_order",
      [requestedSaveId],
    ),
    competitionPrizes: database.queryAll(
      "SELECT * FROM domestic_competition_prizes WHERE save_id = ? ORDER BY competition_id, position",
      [requestedSaveId],
    ),
    competitionHistory: database.queryAll(
      "SELECT * FROM domestic_competition_history WHERE save_id = ? ORDER BY sort_order",
      [requestedSaveId],
    ),
    competitionHistoryRows: database.queryAll(
      "SELECT * FROM domestic_competition_history_rows WHERE save_id = ? ORDER BY history_sequence_number, sort_order",
      [requestedSaveId],
    ),
  });
  return loadCareerStateRows(database, requestedSaveId, world);
}

/** Maps a validated world into explicit relational rows for deterministic tests. */
export function mapCareerWorldRows(input: SaveCareerInput, metadata: CareerSaveMetadata): WorldRows {
  const state = createCareerState(input.state);
  assertOrderedLookup(state.gameState.playerIds, state.gameState.players, "player");
  assertOrderedLookup(state.gameState.clubIds, state.gameState.clubs, "club");
  assertOrderedLookup(state.gameState.fixtureIds, state.gameState.fixtures, "fixture");

  const players: Record<string, SqliteBindValue>[] = [];
  const playerOrder: Record<string, SqliteBindValue>[] = [];
  const positions: Record<string, SqliteBindValue>[] = [];
  const roles: Record<string, SqliteBindValue>[] = [];
  const familiarity: Record<string, SqliteBindValue>[] = [];
  const abilities: Record<string, SqliteBindValue>[] = [];
  const playerStates: Record<string, SqliteBindValue>[] = [];

  state.gameState.playerIds.forEach((orderedPlayerId, sortOrder) => {
    const player = requiredLookup(state.gameState.players, orderedPlayerId, "player");
    players.push({
      player_id: player.id,
      first_name: player.firstName,
      last_name: player.lastName,
      birth_date: player.birthDate,
      primary_role: player.primaryRole ?? null,
      archetype: player.archetype ?? null,
      has_natural_roles: present(player.naturalRoles),
      has_adapted_roles: present(player.adaptedRoles),
      has_weak_roles: present(player.weakRoles),
      has_role_familiarity: present(player.roleFamiliarity),
    });
    playerOrder.push({ sort_order: sortOrder, player_id: player.id });
    player.naturalPositions.forEach((positionCode, positionOrder) => {
      positions.push({ player_id: player.id, sort_order: positionOrder, position_code: positionCode });
    });
    appendRoleRows(roles, player.id, "natural", player.naturalRoles);
    appendRoleRows(roles, player.id, "adapted", player.adaptedRoles);
    appendRoleRows(roles, player.id, "weak", player.weakRoles);
    for (const [roleCode, level] of Object.entries(player.roleFamiliarity ?? {}).sort(([left], [right]) => left.localeCompare(right))) {
      if (level !== undefined) familiarity.push({ player_id: player.id, role_code: roleCode, familiarity_level: level });
    }
    appendAbilityRows(abilities, player, "current", player.abilities);
    appendAbilityRows(abilities, player, "potential", player.potential);
    const dynamicState = state.gameState.playerStates[player.id];
    if (dynamicState !== undefined) {
      playerStates.push({ player_id: player.id, fitness: dynamicState.fitness, form: dynamicState.form, morale: dynamicState.morale });
    }
  });

  const clubs: Record<string, SqliteBindValue>[] = [];
  const clubOrder: Record<string, SqliteBindValue>[] = [];
  const clubPlayers: Record<string, SqliteBindValue>[] = [];
  state.gameState.clubIds.forEach((orderedClubId, sortOrder) => {
    const club = requiredLookup(state.gameState.clubs, orderedClubId, "club");
    clubs.push({ club_id: club.id, name: club.name, short_name: club.shortName, category: club.category, reputation: club.reputation });
    clubOrder.push({ sort_order: sortOrder, club_id: club.id });
    club.playerIds.forEach((rosterPlayerId, rosterOrder) => {
      if (state.gameState.players[rosterPlayerId] === undefined) {
        throw new SqliteWorldStateError("unsupported_bootstrap_state", `club ${club.id} owns missing player ${rosterPlayerId}`);
      }
      clubPlayers.push({ club_id: club.id, sort_order: rosterOrder, player_id: rosterPlayerId });
    });
  });

  const fixtures: Record<string, SqliteBindValue>[] = [];
  const fixtureOrder: Record<string, SqliteBindValue>[] = [];
  const fixtureResults: Record<string, SqliteBindValue>[] = [];
  state.gameState.fixtureIds.forEach((orderedFixtureId, sortOrder) => {
    const fixture = requiredLookup(state.gameState.fixtures, orderedFixtureId, "fixture");
    fixtures.push({
      fixture_id: fixture.id,
      competition_id: fixture.competitionId,
      season_id: fixture.seasonId,
      round_number: fixture.roundNumber,
      fixture_date: fixture.date,
      home_club_id: fixture.homeClubId,
      away_club_id: fixture.awayClubId,
    });
    fixtureOrder.push({ sort_order: sortOrder, fixture_id: fixture.id });
    if (fixture.result !== undefined) {
      fixtureResults.push({ fixture_id: fixture.id, home_goals: fixture.result.homeGoals, away_goals: fixture.result.awayGoals });
    }
  });

  const competitions: Record<string, SqliteBindValue>[] = [];
  const competitionClubs: Record<string, SqliteBindValue>[] = [];
  const competitionPrizes: Record<string, SqliteBindValue>[] = [];
  const competitionHistory: Record<string, SqliteBindValue>[] = [];
  const competitionHistoryRows: Record<string, SqliteBindValue>[] = [];
  const domesticWorld = state.gameState.domesticCompetitionWorld;
  domesticWorld?.competitionIds.forEach((orderedCompetitionId, sortOrder) => {
    const competition = domesticWorld.competitions[orderedCompetitionId];
    if (competition === undefined) {
      throw new SqliteWorldStateError(
        "unsupported_bootstrap_state",
        `ordered domestic competition is missing: ${orderedCompetitionId}`,
      );
    }
    competitions.push({
      sort_order: sortOrder,
      competition_id: competition.id,
      name: competition.name,
      maximum_substitutions: competition.matchRules.maximumSubstitutions,
      substitution_window_limit: competition.matchRules.substitutionWindowLimit,
      allows_player_reentry: competition.matchRules.allowsPlayerReentry ? 1 : 0,
      yellow_card_accumulation_threshold: competition.matchRules.yellowCardAccumulationThreshold,
      straight_red_suspension_matches: competition.matchRules.straightRedSuspensionMatches,
      second_yellow_suspension_matches: competition.matchRules.secondYellowSuspensionMatches,
      yellow_accumulation_suspension_matches: competition.matchRules.yellowAccumulationSuspensionMatches,
      distribution_currency: competition.seasonDistribution?.currency ?? null,
    });
    competition.clubIds.forEach((memberClubId, memberOrder) => {
      competitionClubs.push({
        competition_id: competition.id,
        sort_order: memberOrder,
        club_id: memberClubId,
      });
    });
    competition.seasonDistribution?.prizes.forEach((prize) => {
      competitionPrizes.push({
        competition_id: competition.id,
        position: prize.position,
        amount: prize.amount,
      });
    });
  });
  domesticWorld?.seasonHistory.forEach((entry, sortOrder) => {
    competitionHistory.push({
      sort_order: sortOrder,
      sequence_number: entry.sequenceNumber,
      season_id: entry.seasonId,
      competition_id: entry.competitionId,
    });
    entry.finalTable.forEach((row, rowOrder) => {
      competitionHistoryRows.push({
        history_sequence_number: entry.sequenceNumber,
        sort_order: rowOrder,
        position: row.position,
        club_id: row.clubId,
        played: row.played,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        goals_for: row.goalsFor,
        goals_against: row.goalsAgainst,
        goal_difference: row.goalDifference,
        points: row.points,
      });
    });
  });
  const calibrationVersions = state.gameState.meta.calibrationVersions;

  return {
    save: {
      save_id: input.saveId,
      name: input.name,
      created_at_iso: metadata.createdAtISO,
      updated_at_iso: metadata.updatedAtISO,
      save_schema_version: metadata.saveSchemaVersion,
      autosave_interval_days: metadata.autosaveIntervalDays,
      career_schema_version: state.schemaVersion,
      selected_club_id: state.selectedClubId,
    },
    meta: {
      seed: state.gameState.meta.seed,
      rng_algorithm_version: state.gameState.meta.rngAlgorithmVersion,
      save_schema_version: state.gameState.meta.saveSchemaVersion,
      topology_decision_id: calibrationVersions?.topologyDecisionId ?? null,
      player_rating_scale_version: calibrationVersions?.playerRatingScaleVersion ?? null,
      player_market_calibration_version: calibrationVersions?.playerMarketCalibrationVersion ?? null,
      valuation_curves_version: calibrationVersions?.valuationCurvesVersion ?? null,
      asking_price_curves_version: calibrationVersions?.askingPriceCurvesVersion ?? null,
      market_behavior_calibration_version: calibrationVersions?.marketBehaviorCalibrationVersion ?? null,
      wage_finance_calibration_version: calibrationVersions?.wageFinanceCalibrationVersion ?? null,
      player_development_environment_version:
        calibrationVersions?.playerDevelopmentEnvironmentVersion ?? null,
    },
    calendar: { current_date: state.gameState.calendar.currentDate, current_season_id: state.gameState.calendar.currentSeasonId },
    clubs,
    clubOrder,
    clubPlayers,
    players,
    playerOrder,
    positions,
    roles,
    familiarity,
    abilities,
    playerStates,
    fixtures,
    fixtureOrder,
    fixtureResults,
    competitions,
    competitionClubs,
    competitionPrizes,
    competitionHistory,
    competitionHistoryRows,
  };
}

/** Reconstructs the domain world from explicit ordered relational rows. */
export function reconstructCareerWorldRows(rows: WorldRows): CreateCareerStateInput {
  const orderedPlayerIds = rows.playerOrder.map((row) => playerId(requiredText(row, "player_id")));
  const playerRows = keyedRows(rows.players, "player_id");
  const positions = groupedRows(rows.positions, "player_id");
  const roleRows = groupedRows(rows.roles, "player_id");
  const familiarityRows = groupedRows(rows.familiarity, "player_id");
  const abilityRows = groupedRows(rows.abilities, "player_id");
  const stateRows = keyedRows(rows.playerStates, "player_id");
  const players: Record<string, Player> = {};
  const playerStates: Record<string, PlayerDynamicState> = {};

  for (const orderedPlayerId of orderedPlayerIds) {
    const row = requiredMappedRow(playerRows, orderedPlayerId, "player");
    const rolesForPlayer = roleRows.get(orderedPlayerId) ?? [];
    const familiarityForPlayer = familiarityRows.get(orderedPlayerId) ?? [];
    const primaryRole = nullableText(row, "primary_role") as Player["primaryRole"];
    const archetype = nullableText(row, "archetype") as Player["archetype"];
    players[orderedPlayerId] = {
      id: orderedPlayerId,
      firstName: requiredText(row, "first_name"),
      lastName: requiredText(row, "last_name"),
      birthDate: gameDate(requiredNumber(row, "birth_date")),
      naturalPositions: (positions.get(orderedPlayerId) ?? []).map((positionRow) => requiredText(positionRow, "position_code")) as Player["naturalPositions"],
      ...(primaryRole === undefined ? {} : { primaryRole }),
      ...(archetype === undefined ? {} : { archetype }),
      ...(requiredBoolean(row, "has_natural_roles") ? { naturalRoles: readRoles(rolesForPlayer, "natural") } : {}),
      ...(requiredBoolean(row, "has_adapted_roles") ? { adaptedRoles: readRoles(rolesForPlayer, "adapted") } : {}),
      ...(requiredBoolean(row, "has_weak_roles") ? { weakRoles: readRoles(rolesForPlayer, "weak") } : {}),
      ...(requiredBoolean(row, "has_role_familiarity") ? { roleFamiliarity: readFamiliarity(familiarityForPlayer) } : {}),
      abilities: readAbilitySet(abilityRows.get(orderedPlayerId) ?? [], "current"),
      potential: readAbilitySet(abilityRows.get(orderedPlayerId) ?? [], "potential"),
    };
    const stateRow = stateRows.get(orderedPlayerId);
    if (stateRow !== undefined) {
      playerStates[orderedPlayerId] = {
        fitness: stateValue(requiredNumber(stateRow, "fitness")),
        form: stateValue(requiredNumber(stateRow, "form")),
        morale: stateValue(requiredNumber(stateRow, "morale")),
      };
    }
  }

  const orderedClubIds = rows.clubOrder.map((row) => clubId(requiredText(row, "club_id")));
  const clubRows = keyedRows(rows.clubs, "club_id");
  const clubPlayers = groupedRows(rows.clubPlayers, "club_id");
  const clubs: CareerState["gameState"]["clubs"] extends Readonly<Record<infer _Key, infer Value>> ? Record<string, Value> : never = {};
  for (const orderedClubId of orderedClubIds) {
    const row = requiredMappedRow(clubRows, orderedClubId, "club");
    clubs[orderedClubId] = {
      id: orderedClubId,
      name: requiredText(row, "name"),
      shortName: requiredText(row, "short_name"),
      category: requiredText(row, "category") as CareerState["gameState"]["clubs"][typeof orderedClubId]["category"],
      reputation: requiredNumber(row, "reputation"),
      playerIds: (clubPlayers.get(orderedClubId) ?? []).map((clubPlayerRow) => playerId(requiredText(clubPlayerRow, "player_id"))),
    };
  }

  const orderedFixtureIds = rows.fixtureOrder.map((row) => fixtureId(requiredText(row, "fixture_id")));
  const fixtureRows = keyedRows(rows.fixtures, "fixture_id");
  const resultRows = keyedRows(rows.fixtureResults, "fixture_id");
  const fixtures: Record<string, Fixture> = {};
  for (const orderedFixtureId of orderedFixtureIds) {
    const row = requiredMappedRow(fixtureRows, orderedFixtureId, "fixture");
    const result = resultRows.get(orderedFixtureId);
    fixtures[orderedFixtureId] = {
      id: orderedFixtureId,
      competitionId: competitionId(requiredText(row, "competition_id")),
      seasonId: seasonId(requiredText(row, "season_id")),
      roundNumber: requiredNumber(row, "round_number"),
      date: gameDate(requiredNumber(row, "fixture_date")),
      homeClubId: clubId(requiredText(row, "home_club_id")),
      awayClubId: clubId(requiredText(row, "away_club_id")),
      ...(result === undefined ? {} : {
        result: { played: true, homeGoals: requiredNumber(result, "home_goals"), awayGoals: requiredNumber(result, "away_goals") },
      }),
    };
  }

  const competitionClubs = groupedRows(rows.competitionClubs, "competition_id");
  const competitionPrizes = groupedRows(rows.competitionPrizes, "competition_id");
  const competitionIds = rows.competitions.map((row) =>
    competitionId(requiredText(row, "competition_id"))
  );
  const competitions: Record<string, Competition> = {};
  for (const row of rows.competitions) {
    const id = competitionId(requiredText(row, "competition_id"));
    const currency = nullableText(row, "distribution_currency") as CurrencyCode | undefined;
    const prizes = competitionPrizes.get(id) ?? [];
    competitions[id] = {
      id,
      name: requiredText(row, "name"),
      clubIds: (competitionClubs.get(id) ?? []).map((memberRow) =>
        clubId(requiredText(memberRow, "club_id"))
      ),
      matchRules: createCompetitionMatchRules({
        maximumSubstitutions: requiredNumber(row, "maximum_substitutions"),
        substitutionWindowLimit: nullableNumber(row, "substitution_window_limit"),
        allowsPlayerReentry: requiredBoolean(row, "allows_player_reentry"),
        yellowCardAccumulationThreshold: requiredNumber(row, "yellow_card_accumulation_threshold"),
        straightRedSuspensionMatches: requiredNumber(row, "straight_red_suspension_matches"),
        secondYellowSuspensionMatches: requiredNumber(row, "second_yellow_suspension_matches"),
        yellowAccumulationSuspensionMatches: requiredNumber(row, "yellow_accumulation_suspension_matches"),
      }),
      ...(currency === undefined
        ? {}
        : {
            seasonDistribution: {
              currency,
              prizes: prizes.map((prize) => ({
                position: requiredNumber(prize, "position"),
                amount: nonNegativeMoney(requiredNumber(prize, "amount")),
              })),
            },
          }),
    };
  }
  const historyRows = groupedRowsByNumber(rows.competitionHistoryRows, "history_sequence_number");
  const seasonHistory: CompetitionSeasonHistoryEntry[] = rows.competitionHistory.map((row) => {
    const sequenceNumber = requiredNumber(row, "sequence_number");
    return {
      sequenceNumber,
      seasonId: seasonId(requiredText(row, "season_id")),
      competitionId: competitionId(requiredText(row, "competition_id")),
      finalTable: (historyRows.get(sequenceNumber) ?? []).map(
        (tableRow) => ({
          position: requiredNumber(tableRow, "position"),
          clubId: clubId(requiredText(tableRow, "club_id")),
          played: requiredNumber(tableRow, "played"),
          wins: requiredNumber(tableRow, "wins"),
          draws: requiredNumber(tableRow, "draws"),
          losses: requiredNumber(tableRow, "losses"),
          goalsFor: requiredNumber(tableRow, "goals_for"),
          goalsAgainst: requiredNumber(tableRow, "goals_against"),
          goalDifference: requiredNumber(tableRow, "goal_difference"),
          points: requiredNumber(tableRow, "points"),
        }),
      ),
    };
  });
  const domesticCompetitionWorld: DomesticCompetitionWorld | undefined = competitionIds.length === 0
    ? undefined
    : {
        competitionIds,
        competitions: competitions as Readonly<Record<ReturnType<typeof competitionId>, Competition>>,
        seasonHistory,
      };
  const topologyDecisionId = nullableText(rows.meta, "topology_decision_id");
  const calibrationVersions = topologyDecisionId === undefined
    ? undefined
    : {
        topologyDecisionId,
        playerRatingScaleVersion: requiredText(rows.meta, "player_rating_scale_version"),
        playerMarketCalibrationVersion: requiredText(rows.meta, "player_market_calibration_version"),
        valuationCurvesVersion: requiredText(rows.meta, "valuation_curves_version"),
        askingPriceCurvesVersion: requiredText(rows.meta, "asking_price_curves_version"),
        marketBehaviorCalibrationVersion: requiredText(rows.meta, "market_behavior_calibration_version"),
        wageFinanceCalibrationVersion: requiredText(rows.meta, "wage_finance_calibration_version"),
        playerDevelopmentEnvironmentVersion: requiredText(
          rows.meta,
          "player_development_environment_version",
        ),
      };

  // Career systems are attached by `loadCareerStateRows` before the complete
  // Phase 78 state is validated. Validating this world-only projection here
  // would incorrectly accept a save without contracts or finances.
  return {
    saveId: saveId(requiredText(rows.save, "save_id")),
    schemaVersion: requiredNumber(rows.save, "career_schema_version"),
    selectedClubId: clubId(requiredText(rows.save, "selected_club_id")),
    gameState: {
      meta: {
        seed: requiredText(rows.meta, "seed"),
        rngAlgorithmVersion: requiredText(rows.meta, "rng_algorithm_version"),
        saveSchemaVersion: requiredNumber(rows.meta, "save_schema_version"),
        ...(calibrationVersions === undefined ? {} : { calibrationVersions }),
      },
      calendar: {
        currentDate: gameDate(requiredNumber(rows.calendar, "current_date")),
        currentSeasonId: seasonId(requiredText(rows.calendar, "current_season_id")),
      },
      players: players as CareerState["gameState"]["players"],
      playerIds: orderedPlayerIds,
      playerStates: playerStates as CareerState["gameState"]["playerStates"],
      clubs,
      clubIds: orderedClubIds,
      fixtures: fixtures as CareerState["gameState"]["fixtures"],
      fixtureIds: orderedFixtureIds,
      ...(domesticCompetitionWorld === undefined ? {} : { domesticCompetitionWorld }),
    },
    transferHistory: [],
  };
}

function insertMappedRows(database: SqliteWorldDatabase, rows: WorldRows): void {
  insertRow(database, "career_saves", ["save_id", "name", "created_at_iso", "updated_at_iso", "save_schema_version", "career_schema_version", "selected_club_id", "autosave_interval_days"], rows.save);
  insertSaveRow(database, "game_meta", [
    "seed",
    "rng_algorithm_version",
    "save_schema_version",
    "topology_decision_id",
    "player_rating_scale_version",
    "player_market_calibration_version",
    "valuation_curves_version",
    "asking_price_curves_version",
    "market_behavior_calibration_version",
    "wage_finance_calibration_version",
    "player_development_environment_version",
  ], rows.save, rows.meta);
  insertSaveRow(database, "game_calendar", ["current_date", "current_season_id"], rows.save, rows.calendar);
  insertRows(database, "players", ["player_id", "first_name", "last_name", "birth_date", "primary_role", "archetype", "has_natural_roles", "has_adapted_roles", "has_weak_roles", "has_role_familiarity"], rows.save, rows.players);
  insertRows(database, "player_order", ["sort_order", "player_id"], rows.save, rows.playerOrder);
  insertRows(database, "player_positions", ["player_id", "sort_order", "position_code"], rows.save, rows.positions);
  insertRows(database, "player_roles", ["player_id", "role_kind", "sort_order", "role_code"], rows.save, rows.roles);
  insertRows(database, "player_role_familiarity", ["player_id", "role_code", "familiarity_level"], rows.save, rows.familiarity);
  insertRows(database, "player_abilities", ["player_id", "ability_scope", "ability_group", "ability_key", "ability_value"], rows.save, rows.abilities);
  insertRows(database, "player_states", ["player_id", "fitness", "form", "morale"], rows.save, rows.playerStates);
  insertRows(database, "clubs", ["club_id", "name", "short_name", "category", "reputation"], rows.save, rows.clubs);
  insertRows(database, "club_order", ["sort_order", "club_id"], rows.save, rows.clubOrder);
  insertRows(database, "club_player_order", ["club_id", "sort_order", "player_id"], rows.save, rows.clubPlayers);
  insertRows(database, "fixtures", ["fixture_id", "competition_id", "season_id", "round_number", "fixture_date", "home_club_id", "away_club_id"], rows.save, rows.fixtures);
  insertRows(database, "fixture_order", ["sort_order", "fixture_id"], rows.save, rows.fixtureOrder);
  insertRows(database, "fixture_results", ["fixture_id", "home_goals", "away_goals"], rows.save, rows.fixtureResults);
  insertRows(database, "domestic_competitions", [
    "sort_order",
    "competition_id",
    "name",
    "maximum_substitutions",
    "substitution_window_limit",
    "allows_player_reentry",
    "yellow_card_accumulation_threshold",
    "straight_red_suspension_matches",
    "second_yellow_suspension_matches",
    "yellow_accumulation_suspension_matches",
    "distribution_currency",
  ], rows.save, rows.competitions);
  insertRows(
    database,
    "domestic_competition_clubs",
    ["competition_id", "sort_order", "club_id"],
    rows.save,
    rows.competitionClubs,
  );
  insertRows(
    database,
    "domestic_competition_prizes",
    ["competition_id", "position", "amount"],
    rows.save,
    rows.competitionPrizes,
  );
  insertRows(
    database,
    "domestic_competition_history",
    ["sort_order", "sequence_number", "season_id", "competition_id"],
    rows.save,
    rows.competitionHistory,
  );
  insertRows(database, "domestic_competition_history_rows", [
    "history_sequence_number",
    "sort_order",
    "position",
    "club_id",
    "played",
    "wins",
    "draws",
    "losses",
    "goals_for",
    "goals_against",
    "goal_difference",
    "points",
  ], rows.save, rows.competitionHistoryRows);
}

function insertSaveRow(database: SqliteWorldDatabase, table: string, columns: readonly string[], save: Record<string, unknown>, row: Record<string, unknown>): void {
  insertRow(database, table, ["save_id", ...columns], { save_id: save.save_id ?? null, ...row });
}

function insertRows(database: SqliteWorldDatabase, table: string, columns: readonly string[], save: Record<string, unknown>, rows: readonly Record<string, unknown>[]): void {
  for (const row of rows) insertSaveRow(database, table, columns, save, row);
}

function insertRow(database: SqliteWorldDatabase, table: string, columns: readonly string[], row: Record<string, unknown>): void {
  const placeholders = columns.map(() => "?").join(", ");
  database.run(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`, columns.map((column) => bindValue(row[column])));
}

function bindValue(value: unknown): SqliteBindValue {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  throw new SqliteWorldStateError("sqlite_unavailable", `unsupported SQLite bind value: ${typeof value}`);
}

function appendRoleRows(rows: Record<string, SqliteBindValue>[], id: string, kind: RoleKind, values: readonly PlayerRole[] | undefined): void {
  values?.forEach((roleCode, sortOrder) => rows.push({ player_id: id, role_kind: kind, sort_order: sortOrder, role_code: roleCode }));
}

function appendAbilityRows(rows: Record<string, SqliteBindValue>[], player: Player, scope: AbilityScope, values: PlayerAbilities): void {
  for (const abilityKey of PLAYER_ABILITY_KEYS) {
    const [group, key] = splitAbilityKey(abilityKey);
    rows.push({
      player_id: player.id,
      ability_scope: scope,
      ability_group: group,
      ability_key: key,
      ability_value: readPlayerAbility(values, abilityKey),
    });
  }
}

function readAbilitySet(rows: readonly Record<string, unknown>[], scope: AbilityScope): PlayerAbilities {
  const result: Record<AbilityGroup, Record<string, ReturnType<typeof abilityValue>>> = {
    technical: {},
    physical: {},
    mental: {},
    goalkeeping: {},
  };
  for (const abilityKey of PLAYER_ABILITY_KEYS) {
    const [group, key] = splitAbilityKey(abilityKey);
    const row = rows.find((candidate) =>
      candidate.ability_scope === scope
      && candidate.ability_group === group
      && candidate.ability_key === key,
    );
    if (row === undefined) {
      throw new SqliteWorldStateError("sqlite_unavailable", `missing ${scope} ability ${abilityKey}`);
    }
    result[group][key] = abilityValue(requiredNumber(row, "ability_value"));
  }
  return result as unknown as PlayerAbilities;
}

function splitAbilityKey(key: PlayerAbilityKey): readonly [AbilityGroup, string] {
  const separatorIndex = key.indexOf(".");
  return [key.slice(0, separatorIndex) as AbilityGroup, key.slice(separatorIndex + 1)];
}

function readRoles(rows: readonly Record<string, unknown>[], kind: RoleKind): readonly PlayerRole[] {
  return rows.filter((row) => row.role_kind === kind).map((row) => requiredText(row, "role_code") as PlayerRole);
}

function readFamiliarity(rows: readonly Record<string, unknown>[]): Readonly<Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>>> {
  const familiarity: Partial<Record<PlayerRole, PlayerRoleFamiliarityLevel>> = {};
  for (const row of rows) familiarity[requiredText(row, "role_code") as PlayerRole] = requiredText(row, "familiarity_level") as PlayerRoleFamiliarityLevel;
  return familiarity;
}

function assertOrderedLookup<T extends string, Value>(ids: readonly T[], lookup: Readonly<Record<T, Value>>, label: string): void {
  if (new Set(ids).size !== ids.length) throw new SqliteWorldStateError("unsupported_bootstrap_state", `duplicate ${label} id in deterministic order`);
  if (Object.keys(lookup).length !== ids.length) throw new SqliteWorldStateError("unsupported_bootstrap_state", `${label} lookup and deterministic order differ`);
  ids.forEach((id) => requiredLookup(lookup, id, label));
}

function requiredLookup<T extends string, Value>(lookup: Readonly<Record<T, Value>>, id: T, label: string): Value {
  const value = lookup[id];
  if (value === undefined) throw new SqliteWorldStateError("unsupported_bootstrap_state", `ordered ${label} is missing: ${id}`);
  return value;
}

function present(value: unknown): number {
  return value === undefined ? 0 : 1;
}

function requiredOnlyRow(database: SqliteWorldDatabase, sql: string, requestedSaveId: SaveId): Record<string, unknown> {
  const rows = database.queryAll(sql, [requestedSaveId]);
  if (rows.length !== 1) throw new SqliteWorldStateError("sqlite_unavailable", `SQLite career root is incomplete: ${requestedSaveId}`);
  return rows[0]!;
}

function keyedRows(rows: readonly Record<string, unknown>[], key: string): Map<string, Record<string, unknown>> {
  return new Map(rows.map((row) => [requiredText(row, key), row]));
}

function groupedRows(rows: readonly Record<string, unknown>[], key: string): Map<string, Record<string, unknown>[]> {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    const groupKey = requiredText(row, key);
    const group = groups.get(groupKey) ?? [];
    group.push(row);
    groups.set(groupKey, group);
  }
  return groups;
}

function groupedRowsByNumber(
  rows: readonly Record<string, unknown>[],
  key: string,
): Map<number, Record<string, unknown>[]> {
  const groups = new Map<number, Record<string, unknown>[]>();
  for (const row of rows) {
    const groupKey = requiredNumber(row, key);
    const group = groups.get(groupKey) ?? [];
    group.push(row);
    groups.set(groupKey, group);
  }
  return groups;
}

function requiredMappedRow(rows: Map<string, Record<string, unknown>>, key: string, label: string): Record<string, unknown> {
  const row = rows.get(key);
  if (row === undefined) throw new SqliteWorldStateError("sqlite_unavailable", `ordered ${label} row is missing: ${key}`);
  return row;
}

function requiredText(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new SqliteWorldStateError("sqlite_unavailable", `SQLite column ${key} is not text`);
  return value;
}

function optionalText(row: Record<string, unknown> | undefined, key: string): string | undefined {
  return row === undefined ? undefined : nullableText(row, key);
}

function nullableText(row: Record<string, unknown>, key: string): string | undefined {
  const value = row[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") throw new SqliteWorldStateError("sqlite_unavailable", `SQLite column ${key} is not nullable text`);
  return value;
}

function requiredNumber(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint" && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) return Number(value);
  throw new SqliteWorldStateError("sqlite_unavailable", `SQLite column ${key} is not numeric`);
}

function nullableNumber(row: Record<string, unknown>, key: string): number | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  return requiredNumber(row, key);
}

function requiredAutosavePolicy(
  row: Record<string, unknown>,
  key: string,
): CareerAutosaveIntervalDays {
  const value = row[key];
  const numericValue = typeof value === "bigint" ? Number(value) : value;
  if (isCareerAutosaveIntervalDays(numericValue)) return numericValue;
  throw new SqliteWorldStateError("sqlite_unavailable", `SQLite column ${key} is not an autosave policy`);
}

function requiredBoolean(row: Record<string, unknown>, key: string): boolean {
  const value = requiredNumber(row, key);
  if (value !== 0 && value !== 1) throw new SqliteWorldStateError("sqlite_unavailable", `SQLite column ${key} is not boolean`);
  return value === 1;
}
