# Step 11 - Season Recap Instrument And Football Plausibility Gates

## Status

Done 2026-08-05. All required checks green.

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

## What Was Found

### The batch path does not choose shapes, and the design contract said it did

Reading the code before writing any produced the step's most valuable finding.
An earlier draft of the design contract sourced the fourth chart from *"the
formation each AI club selected (Step 09)"*. That is false for this path.

`simulateSeason(...)` takes `aiSelection.formation` as a caller input and holds
it still on purpose - its own comment calls itself *"the instrument that holds a
shape and a tactic still in order to measure one of them"*. Step 09 gave real
shape choice to `selectCareerAiTeam(...)`, which serves career play and the live
web session, and never touched this one.

`ten-season-report/report-data.ts:4086` then hands `FORMATION_CATALOG["4-4-2"]`
to **every club**, with identical `0.5 / 0.5 / 0.5 / 0.5` tactics. So every club
in every season of the long-run report plays the same shape with the same
instructions.

Three consequences, all recorded rather than worked around:

- The instrument takes `formationByClubId` as an explicit input and reports what
  it was told. It cannot discover a shape that was never chosen.
- `distinct_formations >= 5` **fails today, correctly**. A league where everybody
  plays `4-4-2` is the defect the band exists to catch.
- **Step 14's first prerequisite was marked met and is not.** Two of its five
  fixed-`4-4-2` sites closed with Step 09; the three report paths did not. Its
  document now carries the corrected table. Supplying varied shapes is real work
  for Step 12, not a projection.

### Two questions need two total mappings

`SEASON_RECAP_ROLE_GROUP` answers *who is supposed to score*; a first attempt
derived *who is supposed to assist* from it. That swept the striker into the
creator group, because wingers and attacking midfielders legitimately do both
and share his group. A test caught it.

They are now two `satisfies`-checked mappings over the same union.
`SEASON_RECAP_CREATOR_ROLE` excludes `goalkeeper`, `center_back` and `striker`,
and neither mapping is computed from the other.

### The impossible-values check earned its place immediately

It failed on the first run - against the *test fixture*, which was generating
descending goal totals that went negative past the eighth row. The check is
blunt by design and it caught a defect the football bands would have reported as
merely unusual.

### Reachability

Fourteen bands, fourteen seasons that violate them, per `AGENTS.md`. The one
that mattered most is `goalkeepers_in_top_scorers`: it reads `0` on every
healthy season, so the only way to know it works is to put a keeper in the chart
and watch it fail. A final test asserts the proven list equals the declared
check list, so a band added without a failing season fails there.

## Definition Of Done

- Four charts build deterministically from an existing season result.
- Every band is frozen, named, owned once, and proven crossable by a test.
- Role bands read the canonical player role and nothing else.
- No simulation, calibration or gameplay behaviour changed.
- Step 12 is the only next action.

### 2026-08-05 - docs/steps/81-.../11-season-recap-instrument-...md

- Status: Done
- Outcome: one season's facts now print as four football charts - table,
  scorers with role, assists with role, shapes fielded - with fourteen bands
  declared in advance and every one proven crossable.
- Adopted solution: `packages/simulation-tools/src/season-recap/`, two files.
  `season-recap.ts` projects an existing `SimulateSeasonResult` and computes no
  football; `season-recap-gates.ts` owns every band and returns the observed
  number beside each verdict. Two `satisfies` role mappings, not one.
- Verification: `pnpm exec vitest run packages/simulation-tools/src/season-recap/`
  `42/42`; `pnpm check` green; `git diff --check` clean; `graphify update .` run.
- Follow-up: **Step 12 must supply varied formations per club.** Until it does,
  `distinct_formations` fails and Step 14 has nothing to counter. That is the
  finding this step contributes, and it is not a defect in the instrument.
