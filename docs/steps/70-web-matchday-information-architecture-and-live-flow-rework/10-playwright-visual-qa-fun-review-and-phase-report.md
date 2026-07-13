# 10 - Playwright Visual QA, Fun Review, And Phase Report

## Goal

Close Phase 70 only after browser evidence proves that matchday is readable,
beautiful enough for the MVP, and no longer feels like a log table.

## Scope

- Run Playwright screenshot QA for:
  - pre-match;
  - first half;
  - half-time;
  - second half;
  - full time;
  - desktop viewport;
  - narrow viewport.
- Check:
  - no clipped text;
  - no overlapping sections;
  - no horizontal overflow;
  - no oversized phase buttons;
  - tabellino before ratings at full time;
  - one primary action per phase;
  - full-time dashboard return.
- Add or update a matchday visual QA spec if needed.
- Produce a final audit/report with:
  - changed files;
  - user-facing UX improvements;
  - dependency review;
  - code-quality review;
  - architecture review;
  - accessibility review;
  - fun review;
  - residual risks;
  - exactly one next-phase recommendation.
- Update `docs/ARCHITECTURE.md` if the matchday ownership changed.
- Update both roadmaps with the Phase 70 result.
- Update `docs/PROJECT_STATUS.md`.

## What NOT to implement

- No new feature work in the report step.
- No persistence.
- No new screen sections.
- No hiding known UX defects without documenting them.

## Expected files

- `apps/web/src/visual-qa/*matchday*.spec.ts`
- `docs/audits/WEB_MATCHDAY_INFORMATION_ARCHITECTURE_VISUAL_QA.md`
- `docs/audits/WEB_MATCHDAY_INFORMATION_ARCHITECTURE_REWORK_REPORT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
pnpm --filter @game/ui run typecheck
pnpm --filter @game/i18n run typecheck
pnpm check
git diff --check
```

If source code changed:

```bash
graphify update .
```

## Visual check for the user

Review the generated desktop and narrow screenshots.

Acceptance:

- pre-match is clean confirmation;
- first and second halves are visible live phases;
- half-time is a useful decision workspace;
- full time starts with tabellino and then pagelle;
- the screen no longer feels like a debug log or scattered dashboard.

## Definition of Done

- Phase 70 report exists.
- Playwright evidence exists for all required matchday states.
- `pnpm check` passes or a real blocker is documented.
- The report recommends exactly one next phase.
