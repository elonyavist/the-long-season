# Phase 81 - Hundred-Season Engine Inspection

## This Is Not Evidence

Amendment A10 permits exactly one inspection run before Step 15, on the condition that nothing cites it as measurement. No calibration value may be changed because of it, no band may be widened by it, and no later document may quote its numbers as balance evidence. Step 15's checkpointed cohort remains the only statistical population Phase 81 closes on. What follows is a *look*: a defect it makes visible is investigated, not measured.

## Population

- Seed prefix: `phase81-season-recap-20x5`
- Worlds asked for: `20`
- Worlds in these charts: `15`
- Seasons per world: `5`
- Seasons in these charts: `75`
- Clubs in the observed competition: `18`
- One generated country, one league, one calibration version.
- Full career path: market, development, intake and ageing all run.
- No human manager. Every club is selected by the AI policy.
- Each club fields one shape from the curated catalog, assigned from the world seed and its own identity, uncorrelated with squad strength.

## Worlds That Did Not Finish

`5` of `20` worlds stopped before the end and are **not** in the charts above. This is a selection effect, not a rounding detail: the worlds that stop are the ones whose rosters could not fill the shape this run assigned, so the surviving sample is biased toward squads with broader role cover. Read every number above with that in mind.

| World | Seed | Why it stopped |
|---|---|---|
| 1 | `phase81-season-recap-20x5-world-00001` | Invalid AI selection for fixture fixture:ita-3:2026%3Along-run-1%3Along-run-2%3Along-run-3:000006 and club club:ita-3-10: AI club club:ita-3-10 has no complete usable XI from 22 players |
| 3 | `phase81-season-recap-20x5-world-00003` | Invalid AI selection for fixture fixture:ita-3:2026%3Along-run-1%3Along-run-2%3Along-run-3:000002 and club club:ita-3-10: AI club club:ita-3-10 has no complete usable XI from 22 players |
| 4 | `phase81-season-recap-20x5-world-00004` | Invalid AI selection for fixture fixture:ita-3:2026%3Along-run-1%3Along-run-2%3Along-run-3:000006 and club club:ita-3-03: AI club club:ita-3-03 has no complete usable XI from 19 players |
| 12 | `phase81-season-recap-20x5-world-00012` | Invalid AI selection for fixture fixture:ita-3:2026%3Along-run-1%3Along-run-2%3Along-run-3:000004 and club club:ita-3-16: AI club club:ita-3-16 has no complete usable XI from 21 players |
| 16 | `phase81-season-recap-20x5-world-00016` | Invalid AI selection for fixture fixture:ita-2:2026%3Along-run-1%3Along-run-2%3Along-run-3%3Along-run-4:000005 and club club:ita-2-12: AI club club:ita-2-12 has no complete usable XI from 23 players |

## Bands

| Check | Band | Min | Mean | Max | Pass | Fail |
|---|---|---|---|---|---|---|
| `champion_points_per_match` | 1.95 - 2.65 | 1.7058823529411764 | 1.973 | 2.3529411764705883 | 34 | 41 |
| `bottom_points_per_match` | 0.35 - 0.8 | 0.4411764705882353 | 0.764 | 1.088235294117647 | 45 | 30 |
| `points_spread_per_match` | 1.25 - 2.05 | 0.6470588235294118 | 1.209 | 1.7352941176470589 | 26 | 49 |
| `top_scorer_goals_per_match` | 0.45 - 0.95 | 0.38235294117647056 | 0.542 | 0.7058823529411765 | 70 | 5 |
| `top_assists_per_match` | 0.2 - 0.5 | 0.20588235294117646 | 0.262 | 0.35294117647058826 | 75 | 0 |
| `goals_per_match` | 2.3 - 3.1 | 2.4248366013071894 | 2.69 | 2.9215686274509802 | 75 | 0 |
| `home_win_share` | 0.38 - 0.52 | 0.3562091503267974 | 0.399 | 0.46078431372549017 | 57 | 18 |
| `draw_share` | 0.18 - 0.32 | 0.20915032679738563 | 0.265 | 0.3202614379084967 | 74 | 1 |
| `finishers_in_top_scorers` | 0.6 - 1 | 0.5 | 0.927 | 1 | 74 | 1 |
| `goalkeepers_in_top_scorers` | 0 - 0 | 0 | 0 | 0 | 75 | 0 |
| `centre_backs_in_top_scorers` | 0 - 1 | 0 | 0.04 | 1 | 75 | 0 |
| `creators_in_top_assists` | 0.55 - 1 | 0.1 | 0.48 | 0.8 | 20 | 55 |
| `distinct_formations` | 5 - no maximum | 9 | 11.6 | 15 | 75 | 0 |
| `impossible_values` | 0 - 0 | 0 | 0 | 0 | 75 | 0 |

Failing bands: `champion_points_per_match`, `bottom_points_per_match`, `points_spread_per_match`, `top_scorer_goals_per_match`, `home_win_share`, `draw_share`, `finishers_in_top_scorers`, `creators_in_top_assists`. Each is a finding, recorded with an owner and not fixed here.

## Shapes Fielded

| Formation | Club-seasons | Mean points |
|---|---|---|
| `4-4-2` | 25 | 51.76 |
| `4-4-1-1` | 65 | 49.754 |
| `4-3-3` | 25 | 48.32 |
| `4-2-3-1` | 45 | 46.622 |
| `4-1-4-1` | 50 | 46.7 |
| `4-1-2-1-2` | 80 | 46.413 |
| `4-3-1-2` | 25 | 44.16 |
| `4-3-2-1` | 45 | 53.511 |
| `4-5-1` | 75 | 46.613 |
| `4-2-2-2` | 50 | 48.54 |
| `4-2-4` | 50 | 45.38 |
| `3-5-2` | 85 | 44.988 |
| `3-4-3` | 65 | 48.015 |
| `3-4-1-2` | 60 | 47.483 |
| `3-4-2-1` | 100 | 44.82 |
| `3-1-4-2` | 75 | 47.973 |
| `3-6-1` | 55 | 45.364 |
| `3-3-3-1` | 65 | 37.015 |
| `5-3-2` | 20 | 45.05 |
| `5-4-1` | 105 | 47.343 |
| `5-2-3` | 70 | 47.7 |
| `5-2-1-2` | 70 | 45.6 |
| `5-2-2-1` | 45 | 44.733 |

Distinct shapes fielded: `23`. Distinct champions: `47`.

## Roles: Population Beside Chart Presence

A role that never leads a chart has two possible explanations that look identical in the chart itself: the engine does not give it the ball, or the world does not generate it. This table separates them. `Players` is the senior population at every world's opening; the two right-hand columns are rows held in the scorer and assist charts above.

| Role | Players | Share | Scorer rows | Assist rows |
|---|---|---|---|---|
| `attacking_midfielder` | 0 | 0 | 1 | 12 |
| `center_back` | 4860 | 0.273 | 3 | 77 |
| `central_midfielder` | 2430 | 0.136 | 50 | 170 |
| `defensive_midfielder` | 0 | 0 | 0 | 3 |
| `full_back` | 1620 | 0.091 | 0 | 21 |
| `goalkeeper` | 1620 | 0.091 | 0 | 0 |
| `striker` | 4050 | 0.227 | 636 | 313 |
| `wide_midfielder` | 0 | 0 | 0 | 0 |
| `wing_back` | 1620 | 0.091 | 2 | 32 |
| `winger` | 1620 | 0.091 | 58 | 122 |

## Squad Quality By Season

Not a football chart and not gated. A compressed league table has two possible causes - a match engine that cannot separate unequal sides, and a world whose sides have stopped being unequal - and the charts alone cannot tell them apart. This table separates them.

| Season | Top club | Bottom club | Spread | Original players |
|---|---|---|---|---|
| 1 | 13.803 | 7.553 | 6.251 | 1 |
| 2 | 13.25 | 7.595 | 5.655 | 0.97 |
| 3 | 12.924 | 7.626 | 5.298 | 0.92 |
| 4 | 12.896 | 7.628 | 5.268 | 0.883 |
| 5 | 12.709 | 7.303 | 5.406 | 0.83 |
