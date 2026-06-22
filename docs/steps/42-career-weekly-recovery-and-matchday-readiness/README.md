# Phase 42 - Career Weekly Recovery And Matchday Readiness

## Goal

Make the playable career loop handle deterministic between-fixture recovery before matchday condition spend, so the selected club has a credible fitness rhythm instead of a one-way drain.

Phase 41 made matchday consequences visible and persistent. The next missing piece is the recovery cycle: after a normal weekly gap, players should recover enough to make repeated selection plausible; after a short gap, fatigue should still create a meaningful selection pressure for the manager.

## Product intent

- The user chooses the lineup and tactics.
- The game exposes player readiness and consequences.
- The system must not advise or auto-rotate the squad.
- Normal league rhythm should feel fair.
- Congested fixture rhythm should create pressure.
- The output must help us judge whether the career loop is becoming playable.

## Ordered steps

1. `01-phase-41-output-review.md`
2. `02-career-recovery-contract.md`
3. `03-career-advance-recovery-application.md`
4. `04-cli-pre-match-readiness-output.md`
5. `05-repeated-fixture-recovery-smoke.md`
6. `06-phase-report-and-next-decision.md`

## Phase-level checks

- Focused tests for touched engine, career, CLI, and i18n files.
- `pnpm check`
- `pnpm cli career --save=phase42-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase42-check --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase42-check --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase42-check --summary`
- `pnpm cli career --save=phase42-check --advance-next-fixture`
- `pnpm cli career --save=phase42-check --summary`
- `pnpm cli career --save=phase42-check --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase42-check --squad`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## What NOT to implement in this phase

- No UI.
- No injuries.
- No morale.
- No training system.
- No medical or staff modifiers.
- No facilities.
- No automatic lineup selection.
- No automatic tactical advice.
- No transfer, youth, or player generation changes.
- No match scoring probability tuning.
- No table balance tuning.
- No rendered prose persisted in career saves.

## Definition of Done

- Career fixture advancement applies deterministic recovery before match condition spend.
- The recovery logic is pure, tested, and date-based.
- Weekly fixture gaps produce plausible recovery.
- Short gaps can still leave players below full condition.
- CLI career outputs expose enough readiness information for manual inspection.
- The manager still makes the lineup decision manually.
- Phase status is updated with verification results and the next recommended decision.

