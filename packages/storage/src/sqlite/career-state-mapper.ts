import {
  clubId,
  competitionId,
  createCareerState,
  createCareerPlayerAvailabilityState,
  createPlayerParticipationLedger,
  careerInboxMessageId,
  createCareerInboxMessage,
  fixtureId,
  gameDate,
  nonNegativeMoney,
  playerId,
  seasonId,
  type CareerMatchPreparation,
  type CareerAttentionBlockerKey,
  type CareerAttentionLevel,
  type CareerInboxActionId,
  type CareerInboxCategory,
  type CareerInboxSource,
  type CareerSeasonArchiveEntry,
  type CareerState,
  type CareerPlayerAvailabilityState,
  type ClubTransferBudget,
  type LeagueTableRow,
  type MatchEvent,
  type MatchInjurySeverity,
  type MatchSubstitutionReasonKey,
  type MatchSuspensionReason,
  type PenaltyOutcome,
  type MatchReport,
  type MatchSideStats,
  type PlayerParticipationLedger,
  type PlayerParticipationRow,
  type PlayerId,
  type SaveId,
  type YouthAcademyState,
  type YouthAcademyClubRoster,
  type YouthPlayerLifecycle,
  type YouthPlayerStatus,
} from "@game/domain";

import type { SqliteBindValue, SqliteWorldDatabase } from "./world-state-mapper.ts";

/** Writes every durable career slice after the ordered world rows exist. */
export function insertCareerStateRows(database: SqliteWorldDatabase, state: CareerState): void {
  const save = state.saveId;
  if (state.careerWorld !== undefined) {
    database.run("INSERT INTO career_world (save_id, world_seed, generator_version, creation_source_key) VALUES (?, ?, ?, ?)", [save, state.careerWorld.worldSeed, state.careerWorld.generatorVersion, state.careerWorld.creationSourceKey]);
  }
  state.marketState.clubBudgetIds.forEach((budgetClubId, sortOrder) => {
    const budget = state.marketState.clubBudgets[budgetClubId];
    if (budget === undefined) throw mappingFailure(`ordered market budget is missing: ${budgetClubId}`);
    database.run("INSERT INTO market_budgets (save_id, sort_order, club_id, transfer_budget) VALUES (?, ?, ?, ?)", [save, sortOrder, budget.clubId, budget.transferBudget]);
  });
  for (const entry of state.transferHistory) {
    database.run(`INSERT INTO transfer_history
      (save_id, sequence_number, occurred_on, buying_club_id, selling_club_id, player_id, transfer_fee)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [save, entry.sequenceNumber, entry.occurredOn, entry.buyingClubId, entry.sellingClubId, entry.playerId, entry.transferFee]);
  }
  insertYouthState(database, state);
  insertCurrentSeasonInbox(database, state);
  insertPlayerAvailability(database, state);
  insertPlayerParticipationLedger(database, state);
  insertSeasonHistory(database, state);
  insertMatchPreparation(database, state);
  insertFixtureReports(database, state);
}

/** Adds all current durable career systems to a reconstructed world snapshot. */
export function loadCareerStateRows(database: SqliteWorldDatabase, requestedSaveId: SaveId, world: CareerState): CareerState {
  const gameState = attachFixtureReports(database, requestedSaveId, world.gameState);
  return createCareerState({
    ...world,
    gameState,
    ...(loadCareerWorldMetadata(database, requestedSaveId) ?? {}),
    marketState: loadMarketState(database, requestedSaveId),
    transferHistory: loadTransferHistory(database, requestedSaveId),
    currentSeasonInbox: loadCurrentSeasonInbox(database, requestedSaveId),
    ...(loadPlayerAvailability(database, requestedSaveId) ?? {}),
    ...(loadPlayerParticipationLedger(database, requestedSaveId) ?? {}),
    ...(loadYouthState(database, requestedSaveId, gameState) ?? {}),
    ...(loadSeasonHistory(database, requestedSaveId) ?? {}),
    ...(loadMatchPreparation(database, requestedSaveId) ?? {}),
  });
}

/** Writes durable injuries, suspensions, and competition yellow-card totals. */
function insertPlayerAvailability(database: SqliteWorldDatabase, state: CareerState): void {
  const availability = state.playerAvailability;
  if (availability === undefined) return;
  availability.injuries.forEach((injury, sortOrder) => {
    database.run(`INSERT INTO career_player_injuries
      (save_id, sort_order, player_id, fixture_id, severity, occurred_on, unavailable_until)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, injury.playerId, injury.fixtureId, injury.severity,
      injury.occurredOn, injury.unavailableUntil,
    ]);
  });
  availability.suspensions.forEach((suspension, sortOrder) => {
    database.run(`INSERT INTO career_player_suspensions
      (save_id, sort_order, player_id, fixture_id, competition_id, reason, remaining_matches)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, suspension.playerId, suspension.fixtureId,
      suspension.competitionId, suspension.reason, suspension.remainingMatches,
    ]);
  });
  availability.yellowCards.forEach((entry, sortOrder) => {
    database.run(`INSERT INTO career_player_yellow_cards
      (save_id, sort_order, player_id, competition_id, card_count) VALUES (?, ?, ?, ?, ?)`, [
      state.saveId, sortOrder, entry.playerId, entry.competitionId, entry.count,
    ]);
  });
}

/** Reconstructs the optional durable player-availability slice. */
function loadPlayerAvailability(
  database: SqliteWorldDatabase,
  save: SaveId,
): Pick<CareerState, "playerAvailability"> | undefined {
  const injuries = database.queryAll(
    "SELECT * FROM career_player_injuries WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => ({
    playerId: playerId(text(row, "player_id")),
    fixtureId: fixtureId(text(row, "fixture_id")),
    severity: text(row, "severity") as MatchInjurySeverity,
    occurredOn: gameDate(number(row, "occurred_on")),
    unavailableUntil: gameDate(number(row, "unavailable_until")),
  }));
  const suspensions = database.queryAll(
    "SELECT * FROM career_player_suspensions WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => ({
    playerId: playerId(text(row, "player_id")),
    fixtureId: fixtureId(text(row, "fixture_id")),
    competitionId: competitionId(text(row, "competition_id")),
    reason: text(row, "reason") as MatchSuspensionReason,
    remainingMatches: number(row, "remaining_matches"),
  }));
  const yellowCards = database.queryAll(
    "SELECT * FROM career_player_yellow_cards WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => ({
    playerId: playerId(text(row, "player_id")),
    competitionId: competitionId(text(row, "competition_id")),
    count: number(row, "card_count"),
  }));
  if (injuries.length === 0 && suspensions.length === 0 && yellowCards.length === 0) return undefined;
  const playerAvailability: CareerPlayerAvailabilityState = createCareerPlayerAvailabilityState({
    injuries,
    suspensions,
    yellowCards,
  });
  return { playerAvailability };
}

/** Writes monthly participation facts used by the player-development lifecycle. */
function insertPlayerParticipationLedger(database: SqliteWorldDatabase, state: CareerState): void {
  const ledger = state.playerParticipationLedger;
  if (ledger === undefined) return;

  database.run("INSERT INTO player_participation_ledgers (save_id) VALUES (?)", [state.saveId]);
  ledger.rowKeys.forEach((rowKey, sortOrder) => {
    const row = ledger.rows[rowKey];
    if (row === undefined) throw mappingFailure(`ordered participation row is missing: ${rowKey}`);
    database.run(`INSERT INTO player_participation_rows
      (save_id, sort_order, row_key, player_id, season_id, month_key, starts, substitute_appearances,
       minutes, rating_total, rating_samples)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId,
      sortOrder,
      row.rowKey,
      row.playerId,
      row.seasonId,
      row.monthKey,
      row.starts,
      row.substituteAppearances,
      row.minutes,
      row.ratingTotal,
      row.ratingSamples,
    ]);
    Object.entries(row.playedRoleMinutes).sort(([left], [right]) => left.localeCompare(right)).forEach(
      ([roleKey, minutes], roleOrder) => {
        if (minutes !== undefined) {
          database.run(`INSERT INTO player_participation_role_minutes
            (save_id, row_key, sort_order, role_key, minutes) VALUES (?, ?, ?, ?, ?)`,
          [state.saveId, row.rowKey, roleOrder, roleKey, minutes]);
        }
      },
    );
    row.appliedFixtureIds.forEach((appliedFixtureId, fixtureOrder) => {
      database.run(`INSERT INTO player_participation_applied_fixtures
        (save_id, row_key, sort_order, fixture_id) VALUES (?, ?, ?, ?)`,
      [state.saveId, row.rowKey, fixtureOrder, appliedFixtureId]);
    });
  });
  ledger.closedMonthKeys.forEach((monthKey, sortOrder) => {
    database.run(`INSERT INTO player_participation_closed_months
      (save_id, sort_order, month_key) VALUES (?, ?, ?)`,
    [state.saveId, sortOrder, monthKey]);
  });
}

/** Reconstructs the optional player-development participation ledger. */
function loadPlayerParticipationLedger(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "playerParticipationLedger"> | undefined {
  if (database.queryAll("SELECT save_id FROM player_participation_ledgers WHERE save_id = ?", [save]).length === 0) {
    return undefined;
  }

  const rows: Record<string, PlayerParticipationRow> = {};
  const rowKeys = database.queryAll("SELECT * FROM player_participation_rows WHERE save_id = ? ORDER BY sort_order", [save]).map((row) => {
    const rowKey = text(row, "row_key");
    const playedRoleMinutes = Object.fromEntries(
      database.queryAll(
        "SELECT role_key, minutes FROM player_participation_role_minutes WHERE save_id = ? AND row_key = ? ORDER BY sort_order",
        [save, rowKey],
      ).map((roleRow) => [text(roleRow, "role_key"), number(roleRow, "minutes")]),
    ) as PlayerParticipationRow["playedRoleMinutes"];
    rows[rowKey] = {
      rowKey,
      playerId: playerId(text(row, "player_id")),
      seasonId: seasonId(text(row, "season_id")),
      monthKey: text(row, "month_key"),
      starts: number(row, "starts"),
      substituteAppearances: number(row, "substitute_appearances"),
      minutes: number(row, "minutes"),
      ratingTotal: number(row, "rating_total"),
      ratingSamples: number(row, "rating_samples"),
      playedRoleMinutes,
      appliedFixtureIds: database.queryAll(
        "SELECT fixture_id FROM player_participation_applied_fixtures WHERE save_id = ? AND row_key = ? ORDER BY sort_order",
        [save, rowKey],
      ).map((fixture) => fixtureId(text(fixture, "fixture_id"))),
    };
    return rowKey;
  });
  const closedMonthKeys = database.queryAll(
    "SELECT month_key FROM player_participation_closed_months WHERE save_id = ? ORDER BY sort_order",
    [save],
  ).map((row) => text(row, "month_key"));
  const playerParticipationLedger: PlayerParticipationLedger = createPlayerParticipationLedger({
    rows,
    rowKeys,
    closedMonthKeys,
  });

  return { playerParticipationLedger };
}

/** Writes ordered current-season message facts without rendered text or blobs. */
function insertCurrentSeasonInbox(database: SqliteWorldDatabase, state: CareerState): void {
  (state.currentSeasonInbox ?? []).forEach((message, sortOrder) => {
    database.run(`INSERT INTO career_inbox_messages
      (save_id, sort_order, message_id, message_date, category, source, attention_level,
       is_read, is_acknowledged, is_resolved, fixture_id, club_id, player_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId,
      sortOrder,
      message.id,
      message.date,
      message.category,
      message.source,
      message.level,
      message.lifecycle.read ? 1 : 0,
      message.lifecycle.acknowledged ? 1 : 0,
      message.lifecycle.resolved ? 1 : 0,
      message.related.fixtureId ?? null,
      message.related.clubId ?? null,
      message.related.playerId ?? null,
    ]);
    message.blockerKeys.forEach((blockerKey, blockerOrder) => {
      database.run(`INSERT INTO career_inbox_blockers
        (save_id, message_id, sort_order, blocker_key) VALUES (?, ?, ?, ?)`,
      [state.saveId, message.id, blockerOrder, blockerKey]);
    });
    message.actionIds.forEach((actionId, actionOrder) => {
      database.run(`INSERT INTO career_inbox_actions
        (save_id, message_id, sort_order, action_id) VALUES (?, ?, ?, ?)`,
      [state.saveId, message.id, actionOrder, actionId]);
    });
  });
}

/** Reconstructs the exact ordered current-season message slice. */
function loadCurrentSeasonInbox(database: SqliteWorldDatabase, save: SaveId): NonNullable<CareerState["currentSeasonInbox"]> {
  return database.queryAll("SELECT * FROM career_inbox_messages WHERE save_id = ? ORDER BY sort_order", [save]).map((row) => {
    const messageId = careerInboxMessageId(text(row, "message_id"));
    const fixture = optionalText(row, "fixture_id");
    const club = optionalText(row, "club_id");
    const player = optionalText(row, "player_id");
    return createCareerInboxMessage({
      id: messageId,
      date: gameDate(number(row, "message_date")),
      category: text(row, "category") as CareerInboxCategory,
      source: text(row, "source") as CareerInboxSource,
      level: text(row, "attention_level") as CareerAttentionLevel,
      lifecycle: {
        read: boolean(row, "is_read"),
        acknowledged: boolean(row, "is_acknowledged"),
        resolved: boolean(row, "is_resolved"),
      },
      related: {
        ...(fixture === undefined ? {} : { fixtureId: fixtureId(fixture) }),
        ...(club === undefined ? {} : { clubId: clubId(club) }),
        ...(player === undefined ? {} : { playerId: playerId(player) }),
      },
      blockerKeys: database.queryAll(
        "SELECT blocker_key FROM career_inbox_blockers WHERE save_id = ? AND message_id = ? ORDER BY sort_order",
        [save, messageId],
      ).map((blocker) => text(blocker, "blocker_key") as CareerAttentionBlockerKey),
      actionIds: database.queryAll(
        "SELECT action_id FROM career_inbox_actions WHERE save_id = ? AND message_id = ? ORDER BY sort_order",
        [save, messageId],
      ).map((action) => text(action, "action_id") as CareerInboxActionId),
    });
  });
}

function insertYouthState(database: SqliteWorldDatabase, state: CareerState): void {
  const youth = state.youthAcademyState;
  if (youth === undefined) return;
  database.run("INSERT INTO youth_state (save_id) VALUES (?)", [state.saveId]);
  youth.clubRosterIds.forEach((rosterClubId, sortOrder) => {
    const roster = youth.clubRosters[rosterClubId];
    if (roster === undefined) throw mappingFailure(`ordered youth roster is missing: ${rosterClubId}`);
    database.run("INSERT INTO youth_club_rosters (save_id, sort_order, club_id) VALUES (?, ?, ?)", [state.saveId, sortOrder, roster.clubId]);
    roster.playerIds.forEach((rosterPlayerId, playerOrder) => {
      database.run("INSERT INTO youth_roster_players (save_id, club_id, sort_order, player_id) VALUES (?, ?, ?, ?)", [state.saveId, roster.clubId, playerOrder, rosterPlayerId]);
    });
  });
  youth.playerLifecycleIds.forEach((lifecyclePlayerId, sortOrder) => {
    const lifecycle = youth.playerLifecycle[lifecyclePlayerId];
    if (lifecycle === undefined) throw mappingFailure(`ordered youth lifecycle is missing: ${lifecyclePlayerId}`);
    database.run(`INSERT INTO youth_lifecycle
      (save_id, sort_order, player_id, club_id, status, academy_entry_season_id, academy_entry_date, status_changed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [state.saveId, sortOrder, lifecycle.playerId, lifecycle.clubId, lifecycle.status, lifecycle.academyEntrySeasonId, lifecycle.academyEntryDate, lifecycle.statusChangedAt ?? null]);
  });
}

function insertSeasonHistory(database: SqliteWorldDatabase, state: CareerState): void {
  for (const entry of state.seasonHistory ?? []) {
    const selected = entry.selectedClubFinish;
    database.run(`INSERT INTO season_history
      (save_id, sequence_number, season_id, competition_id, champion_club_id, fixture_count, total_goals,
       selected_position, selected_club_id, selected_played, selected_wins, selected_draws, selected_losses,
       selected_goals_for, selected_goals_against, selected_goal_difference, selected_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      state.saveId, entry.sequenceNumber, entry.seasonId, entry.competitionId, entry.championClubId,
      entry.aggregateGoals.fixtureCount, entry.aggregateGoals.totalGoals, ...tableRowValues(selected),
    ]);
    entry.finalTable.forEach((row, sortOrder) => {
      database.run(`INSERT INTO season_table_rows
        (save_id, history_sequence_number, sort_order, position, club_id, played, wins, draws, losses,
         goals_for, goals_against, goal_difference, points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [state.saveId, entry.sequenceNumber, sortOrder, ...tableRowValues(row)]);
    });
  }
}

function insertMatchPreparation(database: SqliteWorldDatabase, state: CareerState): void {
  const preparation = state.matchPreparation;
  if (preparation === undefined) return;
  const tactic = preparation.tactic;
  database.run(`INSERT INTO match_preparation
    (save_id, selected_club_id, target_fixture_id, updated_at, has_lineup, has_tactic,
     tactic_mentality, tactic_pressing, tactic_directness, tactic_width, tactic_risk, base_formation_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    state.saveId, preparation.selectedClubId, preparation.targetFixtureId ?? null, preparation.updatedAt,
    preparation.selectedLineup === undefined ? 0 : 1, tactic === undefined ? 0 : 1,
    tactic?.mentality ?? null, tactic?.pressing ?? null, tactic?.directness ?? null, tactic?.width ?? null, tactic?.risk ?? null,
    preparation.baseFormationId ?? null,
  ]);
  preparation.selectedLineup?.slots.forEach((slot, sortOrder) => {
    database.run(`INSERT INTO match_preparation_lineup
      (save_id, sort_order, club_id, slot_key, player_id, role_key) VALUES (?, ?, ?, ?, ?, ?)`,
    [state.saveId, sortOrder, preparation.selectedLineup?.clubId ?? preparation.selectedClubId, slot.slotKey, slot.playerId, slot.roleKey]);
  });
  preparation.boardSlots?.forEach((slot, sortOrder) => {
    database.run(`INSERT INTO match_preparation_board_slots
      (save_id, sort_order, slot_key, nx, ny, role_key) VALUES (?, ?, ?, ?, ?, ?)`,
    [state.saveId, sortOrder, slot.slotKey, slot.nx, slot.ny, slot.roleKey]);
  });
  preparation.benchSlots?.forEach((slot, sortOrder) => {
    database.run(`INSERT INTO match_preparation_bench
      (save_id, sort_order, slot_key, player_id) VALUES (?, ?, ?, ?)`,
    [state.saveId, sortOrder, slot.slotKey, slot.playerId]);
  });
}

function insertFixtureReports(database: SqliteWorldDatabase, state: CareerState): void {
  for (const fixtureIdValue of state.gameState.fixtureIds) {
    const report = state.gameState.fixtures[fixtureIdValue]?.result?.report;
    if (report === undefined) continue;
    insertMatchReport(database, state.saveId, report);
  }
}

function insertMatchReport(database: SqliteWorldDatabase, save: SaveId, report: MatchReport): void {
  database.run(`INSERT INTO match_reports
    (save_id, fixture_id, event_schema_version, final_minute, score_home, score_away,
     home_opportunities, home_shots, home_shots_on_target, home_goals,
     away_opportunities, away_shots, away_shots_on_target, away_goals)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [save, report.fixtureId, report.eventSchemaVersion, report.finalMinute,
    report.score.home, report.score.away, ...sideStatsValues(report.stats.home), ...sideStatsValues(report.stats.away)]);
  insertMatchEvents(database, save, "report", report.fixtureId, report.events);
}

function insertMatchEvents(database: SqliteWorldDatabase, save: SaveId, ownerKind: "report", ownerId: string, events: readonly MatchEvent[]): void {
  events.forEach((event, sortOrder) => {
    const shot = "shot" in event ? event.shot : undefined;
    const score = "score" in event ? event.score : undefined;
    const side = "side" in event ? event.side : shot?.side;
    const minute = shot?.minute ?? ("minute" in event ? event.minute : 0);
    database.run(`INSERT INTO match_events
      (save_id, owner_kind, owner_id, sort_order, event_type, event_minute, side, quality, is_shot_on_target,
       shot_type, chance_type, scorer_player_id, assist_player_id, creator_player_id, shooter_player_id,
       goalkeeper_player_id, primary_defender_player_id, score_home, score_away,
       committed_by_player_id, suffered_by_player_id, zone_danger, card_player_id, fouled_player_id,
       penalty_taker_player_id, penalty_outcome, injury_player_id, injury_severity,
       outgoing_player_id, incoming_player_id, slot_id, substitution_reason_key)
      VALUES (${placeholders(32)})`, [save, ownerKind, ownerId, sortOrder, event.type, minute,
      side ?? null, shot?.quality ?? null, shot === undefined ? null : shot.isShotOnTarget ? 1 : 0,
      shot?.shotType ?? null, shot?.chanceType ?? null,
      "scorerPlayerId" in event ? event.scorerPlayerId : null,
      "assistPlayerId" in event ? event.assistPlayerId ?? null : null,
      "creatorPlayerId" in event ? event.creatorPlayerId ?? null : null,
      "shooterPlayerId" in event ? event.shooterPlayerId ?? null : null,
      "goalkeeperPlayerId" in event ? event.goalkeeperPlayerId : null,
      "primaryDefenderPlayerId" in event ? event.primaryDefenderPlayerId ?? null : null,
      score?.home ?? null, score?.away ?? null,
      event.type === "foul" ? event.committedByPlayerId : event.type === "penalty_awarded" ? event.committedByPlayerId ?? null : null,
      event.type === "foul" ? event.sufferedByPlayerId ?? null : null,
      event.type === "foul" ? event.zoneDanger : null,
      event.type === "yellow_card" || event.type === "second_yellow_card" || event.type === "red_card" ? event.playerId : null,
      event.type === "penalty_awarded" ? event.fouledPlayerId ?? null : null,
      event.type === "penalty_outcome" ? event.takerPlayerId : null,
      event.type === "penalty_outcome" ? event.outcome : null,
      event.type === "injury" ? event.playerId : null,
      event.type === "injury" ? event.severity : null,
      event.type === "substitution" ? event.outgoingPlayerId : null,
      event.type === "substitution" ? event.incomingPlayerId : null,
      event.type === "substitution" ? event.slotId : null,
      event.type === "substitution" ? event.reasonKey : null]);
  });
}

function loadCareerWorldMetadata(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "careerWorld"> | undefined {
  const row = database.queryAll("SELECT world_seed, generator_version, creation_source_key FROM career_world WHERE save_id = ?", [save])[0];
  return row === undefined ? undefined : { careerWorld: { worldSeed: text(row, "world_seed"), generatorVersion: number(row, "generator_version"), creationSourceKey: text(row, "creation_source_key") } };
}

function loadMarketState(database: SqliteWorldDatabase, save: SaveId): CareerState["marketState"] {
  const clubBudgets: Record<string, ClubTransferBudget> = {};
  const clubBudgetIds = database.queryAll("SELECT club_id, transfer_budget FROM market_budgets WHERE save_id = ? ORDER BY sort_order", [save]).map((row) => {
    const budgetClubId = clubId(text(row, "club_id"));
    clubBudgets[budgetClubId] = { clubId: budgetClubId, transferBudget: nonNegativeMoney(number(row, "transfer_budget")) };
    return budgetClubId;
  });
  return { clubBudgets, clubBudgetIds };
}

function loadTransferHistory(database: SqliteWorldDatabase, save: SaveId): CareerState["transferHistory"] {
  return database.queryAll(`SELECT sequence_number, occurred_on, buying_club_id, selling_club_id, player_id, transfer_fee
    FROM transfer_history WHERE save_id = ? ORDER BY sequence_number`, [save]).map((row) => ({
    sequenceNumber: number(row, "sequence_number"), occurredOn: gameDate(number(row, "occurred_on")),
    buyingClubId: clubId(text(row, "buying_club_id")), sellingClubId: clubId(text(row, "selling_club_id")),
    playerId: playerId(text(row, "player_id")), transferFee: nonNegativeMoney(number(row, "transfer_fee")),
  }));
}

function loadYouthState(database: SqliteWorldDatabase, save: SaveId, gameState: CareerState["gameState"]): Pick<CareerState, "youthAcademyState"> | undefined {
  if (database.queryAll("SELECT save_id FROM youth_state WHERE save_id = ?", [save]).length === 0) return undefined;
  const clubRosters: Record<string, YouthAcademyClubRoster> = {};
  const clubRosterIds = database.queryAll("SELECT club_id FROM youth_club_rosters WHERE save_id = ? ORDER BY sort_order", [save]).map((row) => {
    const rosterClubId = clubId(text(row, "club_id"));
    const playerIds = database.queryAll("SELECT player_id FROM youth_roster_players WHERE save_id = ? AND club_id = ? ORDER BY sort_order", [save, rosterClubId]).map((playerRow) => playerId(text(playerRow, "player_id")));
    clubRosters[rosterClubId] = { clubId: rosterClubId, playerIds };
    return rosterClubId;
  });
  const playerLifecycle: Record<string, YouthPlayerLifecycle> = {};
  const playerLifecycleIds = database.queryAll(`SELECT player_id, club_id, status, academy_entry_season_id, academy_entry_date, status_changed_at
    FROM youth_lifecycle WHERE save_id = ? ORDER BY sort_order`, [save]).map((row) => {
    const lifecyclePlayerId = playerId(text(row, "player_id"));
    const changed = optionalNumber(row, "status_changed_at");
    playerLifecycle[lifecyclePlayerId] = { playerId: lifecyclePlayerId, clubId: clubId(text(row, "club_id")), status: text(row, "status") as YouthPlayerStatus,
      academyEntrySeasonId: seasonId(text(row, "academy_entry_season_id")), academyEntryDate: gameDate(number(row, "academy_entry_date")),
      ...(changed === undefined ? {} : { statusChangedAt: gameDate(changed) }) };
    return lifecyclePlayerId;
  });
  return { youthAcademyState: { clubRosters, clubRosterIds, playerLifecycle, playerLifecycleIds } };
}

function loadSeasonHistory(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "seasonHistory"> | undefined {
  const historyRows = database.queryAll("SELECT * FROM season_history WHERE save_id = ? ORDER BY sequence_number", [save]);
  if (historyRows.length === 0) return undefined;
  const seasonHistory: CareerSeasonArchiveEntry[] = historyRows.map((row) => {
    const sequenceNumber = number(row, "sequence_number");
    const finalTable = database.queryAll("SELECT * FROM season_table_rows WHERE save_id = ? AND history_sequence_number = ? ORDER BY sort_order", [save, sequenceNumber]).map((tableRow) => readTableRow(tableRow));
    return { sequenceNumber, seasonId: seasonId(text(row, "season_id")), competitionId: competitionId(text(row, "competition_id")),
      finalTable, championClubId: clubId(text(row, "champion_club_id")), selectedClubFinish: readTableRow(row, "selected_"),
      aggregateGoals: { fixtureCount: number(row, "fixture_count"), totalGoals: number(row, "total_goals") } };
  });
  return { seasonHistory };
}

function loadMatchPreparation(database: SqliteWorldDatabase, save: SaveId): Pick<CareerState, "matchPreparation"> | undefined {
  const row = database.queryAll("SELECT * FROM match_preparation WHERE save_id = ?", [save])[0];
  if (row === undefined) return undefined;
  const hasLineup = boolean(row, "has_lineup");
  const hasTactic = boolean(row, "has_tactic");
  const targetFixture = optionalText(row, "target_fixture_id");
  const baseFormationId = optionalText(row, "base_formation_id");
  const boardSlots = database.queryAll("SELECT slot_key, nx, ny, role_key FROM match_preparation_board_slots WHERE save_id = ? ORDER BY sort_order", [save]);
  const benchSlots = database.queryAll("SELECT slot_key, player_id FROM match_preparation_bench WHERE save_id = ? ORDER BY sort_order", [save]);
  const matchPreparation: CareerMatchPreparation = {
    selectedClubId: clubId(text(row, "selected_club_id")),
    ...(targetFixture === undefined ? {} : { targetFixtureId: fixtureId(targetFixture) }),
    ...(hasLineup ? { selectedLineup: { clubId: clubId(text(database.queryAll("SELECT club_id FROM match_preparation_lineup WHERE save_id = ? ORDER BY sort_order", [save])[0]!, "club_id")),
      slots: database.queryAll("SELECT slot_key, player_id, role_key FROM match_preparation_lineup WHERE save_id = ? ORDER BY sort_order", [save]).map((slot) => ({ slotKey: text(slot, "slot_key"), playerId: playerId(text(slot, "player_id")), roleKey: text(slot, "role_key") })) } } : {}),
    ...(hasTactic ? { tactic: { mentality: text(row, "tactic_mentality") as NonNullable<CareerMatchPreparation["tactic"]>["mentality"], pressing: number(row, "tactic_pressing"), directness: number(row, "tactic_directness"), width: number(row, "tactic_width"), risk: number(row, "tactic_risk") } } : {}),
    ...(baseFormationId === undefined ? {} : { baseFormationId }),
    ...(boardSlots.length === 0 ? {} : { boardSlots: boardSlots.map((slot) => ({ slotKey: text(slot, "slot_key"), nx: number(slot, "nx"), ny: number(slot, "ny"), roleKey: text(slot, "role_key") })) }),
    ...(benchSlots.length === 0 ? {} : { benchSlots: benchSlots.map((slot) => ({ slotKey: text(slot, "slot_key"), playerId: playerId(text(slot, "player_id")) })) }),
    updatedAt: gameDate(number(row, "updated_at")),
  };
  return { matchPreparation };
}

function attachFixtureReports(database: SqliteWorldDatabase, save: SaveId, gameState: CareerState["gameState"]): CareerState["gameState"] {
  const fixtures = { ...gameState.fixtures };
  for (const row of database.queryAll("SELECT * FROM match_reports WHERE save_id = ?", [save])) {
    const reportFixtureId = fixtureId(text(row, "fixture_id"));
    const fixture = fixtures[reportFixtureId];
    if (fixture?.result === undefined) throw mappingFailure(`match report has no compact fixture result: ${reportFixtureId}`);
    const report: MatchReport = { eventSchemaVersion: number(row, "event_schema_version") as MatchReport["eventSchemaVersion"], fixtureId: reportFixtureId,
      finalMinute: number(row, "final_minute"), score: { home: number(row, "score_home"), away: number(row, "score_away") },
      stats: readStats(row), events: loadMatchEvents(database, save, "report", reportFixtureId) };
    fixtures[reportFixtureId] = { ...fixture, result: { ...fixture.result, report } };
  }
  return { ...gameState, fixtures };
}

function loadMatchEvents(database: SqliteWorldDatabase, save: SaveId, ownerKind: "report", ownerId: string): readonly MatchEvent[] {
  return database.queryAll("SELECT * FROM match_events WHERE save_id = ? AND owner_kind = ? AND owner_id = ? ORDER BY sort_order", [save, ownerKind, ownerId]).map(readMatchEvent);
}

function readMatchEvent(row: Record<string, unknown>): MatchEvent {
  const type = text(row, "event_type");
  const minute = number(row, "event_minute");
  if (type === "kickoff") return { type, minute: 0 };
  if (type === "half_time" || type === "full_time") return { type, minute, score: { home: number(row, "score_home"), away: number(row, "score_away") } };
  const side = text(row, "side") as "home" | "away";
  if (type === "foul") return { type, minute, side, committedByPlayerId: playerId(text(row, "committed_by_player_id")), ...optionalPlayer(row, "suffered_by_player_id", "sufferedByPlayerId"), zoneDanger: number(row, "zone_danger") };
  if (type === "yellow_card" || type === "second_yellow_card" || type === "red_card") return { type, minute, side, playerId: playerId(text(row, "card_player_id")) };
  if (type === "penalty_awarded") return { type, minute, side, ...optionalPlayer(row, "fouled_player_id", "fouledPlayerId"), ...optionalPlayer(row, "committed_by_player_id", "committedByPlayerId") };
  if (type === "penalty_outcome") return { type, minute, side, takerPlayerId: playerId(text(row, "penalty_taker_player_id")), goalkeeperPlayerId: playerId(text(row, "goalkeeper_player_id")), outcome: text(row, "penalty_outcome") as PenaltyOutcome };
  if (type === "injury") return { type, minute, side, playerId: playerId(text(row, "injury_player_id")), severity: text(row, "injury_severity") as MatchInjurySeverity };
  if (type === "substitution") return { type, minute, side, outgoingPlayerId: playerId(text(row, "outgoing_player_id")), incomingPlayerId: playerId(text(row, "incoming_player_id")), slotId: text(row, "slot_id"), reasonKey: text(row, "substitution_reason_key") as MatchSubstitutionReasonKey };
  const shot = { minute, side, quality: number(row, "quality"), isShotOnTarget: boolean(row, "is_shot_on_target"), shotType: text(row, "shot_type") as "normal" | "header" | "set_piece", chanceType: text(row, "chance_type") as "open_play" | "counter" | "cross" | "dead_ball" };
  if (type === "goal") return { type, shot, scorerPlayerId: playerId(text(row, "scorer_player_id")), ...optionalPlayer(row, "assist_player_id", "assistPlayerId"), ...optionalPlayer(row, "creator_player_id", "creatorPlayerId") };
  if (type === "save") return { type, shot, ...optionalPlayer(row, "shooter_player_id", "shooterPlayerId"), goalkeeperPlayerId: playerId(text(row, "goalkeeper_player_id")) };
  if (type === "miss") return { type, shot, ...optionalPlayer(row, "shooter_player_id", "shooterPlayerId") };
  if (type === "block") return { type, shot, ...optionalPlayer(row, "shooter_player_id", "shooterPlayerId"), ...optionalPlayer(row, "primary_defender_player_id", "primaryDefenderPlayerId") };
  throw mappingFailure(`unsupported match event type: ${type}`);
}

function optionalPlayer(row: Record<string, unknown>, column: string, property: string): Record<string, PlayerId> {
  const value = optionalText(row, column);
  return value === undefined ? {} : { [property]: playerId(value) };
}

function readStats(row: Record<string, unknown>): MatchReport["stats"] {
  return { home: readSideStats(row, "home_"), away: readSideStats(row, "away_") };
}

function readSideStats(row: Record<string, unknown>, prefix: string): MatchSideStats {
  return { opportunities: number(row, `${prefix}opportunities`), shots: number(row, `${prefix}shots`), shotsOnTarget: number(row, `${prefix}shots_on_target`), goals: number(row, `${prefix}goals`) };
}

function sideStatsValues(stats: MatchSideStats): readonly number[] {
  return [stats.opportunities, stats.shots, stats.shotsOnTarget, stats.goals];
}

function tableRowValues(row: LeagueTableRow): readonly SqliteBindValue[] {
  return [row.position, row.clubId, row.played, row.wins, row.draws, row.losses, row.goalsFor, row.goalsAgainst, row.goalDifference, row.points];
}

function readTableRow(row: Record<string, unknown>, prefix = ""): LeagueTableRow {
  return { position: number(row, `${prefix}position`), clubId: clubId(text(row, `${prefix}club_id`)), played: number(row, `${prefix}played`), wins: number(row, `${prefix}wins`), draws: number(row, `${prefix}draws`), losses: number(row, `${prefix}losses`), goalsFor: number(row, `${prefix}goals_for`), goalsAgainst: number(row, `${prefix}goals_against`), goalDifference: number(row, `${prefix}goal_difference`), points: number(row, `${prefix}points`) };
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => "?").join(", ");
}

function text(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw mappingFailure(`SQLite column ${key} is not text`);
  return value;
}

function optionalText(row: Record<string, unknown>, key: string): string | undefined {
  const value = row[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") throw mappingFailure(`SQLite column ${key} is not nullable text`);
  return value;
}

function number(row: Record<string, unknown>, key: string): number {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint" && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) return Number(value);
  throw mappingFailure(`SQLite column ${key} is not numeric`);
}

function optionalNumber(row: Record<string, unknown>, key: string): number | undefined {
  return row[key] === null || row[key] === undefined ? undefined : number(row, key);
}

function boolean(row: Record<string, unknown>, key: string): boolean {
  const value = number(row, key);
  if (value !== 0 && value !== 1) throw mappingFailure(`SQLite column ${key} is not boolean`);
  return value === 1;
}

function mappingFailure(message: string): Error {
  return new Error(`relational career mapping failed: ${message}`);
}
