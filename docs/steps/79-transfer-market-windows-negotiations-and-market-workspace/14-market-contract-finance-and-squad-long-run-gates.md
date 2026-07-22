# Step 14 - Market, Contract, Finance And Squad Long-Run Gates

## Status

Ready.

## Goal

Prove that two annual windows, three-day negotiations, preliminary agreements,
permanent transfers, contracts, finances, and squad turnover remain coherent
for decades without tuning away football problems.

## User-Visible Outcome

Long careers keep functioning: clubs buy and sell at believable times, talks
finish quickly, expiring players can move prospectively, budgets stay real,
and squads do not collapse or grow without bound.

## Scope

1. Extend the canonical long-run runner with window, negotiation-stage,
   pending-exposure, transfer, preliminary-agreement, activation, cancellation,
   contract, finance, ownership, registration, and squad metrics.
2. Assert every completed permanent transfer occurs inside a valid window.
3. Assert every negotiation stage resolves or expires within three calendar
   days and no counter resets its deadline.
4. Assert pending offers do not mutate actual finance while accepted/completed
   deals never exceed current cash, transfer, or annual-wage headroom.
5. Assert no duplicate open talk, duplicate transfer commit, duplicate future
   agreement, overlapping contract, dual ownership, or orphan registration.
6. Assert preliminary agreements are eligible, fee-free, non-owning before
   expiry, and activated exactly once.
7. Assert window-close expiry, same-day ordering, Inbox facts, AI decisions,
   annual payroll, and ledger effects are deterministic and idempotent.
8. Assert senior size, goalkeeper, department, age, value, wage, free-agent,
   expiry, and turnover distributions stay structurally playable.
9. Run `50 x 10`, then `250 x 30`, then at least `750 x 50` through deterministic
   resumable shards.
10. Repeat a prescribed sample and compare structured hashes.
11. Review warnings as football stories and user-fun signals; do not optimize
   only for green output.

## Implementation Contract

- The gate drives canonical career use cases, not a simplified market lab.
- Thresholds and classifications are documented before the final run and may
  not be weakened during execution.
- A pending exposure above current headroom is not corruption by itself; an
  accepted/completed unaffordable commitment is.
- `10,000 x 50` remains an available release-scale gate, not a Phase 79
  completion requirement.

## Expected Files

- focused Phase 79 gate/report Modules/tests under `packages/simulation-tools/`
- current long-run CLI/checkpoint/report wiring only where required
- current Phase 79 production/test Modules only for defects found by this gate
- `docs/audits/TRANSFER_MARKET_LONG_RUN_REPORT.md`
- generated structured reports under the current ignored report-output path
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No threshold weakening, warning suppression, hardcoded seed exception,
  decorative normalization, or separate simulator.
- No loans, extra leagues, broad finances, sponsor, stadium, debt, staff, or
  promotion feature to hide a failure.
- No browser rendering inside the runner.

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

Run the documented staged Phase 79 commands for `50 x 10`, `250 x 30`, and at
least `750 x 50`, including the repeated deterministic hash sample.

## Manual Inspection

- Review strong, average, weak, rich, poor, shallow, expiry-heavy, and high-
  exposure clubs at seasons 1, 10, 30, and 50.
- Inspect the worst transfer churn, free-agent accumulation, expired talks,
  budget, wage, and squad-structure worlds as football stories.

## Completion Criteria

- Every structural invariant and accepted beta-scale gate passes.
- Same-seed output is reproducible.
- Reports expose distributions, named warnings, and residual risks.
- Step 15 is the only next implementation step.
