# 05 - Pre-Match And Full-Time Primary Action Cleanup

## Goal

Make pre-match and full-time use one clear primary action each.

## Scope

Update matchday read models and screen behavior so:

- pre-match primary action is "Start match";
- half-time primary action is "Start second half";
- full-time primary action is "Continue";
- full-time no longer renders duplicate Dashboard buttons;
- pressing full-time Continue returns to a clean dashboard state;
- matchday header does not show unrelated secondary dashboard routes when the
  phase already has a primary action;
- dashboard after full time does not display stale attention text from the
  previous matchday flow.

## Expected files

- `packages/ui/src/career/career-matchday-phase-view.ts`
- `packages/ui/src/career/career-matchday-phase-view.test.ts`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/matchday-demo.ts`
- `apps/web/src/features/matchday/matchday-demo.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not add live replay.
- Do not add persistence.
- Do not skip half-time.
- Do not remove full-time consequences.
- Do not create multiple final actions.

## Required checks

```bash
nvm use 24
pnpm exec vitest run packages/ui/src/career/career-matchday-phase-view.test.ts
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/features/matchday/matchday-demo.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/ui run typecheck
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Pre-match has one obvious start action.
- Full-time has one obvious Continue action.
- Dashboard return after full time is clean.
- Tests prove the phase action labels and routing.
