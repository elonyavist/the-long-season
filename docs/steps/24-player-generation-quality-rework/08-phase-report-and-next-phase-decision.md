# Step 08 - Phase Report And Next Phase Decision

## Goal

Complete Phase 24 with an evidence-based report and select the next phase.

## Context

This phase exists because player generation is core to long-term fun. Before returning to career-match-preparation persistence or moving to youth/market depth, the project needs a clear report: what changed, what is now protected by tests, what remains imperfect, and what the next single phase should be.

## Expected files

- `docs/audits/PLAYER_GENERATION_QUALITY_REWORK_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Record the before/after generator quality findings.
- Record the new bands, role caps, prospect model, and rarity rules.
- Record commands used for manual inspection.
- Score the player-generation model for current project maturity.
- Recommend exactly one next phase.
- If the previous Phase 23 recommendation should resume, state that explicitly.

## What NOT to implement

- Do not start the next phase.
- Do not add new generator behavior during the report.
- Do not hide known weak points.
- Do not claim real-world statistical perfection.

## Required checks

- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --identity-review`
- `pnpm cli simulate-season --seed=world-b --identity-review`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- the Phase 24 player-generation quality CLI report command
- `git diff --check`

## Definition of Done

- The phase report exists.
- The report explains whether the generator is credible enough to continue career systems.
- `docs/PROJECT_STATUS.md` identifies the next phase and active step.
- No next-phase code has started.
