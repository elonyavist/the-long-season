# Phase 31 - Career Squad Refresh And Transfer Turnover Simulation

## Goal

Make the career world survive long simulations without squad collapse.

Phase 30 proved that match balance is credible, but long-run career structure fails because players age while squads do not refresh. Phase 31 adds deterministic end-of-season exits, replacement intake, squad-shape maintenance, and minimal transfer turnover so the game can be validated over a much longer horizon before UI work.

## Product intent

- Keep the user's career world believable across decades.
- Make squads breathe: veterans leave, new players enter, and some players move between clubs.
- Preserve the manager principle: the system can refresh the world, but it must not auto-pick the user's lineup, tactic, or market strategy.
- Keep the first implementation narrow: no advanced contracts, loans, auctions, installments, or full AI negotiation.
- Produce measurable evidence that the career loop can support UI work later.

## Step order

1. `01-phase-30-findings-review.md`
2. `02-player-exit-and-retirement-rules.md`
3. `03-new-player-intake-pool.md`
4. `04-squad-size-and-role-balance-maintenance.md`
5. `05-transfer-turnover-simulation-mvp.md`
6. `06-career-long-run-integration.md`
7. `07-turnover-and-age-distribution-metrics.md`
8. `08-long-run-regression-gates.md`
9. `08a-long-run-gate-anomaly-rework.md`
10. `09-phase-31-final-report-and-next-decision.md`

## Phase constraints

- Do not implement UI.
- Do not implement full market negotiation.
- Do not add contracts, wages, loans, installments, auctions, or swap-deal complexity.
- Do not let the system choose the user's lineup or tactics.
- Do not hide aging, turnover, or squad-balance failures by widening thresholds.
- Do not tune match scoring unless the final report proves squad refresh broke balance.
- Preserve deterministic output by seed.
- Keep content fictional and consistent with existing player generation quality rules.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched engine/content/simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- a deterministic smoke regression over `50` worlds and `10` seasons per world;
- a deterministic development regression over `250` worlds and `30` seasons per world;
- a deterministic final hard gate over `10,000` worlds and `50` seasons per world, run explicitly and not as part of `pnpm check`;
- `git diff --check`.

## Long-Run Validation Gates

Phase 31 uses a progressive validation ladder:

1. `50` worlds x `10` seasons: fast smoke proof that the loop runs and obvious collapses are absent.
2. `250` worlds x `30` seasons: development regression gate for normal Phase 31 completion confidence.
3. `10,000` worlds x `50` seasons: final hard gate before treating the career squad refresh loop as structurally reliable.

The `10,000` x `50` gate is intentionally expensive. It must be run with an explicit command/report and must not be included in `pnpm check`.

Phase 31 is complete only when:

- the smoke, development, and final hard gates complete with the documented world/season counts;
- no world crashes or becomes nondeterministic;
- no club falls below the minimum viable squad size;
- no club loses natural goalkeeper coverage;
- role/department coverage remains playable;
- average age and age buckets remain credible;
- transfer/squad turnover metrics are real, not unavailable;
- match balance does not visibly regress;
- the final report identifies any remaining anomalies without hiding them.

If an earlier gate fails, do not run larger gates just to collect more noise.
Record the failing seeds, add a focused rework step, fix the current failure
class, and restart the validation ladder from `50` worlds x `10` seasons.

## Definition of Done

- Career squads refresh deterministically at season boundaries.
- Player exits, new-player intake, role-balance maintenance, and simple turnover are implemented as narrow systems.
- Long-run reports expose real turnover and age-distribution metrics.
- The long-run validation ladder is documented and executed through the final `10,000`-world, `50`-season hard gate.
- `docs/PROJECT_STATUS.md` records whether the project can move toward UI exploration or needs another simulation-focused phase.
