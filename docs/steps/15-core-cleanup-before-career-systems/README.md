# Core Cleanup Before Career Systems Steps

## Goal

Close the concrete Phase 14 audit findings before opening market, youth, economy, persistence, or career systems.

This phase is a narrow rework phase. It exists to keep the deterministic core easy to extend before larger long-term systems multiply state, CLI surfaces, and save/career contracts.

## Why we implement it this way

Phase 14 scored the current core `86/100`: healthy, deterministic, and good enough to build on, but with a few risks that should not be carried into market or youth:

1. `Object.values()` is used inside an engine simulation path.
2. `apps/cli/src/commands/simulate-season.ts` has become too large and mixes many responsibilities.
3. stale comments still describe factual squad-fit notes as market hints.
4. fixture state still lives as a slice around `GameState`, while career/persistence will need one canonical state shape.

Market and youth will both depend on clear player state, fixture history, formation fit, CLI inspection, localization, and deterministic season progression. If these cleanup items are postponed, the next feature phases will be harder to reason about and easier to corrupt with compatibility leftovers.

The cleanup must be incremental: fix one risk at a time, preserve current behavior unless a step explicitly changes a contract, and verify every step with focused tests plus the existing CLI smoke checks.

## What to implement

- Re-read the Phase 14 audit and confirm the exact cleanup scope.
- Remove the engine `Object.values()` order-risk by preserving explicit fixture-lineup override order.
- Rename stale internal wording that still frames factual squad-fit notes as market advice.
- Split the large `simulate-season` CLI module into smaller private modules without changing the public command behavior.
- Decide and implement the smallest fixture-state cleanup needed before career systems:
  - either consolidate fixtures/fixture IDs into `GameState`;
  - or write a documented temporary boundary if full consolidation would create too much churn for this phase.
- Keep localization rules intact: no new hardcoded user-facing labels.
- Keep manager-choice rules intact:
  - no automatic best XI;
  - no automatic lineup rotation;
  - no automatic tactic switching;
  - no hidden market recommendation.
- Finish with a short cleanup report and a decision on the next feature phase.

## What NOT to implement

- Do not implement market, youth, contracts, scouting, economy, staff, facilities, injuries, substitutions, training, morale, form, UI, Tauri, persistence UI, or career saves.
- Do not tune match balance.
- Do not rewrite match engine algorithms.
- Do not add new manager-facing advice that tells the user who to buy, sell, start, rotate, or switch to.
- Do not add hardcoded presentation text.
- Do not keep dead code, unused compatibility helpers, or duplicated local logic after a cleanup step.
- Do not start Phase 16.

## Allowed dependencies

- No new runtime dependencies.
- Existing package dependency rules remain binding:
  - `domain -> nothing`
  - `shared -> nothing`
  - `engine -> domain, shared`
  - `content -> domain, shared`
  - `storage -> domain, shared`
  - `simulation-tools -> domain, engine, shared`
  - `i18n -> presentation/localization only`
  - `apps/cli -> engine, content, storage, simulation-tools, shared, i18n`

If the fixture-state cleanup changes domain contracts, keep domain dependency-free and update all affected tests in the same step.

## Expected files

- `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`
- `docs/steps/15-core-cleanup-before-career-systems/02-ordered-fixture-lineup-overrides.md`
- `docs/steps/15-core-cleanup-before-career-systems/03-squad-fit-naming-cleanup.md`
- `docs/steps/15-core-cleanup-before-career-systems/04-cli-simulate-season-module-split.md`
- `docs/steps/15-core-cleanup-before-career-systems/05-game-state-fixture-slice-decision.md`
- `docs/steps/15-core-cleanup-before-career-systems/06-cleanup-report-and-next-phase-decision.md`
- Future implementation output: `docs/audits/CORE_CLEANUP_REPORT.md`

## Required tests

- No tests for this overview.
- Each implementation step defines its own checks.
- Final phase verification should run `pnpm check`.

## Definition of Done

- The Phase 14 high finding is fixed or explicitly blocked with a narrow reason.
- The CLI `simulate-season` implementation has better locality without changing its user-facing behavior.
- Stale market-hint naming around factual squad-fit notes is removed.
- Fixture state has a documented and tested path before persistence/career systems.
- `docs/audits/CORE_CLEANUP_REPORT.md` records what was cleaned, what remains, and whether market or youth should start next.
- `docs/PROJECT_STATUS.md` marks Phase 15 complete or blocked and identifies the next active step.
- The project still identifies exactly one active implementation step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, `docs/audits/ENGINE_CORE_AUDIT.md`, and `docs/steps/15-core-cleanup-before-career-systems/01-phase-14-findings-review.md`. Confirm the Phase 15 cleanup scope, run the required scans for this step, update `docs/PROJECT_STATUS.md`, and stop after this step unless executing the whole phase prompt.
