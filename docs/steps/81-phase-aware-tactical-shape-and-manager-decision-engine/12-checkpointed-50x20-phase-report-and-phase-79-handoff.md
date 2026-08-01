# Step 12 - Checkpointed 50x20, Phase Report And Phase 79 Handoff

## Status

Not started.

## Entry Gate

- Phases 80A, 80B, and 80C are Done.
- Phase 81 Steps 01-11 are Done.
- Bounded tactical, market, race, finance, persistence, browser, accessibility,
  repository, and absence gates are green.
- No production or cleanup change remains pending.
- Seed, report path, checkpoint path, shards, seasons, and worker count below
  remain unchanged.

## Goal

Run and replay the deferred `50 x 20` against the final accepted player,
market, loan, race, and tactical match engine; close Phase 81 truthfully; and
return control to Phase 79 without claiming its separate release-scale gate.

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
- Verify years 1, 10, and 20 for existing player, development, market, race,
  finance, ownership/selectability, competition, and tactical metrics.
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
  verification, manual inspection, warnings, and residual monitors.
- Update Phase 79 Step 14 with a truthful handoff while leaving its own staged
  release commands unrun and unclaimed.
- Close only on genuine pass; otherwise mark Phase 81 blocked without tuning.

## What NOT To Implement

- No production fix, refactor, tuning, threshold relaxation, seed exception,
  manual report edit, warning suppression, or checkpoint deletion.
- No worker count other than `7`.
- No longer-than-20-season, duplicate, or release-scale Phase 79 cohort.
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
- Phase 81 is complete.
- Phase 79 Step 14 is the only next owner; its separate release-scale gate
  remains unrun and unclaimed.
