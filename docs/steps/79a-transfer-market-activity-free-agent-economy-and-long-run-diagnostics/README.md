# Phase 79A - Transfer Market Activity, Free-Agent Economy And Long-Run Diagnostics

## Status

Done. All seven steps pass their owned criteria. Control has returned to Phase
79 Step 14; its `750 x 50` closeout gate remains unrun and unclaimed.

## Goal

Turn the market-active `50 worlds x 20 seasons` evidence into a focused,
measurable correction of the long-career transfer economy.

Phase 79's structural implementation is coherent: windows, negotiation clocks,
preliminary agreements, contracts, finances, registrations, and squad floors
remain valid. The medium-run diagnostic nevertheless shows three issues that
must be understood and resolved before a release-scale gate:

- permanent transfers are absent in `37 / 50` worlds even though preliminary
  agreements are active;
- the free-agent pool exceeds the current `0.25` monitor threshold in every
  world and reaches roughly `0.35..0.43`;
- wage-utilization warnings occur in every world because the report keeps the
  single maximum club-season value and replenishment can land exactly at
  `1.0`.

The phase must first expose the complete market funnel and population flows,
then change gameplay policy only where the evidence proves a football-economy
problem. It must not make the report green by suppressing warnings or inserting
arbitrary transfer quotas.

## Entry Gate

- Phase 79 Steps 01-13 are Done.
- Phase 79 Step 14 is Reopened and its market-active `50 x 20` diagnostic is
  complete.
- The diagnostic completed `1,000` seasons with partition hash
  `d9f3b553d6fefb50`.
- Contract/finance structural violations are `0`, minimum senior squad size is
  `18`, clubs below the minimum are `0`, and clubs without a natural
  goalkeeper are `0`.
- Exactly one world fails only on the existing seven-season champion-streak
  story boundary; Phase 79A does not own match, league-table, or dynasty tuning.
- The stale pre-fix `docs/audits/TRANSFER_MARKET_LONG_RUN_REPORT.md` is not
  accepted as Phase 79 completion evidence.

## Product Intent

Across a long career:

- clubs should use permanent transfers when a current squad need, seller
  willingness, and affordable fee align;
- preliminary agreements should remain valuable for expiring players without
  becoming the default answer to nearly every recruitment need;
- useful players should not remain unattached for years solely because squad
  replenishment stops at a structural target;
- constrained clubs may legitimately operate near their wage ceiling, but the
  report should show whether that is isolated pressure or a league-wide lack
  of headroom;
- every correction must preserve deterministic behavior, manager agency,
  legal windows, three-day clocks, atomic affordability, and protected squad
  structure.

## Locked Decisions

### Observe Before Tuning

- Step 01 locks the existing evidence and questions without changing code.
- Step 02 adds funnel, stock/flow, and wage-distribution observability before
  any market-policy change.
- Step 03 must name the exact permanent-transfer bottleneck from measured
  rejection/outcome facts before changing ordering, eligibility, targeting,
  valuation, willingness, or finance policy.
- Step 04 must distinguish useful employable free agents from aging players
  naturally approaching career exit before changing absorption or exit policy.

### One Canonical Market

- AI and selected-club actions continue through the Phase 79 canonical window,
  negotiation, affordability, contract, finance, and transfer boundaries.
- No report-only transfer, synthetic turnover event, forced deal, or second
  market simulator is allowed.
- Permanent transfers and preliminary agreements remain separate factual
  funnels. One may not be counted as the other merely to improve a headline.

### Honest Population And Finance Semantics

- Free-agent stock must be explained by inflow, signing/activation outflow,
  retirement/career-exit outflow, age, ability, and time unattached.
- Players may not be silently deleted or auto-signed just to satisfy the
  current `0.25` warning threshold.
- Wage pressure above `1.0` remains a structural failure.
- Exact `1.0`, p95/p99 utilization, the number/share of pressured club-seasons,
  and remaining wage headroom must be visible separately. A single historical
  maximum is not sufficient cohort evidence.

### Bounded Validation

- Phase 79A ends with the same deterministic `50 x 20` cohort used for the
  baseline, plus focused fixed-seed repeats.
- It does not run or claim the Phase 79 `750 x 50` closeout gate.
- Once Phase 79A closes, control returns to Phase 79 Step 14 for the documented
  staged release gate and replacement of the stale audit artifact.

## Ordered Steps

1. `01-lock-50x20-baseline-and-diagnostic-contract.md`
2. `02-market-funnel-population-and-wage-observability.md`
3. `03-permanent-transfer-funnel-and-budget-timing.md`
4. `04-free-agent-stock-flow-and-squad-demand.md`
5. `05-wage-headroom-diagnostic-semantics.md`
6. `06-focused-regression-and-50x20-calibration-gate.md`
7. `07-phase-report-and-return-to-phase-79.md`

## Phase-Level Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/simulation-tools run test
pnpm --filter @game/cli run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm check
pnpm cli ten-season-report \
  --seed-prefix=phase79-market-smoke-50x20 \
  --worlds=50 \
  --seasons=20 \
  --report-output=docs/audits/TRANSFER_MARKET_79A_50X20_REPORT.md
git diff --check
graphify update .
```

The cohort command runs only in Step 06. Earlier steps use focused tests,
single-world samples, or smaller diagnostic fixtures.

## What NOT To Implement

- No `750 x 50` or `10,000 x 50` run inside Phase 79A.
- No loans, installments, auctions, agents, bidding wars, work permits,
  registration quotas, scouting fog, extra competitions, or Finances UI.
- No transfer quota, guaranteed deal, seed exception, warning suppression, or
  threshold relaxation chosen only to produce a pass.
- No player deletion based only on free-agent status or pool size.
- No change to goals, assists, table spread, champion-streak, player
  development, youth generation, or match simulation.
- No hidden selected-club automation, parallel market state, or compatibility
  path.

## Definition Of Done

- The report exposes the permanent-transfer and preliminary-agreement funnels
  separately from need through terminal outcome and activation.
- Free-agent stock is explainable through seasonal inflow/outflow, age,
  ability, and time-unattached distributions.
- Wage pressure is reported as a distribution while any utilization above
  `1.0` remains a hard failure.
- The measured permanent-transfer bottleneck is corrected without forced
  turnover or weakened legal/financial/squad invariants.
- Employable free agents reach a bounded, football-credible equilibrium
  without artificial deletion or squad inflation.
- The repeated `50 x 20` cohort has zero market, contract, finance,
  registration, or squad-structure failures and records before/after evidence.
- Residual goals, assists, population-edge, or dynasty story signals remain
  visible and are not tuned by this phase.
- `docs/audits/TRANSFER_MARKET_79A_DIAGNOSTIC_REPORT.md` and
  `docs/audits/TRANSFER_MARKET_79A_50X20_REPORT.md` record the decisions and
  results.
- Phase 79 Step 14 becomes the single next active step; its `750 x 50` gate is
  still unclaimed.
