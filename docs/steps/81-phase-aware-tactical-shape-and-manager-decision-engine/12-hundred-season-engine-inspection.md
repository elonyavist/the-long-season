# Step 12 - Hundred-Season Engine Inspection

## Status

Done 2026-08-05, under amendment A10. All required checks green. Seven findings
recorded with owners; nothing tuned, widened or excluded for its result.

## Goal

Run a hundred simulated seasons through the Step 11 instrument, read the four
charts, and answer one question with evidence a person can check by eye: does
the football Phase 81 built look like football?

## User-Facing Reason

Phase 81 rebuilt what happens on the pitch. Before it closes, somebody has to
look at a league table, a scorer chart and an assist chart and recognise the
sport. No invariant substitutes for that.

## Why This Needs An Amendment

`No cohort before Step 15` is a locked decision, and it is a good one: it stops
a smaller run being cited as balance evidence and then contradicting the real
cohort. This step does not weaken it.

**A10 permits one inspection run before Step 15, on the condition that its
output is never evidence.** No calibration value may be changed because of it,
no band may be widened by it, and no later document may cite its numbers as
balance measurement. Step 15 remains the only statistical cohort Phase 81 closes
on. What this run produces is a *look*, and a defect it makes visible is
investigated, not measured.

If that condition cannot hold, this step does not run and the charts wait for
Step 15.

## Scale, And Why This Size

`20` worlds by `5` seasons, one hundred seasons, seven workers.

**This replaces the `5 x 20` this document originally specified.** The reason
given for twenty seasons was that a dynasty and a collapse need time to appear.
That is a statement about *careers*, and careers are not what Phase 81 rebuilt.
Measuring it cost the wrong thing twice over.

A `1 x 20` probe of the existing report showed why. Club ability spread falls
from `6.04` to `2.92` across twenty seasons: by the end, every club is nearly
equal, and a league table cannot separate sides that are no longer unequal. Half
of a `5 x 20` sample would therefore measure a homogenised world and report it as
a match-engine result. Twenty worlds of five seasons gives twenty independent
squad generations instead of five, each read while its quality hierarchy is
still intact, and costs less.

The long-horizon question is not abandoned - it belongs to Step 15's `50 x 20`
cohort, which owns it and is powered for it.

Recorded as a rate wherever the generated league system's club count could
differ, per the design contract.

## Varying The Shapes Is This Step's Real Work

Step 11 read the code and found what the design contract had assumed away:
`simulateSeason(...)` takes the formation as a caller input and holds it still,
and `ten-season-report/report-data.ts:4086` hands `FORMATION_CATALOG["4-4-2"]`
to **every club**, with identical `0.5` tactics. Step 09's shape choice went to
the career path, not this one.

So a run that changes nothing produces one hundred seasons in which every club
plays `4-4-2`, and `distinct_formations` fails on all of them - correctly.

This step assigns a formation per club. Constraints:

- **Deterministic from the world seed.** The same seed gives the same club the
  same shape, or two runs of the frozen command disagree and the determinism
  claim below is worthless.
- **From the curated catalog only.** No invented shapes; `FORMATION_KEYS` is the
  population, and a club's assignment is a setup choice, not a new selector.
- **Not correlated with squad strength**, unless a later step decides otherwise
  and says so. If the good clubs all get one shape, the shape chart measures
  squad quality wearing a formation's name.
- Tactics may stay uniform. One variable at a time, and this step's variable is
  shape.

Whether AI clubs should *choose* their own shape on this path, as they do in
career play, is a real question and **not this step's to answer**: it changes
what the long-run report measures, and Step 15's cohort runs on the same path.
Record it for Step 14.

## What To Implement

- A per-club formation assignment under the constraints above, and the
  `formationByClubId` map the Step 11 instrument takes as input.
- A `season-recap-report` CLI command running the instrument over the long-run
  simulation. It reuses `runCareerLongRunSimulation(...)`; it does not
  reimplement sequencing, seeding or checkpointing.
- Per-season detail written one file per season, so a suspicious aggregate can
  be opened and read.
- One aggregate summary that a person actually reads: every band with its
  observed value, its declared range, and pass or fail.
- The report states its population in full: worlds asked for, worlds that
  finished, seasons, seed prefix, club count, one country, no human manager - and
  that it is not evidence. **The market is not excluded**: this runs the whole
  career path, transfers, development, intake and ageing included, which is the
  same path Step 15's cohort will run.
- Distinct champions, distinct formations fielded, and the mean points of the
  clubs using each shape, because Step 14 needs all three before it can reward
  a counter-move.
- Each canonical role's squad population beside the chart rows it holds, so an
  empty column can be read as an engine answer or a world answer rather than
  either. Built from the whole role union, so an absent role is a zero row and
  not a missing one.

## Reading The Result

- **Every band passing is not the goal.** The goal is knowing which ones do not
  and why. A run where everything passes on the first attempt deserves a check
  that the gates can fail at all - Step 11 proves that, and this step confirms
  it held.
- A failing band is a finding. Record it, name the likely owner, and hand it to
  the step that owns that behaviour. Do not fix it here and do not widen it.
- Anything within noise of a band edge is **unresolved**, not passing. Say so.

## The Squad-Quality Investigation

Added on explicit instruction, and it exceeds this step's `observes only` rule
in one direction only: **diagnosis, never tuning.** No calibration value is
changed here. Changing one would invalidate the carried Phase 79/80 baselines
this step has no mandate over, and would make the very run it sits inside
uninterpretable.

The probe above found club ability spread collapsing from `6.04` to `2.92` over
twenty seasons. That is a career-side behaviour - market, development, intake and
ageing - not a match-engine one, and it matters here because it is a rival
explanation for any compressed league table this inspection reports.

Every world therefore emits a per-season trace beside its charts: top club
ability, bottom club ability, their spread, and the share of senior players still
present from season one. The trace is not gated and is not a football chart. It
exists to separate two causes the charts cannot tell apart:

- a match engine that cannot turn unequal squads into unequal tables, which
  shows as compression **while the spread is still wide**;
- a world whose squads have stopped being unequal, which shows as compression
  that **tracks the spread down**.

`summarizeClubAbilityHierarchySnapshot(...)` is reused rather than restated, so
the trace and the report's own initial/final hierarchy cannot disagree.

Whatever the trace shows is recorded with a named owner and handed on. It is not
fixed here.

## What NOT To Implement

- No calibration, threshold, engine or content change of any kind. This step
  observes, and the squad-quality investigation above diagnoses without tuning.
- No band widened, no seed excepted, no season excluded, no warning suppressed.
- No claim that this run is balance evidence, market evidence, or a substitute
  for Step 15.
- No second run to get a nicer result.
- No manager-facing surface.

## Expected Files

- `packages/simulation-tools/src/season-recap/formation-assignment.ts`
- `packages/simulation-tools/src/season-recap/formation-assignment.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/season-recap-report.ts`
- `apps/cli/src/commands/season-recap-report.test.ts`
- `apps/cli/src/commands/season-recap-report/recap-world.ts`
- `apps/cli/src/commands/season-recap-report/recap-world.test.ts`
- `apps/cli/src/commands/season-recap-report/recap-report.ts`
- `apps/cli/src/commands/season-recap-report/recap-report.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/index.ts`
- `.gitignore`
- `docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md`
- `docs/PROJECT_STATUS.md`
- this phase README
- this step document
- the next relevant step document only if a lesson changes future work

Per-season detail is written under an ignored directory; only the aggregate
report is committed.

## Required Checks

```bash
nvm use 24
pnpm cli season-recap-report \
  --seed-prefix=phase81-season-recap-20x5 \
  --worlds=20 --seasons=5 --workers=7 \
  --report-output=docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md \
  --detail-output=simulation-out/phase81-season-recap
pnpm cli season-recap-report \
  --seed-prefix=phase81-season-recap-20x5 \
  --worlds=20 --seasons=5 --workers=7 \
  --report-output=docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md \
  --detail-output=simulation-out/phase81-season-recap
pnpm check
test -f docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md
git diff --check
graphify update .
```

The command runs twice: identical output from an identical command is the whole
determinism claim, and it costs one extra run to prove.

**The command exits non-zero when a band fails.** That is the finding, not a
broken command: a run where the football sits outside a declared band has to be
distinguishable from one where it does not, including by a pipeline. `pnpm check`
is the gate that must be green.

## What Was Found

`20 x 5`, seed prefix `phase81-season-recap-20x5`, `18` clubs, `34` matches each.
Numbers below are from `docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md`.
**None of them is evidence and none of them changed anything.**

### F1 - The league table is compressed, and squad convergence is not why

`points_spread_per_match` fails `49/75` seasons at a mean of `1.209` against a
band of `1.25 - 2.05`. `champion_points_per_match` fails `41/75`, mean `1.973`
against a floor of `1.95`; `bottom_points_per_match` fails `30/75` from above.
Champions do not run away and the bottom club is not punished.

The squad-quality trace answers the obvious rival explanation and kills it:

| Season | Ability spread | Table spread | Seasons failing |
|---|---|---|---|
| 1 | `6.251` | `1.218` | `12/15` |
| 2 | `5.655` | `1.227` | `9/15` |
| 3 | `5.298` | `1.133` | `11/15` |
| 4 | `5.268` | `1.261` | `10/15` |
| 5 | `5.406` | `1.204` | `7/15` |

Ability spread falls by `13%`; table spread does not move at all, and the worst
season for compression is **season one**, when the squads are furthest apart.
The engine is not failing to separate clubs *because they became equal* - it does
not separate them when they are maximally unequal either.

This also corrects a hypothesis this step started with. The `1 x 20` probe found
ability spread collapsing `6.04 -> 2.92` and it looked causal. It is not: it is a
real career-side behaviour on its own long timescale, and a red herring for this.

**Owner: Step 13**, which owns the integrated diagnostics and the A7 deadline.
Not tuned here.

**Caveat that must travel with F1.** The observed competitions are the generated
second and third divisions, and the bands were declared from top-flight football.
Lower divisions really are more compressed. So F1 has two candidate owners - an
engine that under-separates, or three bands calibrated against the wrong league -
and this run cannot choose between them. It may not be resolved by widening the
band, which is forbidden and would in any case answer the question by assuming it.

### F2 - The world generates seven of the ten canonical roles

Root cause, and the largest finding here.

| Role | Share of squads | Scorer rows | Assist rows |
|---|---|---|---|
| `center_back` | `27.3%` | `3` | `77` |
| `striker` | `22.7%` | `636` | `313` |
| `central_midfielder` | `13.6%` | `50` | `170` |
| `goalkeeper` | `9.1%` | `0` | `0` |
| `full_back` | `9.1%` | `0` | `21` |
| `winger` | `9.1%` | `58` | `122` |
| `wing_back` | `9.1%` | `2` | `32` |
| `attacking_midfielder` | **`0`** | `1` | `12` |
| `defensive_midfielder` | **`0`** | `0` | `3` |
| `wide_midfielder` | **`0`** | `0` | `0` |

The report builds this table from **every** canonical role rather than the roles
it observed, so an all-zero line appears instead of vanishing. A row built only
from what was seen would have deleted `wide_midfielder` entirely, and silence
would have read as a clean result.

`createFakeDomesticWorld(...)` never generates an attacking midfielder, a
defensive midfielder or a wide midfielder: all three are `0` at every world's
opening. The handful that reach a chart must therefore enter through post-season
refresh - intake, youth promotion or transfer - though this run does not
distinguish which, and does not need to. `wide_midfielder` reaches neither chart
in any of the `75` seasons.

Meanwhile the `23` curated shapes contain `16` `attacking_midfielder` slots
across `12` shapes, and `12` `defensive_midfielder` slots. **The formation
catalog asks for roles the world does not make.** Nothing before this step could
notice, because the batch path fielded `4-4-2` - which needs none of them.

**Owner: the generator/catalog contract**, Phase 79/80 territory for the
population and this phase's for the catalog. It needs one owner and has none.

### F3 - Five of twenty worlds could not be simulated to the end

`not_enough_players`: a club whose roster cannot fill the shape this run assigned.
`bestFieldedShape(...)` uses `input.formation` when the caller gives one and never
falls back; only with `undefined` does it search the catalog for a fillable shape.
The career path is immune because choosing is what it does.

This is F2 arriving as a crash. The surviving `15` worlds are the ones with
broader role cover, so **every number above carries that selection effect**, which
the report states in its own words.

**Owner: Step 14.** It intends to make formation a decision worth making, and a
decision that can end the fixture it is made for is not one.

### F4 - Strikers lead the assist chart

`creators_in_top_assists` fails `55/75` seasons, mean `0.48` against a band of
`0.55 - 1`. Across `750` assist rows: `striker 313`, `central_midfielder 170`,
`winger 122`, `center_back 77`, `attacking_midfielder 12`.

Per fielded slot the strikers create almost as much as the wingers, and the centre
backs out-create the full backs. Real assist charts are led by wide players and
attacking midfielders. Part of this is F2 - the creators barely exist - and part
is not: `center_back` at `77` rows is not a population artefact.

**Owner: Step 13.**

### F5 - The scorer chart is right

`striker 636/750` rows, `finishers_in_top_scorers` mean `0.927`, goalkeepers `0`,
centre backs `3`. `goals_per_match` passes `75/75` at a mean of `2.69`. Whatever
is wrong with the assist side, who scores is football.

### F6 - Home advantage sits on the floor

`home_win_share` fails `18/75` from below, mean `0.399` against `0.38 - 0.52`.
Not dramatic, and it shares F1's caveat about the band's league. **Owner: Step 13.**

### F7 - Nobody is ever rested

Every one of the top ten scorers played all `34` matches, in every season
sampled. No rotation, no injury and no suspension reaches the players who matter.
Not gated, because no band was declared for it in advance and declaring one now
would be choosing a band after seeing the output. **Recorded for Step 13.**

### What worked

`distinct_formations` passes `75/75` at `9 - 15` shapes per season, and all `23`
curated shapes were fielded across the run. `distinct_champions` is `47` over
`75` seasons. `impossible_values` and `goalkeepers_in_top_scorers` are `0`
everywhere. The shape variety this step existed to supply is real.

## Definition Of Done

- One hundred seasons asked for, `75` simulated to the end, every one with its
  four charts on disk. The `25` that stopped are counted, named and explained in
  the report, with the selection effect stated - not dropped.
- One aggregate report with every band, its observed value and its verdict.
- The report states its population and states plainly that it is not evidence.
- Two identical runs produce identical reports.
- Findings recorded with an owner; nothing tuned, widened or excluded.
- Step 13 is the next action, and it goes in knowing what the charts showed
  rather than reading invariants blind.

## Handoff

### 2026-08-05 - docs/steps/81-.../12-hundred-season-engine-inspection.md

- Status: Done under A10.
- Outcome: one hundred seasons asked for, `75` read as football charts. Seven
  findings, four of them defects nothing before this step could have seen,
  because the batch path fielded `4-4-2` and `4-4-2` needs none of the roles the
  world fails to generate.
- Adopted solution: `assignFormationsByClub(...)` derives a curated shape per
  club from `(worldSeed, clubId)` and reads nothing else, so no shape can inherit
  its clubs' strength; two optional hooks on `createSingleWorldReport(...)` that
  are absent for every carried report, so no carried number moved; a
  `season-recap-report` command over worker threads that reuses
  `runCareerLongRunSimulation(...)` and sequences nothing itself.
- Verification: `pnpm check` green; two identical runs produced identical
  reports; `git diff --check` clean; `graphify update .` run.
- Follow-up, in the order the next steps need it:
  - **Step 13** owns F1 (table compression, with the band-calibration caveat),
    F4 (strikers lead the assist chart), F6 and F7.
  - **Step 14** owns F3: a forced shape has no fallback and can end a fixture.
  - **F2 has no owner and needs one.** The generator makes seven of ten roles
    and the catalog asks for all ten. It is upstream of F3 and part of F4, and
    it is the one finding here that no Phase 81 step is scoped to fix.
