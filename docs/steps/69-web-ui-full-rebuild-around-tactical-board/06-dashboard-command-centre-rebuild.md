# 06 - Dashboard Command Centre Rebuild

## Goal

Rebuild the dashboard as the career command centre, not a generic report page.

The dashboard should immediately answer:

- where am I in the career?
- what needs my attention?
- what is the next meaningful action?
- what is the next match context?

## Scope

- Rebuild `CareerDashboardScreen` inside `AppShell`.
- Use existing dashboard read models and presenters.
- Keep one dominant primary action.
- Keep blockers/attention near the top.
- Keep table/condition/recent-match information compact and useful.

## What NOT to implement

- No new data source.
- No decorative metrics.
- No hidden automatic manager advice.
- No market/finance/youth sections.
- No matchday UI rebuild.

## Expected files

- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx`
- `apps/web/src/features/dashboard/career-dashboard-presenter.ts` only if the
  presentation contract needs a small, tested cleanup.
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/dashboard
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Open the career dashboard.

Acceptance:

- the next action is obvious;
- blockers are not buried;
- the dashboard feels like a football manager control room;
- there are no dead action buttons;
- desktop and narrow layouts remain readable.

Stop after this step for user approval before continuing.

## Definition of Done

- Dashboard has the new command-centre hierarchy.
- It uses real career facts only.
- Tests/typecheck pass.
- Status and roadmap are updated.
