# 07 - UI Readiness Report And Next Phase Decision

## Goal

Close Phase 48 with a documented readiness decision.

This step should decide whether the project is ready to create the first web app
shell with main menu or whether another data/architecture hardening phase is
needed first.

## Expected files

- `docs/audits/CAREER_UI_SLICE_READINESS_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Create `docs/audits/CAREER_UI_SLICE_READINESS_REPORT.md`.
- Summarize what Phase 48 changed:
  - app-entry/main-menu scope;
  - first post-load career-screen scope;
  - app-entry view/action contracts;
  - UI-facing view contract;
  - builder;
  - action availability/result contracts;
  - CLI dashboard smoke output.
- Record the package dependency direction after this phase.
- Record what the future web UI can consume without parsing CLI prose.
- Record what remains intentionally outside the first UI slice.
- Record that economics, salaries, player contracts, stadiums, ticket prices,
  and club finance simulation remain outside Phase 48 except for currency
  preference readiness.
- Update `docs/ARCHITECTURE.md` with the new UI/read-model boundary only if
  Phase 48 introduced source Modules that future developers must understand.
- Recommend exactly one next phase. Recommended default if checks pass:
  `Phase 49 - Web App Shell, Main Menu, And Career Dashboard Prototype`.
- Do not create Phase 49 documents in this step unless explicitly requested.

## What NOT to implement

- Do not start the web app.
- Do not add new UI features.
- Do not change gameplay behavior.
- Do not implement economics, salaries, player contracts, stadiums, ticket
  prices, or club finance simulation.
- Do not expand long-run reporting.
- Do not hide unresolved blockers.
- Do not start the next phase.

## Required checks

- `test -f docs/audits/CAREER_UI_SLICE_READINESS_REPORT.md`
- `pnpm --filter @game/ui run typecheck` if `@game/ui` exists.
- `pnpm --filter @game/cli run typecheck` if CLI dashboard output exists.
- `pnpm --filter @game/i18n run typecheck` if localized labels changed.
- `pnpm check`
- `pnpm cli career --save=phase48-check --dashboard` if Step 06 completed.
- `git diff --check`

## Definition of Done

- Phase 48 has a clear readiness report.
- The report names the next phase and why.
- `docs/ARCHITECTURE.md` reflects any new package/source boundary.
- `docs/PROJECT_STATUS.md` marks Phase 48 complete or blocked.
