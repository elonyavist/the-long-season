# Step 09 - Bounded Phase Report And Phase 81 Handoff

## Status

Not started.

## Entry Gate

- Phase 80, Phase 80A, Phase 80B, and Phase 80C Steps 01-08 are Done.
- Repository, build, persistence, browser, accessibility, and bounded race
  diagnostic gates are green.
- No Phase 80C production change remains pending.

## Goal

Close Phase 80C on bounded non-vacuous race evidence, prove that the
checkpoint/shard/worker infrastructure remains ready, and hand the final
longitudinal cohort to Phase 81 after the accepted match-engine rework.

## Why The Cohort Moved

Phase 81 changes formation interpretation, opportunity creation, AI selection,
match outcomes, and therefore long-run competition and market context. Running
`50 x 20` here would certify a match engine immediately scheduled for a
substantial tactical rework. Phase 81 Step 12 is the sole final cohort owner so
one run observes
the complete player, market, loan, race, and tactical rework chain.

## What To Implement

- Re-run the exact Step 08 bounded race audit and require positive observations.
- Verify participant limits, seller qualification, raises, `outbid`,
  player choice, `lost_to_rival`, free-agent races, serial loans, ownership,
  finance, and stale-state protection.
- Exercise stable shard creation, checkpoint validation, seven-worker
  resolution, and replay with a small bounded sample only; do not run the
  longitudinal cohort.
- Run `pnpm check`, web build, Playwright, dependency, diff, and Graphify gates.
- Write the Phase 80C report with delivered behaviour, verification, warnings,
  cleanup, and explicit statement that no longitudinal evidence was run or
  claimed.
- Update active documentation so Phase 81 Step 01 is the only next action after
  80C.
- Keep Phase 79 Step 14 Reopened, paused, unrun, and unclaimed through Phase 81.

## What NOT To Implement

- No production fix, tuning, threshold relaxation, seed exception, warning
  suppression, or report fabrication.
- No `50 x 20`, Phase 79 release cohort, or other longitudinal run.
- No Phase 81 implementation.
- No Phase 79 Step 14/15 implementation.

## Expected Files

- `docs/audits/PHASE_80C_COMPETITIVE_TRANSFER_RACE_REPORT.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- Phase 80C README
- this step document
- `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/README.md`
- `docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/transfer-race-audit.test.ts
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Every bounded race gate has positive observations and passes.
- Shard/checkpoint/seven-worker infrastructure is bounded-exercised and ready.
- Repository, browser, persistence, accessibility, dependency, diff, and
  Graphify gates pass.
- The report states plainly that no longitudinal cohort ran or was claimed.
- Phase 80C is complete.
- Phase 81 Step 01 is the only next action and owns the final `50 x 20` in its
  Step 12.
