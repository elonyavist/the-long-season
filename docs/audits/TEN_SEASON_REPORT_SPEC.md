# Ten-Season Report Spec

Date: 2026-06-22
Phase: `30-ten-season-simulation-report`
Step: `01-ten-season-report-spec.md`
Status: Complete

## Purpose

The ten-season report is a lab report, not a product UI. It must decide whether the current deterministic engine can create a believable multi-season career before the project moves toward visual UI work.

The report must expose suspicious outcomes instead of smoothing them over. If the world looks weak, repetitive, overpowered, or under-instrumented, the final phase report should recommend tuning or another simulation-focused phase.

## Standard Run Shape

- Default season count: `10`.
- Minimum comparison seeds: `world-a` and `world-b`.
- Optional stress seeds: `world-c`, `world-d`, `world-e`.
- Output should stay readable in a terminal and in a copied audit document.
- The report must be deterministic for the same seed and season count.

## Required Report Sections

### 1. Run Header

- report title;
- seed;
- world seed;
- season count;
- generated-world version;
- competition name;
- selected club;
- current closed-league limitation statement.

### 2. Season Results

For each simulated season:

- champion;
- champion points;
- selected-club position;
- selected-club points;
- selected-club wins, draws, losses;
- selected-club goals for, goals against, goal difference;
- league goals per match;
- first-place points;
- last-place points;
- table points spread.

The report must also provide run-level averages for goals per match, first-place points, last-place points, and table spread.

### 3. Scoring Production

For each simulated season:

- top scorer name, club, and goals;
- top assist player name, club, and assists;
- top goalkeeper saves name, club, and saves;
- players with at least `5`, `8`, `10`, and `12` assists;
- top assist player share of his club's goals;
- top three assist players' combined share of their clubs' goals when enough data exists.

Run-level scoring-production metrics:

- average top scorer goals;
- maximum top scorer goals;
- average top assist count;
- maximum top assist count;
- number of seasons with top assist `15+`;
- number of seasons with top assist `16+`;
- number of seasons with top assist `19+`;
- average top-assist share of team goals.

Initial review thresholds:

- top assist `8..12`: normal;
- top assist `13..15`: high but acceptable;
- top assist `16..18`: warning if frequent;
- top assist `19+`: likely anomaly;
- repeated `15+` top-assist seasons across many seeds should trigger review;
- top assist share over `0.30` is a warning;
- top assist share over `0.40` is a likely anomaly.

### 4. Player Evolution

Across the run:

- current-ability distribution by season;
- age distribution by season;
- top improvers;
- biggest decliners;
- serious prospects and prodigies at start and end;
- lower-division players who remain useful after multiple seasons;
- stalled prospects if detectable;
- declining veterans if detectable.

The report must not expose exact hidden potential as user-facing truth. It can classify internal quality bands for lab analysis.

### 5. Club And Squad Stability

Across the run:

- champion list;
- repeated champion count;
- repeated top-four club count if available;
- selected-club finish trend;
- squad size by season;
- average squad age by season;
- selected-club roster turnover if available;
- league-wide roster turnover if available.

If market simulation does not yet generate AI transfers, the report must mark market turnover as unavailable and explain that the limitation is expected.

### 6. Market And Missing Systems

The report must explicitly list unavailable metrics instead of pretending they passed:

- AI market activity;
- contracts and wages;
- injuries and suspensions;
- youth intake;
- promotion/relegation;
- cups;
- multi-division movement.

Each unavailable metric should be labelled as `missing_system` unless it is intentionally out of scope for this phase.

### 7. Anomaly Summary

Every report must end with deterministic statuses:

- `PASS`: believable enough for the current closed-league lab scope;
- `WARN`: plausible but requires review or future tuning;
- `FAIL`: likely design or implementation problem before UI exploration.

Mandatory anomaly categories:

- `runaway_champion`;
- `low_or_high_scoring`;
- `table_spread_outlier`;
- `creator_concentration`;
- `top_assist_outlier`;
- `overpowered_lower_division_player`;
- `weak_prospect_pipeline`;
- `too_many_top_prospects`;
- `frozen_world`;
- `missing_market_depth`;
- `missing_system`.

## Final Decision Criteria

The final Phase 30 report must recommend exactly one next action:

- `Ready for UI exploration`;
- `Needs engine tuning`;
- `Needs player-generation/development tuning`;
- `Needs market/youth systems before UI`;
- `Needs another simulation-hardening phase`.

The recommendation must be based on observed report data, not on the existence of the next numbered phase.

