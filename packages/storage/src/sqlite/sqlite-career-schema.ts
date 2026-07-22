/** Current relational browser-career schema version. */
export const SQLITE_CAREER_SCHEMA_VERSION = 12;

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
    continue_policy TEXT NOT NULL CHECK (continue_policy IN ('never', 'until_acknowledged', 'until_resolved')),
    is_read INTEGER NOT NULL CHECK (is_read IN (0, 1)),
    is_acknowledged INTEGER NOT NULL CHECK (is_acknowledged IN (0, 1)),
    is_resolved INTEGER NOT NULL CHECK (is_resolved IN (0, 1)),
    fixture_id TEXT,
    club_id TEXT,
    player_id TEXT,
    contract_id TEXT,
    contract_negotiation_id TEXT,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, message_id),
    FOREIGN KEY (save_id, fixture_id) REFERENCES fixtures(save_id, fixture_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id),
    FOREIGN KEY (save_id, contract_id) REFERENCES player_contracts(save_id, contract_id),
    FOREIGN KEY (save_id, contract_negotiation_id)
      REFERENCES contract_negotiations(save_id, negotiation_id)
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

/** Phase-78 senior-squad contracts and club-finance baseline. */
export const SQLITE_CAREER_SCHEMA_V10_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS senior_squad_registrations (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    registration_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    shirt_number INTEGER NOT NULL CHECK (shirt_number BETWEEN 1 AND 99),
    registered_on INTEGER NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, registration_id),
    UNIQUE (save_id, player_id),
    UNIQUE (save_id, club_id, shirt_number),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_contracts (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    contract_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    contract_type TEXT NOT NULL CHECK (contract_type IN ('professional', 'youth')),
    starts_on INTEGER NOT NULL,
    ends_on INTEGER NOT NULL CHECK (ends_on > starts_on),
    annual_wage INTEGER NOT NULL CHECK (annual_wage >= 0),
    squad_status TEXT NOT NULL CHECK (squad_status IN ('key_player', 'regular_starter', 'squad_player', 'fringe_player', 'prospect')),
    signing_bonus INTEGER NOT NULL CHECK (signing_bonus >= 0),
    appearance_bonus INTEGER NOT NULL CHECK (appearance_bonus >= 0),
    goal_bonus INTEGER CHECK (goal_bonus IS NULL OR goal_bonus >= 0),
    clean_sheet_bonus INTEGER CHECK (clean_sheet_bonus IS NULL OR clean_sheet_bonus >= 0),
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, contract_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS active_player_contracts (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    contract_id TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, contract_id),
    FOREIGN KEY (save_id, contract_id) REFERENCES player_contracts(save_id, contract_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS player_contract_history (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    history_entry_id TEXT NOT NULL,
    sequence_number INTEGER NOT NULL CHECK (sequence_number > 0),
    occurred_on INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
      'signed', 'renewed', 'transfer_terminated', 'expired', 'released'
    )),
    contract_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, history_entry_id),
    UNIQUE (save_id, sequence_number),
    FOREIGN KEY (save_id, contract_id) REFERENCES player_contracts(save_id, contract_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id) ON DELETE CASCADE,
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS club_finance_accounts (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    club_id TEXT NOT NULL,
    currency TEXT NOT NULL CHECK (currency = 'EUR'),
    cash_balance INTEGER NOT NULL CHECK (cash_balance >= 0),
    annual_transfer_budget INTEGER NOT NULL CHECK (annual_transfer_budget >= 0),
    available_transfer_budget INTEGER NOT NULL CHECK (available_transfer_budget >= 0),
    annual_wage_budget INTEGER NOT NULL CHECK (annual_wage_budget >= 0),
    committed_annual_wages INTEGER NOT NULL CHECK (committed_annual_wages >= 0),
    season_income INTEGER NOT NULL CHECK (season_income >= 0),
    season_expenses INTEGER NOT NULL CHECK (season_expenses >= 0),
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, club_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS club_finance_ledger (
    save_id TEXT NOT NULL REFERENCES career_saves(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    ledger_entry_id TEXT NOT NULL,
    sequence_number INTEGER NOT NULL CHECK (sequence_number > 0),
    club_id TEXT NOT NULL,
    occurred_on INTEGER NOT NULL,
    currency TEXT NOT NULL CHECK (currency = 'EUR'),
    reason TEXT NOT NULL CHECK (reason IN (
      'opening_capital', 'season_distribution', 'transfer_fee_paid', 'transfer_fee_received',
      'contract_signing_bonus', 'annual_base_wage', 'appearance_bonus', 'goal_bonus',
      'clean_sheet_bonus'
    )),
    direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reference_id TEXT NOT NULL CHECK (length(reference_id) > 0),
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, ledger_entry_id),
    UNIQUE (save_id, sequence_number),
    FOREIGN KEY (save_id, club_id) REFERENCES club_finance_accounts(save_id, club_id) ON DELETE CASCADE
  ) STRICT`,
] as const;

/** Phase-78 durable contract negotiation and explicit Posta policy baseline. */
export const SQLITE_CAREER_SCHEMA_V11_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS contract_negotiation_states (
    save_id TEXT PRIMARY KEY REFERENCES career_saves(save_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS contract_negotiations (
    save_id TEXT NOT NULL REFERENCES contract_negotiation_states(save_id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    negotiation_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    club_id TEXT NOT NULL,
    current_contract_id TEXT NOT NULL,
    created_on INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
      'draft', 'awaiting_response', 'countered', 'accepted', 'rejected',
      'withdrawn', 'expired', 'release_at_expiry'
    )),
    draft_created_on INTEGER,
    submitted_on INTEGER,
    response_due_on INTEGER,
    counter_issued_on INTEGER,
    counter_expires_on INTEGER,
    accepted_on INTEGER,
    accepted_source TEXT CHECK (accepted_source IS NULL OR accepted_source IN ('submitted_offer', 'counter_offer')),
    activated_contract_id TEXT,
    rejected_on INTEGER,
    rejected_by TEXT CHECK (rejected_by IS NULL OR rejected_by IN ('player', 'club')),
    withdrawn_on INTEGER,
    expired_on INTEGER,
    expiry_reason TEXT CHECK (expiry_reason IS NULL OR expiry_reason IN ('counter_offer_expired', 'current_contract_expired')),
    decided_on INTEGER,
    PRIMARY KEY (save_id, sort_order),
    UNIQUE (save_id, negotiation_id),
    FOREIGN KEY (save_id, player_id) REFERENCES players(save_id, player_id),
    FOREIGN KEY (save_id, club_id) REFERENCES clubs(save_id, club_id),
    FOREIGN KEY (save_id, current_contract_id) REFERENCES player_contracts(save_id, contract_id),
    FOREIGN KEY (save_id, activated_contract_id) REFERENCES player_contracts(save_id, contract_id)
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS contract_negotiation_terms (
    save_id TEXT NOT NULL,
    negotiation_id TEXT NOT NULL,
    terms_kind TEXT NOT NULL CHECK (terms_kind IN (
      'draft', 'submitted', 'counter', 'accepted', 'demand_preferred', 'demand_minimum'
    )),
    duration_years INTEGER NOT NULL CHECK (duration_years BETWEEN 1 AND 5),
    annual_wage INTEGER NOT NULL CHECK (annual_wage >= 0),
    squad_status TEXT NOT NULL CHECK (squad_status IN ('key_player', 'regular_starter', 'squad_player', 'fringe_player', 'prospect')),
    signing_bonus INTEGER NOT NULL CHECK (signing_bonus >= 0),
    appearance_bonus INTEGER NOT NULL CHECK (appearance_bonus >= 0),
    goal_bonus INTEGER CHECK (goal_bonus IS NULL OR goal_bonus >= 0),
    clean_sheet_bonus INTEGER CHECK (clean_sheet_bonus IS NULL OR clean_sheet_bonus >= 0),
    PRIMARY KEY (save_id, negotiation_id, terms_kind),
    FOREIGN KEY (save_id, negotiation_id)
      REFERENCES contract_negotiations(save_id, negotiation_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS contract_negotiation_evaluations (
    save_id TEXT NOT NULL,
    negotiation_id TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('accepted', 'countered', 'rejected')),
    score_basis_points INTEGER NOT NULL,
    evaluated_on INTEGER NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0),
    current_ability REAL NOT NULL,
    reachable_potential REAL NOT NULL,
    role TEXT NOT NULL,
    expected_squad_status TEXT NOT NULL CHECK (expected_squad_status IN ('key_player', 'regular_starter', 'squad_player', 'fringe_player', 'prospect')),
    current_annual_wage INTEGER NOT NULL CHECK (current_annual_wage >= 0),
    remaining_contract_days INTEGER NOT NULL,
    club_reputation REAL NOT NULL,
    club_category TEXT NOT NULL,
    free_agent_leverage_basis_points INTEGER NOT NULL,
    PRIMARY KEY (save_id, negotiation_id),
    FOREIGN KEY (save_id, negotiation_id)
      REFERENCES contract_negotiations(save_id, negotiation_id) ON DELETE CASCADE
  ) STRICT`,
  `CREATE TABLE IF NOT EXISTS contract_negotiation_evaluation_reasons (
    save_id TEXT NOT NULL,
    negotiation_id TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    reason TEXT NOT NULL,
    PRIMARY KEY (save_id, negotiation_id, sort_order),
    FOREIGN KEY (save_id, negotiation_id)
      REFERENCES contract_negotiation_evaluations(save_id, negotiation_id) ON DELETE CASCADE
  ) STRICT`,
] as const;

/** Bootstrap alias retained for opening databases that have no migration table. */
export const SQLITE_CAREER_SCHEMA_STATEMENTS = SQLITE_CAREER_SCHEMA_V1_STATEMENTS;
