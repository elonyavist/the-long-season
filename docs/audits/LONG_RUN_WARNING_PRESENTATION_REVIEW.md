# Long-Run Warning Presentation Review

Date: 2026-06-23
Phase: `46-ten-season-report-decomposition-and-long-run-presentation-boundaries`
Step: `04-warning-semantics-presentation-cleanup`

## Purpose

Review long-run warning presentation as a player-fun and football-credibility
surface, not as a cosmetic gate cleanup.

The report must still show real concerns. This step only clarifies how to read
warning families so a designer or developer can decide whether a result is:

- a football story worth accepting;
- a trend to monitor over larger samples;
- a structural gameplay problem.

## Current Presentation

The long-run gate report already prints:

- `Warning check counts`;
- `Signal check counts`;
- `Failing check counts`;
- worst-world diagnostic snapshots.

The missing piece was an in-output explanation for the `Signal check counts`
families. Without a legend, `story`, `monitor`, and `structural` were useful to
the code but not obvious to a user reading the CLI report.

## Adopted Cleanup

Added one localized CLI legend:

`Signal guide: story=healthy football variance, monitor=watch trend, structural=gameplay risk`

This keeps the existing data and thresholds unchanged while making the warning
semantics explicit at the point of inspection.

## Warning Family Classification

| Check key | Presentation class | Product reading |
|---|---|---|
| `top_assist_max` | `story` | A high-assist season can be a believable standout player story unless concentration becomes extreme. |
| `champion_streak` | `story` | A short dynasty can be fun and memorable; it becomes a risk only if league variety collapses across longer runs. |
| `table_points_spread_avg` | `story` | Tight or wide tables can both be credible depending on context; review champion points, last-place points, and ability spread before tuning. |
| `top_creator_goal_share_max` | `monitor` | Watch whether one creator owns too much of a club's production. It is not automatically broken in a single world. |
| `top_three_creator_goal_share_max` | `monitor` | Watch whether team creativity is too concentrated among a small group. |
| `role_coverage_warning_count` | `monitor` | Role fit warnings can be expected while squad systems are still maturing, but spikes may show squad-refresh weakness. |
| `goals_per_match_avg` | `monitor` | A scoring drift matters because it affects match fun, but small deviations can be sample noise. |
| `age_30_plus_share` | `monitor` | Watch aging balance so careers do not become veteran-heavy or youth-only. |
| `useful_players_after_long_run` | `monitor` | Watch whether too many lower-division players become first-division useful after development. |
| `transfer_turnover_available` | `monitor` | Warns when the report lacks enough transfer movement to assess long-term squad renewal. |
| `squad_turnover_available` | `monitor` | Warns when squad movement is unavailable or absent, because long careers need renewal. |
| `senior_active_player_population` | `monitor` | Watch active senior population drift before it becomes a save-structure problem. |
| `youth_active_player_population` | `monitor` | Watch academy population drift before youth systems become too crowded or too empty. |
| `total_active_player_population` | `monitor` | Watch total active population so the world does not silently inflate or shrink. |
| `clubs_below_minimum_squad_size` | `structural` | A club below minimum senior squad size is a real career stability problem. |
| `goalkeeper_coverage` | `structural` | Clubs without natural goalkeeper coverage are not playable/credible. |
| `youth_roster_max_size` | `structural` | Academy roster overflow breaks the intended youth pipeline shape. |
| `clubs_above_youth_target` | `structural` | Clubs above academy target indicate uncontrolled youth population growth. |
| `youth_roster_min_size` | `structural` | Too-small academies break the intended intake and promotion loop. |
| `clubs_below_youth_minimum` | `structural` | Clubs below academy minimum cannot support the youth pipeline. |

## Threshold Concerns

No threshold was changed in this step.

Current warning examples such as table spread, champion streak, and creator
concentration are useful because they ask product questions:

- Is this a memorable world story?
- Is this a repeated trend across many worlds?
- Would this make the user's career less fun or less credible?

If a future sample proves that a warning class is consistently noisy, that
should be handled as a scoped diagnostic-semantics step, not by hiding warning
rows from this report.

## Result

The report remains honest and still surfaces every warning/fail key. The CLI now
gives enough context to read warning counts without knowing the implementation
details in `report-data.ts`.
