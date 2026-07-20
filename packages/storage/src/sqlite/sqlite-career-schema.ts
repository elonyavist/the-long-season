/** Current relational browser-career schema version. */
export const SQLITE_CAREER_SCHEMA_VERSION = 9;

/** Stable OPFS database path shared by all web-career operations. */
export const SQLITE_CAREER_DATABASE_PATH = "/the-long-season-careers.sqlite3";

/** Immutable version-1 tables introduced by the OPFS bootstrap. */
export const SQLITE_CAREER_SCHEMA_V1_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at_iso TEXT NOT NULL
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS career_saves (
    save_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at_iso TEXT NOT NULL,
    updated_at_iso TEXT NOT NULL,
    save_schema_version INTEGER NOT NULL,
    career_schema_version INTEGER NOT NULL,
    selected_club_id TEXT NOT NULL
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS game_meta (
    save_id TEXT PRIMARY KEY REFERENCES career_saves(save_id) ON DELETE CASCADE,
    seed TEXT NOT NULL,
    rng_algorithm_version TEXT NOT NULL,
    save_schema_version INTEGER NOT NULL
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS game_calendar (
    save_id TEXT PRIMARY KEY REFERENCES career_saves(save_id) ON DELETE CASCADE,
    current_date INTEGER NOT NULL,
    current_season_id TEXT NOT NULL
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS clubs (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    club_id TEXT NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    category TEXT NOT NULL,
    reputation REAL NOT NULL,
    PRIMARY KEY (save_id, club_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS club_order (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    club_id TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id) ON DELETE CASCADE
  ) STRICT`,
] as const;

/** Version-5 metadata column for per-career in-game autosave cadence. */
export const SQLITE_CAREER_SCHEMA_V5_STATEMENTS = [
  `ALTER TABLE career_saves ADD COLUMN autosave_interval_days INTEGER DEFAULT 7
    CHECK (autosave_interval_days IS NULL OR autosave_interval_days IN (7, 15))`,
] as const;

/** Version-6 relational current-season Posta facts and lifecycle state. */
export const SQLITE_CAREER_SCHEMA_V6_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS career_inbox_messages (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    message_id TEXT NOT NULL,
    message_date INTEGER NOT NULL,
    category TEXT NOT NULL,
    source TEXT NOT NULL,
    attention_level TEXT NOT NULL CHECK (attention_level IN ('blocking', 'important', 'informational')),
    is_read INTEGER NOT NULL CHECK (is_read IN (0, 1)),
    is_acknowledged INTEGER NOT NULL CHECK (is_acknowledged IN (0, 1)),
    is_resolved INTEGER NOT NULL CHECK (is_resolved IN (0, 1)),
    fixture_id TEXT,
    club_id TEXT,
    player_id TEXT,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, message_id),
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS career_inbox_blockers (
    save_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    blocker_key TEXT NOT NULL,
    PRIMARY KEY (save_id, message_id, sort_order),
    FOREIGN KEY (save_id, message_id) REFERENCES career_inbox_messages(save_id, message_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS career_inbox_actions (
    save_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    action_id TEXT NOT NULL,
    PRIMARY KEY (save_id, message_id, sort_order),
    FOREIGN KEY (save_id, message_id) REFERENCES career_inbox_messages(save_id, message_id) ON DELETE CASCADE
  ) STRICT`,
] as const;

/** Version-7 monthly player-development participation facts. */
export const SQLITE_CAREER_SCHEMA_V7_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS player_participation_ledgers (
    save_id TEXT PRIMARY KEY REFERENCES career_saves(save_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_participation_rows (
    save_id TEXT NOT NULL REFERENCES player_participation_ledgers(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    row_key TEXT NOT NULL,
    player_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    month_key TEXT NOT NULL,
    starts INTEGER NOT NULL CHECK (starts >= 0),
    substitute_appearances INTEGER NOT NULL CHECK (substitute_appearances >= 0),
    minutes INTEGER NOT NULL CHECK (minutes >= 0),
    rating_total REAL NOT NULL CHECK (rating_total >= 0),
    rating_samples INTEGER NOT NULL CHECK (rating_samples >= 0),
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, row_key),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_participation_role_minutes (
    save_id TEXT NOT NULL,
    row_key TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    role_key TEXT NOT NULL,
    minutes INTEGER NOT NULL CHECK (minutes >= 0),
    PRIMARY KEY (save_id, row_key, sort_order),
    UNIQUE (save_id, row_key, role_key),
    FOREIGN KEY (save_id, row_key) REFERENCES player_participation_rows(save_id, row_key) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_participation_applied_fixtures (
    save_id TEXT NOT NULL,
    row_key TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    fixture_id TEXT NOT NULL,
    PRIMARY KEY (save_id, row_key, sort_order),
    UNIQUE (save_id, row_key, fixture_id),
    FOREIGN KEY (save_id, row_key) REFERENCES player_participation_rows(save_id, row_key) ON DELETE CASCADE,
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_participation_closed_months (
    save_id TEXT NOT NULL REFERENCES player_participation_ledgers(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    month_key TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, month_key)
  ) STRICT`,
] as const;

/** Version-8 durable match incidents and player availability facts. */
export const SQLITE_CAREER_SCHEMA_V8_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS career_player_injuries (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    fixture_id TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('knock', 'minor', 'moderate', 'serious')),
    occurred_on INTEGER NOT NULL,
    unavailable_until INTEGER NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS career_player_suspensions (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    fixture_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('straight_red', 'second_yellow', 'yellow_accumulation')),
    remaining_matches INTEGER NOT NULL CHECK (remaining_matches > 0),
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, competition_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS career_player_yellow_cards (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    card_count INTEGER NOT NULL CHECK (card_count > 0),
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, competition_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `ALTER TABLE match_events ADD COLUMN committed_by_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN suffered_by_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN zone_danger REAL`,
  `ALTER TABLE match_events ADD COLUMN card_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN fouled_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN penalty_taker_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN penalty_outcome TEXT`,
  `ALTER TABLE match_events ADD COLUMN injury_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN injury_severity TEXT`,
  `ALTER TABLE match_events ADD COLUMN outgoing_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN incoming_player_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN slot_id TEXT`,
  `ALTER TABLE match_events ADD COLUMN substitution_reason_key TEXT`,
] as const;

/**
 * Version 9 intentionally has no additive statements.
 *
 * The version boundary invalidates beta databases that still contain the
 * retired unfinished-match checkpoint schema. Fresh databases build the
 * canonical report-only schema from the revised earlier migrations.
 */
export const SQLITE_CAREER_SCHEMA_V9_STATEMENTS = [] as const;

/** Version-2 tables that preserve the complete ordered game world. */
export const SQLITE_CAREER_SCHEMA_V2_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS players (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    player_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date INTEGER NOT NULL,
    primary_role TEXT,
    archetype TEXT,
    has_natural_roles INTEGER NOT NULL CHECK (has_natural_roles IN (0, 1)),
    has_adapted_roles INTEGER NOT NULL CHECK (has_adapted_roles IN (0, 1)),
    has_weak_roles INTEGER NOT NULL CHECK (has_weak_roles IN (0, 1)),
    has_role_familiarity INTEGER NOT NULL CHECK (has_role_familiarity IN (0, 1)),
    PRIMARY KEY (save_id, player_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_order (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_positions (
    save_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    position_code TEXT NOT NULL,
    PRIMARY KEY (save_id, player_id, sort_order),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_roles (
    save_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    role_kind TEXT NOT NULL CHECK (role_kind IN ('natural', 'adapted', 'weak')),
    sort_order INTEGER NOT NULL,
    role_code TEXT NOT NULL,
    PRIMARY KEY (save_id, player_id, role_kind, sort_order),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_role_familiarity (
    save_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    role_code TEXT NOT NULL,
    familiarity_level TEXT NOT NULL,
    PRIMARY KEY (save_id, player_id, role_code),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_abilities (
    save_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    ability_scope TEXT NOT NULL CHECK (ability_scope IN ('current', 'potential')),
    ability_group TEXT NOT NULL,
    ability_key TEXT NOT NULL,
    ability_value REAL NOT NULL,
    PRIMARY KEY (save_id, player_id, ability_scope, ability_group, ability_key),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_states (
    save_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    fitness REAL NOT NULL,
    form REAL NOT NULL,
    morale REAL NOT NULL,
    PRIMARY KEY (save_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS club_player_order (
    save_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    PRIMARY KEY (save_id, club_id, sort_order),
    UNIQUE (save_id, player_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS fixtures (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    fixture_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    season_id TEXT NOT NULL,
    round_number INTEGER NOT NULL,
    fixture_date INTEGER NOT NULL,
    home_club_id TEXT NOT NULL,
    away_club_id TEXT NOT NULL,
    PRIMARY KEY (save_id, fixture_id),
    FOREIGN KEY (save_id, home_club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, away_club_id) REFERENCES clubs(save_id, club_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS fixture_order (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    fixture_id TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, fixture_id),
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS fixture_results (
    save_id TEXT NOT NULL,
    fixture_id TEXT NOT NULL,
    home_goals INTEGER NOT NULL,
    away_goals INTEGER NOT NULL,
    PRIMARY KEY (save_id, fixture_id),
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id) ON DELETE CASCADE
  ) STRICT`,
] as const;

/** Version-3 tables for every currently durable career system. */
export const SQLITE_CAREER_SCHEMA_V3_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS career_world (
    save_id TEXT PRIMARY KEY REFERENCES career_saves(save_id) ON DELETE CASCADE,
    world_seed TEXT NOT NULL,
    generator_version INTEGER NOT NULL,
    creation_source_key TEXT NOT NULL
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS market_budgets (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    club_id TEXT NOT NULL,
    transfer_budget INTEGER NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, club_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS transfer_history (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    occurred_on INTEGER NOT NULL,
    buying_club_id TEXT NOT NULL,
    selling_club_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    transfer_fee INTEGER NOT NULL,
    PRIMARY KEY (save_id, sequence_number),
    FOREIGN KEY (save_id, buying_club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, selling_club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS youth_club_rosters (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    club_id TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, club_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS youth_state (
    save_id TEXT PRIMARY KEY REFERENCES career_saves(save_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS youth_roster_players (
    save_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    PRIMARY KEY (save_id, club_id, sort_order),
    UNIQUE (save_id, player_id),
    FOREIGN KEY (save_id, club_id) REFERENCES youth_club_rosters(save_id, club_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS youth_lifecycle (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    status TEXT NOT NULL,
    academy_entry_season_id TEXT NOT NULL,
    academy_entry_date INTEGER NOT NULL,
    status_changed_at INTEGER,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS season_history (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    season_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    champion_club_id TEXT NOT NULL,
    fixture_count INTEGER NOT NULL,
    total_goals INTEGER NOT NULL,
    selected_position INTEGER NOT NULL,
    selected_club_id TEXT NOT NULL,
    selected_played INTEGER NOT NULL,
    selected_wins INTEGER NOT NULL,
    selected_draws INTEGER NOT NULL,
    selected_losses INTEGER NOT NULL,
    selected_goals_for INTEGER NOT NULL,
    selected_goals_against INTEGER NOT NULL,
    selected_goal_difference INTEGER NOT NULL,
    selected_points INTEGER NOT NULL,
    PRIMARY KEY (save_id, sequence_number),
    FOREIGN KEY (save_id, champion_club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, selected_club_id) REFERENCES clubs(save_id, club_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS season_table_rows (
    save_id TEXT NOT NULL,
    history_sequence_number INTEGER NOT NULL,
    sort_order INTEGER NOT NULL,
    position INTEGER NOT NULL,
    club_id TEXT NOT NULL,
    played INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    draws INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    goals_for INTEGER NOT NULL,
    goals_against INTEGER NOT NULL,
    goal_difference INTEGER NOT NULL,
    points INTEGER NOT NULL,
    PRIMARY KEY (save_id, history_sequence_number, sort_order),
    FOREIGN KEY (save_id, history_sequence_number) REFERENCES season_history(save_id, sequence_number) ON DELETE CASCADE,
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS match_preparation (
    save_id TEXT PRIMARY KEY REFERENCES career_saves(save_id) ON DELETE CASCADE,
    selected_club_id TEXT NOT NULL,
    target_fixture_id TEXT,
    updated_at INTEGER NOT NULL,
    has_lineup INTEGER NOT NULL CHECK (has_lineup IN (0, 1)),
    has_tactic INTEGER NOT NULL CHECK (has_tactic IN (0, 1)),
    tactic_mentality TEXT,
    tactic_pressing REAL,
    tactic_directness REAL,
    tactic_width REAL,
    tactic_risk REAL,
    FOREIGN KEY (save_id, selected_club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, target_fixture_id) REFERENCES fixtures(save_id, fixture_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS match_preparation_lineup (
    save_id TEXT NOT NULL REFERENCES match_preparation(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    club_id TEXT NOT NULL,
    slot_key TEXT NOT NULL,
    player_id TEXT NOT NULL,
    role_key TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, slot_key),
    UNIQUE (save_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS match_reports (
    save_id TEXT NOT NULL,
    fixture_id TEXT NOT NULL,
    event_schema_version INTEGER NOT NULL,
    final_minute INTEGER NOT NULL,
    score_home INTEGER NOT NULL,
    score_away INTEGER NOT NULL,
    home_opportunities INTEGER NOT NULL,
    home_shots INTEGER NOT NULL,
    home_shots_on_target INTEGER NOT NULL,
    home_goals INTEGER NOT NULL,
    away_opportunities INTEGER NOT NULL,
    away_shots INTEGER NOT NULL,
    away_shots_on_target INTEGER NOT NULL,
    away_goals INTEGER NOT NULL,
    PRIMARY KEY (save_id, fixture_id),
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS match_events (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    owner_kind TEXT NOT NULL CHECK (owner_kind = 'report'),
    owner_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    event_minute INTEGER NOT NULL,
    side TEXT,
    quality REAL,
    is_shot_on_target INTEGER,
    shot_type TEXT,
    chance_type TEXT,
    scorer_player_id TEXT,
    assist_player_id TEXT,
    creator_player_id TEXT,
    shooter_player_id TEXT,
    goalkeeper_player_id TEXT,
    primary_defender_player_id TEXT,
    score_home INTEGER,
    score_away INTEGER,
    PRIMARY KEY (save_id, owner_kind, owner_id, sort_order)
  ) STRICT`,
] as const;

/** Version-4 relational fields for complete tactical match preparation. */
export const SQLITE_CAREER_SCHEMA_V4_STATEMENTS = [
  `ALTER TABLE match_preparation ADD COLUMN base_formation_id TEXT`,
  `CREATE TABLE IF NOT EXISTS match_preparation_board_slots (
    save_id TEXT NOT NULL REFERENCES match_preparation(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    slot_key TEXT NOT NULL,
    nx REAL NOT NULL CHECK (nx >= 0 AND nx <= 1),
    ny REAL NOT NULL CHECK (ny >= 0 AND ny <= 1),
    role_key TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, slot_key)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS match_preparation_bench (
    save_id TEXT NOT NULL REFERENCES match_preparation(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    slot_key TEXT NOT NULL,
    player_id TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, slot_key),
    UNIQUE (save_id, player_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id)
  ) STRICT`,
] as const;

/** Bootstrap alias retained for opening databases that have no migration table. */
export const SQLITE_CAREER_SCHEMA_STATEMENTS = SQLITE_CAREER_SCHEMA_V1_STATEMENTS;
