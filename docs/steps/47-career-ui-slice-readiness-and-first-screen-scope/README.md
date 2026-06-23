# Phase 47 - Career UI Slice Readiness And First Screen Scope

## Goal

Prepare the first career UI slice without building the web app yet.

The goal is to define the smallest useful first screen, the structured data it
needs, and the action/result contracts a future web adapter can consume. The UI
must not parse CLI prose, know engine internals, or reach into storage directly
for low-level details.

The first screen should answer the manager's first real questions:

- Where am I in this career?
- What is the next meaningful action?
- Is my selected club ready for the next match?
- Which squad, condition, tactic, lineup, and fixture facts matter now?
- What changed recently enough that I should care?

## Product intent

- Start the UI from the career dashboard/matchday hub, not a marketing page.
- Keep the first screen useful for a manager who wants to continue a save.
- Show decision support, not hidden recommendations that remove agency.
- Surface readiness and blockers clearly: missing lineup, missing tactic,
  tired starters, next fixture, selected club context, and available actions.
- Keep all user-facing text localizable through the existing i18n rules.
- Do not expose hidden truth such as exact potential beyond what the current
  presentation rules already allow.

## Architecture intent

- Treat the UI as a new outer adapter, similar to CLI, not as a gameplay owner.
- Introduce UI-facing view contracts only where they provide leverage and
  locality for both CLI smoke output and the future web app.
- Keep engine, content, storage, simulation-tools, and domain free from React,
  browser APIs, and localized prose.
- Prefer a small, deep career dashboard Module over many shallow pass-through
  helpers.
- Keep data contracts structured: stable IDs, values, status keys, and
  translation keys instead of rendered strings.
- Reuse current career presentation decomposition from Phase 45 and long-run
  presentation boundaries from Phase 46.

## Ordered steps

1. `01-phase-46-output-review.md`
2. `02-first-screen-product-scope.md`
3. `03-career-dashboard-view-contract.md`
4. `04-career-dashboard-view-builder.md`
5. `05-career-action-result-contracts.md`
6. `06-cli-dashboard-smoke-output.md`
7. `07-ui-readiness-report-and-next-phase-decision.md`

## Phase-level checks

- Focused tests for every touched package or CLI module.
- `pnpm --filter @game/ui run typecheck` when a UI/read-model package is
  introduced or touched.
- `pnpm --filter @game/cli run typecheck` when CLI smoke output is touched.
- `pnpm --filter @game/i18n run typecheck` when localized labels are touched.
- `pnpm depcruise` when package boundaries or workspace packages change.
- `pnpm check`
- `pnpm cli career --save=phase47-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase47-check --summary`
- `pnpm cli career --save=phase47-check --dashboard` after Step 06 introduces
  the dashboard smoke output.
- `git diff --check`

## What NOT to implement in this phase

- No React application.
- No `apps/web` implementation.
- No Tauri/desktop shell.
- No browser storage, IndexedDB, SQLite WASM, Web Worker, or Comlink setup.
- No visual design system.
- No match engine changes.
- No player generation, youth, market, development, table, or scoring tuning.
- No new career save schema unless a step proves an existing persisted fact is
  missing and scopes the migration explicitly.
- No CLI prose parsing for UI data.
- No hardcoded user-facing labels.
- No hidden recommendations about transfers or squad needs.
- No dead wrappers, compatibility aliases, temporary duplicate flows, or
  deferred cleanup.

## Definition of Done

- The first career UI screen has a documented product scope.
- A structured career dashboard view contract exists or is explicitly judged not
  needed yet.
- The dashboard builder, if introduced, is deterministic and presentation-safe.
- CLI can smoke-test the same structured facts the future web UI will consume.
- The project has one clear recommendation for the next phase, likely the web
  app shell only if the data contract is ready.
- `docs/PROJECT_STATUS.md` records verification and the next action.
