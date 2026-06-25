# Step 07 - Visual QA And Art Direction Gate

## Goal

Prove that the accepted skins are not only technically valid, but visually good
enough to build future web sections on top of them.

## Expected files

- `apps/web/src/visual-qa/theme-palette.spec.ts`
- `docs/audits/WEB_VISUAL_IDENTITY_QA.md`
- `docs/PROJECT_STATUS.md`

## What to implement

- Update Playwright QA to cycle through the final accepted skins.
- Capture desktop and narrow screenshots for:
  - app entry/settings;
  - dashboard;
  - match preparation after `Auto`;
  - at least one screen with Inbox/Posta rail visible.
- Keep existing automated guards:
  - selected skin applied;
  - no horizontal overflow;
  - stable semantic colors;
  - stable field colors.
- Add visual-quality inspection notes per skin:
  - does it look like a football-manager skin?
  - is the first viewport credible?
  - are primary actions obvious?
  - are tables readable and dense?
  - are blockers visible without ugly overemphasis?
  - does the light skin feel intentional?
- Mark any skin that fails manual visual review as rejected or needing rework.

## What NOT to implement

- Do not accept a skin just because screenshots were generated.
- Do not change the tactical pitch SVG or pitch grass to make a skin look
  better.
- Do not hide known visual issues in the report.

## Required checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run build
node --experimental-strip-types apps/web/src/visual-qa/theme-palette.spec.ts
git diff --check
```

## Definition of Done

- Every accepted skin has desktop and narrow screenshot evidence.
- The audit explicitly says which skins passed manual art-direction review.
- The audit records any rejected visual result and the fix applied.
- The tactical field remains unchanged.

