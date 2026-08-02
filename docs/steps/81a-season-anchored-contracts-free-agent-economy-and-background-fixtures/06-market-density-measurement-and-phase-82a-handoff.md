# Step 06 - Market Density Measurement And Phase 82A Handoff

## Status

Not started.

## Entry Gate

- Phase 81A Steps 01-05 are Done.
- Repository, build, browser, persistence, and dependency gates are green.
- No production or cleanup change remains pending.

## Goal

Measure market density against the bands frozen in Step 01, close Phase 81A on
that evidence, and state plainly whether the measurement still justifies
starting Phase 82A.

## Why This Step Decides Something

Phase 82A was deferred on an argument: loans and returns are `18.9%` of real
movements while contract expiry is `62.5%`, so the cheap lever was contracts,
not loans. That argument is now testable. If Steps 02-05 brought density inside
the bands, the case for loans is a football-completeness case, not a rescue
case, and it should be made on those terms. If density is still far below band,
loans will not close the gap either, and the next owner is whatever is still
suppressing movement.

Either outcome is a result. The step exists to prevent Phase 82A from starting
because it was next on a list.

## What To Implement

- Re-run the exact Step 01 audit with the same seeds, sample size, and metric
  definitions. A changed denominator invalidates the comparison.
- Record every frozen band with its pre-change value from Step 01 and its
  post-change value, side by side: arrivals per club per season; permanent
  share; contract-expiry share; fee-bearing share; mean contract duration;
  contracts under six months; season-boundary share; free-agent share. Loan
  bands report `not_evaluated`, never `PASS`, because loans do not exist.
- Report the per-component tick costs measured in Step 04 against the declared
  budget.
- Write the phase report with delivered behaviour, removed code, verification,
  measured density, residual warnings, and manual inspection findings.
- Write the Phase 82A handoff with an explicit recommendation and its reason:
  start the loan work, or re-argue it first. Name what is still out of band and
  who would own it.
- Update the active documentation so Phase 82A is the next phase and its entry
  gate's density requirement is satisfied by this report.
- Keep Phase 79 Step 14 Reopened, paused, unrun, and unclaimed.

## What NOT To Implement

- No production fix, tuning, threshold relaxation, seed exception, warning
  suppression, or report fabrication.
- No band adjusted to match the measurement. A miss is reported as a miss with a
  named owner.
- No longitudinal cohort: Phase 81 Step 12 ran the engine cohort and Phase 82B
  Step 09 owns the market one.
- No loan, posture, or race implementation.
- No Phase 79 Step 14/15 implementation.

## Expected Files

- `docs/audits/PHASE_81A_MARKET_ECONOMY_REPORT.md`
- `docs/audits/PHASE_81A_MARKET_ECONOMY_BASELINE.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- this phase README
- this step document
- `docs/steps/82a-incoming-offers-market-postures-and-loans/README.md`

## Required Checks

```bash
nvm use 24
pnpm cli market-economy-report \
  --seed-prefix=phase81a-density \
  --report-output=docs/audits/PHASE_81A_MARKET_ECONOMY_REPORT.md
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
test -f docs/audits/PHASE_81A_MARKET_ECONOMY_REPORT.md
git diff --check
graphify update .
```

## Definition Of Done

- Every frozen band has a pre-change and a post-change measured value recorded
  against it, on identical seeds and denominators.
- Loan bands are `not_evaluated`, with the reason stated.
- Per-component tick costs are reported against the budget.
- The report states an explicit recommendation on Phase 82A and its reason.
- Anything still out of band is named with an owner rather than deferred
  silently.
- Repository, build, browser, persistence, dependency, diff, and Graphify gates
  pass.
- Phase 81A is complete and Phase 82A is the only next action.
