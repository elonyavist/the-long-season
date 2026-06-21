# CLI Market Inspection

## Goal

Expose the permanent-transfer MVP through deterministic CLI inspection.

## Why we implement it this way

The user needs to see and judge the market MVP before persistence or career systems exist. CLI inspection should make the current rules falsifiable: show an accepted transfer preview, show a rejected unrealistic transfer, show budget impact, and state clearly that no save is written.

The CLI must remain presentation-only. It should call engine market Modules and render localized labels.

## What to implement

- Add a `simulate-season` market inspection option, for example:
  - `--market-demo=pro01-affordable-permanent`;
  - `--market-demo=pro01-star-rejected`.
- Use fake deterministic content and a selected club context.
- Render:
  - selected club;
  - target player;
  - selling club;
  - buying club;
  - valuation;
  - buyer transfer budget before/after;
  - feasibility status;
  - structured rejection reasons rendered through localization;
  - in-memory roster preview for accepted scenarios;
  - explicit "inspection only/no save written" message through localization.
- Add English fallback and Italian labels at minimum if the existing i18n catalog requires all supported languages, then provide all five supported language labels.
- Add CLI tests for:
  - accepted market demo;
  - rejected unrealistic market demo;
  - unsupported market demo key;
  - Italian output smoke;
  - no final table required if the market-demo output is designed as a focused inspection view.

## What NOT to implement

- Do not add a new persistent save command.
- Do not call storage.
- Do not write files.
- Do not implement interactive target selection.
- Do not add UI, web, Tauri, or browser code.
- Do not add loans, contracts, wages, windows, scouting, AI, negotiation, installments, or player exchanges.
- Do not auto-generate market advice from formation-fit notes.
- Do not hardcode user-facing labels outside i18n.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared, i18n`
- `i18n -> presentation/localization only`

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season/parse-args.ts`
- `apps/cli/src/commands/simulate-season/profile-keys.ts`
- `apps/cli/src/commands/simulate-season/market-demo-output.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/17-market-mvp-permanent-transfers/07-phase-17-review-and-next-phase-decision.md` only if CLI behavior changes review scope.

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts packages/i18n/src/labels.test.ts`
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-star-rejected`
- `pnpm cli simulate-season --seed=demo-001 --market-demo=pro01-affordable-permanent --lang=it`
- `rg -n "\"[A-Z][^\"]*(transfer|market|budget|value|accepted|rejected|save|inspection)" apps/cli/src packages/engine/src packages/domain/src`

The hardcoded-label scan should not reveal new user-facing prose outside i18n.

## Definition of Done

- CLI can inspect at least one accepted and one rejected permanent-transfer scenario.
- CLI output states that the result is inspection-only and not persisted.
- User-facing text is localized.
- CLI does not call storage or create saves.
- Existing season, fixture, formation, tactic, lineup, condition, and balance CLI paths still pass `pnpm check`.
- `docs/PROJECT_STATUS.md` records exactly what the user should manually inspect.

## Claude Code task prompt

Read the required project docs and this step document. Add only CLI inspection for existing permanent-transfer MVP behavior. Do not add persistence, storage writes, interactive selection, loans, contracts, wages, scouting, AI, windows, or hardcoded user-facing labels. Run the required checks and CLI smokes, update `docs/PROJECT_STATUS.md` with what I should inspect, and stop unless executing the whole phase prompt.
