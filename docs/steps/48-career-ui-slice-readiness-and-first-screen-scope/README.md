# Phase 48 - Career UI Slice Readiness And First Screen Scope

## Goal

Prepare the first career UI slice without building the web app yet.

The goal is to define the smallest useful UI entry flow, the structured data it
needs, and the action/result contracts a future web adapter can consume. The UI
must not parse CLI prose, know engine internals, or reach into storage directly
for low-level details.

The real first screen of the app is an entry menu, not the career dashboard. It
must offer:

- New career.
- Continue career.
- Settings.

Settings must be scoped to app-level preferences that already matter before a
save is opened:

- language;
- currency;
- future-safe formatting keys for dates/numbers where needed.

After the manager creates or loads a save, the first career screen should answer
the manager's first real career questions:

- Where am I in this career?
- What is the next meaningful action?
- Is my selected club ready for the next match?
- Which squad, condition, tactic, lineup, and fixture facts matter now?
- What changed recently enough that I should care?

## Product intent

- Start the UI from a functional main menu, not a marketing page.
- Route new/continue career into the career dashboard/matchday hub.
- Keep the first career screen useful for a manager who wants to continue a
  save.
- Show decision support, not hidden recommendations that remove agency.
- Surface readiness and blockers clearly: missing lineup, missing tactic,
  tired starters, next fixture, selected club context, and available actions.
- Keep all user-facing text localizable through the existing i18n rules.
- Keep language and currency as app settings, not career-engine rules.
- Do not expose hidden truth such as exact potential beyond what the current
  presentation rules already allow.
- Do not introduce economics in this phase beyond documenting that future
  economics will need budget, wage, contract, stadium, ticket-price, and currency
  display support.

## Architecture intent

- Treat the UI as a new outer adapter, similar to CLI, not as a gameplay owner.
- Introduce UI-facing view contracts only where they provide leverage and
  locality for both CLI smoke output and the future web app.
- Keep engine, content, storage, simulation-tools, and domain free from React,
  browser APIs, and localized prose.
- Prefer small, deep read-model Modules over many shallow pass-through helpers.
- Keep data contracts structured: stable IDs, values, status keys, and
  translation keys instead of rendered strings.
- Reuse current career presentation decomposition from Phase 45 and long-run
  presentation boundaries from Phase 46.

## Ordered steps

1. `01-phase-47-output-review.md`
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
- `pnpm cli career --save=phase48-check --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase48-check --summary`
- `pnpm cli career --save=phase48-check --dashboard` after Step 06 introduces
  the dashboard smoke output.
- `git diff --check`

## What NOT to implement in this phase

- No React application.
- No `apps/web` implementation.
- No Tauri/desktop shell.
- No browser storage, IndexedDB, SQLite WASM, Web Worker, or Comlink setup.
- No visual design system.
- No finance/economics implementation.
- No player contracts, salaries, stadiums, ticket prices, or club balance-sheet
  simulation.
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

- The first app entry screen and the first career screen both have documented
  product scopes.
- Structured app-entry and career-dashboard view contracts exist or are
  explicitly judged not needed yet.
- The dashboard builder, if introduced, is deterministic and presentation-safe.
- CLI can smoke-test the same structured facts the future web UI will consume.
- The project has one clear recommendation for the next phase, likely the web
  app shell only if the entry/dashboard data contracts are ready.
- `docs/PROJECT_STATUS.md` records verification and the next action.
