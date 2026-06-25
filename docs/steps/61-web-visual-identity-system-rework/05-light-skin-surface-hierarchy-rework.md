# Step 05 - Light Skin Surface Hierarchy Rework

## Goal

Make light skins feel like deliberate match-programme or archive-office skins,
not washed-out versions of the dark UI.

## Expected files

- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/app/theme-palettes.ts`
- `apps/web/src/visual-qa/theme-palette.spec.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

- Define light-skin surface rules explicitly:
  - app background should feel like paper or office backing, not blank white;
  - panels should use subtle borders and low-glare surfaces;
  - table headers should not look like unrelated black blocks;
  - selected rows should be visible without looking disabled;
  - muted text should be secondary but readable;
  - primary actions should be readable and visibly clickable.
- Rework light-skin button, table, panel, and rail treatment.
- Keep density and football-manager seriousness.
- Avoid pastel softness.

## What NOT to implement

- Do not make the pitch or bench surface light-theme dependent.
- Do not touch `apps/web/src/assets/campo-calcio.svg`.
- Do not soften contrast until labels become weak.
- Do not introduce decorative paper textures unless they are CSS-token owned,
  subtle, and verified in screenshots.

## Required checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
git diff --check
```

## Definition of Done

- Light skins read as intentional football-manager skins.
- Table headers, selected rows, buttons, and panels no longer look patched from
  a dark theme.
- The tactical field remains stable.

