# Step 14 - Market, Contract, Finance And Squad Long-Run Gates

## Status

Reopened and paused while the accepted Phase 80, 80A, and 80B reworks are
documented and executed. A
first execution was recorded as complete, but its gate never ran the
AI market (`transferWindows` was not threaded into `advanceCareerOneSeason`), so
every market check passed vacuously over empty negotiation state and the
published report actually says `FAIL`. The wiring, a valuation crash on
15-year-old prodigies, and the locally restated window dates were fixed at that
time; the later Phase 79C model exposed new exceptional-generation and prospect
valuation defects now owned by Phase 79D. The stale audit report still has to
be replaced before this step can close. See the Step 14 and Phase 79D entries
in `docs/PROJECT_STATUS.md`.

The 2026-07-27 implementation audit also corrected durable response clocks,
counter/accepted-stage expiry, submission-date ordering, non-UI transfer-window
bypasses, and the legacy direct CLI commit path. Standard checks and the real
SQLite/OPFS round-trip pass; the release gate was intentionally not run during
that remediation and this step remains Reopened.

A subsequent `50x20` market-active diagnostic completed on 2026-07-27. All
Phase 79 structural counters stayed clean (`0` contract/finance violations,
minimum squad `18`, no undersized club, no missing natural goalkeeper), while
the aggregate gate failed one of 50 worlds only on a seven-season
`champion_streak`. Transfer turnover occurred in 13 worlds and remained a
monitor warning in 37. The result is useful medium-run evidence but does not
replace the required release-scale closeout gate.

That evidence interposed
`docs/steps/79a-transfer-market-activity-free-agent-economy-and-long-run-diagnostics/`.
Phase 79A is now Done. Its final repeated `50x20` records `1,719` permanent
completions, maximum free-agent share `0.2274`, wage pressure share `0.1900`,
exact-ceiling share `0.0400`, zero overspend, minimum squad `18`, no club below
the minimum, no club without a natural goalkeeper, and zero contract/finance
structural violations. The generic report remains red only for
`champion_streak=7` in worlds `00001` and `00046`.

The user-requested
`docs/steps/79b-squad-market-player-workspace-ui-ux-and-career-statistics/`
interposition is Done and has returned control here. This step is again the
parent step but is currently paused through Phase 81. Neither the
Phase 79A medium run nor any Phase 79B browser check is a substitute for the
final gate. The long run remains unrun and unclaimed.

The subsequent
`docs/steps/79c-global-player-rating-three-division-world-and-market-economy-calibration/`
interposition is also Done and has returned control here. Its bounded `10x10`
passed with zero failed worlds, minimum squad `18`, zero contract/finance
structural violations, zero rating-cap violation worlds, `3,882` measured
free-agent signings, and exact zero-fee semantics. Those results validate the
new global-rating, three-division economy at calibration scale but do not
replace this step's release-scale sequence.

The subsequent
`docs/steps/79d-exceptional-player-generation-prospect-economy-and-non-vacuous-diagnostics/`
interposition is Done by explicit product decision. It corrected the
age/current/potential-range/value contradictions, effective rarity, annual
intake, cap attraction/display identity, asking/offer/counter/completed-fee
spread, and zero-observation semantics. Focused checks, `pnpm check`, build,
Playwright `29/29`, and manual browser QA pass. Its attempted direct `50x20`
was stopped, produced no report, and is not claimed as corrective evidence.
The accepted Phase 80 UI, Phase 80A player-model, Phase 80B market/loan, Phase
80C competitive-race, and Phase 81 match-engine reworks must complete before
this step resumes. Phase 81 Step 12 must run one checkpointed `50x20` with
`50` stable shards and exactly `7` workers so the cohort observes the final
player, market, and match model rather than one about to change. This step's
own release gate remains separate, unrun, and unclaimed.

### Two Red Checks Handed Here By Phase 81 Step 15, 2026-08-07

Phase 81's closing `50 x 20` - `50` worlds, `20` seasons, engine evidence only -
leaves two of this step's structural checks red. **Phase 81 named them and did not
adopt them**, because it may make no market change; they are recorded here so this
step's release gate does not meet them for the first time.

| Check | Worlds | Rule |
|---|---:|---|
| `contract_finance_structural_integrity` | `13/50` | `structure`, `pass 0; fail >0` |
| `preliminary_agreement_integrity` | `12/50` | `structure`, `pass 0; fail >0` |

Both live in `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
(the second at `:742`, reading `preliminaryAgreementViolationCount`). Aggregate
contract/finance structural violations were `14` across those `13` worlds.

`preliminary_agreement_integrity` is **new to the record**: no earlier run
reported it. The likely reason is horizon rather than new breakage - the Phase 81
cohort runs twenty seasons where the preceding checks ran ten, and
`contract_finance_structural_integrity` moved from `1` of `20` worlds at ten
seasons to `13` of `50` at twenty over the same change. That is a hypothesis Phase
81 stated and deliberately did not test, because testing it is this step's work.

Neither check is a match-engine or tactical check, and neither was affected by any
Phase 81 production change: Phase 81 Step 15 modified no production file at all.

Twenty seasons cover a representative age-15-to-35 player arc, the year-10 and
year-20 stock checks, and twice the project's `10+`-season long-horizon
minimum. With `54` clubs and `918` opening league fixtures per world, the
release sequence prioritizes breadth across `750` deterministic worlds while
keeping runtime operationally bounded. It does not prove multi-generational
equilibrium or any behavior after year 20, and the final report must not claim
otherwise.

## Goal

Prove that two annual windows, three-day negotiations, preliminary agreements,
permanent transfers, contracts, finances, and squad turnover remain coherent
for a complete twenty-season career without tuning away football problems.

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
9. Preserve the Phase 79D exact-cap display invariant and non-vacuous
   asking/offer/counter/agreed/completed-fee observations.
10. Run `50 x 10`, then `250 x 20`, then at least `750 x 20` through deterministic
   resumable shards.
11. Repeat a prescribed sample and compare structured hashes.
12. Review warnings as football stories and user-fun signals; do not optimize
   only for green output.

## Implementation Contract

- The gate drives canonical career use cases, not a simplified market lab.
- Thresholds and classifications are documented before the final run and may
  not be weakened during execution.
- A pending exposure above current headroom is not corruption by itself; an
  accepted/completed unaffordable commitment is.
- `10,000 x 20` remains an available release-scale gate, not a Phase 79
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

Run the documented staged Phase 79 commands for `50 x 10`, `250 x 20`, and at
least `750 x 20`, including the repeated deterministic hash sample.

## Manual Inspection

- Review strong, average, weak, rich, poor, shallow, expiry-heavy, and high-
  exposure clubs at seasons 1, 10, and 20.
- Inspect the worst transfer churn, free-agent accumulation, expired talks,
  budget, wage, and squad-structure worlds as football stories.

## Completion Criteria

- Every structural invariant and accepted beta-scale gate passes.
- Same-seed output is reproducible.
- Reports expose distributions, named warnings, and residual risks.
- Step 15 is the only next implementation step.
