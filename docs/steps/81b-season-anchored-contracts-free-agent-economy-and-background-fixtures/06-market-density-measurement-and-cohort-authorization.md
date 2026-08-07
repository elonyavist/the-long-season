# Step 06 - Market Density Measurement And Cohort Authorization

## Status

Not started. Phase 81B.

## Entry Gate

- Phase 81B Steps 01-05 are Done.
- Repository, build, browser, persistence, and dependency gates are green.
- No production or cleanup change remains pending.

## Goal

Measure market density against the bands frozen in Step 01, state plainly
whether the measurement still justifies Phase 82A, and freeze the complete
Step 07 cohort contract before its expensive run starts.

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
  contracts under six months; season-boundary share. Loan bands report
  `not_evaluated`, never `PASS`, because loans do not exist.
- Report the free-agent pool as the cycle Step 01 froze, not as a level: peak at
  the season boundary, trough once the window closes, and the drain between
  them, with the drain attributed between signings and exits. The drain is the
  gate. A report that shows both levels inside band while the delta is flat has
  found the defect, not passed the phase.
- Report the opening state of a freshly generated world beside the trough, so
  the seeded pool is shown to match the cycle rather than being asserted to.
- Report the per-component tick costs measured in Step 04 against the declared
  budget.
- Write the interim market-economy report with delivered behaviour, removed
  code, verification, measured density, residual warnings and manual inspection
  findings. Step 07 adds the cohort result and final phase decision.
- Write the Phase 82A handoff with an explicit recommendation and its reason:
  start the loan work, or re-argue it first. Name what is still out of band and
  who would own it.
- Freeze the Step 07 populations, gates, seed prefix, exactly `750` worlds,
  exactly `10` seasons, `750` stable one-world shards, exactly `7` workers,
  preliminary throughput budget and maximum wall clock. The `2h 54m` Phase 81
  run used the fixed-shape path and is only a lower-bound reference. The budget
  must instead include Phase 81 Step 09's measured canonical catalog-selection
  cost (`383ms` versus `123ms` for the fixed path over `270` clubs), plus Step
  04's background-fixture component timings. The cohort contract is changed
  only by reopening this step before acceptance seeds run, never after reading
  the `750 x 10` output.
- Freeze that the world-integrity profiles reach the Phase 81A/81B career
  fixture producer and canonical club selector. Any call to the legacy
  `inspection?.formationForClub?.(clubId) ?? "4-4-2"` path is a contract failure,
  not a permitted default.
- Freeze two deterministic example rules for the diagnostic view. Primary
  evidence examples may read only seed, season number and pre-run strata. A
  separate display-only outlier appendix may read named metrics and warnings
  through a total ordering frozen here; it never enters a denominator, gate or
  phase decision. Neither rule may select a player identity by name.
- Authorize Step 07 only when Phase 81B-owned bounded gates pass and the long
  run has a declared operational budget. Phase 82A remains closed until Step 07
  finishes; the density recommendation is an input to that later handoff.
- Keep Phase 79 Step 14 Reopened, paused, unrun, and unclaimed.

## What NOT To Implement

- No production fix, tuning, threshold relaxation, seed exception, warning
  suppression, or report fabrication.
- No band adjusted to match the measurement. A miss is reported as a miss with a
  named owner.
- No longitudinal cohort in this step. Step 07 owns the one Phase 81B run.
- No loan, posture, or race implementation.
- No Phase 79 Step 14/15 implementation.

## Expected Files

- `docs/audits/PHASE_81B_MARKET_ECONOMY_REPORT.md`
- `docs/audits/PHASE_81B_MARKET_ECONOMY_BASELINE.md`
- `docs/audits/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/steps/README.md`
- this phase README
- this step document
- `07-checkpointed-750x10-world-integrity-cohort-and-diagnostic-view.md`
- `docs/steps/82a-incoming-offers-market-postures-and-loans/README.md`

## Required Checks

```bash
nvm use 24
pnpm cli market-economy-report \
  --seed-prefix=phase81b-density \
  --report-output=docs/audits/PHASE_81B_MARKET_ECONOMY_REPORT.md
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
test -f docs/audits/PHASE_81B_MARKET_ECONOMY_REPORT.md
git diff --check
graphify update .
```

## Definition Of Done

- Every frozen band has a pre-change and a post-change measured value recorded
  against it, on identical seeds and denominators.
- The free-agent pool is reported as peak, trough, and attributed drain, and the
  opening state of a fresh world is shown beside the trough.
- Loan bands are `not_evaluated`, with the reason stated.
- Per-component tick costs are reported against the budget.
- The report states an explicit recommendation on Phase 82A and its reason.
- Anything still out of band is named with an owner rather than deferred
  silently.
- The complete `750 x 10` contract, operational budget, example-selection rule
  and all evidence gates are frozen before Step 07 runs.
- Canary and acceptance are frozen on the canonical career selector, with the
  legacy fixed-`4-4-2` path forbidden, and both checkpoint/view destinations
  resolve under the existing ignored `saves/` and `simulation-out/` roots.
- Repository, build, browser, persistence, dependency, diff, and Graphify gates
  pass.
- Step 07 is authorized and is the only next action, or Phase 81B stops with the
  failed local owner named. Phase 82A does not start from Step 06 alone.
