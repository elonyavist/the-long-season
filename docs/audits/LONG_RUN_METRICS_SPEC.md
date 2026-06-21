# Long-Run Metrics Spec

Date: 2026-06-21
Phase: `26-project-cleanup-and-long-run-readiness`
Step: `05-long-run-metrics-definition`
Status: Complete

## Purpose

This spec defines what a 5-10 season report must measure before the project decides that the engine is ready for UI exploration. The goal is not to prove the game is finished. The goal is to expose whether the long-running football world feels credible, varied, and manager-driven.

## Mandatory Phase 30 Metrics

These metrics must be present in the first ten-season report.

### Season Results

- champion by season;
- selected club position, points, wins, draws, losses, goals for, goals against, and goal difference by season;
- average goals per match by season and across all seasons;
- home win, draw, and away win rates by season and across all seasons;
- first-place points, last-place points, and table points spread by season;
- repeated champion count;
- runaway dominance warnings when one club wins too often or by too much.

### Player Development

- top current-ability improvers across the run;
- top current-ability decliners across the run;
- count of serious prospects and prodigies at start and after each season;
- count of lower-division players who become credible higher-division players;
- count of lower-division white-fly players who stay relevant after multiple seasons;
- distribution of player quality bands by age group and season.

### Aging And Decline

- average squad age by season;
- age distribution buckets: under 18, 18-21, 22-25, 26-29, 30-33, 34+;
- veteran decline count;
- old-player exception count where a veteran remains useful despite decline;
- retirement-ready candidates if the data exists, otherwise report as unavailable.

### Club And Squad Stability

- squad size by club and season;
- selected club roster turnover by season;
- league-wide roster turnover if market data exists, otherwise report as unavailable;
- repeated top-four clubs;
- clubs that collapse or overperform suspiciously;
- player-name and club-name readability warnings.

### Market Turnover

- completed permanent transfers by season;
- total transfer value by season;
- selected club budget before/after season when available;
- rejected transfer count and reason categories if available;
- unavailable marker for AI market activity until that system exists.

### Anomaly Detection

The report must classify anomalies as `PASS`, `WARN`, or `FAIL`.

- `overpowered_lower_division_player`: too many lower-division players with top-tier current quality.
- `frozen_world`: squads, standings, or player qualities barely change across seasons after development/market work exists.
- `runaway_champion`: one club dominates beyond plausible bounds.
- `weak_prospect_pipeline`: too few young players become useful.
- `too_many_top_prospects`: too many lower-division prospects become first-division-level stars.
- `implausible_role_attributes`: players show high off-role attributes beyond role-template caps.
- `market_inactive`: market turnover is missing or too low after market simulation exists.
- `missing_system`: a metric cannot be judged because the supporting system is intentionally not implemented yet.

### Manual Inspection Outputs

The report must include readable samples, not only aggregate numbers:

- final table for first and last simulated season;
- selected club season-by-season summary;
- top 10 players by growth;
- top 10 players by decline;
- top 10 scorers in the final season;
- notable prospects and white-fly players;
- anomaly summary with reason text.

## Initial Phase 30 Scoring

The first ten-season report should end with one of these outcomes:

- `Ready for UI exploration`: long-run behavior is credible enough to start a thin UI.
- `Needs tuning`: systems exist but calibration/player generation/development need adjustment.
- `Needs missing systems`: the report cannot answer core playability questions yet.
- `Blocked`: deterministic execution or persistence is unreliable.

## Metrics That Can Wait

These are useful later, but they must not block the first ten-season report:

- promotion and relegation movement;
- multi-division player movement;
- cups and continental fixtures;
- contracts, wages, and salary budgets;
- staff quality and coaching impact;
- youth intake;
- scouting fog and hidden exact potential;
- player happiness and morale narrative;
- injuries and suspensions;
- detailed finances beyond transfer budget.

## Product Rules For Interpretation

- A lower-division save should occasionally contain a special player, but not many current stars.
- Interesting young players should be common enough to create hope, but most should become second-division quality, first-division reserves, or fail to reach their ceiling.
- The manager should infer squad needs from roles, formation fit, condition, and results. The report may use internal warnings, but normal user-facing output should not tell the manager what to buy.
- CLI reports are lab tools. They should expose enough to tune the engine without becoming the product UI.

## Conclusion

Phase 30 should measure the football world as a long-running system: results, player evolution, squad change, market movement, and anomalies. If these metrics are missing, UI work would only hide engine uncertainty instead of reducing it.
