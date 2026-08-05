# Step 11D - Hundred-Season Engine Inspection

## Status

Not started. **Requires amendment A10**, because the phase README forbids any
cohort before Step 12.

## Goal

Run a hundred simulated seasons through the Step 11C instrument, read the four
charts, and answer one question with evidence a person can check by eye: does
the football Phase 81 built look like football?

## User-Facing Reason

Phase 81 rebuilt what happens on the pitch. Before it closes, somebody has to
look at a league table, a scorer chart and an assist chart and recognise the
sport. No invariant substitutes for that.

## Why This Needs An Amendment

`No cohort before Step 12` is a locked decision, and it is a good one: it stops
a smaller run being cited as balance evidence and then contradicting the real
cohort. This step does not weaken it.

**A10 permits one inspection run before Step 12, on the condition that its
output is never evidence.** No calibration value may be changed because of it,
no band may be widened by it, and no later document may cite its numbers as
balance measurement. Step 12 remains the only statistical cohort Phase 81 closes
on. What this run produces is a *look*, and a defect it makes visible is
investigated, not measured.

If that condition cannot hold, this step does not run and the charts wait for
Step 12.

## Scale, And Why This Size

`5` worlds by `20` seasons, one hundred seasons, seven workers.

Twenty seasons because a dynasty and a collapse both need time to appear; five
worlds because the role and shape defects this is looking for are gross and show
up immediately, while anything subtle is Step 12's job at ten times the size.

Recorded as a rate wherever the generated league system's club count could
differ, per the design contract.

## What To Implement

- A `season-recap-report` CLI command running the instrument over the long-run
  simulation. It reuses `runCareerLongRunSimulation(...)`; it does not
  reimplement sequencing, seeding or checkpointing.
- Per-season detail written one file per season, so a suspicious aggregate can
  be opened and read.
- One aggregate summary that a person actually reads: every band with its
  observed value, its declared range, and pass or fail.
- The report states its population in full: worlds, seasons, seed prefix, club
  count, one country, no market, no human manager - and that it is not evidence.
- Distinct champions, distinct formations fielded, and the mean points of the
  clubs using each shape, because Step 11B needs all three before it can reward
  a counter-move.

## Reading The Result

- **Every band passing is not the goal.** The goal is knowing which ones do not
  and why. A run where everything passes on the first attempt deserves a check
  that the gates can fail at all - Step 11C proves that, and this step confirms
  it held.
- A failing band is a finding. Record it, name the likely owner, and hand it to
  the step that owns that behaviour. Do not fix it here and do not widen it.
- Anything within noise of a band edge is **unresolved**, not passing. Say so.

## What NOT To Implement

- No calibration, threshold, engine or content change of any kind. This step
  observes.
- No band widened, no seed excepted, no season excluded, no warning suppressed.
- No claim that this run is balance evidence, market evidence, or a substitute
  for Step 12.
- No second run to get a nicer result.
- No manager-facing surface.

## Expected Files

- `apps/cli/src/commands/season-recap-report.ts`
- `apps/cli/src/commands/season-recap-report.test.ts`
- `apps/cli/src/index.ts`
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
  --seed-prefix=phase81-season-recap-5x20 \
  --worlds=5 \
  --seasons=20 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md
pnpm cli season-recap-report \
  --seed-prefix=phase81-season-recap-5x20 \
  --worlds=5 \
  --seasons=20 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md
pnpm check
test -f docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md
git diff --check
graphify update .
```

The command runs twice: identical output from an identical command is the whole
determinism claim, and it costs one extra run to prove.

## Definition Of Done

- One hundred seasons simulated, every one with its four charts on disk.
- One aggregate report with every band, its observed value and its verdict.
- The report states its population and states plainly that it is not evidence.
- Two identical runs produce identical reports.
- Findings recorded with an owner; nothing tuned, widened or excluded.
- Step 11B or Step 12 is the next action, depending on what the charts showed.
