# Step 04 - Dark Skin Surface Hierarchy Rework

## Goal

Make dark skins feel like polished football-management interfaces, not color
filters.

Dark skins should support fast scanning, clear primary actions, restrained
football atmosphere, and dense repeated use.

## Expected files

- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/app/theme-palettes.ts`
- `apps/web/src/visual-qa/theme-palette.spec.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

- Apply the new token taxonomy to dark skins.
- Rework dark-skin surfaces for:
  - app background;
  - shell header;
  - left Inbox/Posta rail;
  - dashboard panels;
  - match-preparation panels;
  - squad tables;
  - player detail panels;
  - buttons and navigation.
- Make primary actions visually clear without flooding the UI with gold.
- Make table headers and selected rows look intentional and consistent.
- Keep typography dense and readable.
- Ensure focus states remain obvious.

## What NOT to implement

- Do not rework light skins in this step except to keep compilation working.
- Do not touch tactical pitch SVG or pitch grass.
- Do not change tactical-board geometry or gameplay interactions.
- Do not add new UI sections.
- Do not introduce one-off hardcoded colors when a skin token should exist.

## Required checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
git diff --check
```

## Definition of Done

- Dark skins have clear surface hierarchy.
- Primary actions are clear and not overdecorated.
- Tables, navigation, and panels look like one coherent system.
- The tactical field remains unchanged.

