# Step 09 - Checkpointed 50x20, Phase Report And Phase 79 Handoff

## Status

Not started.

## Entry Gate

- Phase 80, Phase 80A, Phase 80B, and Phase 80C Steps 01-08 are Done.
- Repository, build, persistence, browser, accessibility, and bounded
  diagnostic gates are green.
- No production change remains pending.
- Seed, report path, checkpoint path, shard count, season count, and worker
  count below remain unchanged.

## Goal

Run and replay the deferred `50 x 20` against the final competitive market,
close Phase 80C truthfully, and return control to Phase 79 without claiming its
separate release-scale gate.

## Why The Cohort Runs Here

It moved from Phase 80B because Phase 80C changes seller resolution, adds
raising, and makes the player choose between suitors. Running it earlier would
have certified a market about to change, which is exactly how Phase 79 Step 14
came to hold a gate result that no longer described the shipped economy.

## Frozen Command

```bash
pnpm cli ten-season-report \
  --seed-prefix=phase80c-transfer-race-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase80c-transfer-race-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_80C_TRANSFER_RACE_50X20_REPORT.md
```

Rerunning the identical command must reuse all valid one-world shards and
reproduce the same report facts.

## What To Implement

- Run the frozen command once after the entry gate.
- Preserve checkpoint files until deterministic replay is accepted.
- Record actual workers, shard hashes, resumed count, warnings, failures, and
  positive observation counts.
- Validate through years 1, 10, and 20: race frequency and participant counts,
  raise behaviour, club-stage qualification sets, `outbid` closures,
  player-stage choices, `lost_to_rival` closures, free-agent races, ownership
  and finance integrity, selectable squad floors, and AI information parity.
- Confirm no race exceeds three active acquiring clubs, only highest acceptable
  fees and exact matches qualify, one-suitor free agents retain their
  three-day stage, manager acceptance never closes a race early, and loans
  remain on the serial Phase 80B path.
- Confirm no race gate passed on zero observations.
- Confirm no race loser produced a `stale_ownership` completion failure.
- Rerun the identical command and prove checkpoint reuse and same-seed facts.
- Run final `pnpm check`.
- Close Phase 80C only on genuine pass; otherwise mark it blocked without
  tuning inside this step.
- Update Phase 79 Step 14 with a truthful handoff, leaving its own release gate
  unrun and unclaimed.

## What NOT To Implement

- No production fix, tuning, threshold relaxation, seed exception, manual report
  edit, warning suppression, or checkpoint deletion.
- No `750 x 20`, longer-than-20-season run, duplicate parallel cohort, or worker
  count other than `7`.
- No Phase 79 Step 15 or Phase 81 implementation.

## Expected Files

- `docs/audits/PHASE_80C_TRANSFER_RACE_50X20_REPORT.md`
- `docs/audits/PHASE_80C_COMPETITIVE_TRANSFER_RACE_REPORT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- Phase 80C README
- this step document
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`

Checkpoint files remain ignored under:

- `saves/long-run-checkpoints/phase80c-transfer-race-50x20/`

## Required Checks

```bash
nvm use 24
pnpm cli ten-season-report \
  --seed-prefix=phase80c-transfer-race-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase80c-transfer-race-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_80C_TRANSFER_RACE_50X20_REPORT.md
pnpm cli ten-season-report \
  --seed-prefix=phase80c-transfer-race-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase80c-transfer-race-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_80C_TRANSFER_RACE_50X20_REPORT.md
pnpm check
test -f docs/audits/PHASE_80C_TRANSFER_RACE_50X20_REPORT.md
git diff --check
graphify update .
```

## Definition Of Done

- `50 x 20` completes from 50 stable shards with exactly 7 workers.
- Replay reuses checkpoints and reproduces report facts.
- Every structural and race gate has positive observations and passes.
- No race gate passed on an empty population and no race loser failed on
  `stale_ownership`.
- Warnings remain visible and truthfully classified.
- Phase 80C is complete.
- Phase 79 Step 14 is next owner; its own release gate remains unrun and
  unclaimed.
