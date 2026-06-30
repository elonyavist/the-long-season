# 06 - Dashboard And Inbox Command Centre Rework

## Goal

Rework dashboard and Inbox/Posta into the first MVP command centre.

## Scope

Implement the approved dashboard and Inbox/Posta direction:

- dashboard as club command centre, not report grid;
- Inbox/Posta as attention/action surface;
- one clear next action;
- compact club/date/fixture context;
- blockers and attention in the first useful viewport;
- remove or hide low-value empty panels;
- preserve existing structured read-model facts.

## Expected files

- `apps/web/src/features/dashboard/CareerDashboardScreen.tsx`
- `apps/web/src/features/dashboard/*.test.ts`
- `apps/web/src/features/career-shell/CareerInboxPanel.tsx`
- `apps/web/src/features/career-shell/*.test.tsx`
- `apps/web/src/styles/*.css`
- `packages/ui/src/career/build-career-dashboard-view.ts`
- `packages/ui/src/career/build-career-dashboard-view.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add persistent saves.
- Do not add new Inbox categories that cannot be produced by current facts.
- Do not add fake market/youth/finance alerts.
- Do not create decorative cards with no manager decision.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/build-career-dashboard-view.test.ts
pnpm exec vitest run apps/web/src/features/dashboard/CareerDashboardScreen.test.tsx
pnpm exec vitest run apps/web/src/features/career-shell/CareerShell.test.tsx
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
git diff --check
```

## Done when

- Dashboard and Inbox/Posta feel like a football manager command centre.
- The next action is obvious.
- No dead or decorative action is visible.
- Current structured facts remain the only source of truth.
