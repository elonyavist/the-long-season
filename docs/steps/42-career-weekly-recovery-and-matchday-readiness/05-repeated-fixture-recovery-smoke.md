# 05 - Repeated Fixture Recovery Smoke

## Goal

Run a repeated selected-club fixture smoke check to verify that recovery and match spend behave coherently over multiple matchdays.

## Expected files

- `docs/audits/CAREER_WEEKLY_RECOVERY_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- Source or test files only if the smoke exposes a blocker in the current step scope.
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create or reuse a deterministic career save for Phase 42 smoke testing.
- Save a selected-club lineup and tactic.
- Advance at least four selected-club fixtures.
- Record:
  - fixture dates;
  - recovery day counts;
  - pre-match readiness;
  - post-match condition;
  - whether normal weekly rhythm fully recovers the first-choice lineup;
  - whether the current calendar contains any short-gap pressure.
- Decide if the observed output is fun:
  - if normal weekly recovery is fair, keep it;
  - if fatigue never matters because the calendar has no pressure, record that as a future calendar/schedule finding;
  - if fatigue collapses unrealistically, fix the current phase before moving on.
- Do not tune values only to make output look mathematically tidy.

## What NOT to implement

- Do not create a new scheduling system.
- Do not add fixture congestion artificially unless the documented step requires it.
- Do not change match engine balance.
- Do not hide real warnings.
- Do not add UI.

## Required checks

- `pnpm check`
- `pnpm cli career --save=phase42-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase42-check --set-lineup-demo=pro01-first-team`
- `pnpm cli career --save=phase42-check --set-tactic-demo=pro01-balanced`
- `pnpm cli career --save=phase42-check --advance-next-fixture`
- `pnpm cli career --save=phase42-check --advance-next-fixture`
- `pnpm cli career --save=phase42-check --advance-next-fixture`
- `pnpm cli career --save=phase42-check --advance-next-fixture --fixture-explanation`
- `pnpm cli career --save=phase42-check --squad`
- `git diff --check`

## Definition of Done

- The audit includes a multi-fixture recovery trace.
- Any remaining concern is classified as either current-phase blocker or future scheduling/design work.
- The career loop is not allowed to silently drain condition without recovery.

