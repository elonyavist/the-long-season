# Step 12 - Checkpointed 50x20, Phase Report And Phase 81A Handoff

## Status

Not started.

## Entry Gate

- Phase 80 and Phase 80A are Done, the latter having carried its
  `goals_per_match_avg` monitor into this phase.
- Phase 81 Steps 01-11 are Done, and Step 11 recorded the carried monitor
  inside its unchanged band.
- Phases 82A and 82B are Planned and not started: no loans, postures, or
  competitive races exist in the world this cohort observes.
- Bounded tactical, finance, persistence, browser, accessibility, repository,
  and absence gates are green.
- No production or cleanup change remains pending.
- Seed, report path, checkpoint path, shards, seasons, and worker count below
  remain unchanged.

## Goal

Run and replay this phase's `50 x 20` against the accepted player model and
tactical match engine, confirm the carried goal-rate monitor holds at cohort
scale, close Phase 81 truthfully, and hand control to Phase 81A.

## What This Cohort Does And Does Not Prove

It proves the accepted tactical match engine over twenty seasons: shape,
matchup, route behaviour, AI selection, competition stability, and the goal
rate carried in from Phase 80A.

It is not market evidence. Under the 2026-08-02 phase order the market work
follows this phase, so this cohort observes a world with no postures, no loans,
and no competitive races. Phase 82B Step 09 owns a second cohort for those. The
report must state this plainly rather than leaving the scope to be inferred, so
that no later phase reuses these numbers as market evidence.

## Frozen Command

```bash
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
```

## What To Implement

- Run the frozen command once after the entry gate.
- Preserve checkpoints until deterministic replay is accepted.
- Record actual workers, stable shard hashes, completed/resumed counts,
  warnings, failures, and positive observation counts.
- Verify years 1, 10, and 20 for existing player, development, market, finance,
  competition, and tactical metrics. Race and loan metrics do not apply: that
  behaviour does not exist yet and its gates report `not_evaluated`, never
  `PASS`.
- Confirm `goals_per_match_avg` stays inside its unchanged band at cohort scale,
  and record the distribution beside the `36/634/80` inherited from Phase 80A
  Step 09. This is the closing evidence for the monitor this phase accepted.
- Add tactical long-run observations without replacing bounded scenario gates:
  formation/route diversity, extreme-shape frequency, tactical warning
  frequency, AI assignment validity, tactic-change frequency, route/goal
  distribution, and no invalid/NaN state.
- Confirm tactical structure does not erase player-quality hierarchy, create a
  universal formation, collapse scoring, or destabilize long-run competitions.
- Rerun the identical command and prove checkpoint reuse plus identical report
  facts.
- Run final `pnpm check`.
- Write the Phase 81 report with delivered behaviour, code/refactor removals,
  verification, manual inspection, warnings, residual monitors, and an explicit
  statement that this cohort observed no loans and no races.
- Write the Phase 81A handoff. That phase is already scoped in
  `docs/steps/81a-season-anchored-contracts-free-agent-economy-and-background-fixtures/`,
  so the handoff confirms its entry gate rather than restating its scope:
  the carried monitor is inside band, the four seams below exist, and no loan,
  posture, or race behaviour was introduced.
- Record the seams this phase leaves for that work: the named squad-depth
  accessor, the context constructor taking an explicit squad, the non-selected
  club as an ordinary caller, and the `(worldSeed, fixtureId)` match RNG key
  that makes resolution order irrelevant.
- Leave Phase 79 Step 14 Reopened, paused, unrun, and unclaimed.
- Close only on genuine pass; otherwise mark Phase 81 blocked without tuning.

## What NOT To Implement

- No production fix, refactor, tuning, threshold relaxation, seed exception,
  manual report edit, warning suppression, or checkpoint deletion.
- No worker count other than `7`.
- No longer-than-20-season, duplicate, or release-scale Phase 79 cohort.
- No market or race claim from this cohort: the behaviour did not exist when it
  ran.
- No Phase 81A implementation. This step names the work and hands it over.
- No Phase 79 Step 14/15 implementation.

## Expected Files

- `docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md`
- `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_ENGINE_REPORT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- this phase README
- this step document
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`

Checkpoint files remain ignored under:

- `saves/long-run-checkpoints/phase81-tactical-shape-50x20/`

## Required Checks

```bash
nvm use 24
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
pnpm check
test -f docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
git diff --check
graphify update .
```

## Definition Of Done

- `50 x 20` completes from 50 stable shards with exactly seven workers.
- Replay reuses checkpoints and reproduces report facts.
- Existing and tactical structural gates have positive observations and pass.
- No universal tactic, invalid shape, dead path, duplicate calculation, or
  compatibility residue remains.
- Warnings stay visible and truthfully classified.
- `goals_per_match_avg` is inside its unchanged band at cohort scale, reported
  beside the inherited `36/634/80`.
- The report states plainly that this cohort observed no loans and no races and
  is therefore not market evidence.
- Phase 81 is complete.
- Phase 81A is the only next owner, its entry gate is confirmed satisfied, and
  the four seams it consumes are named in the report.
- Phase 79 Step 14 remains unrun and unclaimed.
