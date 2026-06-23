# Long-Run Manual Inspection Guide

Date: 2026-06-23
Phase: `46-ten-season-report-decomposition-and-long-run-presentation-boundaries`
Step: `05-long-run-manual-inspection-command-review`

## Purpose

Use this guide when reviewing whether The Long Season remains fun, credible,
and structurally stable across repeated career simulations.

The long-run report is not only a math gate. It should answer product questions:

- does the world survive many seasons?
- do squads stay playable?
- do young players, veterans, transfers, and academy intakes create believable
  turnover?
- do tables and production leaders create football stories instead of obvious
  calculation bugs?

## Quick Smoke Inspection

Use this when checking a recent source change:

```bash
pnpm cli ten-season-report --seed-prefix=manual-smoke --worlds=10 --seasons=10
```

Review:

- `Status` should be `PASS`;
- `Failed worlds` should be `0`;
- structural rows such as minimum squad size, goalkeeper coverage, and youth
  roster bounds should not fail;
- warning rows can exist, but their signal mix should make sense.

This command is fast enough for daily development, but it is too small to prove
that the game is stable.

## Medium Sample Inspection

Use this before closing a phase that touches career, squad, player, market,
youth, match, or long-run reporting behavior:

```bash
pnpm cli ten-season-report --seed-prefix=manual-medium --worlds=50 --seasons=10
```

Review:

- `Failed worlds`: should remain `0`;
- `Warning worlds`: acceptable only if warning families are explainable;
- `Signal check counts`: use the legend:
  - `story` means football variance worth reviewing, not automatic failure;
  - `monitor` means trend to watch over larger samples;
  - `structural` means gameplay stability risk.

This is the default manual review size for normal implementation work.

## Deeper Gate-Style Inspection

Use this when a phase changes long-run structure or when medium samples show
recurring warning patterns:

```bash
pnpm cli ten-season-report --seed-prefix=manual-deep --worlds=250 --seasons=30 --report-output=docs/audits/MANUAL_LONG_RUN_REVIEW.md
```

Review the terminal summary first, then open the Markdown artifact:

```bash
open docs/audits/MANUAL_LONG_RUN_REVIEW.md
```

The 250x30 run is more meaningful for career stability because it gives enough
time for aging, academy refresh, transfers, player development, squad repair,
and table variety to interact.

The historical operational target remains larger than routine local checks. Use
10,000 worlds by 50 seasons only as an explicit operational soak gate when
runtime and purpose justify it.

## What To Review

### World Survival

Look at:

- `Status`;
- `Failed worlds`;
- `Failing check counts`;
- `Worst worlds`.

Fun interpretation:

- a career world must not collapse silently;
- fail rows usually mean the user would eventually hit an obviously broken save
  or unrealistic league.

### Squad-Size Stability

Look at:

- `Minimum squad size observed`;
- `Clubs below minimum squad size`;
- `Active players min/max`;
- `min_squad` in worst-world rows.

Fun interpretation:

- every club must remain able to field credible teams;
- senior population should not inflate so much that the world feels artificial;
- senior population should not shrink until clubs are unusable.

### Goalkeeper And Role Coverage

Look at:

- `Clubs without natural goalkeeper`;
- `Role coverage warnings`;
- `role_coverage_warning_count` if present in warning keys.

Fun interpretation:

- a club without a goalkeeper is a structural problem;
- role-depth warnings are less severe but can show that transfers/youth/squad
  repair are not producing believable squads.

### Youth Pipeline Pressure

Look at:

- `Youth roster max observed`;
- `Clubs above youth target`;
- `Clubs below youth minimum`;
- youth active-player min/max.

Fun interpretation:

- academies should replenish the world without flooding it;
- every club should keep enough youth players to support future renewals;
- youth overflow is a sign that promotion, market, or release rules need review.

### Table Spread And Champion Variety

Look at:

- `Table spread avg/min`;
- `Champion streak max`;
- `table_spread=...` in worst-world rows;
- `champion_pts`, `last_pts`, and `ability_spread`.

Fun interpretation:

- a dynasty can be a good football story;
- a tight table can also be fun;
- repeated low spread plus low ability separation may mean the league lacks
  identity;
- repeated huge spread may mean weak clubs cannot recover.

Do not tune only to move numbers. Ask whether the league produced an interesting
career narrative.

### Scoring And Assist Concentration

Look at:

- `Goals per match avg/p95`;
- `Top assist p95`;
- `Production warning max`;
- creator snapshot fields in worst worlds.

Fun interpretation:

- one outstanding assister can be memorable;
- one creator owning too much of a club's goal production may make the engine
  feel narrow;
- scoring drift affects matchday fun and table credibility.

### Transfer Turnover

Look at:

- `transfer_turnover_available`;
- `squad_turnover_available`;
- `turnover` values in dynasty snapshots.

Fun interpretation:

- long careers need movement;
- squads should not remain frozen for decades;
- transfers should support renewal without making every squad churn randomly.

### Player Growth And Aging

Look at:

- `Age 30+ share p95`;
- player evolution sections in single-world reports;
- useful players after long run;
- top improvers and decliners.

Fun interpretation:

- lower-division prospects should create discovery stories;
- too many players becoming useful at high level would flatten progression;
- veterans should decline enough to force renewal but not vanish unrealistically.

## Single-World Follow-Up

When a batch world looks suspicious, inspect that world directly:

```bash
pnpm cli ten-season-report --seed=manual-medium-world-00017 --seasons=10
```

Replace the seed with the exact world seed from the batch output. Use this to
read season-by-season summaries, player evolution, club stability, youth
stability, and anomaly checks in one world.

## Source Change Decision

No source change is required by this step.

The existing command already supports quick, medium, deeper, and saved Markdown
inspection paths. Phase 46 Step 04 added the missing signal guide, so manual
inspection is now clear enough without adding new flags.
