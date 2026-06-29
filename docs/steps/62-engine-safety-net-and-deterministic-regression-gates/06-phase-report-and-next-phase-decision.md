# Step 06 - Phase Report And Next Phase Decision

## Goal

Close Phase 62 with a final safety-net report and exactly one next-phase
recommendation.

## Expected files

- `docs/audits/ENGINE_SAFETY_NET_REPORT.md`
- `docs/audits/ENGINE_SAFETY_NET_AUDIT.md`
- `docs/audits/ENGINE_SAFETY_NET_COMMANDS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Create a final report summarizing:
  - what the new safety net protects;
  - which tests were added;
  - which behavior is intentionally not pinned;
  - how future golden updates should be reviewed;
  - which command pack should be run after engine-changing phases;
  - residual risks before Phase 63.
- Update the playability/engine roadmap only if the phase findings change the
  next recommended order.
- Recommend exactly one next phase. The expected next recommendation is
  `Phase 63 - Canonical Career Advancement Use-Case` unless Phase 62 uncovers a
  blocker that must be handled first.

## What NOT to implement

- Do not start Phase 63.
- Do not add new regression tests during the final report unless a missing gate
  blocks closing Phase 62.
- Do not hide brittle tests or unresolved deterministic gaps.
- Do not claim the engine is fully protected; report the remaining risks.

## Required checks

```sh
nvm use 24
test -f docs/audits/ENGINE_SAFETY_NET_REPORT.md
pnpm check
pnpm cli simulate-season --seed=world-a
pnpm cli simulate-season --seed=world-a --fixture=fixture:000001 --fixture-explanation
pnpm cli career --save=phase62-check --seed=world-a --new-world-preview
pnpm cli career --save=phase62-check --summary
pnpm cli career --save=phase62-check --advance-next-fixture
pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict
git diff --check
graphify update .
```

## Definition of Done

- Phase 62 has a final report.
- `docs/PROJECT_STATUS.md` marks Phase 62 complete or blocked.
- The roadmap still recommends exactly one next phase.
- `pnpm check` passes.
- Graphify is updated after code/test changes.

