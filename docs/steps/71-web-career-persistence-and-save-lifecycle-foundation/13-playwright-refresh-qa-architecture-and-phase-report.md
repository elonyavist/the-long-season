# 13 - Playwright Refresh QA Architecture And Phase Report

## Goal

Close Phase 71 only after browser evidence proves that the complete career loop
survives reloads and that the migration left no parallel demo lifecycle.

## Scope

- Run Playwright lifecycle QA on desktop and narrow viewports:
  - empty main menu;
  - create new career;
  - save visible in Continue;
  - refresh and load dashboard;
  - Continue/Posta stop;
  - save preparation and refresh at pre-match;
  - reach half-time, apply a decision, refresh, and resume;
  - complete full time, refresh, and return to the correct dashboard state;
  - typed unavailable/corrupt storage state.
- Verify no horizontal overflow, clipped labels, focus traps, or inaccessible
  loading/error controls.
- Inspect OPFS/SQLite state and prove no career payload is written to
  localStorage or IndexedDB.
- Run a source/dependency/dead-code audit.
- Update `docs/ARCHITECTURE.md` with runtime, worker, storage, schema, and
  rehydration ownership.
- Produce a final report covering:
  - user-facing result;
  - storage and migration design;
  - dependency review;
  - code-quality/deletion review;
  - architecture review;
  - accessibility review;
  - performance and save-size observations;
  - residual risks;
  - exactly one next-phase recommendation.
- Update both roadmaps and project status.

## What NOT to implement

- No new feature work in the report step.
- No Inbox/Posta category expansion.
- No hiding persistence or UX failures by weakening tests.
- No undocumented remaining demo/fallback path.

## Expected files

- `apps/web/src/visual-qa/web-career-persistence.spec.ts`
- `docs/audits/WEB_CAREER_PERSISTENCE_VISUAL_QA.md`
- `docs/audits/WEB_CAREER_PERSISTENCE_AND_SAVE_LIFECYCLE_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm --filter @game/storage run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm depcruise
pnpm check
pnpm exec playwright test apps/web/src/visual-qa/web-career-persistence.spec.ts
git diff --check
graphify update .
```

## Visual check for the user

Review all desktop and narrow screenshots and manually perform one full reload
cycle.

Acceptance:

- the career never disappears after refresh;
- Continue loads the selected save rather than a singleton demo;
- dashboard, Posta, preparation, half-time, full time, and return flow remain
  visually coherent;
- loading/error states are understandable;
- there is one primary action per decision state;
- no replaced demo lifecycle remains in production.

## Definition of Done

- Durable create/list/load/continue is proven in Chromium.
- Preparation and half-time checkpoint recovery are proven.
- Full-time commit is proven idempotent.
- SQLite/OPFS is the only browser career persistence implementation.
- `pnpm check` passes.
- Architecture and phase reports exist.
- The report recommends exactly one next phase.

