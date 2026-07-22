# Step 15 - Contract, Finance And Squad Long-Run Gates

## Status

In progress.

## Goal

Prove that contracts and club finances support decades of squad turnover
without ownership, payroll, budget, free-agent, or roster collapse.

## User-Visible Outcome

Long careers remain playable: clubs keep legal squads, players change employer
or become free agents coherently, wages and values stay credible, and no save
quietly corrupts contract or finance state.

## Scope

1. Extend the existing long-run runner with contract, registration, finance,
   free-agent, valuation, renewal, expiry, and negotiation metrics.
2. Assert every owned senior player has one active contract and one unique club
   number.
3. Assert every active contract agrees with club ownership and date validity.
4. Assert free agents have no active employer contract or registration.
5. Assert payroll, bonuses, transfers, season distributions, and signing costs
   reconcile with the ledger and are idempotent.
6. Assert completed commitments never exceed cash/wage rules and AI never
   bypasses affordability. A submitted offer is exposure, not spent or
   reserved budget; Phase 79 owns the replacement of the temporary reservation
   behavior and the three-day cancellation lifecycle.
7. Assert squad size, goalkeeper, department, age, wage, value, expiry,
   renewal, release, and free-agent distributions stay within locked structural
   and football-meaningful bounds.
8. Assert the selected-club plan survives turnover only while players remain
   owned and never receives a hidden replacement.
9. Run `50 x 10`, then `250 x 30`, then the accepted beta-scale sharded
   long-run sample of at least `750 x 50` worlds/seasons.
10. Repeat deterministic samples and compare structured hashes.
11. Classify warnings by user fun and football logic; do not tune only to make
    warning counts disappear.

## Implementation Contract

- The gate uses canonical career use cases, not a simplified contract lab.
- Thresholds are documented before the final run and cannot be weakened during
  execution.
- Shards are deterministic, resumable, and merge structured output without
  changing simulated worlds.
- A failed invariant blocks Phase 78 unless it is proven unrelated and already
  covered by a named existing accepted anomaly.
- Pending exposure that is not yet committed is not itself a finance
  corruption. The report must distinguish it from an accepted or activated
  agreement that cannot be funded.
- The resumable `10,000 x 50` command remains a release-scale tool. Do not burn
  Phase 78 time on that operational sample after the accepted beta-scale gate
  and deterministic repeat have passed.

## Expected Files

- focused Phase 78 gate/report Modules/tests under `packages/simulation-tools/`
- current long-run CLI/report wiring only where required to execute the gate
- current Phase 78 production/test Modules only for defects found by this gate
- `docs/audits/SENIOR_SQUAD_CONTRACTS_AND_FINANCE_REPORT.md`
- generated structured reports under the current ignored report-output path
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No threshold weakening, warning suppression, hardcoded seed exception,
  decorative normalization, or separate simulator.
- No broad market, sponsor, stadium, debt, bankruptcy, staff, or promotion
  feature to hide a Phase 78 failure.
- No browser rendering inside the long-run runner.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/simulation-tools run test
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/engine run test
pnpm check
git diff --check
graphify update .
```

Run the documented staged Phase 78 commands for `50 x 10`, `250 x 30`, and at
least `750 x 50`, including the prescribed repeated hash sample.

## Manual Inspection

- Review the worst cash, wage, value, free-agent, expiry, renewal, and squad-
  structure worlds as football stories.
- Inspect a sample of strong, average, and weak clubs at seasons 1, 10, 30,
  and 50.

## Completion Criteria

- All staged gates pass their locked structural invariants.
- Same-seed output is reproducible.
- Reports expose distributions and named warnings rather than only PASS/FAIL.
- Phase 78 is complete and Phase 79 Step 01 is the only next implementation
  step. The former Step 16 closeout is executed once as the final Phase 79
  step.
