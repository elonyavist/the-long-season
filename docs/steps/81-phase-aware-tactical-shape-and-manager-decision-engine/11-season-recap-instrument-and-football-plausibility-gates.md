# Step 11 - Season Recap Instrument And Football Plausibility Gates

## Status

Not started.

## Goal

Turn the facts a simulated season already produces into four football charts a
person can read, and give each of them a band declared in advance that it can
fail.

## User-Facing Reason

Everything Phase 81 built changes *who does what* on the pitch. Almost none of
it is visible in an aggregate rate: `goals_per_match_avg` reads `2.78` whether
strikers or centre backs scored those goals. A league table, a scorer chart and
an assist chart show a manager immediately whether the football is real.

## Design Contract

`docs/audits/PHASE_81_SEASON_RECAP_DESIGN.md`. It states the four charts, every
band, the football reason for each band, and what the instrument cannot see.
Read it first; this step implements it and does not re-decide it.

## What Already Exists

Nothing here simulates anything new, and the step must not add simulation.

- `SimulateSeasonResult.table` - the league table.
- `SimulateSeasonResult.playerSummaryStats` - per-player goals, assists, saves.
- `Player.primaryRole` - the role, joined by `playerId`.
- `runCareerLongRunSimulation(...)` - deterministic season sequencing.
- `apps/cli/src/commands/ten-season-report/report-data.ts` already retains
  `table` and `playerSummaryStats` per season and aggregates them away.

The work is a projection plus gates. If this step finds itself computing a
match, a table or a goal, it has gone wrong.

## What To Implement

- A `season-recap` Module in `packages/simulation-tools/src/` that builds one
  season's recap from an existing `SimulateSeasonResult` plus player and club
  lookups. Framework-free, deterministic, no content and no CLI imports.
- The four charts from the design contract: table, top scorers with role, top
  assists with role, shapes fielded with the mean points of the clubs using
  each.
- Bands as typed, named, frozen values in one place, expressed as **rates per
  match played** so a different club count does not silently move them. The
  absolute is carried beside the rate for display.
- A gate evaluation returning, per check, the observed value, the band and a
  `pass | fail` - never a bare boolean, because the report has to show the
  number that failed.
- Deterministic ordering everywhere: scorers by goals then assists then player
  id; table already ordered; formations in the canonical catalog order.
- Ties broken explicitly. A chart that reorders between two identical runs makes
  the whole instrument untrustworthy.

## Reachability, Before The Step Closes

`AGENTS.md` requires it and this step is exactly the case the rule was written
for: eight numeric bands and four role bands, every one of which must be
provably crossable.

- For each band, a test that constructs a season which fails it. A band no
  season can violate is not a gate and must be deleted or corrected.
- The role bands are the ones to watch. `goalkeepers in the top ten scorers = 0`
  passes trivially today; the test must prove the check would catch a
  goalkeeper if one appeared, not that none did.

## Clean-Code Requirements

- One owner for each band. The CLI renders them and never restates one.
- Roles come from the canonical `Player.primaryRole`; no second role taxonomy
  and no string mapping local to this Module.
- Total mappings with an exhaustiveness guard over any domain union touched.
- The Module is the test surface. The CLI is rendering only.

## What NOT To Implement

- No new simulation, no new season logic, no change to any calibration.
- No long run. This step proves the instrument on a small deterministic fixture;
  Step 12 runs it at scale.
- No band chosen after looking at output. The design contract fixes them first.
- No tuning of anything to make a band pass.
- No web surface. This is a diagnostic instrument, not a screen.

## Expected Files

- `packages/simulation-tools/src/season-recap/season-recap.ts`
- `packages/simulation-tools/src/season-recap/season-recap.test.ts`
- `packages/simulation-tools/src/season-recap/season-recap-gates.ts`
- `packages/simulation-tools/src/season-recap/season-recap-gates.test.ts`
- `packages/simulation-tools/src/index.ts`
- `docs/audits/PHASE_81_SEASON_RECAP_DESIGN.md`
- `docs/PROJECT_STATUS.md`
- this phase README
- this step document
- the next relevant step document only if a lesson changes future work

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/simulation-tools/src/season-recap/
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

- Four charts build deterministically from an existing season result.
- Every band is frozen, named, owned once, and proven crossable by a test.
- Role bands read the canonical player role and nothing else.
- No simulation, calibration or gameplay behaviour changed.
- Step 12 is the only next action.
